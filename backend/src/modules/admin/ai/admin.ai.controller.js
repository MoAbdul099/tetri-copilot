const repo = require('./admin.ai.repository');

const logAudit = async (adminUser, action, details = {}) => {
  try {
    const prisma = require('../../../lib/prisma');
    await prisma.adminActivityLog.create({
      data: { adminUserId: adminUser.id, action, details, entityType: 'ai_quota' },
    });
  } catch (_) {}
};

const getDashboard = async (req, res, next) => {
  try {
    const data = await repo.getDashboard();
    res.json({ success: true, data });
  } catch (e) { next(e); }
};

const listWorkspaceUsage = async (req, res, next) => {
  try {
    const data = await repo.listWorkspaceUsage(req.query);
    res.json({ success: true, data });
  } catch (e) { next(e); }
};

const listUserUsage = async (req, res, next) => {
  try {
    const data = await repo.listUserUsage(req.query);
    res.json({ success: true, data });
  } catch (e) { next(e); }
};

const getProviderAnalytics = async (req, res, next) => {
  try {
    const data = await repo.getProviderAnalytics(req.query);
    res.json({ success: true, data });
  } catch (e) { next(e); }
};

const getCostAnalytics = async (req, res, next) => {
  try {
    const data = await repo.getCostAnalytics();
    res.json({ success: true, data });
  } catch (e) { next(e); }
};

const listQuotas = async (req, res, next) => {
  try {
    const data = await repo.listQuotas();
    res.json({ success: true, data });
  } catch (e) { next(e); }
};

const upsertQuota = async (req, res, next) => {
  try {
    const { scope, scopeId, dailyRequests, monthlyRequests, dailyCostLimit, monthlyCostLimit, active } = req.body;
    if (!scope) return res.status(400).json({ success: false, error: 'scope is required' });
    const data = await repo.upsertQuota({ scope, scopeId: scopeId || null, dailyRequests, monthlyRequests, dailyCostLimit, monthlyCostLimit, active });
    await logAudit(req.adminUser, 'quota_updated', { scope, scopeId, dailyRequests, monthlyRequests });
    res.json({ success: true, data, message: 'Quota rule saved' });
  } catch (e) { next(e); }
};

const deleteQuota = async (req, res, next) => {
  try {
    await repo.deleteQuota(req.params.id);
    await logAudit(req.adminUser, 'quota_deleted', { id: req.params.id });
    res.json({ success: true, data: null, message: 'Quota rule deleted' });
  } catch (e) { next(e); }
};

const getAbuseAlerts = async (req, res, next) => {
  try {
    const data = await repo.getAbuseAlerts();
    res.json({ success: true, data });
  } catch (e) { next(e); }
};

const listLogs = async (req, res, next) => {
  try {
    const data = await repo.listLogs(req.query);
    res.json({ success: true, data });
  } catch (e) { next(e); }
};

module.exports = {
  getDashboard,
  listWorkspaceUsage,
  listUserUsage,
  getProviderAnalytics,
  getCostAnalytics,
  listQuotas,
  upsertQuota,
  deleteQuota,
  getAbuseAlerts,
  listLogs,
};
