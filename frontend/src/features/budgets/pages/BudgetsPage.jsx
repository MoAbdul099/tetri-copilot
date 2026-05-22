import { useEffect, useState, useCallback } from 'react';
import { Target, Plus, Trash2, Edit2, X, AlertTriangle, CheckCircle } from 'lucide-react';
import { listBudgets, getMonitoring, createBudget, updateBudget, deleteBudget } from '../services/budgetsService.js';
import api from '../../../lib/api.js';

const fmt = (n) => Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const ALERT_STYLES = {
  over:     'text-red-700 bg-red-100',
  critical: 'text-red-600 bg-red-50',
  warning:  'text-amber-600 bg-amber-50',
  ok:       'text-green-700 bg-green-100',
};

const PERIOD_LABELS = { monthly: 'Monthly', quarterly: 'Quarterly', annual: 'Annual', custom: 'Custom' };
const TYPE_LABELS   = { category: 'Category', department: 'Department', project: 'Project' };

function BudgetModal({ budget, categories, onClose, onSave }) {
  const isEdit = !!budget?.id;
  const [form, setForm] = useState({
    name:        budget?.name       || '',
    budgetType:  budget?.budgetType || 'category',
    amount:      budget?.amount     || '',
    currencyCode: budget?.currencyCode || 'USD',
    period:      budget?.period     || 'monthly',
    startDate:   budget?.startDate?.slice(0, 10) || new Date().toISOString().slice(0, 10),
    endDate:     budget?.endDate?.slice(0, 10)   || '',
    categoryId:  budget?.categoryId || '',
    department:  budget?.department || '',
    project:     budget?.project    || '',
    alertAt75:   budget?.alertAt75  !== false,
    alertAt90:   budget?.alertAt90  !== false,
    alertAt100:  budget?.alertAt100 !== false,
  });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } catch { /* ignore */ } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-tetri-surface rounded-card border border-tetri-border w-full max-w-lg shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-tetri-border">
          <h2 className="font-semibold text-tetri-text">{isEdit ? 'Edit Budget' : 'Create Budget'}</h2>
          <button onClick={onClose} className="text-tetri-muted hover:text-tetri-text"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          <div>
            <label className="text-xs font-medium text-tetri-muted block mb-1">Budget Name *</label>
            <input required value={form.name} onChange={e => set('name', e.target.value)} className="w-full px-3 py-2 text-sm border border-tetri-border rounded-lg bg-tetri-bg focus:outline-none focus:ring-2 focus:ring-tetri-blue/30" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-tetri-muted block mb-1">Budget Type</label>
              <select value={form.budgetType} onChange={e => set('budgetType', e.target.value)} className="w-full px-3 py-2 text-sm border border-tetri-border rounded-lg bg-tetri-bg focus:outline-none">
                <option value="category">Category</option>
                <option value="department">Department</option>
                <option value="project">Project</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-tetri-muted block mb-1">Period</label>
              <select value={form.period} onChange={e => set('period', e.target.value)} className="w-full px-3 py-2 text-sm border border-tetri-border rounded-lg bg-tetri-bg focus:outline-none">
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="annual">Annual</option>
              </select>
            </div>
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
          {form.budgetType === 'category' && (
            <div>
              <label className="text-xs font-medium text-tetri-muted block mb-1">Category</label>
              <select value={form.categoryId} onChange={e => set('categoryId', e.target.value)} className="w-full px-3 py-2 text-sm border border-tetri-border rounded-lg bg-tetri-bg focus:outline-none">
                <option value="">All categories</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          )}
          {form.budgetType === 'department' && (
            <div>
              <label className="text-xs font-medium text-tetri-muted block mb-1">Department</label>
              <input value={form.department} onChange={e => set('department', e.target.value)} className="w-full px-3 py-2 text-sm border border-tetri-border rounded-lg bg-tetri-bg focus:outline-none" />
            </div>
          )}
          {form.budgetType === 'project' && (
            <div>
              <label className="text-xs font-medium text-tetri-muted block mb-1">Project</label>
              <input value={form.project} onChange={e => set('project', e.target.value)} className="w-full px-3 py-2 text-sm border border-tetri-border rounded-lg bg-tetri-bg focus:outline-none" />
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-tetri-muted block mb-1">Start Date *</label>
              <input required type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} className="w-full px-3 py-2 text-sm border border-tetri-border rounded-lg bg-tetri-bg focus:outline-none" />
            </div>
            <div>
              <label className="text-xs font-medium text-tetri-muted block mb-1">End Date</label>
              <input type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)} className="w-full px-3 py-2 text-sm border border-tetri-border rounded-lg bg-tetri-bg focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-tetri-muted block mb-2">Threshold Alerts</label>
            <div className="flex gap-4">
              {[['alertAt75','75%'],['alertAt90','90%'],['alertAt100','100%']].map(([k,label]) => (
                <label key={k} className="flex items-center gap-1.5 text-sm text-tetri-text cursor-pointer">
                  <input type="checkbox" checked={form[k]} onChange={e => set(k, e.target.checked)} className="accent-tetri-blue" />
                  {label}
                </label>
              ))}
            </div>
          </div>
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

