const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const SUB_LIST_SELECT = {
  id: true, status: true, currentPeriodStart: true, currentPeriodEnd: true,
  cancelAtPeriodEnd: true, createdAt: true,
  plan: { select: { id: true, name: true, code: true, monthlyPriceUsd: true } },
  workspace: {
    select: {
      id: true, name: true,
      owner: { select: { id: true, fullName: true, email: true } },
      company: { select: { companyName: true } },
    },
  },
};

const SUB_DETAIL_SELECT = {
  id: true, status: true, stripeCustomerId: true, stripeSubscriptionId: true,
  currentPeriodStart: true, currentPeriodEnd: true, cancelAtPeriodEnd: true,
  createdAt: true, updatedAt: true,
  plan: true,
  workspace: {
    select: {
      id: true, name: true, status: true, createdAt: true,
      owner: { select: { id: true, fullName: true, email: true } },
      company: { select: { companyName: true } },
      countryProfile: { select: { countryName: true } },
      _count: { select: { members: true } },
    },
  },
  billingEvents: {
    orderBy: { createdAt: 'desc' },
    take: 30,
    select: { id: true, eventType: true, provider: true, providerEventId: true, createdAt: true },
  },
};

async function list({ search, status, planCode, page = 1, limit = 20 }) {
  const skip = (page - 1) * limit;
  const where = {};
  if (status) where.status = status;
  if (planCode) where.plan = { code: planCode };
  if (search) {
    where.workspace = {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { owner: { email: { contains: search, mode: 'insensitive' } } },
        { owner: { fullName: { contains: search, mode: 'insensitive' } } },
        { company: { companyName: { contains: search, mode: 'insensitive' } } },
      ],
    };
  }

  const [items, total] = await Promise.all([
    prisma.subscription.findMany({ where, select: SUB_LIST_SELECT, skip, take: limit, orderBy: { createdAt: 'desc' } }),
    prisma.subscription.count({ where }),
  ]);
  return { items, total, pages: Math.ceil(total / limit), page };
}

async function findById(id) {
  return prisma.subscription.findUnique({ where: { id }, select: SUB_DETAIL_SELECT });
}

async function updateStatus(id, status) {
  return prisma.subscription.update({ where: { id }, data: { status } });
}

async function getRevenue() {
  const [byStatus, activeSubs, trialingSubs] = await Promise.all([
    prisma.subscription.groupBy({ by: ['status'], _count: { id: true } }),
    prisma.subscription.findMany({
      where: { status: 'active' },
      select: { planId: true, plan: { select: { name: true, code: true, monthlyPriceUsd: true } } },
    }),
    prisma.subscription.count({ where: { status: 'trialing' } }),
  ]);

  const mrr = activeSubs.reduce((sum, s) => sum + Number(s.plan.monthlyPriceUsd), 0);

  const planBreakdown = {};
  activeSubs.forEach((s) => {
    const key = s.plan.name;
    if (!planBreakdown[key]) planBreakdown[key] = { count: 0, mrr: 0, code: s.plan.code };
    planBreakdown[key].count++;
    planBreakdown[key].mrr += Number(s.plan.monthlyPriceUsd);
  });

  const statusMap = Object.fromEntries(byStatus.map((s) => [s.status, s._count.id]));

  return {
    mrr: mrr.toFixed(2),
    arr: (mrr * 12).toFixed(2),
    activeCount: statusMap.active || 0,
    trialingCount: statusMap.trialing || 0,
    pastDueCount: statusMap.past_due || 0,
    cancelledCount: statusMap.cancelled || 0,
    expiredCount: statusMap.expired || 0,
    planBreakdown: Object.entries(planBreakdown).map(([name, v]) => ({ name, ...v, mrr: v.mrr.toFixed(2) })),
  };
}

async function getRenewals() {
  const now = new Date();
  const in30d = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  const [upcoming, trialing] = await Promise.all([
    prisma.subscription.findMany({
      where: { status: 'active', currentPeriodEnd: { gte: now, lte: in30d } },
      select: SUB_LIST_SELECT,
      orderBy: { currentPeriodEnd: 'asc' },
      take: 20,
    }),
    prisma.subscription.findMany({
      where: { status: 'trialing' },
      select: SUB_LIST_SELECT,
      orderBy: { currentPeriodEnd: 'asc' },
      take: 20,
    }),
  ]);

  return { upcoming, trialing };
}

async function getPlans() {
  const [plans, counts] = await Promise.all([
    prisma.plan.findMany({ orderBy: { displayOrder: 'asc' } }),
    prisma.subscription.groupBy({
      by: ['planId'],
      where: { status: 'active' },
      _count: { id: true },
    }),
  ]);
  const countMap = Object.fromEntries(counts.map((c) => [c.planId, c._count.id]));
  return plans.map((p) => ({ ...p, activeSubscribers: countMap[p.id] || 0 }));
}

module.exports = { list, findById, updateStatus, getRevenue, getRenewals, getPlans };
