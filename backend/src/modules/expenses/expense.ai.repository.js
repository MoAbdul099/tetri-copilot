const { prisma } = require('../../lib/prisma');

const expenseAiRepository = {
  async saveRecommendation({ expenseId, workspaceId, suggestedCategoryId, suggestedCategoryName, confidence, alternatives, reasoning, provider, model }) {
    // Expire any existing pending recommendations for this expense
    await prisma.expenseAiRecommendation.updateMany({
      where: { expenseId, status: 'pending' },
      data:  { status: 'superseded' },
    });

    return prisma.expenseAiRecommendation.create({
      data: {
        expenseId,
        workspaceId,
        suggestedCategoryId: suggestedCategoryId || null,
        suggestedCategoryName,
        confidence,
        alternatives: alternatives || [],
        reasoning:    reasoning    || null,
        provider:     provider     || null,
        model:        model        || null,
        status:       'pending',
      },
    });
  },

  async getLatestRecommendation(expenseId) {
    return prisma.expenseAiRecommendation.findFirst({
      where:   { expenseId },
      orderBy: { createdAt: 'desc' },
    });
  },

  async acceptRecommendation(recommendationId) {
    return prisma.expenseAiRecommendation.update({
      where: { id: recommendationId },
      data:  { status: 'accepted' },
    });
  },

  async rejectRecommendation(recommendationId) {
    return prisma.expenseAiRecommendation.update({
      where: { id: recommendationId },
      data:  { status: 'rejected' },
    });
  },

  async logHistory({ expenseId, workspaceId, userId, recommendationId, action, suggestedCategoryId, finalCategoryId, confidence }) {
    return prisma.expenseAiHistory.create({
      data: {
        expenseId,
        workspaceId,
        userId,
        recommendationId: recommendationId || null,
        action,
        suggestedCategoryId: suggestedCategoryId || null,
        finalCategoryId:     finalCategoryId     || null,
        confidence:          confidence           || null,
      },
    });
  },

  async getHistory(expenseId, { limit = 20 } = {}) {
    return prisma.expenseAiHistory.findMany({
      where:   { expenseId },
      orderBy: { createdAt: 'desc' },
      take:    limit,
    });
  },

  async getWorkspaceHistory(workspaceId, { limit = 50 } = {}) {
    return prisma.expenseAiHistory.findMany({
      where:   { workspaceId },
      orderBy: { createdAt: 'desc' },
      take:    limit,
    });
  },

  async getSettings(workspaceId) {
    return prisma.workspaceAiExpenseSettings.findUnique({
      where: { workspaceId },
    });
  },

  async upsertSettings(workspaceId, data) {
    return prisma.workspaceAiExpenseSettings.upsert({
      where:  { workspaceId },
      update: data,
      create: { workspaceId, ...data },
    });
  },

  async getCategories(workspaceId) {
    return prisma.expenseCategory.findMany({
      where:   { workspaceId, isActive: true },
      select:  { id: true, name: true, description: true },
      orderBy: { name: 'asc' },
    });
  },
};

module.exports = expenseAiRepository;
