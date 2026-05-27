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
        createdByUser: { select: { id: true, fullName: true, email: true } },
        _count: { select: { versions: true } },
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
      createdByUser: { select: { id: true, fullName: true, email: true } },
      _count: { select: { versions: true, exports: true, enhancements: true } },
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

// ---- Versioning ----

const getNextVersionNumber = async (documentId) => {
  const last = await prisma.aiDocumentVersion.findFirst({
    where: { documentId },
    orderBy: { versionNumber: 'desc' },
    select: { versionNumber: true },
  });
  return (last?.versionNumber || 0) + 1;
};

const createVersion = async (documentId, userId, content, changeSummary) => {
  const versionNumber = await getNextVersionNumber(documentId);
  return prisma.aiDocumentVersion.create({
    data: { documentId, versionNumber, content, changeSummary, createdById: userId },
    include: { createdBy: { select: { id: true, fullName: true, email: true } } },
  });
};

const listVersions = async (workspaceId, documentId) => {
  const doc = await prisma.aiDocument.findFirst({ where: { id: documentId, workspaceId, isDeleted: false }, select: { id: true } });
  if (!doc) return null;

  return prisma.aiDocumentVersion.findMany({
    where: { documentId },
    orderBy: { versionNumber: 'desc' },
    include: { createdBy: { select: { id: true, fullName: true, email: true } } },
  });
};

const getVersion = async (workspaceId, documentId, versionId) => {
  const doc = await prisma.aiDocument.findFirst({ where: { id: documentId, workspaceId, isDeleted: false }, select: { id: true } });
  if (!doc) return null;

  return prisma.aiDocumentVersion.findFirst({
    where: { id: versionId, documentId },
    include: { createdBy: { select: { id: true, fullName: true, email: true } } },
  });
};

// ---- Export Tracking ----

const trackExport = async (documentId, versionId, userId, exportType) => {
  return prisma.aiDocumentExport.create({
    data: { documentId, versionId, exportType, exportedBy: userId },
  });
};

const listExports = async (workspaceId, documentId) => {
  const doc = await prisma.aiDocument.findFirst({ where: { id: documentId, workspaceId, isDeleted: false }, select: { id: true } });
  if (!doc) return null;
  return prisma.aiDocumentExport.findMany({
    where: { documentId },
    orderBy: { exportedAt: 'desc' },
    take: 50,
  });
};

// ---- Enhancement Tracking ----

const trackEnhancement = async (documentId, versionId, userId, data) => {
  return prisma.aiDocumentEnhancement.create({
    data: { documentId, versionId, createdBy: userId, ...data },
  });
};

// ---- Quality Review ----

const saveQualityReview = async (documentId, versionId, reviewResult, recommendations) => {
  return prisma.aiDocumentQualityReview.create({
    data: { documentId, versionId, reviewResult, recommendations },
  });
};

// ---- Comparison ----

const saveComparison = async (documentId, sourceVersionId, targetVersionId, userId) => {
  return prisma.aiDocumentComparison.create({
    data: { documentId, sourceVersionId, targetVersionId, createdById: userId },
  });
};

// ---- Duplicate ----

const duplicate = async (workspaceId, id, userId) => {
  const src = await prisma.aiDocument.findFirst({
    where: { id, workspaceId, isDeleted: false },
    include: { contextSources: true, relations: true },
  });
  if (!src) return null;

  const { id: _id, createdAt, updatedAt, deletedAt, isDeleted, createdByUserId, ...fields } = src;

  return prisma.aiDocument.create({
    data: {
      ...fields,
      title: `${src.title} (Copy)`,
      status: 'draft',
      workspaceId,
      createdByUserId: userId,
      contextSources: src.contextSources.length ? {
        create: src.contextSources.map(({ id: _sid, documentId: _did, selectedAt, ...s }) => ({ ...s, workspaceId })),
      } : undefined,
      relations: src.relations ? {
        create: (() => {
          const { id: _rid, documentId: _rdid, ...r } = src.relations;
          return { ...r, workspaceId };
        })(),
      } : undefined,
    },
    include: { contextSources: true, relations: true },
  });
};

module.exports = {
  list, findById, create, update, softDelete, addGenerationLog,
  createVersion, listVersions, getVersion,
  trackExport, listExports,
  trackEnhancement,
  saveQualityReview,
  saveComparison,
  duplicate,
};
