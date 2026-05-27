const repo   = require('./expense-insights.repository');
const ai     = require('../../lib/ai');
const aiSvc  = require('../ai/ai.service');

const getDashboard = (workspaceId) => repo.getDashboardStats(workspaceId);

const getAnalytics = async (workspaceId, { months = 3, dimension = 'category' } = {}) => {
  const m = parseInt(months, 10) || 3;
  const [byCategory, byMonth, byDepartment, bySupplier, byEmployee] = await Promise.all([
    repo.getByCategory(workspaceId, { months: m }),
    repo.getByMonth(workspaceId, { months: Math.max(m, 12) }),
    repo.getByDepartment(workspaceId, { months: m }),
    repo.getBySupplier(workspaceId, { months: m }),
    repo.getByEmployee(workspaceId, { months: m }),
  ]);
  return { byCategory, byMonth, byDepartment, bySupplier, byEmployee };
};

const checkDuplicates = async (workspaceId, { supplierId, vendorName, amount, expenseDate, expenseId }) => {
  if (!amount || !expenseDate) return { duplicates: [], isDuplicate: false };
  const dupes = await repo.findPotentialDuplicates(workspaceId, { supplierId, vendorName, amount, expenseDate, excludeId: expenseId });
  return { duplicates: dupes, isDuplicate: dupes.length > 0, exactMatch: dupes.some(d => d.status !== 'cancelled') };
};

const suggestCategory = async (workspaceId, { supplierId, vendorName, description }) => {
  const categories = await repo.getCategories(workspaceId);
  if (!categories.length) return { suggestions: [] };

  // History-based: check past expenses for this supplier
  let historyMatch = null;
  if (supplierId) {
    const past = await repo.getPastExpensesBySupplier(workspaceId, supplierId);
    if (past.length) {
      const freq = {};
      past.forEach(e => { if (e.categoryId) freq[e.categoryId] = (freq[e.categoryId] || 0) + 1; });
      const topId = Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0];
      if (topId) {
        const cat = categories.find(c => c.id === topId);
        if (cat) historyMatch = { categoryId: cat.id, name: cat.name, confidence: 90, reason: 'Based on expense history with this supplier' };
      }
    }
  }

  // AI-based suggestion
  let aiSuggestion = null;
  if (ai.isAvailable()) {
    const catList = categories.map(c => `${c.id}: ${c.name}`).join('\n');
    const prompt  = `You are a finance assistant. Given the following expense details, suggest the most appropriate category.\n\nSupplier/Vendor: ${vendorName || 'Unknown'}\nDescription: ${description || 'N/A'}\n\nAvailable categories:\n${catList}\n\nRespond with JSON only: {"categoryId":"<id>","name":"<name>","confidence":<0-100>,"reason":"<one sentence>"}`;
    try {
      const raw = await ai.generate(prompt, 256);
      const parsed = JSON.parse(raw.trim());
      if (parsed.categoryId && categories.find(c => c.id === parsed.categoryId)) {
        aiSuggestion = parsed;
      }
    } catch { /* ignore parse errors */ }
  }

  // Keyword-based fallback
  const text = `${vendorName || ''} ${description || ''}`.toLowerCase();
  let keywordMatch = null;
  const keywords = {
    'travel': ['travel','flight','hotel','airfare','uber','taxi','transport','accommodation'],
    'software': ['software','saas','subscription','license','cloud','hosting','azure','aws','google'],
    'food': ['food','restaurant','meal','coffee','lunch','dinner','catering'],
    'office': ['office','supplies','stationery','furniture','equipment'],
    'marketing': ['marketing','advertising','ads','campaign','promotion','social media'],
    'utilities': ['utilities','electricity','water','internet','phone','telecom'],
  };
  for (const [theme, terms] of Object.entries(keywords)) {
    if (terms.some(t => text.includes(t))) {
      const cat = categories.find(c => c.name.toLowerCase().includes(theme));
      if (cat) { keywordMatch = { categoryId: cat.id, name: cat.name, confidence: 65, reason: 'Matched by keyword analysis' }; break; }
    }
  }

  const suggestions = [historyMatch, aiSuggestion, keywordMatch].filter(Boolean);
  return { suggestions: suggestions.slice(0, 2) };
};

