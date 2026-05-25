const router = require('express').Router();
const ctrl   = require('./announcements.controller');
const { protect }      = require('../../middleware/requireAuth');
const requireWorkspace = require('../../middleware/requireWorkspace');

router.use(protect, requireWorkspace);

router.get('/active',      ctrl.getActive);
router.get('/stats',       ctrl.getStats);
router.get('/',            ctrl.list);
router.post('/',           ctrl.create);
router.get('/:id',         ctrl.getById);
router.put('/:id',         ctrl.update);
router.post('/:id/publish',ctrl.publish);
router.post('/:id/archive',ctrl.archive);
router.delete('/:id',      ctrl.remove);
router.post('/:id/read',   ctrl.markRead);

module.exports = router;
