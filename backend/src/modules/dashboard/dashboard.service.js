const repo = require('./dashboard.repository');

const getSummary = (workspaceId, userId) =>
  Promise.all([
    repo.getArSummary(workspaceId),
    repo.getRevenueSummary(workspaceId),
    repo.getCollectionsSummary(workspaceId),
    repo.getExpenseSummary(workspaceId),
    repo.getComplianceSummary(workspaceId),
    repo.getNotificationsSummary(workspaceId, userId),
  ]).then(([ar, revenue, collections, expenses, compliance, notifications]) => ({
    ar, revenue, collections, expenses, compliance, notifications,
  }));

const getFinancial    = (workspaceId, period)  => repo.getFinancialSnapshot(workspaceId, period);
const getReceivables  = (workspaceId)           => repo.getReceivablesAging(workspaceId);
const getExpenses     = (workspaceId)           => repo.getExpenseSummary(workspaceId);
const getCompliance   = (workspaceId)           => repo.getComplianceSummary(workspaceId);
const getNotifications = (workspaceId, userId)  => repo.getNotificationsSummary(workspaceId, userId);
const getActivity     = (workspaceId, limit)    => repo.getActivityFeed(workspaceId, limit);
const getSubscription = (workspaceId)           => repo.getSubscriptionUsage(workspaceId);
const getUpcomingTasks = (workspaceId, userId)  => repo.getUpcomingTasks(workspaceId, userId);

const getPreferences = async (workspaceId, userId) => {
  const pref = await repo.getPreferences(workspaceId, userId);
  return pref || { layoutJson: null, hiddenWidgets: [] };
};

const updatePreferences = (workspaceId, userId, body) => {
  const data = {};
  if (body.layoutJson    !== undefined) data.layoutJson    = body.layoutJson;
  if (body.hiddenWidgets !== undefined) data.hiddenWidgets = body.hiddenWidgets;
  return repo.upsertPreferences(workspaceId, userId, data);
};

module.exports = {
  getSummary, getFinancial, getReceivables, getExpenses,
  getCompliance, getNotifications, getActivity, getSubscription,
  getUpcomingTasks, getPreferences, updatePreferences,
};
