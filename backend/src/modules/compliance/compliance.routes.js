const express = require('express');
const { protect } = require('../../middleware/requireAuth');
const requireWorkspace = require('../../middleware/requireWorkspace');
const ctrl = require('./compliance.controller');

const router = express.Router();
router.use(protect, requireWorkspace);

// Reference data
router.get('/jurisdictions',        ctrl.listJurisdictions);
router.get('/authorities',          ctrl.listAuthorities);
router.get('/categories',           ctrl.listCategories);
router.post('/categories',          ctrl.createCategory);
router.put('/categories/:id',       ctrl.updateCategory);
router.delete('/categories/:id',    ctrl.deleteCategory);
router.get('/packs',                ctrl.listPacks);
router.get('/packs/:id',            ctrl.getPack);
router.post('/packs/:id/install',   ctrl.installPack);

// Templates
router.get('/templates',            ctrl.listTemplates);
router.post('/templates',           ctrl.createTemplate);
router.get('/templates/:id',        ctrl.getTemplate);
router.put('/templates/:id',        ctrl.updateTemplate);
router.delete('/templates/:id',     ctrl.deleteTemplate);
router.post('/templates/:id/generate', ctrl.generateOccurrences);

// Occurrences
router.get('/occurrences',                              ctrl.listOccurrences);
router.get('/occurrences/:id',                          ctrl.getOccurrence);
router.put('/occurrences/:id',                          ctrl.updateOccurrence);
router.post('/occurrences/:id/submit',                  ctrl.recordSubmission);
router.post('/occurrences/:id/comments',                ctrl.addComment);
router.delete('/occurrences/:id/comments/:commentId',   ctrl.deleteComment);

// Calendar
router.get('/calendar',             ctrl.getCalendarEvents);

// Stats & recommendations
router.get('/stats',                ctrl.getStats);
router.get('/recommendations',      ctrl.getRecommendations);

module.exports = router;
