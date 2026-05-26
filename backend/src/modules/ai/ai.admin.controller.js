const repo    = require('./ai.repository');
const service = require('./ai.service');
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

module.exports = {
  listProviders, updateProvider, deleteProvider,
  listModels, createModel, updateModel,
  getConfig, updateConfig,
  listQuotaRules, upsertQuotaRule,
  getUsage, getCosts,
  getHealth, triggerHealthCheck,
};
