const router = require('express').Router();
const { protect } = require('../../middleware/requireAuth');
const requireWorkspace = require('../../middleware/requireWorkspace');
const ctrl = require('./receivables.controller');

router.use(protect, requireWorkspace);

router.get('/summary',          ctrl.getSummary);
router.get('/aging',            ctrl.getAging);
router.get('/top-debtors',      ctrl.getTopDebtors);
router.get('/customers',        ctrl.getCustomers);
router.get('/customers/:id',    ctrl.getCustomerProfile);

module.exports = router;
