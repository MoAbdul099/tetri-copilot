import { useState, useEffect, useCallback } from 'react';
import {
  CreditCard, CheckCircle2, XCircle, RefreshCw, AlertTriangle,
  Loader2, Search, X, ChevronLeft, ChevronRight,
  BarChart2, Building2, Calendar, Hash, Eye,
} from 'lucide-react';
import * as svc from '../services/adminBillingService';

// ─── Constants ────────────────────────────────────────────────────────────────

const EVENT_TYPES = [
  'checkout_created',
  'subscription_created',
  'subscription_updated',
  'subscription_cancelled',
  'payment_succeeded',
  'payment_failed',
];

const SUBSCRIPTION_STATUSES = ['active', 'trialing', 'past_due', 'cancelled', 'expired'];

const EVENT_CFG = {
  checkout_created:       { label: 'Checkout Created',        color: 'bg-blue-100 text-blue-700',    dot: 'bg-blue-500' },
  subscription_created:   { label: 'Subscription Created',    color: 'bg-green-100 text-green-700',  dot: 'bg-green-500' },
  subscription_updated:   { label: 'Subscription Updated',    color: 'bg-slate-100 text-slate-600',  dot: 'bg-slate-400' },
  subscription_cancelled: { label: 'Subscription Cancelled',  color: 'bg-red-100 text-red-700',      dot: 'bg-red-500' },
  payment_succeeded:      { label: 'Payment Succeeded',       color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  payment_failed:         { label: 'Payment Failed',          color: 'bg-red-100 text-red-700',      dot: 'bg-red-500' },
};

const SUB_STATUS_CFG = {
  active:    'bg-green-100 text-green-700',
  trialing:  'bg-blue-100 text-blue-700',
  past_due:  'bg-amber-100 text-amber-700',
  cancelled: 'bg-red-100 text-red-700',
  expired:   'bg-gray-100 text-gray-600',
};

const fmtDate  = (d) => d ? new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
const fmtShort = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
const cap = (s) => s ? s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : '—';

// ─── Small helpers ────────────────────────────────────────────────────────────

function KpiCard({ label, value, sub, color = 'text-gray-800', icon: Icon, bg = 'bg-gray-50' }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl px-5 py-4 flex items-center gap-4 shadow-sm">
      <div className={`p-2 rounded-lg ${bg}`}><Icon className={`w-5 h-5 ${color}`} /></div>
      <div>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <p className={`text-2xl font-bold ${color}`}>{value ?? '—'}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function EventTypeBadge({ type }) {
  const cfg = EVENT_CFG[type] || { label: cap(type), color: 'bg-gray-100 text-gray-600' };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>{cfg.label}</span>;
}

function SubStatusBadge({ status }) {
  return <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${SUB_STATUS_CFG[status] || 'bg-gray-100 text-gray-600'}`}>{cap(status)}</span>;
}

function Pagination({ page, total, limit, onPage }) {
  const pages = Math.ceil(total / limit);
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
      <p className="text-xs text-gray-500">{total} total · page {page} of {pages}</p>
      <div className="flex gap-1">
        <button onClick={() => onPage(page - 1)} disabled={page <= 1} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition-colors">
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        </button>
        <button onClick={() => onPage(page + 1)} disabled={page >= pages} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition-colors">
          <ChevronRight className="w-4 h-4 text-gray-600" />
        </button>
      </div>
    </div>
  );
}

// ─── Event Detail Modal ───────────────────────────────────────────────────────

function EventModal({ id, onClose }) {
  const [ev, setEv]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    svc.getEvent(id)
      .then(setEv)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800">Billing Event Detail</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X className="w-4 h-4" /></button>
        </div>

        {loading && <div className="flex justify-center p-10"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>}

        {!loading && ev && (
          <div className="p-6 space-y-5">
            {/* Summary */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Event Type</p>
                <EventTypeBadge type={ev.eventType} />
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Provider</p>
                <p className="font-medium text-gray-700 capitalize">{ev.provider}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Workspace</p>
                <p className="font-medium text-gray-700">{ev.workspace?.name || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Date</p>
                <p className="font-medium text-gray-700">{fmtDate(ev.createdAt)}</p>
              </div>
              {ev.providerEventId && (
                <div className="col-span-2">
                  <p className="text-xs text-gray-400 mb-0.5">Provider Event ID</p>
                  <p className="font-mono text-xs text-gray-600 bg-gray-50 rounded-lg px-3 py-2 break-all">{ev.providerEventId}</p>
                </div>
              )}
            </div>

            {/* Subscription */}
            {ev.subscription && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Subscription</p>
                <div className="grid grid-cols-2 gap-3 text-sm bg-gray-50 rounded-xl p-4">
                  <div><p className="text-xs text-gray-400">Plan</p><p className="font-medium">{ev.subscription.plan?.name || '—'}</p></div>
                  <div><p className="text-xs text-gray-400">Status</p><SubStatusBadge status={ev.subscription.status} /></div>
                  {ev.subscription.stripeSubscriptionId && (
                    <div className="col-span-2"><p className="text-xs text-gray-400">Stripe Sub ID</p><p className="font-mono text-xs text-gray-600 break-all">{ev.subscription.stripeSubscriptionId}</p></div>
                  )}
                  {ev.subscription.stripeCustomerId && (
                    <div className="col-span-2"><p className="text-xs text-gray-400">Stripe Customer ID</p><p className="font-mono text-xs text-gray-600 break-all">{ev.subscription.stripeCustomerId}</p></div>
                  )}
                </div>
              </div>
            )}

            {/* Payload */}
            {ev.payload && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Stripe Payload</p>
                <pre className="bg-gray-900 text-green-300 text-xs rounded-xl p-4 overflow-auto max-h-64 font-mono">
                  {JSON.stringify(ev.payload, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Dashboard Tab ────────────────────────────────────────────────────────────

function DashboardTab() {
  const [dash, setDash]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    svc.getDashboard().then(setDash).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>;
  if (!dash)   return <p className="text-sm text-gray-400 py-8 text-center">Failed to load dashboard.</p>;

  return (
    <div className="space-y-6">
      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Payments Succeeded"  value={dash.paymentSucceeded}  icon={CheckCircle2}  color="text-emerald-600" bg="bg-emerald-50" />
        <KpiCard label="Payments Failed"     value={dash.paymentFailed}     icon={XCircle}       color="text-red-600"     bg="bg-red-50" />
        <KpiCard label="Active Subscriptions" value={dash.activeSubscriptions} icon={CreditCard}  color="text-indigo-600"  bg="bg-indigo-50" sub={`${dash.trialingSubscriptions} trialing`} />
        <KpiCard label="Success Rate (all time)" value={`${dash.successRate}%`} icon={BarChart2}  color={dash.successRate >= 90 ? 'text-emerald-600' : 'text-amber-600'} bg={dash.successRate >= 90 ? 'bg-emerald-50' : 'bg-amber-50'} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <KpiCard label="Total Events"      value={dash.totalEvents}    icon={Hash}          color="text-gray-700" bg="bg-gray-50" sub={`${dash.totalEvents30d} last 30 days`} />
        <KpiCard label="Past Due"          value={dash.pastDueSubscriptions} icon={AlertTriangle} color="text-amber-600" bg="bg-amber-50" />
        <KpiCard label="Provider"          value="Stripe"              icon={CreditCard}     color="text-indigo-600" bg="bg-indigo-50" sub="webhook-driven" />
      </div>

      {/* Recent failures */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Recent Payment Failures</h3>
        {dash.recentFailures.length === 0 ? (
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-center">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
            <p className="text-sm text-emerald-700 font-medium">No payment failures in the last 30 days</p>
          </div>
        ) : (
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            {dash.recentFailures.map((ev) => (
              <div key={ev.id} className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 last:border-0">
                <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800">{ev.workspace?.name || 'Unknown workspace'}</p>
                  {ev.providerEventId && <p className="text-xs text-gray-400 font-mono truncate">{ev.providerEventId}</p>}
                </div>
                <p className="text-xs text-gray-400 flex-shrink-0">{fmtDate(ev.createdAt)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Events Tab ───────────────────────────────────────────────────────────────

function EventsTab() {
  const [data, setData]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [filterType, setFilterType] = useState('');
  const [page, setPage]   = useState(1);
  const [detailId, setDetailId] = useState(null);
  const limit = 25;

  const load = useCallback(() => {
    setLoading(true);
    svc.listEvents({ search: search || undefined, eventType: filterType || undefined, page, limit })
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search, filterType, page]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [search, filterType]);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
            placeholder="Search workspace or event ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X className="w-3.5 h-3.5" /></button>}
        </div>
        <select
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="">All Event Types</option>
          {EVENT_TYPES.map((t) => <option key={t} value={t}>{cap(t)}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Event Type</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Workspace</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Provider ID</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Plan</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && (
              <tr><td colSpan={6} className="px-4 py-10 text-center"><Loader2 className="w-5 h-5 animate-spin text-gray-400 mx-auto" /></td></tr>
            )}
            {!loading && data?.items?.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-400">No billing events found.</td></tr>
            )}
            {!loading && data?.items?.map((ev) => (
              <tr key={ev.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3"><EventTypeBadge type={ev.eventType} /></td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    <span className="font-medium text-gray-800 truncate max-w-32">{ev.workspace?.name || '—'}</span>
                  </div>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <span className="font-mono text-xs text-gray-500 truncate block max-w-48">{ev.providerEventId || '—'}</span>
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-xs text-gray-600">
                  {ev.subscription?.plan?.name || '—'}
                </td>
                <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                  <div className="flex items-center gap-1"><Calendar className="w-3 h-3" />{fmtDate(ev.createdAt)}</div>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => setDetailId(ev.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data && <Pagination page={page} total={data.total} limit={limit} onPage={setPage} />}
      </div>

      {detailId && <EventModal id={detailId} onClose={() => setDetailId(null)} />}
    </div>
  );
}

// ─── Subscriptions Tab ────────────────────────────────────────────────────────

function SubscriptionsTab() {
  const [data, setData]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage]   = useState(1);
  const limit = 25;

  const load = useCallback(() => {
    setLoading(true);
    svc.listSubscriptions({ search: search || undefined, status: filterStatus || undefined, page, limit })
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search, filterStatus, page]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [search, filterStatus]);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
            placeholder="Search workspace or Stripe customer ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X className="w-3.5 h-3.5" /></button>}
        </div>
        <select
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">All Statuses</option>
          {SUBSCRIPTION_STATUSES.map((s) => <option key={s} value={s}>{cap(s)}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Workspace</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Plan</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Stripe Customer</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Current Period</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && (
              <tr><td colSpan={6} className="px-4 py-10 text-center"><Loader2 className="w-5 h-5 animate-spin text-gray-400 mx-auto" /></td></tr>
            )}
            {!loading && data?.items?.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-400">No subscriptions found.</td></tr>
            )}
            {!loading && data?.items?.map((sub) => (
              <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-gray-400" />
                    <span className="font-medium text-gray-800">{sub.workspace?.name || '—'}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-700">{sub.plan?.name || '—'}</td>
                <td className="px-4 py-3"><SubStatusBadge status={sub.status} /></td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span className="font-mono text-xs text-gray-500 truncate block max-w-36">{sub.stripeCustomerId || '—'}</span>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell text-xs text-gray-500">
                  {sub.currentPeriodStart ? `${fmtShort(sub.currentPeriodStart)} → ${fmtShort(sub.currentPeriodEnd)}` : '—'}
                </td>
                <td className="px-4 py-3 hidden lg:table-cell text-xs text-gray-500">{fmtShort(sub.updatedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {data && <Pagination page={page} total={data.total} limit={limit} onPage={setPage} />}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const TABS = [
  { key: 'dashboard',     label: 'Dashboard' },
  { key: 'events',        label: 'Events' },
  { key: 'subscriptions', label: 'Subscriptions' },
];

export default function BillingEventsPage() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-indigo-600" />
            Billing Events
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Platform-wide billing events, payment tracking, and subscription overview</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 gap-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === t.key
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'dashboard'     && <DashboardTab />}
      {activeTab === 'events'        && <EventsTab />}
      {activeTab === 'subscriptions' && <SubscriptionsTab />}
    </div>
  );
}
