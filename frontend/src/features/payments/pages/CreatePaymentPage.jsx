import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PageHeader from '@/components/shared/PageHeader';
import PaymentForm from '../components/PaymentForm';
import { recordPayment, postPayment, allocatePayment } from '../services/paymentsService';
import { useToast } from '../../../components/shared/Toast.jsx';
import api from '../../../lib/api';

const fmtMoney = (v, ccy = '') =>
  `${ccy} ${Number(v || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`.trim();

const outstanding = (inv) => Math.max(0, Number(inv.totalAmount) - Number(inv.paidAmount));

export default function CreatePaymentPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showToast, ToastContainer } = useToast();
  const [loading, setLoading] = useState(false);

  // Pre-fill from URL params (e.g. launched from invoice detail)
  const preCustomerId  = searchParams.get('customerId')  || '';
  const preInvoiceId   = searchParams.get('invoiceId')   || '';
  const preAmount      = searchParams.get('amount')      || '';
  const preCurrency    = searchParams.get('currencyCode') || 'USD';

  const [customerId, setCustomerId] = useState(preCustomerId);
  const [invoices, setInvoices]     = useState([]);
  const [allocations, setAllocations] = useState(
    preInvoiceId ? { [preInvoiceId]: preAmount } : {}
  );

  useEffect(() => {
    if (!customerId) { setInvoices([]); return; }
    api.get('/api/v1/invoices', {
      params: { customerId, status: 'issued,sent,partially_paid,overdue', limit: 100 },
    }).then((r) => {
      const items = r.data?.data?.items || [];
      setInvoices(items);
      // Pre-select invoice from URL if it belongs to this customer
      if (preInvoiceId && preAmount && items.find((i) => i.id === preInvoiceId)) {
        setAllocations({ [preInvoiceId]: preAmount });
      }
    }).catch(() => {});
  }, [customerId]);

  const toggleInvoice = (inv) => {
    setAllocations((prev) => {
      if (prev[inv.id] !== undefined) {
        const next = { ...prev };
        delete next[inv.id];
        return next;
      }
      return { ...prev, [inv.id]: outstanding(inv).toFixed(2) };
    });
  };

  const setAmount = (invoiceId, val) =>
    setAllocations((prev) => ({ ...prev, [invoiceId]: val }));

  const handleSubmit = async (data) => {
    setLoading(true);
    try {
      const payment = await recordPayment(data);

      await postPayment(payment.id);

      const validAllocs = Object.entries(allocations)
        .filter(([, amt]) => Number(amt) > 0)
        .map(([invoiceId, allocatedAmount]) => ({ invoiceId, allocatedAmount: Number(allocatedAmount) }));

      if (validAllocs.length) {
        await allocatePayment(payment.id, { allocations: validAllocs });
      }

      showToast('success', 'Payment recorded');
      setTimeout(() => navigate(`/payments/${payment.id}`), 500);
    } catch (err) {
      showToast('error', err?.response?.data?.error || 'Failed to record payment');
    } finally {
      setLoading(false);
    }
  };

  const ccy = preCurrency;

  return (
    <div className="max-w-3xl space-y-6">
      {ToastContainer}
      <PageHeader title="Record Payment" />

      <div className="rounded-lg border bg-card p-6">
        <PaymentForm
          initial={{ customerId: preCustomerId, amount: preAmount, currencyCode: preCurrency }}
          onSubmit={handleSubmit}
          loading={loading}
          submitLabel="Record Payment"
          onCustomerChange={setCustomerId}
        />
      </div>

      {customerId && invoices.length > 0 && (
        <div className="rounded-lg border bg-card p-6 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Apply to Invoices</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Select which outstanding invoices this payment covers (optional)</p>
          </div>

          <div className="divide-y divide-border">
            {invoices.map((inv) => {
              const owed = outstanding(inv);
              const selected = allocations[inv.id] !== undefined;
              return (
                <div key={inv.id} className="py-3 flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => toggleInvoice(inv)}
                    className="h-4 w-4 rounded border-gray-300 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{inv.invoiceNumber}</p>
                    <p className="text-xs text-muted-foreground">
                      Outstanding: {fmtMoney(owed, inv.currencyCode || ccy)}
                      {inv.dueDate && ` · Due ${new Date(inv.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
                    </p>
                  </div>
                  {selected && (
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max={owed}
                      value={allocations[inv.id]}
                      onChange={(e) => setAmount(inv.id, e.target.value)}
                      className="w-32 text-right"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {customerId && invoices.length === 0 && (
        <div className="rounded-lg border bg-card p-4 text-sm text-muted-foreground text-center">
          No outstanding invoices for this customer.
        </div>
      )}
    </div>
  );
}
