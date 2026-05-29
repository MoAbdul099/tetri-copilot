const prisma = require('../../../lib/prisma');

const SYSTEM_WHERE = { workspaceId: null, isSystemDefault: true };

const INCLUDE_FULL = {
  placeholders:        true,
  contextRequirements: true,
  countryProfile:      { select: { id: true, countryName: true, countryCode: true } },
};

// ── Stats ─────────────────────────────────────────────────────────────────────

async function getStats() {
  const [total, published, draft, archived, totalUsage, byCategory] = await Promise.all([
    prisma.documentTemplate.count({ where: SYSTEM_WHERE }),
    prisma.documentTemplate.count({ where: { ...SYSTEM_WHERE, status: 'published' } }),
    prisma.documentTemplate.count({ where: { ...SYSTEM_WHERE, status: 'draft' } }),
    prisma.documentTemplate.count({ where: { ...SYSTEM_WHERE, status: 'archived' } }),
    prisma.documentTemplate.aggregate({ where: SYSTEM_WHERE, _sum: { usageCount: true } }),
    prisma.documentTemplate.groupBy({
      by: ['category'],
      where: { ...SYSTEM_WHERE, category: { not: null } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    }),
  ]);
  return {
    total, published, draft, archived,
    totalUsage: totalUsage._sum.usageCount || 0,
    byCategory: byCategory.map((r) => ({ category: r.category, count: r._count.id })),
  };
}

// ── List ──────────────────────────────────────────────────────────────────────

async function list({ search = '', category = '', status = '', page = 1, limit = 20 } = {}) {
  const where = {
    ...SYSTEM_WHERE,
    ...(search && { OR: [
      { name:        { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { category:    { contains: search, mode: 'insensitive' } },
    ]}),
    ...(category && { category }),
    ...(status   && { status }),
  };

  const skip = (Number(page) - 1) * Number(limit);
  const [total, items] = await Promise.all([
    prisma.documentTemplate.count({ where }),
    prisma.documentTemplate.findMany({
      where,
      orderBy: [{ status: 'asc' }, { updatedAt: 'desc' }],
      skip,
      take: Number(limit),
      include: {
        countryProfile: { select: { id: true, countryName: true, countryCode: true } },
        _count: { select: { placeholders: true, generatedDocuments: true } },
      },
    }),
  ]);

  return { items, total, page: Number(page), limit: Number(limit) };
}

// ── Get one ───────────────────────────────────────────────────────────────────

async function getById(id) {
  return prisma.documentTemplate.findFirst({ where: { id, ...SYSTEM_WHERE }, include: INCLUDE_FULL });
}

// ── Create ────────────────────────────────────────────────────────────────────

async function create(data) {
  const { placeholders = [], contextRequirements = [], ...tplData } = data;
  return prisma.documentTemplate.create({
    data: {
      ...tplData,
      workspaceId:     null,
      isSystemDefault: true,
      status:          tplData.status || 'draft',
      placeholders: placeholders.length ? {
        create: placeholders.map((p) => ({
          placeholderName: p.placeholderName,
          sourceType:      p.sourceType || 'custom',
          required:        p.required ?? false,
        })),
      } : undefined,
      contextRequirements: contextRequirements.length ? {
        create: contextRequirements.map((r) => ({
          sourceType: r.sourceType,
          required:   r.required ?? true,
        })),
      } : undefined,
    },
    include: INCLUDE_FULL,
  });
}

// ── Update ────────────────────────────────────────────────────────────────────

async function update(id, data) {
  const { placeholders, contextRequirements, ...tplData } = data;

  return prisma.$transaction(async (tx) => {
    if (placeholders !== undefined) {
      await tx.aiTemplatePlaceholder.deleteMany({ where: { templateId: id } });
      if (placeholders.length) {
        await tx.aiTemplatePlaceholder.createMany({
          data: placeholders.map((p) => ({
            templateId:      id,
            placeholderName: p.placeholderName,
            sourceType:      p.sourceType || 'custom',
            required:        p.required ?? false,
          })),
        });
      }
    }
    if (contextRequirements !== undefined) {
      await tx.aiTemplateContextRequirement.deleteMany({ where: { templateId: id } });
      if (contextRequirements.length) {
        await tx.aiTemplateContextRequirement.createMany({
          data: contextRequirements.map((r) => ({
            templateId: id,
            sourceType: r.sourceType,
            required:   r.required ?? true,
          })),
        });
      }
    }
    return tx.documentTemplate.update({
      where: { id },
      data:  tplData,
      include: INCLUDE_FULL,
    });
  });
}

// ── Lifecycle ─────────────────────────────────────────────────────────────────

async function publish(id) {
  const tpl = await prisma.documentTemplate.findUnique({ where: { id }, select: { status: true } });
  if (!tpl) throw Object.assign(new Error('Template not found'), { status: 404 });
  if (tpl.status === 'archived') throw Object.assign(new Error('Cannot publish an archived template'), { status: 400 });
  const newStatus = tpl.status === 'published' ? 'draft' : 'published';
  return prisma.documentTemplate.update({ where: { id }, data: { status: newStatus }, include: INCLUDE_FULL });
}

async function archive(id) {
  return prisma.documentTemplate.update({ where: { id }, data: { status: 'archived' }, include: INCLUDE_FULL });
}

async function clone(id) {
  const src = await getById(id);
  if (!src) throw Object.assign(new Error('Template not found'), { status: 404 });

  const { id: _id, createdAt: _c, updatedAt: _u, usageCount: _uc, lastUsedAt: _la,
          placeholders, contextRequirements, countryProfile, ...rest } = src;

  return prisma.documentTemplate.create({
    data: {
      ...rest,
      name:   `${rest.name} (Copy)`,
      status: 'draft',
      usageCount: 0,
      placeholders: placeholders?.length ? {
        create: placeholders.map((p) => ({
          placeholderName: p.placeholderName,
          sourceType:      p.sourceType,
          required:        p.required,
        })),
      } : undefined,
      contextRequirements: contextRequirements?.length ? {
        create: contextRequirements.map((r) => ({
          sourceType: r.sourceType,
          required:   r.required,
        })),
      } : undefined,
    },
    include: INCLUDE_FULL,
  });
}

async function remove(id) {
  return prisma.documentTemplate.delete({ where: { id } });
}

// ── Country profiles list (for dropdown) ─────────────────────────────────────

async function listCountryProfiles() {
  return prisma.countryProfile.findMany({
    select: { id: true, countryName: true, countryCode: true },
    orderBy: { countryName: 'asc' },
  });
}

module.exports = { getStats, list, getById, create, update, publish, archive, clone, remove, listCountryProfiles };
