const prisma = require('../../lib/prisma');

const PAYMENT_INCLUDE = {
  customer: { select: { id: true, name: true, email: true, defaultCurrency: true } },
  allocations: {
    include: {
      invoice: { select: { id: true, invoiceNumber: true, totalAmount: true, paidAmount: true, status: true, dueDate: true } },
    },
    orderBy: { createdAt: 'asc' },
  },
  credits: { select: { id: true, originalAmount: true, remainingAmount: true, currencyCode: true } },
  statusHistory: { orderBy: { createdAt: 'desc' } },
  attachments:   { orderBy: { createdAt: 'desc' } },
};

const listPayments = async (workspaceId, { search, status, customerId, method, dateFrom, dateTo, page = 1, limit = 20, sort = 'paymentDate', order = 'desc' }) => {
  const where = { workspaceId };
  if (status)     where.status = status;
  if (customerId) where.customerId = customerId;
  if (method)     where.paymentMethod = method;
  if (dateFrom || dateTo) {
    where.paymentDate = {};
    if (dateFrom) where.paymentDate.gte = new Date(dateFrom);
    if (dateTo)   where.paymentDate.lte = new Date(dateTo);
  }
  if (search) {
    where.OR = [
      { paymentNumber:   { contains: search, mode: 'insensitive' } },
      { referenceNumber: { contains: search, mode: 'insensitive' } },
      { bankReference:   { contains: search, mode: 'insensitive' } },
      { chequeNumber:    { contains: search, mode: 'insensitive' } },
      { customer:        { name: { contains: search, mode: 'insensitive' } } },
    ];
  }

  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    prisma.payment.findMany({
      where, skip, take: limit,
      orderBy: { [sort]: order },
      include: { customer: { select: { id: true, name: true } } },
    }),
    prisma.payment.count({ where }),
  ]);

  return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
};

const findById = (id, workspaceId) =>
  prisma.payment.findFirst({ where: { id, workspaceId }, include: PAYMENT_INCLUDE });

const findByIdSimple = (id, workspaceId) =>
  prisma.payment.findFirst({ where: { id, workspaceId } });

const create = async (workspaceId, userId, data) => {
  const settings = await prisma.companySettings.findUnique({ where: { workspaceId } });
  const prefix = settings?.paymentPrefix || 'PAY';
  const seq    = settings?.nextPaymentNumber || 1;
  const paymentNumber = `${prefix}-${String(seq).padStart(6, '0')}`;

  await prisma.companySettings.update({
    where: { workspaceId },
    data:  { nextPaymentNumber: seq + 1 },
  });

  return prisma.payment.create({
    data: { workspaceId, createdByUserId: userId, paymentNumber, ...data },
    include: PAYMENT_INCLUDE,
  });
};

const update = (id, data) =>
  prisma.payment.update({ where: { id }, data, include: PAYMENT_INCLUDE });

const updateStatus = (id, status, extra = {}) =>
  prisma.payment.update({ where: { id }, data: { status, ...extra } });

const addStatusHistory = (paymentId, workspaceId, fromStatus, toStatus, changedById, reason = null) =>
  prisma.paymentStatusHistory.create({ data: { paymentId, workspaceId, fromStatus, toStatus, changedById, reason } });

// ── Allocations ─────────────────────────────────────────────

const createAllocation = (data) =>
  prisma.paymentAllocation.create({ data });

const deleteAllocation = (id) =>
  prisma.paymentAllocation.delete({ where: { id } });

const findAllocation = (id, workspaceId) =>
  prisma.paymentAllocation.findFirst({ where: { id, workspaceId }, include: { payment: true, invoice: true } });

const getAllocationsForPayment = (paymentId) =>
  prisma.paymentAllocation.findMany({ where: { paymentId }, include: { invoice: { select: { id: true, invoiceNumber: true, totalAmount: true, paidAmount: true } } } });

// ── Credits ─────────────────────────────────────────────────

const createCredit = (data) =>
  prisma.customerCredit.create({ data });

const findCreditById = (id, workspaceId) =>
  prisma.customerCredit.findFirst({ where: { id, workspaceId }, include: { customer: { select: { id: true, name: true } }, transactions: true } });

const updateCredit = (id, data) =>
  prisma.customerCredit.update({ where: { id }, data });

const listCredits = (workspaceId, customerId) => {
  const where = { workspaceId, remainingAmount: { gt: 0 } };
  if (customerId) where.customerId = customerId;
  return prisma.customerCredit.findMany({ where, include: { customer: { select: { id: true, name: true } } }, orderBy: { createdAt: 'desc' } });
};

const createCreditTransaction = (data) =>
  prisma.customerCreditTransaction.create({ data });

// ── Attachments ─────────────────────────────────────────────

const createAttachment = (data) => prisma.paymentAttachment.create({ data });
const findAttachment   = (id, workspaceId) => prisma.paymentAttachment.findFirst({ where: { id, workspaceId } });
const listAttachments  = (paymentId, workspaceId) => prisma.paymentAttachment.findMany({ where: { paymentId, workspaceId }, orderBy: { createdAt: 'desc' } });
const deleteAttachment = (id) => prisma.paymentAttachment.delete({ where: { id } });

// ── Stats ────────────────────────────────────────────────────

const getStats = async (workspaceId) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  const [counts, todaySum, monthSum, unallocatedSum, creditSum] = await Promise.all([
    prisma.payment.groupBy({ by: ['status'], where: { workspaceId }, _count: { id: true }, _sum: { amount: true } }),
    prisma.payment.aggregate({ where: { workspaceId, status: { notIn: ['reversed', 'voided'] }, paymentDate: { gte: today } }, _sum: { amount: true } }),
    prisma.payment.aggregate({ where: { workspaceId, status: { notIn: ['reversed', 'voided'] }, paymentDate: { gte: monthStart } }, _sum: { amount: true } }),
    prisma.payment.aggregate({ where: { workspaceId, status: 'unallocated' }, _sum: { unallocatedAmount: true } }),
    prisma.customerCredit.aggregate({ where: { workspaceId, remainingAmount: { gt: 0 } }, _sum: { remainingAmount: true } }),
  ]);

  return { counts, todaySum, monthSum, unallocatedSum, creditSum };
};

// ── Invoice helpers ──────────────────────────────────────────

const getInvoiceForAllocation = (invoiceId, workspaceId) =>
  prisma.invoice.findFirst({ where: { id: invoiceId, workspaceId } });

const updateInvoicePaidAmount = (invoiceId, paidAmount, status, extra = {}) =>
  prisma.invoice.update({ where: { id: invoiceId }, data: { paidAmount, status, ...extra } });

module.exports = {
  listPayments, findById, findByIdSimple, create, update, updateStatus, addStatusHistory,
  createAllocation, deleteAllocation, findAllocation, getAllocationsForPayment,
  createCredit, findCreditById, updateCredit, listCredits, createCreditTransaction,
  createAttachment, findAttachment, listAttachments, deleteAttachment,
  getStats, getInvoiceForAllocation, updateInvoicePaidAmount,
};
