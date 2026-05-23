const { hasPermission } = require('../constants/permissions');
const { error } = require('../utils/response');

// Usage: router.get('/...', requirePermission('compliance.view'), ctrl.handler)
const requirePermission = (permission) => (req, res, next) => {
  if (!req.role || !hasPermission(req.role, permission)) {
    return error(res, 'Forbidden', 403);
  }
  next();
};

module.exports = requirePermission;
