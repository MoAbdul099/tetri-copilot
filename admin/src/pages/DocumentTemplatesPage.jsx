import { useState, useEffect, useCallback } from 'react';
import {
  FileText, Plus, Search, Copy, Archive, Trash2, Eye, EyeOff,
  Loader2, ChevronDown, ChevronUp, X, Save, Globe, Tag,
  CheckCircle2, AlertTriangle, BookOpen, BarChart2,
} from 'lucide-react';
import * as svc from '../services/adminDocumentTemplatesService';

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  'Compliance', 'Finance', 'Accounting', 'HR', 'Legal', 'Corporate',
  'Customer Communications', 'General', 'Business Letter', 'Payment Reminder',
  'Collection Letter', 'Proposal', 'Internal Memo', 'Announcement',
];

const TONES = ['Professional', 'Formal', 'Friendly', 'Persuasive', 'Informative', 'Empathetic', 'Urgent', 'Concise'];

const LANGUAGES = ['English', 'Arabic', 'French', 'Spanish', 'German', 'Italian', 'Portuguese', 'Russian'];

const PLACEHOLDER_GROUPS = {
  Company:    ['{{company_name}}', '{{company_address}}', '{{company_tax_number}}', '{{company_phone}}', '{{company_email}}'],
  Customer:   ['{{customer_name}}', '{{customer_contact}}', '{{customer_email}}'],
  Invoice:    ['{{invoice_number}}', '{{invoice_date}}', '{{invoice_due_date}}', '{{invoice_amount}}'],
  Compliance: ['{{compliance_name}}', '{{compliance_due_date}}'],
  Date:       ['{{today_date}}', '{{current_month}}', '{{current_year}}'],
};

const STATUS_BADGE = {
  draft:     'bg-yellow-100 text-yellow-800',
  published: 'bg-green-100 text-green-800',
  archived:  'bg-gray-100 text-gray-600',
};

const STATUS_ICON = {
  draft:     AlertTriangle,
  published: CheckCircle2,
  archived:  Archive,
};

