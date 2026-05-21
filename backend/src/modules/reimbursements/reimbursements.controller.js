const svc = require('./reimbursements.service');
const { success } = require('../../utils/response');

const list          = async (req, res, next) => { try { success(res, await svc.list(req.workspaceId, req.query)); } catch (e) { next(e); } };
const getOne        = async (req, res, next) => { try { success(res, await svc.getOne(req.workspaceId, req.params.id)); } catch (e) { next(e); } };
const getDashboard  = async (req, res, next) => { try { success(res, await svc.getDashboard(req.workspaceId)); } catch (e) { next(e); } };
const create        = async (req, res, next) => { try { success(res, await svc.create(req.workspaceId, req.user.id, req.body), '', 201); } catch (e) { next(e); } };
const approve       = async (req, res, next) => { try { success(res, await svc.approve(req.workspaceId, req.user.id, req.params.id, req.body)); } catch (e) { next(e); } };
const reject        = async (req, res, next) => { try { success(res, await svc.reject(req.workspaceId, req.user.id, req.params.id, req.body)); } catch (e) { next(e); } };
const recordPayment = async (req, res, next) => { try { success(res, await svc.recordPayment(req.workspaceId, req.user.id, req.params.id, req.body), '', 201); } catch (e) { next(e); } };
const cancel        = async (req, res, next) => { try { await svc.cancel(req.workspaceId, req.user.id, req.params.id); success(res, null, 'Reimbursement cancelled'); } catch (e) { next(e); } };

module.exports = { list, getOne, getDashboard, create, approve, reject, recordPayment, cancel };
