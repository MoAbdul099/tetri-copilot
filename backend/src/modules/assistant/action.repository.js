const prisma = require('../../lib/prisma');

async function logAction({ workspaceId, sessionId, messageId, userId, actionCode, actionName, actionCategory, status, executionMs, recordsRetrieved, metadata }) {
  return prisma.aiActionLog.create({
    data: {
      workspaceId,
      sessionId:       sessionId       || null,
      messageId:       messageId       || null,
      userId,
      actionCode,
      actionName,
      actionCategory,
      status:          status          || 'success',
      executionMs:     executionMs     || 0,
      recordsRetrieved: recordsRetrieved || 0,
      metadata:        metadata        || null,
    },
  });
}

async function getActionHistory(workspaceId, limit = 50) {
  return prisma.aiActionLog.findMany({
    where:   { workspaceId },
    orderBy: { createdAt: 'desc' },
    take:    parseInt(limit),
    select:  { id: true, actionCode: true, actionName: true, actionCategory: true, status: true, executionMs: true, recordsRetrieved: true, createdAt: true },
  });
}

async function getActionMetrics(workspaceId) {
  const [total, byCategory, avgDuration] = await Promise.all([
    prisma.aiActionLog.count({ where: { workspaceId } }),
    prisma.aiActionLog.groupBy({ by: ['actionCategory'], where: { workspaceId }, _count: { id: true }, orderBy: { _count: { id: 'desc' } } }),
    prisma.aiActionLog.aggregate({ where: { workspaceId, status: 'success' }, _avg: { executionMs: true } }),
  ]);
  return { total, byCategory, avgDurationMs: Math.round(avgDuration._avg.executionMs || 0) };
}

async function saveRecommendations(workspaceId, recs) {
  // Expire old active recommendations for this workspace
  await prisma.aiRecommendation.updateMany({
    where: { workspaceId, status: 'active' },
    data:  { status: 'expired' },
  });

  if (!recs.length) return [];

  const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 h TTL
  return prisma.$transaction(
    recs.map((r) =>
      prisma.aiRecommendation.create({
        data: {
          workspaceId,
          category:      r.category,
          priority:      r.priority,
          title:         r.title,
          body:          r.body,
          actionHint:    r.actionHint    || null,
          routePath:     r.routePath     || null,
          supportingData: r.supportingData || null,
          status:        'active',
          expiresAt:     expiry,
        },
      })
    )
  );
}

async function getActiveRecommendations(workspaceId) {
  const now = new Date();
  return prisma.aiRecommendation.findMany({
    where:   { workspaceId, status: 'active', OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] },
    orderBy: [{ priority: 'asc' }, { createdAt: 'desc' }],
    take:    5,
  });
}

async function dismissRecommendation(id, workspaceId) {
  return prisma.aiRecommendation.updateMany({ where: { id, workspaceId }, data: { status: 'dismissed' } });
}

module.exports = { logAction, getActionHistory, getActionMetrics, saveRecommendations, getActiveRecommendations, dismissRecommendation };
