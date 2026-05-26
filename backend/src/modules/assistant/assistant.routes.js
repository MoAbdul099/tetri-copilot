const { Router }       = require('express');
const multer           = require('multer');
const { protect }      = require('../../middleware/requireAuth');
const requireWorkspace = require('../../middleware/requireWorkspace');
const ctrl             = require('./assistant.controller');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

const router = Router();

router.use(protect, requireWorkspace);

// Sessions — CRUD
router.get('/sessions',                             ctrl.listSessions);
router.post('/sessions',                            ctrl.createSession);
router.get('/sessions/:id',                         ctrl.getSession);
router.patch('/sessions/:id',                       ctrl.renameSession);
router.delete('/sessions/:id',                      ctrl.deleteSession);

// Session state transitions
router.patch('/sessions/:id/archive',               ctrl.archiveSession);
router.patch('/sessions/:id/restore',               ctrl.restoreSession);

// Export
router.get('/sessions/:id/export',                  ctrl.exportSession);

// Chat
router.post('/sessions/:id/chat',                   ctrl.chat);
router.post('/sessions/:id/stream',                 ctrl.streamChat);
router.post('/sessions/:id/regenerate',             ctrl.regenerateResponse);

// Messages
router.get('/sessions/:sessionId/messages',         ctrl.getMessages);

// File attachments
router.post('/sessions/:id/files',                  upload.single('file'), ctrl.uploadFile);
router.get('/sessions/:id/files',                   ctrl.listSessionFiles);
router.delete('/sessions/:id/files/:fileId',        ctrl.removeFile);

// Feedback
router.post('/feedback',                            ctrl.submitFeedback);

// Suggestions & quick prompts
router.get('/suggestions',                          ctrl.getSuggestions);
router.get('/quick-prompts',                        ctrl.getQuickPrompts);

// Capabilities
router.get('/capabilities',                         ctrl.listCapabilities);

module.exports = router;
