/**
 * Rule-based insight and risk alert generation.
 * No ML — pure threshold logic applied to analytics engine output.
 */

function generateInsights(rev, col, exp, comp, cust) {
  const insights = [];

  // Revenue insights
  if (rev.growth > 10) {
    insights.push({
      category: 'revenue',
      severity: 'info',
      title: 'Revenue growth trending up',
      description: `Revenue grew ${rev.growth}% compared to the previous month.`,
      recommendation: 'Maintain current sales momentum and review top customer relationships.',
    });
  } else if (rev.growth < -10) {
    insights.push({
      category: 'revenue',
      severity: 'warning',
      title: 'Revenue declined this month',
      description: `Revenue dropped ${Math.abs(rev.growth)}% compared to the previous month.`,
      recommendation: 'Review outstanding quotes, follow up on delayed invoices, and assess pipeline activity.',
    });
  }

  if (rev.concentrationRisk === 'critical' || rev.concentrationRisk === 'high') {
    insights.push({
      category: 'revenue',
      severity: rev.concentrationRisk === 'critical' ? 'critical' : 'warning',
      title: 'High customer concentration risk',
      description: `Your top customer accounts for ${rev.topShare}% of current month revenue.`,
      recommendation: 'Diversify your customer base to reduce dependency on a single revenue source.',
    });
  }

  // Collection insights
  if (col.avgCollectionRate < 70) {
    insights.push({
      category: 'collections',
      severity: 'warning',
      title: 'Collection rate below threshold',
      description: `Average collection rate is ${col.avgCollectionRate}% — below the 70% benchmark.`,
      recommendation: 'Send payment reminders, review credit terms, and consider earlier follow-up for overdue invoices.',
    });
  }

  if (col.dso > 45) {
    insights.push({
      category: 'collections',
      severity: col.dso > 60 ? 'critical' : 'warning',
      title: 'Days Sales Outstanding is elevated',
      description: `DSO is ${col.dso} days — extended DSO reduces available cash.`,
      recommendation: 'Prioritise overdue collections and offer early payment incentives to high-DSO customers.',
    });
  }

  // Expense insights
  if (exp.growth > 20) {
    insights.push({
      category: 'expenses',
      severity: 'warning',
      title: 'Expense growth accelerating',
      description: `Expenses increased by ${exp.growth}% compared to the previous month.`,
      recommendation: 'Review top expense categories and assess whether increases are growth-related or wasteful.',
    });
  }

  if (exp.topCategories && exp.topCategories.length > 0) {
    const topCat = exp.topCategories[0];
    if (topCat.amount > 0) {
      insights.push({
        category: 'expenses',
        severity: 'info',
        title: `Top expense category: ${topCat.name}`,
        description: `${topCat.name} is your largest expense category this month at ${topCat.amount}.`,
        recommendation: 'Ensure budget is allocated appropriately and review for optimisation opportunities.',
      });
    }
  }

  // Compliance insights
  if (comp.totalOverdue > 0) {
    insights.push({
      category: 'compliance',
      severity: comp.totalOverdue >= 3 ? 'critical' : 'warning',
      title: `${comp.totalOverdue} overdue compliance obligation${comp.totalOverdue > 1 ? 's' : ''}`,
      description: `You have ${comp.totalOverdue} compliance item${comp.totalOverdue > 1 ? 's' : ''} past their due date.`,
      recommendation: 'Address overdue obligations immediately to avoid penalties and regulatory risk.',
    });
  }

  if (comp.upcoming30Days > 0) {
    insights.push({
      category: 'compliance',
      severity: 'info',
      title: `${comp.upcoming30Days} compliance deadline${comp.upcoming30Days > 1 ? 's' : ''} in the next 30 days`,
      description: `You have ${comp.upcoming30Days} upcoming compliance obligation${comp.upcoming30Days > 1 ? 's' : ''} due within 30 days.`,
      recommendation: 'Review and prepare for upcoming deadlines to stay compliant.',
    });
  }

  if (comp.avgCompletionRate < 80) {
    insights.push({
      category: 'compliance',
      severity: 'warning',
      title: 'Compliance completion rate is low',
      description: `Average completion rate across tracked periods is ${comp.avgCompletionRate}%.`,
      recommendation: 'Assign clear ownership to compliance tasks and set earlier internal deadlines.',
    });
  }

  // Customer insights
  const latestNewCust = cust.monthly[cust.monthly.length - 1]?.newCustomers || 0;
  if (latestNewCust === 0) {
    insights.push({
      category: 'customers',
      severity: 'info',
      title: 'No new customers acquired this month',
      description: 'No new customers were added in the current month.',
      recommendation: 'Review business development activities and ensure your sales pipeline is healthy.',
    });
  } else if (latestNewCust > 0) {
    insights.push({
      category: 'customers',
      severity: 'info',
      title: `${latestNewCust} new customer${latestNewCust > 1 ? 's' : ''} this month`,
      description: `${latestNewCust} new customer${latestNewCust > 1 ? 's' : ''} joined this month out of ${cust.total} total.`,
      recommendation: null,
    });
  }

  return insights;
}

function generateRiskAlerts(rev, col, cash) {
  const alerts = [];

  // Cash flow risk
  if (cash.d30 < 0) {
    alerts.push({
      riskType: 'cash_flow',
      severity: 'critical',
      details: {
        message: 'Projected negative cash position in 30 days',
        cashD30: cash.d30,
        cashD60: cash.d60,
        cashD90: cash.d90,
        recommendation: 'Accelerate collections, defer non-critical expenses, or arrange a credit facility.',
      },
    });
  } else if (cash.d30 < cash.d60 * 0.5 && cash.d30 > 0) {
    alerts.push({
      riskType: 'cash_flow',
      severity: 'medium',
      details: {
        message: 'Cash position declining significantly over 30–60 day horizon',
        cashD30: cash.d30,
        cashD60: cash.d60,
        recommendation: 'Monitor closely and review upcoming large expense commitments.',
      },
    });
  }

  // Collection risk
  if (col.outstanding > 0 && col.dso > 45) {
    alerts.push({
      riskType: 'collection',
      severity: col.dso > 60 ? 'high' : 'medium',
      details: {
        message: `Outstanding AR of ${col.outstanding} with DSO of ${col.dso} days`,
        outstanding: col.outstanding,
        dso: col.dso,
        recommendation: 'Initiate structured collections process for overdue accounts.',
      },
    });
  }

  // Concentration risk
  if (rev.concentrationRisk === 'critical') {
    alerts.push({
      riskType: 'concentration',
      severity: 'high',
      details: {
        message: `Top customer represents ${rev.topShare}% of revenue`,
        topShare: rev.topShare,
        recommendation: 'Prioritise customer diversification to reduce single-customer dependency.',
      },
    });
  }

  // Revenue decline risk
  if (rev.growth < -20) {
    alerts.push({
      riskType: 'revenue_decline',
      severity: 'high',
      details: {
        message: `Revenue declined ${Math.abs(rev.growth)}% month-over-month`,
        growth: rev.growth,
        current: rev.current,
        previous: rev.previous,
        recommendation: 'Investigate root cause of revenue decline and take corrective action immediately.',
      },
    });
  }

  return alerts;
}

module.exports = { generateInsights, generateRiskAlerts };
