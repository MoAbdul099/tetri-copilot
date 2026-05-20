import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';
import { getAgingData } from '../services/receivablesService';
import { useToast } from '../../../components/shared/Toast.jsx';

const BUCKET_CFG = {
  current:   { label: 'Current',     color: 'text-emerald-700', bg: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' },
  '1_30':    { label: '1–30 Days',   color: 'text-yellow-700',  bg: 'bg-yellow-50 text-yellow-700',  dot: 'bg-yellow-500' },
  '31_60':   { label: '31–60 Days',  color: 'text-orange-700',  bg: 'bg-orange-50 text-orange-700',  dot: 'bg-orange-500' },
  '61_90':   { label: '61–90 Days',  color: 'text-red-600',     bg: 'bg-red-50 text-red-600',        dot: 'bg-red-500' },
  '91_120':  { label: '91–120 Days', color: 'text-red-800',     bg: 'bg-red-100 text-red-800',       dot: 'bg-red-700' },
  '120_plus':{ label: '120+ Days',   color: 'text-red-900',     bg: 'bg-red-200 text-red-900',       dot: 'bg-red-900' },
};

const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n || 0);
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

export default function AgingPage() {
  const navigate = useNavigate();
  const { showToast, ToastContainer } = useToast();
  const [aging, setAging]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [bucketFilter, setBucketFilter] = useState('');

  useEffect(() => {
    getAgingData()
      .then(setAging)
      .catch(() => showToast('error', 'Failed to load aging data'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = (aging?.invoices || []).filter((inv) => {
    const matchSearch = !search || inv.customer?.name?.toLowerCase().includes(search.toLowerCase()) || inv.invoiceNumber?.toLowerCase().includes(search.toLowerCase());
    const matchBucket = !bucketFilter || inv.bucket === bucketFilter;
    return matchSearch && matchBucket;
  });

  const totalAging = aging ? Object.values(aging.buckets).reduce((s, v) => s + v, 0) : 0;

  return (
    <div className="space-y-6">
      {ToastContainer}

      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/receivables')} className="p-1.5 rounded-lg text-tetri-muted hover:bg-tetri-bg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-tetri-text">Aging Analysis</h1>
          <p className="text-sm text-tetri-muted mt-0.5">Outstanding invoices by age bucket</p>
        </div>
      </div>

      {/* Bucket summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {Object.entries(BUCKET_CFG).map(([key, cfg]) => {
          const val = aging?.buckets?.[key] || 0;
          const pct = totalAging > 0 ? ((val / totalAging) * 100).toFixed(1) : 0;
          return (
            <button
              key={key}
              onClick={() => setBucketFilter(bucketFilter === key ? '' : key)}
              className={`p-3 rounded-card border text-left transition-all ${
                bucketFilter === key
                  ? 'border-tetri-blue bg-[#eff4ff] shadow-sm'
                  : 'border-tetri-border bg-tetri-surface hover:border-tetri-blue/30'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                <span className="text-xs text-tetri-muted font-medium">{cfg.label}</span>
              </div>
              <p className={`text-sm font-bold ${cfg.color}`}>{fmt(val)}</p>
              <p className="text-xs text-tetri-muted mt-0.5">{pct}%</p>
            </button>
          );
        })}
      </div>

      {/* Search + filter */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tetri-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customer or invoice..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-tetri-border rounded-lg bg-tetri-surface focus:outline-none focus:ring-2 focus:ring-tetri-blue/20"
          />
        </div>
        {bucketFilter && (
          <button onClick={() => setBucketFilter('')} className="px-3 py-2 text-sm text-tetri-muted border border-tetri-border rounded-lg hover:bg-tetri-bg">
            Clear filter
          </button>
        )}
      </div>

      {/* Invoice table */}
      <div className="bg-tetri-surface border border-tetri-border rounded-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-tetri-bg border-b border-tetri-border">
              <tr>
                <th className="text-left font-medium text-tetri-muted px-4 py-3">Customer</th>
                <th className="text-left font-medium text-tetri-muted px-4 py-3">Invoice #</th>
                <th className="text-left font-medium text-tetri-muted px-4 py-3">Issue Date</th>
                <th className="text-left font-medium text-tetri-muted px-4 py-3">Due Date</th>
                <th className="text-right font-medium text-tetri-muted px-4 py-3">Outstanding</th>
                <th className="text-right font-medium text-tetri-muted px-4 py-3">Days Overdue</th>
                <th className="text-center font-medium text-tetri-muted px-4 py-3">Bucket</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-tetri-border">
                    {Array.from({ length: 7 }).map((__, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-tetri-bg animate-pulse rounded" /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-tetri-muted">
                    {search || bucketFilter ? 'No invoices match your filters' : 'No outstanding invoices'}
                  </td>
                </tr>
              ) : filtered.map((inv) => {
                const cfg = BUCKET_CFG[inv.bucket];
                return (
                  <tr
                    key={inv.id}
                    className="border-b border-tetri-border hover:bg-tetri-bg cursor-pointer transition-colors"
                    onClick={() => navigate(`/invoices/${inv.id}`)}
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-tetri-text">{inv.customer?.name}</p>
                      <p className="text-xs text-tetri-muted">{inv.customer?.customerCode}</p>
                    </td>
                    <td className="px-4 py-3 text-tetri-blue font-medium">{inv.invoiceNumber}</td>
                    <td className="px-4 py-3 text-tetri-muted">{fmtDate(inv.issueDate)}</td>
                    <td className="px-4 py-3 text-tetri-muted">{fmtDate(inv.dueDate)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-tetri-text">{fmt(inv.outstanding)}</td>
                    <td className="px-4 py-3 text-right">
                      {inv.daysOverdue > 0 ? (
                        <span className={`font-medium ${cfg.color}`}>{inv.daysOverdue} days</span>
                      ) : (
                        <span className="text-emerald-600 font-medium">Current</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${cfg.bg}`}>
                        {cfg.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {!loading && (
        <p className="text-xs text-tetri-muted text-right">
          Showing {filtered.length} of {aging?.invoices?.length || 0} outstanding invoices
          {' · '}Total: {fmt(filtered.reduce((s, i) => s + i.outstanding, 0))}
        </p>
      )}
    </div>
  );
}
