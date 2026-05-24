import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Edit, Download, Send, CheckCircle, XCircle, Ban,
  Copy, Loader2, CreditCard,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '../../../components/shared/Toast.jsx';
import ConfirmDialog from '../../../components/shared/ConfirmDialog.jsx';
import InvoiceStatusBadge from '../components/InvoiceStatusBadge.jsx';
import SendInvoiceDialog from '../components/SendInvoiceDialog.jsx';
import AttachmentsPanel from '../../files/components/AttachmentsPanel.jsx';
import {
  getInvoice, issueInvoice, cancelInvoice, voidInvoice, duplicateInvoice,
  downloadInvoicePdf,
} from '../services/invoicesService.js';

// ── Amount in words ────────────────────────────────────────
const ONES = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
const CURRENCY_NAMES = {
  USD: 'US Dollars', EUR: 'Euros', GBP: 'Pounds Sterling', AED: 'UAE Dirhams',
  SAR: 'Saudi Riyals', CAD: 'Canadian Dollars', AUD: 'Australian Dollars',
  CHF: 'Swiss Francs', JPY: 'Japanese Yen', SGD: 'Singapore Dollars',
};

const _numWords = (n) => {
  if (n === 0) return '';
  if (n < 20) return ONES[n];
  if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? ' ' + ONES[n % 10] : '');
  if (n < 1000) return ONES[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + _numWords(n % 100) : '');
  if (n < 1e6) return _numWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + _numWords(n % 1000) : '');
  if (n < 1e9) return _numWords(Math.floor(n / 1e6)) + ' Million' + (n % 1e6 ? ' ' + _numWords(n % 1e6) : '');
  return _numWords(Math.floor(n / 1e9)) + ' Billion' + (n % 1e9 ? ' ' + _numWords(n % 1e9) : '');
};

const amountInWords = (amount, currency = '') => {
  const n = Math.abs(Number(amount) || 0);
  const whole = Math.floor(n);
  const cents = Math.round((n - whole) * 100);
  const currencyName = CURRENCY_NAMES[currency] || currency;
  const words = whole === 0 ? 'Zero' : _numWords(whole);
  return cents > 0
    ? `${words} ${currencyName} and ${String(cents).padStart(2, '0')}/100`
    : `${words} ${currencyName} Only`;
};

const fmt = (n, currency = '') =>
  `${currency} ${Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`.trim();

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

const fmtDateTime = (d) => d ? new Date(d).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

