import { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck, Plus, Search, RefreshCw, Globe, Building2,
  FileText, CheckCircle2, Archive, Eye, Copy, Pencil, Trash2,
  ChevronDown, ChevronUp, X, Save, Loader2, AlertTriangle,
} from 'lucide-react';
import svc from '../services/complianceService';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const FREQUENCIES = ['daily', 'weekly', 'monthly', 'quarterly', 'semi-annual', 'annual', 'custom'];
const CATEGORIES  = ['Tax', 'Accounting', 'HR', 'Corporate', 'Regulatory', 'Industry Specific'];
const PRIORITIES  = ['low', 'medium', 'high', 'critical'];
const INDUSTRIES  = ['General Business', 'Retail', 'Construction', 'Healthcare', 'Hospitality', 'Technology', 'Finance', 'Manufacturing'];
const MONTHS      = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const STATUS_BADGE = {
  draft:     'bg-yellow-100 text-yellow-800',
  published: 'bg-green-100 text-green-800',
  archived:  'bg-gray-100 text-gray-600',
};

const PRIORITY_BADGE = {
  low:      'bg-blue-50 text-blue-700',
  medium:   'bg-yellow-50 text-yellow-700',
  high:     'bg-orange-50 text-orange-700',
  critical: 'bg-red-50 text-red-700',
};

function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''; }

// ─── KPI Strip ────────────────────────────────────────────────────────────────

function KpiCard({ icon: Icon, label, value, color = 'text-gray-700' }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl px-5 py-4 flex items-center gap-4 shadow-sm">
      <div className="p-2 rounded-lg bg-gray-50"><Icon className={`w-5 h-5 ${color}`} /></div>
      <div>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <p className={`text-2xl font-bold ${color}`}>{value ?? '—'}</p>
      </div>
    </div>
  );
}

// ─── Obligation Row ───────────────────────────────────────────────────────────

