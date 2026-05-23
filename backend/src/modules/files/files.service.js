const storage = require('../../lib/storage');
const repo = require('./files.repository');

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
  'text/plain',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/zip',
];

const ALLOWED_EXTENSIONS = [
  '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.csv', '.txt',
  '.jpg', '.jpeg', '.png', '.webp', '.zip',
];

const SIZE_LIMITS = {
  image: 10 * 1024 * 1024,
  document: 25 * 1024 * 1024,
  archive: 50 * 1024 * 1024,
};

function validateFile(file) {
  const ext = require('path').extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    throw Object.assign(new Error(`File type ${ext} is not allowed`), { statusCode: 400 });
  }
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    throw Object.assign(new Error(`MIME type ${file.mimetype} is not allowed`), { statusCode: 400 });
  }

  let limit = SIZE_LIMITS.document;
  if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) limit = SIZE_LIMITS.image;
  if (['.zip'].includes(ext)) limit = SIZE_LIMITS.archive;

  if (file.size > limit) {
    throw Object.assign(new Error(`File exceeds maximum allowed size`), { statusCode: 400 });
  }
}

async function uploadFile(workspaceId, userId, file, description) {
  validateFile(file);

  const path = require('path');
  const ext = path.extname(file.originalname).toLowerCase();

  const storageResult = await storage.upload(workspaceId, file);

  const record = await repo.create({
    workspaceId,
    uploadedById: userId,
    fileName: file.originalname,
    originalFilename: file.originalname,
    mimeType: file.mimetype,
    extension: ext,
    fileSize: BigInt(file.size),
    storageProvider: storageResult.storageProvider,
    bucketName: storageResult.bucketName,
    objectKey: storageResult.objectKey,
    publicUrl: storageResult.publicUrl,
    description: description || null,
  });

  await repo.logActivity({
    workspaceId,
    fileId: record.id,
    activityType: 'upload',
    performedById: userId,
    metadata: { originalname: file.originalname, size: file.size, mimeType: file.mimetype },
  });

  return record;
}

async function listFiles(workspaceId, query) {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 20;
  const isDeleted = query.isDeleted === 'true' ? true : query.isDeleted === 'false' ? false : undefined;
  return repo.list(workspaceId, {
    search: query.search,
    mimeType: query.mimeType,
    isDeleted,
    uploadedById: query.uploadedById,
    page,
    limit,
  });
}

async function getFile(id, workspaceId) {
  const file = await repo.findById(id, workspaceId);
  if (!file) throw Object.assign(new Error('File not found'), { statusCode: 404 });
  return file;
}

async function getDownloadUrl(id, workspaceId, userId) {
  const file = await getFile(id, workspaceId);
  if (file.isDeleted) throw Object.assign(new Error('File has been deleted'), { statusCode: 410 });

  const url = await storage.getDownloadUrl(file);

  await repo.logActivity({
    workspaceId,
    fileId: id,
    activityType: 'download',
    performedById: userId,
    metadata: {},
  });

  return { url, file };
}

async function renameFile(id, workspaceId, userId, fileName) {
  if (!fileName || !fileName.trim()) {
    throw Object.assign(new Error('File name is required'), { statusCode: 400 });
  }
  const existing = await getFile(id, workspaceId);
  if (existing.isDeleted) throw Object.assign(new Error('Cannot rename a deleted file'), { statusCode: 400 });

  const updated = await repo.update(id, workspaceId, { fileName: fileName.trim() });

  await repo.logActivity({
    workspaceId,
    fileId: id,
    activityType: 'rename',
    performedById: userId,
    metadata: { oldName: existing.fileName, newName: fileName.trim() },
  });

  return updated;
}

async function deleteFile(id, workspaceId, userId) {
  const existing = await getFile(id, workspaceId);
  if (existing.isDeleted) throw Object.assign(new Error('File is already deleted'), { statusCode: 400 });

  const deleted = await repo.softDelete(id, workspaceId, userId);

  await repo.logActivity({
    workspaceId,
    fileId: id,
    activityType: 'delete',
    performedById: userId,
    metadata: {},
  });

  return deleted;
}

async function restoreFile(id, workspaceId, userId) {
  const existing = await repo.findById(id, workspaceId);
  if (!existing) throw Object.assign(new Error('File not found'), { statusCode: 404 });
  if (!existing.isDeleted) throw Object.assign(new Error('File is not deleted'), { statusCode: 400 });

  const restored = await repo.restore(id, workspaceId);

  await repo.logActivity({
    workspaceId,
    fileId: id,
    activityType: 'restore',
    performedById: userId,
    metadata: {},
  });

  return restored;
}

async function linkFile(workspaceId, userId, fileId, entityType, entityId) {
  await getFile(fileId, workspaceId);

  const link = await repo.createLink({
    workspaceId,
    fileId,
    entityType,
    entityId,
    createdByUserId: userId,
  });

  await repo.logActivity({
    workspaceId,
    fileId,
    activityType: 'link',
    performedById: userId,
    metadata: { entityType, entityId },
  });

  return link;
}

async function unlinkFile(linkId, workspaceId, userId) {
  const result = await repo.deleteLink(linkId, workspaceId);

  if (result.count === 0) {
    throw Object.assign(new Error('Link not found'), { statusCode: 404 });
  }

  return { deleted: true };
}

async function getEntityFiles(workspaceId, entityType, entityId, userId) {
  const links = await repo.getLinksByEntity(workspaceId, entityType, entityId);

  // Log preview events for each fetched file
  for (const link of links) {
    await repo.logActivity({
      workspaceId,
      fileId: link.fileId,
      activityType: 'preview',
      performedById: userId,
      metadata: { entityType, entityId },
    });
  }

  return links;
}

function getLocalPath(fileRecord) {
  return storage.getLocalFilePath(fileRecord);
}

async function getServeUrl(fileRecord) {
  return storage.getServeUrl(fileRecord);
}

module.exports = {
  uploadFile,
  listFiles,
  getFile,
  getDownloadUrl,
  getServeUrl,
  renameFile,
  deleteFile,
  restoreFile,
  linkFile,
  unlinkFile,
  getEntityFiles,
  getLocalPath,
};
