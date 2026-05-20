import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Phone, Mail, CreditCard, FileText, Activity } from 'lucide-react';
import { getCustomerProfile } from '../services/receivablesService';
import { useToast } from '../../../components/shared/Toast.jsx';

const BUCKET_CFG = {
  current:   { label: 'Current',     bg: 'bg-emerald-50 text-emerald-700' },
  '1_30':    { label: '1–30 Days',   bg: 'bg-yellow-50 text-yellow-700' },
  '31_60':   { label: '31–60 Days',  bg: 'bg-orange-50 text-orange-700' },
  '61_90':   { label: '61–90 Days',  bg: 'bg-red-50 text-red-600' },
  '91_120':  { label: '91–120 Days', bg: 'bg-red-100 text-red-800' },
  '120_plus':{ label: '120+ Days',   bg: 'bg-red-200 text-red-900' },
};

const ACTIVITY_LABELS = {
  phone_call: 'Phone Call', email: 'Email', meeting: 'Meeting',
  reminder: 'Reminder', escalation: 'Escalation', site_visit: 'Site Visit', other: 'Other',
};

const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n || 0);
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

export default function CustomerReceivablePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast, ToastContainer } = useToast();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('invoices');

  useEffect(() => {
    getCustomerProfile(id)
      .then(setProfile)
      .catch(() => showToast('error', 'Failed to load customer profile'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-48 bg-tetri-surface rounded-lg animate-pulse" />
        <div className="h-40 bg-tetri-surface rounded-card animate-pulse" />
      </div>
    );
  }

  if (!profile) {
    return <p className="text-tetri-muted text-center py-20">Customer not found</p>;
  }

  const { customer, summary, openInvoices, recentPayments, recentCollections } = profile;

  return (
    <div className="space-y-6">
      {ToastContainer}

      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/receivables')} className="p-1.5 rounded-lg text-tetri-muted hover:bg-tetri-bg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-tetri-text">{customer.name}</h1>
          <p className="text-sm text-tetri-muted">{customer.customerCode}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/statements?customerId=${customer.id}`)}
            className="flex items-center gap-1.5 px-3 py-2 text-sm border border-tetri-border rounded-lg hover:bg-tetri-bg transition-colors"
          >
            <FileText className="w-4 h-4" />
            Statement
          </button>
          <button
            onClick={() => navigate(`/collections/new?customerId=${customer.id}`)}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-white bg-tetri-blue rounded-lg hover:bg-tetri-blue-hover transition-colors"
          >
            <Activity className="w-4 h-4" />
            Log Activity
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-tetri-surface border border-tetri-border rounded-card p-4">
          <p className="text-xs text-tetri-muted font-medium uppercase tracking-wide">Total Balance</p>
          <p className="text-2xl font-bold text-tetri-text mt-1">{fmt(summary.totalBalance)}</p>
        </div>
        <div className={`bg-tetri-surface border rounded-card p-4 ${summary.overdueBalance > 0 ? 'border-red-200' : 'border-tetri-border'}`}>
          <p className="text-xs text-tetri-muted font-medium uppercase tracking-wide">Overdue</p>
          <p className={`text-2xl font-bold mt-1 ${summary.overdueBalance > 0 ? 'text-red-600' : 'text-tetri-text'}`}>{fmt(summary.overdueBalance)}</p>
        </div>
        <div className="bg-tetri-surface border border-tetri-border rounded-card p-4">
          <p className="text-xs text-tetri-muted font-medium uppercase tracking-wide">Credit Balance</p>
          <p className="text-2xl font-bold text-tetri-text mt-1">{fmt(summary.creditBalance)}</p>
        </div>
        <div className="bg-tetri-surface border border-tetri-border rounded-card p-4">
          <p className="text-xs text-tetri-muted font-medium uppercase tracking-wide">Open Invoices</p>
          <p className="text-2xl font-bold text-tetri-text mt-1">{summary.openInvoiceCount}</p>
        </div>
      </div>

      {/* Customer info */}
      <div className="bg-tetri-surface border border-tetri-border rounded-card p-5">
        <h2 className="font-semibold text-tetri-text mb-3">Contact Information</h2>
        <div className="flex flex-wrap gap-4 text-sm text-tetri-muted">
          {customer.email && <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" />{customer.email}</span>}
          {customer.phone && <span className="flex items-center gap-1.5"><Phone className="w-4 h-4" />{customer.phone}</span>}
          {customer.city && <span>{[customer.addressLine1, customer.city, customer.country].filter(Boolean).join(', ')}</span>}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-tetri-border">
        <div className="flex gap-6">
          {[
            { key: 'invoices', label: `Open Invoices (${openInvoices.length})` },
            { key: 'payments', label: 'Recent Payments' },
            { key: 'collections', label: 'Collection Activity' },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                tab === t.key ? 'border-tetri-blue text-tetri-blue' : 'border-transparent text-tetri-muted hover:text-tetri-text'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === 'invoices' && (
        <div className="bg-tetri-surface border border-tetri-border rounded-card overflow-hidden">
          {openInvoices.length === 0 ? (
            <p className="text-sm text-tetri-muted text-center py-10">No open invoices</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-tetri-bg border-b border-tetri-border">
                <tr>
                  <th className="text-left font-medium text-tetri-muted px-4 py-3">Invoice #</th>
                  <th className="text-left font-medium text-tetri-muted px-4 py-3">Issue Date</th>
                  <th className="text-left font-medium text-tetri-muted px-4 py-3">Due Date</th>
                  <th className="text-right font-medium text-tetri-muted px-4 py-3">Outstanding</th>
                  <th className="text-center font-medium text-tetri-muted px-4 py-3">Age</th>
                  <th className="text-right font-medium text-tetri-muted px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {openInvoices.map((inv) => {
                  const cfg = BUCKET_CFG[inv.bucket];
                  return (
                    <tr key={inv.id} className="border-b border-tetri-border hover:bg-tetri-bg">
                      <td className="px-4 py-3 text-tetri-blue font-medium">{inv.invoiceNumber}</td>
                      <td className="px-4 py-3 text-tetri-muted">{fmtDate(inv.issueDate)}</td>
                      <td className="px-4 py-3 text-tetri-muted">{fmtDate(inv.dueDate)}</td>
                      <td className="px-4 py-3 text-right font-semibold text-tetri-text">{fmt(inv.outstanding)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${cfg.bg}`}>
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => navigate(`/invoices/${inv.id}`)}
                          className="text-xs text-tetri-blue hover:underline"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === 'payments' && (
        <div className="bg-tetri-surface border border-tetri-border rounded-card overflow-hidden">
          {recentPayments.length === 0 ? (
            <p className="text-sm text-tetri-muted text-center py-10">No payments recorded</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-tetri-bg border-b border-tetri-border">
                <tr>
                  <th className="text-left font-medium text-tetri-muted px-4 py-3">Payment #</th>
                  <th className="text-left font-medium text-tetri-muted px-4 py-3">Date</th>
                  <th className="text-right font-medium text-tetri-muted px-4 py-3">Amount</th>
                  <th className="text-center font-medium text-tetri-muted px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentPayments.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-tetri-border hover:bg-tetri-bg cursor-pointer"
                    onClick={() => navigate(`/payments/${p.id}`)}
                  >
                    <td className="px-4 py-3 text-tetri-blue font-medium">{p.paymentNumber}</td>
                    <td className="px-4 py-3 text-tetri-muted">{fmtDate(p.paymentDate)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-tetri-text">{fmt(p.amount)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 capitalize">
                        {p.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === 'collections' && (
        <div className="space-y-3">
          {recentCollections.length === 0 ? (
            <div className="bg-tetri-surface border border-tetri-border rounded-card p-10 text-center">
              <p className="text-sm text-tetri-muted mb-3">No collection activities recorded</p>
              <button
                onClick={() => navigate(`/collections/new?customerId=${customer.id}`)}
                className="px-4 py-2 text-sm text-white bg-tetri-blue rounded-lg hover:bg-tetri-blue-hover transition-colors"
              >
                Log First Activity
              </button>
            </div>
          ) : (
            recentCollections.map((a) => (
              <div key={a.id} className="bg-tetri-surface border border-tetri-border rounded-card p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-tetri-text">
                      {ACTIVITY_LABELS[a.activityType] || a.activityType} — {fmtDate(a.activityDate)}
                    </p>
                    {a.notes && <p className="text-sm text-tetri-muted mt-1">{a.notes}</p>}
                    {a.outcome && <p className="text-xs text-tetri-muted mt-0.5">Outcome: {a.outcome}</p>}
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    a.status === 'closed' ? 'bg-tetri-bg text-tetri-muted' :
                    a.status === 'promise_to_pay' ? 'bg-blue-50 text-blue-700' :
                    'bg-yellow-50 text-yellow-700'
                  }`}>{a.status.replace(/_/g, ' ')}</span>
                </div>
                {a.nextFollowUpDate && (
                  <p className="text-xs text-tetri-muted mt-2">
                    Next follow-up: {fmtDate(a.nextFollowUpDate)}
                  </p>
                )}
              </div>
            ))
          )}
          <button
            onClick={() => navigate(`/collections?customerId=${customer.id}`)}
            className="text-sm text-tetri-blue hover:underline"
          >
            View all collection activities →
          </button>
        </div>
      )}
    </div>
  );
}
