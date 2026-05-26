const express  = require('express');
const { protect } = require('../../middleware/requireAuth');
const requireWorkspace = require('../../middleware/requireWorkspace');
const aiAdminRoutes = require('../ai/ai.admin.routes');

const router = express.Router();

// All /api/admin/* routes require authentication + workspace membership
router.use(protect, requireWorkspace);

// Guard: owner or admin only for the entire admin namespace
router.use((req, res, next) => {
  if (!['owner', 'admin'].includes(req.role)) {
    return res.status(403).json({ success: false, error: 'Admin access required', details: [] });
  }
  next();
});

router.use('/ai', aiAdminRoutes);

// Fallback for unimplemented admin sub-routes
router.use((req, res) => {
  res.status(404).json({ success: false, error: 'Admin endpoint not found', details: [] });
});

module.exports = router;
