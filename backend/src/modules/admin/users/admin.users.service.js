const repo = require('./admin.users.repository');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const ALLOWED_STATUSES = ['active', 'inactive', 'suspended'];

async function changeStatus(id, status, { adminId, ipAddress }) {
  if (!ALLOWED_STATUSES.includes(status)) {
    throw Object.assign(new Error(`Invalid status. Allowed: ${ALLOWED_STATUSES.join(', ')}`), { statusCode: 400 });
  }
  const user = await repo.findById(id);
  if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 });

  await repo.updateStatus(id, status);

  await prisma.adminActivityLog.create({
    data: {
      adminId,
      action: `user_${status}`,
      entityType: 'user',
      entityId: id,
      meta: { userEmail: user.email, fromStatus: user.status, toStatus: status },
      ipAddress,
    },
  });

  return { id, status };
}

module.exports = { changeStatus };