const getInsights = (workspaceId) => repo.getInsights(workspaceId);

const generateInsights = async (workspaceId) => {
  const [stats, byCategory, byMonth, bySupplier] = await Promise.all([
    repo.getDashboardStats(workspaceId),
    repo.getByCategory(workspaceId, { months: 2 }),
    repo.getByMonth(workspaceId, { months: 3 }),
    repo.getBySupplier(workspaceId, { months: 1 }),
  ]);

  const insights = [];

  // Rule-based insights
  if (byMonth.length >= 2) {
    const [prev, curr] = byMonth.slice(-2);
    if (curr && prev && prev.amount > 0) {
      const change = ((curr.amount - prev.amount) / prev.amount) * 100;
      if (Math.abs(change) >= 10) {
        insights.push({
          insightType: change > 0 ? 'cost_increase' : 'cost_reduction',
          title: change > 0 ? 'Spending Increase Detected' : 'Spending Decrease',
          description: `Total expenses ${change > 0 ? 'increased' : 'decreased'} by ${Math.abs(change).toFixed(1)}% compared to last month.`,
          severity: change > 20 ? 'warning' : 'info',
          period: 'monthly',
        });
      }
    }
  }

  if (byCategory.length && stats.monthSpend > 0) {
    const top = byCategory[0];
    const pct = (top.amount / stats.monthSpend * 100).toFixed(1);
    if (parseFloat(pct) > 30) {
      insights.push({
        insightType: 'category_concentration',
        title: 'Category Concentration',
        description: `${top.name} represents ${pct}% of total expenses in the past period.`,
        severity: 'info',
        period: 'monthly',
        metadata: { categoryId: top.categoryId, categoryName: top.name, percentage: pct },
      });
    }
  }

  if (bySupplier.length && stats.monthSpend > 0) {
    const top = bySupplier[0];
    const pct = (top.amount / stats.monthSpend * 100).toFixed(1);
    if (parseFloat(pct) > 25) {
      insights.push({
        insightType: 'supplier_concentration',
        title: 'Supplier Concentration',
        description: `${top.name} accounts for ${pct}% of monthly spending. Consider diversifying vendors.`,
        severity: 'info',
        period: 'monthly',
        metadata: { supplierId: top.supplierId, supplierName: top.name, percentage: pct },
      });
    }
  }

  if (stats.pendingApproval > 5) {
    insights.push({
      insightType: 'approval_backlog',
      title: 'Approval Backlog',
      description: `${stats.pendingApproval} expenses are pending approval. Review the approval queue.`,
      severity: 'warning',
      period: 'current',
    });
  }

  // AI-generated insight
  if (ai.isAvailable() && stats.monthSpend > 0) {
    const summary = `Monthly spend: ${stats.monthSpend}. Top categories: ${byCategory.slice(0,3).map(c=>c.name+'('+c.amount+')').join(', ')}. Pending: ${stats.pendingApproval}.`;
    const prompt  = `As a finance analyst, provide ONE concise spending insight (1-2 sentences) based on: ${summary}. Return JSON: {"title":"...","description":"...","insightType":"ai_observation","severity":"info"}`;
    try {
      const raw = await ai.generate(prompt, 200);
      const parsed = JSON.parse(raw.trim());
      if (parsed.title && parsed.description) {
        insights.push({ ...parsed, period: 'monthly' });
      }
    } catch { /* ignore */ }
  }

  await repo.clearInsights(workspaceId);
  if (insights.length) await repo.saveInsights(workspaceId, insights);
  return repo.getInsights(workspaceId);
};