const formatBytes = (bytes) => {
  if (!bytes) return '0 B';
  const n = Number(bytes);
  if (n < 1024) return `${n} B`;
  if (n < 1048576) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1048576).toFixed(1)} MB`;
};

function InfoRow({ label, value }) {
  return (
    <div className="py-2.5 flex items-start justify-between border-b border-tetri-border/60 last:border-0">
      <span className="text-xs text-tetri-neutral w-40 shrink-0">{label}</span>
      <span className="text-sm text-tetri-text text-right">{value || '—'}</span>
    </div>
  );
}

function SectionCard({ title, children }) {
  return (
    <div className="bg-white border border-tetri-border rounded-xl p-5">
      <h3 className="text-sm font-semibold text-tetri-text mb-3">{title}</h3>
      {children}
    </div>
  );
}

const TABS = ['Overview', 'Line Items', 'Delivery History', 'Attachments'];

export default function InvoiceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast, ToastContainer } = useToast();

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Overview');

  const [actionLoading, setActionLoading] = useState('');
  const [showSend, setShowSend] = useState(false);
  const [voidDialog, setVoidDialog] = useState(false);
  const [voidReason, setVoidReason] = useState('');
  const [cancelDialog, setCancelDialog] = useState(false);


  const load = useCallback(async () => {
    try {
      const inv = await getInvoice(id);
      setInvoice(inv);
    } catch {
      showToast('error', 'Invoice not found');
      navigate('/invoices');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const doAction = async (fn, label, extra = {}) => {
    setActionLoading(label);
    try {
      const updated = await fn();
      setInvoice(updated);
      showToast('success', `Invoice ${label}`);
    } catch (err) {
      showToast('error', err.response?.data?.message || `Failed to ${label} invoice`);
    } finally {
      setActionLoading('');
    }
    return null;
  };

  const handleIssue    = () => doAction(() => issueInvoice(id), 'issued');
  const handleCancel   = async () => { setCancelDialog(false); await doAction(() => cancelInvoice(id), 'cancelled'); };
  const handleVoid     = async () => {
    if (!voidReason.trim()) return;
    setVoidDialog(false);
    await doAction(() => voidInvoice(id, voidReason), 'voided');
    setVoidReason('');
  };
  const handleDuplicate = async () => {
    setActionLoading('duplicate');
    try {
      const newInv = await duplicateInvoice(id);
      showToast('success', 'Invoice duplicated');
      navigate(`/invoices/${newInv.id}`);
    } catch {
      showToast('error', 'Failed to duplicate');
    } finally {
      setActionLoading('');
    }
  };
  const handleDownload = async () => {
    setActionLoading('pdf');
    try {
      await downloadInvoicePdf(id, invoice.invoiceNumber);
    } catch {
      showToast('error', 'Failed to download PDF');
    } finally {
      setActionLoading('');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-tetri-primary" />
      </div>
    );
  }

  if (!invoice) return null;

  const isEditable   = invoice.status === 'draft';
  const canIssue     = invoice.status === 'draft';
  const canSend      = ['issued', 'sent'].includes(invoice.status);
  const canCancel    = ['draft', 'issued', 'sent'].includes(invoice.status);
  const canVoid      = ['issued', 'sent', 'overdue'].includes(invoice.status);
  const isTerminal   = ['paid', 'cancelled', 'void'].includes(invoice.status);

  const outstandingBalance = Math.max(0, Number(invoice.totalAmount || 0) - Number(invoice.paidAmount || 0));
  const canRecordPayment = outstandingBalance > 0 && ['issued', 'sent', 'partially_paid', 'overdue'].includes(invoice.status);
  const recordPaymentUrl = `/payments/new?customerId=${invoice.customer?.id}&invoiceId=${invoice.id}&amount=${outstandingBalance.toFixed(2)}&currencyCode=${invoice.currencyCode || 'USD'}`;

  return (
    <div className="space-y-6">
      {ToastContainer}
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/invoices')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold text-tetri-text">{invoice.invoiceNumber}</h1>
              <InvoiceStatusBadge status={invoice.status} size="lg" />
            </div>
            <p className="text-sm text-tetri-neutral mt-0.5">
              {invoice.customer?.name} · {fmtDate(invoice.issueDate)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-end">
          {canIssue && (
            <Button size="sm" onClick={handleIssue} disabled={!!actionLoading} className="gap-1.5">
              {actionLoading === 'issued' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
              Issue
            </Button>
          )}
          {canSend && (
            <Button size="sm" onClick={() => setShowSend(true)} disabled={!!actionLoading} className="gap-1.5">
              <Send className="w-3.5 h-3.5" />
              Send
            </Button>
          )}
          {isEditable && (
            <Button size="sm" variant="outline" onClick={() => navigate(`/invoices/${id}/edit`)} className="gap-1.5">
              <Edit className="w-3.5 h-3.5" />
              Edit
            </Button>
          )}
          {canRecordPayment && (
            <Button size="sm" variant="outline" onClick={() => navigate(recordPaymentUrl)} disabled={!!actionLoading} className="gap-1.5 text-emerald-700 border-emerald-200 hover:bg-emerald-50">
              <CreditCard className="w-3.5 h-3.5" />
              Record Payment
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={handleDownload} disabled={!!actionLoading} className="gap-1.5">
            {actionLoading === 'pdf' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            PDF
          </Button>
          <Button size="sm" variant="outline" onClick={handleDuplicate} disabled={!!actionLoading} className="gap-1.5">
            {actionLoading === 'duplicate' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Copy className="w-3.5 h-3.5" />}
            Duplicate
          </Button>
          {canCancel && (
            <Button size="sm" variant="outline" onClick={() => setCancelDialog(true)} disabled={!!actionLoading} className="gap-1.5 text-amber-600 border-amber-200 hover:bg-amber-50">
              <XCircle className="w-3.5 h-3.5" />
              Cancel
            </Button>
          )}
          {canVoid && (
            <Button size="sm" variant="outline" onClick={() => setVoidDialog(true)} disabled={!!actionLoading} className="gap-1.5 text-tetri-error border-red-200 hover:bg-red-50">
              <Ban className="w-3.5 h-3.5" />
              Void
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-tetri-border">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-tetri-primary text-tetri-primary'
                : 'border-transparent text-tetri-neutral hover:text-tetri-text'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'Overview' && <OverviewTab invoice={invoice} />}
      {activeTab === 'Line Items' && <LineItemsTab invoice={invoice} />}
      {activeTab === 'Delivery History' && <DeliveryTab invoice={invoice} />}
      {activeTab === 'Attachments' && (
        <AttachmentsPanel entityType="invoice" entityId={id} />
      )}

      {/* Dialogs */}
      {showSend && (
        <SendInvoiceDialog
          invoice={invoice}
          onClose={() => setShowSend(false)}
          onSent={() => load()}
          onToast={(type, msg) => showToast(type, msg)}
        />
      )}

      <ConfirmDialog
        open={cancelDialog}
        title="Cancel Invoice"
        description={`Cancel invoice ${invoice.invoiceNumber}? This will mark it as cancelled.`}
        confirmLabel="Cancel Invoice"
        variant="destructive"
        onConfirm={handleCancel}
        onCancel={() => setCancelDialog(false)}
      />


      {/* Void dialog (custom — needs reason input) */}
      {voidDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4">
            <div className="px-6 py-4 border-b border-tetri-border">
              <h2 className="text-base font-semibold text-tetri-text">Void Invoice</h2>
            </div>
            <div className="px-6 py-5 space-y-3">
              <p className="text-sm text-tetri-neutral">Provide a reason for voiding invoice {invoice.invoiceNumber}.</p>
              <textarea
                rows={3}
                value={voidReason}
                onChange={(e) => setVoidReason(e.target.value)}
                placeholder="Reason for voiding…"
                className="w-full border border-tetri-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tetri-primary/20 focus:border-tetri-primary resize-none"
              />
            </div>
            <div className="px-6 py-4 border-t border-tetri-border flex justify-end gap-3">
              <Button variant="outline" onClick={() => { setVoidDialog(false); setVoidReason(''); }}>Cancel</Button>
              <Button
                onClick={handleVoid}
                disabled={!voidReason.trim()}
                className="bg-tetri-error hover:bg-red-700 text-white gap-2"
              >
                <Ban className="w-4 h-4" />
                Void Invoice
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Tab components ─────────────────────────────────────────

function OverviewTab({ invoice }) {
  return (
    <div className="grid grid-cols-2 gap-5">
      <SectionCard title="Invoice Details">
        <InfoRow label="Invoice Number" value={invoice.invoiceNumber} />
        <InfoRow label="Status" value={<InvoiceStatusBadge status={invoice.status} />} />
        <InfoRow label="Issue Date" value={fmtDate(invoice.issueDate)} />
        <InfoRow label="Due Date" value={fmtDate(invoice.dueDate)} />
        <InfoRow label="Currency" value={invoice.currencyCode} />
        {invoice.referenceNumber && <InfoRow label="Reference" value={invoice.referenceNumber} />}
        {invoice.poNumber && <InfoRow label="PO Number" value={invoice.poNumber} />}
        {invoice.customerReference && <InfoRow label="Customer Ref" value={invoice.customerReference} />}
      </SectionCard>

      <SectionCard title="Customer">
        <InfoRow label="Name" value={invoice.customer?.name} />
        <InfoRow label="Code" value={invoice.customer?.customerCode} />
        <InfoRow label="Email" value={invoice.customer?.email} />
        <InfoRow label="Phone" value={invoice.customer?.phone} />
        {invoice.customer?.taxNumber && <InfoRow label="Tax Number" value={invoice.customer.taxNumber} />}
      </SectionCard>

      <SectionCard title="Amounts">
        <InfoRow label="Subtotal" value={fmt(invoice.subtotal, invoice.currencyCode)} />
        {Number(invoice.discountTotal) > 0 && (
          <InfoRow label="Discount" value={`-${fmt(invoice.discountTotal, invoice.currencyCode)}`} />
        )}
        {Number(invoice.taxTotal) > 0 && (
          <InfoRow label="Tax" value={fmt(invoice.taxTotal, invoice.currencyCode)} />
        )}
        <InfoRow label="Total Due" value={<span className="font-bold text-tetri-primary">{fmt(invoice.totalAmount, invoice.currencyCode)}</span>} />
        <div className="pt-3 border-t border-tetri-border/60 mt-1">
          <p className="text-xs text-tetri-neutral mb-0.5">Amount in Words</p>
          <p className="text-sm font-medium text-tetri-text italic">{amountInWords(invoice.totalAmount, invoice.currencyCode)}</p>
        </div>
      </SectionCard>

      {(invoice.notes || invoice.terms) && (
        <SectionCard title="Notes & Terms">
          {invoice.notes && <InfoRow label="Notes" value={invoice.notes} />}
          {invoice.terms && <InfoRow label="Terms" value={invoice.terms} />}
        </SectionCard>
      )}

      {invoice.statusHistory?.length > 0 && (
        <div className="col-span-2">
          <SectionCard title="Status History">
            <div className="space-y-2">
              {invoice.statusHistory.map((h) => (
                <div key={h.id} className="flex items-center justify-between text-sm py-1.5 border-b border-tetri-border/60 last:border-0">
                  <div className="flex items-center gap-2">
                    {h.fromStatus && <InvoiceStatusBadge status={h.fromStatus} />}
                    {h.fromStatus && <span className="text-tetri-neutral">→</span>}
                    <InvoiceStatusBadge status={h.toStatus} />
                    {h.reason && <span className="text-tetri-neutral text-xs">· {h.reason}</span>}
                  </div>
                  <span className="text-xs text-tetri-neutral">{fmtDateTime(h.createdAt)}</span>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      )}
    </div>
  );
}

function LineItemsTab({ invoice }) {
  return (
    <div className="bg-white border border-tetri-border rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-tetri-border bg-tetri-bg">
            {['Description', 'Qty', 'Unit Price', 'Disc%', 'Tax%', 'Total'].map((h, i) => (
              <th key={h} className={`px-4 py-3 text-xs font-semibold text-tetri-neutral uppercase tracking-wide ${i > 0 ? 'text-right' : 'text-left'}`}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(invoice.items || []).map((item, idx) => (
            <tr key={item.id || idx} className="border-b border-tetri-border last:border-0">
              <td className="px-4 py-3 text-tetri-text">{item.description}</td>
              <td className="px-4 py-3 text-right tabular-nums text-tetri-neutral">{Number(item.quantity).toFixed(2)}</td>
              <td className="px-4 py-3 text-right tabular-nums text-tetri-neutral">{fmt(item.unitPrice)}</td>
              <td className="px-4 py-3 text-right tabular-nums text-tetri-neutral">{Number(item.discountRate).toFixed(1)}%</td>
              <td className="px-4 py-3 text-right tabular-nums text-tetri-neutral">{Number(item.taxRate).toFixed(1)}%</td>
              <td className="px-4 py-3 text-right tabular-nums font-semibold text-tetri-text">{fmt(item.lineTotal, invoice.currencyCode)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot className="border-t-2 border-tetri-border bg-tetri-bg">
          <tr>
            <td colSpan={5} className="px-4 py-2.5 text-right text-sm font-medium text-tetri-neutral">Subtotal</td>
            <td className="px-4 py-2.5 text-right tabular-nums font-semibold text-tetri-text">{fmt(invoice.subtotal, invoice.currencyCode)}</td>
          </tr>
          {Number(invoice.discountTotal) > 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-2 text-right text-sm text-tetri-neutral">Discount</td>
              <td className="px-4 py-2 text-right tabular-nums text-tetri-error">-{fmt(invoice.discountTotal, invoice.currencyCode)}</td>
            </tr>
          )}
          {Number(invoice.taxTotal) > 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-2 text-right text-sm text-tetri-neutral">Tax</td>
              <td className="px-4 py-2 text-right tabular-nums text-tetri-neutral">{fmt(invoice.taxTotal, invoice.currencyCode)}</td>
            </tr>
          )}
          <tr className="border-t border-tetri-border">
            <td colSpan={5} className="px-4 py-3 text-right font-semibold text-tetri-text">Total Due</td>
            <td className="px-4 py-3 text-right tabular-nums font-bold text-tetri-primary text-base">{fmt(invoice.totalAmount, invoice.currencyCode)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

function DeliveryTab({ invoice }) {
  const logs = invoice.deliveryLogs || [];
  if (logs.length === 0) {
    return (
      <div className="py-16 text-center space-y-2">
        <Send className="w-8 h-8 text-tetri-border mx-auto" />
        <p className="text-sm text-tetri-neutral">No delivery history yet</p>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {logs.map((log) => (
        <div key={log.id} className="bg-white border border-tetri-border rounded-xl px-5 py-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-sm font-medium text-tetri-text">Sent to {log.recipientEmail}</p>
              {log.ccEmails && <p className="text-xs text-tetri-neutral">CC: {log.ccEmails}</p>}
              {log.subject && <p className="text-xs text-tetri-neutral">{log.subject}</p>}
            </div>
            <div className="text-right space-y-1">
              <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                log.status === 'sent'    ? 'bg-emerald-50 text-emerald-700' :
                log.status === 'failed'  ? 'bg-red-50 text-red-700' :
                'bg-slate-100 text-slate-600'
              }`}>{log.status}</span>
              <p className="text-xs text-tetri-neutral">{fmtDateTime(log.createdAt)}</p>
            </div>
          </div>
          {log.errorMessage && (
            <p className="mt-2 text-xs text-tetri-error bg-red-50 rounded-lg px-3 py-1.5">{log.errorMessage}</p>
          )}
        </div>
      ))}
    </div>
  );
}

