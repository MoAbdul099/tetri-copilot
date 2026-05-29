import { useState, useEffect, useCallback } from 'react';
import {
  Building2, Users, CreditCard, BrainCircuit, ShieldCheck,
  HardDrive, RefreshCw, Download, TrendingUp, AlertTriangle,
  CheckCircle, Clock, Activity,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  getOverview, getOrganizations, getUsers, getSubscriptions,
  getAi, getCompliance, getStorage, getActivity, exportCsv,
} from '../services/dashboardService';

// ── Helpers ───────────────────────────────────────────────
const fmt = (n) => Number(n || 0).toLocaleString();
const fmtDate = (d) => d ? new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

function KpiCard({ label, value, sub, icon: Icon, color, loading }) {
  return (
    <div className="bg-white border border-tetri-border rounded-xl p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="text-2xl font-bold text-tetri-text">{loading ? '—' : value}</p>
      <p className="text-xs font-medium text-tetri-neutral mt-0.5">{label}</p>
      {sub && <p className="text-xs text-tetri-muted mt-1">{sub}</p>}
    </div>
  );
}

function SectionHeader({ title, icon: Icon }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Icon className="w-4 h-4 text-tetri-neutral" />
      <h2 className="text-sm font-semibold text-tetri-text">{title}</h2>
    </div>
  );
}

function BarRow({ label, value, max, suffix = '' }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3 py-1.5">
      <span className="text-xs text-tetri-neutral truncate w-28 flex-shrink-0">{label}</span>
      <div className="flex-1 bg-tetri-bg rounded-full h-1.5 overflow-hidden">
        <div className="h-1.5 rounded-full bg-tetri-primary" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-medium text-tetri-text w-14 text-right flex-shrink-0">{fmt(value)}{suffix}</span>
    </div>
  );
}

function MonthlyChart({ data }) {
  if (!data?.length) return <p className="text-xs text-tetri-muted">No data</p>;
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="flex items-end gap-2 h-20 mt-2">
      {data.map((d) => (
        <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full rounded-t-sm bg-tetri-primary/70 hover:bg-tetri-primary transition-colors"
            style={{ height: `${Math.max(Math.round((d.count / max) * 64), 2)}px` }}
            title={`${d.month}: ${d.count}`}
          />
          <span className="text-[10px] text-tetri-muted">{d.month}</span>
        </div>
      ))}
    </div>
  );
}

