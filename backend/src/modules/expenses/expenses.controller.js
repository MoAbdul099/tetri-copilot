const multer = require('multer');
const path = require('path');
const XLSX = require('xlsx');
const svc = require('./expenses.service');
const { success } = require('../../utils/response');

const UPLOAD_DIR = path.join(__dirname, '../../../../uploads/expenses');

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    cb(null, allowed.includes(file.mimetype));
  },
});

const list    = async (req, res, next) => { try { success(res, await svc.list(req.workspaceId, req.query)); } catch (e) { next(e); } };
const getOne  = async (req, res, next) => { try { success(res, await svc.getOne(req.workspaceId, req.params.id)); } catch (e) { next(e); } };
const create  = async (req, res, next) => { try { success(res, await svc.create(req.workspaceId, req.user.id, req.body), '', 201); } catch (e) { next(e); } };
const update  = async (req, res, next) => { try { success(res, await svc.update(req.workspaceId, req.user.id, req.params.id, req.body)); } catch (e) { next(e); } };
const remove  = async (req, res, next) => { try { await svc.remove(req.workspaceId, req.user.id, req.params.id); success(res, null, 'Expense deleted'); } catch (e) { next(e); } };
const duplicate = async (req, res, next) => { try { success(res, await svc.duplicate(req.workspaceId, req.user.id, req.params.id), '', 201); } catch (e) { next(e); } };
const getStats  = async (req, res, next) => { try { success(res, await svc.getStats(req.workspaceId)); } catch (e) { next(e); } };

const uploadAttachment = [
  upload.single('file'),
  async (req, res, next) => {
    try {
      if (!req.file) return res.status(400).json({ success: false, error: 'No file uploaded or invalid file type' });
      success(res, await svc.addAttachment(req.workspaceId, req.user.id, req.params.id, req.file), '', 201);
    } catch (e) { next(e); }
  },
];

const deleteAttachment = async (req, res, next) => {
  try {
    await svc.removeAttachment(req.workspaceId, req.params.attachmentId);
    success(res, null, 'Attachment deleted');
  } catch (e) { next(e); }
};

const serveAttachment = async (req, res, next) => {
  try {
    const att = await require('./expenses.repository').findAttachment(req.params.attachmentId, req.workspaceId);
    if (!att) return res.status(404).json({ success: false, error: 'Attachment not found' });
    res.download(att.storagePath, att.fileName);
  } catch (e) { next(e); }
};

const exportCsv = async (req, res, next) => {
  try {
    const filters = buildExportFilters(req.query);
    const items = await svc.exportExpenses(req.workspaceId, filters);
    const rows = formatRows(items);
    const csv = [
      Object.keys(rows[0] || {}).join(','),
      ...rows.map(r => Object.values(r).map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')),
    ].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="expenses.csv"');
    res.send(csv);
  } catch (e) { next(e); }
};

const exportXlsx = async (req, res, next) => {
  try {
    const filters = buildExportFilters(req.query);
    const items = await svc.exportExpenses(req.workspaceId, filters);
    const rows = formatRows(items);
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, 'Expenses');
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="expenses.xlsx"');
    res.send(buf);
  } catch (e) { next(e); }
};

function buildExportFilters(query) {
  const f = {};
  if (query.status)      f.status      = query.status;
  if (query.categoryId)  f.categoryId  = query.categoryId;
  if (query.supplierId)  f.supplierId  = query.supplierId;
  if (query.dateFrom || query.dateTo) {
    f.expenseDate = {};
    if (query.dateFrom) f.expenseDate.gte = new Date(query.dateFrom);
    if (query.dateTo)   f.expenseDate.lte = new Date(query.dateTo);
  }
  return f;
}

function formatRows(items) {
  return items.map(e => ({
    'Expense Number':   e.expenseNumber,
    'Date':             e.expenseDate?.toISOString().split('T')[0] ?? '',
    'Posting Date':     e.postingDate?.toISOString().split('T')[0] ?? '',
    'Type':             e.expenseType,
    'Status':           e.status,
    'Category':         e.category?.name ?? '',
    'Supplier':         e.supplier?.name ?? '',
    'Currency':         e.currencyCode,
    'Amount':           Number(e.amount),
    'Tax Rate':         e.taxRate ? Number(e.taxRate) : '',
    'Description':      e.description ?? '',
    'Reference Number': e.referenceNumber ?? '',
    'Department':       e.department ?? '',
    'Created By':       e.createdByUser?.fullName ?? '',
  }));
}

module.exports = { list, getOne, create, update, remove, duplicate, getStats, uploadAttachment, deleteAttachment, serveAttachment, exportCsv, exportXlsx };
