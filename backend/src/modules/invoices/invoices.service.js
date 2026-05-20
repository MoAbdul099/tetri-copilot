const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const repo = require('./invoices.repository');
const { generateInvoicePdf } = require('./pdf/invoice.pdf');
const { sendInvoiceEmail } = require('./invoices.email');
const { logActivity, logAudit } = require('../../lib/activityLogger');
const {
  createInvoiceSchema, updateInvoiceSchema,
  sendInvoiceSchema, voidInvoiceSchema, suggestDescriptionSchema,
} = require('./invoices.validation');
const { VALID_TRANSITIONS, EDITABLE_STATUSES, ALLOWED_MIME_TYPES, MAX_ATTACHMENT_BYTES } = require('./invoices.constants');
const prisma = require('../../lib/prisma');

const UPLOADS_DIR = path.join(__dirname, '../../../uploads/invoices');

const requireRole = (role, minRole) => {
  const ORDER = { viewer: 0, user: 1, admin: 2, owner: 3 };
  if ((ORDER[role] ?? -1) < (ORDER[minRole] ?? 99)) {
    const err = new Error('Insufficient permissions');
    err.statusCode = 403;
    throw err;
  }
};

const requireEditable = (invoice) => {
  if (!EDITABLE_STATUSES.includes(invoice.status)) {
    const err = new Error(`Invoice cannot be edited in status "${invoice.status}"`);
    err.statusCode = 422;
    throw err;
  }
};

const calcItems = (rawItems) =>
  rawItems.map((item, idx) => {
    const qty      = Number(item.quantity);
    const price    = Number(item.unitPrice);
    const discRate = Number(item.discountRate || 0);
    const taxRate  = Number(item.taxRate || 0);

    const lineSubtotal    = qty * price;
    const discountAmount  = lineSubtotal * (discRate / 100);
    const taxableAmount   = lineSubtotal - discountAmount;
    const taxAmount       = taxableAmount * (taxRate / 100);
    const lineTotal       = taxableAmount + taxAmount;

    return {
      description:   item.description,
      quantity:      qty,
      unitPrice:     price,
      discountRate:  discRate,
      discountAmount,
      taxRate,
      taxAmount,
      lineTotal,
      itemOrder:     item.itemOrder ?? idx + 1,
    };
  });

const calcTotals = (items) => {
  const subtotal      = items.reduce((s, i) => s + Number(i.quantity) * Number(i.unitPrice), 0);
  const discountTotal = items.reduce((s, i) => s + Number(i.discountAmount), 0);
  const taxTotal      = items.reduce((s, i) => s + Number(i.taxAmount), 0);
  const totalAmount   = subtotal - discountTotal + taxTotal;
  return { subtotal, discountTotal, taxTotal, totalAmount };
};

const formatInvoice = (inv) => ({
  ...inv,
  subtotal:      Number(inv.subtotal),
  taxTotal:      Number(inv.taxTotal),
  discountTotal: Number(inv.discountTotal),
  totalAmount:   Number(inv.totalAmount),
  paidAmount:    Number(inv.paidAmount),
  items: (inv.items || []).map((i) => ({
    ...i,
    quantity:      Number(i.quantity),
    unitPrice:     Number(i.unitPrice),
    discountRate:  Number(i.discountRate),
    discountAmount: Number(i.discountAmount),
    taxRate:       Number(i.taxRate),
    taxAmount:     Number(i.taxAmount),
    lineTotal:     Number(i.lineTotal),
  })),
});

const getCompany = (workspaceId) =>
  prisma.company.findUnique({ where: { workspaceId } });

// ── CRUD ──────────────────────────────────────────────────

const listInvoices = async (workspaceId, query) => {
  const result = await repo.listInvoices(workspaceId, query);
  return {
    ...result,
    items: result.items.map((inv) => ({
      ...inv,
      subtotal:      Number(inv.subtotal),
      totalAmount:   Number(inv.totalAmount),
      paidAmount:    Number(inv.paidAmount),
      discountTotal: Number(inv.discountTotal),
      taxTotal:      Number(inv.taxTotal),
    })),
  };
};

const getInvoice = async (id, workspaceId) => {
  const inv = await repo.findById(id, workspaceId);
  if (!inv) { const e = new Error('Invoice not found'); e.statusCode = 404; throw e; }
  return formatInvoice(inv);
};

