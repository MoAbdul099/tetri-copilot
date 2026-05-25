const router = require('express').Router();
const ctrl = require('./dashboard.controller');
const { protect }      = require('../../middleware/requireAuth');
const requireWorkspace = require('../../middleware/requireWorkspace');

router.use(protect, requireWorkspace);

router.get('/summary',       ctrl.getSummary);
router.get('/financial',     ctrl.getFinancial);
router.get('/receivables',   ctrl.getReceivables);
router.get('/expenses',      ctrl.getExpenses);
router.get('/compliance',    ctrl.getCompliance);
router.get('/notifications', ctrl.getNotifications);
router.get('/activity',      ctrl.getActivity);
router.get('/subscription',  ctrl.getSubscription);
router.get('/tasks',         ctrl.getUpcomingTasks);
router.get('/preferences',   ctrl.getPreferences);
router.put('/preferences',   ctrl.updatePreferences);

module.exports = router;
