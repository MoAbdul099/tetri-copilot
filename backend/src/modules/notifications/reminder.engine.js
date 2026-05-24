const prisma = require('../../lib/prisma');
const repo   = require('./notifications.repository');
const { sendReminderEmail, sendEscalationEmail } = require('../../lib/emailService');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// ── System profile seed ────────────────────────────────────

const SYSTEM_PROFILES = [
  {
    name: 'Standard Compliance',
    description: 'Default reminder schedule: 30, 14, 7, 3, 1 days before, then 1, 3, 7 days after',
    rules: [
      { name: '30 days before', offsetDays: 30, direction: 'before', channel: 'both', sortOrder: 1 },
      { name: '14 days before', offsetDays: 14, direction: 'before', channel: 'both', sortOrder: 2 },
      { name: '7 days before',  offsetDays: 7,  direction: 'before', channel: 'both', sortOrder: 3 },
      { name: '3 days before',  offsetDays: 3,  direction: 'before', channel: 'both', sortOrder: 4 },
      { name: '1 day before',   offsetDays: 1,  direction: 'before', channel: 'both', sortOrder: 5 },
      { name: '1 day overdue',  offsetDays: 1,  direction: 'after',  channel: 'both', sortOrder: 6 },
      { name: '3 days overdue', offsetDays: 3,  direction: 'after',  channel: 'both', sortOrder: 7 },
      { name: '7 days overdue', offsetDays: 7,  direction: 'after',  channel: 'both', sortOrder: 8 },
    ],
  },
  {
    name: 'Critical Compliance',
    description: 'Extended schedule for critical obligations: 90, 60, 30, 14, 7, 3, 1 days before',
    rules: [
      { name: '90 days before', offsetDays: 90, direction: 'before', channel: 'both', sortOrder: 1 },
      { name: '60 days before', offsetDays: 60, direction: 'before', channel: 'both', sortOrder: 2 },
      { name: '30 days before', offsetDays: 30, direction: 'before', channel: 'both', sortOrder: 3 },
      { name: '14 days before', offsetDays: 14, direction: 'before', channel: 'both', sortOrder: 4 },
      { name: '7 days before',  offsetDays: 7,  direction: 'before', channel: 'both', sortOrder: 5 },
      { name: '3 days before',  offsetDays: 3,  direction: 'before', channel: 'both', sortOrder: 6 },
      { name: '1 day before',   offsetDays: 1,  direction: 'before', channel: 'both', sortOrder: 7 },
    ],
  },
  {
    name: 'License Renewal',
    description: 'License renewal reminder: 90, 60, 30, 14, 7 days before',
    rules: [
      { name: '90 days before', offsetDays: 90, direction: 'before', channel: 'both', sortOrder: 1 },
      { name: '60 days before', offsetDays: 60, direction: 'before', channel: 'both', sortOrder: 2 },
      { name: '30 days before', offsetDays: 30, direction: 'before', channel: 'both', sortOrder: 3 },
      { name: '14 days before', offsetDays: 14, direction: 'before', channel: 'both', sortOrder: 4 },
      { name: '7 days before',  offsetDays: 7,  direction: 'before', channel: 'both', sortOrder: 5 },
    ],
  },
];

const SYSTEM_ESCALATION_PROFILES = [
  {
    name: 'Standard Escalation',
    description: 'Escalate at 3, 7, 14 days overdue',
    rules: [
      { level: 1, triggerAfterDays: 3,  recipientTypes: 'owner' },
      { level: 2, triggerAfterDays: 7,  recipientTypes: 'owner,backup_owner' },
      { level: 3, triggerAfterDays: 14, recipientTypes: 'workspace_admin' },
    ],
  },
  {
    name: 'Critical Escalation',
    description: 'Fast escalation for critical items: 1, 3, 7, 14 days overdue',
    rules: [
      { level: 1, triggerAfterDays: 1,  recipientTypes: 'owner' },
      { level: 2, triggerAfterDays: 3,  recipientTypes: 'owner,backup_owner' },
      { level: 3, triggerAfterDays: 7,  recipientTypes: 'workspace_admin' },
      { level: 4, triggerAfterDays: 14, recipientTypes: 'workspace_owner' },
    ],
  },
];

