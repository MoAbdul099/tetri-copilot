// Central registry of known AI action types.
// Modules register handlers here; the registry is process-scoped (not DB-backed).

const ACTION_TYPES = {
  CREATE_REMINDER: {
    module: 'compliance',
    label: 'Create Reminder',
    description: 'Create a compliance reminder for an obligation.',
    defaultRisk: 'low',
    requiresApproval: false,
  },
  CREATE_NOTIFICATION: {
    module: 'platform',
    label: 'Send Notification',
    description: 'Send a workspace notification to members.',
    defaultRisk: 'low',
    requiresApproval: false,
  },
  GENERATE_DOCUMENT: {
    module: 'documents',
    label: 'Generate Document',
    description: 'Generate a compliance or business document using AI.',
    defaultRisk: 'medium',
    requiresApproval: false,
  },
  PREPARE_CHECKLIST: {
    module: 'compliance',
    label: 'Prepare Checklist',
    description: 'Prepare a compliance filing checklist.',
    defaultRisk: 'low',
    requiresApproval: false,
  },
  SEND_EMAIL: {
    module: 'communications',
    label: 'Send Email',
    description: 'Send a compliance or operational email to a contact.',
    defaultRisk: 'medium',
    requiresApproval: true,
  },
  UPDATE_COMPLIANCE_STATUS: {
    module: 'compliance',
    label: 'Update Compliance Status',
    description: 'Update the status of a compliance obligation.',
    defaultRisk: 'high',
    requiresApproval: true,
  },
  ESCALATE_COMPLIANCE_ITEM: {
    module: 'compliance',
    label: 'Escalate Compliance Item',
    description: 'Escalate an overdue compliance obligation to management.',
    defaultRisk: 'medium',
    requiresApproval: false,
  },
  DRAFT_APPROVAL_REQUEST: {
    module: 'approvals',
    label: 'Draft Approval Request',
    description: 'Draft an expense or document approval request.',
    defaultRisk: 'medium',
    requiresApproval: false,
  },
};

// Runtime handler registry
const handlers = {};

function registerHandler(actionType, fn) {
  handlers[actionType] = fn;
}

function getHandler(actionType) {
  return handlers[actionType] || null;
}

function listActionTypes() {
  return Object.entries(ACTION_TYPES).map(([key, meta]) => ({ key, ...meta }));
}

function getActionTypeMeta(actionType) {
  return ACTION_TYPES[actionType] || null;
}

module.exports = { listActionTypes, getActionTypeMeta, registerHandler, getHandler };
