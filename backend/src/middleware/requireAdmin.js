const jwt = require('jsonwebtoken');
const env = require('../config/env');

module.exports = function requireAdmin(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Admin authentication required', details: [] });
  }
  try {
    const payload = jwt.verify(auth.slice(7), env.ADMIN_JWT_SECRET);
    if (payload.type !== 'admin') {
      return res.status(403).json({ success: false, error: 'Invalid admin token', details: [] });
    }
    req.adminUser = payload;
    next();
  } catch {
    return res.status(401).json({ success: false, error: 'Invalid or expired admin session', details: [] });
  }
};
