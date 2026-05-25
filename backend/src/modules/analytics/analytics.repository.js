const prisma = require('../../lib/prisma');

async function saveSnapshot(workspaceId, metricsJson) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return prisma.analyticsSnapshot.upsert({
    where: { workspaceId_snapshotDate: { workspaceId, snapshotDate: today } },
    create: { workspaceId, snapshotDate: today, metricsJson },
    update: { metricsJson },
  });
}

async function getLatestSnapshot(workspaceId) {
  return prisma.analyticsSnapshot.findFirst({
    where: { workspaceId },
    orderBy: { snapshotDate: 'desc' },
  });
}

async function saveForecast(workspaceId, forecastType, forecastPeriod, forecastJson, confidenceScore) {
  return prisma.forecast.create({
    data: { workspaceId, forecastType, forecastPeriod, forecastJson, confidenceScore },
  });
}

async function saveHealthScore(workspaceId, score, categoryScores) {
  return prisma.businessHealthScore.create({
    data: { workspaceId, score, categoryScores },
  });
}

async function getLatestHealthScore(workspaceId) {
  return prisma.businessHealthScore.findFirst({
    where: { workspaceId },
    orderBy: { createdAt: 'desc' },
  });
}

async function saveInsights(workspaceId, insights) {
  if (!insights.length) return;
  return prisma.aiInsight.createMany({
    data: insights.map((ins) => ({ workspaceId, ...ins })),
  });
}

async function listInsights(workspaceId, { category, status, limit = 50 } = {}) {
  return prisma.aiInsight.findMany({
    where: {
      workspaceId,
      ...(category ? { category } : {}),
      ...(status ? { status } : { status: { not: 'dismissed' } }),
    },
    orderBy: [{ severity: 'desc' }, { createdAt: 'desc' }],
    take: limit,
  });
}

async function dismissInsight(workspaceId, id) {
  return prisma.aiInsight.updateMany({
    where: { id, workspaceId },
    data: { status: 'dismissed' },
  });
}

async function saveRiskAlerts(workspaceId, alerts) {
  if (!alerts.length) return;
  const types = [...new Set(alerts.map((a) => a.riskType))];
  await prisma.riskAlert.updateMany({
    where: { workspaceId, riskType: { in: types }, status: 'active' },
    data: { status: 'superseded' },
  });
  return prisma.riskAlert.createMany({
    data: alerts.map((a) => ({ workspaceId, ...a })),
  });
}

async function listRiskAlerts(workspaceId) {
  return prisma.riskAlert.findMany({
    where: { workspaceId, status: 'active' },
    orderBy: [{ severity: 'asc' }, { createdAt: 'desc' }],
  });
}

async function dismissRiskAlert(workspaceId, id) {
  return prisma.riskAlert.updateMany({
    where: { id, workspaceId },
    data: { status: 'dismissed' },
  });
}

async function clearOldInsights(workspaceId) {
  const cutoff = new Date(Date.now() - 7 * 86400000);
  return prisma.aiInsight.deleteMany({
    where: { workspaceId, status: { not: 'dismissed' }, createdAt: { lt: cutoff } },
  });
}

module.exports = {
  saveSnapshot, getLatestSnapshot,
  saveForecast,
  saveHealthScore, getLatestHealthScore,
  saveInsights, listInsights, dismissInsight,
  saveRiskAlerts, listRiskAlerts, dismissRiskAlert,
  clearOldInsights,
};
