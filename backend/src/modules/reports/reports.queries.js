const prisma = require('../../lib/prisma');

const fmtNum = (v) => Number(v || 0);

const parseDate = (s) => (s ? new Date(s) : null);

const defaultFrom = () => {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
};

const defaultTo = () => new Date();

// ── FINANCIAL_SUMMARY ─────────────────────────────────────────

async function runFinancialSummary(workspaceId, filters = {}) {
  const from = parseDate(filters.dateFrom) || defaultFrom();
  const to   = parseDate(filters.dateTo)   || defaultTo();

  const [invoicesAgg, paymentsAgg, expensesAgg] = await Promise.all([
    prisma.invoice.aggregate({
      where: { workspaceId, issueDate: { gte: from, lte: to }, status: { notIn: ['cancelled', 'void', 'draft'] } },
      _sum: { totalAmount: true, paidAmount: true },
      _count: true,
    }),
    prisma.payment.aggregate({
      where: { workspaceId, paymentDate: { gte: from, lte: to }, status: { not: 'reversed' } },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.expense.aggregate({
      where: { workspaceId, expenseDate: { gte: from, lte: to }, isDeleted: false, status: { notIn: ['cancelled'] } },
      _sum: { amount: true },
      _count: true,
    }),
  ]);

  const revenue     = fmtNum(invoicesAgg._sum.totalAmount);
  const collected   = fmtNum(paymentsAgg._sum.amount);
  const expenses    = fmtNum(expensesAgg._sum.amount);

  const columns = ['Metric', 'Value'];
  const rows = [
    { Metric: 'Revenue (Invoiced)', Value: revenue },
    { Metric: 'Collections (Payments)', Value: collected },
    { Metric: 'Expenses', Value: expenses },
    { Metric: 'Net Position', Value: collected - expenses },
    { Metric: 'Invoice Count', Value: invoicesAgg._count },
    { Metric: 'Payment Count', Value: paymentsAgg._count },
    { Metric: 'Expense Count', Value: expensesAgg._count },
  ];

  return { columns, rows, totals: null, rowCount: rows.length };
}

// ── REVENUE ───────────────────────────────────────────────────

async function runRevenue(workspaceId, filters = {}, pagination = {}) {
  const from   = parseDate(filters.dateFrom) || defaultFrom();
  const to     = parseDate(filters.dateTo)   || defaultTo();
  const page   = Math.max(1, parseInt(pagination.page) || 1);
  const limit  = Math.min(500, parseInt(pagination.limit) || 50);
  const skip   = (page - 1) * limit;

  const where = {
    workspaceId,
    issueDate: { gte: from, lte: to },
    status: { notIn: ['draft'] },
  };
  if (filters.customerId) where.customerId = filters.customerId;
  if (filters.status)     where.status     = filters.status;
  if (filters.currency)   where.currencyCode = filters.currency;

  const [invoices, total] = await Promise.all([
    prisma.invoice.findMany({
      where, skip, take: limit,
      orderBy: { issueDate: 'desc' },
      select: {
        invoiceNumber: true, issueDate: true, dueDate: true, status: true,
        currencyCode: true, subtotal: true, taxTotal: true, totalAmount: true, paidAmount: true,
        customer: { select: { displayName: true } },
      },
    }),
    prisma.invoice.count({ where }),
  ]);

  const columns = ['Invoice #', 'Customer', 'Issue Date', 'Due Date', 'Status', 'Currency', 'Subtotal', 'Tax', 'Total', 'Paid'];
  const rows = invoices.map((i) => ({
    'Invoice #': i.invoiceNumber,
    'Customer':  i.customer?.displayName || '—',
    'Issue Date': i.issueDate?.toISOString().split('T')[0],
    'Due Date':   i.dueDate?.toISOString().split('T')[0] || '—',
    'Status':     i.status,
    'Currency':   i.currencyCode,
    'Subtotal':   fmtNum(i.subtotal),
    'Tax':        fmtNum(i.taxTotal),
    'Total':      fmtNum(i.totalAmount),
    'Paid':       fmtNum(i.paidAmount),
  }));

  const totals = {
    'Subtotal': rows.reduce((s, r) => s + r['Subtotal'], 0),
    'Tax':      rows.reduce((s, r) => s + r['Tax'], 0),
    'Total':    rows.reduce((s, r) => s + r['Total'], 0),
    'Paid':     rows.reduce((s, r) => s + r['Paid'], 0),
  };

  return { columns, rows, totals, rowCount: total, page, limit };
}

// ── COLLECTIONS ───────────────────────────────────────────────

async function runCollections(workspaceId, filters = {}, pagination = {}) {
  const from  = parseDate(filters.dateFrom) || defaultFrom();
  const to    = parseDate(filters.dateTo)   || defaultTo();
  const page  = Math.max(1, parseInt(pagination.page) || 1);
  const limit = Math.min(500, parseInt(pagination.limit) || 50);
  const skip  = (page - 1) * limit;

  const where = {
    workspaceId,
    paymentDate: { gte: from, lte: to },
    status: { not: 'reversed' },
  };
  if (filters.customerId)    where.customerId   = filters.customerId;
  if (filters.paymentMethod) where.method       = filters.paymentMethod;
  if (filters.currency)      where.currencyCode = filters.currency;

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where, skip, take: limit,
      orderBy: { paymentDate: 'desc' },
      select: {
        referenceNumber: true, paymentDate: true, method: true,
        amount: true, currencyCode: true, status: true,
        customer: { select: { displayName: true } },
        allocations: { select: { invoice: { select: { invoiceNumber: true } }, allocatedAmount: true } },
      },
    }),
    prisma.payment.count({ where }),
  ]);

  const columns = ['Reference', 'Customer', 'Date', 'Method', 'Currency', 'Amount', 'Status', 'Invoice(s)'];
  const rows = payments.map((p) => ({
    'Reference': p.referenceNumber || '—',
    'Customer':  p.customer?.displayName || '—',
    'Date':      p.paymentDate?.toISOString().split('T')[0],
    'Method':    p.method || '—',
    'Currency':  p.currencyCode,
    'Amount':    fmtNum(p.amount),
    'Status':    p.status,
    'Invoice(s)': p.allocations.map((a) => a.invoice?.invoiceNumber).filter(Boolean).join(', ') || '—',
  }));

  const totals = { 'Amount': rows.reduce((s, r) => s + r['Amount'], 0) };
  return { columns, rows, totals, rowCount: total, page, limit };
}

