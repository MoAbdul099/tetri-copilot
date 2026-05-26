const repo        = require('./ai.repository');
const service     = require('./ai.service');
const promptSvc   = require('./prompt.service');
const featureSvc  = require('./feature.service');
const convoRepo   = require('./conversation.repository');
const { success, error } = require('../../utils/response');

function guard(req, res) {
  if (!['owner', 'admin'].includes(req.role)) { error(res, 'Forbidden', 403); return false; }
  return true;
}

// ── Providers ─────────────────────────────────────────────────────────────────

async function listProviders(req, res) {
  try { success(res, await repo.listProviders()); } catch (e) { error(res, e.message, 500); }
}

async function updateProvider(req, res) {
  if (!guard(req, res)) return;
  try {
    const { name, enabled, endpoint } = req.body;
    const data = await repo.updateProvider(req.params.id, { name, enabled, endpoint });
    success(res, data, 'Provider updated');
  } catch (e) { error(res, e.message, e.status || 500); }
}

async function deleteProvider(req, res) {
  if (!guard(req, res)) return;
  try { await repo.deleteProvider(req.params.id); success(res, null, 'Provider deleted'); }
  catch (e) { error(res, e.message, e.status || 500); }
}

// ── Models ────────────────────────────────────────────────────────────────────

async function listModels(req, res) {
  try { success(res, await repo.listModels(req.query.providerId)); } catch (e) { error(res, e.message, 500); }
}

async function createModel(req, res) {
  if (!guard(req, res)) return;
  try {
    const { providerId, modelName, description, contextWindow, maxOutputTokens, inputCostPer1k, outputCostPer1k, isDefault } = req.body;
    if (!providerId || !modelName) return error(res, 'providerId and modelName are required', 400);
    const data = await repo.createModel({ providerId, modelName, description, contextWindow: contextWindow ? parseInt(contextWindow) : null, maxOutputTokens: maxOutputTokens ? parseInt(maxOutputTokens) : null, inputCostPer1k: inputCostPer1k ? parseFloat(inputCostPer1k) : null, outputCostPer1k: outputCostPer1k ? parseFloat(outputCostPer1k) : null, isDefault: !!isDefault, active: true });
    success(res, data, 'Model created', 201);
  } catch (e) { error(res, e.message, e.status || 500); }
}

async function updateModel(req, res) {
  if (!guard(req, res)) return;
  try {
    const { modelName, description, contextWindow, maxOutputTokens, inputCostPer1k, outputCostPer1k, isDefault, active } = req.body;
    const data = await repo.updateModel(req.params.id, { modelName, description, contextWindow: contextWindow !== undefined ? parseInt(contextWindow) : undefined, maxOutputTokens: maxOutputTokens !== undefined ? parseInt(maxOutputTokens) : undefined, inputCostPer1k: inputCostPer1k !== undefined ? parseFloat(inputCostPer1k) : undefined, outputCostPer1k: outputCostPer1k !== undefined ? parseFloat(outputCostPer1k) : undefined, isDefault, active });
    success(res, data, 'Model updated');
  } catch (e) { error(res, e.message, e.status || 500); }
}

// ── Configuration ─────────────────────────────────────────────────────────────

async function getConfig(req, res) {
  try { success(res, await repo.getAllConfig()); } catch (e) { error(res, e.message, 500); }
}

async function updateConfig(req, res) {
  if (!guard(req, res)) return;
  try {
    const allowed = ['default_provider','default_model','temperature','max_tokens','max_retries','timeout_ms','daily_quota','monthly_quota','cost_limit_daily','cost_limit_monthly'];
    const updates = {};
    for (const key of allowed) { if (req.body[key] !== undefined) updates[key] = req.body[key]; }
    await repo.setManyConfig(updates);
    service.invalidateConfigCache();
    success(res, await repo.getAllConfig(), 'Configuration updated');
  } catch (e) { error(res, e.message, 500); }
}

// ── Quota Rules ───────────────────────────────────────────────────────────────

async function listQuotaRules(req, res) {
  try { success(res, await repo.listQuotaRules()); } catch (e) { error(res, e.message, 500); }
}

