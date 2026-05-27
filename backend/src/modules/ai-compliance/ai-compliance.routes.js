const express = require('express');
const { protect }      = require('../../middleware/requireAuth');
const requireWorkspace = require('../../middleware/requireWorkspace');
const ctrl = require('./ai-compliance.controller');

const router = express.Router();
router.use(protect, requireWorkspace);

// Utility (static — before /:id)
router.get('/suggested-questions', ctrl.getSuggestedQuestions);
router.get('/context-summary',     ctrl.getContextSummary);

// Feedback
router.post('/feedback', ctrl.submitFeedback);

// Conversations
router.get('/',    ctrl.listConversations);
router.post('/',   ctrl.createConversation);

// Per-conversation (static sub-routes before /:id CRUD)
router.get('/:id/export',         ctrl.exportConversation);
router.patch('/:id/archive',      ctrl.archiveConversation);
router.post('/:id/chat',          ctrl.chat);

// CRUD
router.get('/:id',    ctrl.getConversation);
router.patch('/:id',  ctrl.updateConversation);
router.delete('/:id', ctrl.deleteConversation);

module.exports = router;
