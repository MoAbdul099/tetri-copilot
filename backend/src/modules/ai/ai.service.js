const repo     = require('./ai.repository');
const registry = require('./providers/registry');

// ── Config cache (TTL: 60s) ───────────────────────────────────────────────────
let _configCache = null;
let _configTs    = 0;
const CONFIG_TTL = 60_000;

async function getConfig() {
  if (!_configCache || Date.now() - _configTs > CONFIG_TTL) {
    _configCache = await repo.getAllConfig();
    _configTs    = Date.now();
  }
  return _configCache;
}

function invalidateConfigCache() { _configCache = null; }

// ── Helpers ───────────────────────────────────────────────────────────────────

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

function withTimeout(promise, ms) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`AI request timed out after ${ms}ms`)), ms);
    promise.then((v) => { clearTimeout(t); resolve(v); }).catch((e) => { clearTimeout(t); reject(e); });
  });
}

function isRetryable(err) {
  const msg = err.message || '';
  return err.status === 429 || err.status === 503 || msg.includes('timeout') || msg.includes('ECONNRESET');
}

// ── Quota check ───────────────────────────────────────────────────────────────

async function checkQuota(workspaceId, config) {
  const systemRule  = await repo.getQuotaRule('system');
  const wsRule      = await repo.getQuotaRule('workspace', workspaceId);

  const rules = [systemRule, wsRule].filter(Boolean).filter((r) => r.active);

  for (const rule of rules) {
    const scopeId = rule.scope === 'system' ? null : workspaceId;

    if (rule.dailyRequests) {
      const used = await repo.countUsageToday(workspaceId);
      if (used >= rule.dailyRequests) throw Object.assign(new Error('Daily request quota exceeded'), { status: 429, code: 'QUOTA_EXCEEDED' });
    }
    if (rule.monthlyRequests) {
      const used = await repo.countUsageThisMonth(workspaceId);
      if (used >= rule.monthlyRequests) throw Object.assign(new Error('Monthly request quota exceeded'), { status: 429, code: 'QUOTA_EXCEEDED' });
    }
    if (rule.dailyCostLimit) {
      const spent = await repo.costToday(workspaceId);
      if (spent >= rule.dailyCostLimit) throw Object.assign(new Error('Daily cost limit exceeded'), { status: 429, code: 'QUOTA_EXCEEDED' });
    }
    if (rule.monthlyCostLimit) {
      const spent = await repo.costThisMonth(workspaceId);
      if (spent >= rule.monthlyCostLimit) throw Object.assign(new Error('Monthly cost limit exceeded'), { status: 429, code: 'QUOTA_EXCEEDED' });
    }
  }

  // Config-level fallbacks
  if (config.daily_quota) {
    const used = await repo.countUsageToday(workspaceId);
    if (used >= parseInt(config.daily_quota)) throw Object.assign(new Error('Daily request quota exceeded'), { status: 429, code: 'QUOTA_EXCEEDED' });
  }
  if (config.monthly_quota) {
    const used = await repo.countUsageThisMonth(workspaceId);
    if (used >= parseInt(config.monthly_quota)) throw Object.assign(new Error('Monthly request quota exceeded'), { status: 429, code: 'QUOTA_EXCEEDED' });
  }
}

// ── Core execute pipeline ─────────────────────────────────────────────────────

