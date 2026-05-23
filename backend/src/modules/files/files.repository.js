const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Field names matched exactly to schema.prisma
const FILE_SELECT = {
  id: true,
  workspaceId: true,
  fileName: true,
  originalFilename: true,
  mimeType: true,
  fileSizeBytes: true,
  storageProvider: true,
  objectKey: true,
  publicUrl: true,
  description: true,
  isDeleted: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
  uploadedByUser: {
    select: { id: true, firstName: true, lastName: true, email: true },
  },
  deletedByUser: {
    select: { id: true, firstName: true, lastName: true },
  },
};

async function list(workspaceId, { search, mimeType, isDeleted, uploadedByUserId, page, limit }) {
  const where = { workspaceId };
  if (search) {
    where.OR = [
      { fileName: { contains: search, mode: 'insensitive' } },
      { originalFilename: { contains: search, mode: 'insensitive' } },
    ];
  }
  if (mimeType) where.mimeType = { contains: mimeType, mode: 'insensitive' };
  if (uploadedByUserId) where.uploadedByUserId = uploadedByUserId;
  where.isDeleted = typeof isDeleted === 'boolean' ? isDeleted : false;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  const [files, total] = await Promise.all([
    prisma.file.findMany({ where, select: FILE_SELECT, orderBy: { createdAt: 'desc' }, skip, take }),
    prisma.file.count({ where }),
  ]);

  return { files, total };
}

async function findById(id, workspaceId) {
  return prisma.file.findFirst({
    where: { id, workspaceId },
    select: {
      ...FILE_SELECT,
      fileLinks: {
        select: {
          id: true, entityType: true, entityId: true, createdAt: true,
          createdBy: { select: { id: true, firstName: true, lastName: true } },
        },
      },
    },
  });
}

async function create(data) {
  return prisma.file.create({ data, select: FILE_SELECT });
}

async function update(id, data) {
  return prisma.file.update({ where: { id }, data, select: FILE_SELECT });
}

async function softDelete(id, deletedByUserId) {
  return prisma.file.update({
    where: { id },
    data: { isDeleted: true, deletedAt: new Date(), deletedByUserId },
    select: FILE_SELECT,
  });
}

async function restore(id) {
  return prisma.file.update({
    where: { id },
    data: { isDeleted: false, deletedAt: null, deletedByUserId: null },
    select: FILE_SELECT,
  });
}

async function createLink(data) {
  return prisma.fileLink.create({ data });
}

async function deleteLink(id, workspaceId) {
  return prisma.fileLink.deleteMany({ where: { id, workspaceId } });
}

async function getLinksByEntity(workspaceId, entityType, entityId) {
  return prisma.fileLink.findMany({
    where: { workspaceId, entityType, entityId },
    include: {
      file: { select: FILE_SELECT },
      createdBy: { select: { id: true, firstName: true, lastName: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

async function logActivity(data) {
  return prisma.fileActivityLog.create({ data });
}

module.exports = {
  list, findById, create, update, softDelete, restore,
  createLink, deleteLink, getLinksByEntity, logActivity,
};
