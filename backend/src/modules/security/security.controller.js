const service = require('./security.service');
const { success, error } = require('../../utils/response');

function guard(req, res) {
  if (!['owner', 'admin'].includes(req.role)) {
    error(res, 'Access denied — security center requires owner or admin role', 403);
    return false;
  }
  return true;
}

async function getDashboard(req, res) {
  if (!guard(req, res)) return;
  try {
    return success(res, await service.getDashboard(req.workspaceMember.workspaceId));
  } catch (err) { return error(res, err.message, err.status || 500); }
}

async function listAlerts(req, res) {
  if (!guard(req, res)) return;
  try {
    return success(res, await service.listAlerts(req.workspaceMember.workspaceId, req.query));
  } catch (err) { return error(res, err.message, err.status || 500); }
}

async function getAlert(req, res) {
  if (!guard(req, res)) return;
  try {
    return success(res, await service.getAlertWithContext(req.params.id, req.workspaceMember.workspaceId));
  } catch (err) { return error(res, err.message, err.status || 500); }
}

async function acknowledgeAlert(req, res) {
  if (!guard(req, res)) return;
  try {
    await service.acknowledgeAlert(req.params.id, req.workspaceMember.workspaceId, req.body.notes);
    return success(res, {}, 'Alert acknowledged');
  } catch (err) { return error(res, err.message, err.status || 500); }
}

async function investigateAlert(req, res) {
  if (!guard(req, res)) return;
  try {
    await service.investigateAlert(req.params.id, req.workspaceMember.workspaceId, req.body.notes);
    return success(res, {}, 'Alert marked as investigating');
  } catch (err) { return error(res, err.message, err.status || 500); }
}

async function resolveAlert(req, res) {
  if (!guard(req, res)) return;
  try {
    await service.resolveAlert(req.params.id, req.workspaceMember.workspaceId, req.body.notes);
    return success(res, {}, 'Alert resolved');
  } catch (err) { return error(res, err.message, err.status || 500); }
}

async function dismissAlert(req, res) {
  if (!guard(req, res)) return;
  try {
    await service.dismissAlert(req.params.id, req.workspaceMember.workspaceId, req.body.notes);
    return success(res, {}, 'Alert dismissed');
  } catch (err) { return error(res, err.message, err.status || 500); }
}

async function markFalsePositive(req, res) {
  if (!guard(req, res)) return;
  try {
    await service.markFalsePositive(req.params.id, req.workspaceMember.workspaceId, req.body.notes);
    return success(res, {}, 'Marked as false positive');
  } catch (err) { return error(res, err.message, err.status || 500); }
}

async function listEvents(req, res) {
  if (!guard(req, res)) return;
  try {
    return success(res, await service.listEvents(req.workspaceMember.workspaceId, req.query));
  } catch (err) { return error(res, err.message, err.status || 500); }
}

async function listRules(req, res) {
  if (!guard(req, res)) return;
  try {
    return success(res, await service.listRules(req.workspaceMember.workspaceId));
  } catch (err) { return error(res, err.message, err.status || 500); }
}

async function updateRule(req, res) {
  if (!guard(req, res)) return;
  try {
    return success(res, await service.updateRule(req.params.id, req.body), 'Rule updated');
  } catch (err) { return error(res, err.message, err.status || 500); }
}

module.exports = {
  getDashboard,
  listAlerts, getAlert,
  acknowledgeAlert, investigateAlert, resolveAlert, dismissAlert, markFalsePositive,
  listEvents,
  listRules, updateRule,
};
