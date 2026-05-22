const prisma = require('../../lib/prisma');

const REIMBURSEMENT_INCLUDE = {
  expense: {
    include: {
      category:      { select: { id: true, name: true } },
      supplier:      { select: { id: true, name: true } },
      createdByUser: { select: { id: true, fullName: true, email: true } },
    },
  },
  requestedBy: { select: { id: true, fullName: true, email: true } },
  approvedBy:  { select: { id: true, fullName: true, email: true } },
  rejectedBy:  { select: { id: true, fullName: true, email: true } },
  payments:    { orderBy: { createdAt: 'asc' } },
  auditLogs: {
    include: { user: { select: { id: true, fullName: true, email: true } } },
    orderBy: { createdAt: 'asc' },
  },
};

const list = async (workspaceId, { page = 1, limit = 20, status, search } = {}) => {
  page  = Math.max(1, parseInt(page,  10) || 1);
  limit = Math.min(100, parseInt(limit, 10) || 20);

  const where = { workspaceId };
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { expense: { expenseNumber: { contains: search, mode: 'insensitive' } } },
      { expense: { description:   { contains: search, mode: 'insensitive' } } },
      { requestedBy: { fullName: { contains: search, mode: 'insensitive' } } },
    ];
  }

  const [total, items] = await Promise.all([
    prisma.reimbursementRequest.count({ where }),
    prisma.reimbursementRequest.findMany({
      where,
      include: {
        expense:     { select: { id: true, expenseNumber: true, description: true, amount: true, currencyCode: true } },
        requestedBy: { select: { id: true, fullName: true, email: true } },
        approvedBy:  { select: { id: true, fullName: true } },
        rejectedBy:  { select: { id: true, fullName: true } },
        payments:    { select: { id: true, amount: true, paymentDate: true, paymentMethod: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return { items, total, page, limit, pages: Math.ceil(total / limit) };
};

const findById = (id, workspaceId) =>
  prisma.reimbursementRequest.findFirst({ where: { id, workspaceId }, include: REIMBURSEMENT_INCLUDE });

const findByExpenseId = (expenseId, workspaceId) =>
  prisma.reimbursementRequest.findFirst({ where: { expenseId, workspaceId } });

const create = (workspaceId, userId, data) =>
  prisma.reimbursementRequest.create({
    data: { workspaceId, requestedByUserId: userId, ...data },
    include: REIMBURSEMENT_INCLUDE,
  });

const update = (id, data) =>
  prisma.reimbursementRequest.update({ where: { id }, data, include: REIMBURSEMENT_INCLUDE });

const addPayment = async (reimbursementId, workspaceId, userId, data) => {
  const payment = await prisma.reimbursementPayment.create({
    data: {
      reimbursementId,
      workspaceId,
      recordedByUserId: userId,
      ...data,
      paymentDate: new Date(data.paymentDate),
    },
  });

  const allPayments = await prisma.reimbursementPayment.aggregate({
    where: { reimbursementId },
    _sum: { amount: true },
  });
  const paidAmount = Number(allPayments._sum.amount || 0);

  const reimbursement = await prisma.reimbursementRequest.findUnique({ where: { id: reimbursementId } });
  const requested = Number(reimbursement.requestedAmount || 0);
  const newStatus = paidAmount >= requested ? 'fully_paid' : 'partially_paid';

  await prisma.reimbursementRequest.update({
    where: { id: reimbursementId },
    data: { paidAmount, status: newStatus },
  });

  return payment;
};

const addAuditLog = (workspaceId, reimbursementId, userId, action, previousStatus, newStatus, comment) =>
  prisma.approvalAuditLog.create({
    data: {
      workspaceId,
      entityType: 'reimbursement',
      entityId: reimbursementId,
      reimbursementId,
      userId,
      action,
      previousStatus: previousStatus || undefined,
      newStatus:      newStatus      || undefined,
      comment:        comment        || undefined,
    },
  });

const getDashboard = async (workspaceId) => {
  const [pending, approved, rejected, fullyPaid, partiallyPaid] = await Promise.all([
    prisma.reimbursementRequest.count({ where: { workspaceId, status: 'pending_approval' } }),
    prisma.reimbursementRequest.count({ where: { workspaceId, status: 'approved' } }),
    prisma.reimbursementRequest.count({ where: { workspaceId, status: 'rejected' } }),
    prisma.reimbursementRequest.count({ where: { workspaceId, status: 'fully_paid' } }),
    prisma.reimbursementRequest.count({ where: { workspaceId, status: 'partially_paid' } }),
  ]);

  const outstanding = await prisma.reimbursementRequest.aggregate({
    where: { workspaceId, status: { in: ['approved', 'partially_paid'] } },
    _sum: { requestedAmount: true, paidAmount: true },
  });

  const outstandingAmount = Number(outstanding._sum.requestedAmount || 0) - Number(outstanding._sum.paidAmount || 0);

  return { pending, approved, rejected, fullyPaid, partiallyPaid, outstandingAmount };
};

module.exports = { list, findById, findByExpenseId, create, update, addPayment, addAuditLog, getDashboard };
