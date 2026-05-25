const prisma = require('../../lib/prisma');

const list = (workspaceId) =>
  prisma.workspaceReminderRule.findMany({
    where: { workspaceId },
    orderBy: { createdAt: 'asc' },
  });

const findById = (id, workspaceId) =>
  prisma.workspaceReminderRule.findFirst({ where: { id, workspaceId } });

const create = (workspaceId, data) =>
  prisma.workspaceReminderRule.create({
    data: {
      workspaceId,
      name:     data.name,
      category: data.category,
      schedule: data.schedule,
      isActive: data.isActive !== false,
    },
  });

const update = (id, data) =>
  prisma.workspaceReminderRule.update({
    where: { id },
    data: {
      ...(data.name     !== undefined && { name:     data.name }),
      ...(data.category !== undefined && { category: data.category }),
      ...(data.schedule !== undefined && { schedule: data.schedule }),
      ...(data.isActive !== undefined && { isActive: !!data.isActive }),
    },
  });

const remove = (id) => prisma.workspaceReminderRule.delete({ where: { id } });

const getStats = async (workspaceId) => {
  const rules = await prisma.workspaceReminderRule.count({ where: { workspaceId } });
  const active = await prisma.workspaceReminderRule.count({ where: { workspaceId, isActive: true } });
  const sentToday = await prisma.workspaceReminderInstance.count({
    where: {
      rule: { workspaceId },
      sentAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
    },
  });
  const pendingCount = await prisma.workspaceReminderInstance.count({
    where: { rule: { workspaceId }, status: 'pending' },
  });
  return { rules, active, sentToday, pendingCount };
};

module.exports = { list, findById, create, update, remove, getStats };
