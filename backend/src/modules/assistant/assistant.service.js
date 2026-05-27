const prisma      = require('../../lib/prisma');
const repo        = require('./assistant.repository');
const contextSvc  = require('./context.service');
const actionSvc   = require('./action.service');
const recSvc      = require('./recommendation.service');
const fileSvc     = require('./file.context.service');
const governance  = require('./governance.service');
const aiSvc       = require('../ai/ai.service');
const processor   = require('../ai/response.processor');

const FEATURE = 'workspace_assistant';

// ── Context builder ───────────────────────────────────────────────────────────

async function buildContext({ workspaceId, userId, role, resolvedData, history }) {
  const [workspace, company] = await Promise.all([
    prisma.workspace.findUnique({ where: { id: workspaceId }, select: { name: true } }).catch(() => null),
    prisma.company.findFirst({ where: { workspaceId }, select: { name: true, industry: true, country: true } }).catch(() => null),
  ]);

  const today = new Date().toISOString().slice(0, 10);
  const systemLines = [
    `You are Tetri Copilot, an intelligent AI assistant for ${company?.name || workspace?.name || 'this workspace'}.`,
    `Today is ${today}.`,
    `User role: ${role || 'member'}.`,
    ...(company?.industry ? [`Industry: ${company.industry}.`] : []),
    '',
    'You are operating in READ-ONLY mode. You can answer questions about workspace data but cannot create, update, delete, or trigger any actions.',
    'If the user asks you to perform a write action, politely explain you are read-only and direct them to the relevant screen.',
    'Keep responses concise, professional, and factual. Use markdown formatting where helpful.',
  ];

  if (resolvedData) {
    systemLines.push('', '[LIVE WORKSPACE DATA]', resolvedData, '[END WORKSPACE DATA]', '', 'Base your response on the workspace data provided above.');
  }

  const messages = [{ role: 'system', content: systemLines.join('\n') }];
  for (const msg of history) {
    messages.push({ role: msg.senderType === 'user' ? 'user' : 'assistant', content: msg.message });
  }

  return messages;
}

// ── Sessions ──────────────────────────────────────────────────────────────────

async function createSession({ workspaceId, userId, title }) {
  return repo.createSession({
    workspaceId,
    userId,
    title: title || `New Conversation`,
    status: 'active',
  });
}

async function listSessions({ workspaceId, userId, status }) {
  return repo.listSessions({ workspaceId, userId, status });
}

async function searchSessions({ workspaceId, userId, query }) {
  return repo.searchSessions(workspaceId, userId, query);
}

async function getSession(id, workspaceId) {
  const session = await repo.getSession(id, workspaceId);
  if (!session) throw Object.assign(new Error('Session not found'), { status: 404 });
  return session;
}

async function renameSession(id, workspaceId, title) {
  await getSession(id, workspaceId);
  if (!title?.trim()) throw Object.assign(new Error('Title is required'), { status: 400 });
  return repo.updateSession(id, { title: title.trim() });
}

async function archiveSession(id, workspaceId) {
  await getSession(id, workspaceId);
  return repo.updateSession(id, { status: 'archived' });
}

async function restoreSession(id, workspaceId) {
  const session = await repo.getSession(id, workspaceId);
  if (!session) throw Object.assign(new Error('Session not found'), { status: 404 });
  return repo.updateSession(id, { status: 'active' });
}

async function deleteSession(id, workspaceId) {
  const session = await repo.getSession(id, workspaceId);
  if (!session) throw Object.assign(new Error('Session not found'), { status: 404 });
  return repo.deleteSession(id);
}

// ── Export ────────────────────────────────────────────────────────────────────

