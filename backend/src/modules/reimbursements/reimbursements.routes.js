const router = require('express').Router();
const { protect } = require('../../middleware/requireAuth');
const requireWorkspace = require('../../middleware/requireWorkspace');
const ctrl = require('./reimbursements.controller');

router.use(protect, requireWorkspace);

router.get('/dashboard',    ctrl.getDashboard);
router.get('/',             ctrl.list);
router.post('/',            ctrl.create);
router.get('/:id',          ctrl.getOne);
router.post('/:id/approve', ctrl.approve);
router.post('/:id/reject',  ctrl.reject);
router.post('/:id/payments', ctrl.recordPayment);
router.delete('/:id',       ctrl.cancel);

module.exports = router;
