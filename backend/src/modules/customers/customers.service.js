const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const XLSX = require('xlsx');
const repo = require('./customers.repository');
const { logActivity, logAudit } = require('../../lib/activityLogger');
const {
  createCustomerSchema,
  updateCustomerSchema,
  createContactSchema,
  updateContactSchema,
  createNoteSchema,
  updateNoteSchema,
  createTagSchema,
  updateTagSchema,
  updateAttachmentSchema,
  assignTagSchema,
} = require('./customers.validation');
const { ALLOWED_MIME_TYPES, MAX_ATTACHMENT_BYTES } = require('./customers.constants');

const UPLOADS_DIR = path.join(__dirname, '../../../uploads/customers');

const requireRole = (role, minRole) => {
  const ORDER = { viewer: 0, user: 1, admin: 2, owner: 3 };
  if ((ORDER[role] ?? -1) < (ORDER[minRole] ?? 99)) {
    const err = new Error('Insufficient permissions');
    err.statusCode = 403;
    throw err;
  }
};

const formatCustomer = (c) => ({
  id: c.id,
  customerCode: c.customerCode,
  name: c.name,
  customerType: c.customerType,
  status: c.status,
  defaultCurrency: c.defaultCurrency,
  openingBalance: c.openingBalance ? Number(c.openingBalance) : null,
  creditLimit: c.creditLimit ? Number(c.creditLimit) : null,
  paymentTerms: c.paymentTerms,
  country: c.country,
  stateRegion: c.stateRegion,
  city: c.city,
  postalCode: c.postalCode,
  addressLine1: c.addressLine1,
  addressLine2: c.addressLine2,
  taxNumber: c.taxNumber,
  vatNumber: c.vatNumber,
  commercialRegistrationNumber: c.commercialRegistrationNumber,
  businessLicenseNumber: c.businessLicenseNumber,
  email: c.email,
  phone: c.phone,
  notes: c.notes,
  archivedAt: c.archivedAt,
  createdAt: c.createdAt,
  updatedAt: c.updatedAt,
  primaryContact: c.contacts?.find((x) => x.isPrimary && x.isActive) ?? c.contacts?.find((x) => x.isPrimary) ?? null,
  contacts: c.contacts ?? [],
  noteEntries: c.noteEntries ?? [],
  attachments: c.attachments ?? [],
  tags: c.tagAssignments?.map((ta) => ta.tag) ?? [],
  createdByUser: c.createdByUser ?? null,
});

// ── Customer CRUD ──────────────────────────────────────────

const listCustomers = async (workspaceId, query) => {
  const result = await repo.listCustomers(workspaceId, query);
  return {
    ...result,
    items: result.items.map(formatCustomer),
  };
};

const getCustomer = async (id, workspaceId) => {
  const c = await repo.findById(id, workspaceId);
  if (!c) {
    const err = new Error('Customer not found');
    err.statusCode = 404;
    throw err;
  }
  return formatCustomer(c);
};

const createCustomer = async (workspaceId, userId, rawPayload) => {
  const { tagIds = [], primaryContact, ...rest } = createCustomerSchema.parse(rawPayload);

  // Clean empty strings to null for optional fields
  const data = Object.fromEntries(
    Object.entries(rest).map(([k, v]) => [k, v === '' ? null : v])
  );

  const customer = await repo.create(workspaceId, data, userId);

  if (primaryContact) {
    await repo.createContact(customer.id, workspaceId, { ...primaryContact, isPrimary: true }, userId);
  }

  if (tagIds.length) {
    await repo.assignTagsBulk(customer.id, workspaceId, tagIds, userId);
  }

  logActivity({
    workspaceId,
    userId,
    action: 'customer.created',
    entityType: 'customer',
    entityId: customer.id,
    description: `Customer "${customer.name}" created (${customer.customerCode})`,
  });

  return formatCustomer(await repo.findById(customer.id, workspaceId));
};