function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : '—'; }
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({ icon: Icon, label, value, color = 'text-gray-700', bg = 'bg-gray-50' }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl px-5 py-4 flex items-center gap-4 shadow-sm">
      <div className={`p-2 rounded-lg ${bg}`}><Icon className={`w-5 h-5 ${color}`} /></div>
      <div>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <p className={`text-2xl font-bold ${color}`}>{value ?? '—'}</p>
      </div>
    </div>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────

function Badge({ children, color = 'gray' }) {
  const colors = {
    gray:   'bg-gray-100 text-gray-700',
    green:  'bg-green-100 text-green-700',
    yellow: 'bg-yellow-100 text-yellow-800',
    red:    'bg-red-100 text-red-700',
    blue:   'bg-blue-100 text-blue-700',
  };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colors[color] || colors.gray}`}>{children}</span>;
}

// ─── Template Form (Create / Edit) ────────────────────────────────────────────

const EMPTY_FORM = {
  name: '', category: '', description: '', status: 'draft',
  tone: '', languageName: 'English', templateContent: '', aiInstructions: '',
  brandingEnabled: false, countryProfileId: '',
};

function TemplateForm({ initial, countries, onSave, onCancel, saving }) {
  const [form, setForm] = useState(initial || EMPTY_FORM);
  const [placeholders, setPlaceholders] = useState(initial?.placeholders || []);
  const [newPh, setNewPh] = useState('');
  const [activeTab, setActiveTab] = useState('general');

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const addPlaceholder = (name) => {
    const ph = name || newPh.trim();
    if (!ph) return;
    if (placeholders.find((p) => p.placeholderName === ph)) return;
    setPlaceholders((prev) => [...prev, { placeholderName: ph, sourceType: 'custom', required: false }]);
    setNewPh('');
  };

  const removePh = (ph) => setPlaceholders((prev) => prev.filter((p) => p.placeholderName !== ph));

  const handleSave = () => {
    onSave({
      ...form,
      countryProfileId: form.countryProfileId || null,
      placeholders,
    });
  };

  const tabs = ['general', 'content', 'variables', 'ai'];

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-gray-200 bg-gray-50">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-5 py-3 text-sm font-medium capitalize transition-colors ${
              activeTab === t ? 'border-b-2 border-indigo-600 text-indigo-600 bg-white' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t === 'ai' ? 'AI Instructions' : cap(t)}
          </button>
        ))}
        <div className="flex-1" />
        <button onClick={onCancel} className="px-4 text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
      </div>

      <div className="p-6 space-y-4">
        {/* General */}
        {activeTab === 'general' && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs text-gray-500 mb-1">Template Name *</label>
                <input className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2" value={form.name} onChange={set('name')} placeholder="e.g. UAE VAT Payment Reminder" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Category *</label>
                <select className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white" value={form.category} onChange={set('category')}>
                  <option value="">Select…</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Status</label>
                <select className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white" value={form.status} onChange={set('status')}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Tone</label>
                <select className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white" value={form.tone} onChange={set('tone')}>
                  <option value="">Default (Professional)</option>
                  {TONES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Language</label>
                <select className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white" value={form.languageName} onChange={set('languageName')}>
                  {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Country Assignment</label>
                <select className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white" value={form.countryProfileId || ''} onChange={set('countryProfileId')}>
                  <option value="">Global (all countries)</option>
                  {countries.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.isoCode})</option>)}
                </select>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input type="checkbox" checked={form.brandingEnabled} onChange={set('brandingEnabled')} className="rounded" />
                  Enable branding header/footer
                </label>
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-gray-500 mb-1">Description</label>
                <textarea className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 resize-none" rows={3} value={form.description || ''} onChange={set('description')} placeholder="What this template is for…" />
              </div>
            </div>
          </>
        )}

        {/* Content */}
        {activeTab === 'content' && (
          <div>
            <label className="block text-xs text-gray-500 mb-2">Template Content <span className="text-gray-400">(use {{`{{placeholder}}`}} for variables)</span></label>
            <textarea
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 font-mono resize-y min-h-[320px]"
              value={form.templateContent || ''}
              onChange={set('templateContent')}
              placeholder={'Subject: {{invoice_number}} — Payment Due\n\nDear {{customer_name}},\n\nThis is a reminder that invoice {{invoice_number}} for {{invoice_amount}} is due on {{invoice_due_date}}.\n\nKind regards,\n{{company_name}}'}
            />
            <p className="text-xs text-gray-400 mt-1">Leave empty to let AI generate content from scratch using the AI Instructions tab.</p>
          </div>
        )}

        {/* Variables */}
        {activeTab === 'variables' && (
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Quick-add from groups</p>
              <div className="space-y-2">
                {Object.entries(PLACEHOLDER_GROUPS).map(([group, phs]) => (
                  <div key={group} className="flex flex-wrap gap-1 items-center">
                    <span className="text-xs font-medium text-gray-500 w-20 flex-shrink-0">{group}</span>
                    {phs.map((ph) => (
                      <button
                        key={ph}
                        onClick={() => addPlaceholder(ph)}
                        className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded hover:bg-indigo-100 hover:text-indigo-700 transition-colors font-mono"
                      >
                        {ph}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <input
                className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 font-mono"
                placeholder="{{custom_variable}}"
                value={newPh}
                onChange={(e) => setNewPh(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addPlaceholder()}
              />
              <button onClick={() => addPlaceholder()} className="px-3 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">Add</button>
            </div>

            {placeholders.length > 0 && (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                    <tr>
                      <th className="px-3 py-2 text-left">Placeholder</th>
                      <th className="px-3 py-2 text-left">Source Type</th>
                      <th className="px-3 py-2 text-center">Required</th>
                      <th className="px-3 py-2" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {placeholders.map((ph, i) => (
                      <tr key={i}>
                        <td className="px-3 py-2 font-mono text-xs text-indigo-700">{ph.placeholderName}</td>
                        <td className="px-3 py-2">
                          <select
                            className="text-xs border border-gray-200 rounded px-2 py-1"
                            value={ph.sourceType}
                            onChange={(e) => setPlaceholders((prev) => {
                              const next = [...prev]; next[i] = { ...next[i], sourceType: e.target.value }; return next;
                            })}
                          >
                            <option value="custom">Custom</option>
                            <option value="company">Company</option>
                            <option value="customer">Customer</option>
                            <option value="invoice">Invoice</option>
                            <option value="expense">Expense</option>
                          </select>
                        </td>
                        <td className="px-3 py-2 text-center">
                          <input type="checkbox" checked={ph.required} onChange={(e) => setPlaceholders((prev) => {
                            const next = [...prev]; next[i] = { ...next[i], required: e.target.checked }; return next;
                          })} />
                        </td>
                        <td className="px-3 py-2 text-right">
                          <button onClick={() => removePh(ph.placeholderName)} className="text-gray-400 hover:text-red-600">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* AI Instructions */}
        {activeTab === 'ai' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">AI Instructions</label>
              <textarea
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 resize-y min-h-[200px]"
                value={form.aiInstructions || ''}
                onChange={set('aiInstructions')}
                placeholder="Instructions for the AI when generating documents from this template. e.g. 'Always include payment terms, maintain a firm but polite tone, mention the late fee policy if applicable.'"
              />
            </div>
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-700">
              AI instructions are sent to the model alongside template content when workspace users generate documents from this template. They guide tone, structure, and required elements.
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
        <button onClick={onCancel} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100">Cancel</button>
        <button
          onClick={handleSave}
          disabled={saving || !form.name.trim() || !form.category}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-60"
        >
          {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          <Save className="w-3.5 h-3.5" /> Save Template
        </button>
      </div>
    </div>
  );
}

// ─── Preview Panel ────────────────────────────────────────────────────────────

function PreviewPanel({ tpl, onClose }) {
  const StatusIcon = STATUS_ICON[tpl.status] || FileText;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center gap-3">
          <FileText className="w-4 h-4 text-indigo-600" />
          <span className="font-semibold text-gray-800 text-sm">{tpl.name}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[tpl.status] || STATUS_BADGE.draft}`}>{tpl.status}</span>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
      </div>
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><p className="text-xs text-gray-400">Category</p><p className="text-gray-700">{tpl.category || '—'}</p></div>
          <div><p className="text-xs text-gray-400">Tone</p><p className="text-gray-700">{tpl.tone || 'Default'}</p></div>
          <div><p className="text-xs text-gray-400">Language</p><p className="text-gray-700">{tpl.languageName || 'English'}</p></div>
          <div><p className="text-xs text-gray-400">Country</p><p className="text-gray-700">{tpl.countryProfile?.name || 'Global'}</p></div>
          <div><p className="text-xs text-gray-400">Usage Count</p><p className="text-gray-700 font-semibold">{tpl.usageCount || 0}</p></div>
          <div><p className="text-xs text-gray-400">Variables</p><p className="text-gray-700">{tpl.placeholders?.length || 0}</p></div>
        </div>

        {tpl.description && (
          <div>
            <p className="text-xs text-gray-400 mb-1">Description</p>
            <p className="text-sm text-gray-700">{tpl.description}</p>
          </div>
        )}

        {tpl.templateContent && (
          <div>
            <p className="text-xs text-gray-400 mb-1">Template Content Preview</p>
            <pre className="text-xs text-gray-700 bg-gray-50 border border-gray-100 rounded-lg p-3 overflow-auto max-h-64 whitespace-pre-wrap font-mono">
              {tpl.templateContent}
            </pre>
          </div>
        )}

        {tpl.placeholders?.length > 0 && (
          <div>
            <p className="text-xs text-gray-400 mb-2">Variables</p>
            <div className="flex flex-wrap gap-1">
              {tpl.placeholders.map((p, i) => (
                <span key={i} className="text-xs px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded font-mono">{p.placeholderName}</span>
              ))}
            </div>
          </div>
        )}

        {tpl.aiInstructions && (
          <div>
            <p className="text-xs text-gray-400 mb-1">AI Instructions</p>
            <p className="text-xs text-gray-600 bg-amber-50 border border-amber-100 rounded-lg p-3">{tpl.aiInstructions}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DocumentTemplatesPage() {
  const [stats, setStats]       = useState(null);
  const [countries, setCountries] = useState([]);
  const [data, setData]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage]         = useState(1);
  const limit = 20;

  // panel state: null | { mode: 'create' } | { mode: 'edit', tpl } | { mode: 'preview', tpl }
  const [panel, setPanel]       = useState(null);
  const [saving, setSaving]     = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [toast, setToast]       = useState(null);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const loadStats = () => svc.getStats().then(setStats).catch(() => {});

  const loadList = useCallback(() => {
    setLoading(true);
    svc.list({ search: search || undefined, category: filterCat || undefined, status: filterStatus || undefined, page, limit })
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search, filterCat, filterStatus, page]);

  useEffect(() => { svc.listCountries().then(setCountries).catch(() => {}); loadStats(); }, []);
  useEffect(() => { loadList(); }, [loadList]);

  const refresh = () => { loadStats(); loadList(); };

  const openCreate = () => setPanel({ mode: 'create' });
  const openEdit   = async (id) => {
    try {
      const tpl = await svc.getOne(id);
      setPanel({ mode: 'edit', tpl });
    } catch { showToast('error', 'Failed to load template'); }
  };
  const openPreview = async (id) => {
    try {
      const tpl = await svc.getOne(id);
      setPanel({ mode: 'preview', tpl });
    } catch { showToast('error', 'Failed to load template'); }
  };

  const handleSave = async (formData) => {
    setSaving(true);
    try {
      if (panel?.mode === 'create') {
        await svc.create(formData);
        showToast('success', 'Template created');
      } else {
        await svc.update(panel.tpl.id, formData);
        showToast('success', 'Template updated');
      }
      setPanel(null);
      refresh();
    } catch { showToast('error', 'Failed to save template'); }
    finally { setSaving(false); }
  };

  const handlePublish = async (id) => {
    setActionLoading(id + '_pub');
    try {
      const r = await svc.publish(id);
      showToast('success', r.message || 'Status updated');
      refresh();
    } catch { showToast('error', 'Failed to update status'); }
    finally { setActionLoading(null); }
  };

  const handleArchive = async (id) => {
    if (!window.confirm('Archive this template? It will no longer be visible to workspaces.')) return;
    setActionLoading(id + '_arc');
    try {
      await svc.archive(id);
      showToast('success', 'Template archived');
      refresh();
    } catch { showToast('error', 'Failed to archive'); }
    finally { setActionLoading(null); }
  };

  const handleClone = async (id) => {
    setActionLoading(id + '_clone');
    try {
      await svc.clone(id);
      showToast('success', 'Template cloned');
      refresh();
    } catch { showToast('error', 'Failed to clone'); }
    finally { setActionLoading(null); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Permanently delete "${name}"? This cannot be undone.`)) return;
    setActionLoading(id + '_del');
    try {
      await svc.remove(id);
      showToast('success', 'Template deleted');
      if (panel?.tpl?.id === id) setPanel(null);
      refresh();
    } catch { showToast('error', 'Failed to delete'); }
    finally { setActionLoading(null); }
  };

  const statusColor = (s) => ({ draft: 'yellow', published: 'green', archived: 'gray' })[s] || 'gray';

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium ${
          toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-green-600 text-white'
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" /> Document Templates
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Platform-wide system templates available to all workspaces</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">
          <Plus className="w-4 h-4" /> New Template
        </button>
      </div>

      {/* KPIs */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <KpiCard icon={FileText}    label="Total"     value={stats.total}     color="text-gray-700" />
          <KpiCard icon={CheckCircle2}label="Published" value={stats.published} color="text-green-700" bg="bg-green-50" />
          <KpiCard icon={AlertTriangle}label="Draft"    value={stats.draft}     color="text-yellow-700" bg="bg-yellow-50" />
          <KpiCard icon={Archive}     label="Archived"  value={stats.archived}  color="text-gray-500" />
          <KpiCard icon={BarChart2}   label="Total Uses"value={stats.totalUsage}color="text-indigo-700" bg="bg-indigo-50" />
        </div>
      )}

      {/* Category breakdown */}
      {stats?.byCategory?.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">By Category</p>
          <div className="flex flex-wrap gap-2">
            {stats.byCategory.map((c) => (
              <button
                key={c.category}
                onClick={() => { setFilterCat(filterCat === c.category ? '' : c.category); setPage(1); }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  filterCat === c.category
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-indigo-50 hover:text-indigo-700'
                }`}
              >
                <Tag className="w-3 h-3" /> {c.category}
                <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] ${filterCat === c.category ? 'bg-indigo-500' : 'bg-gray-200 text-gray-600'}`}>{c.count}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Create / Edit panel */}
      {(panel?.mode === 'create' || panel?.mode === 'edit') && (
        <TemplateForm
          initial={panel.tpl}
          countries={countries}
          saving={saving}
          onSave={handleSave}
          onCancel={() => setPanel(null)}
        />
      )}

      {/* Preview panel */}
      {panel?.mode === 'preview' && (
        <PreviewPanel tpl={panel.tpl} onClose={() => setPanel(null)} />
      )}

      {/* Search + filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg"
            placeholder="Search templates…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white" value={filterCat} onChange={(e) => { setFilterCat(e.target.value); setPage(1); }}>
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white" value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}>
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Template</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-left">Country</th>
                <th className="px-4 py-3 text-left">Language</th>
                <th className="px-4 py-3 text-center">Variables</th>
                <th className="px-4 py-3 text-right">Uses</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data?.items?.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center">
                    <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">No templates found</p>
                    <button onClick={openCreate} className="mt-3 text-sm text-indigo-600 hover:underline">Create your first template</button>
                  </td>
                </tr>
              ) : data?.items?.map((tpl) => {
                const isLoading = (k) => actionLoading === tpl.id + k;
                return (
                  <tr key={tpl.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-800">{tpl.name}</p>
                        {tpl.description && <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[220px]">{tpl.description}</p>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{tpl.category || '—'}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {tpl.countryProfile ? (
                        <span className="flex items-center gap-1"><Globe className="w-3 h-3" />{tpl.countryProfile.isoCode}</span>
                      ) : <span className="text-gray-400">Global</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{tpl.languageName || 'English'}</td>
                    <td className="px-4 py-3 text-center text-gray-500 text-xs">{tpl._count?.placeholders || 0}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{tpl.usageCount || 0}</td>
                    <td className="px-4 py-3 text-center">
                      <Badge color={statusColor(tpl.status)}>{tpl.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* Preview */}
                        <button title="Preview" onClick={() => openPreview(tpl.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        {/* Edit */}
                        <button title="Edit" onClick={() => openEdit(tpl.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                          <BookOpen className="w-4 h-4" />
                        </button>
                        {/* Publish toggle */}
                        {tpl.status !== 'archived' && (
                          <button
                            title={tpl.status === 'published' ? 'Unpublish' : 'Publish'}
                            onClick={() => handlePublish(tpl.id)}
                            disabled={isLoading('_pub')}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors disabled:opacity-40"
                          >
                            {isLoading('_pub') ? <Loader2 className="w-4 h-4 animate-spin" /> : tpl.status === 'published' ? <EyeOff className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                          </button>
                        )}
                        {/* Clone */}
                        <button title="Clone" onClick={() => handleClone(tpl.id)} disabled={isLoading('_clone')} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-40">
                          {isLoading('_clone') ? <Loader2 className="w-4 h-4 animate-spin" /> : <Copy className="w-4 h-4" />}
                        </button>
                        {/* Archive */}
                        {tpl.status !== 'archived' && (
                          <button title="Archive" onClick={() => handleArchive(tpl.id)} disabled={isLoading('_arc')} className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors disabled:opacity-40">
                            {isLoading('_arc') ? <Loader2 className="w-4 h-4 animate-spin" /> : <Archive className="w-4 h-4" />}
                          </button>
                        )}
                        {/* Delete */}
                        <button title="Delete" onClick={() => handleDelete(tpl.id, tpl.name)} disabled={isLoading('_del')} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40">
                          {isLoading('_del') ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {data?.total > limit && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-sm text-gray-500">
              <span>{data.total} templates · Page {page} of {Math.ceil(data.total / limit)}</span>
              <div className="flex gap-2">
                <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="px-3 py-1 border border-gray-200 rounded-lg disabled:opacity-40">Prev</button>
                <button disabled={page * limit >= data.total} onClick={() => setPage((p) => p + 1)} className="px-3 py-1 border border-gray-200 rounded-lg disabled:opacity-40">Next</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
