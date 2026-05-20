import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';
import { getCustomerReceivables } from '../services/receivablesService';
import { useToast } from '../../../components/shared/Toast.jsx';

const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n || 0);
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

export default function CustomerReceivablesListPage() {
  const navigate = useNavigate();
  const { showToast, ToastContainer } = useToast();
  const [data, setData]     = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage]     = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getCustomerReceivables({ search, page, limit: 25 });
      setData(result);
    } catch {
      showToast('error', 'Failed to load customer balances');
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-6">
      {ToastContainer}

      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/receivables')} className="p-1.5 rounded-lg text-tetri-muted hover:bg-tetri-bg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-tetri-text">Customer Balances</h1>
          <p className="text-sm text-tetri-muted mt-0.5">{data.total} customers with outstanding balances</p>
        </div>
      </div>

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tetri-muted" />
        <input
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search customers..."
          className="w-full pl-9 pr-3 py-2 text-sm border border-tetri-border rounded-lg bg-tetri-surface focus:outline-none focus:ring-2 focus:ring-tetri-blue/20"
        />
      </div>

      <div className="bg-tetri-surface border border-tetri-border rounded-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-tetri-bg border-b border-tetri-border">
            <tr>
              <th className="text-left font-medium text-tetri-muted px-4 py-3">Customer</th>
              <th className="text-right font-medium text-tetri-muted px-4 py-3">Total Balance</th>
              <th className="text-right font-medium text-tetri-muted px-4 py-3">Overdue</th>
              <th className="text-right font-medium text-tetri-muted px-4 py-3">Open Invoices</th>
              <th className="text-left font-medium text-tetri-muted px-4 py-3">Last Payment</th>
              <th className="text-right font-medium text-tetri-muted px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="border-b border-tetri-border">
                  {Array.from({ length: 6 }).map((__, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-4 bg-tetri-bg animate-pulse rounded" /></td>
                  ))}
                </tr>
              ))
            ) : data.items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-tetri-muted">
                  {search ? 'No customers match your search' : 'No outstanding balances'}
                </td>
              </tr>
            ) : data.items.map((c) => (
              <tr
                key={c.id}
                className="border-b border-tetri-border hover:bg-tetri-bg cursor-pointer transition-colors"
                onClick={() => navigate(`/receivables/customers/${c.id}`)}
              >
                <td className="px-4 py-3">
                  <p className="font-medium text-tetri-text">{c.name}</p>
                  <p className="text-xs text-tetri-muted">{c.customerCode}</p>
                </td>
                <td className="px-4 py-3 text-right font-semibold text-tetri-text">{fmt(c.totalBalance)}</td>
                <td className="px-4 py-3 text-right">
                  {c.overdueBalance > 0 ? (
                    <span className="text-red-600 font-medium">{fmt(c.overdueBalance)}</span>
                  ) : (
                    <span className="text-tetri-muted">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right text-tetri-muted">{c.openInvoiceCount}</td>
                <td className="px-4 py-3 text-tetri-muted">{fmtDate(c.lastPaymentDate)}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate(`/statements?customerId=${c.id}`); }}
                    className="text-xs text-tetri-blue hover:underline"
                  >
                    Statement
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 text-sm border border-tetri-border rounded-lg disabled:opacity-50 hover:bg-tetri-bg">
            Previous
          </button>
          <span className="text-sm text-tetri-muted">Page {page} of {data.pages}</span>
          <button onClick={() => setPage(p => Math.min(data.pages, p + 1))} disabled={page === data.pages} className="px-3 py-1.5 text-sm border border-tetri-border rounded-lg disabled:opacity-50 hover:bg-tetri-bg">
            Next
          </button>
        </div>
      )}
    </div>
  );
}
