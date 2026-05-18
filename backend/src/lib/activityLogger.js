const prisma = require('./prisma');

const logActivity = ({ workspaceId, userId, action, entityType, entityId, description, metadata } = {}) => {
  prisma.activityLog
    .create({
      data: {
        workspaceId: workspaceId ?? undefined,
        userId: userId ?? undefined,
        action,
        entityType: entityType ?? undefined,
        entityId: entityId ?? undefined,
        description: description ?? undefined,
        metadata: metadata ?? undefined,
      },
    })
    .catch((err) => console.error('[ActivityLog] write failed:', err.message));
};

const logAudit = ({ workspaceId, adminUserId, action, entityType, entityId, oldValue, newValue } = {}) => {
  prisma.auditLog
    .create({
      data: {
        workspaceId: workspaceId ?? undefined,
        adminUserId: adminUserId ?? undefined,
        action,
        entityType: entityType ?? undefined,
        entityId: entityId ?? undefined,
        oldValue: oldValue ?? undefined,
        newValue: newValue ?? undefined,
      },
    })
    .catch((err) => console.error('[AuditLog] write failed:', err.message));
};

module.exports = { logActivity, logAudit };
