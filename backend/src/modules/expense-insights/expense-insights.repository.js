const prisma = require('../../lib/prisma');

const getDashboardStats = async (workspaceId) => {
  const now   = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const qStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
  const yearStart  = new Date(now.getFullYear(), 0, 1);

  const baseWhere = { workspaceId, isDeleted: false };

  const [
    total, approved, rejected, pendingApproval,
    monthAgg, quarterAgg, yearAgg,
    reimbOutstanding,
  ] = await Promise.all([
    prisma.expense.count({ where: baseWhere }),
    prisma.expense.count({ where: { ...baseWhere, status: 'approved' } }),
    prisma.expense.count({ where: { ...baseWhere, status: 'rejected' } }),
    prisma.expense.count({ where: { ...baseWhere, status: 'pending_approval' } }),
    prisma.expense.aggregate({ where: { ...baseWhere, expenseDate: { gte: monthStart } }, _sum: { amount: true } }),
    prisma.expense.aggregate({ where: { ...baseWhere, expenseDate: { gte: qStart } },     _sum: { amount: true } }),
    prisma.expense.aggregate({ where: { ...baseWhere, expenseDate: { gte: yearStart } },  _sum: { amount: true } }),
    prisma.reimbursementRequest.aggregate({
      where: { workspaceId, status: { in: ['approved', 'partially_paid'] } },
      _sum: { requestedAmount: true, paidAmount: true },
    }),
  ]);

  const outstandingReimb =
    Number(reimbOutstanding._sum.requestedAmount || 0) - Number(reimbOutstanding._sum.paidAmount || 0);

  return {
    total,
    approved,
    rejected,
    pendingApproval,
    monthSpend:   Number(monthAgg._sum.amount   || 0),
    quarterSpend: Number(quarterAgg._sum.amount  || 0),
    yearSpend:    Number(yearAgg._sum.amount     || 0),
    outstandingReimbursements: outstandingReimb,
  };
};

const getByCategory = async (workspaceId, { months = 3 } = {}) => {
  const since = new Date();
  since.setMonth(since.getMonth() - months);
  const rows = await prisma.expense.groupBy({
    by: ['categoryId'],
    where: { workspaceId, isDeleted: false, expenseDate: { gte: since }, status: { notIn: ['cancelled', 'rejected'] } },
    _sum: { amount: true },
    _count: { id: true },
    orderBy: { _sum: { amount: 'desc' } },
    take: 10,
  });
  const cats = await prisma.expenseCategory.findMany({ where: { id: { in: rows.map(r => r.categoryId).filter(Boolean) } }, select: { id: true, name: true } });
  const catMap = Object.fromEntries(cats.map(c => [c.id, c.name]));
  return rows.map(r => ({ categoryId: r.categoryId, name: catMap[r.categoryId] || 'Uncategorized', amount: Number(r._sum.amount || 0), count: r._count.id }));
};

const getByMonth = async (workspaceId, { months = 12 } = {}) => {
  const rows = await prisma.$queryRaw`
    SELECT
      TO_CHAR(expense_date, 'YYYY-MM') AS month,
      SUM(amount)::float               AS amount,
      COUNT(*)::int                    AS count
    FROM expenses
    WHERE workspace_id = ${workspaceId}::uuid
      AND is_deleted = false
      AND status NOT IN ('cancelled','rejected')
      AND expense_date >= NOW() - (${months} || ' months')::interval
    GROUP BY TO_CHAR(expense_date, 'YYYY-MM')
    ORDER BY month ASC
  `;
  return rows.map(r => ({ month: r.month, amount: Number(r.amount), count: Number(r.count) }));
};

const getByDepartment = async (workspaceId, { months = 3 } = {}) => {
  const since = new Date();
  since.setMonth(since.getMonth() - months);
  const rows = await prisma.expense.groupBy({
    by: ['department'],
    where: { workspaceId, isDeleted: false, expenseDate: { gte: since }, department: { not: null }, status: { notIn: ['cancelled', 'rejected'] } },
    _sum: { amount: true },
    _count: { id: true },
    orderBy: { _sum: { amount: 'desc' } },
    take: 10,
  });
  return rows.map(r => ({ department: r.department || 'Unassigned', amount: Number(r._sum.amount || 0), count: r._count.id }));
};

const getBySupplier = async (workspaceId, { months = 3 } = {}) => {
  const since = new Date();
  since.setMonth(since.getMonth() - months);
  const rows = await prisma.expense.groupBy({
    by: ['supplierId'],
    where: { workspaceId, isDeleted: false, expenseDate: { gte: since }, supplierId: { not: null }, status: { notIn: ['cancelled', 'rejected'] } },
    _sum: { amount: true },
    _count: { id: true },
    orderBy: { _sum: { amount: 'desc' } },
    take: 10,
  });
  const suppliers = await prisma.supplier.findMany({ where: { id: { in: rows.map(r => r.supplierId).filter(Boolean) } }, select: { id: true, name: true } });
  const sMap = Object.fromEntries(suppliers.map(s => [s.id, s.name]));
  return rows.map(r => ({ supplierId: r.supplierId, name: sMap[r.supplierId] || 'Unknown', amount: Number(r._sum.amount || 0), count: r._count.id }));
};

