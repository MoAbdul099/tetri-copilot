const fs = require('fs');
const path = require('path');
const prisma = require('../../lib/prisma');
const { success } = require('../../utils/response');

function readBuildFile() {
  try {
    const p = path.join(__dirname, '../../../build-info.json');
    if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch { /* ignore */ }
  return null;
}

function readPackageVersion() {
  try {
    return JSON.parse(fs.readFileSync(path.join(__dirname, '../../../package.json'), 'utf8')).version || '0.1.0';
  } catch { return '0.1.0'; }
}

const getVersion = async (req, res) => {
  const buildInfo = readBuildFile();
  const pkgVersion = readPackageVersion();

  let activeVersion = null;
  try {
    activeVersion = await prisma.systemVersion.findFirst({ where: { isActive: true } });
  } catch { /* table may not exist yet during initial deploy */ }

  return success(res, {
    version: activeVersion?.version || buildInfo?.version || pkgVersion,
    releaseDate: activeVersion?.releaseDate || null,
    releaseNotes: activeVersion?.releaseNotes || null,
    environment: process.env.NODE_ENV || 'development',
  });
};

const getBuildInfo = async (req, res) => {
  const buildInfo = readBuildFile();
  const pkgVersion = readPackageVersion();

  return success(res, {
    version: buildInfo?.version || pkgVersion,
    environment: process.env.NODE_ENV || 'development',
    buildTimestamp: buildInfo?.buildTimestamp || null,
    commitSha: buildInfo?.commitSha || null,
    branch: buildInfo?.branch || null,
    nodeVersion: process.version,
    uptime: Math.floor(process.uptime()),
    uptimeHuman: formatUptime(process.uptime()),
    memory: {
      heapUsedMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      heapTotalMb: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      rssMb: Math.round(process.memoryUsage().rss / 1024 / 1024),
    },
  });
};

function formatUptime(seconds) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  return `${m}m ${s}s`;
}

module.exports = { getVersion, getBuildInfo };
