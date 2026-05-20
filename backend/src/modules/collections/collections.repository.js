const prisma = require('../../lib/prisma');

const ACTIVITY_INCLUDE = {
  customer: { select: { id: true, name: true, customerCode: true } },
  assignedUser: { select: { id: true, fullName: true, email: true } },
  createdByUser: { select: { id: true, fullName: true } },
};

// ── Activities ─────────────────────────────────────────────

const listActivities = async (workspaceId, {
  page = 1, limit = 20, customerId, status, activityType, search,
} = {}) => {
  page  = Math.max(1, parseInt(page,  10) || 1);
  limit = Math.min(100, parseInt(limit, 10) || 20);

  const where = { workspaceId };
  if (customerId) where.customerId = customerId;
  if (status)     where.status = status;
  if (activityType) where.activityType = activityType;
  if (search) {
    where.OR = [
      { notes: { contains: search, mode: 'insensitive' } },
      { outcome: { contains: search, mode: 'insensitive' } },
      { customer: { name: { contains: search, mode: 'insensitive' } } },
    ];
  }

  const [total, items] = await Promise.all([
    prisma.collectionActivity.count({ where }),
    prisma.collectionActivity.findMany({
      where,
      include: ACTIVITY_INCLUDE,
      orderBy: { activityDate: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return { items, total, page, limit, pages: Math.ceil(total / limit) };
};

const findActivity = (id, workspaceId) =>
  prisma.collectionActivity.findFirst({ where: { id, workspaceId }, include: ACTIVITY_INCLUDE });

const createActivity = (workspaceId, userId, data) =>
  prisma.collectionActivity.create({
    data: { ...data, workspaceId, createdByUserId: userId },
    include: ACTIVITY_INCLUDE,
  });

const updateActivity = (id, workspaceId, data) =>
  prisma.collectionActivity.update({ where: { id }, data, include: ACTIVITY_INCLUDE });

const deleteActivity = (id) => prisma.collectionActivity.delete({ where: { id } });

// ── Promises ───────────────────────────────────────────────

const PROMISE_INCLUDE = {
  customer: { select: { id: true, name: true, customerCode: true } },
};

const listPromises = async (workspaceId, { page = 1, limit = 20, customerId, status } = {}) => {
  page  = Math.max(1, parseInt(page,  10) || 1);
  limit = Math.min(100, parseInt(limit, 10) || 20);

  const where = { workspaceId };
  if (customerId) where.customerId = customerId;
  if (status)     where.status = status;

  const [total, items] = await Promise.all([
    prisma.paymentPromise.count({ where }),
    prisma.paymentPromise.findMany({
      where,
      include: PROMISE_INCLUDE,
      orderBy: { promisedDate: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return { items, total, page, limit, pages: Math.ceil(total / limit) };
};

const findPromise = (id, workspaceId) =>
  prisma.paymentPromise.findFirst({ where: { id, workspaceId }, include: PROMISE_INCLUDE });

const createPromise = (workspaceId, userId, data) =>
  prisma.paymentPromise.create({
    data: { ...data, workspaceId, createdByUserId: userId },
    include: PROMISE_INCLUDE,
  });

const updatePromise = (id, workspaceId, data) =>
  prisma.paymentPromise.update({ where: { id }, data, include: PROMISE_INCLUDE });

const deletePromise = (id) => prisma.paymentPromise.delete({ where: { id } });

// ── Queue (upcoming follow-ups + overdue) ──────────────────

const getQueue = async (workspaceId) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const in7Days = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [upcomingFollowUps, brokenPromises, openActivities] = await Promise.all([
    prisma.collectionActivity.findMany({
      where: {
        workspaceId,
        nextFollowUpDate: { lte: in7Days },
        status: { notIn: ['closed'] },
      },
      include: ACTIVITY_INCLUDE,
      orderBy: { nextFollowUpDate: 'asc' },
      take: 20,
    }),
    prisma.paymentPromise.findMany({
      where: {
        workspaceId,
        status: 'pending',
        promisedDate: { lt: today },
      },
      include: PROMISE_INCLUDE,
      orderBy: { promisedDate: 'asc' },
      take: 20,
    }),
    prisma.collectionActivity.findMany({
      where: { workspaceId, status: { in: ['pending', 'contacted', 'awaiting_response'] } },
      include: ACTIVITY_INCLUDE,
      orderBy: { activityDate: 'desc' },
      take: 20,
    }),
  ]);

  return { upcomingFollowUps, brokenPromises, openActivities };
};

module.exports = {
  listActivities, findActivity, createActivity, updateActivity, deleteActivity,
  listPromises, findPromise, createPromise, updatePromise, deletePromise,
  getQueue,
};
