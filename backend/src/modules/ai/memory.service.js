const prisma = require('../../lib/prisma');

async function store({ workspaceId, userId, memoryType, featureCode, content, ttlHours }) {
  const expiresAt = ttlHours ? new Date(Date.now() + ttlHours * 3600_000) : null;
  return prisma.aiMemoryRecord.create({
    data: { workspaceId, userId, memoryType, featureCode, content, expiresAt },
  });
}

async function retrieve({ workspaceId, userId, memoryType, featureCode }) {
  return prisma.aiMemoryRecord.findMany({
    where: {
      workspaceId,
      ...(userId      ? { userId }       : {}),
      ...(memoryType  ? { memoryType }   : {}),
      ...(featureCode ? { featureCode }  : {}),
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
}

async function expire() {
  const { count } = await prisma.aiMemoryRecord.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });
  return count;
}

async function remove(id) {
  return prisma.aiMemoryRecord.delete({ where: { id } });
}

module.exports = { store, retrieve, expire, remove };
