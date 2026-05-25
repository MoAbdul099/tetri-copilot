const prisma = require('../../lib/prisma');
const repo   = require('./notifications.repository');

// ── Event registry ─────────────────────────────────────────

const EVENTS = {
  // Invoice
  INVOICE_CREATED:           { moduleType: 'invoice',    priority: 'low',      type: 'info' },
  INVOICE_OVERDUE:           { moduleType: 'invoice',    priority: 'high',     type: 'alert' },
  PAYMENT_RECEIVED:          { moduleType: 'invoice',    priority: 'medium',   type: 'info' },
  // Expense
  EXPENSE_SUBMITTED:         { moduleType: 'expense',    priority: 'medium',   type: 'approval' },
  EXPENSE_APPROVED:          { moduleType: 'expense',    priority: 'medium',   type: 'info' },
  EXPENSE_REJECTED:          { moduleType: 'expense',    priority: 'high',     type: 'alert' },
  REIMBURSEMENT_COMPLETED:   { moduleType: 'expense',    priority: 'medium',   type: 'info' },
  // Compliance
  COMPLIANCE_TASK_ASSIGNED:  { moduleType: 'compliance', priority: 'high',     type: 'compliance' },
  COMPLIANCE_TASK_OVERDUE:   { moduleType: 'compliance', priority: 'critical',  type: 'compliance' },
  COMPLIANCE_TASK_COMPLETED: { moduleType: 'compliance', priority: 'low',      type: 'compliance' },
  // Workspace
  USER_INVITED:              { moduleType: 'workspace',  priority: 'low',      type: 'info' },
  USER_ROLE_CHANGED:         { moduleType: 'workspace',  priority: 'medium',   type: 'info' },
  WORKSPACE_SETTINGS_UPDATED:{ moduleType: 'workspace',  priority: 'low',      type: 'info' },
  // Billing
  SUBSCRIPTION_RENEWED:      { moduleType: 'billing',    priority: 'low',      type: 'info' },
  PAYMENT_FAILED:            { moduleType: 'billing',    priority: 'critical',  type: 'alert' },
  // Security
  PASSWORD_CHANGED:          { moduleType: 'security',   priority: 'high',     type: 'security' },
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

  // Business event dedupeKey: one notification per event+record+recipient
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
    channel:     'both',  // both in-app + email delivery
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

module.exports = { emit, emitToAdmins, EVENTS };
