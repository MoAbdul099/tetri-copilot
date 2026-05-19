const service = require('./customers.service');

const list = async (req, res, next) => {
  try {
    const { page, limit, search, status, customerType, country, tags, sortBy, sortOrder } = req.query;
    const tagIds = tags ? tags.split(',').filter(Boolean) : undefined;
    const result = await service.listCustomers(req.workspaceId, {
      page: page ? parseInt(page) : 1,
      limit: limit ? Math.min(parseInt(limit), 100) : 20,
      search,
      status,
      customerType,
      country,
      tagIds,
      sortBy,
      sortOrder,
    });
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    const customer = await service.getCustomer(req.params.id, req.workspaceId);
    res.json({ success: true, data: { customer } });
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const customer = await service.createCustomer(req.workspaceId, req.user.id, req.body);
    res.status(201).json({ success: true, data: { customer } });
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const customer = await service.updateCustomer(req.params.id, req.workspaceId, req.user.id, req.role, req.body);
    res.json({ success: true, data: { customer } });
  } catch (err) { next(err); }
};

const archive = async (req, res, next) => {
  try {
    const customer = await service.archiveCustomer(req.params.id, req.workspaceId, req.user.id, req.role);
    res.json({ success: true, data: { customer } });
  } catch (err) { next(err); }
};

const restore = async (req, res, next) => {
  try {
    const customer = await service.restoreCustomer(req.params.id, req.workspaceId, req.user.id, req.role);
    res.json({ success: true, data: { customer } });
  } catch (err) { next(err); }
};

// Contacts
const listContacts = async (req, res, next) => {
  try {
    const contacts = await service.listContacts(req.params.id, req.workspaceId);
    res.json({ success: true, data: { contacts } });
  } catch (err) { next(err); }
};

const createContact = async (req, res, next) => {
  try {
    const contact = await service.createContact(req.params.id, req.workspaceId, req.user.id, req.role, req.body);
    res.status(201).json({ success: true, data: { contact } });
  } catch (err) { next(err); }
};

const updateContact = async (req, res, next) => {
  try {
    const contact = await service.updateContact(req.params.contactId, req.params.id, req.workspaceId, req.user.id, req.role, req.body);
    res.json({ success: true, data: { contact } });
  } catch (err) { next(err); }
};

const setPrimaryContact = async (req, res, next) => {
  try {
    const contact = await service.setPrimaryContact(req.params.contactId, req.params.id, req.workspaceId, req.user.id, req.role);
    res.json({ success: true, data: { contact } });
  } catch (err) { next(err); }
};

const deactivateContact = async (req, res, next) => {
  try {
    const contact = await service.deactivateContact(req.params.contactId, req.params.id, req.workspaceId, req.user.id, req.role);
    res.json({ success: true, data: { contact } });
  } catch (err) { next(err); }
};

const reactivateContact = async (req, res, next) => {
  try {
    const contact = await service.reactivateContact(req.params.contactId, req.params.id, req.workspaceId, req.user.id, req.role);
    res.json({ success: true, data: { contact } });
  } catch (err) { next(err); }
};

const deleteContact = async (req, res, next) => {
  try {
    await service.deleteContact(req.params.contactId, req.params.id, req.workspaceId, req.user.id, req.role);
    res.json({ success: true, message: 'Contact deleted' });
  } catch (err) { next(err); }
};

// Notes
const listNotes = async (req, res, next) => {
  try {
    const notes = await service.listNotes(req.params.id, req.workspaceId);
    res.json({ success: true, data: { notes } });
  } catch (err) { next(err); }
};

const createNote = async (req, res, next) => {
  try {
    const note = await service.createNote(req.params.id, req.workspaceId, req.user.id, req.role, req.body);
    res.status(201).json({ success: true, data: { note } });
  } catch (err) { next(err); }
};

const updateNote = async (req, res, next) => {
  try {
    const note = await service.updateNote(req.params.noteId, req.workspaceId, req.user.id, req.role, req.body);
    res.json({ success: true, data: { note } });
  } catch (err) { next(err); }
};

