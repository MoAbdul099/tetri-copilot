import { useState, useEffect, useCallback } from 'react';
import { Activity, Database, HardDrive, Clock, CheckCircle2, AlertTriangle, XCircle, RefreshCw, Rocket } from 'lucide-react';
import monitoringService from '../services/monitoringService';
import { Toast } from '../../../components/shared/Toast.jsx';

const SEV_COLORS = {
  'SEV-1': 'bg-red-100 text-red-700',
  'SEV-2': 'bg-orange-100 text-orange-700',
  'SEV-3': 'bg-yellow-100 text-yellow-700',
  'SEV-4': 'bg-blue-100 text-blue-700',
};

const STATUS_ICON = {
  ok:       <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
  degraded: <AlertTriangle className="w-4 h-4 text-yellow-500" />,
  incident: <XCircle className="w-4 h-4 text-red-500" />,
  local:    <HardDrive className="w-4 h-4 text-blue-500" />,
  error:    <XCircle className="w-4 h-4 text-red-500" />,
};

function AvailabilityBar({ label, value }) {
  const pct = parseFloat(value || 0);
  const color = pct >= 99.9 ? 'bg-emerald-500' : pct >= 99 ? 'bg-yellow-400' : 'bg-red-500';
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-tetri-muted">{label}</span>
        <span className="font-semibold text-tetri-text">{pct.toFixed(3)}%</span>
      </div>
      <div className="w-full bg-tetri-bg rounded-full h-1.5">
        <div className={`${color} h-1.5 rounded-full transition-all`} style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
    </div>
  );
}

