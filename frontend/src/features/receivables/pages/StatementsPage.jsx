import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FileText, Printer, Download } from 'lucide-react';
import { generateStatement, listStatements } from '../services/receivablesService';
import api from '../../../lib/api';
import { useToast } from '../../../components/shared/Toast.jsx';

const STATEMENT_TYPES = [
  { value: 'full', label: 'Full Statement' },
  { value: 'outstanding', label: 'Outstanding Only' },
  { value: 'payment', label: 'Payment Activity' },
];

const PERIODS = [
  { value: 'current_month', label: 'Current Month' },
  { value: 'previous_month', label: 'Previous Month' },
  { value: 'quarter', label: 'This Quarter' },
  { value: 'year', label: 'This Year' },
  { value: 'custom', label: 'Custom Range' },
];

const getDateRange = (period) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  switch (period) {
    case 'current_month':
      return {
        start: new Date(year, month, 1).toISOString().split('T')[0],
        end:   new Date(year, month + 1, 0).toISOString().split('T')[0],
      };
    case 'previous_month':
      return {
        start: new Date(year, month - 1, 1).toISOString().split('T')[0],
        end:   new Date(year, month, 0).toISOString().split('T')[0],
      };
    case 'quarter': {
      const q = Math.floor(month / 3);
      return {
        start: new Date(year, q * 3, 1).toISOString().split('T')[0],
        end:   new Date(year, q * 3 + 3, 0).toISOString().split('T')[0],
      };
    }
    case 'year':
      return {
        start: `${year}-01-01`,
        end:   `${year}-12-31`,
      };
    default:
      return { start: '', end: '' };
  }
};

const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n || 0);
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