async function execute({ workspaceId, userId, feature, messages, options = {} }) {
  const config = await getConfig();

  const providerCode = options.provider || config.default_provider || 'gemini';
  const modelName    = options.model    || config.default_model    || 'gemini-2.0-flash';
  const temperature  = parseFloat(options.temperature ?? config.temperature ?? 0.7);
  const maxTokens    = parseInt(options.maxTokens    ?? config.max_tokens    ?? 1000);
  const maxRetries   = parseInt(config.max_retries   ?? 3);
  const timeoutMs    = parseInt(config.timeout_ms    ?? 30_000);

  // Resolve provider + model records
  const providerRecord = await repo.getProviderByCode(providerCode);
  if (!providerRecord?.enabled) throw Object.assign(new Error(`Provider "${providerCode}" is not enabled`), { status: 503 });

  const modelRecord = await repo.getModelByName(modelName, providerRecord.id)
    || await repo.getDefaultModel(providerRecord.id);
  if (!modelRecord) throw Object.assign(new Error(`No active model found for provider "${providerCode}"`), { status: 503 });

  // Quota gate
  await checkQuota(workspaceId, config);

  // Get provider adapter
  const provider = registry.get(providerCode);
  if (!provider.isConfigured()) throw Object.assign(new Error(`Provider "${providerCode}" API key not configured`), { status: 503 });

  // Execute with retry + exponential backoff
  const start = Date.now();
  let result;
  let usedProviderCode   = providerCode;
  let usedProviderRecord = providerRecord;
  let usedModelRecord    = modelRecord;

  const structured = options.structured === true;

  async function tryProvider(pCode, pRecord, mRecord, retries) {
    const adapter = registry.get(pCode);
    if (!adapter.isConfigured()) throw Object.assign(new Error(`Provider "${pCode}" API key not configured`), { status: 503 });
    let lastErr;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        if (structured && typeof adapter.generateStructuredOutput === 'function') {
          const out = await withTimeout(
            adapter.generateStructuredOutput({ messages, model: mRecord.modelName, maxTokens }),
            timeoutMs,
          );
          // Normalise to the same shape as generateText so callers don't need to branch
          return { text: JSON.stringify(out.data), tokensInput: out.tokensInput, tokensOutput: out.tokensOutput };
        }
        return await withTimeout(
          adapter.generateText({ messages, model: mRecord.modelName, temperature, maxTokens }),
          timeoutMs,
        );
      } catch (err) {
        lastErr = err;
        if (!isRetryable(err) || attempt === retries) throw err;
        await sleep(Math.pow(2, attempt) * 500);
      }
    }
    throw lastErr;
  }

  try {
    result = await tryProvider(providerCode, providerRecord, modelRecord, maxRetries);
  } catch (primaryErr) {
    // Quota errors should not fall back — propagate immediately
    if (primaryErr.code === 'QUOTA_EXCEEDED') throw primaryErr;

    const backupCode = config.backup_provider;
    if (backupCode && backupCode !== providerCode) {
      try {
        const backupRecord = await repo.getProviderByCode(backupCode);
        if (backupRecord?.enabled) {
          const backupModel = await repo.getDefaultModel(backupRecord.id);
          if (backupModel) {
            result             = await tryProvider(backupCode, backupRecord, backupModel, 1);
            usedProviderCode   = backupCode;
            usedProviderRecord = backupRecord;
            usedModelRecord    = backupModel;
          }
        }
      } catch {
        // backup also failed — throw the original primary error
        throw primaryErr;
      }
    } else {
      throw primaryErr;
    }
  }

  const durationMs = Date.now() - start;

  // Cost calculation
  const cost = (
    ((result.tokensInput  || 0) / 1000) * (usedModelRecord.inputCostPer1k  || 0) +
    ((result.tokensOutput || 0) / 1000) * (usedModelRecord.outputCostPer1k || 0)
  );

  // Log usage (non-blocking)
  repo.logUsage({
    workspaceId,
    userId: userId || null,
    providerId:    usedProviderRecord.id,
    modelId:       usedModelRecord.id,
    feature,
    tokensInput:   result.tokensInput  || 0,
    tokensOutput:  result.tokensOutput || 0,
    estimatedCost: cost,
    durationMs,
    success:       true,
  }).catch(() => {});

  return {
    success:      true,
    provider:     usedProviderCode,
    model:        usedModelRecord.modelName,
    response:     result.text,
    tokensInput:  result.tokensInput  || 0,
    tokensOutput: result.tokensOutput || 0,
    cost,
    durationMs,
  };
}

// ── Streaming execute ─────────────────────────────────────────────────────────

async function *executeStream({ workspaceId, userId, feature, messages, options = {} }) {
  const config = await getConfig();

  const providerCode = options.provider || config.default_provider || 'gemini';
  const modelName    = options.model    || config.default_model    || 'gemini-2.0-flash';
  const temperature  = parseFloat(options.temperature ?? config.temperature ?? 0.7);
  const maxTokens    = parseInt(options.maxTokens    ?? config.max_tokens    ?? 1000);

  const providerRecord = await repo.getProviderByCode(providerCode);
  if (!providerRecord?.enabled) throw Object.assign(new Error(`Provider "${providerCode}" is not enabled`), { status: 503 });

  const modelRecord = await repo.getModelByName(modelName, providerRecord.id)
    || await repo.getDefaultModel(providerRecord.id);
  if (!modelRecord) throw Object.assign(new Error(`No active model found for provider "${providerCode}"`), { status: 503 });

  await checkQuota(workspaceId, config);

  const provider = registry.get(providerCode);
  if (!provider.isConfigured()) throw Object.assign(new Error(`Provider "${providerCode}" API key not configured`), { status: 503 });

  const start = Date.now();
  let tokensInput = 0, tokensOutput = 0;

  for await (const chunk of provider.generateStream({ messages, model: modelRecord.modelName, temperature, maxTokens })) {
    if (chunk.done) {
      tokensInput  = chunk.tokensInput;
      tokensOutput = chunk.tokensOutput;
    } else if (chunk.text) {
      yield { type: 'chunk', text: chunk.text };
    }
  }

  const durationMs = Date.now() - start;
  const cost = (
    ((tokensInput  || 0) / 1000) * (modelRecord.inputCostPer1k  || 0) +
    ((tokensOutput || 0) / 1000) * (modelRecord.outputCostPer1k || 0)
  );

  repo.logUsage({
    workspaceId, userId: userId || null,
    providerId: providerRecord.id, modelId: modelRecord.id,
    feature, tokensInput, tokensOutput, estimatedCost: cost, durationMs, success: true,
  }).catch(() => {});

  yield { type: 'done', provider: providerCode, model: modelRecord.modelName, tokensInput, tokensOutput, cost, durationMs };
}

