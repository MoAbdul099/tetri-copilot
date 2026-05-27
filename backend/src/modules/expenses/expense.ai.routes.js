const { Router }  = require('express');
const ctrl        = require('./expense.ai.controller');

const router = Router();

// POST /api/v1/expenses/ai/categorize
router.post('/categorize', ctrl.categorize);

// POST /api/v1/expenses/ai/accept
router.post('/accept', ctrl.acceptRecommendation);

// POST /api/v1/expenses/ai/reject
router.post('/reject', ctrl.rejectRecommendation);

// GET /api/v1/expenses/ai/history
router.get('/history', ctrl.getHistory);

// GET /api/v1/expenses/ai/:expenseId/history
router.get('/:expenseId/history', ctrl.getExpenseHistory);

// GET /api/v1/expenses/ai/:expenseId/recommendation
router.get('/:expenseId/recommendation', ctrl.getLatestRecommendation);

// GET /api/v1/expenses/ai/settings
router.get('/settings', ctrl.getSettings);

// PATCH /api/v1/expenses/ai/settings
router.patch('/settings', ctrl.updateSettings);

module.exports = router;
