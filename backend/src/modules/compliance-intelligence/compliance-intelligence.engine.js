const prisma = require('../../lib/prisma');

const today = () => new Date();
const daysUntil = (d) => Math.ceil((new Date(d) - today()) / 86400000);
const daysSince = (d) => Math.floor((today() - new Date(d)) / 86400000);

const SEVERITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };

const HEALTH_STATUS = [
  { min: 90, status: 'excellent', label: 'Excellent' },
  { min: 75, status: 'good', label: 'Good' },
  { min: 50, status: 'moderate', label: 'Moderate Risk' },
  { min: 25, status: 'high', label: 'High Risk' },
  { min: 0,  status: 'critical', label: 'Critical' },
];

function scoreStatus(score) {
  return HEALTH_STATUS.find(h => score >= h.min) || HEALTH_STATUS[HEALTH_STATUS.length - 1];
}

async function calculateHealthScore(workspaceId) {
  const now = today();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonthEnd   = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const [overdue, total, completedThisMonth, totalThisMonth, recentCompleted] = await Promise.all([
    prisma.complianceOccurrence.count({
      where: { workspaceId, dueDate: { lt: now }, status: { notIn: ['completed', 'cancelled', 'waived'] } },
    }),
    prisma.complianceOccurrence.count({
      where: { workspaceId, status: { notIn: ['cancelled'] } },
    }),
    prisma.complianceOccurrence.count({
      where: { workspaceId, status: 'completed', updatedAt: { gte: thisMonthStart, lte: thisMonthEnd } },
    }),
    prisma.complianceOccurrence.count({
      where: {
        workspaceId,
        dueDate: { gte: thisMonthStart, lte: thisMonthEnd },
        status: { notIn: ['cancelled'] },
      },
    }),
    prisma.complianceOccurrence.count({
      where: { workspaceId, status: 'completed', updatedAt: { gte: new Date(Date.now() - 30 * 86400000) } },
    }),
  ]);

  let score = 100;
  const factors = {};

  // Overdue penalty (up to -60)
  const overduePenalty = Math.min(overdue * 15, 60);
  score -= overduePenalty;
  factors.overdue = { count: overdue, penalty: -overduePenalty };

  // Activity bonus: reward recent completions
  if (recentCompleted > 0) {
    const activityBonus = Math.min(recentCompleted * 2, 10);
    score += activityBonus;
    factors.recentActivity = { count: recentCompleted, bonus: activityBonus };
  } else if (total > 0) {
    // Inactivity penalty
    score -= 10;
    factors.inactivity = { penalty: -10 };
  }

  // Monthly completion rate bonus
  if (totalThisMonth > 0) {
    const rate = completedThisMonth / totalThisMonth;
    if (rate >= 0.8) {
      score += 5;
      factors.monthlyRate = { rate: Math.round(rate * 100), bonus: 5 };
    } else if (rate < 0.3) {
      score -= 5;
      factors.monthlyRate = { rate: Math.round(rate * 100), penalty: -5 };
    }
  }

  score = Math.max(0, Math.min(100, Math.round(score)));
  const { status, label } = scoreStatus(score);

  return { score, status, label, factors };
}