const createInvoice = async (workspaceId, userId, rawPayload) => {
  const { items: rawItems, ...rest } = createInvoiceSchema.parse(rawPayload);

  // Validate customer belongs to workspace
  const customer = await prisma.customer.findFirst({ where: { id: rest.customerId, workspaceId } });
  if (!customer) { const e = new Error('Customer not found'); e.statusCode = 404; throw e; }

  const items   = calcItems(rawItems);
  const totals  = calcTotals(items);
  const data    = {
    ...rest,
    issueDate: new Date(rest.issueDate),
    dueDate:   rest.dueDate ? new Date(rest.dueDate) : null,
    ...totals,
  };

  const inv = await repo.create(workspaceId, userId, data, items);

  await repo.addStatusHistory(inv.id, workspaceId, null, 'draft', userId, null);

  logActivity({ workspaceId, userId, action: 'invoice.created', entityType: 'invoice', entityId: inv.id,
    description: `Invoice ${inv.invoiceNumber} created` });

  return formatInvoice(inv);
};

const updateInvoice = async (id, workspaceId, userId, role, rawPayload) => {
  requireRole(role, 'user');
  const existing = await repo.findByIdSimple(id, workspaceId);
  if (!existing) { const e = new Error('Invoice not found'); e.statusCode = 404; throw e; }
  requireEditable(existing);

  const { items: rawItems, ...rest } = updateInvoiceSchema.parse(rawPayload);

  const items  = rawItems ? calcItems(rawItems) : undefined;
  const totals = items ? calcTotals(items) : {};
  const data   = {
    ...rest,
    ...(rest.issueDate ? { issueDate: new Date(rest.issueDate) } : {}),
    ...(rest.dueDate !== undefined ? { dueDate: rest.dueDate ? new Date(rest.dueDate) : null } : {}),
    ...totals,
  };

  const inv = await repo.update(id, data, items);

  logActivity({ workspaceId, userId, action: 'invoice.updated', entityType: 'invoice', entityId: id,
    description: `Invoice ${inv.invoiceNumber} updated` });

  return formatInvoice(inv);
};

const deleteInvoice = async (id, workspaceId, userId, role) => {
  requireRole(role, 'user');
  const existing = await repo.findByIdSimple(id, workspaceId);
  if (!existing) { const e = new Error('Invoice not found'); e.statusCode = 404; throw e; }
  if (existing.status !== 'draft') {
    const e = new Error('Only draft invoices can be deleted'); e.statusCode = 422; throw e;
  }
  await repo.deleteById(id);
  logActivity({ workspaceId, userId, action: 'invoice.deleted', entityType: 'invoice', entityId: id,
    description: `Invoice ${existing.invoiceNumber} deleted` });
};

// ── Status transitions ─────────────────────────────────────

const transitionStatus = async (id, workspaceId, userId, role, toStatus, extra = {}) => {
  const existing = await repo.findByIdSimple(id, workspaceId);
  if (!existing) { const e = new Error('Invoice not found'); e.statusCode = 404; throw e; }

  const allowed = VALID_TRANSITIONS[existing.status] || [];
  if (!allowed.includes(toStatus)) {
    const e = new Error(`Cannot transition from "${existing.status}" to "${toStatus}"`);
    e.statusCode = 422;
    throw e;
  }

  const now = new Date();
  const fields = { ...extra };
  if (toStatus === 'issued')    fields.issuedAt    = now;
  if (toStatus === 'sent')      fields.sentAt       = now;
  if (toStatus === 'cancelled') fields.cancelledAt  = now;
  if (toStatus === 'void')      fields.voidedAt     = now;

  const inv = await repo.updateStatus(id, toStatus, fields);
  await repo.addStatusHistory(id, workspaceId, existing.status, toStatus, userId, extra.voidReason || null);

  logActivity({ workspaceId, userId, action: `invoice.${toStatus}`, entityType: 'invoice', entityId: id,
    description: `Invoice ${inv.invoiceNumber} ${toStatus}` });
  logAudit({ workspaceId, adminUserId: userId, action: `invoice.${toStatus}`, entityType: 'invoice', entityId: id,
    oldValue: { status: existing.status }, newValue: { status: toStatus } });

  return formatInvoice(await repo.findById(id, workspaceId));
};

const issueInvoice = (id, workspaceId, userId, role) => {
  requireRole(role, 'user');
  return transitionStatus(id, workspaceId, userId, role, 'issued');
};

const cancelInvoice = (id, workspaceId, userId, role) => {
  requireRole(role, 'user');
  return transitionStatus(id, workspaceId, userId, role, 'cancelled');
};

