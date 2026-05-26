import { useEffect, useState } from 'react';
import { RefreshCw, CheckCircle, XCircle, AlertTriangle, Info, Shield, ShieldCheck, ShieldAlert } from 'lucide-react';
import securityService from '../services/securityService';

function timeAgo(ts) {
  if (!ts) return '—';
  const diff = Date.now() - new Date(ts).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
}

const STATUS_CFG = {
  pass:    { icon: CheckCircle,    color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200', label: 'Pass' },
  warning: { icon: AlertTriangle,  color: 'text-amber-600',   bg: 'bg-amber-50 border-amber-200',     label: 'Warning' },
  fail:    { icon: XCircle,        color: 'text-red-600',     bg: 'bg-red-50 border-red-200',         label: 'Fail' },
  manual:  { icon: Info,           color: 'text-blue-600',    bg: 'bg-blue-50 border-blue-200',       label: 'Manual' },
};

function ScoreRing({ score }) {
  const color = score >= 90 ? '#10b981' : score >= 70 ? '#f59e0b' : '#ef4444';
  const r = 40;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;

  return (
    <div className="relative flex items-center justify-center w-28 h-28">
      <svg width="112" height="112" viewBox="0 0 112 112">
        <circle cx="56" cy="56" r={r} fill="none" stroke="#e2e8f0" strokeWidth="10" />
        <circle
          cx="56" cy="56" r={r} fill="none"
          stroke={color} strokeWidth="10"
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeLinecap="round"
          transform="rotate(-90 56 56)"
        />
      </svg>
      <div className="absolute text-center">
        <p className="text-2xl font-bold text-tetri-text">{score}%</p>
        <p className="text-xs text-tetri-muted">Score</p>
      </div>
    </div>
  );
}

function CheckRow({ check }) {
  const cfg = STATUS_CFG[check.status] || STATUS_CFG.manual;
  const Icon = cfg.icon;
  const [open, setOpen] = useState(false);

  return (
    <div className={`border rounded-xl overflow-hidden ${cfg.bg}`}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
      >
        <Icon size={16} className={`${cfg.color} flex-shrink-0`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs text-tetri-muted font-medium">{check.category}</span>
          </div>
          <p className="text-sm font-medium text-tetri-text">{check.name}</p>
        </div>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.color} bg-white/60`}>
          {cfg.label}
        </span>
      </button>
      {open && (
        <div className="px-4 pb-3 border-t border-current/10 pt-2">
          <p className="text-xs text-tetri-text">{check.detail}</p>
          {check.references?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {check.references.map((r) => (
                <code key={r} className="text-xs bg-white/60 px-1.5 py-0.5 rounded font-mono">{r}</code>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function SecurityPosturePage() {
  const [status, setStatus]       = useState(null);
  const [compliance, setCompliance] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [s, c] = await Promise.all([
        securityService.getStatus(),
        securityService.getComplianceChecks(),
      ]);
      setStatus(s);
      setCompliance(c);
      setLastRefresh(new Date());
    } catch {
      /* errors shown inline */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const posture = status?.posture;
  const postureConfig = {
    strong:   { label: 'Strong',   color: 'text-emerald-700 bg-emerald-50 border-emerald-200', Icon: ShieldCheck },
    moderate: { label: 'Moderate', color: 'text-amber-700 bg-amber-50 border-amber-200',       Icon: Shield },
    weak:     { label: 'Weak',     color: 'text-red-700 bg-red-50 border-red-200',             Icon: ShieldAlert },
  };
  const pc = postureConfig[posture] || postureConfig.moderate;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-tetri-text">Security Posture</h1>
          <p className="text-tetri-muted text-sm mt-1">OWASP Top 10 coverage and runtime security checks</p>
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

      {/* Summary cards */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-24 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : status ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Posture */}
          <div className={`col-span-2 flex items-center gap-4 p-4 rounded-2xl border ${pc.color}`}>
            <pc.Icon size={32} className="flex-shrink-0" />
            <div>
              <p className="text-xs font-medium uppercase tracking-wider opacity-70">Security Posture</p>
              <p className="text-xl font-bold capitalize">{pc.label}</p>
            </div>
            <div className="ml-auto">
              <ScoreRing score={status.complianceScore || 0} />
            </div>
          </div>
          {/* Active alerts */}
          <div className="bg-tetri-surface border border-tetri-border rounded-2xl p-4">
            <p className="text-xs text-tetri-muted">Active Alerts</p>
            <p className="text-3xl font-bold text-tetri-text mt-1">{status.activeAlerts}</p>
          </div>
          {/* Rules */}
          <div className="bg-tetri-surface border border-tetri-border rounded-2xl p-4">
            <p className="text-xs text-tetri-muted">Detection Rules</p>
            <p className="text-3xl font-bold text-tetri-text mt-1">{status.enabledRules}<span className="text-sm font-normal text-tetri-muted">/{status.totalRules}</span></p>
          </div>
        </div>
      ) : null}

      {/* Compliance check summary */}
      {compliance && (
        <div className="bg-tetri-surface border border-tetri-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-tetri-text">Check Summary</h2>
            {lastRefresh && <p className="text-xs text-tetri-muted">Updated {timeAgo(lastRefresh)}</p>}
          </div>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-emerald-600">{compliance.summary.pass}</p>
              <p className="text-xs text-tetri-muted mt-0.5">Pass</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-600">{compliance.summary.warning}</p>
              <p className="text-xs text-tetri-muted mt-0.5">Warning</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{compliance.summary.fail}</p>
              <p className="text-xs text-tetri-muted mt-0.5">Fail</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">{compliance.summary.manual}</p>
              <p className="text-xs text-tetri-muted mt-0.5">Manual</p>
            </div>
          </div>
        </div>
      )}

      {/* Checks list */}
      {compliance && (
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-tetri-muted mb-3">Security Checks</h2>
          <div className="space-y-2">
            {compliance.checks.map((check) => (
              <CheckRow key={check.id} check={check} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
