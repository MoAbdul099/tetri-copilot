const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const USER_SELECT = {
  id: true, email: true, fullName: true, phone: true, status: true,
  lastLoginAt: true, createdAt: true, isPlatformAdmin: true,
  adminMeta: true,
  workspaceMemberships: {
    take: 1,
    orderBy: { createdAt: 'asc' },
    select: {
      role: true, status: true, joinedAt: true,
      workspace: { select: { id: true, name: true, company: { select: { companyName: true } } } },
    },
  },
  _count: { select: { workspaceMemberships: true, activityLogs: true, aiUsageLogs: true } },
};

async function list({ search, status, role, page = 1, limit = 20 }) {
  const skip = (page - 1) * limit;
  const where = {};
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { fullName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { workspaceMemberships: { some: { workspace: { name: { contains: search, mode: 'insensitive' } } } } },
    ];
  }
  if (role) where.workspaceMemberships = { some: { role } };

  const [items, total] = await Promise.all([
    prisma.user.findMany({ where, select: USER_SELECT, skip, take: limit, orderBy: { createdAt: 'desc' } }),
    prisma.user.count({ where }),
  ]);
  return { items, total, pages: Math.ceil(total / limit), page };
}

async function findById(id) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true, email: true, fullName: true, phone: true, status: true,
      lastLoginAt: true, createdAt: true, updatedAt: true, isPlatformAdmin: true, clerkUserId: true,
      adminMeta: true,
      workspaceMemberships: {
        orderBy: { createdAt: 'asc' },
        select: {
          id: true, role: true, status: true, joinedAt: true, createdAt: true,
          workspace: { select: { id: true, name: true, status: true, company: { select: { companyName: true } } } },
        },
      },
      _count: { select: { workspaceMemberships: true, activityLogs: true, aiUsageLogs: true } },
    },
  });
}

async function updateStatus(id, status) {
  return prisma.user.update({ where: { id }, data: { status } });
}

async function getActivity(id, limit = 30) {
  const [actLogs, auditLogs] = await Promise.all([
    prisma.activityLog.findMany({
      where: { userId: id },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: { id: true, action: true, module: true, entityType: true, description: true, ipAddress: true, createdAt: true },
    }),
    prisma.auditLog.findMany({
      where: { userId: id },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { id: true, action: true, entityType: true, ipAddress: true, createdAt: true },
    }),
  ]);

  return [
    ...actLogs.map((l) => ({ id: l.id, type: 'activity', label: `${l.module || l.entityType || 'App'}: ${l.action}`, description: l.description, ipAddress: l.ipAddress, createdAt: l.createdAt })),
    ...auditLogs.map((l) => ({ id: l.id, type: 'audit', label: `Audit: ${l.entityType || ''} ${l.action}`, ipAddress: l.ipAddress, createdAt: l.createdAt })),
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, limit);
}

async function getSecurity(id) {
  const since30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  // Security events are workspace-scoped; find all workspaces this user belongs to
  const memberships = await prisma.workspaceMember.findMany({
    where: { userId: id },
    select: { workspaceId: true },
  });
  const workspaceIds = memberships.map((m) => m.workspaceId);

  const [secEvents, recentLogins, aiUsage30d] = await Promise.all([
    workspaceIds.length > 0
      ? prisma.securityEvent.findMany({
          where: { workspaceId: { in: workspaceIds }, userId: id },
          orderBy: { createdAt: 'desc' },
          take: 20,
          select: { id: true, eventType: true, category: true, severity: true, riskScore: true, description: true, createdAt: true },
        })
      : Promise.resolve([]),
    prisma.activityLog.findMany({
      where: { userId: id, createdAt: { gte: since30d } },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { id: true, action: true, ipAddress: true, userAgent: true, createdAt: true },
    }),
    prisma.aiUsageLog.aggregate({
      where: { userId: id, createdAt: { gte: since30d } },
      _count: { id: true },
      _sum: { totalTokens: true, estimatedCostUsd: true },
    }),
  ]);

  return {
    securityEvents: secEvents,
    recentActivity: recentLogins,
    aiUsage30d: {
      requests: aiUsage30d._count.id,
      tokens: aiUsage30d._sum.totalTokens || 0,
      costUsd: Number(aiUsage30d._sum.estimatedCostUsd || 0).toFixed(4),
    },
  };
}

async function upsertAdminMeta(userId) {
  return prisma.userAdminMeta.upsert({
    where: { userId },
    create: { userId, adminNotes: [] },
    update: {},
  });
}

async function addNote(userId, { text, adminId, adminEmail }) {
  const meta = await upsertAdminMeta(userId);
  const notes = Array.isArray(meta.adminNotes) ? meta.adminNotes : [];
  const newNote = { id: Date.now().toString(), text, adminId, adminEmail, createdAt: new Date().toISOString() };
  return prisma.userAdminMeta.update({
    where: { userId },
    data: {
      adminNotes: [...notes, newNote],
      lastReviewedAt: new Date(),
      lastReviewedById: adminId,
      reviewStatus: 'reviewed',
    },
  });
}

module.exports = { list, findById, updateStatus, getActivity, getSecurity, addNote };