async function exportSession(id, workspaceId, format = 'txt') {
  const session  = await getSession(id, workspaceId);
  const messages = await repo.getMessages(id);
  const title    = session.title || 'Conversation';
  const date     = new Date().toLocaleDateString();

  if (format === 'md') {
    const lines = [`# ${title}`, ``, `*Exported: ${date}*`, ``];
    for (const msg of messages) {
      const speaker = msg.senderType === 'user' ? '**You**' : '**Tetri Copilot**';
      const time    = new Date(msg.createdAt).toLocaleString();
      lines.push(`### ${speaker}  `, `*${time}*`, ``, msg.message, ``, `---`, ``);
    }
    return {
      content:  lines.join('\n'),
      filename: `${title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${id.slice(0, 8)}.md`,
      mimeType: 'text/markdown',
    };
  }

  // TXT
  const lines = [title, '='.repeat(Math.min(title.length, 60)), `Exported: ${date}`, ''];
  for (const msg of messages) {
    const speaker = msg.senderType === 'user' ? 'You' : 'Tetri Copilot';
    const time    = new Date(msg.createdAt).toLocaleString();
    lines.push(`[${speaker}] [${time}]`, msg.message, '');
  }
  return {
    content:  lines.join('\n'),
    filename: `${title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${id.slice(0, 8)}.txt`,
    mimeType: 'text/plain',
  };
}

// ── Chat (non-streaming) ──────────────────────────────────────────────────────

async function chat({ sessionId, workspaceId, userId, role, userMessage }) {
  const session = await getSession(sessionId, workspaceId);
  if (session.status === 'archived') throw Object.assign(new Error('Session is archived'), { status: 400 });

  const gov = governance.check(userMessage);
  if (!gov.allowed) {
    const userMsg  = await repo.createMessage({ sessionId, senderType: 'user',      message: userMessage });
    const resp     = await repo.createMessage({ sessionId, senderType: 'assistant', message: gov.message, metadata: { blocked: true, reason: gov.reason } });
    return { userMessage: userMsg, assistantMessage: resp, response: gov.message, blocked: true };
  }

  await repo.createMessage({ sessionId, senderType: 'user', message: userMessage });

  const resolved      = await contextSvc.resolve(userMessage, workspaceId, sessionId);
  const history       = await repo.getMessages(sessionId);
  const historySlice  = history.slice(-20);
  const userMsgCount  = history.filter((m) => m.senderType === 'user').length;

  const messages = await buildContext({ workspaceId, userId, role, resolvedData: resolved.contextText, history: historySlice });
  messages.push({ role: 'user', content: userMessage });

  const aiResult = await aiSvc.execute({
    workspaceId, userId, feature: FEATURE, messages, options: { maxTokens: 1500 },
  });

  const processed    = processor.process({ text: aiResult.response, feature: FEATURE });
  const responseText = processed.safe ? processed.text : "I wasn't able to generate a safe response. Please rephrase your question.";

  const assistantMsg = await repo.createMessage({
    sessionId, senderType: 'assistant',
    message:    responseText,
    tokenUsage: (aiResult.tokensInput || 0) + (aiResult.tokensOutput || 0),
    cost:       aiResult.cost || 0,
    metadata:   { provider: aiResult.provider, model: aiResult.model, durationMs: aiResult.durationMs, hadData: !!resolved.contextText, sources: resolved.sources, confidence: resolved.confidence },
  });

  if (userMsgCount === 1) {
    const autoTitle = userMessage.length > 55 ? userMessage.substring(0, 55) + '…' : userMessage;
    await repo.updateSession(sessionId, { title: autoTitle });
  }

  return {
    assistantMessage: assistantMsg,
    response:         responseText,
    provider:         aiResult.provider,
    model:            aiResult.model,
    tokensUsed:       (aiResult.tokensInput || 0) + (aiResult.tokensOutput || 0),
    cost:             aiResult.cost,
  };
}

// ── Streaming chat ────────────────────────────────────────────────────────────

