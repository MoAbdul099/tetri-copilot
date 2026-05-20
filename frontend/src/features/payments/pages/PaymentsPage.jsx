import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PageHeader from '@/components/shared/PageHeader';
import PaymentStatusBadge from '../components/PaymentStatusBadge';
import { listPayments } from '../services/paymentsService';
import { useToast } from '@/hooks/useToast';

const fmtDate  = (d) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';
const fmtMoney = (v, ccy = '') => `${ccy} ${Number(v || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`.trim();

const METHOD_LABELS = {
  cash: 'Cash', bank_transfer: 'Bank Transfer', credit_card: 'Credit Card',
  debit_card: 'Debit Card', cheque: 'Cheque', mobile_wallet: 'Mobile Wallet',
  pos: 'POS', online_transfer: 'Online Transfer', other: 'Other',
};

export default function PaymentsPage() {
  const navigate = useNavigate();
  const { showToast, ToastContainer } = useToast();
  const [payments, setPayments] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const limit = 20;

  const load = async () => {
    setLoading(true);
    try {
      const data = await listPayments({ search: search || undefined, status: status || undefined, page, limit });
      setPayments(data.items || []);
      setTotal(data.total || 0);
    } catch {
      showToast('error', 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [search, status, page]);

  return (
    <div className="space-y-6">
      <ToastContainer />
      <PageHeader title="Payments">
        <Button onClick={() => navigate('/payments/new')}>
          <Plus className="h-4 w-4 mr-2" /> Record Payment
        </Button>
      </PageHeader>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search payments..." className="pl-9" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <Select value={status} onValueChange={(v) => { setStatus(v === 'all' ? '' : v); setPage(1); }}>
          <SelectTrigger className="w-44"><SelectValue placeholder="All statuses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {['draft','posted','unallocated','partially_allocated','allocated','reversed','voided'].map((s) => (
              <SelectItem key={s} value={s}>{s.replace(/_/g,' ').replace(/\b\w/g,(c)=>c.toUpperCase())}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-muted-foreground text-xs uppercase tracking-wide">
            <tr>
              <th className="px-4 py-3 text-left">Payment #</th>
              <th className="px-4 py-3 text-left">Customer</th>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Method</th>
              <th className="px-4 py-3 text-right">Amount</th>
              <th className="px-4 py-3 text-right">Unallocated</th>
              <th className="px-4 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">Loading...</td></tr>
            ) : payments.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No payments found</td></tr>
            ) : payments.map((p) => (
              <tr key={p.id} className="hover:bg-muted/30 cursor-pointer transition-colors" onClick={() => navigate(`/payments/${p.id}`)}>
                <td className="px-4 py-3 font-medium">{p.paymentNumber}</td>
                <td className="px-4 py-3 text-muted-foreground">{p.customer?.name || '—'}</td>
                <td className="px-4 py-3 text-muted-foreground">{fmtDate(p.paymentDate)}</td>
                <td className="px-4 py-3 text-muted-foreground">{METHOD_LABELS[p.paymentMethod] || p.paymentMethod}</td>
                <td className="px-4 py-3 text-right font-medium">{fmtMoney(p.amount, p.currencyCode)}</td>
                <td className="px-4 py-3 text-right text-muted-foreground">{fmtMoney(p.unallocatedAmount, p.currencyCode)}</td>
                <td className="px-4 py-3"><PaymentStatusBadge status={p.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {total > limit && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Showing {Math.min((page-1)*limit+1, total)}–{Math.min(page*limit, total)} of {total}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
            <Button variant="outline" size="sm" disabled={page * limit >= total} onClick={() => setPage(p => p + 1)}>Next</Button>
          </div>
        </div>
      )}
    </div>
  );
}
