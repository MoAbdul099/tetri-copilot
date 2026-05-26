const service = require('./monitoring.service');
const { success, error } = require('../../utils/response');

function guard(req, res) {
  if (!['owner', 'admin'].includes(req.role)) {
    error(res, 'Forbidden', 403);
    return false;
  }
  return true;
}

async function getStatus(req, res) {
  try {
    const data = await service.getStatus();
    success(res, data);
  } catch (err) {
    error(res, err.message, 500);
  }
}

async function getUptimeReport(req, res) {
  if (!guard(req, res)) return;
  try {
    const data = await service.getUptimeReport();
    success(res, data);
  } catch (err) {
    error(res, err.message, 500);
  }
}

async function getMetrics(req, res) {
  if (!guard(req, res)) return;
  try {
    const data = await service.getMetrics(req.query);
    success(res, data);
  } catch (err) {
    error(res, err.message, 500);
  }
}

async function listEvents(req, res) {
  if (!guard(req, res)) return;
  try {
    const data = await service.listEvents(req.query);
    success(res, data);
  } catch (err) {
    error(res, err.message, 500);
  }
}

async function resolveEvent(req, res) {
  if (!guard(req, res)) return;
  try {
    const data = await service.resolveEvent(req.params.id);
    success(res, data, 'Event resolved');
  } catch (err) {
    error(res, err.message, err.status || 500);
  }
}

async function listIncidents(req, res) {
  if (!guard(req, res)) return;
  try {
    const data = await service.listIncidents(req.query);
    success(res, data);
  } catch (err) {
    error(res, err.message, 500);
  }
}

async function createIncident(req, res) {
  if (!guard(req, res)) return;
  try {
    const { title, description, severity, affectedServices, startedAt } = req.body;
    if (!title || !severity) return error(res, 'title and severity are required', 400);
    const data = await service.createIncident({ title, description, severity, affectedServices, reportedBy: req.user.id, startedAt });
    success(res, data, 'Incident created', 201);
  } catch (err) {
    error(res, err.message, 500);
  }
}

async function updateIncident(req, res) {
  if (!guard(req, res)) return;
  try {
    const data = await service.updateIncident(req.params.id, req.body);
    success(res, data, 'Incident updated');
  } catch (err) {
    error(res, err.message, err.status || 500);
  }
}

async function getLaunchReadiness(req, res) {
  if (!guard(req, res)) return;
  try {
    const data = await service.runLaunchReadiness();
    success(res, data);
  } catch (err) {
    error(res, err.message, 500);
  }
}

module.exports = { getStatus, getUptimeReport, getMetrics, listEvents, resolveEvent, listIncidents, createIncident, updateIncident, getLaunchReadiness };
