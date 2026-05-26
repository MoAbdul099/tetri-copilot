const prisma = require('../../lib/prisma');
const { isR2Configured } = require('../../lib/storage');
const { success, error } = require('../../utils/response');
const fs = require('fs');
const path = require('path');

function getBuildInfo() {
  try {
    const p = path.join(__dirname, '../../../build-info.json');
    if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch { /* ignore */ }
  return null;
}

function getPackageVersion() {
  try {
    const p = path.join(__dirname, '../../../package.json');
    return JSON.parse(fs.readFileSync(p, 'utf8')).version || '0.1.0';
  } catch { return '0.1.0'; }
}

async function checkDb() {
  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    return { status: 'ok', latencyMs: Date.now() - start };
  } catch (err) {
    return { status: 'error', error: err.message };
  }
}

async function checkStorage() {
  if (!isR2Configured()) {
    return { status: 'local', provider: 'local_filesystem' };
  }
  try {
    const { S3Client, HeadBucketCommand } = require('@aws-sdk/client-s3');
    const client = new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      },
    });
    const start = Date.now();
    await client.send(new HeadBucketCommand({ Bucket: process.env.R2_BUCKET_NAME }));
    return { status: 'ok', provider: 'cloudflare_r2', latencyMs: Date.now() - start };
  } catch (err) {
    return { status: 'error', provider: 'cloudflare_r2', error: err.message };
  }
}

const getHealth = async (req, res) => {
  const [db, storage] = await Promise.all([checkDb(), checkStorage()]);
  const allOk = db.status === 'ok' && ['ok', 'local'].includes(storage.status);
  const buildInfo = getBuildInfo();
  const version = buildInfo?.version || getPackageVersion();

  const payload = {
    status: allOk ? 'ok' : 'degraded',
    version,
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    services: { database: db, storage },
  };

  if (!allOk) {
    return error(res, 'Service is degraded', 503, [{ services: payload.services }]);
  }
  return success(res, payload, 'Service is healthy');
};

const getDbHealth = async (req, res) => {
  const db = await checkDb();
  if (db.status !== 'ok') return error(res, 'Database is unavailable', 503, [db]);
  return success(res, { database: db }, 'Database is healthy');
};

const getStorageHealth = async (req, res) => {
  const storage = await checkStorage();
  const ok = ['ok', 'local'].includes(storage.status);
  if (!ok) return error(res, 'Storage is unavailable', 503, [storage]);
  return success(res, { storage }, 'Storage is healthy');
};

const getVersion = async (req, res) => {
  const buildInfo = getBuildInfo();
  const pkgVersion = getPackageVersion();
  return success(res, {
    version: buildInfo?.version || pkgVersion,
    environment: process.env.NODE_ENV || 'development',
    buildTimestamp: buildInfo?.buildTimestamp || null,
    commitSha: buildInfo?.commitSha || null,
    nodeVersion: process.version,
    uptime: Math.floor(process.uptime()),
  });
};

module.exports = { getHealth, getDbHealth, getStorageHealth, getVersion };