const getForecast = async (workspaceId) => {
  const months = await repo.getByMonth(workspaceId, { months: 6 });
  if (months.length < 2) return { forecast: null, trend: 'insufficient_data' };

  const recent = months.slice(-3);
  const avg    = recent.reduce((s, m) => s + m.amount, 0) / recent.length;

  const now     = new Date();
  const elapsed = now.getDate() / new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const current = months[months.length - 1]?.amount || 0;
  const projected = elapsed > 0 ? current / elapsed : avg;

  const trend = projected > avg * 1.1 ? 'increasing' : projected < avg * 0.9 ? 'decreasing' : 'stable';

  return {
    threeMonthAvg: Math.round(avg),
    currentMonthActual: Math.round(current),
    currentMonthProjected: Math.round(projected),
    trend,
    historicalMonths: months,
  };
};

const detectAnomalies = async (workspaceId) => {
  const [expenses, byCategory] = await Promise.all([
    repo.getRecentExpenses(workspaceId, { months: 1 }),
    repo.getByCategory(workspaceId, { months: 6 }),
  ]);

  const avgByCategory = {};
  await Promise.all(
    byCategory.map(async c => {
      if (c.categoryId) {
        const stat = await repo.getCategoryAverage(workspaceId, c.categoryId);
        avgByCategory[c.categoryId] = stat.average;
      }
    })
  );

  const anomalies = [];
  const seen = {};

  for (const exp of expenses) {
    // Large expense vs category average
    if (exp.categoryId && avgByCategory[exp.categoryId] > 0) {
      const avg = avgByCategory[exp.categoryId];
      const ratio = Number(exp.amount) / avg;
      if (ratio >= 3) {
        anomalies.push({
          expenseId: exp.id,
          anomalyType: 'abnormally_large',
          riskLevel: ratio >= 5 ? 'high' : 'medium',
          explanation: `This expense is ${ratio.toFixed(1)}x the average for ${exp.category?.name || 'this category'} (avg: ${avg.toFixed(2)}).`,
          metadata: { ratio, categoryAverage: avg },
        });
      }
    }

    // Duplicate detection — same supplier + similar amount same day
    const key = `${exp.supplierId}-${Number(exp.amount).toFixed(0)}-${exp.expenseDate}`;
    if (seen[key]) {
      anomalies.push({
        expenseId: exp.id,
        anomalyType: 'possible_duplicate',
        riskLevel: 'medium',
        explanation: `Possible duplicate: similar expense with the same supplier and amount on the same date.`,
        metadata: { relatedExpenseId: seen[key] },
      });
    } else if (exp.supplierId) {
      seen[key] = exp.id;
    }
  }

  await repo.clearAnomalies(workspaceId);
  if (anomalies.length) await repo.saveAnomalies(workspaceId, anomalies);
  return repo.getAnomalies(workspaceId);
};

const getAnomalies = (workspaceId) => repo.getAnomalies(workspaceId);

const reviewAnomaly = (workspaceId, id) => repo.markAnomalyReviewed(id, workspaceId);

