const { Router } = require('express');
const { protect } = require('../../middleware/requireAuth');
const requireWorkspace = require('../../middleware/requireWorkspace');
const controller = require('./subscriptions.controller');

const router = Router();

router.use(protect, requireWorkspace);

router.get('/current', controller.getCurrent);
router.get('/features', controller.getFeatures);

module.exports = router;