const updateCustomer = async (id, workspaceId, userId, role, rawPayload) => {
  requireRole(role, 'user');
  const existing = await repo.findByIdSimple(id, workspaceId);
  if (!existing) {
    const err = new Error('Customer not found');
    err.statusCode = 404;
    throw err;
  }

  const { tagIds, primaryContact, ...rest } = updateCustomerSchema.parse(rawPayload);
  const data = Object.fromEntries(
    Object.entries(rest).map(([k, v]) => [k, v === '' ? null : v])
  );

  const updated = await repo.update(id, workspaceId, data, userId);

  if (tagIds !== undefined) {
    await repo.removeTag(id, undefined);
    if (tagIds.length) await repo.assignTagsBulk(id, workspaceId, tagIds, userId);
  }

  logActivity({
    workspaceId, userId,
    action: 'customer.updated',
    entityType: 'customer',
    entityId: id,
    description: `Customer "${updated.name}" updated`,
  });

  if (rest.status && rest.status !== existing.status) {
    logAudit({
      workspaceId, adminUserId: userId,
      action: 'customer.status_changed',
      entityType: 'customer', entityId: id,
      oldValue: { status: existing.status },
      newValue: { status: rest.status },
    });
  }

  if (rest.creditLimit !== undefined && String(rest.creditLimit) !== String(existing.creditLimit)) {
    logAudit({
      workspaceId, adminUserId: userId,
      action: 'customer.credit_limit_changed',
      entityType: 'customer', entityId: id,
      oldValue: { creditLimit: existing.creditLimit },
      newValue: { creditLimit: rest.creditLimit },
    });
  }

  return formatCustomer(await repo.findById(id, workspaceId));
};

const archiveCustomer = async (id, workspaceId, userId, role) => {
  requireRole(role, 'admin');
  const existing = await repo.findByIdSimple(id, workspaceId);
  if (!existing) { const err = new Error('Customer not found'); err.statusCode = 404; throw err; }
  if (existing.status === 'archived') { const err = new Error('Customer is already archived'); err.statusCode = 400; throw err; }

  const updated = await repo.archive(id, workspaceId, userId);

  logActivity({ workspaceId, userId, action: 'customer.archived', entityType: 'customer', entityId: id, description: `Customer "${updated.name}" archived` });
  logAudit({ workspaceId, adminUserId: userId, action: 'customer.archived', entityType: 'customer', entityId: id, oldValue: { status: existing.status }, newValue: { status: 'archived' } });

  return formatCustomer(updated);
};

const restoreCustomer = async (id, workspaceId, userId, role) => {
  requireRole(role, 'admin');
  const existing = await repo.findByIdSimple(id, workspaceId);
  if (!existing) { const err = new Error('Customer not found'); err.statusCode = 404; throw err; }
  if (existing.status !== 'archived') { const err = new Error('Customer is not archived'); err.statusCode = 400; throw err; }

  const updated = await repo.restore(id, workspaceId, userId);

  logActivity({ workspaceId, userId, action: 'customer.restored', entityType: 'customer', entityId: id, description: `Customer "${updated.name}" restored` });
  logAudit({ workspaceId, adminUserId: userId, action: 'customer.restored', entityType: 'customer', entityId: id, oldValue: { status: 'archived' }, newValue: { status: 'active' } });

  return formatCustomer(updated);
};

// ── Contacts ───────────────────────────────────────────────

const listContacts = async (customerId, workspaceId) => {
  await _requireCustomer(customerId, workspaceId);
  return repo.listContacts(customerId, workspaceId);
};

const createContact = async (customerId, workspaceId, userId, role, rawPayload) => {
  requireRole(role, 'user');
  await _requireCustomer(customerId, workspaceId);
  const data = createContactSchema.parse(rawPayload);

  if (data.isPrimary) {
    await repo.setPrimaryContact('__none__', customerId, workspaceId).catch(() => {});
  }

  const contact = await repo.createContact(customerId, workspaceId, data, userId);

  logActivity({ workspaceId, userId, action: 'customer.contact_created', entityType: 'customer', entityId: customerId, description: `Contact ${data.firstName} ${data.lastName} added` });

  return contact;
};

const updateContact = async (contactId, customerId, workspaceId, userId, role, rawPayload) => {
  requireRole(role, 'user');
  const contact = await repo.findContact(contactId, workspaceId);
  if (!contact || contact.customerId !== customerId) { const err = new Error('Contact not found'); err.statusCode = 404; throw err; }
  const data = updateContactSchema.parse(rawPayload);
  const updated = await repo.updateContact(contactId, data, userId);
  logActivity({ workspaceId, userId, action: 'customer.contact_updated', entityType: 'customer', entityId: customerId, description: `Contact updated` });
  return updated;
};

const setPrimaryContact = async (contactId, customerId, workspaceId, userId, role) => {
  requireRole(role, 'user');
  const contact = await repo.findContact(contactId, workspaceId);
  if (!contact || contact.customerId !== customerId) { const err = new Error('Contact not found'); err.statusCode = 404; throw err; }

  const updated = await repo.setPrimaryContact(contactId, customerId, workspaceId);

  logActivity({ workspaceId, userId, action: 'customer.primary_contact_changed', entityType: 'customer', entityId: customerId, description: `Primary contact set to ${contact.firstName} ${contact.lastName}` });
  logAudit({ workspaceId, adminUserId: userId, action: 'customer.primary_contact_changed', entityType: 'customer', entityId: customerId, newValue: { contactId } });

  return updated;
};

