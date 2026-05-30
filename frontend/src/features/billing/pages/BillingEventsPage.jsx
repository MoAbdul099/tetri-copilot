import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  CreditCard, CheckCircle, XCircle, RefreshCw, AlertTriangle,
  Calendar, ArrowLeft, Search, X, ChevronLeft, ChevronRight,
  Loader2,
} from 'lucide-react';
import PageHeader from '../../../components/shared/PageHeader';
import { getBillingEvents } from '../services/billingService';

const EVENT_CFG = {
  checkout_created:       { label: 'Checkout Initiated',      icon: CreditCard,     iconClass: 'text-tetri-blue bg-[#eff4ff]' },
  subscription_created:   { label: 'Subscription Started',    icon: CheckCircle,    iconClass: 'text-emerald-600 bg-emerald-50' },
  subscription_updated:   { label: 'Subscription Updated',    icon: RefreshCw,      iconClass: 'text-tetri-muted bg-tetri-bg' },
  subscription_cancelled: { label: 'Subscription Cancelled',  icon: XCircle,        iconClass: 'text-tetri-error bg-red-50' },
  payment_succeeded:      { label: 'Payment Succeeded',       icon: CheckCircle,    iconClass: 'text-emerald-600 bg-emerald-50' },
  payment_failed:         { label: 'Payment Failed',          icon: AlertTriangle,  iconClass: 'text-tetri-error bg-red-50' },
};

const EVENT_TYPES = Object.keys(EVENT_CFG);

const fmtDate = (d) => new Date(d).toLocaleString('en-US', {
  month: 'short', day: 'numeric', year: 'numeric',
  hour: '2-digit', minute: '2-digit',
});

function EventTypeBadge({ type }) {
  const cfg = EVENT_CFG[type] || { label: type.replace(/_/g, ' '), iconClass: 'text-tetri-muted bg-tetri-bg' };
  return (
    <span className="text-xs font-medium text-tetri-text capitalize">
      {cfg.label}
    </span>
  );
}

export default function BillingEventsPage() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [search, setSearch]   = useState('');
  const [filterType, setFilterType] = useState('');
  const [page, setPage]       = useState(1);
  const limit = 20;

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    getBillingEvents({ eventType: filterType || undefined, page, limit })
      .then(setData)
      .catch((e) => setError(e.response?.data?.error || 'Failed to load billing events'))
      .finally(() => setLoading(false));
  }, [filterType, page]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [filterType]);

  const filtered = data?.events?.filter((ev) => {
    if (!search) return true;
    const cfg = EVENT_CFG[ev.eventType];
    const label = cfg?.label || ev.eventType;
    return (
      label.toLowerCase().includes(search.toLowerCase()) ||
      (ev.providerEventId || '').toLowerCase().includes(search.toLowerCase())
    );
  }) || [];

  const pages = data ? Math.ceil(data.total / limit) : 1;

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <PageHeader
        title="Billing Events"
        subtitle="Your subscription and payment activity history."
      >
        <Link
          to="/billing"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-btn border border-tetri-border text-sm font-medium text-tetri-text hover:bg-tetri-bg transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Billing Overview
        </Link>
      </PageHeader>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tetri-muted" />
          <input
            className="w-full pl-9 pr-3 py-2 text-sm border border-tetri-border rounded-btn bg-tetri-surface focus:outline-none focus:ring-2 focus:ring-tetri-blue/30 text-tetri-text placeholder:text-tetri-neutral"
            placeholder="Search events…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-tetri-muted hover:text-tetri-text">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <select
          className="text-sm border border-tetri-border rounded-btn px-3 py-2 bg-tetri-surface text-tetri-text"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="">All Event Types</option>
          {EVENT_TYPES.map((t) => (
            <option key={t} value={t}>{EVENT_CFG[t]?.label || t}</option>
          ))}
        </select>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-tetri-muted" />
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="rounded-card border border-tetri-error/20 bg-red-50 p-6 text-center">
          <p className="text-sm text-tetri-error">{error}</p>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && filtered.length === 0 && (
        <div className="rounded-card border border-tetri-border bg-tetri-surface p-10 text-center">
          <CreditCard className="w-8 h-8 text-tetri-muted mx-auto mb-3" />
          <p className="text-sm font-medium text-tetri-text mb-1">No billing events yet</p>
          <p className="text-xs text-tetri-muted">Events appear here as your subscription activity occurs.</p>
        </div>
      )}

      {/* Events list */}
      {!loading && !error && filtered.length > 0 && (
        <div className="rounded-card border border-tetri-border bg-tetri-surface divide-y divide-tetri-border">
          {filtered.map((ev) => {
            const cfg = EVENT_CFG[ev.eventType] || {
              label: ev.eventType.replace(/_/g, ' '),
              icon: CreditCard,
              iconClass: 'text-tetri-muted bg-tetri-bg',
            };
            const Icon = cfg.icon;

            return (
              <div key={ev.id} className="flex items-center gap-4 px-5 py-4">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.iconClass}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-tetri-text">{cfg.label}</p>
                  {ev.providerEventId && (
                    <p className="text-xs text-tetri-neutral font-mono truncate mt-0.5">{ev.providerEventId}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs text-tetri-neutral flex-shrink-0">
                  <Calendar className="w-3 h-3" />
                  {fmtDate(ev.createdAt)}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {!loading && data && pages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-tetri-muted">{data.total} total events · page {page} of {pages}</p>
          <div className="flex gap-1">
            <button
              onClick={() => setPage((p) => p - 1)}
              disabled={page <= 1}
              className="p-1.5 rounded-btn border border-tetri-border hover:bg-tetri-bg disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-tetri-text" />
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= pages}
              className="p-1.5 rounded-btn border border-tetri-border hover:bg-tetri-bg disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-tetri-text" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
