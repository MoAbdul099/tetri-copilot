const prisma = require('../../../lib/prisma');

// ── Stats ─────────────────────────────────────────────────────────────────────

const getStats = async () => {
  const [total, published, draft, archived, jurisdictions] = await Promise.all([
    prisma.compliancePack.count(),
    prisma.compliancePack.count({ where: { status: 'published' } }),
    prisma.compliancePack.count({ where: { status: 'draft' } }),
    prisma.compliancePack.count({ where: { status: 'archived' } }),
    prisma.compliancePack.groupBy({ by: ['jurisdictionId'], _count: true }),
  ]);
  const industries = await prisma.compliancePack.groupBy({
    by: ['industry'],
    where: { industry: { not: null } },
    _count: true,
  });
  return {
    total,
    published,
    draft,
    archived,
    countriesCovered: jurisdictions.length,
    industriesCovered: industries.length,
  };
};

// ── Templates ─────────────────────────────────────────────────────────────────

const PACK_INCLUDE = {
  jurisdiction: true,
  items: { orderBy: { createdAt: 'asc' } },
};

const list = async ({ search, status, jurisdictionId, industry, page = 1, limit = 20 }) => {
  const where = {};
  if (search) where.name = { contains: search, mode: 'insensitive' };
  if (status) where.status = status;
  if (jurisdictionId) where.jurisdictionId = jurisdictionId;
  if (industry) where.industry = { contains: industry, mode: 'insensitive' };

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  const [items, total] = await Promise.all([
    prisma.compliancePack.findMany({
      where,
      include: {
        jurisdiction: true,
        _count: { select: { items: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    }),
    prisma.compliancePack.count({ where }),
  ]);

  return { items, total, page: parseInt(page), limit: take };
};

const findById = (id) =>
  prisma.compliancePack.findUnique({ where: { id }, include: PACK_INCLUDE });

const create = (data) =>
  prisma.compliancePack.create({ data, include: PACK_INCLUDE });

const update = (id, data) =>
  prisma.compliancePack.update({ where: { id }, data, include: PACK_INCLUDE });

const publish = (id) =>
  prisma.compliancePack.update({
    where: { id },
    data: { status: 'published', publishedAt: new Date() },
    include: PACK_INCLUDE,
  });

const unpublish = (id) =>
  prisma.compliancePack.update({
    where: { id },
    data: { status: 'draft', publishedAt: null },
    include: PACK_INCLUDE,
  });

const archive = (id) =>
  prisma.compliancePack.update({
    where: { id },
    data: { status: 'archived', isActive: false },
    include: PACK_INCLUDE,
  });

const clone = async (id, adminId) => {
  const src = await prisma.compliancePack.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!src) return null;

  return prisma.$transaction(async (tx) => {
    const newPack = await tx.compliancePack.create({
      data: {
        jurisdictionId: src.jurisdictionId,
        name: `${src.name} (Copy)`,
        description: src.description,
        status: 'draft',
        version: '1.0',
        industry: src.industry,
        isActive: true,
      },
    });
    if (src.items.length > 0) {
      await tx.compliancePackTemplate.createMany({
        data: src.items.map(({ id: _id, packId: _p, createdAt: _c, ...rest }) => ({
          ...rest,
          packId: newPack.id,
        })),
      });
    }
    return tx.compliancePack.findUnique({ where: { id: newPack.id }, include: PACK_INCLUDE });
  });
};

// ── Obligations ───────────────────────────────────────────────────────────────

const createObligation = (data) =>
  prisma.compliancePackTemplate.create({ data });

const updateObligation = (id, data) =>
  prisma.compliancePackTemplate.update({ where: { id }, data });

const deleteObligation = (id) =>
  prisma.compliancePackTemplate.delete({ where: { id } });

// ── Reference data ────────────────────────────────────────────────────────────

const listJurisdictions = () =>
  prisma.complianceJurisdiction.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  });

const listCategories = () =>
  prisma.complianceCategory.findMany({
    where: { isSystem: true, isActive: true },
    orderBy: { name: 'asc' },
  });

// ── Workspace impact ──────────────────────────────────────────────────────────

const getWorkspaceImpact = async (packId) => {
  const pack = await prisma.compliancePack.findUnique({
    where: { id: packId },
    include: { jurisdiction: true },
  });
  if (!pack) return null;

  // Workspaces assigned to this jurisdiction's country code
  const affected = await prisma.workspace.count({
    where: {
      countryProfile: { countryCode: pack.jurisdiction.isoCode ?? pack.jurisdiction.code },
    },
  });

  return { packId, jurisdictionName: pack.jurisdiction.name, affectedWorkspaces: affected };
};

module.exports = {
  getStats,
  list,
  findById,
  create,
  update,
  publish,
  unpublish,
  archive,
  clone,
  createObligation,
  updateObligation,
  deleteObligation,
  listJurisdictions,
  listCategories,
  getWorkspaceImpact,
};
