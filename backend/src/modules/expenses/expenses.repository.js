const prisma = require('../../lib/prisma');

const EXPENSE_INCLUDE = {
  category:  { select: { id: true, name: true, categoryCode: true } },
  supplier:  { select: { id: true, name: true, email: true, phone: true } },
  createdByUser: { select: { id: true, fullName: true, email: true } },
  expenseAttachments: { orderBy: { createdAt: 'asc' } },
};

const EXPENSE_LIST_INCLUDE = {
  category: { select: { id: true, name: true } },
  supplier: { select: { id: true, name: true } },
  createdByUser: { select: { id: true, fullName: true } },
};

// ── Number generation ──────────────────────────────────────

const generateExpenseNumber = async (workspaceId) => {
  return prisma.$transaction(async (tx) => {
    const settings = await tx.companySettings.findUnique({ where: { workspaceId } });
    const prefix = settings?.expensePrefix || 'EXP';
    const seq    = settings?.nextExpenseNumber ?? 1;
    const year   = new Date().getFullYear();
    const padded = String(seq).padStart(6, '0');
    const number = `${prefix}-${year}-${padded}`;

    await tx.companySettings.update({
      where: { workspaceId },
      data:  { nextExpenseNumber: seq + 1 },
    });

    return number;
  });
};

// ── List ───────────────────────────────────────────────────

const list = async (workspaceId, {
  page = 1, limit = 20, search, status, expenseType, categoryId, supplierId,
  dateFrom, dateTo, amountMin, amountMax, sortBy = 'expenseDate', sortOrder = 'desc',
} = {}) => {
  page  = Math.max(1, parseInt(page,  10) || 1);
  limit = Math.min(100, parseInt(limit, 10) || 20);

  const where = { workspaceId, isDeleted: false };

  if (status)     where.status     = status;
  if (expenseType) where.expenseType = expenseType;
  if (categoryId)  where.categoryId  = categoryId;
  if (supplierId)  where.supplierId   = supplierId;

  if (dateFrom || dateTo) {
    where.expenseDate = {};
    if (dateFrom) where.expenseDate.gte = new Date(dateFrom);
    if (dateTo)   where.expenseDate.lte = new Date(dateTo);
  }

  if (amountMin || amountMax) {
    where.amount = {};
    if (amountMin) where.amount.gte = parseFloat(amountMin);
    if (amountMax) where.amount.lte = parseFloat(amountMax);
  }

  if (search) {
    where.OR = [
      { expenseNumber: { contains: search, mode: 'insensitive' } },
      { description:   { contains: search, mode: 'insensitive' } },
      { referenceNumber: { contains: search, mode: 'insensitive' } },
      { vendor:        { contains: search, mode: 'insensitive' } },
      { supplier: { name: { contains: search, mode: 'insensitive' } } },
      { category: { name: { contains: search, mode: 'insensitive' } } },
    ];
  }

  const validSort = ['expenseDate', 'amount', 'createdAt', 'status'];
  const orderField = validSort.includes(sortBy) ? sortBy : 'expenseDate';

  const [total, items] = await Promise.all([
    prisma.expense.count({ where }),
    prisma.expense.findMany({
      where,
      include:  EXPENSE_LIST_INCLUDE,
      orderBy:  { [orderField]: sortOrder === 'asc' ? 'asc' : 'desc' },
      skip:     (page - 1) * limit,
      take:     limit,
    }),
  ]);

  return { items, total, page, limit, pages: Math.ceil(total / limit) };
};

// ── Find ───────────────────────────────────────────────────

const findById = (id, workspaceId) =>
  prisma.expense.findFirst({ where: { id, workspaceId, isDeleted: false }, include: EXPENSE_INCLUDE });

// ── Date coercion ──────────────────────────────────────────

const parseDates = (data) => {
  const out = { ...data };
  if (out.expenseDate)  out.expenseDate  = new Date(out.expenseDate);
  if (out.postingDate)  out.postingDate  = new Date(out.postingDate);
  return out;
};

// ── Create ─────────────────────────────────────────────────