const naturalLanguageSearch = async (workspaceId, { query }) => {
  if (!query) return { expenses: [], summary: null };

  const categories = await repo.getCategories(workspaceId);
  const catList    = categories.map(c => c.name).join(', ');

  let parsedFilters = null;

  if (ai.isAvailable()) {
    const prompt = `Parse this expense search query into structured filters. Today is ${new Date().toISOString().split('T')[0]}.\n\nQuery: "${query}"\nAvailable categories: ${catList}\n\nReturn JSON only:\n{"startDate":"YYYY-MM-DD or null","endDate":"YYYY-MM-DD or null","categoryName":"or null","supplierName":"or null","minAmount":null,"maxAmount":null,"status":"or null","description":"keyword or null"}`;
    try {
      const raw = await ai.generate(prompt, 300);
      parsedFilters = JSON.parse(raw.trim());
    } catch { /* fallback to keyword */ }
  }

  // Build Prisma where clause
  const where = { status: { notIn: ['cancelled'] } };

  if (parsedFilters) {
    if (parsedFilters.startDate) where.expenseDate = { ...where.expenseDate, gte: new Date(parsedFilters.startDate) };
    if (parsedFilters.endDate)   where.expenseDate = { ...where.expenseDate, lte: new Date(parsedFilters.endDate)   };
    if (parsedFilters.minAmount) where.amount = { ...where.amount, gte: parseFloat(parsedFilters.minAmount) };
    if (parsedFilters.maxAmount) where.amount = { ...where.amount, lte: parseFloat(parsedFilters.maxAmount) };
    if (parsedFilters.status)    where.status = parsedFilters.status;
    if (parsedFilters.categoryName) {
      const cat = categories.find(c => c.name.toLowerCase().includes(parsedFilters.categoryName.toLowerCase()));
      if (cat) where.categoryId = cat.id;
    }
    if (parsedFilters.description) {
      where.OR = [
        { description: { contains: parsedFilters.description, mode: 'insensitive' } },
        { vendorName:  { contains: parsedFilters.description, mode: 'insensitive' } },
      ];
    }
    if (parsedFilters.supplierName) {
      where.OR = [
        ...(where.OR || []),
        { supplier: { name: { contains: parsedFilters.supplierName, mode: 'insensitive' } } },
        { vendorName: { contains: parsedFilters.supplierName, mode: 'insensitive' } },
      ];
    }
  } else {
    // Keyword fallback
    where.OR = [
      { description: { contains: query, mode: 'insensitive' } },
      { vendorName:  { contains: query, mode: 'insensitive' } },
    ];
  }

  const expenses = await repo.searchExpenses(workspaceId, where);
  const total    = expenses.reduce((s, e) => s + Number(e.amount), 0);

  return {
    expenses,
    count:       expenses.length,
    totalAmount: total,
    parsedAs:    parsedFilters,
    query,
  };
};

const getRecommendations = async (workspaceId) => {
  const [stats, byCategory, budgetMonitoring] = await Promise.all([
    repo.getDashboardStats(workspaceId),
    repo.getByCategory(workspaceId, { months: 1 }),
    require('../budgets/budgets.repository').getMonitoring(workspaceId),
  ]);

  const recommendations = [];

  // Budget recommendations
  for (const b of budgetMonitoring) {
    if (b.utilization >= 90) {
      recommendations.push({
        type: 'budget_risk',
        priority: 'high',
        title: `${b.name} Budget Critical`,
        description: `${b.name} budget is at ${b.utilization}% utilization. Consider reviewing spending or adjusting the budget.`,
        metadata: { budgetId: b.id, utilization: b.utilization },
      });
    } else if (b.utilization >= 75) {
      recommendations.push({
        type: 'budget_warning',
        priority: 'medium',
        title: `${b.name} Budget Warning`,
        description: `${b.name} budget has reached ${b.utilization}% utilization with remaining period ahead.`,
        metadata: { budgetId: b.id, utilization: b.utilization },
      });
    }
  }

  if (stats.pendingApproval > 3) {
    recommendations.push({
      type: 'approval_action',
      priority: 'medium',
      title: 'Approval Queue Needs Attention',
      description: `${stats.pendingApproval} expenses are waiting for approval. Delays may impact financial reporting.`,
      metadata: { pendingCount: stats.pendingApproval },
    });
  }

  if (stats.outstandingReimbursements > 0) {
    recommendations.push({
      type: 'reimbursement_action',
      priority: 'low',
      title: 'Outstanding Reimbursements',
      description: `There are outstanding employee reimbursements totaling ${stats.outstandingReimbursements.toFixed(2)}. Review the reimbursements queue.`,
      metadata: { amount: stats.outstandingReimbursements },
    });
  }

  return recommendations;
};

const getVendors = (workspaceId) => repo.getVendorIntelligence(workspaceId);

