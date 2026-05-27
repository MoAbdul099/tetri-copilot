const express = require('express');
const { protect }      = require('../../middleware/requireAuth');
const requireWorkspace = require('../../middleware/requireWorkspace');
const ctrl = require('./ai-documents.controller');

const router = express.Router();

router.use(protect, requireWorkspace);

router.get('/categories',     ctrl.getCategories);
router.post('/generate',      ctrl.generate);
router.post('/save',          ctrl.save);
router.get('/',               ctrl.list);
router.get('/:id',            ctrl.getOne);
router.put('/:id',            ctrl.update);
router.delete('/:id',         ctrl.remove);
router.post('/:id/regenerate', ctrl.regenerate);

module.exports = router;
