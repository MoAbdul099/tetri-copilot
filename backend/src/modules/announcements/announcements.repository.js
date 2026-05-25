const prisma = require('../../lib/prisma');

const list = (workspaceId, { status, page = 1, limit = 20 } = {}) => {
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const where = { workspaceId, ...(status ? { status } : {}) };
  return Promise.all([
    prisma.announcement.findMany({
      where,
      include: { createdBy: { select: { id: true, fullName: true, email: true } }, _count: { select: { reads: true } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit),
    }),
    prisma.announcement.count({ where }),
  ]).then(([items, total]) => ({ items, total }));
};

const listActive = (workspaceId, userId) => {
  const now = new Date();
  return prisma.announcement.findMany({
    where: {
      workspaceId,
      status: 'published',
      OR: [{ publishAt: null }, { publishAt: { lte: now } }],
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    },
    include: {
      reads: { where: { userId }, select: { readAt: true } },
    },
    orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
  });
};

const findById = (id, workspaceId) =>
  prisma.announcement.findFirst({
    where: { id, workspaceId },
    include: {
      createdBy: { select: { id: true, fullName: true, email: true } },
      _count: { select: { reads: true } },
    },
  });

const create = (workspaceId, userId, data) =>
  prisma.announcement.create({
    data: {
      workspaceId,
      createdById: userId,
      title:        data.title,
      summary:      data.summary || '',
      content:      data.content || '',
      priority:     data.priority || 'info',
      audienceType: data.audienceType || 'workspace',
      audienceRoles: data.audienceRoles || [],
      publishAt:    data.publishAt ? new Date(data.publishAt) : null,
      expiresAt:    data.expiresAt ? new Date(data.expiresAt) : null,
      status:       'draft',
    },
  });

const update = (id, workspaceId, data) =>
  prisma.announcement.update({
    where: { id },
    data: {
      ...(data.title        !== undefined && { title:         data.title }),
      ...(data.summary      !== undefined && { summary:       data.summary }),
      ...(data.content      !== undefined && { content:       data.content }),
      ...(data.priority     !== undefined && { priority:      data.priority }),
      ...(data.audienceType !== undefined && { audienceType:  data.audienceType }),
      ...(data.audienceRoles !== undefined && { audienceRoles: data.audienceRoles }),
      ...(data.publishAt    !== undefined && { publishAt:     data.publishAt ? new Date(data.publishAt) : null }),
      ...(data.expiresAt    !== undefined && { expiresAt:     data.expiresAt ? new Date(data.expiresAt) : null }),
    },
  });

const publish = (id) =>
  prisma.announcement.update({
    where: { id },
    data: { status: 'published', publishAt: new Date() },
  });

const archive = (id) =>
  prisma.announcement.update({ where: { id }, data: { status: 'archived' } });

const remove = (id) => prisma.announcement.delete({ where: { id } });

const markRead = (announcementId, userId) =>
  prisma.announcementRead.upsert({
    where:  { announcementId_userId: { announcementId, userId } },
    create: { announcementId, userId },
    update: { readAt: new Date() },
  });

const getStats = async (workspaceId) => {
  const [total, published, scheduled, expired] = await Promise.all([
    prisma.announcement.count({ where: { workspaceId } }),
    prisma.announcement.count({ where: { workspaceId, status: 'published' } }),
    prisma.announcement.count({ where: { workspaceId, status: 'draft', publishAt: { gt: new Date() } } }),
    prisma.announcement.count({ where: { workspaceId, status: 'archived' } }),
  ]);
  return { total, published, scheduled, expired };
};

module.exports = { list, listActive, findById, create, update, publish, archive, remove, markRead, getStats };
