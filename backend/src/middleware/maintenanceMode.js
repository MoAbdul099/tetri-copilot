const settingsCache = require('../lib/settingsCache');

// Paths that bypass maintenance mode
const BYPASS = [
  '/api/admin',
  '/api/v1/health',
  '/api/v1/auth',
  '/api/v1/billing/webhook',
  '/api/v1/feature-flags',
  '/api/public',
];

module.exports = async function maintenanceMode(req, res, next) {
  const bypassed = BYPASS.some((prefix) => req.path.startsWith(prefix));
  if (bypassed) return next();

  try {
    const enabled = await settingsCache.get('maintenance_mode', false);
    if (!enabled) return next();

    const message = await settingsCache.get(
      'maintenance_message',
      'We are performing scheduled maintenance. Please check back shortly.'
    );

    return res.status(503).json({
      success: false,
      error: 'Service temporarily unavailable',
      maintenance: true,
      message,
      details: [],
    });
  } catch {
    // If cache fails, never block requests
    return next();
  }
};
