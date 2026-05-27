const repo    = require('./ai-compliance.repository');
const ctx     = require('./ai-compliance.context');
const aiSvc   = require('../ai/ai.service');

const FEATURE = 'compliance_assistant';

const SUGGESTED_QUESTIONS = [
  'What compliance deadlines are due this month?',
  'What filings are overdue?',
  'What should I prepare for the next compliance filing?',
  'Summarize my current compliance status.',
  'Which obligations are due next week?',
  'Explain what annual reporting requires.',
  'Show all pending compliance items.',
  'What are the highest priority compliance tasks?',
];

// Lightweight prompt-injection guard for compliance assistant
const BLOCKED_PATTERNS = [
  /ignore (all |previous |your )?instructions/i,
  /you are now/i,
  /pretend (you are|to be)/i,
  /act as (a |an )?(?!compliance|assistant)/i,
  /disregard (your |all )?instructions/i,
  /jailbreak/i,
  /bypass (your |all )?restrictions/i,
];

function checkGovernance(text) {
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(text)) {
      return { allowed: false, message: "I'm sorry, I can only answer compliance-related questions for your workspace. Please rephrase your question." };
    }
  }
  return { allowed: true };
}

function buildSystemPrompt({ workspace, contextText, language }) {
  const today = new Date().toISOString().split('T')[0];
  const langNote = language && language !== 'English' ? `Respond in ${language}.` : '';

  const lines = [
    `You are the Tetri Copilot AI Compliance Assistant for ${workspace?.name || 'this workspace'}.`,
    `Today is ${today}.`,
    '',
    'Your role is to help users understand their compliance obligations, deadlines, statuses, and requirements.',
    '',
    'IMPORTANT RULES:',
    '• You are operating in READ-ONLY mode. You CANNOT create, update, delete, approve, submit, or trigger any records or actions.',
    '• If asked to perform any write action, politely decline and direct the user to the relevant page.',
    '• You are NOT a lawyer, accountant, or tax advisor. Always recommend professional verification for specific legal or tax advice.',
    '• When uncertain, clearly state your uncertainty and recommend the user verify with a professional or the relevant authority.',
    '• Always identify the source of your information when possible (e.g., "Based on the Compliance Calendar...", "According to your Templates...").',
    '• If information is unavailable in the workspace data, say so clearly and suggest where the user can find it.',
    '',
    langNote,
    '',
    'Formatting: Use clear, structured responses. Use bullet points, dates, and priority labels where helpful.',
  ];

  if (contextText) {
    lines.push('', '[LIVE WORKSPACE COMPLIANCE DATA]', contextText, '[END COMPLIANCE DATA]', '', 'Base your answers on the workspace data above.');
  } else {
    lines.push('', 'Note: No compliance data is currently available for this workspace. Guide the user to set up compliance templates and occurrences.');
  }

  return lines.filter((l) => l !== undefined).join('\n');
}

// ---- Conversation Management ----

async function createConversation({ workspaceId, userId, title }) {
  return repo.createConversation({ workspaceId, userId, title });
}

async function listConversations(workspaceId, userId, query = {}) {
  return repo.listConversations(workspaceId, userId, query);
}

async function getConversation(id, workspaceId) {
  const conv = await repo.getConversation(id, workspaceId);
  if (!conv) throw Object.assign(new Error('Conversation not found'), { status: 404 });
  return conv;
}

async function updateConversation(id, workspaceId, data) {
  await getConversation(id, workspaceId);
  return repo.updateConversation(id, data);
}

async function deleteConversation(id, workspaceId) {
  await getConversation(id, workspaceId);
  return repo.deleteConversation(id);
}

// ---- Chat ----