async function *chatStream({ sessionId, workspaceId, userId, role, userMessage }) {
  const session = await getSession(sessionId, workspaceId);
  if (session.status === 'archived') {
    yield { type: 'error', message: 'Session is archived' };
    return;
  }

  const gov = governance.check(userMessage);
  if (!gov.allowed) {
    const userMsg      = await repo.createMessage({ sessionId, senderType: 'user',      message: userMessage });
    const assistantMsg = await repo.createMessage({ sessionId, senderType: 'assistant', message: gov.message, metadata: { blocked: true, reason: gov.reason } });
    yield { type: 'user_saved', messageId: userMsg.id };
    yield { type: 'chunk',      text: gov.message };
    yield { type: 'done',       messageId: assistantMsg.id, message: gov.message, userMessageId: userMsg.id, blocked: true };
    return;
  }

  const userMsg      = await repo.createMessage({ sessionId, senderType: 'user', message: userMessage });
  yield { type: 'user_saved', messageId: userMsg.id };

  // 15.2: RAG context
  const resolved     = await contextSvc.resolve(userMessage, workspaceId, sessionId);
  const history      = await repo.getMessages(sessionId);
  const userMsgCount = history.filter((m) => m.senderType === 'user').length;
  const historySlice = history.slice(-20);

  // 15.3: Action detection + enrichment
  const actionResult = await actionSvc.detectAndEnrich({
    userMessage, workspaceId, existingIntents: resolved.intents, existingContextText: resolved.contextText,
  });

  // If this is a recommendations intent, fetch recommendation context
  let recContext = null;
  if (actionResult.actionCode === 'recommendations') {
    recContext = await recSvc.getAsContext(workspaceId);
  }

  // Merge contexts
  const contextParts = [resolved.contextText, actionResult.additionalContext, recContext].filter(Boolean);
  const finalContext = contextParts.length ? contextParts.join('\n\n') : null;
  const finalSources = [...resolved.sources, ...actionResult.additionalSources];

  const messages = await buildContext({ workspaceId, userId, role, resolvedData: finalContext, history: historySlice });
  messages.push({ role: 'user', content: userMessage });

  let fullText = '', provider = null, model = null, durationMs = 0;
  let tokensInput = 0, tokensOutput = 0;

  try {
    for await (const event of aiSvc.executeStream({ workspaceId, userId, feature: FEATURE, messages, options: { maxTokens: 1500 } })) {
      if (event.type === 'chunk') {
        fullText += event.text;
        yield { type: 'chunk', text: event.text };
      } else if (event.type === 'done') {
        tokensInput  = event.tokensInput;
        tokensOutput = event.tokensOutput;
        provider     = event.provider;
        model        = event.model;
        durationMs   = event.durationMs;
      }
    }
  } catch (err) {
    yield { type: 'error', message: err.message || 'AI provider error' };
    return;
  }

  const processed    = processor.process({ text: fullText, feature: FEATURE });
  const responseText = processed.safe ? processed.text : "I wasn't able to generate a safe response.";

  const assistantMsg = await repo.createMessage({
    sessionId, senderType: 'assistant',
    message:    responseText,
    tokenUsage: tokensInput + tokensOutput,
    cost:       0,
    metadata:   {
      provider, model, durationMs, hadData: !!finalContext,
      sources:         finalSources,
      confidence:      resolved.confidence,
      actionCode:      actionResult.actionCode,
      actionName:      actionResult.actionName,
      actionCategory:  actionResult.actionCategory,
    },
  });

  // Non-blocking logging
  contextSvc.logContext({ workspaceId, sessionId, messageId: assistantMsg.id, userId, resolved }).catch(() => {});
  actionSvc.logAction({
    workspaceId, sessionId, messageId: assistantMsg.id, userId,
    actionCode:       actionResult.actionCode,
    actionName:       actionResult.actionName,
    actionCategory:   actionResult.actionCategory,
    status:           'success',
    executionMs:      actionResult.executionMs,
    recordsRetrieved: actionResult.recordsRetrieved,
  }).catch(() => {});

  if (userMsgCount === 1) {
    const autoTitle = userMessage.length > 55 ? userMessage.substring(0, 55) + '…' : userMessage;
    await repo.updateSession(sessionId, { title: autoTitle });
  }

  yield {
    type:           'done',
    messageId:       assistantMsg.id,
    message:         responseText,
    userMessageId:   userMsg.id,
    sources:         finalSources,
    confidence:      resolved.confidence,
    actionCode:      actionResult.actionCode,
    actionName:      actionResult.actionName,
    actionCategory:  actionResult.actionCategory,
  };
}

