// RBAC permission constants for Tetri Copilot
// Role hierarchy: owner > admin > user > viewer

const PERMISSIONS = {
  compliance: {
    view:      'compliance.view',
    manage:    'compliance.manage',
    configure: 'compliance.configure',
    admin:     'compliance.admin',
  },
};

// Permissions granted per SystemRole
const ROLE_PERMISSIONS = {
  owner:  [
    'compliance.view', 'compliance.manage', 'compliance.configure', 'compliance.admin',
  ],
  admin:  [
    'compliance.view', 'compliance.manage', 'compliance.configure', 'compliance.admin',
  ],
  user:   [
    'compliance.view', 'compliance.manage',
  ],
  viewer: [
    'compliance.view',
  ],
};

function hasPermission(role, permission) {
  return (ROLE_PERMISSIONS[role] || []).includes(permission);
}

module.exports = { PERMISSIONS, ROLE_PERMISSIONS, hasPermission };
