const express = require('express');
const { protect }      = require('../../middleware/requireAuth');
const requireWorkspace = require('../../middleware/requireWorkspace');
const ctrl = require('./document-templates.controller');

const router = express.Router();
router.use(protect, requireWorkspace);

router.get('/meta',            ctrl.getMeta);
router.get('/branding',        ctrl.getBranding);
router.put('/branding',        ctrl.upsertBranding);
router.post('/ai-assist',      ctrl.aiAssist);
router.get('/',                ctrl.list);
router.post('/',               ctrl.create);
router.get('/:id',             ctrl.getOne);
router.put('/:id',             ctrl.update);
router.delete('/:id',          ctrl.remove);
router.post('/:id/clone',      ctrl.clone);
router.post('/:id/archive',    ctrl.archive);
router.get('/:id/preview',     ctrl.preview);
router.post('/:id/generate',   ctrl.generate);

module.exports = router;
