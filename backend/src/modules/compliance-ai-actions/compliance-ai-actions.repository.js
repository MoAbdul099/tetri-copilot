const prisma = require('../../lib/prisma');

// ── Packages ──────────────────────────────────────────────────────────────────

async function createPackage(data) {
  return prisma.complianceAiPackage.create({ data });
}

async function listPackages(workspaceId, { page = 1, pageSize = 20 } = {}) {
  const [items, total] = await Promise.all([
    prisma.complianceAiPackage.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
      take: parseInt(pageSize),
      skip: (parseInt(page) - 1) * parseInt(pageSize),
    }),
    prisma.complianceAiPackage.count({ where: { workspaceId } }),
  ]);
  return { items, total };
}

async function getPackage(workspaceId, id) {
  return prisma.complianceAiPackage.findFirst({ where: { id, workspaceId } });
}

// ── Checklists ────────────────────────────────────────────────────────────────

async function createChecklist(data) {
  return prisma.complianceAiChecklist.create({ data });
}

async function listChecklists(workspaceId, { page = 1, pageSize = 20 } = {}) {
  const [items, total] = await Promise.all([
    prisma.complianceAiChecklist.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
      take: parseInt(pageSize),
      skip: (parseInt(page) - 1) * parseInt(pageSize),
    }),
    prisma.complianceAiChecklist.count({ where: { workspaceId } }),
  ]);
  return { items, total };
}

async function getChecklist(workspaceId, id) {
  return prisma.complianceAiChecklist.findFirst({ where: { id, workspaceId } });
}

// ── Action context ────────────────────────────────────────────────────────────

async function createActionContext(data) {
  return prisma.complianceAiActionContext.create({ data });
}

async function getContextForAction(actionId) {
  return prisma.complianceAiActionContext.findMany({ where: { actionId } });
}

// ── Compliance data queries for context ───────────────────────────────────────

async function getOverdueOccurrences(workspaceId, limit = 10) {
  const today = new Date();
  return prisma.complianceOccurrence.findMany({
    where: {
      workspaceId,
      status: { in: ['scheduled', 'in_progress'] },
      dueDate: { lt: today },
    },
    orderBy: { dueDate: 'asc' },
    take: limit,
    include: { template: { select: { name: true, category: true } } },
  });
}

async function getNearDueOccurrences(workspaceId, daysAhead = 14, limit = 10) {
  const today = new Date();
  const future = new Date(Date.now() + daysAhead * 86400000);
  return prisma.complianceOccurrence.findMany({
    where: {
      workspaceId,
      status: { in: ['scheduled', 'in_progress'] },
      dueDate: { gte: today, lte: future },
    },
    orderBy: { dueDate: 'asc' },
    take: limit,
    include: { template: { select: { name: true } } },
  });
}

async function getOccurrenceById(workspaceId, id) {
  return prisma.complianceOccurrence.findFirst({
    where: { id, workspaceId },
    include: { template: true },
  });
}

// ── Counts for dashboard ──────────────────────────────────────────────────────

async function countComplianceActions(workspaceId) {
  const rows = await prisma.aiAction.groupBy({
    by: ['status'],
    where: { workspaceId, module: 'compliance' },
    _count: { status: true },
  });
  const result = {};
  for (const r of rows) result[r.status] = r._count.status;
  return result;
}

async function countPackagesAndChecklists(workspaceId) {
  const [packages, checklists] = await Promise.all([
    prisma.complianceAiPackage.count({ where: { workspaceId } }),
    prisma.complianceAiChecklist.count({ where: { workspaceId } }),
  ]);
  return { packages, checklists };
}

async function listRecentComplianceActions(workspaceId, limit = 5) {
  return prisma.aiAction.findMany({
    where: { workspaceId, module: 'compliance' },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

module.exports = {
  createPackage, listPackages, getPackage,
  createChecklist, listChecklists, getChecklist,
  createActionContext, getContextForAction,
  getOverdueOccurrences, getNearDueOccurrences, getOccurrenceById,
  countComplianceActions, countPackagesAndChecklists, listRecentComplianceActions,
};
