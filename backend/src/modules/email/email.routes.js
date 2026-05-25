const router = require('express').Router();
const ctrl   = require('./email.controller');
const { protect }      = require('../../middleware/requireAuth');
const requireWorkspace = require('../../middleware/requireWorkspace');

router.use(protect, requireWorkspace);

// Template management (admin/owner only in practice — RBAC enforced at middleware layer)
router.get('/',                      ctrl.listTemplates);
router.post('/',                     ctrl.createTemplate);
router.get('/:id',                   ctrl.getTemplate);
router.put('/:id',                   ctrl.updateTemplate);
router.delete('/:id',                ctrl.deleteTemplate);
router.post('/:id/publish',          ctrl.publishTemplate);
router.post('/:id/archive',          ctrl.archiveTemplate);
router.get('/:id/versions',          ctrl.getVersions);
router.post('/:id/preview',          ctrl.previewTemplate);
router.post('/:id/test',             ctrl.sendTest);

// Analytics & delivery
router.get('/analytics/summary',     ctrl.getAnalytics);
router.get('/analytics/deliveries',  ctrl.listDeliveries);

module.exports = router;
