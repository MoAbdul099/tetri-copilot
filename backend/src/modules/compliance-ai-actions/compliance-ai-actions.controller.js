const { success, error } = require('../../utils/response');
const svc  = require('./compliance-ai-actions.service');
const repo = require('./compliance-ai-actions.repository');

async function suggestActions(req, res) {
  try {
    const data = await svc.suggestActions(req.workspaceId, req.auth.userId);
    return success(res, data);
  } catch (e) {
    return error(res, e.message, 500);
  }
}

async function fromRecommendation(req, res) {
  const { recommendationId } = req.body;
  if (!recommendationId) return error(res, 'recommendationId is required.', 400);
  try {
    const data = await svc.fromRecommendation(req.workspaceId, req.auth.userId, recommendationId);
    return success(res, data);
  } catch (e) {
    return error(res, e.message, e.message.includes('not found') ? 404 : 500);
  }
}

async function generatePackage(req, res) {
  const { packageType, occurrenceId } = req.body;
  if (!packageType) return error(res, 'packageType is required.', 400);
  try {
    const data = await svc.generatePackage(req.workspaceId, req.auth.userId, { packageType, occurrenceId });
    return success(res, data);
  } catch (e) {
    return error(res, e.message, 500);
  }
}

async function generateChecklist(req, res) {
  const { checklistType, occurrenceId } = req.body;
  try {
    const data = await svc.generateChecklist(req.workspaceId, req.auth.userId, { checklistType, occurrenceId });
    return success(res, data);
  } catch (e) {
    return error(res, e.message, 500);
  }
}

async function draftReminder(req, res) {
  const { occurrenceId } = req.body;
  if (!occurrenceId) return error(res, 'occurrenceId is required.', 400);
  try {
    const data = await svc.draftReminderForOccurrence(req.workspaceId, req.auth.userId, occurrenceId);
    return success(res, data);
  } catch (e) {
    return error(res, e.message, e.message.includes('not found') ? 404 : 500);
  }
}

async function listPackages(req, res) {
  try {
    const { page = 1, pageSize = 20 } = req.query;
    const data = await repo.listPackages(req.workspaceId, { page: parseInt(page), pageSize: parseInt(pageSize) });
    return success(res, data);
  } catch (e) {
    return error(res, e.message, 500);
  }
}

async function getPackage(req, res) {
  try {
    const data = await repo.getPackage(req.workspaceId, req.params.id);
    if (!data) return error(res, 'Package not found.', 404);
    return success(res, data);
  } catch (e) {
    return error(res, e.message, 500);
  }
}

async function listChecklists(req, res) {
  try {
    const { page = 1, pageSize = 20 } = req.query;
    const data = await repo.listChecklists(req.workspaceId, { page: parseInt(page), pageSize: parseInt(pageSize) });
    return success(res, data);
  } catch (e) {
    return error(res, e.message, 500);
  }
}

async function getChecklist(req, res) {
  try {
    const data = await repo.getChecklist(req.workspaceId, req.params.id);
    if (!data) return error(res, 'Checklist not found.', 404);
    return success(res, data);
  } catch (e) {
    return error(res, e.message, 500);
  }
}

async function getDashboard(req, res) {
  try {
    const data = await svc.getDashboard(req.workspaceId);
    return success(res, data);
  } catch (e) {
    return error(res, e.message, 500);
  }
}

async function listActions(req, res) {
  try {
    const { status, riskLevel, page = 1, pageSize = 20 } = req.query;
    const data = await svc.listComplianceActions(req.workspaceId, { status, riskLevel, page: parseInt(page), pageSize: parseInt(pageSize) });
    return success(res, data);
  } catch (e) {
    return error(res, e.message, 500);
  }
}

module.exports = {
  suggestActions, fromRecommendation, generatePackage, generateChecklist,
  draftReminder, listPackages, getPackage, listChecklists, getChecklist,
  getDashboard, listActions,
};