export default function StatementsPage() {
  const [searchParams] = useSearchParams();
  const preCustomerId = searchParams.get('customerId') || '';
  const { showToast, ToastContainer } = useToast();

  const [customers, setCustomers]       = useState([]);
  const [statement, setStatement]       = useState(null);
  const [history, setHistory]           = useState(null);
  const [loading, setLoading]           = useState(false);
  const [tab, setTab]                   = useState('generate');

  const [form, setForm] = useState({
    customerId: preCustomerId,
    statementType: 'full',
    period: 'current_month',
    periodStart: '',
    periodEnd: '',
  });

  useEffect(() => {
    api.get('/api/v1/customers', { params: { status: 'active', limit: 200 } })
      .then(r => setCustomers(r.data?.data?.items || []))
      .catch(() => {});
    listStatements({}).then(setHistory).catch(() => {});
  }, []);

  useEffect(() => {
    if (form.period !== 'custom') {
      const { start, end } = getDateRange(form.period);
      setForm(f => ({ ...f, periodStart: start, periodEnd: end }));
    }
  }, [form.period]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!form.customerId) { showToast('error', 'Please select a customer'); return; }
    if (!form.periodStart || !form.periodEnd) { showToast('error', 'Please select a date range'); return; }
    setLoading(true);
    try {
      const data = await generateStatement({
        customerId: form.customerId,
        periodStart: form.periodStart,
        periodEnd: form.periodEnd,
        statementType: form.statementType,
        save: true,
      });
      setStatement(data);
      listStatements({}).then(setHistory).catch(() => {});
    } catch {
      showToast('error', 'Failed to generate statement');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => window.print();

  return (
    <div className="space-y-6">
      {ToastContainer}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-tetri-text">Statements</h1>
          <p className="text-sm text-tetri-muted mt-0.5">Generate customer account statements</p>
        </div>
        {statement && (
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 text-sm border border-tetri-border rounded-lg hover:bg-tetri-bg transition-colors print:hidden"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-tetri-border print:hidden">
        <div className="flex gap-6">
          {[{ key: 'generate', label: 'Generate' }, { key: 'history', label: 'History' }].map(t => (
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

      {tab === 'generate' && (
        <>
          {/* Form */}
          <form onSubmit={handleGenerate} className="bg-tetri-surface border border-tetri-border rounded-card p-6 print:hidden">
            <h2 className="font-semibold text-tetri-text mb-4">Statement Options</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-medium text-tetri-muted mb-1 block">Customer *</label>
                <select
                  required
                  value={form.customerId}
                  onChange={e => setForm(f => ({ ...f, customerId: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-tetri-border rounded-lg bg-tetri-surface focus:outline-none focus:ring-2 focus:ring-tetri-blue/20"
                >
                  <option value="">Select customer...</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-tetri-muted mb-1 block">Statement Type</label>
                <select
                  value={form.statementType}
                  onChange={e => setForm(f => ({ ...f, statementType: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-tetri-border rounded-lg bg-tetri-surface focus:outline-none focus:ring-2 focus:ring-tetri-blue/20"
                >
                  {STATEMENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-tetri-muted mb-1 block">Period</label>
                <select
                  value={form.period}
                  onChange={e => setForm(f => ({ ...f, period: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-tetri-border rounded-lg bg-tetri-surface focus:outline-none focus:ring-2 focus:ring-tetri-blue/20"
                >
                  {PERIODS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>
              {form.period === 'custom' ? (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-medium text-tetri-muted mb-1 block">From</label>
                    <input
                      type="date"
                      value={form.periodStart}
                      onChange={e => setForm(f => ({ ...f, periodStart: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-tetri-border rounded-lg bg-tetri-surface focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-tetri-muted mb-1 block">To</label>
                    <input
                      type="date"
                      value={form.periodEnd}
                      onChange={e => setForm(f => ({ ...f, periodEnd: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-tetri-border rounded-lg bg-tetri-surface focus:outline-none"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-white bg-tetri-blue rounded-lg hover:bg-tetri-blue-hover disabled:opacity-50 transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    {loading ? 'Generating...' : 'Generate Statement'}
                  </button>
                </div>
              )}
            </div>
            {form.period === 'custom' && (
              <div className="mt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-tetri-blue rounded-lg hover:bg-tetri-blue-hover disabled:opacity-50"
                >
                  <FileText className="w-4 h-4" />
                  {loading ? 'Generating...' : 'Generate Statement'}
                </button>
              </div>
            )}
          </form>

          {/* Statement preview */}
          {statement && <StatementPreview data={statement} />}

          {!statement && !loading && (
            <div className="bg-tetri-surface border border-tetri-border rounded-card p-16 text-center print:hidden">
              <FileText className="w-10 h-10 text-tetri-muted mx-auto mb-3" />
              <p className="text-tetri-muted">Select a customer and period above to generate a statement</p>
            </div>
          )}
        </>
      )}

      {tab === 'history' && (
        <div className="bg-tetri-surface border border-tetri-border rounded-card overflow-hidden print:hidden">
          {!history || history.items.length === 0 ? (
            <p className="text-sm text-tetri-muted text-center py-10">No statements generated yet</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-tetri-bg border-b border-tetri-border">
                <tr>
                  <th className="text-left font-medium text-tetri-muted px-4 py-3">Customer</th>
                  <th className="text-left font-medium text-tetri-muted px-4 py-3">Type</th>
                  <th className="text-left font-medium text-tetri-muted px-4 py-3">Period</th>
                  <th className="text-left font-medium text-tetri-muted px-4 py-3">Generated</th>
                </tr>
              </thead>
              <tbody>
                {history.items.map((s) => (
                  <tr key={s.id} className="border-b border-tetri-border hover:bg-tetri-bg">
                    <td className="px-4 py-3 font-medium text-tetri-text">{s.customer?.name}</td>
                    <td className="px-4 py-3 text-tetri-muted capitalize">{s.statementType?.replace('_', ' ')}</td>
                    <td className="px-4 py-3 text-tetri-muted">{fmtDate(s.periodStart)} – {fmtDate(s.periodEnd)}</td>
                    <td className="px-4 py-3 text-tetri-muted">{fmtDate(s.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

function StatementPreview({ data }) {
  const { customer, company, periodStart, periodEnd, statementType, transactions, openInvoices, summary, generatedAt } = data;

  return (
    <div className="bg-white border border-tetri-border rounded-card p-8 text-sm print:border-none print:p-0 print:rounded-none">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{company?.companyName}</h2>
          {company?.addressLine1 && <p className="text-gray-500 text-xs mt-1">{company.addressLine1}</p>}
          {company?.city && <p className="text-gray-500 text-xs">{company.city}</p>}
          {company?.email && <p className="text-gray-500 text-xs">{company.email}</p>}
        </div>
        <div className="text-right">
          <h1 className="text-2xl font-bold text-gray-900">STATEMENT</h1>
          <p className="text-gray-500 text-xs mt-1">Generated: {fmtDate(generatedAt)}</p>
          <p className="text-gray-500 text-xs">Period: {fmtDate(periodStart)} – {fmtDate(periodEnd)}</p>
          <p className="text-gray-500 text-xs capitalize">Type: {statementType?.replace('_', ' ')}</p>
        </div>
      </div>

      {/* Customer */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Prepared for</p>
        <p className="font-semibold text-gray-900">{customer?.name}</p>
        {customer?.customerCode && <p className="text-gray-500 text-xs">{customer.customerCode}</p>}
        {customer?.email && <p className="text-gray-500 text-xs">{customer.email}</p>}
        {customer?.addressLine1 && <p className="text-gray-500 text-xs">{customer.addressLine1}, {customer.city}</p>}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-400 mb-1">Total Invoiced</p>
          <p className="font-bold text-gray-900">{fmt(summary?.totalInvoiced)}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-400 mb-1">Total Paid</p>
          <p className="font-bold text-green-700">{fmt(summary?.totalPaid)}</p>
        </div>
        <div className={`rounded-lg p-3 text-center ${summary?.outstandingBalance > 0 ? 'bg-red-50' : 'bg-green-50'}`}>
          <p className="text-xs text-gray-400 mb-1">Outstanding</p>
          <p className={`font-bold ${summary?.outstandingBalance > 0 ? 'text-red-700' : 'text-green-700'}`}>
            {fmt(summary?.outstandingBalance)}
          </p>
        </div>
      </div>

      {/* Transactions */}
      {statementType !== 'outstanding' && transactions?.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Transactions</h3>
          <table className="w-full text-xs">
            <thead className="border-b-2 border-gray-200">
              <tr>
                <th className="text-left py-2 text-gray-500 font-medium">Date</th>
                <th className="text-left py-2 text-gray-500 font-medium">Reference</th>
                <th className="text-left py-2 text-gray-500 font-medium">Type</th>
                <th className="text-right py-2 text-gray-500 font-medium">Debit</th>
                <th className="text-right py-2 text-gray-500 font-medium">Credit</th>
                <th className="text-right py-2 text-gray-500 font-medium">Balance</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t, i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="py-2 text-gray-600">{fmtDate(t.date)}</td>
                  <td className="py-2 text-gray-900 font-medium">{t.reference}</td>
                  <td className="py-2 text-gray-500 capitalize">{t.type}</td>
                  <td className="py-2 text-right text-gray-900">{t.debit > 0 ? fmt(t.debit) : '—'}</td>
                  <td className="py-2 text-right text-green-700">{t.credit > 0 ? fmt(t.credit) : '—'}</td>
                  <td className={`py-2 text-right font-semibold ${t.balance > 0 ? 'text-red-700' : 'text-green-700'}`}>
                    {fmt(Math.abs(t.balance))} {t.balance > 0 ? 'DR' : t.balance < 0 ? 'CR' : ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Open Invoices */}
      {openInvoices?.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Outstanding Invoices</h3>
          <table className="w-full text-xs">
            <thead className="border-b-2 border-gray-200">
              <tr>
                <th className="text-left py-2 text-gray-500 font-medium">Invoice #</th>
                <th className="text-left py-2 text-gray-500 font-medium">Issue Date</th>
                <th className="text-left py-2 text-gray-500 font-medium">Due Date</th>
                <th className="text-right py-2 text-gray-500 font-medium">Amount</th>
                <th className="text-right py-2 text-gray-500 font-medium">Outstanding</th>
              </tr>
            </thead>
            <tbody>
              {openInvoices.map((inv) => (
                <tr key={inv.id} className="border-b border-gray-100">
                  <td className="py-2 font-medium text-gray-900">{inv.invoiceNumber}</td>
                  <td className="py-2 text-gray-600">{fmtDate(inv.issueDate)}</td>
                  <td className="py-2 text-gray-600">{fmtDate(inv.dueDate)}</td>
                  <td className="py-2 text-right text-gray-900">{fmt(inv.totalAmount)}</td>
                  <td className="py-2 text-right font-semibold text-red-700">{fmt(inv.outstanding)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer */}
      <div className="border-t-2 border-gray-900 pt-4 text-right">
        <p className="text-base font-bold text-gray-900">Total Outstanding: {fmt(summary?.outstandingBalance)}</p>
        {summary?.creditBalance > 0 && (
          <p className="text-sm text-gray-600 mt-1">Available Credit: {fmt(summary?.creditBalance)}</p>
        )}
      </div>

      <div className="mt-8 text-xs text-gray-400 text-center print:mt-12">
        This statement was generated on {fmtDate(generatedAt)} by {company?.companyName}.
        For queries, contact {company?.email || 'your account manager'}.
      </div>
    </div>
  );
}