const deactivateContact = async (contactId, customerId, workspaceId, userId, role) => {
  requireRole(role, 'user');
  const contact = await repo.findContact(contactId, workspaceId);
  if (!contact || contact.customerId !== customerId) { const err = new Error('Contact not found'); err.statusCode = 404; throw err; }
  const updated = await repo.deactivateContact(contactId);
  logActivity({ workspaceId, userId, action: 'customer.contact_deactivated', entityType: 'customer', entityId: customerId, description: `Contact ${contact.firstName} ${contact.lastName} deactivated` });
  return updated;
};

const reactivateContact = async (contactId, customerId, workspaceId, userId, role) => {
  requireRole(role, 'user');
  const contact = await repo.findContact(contactId, workspaceId);
  if (!contact || contact.customerId !== customerId) { const err = new Error('Contact not found'); err.statusCode = 404; throw err; }
  const updated = await repo.reactivateContact(contactId);
  logActivity({ workspaceId, userId, action: 'customer.contact_reactivated', entityType: 'customer', entityId: customerId, description: `Contact ${contact.firstName} ${contact.lastName} reactivated` });
  return updated;
};

const deleteContact = async (contactId, customerId, workspaceId, userId, role) => {
  requireRole(role, 'admin');
  const contact = await repo.findContact(contactId, workspaceId);
  if (!contact || contact.customerId !== customerId) { const err = new Error('Contact not found'); err.statusCode = 404; throw err; }
  await repo.deleteContact(contactId);
  logActivity({ workspaceId, userId, action: 'customer.contact_deleted', entityType: 'customer', entityId: customerId, description: `Contact ${contact.firstName} ${contact.lastName} deleted` });
  logAudit({ workspaceId, adminUserId: userId, action: 'customer.contact_deleted', entityType: 'customer', entityId: customerId, oldValue: { contactId, name: `${contact.firstName} ${contact.lastName}` } });
};

// ── Notes ──────────────────────────────────────────────────

const listNotes = async (customerId, workspaceId) => {
  await _requireCustomer(customerId, workspaceId);
  return repo.listNotes(customerId, workspaceId);
};

const createNote = async (customerId, workspaceId, userId, role, rawPayload) => {
  requireRole(role, 'user');
  await _requireCustomer(customerId, workspaceId);
  const { noteText } = createNoteSchema.parse(rawPayload);
  const note = await repo.createNote(customerId, workspaceId, noteText, userId);
  logActivity({ workspaceId, userId, action: 'customer.note_added', entityType: 'customer', entityId: customerId, description: 'Note added' });
  return note;
};

const updateNote = async (noteId, workspaceId, userId, role, rawPayload) => {
  requireRole(role, 'user');
  const note = await repo.findNote(noteId, workspaceId);
  if (!note) { const err = new Error('Note not found'); err.statusCode = 404; throw err; }
  const { noteText } = updateNoteSchema.parse(rawPayload);
  return repo.updateNote(noteId, noteText, userId);
};

const deleteNote = async (noteId, workspaceId, userId, role) => {
  requireRole(role, 'user');
  const note = await repo.findNote(noteId, workspaceId);
  if (!note) { const err = new Error('Note not found'); err.statusCode = 404; throw err; }
  await repo.deleteNote(noteId);
  logActivity({ workspaceId, userId, action: 'customer.note_deleted', entityType: 'customer', entityId: note.customerId, description: 'Note deleted' });
};

// ── Attachments ────────────────────────────────────────────

const listAttachments = async (customerId, workspaceId) => {
  await _requireCustomer(customerId, workspaceId);
  return repo.listAttachments(customerId, workspaceId);
};

const uploadAttachment = async (customerId, workspaceId, userId, role, file) => {
  requireRole(role, 'user');
  await _requireCustomer(customerId, workspaceId);

  if (!file) { const err = new Error('No file uploaded'); err.statusCode = 400; throw err; }
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) { const err = new Error('File type not allowed'); err.statusCode = 400; throw err; }
  if (file.size > MAX_ATTACHMENT_BYTES) { const err = new Error('File exceeds 20 MB limit'); err.statusCode = 400; throw err; }

  const ext = path.extname(file.originalname).toLowerCase();
  const storedFileName = `${crypto.randomUUID()}${ext}`;
  const dir = path.join(UPLOADS_DIR, workspaceId);
  fs.mkdirSync(dir, { recursive: true });
  const storagePath = path.join(dir, storedFileName);
  fs.writeFileSync(storagePath, file.buffer);

  const attachment = await repo.createAttachment({
    workspaceId,
    customerId,
    fileName: file.originalname,
    storedFileName,
    mimeType: file.mimetype,
    fileSize: file.size,
    storagePath,
    uploadedByUserId: userId,
  });

  logActivity({ workspaceId, userId, action: 'customer.attachment_uploaded', entityType: 'customer', entityId: customerId, description: `Attachment "${file.originalname}" uploaded` });

  return { ...attachment, fileSize: Number(attachment.fileSize) };
};

