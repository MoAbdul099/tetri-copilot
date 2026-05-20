const prisma = require('../../lib/prisma');

const OPEN_STATUSES = ['issued', 'sent', 'partially_paid', 'overdue'];

// ── Aging helpers ─────────────────────────────────────────

const agingBucket = (daysOverdue) => {
  if (daysOverdue <= 0) return 'current';
  if (daysOverdue <= 30) return '1_30';
  if (daysOverdue <= 60) return '31_60';
  if (daysOverdue <= 90) return '61_90';
  if (daysOverdue <= 120) return '91_120';
  return '120_plus';
};

const daysDiff = (dueDate) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  return Math.floor((today - due) / (1000 * 60 * 60 * 24));
};

// ── Dashboard summary ──────────────────────────────────────

const getSummary = async (workspaceId) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [openInvoices, creditBalances, totalCustomers] = await Promise.all([
    prisma.invoice.findMany({
      where: { workspaceId, status: { in: OPEN_STATUSES } },
      select: {
        id: true, totalAmount: true, paidAmount: true,
        dueDate: true, status: true, customerId: true,
      },
    }),
    prisma.customerCredit.findMany({
      where: { workspaceId },
      select: { remainingAmount: true },
    }),
    prisma.customer.count({ where: { workspaceId, isActive: true } }),
  ]);

  let totalReceivables = 0;
  let currentReceivables = 0;
  let overdueReceivables = 0;

  for (const inv of openInvoices) {
    const outstanding = Number(inv.totalAmount) - Number(inv.paidAmount);
    if (outstanding <= 0) continue;
    totalReceivables += outstanding;
    const due = inv.dueDate ? new Date(inv.dueDate) : null;
    if (due && due < today) {
      overdueReceivables += outstanding;
    } else {
      currentReceivables += outstanding;
    }
  }

  const totalCreditBalance = creditBalances.reduce((s, c) => s + Number(c.remainingAmount), 0);

  return {
    totalReceivables,
    currentReceivables,
    overdueReceivables,
    creditBalance: totalCreditBalance,
    openInvoiceCount: openInvoices.filter(i => (Number(i.totalAmount) - Number(i.paidAmount)) > 0).length,
    activeCustomers: totalCustomers,
  };
};

// ── Aging analysis ─────────────────────────────────────────

const getAging = async (workspaceId, { customerId } = {}) => {
  const where = { workspaceId, status: { in: OPEN_STATUSES } };
  if (customerId) where.customerId = customerId;

  const invoices = await prisma.invoice.findMany({
    where,
    select: {
      id: true, invoiceNumber: true, issueDate: true, dueDate: true,
      totalAmount: true, paidAmount: true, status: true, customerId: true,
      currencyCode: true,
      customer: { select: { id: true, name: true, customerCode: true } },
    },
  });

  const buckets = { current: 0, '1_30': 0, '31_60': 0, '61_90': 0, '91_120': 0, '120_plus': 0 };
  const rows = [];

  for (const inv of invoices) {
    const outstanding = Number(inv.totalAmount) - Number(inv.paidAmount);
    if (outstanding <= 0) continue;
    const days = inv.dueDate ? daysDiff(inv.dueDate) : 0;
    const bucket = agingBucket(days);
    buckets[bucket] += outstanding;
    rows.push({
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      customer: inv.customer,
      issueDate: inv.issueDate,
      dueDate: inv.dueDate,
      outstanding,
      daysOverdue: Math.max(0, days),
      bucket,
      status: inv.status,
      currencyCode: inv.currencyCode,
    });
  }

  rows.sort((a, b) => b.daysOverdue - a.daysOverdue);
  return { buckets, invoices: rows, total: Object.values(buckets).reduce((s, v) => s + v, 0) };
};

// ── Customer receivables list ──────────────────────────────

