const express = require('express');
const requireWorkspace = require('../../middleware/requireWorkspace');
const ctrl = require('./budgets.controller');

const router = express.Router();
router.use(requireWorkspace);

router.get('/',           ctrl.list);
router.get('/monitoring', ctrl.monitor);
router.get('/:id',        ctrl.getOne);
router.post('/',          ctrl.create);
router.put('/:id',        ctrl.update);
router.delete('/:id',     ctrl.remove);

module.exports = router;
