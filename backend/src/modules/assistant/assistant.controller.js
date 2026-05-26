const { success, error } = require('../../utils/response');
const svc        = require('./assistant.service');
const suggSvc    = require('./suggestion.service');
const repo       = require('./assistant.repository');

// ── Sessions ──────────────────────────────────────────────────────────────────

async function createSession(req, res) {
  try {
    const session = await svc.createSession({
      workspaceId: req.workspaceId,
      userId:      req.user.id,
      title:       req.body.title,
    });
    return success(res, session, 'Session created', 201);
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
}

async function listSessions(req, res) {
  try {
    const { status, search } = req.query;
    const sessions = search
      ? await svc.searchSessions({ workspaceId: req.workspaceId, userId: req.user.id, query: search })
      : await svc.listSessions({ workspaceId: req.workspaceId, userId: req.user.id, status });
    return success(res, sessions);
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
}

async function getSession(req, res) {
  try {
    const session = await svc.getSession(req.params.id, req.workspaceId);
    return success(res, session);
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
}

async function archiveSession(req, res) {
  try {
    const session = await svc.archiveSession(req.params.id, req.workspaceId);
    return success(res, session, 'Session archived');
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
}

// ── Chat ──────────────────────────────────────────────────────────────────────

async function chat(req, res) {
  try {
    const { message } = req.body;
    if (!message?.trim()) return error(res, 'Message is required', 400);

    const result = await svc.chat({
      sessionId:   req.params.id,
      workspaceId: req.workspaceId,
      userId:      req.user.id,
      role:        req.role,
      userMessage: message.trim(),
    });
    return success(res, result);
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
}

// ── Messages ──────────────────────────────────────────────────────────────────

async function getMessages(req, res) {
  try {
    await svc.getSession(req.params.sessionId, req.workspaceId);
    const messages = await repo.getMessages(req.params.sessionId);
    return success(res, messages);
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
}

// ── Feedback ──────────────────────────────────────────────────────────────────

async function submitFeedback(req, res) {
  try {
    const { messageId, rating, comment } = req.body;
    if (!messageId || !rating) return error(res, 'messageId and rating are required', 400);

    const fb = await svc.submitFeedback({ messageId, userId: req.user.id, rating, comment });
    return success(res, fb, 'Feedback submitted', 201);
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
}

// ── Suggestions ───────────────────────────────────────────────────────────────

async function getSuggestions(req, res) {
  try {
    const suggestions = await suggSvc.generateSuggestions(req.workspaceId);
    return success(res, suggestions);
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
}

async function getQuickPrompts(req, res) {
  try {
    const prompts = await suggSvc.getQuickPrompts();
    return success(res, prompts);
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
}

// ── Capabilities ──────────────────────────────────────────────────────────────

async function listCapabilities(req, res) {
  try {
    const caps = await repo.listCapabilities();
    return success(res, caps);
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
}

module.exports = {
  createSession, listSessions, getSession, archiveSession,
  chat, getMessages,
  submitFeedback,
  getSuggestions, getQuickPrompts,
  listCapabilities,
};