async function chat({ conversationId, workspaceId, userId, role, message, workspace }) {
  const conv = await getConversation(conversationId, workspaceId);
  if (conv.status === 'archived') throw Object.assign(new Error('Conversation is archived'), { status: 400 });

  // Governance check
  const gov = checkGovernance(message);
  if (!gov.allowed) {
    await repo.createMessage({ conversationId, role: 'user', content: message });
    const botMsg = await repo.createMessage({ conversationId, role: 'assistant', content: gov.message, metadata: { blocked: true } });
    return { assistantMessage: botMsg, response: gov.message, blocked: true };
  }

  // Save user message
  await repo.createMessage({ conversationId, role: 'user', content: message });

  // Build compliance context
  const { contextText, sources } = await ctx.buildComplianceContext(workspaceId);

  // Build message history (last 20 messages for context window)
  const history = await repo.listMessages(conversationId);
  const historySlice = history.slice(-20);

  // Build messages array for AI
  const systemPrompt = buildSystemPrompt({ workspace, contextText });
  const messages = [{ role: 'system', content: systemPrompt }];
  for (const msg of historySlice) {
    messages.push({ role: msg.role === 'user' ? 'user' : 'assistant', content: msg.content });
  }
  messages.push({ role: 'user', content: message });

  // Call AI
  const startTime = Date.now();
  const aiResult = await aiSvc.execute({
    workspaceId, userId, feature: FEATURE,
    messages,
    options: { maxTokens: 1500, temperature: 0.4 },
  });

  const responseText = aiResult.response || 'I was unable to generate a response. Please try again.';
  const durationMs   = Date.now() - startTime;

  const assistantMsg = await repo.createMessage({
    conversationId,
    role: 'assistant',
    content: responseText,
    sources: sources.length ? sources : null,
    metadata: {
      provider: aiResult.provider, model: aiResult.model,
      durationMs, tokensInput: aiResult.tokensInput, tokensOutput: aiResult.tokensOutput,
      hadContext: !!contextText,
    },
  });

  // Auto-title conversation from first user message
  const userMsgCount = history.filter((m) => m.role === 'user').length;
  if (userMsgCount === 0) {
    const autoTitle = message.length > 60 ? message.substring(0, 60) + '…' : message;
    await repo.updateConversation(conversationId, { title: autoTitle });
  }

  return {
    assistantMessage: assistantMsg,
    response: responseText,
    sources,
    provider: aiResult.provider,
    model: aiResult.model,
    durationMs,
  };
}

// ---- Feedback ----

async function submitFeedback({ messageId, userId, feedbackType, comment }) {
  if (!['helpful', 'not_helpful', 'report'].includes(feedbackType)) {
    throw Object.assign(new Error('Invalid feedbackType'), { status: 400 });
  }
  return repo.createFeedback({ messageId, userId, feedbackType, comment });
}

// ---- Export ----

async function exportConversation(id, workspaceId, format = 'md') {
  const conv     = await getConversation(id, workspaceId);
  const messages = conv.messages || [];
  const title    = conv.title || 'Compliance Conversation';
  const date     = new Date().toLocaleDateString();

  if (format === 'md') {
    const lines = [`# ${title}`, '', `*Exported: ${date}*`, ''];
    for (const msg of messages) {
      const speaker = msg.role === 'user' ? '**You**' : '**Tetri Compliance Assistant**';
      lines.push(`### ${speaker}`, `*${new Date(msg.createdAt).toLocaleString()}*`, '', msg.content, '', '---', '');
    }
    return { content: lines.join('\n'), filename: `compliance-${id.slice(0, 8)}.md`, mimeType: 'text/markdown' };
  }

  // TXT
  const lines = [title, '='.repeat(Math.min(title.length, 60)), `Exported: ${date}`, ''];
  for (const msg of messages) {
    const speaker = msg.role === 'user' ? 'You' : 'Compliance Assistant';
    lines.push(`[${speaker}] [${new Date(msg.createdAt).toLocaleString()}]`, msg.content, '');
  }
  return { content: lines.join('\n'), filename: `compliance-${id.slice(0, 8)}.txt`, mimeType: 'text/plain' };
}

// ---- Context Summary ----

async function getContextSummary(workspaceId) {
  return ctx.buildComplianceContext(workspaceId);
}

module.exports = {
  SUGGESTED_QUESTIONS,
  createConversation, listConversations, getConversation,
  updateConversation, deleteConversation,
  chat, submitFeedback, exportConversation, getContextSummary,
};
