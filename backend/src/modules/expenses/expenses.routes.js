const router = require('express').Router();
const { protect } = require('../../middleware/requireAuth');
const requireWorkspace = require('../../middleware/requireWorkspace');
const ctrl    = require('./expenses.controller');
const aiRoutes = require('./expense.ai.routes');

router.use(protect, requireWorkspace);

// AI routes MUST come before /:id to avoid path collision
router.use('/ai', aiRoutes);

router.get('/',          ctrl.list);
router.post('/',         ctrl.create);
router.get('/stats',     ctrl.getStats);
router.get('/export/csv',  ctrl.exportCsv);
router.get('/export/xlsx', ctrl.exportXlsx);
router.get('/:id',       ctrl.getOne);
router.patch('/:id',     ctrl.update);
router.delete('/:id',    ctrl.remove);
router.post('/:id/duplicate', ctrl.duplicate);

router.post('/:id/attachments',                     ...ctrl.uploadAttachment);
router.delete('/:id/attachments/:attachmentId',     ctrl.deleteAttachment);
router.get('/:id/attachments/:attachmentId/download', ctrl.serveAttachment);

module.exports = router;