const voidInvoice = async (id, workspaceId, userId, role, rawPayload) => {
  requireRole(role, 'admin');
  const { reason } = voidInvoiceSchema.parse(rawPayload);
  return transitionStatus(id, workspaceId, userId, role, 'void', { voidReason: reason });
};

const duplicateInvoice = async (id, workspaceId, userId) => {
  const source = await repo.findById(id, workspaceId);
  if (!source) { const e = new Error('Invoice not found'); e.statusCode = 404; throw e; }

  const today = new Date().toISOString().slice(0, 10);
  const items = calcItems(source.items.map((i) => ({
    description: i.description,
    quantity:    Number(i.quantity),
    unitPrice:   Number(i.unitPrice),
    discountRate: Number(i.discountRate),
    taxRate:     Number(i.taxRate),
    itemOrder:   i.itemOrder,
  })));
  const totals = calcTotals(items);

  const data = {
    customerId:        source.customerId,
    customerContactId: source.customerContactId,
    issueDate:         today,
    dueDate:           source.dueDate,
    currencyCode:      source.currencyCode,
    referenceNumber:   source.referenceNumber,
    poNumber:          source.poNumber,
    notes:             source.notes,
    terms:             source.terms,
    ...totals,
  };

  const inv = await repo.create(workspaceId, userId, data, items);
  await repo.addStatusHistory(inv.id, workspaceId, null, 'draft', userId, `Duplicated from ${source.invoiceNumber}`);

  logActivity({ workspaceId, userId, action: 'invoice.duplicated', entityType: 'invoice', entityId: inv.id,
    description: `Invoice ${inv.invoiceNumber} duplicated from ${source.invoiceNumber}` });

  return formatInvoice(inv);
};

// ── PDF ────────────────────────────────────────────────────

const getInvoicePdf = async (id, workspaceId) => {
  const [inv, company] = await Promise.all([
    repo.findById(id, workspaceId),
    getCompany(workspaceId),
  ]);
  if (!inv) { const e = new Error('Invoice not found'); e.statusCode = 404; throw e; }

  const buffer = await generateInvoicePdf(formatInvoice(inv), company);
  return { buffer, filename: `${inv.invoiceNumber}.pdf` };
};

// ── Send ───────────────────────────────────────────────────

const sendInvoice = async (id, workspaceId, userId, role, rawPayload) => {
  requireRole(role, 'user');
  const { to, cc, bcc, subject, message } = sendInvoiceSchema.parse(rawPayload);

  const existing = await repo.findByIdSimple(id, workspaceId);
  if (!existing) { const e = new Error('Invoice not found'); e.statusCode = 404; throw e; }

  const allowed = ['issued', 'sent'];
  if (!allowed.includes(existing.status)) {
    const e = new Error('Invoice must be issued before sending'); e.statusCode = 422; throw e;
  }

  const [inv, company] = await Promise.all([
    repo.findById(id, workspaceId),
    getCompany(workspaceId),
  ]);

  const pdfBuffer = await generateInvoicePdf(formatInvoice(inv), company);

  const result = await sendInvoiceEmail({
    to, cc, bcc, subject, message, pdfBuffer,
    invoiceNumber: inv.invoiceNumber,
    company,
  });

  // Log delivery
  await repo.addDeliveryLog({
    invoiceId:     id,
    workspaceId,
    sentById:      userId,
    recipientEmail: to,
    ccEmails:      cc || null,
    bccEmails:     bcc || null,
    subject:       subject || null,
    status:        result.skipped ? 'skipped' : result.success ? 'sent' : 'failed',
    errorMessage:  result.error || null,
    deliveryMethod: 'email',
  });

  // Transition to sent if currently issued (success OR skipped — user intent is clear)
  if (existing.status === 'issued' && (result.success || result.skipped)) {
    await transitionStatus(id, workspaceId, userId, role, 'sent');
  }

  logActivity({ workspaceId, userId, action: 'invoice.sent', entityType: 'invoice', entityId: id,
    description: `Invoice ${inv.invoiceNumber} sent to ${to}` });

  return { success: result.success, skipped: result.skipped, to };
};

// ── Stats ──────────────────────────────────────────────────

