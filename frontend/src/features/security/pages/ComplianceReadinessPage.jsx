import { useEffect, useState } from 'react';
import { Plus, CheckSquare, Clock, XCircle, ChevronDown, ChevronRight, ClipboardCheck } from 'lucide-react';
import securityService from '../services/securityService';

const REVIEW_TYPES = [
  { value: 'authentication',    label: 'Authentication' },
  { value: 'authorization',     label: 'Authorization & RBAC' },
  { value: 'tenant_isolation',  label: 'Tenant Isolation' },
  { value: 'api_security',      label: 'API Security' },
  { value: 'infrastructure',    label: 'Infrastructure' },
  { value: 'file_security',     label: 'File Storage Security' },
  { value: 'secrets',           label: 'Secrets Management' },
  { value: 'dependency_audit',  label: 'Dependency Audit' },
  { value: 'penetration_test',  label: 'Penetration Testing' },
  { value: 'compliance_policy', label: 'Compliance Policy' },
];

const STATUS_CFG = {
  pending:     { label: 'Pending',     color: 'text-slate-700 bg-slate-50 border-slate-200', icon: Clock },
  in_progress: { label: 'In Progress', color: 'text-blue-700 bg-blue-50 border-blue-200',   icon: Clock },
  completed:   { label: 'Completed',   color: 'text-emerald-700 bg-emerald-50 border-emerald-200', icon: CheckSquare },
  failed:      { label: 'Failed',      color: 'text-red-700 bg-red-50 border-red-200',       icon: XCircle },
};

const RISK_CFG = {
  critical: 'text-red-700 bg-red-50 border-red-200',
  high:     'text-orange-700 bg-orange-50 border-orange-200',
  medium:   'text-amber-700 bg-amber-50 border-amber-200',
  low:      'text-emerald-700 bg-emerald-50 border-emerald-200',
};