async function upsertQuotaRule(req, res) {
  if (!guard(req, res)) return;
  try {
    const data = await repo.upsertQuotaRule(req.body);
    success(res, data, 'Quota rule saved');
  } catch (e) { error(res, e.message, 500); }
}

// ── Usage ─────────────────────────────────────────────────────────────────────

async function getUsage(req, res) {
  try {
    const data = await service.getUsageDashboard({ workspaceId: req.query.workspaceId, since: req.query.since });
    success(res, data);
  } catch (e) { error(res, e.message, 500); }
}

// ── Costs ─────────────────────────────────────────────────────────────────────

async function getCosts(req, res) {
  try { success(res, await service.getCostDashboard()); } catch (e) { error(res, e.message, 500); }
}

// ── Health ────────────────────────────────────────────────────────────────────

async function getHealth(req, res) {
  try { success(res, await service.getHealthSummary()); } catch (e) { error(res, e.message, 500); }
}

async function triggerHealthCheck(req, res) {
  if (!guard(req, res)) return;
  try { success(res, await service.runHealthChecks(), 'Health checks complete'); }
  catch (e) { error(res, e.message, 500); }
}

// ── Prompt Groups ─────────────────────────────────────────────────────────────

async function listPromptGroups(req, res) {
  try { success(res, await promptSvc.listGroups()); } catch (e) { error(res, e.message, 500); }
}

async function createPromptGroup(req, res) {
  if (!guard(req, res)) return;
  try { success(res, await promptSvc.createGroup(req.body), 'Group created', 201); }
  catch (e) { error(res, e.message, e.status || 500); }
}

// ── Prompts ───────────────────────────────────────────────────────────────────

async function listPrompts(req, res) {
  try { success(res, await promptSvc.listPrompts(req.query)); } catch (e) { error(res, e.message, 500); }
}

async function createPrompt(req, res) {
  if (!guard(req, res)) return;
  try { success(res, await promptSvc.createPrompt(req.body), 'Prompt created', 201); }
  catch (e) { error(res, e.message, e.status || 500); }
}

async function getPrompt(req, res) {
  try { success(res, await promptSvc.getPrompt(req.params.id)); }
  catch (e) { error(res, e.message, e.status || 500); }
}

async function updatePrompt(req, res) {
  if (!guard(req, res)) return;
  try { success(res, await promptSvc.updatePrompt(req.params.id, req.body), 'Prompt updated'); }
  catch (e) { error(res, e.message, e.status || 500); }
}

async function archivePrompt(req, res) {
  if (!guard(req, res)) return;
  try { success(res, await promptSvc.archivePrompt(req.params.id), 'Prompt archived'); }
  catch (e) { error(res, e.message, e.status || 500); }
}

// ── Versions ──────────────────────────────────────────────────────────────────

async function listVersions(req, res) {
  try { success(res, await promptSvc.listVersions(req.params.id)); }
  catch (e) { error(res, e.message, e.status || 500); }
}

async function createVersion(req, res) {
  if (!guard(req, res)) return;
  try {
    const version = await promptSvc.createVersion(req.params.id, { ...req.body, userId: req.userId });
    success(res, version, 'Version created', 201);
  } catch (e) { error(res, e.message, e.status || 500); }
}

async function activateVersion(req, res) {
  if (!guard(req, res)) return;
  try {
    const { versionId } = req.body;
    if (!versionId) return error(res, 'versionId is required', 400);
    success(res, await promptSvc.activateVersion(req.params.id, versionId), 'Version activated');
  } catch (e) { error(res, e.message, e.status || 500); }
}

async function rollbackVersion(req, res) {
  if (!guard(req, res)) return;
  try {
    const { versionId } = req.body;
    if (!versionId) return error(res, 'versionId is required', 400);
    success(res, await promptSvc.rollbackVersion(req.params.id, versionId), 'Rolled back');
  } catch (e) { error(res, e.message, e.status || 500); }
}

async function testPrompt(req, res) {
  if (!guard(req, res)) return;
  try {
    const result = await promptSvc.testPrompt({ ...req.body, workspaceId: req.workspaceId, userId: req.userId });
    success(res, result);
  } catch (e) { error(res, e.message, e.status || 500); }
}