function ActivityItem({ log }) {
  const ACTION_COLOR = {
    login: 'text-green-600 bg-green-50',
    logout: 'text-tetri-neutral bg-tetri-bg',
    login_failed: 'text-red-600 bg-red-50',
    dashboard_export: 'text-blue-600 bg-blue-50',
  };
  const color = ACTION_COLOR[log.action] || 'text-tetri-neutral bg-tetri-bg';
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-tetri-border last:border-0">
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 ${color}`}>
        {log.action.replace(/_/g, ' ')}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-tetri-text truncate">{log.adminName} · {log.adminEmail}</p>
        {log.ipAddress && <p className="text-xs text-tetri-muted">{log.ipAddress}</p>}
      </div>
      <span className="text-xs text-tetri-muted flex-shrink-0">{fmtDate(log.createdAt)}</span>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────
export default function DashboardPage() {
  const { admin } = useAuth();
  const [loading, setLoading]   = useState(true);
  const [overview, setOverview] = useState(null);
  const [orgs, setOrgs]         = useState(null);
  const [users, setUsers]       = useState(null);
  const [subs, setSubs]         = useState(null);
  const [ai, setAi]             = useState(null);
  const [comp, setComp]         = useState(null);
  const [storage, setStorage]   = useState(null);
  const [feed, setFeed]         = useState([]);
  const [lastRefresh, setLastRefresh] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [ov, og, us, sb, aiD, cp, st, ac] = await Promise.all([
        getOverview(), getOrganizations(), getUsers(),
        getSubscriptions(), getAi(), getCompliance(),
        getStorage(), getActivity(),
      ]);
      setOverview(ov); setOrgs(og); setUsers(us); setSubs(sb);
      setAi(aiD); setComp(cp); setStorage(st); setFeed(ac);
      setLastRefresh(new Date());
    } catch {
      // silently keep previous data
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-tetri-text">Platform Dashboard</h1>
          <p className="text-sm text-tetri-neutral mt-0.5">
            Welcome, {admin?.firstName} · {lastRefresh ? `Last refreshed ${fmtDate(lastRefresh)}` : 'Loading…'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportCsv}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-tetri-border bg-white rounded-xl hover:bg-tetri-bg transition-colors"
          >
            <Download className="w-4 h-4 text-tetri-neutral" /> Export CSV
          </button>
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-tetri-primary text-white rounded-xl hover:bg-blue-700 disabled:opacity-60 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      {/* Top KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <KpiCard label="Total Orgs"       value={fmt(overview?.totalOrgs)}    sub={`+${fmt(overview?.newOrgsMonth)} this month`}  icon={Building2}    color="bg-blue-50 text-blue-600"    loading={loading} />
        <KpiCard label="Active Orgs"      value={fmt(overview?.activeOrgs)}   sub={`${fmt(overview?.suspendedOrgs)} suspended`}    icon={CheckCircle}  color="bg-green-50 text-green-600"  loading={loading} />
        <KpiCard label="Total Users"      value={fmt(overview?.totalUsers)}   sub={`+${fmt(overview?.newUsersMonth)} this month`}  icon={Users}        color="bg-purple-50 text-purple-600" loading={loading} />
        <KpiCard label="Active Users"     value={fmt(overview?.activeUsers)}  sub={`of ${fmt(overview?.totalUsers)} total`}        icon={Activity}     color="bg-indigo-50 text-indigo-600" loading={loading} />
        <KpiCard label="Active Subs"      value={fmt(overview?.activeSubs)}   sub={`${fmt(overview?.trialSubs)} trialing`}         icon={CreditCard}   color="bg-amber-50 text-amber-600"   loading={loading} />
        <KpiCard label="Est. MRR"         value={`$${fmt(subs?.estimatedMrr)}`} sub="based on active plans"                        icon={TrendingUp}   color="bg-emerald-50 text-emerald-600" loading={loading} />
      </div>

      {/* Row 2: Orgs + Users */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Organizations */}
        <div className="bg-white border border-tetri-border rounded-xl p-5">
          <SectionHeader title="Organizations by Plan" icon={Building2} />
          {loading || !orgs ? (
            <p className="text-sm text-tetri-muted">Loading…</p>
          ) : (
            <>
              <div className="space-y-0.5">
                {(orgs.byPlan || []).map((p) => (
                  <BarRow key={p.plan} label={p.plan} value={p.count} max={orgs.total} />
                ))}
                {(!orgs.byPlan?.length) && <p className="text-xs text-tetri-muted">No subscription data</p>}
              </div>
              <div className="mt-4">
                <p className="text-xs font-medium text-tetri-neutral mb-1">Monthly Growth (last 6 months)</p>
                <MonthlyChart data={orgs.growth} />
              </div>
            </>
          )}
        </div>

        {/* Users */}
        <div className="bg-white border border-tetri-border rounded-xl p-5">
          <SectionHeader title="User Metrics" icon={Users} />
          {loading || !users ? (
            <p className="text-sm text-tetri-muted">Loading…</p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { label: 'Total Users',       value: fmt(users.total) },
                  { label: 'Active',            value: fmt(users.active) },
                  { label: 'Inactive',          value: fmt(users.inactive) },
                  { label: 'New This Month',    value: fmt(users.newThisMonth) },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-tetri-bg rounded-lg px-3 py-2">
                    <p className="text-lg font-bold text-tetri-text">{value}</p>
                    <p className="text-xs text-tetri-neutral">{label}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs font-medium text-tetri-neutral mb-1">Monthly Growth (last 6 months)</p>
              <MonthlyChart data={users.growth} />
            </>
          )}
        </div>
      </div>

      {/* Row 3: Subscriptions + AI */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Subscriptions */}
        <div className="bg-white border border-tetri-border rounded-xl p-5">
          <SectionHeader title="Subscriptions" icon={CreditCard} />
          {loading || !subs ? (
            <p className="text-sm text-tetri-muted">Loading…</p>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { label: 'Active',    value: fmt(subs.active),   color: 'text-green-600' },
                  { label: 'Trialing',  value: fmt(subs.trialing), color: 'text-amber-600' },
                  { label: 'Past Due',  value: fmt(subs.pastDue),  color: 'text-red-600' },
                  { label: 'Cancelled', value: fmt(subs.cancelled), color: 'text-tetri-neutral' },
                  { label: 'Expired',   value: fmt(subs.expired),  color: 'text-tetri-neutral' },
                  { label: 'Est. MRR',  value: `$${fmt(subs.estimatedMrr)}`, color: 'text-emerald-600' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="bg-tetri-bg rounded-lg px-3 py-2">
                    <p className={`text-base font-bold ${color}`}>{value}</p>
                    <p className="text-xs text-tetri-neutral">{label}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs font-medium text-tetri-neutral mb-2">By Plan</p>
              {(subs.byPlan || [])
                .filter((p) => p.status === 'active')
                .map((p) => (
                  <BarRow key={p.plan} label={p.plan} value={p.count} max={subs.active || 1} />
                ))}
            </>
          )}
        </div>

        {/* AI Usage */}
        <div className="bg-white border border-tetri-border rounded-xl p-5">
          <SectionHeader title="AI Usage" icon={BrainCircuit} />
          {loading || !ai ? (
            <p className="text-sm text-tetri-muted">Loading…</p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { label: 'Requests (30d)',  value: fmt(ai.total30d) },
                  { label: 'All-Time',        value: fmt(ai.totalAllTime) },
                  { label: 'Total Tokens',    value: fmt(ai.totalTokens) },
                  { label: 'Est. Cost (USD)', value: `$${ai.estimatedCostUsd}` },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-tetri-bg rounded-lg px-3 py-2">
                    <p className="text-base font-bold text-tetri-text">{value}</p>
                    <p className="text-xs text-tetri-neutral">{label}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs font-medium text-tetri-neutral mb-2">Top Workspaces by Requests</p>
              {(ai.byWorkspace || []).slice(0, 5).map((w) => (
                <BarRow key={w.workspace} label={w.workspace} value={w.requests} max={ai.byWorkspace[0]?.requests || 1} />
              ))}
              {!ai.byWorkspace?.length && <p className="text-xs text-tetri-muted">No AI usage recorded</p>}
            </>
          )}
        </div>
      </div>

      {/* Row 4: Compliance + Storage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Compliance */}
        <div className="bg-white border border-tetri-border rounded-xl p-5">
          <SectionHeader title="Compliance Health" icon={ShieldCheck} />
          {loading || !comp ? (
            <p className="text-sm text-tetri-muted">Loading…</p>
          ) : (
            <>
              {/* Completion ring (CSS) */}
              <div className="flex items-center gap-6 mb-4">
                <div className="relative w-20 h-20 flex-shrink-0">
                  <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r="32" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                    <circle cx="40" cy="40" r="32" fill="none" stroke="#22c55e" strokeWidth="8"
                      strokeDasharray={`${2 * Math.PI * 32}`}
                      strokeDashoffset={`${2 * Math.PI * 32 * (1 - comp.completionRate / 100)}`}
                      strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-tetri-text">{comp.completionRate}%</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs text-tetri-neutral">Completion rate across all workspaces</p>
                  <p className="text-sm"><span className="font-semibold text-tetri-text">{fmt(comp.completed)}</span> <span className="text-tetri-neutral">completed</span></p>
                  <p className="text-sm"><span className="font-semibold text-tetri-text">{fmt(comp.total)}</span> <span className="text-tetri-neutral">total obligations</span></p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <div>
                    <p className="text-base font-bold text-red-600">{fmt(comp.overdue)}</p>
                    <p className="text-xs text-red-500">Overdue</p>
                  </div>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  <div>
                    <p className="text-base font-bold text-amber-600">{fmt(comp.upcomingNext30)}</p>
                    <p className="text-xs text-amber-500">Due in 30d</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Storage */}
        <div className="bg-white border border-tetri-border rounded-xl p-5">
          <SectionHeader title="Storage" icon={HardDrive} />
          {loading || !storage ? (
            <p className="text-sm text-tetri-muted">Loading…</p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-tetri-bg rounded-lg px-3 py-2">
                  <p className="text-base font-bold text-tetri-text">{fmt(storage.totalFiles)}</p>
                  <p className="text-xs text-tetri-neutral">Total Files</p>
                </div>
                <div className="bg-tetri-bg rounded-lg px-3 py-2">
                  <p className="text-base font-bold text-tetri-text">{storage.totalGb} GB</p>
                  <p className="text-xs text-tetri-neutral">Total Storage</p>
                </div>
              </div>
              <p className="text-xs font-medium text-tetri-neutral mb-2">Top Workspaces by Storage</p>
              {(storage.byWorkspace || []).slice(0, 5).map((w) => (
                <BarRow key={w.workspace} label={w.workspace} value={Number(w.mb)} max={Number(storage.byWorkspace[0]?.mb || 1)} suffix=" MB" />
              ))}
              {!storage.byWorkspace?.length && <p className="text-xs text-tetri-muted">No files stored</p>}
            </>
          )}
        </div>
      </div>

      {/* Activity Feed */}
      <div className="bg-white border border-tetri-border rounded-xl p-5">
        <SectionHeader title="Admin Activity Feed" icon={Activity} />
        {loading ? (
          <p className="text-sm text-tetri-muted">Loading…</p>
        ) : feed.length === 0 ? (
          <p className="text-sm text-tetri-muted">No activity recorded yet</p>
        ) : (
          <div>
            {feed.map((log) => <ActivityItem key={log.id} log={log} />)}
          </div>
        )}
      </div>
    </div>
  );
}
