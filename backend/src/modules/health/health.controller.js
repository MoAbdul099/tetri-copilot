const prisma = require('../../lib/prisma');
const { success, error } = require('../../utils/response');

const getHealth = async (req, res) => {
  let dbStatus = 'ok';
  let dbLatencyMs = null;

  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    dbLatencyMs = Date.now() - start;
  } catch {
    dbStatus = 'error';
  }

  const payload = {
    status: dbStatus === 'ok' ? 'ok' : 'degraded',
    version: process.env.npm_package_version || '0.1.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    services: {
      database: {
        status: dbStatus,
        latencyMs: dbLatencyMs,
      },
    },
  };

  if (payload.status === 'ok') {
    return success(res, payload, 'Service is healthy');
  }

  return error(res, 'Service is degraded', 503, [{ service: 'database', status: dbStatus }]);
};

module.exports = { getHealth };
