const svc      = require('./ai-action-framework.service');
const repo     = require('./ai-action-framework.repository');
const registry = require('./ai-action-framework.registry');
const { success, error } = require('../../utils/response');

async function getRegistry(req, res) {
  try {
    return success(res, registry.listActionTypes());
  } catch (err) {
    return error(res, err.message, 500);
  }
}

async function getDashboard(req, res) {
  try {
    const data = await svc.getDashboard(req.workspaceId);
    return success(res, data);
  } catch (err) {
    return error(res, err.message, 500);
  }
}

async function listActions(req, res) {
  try {
    const { module: mod, status, riskLevel, page, pageSize } = req.query;
    const data = await repo.listActions(req.workspaceId, { module: mod, status, riskLevel, page, pageSize });
    return success(res, data);
  } catch (err) {
    return error(res, err.message, 500);
  }
}

async function createAction(req, res) {
  try {
    const action = await svc.createAction(req.workspaceId, req.auth.userId, req.body);
    return success(res, action, 'Action created.');
  } catch (err) {
    return error(res, err.message, 400);
  }
}

async function getAction(req, res) {
  try {
    const action = await repo.getAction(req.workspaceId, req.params.id);
    if (!action) return error(res, 'Action not found.', 404);
    return success(res, action);
  } catch (err) {
    return error(res, err.message, 500);
  }
}

async function submitAction(req, res) {
  try {
    const action = await svc.submitAction(req.workspaceId, req.auth.userId, req.params.id);
    return success(res, action, 'Action submitted.');
  } catch (err) {
    return error(res, err.message, 400);
  }
}

async function approveAction(req, res) {
  try {
    const action = await svc.approveAction(req.workspaceId, req.auth.userId, req.params.id, req.body.comments);
    return success(res, action, 'Action approved.');
  } catch (err) {
    return error(res, err.message, 400);
  }
}

async function rejectAction(req, res) {
  try {
    const action = await svc.rejectAction(req.workspaceId, req.auth.userId, req.params.id, req.body.comments);
    return success(res, action, 'Action rejected.');
  } catch (err) {
    return error(res, err.message, 400);
  }
}

async function executeAction(req, res) {
  try {
    const action = await svc.executeAction(req.workspaceId, req.auth.userId, req.params.id);
    return success(res, action, 'Action executed.');
  } catch (err) {
    return error(res, err.message, 400);
  }
}

async function cancelAction(req, res) {
  try {
    const action = await svc.cancelAction(req.workspaceId, req.auth.userId, req.params.id);
    return success(res, action, 'Action cancelled.');
  } catch (err) {
    return error(res, err.message, 400);
  }
}

async function getPendingApprovals(req, res) {
  try {
    const items = await repo.getPendingApprovalForUser(req.workspaceId, req.auth.userId);
    return success(res, items);
  } catch (err) {
    return error(res, err.message, 500);
  }
}

async function getGovernance(req, res) {
  try {
    const data = await svc.getGovernancePolicies(req.workspaceId);
    return success(res, data);
  } catch (err) {
    return error(res, err.message, 500);
  }
}

async function setGovernanceMode(req, res) {
  try {
    const policy = await svc.setGovernanceMode(req.workspaceId, req.auth.userId, req.body.mode);
    return success(res, policy, 'Governance mode updated.');
  } catch (err) {
    return error(res, err.message, 400);
  }
}

async function listTemplates(req, res) {
  try {
    const items = await repo.listTemplates(req.query.module);
    return success(res, items);
  } catch (err) {
    return error(res, err.message, 500);
  }
}

async function getAuditLogs(req, res) {
  try {
    const logs = await repo.getAuditLogs(req.workspaceId, req.params.id);
    return success(res, logs);
  } catch (err) {
    return error(res, err.message, 500);
  }
}

module.exports = {
  getRegistry, getDashboard,
  listActions, createAction, getAction,
  submitAction, approveAction, rejectAction, executeAction, cancelAction,
  getPendingApprovals, getGovernance, setGovernanceMode,
  listTemplates, getAuditLogs,
};
