const repo       = require('./ai-action-framework.repository');
const governance = require('./ai-action-framework.governance');
const registry   = require('./ai-action-framework.registry');

const VALID_STATUSES = ['draft', 'pending_approval', 'approved', 'rejected', 'executing', 'completed', 'failed', 'cancelled', 'expired'];

async function audit(actionId, workspaceId, eventType, actorId, eventData = {}) {
  return repo.addAuditLog({ actionId, workspaceId, eventType, actorId, eventData });
}

// ── Create action proposal ────────────────────────────────────────────────────

async function createAction(workspaceId, userId, {
  module: mod, actionType, title, description,
  confidenceScore = 50, riskLevel, context, explanation,
  expectedOutcome, supportingEvidence, payload,
}) {
  if (!registry.getActionTypeMeta(actionType)) {
    throw new Error(`Unknown action type: ${actionType}`);
  }

  const riskAssessment = governance.assessRisk(actionType, payload);
  const resolvedRisk   = riskLevel || riskAssessment.level;

  // Set expiry 48h from now for pending actions
  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

  const action = await repo.createAction({
    workspaceId, module: mod, actionType, title, description,
    status: 'draft', confidenceScore, riskLevel: resolvedRisk,
    context: context || riskAssessment,
    explanation, expectedOutcome, supportingEvidence, payload,
    createdBy: userId, expiresAt,
  });

  await audit(action.id, workspaceId, 'created', userId, { actionType, riskLevel: resolvedRisk, confidenceScore });
  return action;
}

// ── Submit for approval / auto-approve ───────────────────────────────────────

async function submitAction(workspaceId, userId, actionId) {
  const action = await repo.getAction(workspaceId, actionId);
  if (!action) throw new Error('Action not found.');
  if (action.status !== 'draft') throw new Error(`Cannot submit an action with status "${action.status}".`);

  const needsApproval = await governance.requiresApproval(workspaceId, action.riskLevel, action.actionType);

  let newStatus;
  if (needsApproval) {
    // Create a pending approval record
    await repo.createApproval({ actionId, approverId: userId, decision: null });
    newStatus = 'pending_approval';
    await audit(actionId, workspaceId, 'submitted_for_approval', userId, { needsApproval: true });
  } else {
    // Auto-approve: governance mode allows direct execution
    newStatus = 'approved';
    await repo.updateAction(actionId, { approvedBy: userId, approvedAt: new Date() });
    await audit(actionId, workspaceId, 'auto_approved', userId, { reason: 'governance_policy_allows_auto_approve' });
  }

  await repo.updateAction(actionId, { status: newStatus });
  return repo.getAction(workspaceId, actionId);
}

// ── Approve ───────────────────────────────────────────────────────────────────

async function approveAction(workspaceId, userId, actionId, comments) {
  const action = await repo.getAction(workspaceId, actionId);
  if (!action) throw new Error('Action not found.');
  if (action.status !== 'pending_approval') throw new Error(`Action is not pending approval (status: "${action.status}").`);

  const approval = await repo.getApprovalForAction(actionId, userId);
  if (approval) {
    await repo.updateApproval(approval.id, { decision: 'approved', comments, decidedAt: new Date() });
  } else {
    await repo.createApproval({ actionId, approverId: userId, decision: 'approved', comments, decidedAt: new Date() });
  }

  await repo.updateAction(actionId, { status: 'approved', approvedBy: userId, approvedAt: new Date() });
  await audit(actionId, workspaceId, 'approved', userId, { comments });
  return repo.getAction(workspaceId, actionId);
}

// ── Reject ────────────────────────────────────────────────────────────────────

