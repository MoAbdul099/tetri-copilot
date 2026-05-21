import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Wallet, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PageHeader from '../../../components/shared/PageHeader.jsx';
import { useToast } from '../../../components/shared/Toast.jsx';
import { listReimbursements, getReimbursementDashboard } from '../services/reimbursementsService.js';

const STATUS_STYLES = {
  pending_approval: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  approved:         'bg-green-50 text-green-700 border-green-200',
  rejected:         'bg-red-50 text-red-700 border-red-200',
  partially_paid:   'bg-blue-50 text-blue-700 border-blue-200',
  fully_paid:       'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled:        'bg-gray-50 text-gray-600 border-gray-200',
};

const STATUS_TABS = [
  { value: '', label: 'All' },
  { value: 'pending_approval', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'partially_paid', label: 'Partial' },
  { value: 'fully_paid', label: 'Paid' },
  { value: 'rejected', label: 'Rejected' },
];

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';
const fmtAmt  = (n, c = '') => `${c} ${Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`.trim();

function StatCard({ label, value }) {
  return (
    <div className="bg-white border border-tetri-border rounded-xl p-4">
      <p className="text-xs font-medium text-tetri-neutral uppercase tracking-wide mb-1">{label}</p>
      <p className="text-xl font-bold text-tetri-text">{value}</p>
    </div>
  );
}

export default function ReimbursementsPage() {
  const navigate = useNavigate();
  const { showToast, ToastContainer } = useToast();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusTab, setStatusTab] = useState('');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getReimbursementDashboard().then(setStats).catch(() => {});
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await listReimbursements({ page, limit: 20, status: statusTab || undefined, search: search || undefined });
      setItems(r.items || []);
      setTotal(r.total || 0);
      setPages(r.pages || 1);
    } catch {
      showToast('error', 'Failed to load reimbursements');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusTab]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [search, statusTab]);

  return (
    <div className="space-y-6">
      {ToastContainer}
      <PageHeader title="Reimbursements" subtitle={`${total} request${total !== 1 ? 's' : ''}`} />

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Pending"    value={stats.pending} />
          <StatCard label="Approved"   value={stats.approved} />
          <StatCard label="Paid"       value={stats.fullyPaid} />
          <StatCard label="Outstanding" value={fmtAmt(stats.outstandingAmount)} />
        </div>
      )}

      {/* Status tabs */}
      <div className="flex gap-1 border-b border-tetri-border overflow-x-auto">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusTab(tab.value)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              statusTab === tab.value ? 'border-tetri-primary text-tetri-primary' : 'border-transparent text-tetri-neutral hover:text-tetri-text'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tetri-neutral" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search reimbursements…" className="pl-9" />
      </div>

      {/* Table */}
      <div className="bg-white border border-tetri-border rounded-xl overflow-hidden">
        {loading && items.length === 0 ? (
          <div className="py-16 text-center text-tetri-neutral text-sm">Loading…</div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <Wallet className="w-10 h-10 text-tetri-border mx-auto" />
            <p className="text-sm font-medium text-tetri-neutral">No reimbursements found</p>
            <p className="text-xs text-tetri-neutral/70">Create a reimbursement from an approved employee expense</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-tetri-border bg-tetri-bg">
                {['Expense', 'Requested By', 'Amount', 'Paid', 'Status', 'Date'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-tetri-neutral uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((r) => (
                <tr
                  key={r.id}
                  onClick={() => navigate(`/reimbursements/${r.id}`)}
                  className="border-b border-tetri-border last:border-0 hover:bg-tetri-bg/50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-tetri-text">{r.expense?.expenseNumber}</td>
                  <td className="px-4 py-3 text-tetri-neutral">{r.requestedBy?.fullName || '—'}</td>
                  <td className="px-4 py-3 font-semibold text-tetri-text tabular-nums">{fmtAmt(r.requestedAmount, r.currencyCode)}</td>
                  <td className="px-4 py-3 text-tetri-neutral tabular-nums">{fmtAmt(r.paidAmount, r.currencyCode)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_STYLES[r.status] || 'bg-tetri-bg text-tetri-neutral border-tetri-border'}`}>
                      {r.status?.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-tetri-neutral">{fmtDate(r.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-between text-sm text-tetri-neutral">
          <span>Page {page} of {pages}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
            <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        </div>
      )}
    </div>
  );
}
