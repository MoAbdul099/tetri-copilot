const { Router } = require('express');
const { protect } = require('../../middleware/requireAuth');
const requireWorkspace = require('../../middleware/requireWorkspace');
const controller = require('./usage.controller');

const router = Router();

router.use(protect, requireWorkspace);

router.get('/summary', controller.getSummary);

module.exports = router;
