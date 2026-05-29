import { useState, useEffect, useCallback } from 'react';
import {
  BrainCircuit, Zap, DollarSign, Users, Building2, Activity,
  AlertTriangle, RefreshCw, Search, Loader2, Trash2, Plus,
  ChevronDown, ChevronUp, Shield, Server, Clock, TrendingUp,
} from 'lucide-react';
import * as svc from '../services/aiUsageService';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n, dec = 0) => n != null ? Number(n).toLocaleString('en-US', { maximumFractionDigits: dec }) : '—';
const fmtCost = (n) => n != null ? `$${Number(n).toFixed(4)}` : '—';
const fmtDate = (d) => d ? new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

const TABS = ['Overview', 'Workspaces', 'Users', 'Providers', 'Costs', 'Quotas', 'Logs'];
const PERIODS = [{ label: '7 days', value: '7d' }, { label: '30 days', value: '30d' }, { label: '90 days', value: '90d' }];
const SCOPES = ['platform', 'plan', 'workspace', 'user'];

function KpiCard({ icon: Icon, label, value, sub, color = 'text-gray-700', bg = 'bg-gray-50' }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl px-5 py-4 flex items-center gap-4 shadow-sm">
      <div className={`p-2 rounded-lg ${bg}`}><Icon className={`w-5 h-5 ${color}`} /></div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 font-medium truncate">{label}</p>
        <p className={`text-2xl font-bold ${color}`}>{value ?? '—'}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function Tab({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
        active ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
      }`}
    >
      {label}
    </button>
  );
}

function Badge({ children, color = 'gray' }) {
  const colors = {
    gray:   'bg-gray-100 text-gray-700',
    green:  'bg-green-100 text-green-700',
    yellow: 'bg-yellow-100 text-yellow-800',
    red:    'bg-red-100 text-red-700',
    blue:   'bg-blue-100 text-blue-700',
    orange: 'bg-orange-100 text-orange-700',
  };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colors[color] || colors.gray}`}>{children}</span>;
}

// ─── Bar Chart (pure CSS) ─────────────────────────────────────────────────────

