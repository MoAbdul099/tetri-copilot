/**
 * Analytics Engine — trend calculations, comparative analytics, moving averages.
 * All forecasting uses historical trend projection (no ML required).
 */
const prisma = require('../../lib/prisma');

const fmtNum = (v) => Math.round(Number(v || 0) * 100) / 100;
const pct    = (a, b) => (b === 0 ? 0 : Math.round(((a - b) / b) * 1000) / 10);

// Returns start of each of the past N months (inclusive of current)
function monthSlots(n = 6) {
  const slots = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(1); d.setHours(0, 0, 0, 0);
    d.setMonth(d.getMonth() - i);
    slots.push(d);
  }
  return slots;
}

function monthEnd(start) {
  const d = new Date(start);
  d.setMonth(d.getMonth() + 1);
  return d;
}

function label(d) {
  return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
}

// Moving average over the last `window` values
function movingAvg(values, window = 3) {
  if (values.length === 0) return 0;
  const slice = values.slice(-window);
  return slice.reduce((s, v) => s + v, 0) / slice.length;
}

// Linear trend slope (rise per period)
function trendSlope(values) {
  const n = values.length;
  if (n < 2) return 0;
  return (values[n - 1] - values[0]) / (n - 1);
}

// Forecast forward `periods` steps using moving average + trend
function forecastForward(values, periods = 3) {
  const base  = movingAvg(values, 3);
  const slope = trendSlope(values.slice(-4));
  return Array.from({ length: periods }, (_, i) => Math.max(0, Math.round((base + slope * (i + 1)) * 100) / 100));
}

// ── Revenue ───────────────────────────────────────────────────

async function revenueAnalytics(workspaceId) {
  const slots = monthSlots(6);

  const monthly = await Promise.all(slots.map(async (start) => {
    const end = monthEnd(start);
    const agg = await prisma.invoice.aggregate({
      where: { workspaceId, issueDate: { gte: start, lt: end }, status: { notIn: ['draft', 'cancelled', 'void'] } },
      _sum: { totalAmount: true },
      _count: true,
    });
    return { month: label(start), revenue: fmtNum(agg._sum.totalAmount), count: agg._count };
  }));

  const values    = monthly.map((m) => m.revenue);
  const current   = values[values.length - 1];
  const previous  = values[values.length - 2] || 0;
  const growth    = pct(current, previous);
  const avg3      = Math.round(movingAvg(values, 3) * 100) / 100;
  const forecast  = forecastForward(values, 3);

  // Top customers by revenue (current month)
  const startCur = slots[slots.length - 1];
  const topCustomers = await prisma.invoice.groupBy({
    by: ['customerId'],
    where: { workspaceId, issueDate: { gte: startCur, lt: monthEnd(startCur) }, status: { notIn: ['draft', 'cancelled', 'void'] } },
    _sum: { totalAmount: true },
    orderBy: { _sum: { totalAmount: 'desc' } },
    take: 5,
  });

  const customerIds = topCustomers.map((t) => t.customerId).filter(Boolean);
  const customers   = await prisma.customer.findMany({ where: { id: { in: customerIds } }, select: { id: true, name: true } });
  const custMap     = Object.fromEntries(customers.map((c) => [c.id, c.name]));

  const totalRevCurrent = values[values.length - 1] || 1;
  const topCustomerData = topCustomers.map((t) => ({
    name:    t.customerId ? custMap[t.customerId] || 'Unknown' : 'Unknown',
    revenue: fmtNum(t._sum.totalAmount),
    share:   pct(fmtNum(t._sum.totalAmount), totalRevCurrent) + 100,
  })).map((t) => ({ ...t, share: Math.round((t.revenue / (totalRevCurrent || 1)) * 100) }));

  // Concentration risk
  const topShare = topCustomerData[0]?.share || 0;

  return {
    monthly, values, current, previous, growth, avg3,
    forecast: { d30: forecast[0], d60: forecast[1], d90: forecast[2] },
    topCustomers: topCustomerData,
    concentrationRisk: topShare > 60 ? 'critical' : topShare > 40 ? 'high' : topShare > 25 ? 'medium' : 'low',
    topShare,
  };
}

// ── Collections ───────────────────────────────────────────────

