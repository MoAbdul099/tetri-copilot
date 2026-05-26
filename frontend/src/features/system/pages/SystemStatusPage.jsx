import { useEffect, useState } from 'react';
import { Activity, Database, HardDrive, Server, RefreshCw, CheckCircle, XCircle, AlertTriangle, Clock } from 'lucide-react';
import systemService from '../services/systemService';

function timeAgo(ts) {
  if (!ts) return '—';
  const diff = Date.now() - new Date(ts).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
}

function StatusIcon({ status, size = 16 }) {
  if (status === 'ok' || status === 'local') return <CheckCircle size={size} className="text-emerald-500" />;
  if (status === 'error') return <XCircle size={size} className="text-red-500" />;
  return <AlertTriangle size={size} className="text-amber-500" />;
}

function StatusBadge({ status }) {
  if (status === 'ok' || status === 'local')
    return <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">Healthy</span>;
  if (status === 'error')
    return <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">Unavailable</span>;
  return <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">Degraded</span>;
}

function ServiceCard({ icon: Icon, label, data, loading }) {
  return (
    <div className="bg-tetri-surface border border-tetri-border rounded-2xl p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">
          <Icon size={18} className="text-slate-600" />
        </div>
        <p className="text-sm font-semibold text-tetri-text">{label}</p>
        {!loading && data && (
          <div className="ml-auto"><StatusBadge status={data.status} /></div>
        )}
      </div>
      {loading ? (
        <div className="h-4 bg-slate-100 rounded animate-pulse w-3/4" />
      ) : data ? (
        <dl className="space-y-1.5">
          {data.latencyMs != null && (
            <div className="flex justify-between text-xs">
              <dt className="text-tetri-muted">Latency</dt>
              <dd className="font-medium text-tetri-text">{data.latencyMs}ms</dd>
            </div>
          )}
          {data.provider && (
            <div className="flex justify-between text-xs">
              <dt className="text-tetri-muted">Provider</dt>
              <dd className="font-medium text-tetri-text capitalize">{data.provider.replace('_', ' ')}</dd>
            </div>
          )}
          {data.error && (
            <p className="text-xs text-red-600 mt-1">{data.error}</p>
          )}
        </dl>
      ) : (
        <p className="text-xs text-tetri-muted">No data</p>
      )}
    </div>
  );
}

export default function SystemStatusPage() {
  const [health, setHealth]     = useState(null);
  const [buildInfo, setBuildInfo] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [h, b] = await Promise.all([
        systemService.getHealth(),
        systemService.getBuildInfo(),
      ]);
      setHealth(h);
      setBuildInfo(b);
      setLastRefresh(new Date());
    } catch {
      /* errors visible in service cards */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const overall = health?.status;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-tetri-text">System Status</h1>
          <p className="text-tetri-muted text-sm mt-1">Live health, version, and infrastructure overview</p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-tetri-muted border border-tetri-border rounded-xl hover:bg-tetri-bg transition-colors disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Overall status banner */}
      <div className={`rounded-2xl p-4 flex items-center gap-3 border ${
        loading ? 'bg-slate-50 border-slate-200'
          : overall === 'ok' ? 'bg-emerald-50 border-emerald-200'
          : overall === 'degraded' ? 'bg-amber-50 border-amber-200'
          : 'bg-red-50 border-red-200'
      }`}>
        {loading ? (
          <div className="w-4 h-4 rounded-full bg-slate-200 animate-pulse" />
        ) : (
          <StatusIcon status={overall} size={20} />
        )}
        <div>
          <p className="text-sm font-semibold text-tetri-text">
            {loading ? 'Checking system health…'
              : overall === 'ok' ? 'All systems operational'
              : overall === 'degraded' ? 'System degraded — some services unavailable'
              : 'System down — critical services unreachable'}
          </p>
          {lastRefresh && (
            <p className="text-xs text-tetri-muted mt-0.5">Last checked {timeAgo(lastRefresh)}</p>
          )}
        </div>
      </div>

      {/* Service cards */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-tetri-muted mb-3">Services</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ServiceCard
            icon={Database}
            label="Database"
            data={health?.services?.database}
            loading={loading}
          />
          <ServiceCard
            icon={HardDrive}
            label="Storage"
            data={health?.services?.storage}
            loading={loading}
          />
        </div>
      </div>

      {/* Version & build info */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-tetri-muted mb-3">Build Information</h2>
        <div className="bg-tetri-surface border border-tetri-border rounded-2xl p-5">
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-3 bg-slate-100 rounded animate-pulse" style={{ width: `${60 + n * 8}%` }} />
              ))}
            </div>
          ) : buildInfo ? (
            <dl className="grid grid-cols-2 gap-x-8 gap-y-3">
              <InfoRow label="Version"       value={buildInfo.version || '—'} />
              <InfoRow label="Environment"   value={buildInfo.environment || import.meta.env.VITE_ENVIRONMENT || 'development'} />
              <InfoRow label="Node.js"       value={buildInfo.nodeVersion || '—'} />
              <InfoRow label="Uptime"        value={buildInfo.uptimeHuman || '—'} />
              <InfoRow label="Build Time"    value={buildInfo.buildTimestamp ? new Date(buildInfo.buildTimestamp).toLocaleString() : '—'} />
              <InfoRow label="Commit"        value={buildInfo.commitSha ? buildInfo.commitSha.slice(0, 8) : '—'} />
              <InfoRow label="Heap Used"     value={buildInfo.memory ? `${buildInfo.memory.heapUsedMb} MB` : '—'} />
              <InfoRow label="Heap Total"    value={buildInfo.memory ? `${buildInfo.memory.heapTotalMb} MB` : '—'} />
            </dl>
          ) : (
            <p className="text-sm text-tetri-muted">Could not load build info</p>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div>
      <dt className="text-xs text-tetri-muted">{label}</dt>
      <dd className="text-sm font-medium text-tetri-text mt-0.5 font-mono">{value}</dd>
    </div>
  );
}
