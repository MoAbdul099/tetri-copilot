const router = require('express').Router();
const { protect } = require('../../middleware/requireAuth');
const requireWorkspace = require('../../middleware/requireWorkspace');
const ctrl = require('./collections.controller');

router.use(protect, requireWorkspace);

router.get('/queue',         ctrl.getQueue);

router.get('/promises',      ctrl.listPromises);
router.post('/promises',     ctrl.createPromise);
router.get('/promises/:id',  ctrl.getPromise);
router.patch('/promises/:id', ctrl.updatePromise);
router.delete('/promises/:id', ctrl.deletePromise);

router.get('/',              ctrl.listActivities);
router.post('/',             ctrl.createActivity);
router.get('/:id',           ctrl.getActivity);
router.patch('/:id',         ctrl.updateActivity);
router.delete('/:id',        ctrl.deleteActivity);

module.exports = router;