// ── OUTSTANDING_RECEIVABLES ───────────────────────────────────

async function runOutstandingReceivables(workspaceId, filters = {}, pagination = {}) {
  const today = new Date();
  const page  = Math.max(1, parseInt(pagination.page) || 1);
  const limit = Math.min(500, parseInt(pagination.limit) || 50);
  const skip  = (page - 1) * limit;

  const where = {
    workspaceId,
    status: { in: ['sent', 'issued', 'partially_paid'] },
  };
  if (filters.customerId) where.customerId = filters.customerId;
  if (filters.currency)   where.currencyCode = filters.currency;
  if (filters.dateFrom)   where.dueDate = { gte: parseDate(filters.dateFrom) };
  if (filters.dateTo)     where.dueDate = { ...(where.dueDate || {}), lte: parseDate(filters.dateTo) };
  if (filters.overdueOnly === 'true') where.dueDate = { lt: today };

  const [invoices, total] = await Promise.all([
    prisma.invoice.findMany({
      where, skip, take: limit,
      orderBy: { dueDate: 'asc' },
      select: {
        invoiceNumber: true, issueDate: true, dueDate: true, status: true,
        currencyCode: true, totalAmount: true, paidAmount: true,
        customer: { select: { displayName: true } },
      },
    }),
    prisma.invoice.count({ where }),
  ]);

  const columns = ['Customer', 'Invoice #', 'Issue Date', 'Due Date', 'Days Overdue', 'Total', 'Paid', 'Outstanding', 'Status'];
  const rows = invoices.map((i) => {
    const outstanding = fmtNum(i.totalAmount) - fmtNum(i.paidAmount);
    const overdueDays = i.dueDate && i.dueDate < today
      ? Math.floor((today - new Date(i.dueDate)) / 86400000)
      : 0;
    return {
      'Customer':     i.customer?.displayName || '—',
      'Invoice #':    i.invoiceNumber,
      'Issue Date':   i.issueDate?.toISOString().split('T')[0],
      'Due Date':     i.dueDate?.toISOString().split('T')[0] || '—',
      'Days Overdue': overdueDays,
      'Total':        fmtNum(i.totalAmount),
      'Paid':         fmtNum(i.paidAmount),
      'Outstanding':  outstanding,
      'Status':       i.status,
    };
  });

  const totals = {
    'Total':       rows.reduce((s, r) => s + r['Total'], 0),
    'Paid':        rows.reduce((s, r) => s + r['Paid'], 0),
    'Outstanding': rows.reduce((s, r) => s + r['Outstanding'], 0),
  };
  return { columns, rows, totals, rowCount: total, page, limit };
}

