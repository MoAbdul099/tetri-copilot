const service = require('./invoices.service');

const ok = (res, data, status = 200) => res.status(status).json({ success: true, data });

const listInvoices = async (req, res, next) => {
  try {
    const { workspaceId } = req.workspace;
    const { page, limit, search, status, customerId, dateFrom, dateTo, sortBy, sortOrder } = req.query;
    const result = await service.listInvoices(workspaceId, {
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
      search, status, customerId, dateFrom, dateTo, sortBy, sortOrder,
    });
    ok(res, result);
  } catch (e) { next(e); }
};

const getInvoice = async (req, res, next) => {
  try {
    const inv = await service.getInvoice(req.params.id, req.workspace.workspaceId);
    ok(res, inv);
  } catch (e) { next(e); }
};

const createInvoice = async (req, res, next) => {
  try {
    const { workspaceId } = req.workspace;
    const inv = await service.createInvoice(workspaceId, req.auth.userId, req.body);
    ok(res, inv, 201);
  } catch (e) { next(e); }
};

const updateInvoice = async (req, res, next) => {
  try {
    const { workspaceId, role } = req.workspace;
    const inv = await service.updateInvoice(req.params.id, workspaceId, req.auth.userId, role, req.body);
    ok(res, inv);
  } catch (e) { next(e); }
};

const deleteInvoice = async (req, res, next) => {
  try {
    const { workspaceId, role } = req.workspace;
    await service.deleteInvoice(req.params.id, workspaceId, req.auth.userId, role);
    ok(res, { deleted: true });
  } catch (e) { next(e); }
};

const issueInvoice = async (req, res, next) => {
  try {
    const { workspaceId, role } = req.workspace;
    const inv = await service.issueInvoice(req.params.id, workspaceId, req.auth.userId, role);
    ok(res, inv);
  } catch (e) { next(e); }
};

const cancelInvoice = async (req, res, next) => {
  try {
    const { workspaceId, role } = req.workspace;
    const inv = await service.cancelInvoice(req.params.id, workspaceId, req.auth.userId, role);
    ok(res, inv);
  } catch (e) { next(e); }
};

const voidInvoice = async (req, res, next) => {
  try {
    const { workspaceId, role } = req.workspace;
    const inv = await service.voidInvoice(req.params.id, workspaceId, req.auth.userId, role, req.body);
    ok(res, inv);
  } catch (e) { next(e); }
};

const duplicateInvoice = async (req, res, next) => {
  try {
    const { workspaceId } = req.workspace;
    const inv = await service.duplicateInvoice(req.params.id, workspaceId, req.auth.userId);
    ok(res, inv, 201);
  } catch (e) { next(e); }
};

const getInvoicePdf = async (req, res, next) => {
  try {
    const { workspaceId } = req.workspace;
    const { buffer, filename } = await service.getInvoicePdf(req.params.id, workspaceId);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (e) { next(e); }
};

const sendInvoice = async (req, res, next) => {
  try {
    const { workspaceId, role } = req.workspace;
    const result = await service.sendInvoice(req.params.id, workspaceId, req.auth.userId, role, req.body);
    ok(res, result);
  } catch (e) { next(e); }
};

const getStats = async (req, res, next) => {
  try {
    const stats = await service.getStats(req.workspace.workspaceId);
    ok(res, stats);
  } catch (e) { next(e); }
};

const listAttachments = async (req, res, next) => {
  try {
    const { workspaceId } = req.workspace;
    const atts = await service.listAttachments(req.params.id, workspaceId);
    ok(res, atts);
  } catch (e) { next(e); }
};

const uploadAttachment = async (req, res, next) => {
  try {
    const { workspaceId, role } = req.workspace;
    const att = await service.uploadAttachment(req.params.id, workspaceId, req.auth.userId, role, req.file);
    ok(res, att, 201);
  } catch (e) { next(e); }
};

const deleteAttachment = async (req, res, next) => {
  try {
    const { workspaceId, role } = req.workspace;
    await service.deleteAttachment(req.params.attachmentId, workspaceId, req.auth.userId, role);
    ok(res, { deleted: true });
  } catch (e) { next(e); }
};

const downloadAttachment = async (req, res, next) => {
  try {
    const { workspaceId } = req.workspace;
    const att = await service.downloadAttachment(req.params.attachmentId, workspaceId);
    const fs = require('fs');
    if (!fs.existsSync(att.storagePath)) {
      return res.status(404).json({ success: false, message: 'File not found on disk' });
    }
    res.setHeader('Content-Type', att.mimeType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${att.fileName}"`);
    fs.createReadStream(att.storagePath).pipe(res);
  } catch (e) { next(e); }
};

const suggestDescription = async (req, res, next) => {
  try {
    const { workspaceId } = req.workspace;
    const result = await service.suggestDescription(workspaceId, req.auth.userId, req.body);
    ok(res, result);
  } catch (e) { next(e); }
};

module.exports = {
  listInvoices, getInvoice, createInvoice, updateInvoice, deleteInvoice,
  issueInvoice, cancelInvoice, voidInvoice, duplicateInvoice,
  getInvoicePdf, sendInvoice, getStats,
  listAttachments, uploadAttachment, deleteAttachment, downloadAttachment,
  suggestDescription,
};
