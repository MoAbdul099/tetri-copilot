const prisma = require('../../lib/prisma');

// ── Statement data generation ──────────────────────────────

const generateStatementData = async (workspaceId, customerId, { periodStart, periodEnd, statementType = 'full' }) => {
  const start = new Date(periodStart);
  const end   = new Date(periodEnd);
  end.setHours(23, 59, 59, 999);

  const [customer, company, invoices, payments, credits] = await Promise.all([
    prisma.customer.findFirst({
      where: { id: customerId, workspaceId },
      select: {
        id: true, name: true, customerCode: true, email: true, phone: true,
        addressLine1: true, addressLine2: true, city: true, stateRegion: true,
        postalCode: true, country: true, taxNumber: true,
      },
    }),
    prisma.company.findFirst({
      where: { workspaceId },
      select: {
        companyName: true, email: true, phone: true, website: true,
        addressLine1: true, city: true, postalCode: true, taxNumber: true,
      },
    }),
    prisma.invoice.findMany({
      where: {
        workspaceId, customerId,
        issueDate: { gte: start, lte: end },
        status: { not: 'draft' },
      },
      select: {
        id: true, invoiceNumber: true, issueDate: true, dueDate: true,
        totalAmount: true, paidAmount: true, status: true, currencyCode: true,
      },
      orderBy: { issueDate: 'asc' },
    }),
    prisma.payment.findMany({
      where: {
        workspaceId, customerId,
        paymentDate: { gte: start, lte: end },
        status: { in: ['posted', 'allocated', 'partially_allocated', 'unallocated'] },
      },
      select: {
        id: true, paymentNumber: true, paymentDate: true, amount: true,
        currencyCode: true, paymentMethod: true, status: true,
      },
      orderBy: { paymentDate: 'asc' },
    }),
    prisma.customerCredit.findMany({
      where: { workspaceId, customerId },
      select: { id: true, originalAmount: true, remainingAmount: true, currencyCode: true, createdAt: true },
    }),
  ]);

  if (!customer) return null;

  // Build transactions list for full statement
  const transactions = [];

  if (statementType !== 'payment') {
    invoices.forEach((inv) => {
      transactions.push({
        date: inv.issueDate,
        type: 'invoice',
        reference: inv.invoiceNumber,
        id: inv.id,
        debit: Number(inv.totalAmount),
        credit: 0,
        status: inv.status,
        dueDate: inv.dueDate,
        currencyCode: inv.currencyCode,
      });
    });
  }

  if (statementType !== 'outstanding') {
    payments.forEach((pay) => {
      transactions.push({
        date: pay.paymentDate,
        type: 'payment',
        reference: pay.paymentNumber,
        id: pay.id,
        debit: 0,
        credit: Number(pay.amount),
        status: pay.status,
        currencyCode: pay.currencyCode,
      });
    });
  }

  transactions.sort((a, b) => new Date(a.date) - new Date(b.date));

  // Running balance
  let runningBalance = 0;
  transactions.forEach((t) => {
    runningBalance += t.debit - t.credit;
    t.balance = runningBalance;
  });

  const outstandingBalance = invoices.reduce((s, inv) => {
    const o = Number(inv.totalAmount) - Number(inv.paidAmount);
    return s + (o > 0 ? o : 0);
  }, 0);

  const creditBalance = credits.reduce((s, c) => s + Number(c.remainingAmount), 0);

  const openInvoices = invoices.filter((inv) => {
    const o = Number(inv.totalAmount) - Number(inv.paidAmount);
    return o > 0 && ['issued', 'sent', 'partially_paid', 'overdue'].includes(inv.status);
  }).map((inv) => ({
    ...inv,
    outstanding: Number(inv.totalAmount) - Number(inv.paidAmount),
  }));

  return {
    customer,
    company,
    periodStart,
    periodEnd,
    statementType,
    generatedAt: new Date().toISOString(),
    transactions: statementType === 'outstanding' ? [] : transactions,
    openInvoices,
    summary: {
      totalInvoiced: invoices.reduce((s, i) => s + Number(i.totalAmount), 0),
      totalPaid: payments.reduce((s, p) => s + Number(p.amount), 0),
      outstandingBalance,
      creditBalance,
      closingBalance: runningBalance,
    },
  };
};

// ── Statement run history ──────────────────────────────────

const saveStatementRun = (workspaceId, customerId, userId, { statementType, periodStart, periodEnd }) =>
  prisma.statementRun.create({
    data: {
      workspaceId, customerId,
      statementType, periodStart: new Date(periodStart), periodEnd: new Date(periodEnd),
      generatedByUserId: userId,
    },
    include: {
      customer: { select: { id: true, name: true, customerCode: true } },
    },
  });

const listStatementRuns = async (workspaceId, { page = 1, limit = 20, customerId } = {}) => {
  page  = Math.max(1, parseInt(page,  10) || 1);
  limit = Math.min(100, parseInt(limit, 10) || 20);

  const where = { workspaceId };
  if (customerId) where.customerId = customerId;

  const [total, items] = await Promise.all([
    prisma.statementRun.count({ where }),
    prisma.statementRun.findMany({
      where,
      include: { customer: { select: { id: true, name: true, customerCode: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return { items, total, page, limit, pages: Math.ceil(total / limit) };
};

module.exports = { generateStatementData, saveStatementRun, listStatementRuns };