// ── AGING ─────────────────────────────────────────────────────

async function runAging(workspaceId, filters = {}) {
  const asOf  = filters.asOfDate ? new Date(filters.asOfDate) : new Date();

  const where = {
    workspaceId,
    status: { in: ['sent', 'issued', 'partially_paid'] },
  };
  if (filters.customerId) where.customerId = filters.customerId;
  if (filters.currency)   where.currencyCode = filters.currency;

  const invoices = await prisma.invoice.findMany({
    where,
    select: {
      totalAmount: true, paidAmount: true, dueDate: true,
      customer: { select: { id: true, displayName: true } },
    },
  });

  const map = {};
  for (const inv of invoices) {
    const balance = fmtNum(inv.totalAmount) - fmtNum(inv.paidAmount);
    if (balance <= 0) continue;
    const customerId = inv.customer?.id || 'unknown';
    if (!map[customerId]) {
      map[customerId] = { Customer: inv.customer?.displayName || 'Unknown', Current: 0, '1-30': 0, '31-60': 0, '61-90': 0, '90+': 0, Total: 0 };
    }
    const diff = inv.dueDate ? Math.floor((asOf - new Date(inv.dueDate)) / 86400000) : 0;
    if (diff <= 0)        map[customerId]['Current'] += balance;
    else if (diff <= 30)  map[customerId]['1-30']    += balance;
    else if (diff <= 60)  map[customerId]['31-60']   += balance;
    else if (diff <= 90)  map[customerId]['61-90']   += balance;
    else                  map[customerId]['90+']     += balance;
    map[customerId]['Total'] += balance;
  }

  const rows = Object.values(map).sort((a, b) => b.Total - a.Total).map((r) =>
    Object.fromEntries(Object.entries(r).map(([k, v]) => [k, typeof v === 'number' ? Math.round(v * 100) / 100 : v]))
  );
  const columns = ['Customer', 'Current', '1-30', '31-60', '61-90', '90+', 'Total'];
  const totals = { Current: 0, '1-30': 0, '31-60': 0, '61-90': 0, '90+': 0, Total: 0 };
  for (const r of rows) { for (const k of Object.keys(totals)) totals[k] += r[k] || 0; }

  return { columns, rows, totals, rowCount: rows.length };
}

// ── EXPENSE_DETAIL ────────────────────────────────────────────

