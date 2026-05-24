const prisma = require('../../lib/prisma');

// ── Include helpers ────────────────────────────────────────

const JURISDICTION_SELECT = { id: true, name: true, code: true, isoCode: true, defaultCurrency: true };
const CATEGORY_SELECT     = { id: true, name: true, color: true, isSystem: true };
const AUTHORITY_SELECT    = { id: true, name: true, website: true };
const USER_SELECT         = { id: true, fullName: true, email: true };
const USER_NAME_SELECT    = { id: true, fullName: true };

const TEMPLATE_LIST_INCLUDE = {
  jurisdiction:  { select: JURISDICTION_SELECT },
  category:      { select: CATEGORY_SELECT },
  authority:     { select: AUTHORITY_SELECT },
  owner:         { select: USER_NAME_SELECT },
  backupOwner:   { select: USER_NAME_SELECT },
};

const TEMPLATE_FULL_INCLUDE = {
  jurisdiction: { select: JURISDICTION_SELECT },
  category:     { select: CATEGORY_SELECT },
  authority:    { select: AUTHORITY_SELECT },
  owner:        { select: USER_SELECT },
  backupOwner:  { select: USER_SELECT },
  occurrences:  { orderBy: { dueDate: 'desc' }, take: 5 },
};

const OCCURRENCE_LIST_INCLUDE = {
  template:    { select: { id: true, name: true } },
  jurisdiction: { select: JURISDICTION_SELECT },
  category:    { select: CATEGORY_SELECT },
  authority:   { select: AUTHORITY_SELECT },
  owner:       { select: USER_NAME_SELECT },
  backupOwner: { select: USER_NAME_SELECT },
  submission:  true,
};

const OCCURRENCE_FULL_INCLUDE = {
  template:    { select: { id: true, name: true } },
  jurisdiction: { select: JURISDICTION_SELECT },
  category:    { select: CATEGORY_SELECT },
  authority:   { select: AUTHORITY_SELECT },
  owner:       { select: USER_SELECT },
  backupOwner: { select: USER_SELECT },
  submission:  true,
  comments: {
    include: { author: { select: USER_SELECT } },
    orderBy: { createdAt: 'desc' },
  },
  activityLogs: {
    include: { actor: { select: USER_NAME_SELECT } },
    orderBy: { createdAt: 'desc' },
    take: 20,
  },
};

// ── Reference data ─────────────────────────────────────────

const listJurisdictions = () =>
  prisma.complianceJurisdiction.findMany({
    where:   { isActive: true },
    orderBy: { name: 'asc' },
  });

const listAuthorities = ({ jurisdictionId } = {}) => {
  const where = { isActive: true };
  if (jurisdictionId) where.jurisdictionId = jurisdictionId;
  return prisma.complianceAuthority.findMany({ where, orderBy: { name: 'asc' } });
};

const listCategories = (workspaceId) =>
  prisma.complianceCategory.findMany({
    where: {
      OR: [
        { isSystem: true },
        { workspaceId: null },
        { workspaceId },
      ],
    },
    orderBy: { name: 'asc' },
  });

const createCategory = (workspaceId, data) =>
  prisma.complianceCategory.create({
    data: { ...data, workspaceId, isSystem: false },
  });

const updateCategory = (id, workspaceId, data) =>
  prisma.complianceCategory.update({
    where: { id },
    data: { ...data, workspaceId },
  });

const deleteCategory = (id, workspaceId) =>
  prisma.complianceCategory.update({
    where: { id },
    data:  { isActive: false },
  });

const listPacks = ({ jurisdictionId } = {}) => {
  const where = { isActive: true };
  if (jurisdictionId) where.jurisdictionId = jurisdictionId;
  return prisma.compliancePack.findMany({
    where,
    include: {
      items: true,
      jurisdiction: { select: JURISDICTION_SELECT },
    },
    orderBy: { name: 'asc' },
  });
};

const getPackById = (id) =>
  prisma.compliancePack.findUnique({
    where: { id },
    include: {
      jurisdiction: true,
      items: true,
    },
  });

// ── Templates ──────────────────────────────────────────────

