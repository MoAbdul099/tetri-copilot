import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, CreditCard, ChevronRight, RefreshCw, TrendingUp, Users, AlertTriangle, CheckCircle } from 'lucide-react';
import { listSubscriptions, getRevenue, getRenewals, getPlans } from '../services/subscriptionsService';

const STATUS_TABS = [
  { value: '', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'trialing', label: 'Trial' },
  { value: 'past_due', label: 'Past Due' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'expired', label: 'Expired' },
];

const PLAN_OPTS = [
  { value: '', label: 'All Plans' },
  { value: 'free', label: 'Free' },
  { value: 'starter', label: 'Starter' },
  { value: 'professional', label: 'Professional' },
  { value: 'business', label: 'Business' },
];

const STATUS_STYLE = {
  active:    'bg-green-50 text-green-700 border-green-200',
  trialing:  'bg-blue-50 text-blue-700 border-blue-200',
  past_due:  'bg-orange-50 text-orange-700 border-orange-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
  expired:   'bg-gray-50 text-gray-600 border-gray-200',
};

const fmtDate  = (d) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';
const fmtMoney = (n) => `$${Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmt      = (n) => Number(n || 0).toLocaleString();
const daysLeft = (d) => d ? Math.ceil((new Date(d) - new Date()) / (1000 * 60 * 60 * 24)) : null;

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_STYLE[status] || 'bg-tetri-bg text-tetri-neutral border-tetri-border'}`}>
      {status?.replace('_', ' ')}
    </span>
  );
}

function KpiCard({ label, value, sub, accent }) {
  return (
    <div className={`bg-white border rounded-xl p-4 ${accent ? 'border-tetri-primary/30' : 'border-tetri-border'}`}>
      <p className="text-xs text-tetri-neutral mb-1">{label}</p>
      <p className={`text-2xl font-bold ${accent ? 'text-tetri-primary' : 'text-tetri-text'}`}>{value}</p>
      {sub && <p className="text-xs text-tetri-muted mt-0.5">{sub}</p>}
    </div>
  );
}

const MAIN_TABS = ['Overview', 'Subscriptions', 'Plan Catalog'];

