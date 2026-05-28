const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/requireAuth');
const requireWorkspace = require('../../middleware/requireWorkspace');
const ctrl = require('./deployments.controller');

// Allows CI/CD via DEPLOY_SECRET, otherwise requires Clerk auth + workspace
const deploySecretOrProtect = (req, res, next) => {
  const secret = process.env.DEPLOY_SECRET;
  if (secret && req.headers.authorization === `Bearer ${secret}`) return next();
  return protect(req, res, () => requireWorkspace(req, res, next));
};

// Public: latest deployment by environment (used by status page)
router.get('/latest/:env', ctrl.getLatestByEnvironment);

router.get('/',    protect, requireWorkspace, ctrl.listDeployments);
router.get('/:id', protect, requireWorkspace, ctrl.getDeployment);

router.post('/',              deploySecretOrProtect, ctrl.startDeployment);
router.patch('/:id/complete', deploySecretOrProtect, ctrl.completeDeployment);
router.post('/:id/audit',     deploySecretOrProtect, ctrl.addAuditEntry);

module.exports = router;
