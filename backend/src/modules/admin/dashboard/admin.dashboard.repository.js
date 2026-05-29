const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function startOf(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfMonth() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

async function getOverview() {
  const [
    totalOrgs, activeOrgs, suspendedOrgs, newOrgsMonth,
    totalUsers, activeUsers, newUsersMonth,
    activeSubs, trialSubs, expiredSubs,
  ] = await Promise.all([
    prisma.workspace.count(),
    prisma.workspace.count({ where: { status: 'active' } }),
    prisma.workspace.count({ where: { status: { in: ['suspended', 'inactive'] } } }),
    prisma.workspace.count({ where: { createdAt: { gte: startOfMonth() } } }),
    prisma.user.count(),
    prisma.user.count({ where: { status: 'active' } }),
    prisma.user.count({ where: { createdAt: { gte: startOfMonth() } } }),
    prisma.subscription.count({ where: { status: 'active' } }),
    prisma.subscription.count({ where: { status: 'trialing' } }),
    prisma.subscription.count({ where: { status: { in: ['cancelled', 'expired'] } } }),
  ]);
  return { totalOrgs, activeOrgs, suspendedOrgs, newOrgsMonth, totalUsers, activeUsers, newUsersMonth, activeSubs, trialSubs, expiredSubs };
}

async function getOrganizationMetrics() {
  const [total, active, suspended, newThisMonth, byCountry, byPlan] = await Promise.all([
    prisma.workspace.count(),
    prisma.workspace.count({ where: { status: 'active' } }),
    prisma.workspace.count({ where: { status: { in: ['suspended', 'inactive'] } } }),
    prisma.workspace.count({ where: { createdAt: { gte: startOfMonth() } } }),

    // By country — via company → jurisdiction
    prisma.company.groupBy({
      by: ['jurisdictionId'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    }).then(async (rows) => {
      const ids = rows.map((r) => r.jurisdictionId).filter(Boolean);
      const profiles = ids.length
        ? await prisma.countryProfile.findMany({ where: { id: { in: ids } }, select: { id: true, countryName: true } })
        : [];
      const map = Object.fromEntries(profiles.map((p) => [p.id, p.countryName]));
      return rows.map((r) => ({ country: map[r.jurisdictionId] || 'Unknown', count: r._count.id }));
    }),

    // By plan
    prisma.subscription.groupBy({
      by: ['planId'],
      _count: { id: true },
      where: { status: { in: ['active', 'trialing'] } },
    }).then(async (rows) => {
      const ids = rows.map((r) => r.planId);
      const plans = await prisma.plan.findMany({ where: { id: { in: ids } }, select: { id: true, name: true } });
      const map = Object.fromEntries(plans.map((p) => [p.id, p.name]));
      return rows
        .map((r) => ({ plan: map[r.planId] || r.planId, count: r._count.id }))
        .sort((a, b) => b.count - a.count);
    }),
  ]);

  // Growth: orgs per month for last 6 months
  const growth = await getMonthlyGrowth('workspace');

  return { total, active, suspended, newThisMonth, byCountry, byPlan, growth };
}

async function getUserMetrics() {
  const [total, active, inactive, newThisMonth, growth] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { status: 'active' } }),
    prisma.user.count({ where: { status: { not: 'active' } } }),
    prisma.user.count({ where: { createdAt: { gte: startOfMonth() } } }),
    getMonthlyGrowth('user'),
  ]);
  return { total, active, inactive, newThisMonth, growth };
}

async function getSubscriptionMetrics() {
  const [active, trialing, cancelled, expired, pastDue] = await Promise.all([
    prisma.subscription.count({ where: { status: 'active' } }),
    prisma.subscription.count({ where: { status: 'trialing' } }),
    prisma.subscription.count({ where: { status: 'cancelled' } }),
    prisma.subscription.count({ where: { status: 'expired' } }),
    prisma.subscription.count({ where: { status: 'past_due' } }),
  ]);

  const byPlan = await prisma.subscription.groupBy({
    by: ['planId', 'status'],
    _count: { id: true },
  }).then(async (rows) => {
    const ids = [...new Set(rows.map((r) => r.planId))];
    const plans = await prisma.plan.findMany({ where: { id: { in: ids } }, select: { id: true, name: true, monthlyPriceUsd: true } });
    const map = Object.fromEntries(plans.map((p) => [p.id, p]));
    return rows.map((r) => ({
      plan: map[r.planId]?.name || 'Unknown',
      price: Number(map[r.planId]?.monthlyPriceUsd || 0),
      status: r.status,
      count: r._count.id,
    }));
  });

  // Estimated MRR: active subs × monthly price
  const activeSubs = await prisma.subscription.findMany({
    where: { status: 'active' },
    select: { planId: true },
  });
  const plans = await prisma.plan.findMany({ select: { id: true, monthlyPriceUsd: true } });
  const priceMap = Object.fromEntries(plans.map((p) => [p.id, Number(p.monthlyPriceUsd)]));
  const mrr = activeSubs.reduce((sum, s) => sum + (priceMap[s.planId] || 0), 0);

  return { active, trialing, cancelled, expired, pastDue, byPlan, estimatedMrr: mrr };
}

