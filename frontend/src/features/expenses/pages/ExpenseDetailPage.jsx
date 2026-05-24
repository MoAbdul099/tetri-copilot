import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit2, Copy, Trash2, Loader2, Send, RotateCcw, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PageHeader from '../../../components/shared/PageHeader.jsx';
import { useToast } from '../../../components/shared/Toast.jsx';
import ConfirmDialog from '../../../components/shared/ConfirmDialog.jsx';
import { getExpense, deleteExpense, duplicateExpense } from '../services/expensesService.js';
import AttachmentsPanel from '../../files/components/AttachmentsPanel.jsx';
import { submitExpense, withdrawExpense, getApprovalHistory } from '../../approvals/services/approvalsService.js';
import { createReimbursement } from '../../reimbursements/services/reimbursementsService.js';

const TYPE_LABELS = { company: 'Company', employee: 'Employee', petty_cash: 'Petty Cash' };

const STATUS_STYLES = {
  draft:            'bg-yellow-50 text-yellow-700 border-yellow-200',
  submitted:        'bg-blue-50 text-blue-700 border-blue-200',
  pending_approval: 'bg-orange-50 text-orange-700 border-orange-200',
  approved:         'bg-green-50 text-green-700 border-green-200',
  rejected:         'bg-red-50 text-red-700 border-red-200',
  returned:         'bg-orange-50 text-orange-700 border-orange-200',
  cancelled:        'bg-gray-50 text-gray-600 border-gray-200',
  closed:           'bg-gray-50 text-gray-600 border-gray-200',
};

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—';
const fmtAmt  = (n, c = '') => `${c} ${Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`.trim();
function LabelValue({ label, value }) {
  return (
    <div>
      <p className="text-xs font-medium text-tetri-neutral uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-sm text-tetri-text">{value || '—'}</p>
    </div>
  );
}

