import { useState, useEffect, useCallback } from 'react';
import { BarChart2, RefreshCw, Zap } from 'lucide-react';
import aiAdminService from '../services/aiAdminService';
import { Toast } from '../../../components/shared/Toast.jsx';

function StatCard({ label, value, sub }) {
  return (
    <div className="bg-tetri-surface border border-tetri-border rounded-xl p-4">
      <p className="text-xs text-tetri-muted font-medium">{label}</p>
      <p className="text-2xl font-bold text-tetri-text mt-1">{value}</p>
      {sub && <p className="text-xs text-tetri-muted mt-0.5">{sub}</p>}
    </div>
  );
}

export default function AIUsagePage() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast,   setToast]   = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { setData(await aiAdminService.getUsage()); }
    catch { setToast({ type: 'error', message: 'Failed to load usage data' }); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const fmt = (n) => Number(n || 0).toLocaleString();
  const fmtCost = (n) => `$${Number(n || 0).toFixed(4)}`;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-tetri-text flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-tetri-muted" /> AI Usage
          </h1>
          <p className="text-sm text-tetri-muted mt-0.5">Last 30 days</p>
        </div>
        <button onClick={load} className="p-1.5 rounded-lg border border-tetri-border text-tetri-muted hover:bg-tetri-bg transition-colors">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <RefreshCw className="w-5 h-5 text-tetri-muted animate-spin" />
        </div>
      ) : data ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Total Requests"    value={fmt(data.totals?.requests)}     sub="Last 30 days" />
            <StatCard label="Input Tokens"      value={fmt(data.totals?.tokensInput)}  sub="Prompt tokens" />
            <StatCard label="Output Tokens"     value={fmt(data.totals?.tokensOutput)} sub="Completion tokens" />
            <StatCard label="Estimated Cost"    value={fmtCost(data.totals?.cost)}     sub="USD" />
          </div>

          {data.featureBreakdown?.length > 0 && (
            <div className="bg-tetri-surface border border-tetri-border rounded-xl p-5">
              <h2 className="text-sm font-semibold text-tetri-text mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4 text-tetri-muted" /> Usage by Feature
              </h2>
              <div className="space-y-2">
                {data.featureBreakdown.map((f, i) => (
                  <div key={i} className="flex items-center justify-between text-sm py-1.5 border-b border-tetri-border last:border-0">
                    <span className="text-tetri-text font-medium">{f.feature}</span>
                    <div className="flex items-center gap-6 text-tetri-muted text-xs">
                      <span>{fmt(f._count?.id)} requests</span>
                      <span>{fmt((f._sum?.tokensInput || 0) + (f._sum?.tokensOutput || 0))} tokens</span>
                      <span className="font-medium text-tetri-text">{fmtCost(f._sum?.estimatedCost)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.rows?.length > 0 && (
            <div className="bg-tetri-surface border border-tetri-border rounded-xl overflow-hidden">
              <div className="px-5 py-3 border-b border-tetri-border">
                <h2 className="text-sm font-semibold text-tetri-text">Recent Requests</h2>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-tetri-border bg-tetri-bg">
                    <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider text-tetri-muted">Feature</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider text-tetri-muted">Provider / Model</th>
                    <th className="px-4 py-2 text-right text-xs font-semibold uppercase tracking-wider text-tetri-muted">Tokens</th>
                    <th className="px-4 py-2 text-right text-xs font-semibold uppercase tracking-wider text-tetri-muted">Cost</th>
                    <th className="px-4 py-2 text-right text-xs font-semibold uppercase tracking-wider text-tetri-muted">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {data.rows.slice(0, 50).map((r) => (
                    <tr key={r.id} className="border-b border-tetri-border hover:bg-tetri-bg/50 transition-colors">
                      <td className="px-4 py-2.5 text-sm text-tetri-text">{r.feature}</td>
                      <td className="px-4 py-2.5 text-xs text-tetri-muted">{r.provider?.name} / {r.model?.modelName}</td>
                      <td className="px-4 py-2.5 text-xs text-tetri-muted text-right">{fmt(r.tokensInput + r.tokensOutput)}</td>
                      <td className="px-4 py-2.5 text-xs text-tetri-muted text-right">{fmtCost(r.estimatedCost)}</td>
                      <td className="px-4 py-2.5 text-xs text-tetri-muted text-right">{new Date(r.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : (
        <p className="text-sm text-tetri-muted">No usage data available.</p>
      )}
    </div>
  );
}
