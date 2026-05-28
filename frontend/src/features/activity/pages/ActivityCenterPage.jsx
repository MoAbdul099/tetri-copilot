import { useState, useEffect, useCallback } from 'react';
import { Activity, Download, RefreshCw, Search, Filter, X } from 'lucide-react';
import activityService from '../services/activityService';
import ActivityItem from '../components/ActivityItem';
import { getApiToken, API_BASE_URL } from '../../../lib/api';

const MODULES = ['customers', 'invoices', 'payments', 'expenses', 'files', 'compliance', 'members', 'workspaces', 'billing', 'authentication', 'settings', 'reports'];
const CATEGORIES = ['Customers', 'Invoices', 'Payments', 'Expenses', 'Files', 'Compliance', 'Users', 'Workspace', 'Billing', 'Subscription', 'Authentication', 'Administration', 'System', 'Notifications'];
const DATE_PRESETS = [
  { label: 'Today',      days: 0 },
  { label: 'Yesterday',  days: 1 },
  { label: 'Last 7 days',  days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
];

function daysAgoISO(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

export default function ActivityCenterPage() {
  const [items, setItems]     = useState([]);
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const [search,    setSearch]    = useState('');
  const [module,    setModule]    = useState('');
  const [category,  setCategory]  = useState('');
  const [datePreset, setDatePreset] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate,   setEndDate]   = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const limit = 50;

  const buildParams = useCallback(() => {
    const p = { page, limit };
    if (search)    p.search    = search;
    if (module)    p.module    = module;
    if (category)  p.category  = category;
    if (startDate) p.startDate = startDate;
    if (endDate)   p.endDate   = endDate;
    return p;
  }, [page, search, module, category, startDate, endDate]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await activityService.list(buildParams());
      setItems(result.items || []);
      setTotal(result.total || 0);
    } catch (err) {
      setError(err.message || 'Failed to load activity');
    } finally {
      setLoading(false);
    }
  }, [buildParams]);

  useEffect(() => { load(); }, [load]);

  function applyPreset(preset) {
    setDatePreset(preset.label);
    if (preset.days === 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      setStartDate(today.toISOString());
      setEndDate(new Date().toISOString());
    } else {
      setStartDate(daysAgoISO(preset.days));
      setEndDate(new Date().toISOString());
    }
    setPage(1);
  }

  function clearFilters() {
    setSearch('');
    setModule('');
    setCategory('');
    setDatePreset('');
    setStartDate('');
    setEndDate('');
    setPage(1);
  }

  const hasFilters = search || module || category || startDate || endDate;

  async function handleExport() {
    const params = { ...buildParams() };
    delete params.page;
    delete params.limit;
    const token = await getApiToken();
    const base = API_BASE_URL;
    const qs = new URLSearchParams(params).toString();
    const url = `${base}/api/v1/activity/export${qs ? `?${qs}` : ''}`;
    const a = document.createElement('a');
    a.href = url;
    a.setAttribute('data-token', token || '');
    // Use fetch + blob so auth header is sent
    try {
      const res = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      const blob = await res.blob();
      const objUrl = URL.createObjectURL(blob);
      a.href = objUrl;
      a.download = 'activity-log.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objUrl);
    } catch {}
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-tetri-text flex items-center gap-2">
            <Activity className="w-5 h-5 text-tetri-blue" />
            Activity Center
          </h1>
          <p className="text-sm text-tetri-muted mt-0.5">
            Complete history of workspace activity — {total.toLocaleString()} events
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="p-2 rounded-xl border border-tetri-border text-tetri-muted hover:bg-tetri-bg hover:text-tetri-text transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-tetri-border text-sm text-tetri-muted hover:bg-tetri-bg hover:text-tetri-text transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Search + Filter bar */}
      <div className="bg-tetri-surface border border-tetri-border rounded-card p-4 space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tetri-neutral" />
            <input
              type="text"
              placeholder="Search activities…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-3 py-2 text-sm border border-tetri-border rounded-xl bg-tetri-bg text-tetri-text placeholder:text-tetri-neutral focus:outline-none focus:ring-2 focus:ring-tetri-blue/20"
            />
          </div>
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-colors ${showFilters ? 'border-tetri-blue bg-[#eff4ff] text-tetri-blue' : 'border-tetri-border text-tetri-muted hover:bg-tetri-bg'}`}
          >
            <Filter className="w-4 h-4" />
            Filters
            {hasFilters && <span className="w-1.5 h-1.5 rounded-full bg-tetri-blue inline-block" />}
          </button>
          {hasFilters && (
            <button onClick={clearFilters} className="p-2 rounded-xl border border-tetri-border text-tetri-muted hover:bg-tetri-bg hover:text-tetri-error transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {showFilters && (
          <div className="pt-2 border-t border-tetri-border grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-medium text-tetri-neutral block mb-1">Module</label>
              <select
                value={module}
                onChange={(e) => { setModule(e.target.value); setPage(1); }}
                className="w-full text-sm border border-tetri-border rounded-xl px-3 py-2 bg-tetri-bg text-tetri-text focus:outline-none focus:ring-2 focus:ring-tetri-blue/20"
              >
                <option value="">All modules</option>
                {MODULES.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-tetri-neutral block mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => { setCategory(e.target.value); setPage(1); }}
                className="w-full text-sm border border-tetri-border rounded-xl px-3 py-2 bg-tetri-bg text-tetri-text focus:outline-none focus:ring-2 focus:ring-tetri-blue/20"
              >
                <option value="">All categories</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-xs font-medium text-tetri-neutral block mb-1">Date range</label>
              <div className="flex gap-2 flex-wrap">
                {DATE_PRESETS.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => applyPreset(p)}
                    className={`text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${datePreset === p.label ? 'bg-[#eff4ff] border-tetri-blue text-tetri-blue' : 'border-tetri-border text-tetri-muted hover:bg-tetri-bg'}`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Feed */}
      <div className="bg-tetri-surface border border-tetri-border rounded-card overflow-hidden">
        {loading && items.length === 0 && (
          <div className="flex items-center justify-center py-16 text-tetri-muted text-sm">
            Loading activity…
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center py-16 text-tetri-error text-sm">
            {error}
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <Activity className="w-8 h-8 text-tetri-neutral" />
            <p className="text-sm text-tetri-muted">No activity found</p>
          </div>
        )}

        {items.length > 0 && (
          <div className="divide-y divide-tetri-border">
            {items.map((item) => (
              <ActivityItem key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-tetri-muted">
          <span>Showing {Math.min((page - 1) * limit + 1, total)}–{Math.min(page * limit, total)} of {total.toLocaleString()}</span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-xl border border-tetri-border hover:bg-tetri-bg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-xl border border-tetri-border hover:bg-tetri-bg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
