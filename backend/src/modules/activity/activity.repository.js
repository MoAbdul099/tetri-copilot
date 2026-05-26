const prisma = require('../../lib/prisma');

async function list(workspaceId, { search, userId, module: mod, category, entityType, startDate, endDate, page = 1, limit = 50 } = {}) {
  const where = { workspaceId };

  if (userId)     where.userId     = userId;
  if (mod)        where.module     = mod;
  if (category)   where.category   = category;
  if (entityType) where.entityType = entityType;

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate)   where.createdAt.lte = new Date(endDate);
  }

  if (search) {
    where.OR = [
      { description:     { contains: search, mode: 'insensitive' } },
      { referenceNumber: { contains: search, mode: 'insensitive' } },
      { userName:        { contains: search, mode: 'insensitive' } },
      { action:          { contains: search, mode: 'insensitive' } },
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  const [items, total] = await Promise.all([
    prisma.activityLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    }),
    prisma.activityLog.count({ where }),
  ]);

  return { items, total, page: parseInt(page), limit: take };
}

async function findById(id, workspaceId) {
  return prisma.activityLog.findFirst({ where: { id, workspaceId } });
}

async function listByEntity(entityId, workspaceId, { limit = 50 } = {}) {
  return prisma.activityLog.findMany({
    where: { entityId, workspaceId },
    orderBy: { createdAt: 'desc' },
    take: parseInt(limit),
  });
}

async function listForCurrentUser(userId, workspaceId, { limit = 50 } = {}) {
  return prisma.activityLog.findMany({
    where: { userId, workspaceId },
    orderBy: { createdAt: 'desc' },
    take: parseInt(limit),
  });
}

async function recent(workspaceId, limit = 20) {
  return prisma.activityLog.findMany({
    where: { workspaceId },
    orderBy: { createdAt: 'desc' },
    take: parseInt(limit),
  });
}

async function listForExport(workspaceId, filters = {}) {
  const { userId, module: mod, category, entityType, startDate, endDate } = filters;
  const where = { workspaceId };
  if (userId)     where.userId     = userId;
  if (mod)        where.module     = mod;
  if (category)   where.category   = category;
  if (entityType) where.entityType = entityType;
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate)   where.createdAt.lte = new Date(endDate);
  }
  return prisma.activityLog.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 10000,
  });
}

async function deleteOlderThan(workspaceId, cutoff) {
  return prisma.activityLog.deleteMany({
    where: { workspaceId, createdAt: { lt: cutoff } },
  });
}

module.exports = { list, findById, listByEntity, listForCurrentUser, recent, listForExport, deleteOlderThan };
