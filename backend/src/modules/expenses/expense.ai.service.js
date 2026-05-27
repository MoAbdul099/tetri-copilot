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
function buildCategorizationPrompt(categories, { description, vendorName, amount, currency, notes }, learningPatterns = []) {
  const catList = categories.map((c) => c.name).join(', ');

  // Inject workspace-specific learning patterns for this vendor
  let patternSection = '';
  if (learningPatterns.length) {
    const vendor = (vendorName || description || '').toLowerCase();
    const relevant = learningPatterns
      .filter((p) => {
        const pv = p.vendor.toLowerCase();
        return pv.includes(vendor.slice(0, 6)) || vendor.includes(pv.slice(0, 6));
      })
      .slice(0, 5);
    if (relevant.length) {
      patternSection = `\n\nWorkspace history: ${relevant.map((p) => `"${p.vendor}" → ${p.categoryName}${p.wasCorrected ? ' (user corrected AI)' : ''}`).join('; ')}`;
    }
  }

  return `Categorize this business expense. Reply with JSON only.

Categories: ${catList}${patternSection}

Expense: ${[description, vendorName, amount ? `${currency || 'USD'} ${amount}` : ''].filter(Boolean).join(' | ')}

JSON format:
{"primary":{"categoryName":"<exact name>","confidence":<0-100>,"reasoning":"<brief>"},"alternatives":[{"categoryName":"<name>","confidence":<0-100>}],"reasoning":"<brief>"}

Rules: categoryName must exactly match a category above. Up to 3 alternatives, descending confidence.`;
}

// ── Main categorization logic ───────────────────────────────────────────────
async function categorize({ workspaceId, userId, description, vendorName, amount, currency, notes, expenseId }) {
  const [categories, settings] = await Promise.all([
    aiRepo.getCategories(workspaceId),
    aiRepo.getSettings(workspaceId),
  ]);

  if (!categories.length) {
    return {
      primary:      null,
      alternatives: [],
      reasoning:    'No expense categories configured for this workspace.',
      skipped:      true,
    };
  }

  // Inject workspace learning patterns when learning is enabled (default: on)
  const learningEnabled = settings?.learningEnabled !== false;
  const learningPatterns = learningEnabled
    ? await aiRepo.getLearningPatterns(workspaceId, { limit: 30 }).catch(() => [])
    : [];

  const prompt = buildCategorizationPrompt(categories, { description, vendorName, amount, currency, notes }, learningPatterns);

  const result = await aiSvc.execute({
    workspaceId,
    userId,
    feature:  'expense_categorization',
    messages: [{ role: 'user', content: prompt }],
    options:  { maxTokens: 800, temperature: 0.1, structured: true },
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
  getHistory:           (expenseId, opts)   => aiRepo.getHistory(expenseId, opts),
  getWorkspaceHistory:  (workspaceId, opts)  => aiRepo.getWorkspaceHistory(workspaceId, opts),
  getSettings:          (workspaceId)        => aiRepo.getSettings(workspaceId),
  upsertSettings:       (workspaceId, data)  => aiRepo.upsertSettings(workspaceId, data),
  getLatestRecommendation: (expenseId)       => aiRepo.getLatestRecommendation(expenseId),
  getLearningMetrics:   (workspaceId)        => aiRepo.getLearningMetrics(workspaceId),
};
