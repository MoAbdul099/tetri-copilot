const repo = require('./plans.repository');
const { buildFeatureAccess } = require('../../lib/featureAccess');

const formatPlan = (plan) => ({
  id: plan.id,
  code: plan.code,
  name: plan.name,
  description: plan.description,
  monthlyPriceUsd: Number(plan.monthlyPriceUsd),
  yearlyPriceUsd: plan.yearlyPriceUsd !== null ? Number(plan.yearlyPriceUsd) : null,
  displayOrder: plan.displayOrder,
  isRecommended: plan.isRecommended,
  includedUsers: plan.includedUsers,
  ...buildFeatureAccess(plan),
});

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
