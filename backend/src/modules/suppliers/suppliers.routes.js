const router = require('express').Router();
const { protect } = require('../../middleware/requireAuth');
const requireWorkspace = require('../../middleware/requireWorkspace');
const ctrl = require('./suppliers.controller');

router.use(protect, requireWorkspace);

router.get('/',              ctrl.list);
router.post('/',             ctrl.create);
router.get('/:id',           ctrl.getOne);
router.patch('/:id',         ctrl.update);
router.post('/:id/archive',  ctrl.archive);
router.post('/:id/restore',  ctrl.restore);

module.exports = router;
