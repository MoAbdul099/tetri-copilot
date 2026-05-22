const prisma = require('../../lib/prisma');

const BUDGET_INCLUDE = {
  category: { select: { id: true, name: true } },
  createdBy: { select: { id: true, fullName: true } },
};

const list = (workspaceId) =>
  prisma.budget.findMany({
    where: { workspaceId, isActive: true },
    include: BUDGET_INCLUDE,
    orderBy: { createdAt: 'desc' },
  });

const findById = (id, workspaceId) =>
  prisma.budget.findFirst({ where: { id, workspaceId }, include: BUDGET_INCLUDE });

const create = (workspaceId, userId, data) =>
  prisma.budget.create({
    data: { workspaceId, createdByUserId: userId, ...data },
    include: BUDGET_INCLUDE,
  });

const update = (id, data) =>
  prisma.budget.update({ where: { id }, data, include: BUDGET_INCLUDE });

const remove = (id) =>
  prisma.budget.update({ where: { id }, data: { isActive: false } });

const getMonitoring = async (workspaceId) => {
  const budgets = await prisma.budget.findMany({
    where: { workspaceId, isActive: true },
    include: { category: { select: { id: true, name: true } } },
  });

  const now = new Date();

  const results = await Promise.all(
    budgets.map(async (b) => {
      const periodStart = getPeriodStart(b.period, b.startDate, now);
      const periodEnd   = getPeriodEnd(b.period, periodStart);

      const where = {
        workspaceId,
        isDeleted: false,
        expenseDate: { gte: periodStart, lte: periodEnd },
        status: { notIn: ['cancelled', 'rejected'] },
      };
      if (b.budgetType === 'category' && b.categoryId)  where.categoryId = b.categoryId;
      if (b.budgetType === 'department' && b.department) where.department  = b.department;
      if (b.budgetType === 'project'    && b.project)    where.project     = b.project;

      const agg = await prisma.expense.aggregate({ where, _sum: { amount: true } });
      const spent       = Number(agg._sum.amount || 0);
      const budgetAmt   = Number(b.amount);
      const remaining   = Math.max(0, budgetAmt - spent);
      const utilization = budgetAmt > 0 ? Math.round((spent / budgetAmt) * 100) : 0;

      return {
        ...b,
        spent,
        remaining,
        utilization,
        periodStart,
        periodEnd,
        alertLevel:
          utilization >= 100 ? 'over' :
          utilization >= 90  ? 'critical' :
          utilization >= 75  ? 'warning' : 'ok',
      };
    })
  );

  return results;
};

function getPeriodStart(period, startDate, now) {
  const d = new Date(now);
  if (period === 'monthly')    return new Date(d.getFullYear(), d.getMonth(), 1);
  if (period === 'quarterly') {
    const q = Math.floor(d.getMonth() / 3);
    return new Date(d.getFullYear(), q * 3, 1);
  }
  if (period === 'annual') return new Date(d.getFullYear(), 0, 1);
  return new Date(startDate);
}

function getPeriodEnd(period, periodStart) {
  const d = new Date(periodStart);
  if (period === 'monthly')   { d.setMonth(d.getMonth() + 1); d.setDate(d.getDate() - 1); return d; }
  if (period === 'quarterly') { d.setMonth(d.getMonth() + 3); d.setDate(d.getDate() - 1); return d; }
  if (period === 'annual')    { d.setFullYear(d.getFullYear() + 1); d.setDate(d.getDate() - 1); return d; }
  return d;
}

module.exports = { list, findById, create, update, remove, getMonitoring };