const ensureSystemProfiles = async () => {
  for (const profile of SYSTEM_PROFILES) {
    const existing = await prisma.notificationProfile.findFirst({
      where: { name: profile.name, isSystem: true, workspaceId: null },
    });
    if (!existing) {
      const created = await prisma.notificationProfile.create({
        data: { name: profile.name, description: profile.description, isSystem: true },
      });
      await prisma.notificationRule.createMany({
        data: profile.rules.map((r) => ({ ...r, profileId: created.id })),
      });
      console.log(`[ReminderEngine] Seeded system profile: ${profile.name}`);
    }
  }
  for (const profile of SYSTEM_ESCALATION_PROFILES) {
    const existing = await prisma.escalationProfile.findFirst({
      where: { name: profile.name, isSystem: true, workspaceId: null },
    });
    if (!existing) {
      const created = await prisma.escalationProfile.create({
        data: { name: profile.name, description: profile.description, isSystem: true },
      });
      await prisma.escalationRule.createMany({
        data: profile.rules.map((r) => ({ ...r, profileId: created.id })),
      });
      console.log(`[ReminderEngine] Seeded escalation profile: ${profile.name}`);
    }
  }
};

// ── Helper: days difference ────────────────────────────────

const daysDiff = (dateA, dateB) => {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((dateA.getTime() - dateB.getTime()) / msPerDay);
};

// ── Reminder processing ────────────────────────────────────

const buildDedupeKey = (workspaceId, recipientId, sourceId, ruleId) =>
  `${workspaceId}:${recipientId}:${sourceId}:${ruleId}`;

const buildTitle = (occ, rule) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(occ.dueDate);
  const diff = daysDiff(due, today);

  if (rule.direction === 'before') {
    if (diff === 1) return `${occ.name} — due tomorrow`;
    if (diff === 0) return `${occ.name} — due today`;
    return `${occ.name} — due in ${diff} day${diff !== 1 ? 's' : ''}`;
  }
  const overdueDays = Math.abs(diff);
  return `${occ.name} — ${overdueDays} day${overdueDays !== 1 ? 's' : ''} overdue`;
};

