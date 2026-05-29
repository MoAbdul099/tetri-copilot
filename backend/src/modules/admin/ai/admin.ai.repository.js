const prisma = require('../../../lib/prisma');

// ── Dashboard KPIs ────────────────────────────────────────────────────────────

async function getDashboard() {
  const now = new Date();
  const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0);
  const monthStart = new Date(now); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
  const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

  const [
    totalRequests,
    requestsToday,
    requestsThisMonth,
    costThisMonth,
    activeWorkspaces,
    activeUsers,
    errorRateResult,
    recentTrend,
  ] = await Promise.all([
    prisma.aiRequestLog.count(),
    prisma.aiRequestLog.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.aiRequestLog.count({ where: { createdAt: { gte: monthStart } } }),
    prisma.aiRequestLog.aggregate({
      where: { createdAt: { gte: monthStart } },
      _sum: { estimatedCost: true },
    }),
    prisma.aiRequestLog.groupBy({
      by: ['workspaceId'],
      where: { createdAt: { gte: thirtyDaysAgo } },
      _count: { id: true },
    }).then((r) => r.length),
    prisma.aiRequestLog.groupBy({
      by: ['userId'],
      where: { createdAt: { gte: thirtyDaysAgo }, userId: { not: null } },
      _count: { id: true },
    }).then((r) => r.length),
    prisma.aiRequestLog.aggregate({
      where: { createdAt: { gte: monthStart } },
      _count: { id: true },
    }).then(async (total) => {
      const errors = await prisma.aiRequestLog.count({ where: { createdAt: { gte: monthStart }, success: false } });
      return total._count.id > 0 ? ((errors / total._count.id) * 100).toFixed(1) : 0;
    }),
    // 7-day daily trend
    prisma.$queryRaw`
      SELECT DATE_TRUNC('day', created_at) AS day, COUNT(*) AS requests, SUM(estimated_cost) AS cost
      FROM ai_request_logs
      WHERE created_at >= NOW() - INTERVAL '7 days'
      GROUP BY 1 ORDER BY 1
    `,
  ]);

  return {
    totalRequests,
    requestsToday,
    requestsThisMonth,
    estimatedCostThisMonth: Number((costThisMonth._sum.estimatedCost || 0).toFixed(4)),
    activeWorkspaces,
    activeUsers,
    errorRateThisMonth: Number(errorRateResult),
    trend: recentTrend.map((r) => ({
      day: r.day,
      requests: Number(r.requests),
      cost: Number((r.cost || 0).toFixed(4)),
    })),
  };
}

// ── Workspace breakdown ───────────────────────────────────────────────────────

async function listWorkspaceUsage({ search = '', page = 1, limit = 20, period = '30d' } = {}) {
  const since = getSince(period);

  const rows = await prisma.$queryRaw`
    SELECT
      rl.workspace_id,
      w.name AS workspace_name,
      COUNT(rl.id)::int AS requests,
      SUM(rl.tokens_input + rl.tokens_output)::int AS tokens,
      SUM(rl.estimated_cost) AS cost,
      COUNT(DISTINCT rl.user_id)::int AS users,
      MAX(rl.created_at) AS last_activity,
      SUM(CASE WHEN rl.success = false THEN 1 ELSE 0 END)::int AS errors
    FROM ai_request_logs rl
    JOIN workspaces w ON w.id = rl.workspace_id
    WHERE rl.created_at >= ${since}
      AND (${search} = '' OR w.name ILIKE ${'%' + search + '%'})
    GROUP BY rl.workspace_id, w.name
    ORDER BY requests DESC
    LIMIT ${limit} OFFSET ${(page - 1) * limit}
  `;

  const countResult = await prisma.$queryRaw`
    SELECT COUNT(DISTINCT rl.workspace_id)::int AS total
    FROM ai_request_logs rl
    JOIN workspaces w ON w.id = rl.workspace_id
    WHERE rl.created_at >= ${since}
      AND (${search} = '' OR w.name ILIKE ${'%' + search + '%'})
  `;

  return {
    items: rows.map((r) => ({ ...r, cost: Number((r.cost || 0).toFixed(4)) })),
    total: Number(countResult[0]?.total || 0),
    page,
    limit,
  };
}

// ── User breakdown ────────────────────────────────────────────────────────────

