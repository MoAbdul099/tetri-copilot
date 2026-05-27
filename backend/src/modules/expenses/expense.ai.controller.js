const { success, error } = require('../../utils/response');
const aiService           = require('./expense.ai.service');

const expenseAiController = {
  async categorize(req, res) {
    try {
      const { description, vendorName, amount, currency, notes, expenseId } = req.body;

      if (!description && !vendorName) {
        return error(res, 'Provide at least a description or vendor name', 400);
      }

      const result = await aiService.categorize({
        workspaceId: req.workspaceId,
        userId:      req.user.id,
        description,
        vendorName,
        amount,
        currency,
        notes,
        expenseId: expenseId || null,
      });

      return success(res, result);
    } catch (err) {
      console.error('[expense.ai] categorize error:', err);
      return error(res, 'AI categorization failed. Please try again.', 500);
    }
  },

  async acceptRecommendation(req, res) {
    try {
      const { expenseId, recommendationId, finalCategoryId } = req.body;
      if (!expenseId || !recommendationId) {
        return error(res, 'expenseId and recommendationId are required', 400);
      }
      const rec = await aiService.acceptRecommendation({
        workspaceId: req.workspaceId,
        userId:      req.user.id,
        expenseId,
        recommendationId,
        finalCategoryId: finalCategoryId || null,
      });
      return success(res, rec, 'Recommendation accepted');
    } catch (err) {
      console.error('[expense.ai] accept error:', err);
      return error(res, 'Failed to accept recommendation', 500);
    }
  },

  async rejectRecommendation(req, res) {
    try {
      const { expenseId, recommendationId } = req.body;
      if (!expenseId || !recommendationId) {
        return error(res, 'expenseId and recommendationId are required', 400);
      }
      const rec = await aiService.rejectRecommendation({
        workspaceId: req.workspaceId,
        userId:      req.user.id,
        expenseId,
        recommendationId,
      });
      return success(res, rec, 'Recommendation rejected');
    } catch (err) {
      console.error('[expense.ai] reject error:', err);
      return error(res, 'Failed to reject recommendation', 500);
    }
  },

  async getHistory(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 50;
      const history = await aiService.getWorkspaceHistory(req.workspaceId, { limit });
      return success(res, history);
    } catch (err) {
      console.error('[expense.ai] history error:', err);
      return error(res, 'Failed to fetch AI history', 500);
    }
  },

  async getExpenseHistory(req, res) {
    try {
      const { expenseId } = req.params;
      const history = await aiService.getHistory(expenseId);
      return success(res, history);
    } catch (err) {
      console.error('[expense.ai] expense history error:', err);
      return error(res, 'Failed to fetch expense AI history', 500);
    }
  },

  async getSettings(req, res) {
    try {
      const settings = await aiService.getSettings(req.workspaceId);
      return success(res, settings || { enabled: true, confidenceThreshold: 60, autoSuggest: true, alternativeCount: 3 });
    } catch (err) {
      console.error('[expense.ai] settings error:', err);
      return error(res, 'Failed to fetch AI settings', 500);
    }
  },

  async updateSettings(req, res) {
    try {
      const { enabled, confidenceThreshold, autoSuggest, alternativeCount } = req.body;
      const data = {};
      if (enabled             !== undefined) data.enabled             = Boolean(enabled);
      if (confidenceThreshold !== undefined) data.confidenceThreshold = parseInt(confidenceThreshold);
      if (autoSuggest         !== undefined) data.autoSuggest         = Boolean(autoSuggest);
      if (alternativeCount    !== undefined) data.alternativeCount    = parseInt(alternativeCount);

      const settings = await aiService.upsertSettings(req.workspaceId, data);
      return success(res, settings, 'Settings updated');
    } catch (err) {
      console.error('[expense.ai] update settings error:', err);
      return error(res, 'Failed to update AI settings', 500);
    }
  },

  async getLatestRecommendation(req, res) {
    try {
      const { expenseId } = req.params;
      const rec = await aiService.getLatestRecommendation(expenseId);
      return success(res, rec || null);
    } catch (err) {
      console.error('[expense.ai] latest recommendation error:', err);
      return error(res, 'Failed to fetch recommendation', 500);
    }
  },
};

module.exports = expenseAiController;