async function runExpenseDetail(workspaceId, filters = {}, pagination = {}) {
  const from  = parseDate(filters.dateFrom) || defaultFrom();
  const to    = parseDate(filters.dateTo)   || defaultTo();
  const page  = Math.max(1, parseInt(pagination.page) || 1);
  const limit = Math.min(500, parseInt(pagination.limit) || 50);
  const skip  = (page - 1) * limit;

  const where = { workspaceId, isDeleted: false, expenseDate: { gte: from, lte: to } };
  if (filters.categoryId) where.categoryId   = filters.categoryId;
  if (filters.status)     where.status       = filters.status;
  if (filters.userId)     where.createdByUserId = filters.userId;
  if (filters.currency)   where.currencyCode = filters.currency;

  const [expenses, total] = await Promise.all([
    prisma.expense.findMany({
      where, skip, take: limit,
      orderBy: { expenseDate: 'desc' },
      select: {
        expenseDate: true, vendorName: true, description: true, amount: true,
        currencyCode: true, status: true, expenseNumber: true,
        category:  { select: { name: true } },
        supplier:  { select: { name: true } },
        createdByUser: { select: { fullName: true } },
      },
    }),
    prisma.expense.count({ where }),
  ]);

  const columns = ['Expense #', 'Date', 'Vendor', 'Category', 'Description', 'Amount', 'Currency', 'Status', 'Created By'];
  const rows = expenses.map((e) => ({
    'Expense #':   e.expenseNumber || '—',
    'Date':        e.expenseDate?.toISOString().split('T')[0],
    'Vendor':      e.supplier?.name || e.vendorName || '—',
    'Category':    e.category?.name || '—',
    'Description': e.description,
    'Amount':      fmtNum(e.amount),
    'Currency':    e.currencyCode,
    'Status':      e.status,
    'Created By':  e.createdByUser?.fullName || '—',
  }));

  const totals = { 'Amount': rows.reduce((s, r) => s + r['Amount'], 0) };
  return { columns, rows, totals, rowCount: total, page, limit };
}

// ── EXPENSE_CATEGORY_SUMMARY ──────────────────────────────────

async function runExpenseCategorySummary(workspaceId, filters = {}) {
  const from = parseDate(filters.dateFrom) || defaultFrom();
  const to   = parseDate(filters.dateTo)   || defaultTo();

  const where = { workspaceId, isDeleted: false, expenseDate: { gte: from, lte: to } };
  if (filters.currency) where.currencyCode = filters.currency;

  const grouped = await prisma.expense.groupBy({
    by: ['categoryId'],
    where,
    _sum: { amount: true },
    _count: true,
  });

  const categoryIds = grouped.map((g) => g.categoryId).filter(Boolean);
  const categories  = await prisma.expenseCategory.findMany({
    where: { id: { in: categoryIds } },
    select: { id: true, name: true },
  });
  const catMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));

  const totalAll = grouped.reduce((s, g) => s + fmtNum(g._sum.amount), 0);

  const rows = grouped
    .map((g) => ({
      'Category':    g.categoryId ? catMap[g.categoryId] || '(uncategorised)' : '(uncategorised)',
      'Count':       g._count,
      'Total':       fmtNum(g._sum.amount),
      '% of Total':  totalAll > 0 ? Math.round((fmtNum(g._sum.amount) / totalAll) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b['Total'] - a['Total']);

  const columns = ['Category', 'Count', 'Total', '% of Total'];
  const totals  = { Count: rows.reduce((s, r) => s + r['Count'], 0), Total: totalAll };
  return { columns, rows, totals, rowCount: rows.length };
}

// ── CUSTOMER_BALANCE ──────────────────────────────────────────

async function runCustomerBalance(workspaceId, filters = {}, pagination = {}) {
  const page  = Math.max(1, parseInt(pagination.page) || 1);
  const limit = Math.min(500, parseInt(pagination.limit) || 50);
  const skip  = (page - 1) * limit;

  const where = { workspaceId };
  if (filters.customerId) where.id = filters.customerId;

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({
      where, skip, take: limit,
      orderBy: { displayName: 'asc' },
      select: {
        displayName: true,
        invoices: {
          where: { workspaceId },
          select: { totalAmount: true, paidAmount: true, status: true, dueDate: true },
        },
        payments: {
          where: { workspaceId, status: { not: 'reversed' } },
          orderBy: { paymentDate: 'desc' },
          take: 1,
          select: { paymentDate: true },
        },
      },
    }),
    prisma.customer.count({ where }),
  ]);

  const today = new Date();
  const columns = ['Customer', 'Total Invoices', 'Total Paid', 'Outstanding', 'Overdue', 'Last Payment'];
  const rows = customers.map((c) => {
    const totalInvoiced = c.invoices.reduce((s, i) => s + fmtNum(i.totalAmount), 0);
    const totalPaid     = c.invoices.reduce((s, i) => s + fmtNum(i.paidAmount), 0);
    const outstanding   = totalInvoiced - totalPaid;
    const overdue       = c.invoices
      .filter((i) => ['sent', 'issued', 'partially_paid'].includes(i.status) && i.dueDate && new Date(i.dueDate) < today)
      .reduce((s, i) => s + (fmtNum(i.totalAmount) - fmtNum(i.paidAmount)), 0);
    return {
      'Customer':       c.displayName,
      'Total Invoices': Math.round(totalInvoiced * 100) / 100,
      'Total Paid':     Math.round(totalPaid * 100) / 100,
      'Outstanding':    Math.round(outstanding * 100) / 100,
      'Overdue':        Math.round(overdue * 100) / 100,
      'Last Payment':   c.payments[0]?.paymentDate?.toISOString().split('T')[0] || '—',
    };
  });

  const totals = {
    'Total Invoices': rows.reduce((s, r) => s + r['Total Invoices'], 0),
    'Total Paid':     rows.reduce((s, r) => s + r['Total Paid'], 0),
    'Outstanding':    rows.reduce((s, r) => s + r['Outstanding'], 0),
    'Overdue':        rows.reduce((s, r) => s + r['Overdue'], 0),
  };
  return { columns, rows, totals, rowCount: total, page, limit };
}

