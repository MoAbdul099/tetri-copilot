const express = require('express');
const router  = express.Router();
const { protect }      = require('../../middleware/requireAuth');
const requireWorkspace = require('../../middleware/requireWorkspace');
const ctrl = require('./security.controller');

router.use(protect, requireWorkspace);

router.get('/dashboard',                    ctrl.getDashboard);
router.get('/alerts',                       ctrl.listAlerts);
router.get('/alerts/:id',                   ctrl.getAlert);
router.post('/alerts/:id/acknowledge',      ctrl.acknowledgeAlert);
router.post('/alerts/:id/investigate',      ctrl.investigateAlert);
router.post('/alerts/:id/resolve',          ctrl.resolveAlert);
router.post('/alerts/:id/dismiss',          ctrl.dismissAlert);
router.post('/alerts/:id/false-positive',   ctrl.markFalsePositive);
router.get('/events',                       ctrl.listEvents);
router.get('/rules',                        ctrl.listRules);
router.patch('/rules/:id',                  ctrl.updateRule);

module.exports = router;
