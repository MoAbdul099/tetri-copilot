const prisma = require('../../lib/prisma');
const repo   = require('./notifications.repository');

// ── Event registry ─────────────────────────────────────────

const EVENTS = {
  // Invoice
  INVOICE_CREATED:            { moduleType: 'invoice',    priority: 'low',      type: 'info' },
  INVOICE_ISSUED:             { moduleType: 'invoice',    priority: 'low',      type: 'info' },
  INVOICE_SENT:               { moduleType: 'invoice',    priority: 'medium',   type: 'info' },
  INVOICE_UPDATED:            { moduleType: 'invoice',    priority: 'low',      type: 'info' },
  INVOICE_CANCELLED:          { moduleType: 'invoice',    priority: 'medium',   type: 'alert' },
  INVOICE_VOIDED:             { moduleType: 'invoice',    priority: 'high',     type: 'alert' },
  INVOICE_OVERDUE:            { moduleType: 'invoice',    priority: 'high',     type: 'alert' },
  // Payment
  PAYMENT_RECEIVED:           { moduleType: 'invoice',    priority: 'medium',   type: 'info' },
  PAYMENT_ALLOCATED:          { moduleType: 'invoice',    priority: 'low',      type: 'info' },
  PAYMENT_REVERSED:           { moduleType: 'invoice',    priority: 'high',     type: 'alert' },
  // Expense
  EXPENSE_SUBMITTED:          { moduleType: 'expense',    priority: 'medium',   type: 'approval' },
  EXPENSE_APPROVAL_REQUIRED:  { moduleType: 'expense',    priority: 'high',     type: 'approval' },
  EXPENSE_APPROVED:           { moduleType: 'expense',    priority: 'medium',   type: 'info' },
  EXPENSE_REJECTED:           { moduleType: 'expense',    priority: 'high',     type: 'alert' },
  REIMBURSEMENT_COMPLETED:    { moduleType: 'expense',    priority: 'medium',   type: 'info' },
  ANOMALY_DETECTED:           { moduleType: 'expense',    priority: 'high',     type: 'alert' },
  BUDGET_THRESHOLD_REACHED:   { moduleType: 'expense',    priority: 'high',     type: 'alert' },
  // Compliance
  COMPLIANCE_TASK_ASSIGNED:   { moduleType: 'compliance', priority: 'high',     type: 'compliance' },
  COMPLIANCE_TASK_OVERDUE:    { moduleType: 'compliance', priority: 'critical', type: 'compliance' },
  COMPLIANCE_TASK_COMPLETED:  { moduleType: 'compliance', priority: 'low',      type: 'compliance' },
  COMPLIANCE_DUE_SOON:        { moduleType: 'compliance', priority: 'medium',   type: 'compliance' },
  COMPLIANCE_OVERDUE:         { moduleType: 'compliance', priority: 'high',     type: 'compliance' },
  TASK_ASSIGNED:              { moduleType: 'compliance', priority: 'high',     type: 'compliance' },
  TASK_COMPLETED:             { moduleType: 'compliance', priority: 'low',      type: 'compliance' },
  TASK_OVERDUE:               { moduleType: 'compliance', priority: 'high',     type: 'compliance' },
  TASK_ESCALATED:             { moduleType: 'compliance', priority: 'critical', type: 'compliance' },
  // Workspace & Users
  USER_INVITED:               { moduleType: 'workspace',  priority: 'low',      type: 'info' },
  USER_ROLE_CHANGED:          { moduleType: 'workspace',  priority: 'medium',   type: 'info' },
  USER_CREATED:               { moduleType: 'workspace',  priority: 'low',      type: 'info' },
  USER_REMOVED:               { moduleType: 'workspace',  priority: 'medium',   type: 'info' },
  WORKSPACE_SETTINGS_UPDATED: { moduleType: 'workspace',  priority: 'low',      type: 'info' },
  ANNOUNCEMENT_PUBLISHED:     { moduleType: 'workspace',  priority: 'medium',   type: 'info' },
  // Customer
  CUSTOMER_CREATED:           { moduleType: 'customer',   priority: 'low',      type: 'info' },
  CUSTOMER_UPDATED:           { moduleType: 'customer',   priority: 'low',      type: 'info' },
  CUSTOMER_ARCHIVED:          { moduleType: 'customer',   priority: 'medium',   type: 'info' },
  // Billing
  SUBSCRIPTION_RENEWED:       { moduleType: 'billing',    priority: 'low',      type: 'info' },
  PAYMENT_FAILED:             { moduleType: 'billing',    priority: 'critical', type: 'alert' },
  TRIAL_ENDING:               { moduleType: 'billing',    priority: 'high',     type: 'alert' },
  PLAN_LIMIT_REACHED:         { moduleType: 'billing',    priority: 'high',     type: 'alert' },
  // Files
  FILE_UPLOADED:              { moduleType: 'files',      priority: 'low',      type: 'info' },
  FILE_REJECTED:              { moduleType: 'files',      priority: 'medium',   type: 'alert' },
  FILE_EXPIRED:               { moduleType: 'files',      priority: 'medium',   type: 'alert' },
  // Security
  PASSWORD_CHANGED:           { moduleType: 'security',   priority: 'high',     type: 'security' },
  LOGIN_FROM_NEW_DEVICE:      { moduleType: 'security',   priority: 'high',     type: 'security' },
  ACCOUNT_LOCKED:             { moduleType: 'security',   priority: 'critical', type: 'security' },
};