const generateSummary = async (workspaceId) => {
  const [stats, byCategory, byMonth, anomalies] = await Promise.all([
    repo.getDashboardStats(workspaceId),
    repo.getByCategory(workspaceId, { months: 1 }),
    repo.getByMonth(workspaceId, { months: 2 }),
    repo.getAnomalies(workspaceId),
  ]);

  if (!stats.monthSpend) {
    return { summary: 'No expense data recorded this month.', keyMetrics: [], risks: [], generatedAt: new Date() };
  }

  const topCats  = byCategory.slice(0, 3).map(c => `${c.name} (${Number(c.amount).toFixed(0)})`).join(', ');
  const prev     = byMonth[byMonth.length - 2];
  const curr     = byMonth[byMonth.length - 1];
  const momChange = prev && prev.amount > 0
    ? parseFloat(((curr?.amount - prev.amount) / prev.amount * 100).toFixed(1))
    : null;
  const unreviewedAnomalies = anomalies.filter(a => !a.isReviewed).length;

  const context = [
    `Total spend this month: ${Number(stats.monthSpend).toFixed(2)}`,
    `Top categories: ${topCats || 'N/A'}`,
    `Month-over-month change: ${momChange !== null ? `${momChange > 0 ? '+' : ''}${momChange}%` : 'N/A'}`,
    `Pending approval: ${stats.pendingApproval}`,
    `Unreviewed anomalies: ${unreviewedAnomalies}`,
    `Outstanding reimbursements: ${Number(stats.outstandingReimbursements).toFixed(2)}`,
  ].join('\n');

  const prompt = `You are a financial analyst AI. Write a concise 3-sentence executive expense summary. Be professional and specific. Highlight key trends and any risks.\n\n${context}\n\nReturn JSON only:\n{"summary":"<3 sentences>","keyMetrics":[{"label":"<label>","value":"<value>","trend":"up|down|stable"}],"risks":["<risk or empty array>"]}`;

  let parsed = null;
  try {
    const result = await aiSvc.execute({
      workspaceId,
      userId:   null,
      feature:  'expense_summary',
      messages: [{ role: 'user', content: prompt }],
      options:  { maxTokens: 500, temperature: 0.2, structured: true },
    });
    parsed = (() => {
      try {
        const text = (result.response || '').trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
        return JSON.parse(text);
      } catch { return null; }
    })();
  } catch { /* fallback to rule-based summary */ }

  return {
    summary:    parsed?.summary    || `This month's total expenses are ${Number(stats.monthSpend).toFixed(2)}. Top spending areas include ${topCats || 'various categories'}.${momChange !== null ? ` Spending has ${momChange > 0 ? 'increased' : 'decreased'} by ${Math.abs(momChange)}% vs last month.` : ''}`,
    keyMetrics: parsed?.keyMetrics || [
      { label: 'Month Spend',      value: Number(stats.monthSpend).toFixed(2),            trend: momChange > 0 ? 'up' : momChange < 0 ? 'down' : 'stable' },
      { label: 'Pending Approval', value: String(stats.pendingApproval),                  trend: stats.pendingApproval > 5 ? 'up' : 'stable' },
      { label: 'Anomalies',        value: String(unreviewedAnomalies),                    trend: unreviewedAnomalies > 0 ? 'up' : 'stable' },
    ],
    risks:      parsed?.risks      || (unreviewedAnomalies > 0 ? [`${unreviewedAnomalies} unreviewed spending anomalies detected`] : []),
    generatedAt: new Date(),
    monthSpend:  stats.monthSpend,
    momChange,
  };
};

module.exports = {
  getDashboard, getAnalytics, checkDuplicates, suggestCategory,
  getInsights, generateInsights, getForecast,
  detectAnomalies, getAnomalies, reviewAnomaly,
  naturalLanguageSearch, getRecommendations,
  getVendors, generateSummary,
};
