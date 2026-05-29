const express = require('express');
const requireAdmin = require('../../middleware/requireAdmin');
const adminAuthRoutes = require('./auth/admin.auth.routes');
const adminDashboardRoutes   = require('./dashboard/admin.dashboard.routes');
const adminWorkspacesRoutes  = require('./workspaces/admin.workspaces.routes');

const router = express.Router();

// Public admin endpoints (no token required)
router.use('/auth', adminAuthRoutes);

// All remaining /api/admin/* routes require valid admin JWT
router.use(requireAdmin);

router.use('/dashboard',   adminDashboardRoutes);
router.use('/workspaces',  adminWorkspacesRoutes);

router.get('/ping', (req, res) => {
  res.json({ success: true, data: { pong: true, admin: req.adminUser.email } });
});

router.use((req, res) => {
  res.status(404).json({ success: false, error: 'Admin endpoint not found', details: [] });
});

module.exports = router;