async function listUserUsage({ search = '', page = 1, limit = 20, period = '30d' } = {}) {
  const since = getSince(period);

  const rows = await prisma.$queryRaw`
    SELECT
      rl.user_id,
      rl.workspace_id,
      w.name AS workspace_name,
      COUNT(rl.id)::int AS requests,
      SUM(rl.tokens_input + rl.tokens_output)::int AS tokens,
      SUM(rl.estimated_cost) AS cost,
      MAX(rl.created_at) AS last_activity,
      array_agg(DISTINCT rl.feature) AS features
    FROM ai_request_logs rl
    JOIN workspaces w ON w.id = rl.workspace_id
    WHERE rl.created_at >= ${since}
      AND rl.user_id IS NOT NULL
    GROUP BY rl.user_id, rl.workspace_id, w.name
    ORDER BY requests DESC
    LIMIT ${limit} OFFSET ${(page - 1) * limit}
  `;

  const countResult = await prisma.$queryRaw`
    SELECT COUNT(DISTINCT user_id)::int AS total
    FROM ai_request_logs
    WHERE created_at >= ${since} AND user_id IS NOT NULL
  `;

  return {
    items: rows.map((r) => ({ ...r, cost: Number((r.cost || 0).toFixed(4)) })),
    total: Number(countResult[0]?.total || 0),
    page,
    limit,
  };
}

// ── Provider analytics ────────────────────────────────────────────────────────

async function getProviderAnalytics({ period = '30d' } = {}) {
  const since = getSince(period);

  const rows = await prisma.$queryRaw`
    SELECT
      p.id AS provider_id,
      p.name AS provider_name,
      p.code AS provider_code,
      p.status,
      COUNT(rl.id)::int AS requests,
      SUM(rl.tokens_input)::int AS tokens_input,
      SUM(rl.tokens_output)::int AS tokens_output,
      SUM(rl.estimated_cost) AS cost,
      AVG(rl.duration_ms)::int AS avg_duration_ms,
      SUM(CASE WHEN rl.success = false THEN 1 ELSE 0 END)::int AS errors
    FROM ai_providers p
    LEFT JOIN ai_request_logs rl ON rl.provider_id = p.id AND rl.created_at >= ${since}
    GROUP BY p.id, p.name, p.code, p.status
    ORDER BY requests DESC
  `;

  return rows.map((r) => ({
    ...r,
    cost: Number((r.cost || 0).toFixed(4)),
    errorRate: r.requests > 0 ? Number(((r.errors / r.requests) * 100).toFixed(1)) : 0,
  }));
}

// ── Cost analytics ────────────────────────────────────────────────────────────

async function getCostAnalytics() {
  const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
  const yearStart = new Date(); yearStart.setMonth(0, 1); yearStart.setHours(0, 0, 0, 0);

  const [daily, monthly, byProvider, byWorkspace, byFeature] = await Promise.all([
    prisma.$queryRaw`
      SELECT DATE_TRUNC('day', created_at)::date AS date,
             COUNT(*)::int AS requests,
             SUM(estimated_cost) AS cost
      FROM ai_request_logs
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY 1 ORDER BY 1
    `,
    prisma.$queryRaw`
      SELECT DATE_TRUNC('month', created_at)::date AS month,
             COUNT(*)::int AS requests,
             SUM(estimated_cost) AS cost
      FROM ai_request_logs
      WHERE created_at >= ${yearStart}
      GROUP BY 1 ORDER BY 1
    `,
    prisma.$queryRaw`
      SELECT p.name AS provider, SUM(rl.estimated_cost) AS cost, COUNT(rl.id)::int AS requests
      FROM ai_request_logs rl
      JOIN ai_providers p ON p.id = rl.provider_id
      WHERE rl.created_at >= ${monthStart}
      GROUP BY p.name ORDER BY cost DESC
    `,
    prisma.$queryRaw`
      SELECT w.name AS workspace, SUM(rl.estimated_cost) AS cost, COUNT(rl.id)::int AS requests
      FROM ai_request_logs rl
      JOIN workspaces w ON w.id = rl.workspace_id
      WHERE rl.created_at >= ${monthStart}
      GROUP BY w.name ORDER BY cost DESC LIMIT 10
    `,
    prisma.$queryRaw`
      SELECT feature, SUM(estimated_cost) AS cost, COUNT(*)::int AS requests
      FROM ai_request_logs
      WHERE created_at >= ${monthStart}
      GROUP BY feature ORDER BY cost DESC LIMIT 10
    `,
  ]);

  const fmt = (n) => Number((n || 0).toFixed(4));

  return {
    daily: daily.map((r) => ({ date: r.date, requests: r.requests, cost: fmt(r.cost) })),
    monthly: monthly.map((r) => ({ month: r.month, requests: r.requests, cost: fmt(r.cost) })),
    byProvider: byProvider.map((r) => ({ provider: r.provider, cost: fmt(r.cost), requests: r.requests })),
    byWorkspace: byWorkspace.map((r) => ({ workspace: r.workspace, cost: fmt(r.cost), requests: r.requests })),
    byFeature: byFeature.map((r) => ({ feature: r.feature, cost: fmt(r.cost), requests: r.requests })),
  };
}

// ── Quota rules ───────────────────────────────────────────────────────────────

async function listQuotas() {
  return prisma.aiQuotaRule.findMany({ orderBy: [{ scope: 'asc' }, { createdAt: 'asc' }] });
}

