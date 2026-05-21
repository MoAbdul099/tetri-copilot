const repo = require('./suppliers.repository');
const { success } = require('../../utils/response');

const list    = async (req, res, next) => { try { success(res, await repo.list(req.workspaceId, req.query)); } catch (e) { next(e); } };
const getOne  = async (req, res, next) => {
  try {
    const s = await repo.findById(req.params.id, req.workspaceId);
    if (!s) return res.status(404).json({ success: false, error: 'Supplier not found' });
    const stats = await repo.getStats(req.workspaceId, s.id);
    success(res, { ...s, stats });
  } catch (e) { next(e); }
};
const create  = async (req, res, next) => { try { success(res, await repo.create(req.workspaceId, req.user.id, req.body), '', 201); } catch (e) { next(e); } };
const update  = async (req, res, next) => { try { success(res, await repo.update(req.params.id, req.body)); } catch (e) { next(e); } };
const archive = async (req, res, next) => { try { success(res, await repo.archive(req.params.id)); } catch (e) { next(e); } };
const restore = async (req, res, next) => { try { success(res, await repo.restore(req.params.id)); } catch (e) { next(e); } };

module.exports = { list, getOne, create, update, archive, restore };