// ── CUSTOMER_ACTIVITY ─────────────────────────────────────────

async function runCustomerActivity(workspaceId, filters = {}, pagination = {}) {
  const from  = parseDate(filters.dateFrom) || defaultFrom();
  const to    = parseDate(filters.dateTo)   || defaultTo();
  const page  = Math.max(1, parseInt(pagination.page) || 1);
  const limit = Math.min(500, parseInt(pagination.limit) || 50);
  const skip  = (page - 1) * limit;

  const where = { workspaceId, createdAt: { gte: from, lte: to } };
  if (filters.customerId) where.entityId = filters.customerId;

  const [logs, total] = await Promise.all([
    prisma.activityLog.findMany({
      where, skip, take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        action: true, entityType: true, entityId: true, description: true, createdAt: true,
        user: { select: { fullName: true } },
      },
    }),
    prisma.activityLog.count({ where }),
  ]);

  const columns = ['Date', 'User', 'Action', 'Module', 'Description'];
  const rows = logs.map((l) => ({
    'Date':        l.createdAt?.toISOString().split('T')[0],
    'User':        l.user?.fullName || 'System',
    'Action':      l.action,
    'Module':      l.entityType || '—',
    'Description': l.description || '—',
  }));

  return { columns, rows, totals: null, rowCount: total, page, limit };
}

// ── COMPLIANCE_STATUS ─────────────────────────────────────────

