const repo = require('./usage.repository');
const subscriptionsRepo = require('../subscriptions/subscriptions.repository');
const { getLimit } = require('../../lib/featureAccess');

const WARNING_THRESHOLD = 0.7;
const CRITICAL_THRESHOLD = 0.9;

const usageStatus = (used, limit) => {
  if (limit === null) return 'normal'; // unlimited
  if (limit === 0) return 'normal';
  const pct = used / limit;
  if (pct >= CRITICAL_THRESHOLD) return 'critical';
  if (pct >= WARNING_THRESHOLD) return 'warning';
  return 'normal';
};

const buildMetric = (used, limit) => ({
  used,
  limit,
  unlimited: limit === null,
  percent: limit ? Math.min(100, Math.round((used / limit) * 100)) : 0,
  status: usageStatus(used, limit),
});

const getUsageSummary = async (workspaceId, userId) => {
  let subscription = await subscriptionsRepo.findByWorkspace(workspaceId);

  if (!subscription) {
    const freePlan = await subscriptionsRepo.findFreePlan();
    if (freePlan) {
      subscription = await subscriptionsRepo.createFreeSubscription(workspaceId, freePlan.id);
    }
  }

  const plan = subscription?.plan ?? null;

  const [users, monthlyInvoices, monthlyExpenses, monthlyAiRequests] = await Promise.all([
    repo.countActiveMembers(workspaceId),
    repo.countMonthlyInvoices(workspaceId),
    repo.countMonthlyExpenses(workspaceId),
    repo.countMonthlyAiRequests(workspaceId),
  ]);

  return {
    users: buildMetric(users, getLimit(plan, 'users')),
    monthly_invoices: buildMetric(monthlyInvoices, getLimit(plan, 'monthly_invoices')),
    monthly_expenses: buildMetric(monthlyExpenses, null), // no limit on expenses yet
    monthly_ai_requests: buildMetric(monthlyAiRequests, getLimit(plan, 'monthly_ai_requests')),
    storage_mb: buildMetric(0, getLimit(plan, 'storage_mb')), // placeholder until file storage is live
  };
};

module.exports = { getUsageSummary };
