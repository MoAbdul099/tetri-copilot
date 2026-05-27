const router = require('express').Router();
const { protect }           = require('../../middleware/requireAuth');
const requireWorkspace      = require('../../middleware/requireWorkspace');
const ctrl = require('./compliance-ai-actions.controller');

router.use(protect, requireWorkspace);

// Static routes first
router.get('/dashboard',             ctrl.getDashboard);
router.get('/actions',               ctrl.listActions);
router.get('/packages',              ctrl.listPackages);
router.get('/checklists',            ctrl.listChecklists);
router.post('/suggest',              ctrl.suggestActions);
router.post('/from-recommendation',  ctrl.fromRecommendation);
router.post('/generate-package',     ctrl.generatePackage);
router.post('/generate-checklist',   ctrl.generateChecklist);
router.post('/draft-reminder',       ctrl.draftReminder);

// Parameterised routes last
router.get('/packages/:id',    ctrl.getPackage);
router.get('/checklists/:id',  ctrl.getChecklist);

module.exports = router;