export default function BudgetsPage() {
  const [monitoring, setMonitoring] = useState([]);
  const [categories, setCategories] = useState([]);
  const [modal, setModal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [m, cats] = await Promise.all([
        getMonitoring(),
        api.get('/api/v1/expense-categories').then(r => r.data.data?.items || r.data.data || []),
      ]);
      setMonitoring(m);
      setCategories(cats);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (form) => {
    if (modal?.id) await updateBudget(modal.id, form);
    else           await createBudget(form);
    await load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this budget?')) return;
    setDeleting(id);
    try { await deleteBudget(id); await load(); } catch { /* ignore */ } finally { setDeleting(null); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-tetri-text">Budget Monitoring</h1>
          <p className="text-tetri-muted text-sm mt-0.5">Track spending against defined budgets</p>
        </div>
        <button onClick={() => setModal({})} className="flex items-center gap-2 px-4 py-2 bg-tetri-blue text-white text-sm rounded-lg hover:bg-tetri-blue-hover transition-colors">
          <Plus className="w-4 h-4" /> New Budget
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-tetri-blue border-t-transparent rounded-full animate-spin" /></div>
      ) : monitoring.length === 0 ? (
        <div className="bg-tetri-surface border border-tetri-border rounded-card p-12 text-center">
          <Target className="w-10 h-10 text-tetri-neutral mx-auto mb-3" />
          <p className="font-semibold text-tetri-text mb-1">No budgets yet</p>
          <p className="text-tetri-muted text-sm mb-4">Create budgets to track spending by category, department, or project.</p>
          <button onClick={() => setModal({})} className="px-4 py-2 bg-tetri-blue text-white text-sm rounded-lg hover:bg-tetri-blue-hover transition-colors">Create Budget</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {monitoring.map((b) => (
            <div key={b.id} className="bg-tetri-surface border border-tetri-border rounded-card p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-tetri-text">{b.name}</p>
                  <p className="text-xs text-tetri-muted mt-0.5">{TYPE_LABELS[b.budgetType]} · {PERIOD_LABELS[b.period]}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setModal(b)} className="p-1.5 text-tetri-muted hover:text-tetri-text hover:bg-tetri-bg rounded transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(b.id)} disabled={deleting === b.id} className="p-1.5 text-tetri-muted hover:text-tetri-error hover:bg-red-50 rounded transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>

              {b.category && <p className="text-xs text-tetri-muted mb-3">{b.category.name}</p>}
              {b.department && <p className="text-xs text-tetri-muted mb-3">{b.department}</p>}
              {b.project && <p className="text-xs text-tetri-muted mb-3">{b.project}</p>}

              {/* Utilization bar */}
              <div className="mb-3">
                <div className="flex justify-between text-xs text-tetri-muted mb-1">
                  <span>Utilization</span>
                  <span className={`font-semibold ${b.alertLevel === 'over' || b.alertLevel === 'critical' ? 'text-red-600' : b.alertLevel === 'warning' ? 'text-amber-600' : 'text-green-600'}`}>{b.utilization}%</span>
                </div>
                <div className="w-full bg-tetri-bg rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${b.alertLevel === 'over' ? 'bg-red-500' : b.alertLevel === 'critical' ? 'bg-red-400' : b.alertLevel === 'warning' ? 'bg-amber-400' : 'bg-green-400'}`}
                    style={{ width: `${Math.min(b.utilization, 100)}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-tetri-bg rounded-lg p-2">
                  <p className="text-tetri-muted">Budget</p>
                  <p className="font-semibold text-tetri-text">{fmt(b.amount)}</p>
                </div>
                <div className="bg-tetri-bg rounded-lg p-2">
                  <p className="text-tetri-muted">Spent</p>
                  <p className="font-semibold text-tetri-text">{fmt(b.spent)}</p>
                </div>
                <div className="bg-tetri-bg rounded-lg p-2">
                  <p className="text-tetri-muted">Left</p>
                  <p className={`font-semibold ${b.remaining <= 0 ? 'text-red-600' : 'text-green-600'}`}>{fmt(b.remaining)}</p>
                </div>
              </div>

              {b.alertLevel !== 'ok' && (
                <div className={`mt-3 flex items-center gap-1.5 text-xs px-2 py-1.5 rounded-lg ${ALERT_STYLES[b.alertLevel]}`}>
                  {b.alertLevel === 'over' ? <AlertTriangle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                  {b.alertLevel === 'over' ? 'Budget exceeded' : b.alertLevel === 'critical' ? 'Critical — near limit' : 'Warning — 75%+ used'}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {modal !== null && (
        <BudgetModal
          budget={modal}
          categories={categories}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
