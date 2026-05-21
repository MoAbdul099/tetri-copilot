const prisma = require('../../lib/prisma');

const list = async (workspaceId, { search, includeArchived = false, page = 1, limit = 50 } = {}) => {
  page  = Math.max(1, parseInt(page,  10) || 1);
  limit = Math.min(200, parseInt(limit, 10) || 50);

  const where = { workspaceId, ...(includeArchived ? {} : { isActive: true }) };
  if (search) {
    where.OR = [
      { name:         { contains: search, mode: 'insensitive' } },
      { email:        { contains: search, mode: 'insensitive' } },
      { phone:        { contains: search, mode: 'insensitive' } },
      { taxNumber:    { contains: search, mode: 'insensitive' } },
      { contactPerson:{ contains: search, mode: 'insensitive' } },
    ];
  }

  const [total, items] = await Promise.all([
    prisma.supplier.count({ where }),
    prisma.supplier.findMany({
      where,
      orderBy: { name: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return { items, total, page, limit, pages: Math.ceil(total / limit) };
};

const findById = (id, workspaceId) =>
  prisma.supplier.findFirst({ where: { id, workspaceId } });

const create = (workspaceId, userId, data) =>
  prisma.supplier.create({ data: { ...data, workspaceId, createdByUserId: userId } });

const update = (id, data) =>
  prisma.supplier.update({ where: { id }, data });

const archive = (id) =>
  prisma.supplier.update({ where: { id }, data: { isActive: false } });

const restore = (id) =>
  prisma.supplier.update({ where: { id }, data: { isActive: true } });

const getStats = async (workspaceId, supplierId) => {
  const result = await prisma.expense.aggregate({
    where: { workspaceId, supplierId, isDeleted: false },
    _count: { id: true },
    _sum:   { amount: true },
    _max:   { expenseDate: true },
  });
  return {
    totalCount:  result._count.id,
    totalAmount: Number(result._sum.amount || 0),
    lastExpenseDate: result._max.expenseDate,
  };
};

module.exports = { list, findById, create, update, archive, restore, getStats };
