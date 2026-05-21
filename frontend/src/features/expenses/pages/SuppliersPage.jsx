import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Pencil, Archive, RotateCcw, Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PageHeader from '../../../components/shared/PageHeader.jsx';
import { useToast } from '../../../components/shared/Toast.jsx';
import ConfirmDialog from '../../../components/shared/ConfirmDialog.jsx';
import {
  listSuppliers, createSupplier, updateSupplier,
  archiveSupplier, restoreSupplier,
} from '../services/expensesService.js';

const EMPTY_FORM = {
  name: '', contactPerson: '', email: '', phone: '',
  taxNumber: '', addressLine1: '', city: '', country: '', website: '', notes: '',
};

function SupplierModal({ supplier, onClose, onSaved }) {
  const isEdit = Boolean(supplier);
  const [form, setForm] = useState(supplier ? {
    name: supplier.name || '', contactPerson: supplier.contactPerson || '',
    email: supplier.email || '', phone: supplier.phone || '',
    taxNumber: supplier.taxNumber || '', addressLine1: supplier.addressLine1 || '',
    city: supplier.city || '', country: supplier.country || '',
    website: supplier.website || '', notes: supplier.notes || '',
  } : EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const set = (f, v) => setForm((p) => ({ ...p, [f]: v }));

  const handleSave = async () => {
    if (!form.name.trim()) {
      showToast('error', 'Supplier name is required');
      return;
    }
    setSaving(true);
    try {
      if (isEdit) {
        await updateSupplier(supplier.id, form);
      } else {
        await createSupplier(form);
      }
      onSaved();
      onClose();
    } catch (err) {
      showToast('error', err.response?.data?.error || 'Failed to save supplier');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 overflow-y-auto py-8">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg space-y-4 mx-4">
        <h3 className="text-base font-semibold text-tetri-text">{isEdit ? 'Edit Supplier' : 'New Supplier'}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-tetri-text mb-1">Name <span className="text-tetri-error">*</span></label>
            <Input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Supplier name" autoFocus />
          </div>
          <div>
            <label className="block text-sm font-medium text-tetri-text mb-1">Contact Person</label>
            <Input value={form.contactPerson} onChange={(e) => set('contactPerson', e.target.value)} placeholder="Full name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-tetri-text mb-1">Email</label>
            <Input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="email@supplier.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-tetri-text mb-1">Phone</label>
            <Input value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+1 555 000 0000" />
          </div>
          <div>
            <label className="block text-sm font-medium text-tetri-text mb-1">Tax Number</label>
            <Input value={form.taxNumber} onChange={(e) => set('taxNumber', e.target.value)} placeholder="VAT / Tax ID" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-tetri-text mb-1">Address</label>
            <Input value={form.addressLine1} onChange={(e) => set('addressLine1', e.target.value)} placeholder="Street address" />
          </div>
          <div>
            <label className="block text-sm font-medium text-tetri-text mb-1">City</label>
            <Input value={form.city} onChange={(e) => set('city', e.target.value)} placeholder="City" />
          </div>
          <div>
            <label className="block text-sm font-medium text-tetri-text mb-1">Country</label>
            <Input value={form.country} onChange={(e) => set('country', e.target.value)} placeholder="Country" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-tetri-text mb-1">Website</label>
            <Input value={form.website} onChange={(e) => set('website', e.target.value)} placeholder="https://supplier.com" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-tetri-text mb-1">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
              placeholder="Internal notes…"
              rows={3}
              className="w-full text-sm border border-tetri-border rounded-lg px-3 py-2 bg-white text-tetri-text focus:outline-none focus:ring-2 focus:ring-tetri-blue resize-none"
            />
          </div>
        </div>
        <div className="flex gap-2 justify-end pt-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function SuppliersPage() {
  const navigate = useNavigate();
  const { showToast, ToastContainer } = useToast();

  const [suppliers, setSuppliers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [includeArchived, setIncludeArchived] = useState(false);
  const [modal, setModal] = useState(null);
  const [archiveTarget, setArchiveTarget] = useState(null);
  const [archiving, setArchiving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listSuppliers({
        limit: 100,
        search: search || undefined,
        includeArchived: includeArchived || undefined,
      });
      setSuppliers(result.items || []);
      setTotal(result.total || 0);
    } catch {
      showToast('error', 'Failed to load suppliers');
    } finally {
      setLoading(false);
    }
  }, [search, includeArchived]);

  useEffect(() => { load(); }, [load]);

  const handleArchive = async () => {
    if (!archiveTarget) return;
    setArchiving(true);
    try {
      if (archiveTarget._active) {
        await archiveSupplier(archiveTarget.id);
        showToast('success', 'Supplier archived');
      } else {
        await restoreSupplier(archiveTarget.id);
        showToast('success', 'Supplier restored');
      }
      setArchiveTarget(null);
      load();
    } catch {
      showToast('error', 'Action failed');
    } finally {
      setArchiving(false);
    }
  };

  return (
    <div className="space-y-6">
      {ToastContainer}
      {modal && (
        <SupplierModal
          supplier={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={load}
        />
      )}

      <PageHeader title="Suppliers" subtitle={`${total} supplier${total !== 1 ? 's' : ''}`}>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate('/expenses')} className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          <Button onClick={() => setModal('new')} className="gap-2">
            <Plus className="w-4 h-4" /> New Supplier
          </Button>
        </div>
      </PageHeader>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tetri-neutral" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search suppliers…" className="pl-9" />
        </div>
        <label className="flex items-center gap-2 text-sm text-tetri-neutral cursor-pointer">
          <input type="checkbox" checked={includeArchived} onChange={(e) => setIncludeArchived(e.target.checked)} className="rounded" />
          Show archived
        </label>
      </div>

      <div className="bg-white border border-tetri-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-tetri-neutral text-sm">Loading…</div>
        ) : suppliers.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <p className="text-sm font-medium text-tetri-neutral">No suppliers found</p>
            <p className="text-xs text-tetri-neutral/70">Add your first supplier to get started</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-tetri-border bg-tetri-bg">
                {['Name', 'Contact', 'Email', 'Phone', 'Tax Number', 'Status', ''].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-tetri-neutral uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {suppliers.map((s) => (
                <tr key={s.id} className="border-b border-tetri-border last:border-0 hover:bg-tetri-bg/40 transition-colors">
                  <td className="px-4 py-3 font-medium text-tetri-text">{s.name}</td>
                  <td className="px-4 py-3 text-tetri-neutral">{s.contactPerson || '—'}</td>
                  <td className="px-4 py-3 text-tetri-neutral">{s.email || '—'}</td>
                  <td className="px-4 py-3 text-tetri-neutral">{s.phone || '—'}</td>
                  <td className="px-4 py-3 text-tetri-neutral font-mono text-xs">{s.taxNumber || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                      s.isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-tetri-bg text-tetri-neutral border-tetri-border'
                    }`}>
                      {s.isActive ? 'Active' : 'Archived'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button
                        onClick={() => setModal(s)}
                        className="p-1.5 rounded-lg text-tetri-neutral hover:bg-tetri-bg hover:text-tetri-text transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setArchiveTarget({ ...s, _active: s.isActive })}
                        className="p-1.5 rounded-lg text-tetri-neutral hover:bg-tetri-bg hover:text-tetri-text transition-colors"
                        title={s.isActive ? 'Archive' : 'Restore'}
                      >
                        {s.isActive ? <Archive className="w-4 h-4" /> : <RotateCcw className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ConfirmDialog
        open={!!archiveTarget}
        title={archiveTarget?._active ? 'Archive Supplier' : 'Restore Supplier'}
        description={archiveTarget?._active
          ? `Archive "${archiveTarget?.name}"? They won't be available for new expenses.`
          : `Restore "${archiveTarget?.name}"? They will be available again.`}
        confirmLabel={archiveTarget?._active ? 'Archive' : 'Restore'}
        variant={archiveTarget?._active ? 'destructive' : 'default'}
        loading={archiving}
        onConfirm={handleArchive}
        onCancel={() => setArchiveTarget(null)}
      />
    </div>
  );
}
