const express = require('express');
const multer  = require('multer');
const { protect } = require('../../middleware/requireAuth');
const requireWorkspace = require('../../middleware/requireWorkspace');
const ctrl = require('./invoices.controller');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

router.use(protect, requireWorkspace);

// Stats
router.get('/stats', ctrl.getStats);

// AI
router.post('/suggest-description', ctrl.suggestDescription);

// Core CRUD
router.get('/',    ctrl.listInvoices);
router.post('/',   ctrl.createInvoice);
router.get('/:id', ctrl.getInvoice);
router.put('/:id', ctrl.updateInvoice);
router.delete('/:id', ctrl.deleteInvoice);

// Status transitions
router.post('/:id/issue',     ctrl.issueInvoice);
router.post('/:id/cancel',    ctrl.cancelInvoice);
router.post('/:id/void',      ctrl.voidInvoice);
router.post('/:id/duplicate', ctrl.duplicateInvoice);

// PDF + email
router.get('/:id/pdf',  ctrl.getInvoicePdf);
router.post('/:id/send', ctrl.sendInvoice);

// Attachments
router.get('/:id/attachments',    ctrl.listAttachments);
router.post('/:id/attachments',   upload.single('file'), ctrl.uploadAttachment);
router.get('/:id/attachments/:attachmentId/download',  ctrl.downloadAttachment);
router.delete('/:id/attachments/:attachmentId',        ctrl.deleteAttachment);

module.exports = router;
