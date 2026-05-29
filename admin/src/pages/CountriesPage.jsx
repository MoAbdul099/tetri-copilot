import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Globe, RefreshCw, Plus, Copy, ChevronRight, CheckCircle, XCircle, FileEdit } from 'lucide-react';
import { listCountries, createCountry, cloneCountry } from '../services/countriesService';

const STATUS_TABS = [
  { value: '', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'draft', label: 'Draft' },
];

const STATUS_STYLE = {
  active:   'bg-green-50 text-green-700 border-green-200',
  inactive: 'bg-red-50 text-red-700 border-red-200',
  draft:    'bg-yellow-50 text-yellow-700 border-yellow-200',
};

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_STYLE[status] || 'bg-tetri-bg text-tetri-neutral border-tetri-border'}`}>
      {status}
    </span>
  );
}

const EMPTY_FORM = {
  countryCode: '', countryName: '', dateFormat: 'DD/MM/YYYY', timezone: '',
  taxLabel: 'VAT', taxNumberLabel: '', defaultTaxRate: 0,
  fiscalYearStart: 1, fiscalYearEnd: 12,
};

export default function CountriesPage() {
  const navigate = useNavigate();
  const [items, setItems]       = useState([]);
  const [total, setTotal]       = useState(0);
  const [pages, setPages]       = useState(1);
  const [page, setPage]         = useState(1);
  const [loading, setLoading]   = useState(false);
  const [search, setSearch]     = useState('');
  const [statusTab, setStatusTab] = useState('');

  // Create modal
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [saving, setSaving]         = useState(false);
  const [formError, setFormError]   = useState('');

  // Clone modal
  const [cloneSource, setCloneSource] = useState(null);
  const [cloneCode, setCloneCode]     = useState('');
  const [cloneName, setCloneName]     = useState('');
  const [cloning, setCloning]         = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listCountries({ search: search || undefined, status: statusTab || undefined, page, limit: 20 });
      setItems(data.items || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
    } catch { /* keep stale */ }
    finally { setLoading(false); }
  }, [search, statusTab, page]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [search, statusTab]);

  const handleCreate = async () => {
    if (!form.countryCode.trim() || !form.countryName.trim()) {
      setFormError('Country code and name are required.');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      const created = await createCountry({ ...form, defaultTaxRate: parseFloat(form.defaultTaxRate) || 0, status: 'draft' });
      setShowCreate(false);
      setForm(EMPTY_FORM);
      navigate(`/countries/${created.id}`);
    } catch (e) {
      setFormError(e.response?.data?.error || 'Failed to create country profile.');
    } finally { setSaving(false); }
  };

  const handleClone = async () => {
    if (!cloneCode.trim() || !cloneName.trim()) return;
    setCloning(true);
    try {
      const created = await cloneCountry(cloneSource.id, cloneCode.trim().toUpperCase(), cloneName.trim());
      setCloneSource(null);
      navigate(`/countries/${created.id}`);
    } catch (e) {
      alert(e.response?.data?.error || 'Clone failed.');
    } finally { setCloning(false); }
  };

  return (
    <div className="space-y-5 max-w-7xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-tetri-text">Country Profiles</h1>
          <p className="text-sm text-tetri-neutral mt-0.5">Global configuration for compliance, tax, fiscal, and localization</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="flex items-center gap-2 px-3 py-2 text-sm border border-tetri-border bg-white rounded-xl hover:bg-tetri-bg transition-colors">
            <RefreshCw className="w-4 h-4 text-tetri-neutral" />
          </button>
          <button onClick={() => { setShowCreate(true); setFormError(''); setForm(EMPTY_FORM); }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-tetri-primary text-white rounded-xl hover:bg-tetri-primary/90 transition-colors">
            <Plus className="w-4 h-4" /> Add Country
          </button>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Profiles', value: total },
          { label: 'Active', value: items.filter(i => i.status === 'active').length + (statusTab === 'active' ? 0 : 0) },
          { label: 'Total Workspaces', value: items.reduce((s, i) => s + (i._count?.workspaces || 0), 0) },
          { label: 'Draft', value: items.filter(i => i.status === 'draft').length },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white border border-tetri-border rounded-xl p-4">
            <p className="text-xs text-tetri-neutral">{label}</p>
            <p className="text-2xl font-bold text-tetri-text mt-1">{value}</p>
          </div>
        ))}
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 border-b border-tetri-border overflow-x-auto">
        {STATUS_TABS.map((t) => (
          <button key={t.value} onClick={() => setStatusTab(t.value)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              statusTab === t.value ? 'border-tetri-primary text-tetri-primary' : 'border-transparent text-tetri-neutral hover:text-tetri-text'
            }`}>{t.label}</button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tetri-neutral" />
        <input
          value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or code…"
          className="w-full pl-9 pr-3 py-2 text-sm border border-tetri-border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-tetri-primary/20"
        />
      </div>

      {/* Table */}
      <div className="bg-white border border-tetri-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-tetri-border bg-tetri-bg/50">
              {['Country', 'Code', 'Status', 'Currency', 'Language', 'Fiscal Year', 'Workspaces', ''].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-tetri-neutral uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-tetri-border">
            {loading ? (
              <tr><td colSpan={8} className="py-16 text-center text-tetri-neutral text-sm">Loading…</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={8} className="py-16 text-center text-tetri-neutral text-sm">No country profiles found.</td></tr>
            ) : items.map((c) => (
              <tr key={c.id} className="hover:bg-tetri-bg/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-tetri-neutral flex-shrink-0" />
                    <span className="font-medium text-tetri-text">{c.countryName}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="font-mono text-xs bg-tetri-bg px-2 py-0.5 rounded">{c.countryCode}</span>
                </td>
                <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                <td className="px-4 py-3 text-tetri-muted">{c.defaultCurrency?.code || '—'}</td>
                <td className="px-4 py-3 text-tetri-muted">{c.defaultLanguage?.code?.toUpperCase() || '—'}</td>
                <td className="px-4 py-3 text-tetri-muted text-xs">
                  {c.fiscalYearStart ? `${MONTHS[(c.fiscalYearStart || 1) - 1]} – ${MONTHS[(c.fiscalYearEnd || 12) - 1]}` : '—'}
                </td>
                <td className="px-4 py-3 text-tetri-muted">{c._count?.workspaces ?? 0}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button onClick={() => { setCloneSource(c); setCloneCode(''); setCloneName(''); }}
                      title="Clone" className="p-1.5 hover:bg-tetri-bg rounded-lg transition-colors">
                      <Copy className="w-3.5 h-3.5 text-tetri-neutral" />
                    </button>
                    <button onClick={() => navigate(`/countries/${c.id}`)}
                      className="p-1.5 hover:bg-tetri-bg rounded-lg transition-colors">
                      <ChevronRight className="w-4 h-4 text-tetri-neutral" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-tetri-neutral">{total} total</span>
          <div className="flex items-center gap-1">
            {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                  p === page ? 'bg-tetri-primary text-white' : 'hover:bg-tetri-bg text-tetri-neutral'
                }`}>{p}</button>
            ))}
          </div>
        </div>
      )}

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4">
            <h2 className="text-lg font-bold text-tetri-text">New Country Profile</h2>
            {formError && <p className="text-sm text-tetri-error">{formError}</p>}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-tetri-neutral mb-1">ISO Code *</label>
                <input value={form.countryCode} onChange={(e) => setForm(f => ({ ...f, countryCode: e.target.value.toUpperCase().slice(0, 5) }))}
                  placeholder="AE" className="w-full px-3 py-2 text-sm border border-tetri-border rounded-xl focus:outline-none focus:ring-2 focus:ring-tetri-primary/20" />
              </div>
              <div>
                <label className="block text-xs font-medium text-tetri-neutral mb-1">Country Name *</label>
                <input value={form.countryName} onChange={(e) => setForm(f => ({ ...f, countryName: e.target.value }))}
                  placeholder="United Arab Emirates" className="w-full px-3 py-2 text-sm border border-tetri-border rounded-xl focus:outline-none focus:ring-2 focus:ring-tetri-primary/20" />
              </div>
              <div>
                <label className="block text-xs font-medium text-tetri-neutral mb-1">Date Format</label>
                <select value={form.dateFormat} onChange={(e) => setForm(f => ({ ...f, dateFormat: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-tetri-border rounded-xl focus:outline-none">
                  {['DD/MM/YYYY','MM/DD/YYYY','YYYY-MM-DD'].map(v => <option key={v}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-tetri-neutral mb-1">Timezone</label>
                <input value={form.timezone} onChange={(e) => setForm(f => ({ ...f, timezone: e.target.value }))}
                  placeholder="Asia/Dubai" className="w-full px-3 py-2 text-sm border border-tetri-border rounded-xl focus:outline-none focus:ring-2 focus:ring-tetri-primary/20" />
              </div>
              <div>
                <label className="block text-xs font-medium text-tetri-neutral mb-1">Tax Label</label>
                <input value={form.taxLabel} onChange={(e) => setForm(f => ({ ...f, taxLabel: e.target.value }))}
                  placeholder="VAT" className="w-full px-3 py-2 text-sm border border-tetri-border rounded-xl focus:outline-none focus:ring-2 focus:ring-tetri-primary/20" />
              </div>
              <div>
                <label className="block text-xs font-medium text-tetri-neutral mb-1">Default Tax Rate (%)</label>
                <input type="number" value={form.defaultTaxRate} onChange={(e) => setForm(f => ({ ...f, defaultTaxRate: e.target.value }))}
                  min="0" max="100" step="0.01" className="w-full px-3 py-2 text-sm border border-tetri-border rounded-xl focus:outline-none focus:ring-2 focus:ring-tetri-primary/20" />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm border border-tetri-border rounded-xl hover:bg-tetri-bg transition-colors">Cancel</button>
              <button onClick={handleCreate} disabled={saving}
                className="px-4 py-2 text-sm font-medium bg-tetri-primary text-white rounded-xl hover:bg-tetri-primary/90 disabled:opacity-60 transition-colors">
                {saving ? 'Creating…' : 'Create Profile'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clone modal */}
      {cloneSource && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-bold text-tetri-text">Clone: {cloneSource.countryName}</h2>
            <p className="text-sm text-tetri-muted">Creates a draft copy of this profile with all settings and holidays.</p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-tetri-neutral mb-1">New ISO Code *</label>
                <input value={cloneCode} onChange={(e) => setCloneCode(e.target.value.toUpperCase().slice(0, 5))}
                  placeholder="XX" className="w-full px-3 py-2 text-sm border border-tetri-border rounded-xl focus:outline-none focus:ring-2 focus:ring-tetri-primary/20" />
              </div>
              <div>
                <label className="block text-xs font-medium text-tetri-neutral mb-1">New Country Name *</label>
                <input value={cloneName} onChange={(e) => setCloneName(e.target.value)}
                  placeholder="New Country Name" className="w-full px-3 py-2 text-sm border border-tetri-border rounded-xl focus:outline-none focus:ring-2 focus:ring-tetri-primary/20" />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setCloneSource(null)} className="px-4 py-2 text-sm border border-tetri-border rounded-xl hover:bg-tetri-bg transition-colors">Cancel</button>
              <button onClick={handleClone} disabled={cloning || !cloneCode || !cloneName}
                className="px-4 py-2 text-sm font-medium bg-tetri-primary text-white rounded-xl hover:bg-tetri-primary/90 disabled:opacity-60 transition-colors">
                {cloning ? 'Cloning…' : 'Clone Profile'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
