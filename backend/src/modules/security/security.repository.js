const prisma = require('../../lib/prisma');
const { DEFAULT_RULES } = require('../../lib/securityRules');

// ---------- Seeding ----------
async function seedDefaultRules() {
  const existing = await prisma.securityRule.count({ where: { workspaceId: null } });
  if (existing > 0) return;
  await prisma.securityRule.createMany({ data: DEFAULT_RULES.map((r) => ({ ...r, workspaceId: null })) });
  console.log(`[SecurityRules] seeded ${DEFAULT_RULES.length} default rules`);
}

// ---------- Dashboard ----------
async function getDashboard(workspaceId) {
  const [
    totalAlerts,
    activeAlerts,
    alertsBySeverity,
    recentAlerts,
    recentEvents,
    riskTrend,
  ] = await Promise.all([
    prisma.securityAlert.count({ where: { workspaceId } }),
    prisma.securityAlert.count({ where: { workspaceId, status: { in: ['new', 'acknowledged', 'investigating'] } } }),
    prisma.securityAlert.groupBy({
      by: ['severity'],
      where: { workspaceId, status: { in: ['new', 'acknowledged', 'investigating'] } },
      _count: true,
    }),
    prisma.securityAlert.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
    prisma.securityEvent.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
    // Last 7 days risk score sum per day
    prisma.$queryRaw`
      SELECT DATE(created_at) as day, SUM(risk_score) as total_risk, COUNT(*) as event_count
      FROM security_events
      WHERE workspace_id = ${workspaceId}::uuid
        AND created_at >= NOW() - INTERVAL '7 days'
      GROUP BY DATE(created_at)
      ORDER BY day ASC
    `,
  ]);

  const bySeverity = { info: 0, low: 0, medium: 0, high: 0, critical: 0 };
  alertsBySeverity.forEach((r) => { bySeverity[r.severity] = r._count; });

  return { totalAlerts, activeAlerts, bySeverity, recentAlerts, recentEvents, riskTrend };
}

// ---------- Alerts ----------
async function listAlerts(workspaceId, { status, severity, page = 1, limit = 50 } = {}) {
  const where = { workspaceId };
  if (status)   where.status   = status;
  if (severity) where.severity = severity;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);
  const [items, total] = await Promise.all([
    prisma.securityAlert.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take }),
    prisma.securityAlert.count({ where }),
  ]);
  return { items, total, page: parseInt(page), limit: take };
}

async function getAlert(id, workspaceId) {
  return prisma.securityAlert.findFirst({ where: { id, workspaceId } });
}

async function updateAlertStatus(id, workspaceId, status, notes) {
  const data = { status };
  if (notes !== undefined) data.notes = notes;
  if (['resolved', 'dismissed', 'false_positive'].includes(status)) data.resolvedAt = new Date();
  return prisma.securityAlert.updateMany({ where: { id, workspaceId }, data });
}

async function getAlertContext(alert) {
  const [relatedEvents, relatedActivity] = await Promise.all([
    prisma.securityEvent.findMany({
      where: {
        workspaceId: alert.workspaceId,
        eventType: alert.alertType ? undefined : undefined,
        ...(alert.userId ? { userId: alert.userId } : {}),
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
    prisma.activityLog.findMany({
      where: {
        workspaceId: alert.workspaceId,
        ...(alert.userId ? { userId: alert.userId } : {}),
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
  ]);
  return { relatedEvents, relatedActivity };
}

// ---------- Events ----------
async function listEvents(workspaceId, { category, severity, page = 1, limit = 50 } = {}) {
  const where = { workspaceId };
  if (category) where.category = category;
  if (severity) where.severity = severity;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);
  const [items, total] = await Promise.all([
    prisma.securityEvent.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take }),
    prisma.securityEvent.count({ where }),
  ]);
  return { items, total, page: parseInt(page), limit: take };
}

// ---------- Rules ----------
async function listRules(workspaceId) {
  return prisma.securityRule.findMany({
    where: { OR: [{ workspaceId }, { workspaceId: null }] },
    orderBy: [{ severity: 'asc' }, { ruleName: 'asc' }],
  });
}

async function toggleRule(id, enabled) {
  return prisma.securityRule.update({ where: { id }, data: { enabled } });
}

async function updateRule(id, data) {
  const { threshold, windowMins, riskScore, severity, enabled } = data;
  const update = {};
  if (threshold  !== undefined) update.threshold  = parseInt(threshold);
  if (windowMins !== undefined) update.windowMins = parseInt(windowMins);
  if (riskScore  !== undefined) update.riskScore  = parseInt(riskScore);
  if (severity   !== undefined) update.severity   = severity;
  if (enabled    !== undefined) update.enabled    = Boolean(enabled);
  return prisma.securityRule.update({ where: { id }, data: update });
}

module.exports = {
  seedDefaultRules,
  getDashboard,
  listAlerts, getAlert, updateAlertStatus, getAlertContext,
  listEvents,
  listRules, toggleRule, updateRule,
};
