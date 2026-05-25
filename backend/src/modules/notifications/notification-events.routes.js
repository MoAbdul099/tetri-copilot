const express = require('express');
const { protect } = require('../../middleware/requireAuth');
const ctrl = require('./notification-events.controller');

const router = express.Router();

router.use(protect);

router.get('/',         ctrl.listEvents);
router.put('/:id',      ctrl.updateEvent);
router.post('/seed',    ctrl.triggerSeed);
router.get('/status',   ctrl.getIntegrationStatus);

module.exports = router;