export default function PlansPage() {
  const navigate = useNavigate();
  const [tab, setTab]           = useState('Overview');

  // Overview data
  const [revenue, setRevenue]   = useState(null);
  const [renewals, setRenewals] = useState(null);
  const [plans, setPlans]       = useState(null);

  // Subscriptions directory
  const [subs, setSubs]         = useState([]);
  const [total, setTotal]       = useState(0);
  const [pages, setPages]       = useState(1);
  const [page, setPage]         = useState(1);
  const [loading, setLoading]   = useState(false);
  const [search, setSearch]     = useState('');
  const [statusTab, setStatusTab] = useState('');
  const [planCode, setPlanCode] = useState('');

  // Load overview
  useEffect(() => {
    if (tab === 'Overview' && !revenue) {
      Promise.all([getRevenue(), getRenewals()]).then(([r, rn]) => { setRevenue(r); setRenewals(rn); }).catch(() => {});
    }
    if (tab === 'Plan Catalog' && !plans) {
      getPlans().then(setPlans).catch(() => setPlans([]));
    }
  }, [tab, revenue, plans]);

  // Load subscriptions
  const loadSubs = useCallback(async () => {
    if (tab !== 'Subscriptions') return;
    setLoading(true);
    try {
      const data = await listSubscriptions({ search: search || undefined, status: statusTab || undefined, planCode: planCode || undefined, page, limit: 20 });
      setSubs(data.items || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
    } catch { /* keep stale */ }
    finally { setLoading(false); }
  }, [tab, search, statusTab, planCode, page]);

  useEffect(() => { loadSubs(); }, [loadSubs]);
  useEffect(() => { setPage(1); }, [search, statusTab, planCode]);

  return (
    <div className="space-y-5 max-w-7xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-tetri-text">Plans & Subscriptions</h1>
          <p className="text-sm text-tetri-neutral mt-0.5">Subscription lifecycle and revenue management</p>
        </div>
        <button onClick={() => { setRevenue(null); setRenewals(null); setPlans(null); loadSubs(); }}
          className="flex items-center gap-2 px-3 py-2 text-sm border border-tetri-border bg-white rounded-xl hover:bg-tetri-bg transition-colors">
          <RefreshCw className="w-4 h-4 text-tetri-neutral" /> Refresh
        </button>
      </div>

      {/* Main tabs */}
      <div className="flex gap-1 border-b border-tetri-border overflow-x-auto">
        {MAIN_TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              tab === t ? 'border-tetri-primary text-tetri-primary' : 'border-transparent text-tetri-neutral hover:text-tetri-text'
            }`}>{t}</button>
        ))}
      </div>

      {/* ── Overview ── */}
      {tab === 'Overview' && (
        <div className="space-y-5">
          {!revenue ? (
            <div className="py-16 text-center text-tetri-neutral text-sm">Loading…</div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard label="Monthly Recurring Revenue" value={fmtMoney(revenue.mrr)} sub={`ARR: ${fmtMoney(revenue.arr)}`} accent />
                <KpiCard label="Active Subscriptions" value={fmt(revenue.activeCount)} />
                <KpiCard label="Trialing" value={fmt(revenue.trialingCount)} sub="active trials" />
                <KpiCard label="Past Due" value={fmt(revenue.pastDueCount)} sub={`${fmt(revenue.cancelledCount)} cancelled`} />
              </div>

              {/* Revenue by plan */}
              {revenue.planBreakdown?.length > 0 && (
                <div className="bg-white border border-tetri-border rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-tetri-text mb-4 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-tetri-primary" /> Revenue by Plan
                  </h3>
                  <div className="space-y-3">
                    {revenue.planBreakdown.sort((a, b) => b.mrr - a.mrr).map((p) => (
                      <div key={p.name} className="flex items-center gap-3">
                        <span className="text-sm text-tetri-text w-28 capitalize">{p.name}</span>
                        <div className="flex-1 h-2 bg-tetri-bg rounded-full overflow-hidden">
                          <div className="h-full bg-tetri-primary rounded-full"
                            style={{ width: `${Math.min(100, (p.mrr / Number(revenue.mrr)) * 100)}%` }} />
                        </div>
                        <span className="text-sm font-medium text-tetri-text w-20 text-right">{fmtMoney(p.mrr)}</span>
                        <span className="text-xs text-tetri-muted w-16 text-right">{p.count} subs</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Renewals + Trials */}
              {renewals && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <div className="bg-white border border-tetri-border rounded-xl">
                    <div className="px-5 py-3 border-b border-tetri-border flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-tetri-text flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-orange-500" /> Upcoming Renewals (30d)
                      </h3>
                      <span className="text-xs text-tetri-neutral">{renewals.upcoming?.length || 0} total</span>
                    </div>
                    {renewals.upcoming?.length === 0 ? (
                      <div className="py-8 text-center text-tetri-neutral text-xs">None upcoming</div>
                    ) : (
                      <div className="divide-y divide-tetri-border">
                        {renewals.upcoming.slice(0, 8).map((s) => (
                          <div key={s.id} className="flex items-center gap-3 px-5 py-2.5 cursor-pointer hover:bg-tetri-bg/50 transition-colors"
                            onClick={() => navigate(`/subscriptions/${s.id}`)}>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-tetri-text truncate">
                                {s.workspace?.company?.companyName || s.workspace?.name}
                              </p>
                              <p className="text-xs text-tetri-muted">{s.plan?.name}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-xs font-medium text-orange-600">{daysLeft(s.currentPeriodEnd)}d left</p>
                              <p className="text-xs text-tetri-muted">{fmtDate(s.currentPeriodEnd)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="bg-white border border-tetri-border rounded-xl">
                    <div className="px-5 py-3 border-b border-tetri-border flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-tetri-text flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-500" /> Active Trials
                      </h3>
                      <span className="text-xs text-tetri-neutral">{renewals.trialing?.length || 0} total</span>
                    </div>
                    {renewals.trialing?.length === 0 ? (
                      <div className="py-8 text-center text-tetri-neutral text-xs">No active trials</div>
                    ) : (
                      <div className="divide-y divide-tetri-border">
                        {renewals.trialing.slice(0, 8).map((s) => {
                          const days = daysLeft(s.currentPeriodEnd);
                          return (
                            <div key={s.id} className="flex items-center gap-3 px-5 py-2.5 cursor-pointer hover:bg-tetri-bg/50 transition-colors"
                              onClick={() => navigate(`/subscriptions/${s.id}`)}>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-tetri-text truncate">
                                  {s.workspace?.company?.companyName || s.workspace?.name}
                                </p>
                                <p className="text-xs text-tetri-muted">{s.plan?.name}</p>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className={`text-xs font-medium ${days !== null && days <= 3 ? 'text-red-600' : 'text-blue-600'}`}>
                                  {days !== null ? `${days}d left` : '—'}
                                </p>
                                <p className="text-xs text-tetri-muted">{fmtDate(s.currentPeriodEnd)}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── Subscriptions Directory ── */}
      {tab === 'Subscriptions' && (
        <div className="space-y-4">
          {/* Status sub-tabs */}
          <div className="flex gap-1 overflow-x-auto">
            {STATUS_TABS.map((t) => (
              <button key={t.value} onClick={() => setStatusTab(t.value)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                  statusTab === t.value ? 'bg-tetri-primary text-white' : 'bg-tetri-bg text-tetri-neutral hover:bg-tetri-border'
                }`}>{t.label}</button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tetri-neutral" />
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by workspace, owner…"
                className="w-full pl-9 pr-3 py-2 text-sm border border-tetri-border rounded-xl bg-white text-tetri-text placeholder:text-tetri-muted focus:outline-none focus:ring-2 focus:ring-tetri-primary/20 focus:border-tetri-primary" />
            </div>
            <select value={planCode} onChange={(e) => setPlanCode(e.target.value)}
              className="text-sm border border-tetri-border rounded-xl px-3 py-2 bg-white text-tetri-text focus:outline-none focus:ring-2 focus:ring-tetri-primary/20">
              {PLAN_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <div className="bg-white border border-tetri-border rounded-xl overflow-x-auto">
            {loading && subs.length === 0 ? (
              <div className="py-16 text-center text-tetri-neutral text-sm">Loading…</div>
            ) : subs.length === 0 ? (
              <div className="py-16 text-center space-y-2">
                <CreditCard className="w-10 h-10 text-tetri-border mx-auto" />
                <p className="text-sm font-medium text-tetri-neutral">No subscriptions found</p>
              </div>
            ) : (
              <table className="w-full text-sm min-w-[860px]">
                <thead>
                  <tr className="border-b border-tetri-border bg-tetri-bg">
                    {['Workspace', 'Owner', 'Plan', 'Status', 'Period End', 'MRR', 'Created', ''].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-tetri-neutral uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {subs.map((s) => (
                    <tr key={s.id} onClick={() => navigate(`/subscriptions/${s.id}`)}
                      className="border-b border-tetri-border last:border-0 hover:bg-tetri-bg/50 cursor-pointer transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-tetri-text">{s.workspace?.company?.companyName || s.workspace?.name || '—'}</p>
                        <p className="text-xs text-tetri-muted">{s.workspace?.name}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-tetri-text">{s.workspace?.owner?.fullName || '—'}</p>
                        <p className="text-xs text-tetri-muted">{s.workspace?.owner?.email}</p>
                      </td>
                      <td className="px-4 py-3 text-tetri-neutral capitalize">{s.plan?.name || '—'}</td>
                      <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
                      <td className="px-4 py-3 text-tetri-neutral text-xs">
                        {s.currentPeriodEnd ? (
                          <span className={daysLeft(s.currentPeriodEnd) !== null && daysLeft(s.currentPeriodEnd) <= 7 && s.status === 'active' ? 'text-orange-600 font-medium' : ''}>
                            {fmtDate(s.currentPeriodEnd)}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3 text-tetri-neutral text-xs">{fmtMoney(s.plan?.monthlyPriceUsd)}</td>
                      <td className="px-4 py-3 text-tetri-neutral text-xs">{fmtDate(s.createdAt)}</td>
                      <td className="px-4 py-3"><ChevronRight className="w-4 h-4 text-tetri-muted" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {pages > 1 && (
            <div className="flex items-center justify-between text-sm text-tetri-neutral">
              <span>Page {page} of {pages} · {fmt(total)} total</span>
              <div className="flex gap-2">
                <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="px-3 py-1.5 border border-tetri-border rounded-lg text-sm hover:bg-tetri-bg disabled:opacity-50 transition-colors">Previous</button>
                <button disabled={page >= pages} onClick={() => setPage((p) => p + 1)} className="px-3 py-1.5 border border-tetri-border rounded-lg text-sm hover:bg-tetri-bg disabled:opacity-50 transition-colors">Next</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Plan Catalog ── */}
      {tab === 'Plan Catalog' && (
        <div className="space-y-4">
          {!plans ? (
            <div className="py-16 text-center text-tetri-neutral text-sm">Loading…</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
              {plans.map((p) => (
                <div key={p.id} className={`bg-white border rounded-xl p-5 space-y-4 ${p.isRecommended ? 'border-tetri-primary ring-1 ring-tetri-primary/20' : 'border-tetri-border'}`}>
                  {p.isRecommended && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-tetri-primary text-white">Recommended</span>
                  )}
                  <div>
                    <h3 className="text-base font-bold text-tetri-text capitalize">{p.name}</h3>
                    <p className="text-2xl font-bold text-tetri-primary mt-1">
                      ${Number(p.monthlyPriceUsd).toFixed(0)}<span className="text-sm font-normal text-tetri-neutral">/mo</span>
                    </p>
                    {p.yearlyPriceUsd && Number(p.yearlyPriceUsd) > 0 && (
                      <p className="text-xs text-tetri-muted">${Number(p.yearlyPriceUsd).toFixed(0)}/yr</p>
                    )}
                  </div>
                  <div className="space-y-1.5 text-xs text-tetri-neutral">
                    <div className="flex justify-between"><span>Included Users</span><span className="font-medium text-tetri-text">{p.includedUsers}</span></div>
                    {p.maxUsers && <div className="flex justify-between"><span>Max Users</span><span className="font-medium text-tetri-text">{p.maxUsers}</span></div>}
                    {p.maxMonthlyInvoices && <div className="flex justify-between"><span>Invoices/mo</span><span className="font-medium text-tetri-text">{fmt(p.maxMonthlyInvoices)}</span></div>}
                    {p.maxMonthlyAiRequests && <div className="flex justify-between"><span>AI Requests/mo</span><span className="font-medium text-tetri-text">{fmt(p.maxMonthlyAiRequests)}</span></div>}
                    {p.maxStorageMb && <div className="flex justify-between"><span>Storage</span><span className="font-medium text-tetri-text">{p.maxStorageMb >= 1024 ? `${(p.maxStorageMb / 1024).toFixed(0)} GB` : `${p.maxStorageMb} MB`}</span></div>}
                  </div>
                  <div className="space-y-1 text-xs">
                    {[
                      ['Expenses', p.hasExpenses],
                      ['AI Categorization', p.hasAiCategorization],
                      ['Advanced Compliance', p.hasAdvancedCompliance],
                    ].map(([label, enabled]) => (
                      <div key={label} className="flex items-center gap-1.5">
                        {enabled
                          ? <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                          : <div className="w-3.5 h-3.5 rounded-full border border-gray-300 flex-shrink-0" />}
                        <span className={enabled ? 'text-tetri-text' : 'text-tetri-muted'}>{label}</span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-2 border-t border-tetri-border text-center">
                    <p className="text-xs text-tetri-neutral">
                      <span className="font-bold text-tetri-primary text-base">{fmt(p.activeSubscribers)}</span> active subscribers
                    </p>
                    <span className={`mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${p.isActive ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-50 text-gray-500 border border-gray-200'}`}>
                      {p.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
