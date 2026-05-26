import { useState, useEffect, useCallback } from 'react';
import {
  ShieldAlert, Bell, CheckCircle, XCircle, AlertTriangle,
  Eye, Search, RefreshCw, ChevronDown, ChevronRight, ToggleLeft, ToggleRight,
  Activity, Zap,
} from 'lucide-react';
import securityService from '../services/securityService';

// ─── helpers ───────────────────────────────────────────────
function timeAgo(d) {
  const s = Math.floor((Date.now() - new Date(d)) / 1000);
  if (s < 60)   return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60)   return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24)   return `${h}h ago`;
  return new Date(d).toLocaleDateString();
}

const SEV_STYLE = {
  critical: 'bg-red-100 text-red-800 border-red-200',
  high:     'bg-orange-100 text-orange-800 border-orange-200',
  medium:   'bg-amber-100 text-amber-800 border-amber-200',
  low:      'bg-blue-100 text-blue-800 border-blue-200',
  info:     'bg-slate-100 text-slate-600 border-slate-200',
};

const STATUS_STYLE = {
  new:           'bg-red-50 text-red-700',
  acknowledged:  'bg-amber-50 text-amber-700',
  investigating: 'bg-blue-50 text-blue-700',
  resolved:      'bg-emerald-50 text-emerald-700',
  dismissed:     'bg-slate-50 text-slate-500',
  false_positive:'bg-slate-50 text-slate-500',
};

function SevBadge({ severity }) {
  return (
    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border uppercase ${SEV_STYLE[severity] || SEV_STYLE.info}`}>
      {severity}
    </span>
  );
}

function StatusBadge({ status }) {
  return (
    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded capitalize ${STATUS_STYLE[status] || ''}`}>
      {status?.replace('_', ' ')}
    </span>
  );
}