// ── Admin helpers ─────────────────────────────────────────────────────────────

async function runHealthChecks() {
  const providers = await repo.listProviders();
  const results = [];

  for (const p of providers) {
    try {
      const adapter = registry.get(p.code);
      const check   = await adapter.healthCheck();
      await repo.recordHealthCheck({ providerId: p.id, ...check });
      await repo.updateProvider(p.id, { status: check.status });
      results.push({ provider: p.code, ...check });
    } catch (err) {
      const check = { status: 'down', responseTimeMs: null, message: err.message };
      await repo.recordHealthCheck({ providerId: p.id, ...check });
      await repo.updateProvider(p.id, { status: 'down' });
      results.push({ provider: p.code, ...check });
    }
  }

  return results;
}

async function getHealthSummary() {
  const [latest, providers] = await Promise.all([
    repo.getLatestHealthChecks(),
    repo.listProviders(),
  ]);
  const map = Object.fromEntries(latest.map((h) => [h.provider_id, h]));
  return providers.map((p) => ({
    id: p.id, code: p.code, name: p.name, enabled: p.enabled,
    status:         p.status,
    responseTimeMs: map[p.id]?.response_time_ms ?? null,
    lastChecked:    map[p.id]?.created_at       ?? null,
    message:        map[p.id]?.message          ?? null,
  }));
}

async function getUsageDashboard({ workspaceId, since } = {}) {
  const sinceDate = since || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const stats = await repo.getUsageStats({ workspaceId, since: sinceDate });

  // Feature breakdown from last 30 days
  const breakdown = await require('../../lib/prisma').aiRequestLog.groupBy({
    by: ['feature'],
    where: { ...(workspaceId ? { workspaceId } : {}), createdAt: { gte: new Date(sinceDate) } },
    _count: { id: true },
    _sum:   { estimatedCost: true, tokensInput: true, tokensOutput: true },
    orderBy: { _count: { id: 'desc' } },
    take: 10,
  });

  return { ...stats, featureBreakdown: breakdown };
}

async function getCostDashboard() {
  const prisma = require('../../lib/prisma');
  const now   = new Date();
  const today = now.toISOString().slice(0, 10);
  const month = now.toISOString().slice(0, 7);

  const [daily, monthly, byProvider] = await Promise.all([
    prisma.aiRequestLog.aggregate({ where: { createdAt: { gte: new Date(today) } }, _sum: { estimatedCost: true }, _count: { id: true } }),
    prisma.aiRequestLog.aggregate({ where: { createdAt: { gte: new Date(`${month}-01`) } }, _sum: { estimatedCost: true }, _count: { id: true } }),
    prisma.aiRequestLog.groupBy({
      by: ['providerId'],
      where: { createdAt: { gte: new Date(`${month}-01`) } },
      _sum: { estimatedCost: true },
      _count: { id: true },
    }),
  ]);

  const providers = await repo.listProviders();
  const providerMap = Object.fromEntries(providers.map((p) => [p.id, p.name]));

  return {
    today:   { cost: daily._sum.estimatedCost || 0, requests: daily._count.id },
    monthly: { cost: monthly._sum.estimatedCost || 0, requests: monthly._count.id },
    byProvider: byProvider.map((r) => ({
      provider: providerMap[r.providerId] || r.providerId,
      cost:     r._sum.estimatedCost || 0,
      requests: r._count.id,
    })),
  };
}

module.exports = {
  execute, executeStream, getConfig, invalidateConfigCache,
  runHealthChecks, getHealthSummary,
  getUsageDashboard, getCostDashboard,
};
