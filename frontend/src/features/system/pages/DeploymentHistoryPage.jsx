import { useEffect, useState } from 'react';
import { ChevronDown, ChevronRight, CheckCircle, XCircle, Clock, AlertTriangle, Rocket } from 'lucide-react';
import systemService from '../services/systemService';

const STATUS_CONFIG = {
  success:    { label: 'Success',    color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  running:    { label: 'Running',    color: 'text-blue-700 bg-blue-50 border-blue-200' },
  failed:     { label: 'Failed',     color: 'text-red-700 bg-red-50 border-red-200' },
  rolledback: { label: 'Rolled Back',color: 'text-amber-700 bg-amber-50 border-amber-200' },
  pending:    { label: 'Pending',    color: 'text-slate-700 bg-slate-50 border-slate-200' },
};

const ENV_COLORS = {
  production:  'text-red-700 bg-red-50 border-red-200',
  staging:     'text-amber-700 bg-amber-50 border-amber-200',
  development: 'text-blue-700 bg-blue-50 border-blue-200',
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full border ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}

function EnvBadge({ env }) {
  const color = ENV_COLORS[env] || 'text-slate-700 bg-slate-50 border-slate-200';
  return (
    <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full border ${color} capitalize`}>
      {env}
    </span>
  );
}

function formatDuration(ms) {
  if (!ms) return '—';
  if (ms < 1000) return `${ms}ms`;
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}m ${s % 60}s`;
}

function formatDate(ts) {
  if (!ts) return '—';
  return new Date(ts).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

function DeploymentRow({ deployment }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-tetri-border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-tetri-surface hover:bg-tetri-bg transition-colors text-left"
      >
        {open
          ? <ChevronDown className="w-4 h-4 text-tetri-muted flex-shrink-0" />
          : <ChevronRight className="w-4 h-4 text-tetri-muted flex-shrink-0" />
        }
        <div className="flex-1 min-w-0 grid grid-cols-2 md:grid-cols-4 gap-2 items-center">
          <div className="flex items-center gap-2">
            <EnvBadge env={deployment.environment} />
            <span className="text-sm font-semibold text-tetri-text font-mono">{deployment.version}</span>
          </div>
          <StatusBadge status={deployment.status} />
          <div className="hidden md:flex flex-col">
            <span className="text-xs text-tetri-muted">Started</span>
            <span className="text-xs font-medium text-tetri-text">{formatDate(deployment.startedAt)}</span>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <div>
              <span className="text-xs text-tetri-muted">Duration</span>
              <p className="text-xs font-medium text-tetri-text">{formatDuration(deployment.durationMs)}</p>
            </div>
            <div>
              <span className="text-xs text-tetri-muted">By</span>
              <p className="text-xs font-medium text-tetri-text truncate max-w-[100px]">{deployment.triggeredBy}</p>
            </div>
          </div>
        </div>
      </button>

      {open && (
        <div className="border-t border-tetri-border bg-tetri-bg px-4 py-4 space-y-4">
          {/* Metadata */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <InfoCell label="Environment" value={deployment.environment} />
            <InfoCell label="Version"     value={deployment.version} />
            <InfoCell label="Status"      value={deployment.status} />
            <InfoCell label="Duration"    value={formatDuration(deployment.durationMs)} />
            <InfoCell label="Started"     value={formatDate(deployment.startedAt)} />
            <InfoCell label="Completed"   value={formatDate(deployment.completedAt)} />
            <InfoCell label="Triggered by" value={deployment.triggeredBy} />
            {deployment.notes && <InfoCell label="Notes" value={deployment.notes} />}
          </div>

          {/* Audit trail */}
          {deployment.auditEntries?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-tetri-muted uppercase tracking-wider mb-2">Audit Trail</p>
              <div className="relative">
                <div className="absolute left-3 top-0 bottom-0 w-px bg-tetri-border" />
                <div className="space-y-2 pl-8">
                  {deployment.auditEntries.map((entry) => (
                    <div key={entry.id} className="relative">
                      <div className="absolute -left-5 top-1.5 w-2 h-2 rounded-full bg-tetri-blue border-2 border-tetri-surface" />
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-tetri-text font-mono">{entry.action}</p>
                          <p className="text-xs text-tetri-muted">{entry.actor} · {formatDate(entry.timestamp)}</p>
                          {entry.details && (
                            <pre className="text-xs text-tetri-muted mt-1 bg-slate-50 rounded p-1.5 overflow-x-auto">
                              {JSON.stringify(entry.details, null, 2)}
                            </pre>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function InfoCell({ label, value }) {
  return (
    <div>
      <p className="text-xs text-tetri-muted">{label}</p>
      <p className="text-sm font-medium text-tetri-text mt-0.5 truncate">{value || '—'}</p>
    </div>
  );
}

export default function DeploymentHistoryPage() {
  const [data, setData]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [environment, setEnvironment] = useState('');
  const [status, setStatus]       = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (environment) params.environment = environment;
      if (status) params.status = status;
      const result = await systemService.listDeployments(params);
      setData(result);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [environment, status]);

  const deployments = data?.rows || [];
  const total = data?.total || 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-tetri-text">Deployment History</h1>
          <p className="text-tetri-muted text-sm mt-1">Track all deployment events and their audit trails</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <select
          value={environment}
          onChange={(e) => setEnvironment(e.target.value)}
          className="text-sm border border-tetri-border rounded-xl px-3 py-1.5 bg-tetri-surface text-tetri-text focus:outline-none focus:ring-2 focus:ring-tetri-blue/30"
        >
          <option value="">All Environments</option>
          <option value="production">Production</option>
          <option value="staging">Staging</option>
          <option value="development">Development</option>
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="text-sm border border-tetri-border rounded-xl px-3 py-1.5 bg-tetri-surface text-tetri-text focus:outline-none focus:ring-2 focus:ring-tetri-blue/30"
        >
          <option value="">All Statuses</option>
          <option value="success">Success</option>
          <option value="failed">Failed</option>
          <option value="running">Running</option>
          <option value="rolledback">Rolled Back</option>
        </select>
        <span className="text-sm text-tetri-muted self-center">{total} deployment{total !== 1 ? 's' : ''}</span>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-14 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : deployments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
            <Rocket size={22} className="text-slate-400" />
          </div>
          <p className="text-sm font-medium text-tetri-muted">No deployments recorded yet</p>
          <p className="text-xs text-tetri-muted mt-1">Deployments logged via CI/CD will appear here</p>
        </div>
      ) : (
        <div className="space-y-2">
          {deployments.map((d) => (
            <DeploymentRow key={d.id} deployment={d} />
          ))}
        </div>
      )}
    </div>
  );
}