// ─── Overview tab ──────────────────────────────────────────
function OverviewTab({ data, loading }) {
  if (loading) return <div className="py-16 text-center text-tetri-muted text-sm">Loading…</div>;
  if (!data)   return null;

  const { totalAlerts, activeAlerts, bySeverity, recentAlerts, recentEvents } = data;

  const statCards = [
    { label: 'Total Alerts',  value: totalAlerts,          color: 'text-tetri-text' },
    { label: 'Active Alerts', value: activeAlerts,          color: 'text-red-600' },
    { label: 'Critical',      value: bySeverity.critical,  color: 'text-red-600' },
    { label: 'High',          value: bySeverity.high,      color: 'text-orange-600' },
    { label: 'Medium',        value: bySeverity.medium,    color: 'text-amber-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {statCards.map(({ label, value, color }) => (
          <div key={label} className="bg-tetri-surface border border-tetri-border rounded-card p-4">
            <p className="text-xs text-tetri-neutral mb-1">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{value ?? 0}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent alerts */}
        <div className="bg-tetri-surface border border-tetri-border rounded-card overflow-hidden">
          <div className="px-4 py-3 border-b border-tetri-border">
            <h3 className="text-sm font-semibold text-tetri-text flex items-center gap-2">
              <Bell className="w-4 h-4 text-tetri-blue" /> Recent Alerts
            </h3>
          </div>
          <div className="divide-y divide-tetri-border">
            {recentAlerts.length === 0 && (
              <p className="text-sm text-tetri-muted text-center py-8">No alerts yet</p>
            )}
            {recentAlerts.slice(0, 8).map((a) => (
              <div key={a.id} className="px-4 py-3 flex items-start gap-3">
                <SevBadge severity={a.severity} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-tetri-text truncate">{a.alertType}</p>
                  <p className="text-xs text-tetri-muted truncate">{a.description}</p>
                </div>
                <span className="text-[10px] text-tetri-neutral whitespace-nowrap">{timeAgo(a.createdAt)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent security events */}
        <div className="bg-tetri-surface border border-tetri-border rounded-card overflow-hidden">
          <div className="px-4 py-3 border-b border-tetri-border">
            <h3 className="text-sm font-semibold text-tetri-text flex items-center gap-2">
              <Activity className="w-4 h-4 text-tetri-blue" /> Security Events
            </h3>
          </div>
          <div className="divide-y divide-tetri-border">
            {recentEvents.length === 0 && (
              <p className="text-sm text-tetri-muted text-center py-8">No security events yet</p>
            )}
            {recentEvents.slice(0, 8).map((e) => (
              <div key={e.id} className="px-4 py-3 flex items-start gap-3">
                <SevBadge severity={e.severity} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-mono text-tetri-blue truncate">{e.eventType}</p>
                  <p className="text-xs text-tetri-muted truncate">{e.userName || e.userId || 'System'}</p>
                </div>
                <span className="text-[10px] text-tetri-neutral whitespace-nowrap">{timeAgo(e.createdAt)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Alerts tab ────────────────────────────────────────────
function AlertsTab() {
  const [data, setData]         = useState(null);
  const [loading, setLoading]   = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [notes, setNotes]       = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: 100 };
      if (statusFilter)   params.status   = statusFilter;
      if (severityFilter) params.severity = severityFilter;
      setData(await securityService.listAlerts(params));
    } finally { setLoading(false); }
  }, [statusFilter, severityFilter]);

  useEffect(() => { load(); }, [load]);

  async function doAction(id, action) {
    setActionLoading(`${id}-${action}`);
    try {
      const fn = {
        acknowledge:  () => securityService.acknowledgeAlert(id, notes),
        investigate:  () => securityService.investigateAlert(id, notes),
        resolve:      () => securityService.resolveAlert(id, notes),
        dismiss:      () => securityService.dismissAlert(id, notes),
        false_positive: () => securityService.falsePositive(id, notes),
      }[action];
      if (fn) { await fn(); setNotes(''); load(); }
    } finally { setActionLoading(null); }
  }

  const items = data?.items || [];

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {['', 'new', 'acknowledged', 'investigating', 'resolved', 'dismissed'].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`text-xs px-3 py-1.5 rounded-xl border transition-colors ${statusFilter === s ? 'bg-[#eff4ff] border-tetri-blue text-tetri-blue' : 'border-tetri-border text-tetri-muted hover:bg-tetri-bg'}`}
          >
            {s || 'All'}
          </button>
        ))}
        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="text-xs border border-tetri-border rounded-xl px-3 py-1.5 bg-tetri-bg text-tetri-muted"
        >
          <option value="">All severities</option>
          {['critical', 'high', 'medium', 'low', 'info'].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <button onClick={load} className="ml-auto p-1.5 rounded-xl border border-tetri-border text-tetri-muted hover:bg-tetri-bg">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="bg-tetri-surface border border-tetri-border rounded-card overflow-hidden">
        {items.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <CheckCircle className="w-8 h-8 text-emerald-400" />
            <p className="text-sm text-tetri-muted">No alerts found</p>
          </div>
        )}
        {items.map((alert) => (
          <div key={alert.id} className="border-b border-tetri-border last:border-0">
            <div
              className="flex items-start gap-3 px-4 py-3 hover:bg-tetri-bg cursor-pointer transition-colors"
              onClick={() => setExpandedId((id) => id === alert.id ? null : alert.id)}
            >
              <span className="mt-0.5">{expandedId === alert.id ? <ChevronDown className="w-3 h-3 text-tetri-neutral" /> : <ChevronRight className="w-3 h-3 text-tetri-neutral" />}</span>
              <SevBadge severity={alert.severity} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-tetri-text">{alert.alertType}</p>
                <p className="text-xs text-tetri-muted truncate mt-0.5">{alert.description}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <StatusBadge status={alert.status} />
                <span className="text-[10px] text-tetri-neutral">{timeAgo(alert.createdAt)}</span>
              </div>
            </div>

            {expandedId === alert.id && (
              <div className="bg-tetri-bg px-6 py-4 space-y-4 border-t border-tetri-border">
                {alert.recommendedAction && (
                  <div className="flex gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                    <Zap className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-800">{alert.recommendedAction}</p>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-3 text-xs">
                  {[
                    { label: 'Risk Score', value: alert.riskScore },
                    { label: 'Category',   value: alert.category },
                    { label: 'User',       value: alert.userName || alert.userId || '—' },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-tetri-surface rounded-xl p-2.5 border border-tetri-border">
                      <p className="text-tetri-neutral mb-0.5">{label}</p>
                      <p className="font-semibold text-tetri-text">{value}</p>
                    </div>
                  ))}
                </div>

                <div>
                  <label className="text-xs font-medium text-tetri-neutral block mb-1">Notes (optional)</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add investigation notes…"
                    className="w-full text-sm border border-tetri-border rounded-xl px-3 py-2 bg-tetri-surface focus:outline-none focus:ring-2 focus:ring-tetri-blue/20"
                  />
                </div>

                {!['resolved', 'dismissed', 'false_positive'].includes(alert.status) && (
                  <div className="flex gap-2 flex-wrap">
                    {alert.status === 'new' && (
                      <button onClick={() => doAction(alert.id, 'acknowledge')} disabled={!!actionLoading} className="text-xs px-3 py-1.5 rounded-xl bg-amber-100 text-amber-800 hover:bg-amber-200 transition-colors">Acknowledge</button>
                    )}
                    {['new', 'acknowledged'].includes(alert.status) && (
                      <button onClick={() => doAction(alert.id, 'investigate')} disabled={!!actionLoading} className="text-xs px-3 py-1.5 rounded-xl bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors">Investigate</button>
                    )}
                    <button onClick={() => doAction(alert.id, 'resolve')} disabled={!!actionLoading} className="text-xs px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition-colors">Resolve</button>
                    <button onClick={() => doAction(alert.id, 'dismiss')} disabled={!!actionLoading} className="text-xs px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">Dismiss</button>
                    <button onClick={() => doAction(alert.id, 'false_positive')} disabled={!!actionLoading} className="text-xs px-3 py-1.5 rounded-xl border border-tetri-border text-tetri-muted hover:bg-tetri-bg transition-colors">False Positive</button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Rules tab ─────────────────────────────────────────────
function RulesTab() {
  const [rules, setRules]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(null);

  useEffect(() => {
    setLoading(true);
    securityService.listRules().then(setRules).finally(() => setLoading(false));
  }, []);

  async function toggleRule(rule) {
    setSaving(rule.id);
    try {
      await securityService.updateRule(rule.id, { enabled: !rule.enabled });
      setRules((prev) => prev.map((r) => r.id === rule.id ? { ...r, enabled: !r.enabled } : r));
    } finally { setSaving(null); }
  }

  if (loading) return <div className="py-16 text-center text-tetri-muted text-sm">Loading rules…</div>;

  return (
    <div className="bg-tetri-surface border border-tetri-border rounded-card overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-tetri-bg border-b border-tetri-border">
            <th className="text-left px-4 py-3 text-xs font-semibold text-tetri-neutral">Rule</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-tetri-neutral">Category</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-tetri-neutral">Severity</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-tetri-neutral">Threshold</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-tetri-neutral">Window</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-tetri-neutral">Risk</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-tetri-neutral">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-tetri-border">
          {rules.map((rule) => (
            <tr key={rule.id} className="hover:bg-tetri-bg transition-colors">
              <td className="px-4 py-3">
                <p className="text-sm font-medium text-tetri-text">{rule.ruleName}</p>
                <p className="text-xs text-tetri-neutral font-mono">{rule.eventType}</p>
              </td>
              <td className="px-4 py-3 text-xs text-tetri-muted">{rule.category}</td>
              <td className="px-4 py-3"><SevBadge severity={rule.severity} /></td>
              <td className="px-4 py-3 text-xs text-tetri-text">{rule.threshold} event{rule.threshold !== 1 ? 's' : ''}</td>
              <td className="px-4 py-3 text-xs text-tetri-muted">{rule.windowMins < 60 ? `${rule.windowMins}m` : `${rule.windowMins / 60}h`}</td>
              <td className="px-4 py-3 text-xs font-semibold text-tetri-text">+{rule.riskScore}</td>
              <td className="px-4 py-3">
                <button
                  onClick={() => toggleRule(rule)}
                  disabled={saving === rule.id}
                  className="flex items-center gap-1.5 text-xs"
                >
                  {rule.enabled
                    ? <ToggleRight className="w-5 h-5 text-emerald-500" />
                    : <ToggleLeft  className="w-5 h-5 text-tetri-neutral" />
                  }
                  <span className={rule.enabled ? 'text-emerald-600' : 'text-tetri-neutral'}>
                    {rule.enabled ? 'On' : 'Off'}
                  </span>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────
const TABS = ['Overview', 'Alerts', 'Detection Rules'];

export default function SecurityCenterPage() {
  const [tab, setTab]         = useState('Overview');
  const [dashboard, setDashboard] = useState(null);
  const [dashLoading, setDashLoading] = useState(false);

  const loadDashboard = useCallback(async () => {
    setDashLoading(true);
    try { setDashboard(await securityService.getDashboard()); }
    catch { /* show empty state */ }
    finally { setDashLoading(false); }
  }, []);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  const activeCount = dashboard?.activeAlerts ?? 0;
  const criticalCount = dashboard?.bySeverity?.critical ?? 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-tetri-text flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-tetri-blue" />
            Security Center
          </h1>
          <p className="text-sm text-tetri-muted mt-0.5">
            Monitoring, alerts & security intelligence
            {activeCount > 0 && (
              <span className="ml-2 text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-medium">
                {activeCount} active alert{activeCount !== 1 ? 's' : ''}
              </span>
            )}
            {criticalCount > 0 && (
              <span className="ml-1 text-xs bg-red-600 text-white px-1.5 py-0.5 rounded font-medium">
                {criticalCount} critical
              </span>
            )}
          </p>
        </div>
        <button onClick={loadDashboard} className="p-2 rounded-xl border border-tetri-border text-tetri-muted hover:bg-tetri-bg transition-colors">
          <RefreshCw className={`w-4 h-4 ${dashLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-tetri-border">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === t
                ? 'border-tetri-blue text-tetri-blue'
                : 'border-transparent text-tetri-muted hover:text-tetri-text'
            }`}
          >
            {t}
            {t === 'Alerts' && activeCount > 0 && (
              <span className="ml-1.5 text-[10px] bg-red-100 text-red-700 px-1 py-0.5 rounded font-semibold">{activeCount}</span>
            )}
          </button>
        ))}
      </div>

      {tab === 'Overview'         && <OverviewTab data={dashboard} loading={dashLoading} />}
      {tab === 'Alerts'           && <AlertsTab />}
      {tab === 'Detection Rules'  && <RulesTab />}
    </div>
  );
}