async function runComplianceStatus(workspaceId, filters = {}, pagination = {}) {
  const page  = Math.max(1, parseInt(pagination.page) || 1);
  const limit = Math.min(500, parseInt(pagination.limit) || 50);
  const skip  = (page - 1) * limit;

  const where = { workspaceId };
  if (filters.status)         where.status         = filters.status;
  if (filters.assignedUserId) where.ownerUserId     = filters.assignedUserId;
  if (filters.dateFrom)       where.dueDate         = { gte: parseDate(filters.dateFrom) };
  if (filters.dateTo)         where.dueDate         = { ...(where.dueDate || {}), lte: parseDate(filters.dateTo) };

  const [occurrences, total] = await Promise.all([
    prisma.complianceOccurrence.findMany({
      where, skip, take: limit,
      orderBy: { dueDate: 'asc' },
      select: {
        title: true, dueDate: true, status: true, priority: true, completedAt: true,
        owner: { select: { fullName: true } },
        template: { select: { name: true } },
      },
    }),
    prisma.complianceOccurrence.count({ where }),
  ]);

  const today   = new Date();
  const columns = ['Obligation', 'Template', 'Due Date', 'Status', 'Priority', 'Assigned To', 'Completed', 'Days Remaining'];
  const rows    = occurrences.map((o) => {
    const dueDate   = o.dueDate ? new Date(o.dueDate) : null;
    const remaining = dueDate ? Math.ceil((dueDate - today) / 86400000) : null;
    return {
      'Obligation':    o.title,
      'Template':      o.template?.name || '—',
      'Due Date':      dueDate?.toISOString().split('T')[0] || '—',
      'Status':        o.status,
      'Priority':      o.priority || '—',
      'Assigned To':   o.owner?.fullName || '—',
      'Completed':     o.completedAt?.toISOString().split('T')[0] || '—',
      'Days Remaining': remaining,
    };
  });

  return { columns, rows, totals: null, rowCount: total, page, limit };
}

// ── UPCOMING_COMPLIANCE ───────────────────────────────────────

async function runUpcomingCompliance(workspaceId, filters = {}) {
  const dueDays = parseInt(filters.dueDays) || 30;
  const today   = new Date();
  const cutoff  = new Date();
  cutoff.setDate(today.getDate() + dueDays);

  const where = {
    workspaceId,
    dueDate: { gte: today, lte: cutoff },
    status:  { notIn: ['completed', 'cancelled'] },
  };
  if (filters.assignedUserId) where.ownerUserId = filters.assignedUserId;

  const occurrences = await prisma.complianceOccurrence.findMany({
    where,
    orderBy: { dueDate: 'asc' },
    select: {
      title: true, dueDate: true, priority: true, status: true,
      owner: { select: { fullName: true } },
    },
  });

  const columns = ['Obligation', 'Due Date', 'Priority', 'Status', 'Assigned To'];
  const rows    = occurrences.map((o) => ({
    'Obligation':  o.title,
    'Due Date':    o.dueDate?.toISOString().split('T')[0] || '—',
    'Priority':    o.priority || '—',
    'Status':      o.status,
    'Assigned To': o.owner?.fullName || '—',
  }));

  return { columns, rows, totals: null, rowCount: rows.length };
}

// ── USER_ACTIVITY ─────────────────────────────────────────────

async function runUserActivity(workspaceId, filters = {}, pagination = {}) {
  const from  = parseDate(filters.dateFrom) || defaultFrom();
  const to    = parseDate(filters.dateTo)   || defaultTo();
  const page  = Math.max(1, parseInt(pagination.page) || 1);
  const limit = Math.min(500, parseInt(pagination.limit) || 50);
  const skip  = (page - 1) * limit;

  const where = { workspaceId, createdAt: { gte: from, lte: to } };
  if (filters.userId) where.userId = filters.userId;
  if (filters.module) where.entityType = filters.module;

  const [logs, total] = await Promise.all([
    prisma.activityLog.findMany({
      where, skip, take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        action: true, entityType: true, entityId: true, description: true, createdAt: true,
        user: { select: { fullName: true, email: true } },
      },
    }),
    prisma.activityLog.count({ where }),
  ]);

  const columns = ['Timestamp', 'User', 'Email', 'Action', 'Module', 'Record ID', 'Description'];
  const rows    = logs.map((l) => ({
    'Timestamp':   l.createdAt?.toISOString(),
    'User':        l.user?.fullName || 'System',
    'Email':       l.user?.email || '—',
    'Action':      l.action,
    'Module':      l.entityType || '—',
    'Record ID':   l.entityId || '—',
    'Description': l.description || '—',
  }));

  return { columns, rows, totals: null, rowCount: total, page, limit };
}

