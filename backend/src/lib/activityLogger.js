const { randomUUID } = require('crypto');
const prisma = require('./prisma');

// Derive module and category from legacy action string (e.g. "customer.created" → customers / Customers)
function deriveMeta(action = '') {
  const prefix = action.split('.')[0].toLowerCase();
  const MAP = {
    customer:   { module: 'customers',      category: 'Customers'      },
    invoice:    { module: 'invoices',       category: 'Invoices'       },
    payment:    { module: 'payments',       category: 'Payments'       },
    expense:    { module: 'expenses',       category: 'Expenses'       },
    file:       { module: 'files',          category: 'Files'          },
    compliance: { module: 'compliance',     category: 'Compliance'     },
    member:     { module: 'members',        category: 'Users'          },
    invitation: { module: 'members',        category: 'Users'          },
    workspace:  { module: 'workspaces',     category: 'Workspace'      },
    settings:   { module: 'settings',       category: 'Administration' },
    billing:    { module: 'billing',        category: 'Billing'        },
    subscription: { module: 'billing',      category: 'Subscription'   },
    report:     { module: 'reports',        category: 'System'         },
    auth:       { module: 'authentication', category: 'Authentication' },
  };
  return MAP[prefix] || { module: null, category: null };
}

const logActivity = ({
  workspaceId,
  userId,
  userName,
  action,
  module: mod,
  category,
  entityType,
  entityId,
  referenceNumber,
  description,
  metadata,
  ipAddress,
  userAgent,
} = {}) => {
  const derived = deriveMeta(action);
  prisma.activityLog
    .create({
      data: {
        workspaceId:     workspaceId     ?? undefined,
        userId:          userId          ?? undefined,
        userName:        userName        ?? undefined,
        action,
        eventId:         randomUUID(),
        eventVersion:    '1',
        module:          mod      ?? derived.module    ?? undefined,
        category:        category ?? derived.category  ?? undefined,
        entityType:      entityType      ?? undefined,
        entityId:        entityId        ?? undefined,
        referenceNumber: referenceNumber ?? undefined,
        description:     description     ?? undefined,
        metadata:        metadata        ?? undefined,
        ipAddress:       ipAddress       ?? undefined,
        userAgent:       userAgent       ?? undefined,
      },
    })
    .catch((err) => console.error('[ActivityLog] write failed:', err.message));
};

const logAudit = ({ workspaceId, adminUserId, action, entityType, entityId, oldValue, newValue } = {}) => {
  prisma.auditLog
    .create({
      data: {
        workspaceId:  workspaceId  ?? undefined,
        adminUserId:  adminUserId  ?? undefined,
        action,
        entityType:   entityType   ?? undefined,
        entityId:     entityId     ?? undefined,
        oldValue:     oldValue     ?? undefined,
        newValue:     newValue     ?? undefined,
      },
    })
    .catch((err) => console.error('[AuditLog] write failed:', err.message));
};

module.exports = { logActivity, logAudit };
