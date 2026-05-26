const service = require('./audit.service');
const { success, error } = require('../../utils/response');

// Guard: only owner/admin may access audit logs
function requireAdminRole(req, res) {
  if (!['owner', 'admin'].includes(req.role)) {
    error(res, 'Access denied — audit logs require owner or admin role', 403);
    return false;
  }
  return true;
}

async function getAuditFeed(req, res) {
  if (!requireAdminRole(req, res)) return;
  try {
    const result = await service.getAuditFeed(req.workspaceMember.workspaceId, req.query);
    return success(res, result);
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
}

async function getAuditEntry(req, res) {
  if (!requireAdminRole(req, res)) return;
  try {
    const item = await service.getAuditEntry(req.params.id, req.workspaceMember.workspaceId);
    return success(res, item);
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
}

async function getEntityAuditTrail(req, res) {
  if (!requireAdminRole(req, res)) return;
  try {
    const items = await service.getEntityAuditTrail(req.params.entityId, req.workspaceMember.workspaceId, req.query);
    return success(res, items);
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
}

async function getUserAuditTrail(req, res) {
  if (!requireAdminRole(req, res)) return;
  try {
    const items = await service.getUserAuditTrail(req.params.userId, req.workspaceMember.workspaceId, req.query);
    return success(res, items);
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
}

async function verifyChain(req, res) {
  if (!requireAdminRole(req, res)) return;
  try {
    const { entityId } = req.query;
    const result = await service.verifyChain(req.workspaceMember.workspaceId, entityId || null);
    return success(res, result);
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
}

async function exportAudit(req, res) {
  if (!requireAdminRole(req, res)) return;
  try {
    const items = await service.exportAudit(req.workspaceMember.workspaceId, req.query);

    const headers = ['ID', 'Date', 'User', 'Action', 'Entity Type', 'Entity ID', 'IP Address', 'Legal Hold', 'Record Hash'];
    const rows = items.map((r) => [
      r.id,
      r.createdAt.toISOString(),
      r.userName || r.userId || '',
      r.action,
      r.entityType || '',
      r.entityId || '',
      r.ipAddress || '',
      r.isLegalHold ? 'Yes' : 'No',
      r.recordHash || '',
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="audit-log.csv"');
    return res.send(csv);
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
}

async function setLegalHold(req, res) {
  if (req.role !== 'owner') return error(res, 'Only workspace owners can manage legal holds', 403);
  try {
    const { isLegalHold } = req.body;
    await service.setLegalHold(req.params.id, req.workspaceMember.workspaceId, Boolean(isLegalHold));
    return success(res, {}, 'Legal hold updated');
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
}

module.exports = { getAuditFeed, getAuditEntry, getEntityAuditTrail, getUserAuditTrail, verifyChain, exportAudit, setLegalHold };
