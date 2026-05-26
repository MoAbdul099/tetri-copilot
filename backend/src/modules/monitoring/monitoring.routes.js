const router = require('express').Router();
const { protect } = require('../../middleware/requireAuth');
const requireWorkspace = require('../../middleware/requireWorkspace');
const ctrl = require('./monitoring.controller');

router.use(protect, requireWorkspace);

router.get('/status',           ctrl.getStatus);
router.get('/uptime',           ctrl.getUptimeReport);
router.get('/metrics',          ctrl.getMetrics);
router.get('/events',           ctrl.listEvents);
router.patch('/events/:id/resolve', ctrl.resolveEvent);
router.get('/incidents',        ctrl.listIncidents);
router.post('/incidents',       ctrl.createIncident);
router.patch('/incidents/:id',  ctrl.updateIncident);
router.get('/launch-readiness', ctrl.getLaunchReadiness);

module.exports = router;
