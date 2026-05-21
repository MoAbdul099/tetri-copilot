const router = require('express').Router();
const { protect } = require('../../middleware/requireAuth');
const requireWorkspace = require('../../middleware/requireWorkspace');
const ctrl = require('./expense-categories.controller');

router.use(protect, requireWorkspace);

router.get('/',               ctrl.list);
router.post('/',              ctrl.create);
router.post('/seed-defaults', ctrl.seedDefaults);
router.patch('/:id',          ctrl.update);
router.post('/:id/archive',   ctrl.archive);
router.post('/:id/restore',   ctrl.restore);

module.exports = router;
