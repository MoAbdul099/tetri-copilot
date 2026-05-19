import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Loader2, Upload, Download, MoreHorizontal, Archive, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import PageHeader from '../../../components/shared/PageHeader.jsx';
import { useToast } from '../../../components/shared/Toast.jsx';
import ConfirmDialog from '../../../components/shared/ConfirmDialog.jsx';
import {
  listCustomers, archiveCustomer, restoreCustomer, importCustomers, exportCustomers,
} from '../services/customersService.js';

const CUSTOMER_TYPE_LABELS = {
  individual: 'Individual',
  company: 'Company',
  government: 'Government',
  ngo: 'NGO',
  other: 'Other',
};

const STATUS_BADGE_STYLES = {
  active: 'bg-emerald-50 text-emerald-700',
  inactive: 'bg-amber-50 text-amber-700',
  suspended: 'bg-red-50 text-red-600',
  archived: 'bg-tetri-bg text-tetri-neutral',
};

function CustomerStatusBadge({ status }) {
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${STATUS_BADGE_STYLES[status] || 'bg-tetri-bg text-tetri-neutral'}`}>
      {status}
    </span>
  );
}

function ActionsMenu({ customer, onArchive, onRestore }) {
  const [open, setOpen] = useState(false);
  const isArchived = customer.status === 'archived';

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
          <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-tetri-border rounded-xl shadow-lg py-1 z-20">
            {isArchived ? (
              <button
                onClick={(e) => { e.stopPropagation(); setOpen(false); onRestore(customer); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-tetri-text hover:bg-tetri-bg transition-colors"
              >
                <RotateCcw className="w-4 h-4 text-tetri-neutral" />
                Restore
              </button>
            ) : (
              <button
                onClick={(e) => { e.stopPropagation(); setOpen(false); onArchive(customer); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-tetri-error hover:bg-red-50 transition-colors"
              >
                <Archive className="w-4 h-4" />
                Archive
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

const STATUS_TABS = [
  { value: '', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'archived', label: 'Archived' },
];

export default function CustomersPage() {
  const navigate = useNavigate();
  const { showToast, ToastContainer } = useToast();
  const fileInputRef = useRef(null);
  const searchTimer = useRef(null);

  const [customers, setCustomers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const load = useCallback(async (p, searchVal, statusVal, typeVal) => {
    setLoading(true);
    try {
      const result = await listCustomers({
        page: p,
        limit: 20,
        search: searchVal || undefined,
        status: statusVal || undefined,
        customerType: typeVal || undefined,
      });
      setCustomers(result.items || []);
      setPagination({ page: result.page, totalPages: result.pages, total: result.total });
    } catch {
      showToast('error', 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(page, search, statusFilter, typeFilter);
  }, [page, statusFilter, typeFilter]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setPage(1);
      load(1, val, statusFilter, typeFilter);
    }, 350);
  };

  const handleStatusTab = (val) => {
    setStatusFilter(val);
    setPage(1);
  };

  const handleTypeChange = (val) => {
    setTypeFilter(val === '_all' ? '' : val);
    setPage(1);
  };

  const handleArchive = (customer) => {
    setConfirm({
      title: 'Archive customer?',
      description: `"${customer.name}" will be archived and hidden from active lists.`,
      confirmLabel: 'Archive',
      variant: 'destructive',
      onConfirm: async () => {
        setActionLoading(true);
        try {
          await archiveCustomer(customer.id);
          showToast('success', 'Customer archived');
          load(page, search, statusFilter, typeFilter);
        } catch (err) {
          showToast('error', err?.response?.data?.error || 'Failed to archive');
        } finally {
          setActionLoading(false);
          setConfirm(null);
        }
      },
    });
  };

  const handleRestore = async (customer) => {
    try {
      await restoreCustomer(customer.id);
      showToast('success', 'Customer restored');
      load(page, search, statusFilter, typeFilter);
    } catch (err) {
      showToast('error', err?.response?.data?.error || 'Failed to restore');
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const results = await importCustomers(fd);
      showToast('success', `Import complete: ${results.created} created, ${results.failed} failed`);
      load(page, search, statusFilter, typeFilter);
    } catch (err) {
      showToast('error', err?.response?.data?.error || 'Import failed');
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await exportCustomers('csv');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `customers-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      showToast('error', 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="px-4 sm:px-8 py-8 max-w-7xl mx-auto">
      <PageHeader title="Customers" subtitle="Manage your customer directory">
        <Button variant="outline" size="sm" onClick={handleExport} disabled={exporting}>
          <Download className="w-3.5 h-3.5" />
          {exporting ? 'Exporting…' : 'Export'}
        </Button>
        <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={importing}>
          <Upload className="w-3.5 h-3.5" />
          {importing ? 'Importing…' : 'Import'}
        </Button>
        <input ref={fileInputRef} type="file" accept=".csv,.xlsx" className="hidden" onChange={handleImport} />
        <Button size="sm" onClick={() => navigate('/customers/new')}>
          <Plus className="w-3.5 h-3.5" />
          New Customer
        </Button>
      </PageHeader>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tetri-neutral pointer-events-none" />
          <Input placeholder="Search customers…" value={search} onChange={handleSearchChange} className="pl-9" />
        </div>
        <div className="w-44">
          <Select value={typeFilter || '_all'} onValueChange={handleTypeChange}>
            <SelectTrigger>
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_all">All types</SelectItem>
              <SelectItem value="individual">Individual</SelectItem>
              <SelectItem value="company">Company</SelectItem>
              <SelectItem value="government">Government</SelectItem>
              <SelectItem value="ngo">NGO</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex gap-0 mb-5 border-b border-tetri-border">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleStatusTab(tab.value)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              statusFilter === tab.value
                ? 'border-tetri-blue text-tetri-blue'
                : 'border-transparent text-tetri-muted hover:text-tetri-text'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-card border border-tetri-border overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-tetri-muted">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Loading customers…</span>
          </div>
        ) : customers.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-sm text-tetri-muted">No customers found</p>
            {!search && !statusFilter && !typeFilter && (
              <Button size="sm" className="mt-4" onClick={() => navigate('/customers/new')}>
                <Plus className="w-3.5 h-3.5" />
                Add your first customer
              </Button>
            )}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-tetri-bg border-b border-tetri-border">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-tetri-neutral uppercase tracking-wide">Customer</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-tetri-neutral uppercase tracking-wide hidden sm:table-cell">Type</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-tetri-neutral uppercase tracking-wide hidden md:table-cell">Primary Contact</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-tetri-neutral uppercase tracking-wide hidden lg:table-cell">Country</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-tetri-neutral uppercase tracking-wide hidden xl:table-cell">Tags</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-tetri-neutral uppercase tracking-wide">Status</th>
                <th className="px-5 py-3 w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-tetri-border">
              {customers.map((c) => (
                <tr
                  key={c.id}
                  className="hover:bg-tetri-bg/40 transition-colors cursor-pointer"
                  onClick={() => navigate(`/customers/${c.id}`)}
                >
                  <td className="px-5 py-4">
                    <p className="font-medium text-tetri-text truncate max-w-[200px]">{c.name}</p>
                    {c.customerCode && (
                      <p className="text-xs text-tetri-neutral font-mono">{c.customerCode}</p>
                    )}
                  </td>
                  <td className="px-5 py-4 hidden sm:table-cell text-tetri-muted">
                    {CUSTOMER_TYPE_LABELS[c.customerType] || c.customerType}
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    {c.primaryContact ? (
                      <div className="min-w-0">
                        <p className="text-tetri-text truncate">
                          {`${c.primaryContact.firstName} ${c.primaryContact.lastName}`.trim()}
                        </p>
                        <p className="text-xs text-tetri-neutral truncate">{c.primaryContact.email}</p>
                      </div>
                    ) : (
                      <span className="text-tetri-neutral">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4 hidden lg:table-cell text-tetri-muted">
                    {c.country || '—'}
                  </td>
                  <td className="px-5 py-4 hidden xl:table-cell">
                    {c.tags?.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {c.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag.id}
                            className="px-2 py-0.5 rounded-full text-xs font-medium bg-tetri-bg text-tetri-muted border border-tetri-border"
                          >
                            {tag.name}
                          </span>
                        ))}
                        {c.tags.length > 3 && (
                          <span className="text-xs text-tetri-neutral self-center">+{c.tags.length - 3}</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-tetri-neutral">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <CustomerStatusBadge status={c.status} />
                  </td>
                  <td className="px-5 py-4">
                    <ActionsMenu customer={c} onArchive={handleArchive} onRestore={handleRestore} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {!loading && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm text-tetri-muted">
          <span>{pagination.total} customers</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 rounded-lg border border-tetri-border hover:bg-tetri-bg disabled:opacity-40 transition-colors text-tetri-text text-xs"
            >
              Previous
            </button>
            <span className="text-xs">Page {page} of {pagination.totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page >= pagination.totalPages}
              className="px-3 py-1.5 rounded-lg border border-tetri-border hover:bg-tetri-bg disabled:opacity-40 transition-colors text-tetri-text text-xs"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {confirm && (
        <ConfirmDialog
          open={!!confirm}
          onOpenChange={(v) => !v && setConfirm(null)}
          title={confirm.title}
          description={confirm.description}
          confirmLabel={confirm.confirmLabel}
          variant={confirm.variant}
          loading={actionLoading}
          onConfirm={confirm.onConfirm}
        />
      )}
      {ToastContainer}
    </div>
  );
}