async function detectRisks(workspaceId) {
  const now = today();
  const sevenDaysAhead  = new Date(Date.now() + 7  * 86400000);
  const fourteenDaysAhead = new Date(Date.now() + 14 * 86400000);
  const thirtyDaysAgo   = new Date(Date.now() - 30 * 86400000);

  const risks = [];

  // 1. Overdue obligations — Critical/High based on how long overdue
  const overdue = await prisma.complianceOccurrence.findMany({
    where: { workspaceId, dueDate: { lt: now }, status: { notIn: ['completed', 'cancelled', 'waived'] } },
    orderBy: { dueDate: 'asc' },
    take: 50,
    select: { id: true, name: true, dueDate: true, priority: true, category: { select: { name: true } } },
  }).catch(() => []);

  for (const o of overdue) {
    const days = daysSince(o.dueDate);
    const severity = days >= 14 ? 'critical' : days >= 7 ? 'high' : 'medium';
    risks.push({
      severity,
      category: 'OVERDUE',
      description: `"${o.name}" was due ${days} day${days !== 1 ? 's' : ''} ago and has not been completed.`,
      source: 'Compliance Calendar',
      relatedEntityId: o.id,
      relatedEntityType: 'ComplianceOccurrence',
      actionabilityStatus: 'pending',
      actionabilityScore: severity === 'critical' ? 95 : severity === 'high' ? 80 : 60,
      recommendedActionType: 'complete_occurrence',
    });
  }

  // 2. Near-overdue — items due within 7 days
  const nearDue = await prisma.complianceOccurrence.findMany({
    where: {
      workspaceId,
      dueDate: { gte: now, lte: sevenDaysAhead },
      status: { notIn: ['completed', 'cancelled', 'waived'] },
    },
    orderBy: { dueDate: 'asc' },
    take: 30,
    select: { id: true, name: true, dueDate: true, priority: true },
  }).catch(() => []);

  for (const o of nearDue) {
    const days = daysUntil(o.dueDate);
    risks.push({
      severity: days <= 3 ? 'high' : 'medium',
      category: 'NEAR_OVERDUE',
      description: `"${o.name}" is due in ${days} day${days !== 1 ? 's' : ''} and has not been completed.`,
      source: 'Compliance Calendar',
      relatedEntityId: o.id,
      relatedEntityType: 'ComplianceOccurrence',
      actionabilityStatus: 'pending',
      actionabilityScore: days <= 3 ? 85 : 65,
      recommendedActionType: 'review_occurrence',
    });
  }

  // 3. Compliance inactivity — no completed items in last 30 days but obligations exist
  const [hasObligations, recentCompleted] = await Promise.all([
    prisma.complianceOccurrence.count({ where: { workspaceId, status: { notIn: ['cancelled'] } } }),
    prisma.complianceOccurrence.count({ where: { workspaceId, status: 'completed', updatedAt: { gte: thirtyDaysAgo } } }),
  ]).catch(() => [0, 0]);

  if (hasObligations > 3 && recentCompleted === 0) {
    risks.push({
      severity: 'medium',
      category: 'INACTIVITY',
      description: 'No compliance obligations have been completed in the last 30 days despite active obligations existing.',
      source: 'Activity Analysis',
      relatedEntityId: null,
      relatedEntityType: null,
      actionabilityStatus: 'pending',
      actionabilityScore: 55,
      recommendedActionType: 'review_compliance_status',
    });
  }

  // 4. Repeated overdue — templates that have multiple overdue occurrences
  const templateOverdueCounts = {};
  for (const o of overdue) {
    // Group by name prefix (simplified — real impl would join template)
    const key = o.name.split(' ').slice(0, 3).join(' ');
    templateOverdueCounts[key] = (templateOverdueCounts[key] || 0) + 1;
  }
  for (const [name, count] of Object.entries(templateOverdueCounts)) {
    if (count >= 2) {
      risks.push({
        severity: 'high',
        category: 'REPEATED_FAILURE',
        description: `Multiple occurrences related to "${name}" are overdue (${count} items). This indicates a systemic compliance gap.`,
        source: 'Pattern Analysis',
        relatedEntityId: null,
        relatedEntityType: null,
        actionabilityStatus: 'pending',
        actionabilityScore: 75,
        recommendedActionType: 'review_template',
      });
    }
  }

  // 5. No templates configured
  const templateCount = await prisma.complianceTemplate.count({ where: { workspaceId, isActive: true } }).catch(() => 0);
  if (templateCount === 0) {
    risks.push({
      severity: 'medium',
      category: 'NO_OBLIGATIONS',
      description: 'No active compliance obligations have been configured. The workspace may have compliance requirements that are not being tracked.',
      source: 'Configuration Check',
      relatedEntityId: null,
      relatedEntityType: null,
      actionabilityStatus: 'pending',
      actionabilityScore: 50,
      recommendedActionType: 'configure_templates',
    });
  }

  // Sort by severity
  risks.sort((a, b) => (SEVERITY_ORDER[a.severity] ?? 4) - (SEVERITY_ORDER[b.severity] ?? 4));

  return risks;
}

