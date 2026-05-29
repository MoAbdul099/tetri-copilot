import { useState, useEffect, useCallback } from 'react';
import { Globe, DollarSign, Plus, Search, CheckCircle, XCircle, Star, Pencil, X, Check } from 'lucide-react';
import languagesService from '../services/languagesService';
import currenciesService from '../services/currenciesService';

// ─── shared helpers ──────────────────────────────────────────────────────────

function StatusBadge({ active }) {
  return active
    ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200"><CheckCircle className="w-3 h-3" />Active</span>
    : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200"><XCircle className="w-3 h-3" />Inactive</span>;
}

function DefaultBadge() {
  return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200"><Star className="w-3 h-3 fill-amber-400 text-amber-400" />Default</span>;
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function FormField({ label, children, required }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
      {children}
    </div>
  );
}

const inp = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';
const btnPrimary = 'px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors';
const btnGhost   = 'px-4 py-2 border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors';

// ─── Languages tab ───────────────────────────────────────────────────────────

function LanguagesTab() {
  const [data,    setData]    = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [filter,  setFilter]  = useState('all');
  const [modal,   setModal]   = useState(null); // null | 'create' | language object
  const [form,    setForm]    = useState({});
  const [saving,  setSaving]  = useState(false);
  const [err,     setErr]     = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: 100 };
      if (search) params.search = search;
      if (filter === 'active')   params.isActive = true;
      if (filter === 'inactive') params.isActive = false;
      setData(await languagesService.listLanguages(params));
    } catch { /* ignore */ } finally { setLoading(false); }
  }, [search, filter]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setForm({ isActive: true, isDefault: false }); setErr(''); setModal('create'); };
  const openEdit   = (lang) => { setForm({ ...lang }); setErr(''); setModal(lang); };

  const save = async () => {
    if (!form.code?.trim() || !form.name?.trim()) { setErr('Language code and name are required.'); return; }
    setSaving(true); setErr('');
    try {
      if (modal === 'create') {
        await languagesService.createLanguage(form);
      } else {
        await languagesService.updateLanguage(modal.id, form);
      }
      setModal(null); load();
    } catch (e) {
      setErr(e.response?.data?.error || e.message);
    } finally { setSaving(false); }
  };

  const toggleStatus = async (lang) => {
    try { await languagesService.changeStatus(lang.id, !lang.isActive); load(); } catch { /* ignore */ }
  };

  const active   = data.items.filter(l => l.isActive).length;
  const inactive = data.items.filter(l => !l.isActive).length;

  return (
    <div className="space-y-5">
      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Languages', value: data.total },
          { label: 'Active',          value: active,   color: 'text-emerald-600' },
          { label: 'Inactive',        value: inactive, color: 'text-slate-400' },
        ].map(k => (
          <div key={k.label} className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-xs text-slate-500 mb-1">{k.label}</p>
            <p className={`text-2xl font-bold ${k.color || 'text-slate-900'}`}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search languages…" className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="flex gap-1">
          {['all','active','inactive'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-2 text-sm rounded-lg font-medium transition-colors ${filter === f ? 'bg-blue-600 text-white' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <button onClick={openCreate} className={btnPrimary + ' flex items-center gap-1.5 ml-auto'}>
          <Plus className="w-4 h-4" /> Add Language
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {['Language','ISO Code','Native Name','Status','Default','Workspaces',''].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={7} className="text-center py-12 text-slate-400">Loading…</td></tr>
            ) : data.items.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-12 text-slate-400">No languages found</td></tr>
            ) : data.items.map(lang => (
              <tr key={lang.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-medium text-slate-900">{lang.name}</td>
                <td className="px-4 py-3"><code className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-xs">{lang.code}</code></td>
                <td className="px-4 py-3 text-slate-500">{lang.nativeName || '—'}</td>
                <td className="px-4 py-3"><StatusBadge active={lang.isActive} /></td>
                <td className="px-4 py-3">{lang.isDefault ? <DefaultBadge /> : <span className="text-slate-400 text-xs">—</span>}</td>
                <td className="px-4 py-3 text-slate-500">{lang._count?.workspaces ?? 0}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 justify-end">
                    <button onClick={() => openEdit(lang)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => toggleStatus(lang)} className={`p-1.5 hover:bg-slate-100 rounded-lg transition-colors ${lang.isActive ? 'text-emerald-500 hover:text-red-500' : 'text-slate-400 hover:text-emerald-500'}`}>
                      {lang.isActive ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modal !== null && (
        <Modal title={modal === 'create' ? 'Add Language' : `Edit — ${modal.name}`} onClose={() => setModal(null)}>
          <div className="space-y-4">
            {err && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{err}</p>}
            <div className="grid grid-cols-2 gap-3">
              <FormField label="ISO Code" required>
                <input value={form.code || ''} onChange={e => setForm(p => ({ ...p, code: e.target.value.toLowerCase() }))} className={inp} placeholder="en" maxLength={10} />
              </FormField>
              <FormField label="Language Name" required>
                <input value={form.name || ''} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className={inp} placeholder="English" />
              </FormField>
            </div>
            <FormField label="Native Name">
              <input value={form.nativeName || ''} onChange={e => setForm(p => ({ ...p, nativeName: e.target.value }))} className={inp} placeholder="English" />
            </FormField>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input type="checkbox" checked={!!form.isActive} onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))} className="rounded" />
                Active
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input type="checkbox" checked={!!form.isDefault} onChange={e => setForm(p => ({ ...p, isDefault: e.target.checked }))} className="rounded" />
                Set as Platform Default
              </label>
            </div>
            <div className="flex gap-3 pt-1">
              <button onClick={() => setModal(null)} className={btnGhost}>Cancel</button>
              <button onClick={save} disabled={saving} className={btnPrimary + ' flex items-center gap-1.5'}>
                {saving ? 'Saving…' : <><Check className="w-4 h-4" /> Save</>}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Currencies tab ───────────────────────────────────────────────────────────

const ROUNDING_RULES = ['standard', 'up', 'down', 'half-up', 'half-down'];

function CurrenciesTab() {
  const [data,    setData]    = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [filter,  setFilter]  = useState('all');
  const [modal,   setModal]   = useState(null);
  const [form,    setForm]    = useState({});
  const [saving,  setSaving]  = useState(false);
  const [err,     setErr]     = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: 100 };
      if (search) params.search = search;
      if (filter === 'active')   params.isActive = true;
      if (filter === 'inactive') params.isActive = false;
      setData(await currenciesService.listCurrencies(params));
    } catch { /* ignore */ } finally { setLoading(false); }
  }, [search, filter]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setForm({ isActive: true, isDefault: false, decimalPrecision: 2, roundingRule: 'standard' }); setErr(''); setModal('create'); };
  const openEdit   = (cur) => { setForm({ ...cur }); setErr(''); setModal(cur); };

  const save = async () => {
    if (!form.code?.trim() || !form.name?.trim()) { setErr('Currency code and name are required.'); return; }
    setSaving(true); setErr('');
    try {
      if (modal === 'create') {
        await currenciesService.createCurrency(form);
      } else {
        await currenciesService.updateCurrency(modal.id, form);
      }
      setModal(null); load();
    } catch (e) {
      setErr(e.response?.data?.error || e.message);
    } finally { setSaving(false); }
  };

  const toggleStatus = async (cur) => {
    try { await currenciesService.changeStatus(cur.id, !cur.isActive); load(); } catch { /* ignore */ }
  };

  const active   = data.items.filter(c => c.isActive).length;
  const inactive = data.items.filter(c => !c.isActive).length;

  return (
    <div className="space-y-5">
      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Currencies', value: data.total },
          { label: 'Active',           value: active,   color: 'text-emerald-600' },
          { label: 'Inactive',         value: inactive, color: 'text-slate-400' },
        ].map(k => (
          <div key={k.label} className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-xs text-slate-500 mb-1">{k.label}</p>
            <p className={`text-2xl font-bold ${k.color || 'text-slate-900'}`}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search currencies…" className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="flex gap-1">
          {['all','active','inactive'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-2 text-sm rounded-lg font-medium transition-colors ${filter === f ? 'bg-blue-600 text-white' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <button onClick={openCreate} className={btnPrimary + ' flex items-center gap-1.5 ml-auto'}>
          <Plus className="w-4 h-4" /> Add Currency
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {['Code','Currency Name','Symbol','Precision','Rounding','Status','Default','Workspaces',''].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={9} className="text-center py-12 text-slate-400">Loading…</td></tr>
            ) : data.items.length === 0 ? (
              <tr><td colSpan={9} className="text-center py-12 text-slate-400">No currencies found</td></tr>
            ) : data.items.map(cur => (
              <tr key={cur.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3"><code className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-xs font-mono">{cur.code}</code></td>
                <td className="px-4 py-3 font-medium text-slate-900">{cur.name}</td>
                <td className="px-4 py-3 text-slate-600">{cur.symbol || '—'}</td>
                <td className="px-4 py-3 text-slate-500">{cur.decimalPrecision}</td>
                <td className="px-4 py-3 text-slate-500 capitalize">{cur.roundingRule}</td>
                <td className="px-4 py-3"><StatusBadge active={cur.isActive} /></td>
                <td className="px-4 py-3">{cur.isDefault ? <DefaultBadge /> : <span className="text-slate-400 text-xs">—</span>}</td>
                <td className="px-4 py-3 text-slate-500">{cur._count?.workspaces ?? 0}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 justify-end">
                    <button onClick={() => openEdit(cur)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => toggleStatus(cur)} className={`p-1.5 hover:bg-slate-100 rounded-lg transition-colors ${cur.isActive ? 'text-emerald-500 hover:text-red-500' : 'text-slate-400 hover:text-emerald-500'}`}>
                      {cur.isActive ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modal !== null && (
        <Modal title={modal === 'create' ? 'Add Currency' : `Edit — ${modal.code}`} onClose={() => setModal(null)}>
          <div className="space-y-4">
            {err && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{err}</p>}
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Currency Code" required>
                <input value={form.code || ''} onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))} className={inp} placeholder="USD" maxLength={3} />
              </FormField>
              <FormField label="Currency Name" required>
                <input value={form.name || ''} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className={inp} placeholder="US Dollar" />
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Symbol">
                <input value={form.symbol || ''} onChange={e => setForm(p => ({ ...p, symbol: e.target.value }))} className={inp} placeholder="$" maxLength={10} />
              </FormField>
              <FormField label="Decimal Precision">
                <input type="number" min={0} max={4} value={form.decimalPrecision ?? 2} onChange={e => setForm(p => ({ ...p, decimalPrecision: parseInt(e.target.value) }))} className={inp} />
              </FormField>
            </div>
            <FormField label="Rounding Rule">
              <select value={form.roundingRule || 'standard'} onChange={e => setForm(p => ({ ...p, roundingRule: e.target.value }))} className={inp}>
                {ROUNDING_RULES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
              </select>
            </FormField>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input type="checkbox" checked={!!form.isActive} onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))} className="rounded" />
                Active
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input type="checkbox" checked={!!form.isDefault} onChange={e => setForm(p => ({ ...p, isDefault: e.target.checked }))} className="rounded" />
                Set as Platform Default
              </label>
            </div>
            <div className="flex gap-3 pt-1">
              <button onClick={() => setModal(null)} className={btnGhost}>Cancel</button>
              <button onClick={save} disabled={saving} className={btnPrimary + ' flex items-center gap-1.5'}>
                {saving ? 'Saving…' : <><Check className="w-4 h-4" /> Save</>}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Page shell ───────────────────────────────────────────────────────────────

const TABS = [
  { id: 'languages',  label: 'Languages',  Icon: Globe },
  { id: 'currencies', label: 'Currencies', Icon: DollarSign },
];

export default function LocalizationPage() {
  const [tab, setTab] = useState('languages');

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">Languages &amp; Currencies</h1>
        <p className="text-sm text-slate-500 mt-0.5">Manage global localization settings used across the platform.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {tab === 'languages'  && <LanguagesTab />}
      {tab === 'currencies' && <CurrenciesTab />}
    </div>
  );
}
