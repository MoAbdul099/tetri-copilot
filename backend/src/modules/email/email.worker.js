const prisma = require('../../lib/prisma');
const { sendEmailFromTemplate } = require('./email.service');

const POLL_INTERVAL_MS = 5 * 60 * 1000; // every 5 minutes
const BATCH_SIZE = 50;

// Map moduleType → template code
const MODULE_TEMPLATE_MAP = {
  EXPENSE_APPROVAL_REQUIRED: 'expense_approval_required',
  EXPENSE_APPROVED:          'expense_approved',
  EXPENSE_REJECTED:          'expense_rejected',
  INVOICE_CREATED:           'invoice_created',
  INVOICE_OVERDUE:           'invoice_overdue',
  COMPLIANCE_TASK_ASSIGNED:  'compliance_task_assigned',
  COMPLIANCE_TASK_OVERDUE:   'compliance_task_overdue',
  USER_INVITED:              'user_invited',
  USER_ROLE_CHANGED:         'user_role_changed',
  PAYMENT_RECEIVED:          'payment_received',
  PAYMENT_FAILED:            'payment_failed',
};

const resolveTemplateCode = (item) => {
  // Try to match by type+moduleType against event map
  const evtKey = Object.keys(MODULE_TEMPLATE_MAP).find((k) => {
    const tpl = MODULE_TEMPLATE_MAP[k];
    return tpl === `${item.moduleType}_${item.type}` || item.title?.toLowerCase().includes(k.toLowerCase().replace(/_/g, ' '));
  });
  if (evtKey) return MODULE_TEMPLATE_MAP[evtKey];
  return `${item.moduleType}_notification`;
};

const processBatch = async () => {
  // Pick up to BATCH_SIZE items that need email delivery
  const items = await prisma.notificationItem.findMany({
    where: {
      channel:     { in: ['email', 'both'] },
      emailSentAt: null,
      status:      { not: 'archived' },
      scheduledFor: { lte: new Date() },
    },
    include: {
      recipient: { select: { id: true, email: true, fullName: true } },
      workspace: { select: { id: true, name: true } },
    },
    take: BATCH_SIZE,
    orderBy: { scheduledFor: 'asc' },
  });

  if (!items.length) return;

  console.log(`[EmailWorker] Processing ${items.length} pending email item(s)`);

  for (const item of items) {
    // Mark as processing immediately to avoid double-send
    await prisma.notificationItem.update({
      where: { id: item.id },
      data:  { emailSentAt: new Date() },
    });

    try {
      const recipientEmail = item.recipient?.email;
      if (!recipientEmail) continue;

      // Check user's email preference
      const pref = await prisma.notificationPreference.findUnique({
        where: { userId_workspaceId: { userId: item.recipientId, workspaceId: item.workspaceId } },
      });
      if (pref && !pref.enableEmail) continue;

      const templateCode = resolveTemplateCode(item);
      const metadata = item.metadata || {};

      await sendEmailFromTemplate({
        templateCode,
        workspaceId:    item.workspaceId,
        recipientId:    item.recipientId,
        recipientEmail,
        notificationId: item.id,
        extraVars: {
          title:      item.title,
          body:       item.body,
          app_url:    process.env.FRONTEND_URL || 'http://localhost:5173',
          source_link: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/notifications`,
          ...metadata,
        },
      });
    } catch (err) {
      console.error(`[EmailWorker] Failed for item ${item.id}:`, err.message);
    }
  }
};

const startEmailWorker = () => {
  console.log('[EmailWorker] Starting email delivery worker (interval: 5 min)');
  processBatch().catch((e) => console.error('[EmailWorker] Initial batch error:', e.message));
  setInterval(() => {
    processBatch().catch((e) => console.error('[EmailWorker] Batch error:', e.message));
  }, POLL_INTERVAL_MS);
};

module.exports = { startEmailWorker };
