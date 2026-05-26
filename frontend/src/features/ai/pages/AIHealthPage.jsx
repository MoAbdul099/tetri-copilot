import { useState, useEffect, useCallback } from 'react';
import { Activity, RefreshCw, CheckCircle2, AlertTriangle, XCircle, Play } from 'lucide-react';
import aiAdminService from '../services/aiAdminService';
import { Toast } from '../../../components/shared/Toast.jsx';

const STATUS = {
  healthy: { icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />, label: 'Healthy', badge: 'bg-emerald-50 text-emerald-700' },
  degraded:{ icon: <AlertTriangle className="w-4 h-4 text-yellow-500" />, label: 'Degraded', badge: 'bg-yellow-50 text-yellow-700' },
  down:    { icon: <XCircle className="w-4 h-4 text-red-500" />,          label: 'Down',     badge: 'bg-red-50 text-red-700' },
  unknown: { icon: <AlertTriangle className="w-4 h-4 text-slate-400" />,  label: 'Unknown',  badge: 'bg-slate-100 text-slate-500' },
};

function ProviderHealthRow({ p }) {
  const s = STATUS[p.status] || STATUS.unknown;
  return (
    <div className="flex items-center gap-4 py-3 border-b border-tetri-border last:border-0">
      <div className="flex-shrink-0">{s.icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-tetri-text">{p.name}</p>
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${s.badge}`}>{s.label}</span>
          {!p.enabled && <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-500">Disabled</span>}
        </div>
        <p className="text-xs text-tetri-muted mt-0.5">
          {p.message || '—'}
          {p.responseTimeMs != null ? ` · ${p.responseTimeMs}ms` : ''}
          {p.lastChecked ? ` · Checked ${new Date(p.lastChecked).toLocaleString()}` : ''}
        </p>
      </div>
    </div>
  );
}

export default function AIHealthPage() {
  const [providers, setProviders] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [checking,  setChecking]  = useState(false);
  const [toast,     setToast]     = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { setProviders(await aiAdminService.getHealth()); }
    catch { setToast({ type: 'error', message: 'Failed to load health data' }); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const runChecks = async () => {
    setChecking(true);
    try {
      await aiAdminService.triggerHealth();
      setToast({ type: 'success', message: 'Health checks complete' });
      load();
    } catch { setToast({ type: 'error', message: 'Health check failed' }); }
    finally { setChecking(false); }
  };

  const healthy  = providers.filter(p => p.status === 'healthy').length;
  const degraded = providers.filter(p => p.status === 'degraded').length;
  const down     = providers.filter(p => p.status === 'down').length;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-tetri-text flex items-center gap-2">
            <Activity className="w-5 h-5 text-tetri-muted" /> AI Health
          </h1>
          <p className="text-sm text-tetri-muted mt-0.5">Provider availability and response times</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="p-1.5 rounded-lg border border-tetri-border text-tetri-muted hover:bg-tetri-bg transition-colors">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={runChecks} disabled={checking} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-tetri-blue text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
            <Play className="w-3.5 h-3.5" /> {checking ? 'Checking…' : 'Run Checks'}
          </button>
        </div>
      </div>

      {!loading && providers.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-emerald-700">{healthy}</p>
            <p className="text-xs text-emerald-600 mt-0.5">Healthy</p>
          </div>
          <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-yellow-700">{degraded}</p>
            <p className="text-xs text-yellow-600 mt-0.5">Degraded</p>
          </div>
          <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-red-700">{down}</p>
            <p className="text-xs text-red-600 mt-0.5">Down</p>
          </div>
        </div>
      )}

      <div className="bg-tetri-surface border border-tetri-border rounded-xl px-5 py-2">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <RefreshCw className="w-5 h-5 text-tetri-muted animate-spin" />
          </div>
        ) : providers.length === 0 ? (
          <p className="py-8 text-center text-sm text-tetri-muted">No providers configured.</p>
        ) : (
          providers.map(p => <ProviderHealthRow key={p.id} p={p} />)
        )}
      </div>
    </div>
  );
}
