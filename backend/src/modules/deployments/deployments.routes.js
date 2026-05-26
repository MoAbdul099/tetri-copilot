const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/requireAuth');
const requireWorkspace = require('../../middleware/requireWorkspace');
const ctrl = require('./deployments.controller');

// Public: latest deployment by environment (used by status page)
router.get('/latest/:env', ctrl.getLatestByEnvironment);

// Protected with optional Clerk auth (CI/CD uses DEPLOY_SECRET instead)
// For GET routes: require Clerk auth + workspace
router.get('/',    protect, requireWorkspace, ctrl.listDeployments);
router.get('/:id', protect, requireWorkspace, ctrl.getDeployment);

// Write routes: accept either DEPLOY_SECRET or Clerk auth
// These don't require requireWorkspace middleware since they support both paths
router.post('/',               ctrl.startDeployment);
router.patch('/:id/complete',  ctrl.completeDeployment);
router.post('/:id/audit',      ctrl.addAuditEntry);

module.exports = router;