const EVENT_TITLES = {
  INVOICE_CREATED:            'Invoice Created',
  INVOICE_ISSUED:             'Invoice Issued',
  INVOICE_SENT:               'Invoice Sent',
  INVOICE_UPDATED:            'Invoice Updated',
  INVOICE_CANCELLED:          'Invoice Cancelled',
  INVOICE_VOIDED:             'Invoice Voided',
  INVOICE_OVERDUE:            'Invoice Overdue',
  PAYMENT_RECEIVED:           'Payment Received',
  PAYMENT_ALLOCATED:          'Payment Allocated',
  PAYMENT_REVERSED:           'Payment Reversed',
  EXPENSE_SUBMITTED:          'Expense Submitted',
  EXPENSE_APPROVAL_REQUIRED:  'Expense Awaiting Your Approval',
  EXPENSE_APPROVED:           'Expense Approved',
  EXPENSE_REJECTED:           'Expense Rejected',
  REIMBURSEMENT_COMPLETED:    'Reimbursement Processed',
  ANOMALY_DETECTED:           'Expense Anomaly Detected',
  BUDGET_THRESHOLD_REACHED:   'Budget Threshold Reached',
  COMPLIANCE_TASK_ASSIGNED:   'Compliance Task Assigned',
  COMPLIANCE_TASK_OVERDUE:    'Compliance Task Overdue',
  COMPLIANCE_TASK_COMPLETED:  'Compliance Task Completed',
  COMPLIANCE_DUE_SOON:        'Compliance Item Due Soon',
  COMPLIANCE_OVERDUE:         'Compliance Item Overdue',
  TASK_ASSIGNED:              'Task Assigned to You',
  TASK_COMPLETED:             'Task Completed',
  TASK_OVERDUE:               'Task Overdue',
  TASK_ESCALATED:             'Task Escalated',
  USER_INVITED:               'User Invited',
  USER_ROLE_CHANGED:          'User Role Changed',
  USER_CREATED:               'New User Added',
  USER_REMOVED:               'User Removed',
  WORKSPACE_SETTINGS_UPDATED: 'Workspace Settings Updated',
  ANNOUNCEMENT_PUBLISHED:     'New Announcement',
  CUSTOMER_CREATED:           'Customer Created',
  CUSTOMER_UPDATED:           'Customer Updated',
  CUSTOMER_ARCHIVED:          'Customer Archived',
  SUBSCRIPTION_RENEWED:       'Subscription Renewed',
  PAYMENT_FAILED:             'Payment Failed',
  TRIAL_ENDING:               'Trial Ending Soon',
  PLAN_LIMIT_REACHED:         'Plan Limit Reached',
  FILE_UPLOADED:              'File Uploaded',
  FILE_REJECTED:              'File Rejected',
  FILE_EXPIRED:               'File Expired',
  PASSWORD_CHANGED:           'Password Changed',
  LOGIN_FROM_NEW_DEVICE:      'Login from New Device',
  ACCOUNT_LOCKED:             'Account Locked',
};

// ── Seed event registry ───────────────────────────────────

const seedEventRegistry = async () => {
  try {
    for (const [eventCode, def] of Object.entries(EVENTS)) {
      await prisma.notificationEventRegistry.upsert({
        where:  { eventCode },
        create: {
          eventCode,
          categoryCode:    def.moduleType,
          sourceModule:    def.moduleType,
          defaultPriority: def.priority,
          defaultTitle:    EVENT_TITLES[eventCode] || eventCode,
          isActive:        true,
        },
        update: {
          categoryCode:    def.moduleType,
          sourceModule:    def.moduleType,
          defaultPriority: def.priority,
          defaultTitle:    EVENT_TITLES[eventCode] || eventCode,
        },
      });
    }
  } catch (_) {
    // seed failure is non-fatal
  }
};

// ── Emit single notification ───────────────────────────────

const emit = async (eventType, workspaceId, recipientId, {
  sourceId, sourceType, title, body, metadata = {}, actorId,
} = {}) => {
  if (!EVENTS[eventType]) return null;

  // Never notify the actor about their own action
  if (actorId && actorId === recipientId) return null;

  const def = EVENTS[eventType];
  const sid = sourceId || workspaceId;

  const dedupeKey = `${eventType}:${workspaceId}:${recipientId}:${sid}`;

  return repo.createItem({
    workspaceId,
    recipientId,
    type:        def.type,
    moduleType:  def.moduleType,
    sourceType:  sourceType || def.moduleType,
    sourceId:    sid,
    title,
    body:        body || '',
    priority:    def.priority,
    channel:     'both',
    status:      'sent',
    dedupeKey,
    scheduledFor: new Date(),
    metadata,
  });
};

// ── Get workspace admins/owners ────────────────────────────

const getWorkspaceAdminIds = async (workspaceId) => {
  const members = await prisma.workspaceMember.findMany({
    where: { workspaceId, role: { in: ['owner', 'admin'] }, status: 'active' },
    select: { userId: true },
  });
  return members.map((m) => m.userId);
};

// ── Emit to multiple workspace admins ─────────────────────

const emitToAdmins = async (eventType, workspaceId, payload) => {
  const adminIds = await getWorkspaceAdminIds(workspaceId);
  await Promise.allSettled(adminIds.map((recipientId) => emit(eventType, workspaceId, recipientId, payload)));
};

module.exports = { emit, emitToAdmins, seedEventRegistry, EVENTS };
