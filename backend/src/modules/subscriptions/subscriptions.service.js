const repo = require('./subscriptions.repository');
const { formatPlan } = require('../plans/plans.service');
const { buildFeatureAccess, canAccessFeature } = require('../../lib/featureAccess');
const { logActivity, logAudit } = require('../../lib/activityLogger');

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

const formatSubscription = (subscription) => ({
  id: subscription.id,
  status: subscription.status,
  cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
  currentPeriodStart: subscription.currentPeriodStart,
  currentPeriodEnd: subscription.currentPeriodEnd,
  plan: formatPlan(subscription.plan),
});

const changePlan = async (workspaceId, targetPlanCode, direction, requestingUserId) => {
  const subscription = await repo.findByWorkspace(workspaceId);
  if (!subscription) {
    const err = new Error('No active subscription found');
    err.statusCode = 404;
    throw err;
  }

  if (!['active', 'trialing'].includes(subscription.status)) {
    const err = new Error('Subscription is not active');
    err.statusCode = 400;
    throw err;
  }

  const currentPlan = subscription.plan;
  const targetPlan = await repo.findPlanByCode(targetPlanCode);
  if (!targetPlan) {
    const err = new Error('Plan not found');
    err.statusCode = 404;
    throw err;
  }

  if (targetPlan.code === currentPlan.code) {
    const err = new Error('Workspace is already on this plan');
    err.statusCode = 400;
    throw err;
  }

  if (direction === 'upgrade' && targetPlan.displayOrder <= currentPlan.displayOrder) {
    const err = new Error('Target plan is not an upgrade from current plan');
    err.statusCode = 400;
    throw err;
  }

  if (direction === 'downgrade' && targetPlan.displayOrder >= currentPlan.displayOrder) {
    const err = new Error('Target plan is not a downgrade from current plan');
    err.statusCode = 400;
    throw err;
  }

  // Downgrade member count check
  if (direction === 'downgrade' && targetPlan.maxUsers !== null) {
    const activeMembers = await repo.countActiveMembers(workspaceId);
    if (activeMembers > targetPlan.maxUsers) {
      const err = new Error(
        `Cannot downgrade: workspace has ${activeMembers} active members but ${targetPlan.name} allows up to ${targetPlan.maxUsers}`
      );
      err.statusCode = 400;
      throw err;
    }
  }

  const updated = await repo.updateSubscriptionPlan(workspaceId, targetPlan.id);

  const action = direction === 'upgrade' ? 'subscription.upgraded' : 'subscription.downgraded';

  logActivity({
    workspaceId,
    userId: requestingUserId,
    action,
    entityType: 'subscription',
    entityId: updated.id,
    description: `Plan changed from ${currentPlan.name} to ${targetPlan.name}`,
  });

  logAudit({
    workspaceId,
    adminUserId: requestingUserId,
    action,
    entityType: 'subscription',
    entityId: updated.id,
    oldValue: { planCode: currentPlan.code, planName: currentPlan.name },
    newValue: { planCode: targetPlan.code, planName: targetPlan.name },
  });

  return formatSubscription(updated);
};

const cancelSubscription = async (workspaceId, requestingUserId) => {
  const subscription = await repo.findByWorkspace(workspaceId);
  if (!subscription) {
    const err = new Error('No subscription found');
    err.statusCode = 404;
    throw err;
  }

  if (subscription.status === 'cancelled') {
    const err = new Error('Subscription is already cancelled');
    err.statusCode = 400;
    throw err;
  }

  const updated = await repo.updateSubscriptionStatus(workspaceId, 'cancelled');

  logActivity({
    workspaceId,
    userId: requestingUserId,
    action: 'subscription.cancelled',
    entityType: 'subscription',
    entityId: updated.id,
    description: `Subscription cancelled (was on ${subscription.plan.name} plan)`,
  });

  logAudit({
    workspaceId,
    adminUserId: requestingUserId,
    action: 'subscription.cancelled',
    entityType: 'subscription',
    entityId: updated.id,
    oldValue: { status: subscription.status, planCode: subscription.plan.code },
    newValue: { status: 'cancelled' },
  });

  return formatSubscription(updated);
};

module.exports = { getCurrentSubscription, getFeatureAccess, changePlan, cancelSubscription };
