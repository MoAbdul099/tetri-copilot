const prisma = require('../../lib/prisma');

// ── Templates ──────────────────────────────────────────────

const listTemplates = ({ category, status, language } = {}) => {
  const where = {};
  if (category) where.category = category;
  if (status)   where.status   = status;
  if (language) where.language = language;
  return prisma.emailTemplate.findMany({
    where,
    include: { createdBy: { select: { id: true, fullName: true } }, updatedBy: { select: { id: true, fullName: true } } },
    orderBy: [{ category: 'asc' }, { name: 'asc' }],
  });
};

const findTemplateById = (id) =>
  prisma.emailTemplate.findUnique({
    where: { id },
    include: { versions: { orderBy: { version: 'desc' }, take: 10 } },
  });

const findTemplateByCode = (code, language = 'en') =>
  prisma.emailTemplate.findFirst({
    where: { code, language, status: 'published' },
  });

const findTemplateByCodeFallback = async (code) => {
  const t = await prisma.emailTemplate.findFirst({ where: { code, language: 'en', status: 'published' } });
  return t || prisma.emailTemplate.findFirst({ where: { code, status: 'published' } });
};

const existsByCode = (code) =>
  prisma.emailTemplate.findFirst({ where: { code }, select: { id: true } });

const createTemplate = (data) =>
  prisma.emailTemplate.create({ data, include: { createdBy: { select: { id: true, fullName: true } } } });

const updateTemplate = (id, data) =>
  prisma.emailTemplate.update({ where: { id }, data });

const deleteTemplate = (id) =>
  prisma.emailTemplate.delete({ where: { id } });

const saveVersion = (templateId, { version, subject, bodyHtml, bodyText, savedById }) =>
  prisma.emailTemplateVersion.create({
    data: { templateId, version, subject, bodyHtml, bodyText, savedById },
  });

const getVersions = (templateId) =>
  prisma.emailTemplateVersion.findMany({ where: { templateId }, orderBy: { version: 'desc' } });

// ── Delivery logs ──────────────────────────────────────────

const createDeliveryLog = (data) =>
  prisma.emailDeliveryLog.create({ data });

const getDeliveryStats = async (workspaceId, days = 30) => {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const [total, sent, failed, opened] = await Promise.all([
    prisma.emailDeliveryLog.count({ where: { workspaceId, sentAt: { gte: since } } }),
    prisma.emailDeliveryLog.count({ where: { workspaceId, sentAt: { gte: since }, status: 'sent' } }),
    prisma.emailDeliveryLog.count({ where: { workspaceId, sentAt: { gte: since }, status: 'failed' } }),
    prisma.emailDeliveryLog.count({ where: { workspaceId, sentAt: { gte: since }, openedAt: { not: null } } }),
  ]);

  const byTemplate = await prisma.emailDeliveryLog.groupBy({
    by: ['templateCode'],
    where: { workspaceId, sentAt: { gte: since } },
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 10,
  });

  const byStatus = await prisma.emailDeliveryLog.groupBy({
    by: ['status'],
    where: { workspaceId, sentAt: { gte: since } },
    _count: { id: true },
  });

  // Trend — last N days grouped by day
  const trend = await prisma.$queryRaw`
    SELECT DATE(sent_at) AS day, COUNT(*) AS count
    FROM email_delivery_logs
    WHERE workspace_id = ${workspaceId}::uuid
      AND sent_at >= ${since}
    GROUP BY DATE(sent_at)
    ORDER BY day DESC
    LIMIT 30
  `;

  const deliveryRate = total > 0 ? Math.round((sent / total) * 100) : 0;
  const openRate     = sent  > 0 ? Math.round((opened / sent) * 100) : 0;
  const failureRate  = total > 0 ? Math.round((failed / total) * 100) : 0;

  return { total, sent, failed, opened, deliveryRate, openRate, failureRate, byTemplate, byStatus, trend };
};

const listDeliveryLogs = async (workspaceId, { status, page = 1, limit = 25 } = {}) => {
  page  = Math.max(1, parseInt(page, 10) || 1);
  limit = Math.min(100, parseInt(limit, 10) || 25);
  const where = { workspaceId };
  if (status) where.status = status;
  const [total, items] = await Promise.all([
    prisma.emailDeliveryLog.count({ where }),
    prisma.emailDeliveryLog.findMany({ where, orderBy: { sentAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
  ]);
  return { items, total, page, limit, pages: Math.ceil(total / limit) };
};

module.exports = {
  listTemplates, findTemplateById, findTemplateByCode, findTemplateByCodeFallback, existsByCode,
  createTemplate, updateTemplate, deleteTemplate, saveVersion, getVersions,
  createDeliveryLog, getDeliveryStats, listDeliveryLogs,
};