function generateRecommendations(risks, healthScore) {
  const recs = [];
  const categories = {};
  for (const r of risks) {
    categories[r.category] = (categories[r.category] || 0) + 1;
  }

  const overdueCount = categories['OVERDUE'] || 0;
  const nearDueCount = categories['NEAR_OVERDUE'] || 0;
  const hasInactivity = categories['INACTIVITY'] > 0;
  const hasRepeated = categories['REPEATED_FAILURE'] > 0;
  const noObligations = categories['NO_OBLIGATIONS'] > 0;

  if (overdueCount > 0) {
    recs.push({
      recommendation: `Review and action ${overdueCount} overdue compliance obligation${overdueCount > 1 ? 's' : ''} immediately.`,
      reason: `Overdue obligations represent ${overdueCount} unmet compliance requirement${overdueCount > 1 ? 's' : ''} that may expose the organization to regulatory risk.`,
      confidenceLevel: 'high',
      priority: 'critical',
      category: 'OVERDUE',
      actionabilityStatus: 'pending',
      actionabilityScore: 90,
      recommendedActionType: 'complete_overdue',
    });
  }

  if (nearDueCount > 0) {
    recs.push({
      recommendation: `Prepare ${nearDueCount} compliance item${nearDueCount > 1 ? 's' : ''} due within 7 days to avoid late submissions.`,
      reason: `${nearDueCount} obligation${nearDueCount > 1 ? 's are' : ' is'} approaching their deadline. Early preparation reduces the risk of missed filings.`,
      confidenceLevel: 'high',
      priority: 'high',
      category: 'NEAR_OVERDUE',
      actionabilityStatus: 'pending',
      actionabilityScore: 80,
      recommendedActionType: 'prepare_upcoming',
    });
  }

  if (hasRepeated) {
    recs.push({
      recommendation: 'Investigate and resolve systemic compliance issues causing repeated obligation failures.',
      reason: 'Pattern analysis shows multiple occurrences of the same obligation type are overdue, suggesting a structural gap in your compliance process.',
      confidenceLevel: 'medium',
      priority: 'high',
      category: 'REPEATED_FAILURE',
      actionabilityStatus: 'pending',
      actionabilityScore: 70,
      recommendedActionType: 'review_process',
    });
  }

  if (hasInactivity) {
    recs.push({
      recommendation: 'Review your compliance calendar and confirm the status of all pending obligations.',
      reason: 'No compliance activities have been completed in the last 30 days despite having active obligations, which may indicate that obligations are not being monitored.',
      confidenceLevel: 'medium',
      priority: 'medium',
      category: 'INACTIVITY',
      actionabilityStatus: 'pending',
      actionabilityScore: 60,
      recommendedActionType: 'review_calendar',
    });
  }

  if (noObligations) {
    recs.push({
      recommendation: 'Configure your compliance obligations by setting up compliance templates applicable to your business.',
      reason: 'Without active compliance templates, the platform cannot monitor or alert on your specific regulatory requirements.',
      confidenceLevel: 'high',
      priority: 'medium',
      category: 'CONFIGURATION',
      actionabilityStatus: 'pending',
      actionabilityScore: 50,
      recommendedActionType: 'configure_templates',
    });
  }

  if (healthScore >= 90) {
    recs.push({
      recommendation: 'Maintain your current compliance routine and continue monitoring upcoming deadlines.',
      reason: 'Your compliance health score is excellent. The best action is to maintain your current practices and stay alert to upcoming obligations.',
      confidenceLevel: 'high',
      priority: 'low',
      category: 'MAINTENANCE',
      actionabilityStatus: 'pending',
      actionabilityScore: 30,
      recommendedActionType: 'maintain_routine',
    });
  }

  return recs;
}

async function analyzeTrends(workspaceId, snapshots) {
  if (snapshots.length < 2) return { direction: 'insufficient_data', change: 0, data: snapshots };

  const sorted = [...snapshots].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  const oldest = sorted[0].score;
  const newest = sorted[sorted.length - 1].score;
  const change = newest - oldest;

  let direction = 'stable';
  if (change >= 5) direction = 'improving';
  if (change <= -5) direction = 'declining';

  return { direction, change, data: sorted };
}

module.exports = { calculateHealthScore, detectRisks, generateRecommendations, analyzeTrends, scoreStatus };
