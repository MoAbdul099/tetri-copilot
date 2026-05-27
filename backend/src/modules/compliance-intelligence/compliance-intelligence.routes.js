const router = require('express').Router();
const { protect } = require('../../middleware/requireAuth');
const requireWorkspace = require('../../middleware/requireWorkspace');
const ctrl = require('./compliance-intelligence.controller');

router.use(protect, requireWorkspace);

router.get('/',                   ctrl.getDashboard);
router.post('/analyze',           ctrl.analyze);
router.get('/risks',              ctrl.listRisks);
router.get('/recommendations',    ctrl.listRecommendations);
router.get('/history',            ctrl.getHistory);
router.post('/insights',          ctrl.generateAiInsights);
router.post('/executive-summary', ctrl.generateExecutiveSummary);

module.exports = router;
