const prisma = require('../../lib/prisma');

// ── Sessions ──────────────────────────────────────────────────────────────────

const createSession = (data) =>
  prisma.aiAssistantSession.create({ data });

const listSessions = ({ workspaceId, userId, status } = {}) =>
  prisma.aiAssistantSession.findMany({
    where: {
      workspaceId,
      ...(userId ? { userId } : {}),
      ...(status ? { status } : { status: { not: 'archived' } }),
    },
    include: { _count: { select: { messages: true } } },
    orderBy: { updatedAt: 'desc' },
    take: 50,
  });

const searchSessions = (workspaceId, userId, query) =>
  prisma.aiAssistantSession.findMany({
    where: {
      workspaceId,
      userId,
      title: { contains: query, mode: 'insensitive' },
      status: { not: 'archived' },
    },
    include: { _count: { select: { messages: true } } },
    orderBy: { updatedAt: 'desc' },
    take: 20,
  });

const getSession = (id, workspaceId) =>
  prisma.aiAssistantSession.findFirst({
    where: { id, workspaceId },
    include: { messages: { orderBy: { createdAt: 'asc' }, include: { feedback: true } } },
  });

const updateSession = (id, data) =>
  prisma.aiAssistantSession.update({ where: { id }, data });

// ── Messages ──────────────────────────────────────────────────────────────────

const createMessage = (data) =>
  prisma.aiAssistantMessage.create({ data });

const getMessages = (sessionId) =>
  prisma.aiAssistantMessage.findMany({
    where: { sessionId },
    orderBy: { createdAt: 'asc' },
    include: { feedback: true },
  });

// ── Feedback ──────────────────────────────────────────────────────────────────

const createFeedback = (data) =>
  prisma.aiAssistantFeedback.create({ data });

// ── Suggestions ───────────────────────────────────────────────────────────────

const upsertSuggestions = async (workspaceId, suggestions) => {
  await prisma.aiAssistantSuggestion.deleteMany({ where: { workspaceId } });
  if (suggestions.length === 0) return;
  await prisma.aiAssistantSuggestion.createMany({
    data: suggestions.map((s) => ({ workspaceId, ...s })),
  });
};

const listSuggestions = (workspaceId) =>
  prisma.aiAssistantSuggestion.findMany({
    where: {
      workspaceId,
      status: 'active',
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

// ── Capabilities ──────────────────────────────────────────────────────────────

const listCapabilities = () =>
  prisma.aiCapabilityRegistry.findMany({ where: { enabled: true }, orderBy: { module: 'asc' } });

module.exports = {
  createSession, listSessions, searchSessions, getSession, updateSession,
  createMessage, getMessages,
  createFeedback,
  upsertSuggestions, listSuggestions,
  listCapabilities,
};
