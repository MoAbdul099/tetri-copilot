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
  // Only expose published packs to workspace users — drafts and archived stay in admin only
  const where = { isActive: true, status: 'published' };
  if (jurisdictionId) where.jurisdictionId = jurisdictionId;
  return prisma.compliancePack.findMany({
    where,
    include: {
      items: { where: { isActive: true } },
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

// ── Dashboard & Analytics (Slice 9.3) ─────────────────────

const getDashboard = async (workspaceId) => {
  const now   = new Date();
  const today = new Date(now); today.setHours(0, 0, 0, 0);

  const weekEnd  = new Date(today); weekEnd.setDate(today.getDate() + 7);
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  const [
    totalTemplates,
    openCount,
    dueWeek,
    dueMonth,
    overdueCount,
    completedMonth,
    escalatedCount,
    upcoming,
    overdue,
    recentActivity,
  ] = await Promise.all([
    prisma.complianceTemplate.count({ where: { workspaceId, isActive: true } }),
    prisma.complianceOccurrence.count({ where: { workspaceId, status: { in: ['scheduled', 'in_progress'] } } }),
    prisma.complianceOccurrence.count({ where: { workspaceId, status: { in: ['scheduled', 'in_progress'] }, dueDate: { gte: today, lte: weekEnd } } }),
    prisma.complianceOccurrence.count({ where: { workspaceId, status: { in: ['scheduled', 'in_progress'] }, dueDate: { gte: today, lte: monthEnd } } }),
    prisma.complianceOccurrence.count({ where: { workspaceId, status: 'overdue' } }),
    prisma.complianceOccurrence.count({ where: { workspaceId, status: { in: ['completed', 'submitted', 'approved'] }, completedAt: { gte: monthStart } } }),
    prisma.escalationInstance.count({ where: { workspaceId, status: { in: ['triggered', 'sent'] } } }),
    prisma.complianceOccurrence.findMany({
      where: { workspaceId, status: { in: ['scheduled', 'in_progress'] }, dueDate: { gte: today } },
      include: OCCURRENCE_LIST_INCLUDE,
      orderBy: { dueDate: 'asc' },
      take: 10,
    }),
    prisma.complianceOccurrence.findMany({
      where: { workspaceId, status: 'overdue' },
      include: { ...OCCURRENCE_LIST_INCLUDE, escalationInstances: { where: { status: { in: ['triggered', 'sent'] } } } },
      orderBy: { dueDate: 'asc' },
      take: 10,
    }),
    prisma.complianceActivityLog.findMany({
      where: { workspaceId },
      include: { actor: { select: USER_NAME_SELECT }, occurrence: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 15,
    }),
  ]);

  const total = openCount + overdueCount + completedMonth;
  const overdueRate = total > 0 ? overdueCount / (overdueCount + completedMonth + openCount) : 0;
  const escalationRate = total > 0 ? escalatedCount / Math.max(1, overdueCount + openCount) : 0;
  const healthScore = Math.round(Math.max(0, Math.min(100, 100 - overdueRate * 50 - escalationRate * 30)));

  let healthCategory = 'excellent';
  if (healthScore < 80)      healthCategory = 'critical';
  else if (healthScore < 90) healthCategory = 'warning';
  else if (healthScore < 95) healthCategory = 'good';

  return {
    kpis: { totalTemplates, openCount, dueWeek, dueMonth, overdueCount, completedMonth, escalatedCount, healthScore, healthCategory },
    upcoming,
    overdue,
    recentActivity,
  };
};

const getTrends = async (workspaceId, months = 6) => {
  const result = [];
  const now = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end   = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
    const label = start.toLocaleString('en-US', { month: 'short', year: '2-digit' });

    const [completed, overdue, escalated, submitted] = await Promise.all([
      prisma.complianceOccurrence.count({ where: { workspaceId, status: { in: ['completed', 'approved'] }, completedAt: { gte: start, lte: end } } }),
      prisma.complianceOccurrence.count({ where: { workspaceId, status: 'overdue', dueDate: { gte: start, lte: end } } }),
      prisma.escalationInstance.count({ where: { workspaceId, triggeredAt: { gte: start, lte: end } } }),
      prisma.complianceSubmission.count({ where: { workspaceId, submissionDate: { gte: start, lte: end } } }),
    ]);

    result.push({ month: label, completed, overdue, escalated, submitted });
  }

  return result;
};

const getCategoryAnalytics = async (workspaceId) => {
  const rows = await prisma.complianceOccurrence.groupBy({
    by: ['categoryId', 'status'],
    where: { workspaceId },
    _count: { id: true },
  });

  const categoryIds = [...new Set(rows.map(r => r.categoryId).filter(Boolean))];
  const categories  = await prisma.complianceCategory.findMany({ where: { id: { in: categoryIds } } });
  const catMap      = Object.fromEntries(categories.map(c => [c.id, c]));

  const grouped = {};
  for (const row of rows) {
    const key = row.categoryId || '__none__';
    if (!grouped[key]) grouped[key] = { id: key, name: catMap[key]?.name || 'Uncategorised', color: catMap[key]?.color || '#94a3b8', open: 0, completed: 0, overdue: 0, escalated: 0 };
    if (['scheduled', 'in_progress'].includes(row.status)) grouped[key].open += row._count.id;
    if (['completed', 'submitted', 'approved'].includes(row.status)) grouped[key].completed += row._count.id;
    if (row.status === 'overdue') grouped[key].overdue += row._count.id;
  }

  const escalated = await prisma.escalationInstance.groupBy({
    by: ['occurrenceId'],
    where: { workspaceId, status: { in: ['triggered', 'sent'] } },
  });
  const escalatedOccurrenceIds = escalated.map(e => e.occurrenceId);
  if (escalatedOccurrenceIds.length > 0) {
    const escalatedOccs = await prisma.complianceOccurrence.findMany({
      where: { id: { in: escalatedOccurrenceIds }, workspaceId },
      select: { categoryId: true },
    });
    for (const occ of escalatedOccs) {
      const key = occ.categoryId || '__none__';
      if (grouped[key]) grouped[key].escalated += 1;
    }
  }

  return Object.values(grouped).sort((a, b) => (b.open + b.overdue) - (a.open + a.overdue));
};

const getJurisdictionAnalytics = async (workspaceId) => {
  const rows = await prisma.complianceOccurrence.groupBy({
    by: ['jurisdictionId', 'status'],
    where: { workspaceId },
    _count: { id: true },
  });

  const jIds = [...new Set(rows.map(r => r.jurisdictionId).filter(Boolean))];
  const jurisdictions = await prisma.complianceJurisdiction.findMany({ where: { id: { in: jIds } } });
  const jMap = Object.fromEntries(jurisdictions.map(j => [j.id, j]));

  const grouped = {};
  for (const row of rows) {
    const key = row.jurisdictionId || '__none__';
    if (!grouped[key]) grouped[key] = { id: key, name: jMap[key]?.name || 'No Jurisdiction', code: jMap[key]?.code || '', open: 0, completed: 0, overdue: 0 };
    if (['scheduled', 'in_progress'].includes(row.status)) grouped[key].open += row._count.id;
    if (['completed', 'submitted', 'approved'].includes(row.status)) grouped[key].completed += row._count.id;
    if (row.status === 'overdue') grouped[key].overdue += row._count.id;
  }

  return Object.values(grouped).sort((a, b) => (b.open + b.overdue) - (a.open + a.overdue));
};

const getEscalationAnalytics = async (workspaceId) => {
  const [total, open, resolved, avgResolutionMs] = await Promise.all([
    prisma.escalationInstance.count({ where: { workspaceId } }),
    prisma.escalationInstance.count({ where: { workspaceId, status: { in: ['triggered', 'sent'] } } }),
    prisma.escalationInstance.count({ where: { workspaceId, status: { in: ['resolved', 'acknowledged'] } } }),
    prisma.escalationInstance.aggregate({ where: { workspaceId, resolvedAt: { not: null } }, _avg: { id: true } }),
  ]);

  const byLevel = await prisma.escalationInstance.groupBy({ by: ['level'], where: { workspaceId }, _count: { id: true } });
  const byStatus = await prisma.escalationInstance.groupBy({ by: ['status'], where: { workspaceId }, _count: { id: true } });

  const trends = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end   = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
    const count = await prisma.escalationInstance.count({ where: { workspaceId, triggeredAt: { gte: start, lte: end } } });
    trends.push({ month: start.toLocaleString('en-US', { month: 'short', year: '2-digit' }), count });
  }

  return { total, open, resolved, byLevel, byStatus, trends };
};

const getReminderAnalytics = async (workspaceId) => {
  const [total, delivered, read, failed] = await Promise.all([
    prisma.notificationItem.count({ where: { workspaceId, type: 'reminder' } }),
    prisma.notificationItem.count({ where: { workspaceId, type: 'reminder', status: { not: 'pending' } } }),
    prisma.notificationItem.count({ where: { workspaceId, type: 'reminder', readAt: { not: null } } }),
    prisma.notificationItem.count({ where: { workspaceId, type: 'reminder', status: 'failed' } }),
  ]);

  const byChannel = await prisma.notificationItem.groupBy({ by: ['channel'], where: { workspaceId, type: 'reminder' }, _count: { id: true } });
  const byStatus  = await prisma.notificationItem.groupBy({ by: ['status'],  where: { workspaceId, type: 'reminder' }, _count: { id: true } });

  const trends = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end   = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
    const sent  = await prisma.notificationItem.count({ where: { workspaceId, type: 'reminder', createdAt: { gte: start, lte: end } } });
    const readM = await prisma.notificationItem.count({ where: { workspaceId, type: 'reminder', readAt: { gte: start, lte: end } } });
    trends.push({ month: start.toLocaleString('en-US', { month: 'short', year: '2-digit' }), sent, read: readM });
  }

  return {
    total, delivered, read, failed,
    deliveryRate: total > 0 ? Math.round((delivered / total) * 100) : 0,
    readRate:     total > 0 ? Math.round((read / total) * 100) : 0,
    byChannel, byStatus, trends,
  };
};

// ── Reports ────────────────────────────────────────────────

const getRegisterReport = async (workspaceId, {
  jurisdictionId, categoryId, authorityId, status, priority, ownerId,
  dueDateFrom, dueDateTo, search, page = 1, limit = 50,
} = {}) => {
  page  = Math.max(1, parseInt(page,  10) || 1);
  limit = Math.min(200, parseInt(limit, 10) || 50);

  const where = { workspaceId };
  if (jurisdictionId) where.jurisdictionId = jurisdictionId;
  if (categoryId)     where.categoryId     = categoryId;
  if (authorityId)    where.authorityId    = authorityId;
  if (ownerId)        where.ownerUserId    = ownerId;
  if (priority)       where.priority       = priority;
  if (status)         where.status         = Array.isArray(status) ? { in: status } : status;
  if (dueDateFrom || dueDateTo) {
    where.dueDate = {};
    if (dueDateFrom) where.dueDate.gte = new Date(dueDateFrom);
    if (dueDateTo)   where.dueDate.lte = new Date(dueDateTo);
  }
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { referenceNumber: { contains: search, mode: 'insensitive' } },
      { department: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [total, items] = await Promise.all([
    prisma.complianceOccurrence.count({ where }),
    prisma.complianceOccurrence.findMany({
      where,
      include: OCCURRENCE_LIST_INCLUDE,
      orderBy: { dueDate: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return { items, total, page, limit, pages: Math.ceil(total / limit) };
};

const getFilingsReport = async (workspaceId, { page = 1, limit = 50, jurisdictionId, authorityId, outcome, dateFrom, dateTo } = {}) => {
  page  = Math.max(1, parseInt(page,  10) || 1);
  limit = Math.min(200, parseInt(limit, 10) || 50);

  const where = { workspaceId };
  if (outcome) where.outcome = outcome;
  if (dateFrom || dateTo) {
    where.submissionDate = {};
    if (dateFrom) where.submissionDate.gte = new Date(dateFrom);
    if (dateTo)   where.submissionDate.lte = new Date(dateTo);
  }

  const occurrenceWhere = {};
  if (jurisdictionId) occurrenceWhere.jurisdictionId = jurisdictionId;
  if (authorityId)    occurrenceWhere.authorityId    = authorityId;
  if (Object.keys(occurrenceWhere).length) where.occurrence = { is: occurrenceWhere };

  const [total, items] = await Promise.all([
    prisma.complianceSubmission.count({ where }),
    prisma.complianceSubmission.findMany({
      where,
      include: {
        submittedBy: { select: USER_NAME_SELECT },
        occurrence: {
          include: {
            jurisdiction: { select: JURISDICTION_SELECT },
            authority:    { select: AUTHORITY_SELECT },
            category:     { select: CATEGORY_SELECT },
            owner:        { select: USER_NAME_SELECT },
          },
        },
      },
      orderBy: { submissionDate: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return { items, total, page, limit, pages: Math.ceil(total / limit) };
};

const getRenewalsReport = async (workspaceId, days = 90) => {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const end   = new Date(today); end.setDate(today.getDate() + parseInt(days, 10));

  return prisma.complianceOccurrence.findMany({
    where: {
      workspaceId,
      status:  { in: ['scheduled', 'in_progress'] },
      dueDate: { gte: today, lte: end },
      template: { frequency: { in: ['annual', 'semi_annual', 'custom'] } },
    },
    include: OCCURRENCE_LIST_INCLUDE,
    orderBy: { dueDate: 'asc' },
  });
};

const getOverdueReport = async (workspaceId, { jurisdictionId, categoryId, authorityId, priority, ownerId } = {}) => {
  const where = { workspaceId, status: 'overdue' };
  if (jurisdictionId) where.jurisdictionId = jurisdictionId;
  if (categoryId)     where.categoryId     = categoryId;
  if (authorityId)    where.authorityId    = authorityId;
  if (ownerId)        where.ownerUserId    = ownerId;
  if (priority)       where.priority       = priority;

  return prisma.complianceOccurrence.findMany({
    where,
    include: {
      ...OCCURRENCE_LIST_INCLUDE,
      escalationInstances: { where: { status: { in: ['triggered', 'sent'] } } },
    },
    orderBy: { dueDate: 'asc' },
  });
};

// ── Saved Reports ──────────────────────────────────────────

const listSavedReports = (workspaceId, userId) =>
  prisma.complianceSavedReport.findMany({
    where: { workspaceId, userId },
    orderBy: [{ isFavorite: 'desc' }, { createdAt: 'desc' }],
  });

const createSavedReport = (workspaceId, userId, data) =>
  prisma.complianceSavedReport.create({ data: { ...data, workspaceId, userId } });

const updateSavedReport = (id, workspaceId, data) =>
  prisma.complianceSavedReport.update({ where: { id }, data });

const deleteSavedReport = (id, workspaceId) =>
  prisma.complianceSavedReport.delete({ where: { id } });

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
  // Slice 9.3
  getDashboard,
  getTrends,
  getCategoryAnalytics,
  getJurisdictionAnalytics,
  getEscalationAnalytics,
  getReminderAnalytics,
  getRegisterReport,
  getFilingsReport,
  getRenewalsReport,
  getOverdueReport,
  listSavedReports,
  createSavedReport,
  updateSavedReport,
  deleteSavedReport,
};
