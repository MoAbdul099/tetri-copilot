const router     = require('express').Router();
const ctrl       = require('./analytics.controller');
const { protect }      = require('../../middleware/requireAuth');
const requireWorkspace = require('../../middleware/requireWorkspace');

router.use(protect, requireWorkspace);

router.get('/',              ctrl.getAnalytics);
router.get('/health',        ctrl.getHealthScore);
router.post('/refresh',      ctrl.refreshAnalytics);
router.get('/insights',      ctrl.listInsights);
router.patch('/insights/:id/dismiss', ctrl.dismissInsight);
router.get('/risks',         ctrl.listRiskAlerts);
router.patch('/risks/:id/dismiss',    ctrl.dismissRiskAlert);

module.exports = router;
