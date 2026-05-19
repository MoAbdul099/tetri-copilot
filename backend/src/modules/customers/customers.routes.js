const { Router } = require('express');
const multer = require('multer');
const { protect } = require('../../middleware/requireAuth');
const requireWorkspace = require('../../middleware/requireWorkspace');
const ctrl = require('./customers.controller');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

const router = Router();
router.use(protect, requireWorkspace);

// Static routes before /:id
router.get('/export', ctrl.exportCustomers);
router.post('/import', upload.single('file'), ctrl.importCustomers);
router.get('/tags', ctrl.listTags);
router.post('/tags', ctrl.createTag);
router.put('/tags/:tagId', ctrl.updateTag);
router.delete('/tags/:tagId', ctrl.deleteTag);

// Customer CRUD
router.get('/', ctrl.list);
router.post('/', ctrl.create);
router.get('/:id', ctrl.getById);
router.put('/:id', ctrl.update);
router.patch('/:id/archive', ctrl.archive);
router.patch('/:id/restore', ctrl.restore);

// Contacts
router.get('/:id/contacts', ctrl.listContacts);
router.post('/:id/contacts', ctrl.createContact);
router.put('/:id/contacts/:contactId', ctrl.updateContact);
router.patch('/:id/contacts/:contactId/set-primary', ctrl.setPrimaryContact);
router.patch('/:id/contacts/:contactId/deactivate', ctrl.deactivateContact);
router.patch('/:id/contacts/:contactId/reactivate', ctrl.reactivateContact);
router.delete('/:id/contacts/:contactId', ctrl.deleteContact);

// Notes
router.get('/:id/notes', ctrl.listNotes);
router.post('/:id/notes', ctrl.createNote);
router.put('/notes/:noteId', ctrl.updateNote);
router.delete('/notes/:noteId', ctrl.deleteNote);

// Attachments
router.get('/attachments/:attachmentId/download', ctrl.downloadAttachment);
router.get('/:id/attachments', ctrl.listAttachments);
router.post('/:id/attachments', upload.single('file'), ctrl.uploadAttachment);
router.put('/attachments/:attachmentId', ctrl.updateAttachment);
router.delete('/attachments/:attachmentId', ctrl.deleteAttachment);

// Tag assignments
router.post('/:id/tags', ctrl.assignTag);
router.delete('/:id/tags/:tagId', ctrl.removeTag);

module.exports = router;
