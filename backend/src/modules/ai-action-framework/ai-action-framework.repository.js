const prisma = require('../../lib/prisma');

// ── Actions ───────────────────────────────────────────────────────────────────

async function createAction(data) {
  return prisma.aiAction.create({ data });
}

async function getAction(workspaceId, id) {
  return prisma.aiAction.findFirst({
    where: { id, workspaceId },
    include: {
      approvals: { orderBy: { createdAt: 'desc' } },
      executionHistory: { orderBy: { executedAt: 'desc' } },
      auditLogs: { orderBy: { createdAt: 'asc' } },
    },
  });
}

async function listActions(workspaceId, { module: mod, status, riskLevel, page = 1, pageSize = 20 } = {}) {
  const where = { workspaceId };
  if (mod) where.module = mod;
  if (status) {
    where.status = Array.isArray(status) ? { in: status } : status;
  }
  if (riskLevel) where.riskLevel = riskLevel;

  const [items, total] = await Promise.all([
    prisma.aiAction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: parseInt(pageSize),
      skip: (parseInt(page) - 1) * parseInt(pageSize),
      include: { approvals: { orderBy: { createdAt: 'desc' }, take: 1 } },
    }),
    prisma.aiAction.count({ where }),
  ]);
  return { items, total };
}

async function updateAction(id, data) {
  return prisma.aiAction.update({ where: { id }, data });
}

async function countByStatus(workspaceId) {
  const rows = await prisma.aiAction.groupBy({
    by: ['status'],
    where: { workspaceId },
    _count: { status: true },
  });
  const result = {};
  for (const r of rows) result[r.status] = r._count.status;
  return result;
}

// ── Approvals ─────────────────────────────────────────────────────────────────

async function createApproval(data) {
  return prisma.aiActionApproval.create({ data });
}

async function getPendingApprovalForUser(workspaceId, approverId) {
  return prisma.aiActionApproval.findMany({
    where: { action: { workspaceId }, approverId, decision: null },
    include: {
      action: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

async function updateApproval(id, data) {
  return prisma.aiActionApproval.update({ where: { id }, data });
}

async function getApprovalForAction(actionId, approverId) {
  return prisma.aiActionApproval.findFirst({
    where: { actionId, approverId, decision: null },
  });
}

// ── Governance policies ───────────────────────────────────────────────────────

async function getPolicy(workspaceId, policyType) {
  return prisma.aiGovernancePolicy.findFirst({
    where: { workspaceId, policyType, isActive: true },
  });
}

async function listPolicies(workspaceId) {
  return prisma.aiGovernancePolicy.findMany({
    where: { workspaceId },
    orderBy: { policyType: 'asc' },
  });
}

async function upsertPolicy(workspaceId, policyType, configuration) {
  return prisma.aiGovernancePolicy.upsert({
    where: { workspaceId_policyType: { workspaceId, policyType } },
    update: { configuration, isActive: true, updatedAt: new Date() },
    create: { workspaceId, policyType, configuration },
  });
}

// ── Execution history ─────────────────────────────────────────────────────────

async function recordExecution(data) {
  return prisma.aiExecutionHistory.create({ data });
}

// ── Audit logs ────────────────────────────────────────────────────────────────

async function addAuditLog(data) {
  return prisma.aiActionAuditLog.create({ data });
}

async function getAuditLogs(workspaceId, actionId) {
  return prisma.aiActionAuditLog.findMany({
    where: { workspaceId, actionId },
    orderBy: { createdAt: 'asc' },
  });
}

// ── Templates ─────────────────────────────────────────────────────────────────

async function listTemplates(module) {
  const where = { isActive: true };
  if (module) where.module = module;
  return prisma.aiActionTemplate.findMany({ where, orderBy: { templateName: 'asc' } });
}

async function createTemplate(data) {
  return prisma.aiActionTemplate.create({ data });
}

module.exports = {
  createAction, getAction, listActions, updateAction, countByStatus,
  createApproval, getPendingApprovalForUser, updateApproval, getApprovalForAction,
  getPolicy, listPolicies, upsertPolicy,
  recordExecution,
  addAuditLog, getAuditLogs,
  listTemplates, createTemplate,
};
