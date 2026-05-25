const router = require('express').Router();
const ctrl   = require('./reminder-rules.controller');
const { protect }      = require('../../middleware/requireAuth');
const requireWorkspace = require('../../middleware/requireWorkspace');

router.use(protect, requireWorkspace);

router.get('/stats', ctrl.stats);
router.get('/',      ctrl.list);
router.post('/',     ctrl.create);
router.get('/:id',   ctrl.getById);
router.put('/:id',   ctrl.update);
router.delete('/:id',ctrl.remove);

module.exports = router;
