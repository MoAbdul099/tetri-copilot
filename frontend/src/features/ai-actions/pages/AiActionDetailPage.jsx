import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Zap, CheckCircle, XCircle, Play, Ban, Clock,
  AlertTriangle, Loader2, AlertCircle, Shield, History,
  FileText, ChevronDown, ChevronUp,
} from 'lucide-react';
import {
  getAction, submitAction, approveAction, rejectAction,
  executeAction, cancelAction,
} from '../services/aiActionService.js';

const STATUS_CONFIG = {
  draft:            { label: 'Draft',            color: 'text-slate-600',  bg: 'bg-slate-100'  },
  pending_approval: { label: 'Pending Approval', color: 'text-amber-700',  bg: 'bg-amber-100'  },
  approved:         { label: 'Approved',         color: 'text-blue-700',   bg: 'bg-blue-100'   },
  rejected:         { label: 'Rejected',         color: 'text-red-700',    bg: 'bg-red-100'    },
  executing:        { label: 'Executing',        color: 'text-violet-700', bg: 'bg-violet-100' },
  completed:        { label: 'Completed',        color: 'text-emerald-700',bg: 'bg-emerald-100'},
  failed:           { label: 'Failed',           color: 'text-red-700',    bg: 'bg-red-100'    },
  cancelled:        { label: 'Cancelled',        color: 'text-slate-500',  bg: 'bg-slate-100'  },
  expired:          { label: 'Expired',          color: 'text-slate-500',  bg: 'bg-slate-100'  },
};

const RISK_COLORS = {
  low: 'text-emerald-600', medium: 'text-amber-600',
  high: 'text-orange-600', critical: 'text-red-600',
};

const AUDIT_ICONS = {
  created: '📝', submitted_for_approval: '📤', auto_approved: '⚡',
  approved: '✅', rejected: '❌', cancelled: '🚫',
  execution_started: '▶️', execution_completed: '🎉', execution_failed: '💥',
};

function Section({ title, icon: Icon, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-slate-500" />}
          <span className="text-sm font-semibold text-slate-800">{title}</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      {open && <div className="px-5 pb-5 pt-1">{children}</div>}
    </div>
  );
}

