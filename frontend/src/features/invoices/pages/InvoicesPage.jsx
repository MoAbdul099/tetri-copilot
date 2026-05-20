import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, FileText, Download, MoreHorizontal, Copy, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PageHeader from '../../../components/shared/PageHeader.jsx';
import { useToast } from '../../../components/shared/Toast.jsx';
import ConfirmDialog from '../../../components/shared/ConfirmDialog.jsx';
import InvoiceStatusBadge from '../components/InvoiceStatusBadge.jsx';
import { listInvoices, deleteInvoice, duplicateInvoice, downloadInvoicePdf } from '../services/invoicesService.js';

const STATUS_TABS = [
  { value: '', label: 'All' },
  { value: 'draft', label: 'Draft' },
  { value: 'issued', label: 'Issued' },
  { value: 'sent', label: 'Sent' },
  { value: 'paid', label: 'Paid' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'cancelled', label: 'Cancelled' },
];

const fmt = (n, currency = '') =>
  `${currency} ${Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`.trim();

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

function ActionsMenu({ invoice, onDelete, onDuplicate, onDownload }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        className="p-1.5 rounded-lg text-tetri-neutral hover:bg-tetri-bg hover:text-tetri-text transition-colors"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setOpen(false); }} />
          <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-tetri-border rounded-xl shadow-lg py-1 z-20">
            <MenuItem icon={<Download className="w-4 h-4" />} label="Download PDF" onClick={() => { setOpen(false); onDownload(invoice); }} />
            <MenuItem icon={<Copy className="w-4 h-4" />} label="Duplicate" onClick={() => { setOpen(false); onDuplicate(invoice); }} />
            {invoice.status === 'draft' && (
              <MenuItem icon={<Trash2 className="w-4 h-4" />} label="Delete" danger onClick={() => { setOpen(false); onDelete(invoice); }} />
            )}
          </div>
        </>
      )}
    </div>
  );
}

function MenuItem({ icon, label, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors ${
        danger ? 'text-tetri-error hover:bg-red-50' : 'text-tetri-text hover:bg-tetri-bg'
      }`}
    >
      <span className={danger ? 'text-tetri-error' : 'text-tetri-neutral'}>{icon}</span>
      {label}
    </button>
  );
}

export default function InvoicesPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const [invoices, setInvoices] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusTab, setStatusTab] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listInvoices({ page, limit: 20, search: search || undefined, status: statusTab || undefined });
      setInvoices(result.items || []);
      setTotal(result.total || 0);
      setPages(result.pages || 1);
    } catch {
      toast('Failed to load invoices', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusTab]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => { setPage(1); }, [search, statusTab]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteInvoice(deleteTarget.id);
      toast('Invoice deleted', 'success');
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to delete', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleDuplicate = async (inv) => {
    try {
      const newInv = await duplicateInvoice(inv.id);
      toast('Invoice duplicated', 'success');
      navigate(`/invoices/${newInv.id}`);
    } catch {
      toast('Failed to duplicate invoice', 'error');
    }
  };

  const handleDownload = async (inv) => {
    try {
      await downloadInvoicePdf(inv.id, inv.invoiceNumber);
    } catch {
      toast('Failed to download PDF', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices"
        description={`${total} invoice${total !== 1 ? 's' : ''}`}
        actions={
          <Button onClick={() => navigate('/invoices/new')} className="gap-2">
            <Plus className="w-4 h-4" />
            New Invoice
          </Button>
        }
      />

      {/* Status tabs */}
      <div className="flex gap-1 border-b border-tetri-border">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusTab(tab.value)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              statusTab === tab.value
                ? 'border-tetri-primary text-tetri-primary'
                : 'border-transparent text-tetri-neutral hover:text-tetri-text'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tetri-neutral" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search invoices…"
            className="pl-9"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-tetri-border rounded-xl overflow-hidden">
        {loading && invoices.length === 0 ? (
          <div className="py-16 text-center text-tetri-neutral text-sm">Loading…</div>
        ) : invoices.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <FileText className="w-10 h-10 text-tetri-border mx-auto" />
            <p className="text-sm font-medium text-tetri-neutral">No invoices found</p>
            <p className="text-xs text-tetri-neutral/70">Create your first invoice to get started</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-tetri-border bg-tetri-bg">
                {['Invoice', 'Customer', 'Issue Date', 'Due Date', 'Amount', 'Status', ''].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-tetri-neutral uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr
                  key={inv.id}
                  onClick={() => navigate(`/invoices/${inv.id}`)}
                  className="border-b border-tetri-border last:border-0 hover:bg-tetri-bg/50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-tetri-text">{inv.invoiceNumber}</td>
                  <td className="px-4 py-3 text-tetri-neutral">{inv.customer?.name || '—'}</td>
                  <td className="px-4 py-3 text-tetri-neutral">{fmtDate(inv.issueDate)}</td>
                  <td className="px-4 py-3 text-tetri-neutral">{fmtDate(inv.dueDate)}</td>
                  <td className="px-4 py-3 font-semibold text-tetri-text tabular-nums">{fmt(inv.totalAmount, inv.currencyCode)}</td>
                  <td className="px-4 py-3"><InvoiceStatusBadge status={inv.status} /></td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <ActionsMenu
                      invoice={inv}
                      onDelete={setDeleteTarget}
                      onDuplicate={handleDuplicate}
                      onDownload={handleDownload}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between text-sm text-tetri-neutral">
          <span>Page {page} of {pages}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
            <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Invoice"
        description={`Delete invoice ${deleteTarget?.invoiceNumber}? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
