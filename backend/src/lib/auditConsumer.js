const { randomUUID } = require('crypto');
const eventBus = require('./eventBus');
const prisma = require('./prisma');
const { diff } = require('./diffEngine');
const { hashRecord, buildChainHash } = require('./auditHasher');

// Events that warrant audit records (sensitive/financial/security)
const AUDITABLE_EVENTS = new Set([
  'Auth.SignedIn', 'Auth.SignedOut', 'Auth.Registered', 'Auth.PasswordResetRequested',
  'Workspace.Created', 'Workspace.Updated', 'Workspace.SetupCompleted',
  'Members.Invited', 'Members.Joined', 'Members.Removed', 'Members.RoleChanged',
  'Customers.Created', 'Customers.Updated', 'Customers.Deleted',
  'Invoices.Created', 'Invoices.Updated', 'Invoices.Issued', 'Invoices.Paid', 'Invoices.Voided', 'Invoices.Deleted',
  'Payments.Recorded', 'Payments.Allocated', 'Payments.Deleted',
  'Expenses.Created', 'Expenses.Updated', 'Expenses.Submitted', 'Expenses.Approved', 'Expenses.Rejected', 'Expenses.Reimbursed', 'Expenses.Deleted',
  'Files.Uploaded', 'Files.Deleted',
  'Compliance.TaskCreated', 'Compliance.TaskCompleted', 'Compliance.TemplateCreated',
  'Billing.SubscriptionCreated', 'Billing.SubscriptionUpdated', 'Billing.SubscriptionCancelled', 'Billing.PaymentReceived',
  'System.SettingsUpdated',
]);

async function getPreviousHash(workspaceId, entityId) {
  const latest = await prisma.auditLog.findFirst({
    where: { workspaceId, ...(entityId ? { entityId } : {}) },
    orderBy: { createdAt: 'desc' },
    select: { recordHash: true },
  });
  return latest?.recordHash ?? null;
}

async function writeAuditEntry(eventName, payload) {
  const {
    workspaceId, userId, userName,
    entityType, entityId,
    beforeSnapshot, afterSnapshot,
    description, ipAddress, userAgent,
    correlationId,
  } = payload;

  const fieldChanges = diff(beforeSnapshot ?? null, afterSnapshot ?? null);

  const auditPayload = {
    workspaceId:  workspaceId  ?? null,
    userId:       userId       ?? null,
    userName:     userName     ?? null,
    action:       eventName,
    entityType:   entityType   ?? null,
    entityId:     entityId     ?? null,
    fieldChanges,
    beforeSnapshot: beforeSnapshot ?? null,
    afterSnapshot:  afterSnapshot  ?? null,
    createdAt:    new Date().toISOString(),
  };

  const recordHash       = hashRecord(auditPayload);
  const previousRecordHash = await getPreviousHash(workspaceId, entityId);
  const chainHash        = buildChainHash(recordHash, previousRecordHash);

  await prisma.auditLog.create({
    data: {
      workspaceId:         workspaceId      ?? undefined,
      userId:              userId           ?? undefined,
      userName:            userName         ?? undefined,
      eventId:             payload.eventId  ? payload.eventId : randomUUID(),
      correlationId:       correlationId    ?? undefined,
      action:              eventName,
      entityType:          entityType       ?? undefined,
      entityId:            entityId         ?? undefined,
      fieldChangesJson:    fieldChanges.length ? fieldChanges : undefined,
      beforeSnapshotJson:  beforeSnapshot   ?? undefined,
      afterSnapshotJson:   afterSnapshot    ?? undefined,
      recordHash,
      previousRecordHash:  previousRecordHash ?? undefined,
      chainHash,
      ipAddress:           ipAddress        ?? undefined,
      userAgent:           userAgent        ?? undefined,
    },
  });
}

function start() {
  eventBus.subscribeAll(async (eventName, payload) => {
    if (!AUDITABLE_EVENTS.has(eventName)) return;
    if (!payload || typeof payload !== 'object') return;

    try {
      await writeAuditEntry(eventName, payload);
    } catch (err) {
      console.error(`[AuditConsumer] failed for event "${eventName}":`, err.message);
    }
  });

  console.log('[AuditConsumer] subscribed to event bus');
}

module.exports = { start };