async function collectionAnalytics(workspaceId) {
  const slots = monthSlots(6);

  const monthly = await Promise.all(slots.map(async (start) => {
    const end = monthEnd(start);
    const [collected, billed] = await Promise.all([
      prisma.payment.aggregate({
        where: { workspaceId, paymentDate: { gte: start, lt: end }, status: { not: 'reversed' } },
        _sum: { amount: true }, _count: true,
      }),
      prisma.invoice.aggregate({
        where: { workspaceId, issueDate: { gte: start, lt: end }, status: { notIn: ['draft', 'cancelled', 'void'] } },
        _sum: { totalAmount: true },
      }),
    ]);
    const col  = fmtNum(collected._sum.amount);
    const bil  = fmtNum(billed._sum.totalAmount);
    return { month: label(start), collected: col, billed: bil, rate: bil > 0 ? Math.round((col / bil) * 100) : 0, count: collected._count };
  }));

  const values   = monthly.map((m) => m.collected);
  const current  = values[values.length - 1];
  const previous = values[values.length - 2] || 0;
  const growth   = pct(current, previous);
  const forecast = forecastForward(values, 3);

  // DSO = (AR Outstanding / Revenue) * 30
  const [ar, rev30] = await Promise.all([
    prisma.invoice.aggregate({
      where: { workspaceId, status: { in: ['sent', 'issued', 'partially_paid'] } },
      _sum: { totalAmount: true, paidAmount: true },
    }),
    prisma.invoice.aggregate({
      where: { workspaceId, issueDate: { gte: monthSlots(2)[0] }, status: { notIn: ['draft', 'cancelled', 'void'] } },
      _sum: { totalAmount: true },
    }),
  ]);
  const outstanding = fmtNum(ar._sum.totalAmount) - fmtNum(ar._sum.paidAmount);
  const rev30val    = fmtNum(rev30._sum.totalAmount) || 1;
  const dso         = Math.round((outstanding / rev30val) * 30);
  const avgRate     = Math.round(monthly.reduce((s, m) => s + m.rate, 0) / (monthly.length || 1));

  return {
    monthly, values, current, previous, growth,
    forecast: { d30: forecast[0], d60: forecast[1], d90: forecast[2] },
    dso: Math.max(0, dso),
    avgCollectionRate: avgRate,
    outstanding,
  };
}

// ── Expenses ──────────────────────────────────────────────────

async function expenseAnalytics(workspaceId) {
  const slots = monthSlots(6);

  const monthly = await Promise.all(slots.map(async (start) => {
    const end = monthEnd(start);
    const agg = await prisma.expense.aggregate({
      where: { workspaceId, isDeleted: false, expenseDate: { gte: start, lt: end }, status: { notIn: ['cancelled'] } },
      _sum: { amount: true }, _count: true,
    });
    return { month: label(start), expenses: fmtNum(agg._sum.amount), count: agg._count };
  }));

  const values   = monthly.map((m) => m.expenses);
  const current  = values[values.length - 1];
  const previous = values[values.length - 2] || 0;
  const growth   = pct(current, previous);
  const avg3     = Math.round(movingAvg(values, 3) * 100) / 100;
  const forecast = forecastForward(values, 3);

  // Top categories this month
  const startCur = slots[slots.length - 1];
  const byCat    = await prisma.expense.groupBy({
    by: ['categoryId'],
    where: { workspaceId, isDeleted: false, expenseDate: { gte: startCur, lt: monthEnd(startCur) } },
    _sum: { amount: true },
    orderBy: { _sum: { amount: 'desc' } },
    take: 5,
  });
  const catIds = byCat.map((b) => b.categoryId).filter(Boolean);
  const cats   = await prisma.expenseCategory.findMany({ where: { id: { in: catIds } }, select: { id: true, name: true } });
  const catMap = Object.fromEntries(cats.map((c) => [c.id, c.name]));
  const topCats = byCat.map((b) => ({ name: b.categoryId ? catMap[b.categoryId] || 'Other' : 'Uncategorised', amount: fmtNum(b._sum.amount) }));

  return {
    monthly, values, current, previous, growth, avg3,
    forecast: { d30: forecast[0], d60: forecast[1], d90: forecast[2] },
    topCategories: topCats,
  };
}

// ── Compliance ────────────────────────────────────────────────

async function complianceAnalytics(workspaceId) {
  const slots = monthSlots(6);

  const monthly = await Promise.all(slots.map(async (start) => {
    const end = monthEnd(start);
    const [total, completed, overdue] = await Promise.all([
      prisma.complianceOccurrence.count({ where: { workspaceId, dueDate: { gte: start, lt: end } } }),
      prisma.complianceOccurrence.count({ where: { workspaceId, dueDate: { gte: start, lt: end }, status: 'completed' } }),
      prisma.complianceOccurrence.count({ where: { workspaceId, dueDate: { gte: start, lt: end }, status: { notIn: ['completed', 'cancelled'] }, } }),
    ]);
    return { month: label(start), total, completed, overdue, rate: total > 0 ? Math.round((completed / total) * 100) : 100 };
  }));

  const today      = new Date();
  const upcoming   = await prisma.complianceOccurrence.count({
    where: { workspaceId, dueDate: { gte: today, lte: new Date(today.getTime() + 30 * 86400000) }, status: { notIn: ['completed', 'cancelled'] } },
  });
  const totalOverdue = await prisma.complianceOccurrence.count({
    where: { workspaceId, dueDate: { lt: today }, status: { notIn: ['completed', 'cancelled'] } },
  });
  const avgRate = Math.round(monthly.reduce((s, m) => s + m.rate, 0) / (monthly.length || 1));

  return { monthly, avgCompletionRate: avgRate, upcoming30Days: upcoming, totalOverdue };
}

