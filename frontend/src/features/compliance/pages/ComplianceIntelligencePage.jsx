import { useState, useEffect, useCallback } from 'react';
import {
  Brain, RefreshCw, AlertTriangle, ShieldCheck, TrendingUp, TrendingDown,
  Minus, ChevronDown, ChevronUp, Sparkles, FileText, Loader2, CheckCircle,
  AlertCircle, Info, ArrowRight, BarChart2, Clock,
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { getDashboard, runAnalysis, generateAiInsights, generateExecSummary } from '../services/complianceIntelligenceService.js';

// ── Health ring ───────────────────────────────────────────────────────────────
const HEALTH_CONFIG = {
  excellent: { color: '#10b981', label: 'Excellent',     bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  good:      { color: '#3b82f6', label: 'Good',          bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200'    },
  moderate:  { color: '#f59e0b', label: 'Moderate Risk', bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200'   },
  high:      { color: '#f97316', label: 'High Risk',     bg: 'bg-orange-50',  text: 'text-orange-700',  border: 'border-orange-200'  },
  critical:  { color: '#ef4444', label: 'Critical',      bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200'     },
};

function getHealthConfig(status) {
  return HEALTH_CONFIG[status] || HEALTH_CONFIG.moderate;
}

function HealthRing({ score, status }) {
  const cfg = getHealthConfig(status);
  const r   = 52;
  const circ = 2 * Math.PI * r;
  const fill = circ - (circ * (score ?? 0)) / 100;
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <svg width="140" height="140" viewBox="0 0 140 140">
          <circle cx="70" cy="70" r={r} fill="none" stroke="#e2e8f0" strokeWidth="12" />
          <circle
            cx="70" cy="70" r={r} fill="none"
            stroke={cfg.color} strokeWidth="12"
            strokeDasharray={circ}
            strokeDashoffset={fill}
            strokeLinecap="round"
            transform="rotate(-90 70 70)"
            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-slate-900">{score ?? '—'}</span>
          <span className="text-xs text-slate-500 font-medium">/ 100</span>
        </div>
      </div>
      <span className={`text-sm font-semibold px-3 py-1 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
        {cfg.label}
      </span>
    </div>
  );
}

// ── Severity badge ────────────────────────────────────────────────────────────
const SEV_STYLES = {
  critical: 'bg-red-100 text-red-700 border-red-200',
  high:     'bg-orange-100 text-orange-700 border-orange-200',
  medium:   'bg-amber-100 text-amber-700 border-amber-200',
  low:      'bg-slate-100 text-slate-600 border-slate-200',
};

function SeverityBadge({ severity }) {
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded border uppercase tracking-wide ${SEV_STYLES[severity] || SEV_STYLES.low}`}>
      {severity}
    </span>
  );
}

// ── Priority badge ────────────────────────────────────────────────────────────
const PRI_STYLES = {
  critical: 'bg-red-100 text-red-700',
  high:     'bg-orange-100 text-orange-700',
  medium:   'bg-amber-100 text-amber-700',
  low:      'bg-slate-100 text-slate-600',
};

function PriorityBadge({ priority }) {
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded capitalize ${PRI_STYLES[priority] || PRI_STYLES.medium}`}>
      {priority}
    </span>
  );
}

// ── Confidence badge ──────────────────────────────────────────────────────────
const CONF_STYLES = {
  high:   'text-emerald-600',
  medium: 'text-amber-600',
  low:    'text-slate-500',
};

function ConfidenceDot({ level }) {
  return (
    <span className={`text-xs font-medium flex items-center gap-1 ${CONF_STYLES[level] || CONF_STYLES.medium}`}>
      <span className={`inline-block w-1.5 h-1.5 rounded-full ${level === 'high' ? 'bg-emerald-500' : level === 'medium' ? 'bg-amber-500' : 'bg-slate-400'}`} />
      {level} confidence
    </span>
  );
}

// ── Trend icon ────────────────────────────────────────────────────────────────
function TrendIcon({ direction }) {
  if (direction === 'improving') return <TrendingUp className="w-4 h-4 text-emerald-500" />;
  if (direction === 'declining') return <TrendingDown className="w-4 h-4 text-red-500" />;
  return <Minus className="w-4 h-4 text-slate-400" />;
}

// ── Risk card ─────────────────────────────────────────────────────────────────
function RiskCard({ risk }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="border border-slate-200 rounded-lg p-4 bg-white hover:shadow-sm transition-shadow">
      <div className="flex items-start gap-3">
        <AlertTriangle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
          risk.severity === 'critical' ? 'text-red-500' :
          risk.severity === 'high'     ? 'text-orange-500' :
          risk.severity === 'medium'   ? 'text-amber-500' : 'text-slate-400'
        }`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <SeverityBadge severity={risk.severity} />
            <span className="text-xs text-slate-500 font-medium">{risk.category?.replace(/_/g, ' ')}</span>
          </div>
          <p className="text-sm text-slate-700 leading-relaxed">{risk.description}</p>
          {risk.source && (
            <p className="text-xs text-slate-400 mt-1">Source: {risk.source}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Recommendation card ───────────────────────────────────────────────────────
function RecommendationCard({ rec }) {
  return (
    <div className="border border-slate-200 rounded-lg p-4 bg-white hover:shadow-sm transition-shadow">
      <div className="flex items-start gap-3">
        <ArrowRight className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-500" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <PriorityBadge priority={rec.priority} />
            <ConfidenceDot level={rec.confidenceLevel} />
            {rec.category && (
              <span className="text-xs text-slate-400">{rec.category.replace(/_/g, ' ')}</span>
            )}
          </div>
          <p className="text-sm font-medium text-slate-800">{rec.recommendation}</p>
          {rec.reason && (
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">{rec.reason}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Trend chart ───────────────────────────────────────────────────────────────
function TrendChart({ data }) {
  if (!data?.length || data.length < 2) {
    return (
      <div className="h-36 flex items-center justify-center text-sm text-slate-400">
        Run more analyses to see trend data.
      </div>
    );
  }

  const chartData = data.map(d => ({
    date: new Date(d.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    score: d.score,
  }));

  return (
    <ResponsiveContainer width="100%" height={150}>
      <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
          formatter={(v) => [`${v}/100`, 'Health Score']}
        />
        <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ComplianceIntelligencePage() {
  const [dashboard, setDashboard]       = useState(null);
  const [loading, setLoading]           = useState(true);
  const [analyzing, setAnalyzing]       = useState(false);
  const [insightsLoading, setInsLoading] = useState(false);
  const [summaryLoading,  setSumLoading] = useState(false);
  const [aiInsights,  setAiInsights]    = useState(null);
  const [execSummary, setExecSummary]   = useState(null);
  const [error, setError]               = useState(null);
  const [activeTab, setActiveTab]       = useState('overview');

  const load = useCallback(async () => {
    try {
      setError(null);
      const data = await getDashboard();
      setDashboard(data);
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleAnalyze() {
    setAnalyzing(true);
    setError(null);
    try {
      await runAnalysis();
      await load();
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleAiInsights() {
    setInsLoading(true);
    try {
      const data = await generateAiInsights();
      setAiInsights(data);
      setActiveTab('insights');
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setInsLoading(false);
    }
  }

  async function handleExecSummary() {
    setSumLoading(true);
    try {
      const data = await generateExecSummary();
      setExecSummary(data);
      setActiveTab('summary');
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setSumLoading(false);
    }
  }

  const health = dashboard?.health;
  const risks  = dashboard?.topRisks || [];
  const recs   = dashboard?.recommendations || [];
  const trends = dashboard?.trends;
  const riskSummary = dashboard?.riskSummary;

  const TABS = [
    { id: 'overview',       label: 'Overview' },
    { id: 'risks',          label: `Risks${riskSummary?.total ? ` (${riskSummary.total})` : ''}` },
    { id: 'recommendations', label: 'Recommendations' },
    { id: 'trends',         label: 'Trends' },
    { id: 'insights',       label: 'AI Insights' },
    { id: 'summary',        label: 'Executive Summary' },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-violet-100">
            <Brain className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Compliance Intelligence</h1>
            <p className="text-sm text-slate-500">Proactive risk detection and compliance health monitoring</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleAiInsights}
            disabled={insightsLoading || !health}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-violet-600 border border-violet-200 rounded-lg hover:bg-violet-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {insightsLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            AI Insights
          </button>
          <button
            onClick={handleExecSummary}
            disabled={summaryLoading || !health}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {summaryLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
            Exec Summary
          </button>
          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            {analyzing ? 'Analyzing…' : 'Run Analysis'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
        </div>
      ) : !health ? (
        /* Empty state — no analysis run yet */
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="p-4 rounded-full bg-slate-100 mb-4">
            <Brain className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-base font-semibold text-slate-700 mb-2">No intelligence data yet</h3>
          <p className="text-sm text-slate-500 max-w-sm mb-6">
            Run your first analysis to calculate your compliance health score, detect risks, and generate recommendations.
          </p>
          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors"
          >
            {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            {analyzing ? 'Analyzing…' : 'Run First Analysis'}
          </button>
        </div>
      ) : (
        <>
          {/* Quick stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center text-center">
              <HealthRing score={health.score} status={health.status} />
              <p className="text-xs text-slate-500 mt-2">Health Score</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Risks Detected</p>
              <p className="text-3xl font-bold text-slate-900">{riskSummary?.total ?? 0}</p>
              <div className="flex flex-col gap-1 text-xs">
                {riskSummary?.bySeverity?.critical > 0 && (
                  <span className="text-red-600 font-medium">{riskSummary.bySeverity.critical} Critical</span>
                )}
                {riskSummary?.bySeverity?.high > 0 && (
                  <span className="text-orange-600 font-medium">{riskSummary.bySeverity.high} High</span>
                )}
                {(riskSummary?.bySeverity?.medium || 0) + (riskSummary?.bySeverity?.low || 0) > 0 && (
                  <span className="text-slate-500">
                    {(riskSummary.bySeverity.medium || 0) + (riskSummary.bySeverity.low || 0)} Other
                  </span>
                )}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Recommendations</p>
              <p className="text-3xl font-bold text-slate-900">{recs.length}</p>
              <p className="text-xs text-slate-500">action items identified</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Trend</p>
              <div className="flex items-center gap-2">
                <TrendIcon direction={trends?.direction} />
                <span className="text-lg font-semibold text-slate-800 capitalize">
                  {trends?.direction === 'insufficient_data' ? 'Pending' : trends?.direction || 'Stable'}
                </span>
              </div>
              {trends?.change !== undefined && trends.direction !== 'insufficient_data' && (
                <p className={`text-xs font-medium ${trends.change > 0 ? 'text-emerald-600' : trends.change < 0 ? 'text-red-600' : 'text-slate-500'}`}>
                  {trends.change > 0 ? '+' : ''}{trends.change} pts overall
                </p>
              )}
              {dashboard?.lastAnalyzed && (
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(dashboard.lastAnalyzed).toLocaleString()}
                </p>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-slate-200 mb-6">
            <div className="flex gap-0 overflow-x-auto">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab content */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top risks */}
              <div>
                <h2 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                  Top Risks
                </h2>
                {risks.length === 0 ? (
                  <div className="flex items-center gap-2 p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-700">
                    <CheckCircle className="w-4 h-4" />
                    No active risks detected.
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {risks.slice(0, 5).map((r, i) => <RiskCard key={r.id || i} risk={r} />)}
                    {risks.length > 5 && (
                      <button
                        onClick={() => setActiveTab('risks')}
                        className="text-sm text-blue-600 hover:underline text-left"
                      >
                        View all {riskSummary?.total} risks →
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Top recommendations */}
              <div>
                <h2 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 text-blue-500" />
                  Recommendations
                </h2>
                {recs.length === 0 ? (
                  <p className="text-sm text-slate-400 p-4 bg-slate-50 rounded-lg">No recommendations available.</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {recs.slice(0, 5).map((r, i) => <RecommendationCard key={r.id || i} rec={r} />)}
                    {recs.length > 5 && (
                      <button
                        onClick={() => setActiveTab('recommendations')}
                        className="text-sm text-blue-600 hover:underline text-left"
                      >
                        View all {recs.length} recommendations →
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'risks' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                  All Detected Risks ({riskSummary?.total ?? 0})
                </h2>
              </div>
              {risks.length === 0 ? (
                <div className="flex items-center gap-2 p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-700">
                  <CheckCircle className="w-4 h-4" />
                  No active compliance risks detected. Run an analysis to check for issues.
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {risks.map((r, i) => <RiskCard key={r.id || i} risk={r} />)}
                </div>
              )}
            </div>
          )}

          {activeTab === 'recommendations' && (
            <div>
              <h2 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                <ArrowRight className="w-4 h-4 text-blue-500" />
                All Recommendations ({recs.length})
              </h2>
              {recs.length === 0 ? (
                <p className="text-sm text-slate-400 p-4 bg-slate-50 rounded-lg">No recommendations available. Run an analysis to generate recommendations.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {recs.map((r, i) => <RecommendationCard key={r.id || i} rec={r} />)}
                </div>
              )}
            </div>
          )}

          {activeTab === 'trends' && (
            <div>
              <h2 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-violet-500" />
                Compliance Health Trend
              </h2>
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <TrendIcon direction={trends?.direction} />
                  <span className="text-sm font-medium text-slate-700 capitalize">
                    {trends?.direction === 'insufficient_data' ? 'Insufficient data — run more analyses' :
                     trends?.direction === 'improving' ? `Improving (+${trends.change} pts)` :
                     trends?.direction === 'declining' ? `Declining (${trends.change} pts)` :
                     'Stable'}
                  </span>
                </div>
                <TrendChart data={trends?.data || []} />
                <p className="text-xs text-slate-400 mt-3">
                  Each data point represents a compliance analysis run. Run analyses regularly for meaningful trend data.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'insights' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-violet-500" />
                  AI Compliance Insights
                </h2>
                <button
                  onClick={handleAiInsights}
                  disabled={insightsLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-violet-600 border border-violet-200 rounded-lg hover:bg-violet-50 disabled:opacity-40 transition-colors"
                >
                  {insightsLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                  Regenerate
                </button>
              </div>
              {insightsLoading ? (
                <div className="flex items-center gap-3 p-6 bg-slate-50 rounded-xl">
                  <Loader2 className="w-5 h-5 animate-spin text-violet-500" />
                  <span className="text-sm text-slate-600">Generating AI insights…</span>
                </div>
              ) : aiInsights ? (
                <div className="bg-white border border-violet-100 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4 text-xs text-slate-400">
                    <Info className="w-3.5 h-3.5" />
                    AI-generated insights based on your compliance data. Advisory only — not legal advice.
                  </div>
                  <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {aiInsights.insights}
                  </div>
                  <p className="text-xs text-slate-400 mt-4">
                    Generated {new Date(aiInsights.generatedAt).toLocaleString()}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Sparkles className="w-8 h-8 text-slate-300 mb-3" />
                  <p className="text-sm text-slate-500 mb-4">Click "AI Insights" to generate intelligent compliance insights based on your current data.</p>
                  <button
                    onClick={handleAiInsights}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700 transition-colors"
                  >
                    <Sparkles className="w-4 h-4" />
                    Generate Insights
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'summary' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-500" />
                  Executive Compliance Summary
                </h2>
                <button
                  onClick={handleExecSummary}
                  disabled={summaryLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 transition-colors"
                >
                  {summaryLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                  Regenerate
                </button>
              </div>
              {summaryLoading ? (
                <div className="flex items-center gap-3 p-6 bg-slate-50 rounded-xl">
                  <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                  <span className="text-sm text-slate-600">Generating executive summary…</span>
                </div>
              ) : execSummary ? (
                <div className="bg-white border border-slate-200 rounded-xl p-6">
                  <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-slate-50 rounded-lg">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-slate-900">{execSummary.healthScore}/100</p>
                      <p className="text-xs text-slate-500 capitalize">{execSummary.healthStatus} health</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-slate-900">{execSummary.riskCount}</p>
                      <p className="text-xs text-slate-500">active risks</p>
                    </div>
                    <div className="text-center flex flex-col items-center">
                      <TrendIcon direction={execSummary.trend} />
                      <p className="text-xs text-slate-500 capitalize mt-1">{execSummary.trend}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-4 text-xs text-slate-400">
                    <Info className="w-3.5 h-3.5" />
                    AI-generated summary for management review. Advisory only — not legal advice.
                  </div>
                  <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {execSummary.summary}
                  </div>
                  <p className="text-xs text-slate-400 mt-4">
                    Generated {new Date(execSummary.generatedAt).toLocaleString()}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <FileText className="w-8 h-8 text-slate-300 mb-3" />
                  <p className="text-sm text-slate-500 mb-4">Generate a professional executive summary for senior management based on your current compliance data.</p>
                  <button
                    onClick={handleExecSummary}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-700 rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    Generate Summary
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
