const prisma = require('../../lib/prisma');

// ---- Conversations ----

const createConversation = ({ workspaceId, userId, title }) =>
  prisma.aiComplianceConversation.create({
    data: { workspaceId, userId, title: title || 'New Conversation' },
    include: { messages: { orderBy: { createdAt: 'asc' }, take: 1 } },
  });

const listConversations = (workspaceId, userId, { status } = {}) =>
  prisma.aiComplianceConversation.findMany({
    where: { workspaceId, userId, ...(status ? { status } : {}) },
    orderBy: { updatedAt: 'desc' },
    include: {
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: { id: true, role: true, content: true, createdAt: true },
      },
    },
  });

const getConversation = (id, workspaceId) =>
  prisma.aiComplianceConversation.findFirst({
    where: { id, workspaceId },
    include: {
      messages: { orderBy: { createdAt: 'asc' }, include: { feedback: true } },
    },
  });

const updateConversation = (id, data) =>
  prisma.aiComplianceConversation.update({ where: { id }, data });

const deleteConversation = (id) =>
  prisma.aiComplianceConversation.delete({ where: { id } });

// ---- Messages ----

const createMessage = ({ conversationId, role, content, sources, metadata }) =>
  prisma.aiComplianceMessage.create({
    data: { conversationId, role, content, sources, metadata },
  });

const listMessages = (conversationId) =>
  prisma.aiComplianceMessage.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'asc' },
    include: { feedback: true },
  });

// ---- Feedback ----

const createFeedback = ({ messageId, userId, feedbackType, comment }) =>
  prisma.aiComplianceFeedback.create({
    data: { messageId, userId, feedbackType, comment },
  });

module.exports = {
  createConversation, listConversations, getConversation,
  updateConversation, deleteConversation,
  createMessage, listMessages, createFeedback,
};
