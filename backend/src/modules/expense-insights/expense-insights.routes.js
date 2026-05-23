const express = require('express');
const { protect } = require('../../middleware/requireAuth');
const requireWorkspace = require('../../middleware/requireWorkspace');
const ctrl = require('./expense-insights.controller');

const router = express.Router();
router.use(protect, requireWorkspace);

router.get('/dashboard',             ctrl.getDashboard);
router.get('/analytics',             ctrl.getAnalytics);
router.get('/insights',              ctrl.getInsights);
router.post('/insights/generate',    ctrl.generateInsights);
router.get('/forecast',              ctrl.getForecast);
router.get('/anomalies',             ctrl.getAnomalies);
router.post('/anomalies/detect',     ctrl.detectAnomalies);
router.post('/anomalies/:id/review', ctrl.reviewAnomaly);
router.post('/check-duplicates',     ctrl.checkDuplicates);
router.post('/categorize',           ctrl.suggestCategory);
router.post('/search',               ctrl.nlSearch);
router.get('/recommendations',       ctrl.getRecommendations);

module.exports = router;
