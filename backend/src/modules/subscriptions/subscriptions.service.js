const repo = require('./subscriptions.repository');
const { formatPlan } = require('../plans/plans.service');
const { buildFeatureAccess, canAccessFeature } = require('../../lib/featureAccess');
const { logActivity } = require('../../lib/activityLogger');

const getOrProvisionSubscription = async (workspaceId, userId) => {
  let subscription = await repo.findByWorkspace(workspaceId);

  if (!subscription) {
    const freePlan = await repo.findFreePlan();
    if (!freePlan) {
      const err = new Error('No active plans available');
      err.statusCode = 503;
      throw err;
    }
    subscription = await repo.createFreeSubscription(workspaceId, freePlan.id);

    logActivity({
      workspaceId,
      userId,
      action: 'subscription.provisioned',
      entityType: 'subscription',
      entityId: subscription.id,
      description: `Free plan automatically provisioned`,
    });
  }

  return subscription;
};

const getCurrentSubscription = async (workspaceId, userId) => {
  const subscription = await getOrProvisionSubscription(workspaceId, userId);
  return {
    id: subscription.id,
    status: subscription.status,
    cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
    currentPeriodStart: subscription.currentPeriodStart,
    currentPeriodEnd: subscription.currentPeriodEnd,
    plan: formatPlan(subscription.plan),
  };
};

const getFeatureAccess = async (workspaceId, userId) => {
  const subscription = await getOrProvisionSubscription(workspaceId, userId);
  const featureAccess = buildFeatureAccess(subscription.plan);
  return {
    subscriptionStatus: subscription.status,
    isActive: ['active', 'trialing'].includes(subscription.status),
    planCode: subscription.plan.code,
    ...featureAccess,
    canAccess: (featureKey) => canAccessFeature(subscription, featureKey),
  };
};

module.exports = { getCurrentSubscription, getFeatureAccess };
