const multer = require('multer');
const service = require('./payments.service');
const { success } = require('../../utils/response');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

const list       = async (req, res, next) => { try { success(res, await service.listPayments(req.workspaceId, req.query)); } catch (e) { next(e); } };
const getOne     = async (req, res, next) => { try { success(res, await service.getPayment(req.params.id, req.workspaceId)); } catch (e) { next(e); } };
const record     = async (req, res, next) => { try { success(res, await service.recordPayment(req.workspaceId, req.user.id, req.body), '', 201); } catch (e) { next(e); } };
const update     = async (req, res, next) => { try { success(res, await service.updatePayment(req.params.id, req.workspaceId, req.user.id, req.role, req.body)); } catch (e) { next(e); } };
const post       = async (req, res, next) => { try { success(res, await service.postPayment(req.params.id, req.workspaceId, req.user.id, req.role)); } catch (e) { next(e); } };
const reverse    = async (req, res, next) => { try { success(res, await service.reversePayment(req.params.id, req.workspaceId, req.user.id, req.role, req.body)); } catch (e) { next(e); } };
const voidPay    = async (req, res, next) => { try { success(res, await service.voidPayment(req.params.id, req.workspaceId, req.user.id, req.role)); } catch (e) { next(e); } };
const allocate   = async (req, res, next) => { try { success(res, await service.allocatePayment(req.params.id, req.workspaceId, req.user.id, req.role, req.body)); } catch (e) { next(e); } };
const autoAlloc  = async (req, res, next) => { try { success(res, await service.autoAllocate(req.params.id, req.workspaceId, req.user.id, req.role)); } catch (e) { next(e); } };
const removeAlloc = async (req, res, next) => { try { success(res, await service.removeAllocation(req.params.allocationId, req.workspaceId, req.user.id, req.role)); } catch (e) { next(e); } };
const createCredit = async (req, res, next) => { try { success(res, await service.createCredit(req.params.id, req.workspaceId, req.user.id, req.role, req.body.amount)); } catch (e) { next(e); } };
const getStats   = async (req, res, next) => { try { success(res, await service.getStats(req.workspaceId)); } catch (e) { next(e); } };

const listCredits = async (req, res, next) => {
  try { success(res, await service.listCredits(req.workspaceId, req.query.customerId)); } catch (e) { next(e); }
};
const applyCredit = async (req, res, next) => {
  try { success(res, await service.applyCredit(req.params.id, req.workspaceId, req.user.id, req.role, req.body)); } catch (e) { next(e); }
};

const uploadAttachment = [
  upload.single('file'),
  async (req, res, next) => {
    try { success(res, await service.uploadAttachment(req.params.id, req.workspaceId, req.user.id, req.role, req.file), '', 201); } catch (e) { next(e); }
  },
];

const deleteAttachment = async (req, res, next) => {
  try { await service.deleteAttachment(req.params.attachmentId, req.workspaceId, req.user.id, req.role); res.status(204).end(); } catch (e) { next(e); }
};

module.exports = {
  list, getOne, record, update, post, reverse, voidPay, allocate, autoAlloc, removeAlloc,
  createCredit, listCredits, applyCredit,
  uploadAttachment, deleteAttachment,
  getStats,
};
