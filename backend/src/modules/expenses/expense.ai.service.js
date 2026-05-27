const aiSvc       = require('../ai/ai.service');
const aiRepo      = require('./expense.ai.repository');

// ── Category name matching ──────────────────────────────────────────────────
function matchCategory(categories, name) {
  if (!name) return null;
  const lower = name.toLowerCase().trim();

  // exact
  let match = categories.find((c) => c.name.toLowerCase() === lower);
  if (match) return match;

  // starts-with
  match = categories.find((c) => c.name.toLowerCase().startsWith(lower) || lower.startsWith(c.name.toLowerCase()));
  if (match) return match;

  // contains
  match = categories.find((c) => c.name.toLowerCase().includes(lower) || lower.includes(c.name.toLowerCase()));
  return match || null;
}

// ── AI response parsing ─────────────────────────────────────────────────────
function parseAiResponse(raw) {
  let text = raw.trim();

  // Strip markdown code fences
  text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();

  try {
    return JSON.parse(text);
  } catch {
    // Try to extract JSON object via regex
    const m = text.match(/\{[\s\S]*\}/);
    if (m) {
      try { return JSON.parse(m[0]); } catch {}
    }
    return null;
  }
}

// ── Prompt builder ──────────────────────────────────────────────────────────
function buildCategorizationPrompt(categories, { description, vendorName, amount, currency, notes }) {
  const catList = categories.map((c) => `- ${c.name}${c.description ? ` (${c.description})` : ''}`).join('\n');

  return `You are an expert expense categorization assistant for a business finance platform.

Analyze the following expense and suggest the most appropriate category.

## Available Categories
${catList}

## Expense Details
- Description: ${description || 'Not provided'}
- Vendor/Supplier: ${vendorName || 'Not provided'}
- Amount: ${amount ? `${currency || 'USD'} ${amount}` : 'Not provided'}
- Notes: ${notes || 'None'}

## Instructions
Return ONLY a JSON object in this exact format (no markdown, no explanation):
{
  "primary": {
    "categoryName": "exact category name from the list",
    "confidence": 85,
    "reasoning": "brief explanation"
  },
  "alternatives": [
    { "categoryName": "another category", "confidence": 60 },
    { "categoryName": "yet another", "confidence": 45 }
  ],
  "reasoning": "overall reasoning for your primary choice"
}

Rules:
- confidence is 0-100 (integer)
- categoryName must EXACTLY match one of the available categories
- provide up to 3 alternatives sorted by confidence descending
- if no category fits well, use the closest one with lower confidence`;
}

// ── Main categorization logic ───────────────────────────────────────────────
async function categorize({ workspaceId, userId, description, vendorName, amount, currency, notes, expenseId }) {
  const categories = await aiRepo.getCategories(workspaceId);

  if (!categories.length) {
    return {
      primary:      null,
      alternatives: [],
      reasoning:    'No expense categories configured for this workspace.',
      skipped:      true,
    };
  }

  const prompt = buildCategorizationPrompt(categories, { description, vendorName, amount, currency, notes });

  const result = await aiSvc.execute({
    workspaceId,
    userId,
    feature:  'expense_categorization',
    messages: [{ role: 'user', content: prompt }],
    options:  { maxTokens: 800, temperature: 0.1 },
  });

  const parsed = parseAiResponse(result.response || '');

  if (!parsed?.primary) {
    return {
      primary:      null,
      alternatives: [],
      reasoning:    'AI returned an unexpected response. Please categorize manually.',
      skipped:      true,
    };
  }

  // Resolve category IDs
  const primaryCategory  = matchCategory(categories, parsed.primary.categoryName);
  const primaryConfidence = Math.min(100, Math.max(0, Math.round(parsed.primary.confidence || 0)));

  const alternatives = (parsed.alternatives || []).slice(0, 3).map((alt) => {
    const cat = matchCategory(categories, alt.categoryName);
    return {
      categoryId:   cat?.id   || null,
      categoryName: cat?.name || alt.categoryName,
      confidence:   Math.min(100, Math.max(0, Math.round(alt.confidence || 0))),
    };
  }).filter((a) => a.categoryName && a.categoryId !== primaryCategory?.id);

  const recommendation = {
    suggestedCategoryId:   primaryCategory?.id   || null,
    suggestedCategoryName: primaryCategory?.name || parsed.primary.categoryName,
    confidence:            primaryConfidence,
    alternatives,
    reasoning:             parsed.reasoning || parsed.primary.reasoning || null,
    provider:              result.provider  || null,
    model:                 result.model     || null,
  };

  // Persist recommendation if we have an expenseId
  let savedRec = null;
  if (expenseId) {
    savedRec = await aiRepo.saveRecommendation({ expenseId, workspaceId, ...recommendation }).catch(() => null);

    // Non-blocking history log
    aiRepo.logHistory({
      expenseId,
      workspaceId,
      userId,
      recommendationId:    savedRec?.id || null,
      action:              'suggested',
      suggestedCategoryId: recommendation.suggestedCategoryId,
      finalCategoryId:     null,
      confidence:          recommendation.confidence,
    }).catch(() => {});
  }

  return {
    recommendationId: savedRec?.id || null,
    primary: {
      categoryId:   recommendation.suggestedCategoryId,
      categoryName: recommendation.suggestedCategoryName,
      confidence:   recommendation.confidence,
    },
    alternatives,
    reasoning: recommendation.reasoning,
  };
}

async function acceptRecommendation({ workspaceId, userId, expenseId, recommendationId, finalCategoryId }) {
  const rec = await aiRepo.acceptRecommendation(recommendationId).catch(() => null);

  aiRepo.logHistory({
    expenseId,
    workspaceId,
    userId,
    recommendationId,
    action:              'accepted',
    suggestedCategoryId: rec?.suggestedCategoryId || null,
    finalCategoryId:     finalCategoryId          || rec?.suggestedCategoryId || null,
    confidence:          rec?.confidence           || null,
  }).catch(() => {});

  return rec;
}

async function rejectRecommendation({ workspaceId, userId, expenseId, recommendationId }) {
  const rec = await aiRepo.rejectRecommendation(recommendationId).catch(() => null);

  aiRepo.logHistory({
    expenseId,
    workspaceId,
    userId,
    recommendationId,
    action:              'rejected',
    suggestedCategoryId: rec?.suggestedCategoryId || null,
    finalCategoryId:     null,
    confidence:          rec?.confidence           || null,
  }).catch(() => {});

  return rec;
}

module.exports = {
  categorize,
  acceptRecommendation,
  rejectRecommendation,
  getHistory:          (expenseId, opts)  => aiRepo.getHistory(expenseId, opts),
  getWorkspaceHistory: (workspaceId, opts) => aiRepo.getWorkspaceHistory(workspaceId, opts),
  getSettings:         (workspaceId)       => aiRepo.getSettings(workspaceId),
  upsertSettings:      (workspaceId, data) => aiRepo.upsertSettings(workspaceId, data),
  getLatestRecommendation: (expenseId)     => aiRepo.getLatestRecommendation(expenseId),
};