export default function ExpenseDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showToast, ToastContainer } = useToast();
  const [expense, setExpense] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [workflow, setWorkflow] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [requestingReimb, setRequestingReimb] = useState(false);

  const load = () => {
    setLoading(true);
    setLoadError(null);
    return Promise.all([
      getExpense(id),
      getApprovalHistory(id).catch(() => null),
    ])
      .then(([data, histData]) => {
        setExpense(data);
        setWorkflow(histData?.workflow || null);
      })
      .catch((err) => {
        const msg = err?.response?.data?.error || err?.message || 'Failed to load expense';
        setLoadError(msg);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await submitExpense(id);
      showToast('success', 'Expense submitted for approval');
      load();
    } catch (err) {
      showToast('error', err?.response?.data?.error || 'Failed to submit expense');
    } finally {
      setSubmitting(false);
    }
  };

  const handleWithdraw = async () => {
    setWithdrawing(true);
    try {
      await withdrawExpense(id);
      showToast('success', 'Expense withdrawn');
      load();
    } catch (err) {
      showToast('error', err?.response?.data?.error || 'Failed to withdraw expense');
    } finally {
      setWithdrawing(false);
    }
  };

  const handleRequestReimbursement = async () => {
    setRequestingReimb(true);
    try {
      const r = await createReimbursement({ expenseId: id, requestedAmount: expense.amount, currencyCode: expense.currencyCode });
      showToast('success', 'Reimbursement request created');
      navigate(`/reimbursements/${r.id}`);
    } catch (err) {
      showToast('error', err?.response?.data?.error || 'Failed to create reimbursement');
    } finally {
      setRequestingReimb(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteExpense(id);
      showToast('success', 'Expense deleted');
      navigate('/expenses');
    } catch {
      showToast('error', 'Failed to delete expense');
    } finally {
      setDeleting(false);
    }
  };

  const handleDuplicate = async () => {
    try {
      const newExp = await duplicateExpense(id);
      showToast('success', 'Expense duplicated');
      navigate(`/expenses/${newExp.id}`);
    } catch {
      showToast('error', 'Failed to duplicate expense');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-tetri-neutral" />
      </div>
    );
  }

  if (!expense) {
    return (
      <div className="py-16 text-center space-y-3">
        <p className="text-sm font-medium text-tetri-neutral">Expense not found</p>
        {loadError && (
          <p className="text-xs text-tetri-error bg-red-50 border border-red-200 rounded-lg px-4 py-2 inline-block max-w-md">
            {loadError}
          </p>
        )}
        <div>
          <Button variant="outline" onClick={() => navigate('/expenses')}>Back to Expenses</Button>
        </div>
      </div>
    );
  }


  return (
    <div className="space-y-6">
      {ToastContainer}

      <PageHeader title={expense.expenseNumber} subtitle={expense.description}>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate('/expenses')} className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          {expense?.status === 'pending_approval' && (
            <Button variant="outline" onClick={handleWithdraw} disabled={withdrawing} className="gap-2">
              {withdrawing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />} Withdraw
            </Button>
          )}
          {['draft', 'returned'].includes(expense?.status) && (
            <Button onClick={handleSubmit} disabled={submitting} className="gap-2">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Submit for Approval
            </Button>
          )}
          {expense?.status === 'approved' && expense?.expenseType === 'employee' && (
            <Button variant="outline" onClick={handleRequestReimbursement} disabled={requestingReimb} className="gap-2">
              {requestingReimb ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wallet className="w-4 h-4" />} Request Reimbursement
            </Button>
          )}
          <Button variant="outline" onClick={handleDuplicate} className="gap-2">
            <Copy className="w-4 h-4" /> Duplicate
          </Button>
          {['draft', 'returned', 'rejected'].includes(expense?.status) && (
            <Button variant="outline" onClick={() => navigate(`/expenses/${id}/edit`)} className="gap-2">
              <Edit2 className="w-4 h-4" /> Edit
            </Button>
          )}
          {['draft', 'rejected', 'cancelled'].includes(expense?.status) && (
            <Button variant="outline" className="gap-2 text-tetri-error hover:text-tetri-error" onClick={() => setDeleteTarget(expense)}>
              <Trash2 className="w-4 h-4" /> Delete
            </Button>
          )}
        </div>
      </PageHeader>

      {/* Status + type badges */}
      <div className="flex items-center gap-2">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${STATUS_STYLES[expense.status] || 'bg-tetri-bg text-tetri-neutral border-tetri-border'}`}>
          {expense.status?.replace(/_/g, ' ')}
        </span>
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-tetri-bg text-tetri-neutral border border-tetri-border">
          {TYPE_LABELS[expense.expenseType] || expense.expenseType}
        </span>
      </div>

      {/* Approval status banner */}
      {expense.status === 'pending_approval' && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl px-5 py-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-orange-800">Pending Approval</p>
            <p className="text-xs text-orange-600">This expense is awaiting approval from the assigned approvers.</p>
          </div>
          <Button size="sm" variant="outline" className="text-orange-700 border-orange-300" onClick={() => navigate(`/approvals/${id}`)}>
            View Approval
          </Button>
        </div>
      )}
      {expense.status === 'returned' && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl px-5 py-3">
          <p className="text-sm font-medium text-orange-800">Returned for Correction</p>
          {workflow?.comments?.filter((c) => c.action === 'return_for_correction').slice(-1).map((c) => (
            <p key={c.id} className="text-xs text-orange-700 mt-0.5">"{c.comment}" — {c.user?.fullName}</p>
          ))}
          <p className="text-xs text-orange-600 mt-1">Update the expense and resubmit for approval.</p>
        </div>
      )}
      {expense.status === 'rejected' && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-3">
          <p className="text-sm font-medium text-red-800">Rejected</p>
          {workflow?.comments?.filter((c) => c.action === 'reject').slice(-1).map((c) => (
            <p key={c.id} className="text-xs text-red-700 mt-0.5">"{c.comment}" — {c.user?.fullName}</p>
          ))}
        </div>
      )}

      {/* Main info */}
      <div className="bg-white border border-tetri-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-tetri-text mb-4">Expense Details</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-5">
          <LabelValue label="Expense Number" value={expense.expenseNumber} />
          <LabelValue label="Expense Date" value={fmtDate(expense.expenseDate)} />
          <LabelValue label="Posting Date" value={fmtDate(expense.postingDate)} />
          <LabelValue label="Status" value={expense.status} />
          <LabelValue label="Amount" value={fmtAmt(expense.amount, expense.currencyCode)} />
          <LabelValue label="Category" value={expense.category?.name} />
          <LabelValue label="Supplier" value={expense.supplier?.name} />
          <LabelValue label="Type" value={TYPE_LABELS[expense.expenseType]} />
          {expense.taxRate && <LabelValue label="Tax Rate" value={`${expense.taxRate}%${expense.taxIncluded ? ' (included)' : ''}`} />}
          {expense.referenceNumber && <LabelValue label="Reference #" value={expense.referenceNumber} />}
          {expense.department && <LabelValue label="Department" value={expense.department} />}
          {expense.costCenter && <LabelValue label="Cost Center" value={expense.costCenter} />}
          {expense.project && <LabelValue label="Project" value={expense.project} />}
        </div>
        {expense.notes && (
          <div className="mt-4 pt-4 border-t border-tetri-border">
            <p className="text-xs font-medium text-tetri-neutral uppercase tracking-wide mb-1">Notes</p>
            <p className="text-sm text-tetri-text whitespace-pre-wrap">{expense.notes}</p>
          </div>
        )}
      </div>

      {/* Attachments */}
      <AttachmentsPanel entityType="expense" entityId={id} />

      {/* Metadata */}
      <div className="bg-tetri-bg border border-tetri-border rounded-xl px-5 py-4">
        <div className="flex flex-wrap gap-x-8 gap-y-1 text-xs text-tetri-neutral">
          {expense.createdByUser && <span>Created by {expense.createdByUser.fullName}</span>}
          {expense.createdAt && <span>on {fmtDate(expense.createdAt)}</span>}
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Expense"
        description={`Delete expense ${deleteTarget?.expenseNumber}? This cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
