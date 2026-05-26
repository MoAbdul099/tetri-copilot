const repo      = require('./conversation.repository');
const aiSvc     = require('./ai.service');
const ctxBuilder = require('./context.builder');
const processor  = require('./response.processor');
const featureSvc = require('./feature.service');

async function createSession({ workspaceId, userId, featureCode, title }) {
  if (!featureCode) throw Object.assign(new Error('featureCode is required'), { status: 400 });
  return repo.createSession({
    workspaceId,
    userId,
    featureCode,
    title: title || `${featureCode} — ${new Date().toLocaleDateString()}`,
    status: 'active',
  });
}

async function listSessions({ workspaceId, userId, featureCode, status }) {
  return repo.listSessions({ workspaceId, userId, featureCode, status });
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

async function chat({ sessionId, workspaceId, userId, userMessage, options = {} }) {
  const session = await getSession(sessionId, workspaceId);
  if (session.status === 'closed') throw Object.assign(new Error('Session is closed'), { status: 400 });

  // Check feature flag
  const allowed = await featureSvc.isFeatureEnabled(session.featureCode, workspaceId);
  if (!allowed) throw Object.assign(new Error(`Feature "${session.featureCode}" is disabled for this workspace`), { status: 403 });

  // Store user message
  await repo.createMessage({ sessionId, senderType: 'user', content: userMessage });

  // Build context with history
  const history = await repo.getHistory(sessionId, 20);
  const messages = await ctxBuilder.build({ workspaceId, userId, feature: session.featureCode, sessionHistory: history });
  messages.push({ role: 'user', content: userMessage });

  // Execute AI
  const aiResult = await aiSvc.execute({
    workspaceId,
    userId,
    feature: session.featureCode,
    messages,
    options,
  });

  // Process response
  const processed = processor.process({ text: aiResult.response, feature: session.featureCode });
  const responseText = processed.safe ? processed.text : 'I was unable to generate a safe response. Please try rephrasing.';

  // Store assistant message
  const assistantMsg = await repo.createMessage({
    sessionId,
    senderType:  'assistant',
    content:     responseText,
    tokenCount:  (aiResult.tokensInput || 0) + (aiResult.tokensOutput || 0),
    cost:        aiResult.cost || 0,
    metadata: {
      provider:    aiResult.provider,
      model:       aiResult.model,
      durationMs:  aiResult.durationMs,
      safe:        processed.safe,
      safetyNote:  processed.reason,
    },
  });

  // Touch session updatedAt
  await repo.updateSession(sessionId, { updatedAt: new Date() });

  return {
    message:      assistantMsg,
    response:     responseText,
    provider:     aiResult.provider,
    model:        aiResult.model,
    tokensInput:  aiResult.tokensInput,
    tokensOutput: aiResult.tokensOutput,
    cost:         aiResult.cost,
    durationMs:   aiResult.durationMs,
  };
}

module.exports = { createSession, listSessions, getSession, archiveSession, chat };
