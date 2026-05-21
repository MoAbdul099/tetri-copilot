const svc = require('./expense-approvals.service');
const { success } = require('../../utils/response');

// Expense action handlers (mounted under /expenses/:id/...)
const submit   = async (req, res, next) => { try { success(res, await svc.submit(req.workspaceId, req.user.id, req.params.id)); } catch (e) { next(e); } };
const approve  = async (req, res, next) => { try { success(res, await svc.approve(req.workspaceId, req.user.id, req.params.id, req.body)); } catch (e) { next(e); } };
const reject   = async (req, res, next) => { try { success(res, await svc.reject(req.workspaceId, req.user.id, req.params.id, req.body)); } catch (e) { next(e); } };
const returnForCorrection = async (req, res, next) => { try { success(res, await svc.returnForCorrection(req.workspaceId, req.user.id, req.params.id, req.body)); } catch (e) { next(e); } };
const withdraw = async (req, res, next) => { try { success(res, await svc.withdraw(req.workspaceId, req.user.id, req.params.id)); } catch (e) { next(e); } };
const getApprovalHistory = async (req, res, next) => { try { success(res, await svc.getApprovalHistory(req.workspaceId, req.params.id)); } catch (e) { next(e); } };

// Approvals inbox / dashboard / rules (mounted under /approvals/...)
const getInbox     = async (req, res, next) => { try { success(res, await svc.getInbox(req.workspaceId, req.user.id)); } catch (e) { next(e); } };
const getDashboard = async (req, res, next) => { try { success(res, await svc.getDashboard(req.workspaceId, req.user.id)); } catch (e) { next(e); } };
const listRules    = async (req, res, next) => { try { success(res, await svc.listRules(req.workspaceId)); } catch (e) { next(e); } };
const createRule   = async (req, res, next) => { try { success(res, await svc.createRule(req.workspaceId, req.user.id, req.body), '', 201); } catch (e) { next(e); } };
const updateRule   = async (req, res, next) => { try { success(res, await svc.updateRule(req.workspaceId, req.user.id, req.params.id, req.body)); } catch (e) { next(e); } };
const deleteRule   = async (req, res, next) => { try { await svc.deleteRule(req.workspaceId, req.user.id, req.params.id); success(res, null, 'Rule deleted'); } catch (e) { next(e); } };

module.exports = { submit, approve, reject, returnForCorrection, withdraw, getApprovalHistory, getInbox, getDashboard, listRules, createRule, updateRule, deleteRule };
