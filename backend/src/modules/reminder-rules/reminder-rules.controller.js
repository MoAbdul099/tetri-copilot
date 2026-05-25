const svc = require('./reminder-rules.service');
const { success } = require('../../utils/response');

const list    = async (req, res, next) => { try { const d = await svc.list(req.workspaceId); success(res, d); } catch (e) { next(e); } };
const stats   = async (req, res, next) => { try { const d = await svc.stats(req.workspaceId); success(res, d); } catch (e) { next(e); } };
const getById = async (req, res, next) => { try { const d = await svc.getById(req.workspaceId, req.params.id); success(res, d); } catch (e) { next(e); } };
const create  = async (req, res, next) => { try { const d = await svc.create(req.workspaceId, req.body); success(res, d, 'Created', 201); } catch (e) { next(e); } };
const update  = async (req, res, next) => { try { const d = await svc.update(req.workspaceId, req.params.id, req.body); success(res, d); } catch (e) { next(e); } };
const remove  = async (req, res, next) => { try { await svc.remove(req.workspaceId, req.params.id); success(res, null, 'Deleted'); } catch (e) { next(e); } };

module.exports = { list, stats, getById, create, update, remove };
