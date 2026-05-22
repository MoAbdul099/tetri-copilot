import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Plus, Trash2, Edit2, X, Play, CheckCircle, Clock } from 'lucide-react';
import {
  listRecurring, createRecurring, updateRecurring, deleteRecurring, generateFromRecurring,
} from '../services/recurringExpensesService.js';
import api from '../../../lib/api.js';

const FREQ_LABELS = { weekly: 'Weekly', monthly: 'Monthly', quarterly: 'Quarterly', semi_annual: 'Semi-Annual', annual: 'Annual' };
const fmt = (n) => Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function RecurringModal({ template, categories, suppliers, onClose, onSave }) {
  const isEdit = !!template?.id;
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({
    name:        template?.name        || '',
    description: template?.description || '',
    amount:      template?.amount      || '',
    currencyCode: template?.currencyCode || 'USD',
    expenseType: template?.expenseType || 'company',
    frequency:   template?.frequency   || 'monthly',
    nextRunDate: template?.nextRunDate?.slice(0,10) || today,
    endDate:     template?.endDate?.slice(0,10)     || '',
    supplierId:  template?.supplierId  || '',
    categoryId:  template?.categoryId  || '',
    vendorName:  template?.vendorName  || '',
    department:  template?.department  || '',
    project:     template?.project     || '',
    autoCreate:  template?.autoCreate  !== false,
  });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try { await onSave(form); onClose(); } catch { /* ignore */ } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-tetri-surface rounded-card border border-tetri-border w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-tetri-border sticky top-0 bg-tetri-surface">
          <h2 className="font-semibold text-tetri-text">{isEdit ? 'Edit Template' : 'New Recurring Expense'}</h2>
          <button onClick={onClose} className="text-tetri-muted hover:text-tetri-text"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          <div>
            <label className="text-xs font-medium text-tetri-muted block mb-1">Template Name *</label>
            <input required value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Office Rent" className="w-full px-3 py-2 text-sm border border-tetri-border rounded-lg bg-tetri-bg focus:outline-none focus:ring-2 focus:ring-tetri-blue/30" />
          </div>
          <div>
            <label className="text-xs font-medium text-tetri-muted block mb-1">Description *</label>
            <input required value={form.description} onChange={e => set('description', e.target.value)} className="w-full px-3 py-2 text-sm border border-tetri-border rounded-lg bg-tetri-bg focus:outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-tetri-muted block mb-1">Amount *</label>
              <input required type="number" min="0" step="0.01" value={form.amount} onChange={e => set('amount', e.target.value)} className="w-full px-3 py-2 text-sm border border-tetri-border rounded-lg bg-tetri-bg focus:outline-none" />
            </div>
            <div>
              <label className="text-xs font-medium text-tetri-muted block mb-1">Currency</label>
              <input value={form.currencyCode} onChange={e => set('currencyCode', e.target.value)} className="w-full px-3 py-2 text-sm border border-tetri-border rounded-lg bg-tetri-bg focus:outline-none" placeholder="USD" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-tetri-muted block mb-1">Frequency *</label>
              <select value={form.frequency} onChange={e => set('frequency', e.target.value)} className="w-full px-3 py-2 text-sm border border-tetri-border rounded-lg bg-tetri-bg focus:outline-none">
                {Object.entries(FREQ_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-tetri-muted block mb-1">Expense Type</label>
              <select value={form.expenseType} onChange={e => set('expenseType', e.target.value)} className="w-full px-3 py-2 text-sm border border-tetri-border rounded-lg bg-tetri-bg focus:outline-none">
                <option value="company">Company</option>
                <option value="employee">Employee</option>
                <option value="petty_cash">Petty Cash</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-tetri-muted block mb-1">Next Run Date *</label>
              <input required type="date" value={form.nextRunDate} onChange={e => set('nextRunDate', e.target.value)} className="w-full px-3 py-2 text-sm border border-tetri-border rounded-lg bg-tetri-bg focus:outline-none" />
            </div>
            <div>
              <label className="text-xs font-medium text-tetri-muted block mb-1">End Date</label>
              <input type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)} className="w-full px-3 py-2 text-sm border border-tetri-border rounded-lg bg-tetri-bg focus:outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-tetri-muted block mb-1">Supplier</label>
              <select value={form.supplierId} onChange={e => set('supplierId', e.target.value)} className="w-full px-3 py-2 text-sm border border-tetri-border rounded-lg bg-tetri-bg focus:outline-none">
                <option value="">Select supplier</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-tetri-muted block mb-1">Category</label>
              <select value={form.categoryId} onChange={e => set('categoryId', e.target.value)} className="w-full px-3 py-2 text-sm border border-tetri-border rounded-lg bg-tetri-bg focus:outline-none">
                <option value="">Select category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-tetri-muted block mb-1">Department</label>
              <input value={form.department} onChange={e => set('department', e.target.value)} className="w-full px-3 py-2 text-sm border border-tetri-border rounded-lg bg-tetri-bg focus:outline-none" />
            </div>
            <div>
              <label className="text-xs font-medium text-tetri-muted block mb-1">Project</label>
              <input value={form.project} onChange={e => set('project', e.target.value)} className="w-full px-3 py-2 text-sm border border-tetri-border rounded-lg bg-tetri-bg focus:outline-none" />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-tetri-text cursor-pointer">
            <input type="checkbox" checked={form.autoCreate} onChange={e => set('autoCreate', e.target.checked)} className="accent-tetri-blue" />
            Auto-create expense draft when due
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-tetri-muted hover:bg-tetri-bg rounded-lg border border-tetri-border transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm bg-tetri-blue text-white rounded-lg hover:bg-tetri-blue-hover disabled:opacity-50 transition-colors">
              {saving ? 'Saving…' : isEdit ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function RecurringExpensesPage() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [modal, setModal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [t, cats, sups] = await Promise.all([
        listRecurring(),
        api.get('/api/v1/expense-categories').then(r => r.data.data?.items || r.data.data || []),
        api.get('/api/v1/suppliers').then(r => r.data.data?.items || r.data.data || []),
      ]);
      setTemplates(t); setCategories(cats); setSuppliers(sups);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (form) => {
    if (modal?.id) await updateRecurring(modal.id, form);
    else           await createRecurring(form);
    await load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this recurring expense template?')) return;
    try { await deleteRecurring(id); await load(); } catch { /* ignore */ }
  };

  const handleGenerate = async (id) => {
    setGenerating(id);
    try {
      const expense = await generateFromRecurring(id);
      await load();
      navigate(`/expenses/${expense.id}`);
    } catch { /* ignore */ } finally { setGenerating(null); }
  };

  const isDue = (t) => {
    if (!t.nextRunDate) return false;
    return new Date(t.nextRunDate) <= new Date();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-tetri-text">Recurring Expenses</h1>
          <p className="text-tetri-muted text-sm mt-0.5">Automate predictable expenses</p>
        </div>
        <button onClick={() => setModal({})} className="flex items-center gap-2 px-4 py-2 bg-tetri-blue text-white text-sm rounded-lg hover:bg-tetri-blue-hover transition-colors">
          <Plus className="w-4 h-4" /> New Template
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-tetri-blue border-t-transparent rounded-full animate-spin" /></div>
      ) : templates.length === 0 ? (
        <div className="bg-tetri-surface border border-tetri-border rounded-card p-12 text-center">
          <RefreshCw className="w-10 h-10 text-tetri-neutral mx-auto mb-3" />
          <p className="font-semibold text-tetri-text mb-1">No recurring expenses</p>
          <p className="text-tetri-muted text-sm mb-4">Automate predictable expenses like rent, subscriptions, or utilities.</p>
          <button onClick={() => setModal({})} className="px-4 py-2 bg-tetri-blue text-white text-sm rounded-lg hover:bg-tetri-blue-hover transition-colors">Create Template</button>
        </div>
      ) : (
        <div className="bg-tetri-surface border border-tetri-border rounded-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-tetri-border bg-tetri-bg">
                <th className="text-left px-4 py-3 text-xs font-medium text-tetri-muted">Template</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-tetri-muted">Amount</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-tetri-muted">Frequency</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-tetri-muted">Next Run</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-tetri-muted">Status</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-tetri-muted">Actions</th>
              </tr>
            </thead>
            <tbody>
              {templates.map((t) => (
                <tr key={t.id} className="border-b border-tetri-border last:border-0 hover:bg-tetri-bg transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-tetri-text">{t.name}</p>
                    <p className="text-xs text-tetri-muted">{t.category?.name || t.supplier?.name || t.description?.slice(0, 40)}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-tetri-text">{t.currencyCode} {fmt(t.amount)}</p>
                  </td>
                  <td className="px-4 py-3 text-tetri-muted">{FREQ_LABELS[t.frequency] || t.frequency}</td>
                  <td className="px-4 py-3">
                    <span className={`text-sm ${isDue(t) ? 'text-amber-600 font-semibold' : 'text-tetri-muted'}`}>
                      {t.nextRunDate?.slice(0, 10)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {t.isActive ? (
                      <span className="flex items-center gap-1 text-xs text-green-700">
                        <CheckCircle className="w-3 h-3" /> Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-tetri-muted">
                        <Clock className="w-3 h-3" /> Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleGenerate(t.id)}
                        disabled={generating === t.id}
                        title="Generate expense now"
                        className="p-1.5 text-tetri-muted hover:text-tetri-blue hover:bg-blue-50 rounded transition-colors"
                      >
                        {generating === t.id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                      </button>
                      <button onClick={() => setModal(t)} className="p-1.5 text-tetri-muted hover:text-tetri-text hover:bg-tetri-bg rounded transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(t.id)} className="p-1.5 text-tetri-muted hover:text-tetri-error hover:bg-red-50 rounded transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal !== null && (
        <RecurringModal
          template={modal}
          categories={categories}
          suppliers={suppliers}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