// ── Customer ──────────────────────────────────────────────────

async function customerAnalytics(workspaceId) {
  const slots = monthSlots(6);
  const monthly = await Promise.all(slots.map(async (start) => {
    const end = monthEnd(start);
    const count = await prisma.customer.count({ where: { workspaceId, createdAt: { gte: start, lt: end } } });
    return { month: label(start), newCustomers: count };
  }));

  const [total, active] = await Promise.all([
    prisma.customer.count({ where: { workspaceId } }),
    prisma.customer.count({ where: { workspaceId, isActive: true } }),
  ]);

  return { monthly, total, active };
}

// ── Health Score ──────────────────────────────────────────────

async function computeHealthScore(workspaceId) {
  const [rev, col, exp, comp] = await Promise.all([
    revenueAnalytics(workspaceId),
    collectionAnalytics(workspaceId),
    expenseAnalytics(workspaceId),
    complianceAnalytics(workspaceId),
  ]);

  // Financial (40%): collection rate, overdue %, revenue trend
  const colRate   = col.avgCollectionRate;
  const revGrowth = rev.growth;
  const concRisk  = rev.concentrationRisk;
  let finScore = Math.min(100, colRate * 0.5 + (revGrowth > 0 ? Math.min(20, revGrowth) : 0) + (concRisk === 'low' ? 30 : concRisk === 'medium' ? 20 : 10));
  finScore = Math.max(0, Math.round(finScore));

  // Compliance (25%): completion rate, overdue count
  const compRate  = comp.avgCompletionRate;
  const overdueP  = comp.totalOverdue;
  let compScore = Math.max(0, Math.round(compRate - overdueP * 5));
  compScore = Math.min(100, compScore);

  // Operational (20%): activity in last 30 days
  const actCount = await prisma.activityLog.count({
    where: { workspaceId, createdAt: { gte: new Date(Date.now() - 30 * 86400000) } },
  });
  const opScore = Math.min(100, Math.round(actCount * 2));

  // Subscription (15%): user utilisation
  const [sub, memberCount] = await Promise.all([
    prisma.subscription.findFirst({ where: { workspaceId }, include: { plan: true } }),
    prisma.workspaceMember.count({ where: { workspaceId, status: 'active' } }),
  ]);
  const limit    = sub?.plan?.maxUsers || 10;
  const utilPct  = Math.round((memberCount / limit) * 100);
  const subScore = utilPct < 80 ? 100 : utilPct < 95 ? 75 : 50;

  const overall = Math.round(finScore * 0.4 + compScore * 0.25 + opScore * 0.20 + subScore * 0.15);

  const category = (s) =>
    s >= 90 ? 'Excellent' : s >= 75 ? 'Healthy' : s >= 60 ? 'Attention Needed' : 'Critical';

  return {
    overall,
    label: category(overall),
    components: {
      financial:    { score: finScore,  weight: 40, label: category(finScore) },
      compliance:   { score: compScore, weight: 25, label: category(compScore) },
      operational:  { score: opScore,   weight: 20, label: category(opScore) },
      subscription: { score: subScore,  weight: 15, label: category(subScore) },
    },
  };
}

// ── Cash Position Forecast ────────────────────────────────────

function cashForecast(colForecast, expForecast) {
  return {
    d30: Math.round((colForecast.d30 - expForecast.d30) * 100) / 100,
    d60: Math.round((colForecast.d60 - expForecast.d60) * 100) / 100,
    d90: Math.round((colForecast.d90 - expForecast.d90) * 100) / 100,
  };
}

function cashRisk(cash) {
  if (cash.d30 < 0) return 'critical';
  if (cash.d30 < cash.d30 * 0.1) return 'amber';
  return 'green';
}

module.exports = { revenueAnalytics, collectionAnalytics, expenseAnalytics, complianceAnalytics, customerAnalytics, computeHealthScore, cashForecast, cashRisk, pct };
