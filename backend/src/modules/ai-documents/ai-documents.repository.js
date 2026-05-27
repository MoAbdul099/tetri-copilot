const prisma = require('../../lib/prisma');

const list = async (workspaceId, { page = 1, limit = 20, search, category, status } = {}) => {
  const skip = (page - 1) * parseInt(limit);
  const take = parseInt(limit);

  const where = {
    workspaceId,
    isDeleted: false,
    ...(search && {
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
      ],
    }),
    ...(category && { category }),
    ...(status && { status }),
  };

  const [total, items] = await Promise.all([
    prisma.aiDocument.count({ where }),
    prisma.aiDocument.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      select: {
        id: true, title: true, category: true, status: true,
        language: true, tone: true, provider: true, model: true,
        createdAt: true, updatedAt: true,
        createdByUser: { select: { id: true, firstName: true, lastName: true } },
      },
    }),
  ]);

  return { items, total, page: parseInt(page), limit: take };
};

const findById = async (workspaceId, id) => {
  return prisma.aiDocument.findFirst({
    where: { id, workspaceId, isDeleted: false },
    include: {
      contextSources: true,
      relations: true,
      generationLogs: { orderBy: { createdAt: 'desc' }, take: 10 },
      createdByUser: { select: { id: true, firstName: true, lastName: true } },
    },
  });
};

const create = async (workspaceId, userId, data) => {
  const { contextSources, relations, ...docData } = data;

  return prisma.aiDocument.create({
    data: {
      ...docData,
      workspaceId,
      createdByUserId: userId,
      contextSources: contextSources?.length ? {
        create: contextSources.map((s) => ({ ...s, workspaceId })),
      } : undefined,
      relations: relations ? {
        create: { ...relations, workspaceId },
      } : undefined,
    },
    include: { contextSources: true, relations: true },
  });
};

const update = async (workspaceId, id, data) => {
  const { contextSources, relations, ...docData } = data;
  return prisma.aiDocument.update({
    where: { id },
    data: docData,
    include: { contextSources: true, relations: true, generationLogs: { orderBy: { createdAt: 'desc' }, take: 10 } },
  });
};

const softDelete = async (workspaceId, id) => {
  return prisma.aiDocument.update({
    where: { id },
    data: { isDeleted: true, deletedAt: new Date() },
  });
};

const addGenerationLog = async (workspaceId, documentId, userId, logData) => {
  return prisma.aiDocumentGenerationLog.create({
    data: {
      documentId,
      workspaceId,
      generatedById: userId,
      ...logData,
    },
  });
};

module.exports = { list, findById, create, update, softDelete, addGenerationLog };
