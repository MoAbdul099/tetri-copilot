import { useState, useEffect } from 'react';
import { Bell, Plus, Trash2, RefreshCw, Loader2, ToggleLeft, ToggleRight, Edit2, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PageHeader from '../../../components/shared/PageHeader.jsx';
import { useToast } from '../../../components/shared/Toast.jsx';
import ConfirmDialog from '../../../components/shared/ConfirmDialog.jsx';
import { listReminderRules, getReminderStats, createReminderRule, updateReminderRule, deleteReminderRule } from '../services/reminderRulesService.js';

const CATEGORIES = ['invoice', 'expense', 'compliance', 'approval', 'subscription', 'operational'];

const CAT_BADGE = {
  invoice:      'bg-indigo-50 text-indigo-700',
  expense:      'bg-orange-50 text-orange-700',
  compliance:   'bg-emerald-50 text-emerald-700',
  approval:     'bg-amber-50 text-amber-700',
  subscription: 'bg-violet-50 text-violet-700',
  operational:  'bg-slate-100 text-slate-600',
};

const PRESET_SCHEDULES = [
  { offsetDays: 30, direction: 'before', label: '30 days before' },
  { offsetDays: 14, direction: 'before', label: '14 days before' },
  { offsetDays: 7,  direction: 'before', label: '7 days before' },
  { offsetDays: 3,  direction: 'before', label: '3 days before' },
  { offsetDays: 1,  direction: 'before', label: '1 day before' },
  { offsetDays: 1,  direction: 'after',  label: '1 day overdue' },
  { offsetDays: 3,  direction: 'after',  label: '3 days overdue' },
  { offsetDays: 7,  direction: 'after',  label: '7 days overdue' },
];

function RuleForm({ initial, onSave, onCancel, saving }) {
  const [form, setForm] = useState(initial || { name: '', category: 'invoice', schedule: [] });

  const toggleSlot = (slot) => {
    const key = `${slot.offsetDays}_${slot.direction}`;
    const exists = form.schedule.some((s) => `${s.offsetDays}_${s.direction}` === key);
    setForm((f) => ({
      ...f,
      schedule: exists
        ? f.schedule.filter((s) => `${s.offsetDays}_${s.direction}` !== key)
        : [...f.schedule, slot],
    }));
  };

  const isSelected = (slot) => form.schedule.some((s) => s.offsetDays === slot.offsetDays && s.direction === slot.direction);

  return (
    <div className="bg-tetri-bg border border-tetri-border rounded-2xl p-5 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-tetri-neutral mb-1.5">Rule Name *</label>
          <input type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Invoice due reminders" className="w-full px-3 py-2 text-sm border border-tetri-border rounded-xl bg-tetri-surface focus:outline-none focus:ring-2 focus:ring-tetri-blue/20" />
        </div>
        <div>
          <label className="block text-xs font-medium text-tetri-neutral mb-1.5">Category</label>
          <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className="w-full px-3 py-2 text-sm border border-tetri-border rounded-xl bg-tetri-surface focus:outline-none focus:ring-2 focus:ring-tetri-blue/20 capitalize">
            {CATEGORIES.map((c) => <option key={c} value={c} className="capitalize">{c}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-tetri-neutral mb-2">Reminder Schedule <span className="text-tetri-neutral font-normal">(select all that apply)</span></label>
        <div className="flex flex-wrap gap-2">
          {PRESET_SCHEDULES.map((slot) => (
            <button
              key={`${slot.offsetDays}_${slot.direction}`}
              type="button"
              onClick={() => toggleSlot(slot)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                isSelected(slot)
                  ? 'bg-tetri-blue text-white border-tetri-blue'
                  : 'bg-tetri-surface text-tetri-muted border-tetri-border hover:border-tetri-blue/50 hover:text-tetri-blue'
              }`}
            >
              {slot.label}
            </button>
          ))}
        </div>
        {form.schedule.length === 0 && <p className="text-xs text-tetri-neutral mt-1.5">Select at least one schedule point.</p>}
      </div>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-xl border border-tetri-border text-tetri-muted hover:bg-tetri-bg transition-colors"><X className="w-4 h-4" /> Cancel</button>
        <Button onClick={() => onSave(form)} disabled={saving || !form.name.trim() || form.schedule.length === 0}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Check className="w-4 h-4 mr-1" />} Save Rule
        </Button>
      </div>
    </div>
  );
}

export default function ReminderRulesPage() {
  const { showToast, ToastContainer } = useToast();
  const [rules, setRules]   = useState([]);
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving]   = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([listReminderRules(), getReminderStats()])
      .then(([r, s]) => { setRules(Array.isArray(r) ? r : []); setStats(s); })
      .catch(() => showToast('error', 'Failed to load'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (form) => {
    setSaving(true);
    try {
      if (editTarget) {
        await updateReminderRule(editTarget.id, form);
        showToast('success', 'Rule updated');
        setEditTarget(null);
      } else {
        await createReminderRule(form);
        showToast('success', 'Rule created');
        setShowForm(false);
      }
      load();
    } catch (e) { showToast('error', e?.response?.data?.error || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleToggle = async (rule) => {
    try {
      await updateReminderRule(rule.id, { isActive: !rule.isActive });
      load();
    } catch { showToast('error', 'Failed to toggle'); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try { await deleteReminderRule(deleteTarget.id); showToast('success', 'Deleted'); setDeleteTarget(null); load(); }
    catch (e) { showToast('error', e?.response?.data?.error || 'Failed'); }
    finally { setDeleting(false); }
  };

  return (
    <div className="space-y-6">
      {ToastContainer}
      <ConfirmDialog open={!!deleteTarget} title="Delete Rule" description={`Delete "${deleteTarget?.name}"?`} confirmLabel="Delete" variant="destructive" loading={deleting} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />

      <PageHeader title="Reminder Rules" subtitle="Configure automated reminder schedules">
        <Button onClick={() => { setShowForm(true); setEditTarget(null); }}>
          <Plus className="w-4 h-4 mr-1" /> New Rule
        </Button>
      </PageHeader>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Rules',  value: stats.rules },
            { label: 'Active',       value: stats.active,       color: 'text-green-600' },
            { label: 'Sent Today',   value: stats.sentToday,    color: 'text-blue-600' },
            { label: 'Pending',      value: stats.pendingCount, color: 'text-amber-600' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-tetri-surface border border-tetri-border rounded-2xl p-4">
              <p className={`text-2xl font-bold ${color || 'text-tetri-text'}`}>{value ?? 0}</p>
              <p className="text-xs text-tetri-neutral mt-1">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* New rule form */}
      {showForm && !editTarget && (
        <RuleForm onSave={handleSave} onCancel={() => setShowForm(false)} saving={saving} />
      )}

      {/* Rules list */}
      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-tetri-neutral" /></div>
      ) : rules.length === 0 ? (
        <div className="bg-tetri-surface border border-tetri-border rounded-2xl text-center py-16 text-tetri-neutral">
          <Bell className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No reminder rules yet</p>
          <p className="text-sm mt-1">Create rules to automatically remind workspace members before deadlines.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rules.map((rule) => (
            <div key={rule.id}>
              {editTarget?.id === rule.id ? (
                <RuleForm initial={{ name: rule.name, category: rule.category, schedule: rule.schedule || [] }} onSave={handleSave} onCancel={() => setEditTarget(null)} saving={saving} />
              ) : (
                <div className="bg-tetri-surface border border-tetri-border rounded-2xl p-5 flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <p className="font-medium text-tetri-text">{rule.name}</p>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium capitalize ${CAT_BADGE[rule.category] || 'bg-slate-100 text-slate-600'}`}>{rule.category}</span>
                      {!rule.isActive && <span className="text-xs text-tetri-neutral bg-tetri-border/50 px-2 py-0.5 rounded-full">Inactive</span>}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {(rule.schedule || []).map((s) => (
                        <span key={`${s.offsetDays}_${s.direction}`} className={`text-xs px-2 py-0.5 rounded-lg font-medium ${s.direction === 'after' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                          {s.label || `${s.offsetDays}d ${s.direction}`}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button type="button" onClick={() => handleToggle(rule)} className={`p-1.5 rounded-lg transition-colors ${rule.isActive ? 'text-green-600 hover:bg-green-50' : 'text-tetri-neutral hover:bg-tetri-bg'}`} title={rule.isActive ? 'Deactivate' : 'Activate'}>
                      {rule.isActive ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                    </button>
                    <button type="button" onClick={() => setEditTarget(rule)} className="p-1.5 rounded-lg text-tetri-neutral hover:text-tetri-blue hover:bg-blue-50 transition-colors"><Edit2 className="w-4 h-4" /></button>
                    <button type="button" onClick={() => setDeleteTarget(rule)} className="p-1.5 rounded-lg text-tetri-neutral hover:text-tetri-error hover:bg-red-50 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
