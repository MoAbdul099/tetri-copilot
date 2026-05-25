const prisma = require('../../lib/prisma');

const list = (workspaceId) =>
  prisma.workspaceEscalationRule.findMany({
    where: { workspaceId },
    orderBy: { createdAt: 'asc' },
  });

const findById = (id, workspaceId) =>
  prisma.workspaceEscalationRule.findFirst({ where: { id, workspaceId } });

const create = (workspaceId, data) =>
  prisma.workspaceEscalationRule.create({
    data: {
      workspaceId,
      name:        data.name,
      triggerType: data.triggerType,
      levels:      data.levels,
      isActive:    data.isActive !== false,
    },
  });

const update = (id, data) =>
  prisma.workspaceEscalationRule.update({
    where: { id },
    data: {
      ...(data.name        !== undefined && { name:        data.name }),
      ...(data.triggerType !== undefined && { triggerType: data.triggerType }),
      ...(data.levels      !== undefined && { levels:      data.levels }),
      ...(data.isActive    !== undefined && { isActive:    !!data.isActive }),
    },
  });

const remove = (id) => prisma.workspaceEscalationRule.delete({ where: { id } });

const listInstances = (workspaceId, { status, page = 1, limit = 20 } = {}) => {
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const where = { workspaceId, ...(status ? { status } : {}) };
  return Promise.all([
    prisma.workspaceEscalationInstance.findMany({
      where,
      include: { rule: { select: { id: true, name: true, triggerType: true } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit),
    }),
    prisma.workspaceEscalationInstance.count({ where }),
  ]).then(([items, total]) => ({ items, total }));
};

const resolveInstance = (id) =>
  prisma.workspaceEscalationInstance.update({
    where: { id },
    data: { status: 'resolved', resolvedAt: new Date() },
  });

const getStats = async (workspaceId) => {
  const [active, resolved, total] = await Promise.all([
    prisma.workspaceEscalationInstance.count({ where: { workspaceId, status: 'active' } }),
    prisma.workspaceEscalationInstance.count({ where: { workspaceId, status: 'resolved' } }),
    prisma.workspaceEscalationInstance.count({ where: { workspaceId } }),
  ]);
  return { active, resolved, total };
};

module.exports = { list, findById, create, update, remove, listInstances, resolveInstance, getStats };
