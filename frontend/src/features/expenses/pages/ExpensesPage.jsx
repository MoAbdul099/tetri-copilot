import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Receipt, Download, Copy, Trash2, MoreHorizontal, ChevronDown, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PageHeader from '../../../components/shared/PageHeader.jsx';
import { useToast } from '../../../components/shared/Toast.jsx';
import ConfirmDialog from '../../../components/shared/ConfirmDialog.jsx';
import { listExpenses, deleteExpense, duplicateExpense, exportExpensesCsv, exportExpensesXlsx, listCategories, listSuppliers } from '../services/expensesService.js';

const STATUS_TABS = [
  { value: '', label: 'All' },
  { value: 'draft', label: 'Draft' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'cancelled', label: 'Cancelled' },
];

const TYPE_LABELS = { company: 'Company', employee: 'Employee', petty_cash: 'Petty Cash' };

const STATUS_STYLES = {
  draft:     'bg-yellow-50 text-yellow-700 border-yellow-200',
  submitted: 'bg-green-50 text-green-700 border-green-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
};

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';
const fmtAmt  = (n, currency = '') => `${currency} ${Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`.trim();

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_STYLES[status] || 'bg-tetri-bg text-tetri-neutral border-tetri-border'}`}>
      {status}
    </span>
  );
}

function ActionsMenu({ expense, onDelete, onDuplicate }) {
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
            <button onClick={() => { setOpen(false); onDuplicate(expense); }} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-tetri-text hover:bg-tetri-bg">
              <Copy className="w-4 h-4 text-tetri-neutral" /> Duplicate
            </button>
            <button onClick={() => { setOpen(false); onDelete(expense); }} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-tetri-error hover:bg-red-50">
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function ExportMenu({ filters }) {
  const [open, setOpen] = useState(false);
  const { showToast } = useToast();

  const handleExport = async (type) => {
    setOpen(false);
    try {
      if (type === 'csv') await exportExpensesCsv(filters);
      else await exportExpensesXlsx(filters);
    } catch {
      showToast('error', 'Export failed');
    }
  };

  return (
    <div className="relative">
      <Button variant="outline" onClick={() => setOpen((v) => !v)} className="gap-2">
        <Download className="w-4 h-4" />
        Export
        <ChevronDown className="w-3.5 h-3.5" />
      </Button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-tetri-border rounded-xl shadow-lg py-1 z-20">
            <button onClick={() => handleExport('csv')} className="w-full px-3 py-2 text-sm text-tetri-text hover:bg-tetri-bg text-left">CSV</button>
            <button onClick={() => handleExport('xlsx')} className="w-full px-3 py-2 text-sm text-tetri-text hover:bg-tetri-bg text-left">Excel (XLSX)</button>
          </div>
        </>
      )}
    </div>
  );
}

export default function ExpensesPage() {
  const navigate = useNavigate();
  const { showToast, ToastContainer } = useToast();

  const [expenses, setExpenses] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState('');
  const [statusTab, setStatusTab] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ categoryId: '', supplierId: '', expenseType: '', dateFrom: '', dateTo: '' });

  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    listCategories({ limit: 200 }).then((r) => setCategories(r.items || [])).catch(() => {});
    listSuppliers({ limit: 200 }).then((r) => setSuppliers(r.items || [])).catch(() => {});
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20, search: search || undefined, status: statusTab || undefined };
      if (filters.categoryId)  params.categoryId  = filters.categoryId;
      if (filters.supplierId)  params.supplierId  = filters.supplierId;
      if (filters.expenseType) params.expenseType = filters.expenseType;
      if (filters.dateFrom)    params.dateFrom    = filters.dateFrom;
      if (filters.dateTo)      params.dateTo      = filters.dateTo;
      const result = await listExpenses(params);
      setExpenses(result.items || []);
      setTotal(result.total || 0);
      setPages(result.pages || 1);
    } catch {
      showToast('error', 'Failed to load expenses');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusTab, filters]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [search, statusTab, filters]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteExpense(deleteTarget.id);
      showToast('success', 'Expense deleted');
      setDeleteTarget(null);
      load();
    } catch (err) {
      showToast('error', err.response?.data?.error || 'Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  const handleDuplicate = async (exp) => {
    try {
      const newExp = await duplicateExpense(exp.id);
      showToast('success', 'Expense duplicated');
      navigate(`/expenses/${newExp.id}`);
    } catch {
      showToast('error', 'Failed to duplicate');
    }
  };

  const exportFilters = {};
  if (statusTab) exportFilters.status = statusTab;
  if (filters.categoryId) exportFilters.categoryId = filters.categoryId;
  if (filters.supplierId) exportFilters.supplierId = filters.supplierId;
  if (filters.dateFrom) exportFilters.dateFrom = filters.dateFrom;
  if (filters.dateTo) exportFilters.dateTo = filters.dateTo;

  return (
    <div className="space-y-6">
      {ToastContainer}
      <PageHeader title="Expenses" subtitle={`${total} expense${total !== 1 ? 's' : ''}`}>
        <div className="flex items-center gap-2">
          <ExportMenu filters={exportFilters} />
          <Button variant="outline" onClick={() => navigate('/expenses/categories')} className="gap-2">
            Categories
          </Button>
          <Button variant="outline" onClick={() => navigate('/expenses/suppliers')} className="gap-2">
            Suppliers
          </Button>
          <Button onClick={() => navigate('/expenses/new')} className="gap-2">
            <Plus className="w-4 h-4" /> New Expense
          </Button>
        </div>
      </PageHeader>

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

      {/* Search + filter toggle */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tetri-neutral" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search expenses…" className="pl-9" />
        </div>
        <Button variant="outline" onClick={() => setShowFilters((v) => !v)} className="gap-2">
          <Filter className="w-4 h-4" /> Filters
        </Button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="bg-tetri-surface border border-tetri-border rounded-xl p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-tetri-neutral mb-1">Type</label>
            <select
              value={filters.expenseType}
              onChange={(e) => setFilters((f) => ({ ...f, expenseType: e.target.value }))}
              className="w-full text-sm border border-tetri-border rounded-lg px-3 py-2 bg-white text-tetri-text focus:outline-none focus:ring-2 focus:ring-tetri-blue"
            >
              <option value="">All types</option>
              <option value="company">Company</option>
              <option value="employee">Employee</option>
              <option value="petty_cash">Petty Cash</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-tetri-neutral mb-1">Category</label>
            <select
              value={filters.categoryId}
              onChange={(e) => setFilters((f) => ({ ...f, categoryId: e.target.value }))}
              className="w-full text-sm border border-tetri-border rounded-lg px-3 py-2 bg-white text-tetri-text focus:outline-none focus:ring-2 focus:ring-tetri-blue"
            >
              <option value="">All categories</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-tetri-neutral mb-1">Supplier</label>
            <select
              value={filters.supplierId}
              onChange={(e) => setFilters((f) => ({ ...f, supplierId: e.target.value }))}
              className="w-full text-sm border border-tetri-border rounded-lg px-3 py-2 bg-white text-tetri-text focus:outline-none focus:ring-2 focus:ring-tetri-blue"
            >
              <option value="">All suppliers</option>
              {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-tetri-neutral mb-1">Date from</label>
            <Input type="date" value={filters.dateFrom} onChange={(e) => setFilters((f) => ({ ...f, dateFrom: e.target.value }))} className="text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-tetri-neutral mb-1">Date to</label>
            <Input type="date" value={filters.dateTo} onChange={(e) => setFilters((f) => ({ ...f, dateTo: e.target.value }))} className="text-sm" />
          </div>
          <div className="flex items-end">
            <Button variant="outline" size="sm" onClick={() => setFilters({ categoryId: '', supplierId: '', expenseType: '', dateFrom: '', dateTo: '' })}>
              Clear filters
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-tetri-border rounded-xl overflow-hidden">
        {loading && expenses.length === 0 ? (
          <div className="py-16 text-center text-tetri-neutral text-sm">Loading…</div>
        ) : expenses.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <Receipt className="w-10 h-10 text-tetri-border mx-auto" />
            <p className="text-sm font-medium text-tetri-neutral">No expenses found</p>
            <p className="text-xs text-tetri-neutral/70">Create your first expense to get started</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-tetri-border bg-tetri-bg">
                {['Number', 'Date', 'Category', 'Supplier', 'Type', 'Amount', 'Status', ''].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-tetri-neutral uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {expenses.map((exp) => (
                <tr
                  key={exp.id}
                  onClick={() => navigate(`/expenses/${exp.id}`)}
                  className="border-b border-tetri-border last:border-0 hover:bg-tetri-bg/50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-tetri-text">{exp.expenseNumber}</td>
                  <td className="px-4 py-3 text-tetri-neutral">{fmtDate(exp.expenseDate)}</td>
                  <td className="px-4 py-3 text-tetri-neutral">{exp.category?.name || '—'}</td>
                  <td className="px-4 py-3 text-tetri-neutral">{exp.supplier?.name || '—'}</td>
                  <td className="px-4 py-3 text-tetri-neutral">{TYPE_LABELS[exp.expenseType] || exp.expenseType}</td>
                  <td className="px-4 py-3 font-semibold text-tetri-text tabular-nums">{fmtAmt(exp.amount, exp.currencyCode)}</td>
                  <td className="px-4 py-3"><StatusBadge status={exp.status} /></td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <ActionsMenu expense={exp} onDelete={setDeleteTarget} onDuplicate={handleDuplicate} />
                  </td>
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

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Expense"
        description={`Delete expense ${deleteTarget?.expenseNumber}? This cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
