const convoSvc = require('./conversation.service');
const { success, error } = require('../../utils/response');

async function listSessions(req, res) {
  try {
    const { featureCode, status } = req.query;
    const sessions = await convoSvc.listSessions({
      workspaceId: req.workspaceId,
      userId:      req.userId,
      featureCode,
      status,
    });
    success(res, sessions);
  } catch (e) { error(res, e.message, e.status || 500); }
}

async function createSession(req, res) {
  try {
    const { featureCode, title } = req.body;
    const session = await convoSvc.createSession({
      workspaceId: req.workspaceId,
      userId:      req.userId,
      featureCode,
      title,
    });
    success(res, session, 'Session created', 201);
  } catch (e) { error(res, e.message, e.status || 500); }
}

async function getSession(req, res) {
  try {
    const session = await convoSvc.getSession(req.params.id, req.workspaceId);
    success(res, session);
  } catch (e) { error(res, e.message, e.status || 500); }
}

async function archiveSession(req, res) {
  try {
    const session = await convoSvc.archiveSession(req.params.id, req.workspaceId);
    success(res, session, 'Session archived');
  } catch (e) { error(res, e.message, e.status || 500); }
}

async function chat(req, res) {
  try {
    const { message, options } = req.body;
    if (!message?.trim()) return error(res, 'message is required', 400);
    const result = await convoSvc.chat({
      sessionId:   req.params.id,
      workspaceId: req.workspaceId,
      userId:      req.userId,
      userMessage: message.trim(),
      options:     options || {},
    });
    success(res, result);
  } catch (e) { error(res, e.message, e.status || 500); }
}

module.exports = { listSessions, createSession, getSession, archiveSession, chat };