async function upsertQuota(data) {
  const { scope, scopeId = null, ...rest } = data;
  const existing = await prisma.aiQuotaRule.findFirst({ where: { scope, scopeId } });
  if (existing) {
    return prisma.aiQuotaRule.update({ where: { id: existing.id }, data: rest });
  }
  return prisma.aiQuotaRule.create({ data: { scope, scopeId, ...rest } });
}

async function deleteQuota(id) {
  return prisma.aiQuotaRule.delete({ where: { id } });
}

// ── Abuse detection ───────────────────────────────────────────────────────────

async function getAbuseAlerts() {
  const h24 = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [topWorkspaces, topUsers, errorSpikes] = await Promise.all([
    prisma.$queryRaw`
      SELECT rl.workspace_id, w.name AS workspace_name,
             COUNT(rl.id)::int AS requests_24h
      FROM ai_request_logs rl
      JOIN workspaces w ON w.id = rl.workspace_id
      WHERE rl.created_at >= ${h24}
      GROUP BY rl.workspace_id, w.name
      ORDER BY requests_24h DESC LIMIT 5
    `,
    prisma.$queryRaw`
      SELECT rl.user_id, rl.workspace_id, w.name AS workspace_name,
             COUNT(rl.id)::int AS requests_24h
      FROM ai_request_logs rl
      JOIN workspaces w ON w.id = rl.workspace_id
      WHERE rl.created_at >= ${h24} AND rl.user_id IS NOT NULL
      GROUP BY rl.user_id, rl.workspace_id, w.name
      ORDER BY requests_24h DESC LIMIT 5
    `,
    prisma.$queryRaw`
      SELECT rl.workspace_id, w.name AS workspace_name,
             COUNT(rl.id)::int AS total,
             SUM(CASE WHEN rl.success = false THEN 1 ELSE 0 END)::int AS errors
      FROM ai_request_logs rl
      JOIN workspaces w ON w.id = rl.workspace_id
      WHERE rl.created_at >= ${h24}
      GROUP BY rl.workspace_id, w.name
      HAVING COUNT(rl.id) > 0
      ORDER BY (SUM(CASE WHEN rl.success = false THEN 1 ELSE 0 END)::float / COUNT(rl.id)) DESC
      LIMIT 5
    `,
  ]);

  const platformQuota = await prisma.aiQuotaRule.findFirst({ where: { scope: 'platform', scopeId: null } });
  const dailyLimit = platformQuota?.dailyRequests;

  const alerts = [];
  for (const w of topWorkspaces) {
    if (dailyLimit && w.requests_24h > dailyLimit * 0.8) {
      alerts.push({ type: 'quota_warning', workspaceName: w.workspace_name, workspaceId: w.workspace_id, value: w.requests_24h, limit: dailyLimit, message: `${w.workspace_name} used ${w.requests_24h} of ${dailyLimit} daily requests` });
    }
  }
  for (const e of errorSpikes) {
    const rate = e.total > 0 ? (e.errors / e.total) * 100 : 0;
    if (rate > 20 && e.total >= 5) {
      alerts.push({ type: 'error_spike', workspaceName: e.workspace_name, workspaceId: e.workspace_id, value: rate.toFixed(1), message: `${e.workspace_name} has ${rate.toFixed(1)}% error rate in last 24h (${e.errors}/${e.total})` });
    }
  }

  return {
    alerts,
    topWorkspaces24h: topWorkspaces,
    topUsers24h: topUsers,
  };
}

// ── Request log history ───────────────────────────────────────────────────────

async function listLogs({ workspaceId, providerId, feature, success, page = 1, limit = 50 } = {}) {
  const where = {};
  if (workspaceId) where.workspaceId = workspaceId;
  if (providerId) where.providerId = providerId;
  if (feature) where.feature = { contains: feature, mode: 'insensitive' };
  if (success !== undefined && success !== '') where.success = success === 'true' || success === true;

  const [items, total] = await Promise.all([
    prisma.aiRequestLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: Number(limit),
      skip: (Number(page) - 1) * Number(limit),
      include: {
        provider: { select: { name: true, code: true } },
        model:    { select: { modelName: true } },
      },
    }),
    prisma.aiRequestLog.count({ where }),
  ]);

  return { items, total, page: Number(page), limit: Number(limit) };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getSince(period) {
  const now = new Date();
  switch (period) {
    case '7d':  return new Date(now - 7  * 24 * 60 * 60 * 1000);
    case '30d': return new Date(now - 30 * 24 * 60 * 60 * 1000);
    case '90d': return new Date(now - 90 * 24 * 60 * 60 * 1000);
    default:    return new Date(now - 30 * 24 * 60 * 60 * 1000);
  }
}

module.exports = {
  getDashboard,
  listWorkspaceUsage,
  listUserUsage,
  getProviderAnalytics,
  getCostAnalytics,
  listQuotas,
  upsertQuota,
  deleteQuota,
  getAbuseAlerts,
  listLogs,
};
