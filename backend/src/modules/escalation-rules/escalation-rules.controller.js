const svc = require('./escalation-rules.service');
const { success } = require('../../utils/response');

const list           = async (req, res, next) => { try { const d = await svc.list(req.workspaceId); res.json(success(d)); } catch (e) { next(e); } };
const stats          = async (req, res, next) => { try { const d = await svc.stats(req.workspaceId); res.json(success(d)); } catch (e) { next(e); } };
const listInstances  = async (req, res, next) => { try { const d = await svc.listInstances(req.workspaceId, req.query); res.json(success(d)); } catch (e) { next(e); } };
const getById        = async (req, res, next) => { try { const d = await svc.getById(req.workspaceId, req.params.id); res.json(success(d)); } catch (e) { next(e); } };
const create         = async (req, res, next) => { try { const d = await svc.create(req.workspaceId, req.body); res.json(success(d, 'Created', 201)); } catch (e) { next(e); } };
const update         = async (req, res, next) => { try { const d = await svc.update(req.workspaceId, req.params.id, req.body); res.json(success(d)); } catch (e) { next(e); } };
const remove         = async (req, res, next) => { try { await svc.remove(req.workspaceId, req.params.id); res.json(success(null, 'Deleted')); } catch (e) { next(e); } };
const resolveInstance= async (req, res, next) => { try { const d = await svc.resolveInstance(req.workspaceId, req.params.id); res.json(success(d)); } catch (e) { next(e); } };

module.exports = { list, stats, listInstances, getById, create, update, remove, resolveInstance };
