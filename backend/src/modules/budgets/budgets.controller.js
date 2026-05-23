const svc = require('./budgets.service');
const { success } = require('../../utils/response');

const list    = async (req, res, next) => { try { success(res, await svc.list(req.workspaceId));                                      } catch (e) { next(e); } };
const monitor = async (req, res, next) => { try { success(res, await svc.monitor(req.workspaceId));                                   } catch (e) { next(e); } };
const getOne  = async (req, res, next) => { try { success(res, await svc.getOne(req.workspaceId, req.params.id));                     } catch (e) { next(e); } };
const create  = async (req, res, next) => { try { success(res, await svc.create(req.workspaceId, req.user.id, req.body), '', 201);    } catch (e) { next(e); } };
const update  = async (req, res, next) => { try { success(res, await svc.update(req.workspaceId, req.params.id, req.body));           } catch (e) { next(e); } };
const remove  = async (req, res, next) => { try { success(res, await svc.remove(req.workspaceId, req.params.id));                    } catch (e) { next(e); } };

module.exports = { list, monitor, getOne, create, update, remove };
