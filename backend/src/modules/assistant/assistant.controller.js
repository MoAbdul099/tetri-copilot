const { success, error } = require('../../utils/response');
const svc        = require('./assistant.service');
const suggSvc    = require('./suggestion.service');
const repo       = require('./assistant.repository');
const actionRepo = require('./action.repository');

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

async function renameSession(req, res) {
  try {
    const session = await svc.renameSession(req.params.id, req.workspaceId, req.body.title);
    return success(res, session, 'Session renamed');
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

async function restoreSession(req, res) {
  try {
    const session = await svc.restoreSession(req.params.id, req.workspaceId);
    return success(res, session, 'Session restored');
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
}

async function deleteSession(req, res) {
  try {
    await svc.deleteSession(req.params.id, req.workspaceId);
    return success(res, null, 'Session deleted');
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
}

// ── Export ────────────────────────────────────────────────────────────────────

async function exportSession(req, res) {
  try {
    const format   = ['md', 'txt'].includes(req.query.format) ? req.query.format : 'txt';
    const exported = await svc.exportSession(req.params.id, req.workspaceId, format);
    res.setHeader('Content-Type',        exported.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${exported.filename}"`);
    return res.send(exported.content);
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
}

// ── Chat (non-streaming) ──────────────────────────────────────────────────────

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

// ── Streaming chat (SSE) ──────────────────────────────────────────────────────

async function streamChat(req, res) {
  const { message } = req.body;
  if (!message?.trim()) {
    return res.status(400).json({ success: false, error: 'Message is required' });
  }

  res.setHeader('Content-Type',  'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection',    'keep-alive');
  res.flushHeaders();

  const send = (data) => {
    if (!res.writableEnded) res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  try {
    const stream = svc.chatStream({
      sessionId:   req.params.id,
      workspaceId: req.workspaceId,
      userId:      req.user.id,
      role:        req.role,
      userMessage: message.trim(),
    });

    for await (const event of stream) {
      send(event);
      if (event.type === 'done' || event.type === 'error') break;
    }
  } catch (err) {
    send({ type: 'error', message: err.message || 'Stream failed' });
  } finally {
    if (!res.writableEnded) res.end();
  }
}

// ── Regenerate ────────────────────────────────────────────────────────────────

async function regenerateResponse(req, res) {
  try {
    const result = await svc.regenerateResponse({
      sessionId:   req.params.id,
      workspaceId: req.workspaceId,
      userId:      req.user.id,
      role:        req.role,
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

// ── Recommendations ───────────────────────────────────────────────────────────

async function getRecommendations(req, res) {
  try {
    const recs = await svc.getRecommendations(req.workspaceId);
    return success(res, recs);
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
}

async function dismissRecommendation(req, res) {
  try {
    await svc.dismissRecommendation(req.params.id, req.workspaceId);
    return success(res, null, 'Recommendation dismissed');
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
}

async function refreshRecommendations(req, res) {
  try {
    const recs = await svc.refreshRecommendations(req.workspaceId);
    return success(res, recs, 'Recommendations refreshed');
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
}

// ── Action history & metrics ──────────────────────────────────────────────────

async function getActionHistory(req, res) {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const history = await actionRepo.getActionHistory(req.workspaceId, limit);
    return success(res, history);
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
}

async function getActionMetrics(req, res) {
  try {
    const metrics = await actionRepo.getActionMetrics(req.workspaceId);
    return success(res, metrics);
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
}

// ── File attachments ──────────────────────────────────────────────────────────

async function uploadFile(req, res) {
  try {
    if (!req.file) return error(res, 'No file provided', 400);
    const ref = await svc.uploadSessionFile({
      workspaceId: req.workspaceId,
      sessionId:   req.params.id,
      userId:      req.user.id,
      file:        req.file,
    });
    return success(res, ref, 'File uploaded', 201);
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
}

async function listSessionFiles(req, res) {
  try {
    const files = await svc.listSessionFiles(req.workspaceId, req.params.id);
    return success(res, files);
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
}

async function removeFile(req, res) {
  try {
    await svc.removeSessionFile(req.params.fileId, req.params.id, req.workspaceId);
    return success(res, null, 'File removed');
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
  createSession, listSessions, getSession,
  renameSession, archiveSession, restoreSession, deleteSession,
  exportSession,
  chat, streamChat, regenerateResponse,
  getMessages, submitFeedback,
  getSuggestions, getQuickPrompts,
  listCapabilities,
  getRecommendations, dismissRecommendation, refreshRecommendations,
  getActionHistory, getActionMetrics,
  uploadFile, listSessionFiles, removeFile,
};