// ── Regenerate ────────────────────────────────────────────────────────────────

async function regenerateResponse({ sessionId, workspaceId, userId, role }) {
  const session = await getSession(sessionId, workspaceId);
  if (session.status === 'archived') throw Object.assign(new Error('Session is archived'), { status: 400 });

  const history      = await repo.getMessages(sessionId);
  const lastUserMsg  = [...history].reverse().find((m) => m.senderType === 'user');
  if (!lastUserMsg)  throw Object.assign(new Error('No user message to regenerate from'), { status: 400 });

  // Remove the last assistant message if present
  const lastMsg = history[history.length - 1];
  if (lastMsg?.senderType === 'assistant') {
    await prisma.aiAssistantMessage.delete({ where: { id: lastMsg.id } });
  }

  const updatedHistory = await repo.getMessages(sessionId);
  const historySlice   = updatedHistory.slice(-20);
  const resolved       = await contextSvc.resolve(lastUserMsg.message, workspaceId, sessionId);

  const messages = await buildContext({ workspaceId, userId, role, resolvedData: resolved.contextText, history: historySlice });
  messages.push({ role: 'user', content: lastUserMsg.message });

  const aiResult = await aiSvc.execute({
    workspaceId, userId, feature: FEATURE, messages, options: { maxTokens: 1500 },
  });

  const processed    = processor.process({ text: aiResult.response, feature: FEATURE });
  const responseText = processed.safe ? processed.text : "I wasn't able to generate a safe response.";

  const assistantMsg = await repo.createMessage({
    sessionId, senderType: 'assistant',
    message:    responseText,
    tokenUsage: (aiResult.tokensInput || 0) + (aiResult.tokensOutput || 0),
    cost:       aiResult.cost || 0,
    metadata:   { provider: aiResult.provider, model: aiResult.model, durationMs: aiResult.durationMs, hadData: !!resolved.contextText, sources: resolved.sources, confidence: resolved.confidence, regenerated: true },
  });

  return { assistantMessage: assistantMsg, response: responseText };
}

// ── Feedback ──────────────────────────────────────────────────────────────────

async function submitFeedback({ messageId, userId, rating, comment }) {
  if (!['helpful', 'not_helpful', 'report'].includes(rating)) {
    throw Object.assign(new Error('Invalid rating'), { status: 400 });
  }
  return repo.createFeedback({ messageId, userId, rating, comment });
}

// ── Recommendations ───────────────────────────────────────────────────────────

async function getRecommendations(workspaceId) {
  return recSvc.getRecommendations(workspaceId);
}

async function dismissRecommendation(id, workspaceId) {
  return recSvc.dismissRecommendation(id, workspaceId);
}

async function refreshRecommendations(workspaceId) {
  return recSvc.refreshRecommendations(workspaceId);
}

// ── File context ──────────────────────────────────────────────────────────────

async function uploadSessionFile({ workspaceId, sessionId, userId, file }) {
  await getSession(sessionId, workspaceId);
  return fileSvc.uploadFile({ workspaceId, sessionId, userId, file });
}

async function listSessionFiles(workspaceId, sessionId) {
  return fileSvc.listSessionFiles(workspaceId, sessionId);
}

async function removeSessionFile(fileId, sessionId, workspaceId) {
  await getSession(sessionId, workspaceId);
  return fileSvc.removeFile(fileId, workspaceId);
}

module.exports = {
  createSession, listSessions, searchSessions, getSession,
  renameSession, archiveSession, restoreSession, deleteSession,
  chat, chatStream, regenerateResponse,
  exportSession, submitFeedback,
  getRecommendations, dismissRecommendation, refreshRecommendations,
  uploadSessionFile, listSessionFiles, removeSessionFile,
};
