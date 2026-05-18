/**
 * Feature access utilities.
 * Centralizes plan capability checks so future slices don't re-implement gating logic.
 *
 * hasFeature / getLimit operate on a Plan object from the DB.
 * canAccessFeature also checks subscription status so inactive subscriptions are blocked.
 */

const ACTIVE_STATUSES = ['active', 'trialing'];

const FEATURE_MAP = {
  expenses: 'hasExpenses',
  ai_categorization: 'hasAiCategorization',
  advanced_compliance: 'hasAdvancedCompliance',
  invoicing: null, // always available
};

const LIMIT_MAP = {
  users: 'maxUsers',
  monthly_invoices: 'maxMonthlyInvoices',
  monthly_ai_requests: 'maxMonthlyAiRequests',
  storage_mb: 'maxStorageMb',
};

const hasFeature = (plan, featureKey) => {
  if (!plan) return false;
  const field = FEATURE_MAP[featureKey];
  if (field === null) return true; // always-on features
  if (field === undefined) return false;
  return Boolean(plan[field]);
};

const getLimit = (plan, limitKey) => {
  if (!plan) return 0;
  const field = LIMIT_MAP[limitKey];
  if (!field) return null;
  const val = plan[field];
  return val === null || val === undefined ? null : val; // null = unlimited
};

const canAccessFeature = (subscription, featureKey) => {
  if (!subscription) return false;
  if (!ACTIVE_STATUSES.includes(subscription.status)) return false;
  return hasFeature(subscription.plan, featureKey);
};

const buildFeatureAccess = (plan) => ({
  features: Object.keys(FEATURE_MAP).map((key) => ({
    key,
    included: hasFeature(plan, key),
  })),
  limits: Object.fromEntries(
    Object.keys(LIMIT_MAP).map((key) => [key, getLimit(plan, key)])
  ),
});

module.exports = { hasFeature, getLimit, canAccessFeature, buildFeatureAccess };
