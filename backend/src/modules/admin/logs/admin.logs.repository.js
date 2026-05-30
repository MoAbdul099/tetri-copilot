const prisma = require('../../../lib/prisma');

const WORKSPACE_SELECT = { select: { id: true, name: true } };
const USER_SELECT      = { select: { id: true, fullName: true, email: true } };

function paging(page, limit) {
  return { skip: (Number(page) - 1) * Number(limit), take: Number(limit) };
}

function dateFilter(from, to) {
  if (!from && !to) return undefined;
  return {
    ...(from && { gte: new Date(from) }),
    ...(to   && { lte: new Date(to) }),
  };
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

async function getDashboard() {
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const since7d  = new Date(Date.now() - 7  * 24 * 60 * 60 * 1000);

  const [
    totalActivity, activity24h,
    totalAudit,
    totalSecurity, securityHigh,
    totalAi, aiErrors,
    totalCompliance,
    totalAdminActions, adminActions24h,
  ] = await Promise.all([
    prisma.activityLog.count(),
    prisma.activityLog.count({ where: { createdAt: { gte: since24h } } }),
    prisma.auditLog.count(),
    prisma.securityEvent.count(),
    prisma.securityEvent.count({ where: { severity: { in: ['high', 'critical'] } } }),
    prisma.aiRequestLog.count(),
    prisma.aiRequestLog.count({ where: { success: false, createdAt: { gte: since7d } } }),
    prisma.complianceActivityLog.count(),
    prisma.adminActivityLog.count(),
    prisma.adminActivityLog.count({ where: { createdAt: { gte: since24h } } }),
  ]);

  return {
    totalActivity, activity24h,
    totalAudit,
    totalSecurity, securityHigh,
    totalAi, aiErrors,
    totalCompliance,
    totalAdminActions, adminActions24h,
  };
}

// ── Activity Logs ─────────────────────────────────────────────────────────────

async function listActivity({ search = '', module: mod = '', page = 1, limit = 25, from, to } = {}) {
  const where = {
    ...(mod    && { module: { contains: mod, mode: 'insensitive' } }),
    ...(dateFilter(from, to) && { createdAt: dateFilter(from, to) }),
    ...(search && {
      OR: [
        { action:      { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { userName:    { contains: search, mode: 'insensitive' } },
        { entityType:  { contains: search, mode: 'insensitive' } },
        { workspace:   { name: { contains: search, mode: 'insensitive' } } },
      ],
    }),
  };

  const [total, items] = await Promise.all([
    prisma.activityLog.count({ where }),
    prisma.activityLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      ...paging(page, limit),
      include: { workspace: WORKSPACE_SELECT, user: USER_SELECT },
    }),
  ]);

  return { items, total, page: Number(page), limit: Number(limit) };
}

// ── Audit Logs ────────────────────────────────────────────────────────────────

async function listAudit({ search = '', entityType = '', page = 1, limit = 25, from, to } = {}) {
  const where = {
    ...(entityType && { entityType: { contains: entityType, mode: 'insensitive' } }),
    ...(dateFilter(from, to) && { createdAt: dateFilter(from, to) }),
    ...(search && {
      OR: [
        { action:     { contains: search, mode: 'insensitive' } },
        { userName:   { contains: search, mode: 'insensitive' } },
        { entityType: { contains: search, mode: 'insensitive' } },
        { workspace:  { name: { contains: search, mode: 'insensitive' } } },
      ],
    }),
  };

  const [total, items] = await Promise.all([
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      ...paging(page, limit),
      include: { workspace: WORKSPACE_SELECT, user: USER_SELECT },
    }),
  ]);

  return { items, total, page: Number(page), limit: Number(limit) };
}

// ── Security Events ───────────────────────────────────────────────────────────

async function listSecurity({ search = '', severity = '', page = 1, limit = 25, from, to } = {}) {
  const where = {
    ...(severity && { severity }),
    ...(dateFilter(from, to) && { createdAt: dateFilter(from, to) }),
    ...(search && {
      OR: [
        { eventType:  { contains: search, mode: 'insensitive' } },
        { description:{ contains: search, mode: 'insensitive' } },
        { userName:   { contains: search, mode: 'insensitive' } },
        { workspace:  { name: { contains: search, mode: 'insensitive' } } },
      ],
    }),
  };

  const [total, items] = await Promise.all([
    prisma.securityEvent.count({ where }),
    prisma.securityEvent.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      ...paging(page, limit),
      include: { workspace: WORKSPACE_SELECT },
    }),
  ]);

  return { items, total, page: Number(page), limit: Number(limit) };
}

// ── AI Activity ───────────────────────────────────────────────────────────────

async function listAi({ search = '', feature = '', success = '', page = 1, limit = 25, from, to } = {}) {
  const where = {
    ...(feature && { feature: { contains: feature, mode: 'insensitive' } }),
    ...(success !== '' && { success: success === 'true' }),
    ...(dateFilter(from, to) && { createdAt: dateFilter(from, to) }),
    ...(search && {
      OR: [
        { feature:  { contains: search, mode: 'insensitive' } },
        { userId:   { contains: search, mode: 'insensitive' } },
        { errorCode:{ contains: search, mode: 'insensitive' } },
      ],
    }),
  };

  const [total, items] = await Promise.all([
    prisma.aiRequestLog.count({ where }),
    prisma.aiRequestLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      ...paging(page, limit),
      include: {
        provider: { select: { name: true } },
        model:    { select: { modelName: true } },
      },
    }),
  ]);

  return { items, total, page: Number(page), limit: Number(limit) };
}

// ── Compliance Activity ───────────────────────────────────────────────────────

async function listCompliance({ search = '', page = 1, limit = 25, from, to } = {}) {
  const where = {
    ...(dateFilter(from, to) && { createdAt: dateFilter(from, to) }),
    ...(search && {
      OR: [
        { action:    { contains: search, mode: 'insensitive' } },
        { workspace: { name: { contains: search, mode: 'insensitive' } } },
        { actor:     { fullName: { contains: search, mode: 'insensitive' } } },
      ],
    }),
  };

  const [total, items] = await Promise.all([
    prisma.complianceActivityLog.count({ where }),
    prisma.complianceActivityLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      ...paging(page, limit),
      include: {
        workspace:  WORKSPACE_SELECT,
        actor:      USER_SELECT,
        occurrence: { select: { id: true, name: true } },
      },
    }),
  ]);

  return { items, total, page: Number(page), limit: Number(limit) };
}

// ── Admin Actions ─────────────────────────────────────────────────────────────

async function listAdminActions({ search = '', entityType = '', page = 1, limit = 25, from, to } = {}) {
  const where = {
    ...(entityType && { entityType }),
    ...(dateFilter(from, to) && { createdAt: dateFilter(from, to) }),
    ...(search && {
      OR: [
        { action:     { contains: search, mode: 'insensitive' } },
        { entityType: { contains: search, mode: 'insensitive' } },
        { admin:      { email: { contains: search, mode: 'insensitive' } } },
      ],
    }),
  };

  const [total, items] = await Promise.all([
    prisma.adminActivityLog.count({ where }),
    prisma.adminActivityLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      ...paging(page, limit),
      include: { admin: { select: { id: true, email: true, firstName: true, lastName: true } } },
    }),
  ]);

  return { items, total, page: Number(page), limit: Number(limit) };
}

module.exports = { getDashboard, listActivity, listAudit, listSecurity, listAi, listCompliance, listAdminActions };