function ObligationRow({ ob, templateId, onUpdated, onDeleted }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm]       = useState(ob);
  const [saving, setSaving]   = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const save = async () => {
    setSaving(true);
    try {
      const updated = await svc.updateObligation(templateId, ob.id, form);
      onUpdated(updated);
      setEditing(false);
    } finally { setSaving(false); }
  };

  const del = async () => {
    if (!confirm(`Remove "${ob.name}"?`)) return;
    await svc.deleteObligation(templateId, ob.id);
    onDeleted(ob.id);
  };

  if (editing) {
    return (
      <tr className="bg-blue-50">
        <td className="px-4 py-3" colSpan={5}>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Name *</label>
              <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={form.name} onChange={set('name')} />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Frequency *</label>
              <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={form.frequency} onChange={set('frequency')}>
                {FREQUENCIES.map(f => <option key={f} value={f}>{cap(f)}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Category</label>
              <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={form.category || ''} onChange={set('category')}>
                <option value="">— None —</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Priority</label>
              <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={form.priority} onChange={set('priority')}>
                {PRIORITIES.map(p => <option key={p} value={p}>{cap(p)}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Due Day of Month</label>
              <input type="number" min={1} max={31} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={form.dueDayOfMonth || ''} onChange={set('dueDayOfMonth')} placeholder="e.g. 15" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Due Month of Year</label>
              <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={form.dueMonthOfYear || ''} onChange={set('dueMonthOfYear')}>
                <option value="">— Any —</option>
                {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Reminder Days Before</label>
              <input type="number" min={0} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={form.reminderDays || ''} onChange={set('reminderDays')} />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Submission Method</label>
              <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={form.submissionMethod || ''} onChange={set('submissionMethod')} placeholder="e.g. Online portal" />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-gray-500 mb-1 block">Description</label>
              <textarea rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none" value={form.description || ''} onChange={set('description')} />
            </div>
            <div className="col-span-2 flex gap-2 justify-end">
              <button onClick={() => setEditing(false)} className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={save} disabled={saving} className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1.5">
                {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} Save
              </button>
            </div>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-t border-gray-100 hover:bg-gray-50">
      <td className="px-4 py-3 text-sm font-medium text-gray-800">{ob.name}</td>
      <td className="px-4 py-3 text-sm text-gray-600">{cap(ob.frequency)}</td>
      <td className="px-4 py-3">
        {ob.category && <span className="px-2 py-0.5 rounded-full text-xs bg-indigo-50 text-indigo-700">{ob.category}</span>}
      </td>
      <td className="px-4 py-3">
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PRIORITY_BADGE[ob.priority] || ''}`}>{cap(ob.priority)}</span>
      </td>
      <td className="px-4 py-3 text-right">
        <button onClick={() => setEditing(true)} className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-blue-600 mr-1"><Pencil className="w-3.5 h-3.5" /></button>
        <button onClick={del} className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
      </td>
    </tr>
  );
}

// ─── Add Obligation Form ──────────────────────────────────────────────────────

function AddObligationForm({ templateId, onAdded, onCancel }) {
  const [form, setForm] = useState({ name: '', frequency: 'monthly', category: '', priority: 'medium', dueDayOfMonth: '', dueMonthOfYear: '', reminderDays: 7, submissionMethod: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const save = async () => {
    if (!form.name) { setErr('Name is required'); return; }
    setSaving(true);
    try {
      const ob = await svc.createObligation(templateId, form);
      onAdded(ob);
    } catch (e) {
      setErr(e?.response?.data?.error || 'Failed to add obligation');
    } finally { setSaving(false); }
  };

  return (
    <tr className="bg-green-50">
      <td className="px-4 py-4" colSpan={5}>
        <p className="text-xs font-semibold text-gray-700 mb-3">New Obligation</p>
        {err && <p className="text-xs text-red-600 mb-2">{err}</p>}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Name *</label>
            <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={form.name} onChange={set('name')} placeholder="e.g. VAT Return Filing" />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Frequency *</label>
            <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={form.frequency} onChange={set('frequency')}>
              {FREQUENCIES.map(f => <option key={f} value={f}>{cap(f)}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Category</label>
            <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={form.category} onChange={set('category')}>
              <option value="">— None —</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Priority</label>
            <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={form.priority} onChange={set('priority')}>
              {PRIORITIES.map(p => <option key={p} value={p}>{cap(p)}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Due Day of Month</label>
            <input type="number" min={1} max={31} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={form.dueDayOfMonth} onChange={set('dueDayOfMonth')} placeholder="e.g. 28" />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Due Month of Year</label>
            <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={form.dueMonthOfYear} onChange={set('dueMonthOfYear')}>
              <option value="">— Any —</option>
              {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Reminder Days Before</label>
            <input type="number" min={0} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={form.reminderDays} onChange={set('reminderDays')} />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Submission Method</label>
            <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={form.submissionMethod} onChange={set('submissionMethod')} placeholder="e.g. FTA online portal" />
          </div>
          <div className="col-span-2">
            <label className="text-xs text-gray-500 mb-1 block">Description</label>
            <textarea rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none" value={form.description} onChange={set('description')} />
          </div>
          <div className="col-span-2 flex gap-2 justify-end">
            <button onClick={onCancel} className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
            <button onClick={save} disabled={saving} className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-1.5">
              {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />} Add Obligation
            </button>
          </div>
        </div>
      </td>
    </tr>
  );
}

// ─── Template Detail Panel ────────────────────────────────────────────────────

function TemplateDetail({ templateId, jurisdictions, onClose, onUpdated }) {
  const [template, setTemplate] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [editing, setEditing]   = useState(false);
  const [form, setForm]         = useState({});
  const [saving, setSaving]     = useState(false);
  const [addingOb, setAddingOb] = useState(false);
  const [impact, setImpact]     = useState(null);
  const [tab, setTab]           = useState('obligations');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const t = await svc.getTemplate(templateId);
      setTemplate(t);
      setForm({ name: t.name, description: t.description || '', jurisdictionId: t.jurisdictionId, industry: t.industry || '', version: t.version, versionNotes: t.versionNotes || '', effectiveDate: t.effectiveDate ? t.effectiveDate.slice(0, 10) : '' });
    } finally { setLoading(false); }
  }, [templateId]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (tab === 'impact') svc.getWorkspaceImpact(templateId).then(setImpact).catch(() => {});
  }, [tab, templateId]);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const saveEdit = async () => {
    setSaving(true);
    try {
      const updated = await svc.updateTemplate(templateId, form);
      setTemplate(updated);
      onUpdated(updated);
      setEditing(false);
    } finally { setSaving(false); }
  };

  const handlePublish = async () => {
    const updated = await svc.publishTemplate(templateId);
    setTemplate(updated);
    onUpdated(updated);
  };

  const handleArchive = async () => {
    if (!confirm('Archive this template?')) return;
    const updated = await svc.archiveTemplate(templateId);
    setTemplate(updated);
    onUpdated(updated);
  };

  const handleClone = async () => {
    await svc.cloneTemplate(templateId);
    onUpdated(null); // refresh list
    onClose();
  };

  const obUpdated = (updated) => setTemplate(t => ({ ...t, items: t.items.map(o => o.id === updated.id ? updated : o) }));
  const obAdded   = (ob)      => { setTemplate(t => ({ ...t, items: [...t.items, ob] })); setAddingOb(false); };
  const obDeleted = (id)      => setTemplate(t => ({ ...t, items: t.items.filter(o => o.id !== id) }));

  if (loading) return (
    <div className="fixed inset-0 bg-black/30 z-40 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-8 flex items-center gap-3">
        <Loader2 className="w-5 h-5 animate-spin text-blue-600" /> Loading template…
      </div>
    </div>
  );

  if (!template) return null;

  return (
    <div className="fixed inset-0 bg-black/30 z-40 flex items-end md:items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-100">
          <div>
            {editing ? (
              <input className="text-lg font-bold text-gray-900 border-b border-blue-400 bg-transparent outline-none w-80" value={form.name} onChange={set('name')} />
            ) : (
              <h2 className="text-lg font-bold text-gray-900">{template.name}</h2>
            )}
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[template.status]}`}>{cap(template.status)}</span>
              <span className="text-xs text-gray-400">v{template.version}</span>
              <span className="text-xs text-gray-400">· {template.jurisdiction?.name}</span>
              {template.industry && <span className="text-xs text-gray-400">· {template.industry}</span>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!editing && (
              <>
                <button onClick={() => setEditing(true)} className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-1"><Pencil className="w-3 h-3" /> Edit</button>
                <button onClick={handleClone} className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-1"><Copy className="w-3 h-3" /> Clone</button>
                {template.status !== 'archived' && (
                  <button onClick={handlePublish} className={`px-3 py-1.5 text-xs rounded-lg flex items-center gap-1 ${template.status === 'published' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200 hover:bg-yellow-100' : 'bg-green-600 text-white hover:bg-green-700'}`}>
                    <CheckCircle2 className="w-3 h-3" /> {template.status === 'published' ? 'Unpublish' : 'Publish'}
                  </button>
                )}
                {template.status !== 'archived' && (
                  <button onClick={handleArchive} className="px-3 py-1.5 text-xs bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 flex items-center gap-1"><Archive className="w-3 h-3" /> Archive</button>
                )}
              </>
            )}
            {editing && (
              <>
                <button onClick={() => setEditing(false)} className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
                <button onClick={saveEdit} disabled={saving} className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1">
                  {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} Save
                </button>
              </>
            )}
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 ml-1"><X className="w-4 h-4" /></button>
          </div>
        </div>

        {/* Edit fields */}
        {editing && (
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Jurisdiction</label>
              <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white" value={form.jurisdictionId} onChange={set('jurisdictionId')}>
                {jurisdictions.map(j => <option key={j.id} value={j.id}>{j.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Industry</label>
              <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white" value={form.industry} onChange={set('industry')}>
                <option value="">— General —</option>
                {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Version</label>
              <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white" value={form.version} onChange={set('version')} />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Effective Date</label>
              <input type="date" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white" value={form.effectiveDate} onChange={set('effectiveDate')} />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-gray-500 mb-1 block">Version Notes</label>
              <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white" value={form.versionNotes} onChange={set('versionNotes')} placeholder="What changed in this version?" />
            </div>
            <div className="col-span-3">
              <label className="text-xs text-gray-500 mb-1 block">Description</label>
              <textarea rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white resize-none" value={form.description} onChange={set('description')} />
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 px-6 pt-4 border-b border-gray-100">
          {['obligations', 'details', 'impact'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg ${tab === t ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
              {cap(t)} {t === 'obligations' && `(${template.items?.length ?? 0})`}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto">
          {tab === 'obligations' && (
            <div>
              <div className="flex items-center justify-between px-6 pt-4 pb-2">
                <p className="text-sm font-semibold text-gray-700">Regulatory Obligations</p>
                {template.status !== 'archived' && (
                  <button onClick={() => setAddingOb(true)} className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1"><Plus className="w-3 h-3" /> Add Obligation</button>
                )}
              </div>
              {template.items?.length === 0 && !addingOb ? (
                <div className="text-center py-12 text-gray-400 text-sm">No obligations yet. Add the first one.</div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 text-xs text-gray-500 font-medium">
                      <th className="px-4 py-2 text-left">Obligation</th>
                      <th className="px-4 py-2 text-left">Frequency</th>
                      <th className="px-4 py-2 text-left">Category</th>
                      <th className="px-4 py-2 text-left">Priority</th>
                      <th className="px-4 py-2" />
                    </tr>
                  </thead>
                  <tbody>
                    {addingOb && <AddObligationForm templateId={templateId} onAdded={obAdded} onCancel={() => setAddingOb(false)} />}
                    {template.items?.map(ob => (
                      <ObligationRow key={ob.id} ob={ob} templateId={templateId} onUpdated={obUpdated} onDeleted={obDeleted} />
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {tab === 'details' && (
            <div className="px-6 py-4 space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                {[
                  ['Jurisdiction', template.jurisdiction?.name],
                  ['Country Code', template.jurisdiction?.isoCode || template.jurisdiction?.code],
                  ['Industry', template.industry || '—'],
                  ['Version', template.version],
                  ['Status', cap(template.status)],
                  ['Effective Date', template.effectiveDate ? template.effectiveDate.slice(0, 10) : '—'],
                  ['Published', template.publishedAt ? new Date(template.publishedAt).toLocaleDateString() : '—'],
                  ['Created', new Date(template.createdAt).toLocaleDateString()],
                ].map(([k, v]) => (
                  <div key={k} className="bg-gray-50 rounded-lg px-4 py-3">
                    <p className="text-xs text-gray-400 mb-0.5">{k}</p>
                    <p className="font-medium text-gray-800">{v || '—'}</p>
                  </div>
                ))}
                {template.description && (
                  <div className="col-span-2 bg-gray-50 rounded-lg px-4 py-3">
                    <p className="text-xs text-gray-400 mb-0.5">Description</p>
                    <p className="text-gray-800">{template.description}</p>
                  </div>
                )}
                {template.versionNotes && (
                  <div className="col-span-2 bg-blue-50 rounded-lg px-4 py-3">
                    <p className="text-xs text-blue-400 mb-0.5">Version Notes</p>
                    <p className="text-blue-800">{template.versionNotes}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === 'impact' && (
            <div className="px-6 py-4">
              {!impact ? (
                <div className="flex items-center gap-2 text-gray-400 text-sm py-8 justify-center"><Loader2 className="w-4 h-4 animate-spin" /> Loading impact…</div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-xl px-5 py-4">
                      <p className="text-xs text-blue-500 mb-1">Assigned Jurisdiction</p>
                      <p className="text-lg font-bold text-blue-900">{impact.jurisdictionName}</p>
                    </div>
                    <div className="bg-green-50 rounded-xl px-5 py-4">
                      <p className="text-xs text-green-500 mb-1">Affected Workspaces</p>
                      <p className="text-lg font-bold text-green-900">{impact.affectedWorkspaces}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">Workspaces are counted by those using a country profile matching the template's jurisdiction ISO code.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Create Template Modal ────────────────────────────────────────────────────

function CreateModal({ jurisdictions, onCreated, onClose }) {
  const [form, setForm] = useState({ name: '', description: '', jurisdictionId: jurisdictions[0]?.id || '', industry: '', version: '1.0', versionNotes: '', effectiveDate: '' });
  const [saving, setSaving] = useState(false);
  const [err, setErr]       = useState('');

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    if (!form.name || !form.jurisdictionId) { setErr('Name and jurisdiction are required'); return; }
    setSaving(true);
    try {
      const t = await svc.createTemplate(form);
      onCreated(t);
    } catch (e) {
      setErr(e?.response?.data?.error || 'Failed to create template');
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">New Compliance Template</h3>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-gray-100 text-gray-400"><X className="w-4 h-4" /></button>
        </div>
        <div className="px-6 py-4 space-y-4">
          {err && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{err}</p>}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Template Name *</label>
            <input className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-200" value={form.name} onChange={set('name')} placeholder="e.g. UAE General Business — VAT Compliance" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Jurisdiction *</label>
              <select className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-200" value={form.jurisdictionId} onChange={set('jurisdictionId')}>
                <option value="">— Select —</option>
                {jurisdictions.map(j => <option key={j.id} value={j.id}>{j.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Industry</label>
              <select className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-200" value={form.industry} onChange={set('industry')}>
                <option value="">General Business</option>
                {INDUSTRIES.filter(i => i !== 'General Business').map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Version</label>
              <input className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-200" value={form.version} onChange={set('version')} placeholder="1.0" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Effective Date</label>
              <input type="date" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-200" value={form.effectiveDate} onChange={set('effectiveDate')} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Description</label>
            <textarea rows={3} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-200 resize-none" value={form.description} onChange={set('description')} placeholder="Brief summary of this compliance template…" />
          </div>
        </div>
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 text-sm border border-gray-200 rounded-xl hover:bg-gray-50">Cancel</button>
          <button onClick={submit} disabled={saving} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-700 flex items-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Create Template
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CompliancePage() {
  const [stats, setStats]               = useState(null);
  const [templates, setTemplates]       = useState([]);
  const [jurisdictions, setJurisdictions] = useState([]);
  const [total, setTotal]               = useState(0);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterJur, setFilterJur]       = useState('');
  const [page, setPage]                 = useState(1);
  const [selectedId, setSelectedId]     = useState(null);
  const [creating, setCreating]         = useState(false);
  const [sortField, setSortField]       = useState('createdAt');
  const [sortDir, setSortDir]           = useState('desc');
  const LIMIT = 15;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [s, j, result] = await Promise.all([
        svc.getStats(),
        svc.listJurisdictions(),
        svc.listTemplates({ search, status: filterStatus, jurisdictionId: filterJur, page, limit: LIMIT }),
      ]);
      setStats(s);
      setJurisdictions(j);
      setTemplates(result.items || []);
      setTotal(result.total || 0);
    } finally { setLoading(false); }
  }, [search, filterStatus, filterJur, page]);

  useEffect(() => { load(); }, [load]);

  const handleCreated = (t) => { setCreating(false); load(); };
  const handleUpdated = ()   => load();

  const toggleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const SortIcon = ({ field }) => sortField === field
    ? (sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)
    : null;

  const sorted = [...templates].sort((a, b) => {
    let av = a[sortField] ?? '', bv = b[sortField] ?? '';
    if (sortField === 'createdAt') { av = new Date(av); bv = new Date(bv); }
    if (sortField === 'jurisdiction') { av = a.jurisdiction?.name ?? ''; bv = b.jurisdiction?.name ?? ''; }
    const cmp = av < bv ? -1 : av > bv ? 1 : 0;
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-blue-600" /> Compliance Templates</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage platform-level compliance calendars by jurisdiction and industry</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-500"><RefreshCw className="w-4 h-4" /></button>
          <button onClick={() => setCreating(true)} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 flex items-center gap-2"><Plus className="w-4 h-4" /> New Template</button>
        </div>
      </div>

      {/* KPI Strip */}
      {stats && (
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          <KpiCard icon={FileText}     label="Total Templates"      value={stats.total}            color="text-gray-700" />
          <KpiCard icon={CheckCircle2} label="Published"            value={stats.published}        color="text-green-600" />
          <KpiCard icon={AlertTriangle} label="Draft"               value={stats.draft}            color="text-yellow-600" />
          <KpiCard icon={Archive}      label="Archived"             value={stats.archived}         color="text-gray-500" />
          <KpiCard icon={Globe}        label="Countries Covered"    value={stats.countriesCovered} color="text-blue-600" />
          <KpiCard icon={Building2}    label="Industries Covered"   value={stats.industriesCovered} color="text-indigo-600" />
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm w-64 outline-none focus:ring-2 focus:ring-blue-100"
            placeholder="Search templates…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100"
          value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}>
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
        <select className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100"
          value={filterJur} onChange={e => { setFilterJur(e.target.value); setPage(1); }}>
          <option value="">All Jurisdictions</option>
          {jurisdictions.map(j => <option key={j.id} value={j.id}>{j.name}</option>)}
        </select>
        {(search || filterStatus || filterJur) && (
          <button onClick={() => { setSearch(''); setFilterStatus(''); setFilterJur(''); setPage(1); }}
            className="text-xs text-gray-400 hover:text-gray-700 flex items-center gap-1"><X className="w-3 h-3" /> Clear</button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-gray-400 text-sm"><Loader2 className="w-4 h-4 animate-spin" /> Loading templates…</div>
        ) : templates.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <ShieldCheck className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No templates found</p>
            <p className="text-sm mt-1">Create your first compliance template to get started.</p>
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-500 font-medium border-b border-gray-100">
                  <th className="px-5 py-3 text-left cursor-pointer hover:text-gray-700" onClick={() => toggleSort('name')}>
                    <span className="flex items-center gap-1">Template Name <SortIcon field="name" /></span>
                  </th>
                  <th className="px-5 py-3 text-left cursor-pointer hover:text-gray-700" onClick={() => toggleSort('jurisdiction')}>
                    <span className="flex items-center gap-1">Jurisdiction <SortIcon field="jurisdiction" /></span>
                  </th>
                  <th className="px-5 py-3 text-left">Industry</th>
                  <th className="px-5 py-3 text-left">Version</th>
                  <th className="px-5 py-3 text-left">Obligations</th>
                  <th className="px-5 py-3 text-left cursor-pointer hover:text-gray-700" onClick={() => toggleSort('status')}>
                    <span className="flex items-center gap-1">Status <SortIcon field="status" /></span>
                  </th>
                  <th className="px-5 py-3 text-left cursor-pointer hover:text-gray-700" onClick={() => toggleSort('createdAt')}>
                    <span className="flex items-center gap-1">Created <SortIcon field="createdAt" /></span>
                  </th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {sorted.map(t => (
                  <tr key={t.id} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-medium text-gray-900">{t.name}</p>
                      {t.description && <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{t.description}</p>}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-600">{t.jurisdiction?.name}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-500">{t.industry || <span className="text-gray-300">—</span>}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-500 font-mono">v{t.version}</td>
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium">{t._count?.items ?? 0}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[t.status]}`}>{cap(t.status)}</span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-400">{new Date(t.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-3.5 text-right">
                      <button onClick={() => setSelectedId(t.id)} className="p-1.5 rounded hover:bg-blue-50 text-gray-400 hover:text-blue-600"><Eye className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 text-sm text-gray-500">
                <span>Showing {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of {total}</span>
                <div className="flex gap-2">
                  <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40">Prev</button>
                  <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40">Next</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {creating && <CreateModal jurisdictions={jurisdictions} onCreated={handleCreated} onClose={() => setCreating(false)} />}
      {selectedId && (
        <TemplateDetail
          templateId={selectedId}
          jurisdictions={jurisdictions}
          onClose={() => setSelectedId(null)}
          onUpdated={handleUpdated}
        />
      )}
    </div>
  );
}
