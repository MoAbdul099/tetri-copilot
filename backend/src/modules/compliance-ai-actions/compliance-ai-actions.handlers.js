const { registerHandler } = require('../ai-action-framework/ai-action-framework.registry');
const prisma = require('../../lib/prisma');

function registerComplianceHandlers() {
  // CREATE_REMINDER: create an in-app notification for the obligation
  registerHandler('CREATE_REMINDER', async ({ workspaceId, userId, action }) => {
    const occurrenceId = action.payload?.occurrenceId;
    if (!occurrenceId) {
      return { message: 'Reminder drafted. No occurrence linked — manual delivery required.', actionId: action.id };
    }

    const occ = await prisma.complianceOccurrence.findFirst({ where: { id: occurrenceId, workspaceId } });
    if (!occ) return { message: 'Occurrence not found. Reminder recorded.', actionId: action.id };

    const dedupeKey = `compliance_ai_reminder_${workspaceId}_${occurrenceId}_${action.id}`;

    const existing = await prisma.notificationItem.findFirst({ where: { dedupeKey } });
    if (!existing) {
      await prisma.notificationItem.create({
        data: {
          workspaceId,
          recipientId: occ.ownerUserId,
          type: 'compliance_reminder',
          moduleType: 'compliance',
          sourceType: 'occurrence',
          sourceId:   occurrenceId,
          title:  `Compliance Reminder: ${occ.name}`,
          body:   `${action.title} — due ${new Date(occ.dueDate).toLocaleDateString()}. ${action.description}`,
          priority: action.riskLevel === 'high' || action.riskLevel === 'critical' ? 'high' : 'medium',
          channel:  'in_app',
          status:   'pending',
          dedupeKey,
          scheduledFor: new Date(),
        },
      });
    }

    return { message: 'Compliance reminder notification created.', occurrenceId, actionId: action.id };
  });

  // PREPARE_CHECKLIST: generate and save a checklist record
  registerHandler('PREPARE_CHECKLIST', async ({ workspaceId, userId, action }) => {
    const { generateChecklist } = require('./compliance-ai-actions.generator');
    const repo = require('./compliance-ai-actions.repository');

    const obligationContext = action.context?.occurrenceContext || null;
    const checklistData = await generateChecklist(workspaceId, userId, {
      checklistType: action.title,
      obligationContext,
      contextText: null,
    });

    const saved = await repo.createChecklist({
      workspaceId,
      actionId: action.id,
      checklistData,
      createdBy: userId,
    });

    return { message: 'Checklist generated successfully.', checklistId: saved.id, totalItems: checklistData.totalItems };
  });

  // UPDATE_COMPLIANCE_STATUS: update an occurrence status
  registerHandler('UPDATE_COMPLIANCE_STATUS', async ({ workspaceId, userId, action }) => {
    const occurrenceId = action.payload?.occurrenceId;
    const newStatus    = action.payload?.newStatus || 'in_progress';

    if (!occurrenceId) {
      return { message: 'Status update recorded. No occurrence specified — manual update required.', actionId: action.id };
    }

    const occ = await prisma.complianceOccurrence.findFirst({ where: { id: occurrenceId, workspaceId } });
    if (!occ) return { message: 'Occurrence not found.', actionId: action.id };

    await prisma.complianceOccurrence.update({
      where: { id: occurrenceId },
      data: { status: newStatus, updatedAt: new Date() },
    });

    await prisma.complianceActivityLog.create({
      data: {
        occurrenceId,
        workspaceId,
        actorId: occ.ownerUserId,
        action: 'ai_status_update',
        metadata: { newStatus, triggeredByActionId: action.id, triggeredByUserId: userId },
      },
    });

    return { message: `Occurrence status updated to "${newStatus}".`, occurrenceId, newStatus };
  });

  // ESCALATE_COMPLIANCE_ITEM: create a high-priority notification
  registerHandler('ESCALATE_COMPLIANCE_ITEM', async ({ workspaceId, userId, action }) => {
    const occurrenceId = action.payload?.occurrenceId;
    const dedupeKey = `compliance_ai_escalation_${workspaceId}_${occurrenceId || 'general'}_${action.id}`;

    const existing = await prisma.notificationItem.findFirst({ where: { dedupeKey } });
    if (!existing) {
      let recipientId = userId;

      if (occurrenceId) {
        const occ = await prisma.complianceOccurrence.findFirst({ where: { id: occurrenceId, workspaceId } });
        if (occ) recipientId = occ.ownerUserId;
      }

      await prisma.notificationItem.create({
        data: {
          workspaceId,
          recipientId,
          type: 'compliance_escalation',
          moduleType: 'compliance',
          sourceType: occurrenceId ? 'occurrence' : 'ai_action',
          sourceId:   occurrenceId || action.id,
          title:  `Compliance Escalation: ${action.title}`,
          body:   action.description,
          priority: 'high',
          channel:  'in_app',
          status:   'pending',
          dedupeKey,
          scheduledFor: new Date(),
        },
      });
    }

    return { message: 'Compliance item escalated. Notification sent.', actionId: action.id };
  });
}

module.exports = { registerComplianceHandlers };
