const ctxRepo = require('./context.repository');

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const SUPPORTED_TEXT_TYPES = ['text/plain', 'text/csv', 'application/json', 'text/markdown'];
const SUPPORTED_TYPES = [
  ...SUPPORTED_TEXT_TYPES,
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'image/png',
  'image/jpeg',
  'image/webp',
];

// ── Text extraction ───────────────────────────────────────────────────────────

function extractText(buffer, mimeType, fileName) {
  if (SUPPORTED_TEXT_TYPES.includes(mimeType) || fileName.endsWith('.txt') || fileName.endsWith('.csv') || fileName.endsWith('.md')) {
    return { text: buffer.toString('utf8').substring(0, 50000), status: 'done' };
  }

  if (mimeType === 'application/json' || fileName.endsWith('.json')) {
    try {
      const parsed = JSON.parse(buffer.toString('utf8'));
      const text   = JSON.stringify(parsed, null, 2).substring(0, 50000);
      return { text, status: 'done' };
    } catch {
      return { text: buffer.toString('utf8').substring(0, 50000), status: 'done' };
    }
  }

  // For PDFs, DOCX, images — mark as unsupported for text extraction
  const note = `[File: ${fileName} — text extraction not supported for ${mimeType}. Describe this file to get AI assistance.]`;
  return { text: note, status: 'unsupported' };
}

// ── Upload handler ────────────────────────────────────────────────────────────

async function uploadFile({ workspaceId, sessionId, userId, file }) {
  if (!file) throw Object.assign(new Error('No file provided'), { status: 400 });

  if (file.size > MAX_FILE_SIZE) {
    throw Object.assign(new Error(`File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)} MB.`), { status: 400 });
  }

  if (!SUPPORTED_TYPES.includes(file.mimetype)) {
    throw Object.assign(new Error(`Unsupported file type: ${file.mimetype}`), { status: 400 });
  }

  const { text, status } = extractText(file.buffer, file.mimetype, file.originalname);

  const ref = await ctxRepo.createFileReference({
    workspaceId,
    sessionId,
    userId,
    fileName:      file.originalname,
    mimeType:      file.mimetype,
    fileSize:      file.size,
    extractedText: text,
    extractStatus: status,
    metadata:      { originalName: file.originalname },
  });

  return {
    id:            ref.id,
    fileName:      ref.fileName,
    mimeType:      ref.mimeType,
    fileSize:      ref.fileSize,
    extractStatus: ref.extractStatus,
    createdAt:     ref.createdAt,
  };
}

async function listSessionFiles(workspaceId, sessionId) {
  return ctxRepo.listSessionFiles(workspaceId, sessionId);
}

async function removeFile(id, workspaceId) {
  const ref = await ctxRepo.getFileReference(id, workspaceId);
  if (!ref) throw Object.assign(new Error('File not found'), { status: 404 });
  await ctxRepo.deleteFileReference(id, workspaceId);
}

module.exports = { uploadFile, listSessionFiles, removeFile, SUPPORTED_TYPES, MAX_FILE_SIZE };
