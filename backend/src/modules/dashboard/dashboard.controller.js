const svc = require('./dashboard.service');
const { success } = require('../../utils/response');

const getSummary      = async (req, res, next) => { try { success(res, await svc.getSummary(req.workspaceId, req.user.id)); } catch (e) { next(e); } };
const getFinancial    = async (req, res, next) => { try { success(res, await svc.getFinancial(req.workspaceId, req.query.period)); } catch (e) { next(e); } };
const getReceivables  = async (req, res, next) => { try { success(res, await svc.getReceivables(req.workspaceId)); } catch (e) { next(e); } };
const getExpenses     = async (req, res, next) => { try { success(res, await svc.getExpenses(req.workspaceId)); } catch (e) { next(e); } };
const getCompliance   = async (req, res, next) => { try { success(res, await svc.getCompliance(req.workspaceId)); } catch (e) { next(e); } };
const getNotifications = async (req, res, next) => { try { success(res, await svc.getNotifications(req.workspaceId, req.user.id)); } catch (e) { next(e); } };
const getActivity     = async (req, res, next) => { try { success(res, await svc.getActivity(req.workspaceId, parseInt(req.query.limit) || 20)); } catch (e) { next(e); } };
const getSubscription = async (req, res, next) => { try { success(res, await svc.getSubscription(req.workspaceId)); } catch (e) { next(e); } };
const getUpcomingTasks = async (req, res, next) => { try { success(res, await svc.getUpcomingTasks(req.workspaceId, req.user.id)); } catch (e) { next(e); } };
const getPreferences  = async (req, res, next) => { try { success(res, await svc.getPreferences(req.workspaceId, req.user.id)); } catch (e) { next(e); } };
const updatePreferences = async (req, res, next) => { try { success(res, await svc.updatePreferences(req.workspaceId, req.user.id, req.body)); } catch (e) { next(e); } };

module.exports = {
  getSummary, getFinancial, getReceivables, getExpenses, getCompliance,
  getNotifications, getActivity, getSubscription, getUpcomingTasks,
  getPreferences, updatePreferences,
};