const listTemplates = async (workspaceId, {
  search, jurisdictionId, categoryId, authorityId, status,
  page = 1, limit = 20,
} = {}) => {
  page  = Math.max(1, parseInt(page,  10) || 1);
  limit = Math.min(100, parseInt(limit, 10) || 20);

  const where = { workspaceId };
  if (jurisdictionId) where.jurisdictionId = jurisdictionId;
  if (categoryId)     where.categoryId     = categoryId;
  if (authorityId)    where.authorityId    = authorityId;
  if (status !== undefined) where.isActive = status === 'active';
  if (search) {
    where.OR = [
      { name:        { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { department:  { contains: search, mode: 'insensitive' } },
    ];
  }

  const [total, items] = await Promise.all([
    prisma.complianceTemplate.count({ where }),
    prisma.complianceTemplate.findMany({
      where,
      include:  TEMPLATE_LIST_INCLUDE,
      orderBy:  { name: 'asc' },
      skip:     (page - 1) * limit,
      take:     limit,
    }),
  ]);

  return { items, total, page, limit, pages: Math.ceil(total / limit) };
};

const getTemplateById = (id, workspaceId) =>
  prisma.complianceTemplate.findFirst({
    where:   { id, workspaceId },
    include: TEMPLATE_FULL_INCLUDE,
  });

const createTemplate = (workspaceId, data) =>
  prisma.complianceTemplate.create({
    data:    { ...data, workspaceId },
    include: TEMPLATE_FULL_INCLUDE,
  });

const updateTemplate = (id, workspaceId, data) =>
  prisma.complianceTemplate.update({
    where:   { id },
    data,
    include: TEMPLATE_FULL_INCLUDE,
  });

const deleteTemplate = (id, workspaceId) =>
  prisma.complianceTemplate.delete({ where: { id } });

// ── Occurrences ────────────────────────────────────────────

const listOccurrences = async (workspaceId, {
  search, status, jurisdictionId, categoryId, authorityId,
  ownerId, priority, dueDateFrom, dueDateTo,
  page = 1, limit = 20,
} = {}) => {
  page  = Math.max(1, parseInt(page,  10) || 1);
  limit = Math.min(100, parseInt(limit, 10) || 20);

  const where = { workspaceId };
  if (jurisdictionId) where.jurisdictionId = jurisdictionId;
  if (categoryId)     where.categoryId     = categoryId;
  if (authorityId)    where.authorityId    = authorityId;
  if (ownerId)        where.ownerUserId    = ownerId;
  if (priority)       where.priority       = priority;

  if (status) {
    where.status = Array.isArray(status) ? { in: status } : status;
  }

  if (dueDateFrom || dueDateTo) {
    where.dueDate = {};
    if (dueDateFrom) where.dueDate.gte = new Date(dueDateFrom);
    if (dueDateTo)   where.dueDate.lte = new Date(dueDateTo);
  }

  if (search) {
    where.OR = [
      { name:            { contains: search, mode: 'insensitive' } },
      { notes:           { contains: search, mode: 'insensitive' } },
      { referenceNumber: { contains: search, mode: 'insensitive' } },
      { department:      { contains: search, mode: 'insensitive' } },
    ];
  }

  const [total, items] = await Promise.all([
    prisma.complianceOccurrence.count({ where }),
    prisma.complianceOccurrence.findMany({
      where,
      include:  OCCURRENCE_LIST_INCLUDE,
      orderBy:  { dueDate: 'asc' },
      skip:     (page - 1) * limit,
      take:     limit,
    }),
  ]);

  return { items, total, page, limit, pages: Math.ceil(total / limit) };
};

const getOccurrenceById = (id, workspaceId) =>
  prisma.complianceOccurrence.findFirst({
    where:   { id, workspaceId },
    include: OCCURRENCE_FULL_INCLUDE,
  });

const updateOccurrence = (id, workspaceId, data) =>
  prisma.complianceOccurrence.update({
    where:   { id },
    data,
    include: OCCURRENCE_LIST_INCLUDE,
  });

const createSubmission = (occurrenceId, workspaceId, userId, data) =>
  prisma.complianceSubmission.upsert({
    where:  { occurrenceId },
    create: { ...data, occurrenceId, workspaceId, submittedByUserId: userId },
    update: { ...data, submittedByUserId: userId },
  });

const createComment = (occurrenceId, workspaceId, authorId, body) =>
  prisma.complianceComment.create({
    data:    { occurrenceId, workspaceId, authorId, body },
    include: { author: { select: USER_SELECT } },
  });

const deleteComment = (id, workspaceId, authorId) =>
  prisma.complianceComment.delete({ where: { id } });

const logActivity = (occurrenceId, workspaceId, actorId, action, metadata) =>
  prisma.complianceActivityLog.create({
    data: { occurrenceId, workspaceId, actorId, action, metadata: metadata || {} },
  });

const bulkCreateOccurrences = (occurrences) =>
  prisma.complianceOccurrence.createMany({ data: occurrences, skipDuplicates: true });

// ── Calendar ───────────────────────────────────────────────

const getCalendarEvents = (workspaceId, { start, end, jurisdictionId, categoryId, status, ownerId } = {}) => {
  const where = { workspaceId };
  if (start || end) {
    where.dueDate = {};
    if (start) where.dueDate.gte = new Date(start);
    if (end)   where.dueDate.lte = new Date(end);
  }
  if (jurisdictionId) where.jurisdictionId = jurisdictionId;
  if (categoryId)     where.categoryId     = categoryId;
  if (status)         where.status         = status;
  if (ownerId)        where.ownerUserId    = ownerId;

  return prisma.complianceOccurrence.findMany({
    where,
    include: {
      jurisdiction: { select: JURISDICTION_SELECT },
      category:     { select: CATEGORY_SELECT },
      authority:    { select: AUTHORITY_SELECT },
      owner:        { select: USER_NAME_SELECT },
    },
    orderBy: { dueDate: 'asc' },
  });
};

// ── Stats ──────────────────────────────────────────────────

const getStats = async (workspaceId) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const allStatuses = ['scheduled', 'in_progress', 'submitted', 'approved', 'completed', 'overdue', 'cancelled', 'archived'];

  const [byStatus, overdueCount, upcomingCount] = await Promise.all([
    prisma.complianceOccurrence.groupBy({
      by:    ['status'],
      where: { workspaceId },
      _count: { id: true },
    }),
    prisma.complianceOccurrence.count({
      where: { workspaceId, status: 'overdue' },
    }),
    prisma.complianceOccurrence.count({
      where: {
        workspaceId,
        status:  { in: ['scheduled', 'in_progress'] },
        dueDate: { gte: today, lte: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000) },
      },
    }),
  ]);

  const statusCounts = {};
  for (const s of allStatuses) statusCounts[s] = 0;
  for (const row of byStatus)  statusCounts[row.status] = row._count.id;

  return { byStatus: statusCounts, overdueCount, upcomingCount };
};

module.exports = {
  listJurisdictions,
  listAuthorities,
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  listPacks,
  getPackById,
  listTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  listOccurrences,
  getOccurrenceById,
  updateOccurrence,
  createSubmission,
  createComment,
  deleteComment,
  logActivity,
  bulkCreateOccurrences,
  getCalendarEvents,
  getStats,
};
