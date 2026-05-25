import { useState } from 'react';
import { RefreshCw, Loader2 } from 'lucide-react';
import { useAnalyticsDashboard } from '../hooks/useAnalytics.js';
import HealthScoreWidget from '../components/HealthScoreWidget.jsx';
import ForecastWidget    from '../components/ForecastWidget.jsx';
import RiskAlertsPanel   from '../components/RiskAlertsPanel.jsx';
import TrendChart        from '../components/TrendChart.jsx';
import MetricCard        from '../components/MetricCard.jsx';
import analyticsService  from '../services/analyticsService.js';

export default function AnalyticsDashboardPage() {
  const { data, loading, error, refresh } = useAnalyticsDashboard();
  const [refreshing, setRefreshing] = useState(false);
  const [dismissedAlerts, setDismissedAlerts] = useState(new Set());

  const handleRefresh = async () => {
    setRefreshing(true);
    try { await analyticsService.refresh(); await refresh(); } catch (_) {}
    setRefreshing(false);
  };

  const handleDismissAlert = async (id) => {
    try { await analyticsService.dismissRiskAlert(id); setDismissedAlerts((s) => new Set([...s, id])); } catch (_) {}
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-tetri-blue" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 sm:px-8 py-6 max-w-7xl mx-auto">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  const { revenue, collections, expenses, compliance, customers, health, cash, cashRisk } = data || {};
  const currency = 'USD';

  const cashColor = cashRisk === 'critical' ? 'red' : cashRisk === 'amber' ? 'amber' : 'green';
  const visibleAlerts = (data?.risks || []).filter((a) => !dismissedAlerts.has(a.id));

  return (
    <div className="px-4 sm:px-8 py-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-tetri-text">Analytics</h1>
          <p className="text-sm text-tetri-muted mt-0.5">Trend analysis, forecasting & business intelligence</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-1.5 text-sm border border-tetri-border px-3 py-1.5 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Health + Risk row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <HealthScoreWidget health={health} />
        <RiskAlertsPanel alerts={visibleAlerts} onDismiss={handleDismissAlert} />
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard label="Revenue (this month)" value={revenue?.current} growth={revenue?.growth} currency={currency} />
        <MetricCard label="Collections (this month)" value={collections?.current} growth={collections?.growth} currency={currency} />
        <MetricCard label="Expenses (this month)" value={expenses?.current} growth={expenses?.growth} currency={currency} />
        <MetricCard label="Avg Collection Rate" value={`${collections?.avgCollectionRate ?? '—'}%`} isCurrency={false} subtitle={`DSO: ${collections?.dso ?? '—'} days`} />
      </div>

      {/* Trend charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue trend */}
        <div className="bg-white rounded-card border border-tetri-border p-5">
          <h3 className="text-sm font-semibold text-tetri-text mb-3">Revenue Trend</h3>
          <TrendChart data={revenue?.monthly || []} valueKey="revenue" color="#3b82f6" />
          <p className="text-xs text-tetri-muted mt-2">3-month avg: {revenue?.avg3 != null ? `$${revenue.avg3.toLocaleString()}` : '—'}</p>
        </div>

        {/* Collections trend */}
        <div className="bg-white rounded-card border border-tetri-border p-5">
          <h3 className="text-sm font-semibold text-tetri-text mb-3">Collections Trend</h3>
          <TrendChart data={collections?.monthly || []} valueKey="collected" color="#10b981" />
          <p className="text-xs text-tetri-muted mt-2">Outstanding AR: {collections?.outstanding != null ? `$${Number(collections.outstanding).toLocaleString()}` : '—'}</p>
        </div>

        {/* Expense trend */}
        <div className="bg-white rounded-card border border-tetri-border p-5">
          <h3 className="text-sm font-semibold text-tetri-text mb-3">Expense Trend</h3>
          <TrendChart data={expenses?.monthly || []} valueKey="expenses" color="#f59e0b" />
          <p className="text-xs text-tetri-muted mt-2">3-month avg: {expenses?.avg3 != null ? `$${expenses.avg3.toLocaleString()}` : '—'}</p>
        </div>
      </div>

      {/* Forecast row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ForecastWidget title="Revenue Forecast" forecast={revenue?.forecast} currency={currency} color="blue" />
        <ForecastWidget title="Collections Forecast" forecast={collections?.forecast} currency={currency} color="green" />
        <ForecastWidget title="Cash Position Forecast" forecast={cash} currency={currency} color={cashColor} />
      </div>

      {/* Top customers / top categories / compliance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Top customers */}
        <div className="bg-white rounded-card border border-tetri-border p-5">
          <h3 className="text-sm font-semibold text-tetri-text mb-3">Top Customers (This Month)</h3>
          {(revenue?.topCustomers || []).length === 0 ? (
            <p className="text-xs text-tetri-muted">No data yet.</p>
          ) : (
            <ul className="space-y-2">
              {revenue.topCustomers.map((c, i) => (
                <li key={i} className="flex items-center justify-between">
                  <span className="text-xs text-tetri-text truncate max-w-[140px]">{c.name}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-slate-100 rounded-full h-1.5">
                      <div className="bg-tetri-blue h-1.5 rounded-full" style={{ width: `${c.share}%` }} />
                    </div>
                    <span className="text-xs text-tetri-muted w-8 text-right">{c.share}%</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Top expense categories */}
        <div className="bg-white rounded-card border border-tetri-border p-5">
          <h3 className="text-sm font-semibold text-tetri-text mb-3">Top Expense Categories</h3>
          {(expenses?.topCategories || []).length === 0 ? (
            <p className="text-xs text-tetri-muted">No data yet.</p>
          ) : (
            <ul className="space-y-2">
              {expenses.topCategories.map((c, i) => (
                <li key={i} className="flex items-center justify-between">
                  <span className="text-xs text-tetri-text truncate max-w-[140px]">{c.name}</span>
                  <span className="text-xs font-semibold text-tetri-text">${Number(c.amount).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Compliance & customers */}
        <div className="bg-white rounded-card border border-tetri-border p-5 space-y-3">
          <h3 className="text-sm font-semibold text-tetri-text">Compliance & Customers</h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-slate-50 rounded-xl p-2.5 text-center">
              <p className="text-xs text-tetri-muted">Completion Rate</p>
              <p className="text-lg font-bold text-tetri-text">{compliance?.avgCompletionRate ?? '—'}%</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-2.5 text-center">
              <p className="text-xs text-tetri-muted">Overdue Items</p>
              <p className={`text-lg font-bold ${(compliance?.totalOverdue || 0) > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                {compliance?.totalOverdue ?? '—'}
              </p>
            </div>
            <div className="bg-slate-50 rounded-xl p-2.5 text-center">
              <p className="text-xs text-tetri-muted">Total Customers</p>
              <p className="text-lg font-bold text-tetri-text">{customers?.total ?? '—'}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-2.5 text-center">
              <p className="text-xs text-tetri-muted">Active Customers</p>
              <p className="text-lg font-bold text-tetri-text">{customers?.active ?? '—'}</p>
            </div>
          </div>
          <p className="text-xs text-tetri-muted">Due in 30 days: {compliance?.upcoming30Days ?? '—'} compliance items</p>
        </div>
      </div>
    </div>
  );
}
