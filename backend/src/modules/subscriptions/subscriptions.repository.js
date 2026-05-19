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

const findPlanByCode = (code) =>
  prisma.plan.findFirst({ where: { code, isActive: true } });

const updateSubscriptionPlan = (workspaceId, planId) =>
  prisma.subscription.update({
    where: { workspaceId },
    data: { planId, status: 'active' },
    include: SUBSCRIPTION_INCLUDE,
  });

const updateSubscriptionStatus = (workspaceId, status) =>
  prisma.subscription.update({
    where: { workspaceId },
    data: { status },
    include: SUBSCRIPTION_INCLUDE,
  });

const countActiveMembers = (workspaceId) =>
  prisma.workspaceMember.count({ where: { workspaceId, status: 'active' } });

module.exports = {
  findByWorkspace,
  findFreePlan,
  createFreeSubscription,
  findPlanByCode,
  updateSubscriptionPlan,
  updateSubscriptionStatus,
  countActiveMembers,
};
