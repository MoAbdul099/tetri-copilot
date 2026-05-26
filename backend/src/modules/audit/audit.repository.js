const prisma = require('../../lib/prisma');

async function list(workspaceId, { search, userId, entityType, action, startDate, endDate, page = 1, limit = 50 } = {}) {
  const where = { workspaceId };

  if (userId)     where.userId     = userId;
  if (entityType) where.entityType = entityType;
  if (action)     where.action     = action;

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate)   where.createdAt.lte = new Date(endDate);
  }

  if (search) {
    where.OR = [
      { userName:    { contains: search, mode: 'insensitive' } },
      { action:      { contains: search, mode: 'insensitive' } },
      { entityType:  { contains: search, mode: 'insensitive' } },
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  const [items, total] = await Promise.all([
    prisma.auditLog.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take }),
    prisma.auditLog.count({ where }),
  ]);

  return { items, total, page: parseInt(page), limit: take };
}

async function findById(id, workspaceId) {
  return prisma.auditLog.findFirst({ where: { id, workspaceId } });
}

async function listByEntity(entityId, workspaceId, { limit = 100 } = {}) {
  return prisma.auditLog.findMany({
    where: { entityId, workspaceId },
    orderBy: { createdAt: 'desc' },
    take: parseInt(limit),
  });
}

async function listByUser(userId, workspaceId, { limit = 100 } = {}) {
  return prisma.auditLog.findMany({
    where: { userId, workspaceId },
    orderBy: { createdAt: 'desc' },
    take: parseInt(limit),
  });
}

async function listForExport(workspaceId, filters = {}) {
  const { userId, entityType, action, startDate, endDate } = filters;
  const where = { workspaceId };
  if (userId)     where.userId     = userId;
  if (entityType) where.entityType = entityType;
  if (action)     where.action     = action;
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate)   where.createdAt.lte = new Date(endDate);
  }
  return prisma.auditLog.findMany({ where, orderBy: { createdAt: 'desc' }, take: 10000 });
}

// Chain verification — reads all records in chronological order for a workspace/entity
async function getAllForVerification(workspaceId, entityId = null) {
  return prisma.auditLog.findMany({
    where: { workspaceId, ...(entityId ? { entityId } : {}) },
    orderBy: { createdAt: 'asc' },
    select: { id: true, recordHash: true, previousRecordHash: true, chainHash: true, createdAt: true, action: true },
  });
}

async function setLegalHold(id, workspaceId, isLegalHold) {
  return prisma.auditLog.updateMany({
    where: { id, workspaceId },
    data: { isLegalHold },
  });
}

module.exports = { list, findById, listByEntity, listByUser, listForExport, getAllForVerification, setLegalHold };
