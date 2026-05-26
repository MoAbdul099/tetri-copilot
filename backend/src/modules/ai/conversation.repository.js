const prisma = require('../../lib/prisma');

const createSession = (data) =>
  prisma.aiConversationSession.create({ data });

const listSessions = ({ workspaceId, userId, featureCode, status } = {}) =>
  prisma.aiConversationSession.findMany({
    where: {
      ...(workspaceId ? { workspaceId }  : {}),
      ...(userId      ? { userId }        : {}),
      ...(featureCode ? { featureCode }   : {}),
      ...(status      ? { status }        : { status: { not: 'closed' } }),
    },
    include: { _count: { select: { messages: true } } },
    orderBy: { updatedAt: 'desc' },
    take: 50,
  });

const getSession = (id, workspaceId) =>
  prisma.aiConversationSession.findFirst({
    where: { id, ...(workspaceId ? { workspaceId } : {}) },
    include: { messages: { orderBy: { createdAt: 'asc' }, include: { citations: true } } },
  });

const updateSession = (id, data) =>
  prisma.aiConversationSession.update({ where: { id }, data });

const createMessage = (data) =>
  prisma.aiConversationMessage.create({ data });

const getHistory = (sessionId, limit = 20) =>
  prisma.aiConversationMessage.findMany({
    where: { sessionId },
    orderBy: { createdAt: 'asc' },
    take: limit,
  });

const createCitation = (data) =>
  prisma.aiCitation.create({ data });

module.exports = { createSession, listSessions, getSession, updateSession, createMessage, getHistory, createCitation };
