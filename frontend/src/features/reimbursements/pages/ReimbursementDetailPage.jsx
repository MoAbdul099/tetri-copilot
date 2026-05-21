import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, CreditCard, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PageHeader from '../../../components/shared/PageHeader.jsx';
import { useToast } from '../../../components/shared/Toast.jsx';
import ConfirmDialog from '../../../components/shared/ConfirmDialog.jsx';
import { getReimbursement, approveReimbursement, rejectReimbursement, recordReimbursementPayment, cancelReimbursement } from '../services/reimbursementsService.js';

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—';
const fmtAmt  = (n, c = '') => `${c} ${Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`.trim();

const STATUS_STYLES = {
  pending_approval: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  approved:         'bg-green-50 text-green-700 border-green-200',
  rejected:         'bg-red-50 text-red-700 border-red-200',
  partially_paid:   'bg-blue-50 text-blue-700 border-blue-200',
  fully_paid:       'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled:        'bg-gray-50 text-gray-600 border-gray-200',
};

function LabelValue({ label, value }) {
  return (
    <div>
      <p className="text-xs font-medium text-tetri-neutral uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-sm text-tetri-text">{value || '—'}</p>
    </div>
  );
}

const EMPTY_PAYMENT = { amount: '', paymentDate: '', paymentMethod: 'bank_transfer', referenceNumber: '', notes: '' };

