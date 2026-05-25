import { useState, useEffect } from 'react';
import { Siren, Plus, Trash2, Edit2, ToggleLeft, ToggleRight, Check, X, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PageHeader from '../../../components/shared/PageHeader.jsx';
import { useToast } from '../../../components/shared/Toast.jsx';
import ConfirmDialog from '../../../components/shared/ConfirmDialog.jsx';
import {
  listEscalationRules, getEscalationStats, listEscalationInstances,
  createEscalationRule, updateEscalationRule, deleteEscalationRule, resolveEscalationInstance,
} from '../services/escalationRulesService.js';

const TRIGGER_TYPES = [
  { value: 'approval_overdue',  label: 'Approval Overdue' },
  { value: 'invoice_overdue',   label: 'Invoice Overdue' },
  { value: 'compliance_overdue',label: 'Compliance Overdue' },
  { value: 'payment_failure',   label: 'Payment Failure' },
  { value: 'subscription_risk', label: 'Subscription Risk' },
];

const NOTIFY_ROLES = ['admin', 'owner', 'user'];

function LevelRow({ level, onChange, onRemove }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-tetri-surface border border-tetri-border rounded-xl">
      <span className="w-6 h-6 rounded-full bg-tetri-blue text-white text-xs font-bold flex items-center justify-center flex-shrink-0">{level.level}</span>
      <div className="flex-1 grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[10px] font-medium text-tetri-neutral mb-1">After (days)</label>
          <input type="number" min={1} value={level.afterDays} onChange={(e) => onChange({ ...level, afterDays: parseInt(e.target.value) || 1 })} className="w-full px-2 py-1.5 text-sm border border-tetri-border rounded-lg bg-tetri-bg focus:outline-none focus:ring-1 focus:ring-tetri-blue/30" />
        </div>
        <div>
          <label className="block text-[10px] font-medium text-tetri-neutral mb-1">Notify roles</label>
          <div className="flex gap-2">
            {NOTIFY_ROLES.map((role) => (
              <label key={role} className="flex items-center gap-1 cursor-pointer">
                <input type="checkbox" checked={(level.notifyRoles || []).includes(role)} onChange={(e) => {
                  const roles = level.notifyRoles || [];
                  onChange({ ...level, notifyRoles: e.target.checked ? [...roles, role] : roles.filter((r) => r !== role) });
                }} className="w-3 h-3 rounded" />
                <span className="text-xs text-tetri-muted capitalize">{role}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
      <button type="button" onClick={onRemove} className="p-1 rounded-lg text-tetri-neutral hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"><X className="w-4 h-4" /></button>
    </div>
  );
}

function RuleForm({ initial, onSave, onCancel, saving }) {
  const [form, setForm] = useState(initial || { name: '', triggerType: 'approval_overdue', levels: [] });

  const addLevel = () => setForm((f) => ({
    ...f,
    levels: [...f.levels, { level: f.levels.length + 1, afterDays: (f.levels.length + 1) * 3, notifyRoles: ['admin'] }],
  }));

  const updateLevel = (i, val) => setForm((f) => ({ ...f, levels: f.levels.map((l, idx) => idx === i ? val : l) }));
  const removeLevel = (i) => setForm((f) => ({ ...f, levels: f.levels.filter((_, idx) => idx !== i).map((l, idx) => ({ ...l, level: idx + 1 })) }));

  return (
    <div className="bg-tetri-bg border border-tetri-border rounded-2xl p-5 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-tetri-neutral mb-1.5">Rule Name *</label>
          <input type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Approval escalation" className="w-full px-3 py-2 text-sm border border-tetri-border rounded-xl bg-tetri-surface focus:outline-none focus:ring-2 focus:ring-tetri-blue/20" />
        </div>
        <div>
          <label className="block text-xs font-medium text-tetri-neutral mb-1.5">Trigger</label>
          <select value={form.triggerType} onChange={(e) => setForm((f) => ({ ...f, triggerType: e.target.value }))} className="w-full px-3 py-2 text-sm border border-tetri-border rounded-xl bg-tetri-surface focus:outline-none focus:ring-2 focus:ring-tetri-blue/20">
            {TRIGGER_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium text-tetri-neutral">Escalation Levels</label>
          <button type="button" onClick={addLevel} className="text-xs text-tetri-blue hover:underline flex items-center gap-1"><Plus className="w-3 h-3" /> Add Level</button>
        </div>
        {form.levels.length === 0 ? (
          <p className="text-xs text-tetri-neutral text-center py-3">No levels yet. Add at least one.</p>
        ) : (
          <div className="space-y-2">
            {form.levels.map((level, i) => (
              <LevelRow key={i} level={level} onChange={(v) => updateLevel(i, v)} onRemove={() => removeLevel(i)} />
            ))}
          </div>
        )}
      </div>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-xl border border-tetri-border text-tetri-muted hover:bg-tetri-bg transition-colors"><X className="w-4 h-4" /> Cancel</button>
        <Button onClick={() => onSave(form)} disabled={saving || !form.name.trim() || form.levels.length === 0}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Check className="w-4 h-4 mr-1" />} Save Rule
        </Button>
      </div>
    </div>
  );
}

export default function EscalationRulesPage() {
  const { showToast, ToastContainer } = useToast();
  const [rules, setRules]       = useState([]);
  const [stats, setStats]       = useState(null);
  const [instances, setInstances] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving]     = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [tab, setTab]           = useState('rules');

  const load = () => {
    setLoading(true);
    Promise.all([listEscalationRules(), getEscalationStats(), listEscalationInstances({ status: 'active' })])
      .then(([r, s, inst]) => {
        setRules(Array.isArray(r) ? r : []);
        setStats(s);
        const instArr = Array.isArray(inst) ? inst : (inst?.items || []);
        setInstances(instArr);
      })
      .catch(() => showToast('error', 'Failed to load'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (form) => {
    setSaving(true);
    try {
      if (editTarget) { await updateEscalationRule(editTarget.id, form); showToast('success', 'Updated'); setEditTarget(null); }
      else { await createEscalationRule(form); showToast('success', 'Created'); setShowForm(false); }
      load();
    } catch (e) { showToast('error', e?.response?.data?.error || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleToggle = async (rule) => {
    try { await updateEscalationRule(rule.id, { isActive: !rule.isActive }); load(); }
    catch { showToast('error', 'Failed to toggle'); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try { await deleteEscalationRule(deleteTarget.id); showToast('success', 'Deleted'); setDeleteTarget(null); load(); }
    catch (e) { showToast('error', e?.response?.data?.error || 'Failed'); }
    finally { setDeleting(false); }
  };

  const handleResolve = async (id) => {
    try { await resolveEscalationInstance(id); showToast('success', 'Resolved'); load(); }
    catch { showToast('error', 'Failed to resolve'); }
  };

  const triggerLabel = (t) => TRIGGER_TYPES.find((x) => x.value === t)?.label || t;

  return (
    <div className="space-y-6">
      {ToastContainer}
      <ConfirmDialog open={!!deleteTarget} title="Delete Rule" description={`Delete "${deleteTarget?.name}"?`} confirmLabel="Delete" variant="destructive" loading={deleting} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />

      <PageHeader title="Escalation Rules" subtitle="Define escalation workflows for overdue activities">
        {tab === 'rules' && (
          <Button onClick={() => { setShowForm(true); setEditTarget(null); }}>
            <Plus className="w-4 h-4 mr-1" /> New Rule
          </Button>
        )}
      </PageHeader>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Active Escalations', value: stats.active,   color: 'text-red-500' },
            { label: 'Resolved',           value: stats.resolved, color: 'text-green-600' },
            { label: 'Total Rules',        value: rules.length },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-tetri-surface border border-tetri-border rounded-2xl p-4">
              <p className={`text-2xl font-bold ${color || 'text-tetri-text'}`}>{value ?? 0}</p>
              <p className="text-xs text-tetri-neutral mt-1">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-tetri-border">
        {['rules', 'instances'].map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${tab === t ? 'border-tetri-blue text-tetri-blue' : 'border-transparent text-tetri-muted hover:text-tetri-text'}`}>
            {t === 'instances' ? `Active Escalations (${instances.length})` : 'Rules'}
          </button>
        ))}
      </div>

      {tab === 'rules' && (
        <>
          {showForm && !editTarget && <RuleForm onSave={handleSave} onCancel={() => setShowForm(false)} saving={saving} />}
          {loading ? (
            <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-tetri-neutral" /></div>
          ) : rules.length === 0 ? (
            <div className="bg-tetri-surface border border-tetri-border rounded-2xl text-center py-16 text-tetri-neutral">
              <Siren className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No escalation rules yet</p>
              <p className="text-sm mt-1">Create rules to automatically escalate overdue activities to managers.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {rules.map((rule) => (
                <div key={rule.id}>
                  {editTarget?.id === rule.id ? (
                    <RuleForm initial={{ name: rule.name, triggerType: rule.triggerType, levels: rule.levels || [] }} onSave={handleSave} onCancel={() => setEditTarget(null)} saving={saving} />
                  ) : (
                    <div className="bg-tetri-surface border border-tetri-border rounded-2xl p-5 flex items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="font-medium text-tetri-text">{rule.name}</p>
                          <span className="text-xs px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600">{triggerLabel(rule.triggerType)}</span>
                          {!rule.isActive && <span className="text-xs text-tetri-neutral bg-tetri-border/50 px-2 py-0.5 rounded-full">Inactive</span>}
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          {(rule.levels || []).map((l) => (
                            <span key={l.level} className="text-xs bg-tetri-bg border border-tetri-border px-2 py-1 rounded-lg text-tetri-muted">
                              L{l.level}: {l.afterDays}d → {(l.notifyRoles || []).join(', ')}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button type="button" onClick={() => handleToggle(rule)} className={`p-1.5 rounded-lg transition-colors ${rule.isActive ? 'text-green-600 hover:bg-green-50' : 'text-tetri-neutral hover:bg-tetri-bg'}`}>
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
        </>
      )}

      {tab === 'instances' && (
        instances.length === 0 ? (
          <div className="bg-tetri-surface border border-tetri-border rounded-2xl text-center py-16 text-tetri-neutral">
            <CheckCircle2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No active escalations</p>
            <p className="text-sm mt-1">All escalations are resolved.</p>
          </div>
        ) : (
          <div className="bg-tetri-surface border border-tetri-border rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-tetri-border bg-tetri-bg">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-tetri-neutral uppercase tracking-wider">Rule</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-tetri-neutral uppercase tracking-wider">Entity</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-tetri-neutral uppercase tracking-wider">Level</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-tetri-neutral uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-tetri-border">
                {instances.map((inst) => (
                  <tr key={inst.id} className="hover:bg-tetri-bg/50 transition-colors">
                    <td className="px-5 py-3.5 text-tetri-text font-medium">{inst.rule?.name || '—'}</td>
                    <td className="px-5 py-3.5 text-tetri-neutral text-xs font-mono">{inst.entityType} / {inst.entityId?.slice(0, 8)}…</td>
                    <td className="px-5 py-3.5"><span className="px-2 py-0.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium">Level {inst.currentLevel}</span></td>
                    <td className="px-5 py-3.5"><span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-lg text-xs font-medium capitalize">{inst.status}</span></td>
                    <td className="px-5 py-3.5">
                      <button onClick={() => handleResolve(inst.id)} className="flex items-center gap-1 text-xs text-green-600 hover:text-green-700 font-medium transition-colors">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Resolve
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
}
