const prisma = require('../../lib/prisma');

const now = () => new Date();

const startOf = (unit) => {
  const d = new Date();
  if (unit === 'month') { d.setDate(1); d.setHours(0, 0, 0, 0); }
  if (unit === 'week')  { const day = d.getDay(); d.setDate(d.getDate() - day); d.setHours(0, 0, 0, 0); }
  if (unit === 'year')  { d.setMonth(0, 1); d.setHours(0, 0, 0, 0); }
  return d;
};

const prevMonthRange = () => {
  const start = new Date();
  start.setDate(1);
  start.setHours(0, 0, 0, 0);
  start.setMonth(start.getMonth() - 1);
  const end = new Date(start);
  end.setMonth(end.getMonth() + 1);
  return { start, end };
};

// ── Receivables / AR ──────────────────────────────────────

const getArSummary = async (workspaceId) => {
  const today = now();

  const [outstanding, overdue, openCount] = await Promise.all([
    prisma.invoice.aggregate({
      where: { workspaceId, status: { in: ['sent', 'issued', 'partially_paid'] } },
      _sum: { totalAmount: true, paidAmount: true },
    }),
    prisma.invoice.aggregate({
      where: {
        workspaceId,
        status: { in: ['sent', 'issued', 'partially_paid'] },
        dueDate: { lt: today },
      },
      _sum: { totalAmount: true, paidAmount: true },
    }),
    prisma.invoice.count({
      where: { workspaceId, status: { in: ['sent', 'issued', 'partially_paid'] } },
    }),
  ]);

  const outstandingAmt = Number(outstanding._sum.totalAmount || 0) - Number(outstanding._sum.paidAmount || 0);
  const overdueAmt     = Number(overdue._sum.totalAmount || 0) - Number(overdue._sum.paidAmount || 0);

  const totalBilled = Number(outstanding._sum.totalAmount || 0);
  const totalPaid   = Number(outstanding._sum.paidAmount || 0);
  const collectionRate = totalBilled > 0 ? Math.round((totalPaid / totalBilled) * 100) : 0;

  return { outstanding: outstandingAmt, overdue: overdueAmt, collectionRate, openInvoices: openCount };
};

const getReceivablesAging = async (workspaceId) => {
  const today = now();
  const invoices = await prisma.invoice.findMany({
    where: { workspaceId, status: { in: ['sent', 'issued', 'partially_paid'] } },
    select: { dueDate: true, totalAmount: true, paidAmount: true },
  });

  const buckets = { current: 0, days1_30: 0, days31_60: 0, days61_90: 0, days90plus: 0 };

  for (const inv of invoices) {
    const balance = Number(inv.totalAmount) - Number(inv.paidAmount);
    if (balance <= 0) continue;
    if (!inv.dueDate || inv.dueDate >= today) {
      buckets.current += balance;
    } else {
      const diff = Math.floor((today - inv.dueDate) / 86400000);
      if (diff <= 30)       buckets.days1_30   += balance;
      else if (diff <= 60)  buckets.days31_60  += balance;
      else if (diff <= 90)  buckets.days61_90  += balance;
      else                  buckets.days90plus += balance;
    }
  }

  return Object.fromEntries(Object.entries(buckets).map(([k, v]) => [k, Math.round(v * 100) / 100]));
};

// ── Revenue ───────────────────────────────────────────────

const getRevenueSummary = async (workspaceId) => {
  const curStart = startOf('month');
  const prev = prevMonthRange();

  const [cur, prev_] = await Promise.all([
    prisma.invoice.aggregate({
      where: { workspaceId, status: { in: ['sent', 'issued', 'partially_paid', 'paid'] }, issueDate: { gte: curStart } },
      _sum: { totalAmount: true },
    }),
    prisma.invoice.aggregate({
      where: { workspaceId, status: { in: ['sent', 'issued', 'partially_paid', 'paid'] }, issueDate: { gte: prev.start, lt: prev.end } },
      _sum: { totalAmount: true },
    }),
  ]);

  const current = Number(cur._sum.totalAmount || 0);
  const previous = Number(prev_._sum.totalAmount || 0);
  const growth = previous > 0 ? Math.round(((current - previous) / previous) * 100) : null;

  return { current, previous, growth };
};

// ── Collections / Payments ────────────────────────────────