async function rejectAction(workspaceId, userId, actionId, comments) {
  const action = await repo.getAction(workspaceId, actionId);
  if (!action) throw new Error('Action not found.');
  if (!['pending_approval', 'approved'].includes(action.status)) {
    throw new Error(`Cannot reject action with status "${action.status}".`);
  }

  const approval = await repo.getApprovalForAction(actionId, userId);
  if (approval) {
    await repo.updateApproval(approval.id, { decision: 'rejected', comments, decidedAt: new Date() });
  } else {
    await repo.createApproval({ actionId, approverId: userId, decision: 'rejected', comments, decidedAt: new Date() });
  }

  await repo.updateAction(actionId, { status: 'rejected' });
  await audit(actionId, workspaceId, 'rejected', userId, { comments });
  return repo.getAction(workspaceId, actionId);
}

// ── Execute ───────────────────────────────────────────────────────────────────

async function executeAction(workspaceId, userId, actionId) {
  const action = await repo.getAction(workspaceId, actionId);
  if (!action) throw new Error('Action not found.');
  if (action.status !== 'approved') throw new Error(`Only approved actions can be executed (status: "${action.status}").`);

  await repo.updateAction(actionId, { status: 'executing' });
  await audit(actionId, workspaceId, 'execution_started', userId, {});

  const startedAt = Date.now();
  let execStatus = 'success';
  let result = null;
  let errorMessage = null;

  try {
    const handler = registry.getHandler(action.actionType);
    if (handler) {
      result = await handler({ workspaceId, userId, action });
    } else {
      // No handler registered — framework records the action as executed (handler to be wired by Slice 18.4+)
      result = { message: `Action type "${action.actionType}" executed. No runtime handler registered — result pending integration.`, actionType: action.actionType };
    }

    await repo.updateAction(actionId, { status: 'completed', executedAt: new Date() });
    await audit(actionId, workspaceId, 'execution_completed', userId, { result });
  } catch (err) {
    execStatus = 'failure';
    errorMessage = err.message;
    await repo.updateAction(actionId, { status: 'failed' });
    await audit(actionId, workspaceId, 'execution_failed', userId, { error: err.message });
  }

  await repo.recordExecution({
    actionId,
    status: execStatus,
    result,
    errorMessage,
    executionDurationMs: Date.now() - startedAt,
  });

  return repo.getAction(workspaceId, actionId);
}

// ── Cancel ────────────────────────────────────────────────────────────────────

async function cancelAction(workspaceId, userId, actionId) {
  const action = await repo.getAction(workspaceId, actionId);
  if (!action) throw new Error('Action not found.');
  if (!['draft', 'pending_approval'].includes(action.status)) {
    throw new Error(`Cannot cancel an action with status "${action.status}". Only draft or pending actions can be cancelled.`);
  }

  await repo.updateAction(actionId, { status: 'cancelled' });
  await audit(actionId, workspaceId, 'cancelled', userId, {});
  return repo.getAction(workspaceId, actionId);
}

// ── Dashboard data ────────────────────────────────────────────────────────────

async function getDashboard(workspaceId) {
  const [statusCounts, recentActions, governanceMode] = await Promise.all([
    repo.countByStatus(workspaceId),
    repo.listActions(workspaceId, { page: 1, pageSize: 10 }),
    governance.getGovernanceMode(workspaceId),
  ]);

  return { statusCounts, recentActions: recentActions.items, totalActions: recentActions.total, governanceMode };
}

// ── Governance ────────────────────────────────────────────────────────────────

async function setGovernanceMode(workspaceId, userId, mode) {
  if (!governance.GOVERNANCE_MODES.includes(mode)) {
    throw new Error(`Invalid governance mode. Must be one of: ${governance.GOVERNANCE_MODES.join(', ')}`);
  }
  return repo.upsertPolicy(workspaceId, 'governance_mode', { mode });
}

async function getGovernancePolicies(workspaceId) {
  const [policies, mode] = await Promise.all([
    repo.listPolicies(workspaceId),
    governance.getGovernanceMode(workspaceId),
  ]);
  return { policies, currentMode: mode };
}

module.exports = {
  createAction, submitAction, approveAction, rejectAction, executeAction, cancelAction,
  getDashboard, setGovernanceMode, getGovernancePolicies,
};