export default function ReimbursementDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showToast, ToastContainer } = useToast();
  const [reimb, setReimb] = useState(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);

  const [actionDialog, setActionDialog] = useState(null); // 'approve' | 'reject' | 'cancel'
  const [comment, setComment] = useState('');
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentForm, setPaymentForm] = useState({ ...EMPTY_PAYMENT });

  const load = () => {
    setLoading(true);
    getReimbursement(id)
      .then(setReimb)
      .catch(() => showToast('error', 'Failed to load reimbursement'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const handleAction = async () => {
    if (!actionDialog) return;
    if (actionDialog === 'reject' && !comment.trim()) {
      showToast('error', 'Rejection reason is required');
      return;
    }
    setActing(true);
    try {
      if (actionDialog === 'approve') await approveReimbursement(id, { comment });
      if (actionDialog === 'reject')  await rejectReimbursement(id, { comment });
      if (actionDialog === 'cancel')  await cancelReimbursement(id);
      showToast('success', `Reimbursement ${actionDialog}d`);
      setActionDialog(null);
      setComment('');
      load();
    } catch (err) {
      showToast('error', err?.response?.data?.error || `Failed to ${actionDialog}`);
    } finally {
      setActing(false);
    }
  };

  const handleRecordPayment = async () => {
    setActing(true);
    try {
      await recordReimbursementPayment(id, {
        amount:          Number(paymentForm.amount),
        paymentDate:     paymentForm.paymentDate,
        paymentMethod:   paymentForm.paymentMethod,
        referenceNumber: paymentForm.referenceNumber || undefined,
        notes:           paymentForm.notes || undefined,
      });
      showToast('success', 'Payment recorded');
      setShowPaymentForm(false);
      setPaymentForm({ ...EMPTY_PAYMENT });
      load();
    } catch (err) {
      showToast('error', err?.response?.data?.error || 'Failed to record payment');
    } finally {
      setActing(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <Loader2 className="w-6 h-6 animate-spin text-tetri-neutral" />
    </div>
  );

  if (!reimb) return (
    <div className="py-16 text-center space-y-3">
      <p className="text-sm text-tetri-neutral">Reimbursement not found</p>
      <Button variant="outline" onClick={() => navigate('/reimbursements')}>Back</Button>
    </div>
  );

  const requested = Number(reimb.requestedAmount || 0);
  const paid      = Number(reimb.paidAmount || 0);
  const outstanding = Math.max(0, requested - paid);
  const canPay    = ['approved', 'partially_paid'].includes(reimb.status);
  const isPending = reimb.status === 'pending_approval';

  return (
    <div className="space-y-6">
      {ToastContainer}

      <PageHeader title={`Reimbursement — ${reimb.expense?.expenseNumber}`} subtitle={reimb.expense?.description}>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate('/reimbursements')} className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          <Button variant="outline" onClick={() => navigate(`/expenses/${reimb.expenseId}`)}>
            View Expense
          </Button>
        </div>
      </PageHeader>

      {/* Status badge */}
      <div>
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${STATUS_STYLES[reimb.status] || 'bg-tetri-bg text-tetri-neutral border-tetri-border'}`}>
          {reimb.status?.replace(/_/g, ' ')}
        </span>
      </div>

      {/* Summary */}
      <div className="bg-white border border-tetri-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-tetri-text mb-4">Reimbursement Details</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4">
          <LabelValue label="Requested By"    value={reimb.requestedBy?.fullName} />
          <LabelValue label="Requested Amount" value={fmtAmt(reimb.requestedAmount, reimb.currencyCode)} />
          <LabelValue label="Paid Amount"      value={fmtAmt(reimb.paidAmount, reimb.currencyCode)} />
          <LabelValue label="Outstanding"      value={fmtAmt(outstanding, reimb.currencyCode)} />
          {reimb.approvedBy  && <LabelValue label="Approved By"  value={reimb.approvedBy.fullName} />}
          {reimb.rejectedBy  && <LabelValue label="Rejected By"  value={reimb.rejectedBy.fullName} />}
          {reimb.approvedAt  && <LabelValue label="Approved At"  value={fmtDate(reimb.approvedAt)} />}
          {reimb.rejectedAt  && <LabelValue label="Rejected At"  value={fmtDate(reimb.rejectedAt)} />}
        </div>
        {reimb.notes && (
          <div className="mt-4 pt-4 border-t border-tetri-border">
            <p className="text-xs font-medium text-tetri-neutral uppercase tracking-wide mb-1">Notes</p>
            <p className="text-sm text-tetri-text whitespace-pre-wrap">{reimb.notes}</p>
          </div>
        )}
        {reimb.rejectionNote && (
          <div className="mt-4 pt-4 border-t border-tetri-border">
            <p className="text-xs font-medium text-red-600 uppercase tracking-wide mb-1">Rejection Reason</p>
            <p className="text-sm text-tetri-text">{reimb.rejectionNote}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      {isPending && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5">
          <p className="text-sm font-semibold text-yellow-800 mb-3">Approval Required</p>
          <div className="flex gap-2">
            <Button onClick={() => setActionDialog('approve')} className="gap-2 bg-green-600 hover:bg-green-700 text-white">
              <CheckCircle className="w-4 h-4" /> Approve
            </Button>
            <Button onClick={() => setActionDialog('reject')} variant="outline" className="gap-2 text-red-600 border-red-300 hover:bg-red-50">
              <XCircle className="w-4 h-4" /> Reject
            </Button>
          </div>
        </div>
      )}

      {canPay && !showPaymentForm && (
        <div>
          <Button onClick={() => setShowPaymentForm(true)} className="gap-2">
            <CreditCard className="w-4 h-4" /> Record Payment
          </Button>
        </div>
      )}

      {/* Payment Form */}
      {showPaymentForm && (
        <div className="bg-white border border-tetri-border rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-tetri-text">Record Payment</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-tetri-neutral mb-1">Amount</label>
              <Input type="number" value={paymentForm.amount} onChange={(e) => setPaymentForm((f) => ({ ...f, amount: e.target.value }))} placeholder={`Max ${outstanding.toFixed(2)}`} />
            </div>
            <div>
              <label className="block text-xs font-medium text-tetri-neutral mb-1">Payment Date</label>
              <Input type="date" value={paymentForm.paymentDate} onChange={(e) => setPaymentForm((f) => ({ ...f, paymentDate: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-medium text-tetri-neutral mb-1">Payment Method</label>
              <select value={paymentForm.paymentMethod} onChange={(e) => setPaymentForm((f) => ({ ...f, paymentMethod: e.target.value }))} className="w-full text-sm border border-tetri-border rounded-lg px-3 py-2 bg-white text-tetri-text focus:outline-none focus:ring-2 focus:ring-tetri-blue">
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cash">Cash</option>
                <option value="cheque">Cheque</option>
                <option value="digital_wallet">Digital Wallet</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-tetri-neutral mb-1">Reference Number</label>
              <Input value={paymentForm.referenceNumber} onChange={(e) => setPaymentForm((f) => ({ ...f, referenceNumber: e.target.value }))} placeholder="Optional" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-tetri-neutral mb-1">Notes</label>
              <Input value={paymentForm.notes} onChange={(e) => setPaymentForm((f) => ({ ...f, notes: e.target.value }))} placeholder="Optional" />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleRecordPayment} disabled={acting}>
              {acting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Record Payment
            </Button>
            <Button variant="outline" onClick={() => { setShowPaymentForm(false); setPaymentForm({ ...EMPTY_PAYMENT }); }}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Payment History */}
      {reimb.payments?.length > 0 && (
        <div className="bg-white border border-tetri-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-tetri-text mb-4">Payment History</h3>
          <div className="divide-y divide-tetri-border">
            {reimb.payments.map((p) => (
              <div key={p.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-tetri-text">{fmtAmt(p.amount, reimb.currencyCode)}</p>
                  <p className="text-xs text-tetri-neutral">{p.paymentMethod?.replace(/_/g, ' ')} · {fmtDate(p.paymentDate)}</p>
                  {p.referenceNumber && <p className="text-xs text-tetri-neutral">Ref: {p.referenceNumber}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cancel option */}
      {!['fully_paid', 'cancelled', 'rejected'].includes(reimb.status) && (
        <div>
          <button onClick={() => setActionDialog('cancel')} className="text-xs text-tetri-error hover:underline">
            Cancel Reimbursement Request
          </button>
        </div>
      )}

      {/* Action Dialog */}
      {actionDialog && actionDialog !== 'cancel' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-base font-semibold text-tetri-text">
              {actionDialog === 'approve' ? 'Approve Reimbursement' : 'Reject Reimbursement'}
            </h3>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={actionDialog === 'approve' ? 'Optional comment…' : 'Required rejection reason…'}
              rows={3}
              className="w-full text-sm border border-tetri-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-tetri-blue resize-none"
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => { setActionDialog(null); setComment(''); }}>Cancel</Button>
              <Button onClick={handleAction} disabled={acting}
                className={actionDialog === 'approve' ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}>
                {acting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {actionDialog === 'approve' ? 'Approve' : 'Reject'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={actionDialog === 'cancel'}
        title="Cancel Reimbursement"
        description="Cancel this reimbursement request? This cannot be undone."
        confirmLabel="Cancel Request"
        variant="destructive"
        loading={acting}
        onConfirm={handleAction}
        onCancel={() => setActionDialog(null)}
      />
    </div>
  );
}
