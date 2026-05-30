const prisma = require('../../../lib/prisma');

// ── Dashboard ─────────────────────────────────────────────────────────────────

async function getDashboard() {
  const since30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalEvents,
    totalEvents30d,
    paymentSucceeded,
    paymentFailed,
    activeSubscriptions,
    trialingSubscriptions,
    pastDueSubscriptions,
    recentFailures,
  ] = await Promise.all([
    prisma.billingEvent.count(),
    prisma.billingEvent.count({ where: { createdAt: { gte: since30d } } }),
    prisma.billingEvent.count({ where: { eventType: 'payment_succeeded' } }),
    prisma.billingEvent.count({ where: { eventType: 'payment_failed' } }),
    prisma.subscription.count({ where: { status: 'active' } }),
    prisma.subscription.count({ where: { status: 'trialing' } }),
    prisma.subscription.count({ where: { status: 'past_due' } }),
    prisma.billingEvent.findMany({
      where: { eventType: 'payment_failed', createdAt: { gte: since30d } },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { workspace: { select: { id: true, name: true } } },
    }),
  ]);

  const successRate = (paymentSucceeded + paymentFailed) > 0
    ? Math.round((paymentSucceeded / (paymentSucceeded + paymentFailed)) * 100)
    : 100;

  return {
    totalEvents,
    totalEvents30d,
    paymentSucceeded,
    paymentFailed,
    successRate,
    activeSubscriptions,
    trialingSubscriptions,
    pastDueSubscriptions,
    recentFailures: recentFailures.map((e) => ({
      id: e.id,
      eventType: e.eventType,
      providerEventId: e.providerEventId,
      createdAt: e.createdAt,
      workspace: e.workspace,
    })),
  };
}

// ── Events list ───────────────────────────────────────────────────────────────

async function listEvents({ search = '', eventType = '', page = 1, limit = 25, from, to } = {}) {
  const where = {
    ...(eventType && { eventType }),
    ...(from && { createdAt: { gte: new Date(from) } }),
    ...(to   && { createdAt: { ...(from ? { gte: new Date(from) } : {}), lte: new Date(to) } }),
    ...(search && {
      OR: [
        { providerEventId: { contains: search, mode: 'insensitive' } },
        { workspace: { name: { contains: search, mode: 'insensitive' } } },
      ],
    }),
  };

  const skip = (Number(page) - 1) * Number(limit);
  const [total, items] = await Promise.all([
    prisma.billingEvent.count({ where }),
    prisma.billingEvent.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: Number(limit),
      include: {
        workspace:    { select: { id: true, name: true } },
        subscription: { select: { id: true, status: true, stripeSubscriptionId: true, plan: { select: { name: true } } } },
      },
    }),
  ]);

  return { items, total, page: Number(page), limit: Number(limit) };
}

// ── Single event ──────────────────────────────────────────────────────────────

async function getEvent(id) {
  return prisma.billingEvent.findUnique({
    where: { id },
    include: {
      workspace:    { select: { id: true, name: true } },
      subscription: {
        select: {
          id: true, status: true,
          stripeCustomerId: true, stripeSubscriptionId: true,
          currentPeriodStart: true, currentPeriodEnd: true,
          plan: { select: { name: true, code: true, monthlyPriceUsd: true } },
        },
      },
    },
  });
}

// ── Subscriptions overview ────────────────────────────────────────────────────

async function listSubscriptions({ search = '', status = '', page = 1, limit = 25 } = {}) {
  const where = {
    ...(status && { status }),
    ...(search && {
      OR: [
        { workspace: { name: { contains: search, mode: 'insensitive' } } },
        { stripeCustomerId: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };

  const skip = (Number(page) - 1) * Number(limit);
  const [total, items] = await Promise.all([
    prisma.subscription.count({ where }),
    prisma.subscription.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      skip,
      take: Number(limit),
      include: {
        workspace: { select: { id: true, name: true } },
        plan:      { select: { name: true, code: true, monthlyPriceUsd: true } },
      },
    }),
  ]);

  return { items, total, page: Number(page), limit: Number(limit) };
}

module.exports = { getDashboard, listEvents, getEvent, listSubscriptions };
