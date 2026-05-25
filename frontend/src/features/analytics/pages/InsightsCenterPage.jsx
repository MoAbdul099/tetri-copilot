import { useState } from 'react';
import { Loader2, RefreshCw, Lightbulb } from 'lucide-react';
import { useInsights, useRiskAlerts } from '../hooks/useAnalytics.js';
import InsightCard   from '../components/InsightCard.jsx';
import RiskAlertsPanel from '../components/RiskAlertsPanel.jsx';
import analyticsService from '../services/analyticsService.js';

const CATEGORIES = ['All', 'revenue', 'collections', 'expenses', 'compliance', 'customers'];
const SEVERITIES = ['All', 'critical', 'warning', 'info'];

export default function InsightsCenterPage() {
  const [category,  setCategory]  = useState('All');
  const [severity,  setSeverity]  = useState('All');
  const [refreshing, setRefreshing] = useState(false);
  const [dismissed, setDismissed] = useState(new Set());

  const params = {
    ...(category !== 'All' ? { category } : {}),
    ...(severity !== 'All' ? { status: 'new' } : {}),
  };

  const { data: insights, loading: iLoading, refresh: refreshInsights } = useInsights(params);
  const { data: alerts,   loading: aLoading, refresh: refreshAlerts }   = useRiskAlerts();

  const handleRefresh = async () => {
    setRefreshing(true);
    try { await analyticsService.refresh(); await Promise.all([refreshInsights(), refreshAlerts()]); } catch (_) {}
    setRefreshing(false);
  };

  const handleDismissInsight = async (id) => {
    try { await analyticsService.dismissInsight(id); setDismissed((s) => new Set([...s, id])); } catch (_) {}
  };

  const handleDismissAlert = async (id) => {
    try { await analyticsService.dismissRiskAlert(id); setDismissed((s) => new Set([...s, id])); } catch (_) {}
  };

  const visibleInsights = (insights || []).filter((ins) => {
    if (dismissed.has(ins.id)) return false;
    if (severity !== 'All' && ins.severity !== severity) return false;
    return true;
  });

  const visibleAlerts = (alerts || []).filter((a) => !dismissed.has(a.id));

  return (
    <div className="px-4 sm:px-8 py-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-tetri-text">Insights Center</h1>
          <p className="text-sm text-tetri-muted mt-0.5">AI-generated insights and risk alerts for your business</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-1.5 text-sm border border-tetri-border px-3 py-1.5 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh Insights
        </button>
      </div>

      {/* Risk alerts */}
      {aLoading ? null : <RiskAlertsPanel alerts={visibleAlerts} onDismiss={handleDismissAlert} />}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex gap-1.5 flex-wrap">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`text-xs px-3 py-1.5 rounded-lg border capitalize transition-colors ${
                category === c ? 'bg-tetri-blue text-white border-tetri-blue' : 'border-tetri-border text-tetri-muted hover:bg-slate-50'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5 ml-auto">
          {SEVERITIES.map((s) => (
            <button
              key={s}
              onClick={() => setSeverity(s)}
              className={`text-xs px-3 py-1.5 rounded-lg border capitalize transition-colors ${
                severity === s ? 'bg-tetri-blue text-white border-tetri-blue' : 'border-tetri-border text-tetri-muted hover:bg-slate-50'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Insights list */}
      {iLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-5 h-5 animate-spin text-tetri-blue" />
        </div>
      ) : visibleInsights.length === 0 ? (
        <div className="bg-white rounded-card border border-tetri-border p-12 text-center">
          <Lightbulb className="w-8 h-8 text-tetri-muted mx-auto mb-3" />
          <p className="text-sm font-medium text-tetri-text">No insights at the moment</p>
          <p className="text-xs text-tetri-muted mt-1">
            Click <strong>Refresh Insights</strong> to generate fresh analysis from your current data.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {visibleInsights.map((ins) => (
            <InsightCard key={ins.id} insight={ins} onDismiss={handleDismissInsight} />
          ))}
        </div>
      )}
    </div>
  );
}
