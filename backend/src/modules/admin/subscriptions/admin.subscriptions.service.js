const repo = require('./admin.subscriptions.repository');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const ALLOWED_STATUSES = ['active', 'cancelled', 'expired', 'past_due'];

async function changeStatus(id, status, { adminId, ipAddress }) {
  if (!ALLOWED_STATUSES.includes(status)) {
    throw Object.assign(new Error(`Invalid status. Allowed: ${ALLOWED_STATUSES.join(', ')}`), { statusCode: 400 });
  }
  const sub = await repo.findById(id);
  if (!sub) throw Object.assign(new Error('Subscription not found'), { statusCode: 404 });

  await repo.updateStatus(id, status);

  await prisma.adminActivityLog.create({
    data: {
      adminId,
      action: `subscription_${status}`,
      entityType: 'subscription',
      entityId: id,
      meta: {
        workspaceId: sub.workspace?.id,
        workspaceName: sub.workspace?.name,
        planName: sub.plan?.name,
        fromStatus: sub.status,
        toStatus: status,
      },
      ipAddress,
    },
  });

  return { id, status };
}

module.exports = { changeStatus };
