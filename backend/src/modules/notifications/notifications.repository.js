const prisma = require('../../lib/prisma');

// ── Preferences ────────────────────────────────────────────

const getPreference = (userId, workspaceId) =>
  prisma.notificationPreference.findUnique({
    where: { userId_workspaceId: { userId, workspaceId } },
  });

const upsertPreference = (userId, workspaceId, data) =>
  prisma.notificationPreference.upsert({
    where:  { userId_workspaceId: { userId, workspaceId } },
    create: { ...data, userId, workspaceId },
    update: data,
  });

// ── Notification items ────────────────────────────────────

const listItems = async (workspaceId, recipientId, {
  status, type, moduleType, page = 1, limit = 30,
} = {}) => {
  page  = Math.max(1, parseInt(page,  10) || 1);
  limit = Math.min(100, parseInt(limit, 10) || 30);

  const where = { workspaceId, recipientId };
  if (status)     where.status     = status;
  if (type)       where.type       = type;
  if (moduleType) where.moduleType = moduleType;

  // exclude archived by default
  if (!status) where.status = { not: 'archived' };

  const [total, items] = await Promise.all([
    prisma.notificationItem.count({ where }),
    prisma.notificationItem.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);
  return { items, total, page, limit, pages: Math.ceil(total / limit) };
};

const countUnread = (workspaceId, recipientId) =>
  prisma.notificationItem.count({
    where: { workspaceId, recipientId, status: 'sent', readAt: null },
  });

const findItem = (id, workspaceId, recipientId) =>
  prisma.notificationItem.findFirst({ where: { id, workspaceId, recipientId } });

const updateItem = (id, data) =>
  prisma.notificationItem.update({ where: { id }, data });

const markAllRead = (workspaceId, recipientId) =>
  prisma.notificationItem.updateMany({
    where:  { workspaceId, recipientId, status: 'sent', readAt: null },
    data:   { status: 'read', readAt: new Date() },
  });

const createItem = async (data) => {
  try {
    return await prisma.notificationItem.create({ data });
  } catch (e) {
    if (e.code === 'P2002') return null; // duplicate dedupeKey — expected
    throw e;
  }
};

const getPendingEmailItems = () =>
  prisma.notificationItem.findMany({
    where: {
      channel:    { in: ['email', 'both'] },
      emailSentAt: null,
      status:     { in: ['pending', 'sent'] },
      scheduledFor: { lte: new Date() },
    },
    include: {
      recipient: { select: { id: true, email: true, fullName: true } },
    },
    take: 200,
  });

// ── Notification profiles ─────────────────────────────────

const listProfiles = (workspaceId) =>
  prisma.notificationProfile.findMany({
    where: {
      isActive: true,
      OR: [{ workspaceId }, { workspaceId: null, isSystem: true }],
    },
    include: { rules: { where: { isActive: true }, orderBy: [{ direction: 'asc' }, { offsetDays: 'asc' }] } },
    orderBy: [{ isSystem: 'desc' }, { name: 'asc' }],
  });

const getProfileById = (id) =>
  prisma.notificationProfile.findUnique({
    where: { id },
    include: { rules: { orderBy: [{ direction: 'asc' }, { offsetDays: 'asc' }] } },
  });

const getSystemDefaultProfile = () =>
  prisma.notificationProfile.findFirst({
    where:   { isSystem: true, name: 'Standard Compliance', workspaceId: null },
    include: { rules: { where: { isActive: true } } },
  });

const createProfile = (workspaceId, data) =>
  prisma.notificationProfile.create({
    data:    { ...data, workspaceId },
    include: { rules: true },
  });

const updateProfile = (id, data) =>
  prisma.notificationProfile.update({ where: { id }, data });

const deleteProfile = (id) =>
  prisma.notificationProfile.update({ where: { id }, data: { isActive: false } });

const addRule = (profileId, data) =>
  prisma.notificationRule.create({ data: { ...data, profileId } });

const updateRule = (id, data) =>
  prisma.notificationRule.update({ where: { id }, data });

const deleteRule = (id) =>
  prisma.notificationRule.delete({ where: { id } });

// ── Escalation profiles ───────────────────────────────────

const listEscalationProfiles = (workspaceId) =>
  prisma.escalationProfile.findMany({
    where: {
      isActive: true,
      OR: [{ workspaceId }, { workspaceId: null, isSystem: true }],
    },
    include: { rules: { where: { isActive: true }, orderBy: { level: 'asc' } } },
    orderBy: [{ isSystem: 'desc' }, { name: 'asc' }],
  });

const getEscalationProfileById = (id) =>
  prisma.escalationProfile.findUnique({
    where:   { id },
    include: { rules: { orderBy: { level: 'asc' } } },
  });

const getSystemDefaultEscalationProfile = () =>
  prisma.escalationProfile.findFirst({
    where:   { isSystem: true, name: 'Standard Escalation', workspaceId: null },
    include: { rules: { where: { isActive: true }, orderBy: { level: 'asc' } } },
  });

const createEscalationProfile = (workspaceId, data) =>
  prisma.escalationProfile.create({
    data:    { ...data, workspaceId },
    include: { rules: true },
  });

const updateEscalationProfile = (id, data) =>
  prisma.escalationProfile.update({ where: { id }, data });

const deleteEscalationProfile = (id) =>
  prisma.escalationProfile.update({ where: { id }, data: { isActive: false } });

const addEscalationRule = (profileId, data) =>
  prisma.escalationRule.create({ data: { ...data, profileId } });

const updateEscalationRule = (id, data) =>
  prisma.escalationRule.update({ where: { id }, data });

const deleteEscalationRule = (id) =>
  prisma.escalationRule.delete({ where: { id } });

// ── Escalation instances ──────────────────────────────────

const listEscalations = async (workspaceId, {
  status, occurrenceId, page = 1, limit = 20,
} = {}) => {
  page  = Math.max(1, parseInt(page,  10) || 1);
  limit = Math.min(100, parseInt(limit, 10) || 20);

  const where = { workspaceId };
  if (status)       where.status       = status;
  if (occurrenceId) where.occurrenceId = occurrenceId;

  const [total, items] = await Promise.all([
    prisma.escalationInstance.count({ where }),
    prisma.escalationInstance.findMany({
      where,
      include: {
        occurrence: { select: { id: true, name: true, dueDate: true, status: true, priority: true } },
        rule:       { select: { id: true, level: true, triggerAfterDays: true, recipientTypes: true } },
      },
      orderBy: { triggeredAt: 'desc' },
      skip:    (page - 1) * limit,
      take:    limit,
    }),
  ]);
  return { items, total, page, limit, pages: Math.ceil(total / limit) };
};

const createEscalationInstance = async (data) => {
  try {
    return await prisma.escalationInstance.create({ data });
  } catch (e) {
    if (e.code === 'P2002') return null; // already exists
    throw e;
  }
};

const updateEscalationInstance = (id, data) =>
  prisma.escalationInstance.update({ where: { id }, data });

const getOverdueOccurrences = () =>
  prisma.complianceOccurrence.findMany({
    where: {
      status: 'overdue',
    },
    include: {
      workspace: { select: { id: true, ownerUserId: true } },
      owner:     { select: { id: true, email: true, fullName: true } },
      backupOwner: { select: { id: true, email: true, fullName: true } },
      jurisdiction: { select: { name: true } },
      authority:    { select: { name: true } },
      escalationInstances: true,
    },
  });

const getWorkspaceAdmins = (workspaceId) =>
  prisma.workspaceMember.findMany({
    where:   { workspaceId, role: { in: ['admin', 'owner'] }, status: 'active' },
    include: { user: { select: { id: true, email: true, fullName: true } } },
  });

const getUpcomingOccurrences = (daysAhead) => {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() + daysAhead);
  return prisma.complianceOccurrence.findMany({
    where: {
      status:  { in: ['scheduled', 'in_progress'] },
      dueDate: { lte: cutoff },
    },
    include: {
      workspace:    { select: { id: true, name: true } },
      owner:        { select: { id: true, email: true, fullName: true } },
      backupOwner:  { select: { id: true, email: true, fullName: true } },
      jurisdiction: { select: { name: true } },
      authority:    { select: { name: true } },
    },
  });
};

module.exports = {
  getPreference,
  upsertPreference,
  listItems,
  countUnread,
  findItem,
  updateItem,
  markAllRead,
  createItem,
  getPendingEmailItems,
  listProfiles,
  getProfileById,
  getSystemDefaultProfile,
  createProfile,
  updateProfile,
  deleteProfile,
  addRule,
  updateRule,
  deleteRule,
  listEscalationProfiles,
  getEscalationProfileById,
  getSystemDefaultEscalationProfile,
  createEscalationProfile,
  updateEscalationProfile,
  deleteEscalationProfile,
  addEscalationRule,
  updateEscalationRule,
  deleteEscalationRule,
  listEscalations,
  createEscalationInstance,
  updateEscalationInstance,
  getOverdueOccurrences,
  getWorkspaceAdmins,
  getUpcomingOccurrences,
};
