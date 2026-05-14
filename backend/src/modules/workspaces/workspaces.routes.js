const { Router } = require('express');
const { protect } = require('../../middleware/requireAuth');
const workspacesController = require('./workspaces.controller');

const router = Router();

router.post('/bootstrap', protect, workspacesController.bootstrapWorkspace);

module.exports = router;
