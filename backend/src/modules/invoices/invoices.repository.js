const prisma = require('../../lib/prisma');

const INVOICE_INCLUDE = {
  customer: {
    select: {
      id: true, name: true, customerCode: true, email: true, phone: true,
      addressLine1: true, addressLine2: true, city: true, stateRegion: true,
      postalCode: true, country: true, taxNumber: true, vatNumber: true,
    },
  },
  createdByUser: { select: { id: true, fullName: true, email: true } },
  items:         { orderBy: { itemOrder: 'asc' } },
  statusHistory: { orderBy: { createdAt: 'desc' }, take: 20 },
  deliveryLogs:  { orderBy: { createdAt: 'desc' } },
  attachments:   { orderBy: { createdAt: 'desc' } },
};

const INVOICE_LIST_INCLUDE = {
  customer: { select: { id: true, name: true, customerCode: true } },
  createdByUser: { select: { id: true, fullName: true } },
};

// ── Number generation ──────────────────────────────────────
const generateInvoiceNumber = async (workspaceId) => {
  return prisma.$transaction(async (tx) => {
    const settings = await tx.companySettings.findUnique({ where: { workspaceId } });
    const prefix = settings?.invoicePrefix || 'INV';
    const seq    = settings?.nextInvoiceNumber ?? 1;
    const padded = String(seq).padStart(6, '0');
    const number = `${prefix}-${padded}`;

    await tx.companySettings.update({
      where: { workspaceId },
      data:  { nextInvoiceNumber: seq + 1 },
    });

    return number;
  });
};

// ── Invoices ───────────────────────────────────────────────
const listInvoices = async (workspaceId, {
  page = 1, limit = 20, search, status, customerId,
  dateFrom, dateTo, sortBy = 'createdAt', sortOrder = 'desc',
} = {}) => {
  const where = { workspaceId };

  if (status) where.status = status;
  if (customerId) where.customerId = customerId;
  if (dateFrom || dateTo) {
    where.issueDate = {};
    if (dateFrom) where.issueDate.gte = new Date(dateFrom);
    if (dateTo)   where.issueDate.lte = new Date(dateTo);
  }
  if (search) {
    where.OR = [
      { invoiceNumber:   { contains: search, mode: 'insensitive' } },
      { referenceNumber: { contains: search, mode: 'insensitive' } },
      { poNumber:        { contains: search, mode: 'insensitive' } },
      { customer: { name:         { contains: search, mode: 'insensitive' } } },
      { customer: { customerCode: { contains: search, mode: 'insensitive' } } },
    ];
  }

  const validSortFields = ['invoiceNumber', 'issueDate', 'dueDate', 'totalAmount', 'status', 'createdAt'];
  const orderField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';

  const [total, items] = await Promise.all([
    prisma.invoice.count({ where }),
    prisma.invoice.findMany({
      where,
      include:  INVOICE_LIST_INCLUDE,
      orderBy:  { [orderField]: sortOrder === 'asc' ? 'asc' : 'desc' },
      skip:     (page - 1) * limit,
      take:     limit,
    }),
  ]);

  return { items, total, page, limit, pages: Math.ceil(total / limit) };
};

const findById = (id, workspaceId) =>
  prisma.invoice.findFirst({ where: { id, workspaceId }, include: INVOICE_INCLUDE });

const findByIdSimple = (id, workspaceId) =>
  prisma.invoice.findFirst({ where: { id, workspaceId } });

const create = async (workspaceId, userId, data, items) => {
  const invoiceNumber = await generateInvoiceNumber(workspaceId);
  return prisma.invoice.create({
    data: {
      ...data,
      workspaceId,
      invoiceNumber,
      createdByUserId: userId,
      items: { create: items },
    },
    include: INVOICE_INCLUDE,
  });
};

const update = (id, data, items) =>
  prisma.$transaction(async (tx) => {
    if (items !== undefined) {
      await tx.invoiceItem.deleteMany({ where: { invoiceId: id } });
    }
    return tx.invoice.update({
      where: { id },
      data: {
        ...data,
        ...(items !== undefined ? { items: { create: items } } : {}),
      },
      include: INVOICE_INCLUDE,
    });
  });

const updateStatus = (id, status, extraFields = {}) =>
  prisma.invoice.update({ where: { id }, data: { status, ...extraFields } });

const deleteById = (id) => prisma.invoice.delete({ where: { id } });

const addStatusHistory = (invoiceId, workspaceId, fromStatus, toStatus, changedById, reason) =>
  prisma.invoiceStatusHistory.create({
    data: { invoiceId, workspaceId, fromStatus, toStatus, changedById, reason },
  });

// ── Stats ─────────────────────────────────────────────────
const getStats = async (workspaceId) => {
  const [counts, overdueSums, recentInvoices, upcomingDue] = await Promise.all([
    prisma.invoice.groupBy({
      by:     ['status'],
      where:  { workspaceId },
      _count: { id: true },
      _sum:   { totalAmount: true },
    }),
    prisma.invoice.aggregate({
      where:  { workspaceId, status: { in: ['issued', 'sent', 'overdue'] }, dueDate: { lt: new Date() } },
      _sum:   { totalAmount: true },
      _count: { id: true },
    }),
    prisma.invoice.findMany({
      where:   { workspaceId },
      include: { customer: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
      take:    5,
    }),
    prisma.invoice.findMany({
      where: {
        workspaceId,
        status:  { in: ['issued', 'sent'] },
        dueDate: { gte: new Date(), lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
      },
      include: { customer: { select: { id: true, name: true } } },
      orderBy: { dueDate: 'asc' },
      take:    10,
    }),
  ]);

  return { counts, overdueSums, recentInvoices, upcomingDue };
};

// ── Attachments ────────────────────────────────────────────
const listAttachments = (invoiceId, workspaceId) =>
  prisma.invoiceAttachment.findMany({
    where:   { invoiceId, workspaceId },
    orderBy: { createdAt: 'desc' },
  });

const findAttachment = (id, workspaceId) =>
  prisma.invoiceAttachment.findFirst({ where: { id, workspaceId } });

const createAttachment = (data) => prisma.invoiceAttachment.create({ data });

const deleteAttachment = (id) => prisma.invoiceAttachment.delete({ where: { id } });

// ── Delivery log ───────────────────────────────────────────
const addDeliveryLog = (data) => prisma.invoiceDeliveryLog.create({ data });

module.exports = {
  generateInvoiceNumber,
  listInvoices,
  findById,
  findByIdSimple,
  create,
  update,
  updateStatus,
  deleteById,
  addStatusHistory,
  getStats,
  listAttachments,
  findAttachment,
  createAttachment,
  deleteAttachment,
  addDeliveryLog,
};
