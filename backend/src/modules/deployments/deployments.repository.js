const prisma = require('../../lib/prisma');

async function list({ limit = 20, offset = 0, environment, status } = {}) {
  const where = {};
  if (environment) where.environment = environment;
  if (status) where.status = status;

  const [rows, total] = await Promise.all([
    prisma.deploymentLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset),
      include: { auditEntries: { orderBy: { timestamp: 'asc' } } },
    }),
    prisma.deploymentLog.count({ where }),
  ]);
  return { rows, total };
}

async function findById(id) {
  return prisma.deploymentLog.findUnique({
    where: { id },
    include: { auditEntries: { orderBy: { timestamp: 'asc' } } },
  });
}

async function create(data) {
  return prisma.deploymentLog.create({ data });
}

async function update(id, data) {
  return prisma.deploymentLog.update({ where: { id }, data });
}

async function addAuditEntry(deploymentId, { action, actor, details }) {
  return prisma.deploymentAuditLog.create({
    data: { deploymentId, action, actor, details: details || null },
  });
}

async function getLatest(environment) {
  return prisma.deploymentLog.findFirst({
    where: { environment, status: 'success' },
    orderBy: { completedAt: 'desc' },
  });
}

async function seedInitialVersion(version) {
  const exists = await prisma.systemVersion.findUnique({ where: { version } });
  if (exists) return exists;
  await prisma.systemVersion.updateMany({ where: { isActive: true }, data: { isActive: false } });
  return prisma.systemVersion.create({
    data: {
      version,
      releaseDate: new Date(),
      releaseNotes: 'Initial production release',
      isActive: true,
    },
  });
}

module.exports = { list, findById, create, update, addAuditEntry, getLatest, seedInitialVersion };
