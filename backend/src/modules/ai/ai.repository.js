const prisma = require('../../lib/prisma');

// ── Providers ─────────────────────────────────────────────────────────────────

async function listProviders() {
  return prisma.aiProvider.findMany({ orderBy: { name: 'asc' }, include: { models: true } });
}

async function getProviderById(id) {
  return prisma.aiProvider.findUnique({ where: { id }, include: { models: true } });
}

async function getProviderByCode(code) {
  return prisma.aiProvider.findUnique({ where: { code } });
}

async function upsertProvider(code, data) {
  return prisma.aiProvider.upsert({
    where: { code },
    update: data,
    create: { code, ...data },
  });
}

async function updateProvider(id, data) {
  return prisma.aiProvider.update({ where: { id }, data });
}

async function deleteProvider(id) {
  return prisma.aiProvider.delete({ where: { id } });
}

// ── Models ────────────────────────────────────────────────────────────────────

async function listModels(providerId) {
  return prisma.aiModel.findMany({
    where: providerId ? { providerId } : undefined,
    orderBy: [{ providerId: 'asc' }, { modelName: 'asc' }],
    include: { provider: { select: { name: true, code: true } } },
  });
}

async function getModelById(id) {
  return prisma.aiModel.findUnique({ where: { id }, include: { provider: true } });
}

async function getModelByName(modelName, providerId) {
  return prisma.aiModel.findFirst({ where: { modelName, providerId, active: true } });
}

async function getDefaultModel(providerId) {
  return prisma.aiModel.findFirst({ where: { providerId, isDefault: true, active: true } });
}

async function createModel(data) {
  return prisma.aiModel.create({ data });
}

async function updateModel(id, data) {
  return prisma.aiModel.update({ where: { id }, data });
}

// ── Configuration ─────────────────────────────────────────────────────────────

async function getAllConfig() {
  const rows = await prisma.aiConfiguration.findMany();
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

async function getConfigValue(key) {
  const row = await prisma.aiConfiguration.findUnique({ where: { key } });
  return row?.value ?? null;
}

async function setConfigValue(key, value) {
  return prisma.aiConfiguration.upsert({
    where: { key },
    update: { value: String(value) },
    create: { key, value: String(value) },
  });
}

async function setManyConfig(entries) {
  return Promise.all(Object.entries(entries).map(([key, value]) => setConfigValue(key, value)));
}

// ── Usage Logs ────────────────────────────────────────────────────────────────

async function logUsage(data) {
  return prisma.aiRequestLog.create({ data });
}

async function getUsageStats({ workspaceId, since, limit = 200 } = {}) {
  const where = {};
  if (workspaceId) where.workspaceId = workspaceId;
  if (since) where.createdAt = { gte: new Date(since) };

  const [rows, totals] = await Promise.all([
    prisma.aiRequestLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      include: {
        provider: { select: { name: true, code: true } },
        model:    { select: { modelName: true } },
      },
    }),
    prisma.aiRequestLog.aggregate({
      where,
      _sum: { tokensInput: true, tokensOutput: true, estimatedCost: true },
      _count: { id: true },
    }),
  ]);

  return {
    rows,
    totals: {
      requests:    totals._count.id,
      tokensInput:  totals._sum.tokensInput  || 0,
      tokensOutput: totals._sum.tokensOutput || 0,
      cost:         totals._sum.estimatedCost || 0,
    },
  };
}

async function countUsageToday(workspaceId) {
  const start = new Date(); start.setHours(0, 0, 0, 0);
  return prisma.aiRequestLog.count({ where: { workspaceId, createdAt: { gte: start } } });
}

async function countUsageThisMonth(workspaceId) {
  const start = new Date(); start.setDate(1); start.setHours(0, 0, 0, 0);
  return prisma.aiRequestLog.count({ where: { workspaceId, createdAt: { gte: start } } });
}

async function costToday(workspaceId) {
  const start = new Date(); start.setHours(0, 0, 0, 0);
  const r = await prisma.aiRequestLog.aggregate({ where: { workspaceId, createdAt: { gte: start } }, _sum: { estimatedCost: true } });
  return r._sum.estimatedCost || 0;
}

async function costThisMonth(workspaceId) {
  const start = new Date(); start.setDate(1); start.setHours(0, 0, 0, 0);
  const r = await prisma.aiRequestLog.aggregate({ where: { workspaceId, createdAt: { gte: start } }, _sum: { estimatedCost: true } });
  return r._sum.estimatedCost || 0;
}

// ── Cost Summaries ────────────────────────────────────────────────────────────

async function getCostSummaries({ period, workspaceId } = {}) {
  const where = {};
  if (period) where.period = period;
  if (workspaceId) where.workspaceId = workspaceId;
  return prisma.aiCostSummary.findMany({ where, orderBy: { periodKey: 'desc' }, take: 90 });
}

async function upsertCostSummary({ period, periodKey, workspaceId, providerId, totalCost, totalTokens, totalRequests }) {
  return prisma.aiCostSummary.upsert({
    where: { period_periodKey_workspaceId_providerId: { period, periodKey, workspaceId: workspaceId ?? null, providerId: providerId ?? null } },
    update: { totalCost, totalTokens, totalRequests },
    create: { period, periodKey, workspaceId, providerId, totalCost, totalTokens, totalRequests },
  });
}

// ── Quota Rules ───────────────────────────────────────────────────────────────

async function getQuotaRule(scope, scopeId = null) {
  return prisma.aiQuotaRule.findUnique({ where: { scope_scopeId: { scope, scopeId } } });
}

async function listQuotaRules() {
  return prisma.aiQuotaRule.findMany({ orderBy: { scope: 'asc' } });
}

async function upsertQuotaRule({ scope, scopeId = null, ...data }) {
  return prisma.aiQuotaRule.upsert({
    where: { scope_scopeId: { scope, scopeId } },
    update: data,
    create: { scope, scopeId, ...data },
  });
}

// ── Health Checks ─────────────────────────────────────────────────────────────

async function recordHealthCheck({ providerId, status, responseTimeMs, message }) {
  return prisma.aiHealthCheck.create({ data: { providerId, status, responseTimeMs, message } });
}

async function getLatestHealthChecks() {
  return prisma.$queryRaw`
    SELECT DISTINCT ON (provider_id) provider_id, status, response_time_ms, message, created_at
    FROM ai_health_checks
    ORDER BY provider_id, created_at DESC
  `;
}

async function purgeOldHealthChecks(daysToKeep = 7) {
  const cutoff = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
  return prisma.aiHealthCheck.deleteMany({ where: { createdAt: { lt: cutoff } } });
}

module.exports = {
  listProviders, getProviderById, getProviderByCode, upsertProvider, updateProvider, deleteProvider,
  listModels, getModelById, getModelByName, getDefaultModel, createModel, updateModel,
  getAllConfig, getConfigValue, setConfigValue, setManyConfig,
  logUsage, getUsageStats, countUsageToday, countUsageThisMonth, costToday, costThisMonth,
  getCostSummaries, upsertCostSummary,
  getQuotaRule, listQuotaRules, upsertQuotaRule,
  recordHealthCheck, getLatestHealthChecks, purgeOldHealthChecks,
};
