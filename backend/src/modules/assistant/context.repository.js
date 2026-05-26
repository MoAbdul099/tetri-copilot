const prisma = require('../../lib/prisma');

async function createContextLog({ workspaceId, sessionId, messageId, userId, intents, contextText, confidence, recordsCount, tokenEstimate, durationMs }) {
  return prisma.aiContextLog.create({
    data: {
      workspaceId,
      sessionId,
      messageId: messageId || null,
      userId,
      intents:      intents      ? JSON.parse(JSON.stringify(intents)) : null,
      contextText:  contextText  || null,
      confidence:   confidence   || 'medium',
      recordsCount: recordsCount || 0,
      tokenEstimate: tokenEstimate || 0,
      durationMs:   durationMs   || 0,
    },
  });
}

async function createContextSources(contextLogId, sources = []) {
  if (!sources.length) return [];
  return prisma.aiContextSource.createMany({
    data: sources.map((s) => ({
      contextLogId,
      sourceType:  s.type,
      sourceName:  s.name,
      entityId:    s.entityId  || null,
      routePath:   s.routePath || null,
      recordCount: s.count     || 0,
    })),
  });
}

async function listSessionFiles(workspaceId, sessionId) {
  return prisma.aiFileReference.findMany({
    where:   { workspaceId, sessionId },
    orderBy: { createdAt: 'asc' },
    select:  { id: true, fileName: true, mimeType: true, fileSize: true, extractStatus: true, createdAt: true },
  });
}

async function createFileReference({ workspaceId, sessionId, userId, fileName, mimeType, fileSize, extractedText, extractStatus, metadata }) {
  return prisma.aiFileReference.create({
    data: {
      workspaceId,
      sessionId,
      userId,
      fileName,
      mimeType,
      fileSize,
      extractedText: extractedText || null,
      extractStatus: extractStatus || 'done',
      metadata:      metadata      || null,
    },
  });
}

async function getFileReference(id, workspaceId) {
  return prisma.aiFileReference.findFirst({ where: { id, workspaceId } });
}

async function deleteFileReference(id, workspaceId) {
  return prisma.aiFileReference.deleteMany({ where: { id, workspaceId } });
}

async function getSessionFileTexts(workspaceId, sessionId) {
  return prisma.aiFileReference.findMany({
    where:  { workspaceId, sessionId, extractStatus: 'done' },
    select: { id: true, fileName: true, mimeType: true, extractedText: true },
  });
}

module.exports = {
  createContextLog,
  createContextSources,
  listSessionFiles,
  createFileReference,
  getFileReference,
  deleteFileReference,
  getSessionFileTexts,
};
