const svc = require('./ai-compliance.service');
const { success, error } = require('../../utils/response');
const prisma = require('../../lib/prisma');

const listConversations = async (req, res, next) => {
  try {
    const items = await svc.listConversations(req.workspaceId, req.user.id, req.query);
    return success(res, { conversations: items });
  } catch (e) { next(e); }
};

const createConversation = async (req, res, next) => {
  try {
    const conv = await svc.createConversation({ workspaceId: req.workspaceId, userId: req.user.id, title: req.body.title });
    return success(res, conv, 'Conversation created', 201);
  } catch (e) { next(e); }
};

const getConversation = async (req, res, next) => {
  try {
    const conv = await svc.getConversation(req.params.id, req.workspaceId);
    return success(res, conv);
  } catch (e) {
    if (e.status === 404) return error(res, 'Conversation not found', 404);
    next(e);
  }
};

const updateConversation = async (req, res, next) => {
  try {
    const conv = await svc.updateConversation(req.params.id, req.workspaceId, req.body);
    return success(res, conv);
  } catch (e) {
    if (e.status === 404) return error(res, 'Conversation not found', 404);
    next(e);
  }
};

const deleteConversation = async (req, res, next) => {
  try {
    await svc.deleteConversation(req.params.id, req.workspaceId);
    return success(res, null, 'Conversation deleted');
  } catch (e) {
    if (e.status === 404) return error(res, 'Conversation not found', 404);
    next(e);
  }
};

const archiveConversation = async (req, res, next) => {
  try {
    const conv = await svc.updateConversation(req.params.id, req.workspaceId, { status: 'archived' });
    return success(res, conv, 'Archived');
  } catch (e) {
    if (e.status === 404) return error(res, 'Conversation not found', 404);
    next(e);
  }
};

const chat = async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message?.trim()) return error(res, 'message is required', 400);
    const workspace = await prisma.workspace.findUnique({ where: { id: req.workspaceId }, select: { name: true } }).catch(() => null);
    const result = await svc.chat({
      conversationId: req.params.id,
      workspaceId:    req.workspaceId,
      userId:         req.user.id,
      role:           req.user.role,
      message:        message.trim(),
      workspace,
    });
    return success(res, result);
  } catch (e) {
    if (e.status === 400 || e.status === 404) return error(res, e.message, e.status);
    next(e);
  }
};

const submitFeedback = async (req, res, next) => {
  try {
    const { messageId, feedbackType, comment } = req.body;
    if (!messageId || !feedbackType) return error(res, 'messageId and feedbackType required', 400);
    const fb = await svc.submitFeedback({ messageId, userId: req.user.id, feedbackType, comment });
    return success(res, fb, 'Feedback recorded');
  } catch (e) {
    if (e.status === 400) return error(res, e.message, 400);
    next(e);
  }
};

const exportConversation = async (req, res, next) => {
  try {
    const format = req.query.format || 'md';
    const { content, filename, mimeType } = await svc.exportConversation(req.params.id, req.workspaceId, format);
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(content);
  } catch (e) {
    if (e.status === 404) return error(res, 'Conversation not found', 404);
    next(e);
  }
};

const getContextSummary = async (req, res, next) => {
  try {
    const result = await svc.getContextSummary(req.workspaceId);
    return success(res, result);
  } catch (e) { next(e); }
};

const getSuggestedQuestions = async (req, res) => {
  return success(res, { questions: svc.SUGGESTED_QUESTIONS });
};

module.exports = {
  listConversations, createConversation, getConversation,
  updateConversation, deleteConversation, archiveConversation,
  chat, submitFeedback, exportConversation,
  getContextSummary, getSuggestedQuestions,
};
