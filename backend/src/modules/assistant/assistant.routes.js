const { Router } = require('express');
const { protect }        = require('../../middleware/requireAuth');
const requireWorkspace   = require('../../middleware/requireWorkspace');
const ctrl               = require('./assistant.controller');

const router = Router();

router.use(protect, requireWorkspace);

// Sessions
router.get('/sessions',          ctrl.listSessions);
router.post('/sessions',         ctrl.createSession);
router.get('/sessions/:id',      ctrl.getSession);
router.delete('/sessions/:id',   ctrl.archiveSession);

// Chat
router.post('/sessions/:id/chat', ctrl.chat);

// Messages
router.get('/sessions/:sessionId/messages', ctrl.getMessages);

// Feedback
router.post('/feedback', ctrl.submitFeedback);

// Suggestions & quick prompts
router.get('/suggestions',    ctrl.getSuggestions);
router.get('/quick-prompts',  ctrl.getQuickPrompts);

// Capabilities
router.get('/capabilities', ctrl.listCapabilities);

module.exports = router;