const getStats = async (workspaceId) => {
  const raw = await repo.getStats(workspaceId);

  const byStatus = {};
  raw.counts.forEach((r) => {
    byStatus[r.status] = { count: r._count.id, total: Number(r._sum.totalAmount || 0) };
  });

  return {
    byStatus,
    overdueCount: raw.overdueSums._count.id,
    overdueTotal: Number(raw.overdueSums._sum.totalAmount || 0),
    recentInvoices: raw.recentInvoices.map((i) => ({
      id: i.id, invoiceNumber: i.invoiceNumber, status: i.status,
      totalAmount: Number(i.totalAmount), issueDate: i.issueDate,
      customer: i.customer,
    })),
    upcomingDue: raw.upcomingDue.map((i) => ({
      id: i.id, invoiceNumber: i.invoiceNumber, status: i.status,
      totalAmount: Number(i.totalAmount), dueDate: i.dueDate,
      customer: i.customer,
    })),
  };
};

// ── Attachments ────────────────────────────────────────────

const listAttachments = async (id, workspaceId) => {
  const inv = await repo.findByIdSimple(id, workspaceId);
  if (!inv) { const e = new Error('Invoice not found'); e.statusCode = 404; throw e; }
  const atts = await repo.listAttachments(id, workspaceId);
  return atts.map((a) => ({ ...a, fileSize: Number(a.fileSize) }));
};

const uploadAttachment = async (id, workspaceId, userId, role, file) => {
  requireRole(role, 'user');
  const inv = await repo.findByIdSimple(id, workspaceId);
  if (!inv) { const e = new Error('Invoice not found'); e.statusCode = 404; throw e; }
  if (!file) { const e = new Error('No file uploaded'); e.statusCode = 400; throw e; }
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    const e = new Error('File type not allowed'); e.statusCode = 400; throw e;
  }
  if (file.size > MAX_ATTACHMENT_BYTES) {
    const e = new Error('File too large (max 20 MB)'); e.statusCode = 400; throw e;
  }

  const dir = path.join(UPLOADS_DIR, workspaceId);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const ext  = path.extname(file.originalname) || '';
  const uuid = crypto.randomUUID();
  const storedFileName = `${uuid}${ext}`;
  const storagePath    = path.join(dir, storedFileName);

  fs.writeFileSync(storagePath, file.buffer);

  const att = await repo.createAttachment({
    invoiceId:     id,
    workspaceId,
    fileName:      file.originalname,
    storedFileName,
    mimeType:      file.mimetype,
    fileSize:      file.size,
    storagePath,
    uploadedById:  userId,
  });

  logActivity({ workspaceId, userId, action: 'invoice.attachment_uploaded', entityType: 'invoice', entityId: id,
    description: `Attachment "${file.originalname}" uploaded to invoice ${inv.invoiceNumber}` });

  return { ...att, fileSize: Number(att.fileSize) };
};

const deleteAttachment = async (attachmentId, workspaceId, userId, role) => {
  requireRole(role, 'user');
  const att = await repo.findAttachment(attachmentId, workspaceId);
  if (!att) { const e = new Error('Attachment not found'); e.statusCode = 404; throw e; }

  if (fs.existsSync(att.storagePath)) fs.unlinkSync(att.storagePath);
  await repo.deleteAttachment(attachmentId);

  logActivity({ workspaceId, userId, action: 'invoice.attachment_deleted', entityType: 'invoice', entityId: att.invoiceId,
    description: `Attachment "${att.fileName}" deleted` });
};

const downloadAttachment = async (attachmentId, workspaceId) => {
  const att = await repo.findAttachment(attachmentId, workspaceId);
  if (!att) { const e = new Error('Attachment not found'); e.statusCode = 404; throw e; }
  return att;
};

// ── AI description suggestion ──────────────────────────────

const suggestDescription = async (workspaceId, userId, rawPayload) => {
  const { draft } = suggestDescriptionSchema.parse(rawPayload);

  if (!process.env.ANTHROPIC_API_KEY) {
    return { suggestion: draft };
  }

  try {
    const Anthropic = require('@anthropic-ai/sdk');
    const client = new Anthropic.default();
    const msg = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 150,
      messages: [{
        role: 'user',
        content: `Improve this invoice line item description to sound professional and clear. Return only the improved description, nothing else.\n\nOriginal: ${draft}`,
      }],
    });
    const suggestion = msg.content[0]?.text?.trim() || draft;
    return { suggestion };
  } catch {
    return { suggestion: draft };
  }
};

module.exports = {
  listInvoices, getInvoice, createInvoice, updateInvoice, deleteInvoice,
  issueInvoice, cancelInvoice, voidInvoice, duplicateInvoice,
  getInvoicePdf, sendInvoice, getStats,
  listAttachments, uploadAttachment, deleteAttachment, downloadAttachment,
  suggestDescription,
};
