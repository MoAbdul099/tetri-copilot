const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const WORKSPACE_SELECT = {
  id: true, name: true, status: true, createdAt: true,
  owner: { select: { id: true, email: true, fullName: true } },
  countryProfile: { select: { countryName: true, countryCode: true } },
  company: { select: { companyName: true } },
  subscription: { select: { status: true, currentPeriodEnd: true, plan: { select: { name: true, code: true } } } },
  adminMeta: true,
  _count: { select: { members: true, files: true } },
};

async function list({ search, status, planCode, countryCode, page = 1, limit = 20 }) {
  const skip = (page - 1) * limit;

  const where = {};
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { owner: { email: { contains: search, mode: 'insensitive' } } },
      { owner: { fullName: { contains: search, mode: 'insensitive' } } },
      { company: { companyName: { contains: search, mode: 'insensitive' } } },
    ];
  }
  if (countryCode) where.countryProfile = { countryCode };
  if (planCode) where.subscription = { plan: { code: planCode } };

  const [items, total] = await Promise.all([
    prisma.workspace.findMany({ where, select: WORKSPACE_SELECT, skip, take: limit, orderBy: { createdAt: 'desc' } }),
    prisma.workspace.count({ where }),
  ]);

  return { items, total, pages: Math.ceil(total / limit), page };
}

async function findById(id) {
  return prisma.workspace.findUnique({ where: { id }, select: WORKSPACE_SELECT });
}

async function updateStatus(id, status) {
  return prisma.workspace.update({ where: { id }, data: { status } });
}

async function getUsage(id) {
  const since30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [memberCount, fileAgg, aiAgg, compTotal, compOverdue] = await Promise.all([
    prisma.workspaceMember.count({ where: { workspaceId: id, status: 'active' } }),
    prisma.file.aggregate({ where: { workspaceId: id, isDeleted: false }, _count: { id: true }, _sum: { fileSizeBytes: true } }),
    prisma.aiUsageLog.aggregate({
      where: { workspaceId: id, createdAt: { gte: since30d } },
      _count: { id: true }, _sum: { totalTokens: true, estimatedCostUsd: true },
    }),
    prisma.complianceOccurrence.count({ where: { workspaceId: id } }),
    prisma.complianceOccurrence.count({
      where: { workspaceId: id, dueDate: { lt: new Date() }, status: { notIn: ['submitted', 'approved', 'closed', 'waived'] } },
    }),
  ]);

  return {
    members: memberCount,
    files: fileAgg._count.id,
    storageMb: (Number(fileAgg._sum.fileSizeBytes || 0) / (1024 * 1024)).toFixed(2),
    aiRequests30d: aiAgg._count.id,
    aiTokens30d: aiAgg._sum.totalTokens || 0,
    aiCostUsd30d: Number(aiAgg._sum.estimatedCostUsd || 0).toFixed(4),
    complianceTotal: compTotal,
    complianceOverdue: compOverdue,
  };
}

async function getActivity(id, limit = 20) {
  const [activityLogs, compLogs, aiLogs] = await Promise.all([
    prisma.activityLog.findMany({
      where: { workspaceId: id },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: { id: true, action: true, entityType: true, createdAt: true },
    }),
    prisma.complianceActivityLog.findMany({
      where: { workspaceId: id },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, action: true, createdAt: true },
    }),
    prisma.aiUsageLog.findMany({
      where: { workspaceId: id },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, requestType: true, status: true, totalTokens: true, createdAt: true },
    }),
  ]);

  const feed = [
    ...activityLogs.map((l) => ({ id: l.id, type: 'activity', label: `${l.entityType}: ${l.action}`, createdAt: l.createdAt })),
    ...compLogs.map((l) => ({ id: l.id, type: 'compliance', label: `Compliance: ${l.action}`, createdAt: l.createdAt })),
    ...aiLogs.map((l) => ({ id: l.id, type: 'ai', label: `AI: ${l.requestType} (${l.totalTokens || 0} tokens)`, createdAt: l.createdAt })),
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, limit);

  return feed;
}

async function upsertAdminMeta(workspaceId) {
  return prisma.workspaceAdminMeta.upsert({
    where: { workspaceId },
    create: { workspaceId, adminNotes: [] },
    update: {},
  });
}

async function addNote(workspaceId, { text, adminId, adminEmail }) {
  const meta = await upsertAdminMeta(workspaceId);
  const notes = Array.isArray(meta.adminNotes) ? meta.adminNotes : [];
  const newNote = { id: Date.now().toString(), text, adminId, adminEmail, createdAt: new Date().toISOString() };
  const updated = await prisma.workspaceAdminMeta.update({
    where: { workspaceId },
    data: {
      adminNotes: [...notes, newNote],
      lastReviewedAt: new Date(),
      lastReviewedById: adminId,
      reviewStatus: 'reviewed',
    },
  });
  return updated;
}

async function markReviewed(workspaceId, adminId) {
  return prisma.workspaceAdminMeta.upsert({
    where: { workspaceId },
    create: { workspaceId, adminNotes: [], lastReviewedAt: new Date(), lastReviewedById: adminId, reviewStatus: 'reviewed' },
    update: { lastReviewedAt: new Date(), lastReviewedById: adminId, reviewStatus: 'reviewed' },
  });
}

module.exports = { list, findById, updateStatus, getUsage, getActivity, addNote, markReviewed };
