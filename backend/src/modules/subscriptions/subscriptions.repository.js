const prisma = require('../../lib/prisma');

const SUBSCRIPTION_INCLUDE = {
  plan: true,
};

const findByWorkspace = (workspaceId) =>
  prisma.subscription.findUnique({
    where: { workspaceId },
    include: SUBSCRIPTION_INCLUDE,
  });

const findFreePlan = () =>
  prisma.plan.findFirst({ where: { code: 'free', isActive: true } });

const createFreeSubscription = (workspaceId, planId) =>
  prisma.subscription.create({
    data: {
      workspaceId,
      planId,
      status: 'active',
      currentPeriodStart: new Date(),
    },
    include: SUBSCRIPTION_INCLUDE,
  });

module.exports = { findByWorkspace, findFreePlan, createFreeSubscription };
