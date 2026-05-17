const { Router } = require('express');
const { protect } = require('../../middleware/requireAuth');
const requireWorkspace = require('../../middleware/requireWorkspace');
const requireOwner = require('../../middleware/requireOwner');
const workspacesController = require('./workspaces.controller');

const router = Router();

router.post('/bootstrap', protect, workspacesController.bootstrapWorkspace);
router.get('/current', protect, requireWorkspace, workspacesController.getCurrentWorkspace);
router.patch('/current', protect, requireWorkspace, requireOwner, workspacesController.updateCurrentWorkspace);

module.exports = router;