const buildBody = (occ, rule) => {
  const due = new Date(occ.dueDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
  const auth = occ.authority?.name || '';
  const jur  = occ.jurisdiction?.name || '';
  const parts = [`Due date: ${due}`];
  if (auth) parts.push(`Authority: ${auth}`);
  if (jur)  parts.push(`Jurisdiction: ${jur}`);
  parts.push(`Priority: ${occ.priority}`);
  return parts.join('\n');
};

const processReminders = async () => {
  try {
    const profile = await repo.getSystemDefaultProfile();
    if (!profile || profile.rules.length === 0) return;

    const occurrences = await repo.getUpcomingOccurrences(90);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let created = 0;
    for (const occ of occurrences) {
      const recipients = [occ.owner, occ.backupOwner].filter(Boolean);

      for (const rule of profile.rules) {
        const scheduledFor = new Date(occ.dueDate);
        if (rule.direction === 'before') {
          scheduledFor.setDate(scheduledFor.getDate() - rule.offsetDays);
        } else {
          scheduledFor.setDate(scheduledFor.getDate() + rule.offsetDays);
        }

        if (scheduledFor > today) continue; // not yet

        for (const recipient of recipients) {
          const dedupeKey = buildDedupeKey(occ.workspaceId, recipient.id, occ.id, rule.id);
          const item = await repo.createItem({
            workspaceId:  occ.workspaceId,
            recipientId:  recipient.id,
            type:         'reminder',
            moduleType:   'compliance',
            sourceType:   'compliance_occurrence',
            sourceId:     occ.id,
            title:        buildTitle(occ, rule),
            body:         buildBody(occ, rule),
            priority:     occ.priority,
            channel:      rule.channel,
            status:       'sent',
            ruleId:       rule.id,
            dedupeKey,
            scheduledFor,
            metadata: {
              occurrenceName: occ.name,
              dueDate:        occ.dueDate,
              workspaceName:  occ.workspace?.name,
            },
          });
          if (item) created++;
        }
      }
    }
    if (created > 0) console.log(`[ReminderEngine] Created ${created} reminder notifications`);
  } catch (err) {
    console.error('[ReminderEngine] processReminders error:', err.message);
  }
};

// ── Email delivery ─────────────────────────────────────────

const deliverPendingEmails = async () => {
  try {
    const items = await repo.getPendingEmailItems();
    for (const item of items) {
      const pref = await repo.getPreference(item.recipientId, item.workspaceId);
      if (pref && !pref.enableEmail) {
        await repo.updateItem(item.id, { emailSentAt: new Date() }); // suppress
        continue;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const meta = item.metadata || {};

      try {
        await sendReminderEmail({
          to:            item.recipient.email,
          recipientName: item.recipient.fullName || item.recipient.email,
          title:         item.title,
          body:          item.body,
          occurrenceName: meta.occurrenceName || item.title,
          dueDate:       meta.dueDate ? new Date(meta.dueDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : '',
          priority:      item.priority,
          workspaceName: meta.workspaceName || '',
          sourceLink:    `${FRONTEND_URL}/compliance/occurrences/${item.sourceId}`,
        });
        await repo.updateItem(item.id, { emailSentAt: new Date() });
      } catch (emailErr) {
        console.error(`[ReminderEngine] Email failed for ${item.recipient.email}:`, emailErr.message);
      }
    }
  } catch (err) {
    console.error('[ReminderEngine] deliverPendingEmails error:', err.message);
  }
};

// ── Escalation processing ──────────────────────────────────

const processEscalations = async () => {
  try {
    const escProfile = await repo.getSystemDefaultEscalationProfile();
    if (!escProfile || escProfile.rules.length === 0) return;

    const overdueOccs = await repo.getOverdueOccurrences();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const occ of overdueOccs) {
      const daysOverdue = daysDiff(today, new Date(occ.dueDate));
      if (daysOverdue <= 0) continue;

      for (const rule of escProfile.rules) {
        if (!rule.isActive) continue;
        if (daysOverdue < rule.triggerAfterDays) continue;

        // Resolve recipients
        const recipientTypes = rule.recipientTypes.split(',').map((r) => r.trim());
        const recipients = [];
        if (recipientTypes.includes('owner') && occ.owner) recipients.push(occ.owner);
        if (recipientTypes.includes('backup_owner') && occ.backupOwner) recipients.push(occ.backupOwner);
        if (recipientTypes.includes('workspace_admin') || recipientTypes.includes('workspace_owner')) {
          const admins = await repo.getWorkspaceAdmins(occ.workspaceId);
          admins.forEach((m) => { if (m.user) recipients.push(m.user); });
        }

        const recipientIds = [...new Set(recipients.map((r) => r.id))];

        const instance = await repo.createEscalationInstance({
          workspaceId:      occ.workspaceId,
          occurrenceId:     occ.id,
          profileId:        escProfile.id,
          ruleId:           rule.id,
          level:            rule.level,
          status:           'sent',
          recipientUserIds: recipientIds,
          sentAt:           new Date(),
          metadata: {
            daysOverdue,
            occurrenceName: occ.name,
            dueDate:        occ.dueDate,
          },
        });

        if (!instance) continue; // already exists

        // Create in-app notifications for each recipient
        for (const recipient of recipients) {
          const dedupeKey = `esc:${occ.workspaceId}:${recipient.id}:${occ.id}:${rule.id}`;
          await repo.createItem({
            workspaceId:  occ.workspaceId,
            recipientId:  recipient.id,
            type:         'escalation',
            moduleType:   'compliance',
            sourceType:   'compliance_occurrence',
            sourceId:     occ.id,
            title:        `ESCALATION: ${occ.name} — ${daysOverdue} days overdue`,
            body:         `This compliance obligation is ${daysOverdue} days overdue. Escalation level ${rule.level}.`,
            priority:     occ.priority === 'low' ? 'medium' : 'critical',
            channel:      'both',
            status:       'sent',
            ruleId:       null,
            dedupeKey,
            scheduledFor: new Date(),
            metadata: { daysOverdue, occurrenceName: occ.name, dueDate: occ.dueDate, escalationLevel: rule.level },
          });

          // Send escalation email
          try {
            await sendEscalationEmail({
              to:            recipient.email,
              recipientName: recipient.fullName || recipient.email,
              occurrenceName: occ.name,
              dueDate:       new Date(occ.dueDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }),
              daysOverdue,
              priority:      occ.priority,
              authority:     occ.authority?.name || '',
              workspaceName: occ.workspace?.name || '',
              escalationLevel: rule.level,
              sourceLink:    `${FRONTEND_URL}/compliance/occurrences/${occ.id}`,
            });
          } catch (emailErr) {
            console.error('[ReminderEngine] Escalation email failed:', emailErr.message);
          }
        }
      }
    }
  } catch (err) {
    console.error('[ReminderEngine] processEscalations error:', err.message);
  }
};

// ── Engine startup ─────────────────────────────────────────

const startReminderEngine = () => {
  console.log('[ReminderEngine] Starting notification & escalation engine');

  ensureSystemProfiles()
    .then(() => {
      processReminders();
      deliverPendingEmails();
      processEscalations();
    })
    .catch((err) => console.error('[ReminderEngine] Startup error:', err.message));

  // Run hourly
  setInterval(() => {
    processReminders().then(() => deliverPendingEmails()).catch(console.error);
    processEscalations().catch(console.error);
  }, 60 * 60 * 1000);
};

module.exports = { startReminderEngine };
