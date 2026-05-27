const repo      = require('./compliance-ai-actions.repository');
const ctx       = require('./compliance-ai-actions.context');
const generator = require('./compliance-ai-actions.generator');
const frameworkSvc = require('../ai-action-framework/ai-action-framework.service');
const frameworkRepo = require('../ai-action-framework/ai-action-framework.repository');
const intRepo   = require('../compliance-intelligence/compliance-intelligence.repository');

// ── Suggest compliance AI actions ─────────────────────────────────────────────

async function suggestActions(workspaceId, userId) {
  const context = await ctx.assembleContext(workspaceId);
  const suggestions = await generator.suggestActions(workspaceId, userId, context.text);

  const created = [];
  for (const s of suggestions) {
    try {
      const action = await frameworkSvc.createAction(workspaceId, userId, {
        module: 'compliance',
        actionType: s.actionType,
        title: s.title,
        description: s.description,
        confidenceScore: s.confidenceScore || 70,
        riskLevel: s.riskLevel || 'medium',
        explanation: s.explanation,
        expectedOutcome: s.expectedOutcome,
        supportingEvidence: s.supportingEvidence,
        context: context.raw,
        payload: {},
      });
      created.push(action);
    } catch {
      // skip invalid action types
    }
  }
  return { suggested: created.length, actions: created };
}

// ── Convert recommendation → action ──────────────────────────────────────────

async function fromRecommendation(workspaceId, userId, recommendationId) {
  const recs = await intRepo.listRecommendations(workspaceId);
  const rec  = recs.find(r => r.id === recommendationId);
  if (!rec) throw new Error('Recommendation not found.');

  const actionTypeMap = {
    OVERDUE:           'ESCALATE_COMPLIANCE_ITEM',
    NEAR_OVERDUE:      'CREATE_REMINDER',
    INACTIVITY:        'CREATE_REMINDER',
    REPEATED_FAILURE:  'PREPARE_CHECKLIST',
    NO_OBLIGATIONS:    'GENERATE_DOCUMENT',
  };

  const actionType = actionTypeMap[rec.category] || 'CREATE_REMINDER';

  const action = await frameworkSvc.createAction(workspaceId, userId, {
    module: 'compliance',
    actionType,
    title: `Action: ${rec.recommendation.slice(0, 80)}`,
    description: rec.recommendation,
    confidenceScore: rec.confidenceLevel === 'high' ? 85 : rec.confidenceLevel === 'medium' ? 70 : 55,
    riskLevel: rec.priority === 'critical' ? 'critical' : rec.priority === 'high' ? 'high' : rec.priority === 'medium' ? 'medium' : 'low',
    explanation: `Derived from compliance recommendation: ${rec.recommendation}`,
    expectedOutcome: 'Compliance gap resolved as per recommendation.',
    supportingEvidence: `Recommendation priority: ${rec.priority}, category: ${rec.category}`,
    context: { recommendationId, recommendation: rec },
    payload: { recommendationId },
  });

  await repo.createActionContext({
    actionId: action.id,
    complianceRecordId: recommendationId,
    sourceType: 'recommendation',
  });

  return action;
}

// ── Generate preparation package ──────────────────────────────────────────────

async function generatePackage(workspaceId, userId, { packageType, occurrenceId }) {
  let obligationContext = null;
  let occContext = null;

  if (occurrenceId) {
    occContext = await ctx.assembleOccurrenceContext(workspaceId, occurrenceId);
    if (occContext) obligationContext = occContext.text;
  }

  const baseContext = await ctx.assembleContext(workspaceId);
  const packageData = await generator.generatePackage(workspaceId, userId, {
    packageType,
    obligationContext,
    contextText: baseContext.text,
  });

  const saved = await repo.createPackage({
    workspaceId,
    obligationId: occurrenceId || null,
    packageType,
    packageData,
    createdBy: userId,
  });

  return saved;
}

// ── Generate checklist ────────────────────────────────────────────────────────

async function generateChecklist(workspaceId, userId, { checklistType, occurrenceId }) {
  let obligationContext = null;

  if (occurrenceId) {
    const occCtx = await ctx.assembleOccurrenceContext(workspaceId, occurrenceId);
    if (occCtx) obligationContext = occCtx.text;
  }

  const baseContext = await ctx.assembleContext(workspaceId);
  const checklistData = await generator.generateChecklist(workspaceId, userId, {
    checklistType,
    obligationContext,
    contextText: baseContext.text,
  });

  const saved = await repo.createChecklist({
    workspaceId,
    obligationId: occurrenceId || null,
    checklistData,
    createdBy: userId,
  });

  return saved;
}

// ── Reminder draft for occurrence ────────────────────────────────────────────

async function draftReminderForOccurrence(workspaceId, userId, occurrenceId) {
  const occCtx = await ctx.assembleOccurrenceContext(workspaceId, occurrenceId);
  if (!occCtx) throw new Error('Obligation not found.');

  const draft = await generator.draftReminderAction(workspaceId, userId, {
    occurrenceName: occCtx.occurrence.name,
    dueDate: occCtx.occurrence.dueDate,
    urgency: occCtx.urgency,
  });

  const action = await frameworkSvc.createAction(workspaceId, userId, {
    module: 'compliance',
    actionType: 'CREATE_REMINDER',
    ...draft,
    context: { occurrenceId, occurrence: occCtx.occurrence },
    payload: { occurrenceId },
  });

  await repo.createActionContext({
    actionId: action.id,
    obligationId: occurrenceId,
    sourceType: 'occurrence',
  });

  return action;
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

async function getDashboard(workspaceId) {
  const [statusCounts, counts, recentActions] = await Promise.all([
    repo.countComplianceActions(workspaceId),
    repo.countPackagesAndChecklists(workspaceId),
    repo.listRecentComplianceActions(workspaceId, 5),
  ]);

  const total = Object.values(statusCounts).reduce((a, b) => a + b, 0);
  const approved  = (statusCounts.approved || 0) + (statusCounts.completed || 0);
  const pending   = statusCounts.pending_approval || 0;
  const rejected  = statusCounts.rejected || 0;
  const approvalRate = total > 0 ? Math.round((approved / total) * 100) : 0;

  return {
    statusCounts,
    totals: {
      total,
      pending,
      approved,
      rejected,
      draft:  statusCounts.draft || 0,
      executed: statusCounts.completed || 0,
    },
    approvalRate,
    packages:   counts.packages,
    checklists: counts.checklists,
    recentActions,
  };
}

// ── List compliance actions ───────────────────────────────────────────────────

async function listComplianceActions(workspaceId, { status, riskLevel, page = 1, pageSize = 20 } = {}) {
  return frameworkRepo.listActions(workspaceId, { module: 'compliance', status, riskLevel, page, pageSize });
}

module.exports = {
  suggestActions,
  fromRecommendation,
  generatePackage,
  generateChecklist,
  draftReminderForOccurrence,
  getDashboard,
  listComplianceActions,
};
