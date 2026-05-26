const prisma     = require('../../lib/prisma');
const repo       = require('./assistant.repository');
const resolver   = require('./query.resolver');
const governance = require('./governance.service');
const aiSvc      = require('../ai/ai.service');
const processor  = require('../ai/response.processor');

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
    title: title || `Chat — ${new Date().toLocaleDateString()}`,
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

async function archiveSession(id, workspaceId) {
  await getSession(id, workspaceId);
  return repo.updateSession(id, { status: 'archived' });
}

// ── Chat ──────────────────────────────────────────────────────────────────────

async function chat({ sessionId, workspaceId, userId, role, userMessage }) {
  const session = await getSession(sessionId, workspaceId);
  if (session.status === 'archived') throw Object.assign(new Error('Session is archived'), { status: 400 });

  // Governance check
  const gov = governance.check(userMessage);
  if (!gov.allowed) {
    const msg = await repo.createMessage({ sessionId, senderType: 'user', message: userMessage });
    const resp = await repo.createMessage({ sessionId, senderType: 'assistant', message: gov.message, metadata: { blocked: true, reason: gov.reason } });
    return { userMessage: msg, assistantMessage: resp, blocked: true };
  }

  // Persist user message
  await repo.createMessage({ sessionId, senderType: 'user', message: userMessage });

  // Resolve intent and fetch live data
  const resolvedData = await resolver.resolve(userMessage, workspaceId);

  // Get history (last 20 messages)
  const history = await repo.getMessages(sessionId);
  const historySlice = history.slice(-20);

  // Build context
  const messages = await buildContext({ workspaceId, userId, role, resolvedData, history: historySlice });
  messages.push({ role: 'user', content: userMessage });

  // Execute AI
  const aiResult = await aiSvc.execute({
    workspaceId,
    userId,
    feature: FEATURE,
    messages,
    options: { maxTokens: 1500 },
  });

  // Process response
  const processed = processor.process({ text: aiResult.response, feature: FEATURE });
  const responseText = processed.safe ? processed.text
    : "I wasn't able to generate a safe response. Please rephrase your question.";

  // Persist assistant message
  const assistantMsg = await repo.createMessage({
    sessionId,
    senderType:  'assistant',
    message:     responseText,
    tokenUsage:  (aiResult.tokensInput || 0) + (aiResult.tokensOutput || 0),
    cost:        aiResult.cost || 0,
    metadata: {
      provider:   aiResult.provider,
      model:      aiResult.model,
      durationMs: aiResult.durationMs,
      hadData:    !!resolvedData,
    },
  });

  // Auto-title session from first user message
  if (historySlice.length <= 1 && !session.title?.startsWith('Chat')) {
    await repo.updateSession(sessionId, { title: userMessage.substring(0, 60) });
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

// ── Feedback ──────────────────────────────────────────────────────────────────

async function submitFeedback({ messageId, userId, rating, comment }) {
  if (!['helpful', 'not_helpful', 'report'].includes(rating)) {
    throw Object.assign(new Error('Invalid rating'), { status: 400 });
  }
  return repo.createFeedback({ messageId, userId, rating, comment });
}

module.exports = {
  createSession, listSessions, searchSessions, getSession, archiveSession,
  chat, submitFeedback,
};
