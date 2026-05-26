import { useState, useEffect, useCallback } from 'react';
import { DollarSign, RefreshCw } from 'lucide-react';
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

export default function AICostPage() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast,   setToast]   = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { setData(await aiAdminService.getCosts()); }
    catch { setToast({ type: 'error', message: 'Failed to load cost data' }); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const fmtCost = (n) => `$${Number(n || 0).toFixed(4)}`;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-tetri-text flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-tetri-muted" /> AI Costs
          </h1>
          <p className="text-sm text-tetri-muted mt-0.5">Estimated costs by period and provider</p>
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
          <div className="grid grid-cols-2 gap-4">
            <StatCard label="Today's Cost"   value={fmtCost(data.today?.cost)}   sub={`${data.today?.requests || 0} requests`} />
            <StatCard label="This Month"     value={fmtCost(data.monthly?.cost)} sub={`${data.monthly?.requests || 0} requests`} />
          </div>

          {data.byProvider?.length > 0 && (
            <div className="bg-tetri-surface border border-tetri-border rounded-xl p-5">
              <h2 className="text-sm font-semibold text-tetri-text mb-4">Cost by Provider (This Month)</h2>
              <div className="space-y-3">
                {data.byProvider.map((p, i) => {
                  const total = data.byProvider.reduce((s, x) => s + (x.cost || 0), 0);
                  const pct   = total > 0 ? ((p.cost / total) * 100).toFixed(1) : 0;
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-tetri-text font-medium">{p.provider}</span>
                        <span className="text-tetri-muted text-xs">{p.requests} reqs · {fmtCost(p.cost)}</span>
                      </div>
                      <div className="w-full bg-tetri-bg rounded-full h-1.5">
                        <div className="bg-tetri-blue h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {(!data.byProvider || data.byProvider.length === 0) && (
            <div className="bg-tetri-surface border border-tetri-border rounded-xl p-8 text-center">
              <DollarSign className="w-8 h-8 text-tetri-muted mx-auto mb-2" />
              <p className="text-sm text-tetri-muted">No AI cost data yet. Costs will appear here once AI features are used.</p>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