const getCollectionsSummary = async (workspaceId) => {
  const curStart = startOf('month');
  const prev = prevMonthRange();

  const [cur, prev_, count] = await Promise.all([
    prisma.payment.aggregate({
      where: { workspaceId, status: { in: ['posted', 'allocated', 'partially_allocated'] }, paymentDate: { gte: curStart } },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.payment.aggregate({
      where: { workspaceId, status: { in: ['posted', 'allocated', 'partially_allocated'] }, paymentDate: { gte: prev.start, lt: prev.end } },
      _sum: { amount: true },
    }),
    prisma.payment.count({
      where: { workspaceId, status: { in: ['posted', 'allocated', 'partially_allocated'] }, paymentDate: { gte: curStart } },
    }),
  ]);

  const current = Number(cur._sum.amount || 0);
  const previous = Number(prev_._sum.amount || 0);
  const growth = previous > 0 ? Math.round(((current - previous) / previous) * 100) : null;

  return { current, previous, growth, count };
};

// ── Expenses ──────────────────────────────────────────────

const getExpenseSummary = async (workspaceId) => {
  const curStart = startOf('month');
  const prev = prevMonthRange();

  const [cur, prev_, topCats] = await Promise.all([
    prisma.expense.aggregate({
      where: { workspaceId, isDeleted: false, expenseDate: { gte: curStart } },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.expense.aggregate({
      where: { workspaceId, isDeleted: false, expenseDate: { gte: prev.start, lt: prev.end } },
      _sum: { amount: true },
    }),
    prisma.expense.groupBy({
      by: ['categoryId'],
      where: { workspaceId, isDeleted: false, expenseDate: { gte: curStart }, categoryId: { not: null } },
      _sum: { amount: true },
      orderBy: { _sum: { amount: 'desc' } },
      take: 5,
    }),
  ]);

  const current  = Number(cur._sum.amount || 0);
  const previous = Number(prev_._sum.amount || 0);
  const change   = previous > 0 ? Math.round(((current - previous) / previous) * 100) : null;

  // Enrich category names
  const catIds = topCats.map((c) => c.categoryId).filter(Boolean);
  const cats = catIds.length
    ? await prisma.expenseCategory.findMany({ where: { id: { in: catIds } }, select: { id: true, name: true } })
    : [];
  const catMap = Object.fromEntries(cats.map((c) => [c.id, c.name]));

  const topCategories = topCats.map((c) => ({
    categoryId: c.categoryId,
    name:       catMap[c.categoryId] || 'Uncategorized',
    amount:     Number(c._sum.amount || 0),
  }));

  return { current, previous, change, count: cur._count, topCategories };
};

// ── Compliance ────────────────────────────────────────────

const getComplianceSummary = async (workspaceId) => {
  const today = now();
  const weekEnd = new Date(today);
  weekEnd.setDate(today.getDate() + 7);
  const monthStart = startOf('month');

  const [upcoming, dueSoon, overdue, completedThisMonth] = await Promise.all([
    prisma.complianceOccurrence.count({
      where: { workspaceId, status: 'scheduled' },
    }),
    prisma.complianceOccurrence.count({
      where: { workspaceId, status: 'scheduled', dueDate: { gte: today, lte: weekEnd } },
    }),
    prisma.complianceOccurrence.count({
      where: { workspaceId, status: 'overdue' },
    }),
    prisma.complianceOccurrence.count({
      where: { workspaceId, status: 'completed', completedAt: { gte: monthStart } },
    }),
  ]);

  return { upcoming, dueSoon, overdue, completedThisMonth };
};

// ── Notifications ─────────────────────────────────────────

const getNotificationsSummary = async (workspaceId, userId) => {
  const [unread, escalations, announcements] = await Promise.all([
    prisma.notificationItem.count({
      where: { workspaceId, recipientId: userId, status: 'sent', readAt: null },
    }),
    prisma.escalationInstance.count({
      where: { workspaceId, status: 'active' },
    }),
    prisma.announcement.count({
      where: {
        workspaceId,
        status: 'published',
        AND: [
          { OR: [{ publishAt: null }, { publishAt: { lte: now() } }] },
          { OR: [{ expiresAt: null }, { expiresAt: { gt: now() } }] },
        ],
      },
    }),
  ]);

  const pendingApprovals = await prisma.approvalWorkflow.count({
    where: { workspaceId, status: 'pending' },
  });

  return { unread, pendingApprovals, escalations, announcements };
};

// ── Activity feed ─────────────────────────────────────────

const getActivityFeed = async (workspaceId, limit = 20) => {
  return prisma.activityLog.findMany({
    where: { workspaceId },
    include: { user: { select: { id: true, fullName: true, email: true } } },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
};

// ── Financial snapshot ────────────────────────────────────

const getFinancialSnapshot = async (workspaceId, period = 'month') => {
  let start;
  const today = now();

  if (period === 'today') {
    start = new Date(today);
    start.setHours(0, 0, 0, 0);
  } else if (period === 'week') {
    start = startOf('week');
  } else if (period === 'month') {
    start = startOf('month');
  } else if (period === 'year') {
    start = startOf('year');
  } else {
    start = startOf('month');
  }

  const [revenue, collections, expenses] = await Promise.all([
    prisma.invoice.aggregate({
      where: { workspaceId, status: { in: ['sent', 'issued', 'partially_paid', 'paid'] }, issueDate: { gte: start } },
      _sum: { totalAmount: true },
    }),
    prisma.payment.aggregate({
      where: { workspaceId, status: { in: ['posted', 'allocated', 'partially_allocated'] }, paymentDate: { gte: start } },
      _sum: { amount: true },
    }),
    prisma.expense.aggregate({
      where: { workspaceId, isDeleted: false, expenseDate: { gte: start } },
      _sum: { amount: true },
    }),
  ]);

  const rev  = Number(revenue._sum.totalAmount || 0);
  const col  = Number(collections._sum.amount || 0);
  const exp  = Number(expenses._sum.amount || 0);

  return {
    period,
    revenue:     rev,
    collections: col,
    expenses:    exp,
    netPosition: col - exp,
  };
};

// ── Subscription usage ────────────────────────────────────

const getSubscriptionUsage = async (workspaceId) => {
  const [subscription, memberCount] = await Promise.all([
    prisma.subscription.findUnique({
      where: { workspaceId },
      include: { plan: { select: { name: true, userLimit: true, storageLimitGb: true } } },
    }),
    prisma.workspaceMember.count({
      where: { workspaceId, status: 'active' },
    }),
  ]);

  if (!subscription) return { plan: null, users: { used: memberCount, limit: null, pct: null }, storage: null };

  const userLimit = subscription.plan?.userLimit || null;
  const userPct   = userLimit ? Math.round((memberCount / userLimit) * 100) : null;

  return {
    plan:    subscription.plan?.name || 'Active Plan',
    status:  subscription.status,
    users:   { used: memberCount, limit: userLimit, pct: userPct },
    storage: null,
  };
};

// ── Upcoming tasks ────────────────────────────────────────

const getUpcomingTasks = async (workspaceId, userId) => {
  const today = now();
  const twoWeeksOut = new Date(today);
  twoWeeksOut.setDate(today.getDate() + 14);

  const [complianceTasks, pendingApprovals] = await Promise.all([
    prisma.complianceOccurrence.findMany({
      where: {
        workspaceId,
        status: { in: ['scheduled', 'overdue', 'in_progress'] },
        dueDate: { lte: twoWeeksOut },
      },
      orderBy: { dueDate: 'asc' },
      take: 5,
      select: { id: true, name: true, dueDate: true, status: true, priority: true },
    }),
    prisma.approvalWorkflow.findMany({
      where: {
        workspaceId,
        status: 'pending',
        assignments: { some: { assigneeUserId: userId, status: 'pending' } },
      },
      include: { expense: { select: { id: true, description: true, amount: true } } },
      take: 5,
    }),
  ]);

  return {
    complianceTasks: complianceTasks.map((t) => ({
      id: t.id, name: t.name, dueDate: t.dueDate, status: t.status, priority: t.priority, type: 'compliance',
    })),
    pendingApprovals: pendingApprovals.map((w) => ({
      id: w.id, description: w.expense?.description || 'Expense', amount: Number(w.expense?.amount || 0), type: 'approval',
    })),
  };
};

// ── Preferences ───────────────────────────────────────────

const getPreferences = (workspaceId, userId) =>
  prisma.dashboardPreference.findUnique({
    where: { workspaceId_userId: { workspaceId, userId } },
  });

const upsertPreferences = (workspaceId, userId, data) =>
  prisma.dashboardPreference.upsert({
    where:  { workspaceId_userId: { workspaceId, userId } },
    create: { workspaceId, userId, ...data },
    update: data,
  });

module.exports = {
  getArSummary,
  getReceivablesAging,
  getRevenueSummary,
  getCollectionsSummary,
  getExpenseSummary,
  getComplianceSummary,
  getNotificationsSummary,
  getActivityFeed,
  getFinancialSnapshot,
  getSubscriptionUsage,
  getUpcomingTasks,
  getPreferences,
  upsertPreferences,
};
