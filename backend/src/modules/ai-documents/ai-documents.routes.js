const express = require('express');
const { protect }      = require('../../middleware/requireAuth');
const requireWorkspace = require('../../middleware/requireWorkspace');
const ctrl = require('./ai-documents.controller');

const router = express.Router();

router.use(protect, requireWorkspace);

// Meta + generation (static — before /:id)
router.get('/categories',     ctrl.getCategories);
router.post('/generate',      ctrl.generate);
router.post('/save',          ctrl.save);

// List + create
router.get('/',               ctrl.list);

// Per-document: static sub-routes first, then :id
router.get('/:id/versions',             ctrl.getVersions);
router.get('/:id/versions/:versionId',  ctrl.getVersion);
router.post('/:id/restore/:versionId',  ctrl.restoreVersion);
router.post('/:id/compare',             ctrl.compareVersions);
router.post('/:id/enhance',             ctrl.enhance);
router.post('/:id/transform-tone',      ctrl.transformTone);
router.post('/:id/summary',             ctrl.generateSummary);
router.post('/:id/quality-review',      ctrl.qualityReview);
router.post('/:id/export/pdf',          ctrl.exportPdf);
router.post('/:id/export/docx',         ctrl.exportDocx);
router.post('/:id/export/html',         ctrl.exportHtml);
router.post('/:id/duplicate',           ctrl.duplicate);
router.get('/:id/exports',              ctrl.getExports);
router.post('/:id/regenerate',          ctrl.regenerate);

// CRUD
router.get('/:id',            ctrl.getOne);
router.put('/:id',            ctrl.update);
router.delete('/:id',         ctrl.remove);

module.exports = router;
