const svc = require('./analytics.service');
const { success, error } = require('../../utils/response');

async function getAnalytics(req, res) {
  try {
    const data = await svc.getFullAnalytics(req.workspaceId);
    return success(res, data);
  } catch (e) {
    return error(res, e.message, 500);
  }
}

async function getHealthScore(req, res) {
  try {
    const data = await svc.getHealthScore(req.workspaceId);
    return success(res, data);
  } catch (e) {
    return error(res, e.message, 500);
  }
}

async function refreshAnalytics(req, res) {
  try {
    const data = await svc.refreshAnalytics(req.workspaceId);
    return success(res, data, 'Analytics refreshed');
  } catch (e) {
    return error(res, e.message, 500);
  }
}

async function listInsights(req, res) {
  try {
    const { category, status } = req.query;
    const data = await svc.listInsights(req.workspaceId, { category, status });
    return success(res, data);
  } catch (e) {
    return error(res, e.message, 500);
  }
}

async function dismissInsight(req, res) {
  try {
    await svc.dismissInsight(req.workspaceId, req.params.id);
    return success(res, null, 'Insight dismissed');
  } catch (e) {
    return error(res, e.message, 500);
  }
}

async function listRiskAlerts(req, res) {
  try {
    const data = await svc.listRiskAlerts(req.workspaceId);
    return success(res, data);
  } catch (e) {
    return error(res, e.message, 500);
  }
}

async function dismissRiskAlert(req, res) {
  try {
    await svc.dismissRiskAlert(req.workspaceId, req.params.id);
    return success(res, null, 'Alert dismissed');
  } catch (e) {
    return error(res, e.message, 500);
  }
}

module.exports = { getAnalytics, getHealthScore, refreshAnalytics, listInsights, dismissInsight, listRiskAlerts, dismissRiskAlert };