const getByEmployee = async (workspaceId, { months = 3 } = {}) => {
  const since = new Date();
  since.setMonth(since.getMonth() - months);
  const rows = await prisma.expense.groupBy({
    by: ['createdByUserId'],
    where: { workspaceId, isDeleted: false, expenseDate: { gte: since }, status: { notIn: ['cancelled', 'rejected'] } },
    _sum: { amount: true },
    _count: { id: true },
    orderBy: { _sum: { amount: 'desc' } },
    take: 10,
  });
  const users = await prisma.user.findMany({ where: { id: { in: rows.map(r => r.createdByUserId).filter(Boolean) } }, select: { id: true, fullName: true, email: true } });
  const uMap = Object.fromEntries(users.map(u => [u.id, u.fullName || u.email]));
  return rows.map(r => ({ userId: r.createdByUserId, name: uMap[r.createdByUserId] || 'Unknown', amount: Number(r._sum.amount || 0), count: r._count.id }));
};

const findPotentialDuplicates = async (workspaceId, { supplierId, vendorName, amount, expenseDate, excludeId }) => {
  const date = new Date(expenseDate);
  const dayBefore = new Date(date); dayBefore.setDate(dayBefore.getDate() - 3);
  const dayAfter  = new Date(date); dayAfter.setDate(dayAfter.getDate() + 3);

  const where = {
    workspaceId,
    isDeleted: false,
    amount: parseFloat(amount),
    expenseDate: { gte: dayBefore, lte: dayAfter },
    status: { notIn: ['cancelled'] },
  };
  if (excludeId) where.id = { not: excludeId };
  if (supplierId) where.supplierId = supplierId;
  else if (vendorName) where.vendorName = { contains: vendorName, mode: 'insensitive' };

  return prisma.expense.findMany({
    where,
    select: { id: true, expenseNumber: true, description: true, amount: true, expenseDate: true, status: true },
    take: 5,
  });
};

const getCategoryAverage = async (workspaceId, categoryId) => {
  const since = new Date();
  since.setMonth(since.getMonth() - 6);
  const agg = await prisma.expense.aggregate({
    where: { workspaceId, categoryId, isDeleted: false, expenseDate: { gte: since }, status: { notIn: ['cancelled', 'rejected'] } },
    _avg: { amount: true },
    _count: { id: true },
  });
  return { average: Number(agg._avg.amount || 0), count: agg._count.id };
};

const getPastExpensesBySupplier = async (workspaceId, supplierId, limit = 5) => {
  return prisma.expense.findMany({
    where: { workspaceId, supplierId, isDeleted: false },
    select: { categoryId: true, category: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
};

const getInsights = (workspaceId, limit = 20) =>
  prisma.expenseInsight.findMany({
    where: { workspaceId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

const saveInsights = (workspaceId, insights) =>
  prisma.expenseInsight.createMany({
    data: insights.map(i => ({ workspaceId, ...i })),
  });

const clearInsights = (workspaceId) =>
  prisma.expenseInsight.deleteMany({ where: { workspaceId } });

const getAnomalies = (workspaceId, { onlyUnreviewed = false } = {}) =>
  prisma.expenseAnomaly.findMany({
    where: { workspaceId, ...(onlyUnreviewed ? { isReviewed: false } : {}) },
    include: { expense: { select: { id: true, expenseNumber: true, description: true, amount: true, expenseDate: true } } },
    orderBy: [{ riskLevel: 'desc' }, { createdAt: 'desc' }],
    take: 50,
  });

const markAnomalyReviewed = (id, workspaceId) =>
  prisma.expenseAnomaly.updateMany({
    where: { id, workspaceId },
    data: { isReviewed: true, reviewedAt: new Date() },
  });

const getRecentExpenses = (workspaceId, { months = 1 } = {}) => {
  const since = new Date();
  since.setMonth(since.getMonth() - months);
  return prisma.expense.findMany({
    where: { workspaceId, isDeleted: false, expenseDate: { gte: since }, status: { notIn: ['cancelled'] } },
    include: {
      category: { select: { id: true, name: true } },
      supplier: { select: { id: true, name: true } },
    },
    orderBy: { expenseDate: 'desc' },
  });
};

const saveAnomalies = (workspaceId, anomalies) =>
  prisma.expenseAnomaly.createMany({ data: anomalies.map(a => ({ workspaceId, ...a })) });

const clearAnomalies = (workspaceId) =>
  prisma.expenseAnomaly.deleteMany({ where: { workspaceId, isReviewed: false } });

const getCategories = (workspaceId) =>
  prisma.expenseCategory.findMany({
    where: { OR: [{ workspaceId }, { isSystemDefault: true }], isActive: true },
    select: { id: true, name: true, description: true },
    orderBy: { name: 'asc' },
  });

const searchExpenses = (workspaceId, where, { limit = 50 } = {}) =>
  prisma.expense.findMany({
    where: { workspaceId, isDeleted: false, ...where },
    include: {
      category: { select: { id: true, name: true } },
      supplier: { select: { id: true, name: true } },
    },
    orderBy: { expenseDate: 'desc' },
    take: limit,
  });

module.exports = {
  getDashboardStats, getByCategory, getByMonth, getByDepartment, getBySupplier, getByEmployee,
  findPotentialDuplicates, getCategoryAverage, getPastExpensesBySupplier,
  getInsights, saveInsights, clearInsights,
  getAnomalies, markAnomalyReviewed, saveAnomalies, clearAnomalies,
  getRecentExpenses, getCategories, searchExpenses,
};