const deleteNote = async (req, res, next) => {
  try {
    await service.deleteNote(req.params.noteId, req.workspaceId, req.user.id, req.role);
    res.json({ success: true, message: 'Note deleted' });
  } catch (err) { next(err); }
};

// Attachments
const listAttachments = async (req, res, next) => {
  try {
    const attachments = await service.listAttachments(req.params.id, req.workspaceId);
    res.json({ success: true, data: { attachments: attachments.map(a => ({ ...a, fileSize: Number(a.fileSize) })) } });
  } catch (err) { next(err); }
};

const uploadAttachment = async (req, res, next) => {
  try {
    const attachment = await service.uploadAttachment(req.params.id, req.workspaceId, req.user.id, req.role, req.file);
    res.status(201).json({ success: true, data: { attachment } });
  } catch (err) { next(err); }
};

const downloadAttachment = async (req, res, next) => {
  try {
    const att = await service.getAttachmentForDownload(req.params.attachmentId, req.workspaceId);
    res.download(att.storagePath, att.fileName);
  } catch (err) { next(err); }
};

const updateAttachment = async (req, res, next) => {
  try {
    const att = await service.updateAttachmentMeta(req.params.attachmentId, req.workspaceId, req.user.id, req.role, req.body);
    res.json({ success: true, data: { attachment: { ...att, fileSize: Number(att.fileSize) } } });
  } catch (err) { next(err); }
};

const deleteAttachment = async (req, res, next) => {
  try {
    await service.deleteAttachment(req.params.attachmentId, req.workspaceId, req.user.id, req.role);
    res.json({ success: true, message: 'Attachment deleted' });
  } catch (err) { next(err); }
};

// Tags
const listTags = async (req, res, next) => {
  try {
    const tags = await service.listTags(req.workspaceId);
    res.json({ success: true, data: { tags } });
  } catch (err) { next(err); }
};

const createTag = async (req, res, next) => {
  try {
    const tag = await service.createTag(req.workspaceId, req.user.id, req.role, req.body);
    res.status(201).json({ success: true, data: { tag } });
  } catch (err) { next(err); }
};

const updateTag = async (req, res, next) => {
  try {
    const tag = await service.updateTagEntry(req.params.tagId, req.workspaceId, req.user.id, req.role, req.body);
    res.json({ success: true, data: { tag } });
  } catch (err) { next(err); }
};

const deleteTag = async (req, res, next) => {
  try {
    await service.deleteTagEntry(req.params.tagId, req.workspaceId, req.user.id, req.role);
    res.json({ success: true, message: 'Tag deleted' });
  } catch (err) { next(err); }
};

const assignTag = async (req, res, next) => {
  try {
    const tag = await service.assignTag(req.params.id, req.workspaceId, req.user.id, req.role, req.body);
    res.status(201).json({ success: true, data: { tag } });
  } catch (err) { next(err); }
};

const removeTag = async (req, res, next) => {
  try {
    await service.removeTagFromCustomer(req.params.id, req.params.tagId, req.workspaceId, req.user.id, req.role);
    res.json({ success: true, message: 'Tag removed' });
  } catch (err) { next(err); }
};

// Import / Export
const importCustomers = async (req, res, next) => {
  try {
    const results = await service.importCustomers(req.workspaceId, req.user.id, req.role, req.file);
    res.json({ success: true, data: { results } });
  } catch (err) { next(err); }
};

const exportCustomers = async (req, res, next) => {
  try {
    const format = req.query.format === 'xlsx' ? 'xlsx' : 'csv';
    const { buffer, contentType, filename } = await service.exportCustomers(req.workspaceId, req.user.id, req.role, format);
    res.set('Content-Type', contentType);
    res.set('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (err) { next(err); }
};

module.exports = {
  list, getById, create, update, archive, restore,
  listContacts, createContact, updateContact, setPrimaryContact, deactivateContact, reactivateContact, deleteContact,
  listNotes, createNote, updateNote, deleteNote,
  listAttachments, uploadAttachment, downloadAttachment, updateAttachment, deleteAttachment,
  listTags, createTag, updateTag, deleteTag, assignTag, removeTag,
  importCustomers, exportCustomers,
};