// ── NOTIFICATIONS ─────────────────────────────────────────────

async function runNotifications(workspaceId, filters = {}, pagination = {}) {
  const from  = parseDate(filters.dateFrom) || defaultFrom();
  const to    = parseDate(filters.dateTo)   || defaultTo();
  const page  = Math.max(1, parseInt(pagination.page) || 1);
  const limit = Math.min(500, parseInt(pagination.limit) || 50);
  const skip  = (page - 1) * limit;

  const where = { workspaceId, createdAt: { gte: from, lte: to } };
  if (filters.type)   where.type   = filters.type;
  if (filters.status) where.status = filters.status;

  const [items, total] = await Promise.all([
    prisma.notificationItem.findMany({
      where, skip, take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        title: true, type: true, priority: true, status: true, readAt: true, createdAt: true,
        recipient: { select: { fullName: true, email: true } },
      },
    }),
    prisma.notificationItem.count({ where }),
  ]);

  const columns = ['Title', 'Type', 'Priority', 'Recipient', 'Status', 'Sent', 'Read'];
  const rows    = items.map((n) => ({
    'Title':     n.title,
    'Type':      n.type,
    'Priority':  n.priority || '—',
    'Recipient': n.recipient?.fullName || '—',
    'Status':    n.status,
    'Sent':      n.createdAt?.toISOString().split('T')[0],
    'Read':      n.readAt?.toISOString().split('T')[0] || '—',
  }));

  return { columns, rows, totals: null, rowCount: total, page, limit };
}

// ── SUBSCRIPTION_USAGE ────────────────────────────────────────

async function runSubscriptionUsage(workspaceId) {
  const [subscription, memberCount] = await Promise.all([
    prisma.subscription.findFirst({
      where: { workspaceId },
      include: { plan: true },
    }),
    prisma.workspaceMember.count({
      where: { workspaceId, status: 'active' },
    }),
  ]);

  const columns = ['Metric', 'Value'];
  const rows    = [
    { Metric: 'Plan',           Value: subscription?.plan?.name || 'Free' },
    { Metric: 'Status',         Value: subscription?.status || 'active' },
    { Metric: 'Users (Active)', Value: memberCount },
    { Metric: 'User Limit',     Value: subscription?.plan?.maxUsers || 'Unlimited' },
    { Metric: 'Billing Period', Value: subscription?.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toISOString().split('T')[0] : '—' },
  ];

  return { columns, rows, totals: null, rowCount: rows.length };
}

// ── Dispatch ─────────────────────────────────────────────────

const QUERY_MAP = {
  FINANCIAL_SUMMARY:        (ws, f, p) => runFinancialSummary(ws, f),
  REVENUE:                  runRevenue,
  COLLECTIONS:              runCollections,
  OUTSTANDING_RECEIVABLES:  runOutstandingReceivables,
  AGING:                    (ws, f) => runAging(ws, f),
  EXPENSE_DETAIL:           runExpenseDetail,
  EXPENSE_CATEGORY_SUMMARY: (ws, f) => runExpenseCategorySummary(ws, f),
  CUSTOMER_BALANCE:         runCustomerBalance,
  CUSTOMER_ACTIVITY:        runCustomerActivity,
  COMPLIANCE_STATUS:        runComplianceStatus,
  UPCOMING_COMPLIANCE:      (ws, f) => runUpcomingCompliance(ws, f),
  USER_ACTIVITY:            runUserActivity,
  NOTIFICATIONS:            runNotifications,
  SUBSCRIPTION_USAGE:       (ws) => runSubscriptionUsage(ws),
};

async function executeQuery(reportCode, workspaceId, filters = {}, pagination = {}) {
  const fn = QUERY_MAP[reportCode];
  if (!fn) throw new Error(`No query handler for report: ${reportCode}`);
  return fn(workspaceId, filters, pagination);
}

module.exports = { executeQuery };
