const router = require('express').Router();
const { protect } = require('../../middleware/requireAuth');
const requireWorkspace = require('../../middleware/requireWorkspace');
const ctrl = require('./expense-approvals.controller');

router.use(protect, requireWorkspace);

// Expense action sub-routes (this router is mounted at /api/v1/expenses)
router.post('/:id/submit',   ctrl.submit);
router.post('/:id/approve',  ctrl.approve);
router.post('/:id/reject',   ctrl.reject);
router.post('/:id/return',   ctrl.returnForCorrection);
router.post('/:id/withdraw', ctrl.withdraw);
router.get('/:id/approval-history', ctrl.getApprovalHistory);

module.exports = router;
