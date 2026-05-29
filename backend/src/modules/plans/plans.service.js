const repo = require('./plans.repository');
const { buildFeatureAccess } = require('../../lib/featureAccess');

const formatPlan = (plan) => {
  const access = buildFeatureAccess(plan);
  return {
    ...access, // spreads `limits` and legacy `features` (4-key gating flags)
    id: plan.id,
    code: plan.code,
    name: plan.name,
    description: plan.description,
    monthlyPriceUsd: Number(plan.monthlyPriceUsd),
    yearlyPriceUsd: plan.yearlyPriceUsd !== null ? Number(plan.yearlyPriceUsd) : null,
    displayOrder: plan.displayOrder,
    isRecommended: plan.isRecommended,
    isPublic: plan.isPublic,
    includedUsers: plan.includedUsers,
    maxUsers: plan.maxUsers,
    maxMonthlyInvoices: plan.maxMonthlyInvoices,
    maxMonthlyAiRequests: plan.maxMonthlyAiRequests,
    maxStorageMb: plan.maxStorageMb,
    trialDays: plan.trialDays,
    featureFlags: access.features, // legacy gating flags for internal use
    features: plan.features ?? [],  // canonical rich feature list for UI
    stripeProductId: plan.stripeProductId ?? null,
    stripePriceIdMonthly: plan.stripePriceIdMonthly ?? null,
    stripePriceIdYearly: plan.stripePriceIdYearly ?? null,
  };
};

const listPlans = async () => {
  const plans = await repo.listPublicPlans();
  return plans.map(formatPlan);
};

const getPlanBySlug = async (slug) => {
  const plan = await repo.findByCode(slug);
  if (!plan) {
    const err = new Error('Plan not found');
    err.statusCode = 404;
    throw err;
  }
  return formatPlan(plan);
};

module.exports = { listPlans, getPlanBySlug, formatPlan };
