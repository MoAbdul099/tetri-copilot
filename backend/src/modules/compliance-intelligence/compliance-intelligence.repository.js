const prisma = require('../../lib/prisma');

async function saveHealthScore(workspaceId, { score, status, factors }) {
  return prisma.complianceHealthScore.create({
    data: { workspaceId, score, status, factors },
  });
}

async function getLatestHealthScore(workspaceId) {
  return prisma.complianceHealthScore.findFirst({
    where: { workspaceId },
    orderBy: { calculatedAt: 'desc' },
  });
}

async function getHealthScoreHistory(workspaceId, limit = 10) {
  return prisma.complianceHealthScore.findMany({
    where: { workspaceId },
    orderBy: { calculatedAt: 'desc' },
    take: limit,
  });
}

async function replaceRisks(workspaceId, risks) {
  await prisma.complianceRisk.deleteMany({ where: { workspaceId, status: 'open' } });
  if (!risks.length) return [];
  return prisma.$transaction(
    risks.map(r => prisma.complianceRisk.create({ data: { workspaceId, ...r } }))
  );
}

async function listRisks(workspaceId, { severity, status = 'open', page = 1, pageSize = 50 } = {}) {
  const where = { workspaceId, status };
  if (severity) where.severity = severity;
  const [items, total] = await Promise.all([
    prisma.complianceRisk.findMany({
      where,
      orderBy: [{ severity: 'asc' }, { detectedAt: 'desc' }],
      take: parseInt(pageSize),
      skip: (parseInt(page) - 1) * parseInt(pageSize),
    }),
    prisma.complianceRisk.count({ where }),
  ]);
  return { items, total };
}

async function replaceRecommendations(workspaceId, recs) {
  await prisma.complianceRecommendation.deleteMany({ where: { workspaceId } });
  if (!recs.length) return [];
  return prisma.$transaction(
    recs.map(r => prisma.complianceRecommendation.create({ data: { workspaceId, ...r } }))
  );
}

async function listRecommendations(workspaceId) {
  return prisma.complianceRecommendation.findMany({
    where: { workspaceId },
    orderBy: [{ priority: 'asc' }, { createdAt: 'desc' }],
  });
}

async function saveSnapshot(workspaceId, { summary, score, riskCount, insights }) {
  return prisma.complianceIntelligenceSnapshot.create({
    data: { workspaceId, summary, score, riskCount, insights },
  });
}

async function getLatestSnapshot(workspaceId) {
  return prisma.complianceIntelligenceSnapshot.findFirst({
    where: { workspaceId },
    orderBy: { createdAt: 'desc' },
  });
}

async function listSnapshots(workspaceId, limit = 12) {
  return prisma.complianceIntelligenceSnapshot.findMany({
    where: { workspaceId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: { id: true, score: true, riskCount: true, createdAt: true },
  });
}

module.exports = {
  saveHealthScore,
  getLatestHealthScore,
  getHealthScoreHistory,
  replaceRisks,
  listRisks,
  replaceRecommendations,
  listRecommendations,
  saveSnapshot,
  getLatestSnapshot,
  listSnapshots,
};