const create = async (workspaceId, userId, data) => {
  const expenseNumber = await generateExpenseNumber(workspaceId);
  return prisma.expense.create({
    data: { ...parseDates(data), workspaceId, expenseNumber, createdByUserId: userId },
    include: EXPENSE_INCLUDE,
  });
};

// ── Update ─────────────────────────────────────────────────

const update = (id, userId, data) =>
  prisma.expense.update({
    where: { id },
    data:  { ...parseDates(data), updatedByUserId: userId },
    include: EXPENSE_INCLUDE,
  });

// ── Soft delete ────────────────────────────────────────────

const softDelete = (id, userId) =>
  prisma.expense.update({
    where: { id },
    data: { isDeleted: true, deletedAt: new Date(), deletedByUserId: userId },
  });

// ── Duplicate ──────────────────────────────────────────────

const duplicate = async (id, workspaceId, userId) => {
  const source = await findById(id, workspaceId);
  if (!source) throw Object.assign(new Error('Expense not found'), { statusCode: 404 });

  const {
    id: _, expenseNumber: __, createdAt, updatedAt, deletedAt,
    expenseAttachments, category, supplier, createdByUser,
    ...fields
  } = source;
  const newNumber = await generateExpenseNumber(workspaceId);

  return prisma.expense.create({
    data: { ...fields, expenseNumber: newNumber, status: 'draft', createdByUserId: userId, isDeleted: false },
    include: EXPENSE_INCLUDE,
  });
};

// ── Attachments ────────────────────────────────────────────

const createAttachment = (expenseId, workspaceId, userId, fileData) =>
  prisma.expenseAttachment.create({
    data: { expenseId, workspaceId, uploadedByUserId: userId, ...fileData },
  });

const findAttachment = (id, workspaceId) =>
  prisma.expenseAttachment.findFirst({ where: { id, workspaceId } });

const deleteAttachment = (id) =>
  prisma.expenseAttachment.delete({ where: { id } });

// ── Stats ──────────────────────────────────────────────────

const getStats = async (workspaceId) => {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const startOfYear  = new Date(today.getFullYear(), 0, 1);

  const [total, thisMonth, thisYear, byCategory] = await Promise.all([
    prisma.expense.aggregate({
      where: { workspaceId, isDeleted: false, status: { notIn: ['cancelled'] } },
      _sum: { amount: true }, _count: { id: true },
    }),
    prisma.expense.aggregate({
      where: { workspaceId, isDeleted: false, status: { notIn: ['cancelled'] }, expenseDate: { gte: startOfMonth } },
      _sum: { amount: true }, _count: { id: true },
    }),
    prisma.expense.aggregate({
      where: { workspaceId, isDeleted: false, status: { notIn: ['cancelled'] }, expenseDate: { gte: startOfYear } },
      _sum: { amount: true },
    }),
    prisma.expense.groupBy({
      by: ['categoryId'],
      where: { workspaceId, isDeleted: false, status: { notIn: ['cancelled'] }, expenseDate: { gte: startOfMonth } },
      _sum: { amount: true },
      _count: { id: true },
      orderBy: { _sum: { amount: 'desc' } },
      take: 5,
    }),
  ]);

  return {
    totalAmount:      Number(total._sum.amount || 0),
    totalCount:       total._count.id,
    thisMonthAmount:  Number(thisMonth._sum.amount || 0),
    thisMonthCount:   thisMonth._count.id,
    thisYearAmount:   Number(thisYear._sum.amount || 0),
    byCategory,
  };
};

// ── Export ─────────────────────────────────────────────────

const listForExport = (workspaceId, filters) =>
  prisma.expense.findMany({
    where: { workspaceId, isDeleted: false, ...filters },
    include: { category: true, supplier: true, createdByUser: { select: { fullName: true, email: true } } },
    orderBy: { expenseDate: 'desc' },
  });

module.exports = {
  generateExpenseNumber, list, findById, create, update, softDelete, duplicate,
  createAttachment, findAttachment, deleteAttachment, getStats, listForExport,
};
