import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle, XCircle, Clock, Loader2, AlertCircle,
  ChevronRight, Inbox,
} from 'lucide-react';
import { getPendingApprovals, approveAction, rejectAction } from '../services/aiActionService.js';

const RISK_COLORS = {
  low: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  medium: 'text-amber-600 bg-amber-50 border-amber-200',
  high: 'text-orange-600 bg-orange-50 border-orange-200',
  critical: 'text-red-600 bg-red-50 border-red-200',
};

function RejectModal({ onConfirm, onClose }) {
  const [comments, setComments] = useState('');
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <h3 className="text-base font-semibold text-slate-900 mb-2">Reject Action</h3>
        <p className="text-sm text-slate-500 mb-3">Provide a reason for rejection (optional).</p>
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
            Confirm Rejection
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AiApprovalCenterPage() {
  const navigate  = useNavigate();
  const [items, setItems]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [err, setErr]           = useState('');
  const [actioning, setActioning] = useState('');
  const [rejectTarget, setRejectTarget] = useState(null);

  async function load() {
    setErr('');
    try {
      const data = await getPendingApprovals();
      setItems(data);
    } catch (e) {
      setErr(e.response?.data?.error || e.message);
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function handleApprove(actionId, approvalId) {
    setActioning(actionId); setErr('');
    try {
      await approveAction(actionId, {});
      await load();
    } catch (e) {
      setErr(e.response?.data?.error || e.message);
    } finally { setActioning(''); }
  }

  async function handleReject(actionId, comments) {
    setActioning(actionId); setRejectTarget(null); setErr('');
    try {
      await rejectAction(actionId, { comments });
      await load();
    } catch (e) {
      setErr(e.response?.data?.error || e.message);
    } finally { setActioning(''); }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-amber-100">
          <Clock className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Approval Center</h1>
          <p className="text-sm text-slate-500">Review and action pending AI action proposals</p>
        </div>
      </div>

      {err && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {err}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center bg-white border border-slate-200 rounded-2xl">
          <Inbox className="w-10 h-10 text-slate-300 mb-3" />
          <p className="text-sm font-medium text-slate-600 mb-1">No pending approvals</p>
          <p className="text-xs text-slate-400 max-w-sm">All AI action proposals assigned to you have been actioned.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map(approval => {
            const action = approval.action;
            if (!action) return null;
            const confidence = action.confidenceScore >= 75 ? 'High' : action.confidenceScore >= 50 ? 'Medium' : 'Low';
            const confColor  = action.confidenceScore >= 75 ? 'text-emerald-600' : action.confidenceScore >= 50 ? 'text-amber-600' : 'text-slate-500';

            return (
              <div key={approval.id} className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded border capitalize ${RISK_COLORS[action.riskLevel] || RISK_COLORS.medium}`}>
                        {action.riskLevel} risk
                      </span>
                      <span className="text-xs text-slate-400">{action.module} / {action.actionType?.replace(/_/g, ' ')}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-slate-900 mb-1">{action.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed mb-2 line-clamp-2">{action.description}</p>

                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <span className={confColor}>Confidence: {confidence} ({action.confidenceScore}%)</span>
                      <span>Submitted {new Date(approval.createdAt).toLocaleDateString()}</span>
                      {action.expiresAt && (
                        <span className="text-amber-600">Expires {new Date(action.expiresAt).toLocaleDateString()}</span>
                      )}
                    </div>

                    {action.explanation && (
                      <div className="mt-2 p-2.5 bg-slate-50 rounded-lg">
                        <p className="text-xs text-slate-500 font-medium mb-0.5">Why generated:</p>
                        <p className="text-xs text-slate-600 leading-relaxed">{action.explanation}</p>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => navigate(`/ai/actions/${action.id}`)}
                    className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors flex-shrink-0"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => handleApprove(action.id, approval.id)}
                    disabled={actioning === action.id}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-60 transition-colors"
                  >
                    {actioning === action.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                    Approve
                  </button>
                  <button
                    onClick={() => setRejectTarget(action.id)}
                    disabled={actioning === action.id}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-60 transition-colors"
                  >
                    <XCircle className="w-3.5 h-3.5" /> Reject
                  </button>
                  <button
                    onClick={() => navigate(`/ai/actions/${action.id}`)}
                    className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {rejectTarget && (
        <RejectModal
          onConfirm={(comments) => handleReject(rejectTarget, comments)}
          onClose={() => setRejectTarget(null)}
        />
      )}
    </div>
  );
}
