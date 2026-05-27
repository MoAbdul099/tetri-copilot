const prisma = require('../../lib/prisma');

const INCLUDE_FULL = {
  placeholders: true,
  contextRequirements: true,
  createdByUser:  { select: { id: true, fullName: true, email: true } },
  modifiedByUser: { select: { id: true, fullName: true, email: true } },
};

const list = async (workspaceId, { page = 1, limit = 20, search, category, status, language } = {}) => {
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  const where = {
    workspaceId,
    ...(search && {
      OR: [
        { name:        { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { category:    { contains: search, mode: 'insensitive' } },
      ],
    }),
    ...(category && { category }),
    ...(status   && { status }),
    ...(language && { languageName: { contains: language, mode: 'insensitive' } }),
  };

  const [total, items] = await Promise.all([
    prisma.documentTemplate.count({ where }),
    prisma.documentTemplate.findMany({
      where,
      orderBy: [{ status: 'asc' }, { updatedAt: 'desc' }],
      skip,
      take,
      select: {
        id: true, name: true, category: true, status: true,
        languageName: true, tone: true, brandingEnabled: true,
        usageCount: true, lastUsedAt: true, isSystemDefault: true,
        createdAt: true, updatedAt: true,
        createdByUser: { select: { id: true, fullName: true } },
        _count: { select: { placeholders: true, contextRequirements: true } },
      },
    }),
  ]);

  return { items, total, page: parseInt(page), limit: take };
};

const findById = async (workspaceId, id) => {
  return prisma.documentTemplate.findFirst({
    where: { id, workspaceId },
    include: INCLUDE_FULL,
  });
};

const create = async (workspaceId, userId, data) => {
  const { placeholders = [], contextRequirements = [], ...tplData } = data;

  return prisma.documentTemplate.create({
    data: {
      ...tplData,
      workspaceId,
      createdByUserId:  userId,
      modifiedByUserId: userId,
      placeholders: placeholders.length ? {
        create: placeholders.map(p => ({
          placeholderName: p.placeholderName,
          sourceType:      p.sourceType,
          required:        p.required ?? false,
        })),
      } : undefined,
      contextRequirements: contextRequirements.length ? {
        create: contextRequirements.map(r => ({
          sourceType: r.sourceType,
          required:   r.required ?? true,
        })),
      } : undefined,
    },
    include: INCLUDE_FULL,
  });
};

const update = async (workspaceId, id, userId, data) => {
  const { placeholders, contextRequirements, ...tplData } = data;

  return prisma.$transaction(async (tx) => {
    if (placeholders !== undefined) {
      await tx.aiTemplatePlaceholder.deleteMany({ where: { templateId: id } });
      if (placeholders.length) {
        await tx.aiTemplatePlaceholder.createMany({
          data: placeholders.map(p => ({
            templateId:      id,
            placeholderName: p.placeholderName,
            sourceType:      p.sourceType,
            required:        p.required ?? false,
          })),
        });
      }
    }
    if (contextRequirements !== undefined) {
      await tx.aiTemplateContextRequirement.deleteMany({ where: { templateId: id } });
      if (contextRequirements.length) {
        await tx.aiTemplateContextRequirement.createMany({
          data: contextRequirements.map(r => ({
            templateId: id,
            sourceType: r.sourceType,
            required:   r.required ?? true,
          })),
        });
      }
    }
    return tx.documentTemplate.update({
      where: { id },
      data:  { ...tplData, modifiedByUserId: userId },
      include: INCLUDE_FULL,
    });
  });
};

const clone = async (workspaceId, id, userId) => {
  const src = await findById(workspaceId, id);
  if (!src) return null;

  const { placeholders, contextRequirements, createdByUser, modifiedByUser,
          id: _id, createdAt: _c, updatedAt: _u, usageCount: _uc, lastUsedAt: _la,
          ...rest } = src;

  return prisma.documentTemplate.create({
    data: {
      ...rest,
      workspaceId,
      name:             `${rest.name} (Copy)`,
      status:           'draft',
      createdByUserId:  userId,
      modifiedByUserId: userId,
      isSystemDefault:  false,
      placeholders: placeholders?.length ? {
        create: placeholders.map(p => ({
          placeholderName: p.placeholderName,
          sourceType:      p.sourceType,
          required:        p.required,
        })),
      } : undefined,
      contextRequirements: contextRequirements?.length ? {
        create: contextRequirements.map(r => ({
          sourceType: r.sourceType,
          required:   r.required,
        })),
      } : undefined,
    },
    include: INCLUDE_FULL,
  });
};

const archive   = (id, userId) => prisma.documentTemplate.update({ where: { id }, data: { status: 'archived', modifiedByUserId: userId } });
const softDelete = (id) => prisma.documentTemplate.delete({ where: { id } });

const incrementUsage = (id) => prisma.documentTemplate.update({
  where: { id },
  data:  { usageCount: { increment: 1 }, lastUsedAt: new Date() },
});

const getBranding   = (workspaceId) => prisma.workspaceBrandingProfile.findUnique({ where: { workspaceId } });
const upsertBranding = (workspaceId, data) => prisma.workspaceBrandingProfile.upsert({
  where:  { workspaceId },
  create: { workspaceId, ...data },
  update: data,
});

module.exports = { list, findById, create, update, clone, archive, softDelete, incrementUsage, getBranding, upsertBranding };