function LaunchCheck({ check }) {
  const colors = { pass: 'text-emerald-600 bg-emerald-50', warning: 'text-yellow-700 bg-yellow-50', fail: 'text-red-700 bg-red-50' };
  const icons  = { pass: '✓', warning: '!', fail: '✗' };
  return (
    <div className="flex items-start gap-3 py-2">
      <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${colors[check.status]}`}>
        {icons[check.status]}
      </span>
      <div className="min-w-0">
        <p className="text-sm font-medium text-tetri-text">{check.name}</p>
        <p className="text-xs text-tetri-muted">{check.detail}</p>
      </div>
    </div>
  );
}

export default function ReliabilityDashboardPage() {
  const [status,    setStatus]    = useState(null);
  const [uptime,    setUptime]    = useState(null);
  const [readiness, setReadiness] = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [toast,     setToast]     = useState(null);

  const load = useCallback(async () => {
    try {
      const [s, u, r] = await Promise.all([
        monitoringService.getStatus(),
        monitoringService.getUptimeReport(),
        monitoringService.getLaunchReadiness(),
      ]);
      setStatus(s);
      setUptime(u);
      setReadiness(r);
    } catch {
      setToast({ type: 'error', message: 'Failed to load monitoring data' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-5 h-5 text-tetri-muted animate-spin" />
      </div>
    );
  }

  const overallColor = {
    ok: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    degraded: 'text-yellow-700 bg-yellow-50 border-yellow-200',
    incident: 'text-red-700 bg-red-50 border-red-200',
  }[status?.status] || 'text-tetri-muted bg-tetri-bg border-tetri-border';

  const groupedChecks = readiness
    ? readiness.checks.reduce((acc, c) => {
        if (!acc[c.category]) acc[c.category] = [];
        acc[c.category].push(c);
        return acc;
      }, {})
    : {};

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-tetri-text">Reliability Dashboard</h1>
          <p className="text-sm text-tetri-muted mt-0.5">System health, uptime, and launch readiness</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-tetri-border text-sm text-tetri-muted hover:bg-tetri-bg transition-colors">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Overall status banner */}
      {status && (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${overallColor}`}>
          {STATUS_ICON[status.status] || STATUS_ICON.ok}
          <div>
            <p className="text-sm font-semibold capitalize">{status.status === 'ok' ? 'All systems operational' : status.status}</p>
            <p className="text-xs opacity-75">Uptime: {status.uptimeHuman} · {status.activeIncidents} active incident{status.activeIncidents !== 1 ? 's' : ''} · {status.unresolvedEvents} unresolved events</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Service health */}
        <div className="bg-tetri-surface border border-tetri-border rounded-xl p-4 space-y-3">
          <h2 className="text-sm font-semibold text-tetri-text flex items-center gap-2">
            <Activity className="w-4 h-4 text-tetri-muted" /> Services
          </h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-tetri-muted">
                <Database className="w-3.5 h-3.5" /> Database
              </span>
              <span className="flex items-center gap-1 font-medium">
                {STATUS_ICON[status?.services?.database?.status || 'ok']}
                {status?.services?.database?.latencyMs != null ? `${status.services.database.latencyMs}ms` : status?.services?.database?.status}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-tetri-muted">
                <HardDrive className="w-3.5 h-3.5" /> Storage
              </span>
              <span className="flex items-center gap-1 font-medium">
                {STATUS_ICON[status?.services?.storage?.status || 'ok']}
                {status?.services?.storage?.provider === 'cloudflare_r2' ? 'R2' : 'Local'}
              </span>
            </div>
          </div>

          {/* Memory */}
          {status?.memory && (
            <>
              <div className="border-t border-tetri-border pt-3">
                <p className="text-xs text-tetri-muted mb-2">Memory</p>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-tetri-muted">Heap Used</span>
                    <span className="font-medium text-tetri-text">{status.memory.heapUsedMb} MB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-tetri-muted">RSS</span>
                    <span className="font-medium text-tetri-text">{status.memory.rssMb} MB</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Availability */}
        <div className="bg-tetri-surface border border-tetri-border rounded-xl p-4 space-y-4">
          <h2 className="text-sm font-semibold text-tetri-text flex items-center gap-2">
            <Clock className="w-4 h-4 text-tetri-muted" /> Availability
          </h2>
          {uptime ? (
            <>
              <div className="space-y-3">
                <AvailabilityBar label="Last 24 hours" value={uptime.availability.last24h} />
                <AvailabilityBar label="Last 7 days"   value={uptime.availability.last7d} />
                <AvailabilityBar label="Last 30 days"  value={uptime.availability.last30d} />
              </div>
              <div className="text-xs text-tetri-muted border-t border-tetri-border pt-2">
                SLO Target: {uptime.sloTarget}%
              </div>
            </>
          ) : (
            <p className="text-sm text-tetri-muted">No data</p>
          )}
        </div>

        {/* Launch readiness score */}
        <div className="bg-tetri-surface border border-tetri-border rounded-xl p-4 space-y-3">
          <h2 className="text-sm font-semibold text-tetri-text flex items-center gap-2">
            <Rocket className="w-4 h-4 text-tetri-muted" /> Launch Readiness
          </h2>
          {readiness ? (
            <>
              <div className="flex items-center gap-3">
                <svg className="w-14 h-14 flex-shrink-0" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                  <circle
                    cx="18" cy="18" r="15.9" fill="none"
                    stroke={readiness.summary.ready ? '#10b981' : readiness.summary.fail > 0 ? '#ef4444' : '#f59e0b'}
                    strokeWidth="3" strokeDasharray={`${readiness.summary.score} ${100 - readiness.summary.score}`}
                    strokeDashoffset="25" strokeLinecap="round"
                  />
                  <text x="18" y="21" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#1e293b">{readiness.summary.score}%</text>
                </svg>
                <div className="text-sm space-y-0.5">
                  <p className={`font-semibold ${readiness.summary.ready ? 'text-emerald-600' : 'text-red-600'}`}>
                    {readiness.summary.ready ? 'Ready to launch' : 'Not ready'}
                  </p>
                  <p className="text-tetri-muted text-xs">{readiness.summary.pass} pass · {readiness.summary.warning} warn · {readiness.summary.fail} fail</p>
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm text-tetri-muted">No data</p>
          )}
        </div>
      </div>

      {/* Launch readiness checks grouped by category */}
      {readiness && (
        <div className="bg-tetri-surface border border-tetri-border rounded-xl p-5">
          <h2 className="text-sm font-semibold text-tetri-text mb-4">Launch Readiness Checks</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
            {Object.entries(groupedChecks).map(([category, checks]) => (
              <div key={category}>
                <p className="text-xs font-semibold uppercase tracking-wider text-tetri-muted mb-1 mt-3">{category}</p>
                <div className="divide-y divide-tetri-border">
                  {checks.map((c) => <LaunchCheck key={c.id} check={c} />)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