function ReviewRow({ review, onUpdate }) {
  const [open, setOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const cfg = STATUS_CFG[review.status] || STATUS_CFG.pending;
  const Icon = cfg.icon;

  const markComplete = async () => {
    setUpdating(true);
    try {
      await securityService.updateReview(review.id, { status: 'completed', reviewedAt: new Date().toISOString() });
      onUpdate();
    } finally {
      setUpdating(false);
    }
  };

  const typLabel = REVIEW_TYPES.find((t) => t.value === review.reviewType)?.label || review.reviewType;

  return (
    <div className="border border-tetri-border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-tetri-surface hover:bg-tetri-bg text-left transition-colors"
      >
        {open ? <ChevronDown className="w-4 h-4 text-tetri-muted flex-shrink-0" /> : <ChevronRight className="w-4 h-4 text-tetri-muted flex-shrink-0" />}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-tetri-text">{typLabel}</p>
          <p className="text-xs text-tetri-muted mt-0.5">By {review.reviewer}</p>
        </div>
        <div className="flex items-center gap-2">
          {review.riskLevel && (
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border capitalize ${RISK_CFG[review.riskLevel] || RISK_CFG.low}`}>
              {review.riskLevel} risk
            </span>
          )}
          <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${cfg.color}`}>
            <Icon size={11} />
            {cfg.label}
          </span>
        </div>
      </button>

      {open && (
        <div className="border-t border-tetri-border bg-tetri-bg px-4 py-3 space-y-3">
          {review.notes && (
            <p className="text-sm text-tetri-text">{review.notes}</p>
          )}
          {review.findings && (
            <div>
              <p className="text-xs font-semibold text-tetri-muted mb-1">Findings</p>
              <pre className="text-xs bg-tetri-surface border border-tetri-border rounded-lg p-3 overflow-x-auto">
                {typeof review.findings === 'string'
                  ? review.findings
                  : JSON.stringify(review.findings, null, 2)}
              </pre>
            </div>
          )}
          {review.remediationStatus && (
            <p className="text-xs text-tetri-muted">
              Remediation: <span className="font-medium capitalize">{review.remediationStatus}</span>
            </p>
          )}
          {review.reviewedAt && (
            <p className="text-xs text-tetri-muted">
              Completed: {new Date(review.reviewedAt).toLocaleString()}
            </p>
          )}
          {review.status !== 'completed' && (
            <button
              onClick={markComplete}
              disabled={updating}
              className="text-xs font-medium text-emerald-700 border border-emerald-300 rounded-lg px-3 py-1.5 hover:bg-emerald-50 transition-colors disabled:opacity-50"
            >
              {updating ? 'Updating…' : 'Mark as Completed'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function NewReviewModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ reviewType: '', reviewer: '', notes: '', riskLevel: 'medium' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const save = async () => {
    if (!form.reviewType || !form.reviewer) { setError('Review type and reviewer are required.'); return; }
    setSaving(true);
    try {
      await securityService.createReview({ ...form, status: 'pending' });
      onCreated();
    } catch (e) {
      setError(e?.response?.data?.error || 'Failed to create review.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
      <div className="bg-tetri-surface border border-tetri-border rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
        <h3 className="text-base font-semibold text-tetri-text">New Security Review</h3>
        {error && <p className="text-xs text-red-600">{error}</p>}

        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-tetri-muted block mb-1">Review Type *</label>
            <select
              value={form.reviewType}
              onChange={(e) => setForm({ ...form, reviewType: e.target.value })}
              className="w-full text-sm border border-tetri-border rounded-xl px-3 py-2 bg-tetri-bg text-tetri-text focus:outline-none focus:ring-2 focus:ring-tetri-blue/30"
            >
              <option value="">Select type…</option>
              {REVIEW_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-tetri-muted block mb-1">Reviewer *</label>
            <input
              value={form.reviewer}
              onChange={(e) => setForm({ ...form, reviewer: e.target.value })}
              placeholder="Name or team"
              className="w-full text-sm border border-tetri-border rounded-xl px-3 py-2 bg-tetri-bg text-tetri-text focus:outline-none focus:ring-2 focus:ring-tetri-blue/30"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-tetri-muted block mb-1">Risk Level</label>
            <select
              value={form.riskLevel}
              onChange={(e) => setForm({ ...form, riskLevel: e.target.value })}
              className="w-full text-sm border border-tetri-border rounded-xl px-3 py-2 bg-tetri-bg text-tetri-text focus:outline-none focus:ring-2 focus:ring-tetri-blue/30"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-tetri-muted block mb-1">Notes</label>
            <textarea
              rows={3}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Scope, objectives, or preliminary notes…"
              className="w-full text-sm border border-tetri-border rounded-xl px-3 py-2 bg-tetri-bg text-tetri-text focus:outline-none focus:ring-2 focus:ring-tetri-blue/30 resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <button onClick={onClose} className="px-4 py-2 text-sm text-tetri-muted hover:bg-tetri-bg rounded-xl transition-colors">Cancel</button>
          <button
            onClick={save}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium bg-tetri-blue text-white rounded-xl hover:bg-tetri-blue-hover transition-colors disabled:opacity-50"
          >
            {saving ? 'Creating…' : 'Create Review'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ComplianceReadinessPage() {
  const [data, setData]         = useState(null);
  const [reviews, setReviews]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showNew, setShowNew]   = useState(false);
  const [statusFilter, setStatusFilter] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const params = statusFilter ? { status: statusFilter } : {};
      const [summary, rev] = await Promise.all([
        securityService.getReviewSummary(),
        securityService.listReviews(params),
      ]);
      setData(summary);
      setReviews(rev.rows || []);
    } catch { /* noop */ }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [statusFilter]);

  const completedCount = data?.totalCompleted || 0;
  const openCount = data?.totalOpen || 0;
  const total = completedCount + openCount;
  const progress = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {showNew && (
        <NewReviewModal onClose={() => setShowNew(false)} onCreated={() => { setShowNew(false); load(); }} />
      )}

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-tetri-text">Compliance Readiness</h1>
          <p className="text-tetri-muted text-sm mt-1">Track security reviews and compliance policy completion</p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-tetri-blue text-white rounded-xl hover:bg-tetri-blue-hover transition-colors"
        >
          <Plus size={15} />
          New Review
        </button>
      </div>

      {/* Progress summary */}
      <div className="bg-tetri-surface border border-tetri-border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-tetri-text">Review Completion</p>
          <p className="text-sm font-bold text-tetri-text">{progress}%</p>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2.5 mb-4">
          <div
            className="bg-tetri-blue h-2.5 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-emerald-600">{completedCount}</p>
            <p className="text-xs text-tetri-muted mt-0.5">Completed</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-amber-600">{openCount}</p>
            <p className="text-xs text-tetri-muted mt-0.5">Open</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-tetri-text">{total}</p>
            <p className="text-xs text-tetri-muted mt-0.5">Total</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-sm border border-tetri-border rounded-xl px-3 py-1.5 bg-tetri-surface text-tetri-text focus:outline-none focus:ring-2 focus:ring-tetri-blue/30"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
        </select>
        <span className="text-sm text-tetri-muted self-center">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</span>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((n) => <div key={n} className="h-14 bg-slate-100 rounded-xl animate-pulse" />)}
        </div>
      ) : reviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
            <ClipboardCheck size={22} className="text-slate-400" />
          </div>
          <p className="text-sm font-medium text-tetri-muted">No security reviews yet</p>
          <p className="text-xs text-tetri-muted mt-1">Create a review to track your security compliance progress</p>
        </div>
      ) : (
        <div className="space-y-2">
          {reviews.map((r) => (
            <ReviewRow key={r.id} review={r} onUpdate={load} />
          ))}
        </div>
      )}
    </div>
  );
}
