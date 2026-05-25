const router = require('express').Router();
const ctrl   = require('./reports.controller');
const { protect }      = require('../../middleware/requireAuth');
const requireWorkspace = require('../../middleware/requireWorkspace');

router.use(protect, requireWorkspace);

// Catalog
router.get('/', ctrl.getCatalog);

// Saved reports (before /:reportCode to avoid param collision)
router.get('/saved',              ctrl.listSaved);
router.post('/saved',             ctrl.createSaved);
router.put('/saved/:savedId',     ctrl.updateSaved);
router.delete('/saved/:savedId',  ctrl.deleteSaved);

// Scheduled reports
router.get('/schedules',                        ctrl.listSchedules);
router.post('/schedules',                       ctrl.createSchedule);
router.put('/schedules/:scheduleId',            ctrl.updateSchedule);
router.delete('/schedules/:scheduleId',         ctrl.deleteSchedule);
router.post('/schedules/:scheduleId/run-now',   ctrl.runNow);

// Export jobs
router.get('/exports/:jobId',           ctrl.getExportJob);
router.get('/exports/:jobId/download',  ctrl.downloadExport);

// Per-report actions (must come after specific paths above)
router.get('/:reportCode',          ctrl.getDefinition);
router.post('/:reportCode/run',     ctrl.runReport);
router.post('/:reportCode/export',  ctrl.createExport);

module.exports = router;