async function listPromptTests(req, res) {
  try {
    const { listTests } = require('./prompt.repository');
    success(res, await listTests(req.params.id));
  } catch (e) { error(res, e.message, 500); }
}

// ── Feature Registry ──────────────────────────────────────────────────────────

async function listFeatures(req, res) {
  try { success(res, await featureSvc.listFeatures()); } catch (e) { error(res, e.message, 500); }
}

async function updateFeature(req, res) {
  if (!guard(req, res)) return;
  try { success(res, await featureSvc.updateFeature(req.params.id, req.body), 'Feature updated'); }
  catch (e) { error(res, e.message, e.status || 500); }
}

async function getFeatureFlags(req, res) {
  try { success(res, await featureSvc.getWorkspaceFlags(req.params.id)); }
  catch (e) { error(res, e.message, 500); }
}

async function setFeatureFlag(req, res) {
  if (!guard(req, res)) return;
  try {
    const { workspaceId, enabled } = req.body;
    if (!workspaceId) return error(res, 'workspaceId is required', 400);
    success(res, await featureSvc.setWorkspaceFlag(req.params.id, workspaceId, !!enabled), 'Flag updated');
  } catch (e) { error(res, e.message, e.status || 500); }
}

// ── Conversations (admin view) ────────────────────────────────────────────────

async function listConversations(req, res) {
  try {
    const { workspaceId, featureCode, status } = req.query;
    const sessions = await convoRepo.listSessions({ workspaceId, featureCode, status });
    success(res, sessions);
  } catch (e) { error(res, e.message, 500); }
}

// ── Extended analytics ────────────────────────────────────────────────────────

async function getAnalytics(req, res) {
  try {
    const prisma = require('../../lib/prisma');
    const since  = req.query.since ? new Date(req.query.since) : new Date(Date.now() - 30 * 24 * 3600_000);
    const [usage, features, providers, sessions] = await Promise.all([
      prisma.aiRequestLog.aggregate({ where: { createdAt: { gte: since } }, _sum: { tokensInput: true, tokensOutput: true, estimatedCost: true }, _count: { id: true } }),
      prisma.aiRequestLog.groupBy({ by: ['feature'], where: { createdAt: { gte: since } }, _count: { id: true }, _sum: { estimatedCost: true }, orderBy: { _count: { id: 'desc' } }, take: 10 }),
      prisma.aiRequestLog.groupBy({ by: ['providerId'], where: { createdAt: { gte: since } }, _count: { id: true }, _sum: { estimatedCost: true } }),
      prisma.aiConversationSession.count({ where: { createdAt: { gte: since } } }),
    ]);
    const providerList = await repo.listProviders();
    const pMap = Object.fromEntries(providerList.map((p) => [p.id, p.name]));
    success(res, {
      totalRequests:    usage._count.id,
      totalTokensInput: usage._sum.tokensInput  || 0,
      totalTokensOut:   usage._sum.tokensOutput || 0,
      totalCost:        usage._sum.estimatedCost || 0,
      totalSessions:    sessions,
      byFeature:        features.map((f) => ({ feature: f.feature, requests: f._count.id, cost: f._sum.estimatedCost || 0 })),
      byProvider:       providers.map((p) => ({ provider: pMap[p.providerId] || p.providerId, requests: p._count.id, cost: p._sum.estimatedCost || 0 })),
    });
  } catch (e) { error(res, e.message, 500); }
}

module.exports = {
  listProviders, updateProvider, deleteProvider,
  listModels, createModel, updateModel,
  getConfig, updateConfig,
  listQuotaRules, upsertQuotaRule,
  getUsage, getCosts,
  getHealth, triggerHealthCheck,
  // Slice 14.2
  listPromptGroups, createPromptGroup,
  listPrompts, createPrompt, getPrompt, updatePrompt, archivePrompt,
  listVersions, createVersion, activateVersion, rollbackVersion, testPrompt, listPromptTests,
  listFeatures, updateFeature, getFeatureFlags, setFeatureFlag,
  listConversations,
  getAnalytics,
};
