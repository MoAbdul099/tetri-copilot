const { Router } = require('express');
const { protect } = require('../../middleware/requireAuth');
const requireWorkspace = require('../../middleware/requireWorkspace');
const requireOwner = require('../../middleware/requireOwner');
const controller = require('./subscriptions.controller');

const router = Router();

router.use(protect, requireWorkspace);

router.get('/current', controller.getCurrent);
router.get('/features', controller.getFeatures);
router.patch('/upgrade', requireOwner, controller.upgrade);
router.patch('/downgrade', requireOwner, controller.downgrade);
router.patch('/cancel', requireOwner, controller.cancel);

module.exports = router;
