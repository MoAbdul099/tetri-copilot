const prisma = require('../../lib/prisma');

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

  async getLatestRecommendation(expenseId, workspaceId) {
    return prisma.expenseAiRecommendation.findFirst({
      where:   { expenseId, workspaceId },
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

  async getLearningPatterns(workspaceId, { limit = 50 } = {}) {
    const history = await prisma.expenseAiHistory.findMany({
      where:   { workspaceId, action: 'accepted', finalCategoryId: { not: null } },
      orderBy: { createdAt: 'desc' },
      take:    limit,
      select:  { expenseId: true, suggestedCategoryId: true, finalCategoryId: true },
    });
    if (!history.length) return [];

    const expenseIds  = [...new Set(history.map(h => h.expenseId).filter(Boolean))];
    const categoryIds = [...new Set(history.map(h => h.finalCategoryId).filter(Boolean))];

    const [expenses, categories] = await Promise.all([
      expenseIds.length
        ? prisma.expense.findMany({
            where:  { id: { in: expenseIds }, workspaceId },
            select: { id: true, vendorName: true, supplier: { select: { name: true } } },
          })
        : [],
      categoryIds.length
        ? prisma.expenseCategory.findMany({
            where:  { id: { in: categoryIds } },
            select: { id: true, name: true },
          })
        : [],
    ]);

    const expMap = Object.fromEntries(expenses.map(e => [e.id, e]));
    const catMap = Object.fromEntries(categories.map(c => [c.id, c.name]));

    const patterns = [];
    const seen     = new Set();
    for (const h of history) {
      const exp    = expMap[h.expenseId];
      const vendor = exp?.supplier?.name || exp?.vendorName;
      if (!vendor || !h.finalCategoryId) continue;
      const key = `${vendor.toLowerCase()}::${h.finalCategoryId}`;
      if (seen.has(key)) continue;
      seen.add(key);
      patterns.push({
        vendor,
        categoryName: catMap[h.finalCategoryId] || 'Unknown',
        wasCorrected: h.suggestedCategoryId !== h.finalCategoryId,
      });
    }
    return patterns;
  },

  async getLearningMetrics(workspaceId) {
    const [total, accepted, rejected, avgConf, highConf, goodConf, lowConf] = await Promise.all([
      prisma.expenseAiHistory.count({ where: { workspaceId, action: { in: ['accepted', 'rejected'] } } }),
      prisma.expenseAiHistory.count({ where: { workspaceId, action: 'accepted' } }),
      prisma.expenseAiHistory.count({ where: { workspaceId, action: 'rejected' } }),
      prisma.expenseAiHistory.aggregate({ where: { workspaceId, action: 'accepted', confidence: { not: null } }, _avg: { confidence: true } }),
      prisma.expenseAiHistory.count({ where: { workspaceId, confidence: { gte: 90 } } }),
      prisma.expenseAiHistory.count({ where: { workspaceId, confidence: { gte: 75, lt: 90 } } }),
      prisma.expenseAiHistory.count({ where: { workspaceId, confidence: { lt: 75 } } }),
    ]);

    const correctedRows = await prisma.$queryRaw`
      SELECT COUNT(*)::int AS count FROM expense_ai_history
      WHERE workspace_id = ${workspaceId}::uuid
        AND action = 'accepted'
        AND final_category_id IS NOT NULL
        AND suggested_category_id IS NOT NULL
        AND final_category_id != suggested_category_id
    `;
    const corrected = Number(correctedRows[0]?.count || 0);

    return {
      total,
      accepted,
      rejected,
      corrected,
      acceptanceRate:   total > 0 ? Math.round((accepted / total) * 100) : 0,
      correctionRate:   accepted > 0 ? Math.round((corrected / accepted) * 100) : 0,
      avgConfidence:    Math.round(avgConf._avg.confidence || 0),
      confidenceDistribution: { high: highConf, good: goodConf, low: lowConf },
    };
  },
};

module.exports = expenseAiRepository;