function BarChart({ data, valueKey, labelKey, color = 'bg-indigo-500', label = '' }) {
  if (!data?.length) return <p className="text-sm text-gray-400 py-4">No data</p>;
  const max = Math.max(...data.map((d) => Number(d[valueKey]) || 0), 1);
  return (
    <div className="space-y-2">
      {data.map((d, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="text-xs text-gray-500 w-28 truncate flex-shrink-0">{d[labelKey]}</span>
          <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
            <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${(Number(d[valueKey]) / max) * 100}%` }} />
          </div>
          <span className="text-xs font-medium text-gray-700 w-20 text-right flex-shrink-0">
            {label === 'cost' ? fmtCost(d[valueKey]) : fmt(d[valueKey])}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Trend Sparkline (pure CSS) ───────────────────────────────────────────────

function Sparkline({ data, valueKey }) {
  if (!data?.length) return null;
  const vals = data.map((d) => Number(d[valueKey]) || 0);
  const max = Math.max(...vals, 1);
  const w = 100 / vals.length;
  return (
    <div className="flex items-end gap-0.5 h-10">
      {vals.map((v, i) => (
        <div key={i} className="bg-indigo-400 rounded-sm flex-1" style={{ height: `${Math.max(4, (v / max) * 40)}px` }} />
      ))}
    </div>
  );
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────

function OverviewTab() {
  const [dashboard, setDashboard] = useState(null);
  const [abuse, setAbuse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([svc.getDashboard(), svc.getAbuseAlerts()])
      .then(([d, a]) => { setDashboard(d); setAbuse(a); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>;

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KpiCard icon={Zap}       label="Total Requests"    value={fmt(dashboard?.totalRequests)}          color="text-indigo-600" bg="bg-indigo-50" />
        <KpiCard icon={Activity}  label="Requests Today"    value={fmt(dashboard?.requestsToday)}          color="text-blue-600"   bg="bg-blue-50" />
        <KpiCard icon={TrendingUp}label="This Month"        value={fmt(dashboard?.requestsThisMonth)}      color="text-green-600"  bg="bg-green-50" />
        <KpiCard icon={Building2} label="Active Workspaces" value={fmt(dashboard?.activeWorkspaces)}       color="text-orange-600" bg="bg-orange-50" />
        <KpiCard icon={Users}     label="Active Users"      value={fmt(dashboard?.activeUsers)}            color="text-purple-600" bg="bg-purple-50" />
        <KpiCard icon={DollarSign}label="Cost This Month"   value={fmtCost(dashboard?.estimatedCostThisMonth)} color="text-red-600" bg="bg-red-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 7-day trend */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">7-Day Request Trend</h3>
          {dashboard?.trend?.length > 0 ? (
            <div className="space-y-3">
              <Sparkline data={dashboard.trend} valueKey="requests" />
              <div className="flex justify-between text-xs text-gray-400">
                {dashboard.trend.map((t, i) => (
                  <span key={i}>{new Date(t.day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                ))}
              </div>
            </div>
          ) : <p className="text-sm text-gray-400">No request data yet</p>}
        </div>

        {/* Error rate */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">This Month</h3>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-500">Error Rate</p>
              <p className="text-3xl font-bold text-gray-800">{dashboard?.errorRateThisMonth ?? 0}%</p>
              <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-red-400 rounded-full" style={{ width: `${Math.min(dashboard?.errorRateThisMonth || 0, 100)}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Abuse alerts */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-orange-500" /> Abuse Alerts (Last 24h)
        </h3>
        {abuse?.alerts?.length > 0 ? (
          <div className="space-y-2">
            {abuse.alerts.map((a, i) => (
              <div key={i} className={`flex items-start gap-3 p-3 rounded-lg ${a.type === 'error_spike' ? 'bg-red-50 border border-red-100' : 'bg-yellow-50 border border-yellow-100'}`}>
                <AlertTriangle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${a.type === 'error_spike' ? 'text-red-500' : 'text-yellow-500'}`} />
                <p className="text-sm text-gray-700">{a.message}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">No abuse signals detected in the last 24 hours.</p>
        )}

        {abuse?.topWorkspaces24h?.length > 0 && (
          <div className="mt-5">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Top Workspaces (24h)</p>
            <div className="space-y-1.5">
              {abuse.topWorkspaces24h.map((w, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{w.workspace_name}</span>
                  <span className="font-medium text-gray-600">{fmt(w.requests_24h)} req</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Workspaces Tab ───────────────────────────────────────────────────────────

function WorkspacesTab() {
  const [data, setData] = useState(null);
  const [search, setSearch] = useState('');
  const [period, setPeriod] = useState('30d');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const limit = 20;

  const load = useCallback(() => {
    setLoading(true);
    svc.listWorkspaceUsage({ search: search || undefined, period, page, limit })
      .then(setData)
      .finally(() => setLoading(false));
  }, [search, period, page]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-4">
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg" placeholder="Search workspaces…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <select className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white" value={period} onChange={(e) => { setPeriod(e.target.value); setPage(1); }}>
          {PERIODS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>
      </div>

      {loading ? <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div> : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Workspace</th>
                <th className="px-4 py-3 text-right">Requests</th>
                <th className="px-4 py-3 text-right">Tokens</th>
                <th className="px-4 py-3 text-right">Users</th>
                <th className="px-4 py-3 text-right">Cost</th>
                <th className="px-4 py-3 text-right">Errors</th>
                <th className="px-4 py-3 text-left">Last Activity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data?.items?.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-400">No AI usage data in this period</td></tr>
              ) : data?.items?.map((w, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{w.workspace_name}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{fmt(w.requests)}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{fmt(w.tokens)}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{fmt(w.users)}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{fmtCost(w.cost)}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={w.errors > 0 ? 'text-red-600 font-medium' : 'text-gray-400'}>{fmt(w.errors)}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{fmtDate(w.last_activity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {data?.total > limit && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-sm text-gray-500">
              <span>Page {page} of {Math.ceil(data.total / limit)}</span>
              <div className="flex gap-2">
                <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="px-3 py-1 border border-gray-200 rounded-lg disabled:opacity-40">Prev</button>
                <button disabled={page * limit >= data.total} onClick={() => setPage((p) => p + 1)} className="px-3 py-1 border border-gray-200 rounded-lg disabled:opacity-40">Next</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Users Tab ────────────────────────────────────────────────────────────────

function UsersTab() {
  const [data, setData] = useState(null);
  const [period, setPeriod] = useState('30d');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const limit = 20;

  const load = useCallback(() => {
    setLoading(true);
    svc.listUserUsage({ period, page, limit })
      .then(setData)
      .finally(() => setLoading(false));
  }, [period, page]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <select className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white" value={period} onChange={(e) => { setPeriod(e.target.value); setPage(1); }}>
          {PERIODS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>
      </div>

      {loading ? <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div> : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left">User ID</th>
                <th className="px-4 py-3 text-left">Workspace</th>
                <th className="px-4 py-3 text-right">Requests</th>
                <th className="px-4 py-3 text-right">Tokens</th>
                <th className="px-4 py-3 text-right">Cost</th>
                <th className="px-4 py-3 text-left">Features</th>
                <th className="px-4 py-3 text-left">Last Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data?.items?.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-400">No user AI activity in this period</td></tr>
              ) : data?.items?.map((u, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{u.user_id?.slice(0, 16)}…</td>
                  <td className="px-4 py-3 text-gray-700">{u.workspace_name}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{fmt(u.requests)}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{fmt(u.tokens)}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{fmtCost(u.cost)}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(u.features || []).filter(Boolean).slice(0, 3).map((f, j) => (
                        <Badge key={j} color="blue">{f}</Badge>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{fmtDate(u.last_activity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {data?.total > limit && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-sm text-gray-500">
              <span>Page {page} of {Math.ceil(data.total / limit)}</span>
              <div className="flex gap-2">
                <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="px-3 py-1 border border-gray-200 rounded-lg disabled:opacity-40">Prev</button>
                <button disabled={page * limit >= data.total} onClick={() => setPage((p) => p + 1)} className="px-3 py-1 border border-gray-200 rounded-lg disabled:opacity-40">Next</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Providers Tab ────────────────────────────────────────────────────────────

function ProvidersTab() {
  const [providers, setProviders] = useState([]);
  const [period, setPeriod] = useState('30d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    svc.getProviderAnalytics({ period }).then(setProviders).finally(() => setLoading(false));
  }, [period]);

  const statusColor = (s) => ({ healthy: 'green', degraded: 'yellow', offline: 'red' })[s] || 'gray';

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <select className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white" value={period} onChange={(e) => setPeriod(e.target.value)}>
          {PERIODS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>
      </div>

      {loading ? <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {providers.map((p, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center">
                    <Server className="w-5 h-5 text-indigo-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{p.provider_name}</p>
                    <p className="text-xs text-gray-400">{p.provider_code?.toUpperCase()}</p>
                  </div>
                </div>
                <Badge color={statusColor(p.status)}>{p.status || 'unknown'}</Badge>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Requests</p>
                  <p className="font-bold text-gray-800">{fmt(p.requests)}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Tokens</p>
                  <p className="font-bold text-gray-800">{fmt((p.tokens_input || 0) + (p.tokens_output || 0))}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Cost</p>
                  <p className="font-bold text-gray-800">{fmtCost(p.cost)}</p>
                </div>
              </div>
              <div className="mt-3 flex justify-between text-xs text-gray-500">
                <span>Avg response: {p.avg_duration_ms ? `${fmt(p.avg_duration_ms)}ms` : '—'}</span>
                <span className={p.errorRate > 10 ? 'text-red-600 font-medium' : ''}>
                  Error rate: {p.errorRate ?? 0}%
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Costs Tab ────────────────────────────────────────────────────────────────

function CostsTab() {
  const [costs, setCosts] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    svc.getCostAnalytics().then(setCosts).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div>;

  return (
    <div className="space-y-6">
      {/* Daily trend */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Daily Cost — Last 30 Days</h3>
        {costs?.daily?.length > 0 ? (
          <div className="space-y-3">
            <Sparkline data={costs.daily} valueKey="cost" />
            <BarChart data={costs.daily.slice(-10)} valueKey="cost" labelKey="date" color="bg-indigo-400" label="cost" />
          </div>
        ) : <p className="text-sm text-gray-400">No cost data</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* By provider */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Cost by Provider</h3>
          <BarChart data={costs?.byProvider} valueKey="cost" labelKey="provider" color="bg-purple-400" label="cost" />
        </div>
        {/* By workspace */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Cost by Workspace</h3>
          <BarChart data={costs?.byWorkspace} valueKey="cost" labelKey="workspace" color="bg-blue-400" label="cost" />
        </div>
        {/* By feature */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Cost by Feature</h3>
          <BarChart data={costs?.byFeature} valueKey="cost" labelKey="feature" color="bg-green-400" label="cost" />
        </div>
      </div>
    </div>
  );
}

// ─── Quotas Tab ───────────────────────────────────────────────────────────────

const EMPTY_QUOTA = { scope: 'platform', scopeId: '', dailyRequests: '', monthlyRequests: '', dailyCostLimit: '', monthlyCostLimit: '', active: true };

function QuotasTab() {
  const [quotas, setQuotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_QUOTA);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const load = () => {
    setLoading(true);
    svc.listQuotas().then((d) => setQuotas(Array.isArray(d) ? d : [])).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const save = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        scopeId: form.scopeId || null,
        dailyRequests:    form.dailyRequests    ? Number(form.dailyRequests)    : null,
        monthlyRequests:  form.monthlyRequests  ? Number(form.monthlyRequests)  : null,
        dailyCostLimit:   form.dailyCostLimit   ? Number(form.dailyCostLimit)   : null,
        monthlyCostLimit: form.monthlyCostLimit ? Number(form.monthlyCostLimit) : null,
      };
      await svc.upsertQuota(payload);
      setShowForm(false);
      setForm(EMPTY_QUOTA);
      load();
    } catch (_) {} finally { setSaving(false); }
  };

  const del = async (id) => {
    setDeleting(id);
    try { await svc.deleteQuota(id); load(); } catch (_) {} finally { setDeleting(null); }
  };

  const scopeColor = (s) => ({ platform: 'blue', plan: 'purple', workspace: 'green', user: 'orange' })[s] || 'gray';

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => { setForm(EMPTY_QUOTA); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">
          <Plus className="w-4 h-4" /> Add Quota Rule
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">New Quota Rule</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Scope</label>
              <select className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2" value={form.scope} onChange={set('scope')}>
                {SCOPES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Scope ID <span className="text-gray-400">(plan code / workspace ID / user ID)</span></label>
              <input className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2" placeholder="e.g. free, starter…" value={form.scopeId} onChange={set('scopeId')} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Daily Requests</label>
              <input type="number" className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2" placeholder="e.g. 1000" value={form.dailyRequests} onChange={set('dailyRequests')} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Monthly Requests</label>
              <input type="number" className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2" placeholder="e.g. 10000" value={form.monthlyRequests} onChange={set('monthlyRequests')} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Daily Cost Limit ($)</label>
              <input type="number" step="0.01" className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2" placeholder="e.g. 5.00" value={form.dailyCostLimit} onChange={set('dailyCostLimit')} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Monthly Cost Limit ($)</label>
              <input type="number" step="0.01" className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2" placeholder="e.g. 50.00" value={form.monthlyCostLimit} onChange={set('monthlyCostLimit')} />
            </div>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input type="checkbox" checked={form.active} onChange={set('active')} className="rounded" /> Active
            </label>
            <div className="flex-1" />
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
            <button onClick={save} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-60">
              {saving && <Loader2 className="w-3 h-3 animate-spin" />} Save Rule
            </button>
          </div>
        </div>
      )}

      {loading ? <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div> : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Scope</th>
                <th className="px-4 py-3 text-left">Scope ID</th>
                <th className="px-4 py-3 text-right">Daily Req</th>
                <th className="px-4 py-3 text-right">Monthly Req</th>
                <th className="px-4 py-3 text-right">Daily Cost</th>
                <th className="px-4 py-3 text-right">Monthly Cost</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {quotas.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-sm text-gray-400">No quota rules defined. Add one to start governing AI usage.</td></tr>
              ) : quotas.map((q) => (
                <tr key={q.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3"><Badge color={scopeColor(q.scope)}>{q.scope}</Badge></td>
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs">{q.scopeId || '—'}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{q.dailyRequests != null ? fmt(q.dailyRequests) : '—'}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{q.monthlyRequests != null ? fmt(q.monthlyRequests) : '—'}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{q.dailyCostLimit != null ? `$${Number(q.dailyCostLimit).toFixed(2)}` : '—'}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{q.monthlyCostLimit != null ? `$${Number(q.monthlyCostLimit).toFixed(2)}` : '—'}</td>
                  <td className="px-4 py-3 text-center"><Badge color={q.active ? 'green' : 'gray'}>{q.active ? 'Active' : 'Inactive'}</Badge></td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => del(q.id)} disabled={deleting === q.id} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                      {deleting === q.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Logs Tab ─────────────────────────────────────────────────────────────────

function LogsTab() {
  const [data, setData] = useState(null);
  const [filters, setFilters] = useState({ feature: '', success: '' });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const limit = 50;

  const load = useCallback(() => {
    setLoading(true);
    svc.listLogs({ ...filters, page, limit })
      .then(setData)
      .finally(() => setLoading(false));
  }, [filters, page]);

  useEffect(() => { load(); }, [load]);

  const setF = (k) => (e) => { setFilters((f) => ({ ...f, [k]: e.target.value })); setPage(1); };

  return (
    <div className="space-y-4">
      <div className="flex gap-3 flex-wrap">
        <input className="text-sm border border-gray-200 rounded-lg px-3 py-2 min-w-[160px]" placeholder="Filter by feature…" value={filters.feature} onChange={setF('feature')} />
        <select className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white" value={filters.success} onChange={setF('success')}>
          <option value="">All Results</option>
          <option value="true">Success only</option>
          <option value="false">Errors only</option>
        </select>
        <button onClick={load} className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {loading ? <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div> : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Time</th>
                <th className="px-4 py-3 text-left">Feature</th>
                <th className="px-4 py-3 text-left">Provider</th>
                <th className="px-4 py-3 text-left">Model</th>
                <th className="px-4 py-3 text-right">Tokens In</th>
                <th className="px-4 py-3 text-right">Tokens Out</th>
                <th className="px-4 py-3 text-right">Cost</th>
                <th className="px-4 py-3 text-right">Duration</th>
                <th className="px-4 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data?.items?.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-10 text-center text-sm text-gray-400">No logs found</td></tr>
              ) : data?.items?.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{fmtDate(log.createdAt)}</td>
                  <td className="px-4 py-3"><Badge color="blue">{log.feature}</Badge></td>
                  <td className="px-4 py-3 text-gray-600">{log.provider?.name || '—'}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{log.model?.modelName || '—'}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{fmt(log.tokensInput)}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{fmt(log.tokensOutput)}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{fmtCost(log.estimatedCost)}</td>
                  <td className="px-4 py-3 text-right text-gray-500 text-xs">{log.durationMs ? `${fmt(log.durationMs)}ms` : '—'}</td>
                  <td className="px-4 py-3 text-center">
                    <Badge color={log.success ? 'green' : 'red'}>{log.success ? 'OK' : 'Error'}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {data?.total > limit && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-sm text-gray-500">
              <span>{fmt(data.total)} total logs · Page {page} of {Math.ceil(data.total / limit)}</span>
              <div className="flex gap-2">
                <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="px-3 py-1 border border-gray-200 rounded-lg disabled:opacity-40">Prev</button>
                <button disabled={page * limit >= data.total} onClick={() => setPage((p) => p + 1)} className="px-3 py-1 border border-gray-200 rounded-lg disabled:opacity-40">Next</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AIUsagePage() {
  const [tab, setTab] = useState('Overview');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-indigo-600" /> AI Usage Monitoring
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Platform-wide AI consumption, costs, quotas, and governance</p>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-green-500" />
          <span className="text-xs text-gray-500">Admin-only</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 flex gap-1 overflow-x-auto">
        {TABS.map((t) => <Tab key={t} label={t} active={tab === t} onClick={() => setTab(t)} />)}
      </div>

      {/* Tab content */}
      {tab === 'Overview'   && <OverviewTab />}
      {tab === 'Workspaces' && <WorkspacesTab />}
      {tab === 'Users'      && <UsersTab />}
      {tab === 'Providers'  && <ProvidersTab />}
      {tab === 'Costs'      && <CostsTab />}
      {tab === 'Quotas'     && <QuotasTab />}
      {tab === 'Logs'       && <LogsTab />}
    </div>
  );
}
