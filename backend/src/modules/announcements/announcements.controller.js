const svc = require('./announcements.service');
const { success } = require('../../utils/response');

const list      = async (req, res, next) => { try { const d = await svc.list(req.workspaceId, req.query); success(res, d); } catch (e) { next(e); } };
const getActive = async (req, res, next) => { try { const d = await svc.getActive(req.workspaceId, req.user.id); success(res, d); } catch (e) { next(e); } };
const getStats  = async (req, res, next) => { try { const d = await svc.getStats(req.workspaceId); success(res, d); } catch (e) { next(e); } };
const getById   = async (req, res, next) => { try { const d = await svc.getById(req.workspaceId, req.params.id); success(res, d); } catch (e) { next(e); } };
const create    = async (req, res, next) => { try { const d = await svc.create(req.workspaceId, req.user.id, req.body); success(res, d, 'Created', 201); } catch (e) { next(e); } };
const update    = async (req, res, next) => { try { const d = await svc.update(req.workspaceId, req.params.id, req.body); success(res, d); } catch (e) { next(e); } };
const publish   = async (req, res, next) => { try { const d = await svc.publish(req.workspaceId, req.params.id); success(res, d); } catch (e) { next(e); } };
const archive   = async (req, res, next) => { try { const d = await svc.archive(req.workspaceId, req.params.id); success(res, d); } catch (e) { next(e); } };
const remove    = async (req, res, next) => { try { await svc.remove(req.workspaceId, req.params.id); success(res, null, 'Deleted'); } catch (e) { next(e); } };
const markRead  = async (req, res, next) => { try { await svc.markRead(req.workspaceId, req.user.id, req.params.id); success(res, null, 'Marked as read'); } catch (e) { next(e); } };

module.exports = { list, getActive, getStats, getById, create, update, publish, archive, remove, markRead };
