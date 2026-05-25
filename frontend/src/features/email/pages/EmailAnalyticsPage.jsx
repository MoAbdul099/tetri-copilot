import { useState, useEffect } from 'react';
import { BarChart2, Mail, CheckCircle, XCircle, Eye, RefreshCw, Loader2 } from 'lucide-react';
import PageHeader from '../../../components/shared/PageHeader.jsx';
import { useToast } from '../../../components/shared/Toast.jsx';
import { getAnalytics, listDeliveries } from '../services/emailService.js';

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—';
const fmtTime = (d) => d ? new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—';

const STATUS_BADGE = {
  sent:    'bg-green-100 text-green-700',
  failed:  'bg-red-100 text-red-700',
  bounced: 'bg-amber-100 text-amber-700',
  opened:  'bg-blue-100 text-blue-700',
};

function KpiCard({ icon: Icon, label, value, sub, color = 'text-tetri-text' }) {
  return (
    <div className="bg-tetri-surface border border-tetri-border rounded-2xl p-5 flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl bg-tetri-bg flex items-center justify-center flex-shrink-0">
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-tetri-text">{value ?? '—'}</p>
        <p className="text-sm text-tetri-neutral mt-0.5">{label}</p>
        {sub && <p className="text-xs text-tetri-neutral mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function MiniBar({ value, max, color = 'bg-tetri-blue' }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-tetri-border rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-tetri-neutral w-8 text-right">{value}</span>
    </div>
  );
}

export default function EmailAnalyticsPage() {
  const { showToast, ToastContainer } = useToast();
  const [days, setDays] = useState(30);
  const [stats, setStats] = useState(null);
  const [deliveries, setDeliveries] = useState([]);
  const [deliveryTotal, setDeliveryTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const limit = 20;

  const load = () => {
    setLoading(true);
    Promise.all([
      getAnalytics(days),
      listDeliveries({ page, limit }),
    ])
      .then(([s, d]) => {
        setStats(s);
        if (Array.isArray(d)) {
          setDeliveries(d);
          setDeliveryTotal(d.length);
        } else {
          setDeliveries(d?.deliveries || []);
          setDeliveryTotal(d?.total || 0);
        }
      })
      .catch(() => showToast('error', 'Failed to load analytics'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [days, page]);

  const total   = stats?.total   ?? 0;
  const sent    = stats?.sent    ?? 0;
  const failed  = stats?.failed  ?? 0;
  const opened  = stats?.opened  ?? 0;
  const deliveryRate = total > 0 ? Math.round((sent / total) * 100) : 0;
  const openRate     = sent  > 0 ? Math.round((opened / sent) * 100) : 0;
  const trend        = stats?.trend || [];
  const byTemplate   = stats?.byTemplate || [];
  const trendMax     = trend.length > 0 ? Math.max(...trend.map((t) => t.count || 0), 1) : 1;

  const pages = Math.ceil(deliveryTotal / limit);

  return (
    <div className="space-y-6">
      {ToastContainer}

      <PageHeader title="Email Analytics" subtitle="Delivery performance and statistics">
        <div className="flex items-center gap-2">
          <select
            value={days}
            onChange={(e) => { setDays(Number(e.target.value)); setPage(1); }}
            className="text-sm border border-tetri-border rounded-xl px-3 py-2 bg-tetri-surface focus:outline-none focus:ring-2 focus:ring-tetri-blue/20"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          <button onClick={load} className="p-2 rounded-xl border border-tetri-border bg-tetri-surface text-tetri-neutral hover:text-tetri-text hover:bg-tetri-bg transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </PageHeader>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-tetri-neutral" />
        </div>
      ) : (
        <>
          {/* KPI cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard icon={Mail}        label="Total Sent"    value={total}          />
            <KpiCard icon={CheckCircle} label="Delivered"     value={`${deliveryRate}%`} sub={`${sent} emails`}  color="text-green-500" />
            <KpiCard icon={Eye}         label="Open Rate"     value={`${openRate}%`} sub={`${opened} opens`}    color="text-blue-500"  />
            <KpiCard icon={XCircle}     label="Failed"        value={failed}         color="text-red-500"  />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Trend */}
            <div className="lg:col-span-2 bg-tetri-surface border border-tetri-border rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-tetri-text mb-4 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-tetri-neutral" />
                Delivery Trend
              </h3>
              {trend.length === 0 ? (
                <p className="text-sm text-tetri-neutral py-8 text-center">No data for this period.</p>
              ) : (
                <div className="space-y-1.5">
                  {trend.slice(-14).map((t) => (
                    <div key={t.date} className="flex items-center gap-3 text-xs">
                      <span className="text-tetri-neutral w-16 flex-shrink-0">{fmtDate(t.date)}</span>
                      <MiniBar value={t.count || 0} max={trendMax} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Top templates */}
            <div className="bg-tetri-surface border border-tetri-border rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-tetri-text mb-4">Top Templates</h3>
              {byTemplate.length === 0 ? (
                <p className="text-sm text-tetri-neutral py-8 text-center">No data.</p>
              ) : (
                <div className="space-y-3">
                  {byTemplate.slice(0, 8).map((t) => (
                    <div key={t.templateCode || t.code} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-tetri-text font-medium font-mono truncate">{t.templateCode || t.code || '—'}</span>
                        <span className="text-tetri-neutral ml-2">{t.count}</span>
                      </div>
                      <MiniBar value={t.count || 0} max={Math.max(...byTemplate.map((x) => x.count || 0), 1)} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Delivery log */}
          <div className="bg-tetri-surface border border-tetri-border rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-tetri-border">
              <h3 className="text-sm font-semibold text-tetri-text">Delivery Log</h3>
            </div>
            {deliveries.length === 0 ? (
              <div className="py-12 text-center text-tetri-neutral text-sm">No delivery records found.</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-tetri-border bg-tetri-bg">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-tetri-neutral uppercase tracking-wider">Recipient</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-tetri-neutral uppercase tracking-wider">Template</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-tetri-neutral uppercase tracking-wider">Status</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-tetri-neutral uppercase tracking-wider">Sent At</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-tetri-neutral uppercase tracking-wider">Opened</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-tetri-border">
                  {deliveries.map((d) => (
                    <tr key={d.id} className="hover:bg-tetri-bg/50 transition-colors">
                      <td className="px-5 py-3 text-tetri-text">{d.recipientEmail}</td>
                      <td className="px-5 py-3 text-tetri-neutral font-mono text-xs">{d.templateCode || '—'}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium capitalize ${STATUS_BADGE[d.status] || 'bg-slate-100 text-slate-600'}`}>
                          {d.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-tetri-neutral text-xs">
                        {fmtDate(d.sentAt)} {fmtTime(d.sentAt)}
                      </td>
                      <td className="px-5 py-3 text-tetri-neutral text-xs">
                        {d.openedAt ? `${fmtDate(d.openedAt)} · ${d.openCount}×` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {pages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-tetri-border text-sm text-tetri-neutral">
                <span>Page {page} of {pages}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 rounded-lg border border-tetri-border bg-tetri-surface hover:bg-tetri-bg disabled:opacity-40 transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(pages, p + 1))}
                    disabled={page === pages}
                    className="px-3 py-1.5 rounded-lg border border-tetri-border bg-tetri-surface hover:bg-tetri-bg disabled:opacity-40 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
