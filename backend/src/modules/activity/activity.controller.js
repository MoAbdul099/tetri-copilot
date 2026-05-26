const service = require('./activity.service');
const { success, error } = require('../../utils/response');

async function getActivityFeed(req, res) {
  try {
    const filters = { ...req.query };
    // Regular users can only see their own activity
    if (req.role === 'user') filters.userId = req.user.id;
    const result = await service.getActivityFeed(req.workspaceMember.workspaceId, filters);
    return success(res, result);
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
}

async function getActivity(req, res) {
  try {
    const item = await service.getActivity(req.params.id, req.workspaceMember.workspaceId);
    return success(res, item);
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
}

async function getEntityTimeline(req, res) {
  try {
    const items = await service.getEntityTimeline(
      req.params.entityId,
      req.workspaceMember.workspaceId,
      req.query
    );
    return success(res, items);
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
}

async function getMyActivity(req, res) {
  try {
    const items = await service.getMyActivity(
      req.user.id,
      req.workspaceMember.workspaceId,
      req.query
    );
    return success(res, items);
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
}

async function getRecentActivity(req, res) {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const userId = req.role === 'user' ? req.user.id : null;
    const items = await service.getRecentActivity(req.workspaceMember.workspaceId, limit, userId);
    return success(res, items);
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
}

async function exportActivity(req, res) {
  try {
    const filters = { ...req.query };
    if (req.role === 'user') filters.userId = req.user.id;
    const items = await service.exportActivity(req.workspaceMember.workspaceId, filters);

    const headers = ['ID', 'Date', 'User', 'Action', 'Module', 'Category', 'Entity Type', 'Reference', 'Description'];
    const rows = items.map((r) => [
      r.id,
      r.createdAt.toISOString(),
      r.userName || r.userId || '',
      r.action,
      r.module || '',
      r.category || '',
      r.entityType || '',
      r.referenceNumber || '',
      (r.description || '').replace(/,/g, ' '),
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="activity-log.csv"');
    return res.send(csv);
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
}

module.exports = { getActivityFeed, getActivity, getEntityTimeline, getMyActivity, getRecentActivity, exportActivity };
