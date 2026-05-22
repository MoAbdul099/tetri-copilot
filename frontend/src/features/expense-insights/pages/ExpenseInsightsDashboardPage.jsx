import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  Brain, TrendingUp, TrendingDown, AlertTriangle, CheckCircle,
  RefreshCw, Search, Lightbulb, Target, ArrowRight, Zap,
} from 'lucide-react';
import {
  getDashboard, getAnalytics, getInsights, generateInsights,
  getForecast, getAnomalies, detectAnomalies, getRecommendations, naturalLanguageSearch,
} from '../services/expenseInsightsService.js';

const fmt = (n) => Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });

const COLORS = ['#3b82f6','#8b5cf6','#06b6d4','#10b981','#f59e0b','#ef4444','#ec4899','#6366f1'];

const SEVERITY_STYLES = {
  warning: 'bg-amber-50 border-amber-200 text-amber-800',
  critical: 'bg-red-50 border-red-200 text-red-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
  ai_observation: 'bg-purple-50 border-purple-200 text-purple-800',
};

const RISK_STYLES = {
  high:   'bg-red-100 text-red-700 border-red-200',
  medium: 'bg-amber-100 text-amber-700 border-amber-200',
  low:    'bg-blue-100 text-blue-700 border-blue-200',
};

export default function ExpenseInsightsDashboardPage() {
  const navigate = useNavigate();
  const [stats,    setStats]    = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [insights, setInsights] = useState([]);
  const [forecast, setForecast] = useState(null);
  const [anomalies,setAnomalies]= useState([]);
  const [recommendations, setRecs] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [generating, setGenerating] = useState(false);
  const [detecting,  setDetecting]  = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searching, setSearching] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [s, a, i, f, an, r] = await Promise.all([
        getDashboard(), getAnalytics({ months: 3 }), getInsights(),
        getForecast(), getAnomalies(), getRecommendations(),
      ]);
      setStats(s); setAnalytics(a); setInsights(i);
      setForecast(f); setAnomalies(an); setRecs(r);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleGenerateInsights = async () => {
    setGenerating(true);
    try { const i = await generateInsights(); setInsights(i); } catch { /* ignore */ } finally { setGenerating(false); }
  };

  const handleDetectAnomalies = async () => {
    setDetecting(true);
    try { const a = await detectAnomalies(); setAnomalies(a); } catch { /* ignore */ } finally { setDetecting(false); }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    try { const r = await naturalLanguageSearch({ query: searchQuery }); setSearchResult(r); } catch { /* ignore */ } finally { setSearching(false); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-tetri-blue border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-tetri-muted text-sm">Loading intelligence…</p>
        </div>
      </div>
    );
  }

  const unreviewed = anomalies.filter(a => !a.isReviewed).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-tetri-text">Expense Intelligence</h1>
          <p className="text-tetri-muted text-sm mt-0.5">AI-powered spending insights and analytics</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleDetectAnomalies}
            disabled={detecting}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-tetri-border rounded-lg text-tetri-muted hover:bg-tetri-bg transition-colors disabled:opacity-50"
          >
            <Zap className="w-4 h-4" />
            {detecting ? 'Detecting…' : 'Detect Anomalies'}
          </button>
          <button
            onClick={handleGenerateInsights}
            disabled={generating}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-tetri-blue text-white rounded-lg hover:bg-tetri-blue-hover transition-colors disabled:opacity-50"
          >
            <Brain className="w-4 h-4" />
            {generating ? 'Generating…' : 'Generate Insights'}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'This Month',   value: fmt(stats.monthSpend),              sub: 'Current month spend' },
            { label: 'This Quarter', value: fmt(stats.quarterSpend),            sub: 'Quarter-to-date' },
            { label: 'This Year',    value: fmt(stats.yearSpend),               sub: 'Year-to-date' },
            { label: 'Pending Approval', value: stats.pendingApproval,          sub: 'Awaiting review', highlight: stats.pendingApproval > 0 },
            { label: 'Total Expenses',   value: stats.total,                    sub: 'All time' },
            { label: 'Approved',         value: stats.approved,                 sub: 'Approved expenses' },
            { label: 'Rejected',         value: stats.rejected,                 sub: 'Rejected expenses' },
            { label: 'Outstanding Reimb', value: fmt(stats.outstandingReimbursements), sub: 'Unpaid reimbursements' },
          ].map((k) => (
            <div key={k.label} className={`bg-tetri-surface border rounded-card p-4 ${k.highlight ? 'border-amber-200' : 'border-tetri-border'}`}>
              <p className="text-xs text-tetri-muted font-medium">{k.label}</p>
              <p className={`text-xl font-bold mt-1 ${k.highlight ? 'text-amber-600' : 'text-tetri-text'}`}>{k.value}</p>
              <p className="text-xs text-tetri-neutral mt-0.5">{k.sub}</p>
            </div>
          ))}
        </div>
      )}

      {/* Natural Language Search */}
      <div className="bg-tetri-surface border border-tetri-border rounded-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <Brain className="w-4 h-4 text-purple-500" />
          <h2 className="font-semibold text-tetri-text">AI Expense Search</h2>
        </div>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="e.g. Show travel expenses in March, Adobe expenses this year, Pending reimbursements…"
            className="flex-1 px-3 py-2 text-sm border border-tetri-border rounded-lg bg-tetri-bg text-tetri-text placeholder:text-tetri-neutral focus:outline-none focus:ring-2 focus:ring-tetri-blue/30"
          />
          <button type="submit" disabled={searching} className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50">
            {searching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          </button>
        </form>
        {searchResult && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-tetri-muted">{searchResult.count} results · Total: <span className="font-semibold text-tetri-text">{fmt(searchResult.totalAmount)}</span></p>
              <button onClick={() => setSearchResult(null)} className="text-xs text-tetri-muted hover:text-tetri-text">Clear</button>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {searchResult.expenses.slice(0, 10).map(e => (
                <div
                  key={e.id}
                  onClick={() => navigate(`/expenses/${e.id}`)}
                  className="flex items-center justify-between p-3 bg-tetri-bg rounded-lg cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-tetri-text">{e.description}</p>
                    <p className="text-xs text-tetri-muted">{e.category?.name || '—'} · {e.expenseDate?.slice(0,10)}</p>
                  </div>
                  <p className="text-sm font-semibold text-tetri-text">{e.currencyCode} {fmt(e.amount)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Charts row */}
      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Spending by Month */}
          <div className="bg-tetri-surface border border-tetri-border rounded-card p-5">
            <h2 className="font-semibold text-tetri-text mb-4">Spending Trend</h2>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={analytics.byMonth} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
                <Tooltip formatter={v => [fmt(v), 'Amount']} />
                <Line type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* By Category Pie */}
          <div className="bg-tetri-surface border border-tetri-border rounded-card p-5">
            <h2 className="font-semibold text-tetri-text mb-4">By Category (3 months)</h2>
            {analytics.byCategory.length ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={analytics.byCategory} dataKey="amount" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                    {analytics.byCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={v => [fmt(v), 'Amount']} />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-tetri-muted text-sm text-center py-16">No category data</p>}
          </div>

          {/* By Department */}
          <div className="bg-tetri-surface border border-tetri-border rounded-card p-5">
            <h2 className="font-semibold text-tetri-text mb-4">By Department (3 months)</h2>
            {analytics.byDepartment.length ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={analytics.byDepartment} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="department" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
                  <Tooltip formatter={v => [fmt(v), 'Amount']} />
                  <Bar dataKey="amount" fill="#8b5cf6" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-tetri-muted text-sm text-center py-16">No department data</p>}
          </div>

          {/* By Supplier */}
          <div className="bg-tetri-surface border border-tetri-border rounded-card p-5">
            <h2 className="font-semibold text-tetri-text mb-4">Top Suppliers (3 months)</h2>
            {analytics.bySupplier.length ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={analytics.bySupplier} layout="vertical" margin={{ top: 5, right: 10, left: 60, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={60} />
                  <Tooltip formatter={v => [fmt(v), 'Amount']} />
                  <Bar dataKey="amount" fill="#06b6d4" radius={[0,4,4,0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-tetri-muted text-sm text-center py-16">No supplier data</p>}
          </div>
        </div>
      )}

      {/* Forecast + Recommendations + Anomalies row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Forecast */}
        <div className="bg-tetri-surface border border-tetri-border rounded-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-tetri-blue" />
            <h2 className="font-semibold text-tetri-text">Spend Forecast</h2>
          </div>
          {forecast && forecast.forecast !== null ? (
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-tetri-muted">3-Month Avg</span>
                <span className="font-semibold">{fmt(forecast.threeMonthAvg)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-tetri-muted">Current Actual</span>
                <span className="font-semibold">{fmt(forecast.currentMonthActual)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-tetri-muted">Projected Month-End</span>
                <span className="font-semibold text-tetri-blue">{fmt(forecast.currentMonthProjected)}</span>
              </div>
              <div className={`mt-2 px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 ${
                forecast.trend === 'increasing' ? 'bg-red-50 text-red-700' :
                forecast.trend === 'decreasing' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'
              }`}>
                {forecast.trend === 'increasing' ? <TrendingUp className="w-3 h-3" /> : forecast.trend === 'decreasing' ? <TrendingDown className="w-3 h-3" /> : <Target className="w-3 h-3" />}
                Trend: {forecast.trend}
              </div>
            </div>
          ) : (
            <p className="text-tetri-muted text-sm">Not enough data for forecast.</p>
          )}
        </div>

        {/* Recommendations */}
        <div className="bg-tetri-surface border border-tetri-border rounded-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <h2 className="font-semibold text-tetri-text">Recommendations</h2>
          </div>
          {recommendations.length ? (
            <div className="space-y-3">
              {recommendations.slice(0, 4).map((r, i) => (
                <div key={i} className={`border rounded-lg p-3 text-xs ${r.priority === 'high' ? 'bg-red-50 border-red-200' : r.priority === 'medium' ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-200'}`}>
                  <p className="font-semibold mb-1">{r.title}</p>
                  <p className="text-tetri-muted leading-relaxed">{r.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-tetri-muted text-sm">No recommendations at this time.</p>
          )}
        </div>

        {/* Anomalies */}
        <div className="bg-tetri-surface border border-tetri-border rounded-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <h2 className="font-semibold text-tetri-text">Anomalies</h2>
            </div>
            {unreviewed > 0 && (
              <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded-full">{unreviewed} new</span>
            )}
          </div>
          {anomalies.length ? (
            <div className="space-y-3">
              {anomalies.slice(0, 4).map((a) => (
                <div key={a.id} className={`border rounded-lg p-3 text-xs ${RISK_STYLES[a.riskLevel] || RISK_STYLES.low} ${a.isReviewed ? 'opacity-50' : ''}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold uppercase text-[10px]">{a.riskLevel} risk</span>
                    {a.isReviewed && <CheckCircle className="w-3 h-3" />}
                  </div>
                  <p className="leading-relaxed">{a.explanation}</p>
                  {a.expense && (
                    <button onClick={() => navigate(`/expenses/${a.expense.id}`)} className="mt-1 flex items-center gap-1 hover:underline">
                      {a.expense.expenseNumber} <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="text-tetri-muted text-sm">No anomalies detected.</p>
            </div>
          )}
        </div>
      </div>

      {/* AI Insights */}
      {insights.length > 0 && (
        <div className="bg-tetri-surface border border-tetri-border rounded-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="w-4 h-4 text-purple-500" />
            <h2 className="font-semibold text-tetri-text">AI Spending Insights</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {insights.map((ins) => (
              <div key={ins.id} className={`border rounded-lg p-4 text-sm ${SEVERITY_STYLES[ins.insightType] || SEVERITY_STYLES.info}`}>
                <p className="font-semibold mb-1">{ins.title}</p>
                <p className="text-xs leading-relaxed opacity-80">{ins.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick nav */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Manage Budgets',     path: '/budgets',            icon: Target },
          { label: 'Recurring Expenses', path: '/recurring-expenses', icon: RefreshCw },
          { label: 'All Expenses',       path: '/expenses',           icon: Search },
          { label: 'Approvals Queue',    path: '/approvals',          icon: CheckCircle },
        ].map(({ label, path, icon: Icon }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            className="flex items-center gap-2 p-4 bg-tetri-surface border border-tetri-border rounded-card text-sm font-medium text-tetri-muted hover:bg-tetri-bg hover:text-tetri-text transition-colors"
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
