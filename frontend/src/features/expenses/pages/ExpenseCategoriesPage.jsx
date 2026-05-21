import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Pencil, Archive, RotateCcw, Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PageHeader from '../../../components/shared/PageHeader.jsx';
import { useToast } from '../../../components/shared/Toast.jsx';
import ConfirmDialog from '../../../components/shared/ConfirmDialog.jsx';
import {
  listCategories, createCategory, updateCategory,
  archiveCategory, restoreCategory, seedDefaultCategories,
} from '../services/expensesService.js';

const EMPTY_FORM = { name: '', categoryCode: '', description: '' };

function CategoryModal({ cat, onClose, onSaved }) {
  const [form, setForm] = useState(cat ? { name: cat.name, categoryCode: cat.categoryCode || '', description: cat.description || '' } : EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const set = (f, v) => setForm((p) => ({ ...p, [f]: v }));

  const handleSave = async () => {
    if (!form.name.trim() || !form.categoryCode.trim()) {
      showToast('error', 'Name and code are required');
      return;
    }
    setSaving(true);
    try {
      if (cat) {
        await updateCategory(cat.id, form);
      } else {
        await createCategory(form);
      }
      onSaved();
      onClose();
    } catch (err) {
      showToast('error', err.response?.data?.error || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md space-y-4">
        <h3 className="text-base font-semibold text-tetri-text">{cat ? 'Edit Category' : 'New Category'}</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-tetri-text mb-1">Category Name <span className="text-tetri-error">*</span></label>
            <Input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Travel" autoFocus />
          </div>
          <div>
            <label className="block text-sm font-medium text-tetri-text mb-1">Category Code <span className="text-tetri-error">*</span></label>
            <Input value={form.categoryCode} onChange={(e) => set('categoryCode', e.target.value.toUpperCase())} placeholder="e.g. TRV" />
          </div>
          <div>
            <label className="block text-sm font-medium text-tetri-text mb-1">Description</label>
            <Input value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Optional description" />
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

export default function ExpenseCategoriesPage() {
  const navigate = useNavigate();
  const { showToast, ToastContainer } = useToast();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [includeArchived, setIncludeArchived] = useState(false);
  const [modal, setModal] = useState(null);
  const [archiveTarget, setArchiveTarget] = useState(null);
  const [archiving, setArchiving] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listCategories({ limit: 200, search: search || undefined, includeArchived: includeArchived || undefined });
      setCategories(result.items || []);
    } catch {
      showToast('error', 'Failed to load categories');
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
        await archiveCategory(archiveTarget.id);
        showToast('success', 'Category archived');
      } else {
        await restoreCategory(archiveTarget.id);
        showToast('success', 'Category restored');
      }
      setArchiveTarget(null);
      load();
    } catch {
      showToast('error', 'Action failed');
    } finally {
      setArchiving(false);
    }
  };

  const handleSeedDefaults = async () => {
    setSeeding(true);
    try {
      const result = await seedDefaultCategories();
      showToast('success', result.message || 'Default categories seeded');
      load();
    } catch {
      showToast('error', 'Failed to seed defaults');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-6">
      {ToastContainer}
      {modal && (
        <CategoryModal
          cat={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={load}
        />
      )}

      <PageHeader title="Expense Categories" subtitle="Organize your expense classifications">
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate('/expenses')} className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          {categories.length === 0 && !loading && (
            <Button variant="outline" onClick={handleSeedDefaults} disabled={seeding} className="gap-2">
              {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Seed Defaults
            </Button>
          )}
          <Button onClick={() => setModal('new')} className="gap-2">
            <Plus className="w-4 h-4" /> New Category
          </Button>
        </div>
      </PageHeader>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tetri-neutral" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search categories…" className="pl-9" />
        </div>
        <label className="flex items-center gap-2 text-sm text-tetri-neutral cursor-pointer">
          <input type="checkbox" checked={includeArchived} onChange={(e) => setIncludeArchived(e.target.checked)} className="rounded" />
          Show archived
        </label>
      </div>

      <div className="bg-white border border-tetri-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-tetri-neutral text-sm">Loading…</div>
        ) : categories.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <p className="text-sm text-tetri-neutral">No categories found</p>
            <Button variant="outline" onClick={handleSeedDefaults} disabled={seeding}>
              {seeding ? 'Seeding…' : 'Seed default categories'}
            </Button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-tetri-border bg-tetri-bg">
                {['Name', 'Code', 'Description', 'Status', ''].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-tetri-neutral uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id} className="border-b border-tetri-border last:border-0">
                  <td className="px-4 py-3 font-medium text-tetri-text">{cat.name}</td>
                  <td className="px-4 py-3 text-tetri-neutral font-mono text-xs">{cat.categoryCode}</td>
                  <td className="px-4 py-3 text-tetri-neutral">{cat.description || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                      cat.isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-tetri-bg text-tetri-neutral border-tetri-border'
                    }`}>
                      {cat.isActive ? 'Active' : 'Archived'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button
                        onClick={() => setModal(cat)}
                        className="p-1.5 rounded-lg text-tetri-neutral hover:bg-tetri-bg hover:text-tetri-text transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setArchiveTarget({ ...cat, _active: cat.isActive })}
                        className="p-1.5 rounded-lg text-tetri-neutral hover:bg-tetri-bg hover:text-tetri-text transition-colors"
                        title={cat.isActive ? 'Archive' : 'Restore'}
                      >
                        {cat.isActive ? <Archive className="w-4 h-4" /> : <RotateCcw className="w-4 h-4" />}
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
        title={archiveTarget?._active ? 'Archive Category' : 'Restore Category'}
        description={archiveTarget?._active
          ? `Archive "${archiveTarget?.name}"? It won't be available for new expenses.`
          : `Restore "${archiveTarget?.name}"? It will be available for new expenses again.`}
        confirmLabel={archiveTarget?._active ? 'Archive' : 'Restore'}
        variant={archiveTarget?._active ? 'destructive' : 'default'}
        loading={archiving}
        onConfirm={handleArchive}
        onCancel={() => setArchiveTarget(null)}
      />
    </div>
  );
}
