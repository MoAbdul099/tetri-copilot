import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, CheckCircle, RotateCcw, XCircle, Zap, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageHeader from '@/components/shared/PageHeader';
import PaymentStatusBadge from '../components/PaymentStatusBadge';
import AllocationEditor from '../components/AllocationEditor';
import { getPayment, postPayment, reversePayment, voidPayment, allocatePayment, autoAllocate, removeAllocation, createCredit } from '../services/paymentsService';
import { useToast } from '../../../components/shared/Toast.jsx';

const fmtDate  = (d) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';
const fmtMoney = (v, ccy = '') => `${ccy} ${Number(v || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`.trim();

const METHOD_LABELS = {
  cash: 'Cash', bank_transfer: 'Bank Transfer', credit_card: 'Credit Card',
  debit_card: 'Debit Card', cheque: 'Cheque', mobile_wallet: 'Mobile Wallet',
  pos: 'POS', online_transfer: 'Online Transfer', other: 'Other',
};

const Field = ({ label, value }) => (
  <div><p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">{label}</p><p className="text-sm font-medium">{value || '—'}</p></div>
);

export default function PaymentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast, ToastContainer } = useToast();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reverseReason, setReverseReason] = useState('');
  const [showReverse, setShowReverse] = useState(false);

  const load = () => getPayment(id).then(setPayment).catch(() => showToast('error', 'Failed to load payment'));
  useEffect(() => { load(); }, [id]);

  const act = async (fn, successMsg) => {
    setLoading(true);
    try { await fn(); await load(); showToast('success', successMsg); }
    catch (err) { showToast('error', err?.response?.data?.error || 'Action failed'); }
    finally { setLoading(false); }
  };

  if (!payment) return <div className="py-12 text-center text-muted-foreground">Loading...</div>;

  const canEdit     = payment.status === 'draft';
  const canPost     = payment.status === 'draft';
  const canAllocate = ['posted', 'unallocated', 'partially_allocated'].includes(payment.status);
  const canReverse  = ['posted', 'allocated', 'partially_allocated', 'unallocated'].includes(payment.status);
  const canVoid     = ['draft', 'unallocated'].includes(payment.status);
  const canCredit   = canAllocate && payment.unallocatedAmount > 0;

  return (
    <div className="space-y-6">
      <ToastContainer />

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/payments')}><ArrowLeft className="h-4 w-4" /></Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{payment.paymentNumber}</h1>
              <PaymentStatusBadge status={payment.status} />
            </div>
            <p className="text-sm text-muted-foreground">{payment.customer?.name}</p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          {canEdit    && <Button variant="outline" size="sm" onClick={() => navigate(`/payments/${id}/edit`)}><Edit className="h-4 w-4 mr-1" />Edit</Button>}
          {canPost    && <Button size="sm" onClick={() => act(() => postPayment(id), 'Payment posted')}><CheckCircle className="h-4 w-4 mr-1" />Post</Button>}
          {canVoid    && <Button variant="outline" size="sm" onClick={() => act(() => voidPayment(id), 'Payment voided')}><XCircle className="h-4 w-4 mr-1" />Void</Button>}
          {canReverse && <Button variant="destructive" size="sm" onClick={() => setShowReverse(true)}><RotateCcw className="h-4 w-4 mr-1" />Reverse</Button>}
        </div>
      </div>

      {/* Reverse dialog */}
      {showReverse && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 space-y-3">
          <p className="font-medium text-red-800">Reverse Payment</p>
          <p className="text-sm text-red-700">This will remove all allocations and restore invoice balances. This action cannot be undone.</p>
          <input
            className="w-full rounded-md border px-3 py-2 text-sm"
            placeholder="Reason for reversal (required)..."
            value={reverseReason}
            onChange={(e) => setReverseReason(e.target.value)}
          />
          <div className="flex gap-2">
            <Button variant="destructive" size="sm" disabled={!reverseReason.trim() || loading}
              onClick={() => act(() => reversePayment(id, { reason: reverseReason }), 'Payment reversed').then(() => setShowReverse(false))}>
              Confirm Reversal
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowReverse(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Amount',   value: fmtMoney(payment.amount, payment.currencyCode) },
          { label: 'Allocated',      value: fmtMoney(payment.allocatedAmount, payment.currencyCode) },
          { label: 'Unallocated',    value: fmtMoney(payment.unallocatedAmount, payment.currencyCode) },
          { label: 'Payment Method', value: METHOD_LABELS[payment.paymentMethod] || payment.paymentMethod },
        ].map((c) => (
          <div key={c.label} className="rounded-lg border bg-card p-4">
            <p className="text-xs text-muted-foreground mb-1">{c.label}</p>
            <p className="text-lg font-semibold">{c.value}</p>
          </div>
        ))}
      </div>

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="allocations">Allocations ({payment.allocations?.length || 0})</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Details tab */}
        <TabsContent value="details" className="mt-4">
          <div className="rounded-lg border bg-card p-6 grid grid-cols-2 md:grid-cols-3 gap-6">
            <Field label="Payment Number" value={payment.paymentNumber} />
            <Field label="Customer"       value={payment.customer?.name} />
            <Field label="Payment Date"   value={fmtDate(payment.paymentDate)} />
            <Field label="Currency"       value={payment.currencyCode} />
            <Field label="Reference"      value={payment.referenceNumber} />
            <Field label="Bank Reference" value={payment.bankReference} />
            {payment.chequeNumber && <Field label="Cheque Number" value={payment.chequeNumber} />}
            {payment.depositDate  && <Field label="Deposit Date"  value={fmtDate(payment.depositDate)} />}
            {payment.valueDate    && <Field label="Value Date"    value={fmtDate(payment.valueDate)} />}
            {payment.isAdvance    && <Field label="Type"          value="Advance Payment" />}
            {payment.notes && (
              <div className="col-span-full">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">Notes</p>
                <p className="text-sm">{payment.notes}</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Allocations tab */}
        <TabsContent value="allocations" className="mt-4 space-y-4">
          {/* Existing allocations */}
          {(payment.allocations || []).length > 0 && (
            <div className="rounded-lg border bg-card overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-muted-foreground text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left">Invoice</th>
                    <th className="px-4 py-3 text-right">Allocated</th>
                    <th className="px-4 py-3 text-left">Date</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {payment.allocations.map((a) => (
                    <tr key={a.id}>
                      <td className="px-4 py-3 font-medium">{a.invoice?.invoiceNumber || '—'}</td>
                      <td className="px-4 py-3 text-right">{fmtMoney(a.allocatedAmount, payment.currencyCode)}</td>
                      <td className="px-4 py-3 text-muted-foreground">{fmtDate(a.createdAt)}</td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 h-7 px-2"
                          onClick={() => act(() => removeAllocation(id, a.id), 'Allocation removed')}>
                          Remove
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Allocate form */}
          {canAllocate && (
            <div className="rounded-lg border bg-card p-4">
              <h3 className="font-medium mb-4">Allocate to Invoice</h3>
              <AllocationEditor
                payment={payment}
                loading={loading}
                onAllocate={(data) => act(() => allocatePayment(id, data), 'Payment allocated')}
                onAutoAllocate={() => act(() => autoAllocate(id), 'Auto-allocated successfully')}
              />
            </div>
          )}

          {/* Create credit */}
          {canCredit && (
            <div className="rounded-lg border bg-card p-4">
              <h3 className="font-medium mb-2">Create Customer Credit</h3>
              <p className="text-sm text-muted-foreground mb-3">Convert unallocated balance ({fmtMoney(payment.unallocatedAmount, payment.currencyCode)}) to a customer credit note.</p>
              <Button variant="outline" size="sm"
                onClick={() => act(() => createCredit(id, payment.unallocatedAmount), 'Credit created')}>
                <Plus className="h-4 w-4 mr-1" /> Create Credit ({fmtMoney(payment.unallocatedAmount, payment.currencyCode)})
              </Button>
            </div>
          )}

          {!canAllocate && !payment.allocations?.length && (
            <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
              <p>No allocations. Post the payment to start allocating.</p>
            </div>
          )}
        </TabsContent>

        {/* History tab */}
        <TabsContent value="history" className="mt-4">
          <div className="rounded-lg border bg-card divide-y divide-border">
            {(payment.statusHistory || []).map((h) => (
              <div key={h.id} className="px-4 py-3 flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span>{h.fromStatus ? h.fromStatus.replace(/_/g,' ') : 'Created'}</span>
                  {h.fromStatus && <span>→</span>}
                  <span className="font-medium text-foreground">{h.toStatus.replace(/_/g,' ')}</span>
                  {h.reason && <span className="italic">({h.reason})</span>}
                </div>
                <span className="text-muted-foreground text-xs">{fmtDate(h.createdAt)}</span>
              </div>
            ))}
            {!payment.statusHistory?.length && <p className="px-4 py-8 text-center text-muted-foreground">No history</p>}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
