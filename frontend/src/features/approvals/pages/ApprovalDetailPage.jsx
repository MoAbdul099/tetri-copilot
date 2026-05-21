import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, RotateCcw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PageHeader from '../../../components/shared/PageHeader.jsx';
import { useToast } from '../../../components/shared/Toast.jsx';
import ConfirmDialog from '../../../components/shared/ConfirmDialog.jsx';
import { getApprovalHistory, approveExpense, rejectExpense, returnExpense } from '../services/approvalsService.js';

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—';
const fmtAmt  = (n, c = '') => `${c} ${Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`.trim();

const ACTION_STYLES = {
  submit:              'bg-blue-50 text-blue-700 border-blue-200',
  approve:             'bg-green-50 text-green-700 border-green-200',
  reject:              'bg-red-50 text-red-700 border-red-200',
  return_for_correction: 'bg-orange-50 text-orange-700 border-orange-200',
  withdraw:            'bg-gray-50 text-gray-600 border-gray-200',
  comment:             'bg-tetri-bg text-tetri-neutral border-tetri-border',
};

function ActionBadge({ action }) {
  const label = {
    submit: 'Submitted', approve: 'Approved', reject: 'Rejected',
    return_for_correction: 'Returned', withdraw: 'Withdrawn', comment: 'Comment',
  }[action] || action;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${ACTION_STYLES[action] || 'bg-tetri-bg text-tetri-neutral border-tetri-border'}`}>
      {label}
    </span>
  );
}

function LabelValue({ label, value }) {
  return (
    <div>
      <p className="text-xs font-medium text-tetri-neutral uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-sm text-tetri-text">{value || '—'}</p>
    </div>
  );
}

export default function ApprovalDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showToast, ToastContainer } = useToast();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);

  const [actionDialog, setActionDialog] = useState(null); // null | 'approve' | 'reject' | 'return'
  const [comment, setComment] = useState('');

  const load = () => {
    setLoading(true);
    getApprovalHistory(id)
      .then(setData)
      .catch(() => showToast('error', 'Failed to load approval'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const handleAction = async () => {
    if (!actionDialog) return;
    if ((actionDialog === 'reject' || actionDialog === 'return') && !comment.trim()) {
      showToast('error', actionDialog === 'reject' ? 'Rejection reason required' : 'Return reason required');
      return;
    }
    setActing(true);
    try {
      if (actionDialog === 'approve') await approveExpense(id, { comment });
      if (actionDialog === 'reject')  await rejectExpense(id, { comment });
      if (actionDialog === 'return')  await returnExpense(id, { comment });
      showToast('success', `Expense ${actionDialog === 'return' ? 'returned for correction' : actionDialog + 'd'}`);
      setActionDialog(null);
      setComment('');
      load();
    } catch (err) {
      showToast('error', err?.response?.data?.error || `Failed to ${actionDialog}`);
    } finally {
      setActing(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <Loader2 className="w-6 h-6 animate-spin text-tetri-neutral" />
    </div>
  );

  if (!data) return (
    <div className="py-16 text-center space-y-3">
      <p className="text-sm text-tetri-neutral">Approval not found</p>
      <Button variant="outline" onClick={() => navigate('/approvals')}>Back to Approvals</Button>
    </div>
  );

  const { expense, workflow } = data;
  const isPending = expense?.status === 'pending_approval';

  return (
    <div className="space-y-6">
      {ToastContainer}

      <PageHeader title={expense?.expenseNumber || 'Approval'} subtitle={expense?.description}>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate('/approvals')} className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          <Button variant="outline" onClick={() => navigate(`/expenses/${id}`)} className="gap-2">
            View Expense
          </Button>
        </div>
      </PageHeader>

      {/* Expense Details */}
      <div className="bg-white border border-tetri-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-tetri-text mb-4">Expense Details</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4">
          <LabelValue label="Status"       value={expense?.status} />
          <LabelValue label="Amount"       value={fmtAmt(expense?.amount, expense?.currencyCode)} />
          <LabelValue label="Date"         value={fmtDate(expense?.expenseDate)} />
          <LabelValue label="Category"     value={expense?.category?.name} />
          <LabelValue label="Supplier"     value={expense?.supplier?.name} />
          <LabelValue label="Type"         value={expense?.expenseType} />
          <LabelValue label="Submitted By" value={workflow?.submittedBy?.fullName} />
          <LabelValue label="Submitted At" value={fmtDate(workflow?.submittedAt)} />
        </div>
        {expense?.notes && (
          <div className="mt-4 pt-4 border-t border-tetri-border">
            <p className="text-xs font-medium text-tetri-neutral uppercase tracking-wide mb-1">Notes</p>
            <p className="text-sm text-tetri-text whitespace-pre-wrap">{expense.notes}</p>
          </div>
        )}
      </div>

      {/* Approval Actions */}
      {isPending && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5">
          <p className="text-sm font-semibold text-yellow-800 mb-3">Action Required</p>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setActionDialog('approve')} className="gap-2 bg-green-600 hover:bg-green-700 text-white">
              <CheckCircle className="w-4 h-4" /> Approve
            </Button>
            <Button onClick={() => setActionDialog('reject')} variant="outline" className="gap-2 text-red-600 border-red-300 hover:bg-red-50">
              <XCircle className="w-4 h-4" /> Reject
            </Button>
            <Button onClick={() => setActionDialog('return')} variant="outline" className="gap-2 text-orange-600 border-orange-300 hover:bg-orange-50">
              <RotateCcw className="w-4 h-4" /> Return for Correction
            </Button>
          </div>
        </div>
      )}

      {/* Approval History */}
      {workflow && (
        <div className="bg-white border border-tetri-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-tetri-text mb-4">Approval History</h3>
          {(!workflow.comments || workflow.comments.length === 0) ? (
            <p className="text-sm text-tetri-neutral">No history yet</p>
          ) : (
            <div className="space-y-3">
              {workflow.comments.map((c) => (
                <div key={c.id} className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-tetri-bg flex items-center justify-center text-xs font-medium text-tetri-neutral">
                    {c.user?.fullName?.charAt(0) || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-medium text-tetri-text">{c.user?.fullName}</span>
                      <ActionBadge action={c.action} />
                      <span className="text-xs text-tetri-neutral ml-auto">{fmtDate(c.createdAt)}</span>
                    </div>
                    <p className="text-sm text-tetri-neutral">{c.comment}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Assignments */}
      {workflow?.assignments?.length > 0 && (
        <div className="bg-white border border-tetri-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-tetri-text mb-4">Approvers</h3>
          <div className="space-y-2">
            {workflow.assignments.map((a) => (
              <div key={a.id} className="flex items-center justify-between py-2 border-b border-tetri-border last:border-0">
                <div>
                  <p className="text-sm font-medium text-tetri-text">{a.assignedTo?.fullName}</p>
                  <p className="text-xs text-tetri-neutral">{a.assignedTo?.email}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${ACTION_STYLES[a.status] || 'bg-tetri-bg text-tetri-neutral border-tetri-border'}`}>
                  {a.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Dialog */}
      {actionDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-base font-semibold text-tetri-text">
              {actionDialog === 'approve' ? 'Approve Expense' : actionDialog === 'reject' ? 'Reject Expense' : 'Return for Correction'}
            </h3>
            <p className="text-sm text-tetri-neutral">
              {actionDialog === 'approve'
                ? 'Add an optional comment for your approval.'
                : `Please provide a reason for ${actionDialog === 'reject' ? 'rejection' : 'returning this expense'}.`}
            </p>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={actionDialog === 'approve' ? 'Optional comment…' : 'Required reason…'}
              rows={3}
              className="w-full text-sm border border-tetri-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-tetri-blue resize-none"
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => { setActionDialog(null); setComment(''); }}>Cancel</Button>
              <Button
                onClick={handleAction}
                disabled={acting}
                className={actionDialog === 'approve' ? 'bg-green-600 hover:bg-green-700 text-white' : actionDialog === 'reject' ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-orange-600 hover:bg-orange-700 text-white'}
              >
                {acting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {actionDialog === 'approve' ? 'Approve' : actionDialog === 'reject' ? 'Reject' : 'Return'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
