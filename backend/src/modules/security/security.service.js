const repo = require('./security.repository');
const { invalidateRulesCache } = require('../../lib/securityConsumer');

async function getDashboard(workspaceId) {
  return repo.getDashboard(workspaceId);
}

async function listAlerts(workspaceId, filters) {
  return repo.listAlerts(workspaceId, filters);
}

async function getAlert(id, workspaceId) {
  const alert = await repo.getAlert(id, workspaceId);
  if (!alert) throw Object.assign(new Error('Alert not found'), { status: 404 });
  return alert;
}

async function getAlertWithContext(id, workspaceId) {
  const alert = await repo.getAlert(id, workspaceId);
  if (!alert) throw Object.assign(new Error('Alert not found'), { status: 404 });
  const context = await repo.getAlertContext(alert);
  return { alert, ...context };
}

async function acknowledgeAlert(id, workspaceId, notes) {
  return repo.updateAlertStatus(id, workspaceId, 'acknowledged', notes);
}

async function investigateAlert(id, workspaceId, notes) {
  return repo.updateAlertStatus(id, workspaceId, 'investigating', notes);
}

async function resolveAlert(id, workspaceId, notes) {
  return repo.updateAlertStatus(id, workspaceId, 'resolved', notes);
}

async function dismissAlert(id, workspaceId, notes) {
  return repo.updateAlertStatus(id, workspaceId, 'dismissed', notes);
}

async function markFalsePositive(id, workspaceId, notes) {
  return repo.updateAlertStatus(id, workspaceId, 'false_positive', notes);
}

async function listEvents(workspaceId, filters) {
  return repo.listEvents(workspaceId, filters);
}

async function listRules(workspaceId) {
  return repo.listRules(workspaceId);
}

async function updateRule(id, data) {
  const result = await repo.updateRule(id, data);
  invalidateRulesCache();
  return result;
}

module.exports = {
  getDashboard,
  listAlerts, getAlert, getAlertWithContext,
  acknowledgeAlert, investigateAlert, resolveAlert, dismissAlert, markFalsePositive,
  listEvents,
  listRules, updateRule,
};
