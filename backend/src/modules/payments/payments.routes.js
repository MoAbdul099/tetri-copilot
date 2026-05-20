const router = require('express').Router();
const { protect } = require('../../middleware/requireAuth');
const requireWorkspace = require('../../middleware/requireWorkspace');
const ctrl = require('./payments.controller');

router.use(protect, requireWorkspace);

router.get('/stats',            ctrl.getStats);
router.get('/',                 ctrl.list);
router.post('/',                ctrl.record);
router.get('/credits',          ctrl.listCredits);
router.post('/credits/:id/apply', ctrl.applyCredit);
router.get('/:id',              ctrl.getOne);
router.patch('/:id',            ctrl.update);
router.post('/:id/post',        ctrl.post);
router.post('/:id/reverse',     ctrl.reverse);
router.post('/:id/void',        ctrl.voidPay);
router.post('/:id/allocate',    ctrl.allocate);
router.post('/:id/auto-allocate', ctrl.autoAlloc);
router.delete('/:id/allocations/:allocationId', ctrl.removeAlloc);
router.post('/:id/credits',     ctrl.createCredit);
router.post('/:id/attachments', ctrl.uploadAttachment);
router.delete('/:id/attachments/:attachmentId', ctrl.deleteAttachment);

module.exports = router;