function RejectModal({ onConfirm, onClose }) {
  const [comments, setComments] = useState('');
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <h3 className="text-base font-semibold text-slate-900 mb-3">Reject Action</h3>
        <p className="text-sm text-slate-500 mb-3">Please provide a reason for rejection.</p>
        <textarea
          value={comments} onChange={e => setComments(e.target.value)}
          rows={3} placeholder="Rejection reason…"
          className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
        />
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg">Cancel</button>
          <button
            onClick={() => onConfirm(comments)}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AiActionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [action, setAction]         = useState(null);
  const [loading, setLoading]       = useState(true);
  const [err, setErr]               = useState('');
  const [actioning, setActioning]   = useState('');
  const [showReject, setShowReject] = useState(false);

  async function load() {
    try {
      setErr('');
      const data = await getAction(id);
      setAction(data);
    } catch (e) {
      setErr(e.response?.data?.error || e.message);
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [id]);

  async function doAction(fn, label) {
    setActioning(label); setErr('');
    try { await fn(); await load(); }
    catch (e) { setErr(e.response?.data?.error || e.message); }
    finally { setActioning(''); }
  }

  if (loading) return <div className="flex justify-center py-24"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>;
  if (!action) return <div className="p-6 text-sm text-red-600">{err || 'Action not found.'}</div>;

  const statusCfg = STATUS_CONFIG[action.status] || STATUS_CONFIG.draft;
  const confidence = action.confidenceScore >= 75 ? 'High' : action.confidenceScore >= 50 ? 'Medium' : 'Low';
  const confColor  = action.confidenceScore >= 75 ? 'text-emerald-600' : action.confidenceScore >= 50 ? 'text-amber-600' : 'text-slate-500';

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/ai/actions')} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <Zap className="w-5 h-5 text-violet-500" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg font-semibold text-slate-900 truncate">{action.title}</h1>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusCfg.bg} ${statusCfg.color}`}>{statusCfg.label}</span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{action.module} / {action.actionType.replace(/_/g, ' ')} · Created {new Date(action.createdAt).toLocaleString()}</p>
        </div>
      </div>

      {err && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {err}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        {action.status === 'draft' && (
          <button
            onClick={() => doAction(() => submitAction(id), 'submit')}
            disabled={!!actioning}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors"
          >
            {actioning === 'submit' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            Submit for Approval
          </button>
        )}
        {action.status === 'pending_approval' && (
          <>
            <button
              onClick={() => doAction(() => approveAction(id, {}), 'approve')}
              disabled={!!actioning}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-60 transition-colors"
            >
              {actioning === 'approve' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              Approve
            </button>
            <button
              onClick={() => setShowReject(true)}
              disabled={!!actioning}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-60 transition-colors"
            >
              <XCircle className="w-4 h-4" /> Reject
            </button>
          </>
        )}
        {action.status === 'approved' && (
          <button
            onClick={() => doAction(() => executeAction(id), 'execute')}
            disabled={!!actioning}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700 disabled:opacity-60 transition-colors"
          >
            {actioning === 'execute' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            Execute Action
          </button>
        )}
        {['draft', 'pending_approval'].includes(action.status) && (
          <button
            onClick={() => doAction(() => cancelAction(id), 'cancel')}
            disabled={!!actioning}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200 disabled:opacity-60 transition-colors"
          >
            <Ban className="w-4 h-4" /> Cancel
          </button>
        )}
      </div>

      <div className="flex flex-col gap-4">
        {/* Overview */}
        <Section title="Action Details" icon={FileText}>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            <div>
              <p className="text-xs font-medium text-slate-500 mb-0.5">Risk Level</p>
              <p className={`text-sm font-semibold capitalize ${RISK_COLORS[action.riskLevel] || 'text-slate-700'}`}>{action.riskLevel}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 mb-0.5">Confidence</p>
              <p className={`text-sm font-semibold ${confColor}`}>{confidence} ({action.confidenceScore}%)</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 mb-0.5">Module</p>
              <p className="text-sm font-medium text-slate-700 capitalize">{action.module}</p>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-xs font-medium text-slate-500 mb-1">Description</p>
              <p className="text-sm text-slate-700 leading-relaxed">{action.description}</p>
            </div>
            {action.explanation && (
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">Why Generated</p>
                <p className="text-sm text-slate-700 leading-relaxed">{action.explanation}</p>
              </div>
            )}
            {action.expectedOutcome && (
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">Expected Outcome</p>
                <p className="text-sm text-slate-700 leading-relaxed">{action.expectedOutcome}</p>
              </div>
            )}
            {action.supportingEvidence && (
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">Supporting Evidence</p>
                <p className="text-sm text-slate-700 leading-relaxed">{action.supportingEvidence}</p>
              </div>
            )}
          </div>
        </Section>

        {/* Risk context */}
        {action.context && (
          <Section title="Risk Assessment" icon={Shield} defaultOpen={false}>
            <div className="grid grid-cols-2 gap-3">
              {['businessImpact', 'operationalImpact', 'complianceImpact', 'securityImpact'].map(key => (
                <div key={key} className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="text-xs text-slate-500 capitalize">{key.replace(/Impact$/, ' Impact').replace(/([A-Z])/g, ' $1').trim()}</span>
                  <span className={`text-xs font-medium capitalize ${
                    action.context[key] === 'high' ? 'text-orange-600' :
                    action.context[key] === 'medium' ? 'text-amber-600' : 'text-emerald-600'
                  }`}>{action.context[key] || '—'}</span>
                </div>
              ))}
            </div>
            {action.context.summary && (
              <p className="text-sm text-slate-600 mt-3 leading-relaxed">{action.context.summary}</p>
            )}
          </Section>
        )}

        {/* Approvals */}
        {action.approvals?.length > 0 && (
          <Section title="Approval History" icon={CheckCircle} defaultOpen={true}>
            {action.approvals.map(a => (
              <div key={a.id} className="flex items-start gap-3 py-2 border-b border-slate-100 last:border-0">
                {a.decision === 'approved' ? <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5" /> :
                 a.decision === 'rejected' ? <XCircle className="w-4 h-4 text-red-500 mt-0.5" /> :
                 <Clock className="w-4 h-4 text-amber-500 mt-0.5" />}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-700">{a.approverId}</span>
                    <span className={`text-xs capitalize font-medium ${a.decision === 'approved' ? 'text-emerald-600' : a.decision === 'rejected' ? 'text-red-600' : 'text-amber-600'}`}>
                      {a.decision || 'Pending'}
                    </span>
                  </div>
                  {a.comments && <p className="text-xs text-slate-500 mt-0.5">{a.comments}</p>}
                  {a.decidedAt && <p className="text-xs text-slate-400 mt-0.5">{new Date(a.decidedAt).toLocaleString()}</p>}
                </div>
              </div>
            ))}
          </Section>
        )}

        {/* Execution history */}
        {action.executionHistory?.length > 0 && (
          <Section title="Execution History" icon={Play} defaultOpen={true}>
            {action.executionHistory.map(h => (
              <div key={h.id} className="flex items-start gap-3 py-2 border-b border-slate-100 last:border-0">
                {h.status === 'success'
                  ? <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5" />
                  : <XCircle className="w-4 h-4 text-red-500 mt-0.5" />
                }
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium capitalize ${h.status === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>{h.status}</span>
                    {h.executionDurationMs && <span className="text-xs text-slate-400">{h.executionDurationMs}ms</span>}
                    {h.retryCount > 0 && <span className="text-xs text-amber-600">{h.retryCount} retries</span>}
                  </div>
                  {h.errorMessage && <p className="text-xs text-red-500 mt-0.5">{h.errorMessage}</p>}
                  {h.result?.message && <p className="text-xs text-slate-500 mt-0.5">{h.result.message}</p>}
                  <p className="text-xs text-slate-400 mt-0.5">{new Date(h.executedAt).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </Section>
        )}

        {/* Audit trail */}
        <Section title="Audit Trail" icon={History} defaultOpen={false}>
          {action.auditLogs?.length === 0 ? (
            <p className="text-sm text-slate-400">No audit events recorded.</p>
          ) : (
            <div className="relative pl-5">
              <div className="absolute left-1.5 top-0 bottom-0 w-px bg-slate-200" />
              {action.auditLogs?.map((log, i) => (
                <div key={log.id} className="relative mb-3 last:mb-0">
                  <div className="absolute -left-3.5 top-1 w-2 h-2 rounded-full bg-slate-400" />
                  <div className="text-xs">
                    <span className="mr-1">{AUDIT_ICONS[log.eventType] || '•'}</span>
                    <span className="font-medium text-slate-700 capitalize">{log.eventType.replace(/_/g, ' ')}</span>
                    {log.actorId && <span className="text-slate-400 ml-1">by {log.actorId.slice(0, 16)}…</span>}
                    <span className="text-slate-400 ml-2">{new Date(log.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>
      </div>

      {showReject && (
        <RejectModal
          onConfirm={async (comments) => {
            setShowReject(false);
            await doAction(() => rejectAction(id, { comments }), 'reject');
          }}
          onClose={() => setShowReject(false)}
        />
      )}
    </div>
  );
}
