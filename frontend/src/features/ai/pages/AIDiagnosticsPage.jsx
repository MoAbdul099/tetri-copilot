import { useEffect, useState } from 'react';
import { RefreshCw, CheckCircle, XCircle, Clock, Zap, DollarSign, Search } from 'lucide-react';
import aiAdminService from '../services/aiAdminService';
import PageHeader from '../../../components/shared/PageHeader';

function ms(n) { return n != null ? `${n}ms` : '—'; }
function cost(n) { return n != null ? `$${Number(n).toFixed(6)}` : '—'; }

export default function AIDiagnosticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [period,    setPeriod]    = useState('30d');
  const [health,    setHealth]    = useState([]);

  async function load() {
    setLoading(true);
    const days = period === '7d' ? 7 : period === '90d' ? 90 : 30;
    const since = new Date(Date.now() - days * 24 * 3600_000).toISOString();
    try {
      const [a, h] = await Promise.all([
        aiAdminService.getAnalytics({ since }),
        aiAdminService.getHealth(),
      ]);
      setAnalytics(a);
      setHealth(h);
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [period]);

  if (loading) return <div className="p-8 text-tetri-muted text-sm">Loading diagnostics…</div>;

  const kpis = [
    { label: 'Total Requests',  value: analytics?.totalRequests   ?? 0, icon: Zap,       color: 'text-violet-600 bg-violet-50' },
    { label: 'Tokens In',       value: (analytics?.totalTokensInput ?? 0).toLocaleString(), icon: Search, color: 'text-blue-600 bg-blue-50' },
    { label: 'Tokens Out',      value: (analytics?.totalTokensOut  ?? 0).toLocaleString(), icon: Search, color: 'text-teal-600 bg-teal-50'  },
    { label: 'Total Cost',      value: cost(analytics?.totalCost),  icon: DollarSign,  color: 'text-orange-600 bg-orange-50' },
    { label: 'Sessions',        value: analytics?.totalSessions    ?? 0, icon: Clock,     color: 'text-emerald-600 bg-emerald-50' },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <PageHeader
        title="AI Diagnostics"
        subtitle="Platform-wide AI usage analytics and provider health"
      >
        <div className="flex items-center gap-2">
          <select value={period} onChange={(e) => setPeriod(e.target.value)} className="border border-tetri-border rounded-btn px-3 py-1.5 text-sm bg-tetri-surface text-tetri-text focus:outline-none">
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <button onClick={load} className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-tetri-border rounded-btn hover:bg-tetri-bg transition-colors">
            <RefreshCw size={13} /> Refresh
          </button>
        </div>
      </PageHeader>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {kpis.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-tetri-surface border border-tetri-border rounded-card p-4">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${color}`}>
              <Icon size={15} />
            </div>
            <div className="text-xl font-bold text-tetri-text">{value}</div>
            <div className="text-xs text-tetri-muted mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Provider health */}
        <div className="bg-tetri-surface border border-tetri-border rounded-card p-5 space-y-4">
          <h3 className="text-sm font-semibold text-tetri-text">Provider Health</h3>
          {health.length === 0 ? (
            <p className="text-xs text-tetri-muted">No health data yet.</p>
          ) : (
            <div className="space-y-2">
              {health.map((p) => (
                <div key={p.id} className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${p.status === 'healthy' ? 'bg-emerald-500' : p.status === 'degraded' ? 'bg-amber-400' : 'bg-red-500'}`} />
                  <span className="text-sm text-tetri-text flex-1">{p.name}</span>
                  <span className="text-xs text-tetri-muted">{ms(p.responseTimeMs)}</span>
                  <span className={`text-xs font-medium ${p.status === 'healthy' ? 'text-emerald-600' : p.status === 'degraded' ? 'text-amber-600' : 'text-red-600'}`}>{p.status}</span>
                  {p.enabled ? <CheckCircle size={13} className="text-emerald-500" /> : <XCircle size={13} className="text-slate-400" />}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* By provider cost */}
        <div className="bg-tetri-surface border border-tetri-border rounded-card p-5 space-y-4">
          <h3 className="text-sm font-semibold text-tetri-text">Usage by Provider</h3>
          {!analytics?.byProvider?.length ? (
            <p className="text-xs text-tetri-muted">No usage data yet.</p>
          ) : (
            <div className="space-y-2">
              {analytics.byProvider.map((p) => (
                <div key={p.provider} className="flex items-center gap-2">
                  <span className="text-sm text-tetri-text flex-1">{p.provider}</span>
                  <span className="text-xs text-tetri-muted">{p.requests} req</span>
                  <span className="text-xs font-medium text-tetri-text">{cost(p.cost)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Feature breakdown */}
      <div className="bg-tetri-surface border border-tetri-border rounded-card p-5 space-y-4">
        <h3 className="text-sm font-semibold text-tetri-text">Usage by Feature</h3>
        {!analytics?.byFeature?.length ? (
          <p className="text-xs text-tetri-muted">No feature data yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-tetri-muted">
                {['Feature', 'Requests', 'Cost'].map((h) => (
                  <th key={h} className="text-left pb-2 font-medium uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-tetri-border">
              {analytics.byFeature.map((f) => (
                <tr key={f.feature}>
                  <td className="py-2 font-mono text-xs text-tetri-text">{f.feature}</td>
                  <td className="py-2 text-tetri-muted">{f.requests}</td>
                  <td className="py-2 text-tetri-muted">{cost(f.cost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