const getCustomerReceivables = async (workspaceId, { search, page = 1, limit = 20, sortBy = 'balance', sortOrder = 'desc' } = {}) => {
  page  = Math.max(1, parseInt(page,  10) || 1);
  limit = Math.min(100, parseInt(limit, 10) || 20);

  const where = { workspaceId, isActive: true };
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { customerCode: { contains: search, mode: 'insensitive' } },
    ];
  }

  const customers = await prisma.customer.findMany({
    where,
    select: {
      id: true, name: true, customerCode: true, email: true, phone: true,
      invoices: {
        where: { status: { in: OPEN_STATUSES } },
        select: { totalAmount: true, paidAmount: true, dueDate: true, status: true },
      },
      payments: {
        where: { status: { in: ['posted', 'allocated', 'partially_allocated', 'unallocated'] } },
        select: { paymentDate: true },
        orderBy: { paymentDate: 'desc' },
        take: 1,
      },
    },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const rows = customers.map((c) => {
    let totalBalance = 0;
    let overdueBalance = 0;
    let openCount = 0;

    for (const inv of c.invoices) {
      const outstanding = Number(inv.totalAmount) - Number(inv.paidAmount);
      if (outstanding <= 0) continue;
      totalBalance += outstanding;
      openCount++;
      if (inv.dueDate && new Date(inv.dueDate) < today) overdueBalance += outstanding;
    }

    return {
      id: c.id,
      name: c.name,
      customerCode: c.customerCode,
      email: c.email,
      phone: c.phone,
      totalBalance,
      overdueBalance,
      openInvoiceCount: openCount,
      lastPaymentDate: c.payments[0]?.paymentDate || null,
    };
  }).filter((r) => r.totalBalance > 0 || search);

  // Sort
  rows.sort((a, b) => {
    const field = sortBy === 'name' ? 'name' : sortBy === 'overdue' ? 'overdueBalance' : 'totalBalance';
    const av = typeof a[field] === 'string' ? a[field].toLowerCase() : a[field];
    const bv = typeof b[field] === 'string' ? b[field].toLowerCase() : b[field];
    return sortOrder === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
  });

  const total = rows.length;
  const items = rows.slice((page - 1) * limit, page * limit);
  return { items, total, page, limit, pages: Math.ceil(total / limit) };
};

// ── Customer receivable profile ────────────────────────────

const getCustomerProfile = async (workspaceId, customerId) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [customer, openInvoices, recentPayments, credits, collections] = await Promise.all([
    prisma.customer.findFirst({
      where: { id: customerId, workspaceId },
      select: {
        id: true, name: true, customerCode: true, email: true, phone: true,
        addressLine1: true, city: true, country: true,
      },
    }),
    prisma.invoice.findMany({
      where: { workspaceId, customerId, status: { in: OPEN_STATUSES } },
      select: {
        id: true, invoiceNumber: true, issueDate: true, dueDate: true,
        totalAmount: true, paidAmount: true, status: true, currencyCode: true,
      },
      orderBy: { dueDate: 'asc' },
    }),
    prisma.payment.findMany({
      where: { workspaceId, customerId, status: { notIn: ['draft', 'voided'] } },
      select: { id: true, paymentNumber: true, paymentDate: true, amount: true, currencyCode: true, status: true },
      orderBy: { paymentDate: 'desc' },
      take: 10,
    }),
    prisma.customerCredit.findMany({
      where: { workspaceId, customerId },
      select: { id: true, originalAmount: true, remainingAmount: true, currencyCode: true },
    }),
    prisma.collectionActivity.findMany({
      where: { workspaceId, customerId },
      select: {
        id: true, activityType: true, status: true, activityDate: true,
        notes: true, outcome: true, nextFollowUpDate: true,
        assignedUser: { select: { id: true, fullName: true } },
      },
      orderBy: { activityDate: 'desc' },
      take: 5,
    }),
  ]);

  if (!customer) return null;

  let totalBalance = 0;
  let overdueBalance = 0;

  const invoiceRows = openInvoices.map((inv) => {
    const outstanding = Number(inv.totalAmount) - Number(inv.paidAmount);
    const days = inv.dueDate ? daysDiff(inv.dueDate) : 0;
    totalBalance += outstanding > 0 ? outstanding : 0;
    if (outstanding > 0 && days > 0) overdueBalance += outstanding;
    return { ...inv, outstanding, daysOverdue: Math.max(0, days), bucket: agingBucket(days) };
  }).filter((i) => i.outstanding > 0);

  const creditBalance = credits.reduce((s, c) => s + Number(c.remainingAmount), 0);

  return {
    customer,
    summary: { totalBalance, overdueBalance, creditBalance, openInvoiceCount: invoiceRows.length },
    openInvoices: invoiceRows,
    recentPayments,
    recentCollections: collections,
  };
};

// ── Top debtors ────────────────────────────────────────────

const getTopDebtors = async (workspaceId, limit = 10) => {
  const result = await getCustomerReceivables(workspaceId, { limit: 200 });
  return result.items.slice(0, limit);
};

module.exports = {
  getSummary,
  getAging,
  getCustomerReceivables,
  getCustomerProfile,
  getTopDebtors,
};