async function getAiMetrics() {
  const since30d = startOf(30);
  const [total30d, totalAllTime, tokenAgg, costAgg, byWorkspace] = await Promise.all([
    prisma.aiUsageLog.count({ where: { createdAt: { gte: since30d } } }),
    prisma.aiUsageLog.count(),
    prisma.aiUsageLog.aggregate({ _sum: { totalTokens: true, inputTokens: true, outputTokens: true } }),
    prisma.aiUsageLog.aggregate({ _sum: { estimatedCostUsd: true } }),
    prisma.aiUsageLog.groupBy({
      by: ['workspaceId'],
      _count: { id: true },
      _sum: { totalTokens: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    }).then(async (rows) => {
      const ids = rows.map((r) => r.workspaceId);
      const workspaces = await prisma.workspace.findMany({ where: { id: { in: ids } }, select: { id: true, name: true } });
      const map = Object.fromEntries(workspaces.map((w) => [w.id, w.name]));
      return rows.map((r) => ({
        workspace: map[r.workspaceId] || 'Unknown',
        requests: r._count.id,
        tokens: r._sum.totalTokens || 0,
      }));
    }),
  ]);

  return {
    total30d,
    totalAllTime,
    totalTokens: tokenAgg._sum.totalTokens || 0,
    estimatedCostUsd: Number(costAgg._sum.estimatedCostUsd || 0).toFixed(4),
    byWorkspace,
  };
}

async function getComplianceMetrics() {
  const now = new Date();
  const in30d = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const [total, completed, overdue, upcomingNext30] = await Promise.all([
    prisma.complianceOccurrence.count(),
    prisma.complianceOccurrence.count({ where: { status: { in: ['submitted', 'approved', 'closed'] } } }),
    prisma.complianceOccurrence.count({ where: { dueDate: { lt: now }, status: { notIn: ['submitted', 'approved', 'closed', 'waived'] } } }),
    prisma.complianceOccurrence.count({ where: { dueDate: { gte: now, lte: in30d }, status: { notIn: ['submitted', 'approved', 'closed', 'waived'] } } }),
  ]);

  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  return { total, completed, overdue, upcomingNext30, completionRate };
}

async function getStorageMetrics() {
  const [totalFiles, agg] = await Promise.all([
    prisma.file.count({ where: { isDeleted: false } }),
    prisma.file.aggregate({ where: { isDeleted: false }, _sum: { fileSizeBytes: true } }),
  ]);

  const totalBytes = Number(agg._sum.fileSizeBytes || 0);
  const totalMb = (totalBytes / (1024 * 1024)).toFixed(2);
  const totalGb = (totalBytes / (1024 * 1024 * 1024)).toFixed(3);

  const byWorkspace = await prisma.file.groupBy({
    by: ['workspaceId'],
    where: { isDeleted: false },
    _count: { id: true },
    _sum: { fileSizeBytes: true },
    orderBy: { _sum: { fileSizeBytes: 'desc' } },
    take: 10,
  }).then(async (rows) => {
    const ids = rows.map((r) => r.workspaceId);
    const workspaces = await prisma.workspace.findMany({ where: { id: { in: ids } }, select: { id: true, name: true } });
    const map = Object.fromEntries(workspaces.map((w) => [w.id, w.name]));
    return rows.map((r) => ({
      workspace: map[r.workspaceId] || 'Unknown',
      files: r._count.id,
      mb: (Number(r._sum.fileSizeBytes || 0) / (1024 * 1024)).toFixed(2),
    }));
  });

  return { totalFiles, totalMb, totalGb, byWorkspace };
}

async function getActivityFeed(limit = 20) {
  const logs = await prisma.adminActivityLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: { admin: { select: { email: true, firstName: true, lastName: true } } },
  });
  return logs.map((l) => ({
    id: l.id,
    action: l.action,
    entityType: l.entityType,
    entityId: l.entityId,
    ipAddress: l.ipAddress,
    adminEmail: l.admin.email,
    adminName: `${l.admin.firstName} ${l.admin.lastName}`,
    createdAt: l.createdAt,
  }));
}

async function getMonthlyGrowth(model) {
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    const start = new Date(d.getFullYear(), d.getMonth() - i, 1);
    const end = new Date(d.getFullYear(), d.getMonth() - i + 1, 1);
    const count = await prisma[model].count({ where: { createdAt: { gte: start, lt: end } } });
    months.push({
      month: start.toLocaleString('en-US', { month: 'short', year: '2-digit' }),
      count,
    });
  }
  return months;
}

async function getExportData() {
  const [orgs, users, subs] = await Promise.all([
    prisma.workspace.findMany({
      select: { id: true, name: true, status: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 1000,
    }),
    prisma.user.findMany({
      select: { id: true, email: true, fullName: true, status: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 1000,
    }),
    prisma.subscription.findMany({
      select: { workspaceId: true, status: true, currentPeriodStart: true, currentPeriodEnd: true, createdAt: true },
      include: { plan: { select: { name: true, monthlyPriceUsd: true } } },
      orderBy: { createdAt: 'desc' },
      take: 1000,
    }),
  ]);
  return { orgs, users, subs };
}

module.exports = {
  getOverview, getOrganizationMetrics, getUserMetrics,
  getSubscriptionMetrics, getAiMetrics, getComplianceMetrics,
  getStorageMetrics, getActivityFeed, getExportData,
};
