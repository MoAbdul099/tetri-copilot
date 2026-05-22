const prisma = require('../../lib/prisma');

const INCLUDE = {
  supplier: { select: { id: true, name: true } },
  category: { select: { id: true, name: true } },
  createdBy: { select: { id: true, fullName: true } },
};

const list = (workspaceId) =>
  prisma.recurringExpense.findMany({
    where: { workspaceId },
    include: INCLUDE,
    orderBy: { nextRunDate: 'asc' },
  });

const findById = (id, workspaceId) =>
  prisma.recurringExpense.findFirst({ where: { id, workspaceId }, include: INCLUDE });

const create = (workspaceId, userId, data) =>
  prisma.recurringExpense.create({
    data: { workspaceId, createdByUserId: userId, ...data },
    include: INCLUDE,
  });

const update = (id, data) =>
  prisma.recurringExpense.update({ where: { id }, data, include: INCLUDE });

const remove = (id) =>
  prisma.recurringExpense.update({ where: { id }, data: { isActive: false } });

const findDueTemplates = (workspaceId) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return prisma.recurringExpense.findMany({
    where: {
      workspaceId,
      isActive: true,
      autoCreate: true,
      nextRunDate: { lte: today },
      OR: [{ endDate: null }, { endDate: { gte: today } }],
    },
    include: INCLUDE,
  });
};

const createRun = (recurringExpenseId, workspaceId, expenseId, runDate) =>
  prisma.recurringExpenseRun.create({
    data: { recurringExpenseId, workspaceId, expenseId, runDate: new Date(runDate) },
  });

const updateNextRun = (id, nextRunDate, lastRunDate) =>
  prisma.recurringExpense.update({
    where: { id },
    data: { nextRunDate: new Date(nextRunDate), lastRunDate: new Date(lastRunDate) },
  });

module.exports = { list, findById, create, update, remove, findDueTemplates, createRun, updateNextRun };
