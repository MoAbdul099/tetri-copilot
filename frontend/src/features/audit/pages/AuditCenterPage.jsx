import { useState, useEffect, useCallback } from 'react';
import { Shield, Download, Search, Filter, X, ChevronDown, ChevronRight, CheckCircle, AlertTriangle, Lock, Unlock, RefreshCw } from 'lucide-react';
import auditService from '../services/auditService';
import DiffViewer from '../components/DiffViewer';

const ENTITY_TYPES = ['Customer', 'Invoice', 'Payment', 'Expense', 'File', 'ComplianceTemplate', 'ComplianceOccurrence', 'Member', 'Workspace', 'Subscription'];
const DATE_PRESETS = [
  { label: 'Today',       days: 0 },
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days',days: 30 },
  { label: 'Last 90 days',days: 90 },
];

function daysAgoISO(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return new Date(dateStr).toLocaleString();
}

function AuditRow({ item, onToggle, expanded, onLegalHoldChange }) {
  const [holdLoading, setHoldLoading] = useState(false);

  async function toggleLegalHold() {
    setHoldLoading(true);
    try {
      await auditService.setLegalHold(item.id, !item.isLegalHold);
      onLegalHoldChange(item.id, !item.isLegalHold);
    } finally {
      setHoldLoading(false);
    }
  }

  const hasChanges = item.fieldChangesJson && item.fieldChangesJson.length > 0;

  return (
    <>
      <tr
        className="hover:bg-tetri-bg transition-colors cursor-pointer"
        onClick={onToggle}
      >
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-tetri-neutral">{expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}</span>
            <div className="w-7 h-7 rounded-full bg-[#eff4ff] flex items-center justify-center flex-shrink-0">
              <span className="text-tetri-blue text-xs font-bold">{(item.userName || '?')[0].toUpperCase()}</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-tetri-text truncate">{item.userName || item.userId || '—'}</p>
              <p className="text-xs text-tetri-neutral">{item.ipAddress || ''}</p>
            </div>
          </div>
        </td>
        <td className="px-4 py-3">
          <code className="text-xs text-tetri-blue bg-[#eff4ff] px-1.5 py-0.5 rounded font-mono">{item.action}</code>
        </td>
        <td className="px-4 py-3">
          {item.entityType && (
            <span className="text-xs text-tetri-muted">{item.entityType}</span>
          )}
        </td>
        <td className="px-4 py-3">
          {hasChanges && (
            <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded font-medium">
              {item.fieldChangesJson.length} change{item.fieldChangesJson.length !== 1 ? 's' : ''}
            </span>
          )}
        </td>
        <td className="px-4 py-3 text-xs text-tetri-neutral whitespace-nowrap">{timeAgo(item.createdAt)}</td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            {item.isLegalHold && <Lock className="w-3.5 h-3.5 text-amber-500" title="Legal Hold" />}
            <button
              onClick={(e) => { e.stopPropagation(); toggleLegalHold(); }}
              disabled={holdLoading}
              className="text-xs text-tetri-neutral hover:text-tetri-text p-1 rounded hover:bg-tetri-bg transition-colors"
              title={item.isLegalHold ? 'Remove legal hold' : 'Place legal hold'}
            >
              {item.isLegalHold ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
            </button>
          </div>
        </td>
      </tr>
      {expanded && (
        <tr className="bg-tetri-bg">
          <td colSpan={6} className="px-6 py-4">
            <div className="space-y-4">
              {/* Hashes */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                {[
                  { label: 'Record Hash',   value: item.recordHash },
                  { label: 'Previous Hash', value: item.previousRecordHash },
                  { label: 'Chain Hash',    value: item.chainHash },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-tetri-surface border border-tetri-border rounded-xl p-3">
                    <p className="text-tetri-neutral font-medium mb-1">{label}</p>
                    <code className="text-[10px] text-tetri-muted font-mono break-all">{value || '—'}</code>
                  </div>
                ))}
              </div>

              {/* Field changes */}
              {hasChanges && (
                <div>
                  <p className="text-xs font-semibold text-tetri-text mb-2">Field Changes</p>
                  <DiffViewer fieldChanges={item.fieldChangesJson} />
                </div>
              )}

              {/* Before/After snapshots */}
              {(item.beforeSnapshotJson || item.afterSnapshotJson) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { label: 'Before Snapshot', data: item.beforeSnapshotJson },
                    { label: 'After Snapshot',  data: item.afterSnapshotJson  },
                  ].map(({ label, data }) => data && (
                    <div key={label} className="bg-tetri-surface border border-tetri-border rounded-xl p-3">
                      <p className="text-xs font-semibold text-tetri-text mb-2">{label}</p>
                      <pre className="text-[10px] text-tetri-muted font-mono overflow-auto max-h-48 whitespace-pre-wrap">
                        {JSON.stringify(data, null, 2)}
                      </pre>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function AuditCenterPage() {
  const [items, setItems]       = useState([]);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(1);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const [search,     setSearch]     = useState('');
  const [entityType, setEntityType] = useState('');
  const [startDate,  setStartDate]  = useState('');
  const [endDate,    setEndDate]    = useState('');
  const [datePreset, setDatePreset] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null);

  const limit = 50;

  const buildParams = useCallback(() => {
    const p = { page, limit };
    if (search)     p.search     = search;
    if (entityType) p.entityType = entityType;
    if (startDate)  p.startDate  = startDate;
    if (endDate)    p.endDate    = endDate;
    return p;
  }, [page, search, entityType, startDate, endDate]);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const result = await auditService.list(buildParams());
      setItems(result.items || []);
      setTotal(result.total || 0);
    } catch (err) {
      setError(err.message || 'Failed to load audit log');
    } finally {
      setLoading(false);
    }
  }, [buildParams]);

  useEffect(() => { load(); }, [load]);

  function applyPreset(p) {
    setDatePreset(p.label);
    if (p.days === 0) {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      setStartDate(today.toISOString());
    } else {
      setStartDate(daysAgoISO(p.days));
    }
    setEndDate(new Date().toISOString());
    setPage(1);
  }

  function clearFilters() {
    setSearch(''); setEntityType(''); setStartDate(''); setEndDate(''); setDatePreset(''); setPage(1);
  }

  async function handleVerify() {
    setVerifying(true); setVerifyResult(null);
    try {
      const result = await auditService.verifyChain();
      setVerifyResult(result);
    } catch {
      setVerifyResult({ valid: false, issues: [{ issue: 'Verification request failed' }] });
    } finally {
      setVerifying(false);
    }
  }

  function handleLegalHoldChange(id, isLegalHold) {
    setItems((prev) => prev.map((item) => item.id === id ? { ...item, isLegalHold } : item));
  }

  const hasFilters = search || entityType || startDate || endDate;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-tetri-text flex items-center gap-2">
            <Shield className="w-5 h-5 text-tetri-blue" />
            Audit Center
          </h1>
          <p className="text-sm text-tetri-muted mt-0.5">
            Immutable audit trail — {total.toLocaleString()} records
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleVerify}
            disabled={verifying}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-tetri-border text-sm text-tetri-muted hover:bg-tetri-bg hover:text-tetri-text transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${verifying ? 'animate-spin' : ''}`} />
            Verify Integrity
          </button>
          <button
            onClick={() => auditService.exportCsv(buildParams())}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-tetri-border text-sm text-tetri-muted hover:bg-tetri-bg hover:text-tetri-text transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Verify result */}
      {verifyResult && (
        <div className={`flex items-start gap-3 px-4 py-3 rounded-xl border ${verifyResult.valid ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
          {verifyResult.valid
            ? <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            : <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          }
          <div>
            <p className={`text-sm font-semibold ${verifyResult.valid ? 'text-emerald-800' : 'text-red-800'}`}>
              {verifyResult.valid ? `Chain integrity verified — ${verifyResult.totalRecords} records checked` : `Chain integrity issues found — ${verifyResult.issues?.length} problem(s)`}
            </p>
            {!verifyResult.valid && verifyResult.issues?.map((issue, i) => (
              <p key={i} className="text-xs text-red-700 mt-1">{issue.issue} {issue.id ? `(${issue.id.slice(0, 8)}…)` : ''}</p>
            ))}
          </div>
        </div>
      )}

      {/* Search + filters */}
      <div className="bg-tetri-surface border border-tetri-border rounded-card p-4 space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tetri-neutral" />
            <input
              type="text"
              placeholder="Search by user, action, entity…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-3 py-2 text-sm border border-tetri-border rounded-xl bg-tetri-bg text-tetri-text placeholder:text-tetri-neutral focus:outline-none focus:ring-2 focus:ring-tetri-blue/20"
            />
          </div>
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-colors ${showFilters ? 'border-tetri-blue bg-[#eff4ff] text-tetri-blue' : 'border-tetri-border text-tetri-muted hover:bg-tetri-bg'}`}
          >
            <Filter className="w-4 h-4" />
            Filters
            {hasFilters && <span className="w-1.5 h-1.5 rounded-full bg-tetri-blue inline-block" />}
          </button>
          {hasFilters && (
            <button onClick={clearFilters} className="p-2 rounded-xl border border-tetri-border text-tetri-muted hover:bg-tetri-bg hover:text-tetri-error transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {showFilters && (
          <div className="pt-2 border-t border-tetri-border grid grid-cols-2 md:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-tetri-neutral block mb-1">Entity Type</label>
              <select
                value={entityType}
                onChange={(e) => { setEntityType(e.target.value); setPage(1); }}
                className="w-full text-sm border border-tetri-border rounded-xl px-3 py-2 bg-tetri-bg text-tetri-text focus:outline-none focus:ring-2 focus:ring-tetri-blue/20"
              >
                <option value="">All entities</option>
                {ENTITY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="col-span-1 md:col-span-2">
              <label className="text-xs font-medium text-tetri-neutral block mb-1">Date range</label>
              <div className="flex gap-2 flex-wrap">
                {DATE_PRESETS.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => applyPreset(p)}
                    className={`text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${datePreset === p.label ? 'bg-[#eff4ff] border-tetri-blue text-tetri-blue' : 'border-tetri-border text-tetri-muted hover:bg-tetri-bg'}`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-tetri-surface border border-tetri-border rounded-card overflow-hidden">
        {loading && items.length === 0 && (
          <div className="flex items-center justify-center py-16 text-tetri-muted text-sm">Loading audit log…</div>
        )}
        {error && (
          <div className="flex items-center justify-center py-16 text-tetri-error text-sm">{error}</div>
        )}
        {!loading && !error && items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <Shield className="w-8 h-8 text-tetri-neutral" />
            <p className="text-sm text-tetri-muted">No audit records found</p>
          </div>
        )}

        {items.length > 0 && (
          <table className="w-full">
            <thead>
              <tr className="border-b border-tetri-border bg-tetri-bg">
                <th className="text-left px-4 py-3 text-xs font-semibold text-tetri-neutral">User</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-tetri-neutral">Action</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-tetri-neutral">Entity</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-tetri-neutral">Changes</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-tetri-neutral">Time</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-tetri-neutral">Hold</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-tetri-border">
              {items.map((item) => (
                <AuditRow
                  key={item.id}
                  item={item}
                  expanded={expandedId === item.id}
                  onToggle={() => setExpandedId((id) => id === item.id ? null : item.id)}
                  onLegalHoldChange={handleLegalHoldChange}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-tetri-muted">
          <span>Showing {Math.min((page - 1) * limit + 1, total)}–{Math.min(page * limit, total)} of {total.toLocaleString()}</span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-xl border border-tetri-border hover:bg-tetri-bg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-xl border border-tetri-border hover:bg-tetri-bg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
