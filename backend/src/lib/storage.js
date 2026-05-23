const path = require('path');
const fs   = require('fs');
const { randomUUID } = require('crypto');

let S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, getSignedUrl;
try {
  ({ S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3'));
  ({ getSignedUrl } = require('@aws-sdk/s3-request-presigner'));
} catch { /* not installed */ }

const LOCAL_UPLOAD_DIR = path.join(__dirname, '../../../uploads/central');

function isR2Configured() {
  return !!(
    process.env.R2_ACCOUNT_ID &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    process.env.R2_BUCKET_NAME &&
    S3Client
  );
}

function getS3Client() {
  return new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId:     process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
  });
}

function buildObjectKey(workspaceId, ext) {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const id = randomUUID();
  return `workspaces/${workspaceId}/${y}/${m}/${id}${ext}`;
}

async function upload(workspaceId, { buffer, originalname, mimetype }) {
  const ext = path.extname(originalname).toLowerCase();
  const objectKey = buildObjectKey(workspaceId, ext);

  if (isR2Configured()) {
    const client = getS3Client();
    await client.send(new PutObjectCommand({
      Bucket:      process.env.R2_BUCKET_NAME,
      Key:         objectKey,
      Body:        buffer,
      ContentType: mimetype,
    }));
    return {
      storageProvider: 'cloudflare_r2',
      bucketName:      process.env.R2_BUCKET_NAME,
      objectKey,
      publicUrl:       process.env.R2_PUBLIC_URL ? `${process.env.R2_PUBLIC_URL}/${objectKey}` : null,
    };
  }

  // Local fallback
  if (!fs.existsSync(LOCAL_UPLOAD_DIR)) fs.mkdirSync(LOCAL_UPLOAD_DIR, { recursive: true });
  const localPath = path.join(LOCAL_UPLOAD_DIR, path.basename(objectKey.replace(/\//g, '_')));
  fs.writeFileSync(localPath, buffer);
  return {
    storageProvider: 'local',
    bucketName:      null,
    objectKey:       localPath,
    publicUrl:       null,
  };
}

async function getDownloadUrl(fileRecord, expiresInSeconds = 900) {
  if (fileRecord.storageProvider === 'cloudflare_r2' && isR2Configured()) {
    const client = getS3Client();
    const cmd = new GetObjectCommand({
      Bucket:                     process.env.R2_BUCKET_NAME || fileRecord.bucketName,
      Key:                        fileRecord.objectKey,
      ResponseContentDisposition: `attachment; filename="${encodeURIComponent(fileRecord.fileName || fileRecord.originalFilename || 'download')}"`,
    });
    return getSignedUrl(client, cmd, { expiresIn: expiresInSeconds });
  }
  // Local: caller must serve via /files/:id/serve
  return null;
}

async function deleteFromStorage(fileRecord) {
  if (fileRecord.storageProvider === 'cloudflare_r2' && isR2Configured()) {
    const client = getS3Client();
    await client.send(new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME || fileRecord.bucketName,
      Key:    fileRecord.objectKey,
    })).catch(() => { /* best effort */ });
  } else if (fileRecord.storageProvider === 'local' && fileRecord.objectKey) {
    if (fs.existsSync(fileRecord.objectKey)) {
      fs.unlinkSync(fileRecord.objectKey);
    }
  }
}

function getLocalFilePath(fileRecord) {
  if (fileRecord.storageProvider === 'local') return fileRecord.objectKey;
  return null;
}

module.exports = { upload, getDownloadUrl, deleteFromStorage, getLocalFilePath, isR2Configured };
