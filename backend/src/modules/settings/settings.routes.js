const { Router } = require('express');
const { protect } = require('../../middleware/requireAuth');
const requireWorkspace = require('../../middleware/requireWorkspace');
const requireOwner = require('../../middleware/requireOwner');
const settingsController = require('./settings.controller');

const router = Router();

router.use(protect, requireWorkspace);

router.get('/', settingsController.getSettings);
router.patch('/', requireOwner, settingsController.updateSettings);

module.exports = router;