const getAttachmentForDownload = async (attachmentId, workspaceId) => {
  const att = await repo.findAttachment(attachmentId, workspaceId);
  if (!att) { const err = new Error('Attachment not found'); err.statusCode = 404; throw err; }
  if (!fs.existsSync(att.storagePath)) { const err = new Error('File not found on server'); err.statusCode = 404; throw err; }
  return att;
};

const updateAttachmentMeta = async (attachmentId, workspaceId, userId, role, rawPayload) => {
  requireRole(role, 'user');
  const att = await repo.findAttachment(attachmentId, workspaceId);
  if (!att) { const err = new Error('Attachment not found'); err.statusCode = 404; throw err; }
  const data = updateAttachmentSchema.parse(rawPayload);
  return repo.updateAttachment(attachmentId, data);
};

const deleteAttachment = async (attachmentId, workspaceId, userId, role) => {
  requireRole(role, 'admin');
  const att = await repo.findAttachment(attachmentId, workspaceId);
  if (!att) { const err = new Error('Attachment not found'); err.statusCode = 404; throw err; }
  try { fs.unlinkSync(att.storagePath); } catch (_) {}
  await repo.deleteAttachment(attachmentId);
  logActivity({ workspaceId, userId, action: 'customer.attachment_deleted', entityType: 'customer', entityId: att.customerId, description: `Attachment "${att.fileName}" deleted` });
  logAudit({ workspaceId, adminUserId: userId, action: 'customer.attachment_deleted', entityType: 'customer', entityId: att.customerId, oldValue: { fileName: att.fileName } });
};

// ── Tags ───────────────────────────────────────────────────

const listTags = (workspaceId) => repo.listTags(workspaceId);

const createTag = async (workspaceId, userId, role, rawPayload) => {
  requireRole(role, 'user');
  const { name, color } = createTagSchema.parse(rawPayload);
  const exists = await repo.findTagByName(workspaceId, name);
  if (exists) { const err = new Error('Tag with this name already exists'); err.statusCode = 409; throw err; }
  return repo.createTag(workspaceId, name, color, userId);
};

const updateTagEntry = async (tagId, workspaceId, userId, role, rawPayload) => {
  requireRole(role, 'user');
  const tag = await repo.findTag(tagId, workspaceId);
  if (!tag) { const err = new Error('Tag not found'); err.statusCode = 404; throw err; }
  const data = updateTagSchema.parse(rawPayload);
  return repo.updateTag(tagId, data);
};

const deleteTagEntry = async (tagId, workspaceId, userId, role) => {
  requireRole(role, 'user');
  const tag = await repo.findTag(tagId, workspaceId);
  if (!tag) { const err = new Error('Tag not found'); err.statusCode = 404; throw err; }
  await repo.deleteTag(tagId);
};

const assignTag = async (customerId, workspaceId, userId, role, rawPayload) => {
  requireRole(role, 'user');
  await _requireCustomer(customerId, workspaceId);
  const { tagId } = assignTagSchema.parse(rawPayload);
  const tag = await repo.findTag(tagId, workspaceId);
  if (!tag) { const err = new Error('Tag not found'); err.statusCode = 404; throw err; }
  try {
    await repo.assignTag(customerId, workspaceId, tagId, userId);
  } catch (e) {
    if (e.code === 'P2002') { const err = new Error('Tag already assigned'); err.statusCode = 409; throw err; }
    throw e;
  }
  logActivity({ workspaceId, userId, action: 'customer.tags_updated', entityType: 'customer', entityId: customerId, description: `Tag "${tag.name}" assigned` });
  return tag;
};

const removeTagFromCustomer = async (customerId, tagId, workspaceId, userId, role) => {
  requireRole(role, 'user');
  await _requireCustomer(customerId, workspaceId);
  await repo.removeTag(customerId, tagId);
  logActivity({ workspaceId, userId, action: 'customer.tags_updated', entityType: 'customer', entityId: customerId, description: `Tag removed` });
};

// ── Import / Export ────────────────────────────────────────

