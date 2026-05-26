const repo = require('./activity.repository');

async function getActivityFeed(workspaceId, filters) {
  return repo.list(workspaceId, filters);
}

async function getActivity(id, workspaceId) {
  const item = await repo.findById(id, workspaceId);
  if (!item) throw Object.assign(new Error('Activity not found'), { status: 404 });
  return item;
}

async function getEntityTimeline(entityId, workspaceId, options) {
  return repo.listByEntity(entityId, workspaceId, options);
}

async function getMyActivity(userId, workspaceId, options) {
  return repo.listForCurrentUser(userId, workspaceId, options);
}

async function getRecentActivity(workspaceId, limit, userId = null) {
  return repo.recent(workspaceId, limit, userId);
}

async function exportActivity(workspaceId, filters) {
  return repo.listForExport(workspaceId, filters);
}

module.exports = {
  getActivityFeed,
  getActivity,
  getEntityTimeline,
  getMyActivity,
  getRecentActivity,
  exportActivity,
};