const importCustomers = async (workspaceId, userId, role, file) => {
  requireRole(role, 'user');
  if (!file) { const err = new Error('No file uploaded'); err.statusCode = 400; throw err; }

  const workbook = XLSX.read(file.buffer, { type: 'buffer' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

  const results = { total: rows.length, created: 0, failed: 0, errors: [] };

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2;
    try {
      const payload = {
        name: String(row['Customer Name'] || '').trim(),
        customerType: String(row['Customer Type'] || 'company').toLowerCase().trim(),
        status: String(row['Status'] || 'active').toLowerCase().trim(),
        defaultCurrency: String(row['Currency'] || '').trim() || null,
        country: String(row['Country'] || '').trim() || null,
        city: String(row['City'] || '').trim() || null,
        addressLine1: String(row['Address'] || '').trim() || null,
        taxNumber: String(row['Tax Number'] || '').trim() || null,
        openingBalance: row['Opening Balance'] ? Number(row['Opening Balance']) : null,
        creditLimit: row['Credit Limit'] ? Number(row['Credit Limit']) : null,
        paymentTerms: String(row['Payment Terms'] || '').trim() || null,
        email: String(row['Email'] || '').trim() || null,
        phone: String(row['Phone'] || '').trim() || null,
      };

      const primaryContactFirst = String(row['Contact First Name'] || '').trim();
      const primaryContactLast = String(row['Contact Last Name'] || '').trim();
      if (primaryContactFirst && primaryContactLast) {
        payload.primaryContact = {
          firstName: primaryContactFirst,
          lastName: primaryContactLast,
          email: String(row['Contact Email'] || '').trim() || null,
          phone: String(row['Contact Phone'] || '').trim() || null,
        };
      }

      await createCustomer(workspaceId, userId, payload);
      results.created++;
    } catch (e) {
      results.failed++;
      results.errors.push({ row: rowNum, error: e.message });
    }
  }

  logActivity({ workspaceId, userId, action: 'customer.import_completed', entityType: 'customer', description: `Import: ${results.created} created, ${results.failed} failed` });

  return results;
};

const exportCustomers = async (workspaceId, userId, role, format = 'csv') => {
  requireRole(role, 'viewer');
  const customers = await repo.listAll(workspaceId);

  const rows = customers.map((c) => {
    const primary = c.contacts?.[0];
    const tags = c.tagAssignments?.map((ta) => ta.tag.name).join(', ') || '';
    return {
      'Customer Code': c.customerCode || '',
      'Customer Name': c.name,
      'Customer Type': c.customerType,
      'Status': c.status,
      'Currency': c.defaultCurrency || '',
      'Country': c.country || '',
      'City': c.city || '',
      'Address': c.addressLine1 || '',
      'Tax Number': c.taxNumber || '',
      'Opening Balance': c.openingBalance ?? '',
      'Credit Limit': c.creditLimit ?? '',
      'Payment Terms': c.paymentTerms || '',
      'Email': c.email || '',
      'Phone': c.phone || '',
      'Primary Contact': primary ? `${primary.firstName} ${primary.lastName}` : '',
      'Contact Email': primary?.email || '',
      'Contact Phone': primary?.phone || '',
      'Tags': tags,
      'Created': c.createdAt?.toISOString()?.substring(0, 10) || '',
    };
  });

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Customers');

  logActivity({ workspaceId, userId, action: 'customer.export_completed', entityType: 'customer', description: `Exported ${customers.length} customers as ${format}` });

  if (format === 'xlsx') {
    return { buffer: XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }), contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename: 'customers.xlsx' };
  }
  return { buffer: Buffer.from(XLSX.utils.sheet_to_csv(ws)), contentType: 'text/csv', filename: 'customers.csv' };
};

// ── Helpers ────────────────────────────────────────────────

const _requireCustomer = async (customerId, workspaceId) => {
  const c = await repo.findByIdSimple(customerId, workspaceId);
  if (!c) { const err = new Error('Customer not found'); err.statusCode = 404; throw err; }
  return c;
};

module.exports = {
  listCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  archiveCustomer,
  restoreCustomer,
  listContacts,
  createContact,
  updateContact,
  setPrimaryContact,
  deactivateContact,
  reactivateContact,
  deleteContact,
  listNotes,
  createNote,
  updateNote,
  deleteNote,
  listAttachments,
  uploadAttachment,
  getAttachmentForDownload,
  updateAttachmentMeta,
  deleteAttachment,
  listTags,
  createTag,
  updateTagEntry,
  deleteTagEntry,
  assignTag,
  removeTagFromCustomer,
  importCustomers,
  exportCustomers,
};
