import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Globe, Edit2, Save, X, Plus, Trash2, CheckCircle, XCircle, FileEdit, Copy, Calendar, Building2 } from 'lucide-react';
import { getCountry, updateCountry, changeStatus, addHoliday, updateHoliday, deleteHoliday, getWorkspaces } from '../services/countriesService';

const TABS = ['Overview', 'Fiscal & Tax', 'Compliance', 'Holidays', 'Workspaces'];

const STATUS_STYLE = {
  active:   'bg-green-50 text-green-700 border-green-200',
  inactive: 'bg-red-50 text-red-700 border-red-200',
  draft:    'bg-yellow-50 text-yellow-700 border-yellow-200',
};

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_STYLE[status] || 'bg-tetri-bg text-tetri-neutral border-tetri-border'}`}>
      {status}
    </span>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <p className="text-xs font-medium text-tetri-neutral mb-1">{label}</p>
      <div className="text-sm text-tetri-text">{children}</div>
    </div>
  );
}

function EditField({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-tetri-neutral mb-1">{label}</label>
      {children}
    </div>
  );
}

const inputCls = 'w-full px-3 py-2 text-sm border border-tetri-border rounded-xl focus:outline-none focus:ring-2 focus:ring-tetri-primary/20 bg-white';
const toggleCls = (on) => `relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${on ? 'bg-tetri-primary' : 'bg-tetri-border'}`;

export default function CountryDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tab, setTab]           = useState('Overview');
  const [country, setCountry]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  // Edit state
  const [editing, setEditing]   = useState(false);
  const [form, setForm]         = useState({});
  const [saving, setSaving]     = useState(false);
  const [saveError, setSaveError] = useState('');

  // Status change
  const [changingStatus, setChangingStatus] = useState(false);

  // Holidays
  const [newHoliday, setNewHoliday] = useState({ name: '', holidayDate: '', isRecurring: true, description: '' });
  const [addingHoliday, setAddingHoliday] = useState(false);
  const [showAddHoliday, setShowAddHoliday] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState(null);
  const [holidayForm, setHolidayForm] = useState({});

  // Workspaces
  const [workspaces, setWorkspaces] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getCountry(id);
      setCountry(data);
    } catch {
      setError('Country profile not found.');
    } finally { setLoading(false); }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (tab === 'Workspaces' && workspaces === null) {
      getWorkspaces(id).then(setWorkspaces).catch(() => setWorkspaces([]));
    }
  }, [tab, id, workspaces]);

  const startEdit = () => {
    setForm({
      countryName: country.countryName,
      countryCode: country.countryCode,
      dateFormat: country.dateFormat || 'DD/MM/YYYY',
      timezone: country.timezone || '',
      adminNotes: country.adminNotes || '',
      // Tax
      taxLabel: country.taxLabel || '',
      taxNumberLabel: country.taxNumberLabel || '',
      defaultTaxRate: country.defaultTaxRate ?? 0,
      taxEnabled: country.taxEnabled ?? true,
      taxReportingFrequency: country.taxReportingFrequency || 'quarterly',
      // Fiscal
      fiscalYearStart: country.fiscalYearStart ?? 1,
      fiscalYearEnd: country.fiscalYearEnd ?? 12,
      accountingPeriods: country.accountingPeriods || 'monthly',
      // Compliance
      complianceEnabled: country.complianceEnabled ?? true,
      regulatoryFramework: country.regulatoryFramework || '',
      filingFrequency: country.filingFrequency || '',
    });
    setSaveError('');
    setEditing(true);
  };

  const cancelEdit = () => { setEditing(false); setForm({}); setSaveError(''); };

  const save = async () => {
    setSaving(true);
    setSaveError('');
    try {
      const payload = {
        ...form,
        defaultTaxRate: parseFloat(form.defaultTaxRate) || 0,
        fiscalYearStart: parseInt(form.fiscalYearStart) || 1,
        fiscalYearEnd: parseInt(form.fiscalYearEnd) || 12,
      };
      const updated = await updateCountry(id, payload);
      setCountry(updated);
      setEditing(false);
    } catch (e) {
      setSaveError(e.response?.data?.error || 'Save failed.');
    } finally { setSaving(false); }
  };

  const handleStatusChange = async (newStatus) => {
    setChangingStatus(true);
    try {
      const updated = await changeStatus(id, newStatus);
      setCountry(updated);
    } catch (e) {
      alert(e.response?.data?.error || 'Status change failed.');
    } finally { setChangingStatus(false); }
  };

  const handleAddHoliday = async () => {
    if (!newHoliday.name || !newHoliday.holidayDate) return;
    setAddingHoliday(true);
    try {
      await addHoliday(id, newHoliday);
      setNewHoliday({ name: '', holidayDate: '', isRecurring: true, description: '' });
      setShowAddHoliday(false);
      load();
    } catch { /* ignore */ }
    finally { setAddingHoliday(false); }
  };

  const handleDeleteHoliday = async (hid) => {
    if (!confirm('Delete this holiday?')) return;
    await deleteHoliday(id, hid);
    load();
  };

  const startEditHoliday = (h) => {
    setEditingHoliday(h.id);
    setHolidayForm({ name: h.name, holidayDate: h.holidayDate?.slice(0, 10), isRecurring: h.isRecurring, description: h.description || '' });
  };

  const saveHoliday = async (hid) => {
    await updateHoliday(id, hid, holidayForm);
    setEditingHoliday(null);
    load();
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

  if (loading) return <div className="py-24 text-center text-tetri-neutral text-sm">Loading…</div>;
  if (error || !country) return (
    <div className="py-24 text-center">
      <p className="text-tetri-error text-sm mb-4">{error}</p>
      <button onClick={() => navigate('/countries')} className="text-sm text-tetri-primary hover:underline">Back to Countries</button>
    </div>
  );

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Header */}
      <div className="flex items-start gap-4">
        <button onClick={() => navigate('/countries')} className="p-2 hover:bg-tetri-bg rounded-xl transition-colors mt-0.5">
          <ArrowLeft className="w-4 h-4 text-tetri-neutral" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <Globe className="w-5 h-5 text-tetri-primary flex-shrink-0" />
            <h1 className="text-xl font-bold text-tetri-text">{country.countryName}</h1>
            <span className="font-mono text-xs bg-tetri-bg px-2 py-0.5 rounded border border-tetri-border">{country.countryCode}</span>
            <StatusBadge status={country.status} />
          </div>
          <p className="text-sm text-tetri-neutral mt-1 ml-9">
            {country.defaultCurrency?.code} · {country.defaultLanguage?.name} · {country._count?.workspaces ?? 0} workspace{country._count?.workspaces !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {country.status !== 'active' && (
            <button onClick={() => handleStatusChange('active')} disabled={changingStatus}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-60 transition-colors">
              <CheckCircle className="w-3.5 h-3.5" /> Activate
            </button>
          )}
          {country.status === 'active' && (
            <button onClick={() => handleStatusChange('inactive')} disabled={changingStatus}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-red-200 text-red-600 rounded-xl hover:bg-red-50 disabled:opacity-60 transition-colors">
              <XCircle className="w-3.5 h-3.5" /> Deactivate
            </button>
          )}
          {country.status !== 'draft' && (
            <button onClick={() => handleStatusChange('draft')} disabled={changingStatus}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-tetri-border text-tetri-neutral rounded-xl hover:bg-tetri-bg disabled:opacity-60 transition-colors">
              <FileEdit className="w-3.5 h-3.5" /> Set Draft
            </button>
          )}
          {!editing ? (
            <button onClick={startEdit}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-tetri-primary text-white rounded-xl hover:bg-tetri-primary/90 transition-colors">
              <Edit2 className="w-3.5 h-3.5" /> Edit
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button onClick={cancelEdit} className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-tetri-border rounded-xl hover:bg-tetri-bg transition-colors">
                <X className="w-3.5 h-3.5" /> Cancel
              </button>
              <button onClick={save} disabled={saving}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-tetri-primary text-white rounded-xl hover:bg-tetri-primary/90 disabled:opacity-60 transition-colors">
                <Save className="w-3.5 h-3.5" /> {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          )}
        </div>
      </div>

      {saveError && (
        <div className="ml-9 text-sm text-tetri-error bg-red-50 border border-red-200 rounded-xl px-4 py-2">{saveError}</div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-tetri-border overflow-x-auto">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              tab === t ? 'border-tetri-primary text-tetri-primary' : 'border-transparent text-tetri-neutral hover:text-tetri-text'
            }`}>{t}</button>
        ))}
      </div>

      {/* ── Overview ── */}
      {tab === 'Overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white border border-tetri-border rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-tetri-text">General Information</h3>
            {!editing ? (
              <div className="grid grid-cols-2 gap-4">
                <Field label="Country Name">{country.countryName}</Field>
                <Field label="ISO Code"><span className="font-mono">{country.countryCode}</span></Field>
                <Field label="Default Currency">{country.defaultCurrency ? `${country.defaultCurrency.code} — ${country.defaultCurrency.name}` : '—'}</Field>
                <Field label="Default Language">{country.defaultLanguage ? `${country.defaultLanguage.code.toUpperCase()} — ${country.defaultLanguage.name}` : '—'}</Field>
                <Field label="Date Format">{country.dateFormat || '—'}</Field>
                <Field label="Timezone">{country.timezone || '—'}</Field>
                <Field label="Status"><StatusBadge status={country.status} /></Field>
                <Field label="Workspaces">{country._count?.workspaces ?? 0}</Field>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <EditField label="Country Name">
                  <input value={form.countryName} onChange={(e) => setForm(f => ({ ...f, countryName: e.target.value }))} className={inputCls} />
                </EditField>
                <EditField label="ISO Code">
                  <input value={form.countryCode} onChange={(e) => setForm(f => ({ ...f, countryCode: e.target.value.toUpperCase().slice(0, 5) }))} className={inputCls} />
                </EditField>
                <EditField label="Date Format">
                  <select value={form.dateFormat} onChange={(e) => setForm(f => ({ ...f, dateFormat: e.target.value }))} className={inputCls}>
                    {['DD/MM/YYYY','MM/DD/YYYY','YYYY-MM-DD'].map(v => <option key={v}>{v}</option>)}
                  </select>
                </EditField>
                <EditField label="Timezone">
                  <input value={form.timezone} onChange={(e) => setForm(f => ({ ...f, timezone: e.target.value }))} placeholder="Asia/Dubai" className={inputCls} />
                </EditField>
              </div>
            )}
          </div>

          <div className="bg-white border border-tetri-border rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-tetri-text">Admin Notes</h3>
            {!editing ? (
              <p className="text-sm text-tetri-muted whitespace-pre-wrap">{country.adminNotes || 'No notes.'}</p>
            ) : (
              <textarea value={form.adminNotes} onChange={(e) => setForm(f => ({ ...f, adminNotes: e.target.value }))}
                rows={6} placeholder="Internal notes about this country profile…"
                className={inputCls + ' resize-none'} />
            )}
          </div>

          {/* Supported Languages */}
          <div className="bg-white border border-tetri-border rounded-xl p-5 space-y-3 md:col-span-2">
            <h3 className="text-sm font-semibold text-tetri-text">Supported Languages</h3>
            {country.languages?.length === 0 ? (
              <p className="text-sm text-tetri-neutral">No languages configured.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {country.languages?.map((l) => (
                  <span key={l.id} className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                    l.isDefault ? 'bg-tetri-primary/10 text-tetri-primary border-tetri-primary/20' : 'bg-tetri-bg text-tetri-text border-tetri-border'
                  }`}>
                    {l.language.code.toUpperCase()} — {l.language.name}
                    {l.isDefault && <span className="text-[10px] font-semibold">DEFAULT</span>}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Fiscal & Tax ── */}
      {tab === 'Fiscal & Tax' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Fiscal */}
          <div className="bg-white border border-tetri-border rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-tetri-text flex items-center gap-2">
              <Calendar className="w-4 h-4 text-tetri-primary" /> Fiscal Year Configuration
            </h3>
            {!editing ? (
              <div className="grid grid-cols-2 gap-4">
                <Field label="Fiscal Year Start">{MONTHS[(country.fiscalYearStart || 1) - 1]}</Field>
                <Field label="Fiscal Year End">{MONTHS[(country.fiscalYearEnd || 12) - 1]}</Field>
                <Field label="Accounting Periods">{country.accountingPeriods || '—'}</Field>
                <Field label="Year Duration">
                  {(() => {
                    const start = country.fiscalYearStart || 1;
                    const end = country.fiscalYearEnd || 12;
                    const months = end >= start ? end - start + 1 : 12 - start + end + 1;
                    return `${months} months`;
                  })()}
                </Field>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <EditField label="Fiscal Year Start">
                  <select value={form.fiscalYearStart} onChange={(e) => setForm(f => ({ ...f, fiscalYearStart: parseInt(e.target.value) }))} className={inputCls}>
                    {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                  </select>
                </EditField>
                <EditField label="Fiscal Year End">
                  <select value={form.fiscalYearEnd} onChange={(e) => setForm(f => ({ ...f, fiscalYearEnd: parseInt(e.target.value) }))} className={inputCls}>
                    {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                  </select>
                </EditField>
                <EditField label="Accounting Periods" >
                  <select value={form.accountingPeriods} onChange={(e) => setForm(f => ({ ...f, accountingPeriods: e.target.value }))} className={inputCls}>
                    {['monthly','quarterly','annual'].map(v => <option key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</option>)}
                  </select>
                </EditField>
              </div>
            )}
          </div>

          {/* Tax */}
          <div className="bg-white border border-tetri-border rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-tetri-text">Tax Configuration</h3>
            {!editing ? (
              <div className="grid grid-cols-2 gap-4">
                <Field label="Tax Enabled">{country.taxEnabled ? <span className="text-green-600 font-medium">Yes</span> : <span className="text-red-500">No</span>}</Field>
                <Field label="Tax Label">{country.taxLabel || '—'}</Field>
                <Field label="Tax Number Label">{country.taxNumberLabel || '—'}</Field>
                <Field label="Default Tax Rate">{country.defaultTaxRate != null ? `${Number(country.defaultTaxRate)}%` : '—'}</Field>
                <Field label="Reporting Frequency">{country.taxReportingFrequency || '—'}</Field>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <EditField label="Tax Enabled">
                  <button onClick={() => setForm(f => ({ ...f, taxEnabled: !f.taxEnabled }))} className={toggleCls(form.taxEnabled)}>
                    <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${form.taxEnabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
                  </button>
                </EditField>
                <EditField label="Tax Label">
                  <input value={form.taxLabel} onChange={(e) => setForm(f => ({ ...f, taxLabel: e.target.value }))} placeholder="VAT" className={inputCls} />
                </EditField>
                <EditField label="Tax Number Label">
                  <input value={form.taxNumberLabel} onChange={(e) => setForm(f => ({ ...f, taxNumberLabel: e.target.value }))} placeholder="TRN" className={inputCls} />
                </EditField>
                <EditField label="Default Tax Rate (%)">
                  <input type="number" value={form.defaultTaxRate} onChange={(e) => setForm(f => ({ ...f, defaultTaxRate: e.target.value }))}
                    min="0" max="100" step="0.01" className={inputCls} />
                </EditField>
                <EditField label="Reporting Frequency">
                  <select value={form.taxReportingFrequency} onChange={(e) => setForm(f => ({ ...f, taxReportingFrequency: e.target.value }))} className={inputCls}>
                    {['monthly','quarterly','annual'].map(v => <option key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</option>)}
                  </select>
                </EditField>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Compliance ── */}
      {tab === 'Compliance' && (
        <div className="bg-white border border-tetri-border rounded-xl p-5 space-y-5">
          <h3 className="text-sm font-semibold text-tetri-text">Compliance Configuration</h3>
          {!editing ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Compliance Enabled">{country.complianceEnabled ? <span className="text-green-600 font-medium">Yes</span> : <span className="text-red-500">No</span>}</Field>
              <Field label="Filing Frequency">{country.filingFrequency || '—'}</Field>
              <Field label="Regulatory Framework">
                <p className="text-sm text-tetri-muted whitespace-pre-wrap">{country.regulatoryFramework || '—'}</p>
              </Field>
              <Field label="Reminder Defaults">
                <pre className="text-xs bg-tetri-bg p-3 rounded-xl overflow-auto">{JSON.stringify(country.reminderDefaults, null, 2)}</pre>
              </Field>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <EditField label="Compliance Enabled">
                <button onClick={() => setForm(f => ({ ...f, complianceEnabled: !f.complianceEnabled }))} className={toggleCls(form.complianceEnabled)}>
                  <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${form.complianceEnabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </button>
              </EditField>
              <EditField label="Filing Frequency">
                <select value={form.filingFrequency || ''} onChange={(e) => setForm(f => ({ ...f, filingFrequency: e.target.value }))} className={inputCls}>
                  <option value="">Select…</option>
                  {['monthly','quarterly','semi-annual','annual'].map(v => <option key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</option>)}
                </select>
              </EditField>
              <div className="sm:col-span-2">
                <EditField label="Regulatory Framework">
                  <textarea value={form.regulatoryFramework} onChange={(e) => setForm(f => ({ ...f, regulatoryFramework: e.target.value }))}
                    rows={4} placeholder="Describe the regulatory framework for this country…" className={inputCls + ' resize-none'} />
                </EditField>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Holidays ── */}
      {tab === 'Holidays' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-tetri-text">Public Holidays ({country.holidays?.length || 0})</h3>
            <button onClick={() => setShowAddHoliday(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-tetri-primary text-white rounded-xl hover:bg-tetri-primary/90 transition-colors">
              <Plus className="w-3.5 h-3.5" /> Add Holiday
            </button>
          </div>

          {showAddHoliday && (
            <div className="bg-white border border-tetri-border rounded-xl p-4 space-y-3">
              <h4 className="text-sm font-medium text-tetri-text">New Holiday</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-tetri-neutral mb-1">Holiday Name *</label>
                  <input value={newHoliday.name} onChange={(e) => setNewHoliday(h => ({ ...h, name: e.target.value }))}
                    placeholder="Eid Al Fitr" className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-tetri-neutral mb-1">Date *</label>
                  <input type="date" value={newHoliday.holidayDate} onChange={(e) => setNewHoliday(h => ({ ...h, holidayDate: e.target.value }))} className={inputCls} />
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setNewHoliday(h => ({ ...h, isRecurring: !h.isRecurring }))} className={toggleCls(newHoliday.isRecurring)}>
                    <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${newHoliday.isRecurring ? 'translate-x-4' : 'translate-x-0.5'}`} />
                  </button>
                  <span className="text-xs text-tetri-neutral">Recurring annually</span>
                </div>
                <div>
                  <label className="block text-xs font-medium text-tetri-neutral mb-1">Description</label>
                  <input value={newHoliday.description} onChange={(e) => setNewHoliday(h => ({ ...h, description: e.target.value }))}
                    placeholder="Optional" className={inputCls} />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={() => setShowAddHoliday(false)} className="px-3 py-1.5 text-xs border border-tetri-border rounded-xl hover:bg-tetri-bg transition-colors">Cancel</button>
                <button onClick={handleAddHoliday} disabled={addingHoliday || !newHoliday.name || !newHoliday.holidayDate}
                  className="px-3 py-1.5 text-xs font-medium bg-tetri-primary text-white rounded-xl hover:bg-tetri-primary/90 disabled:opacity-60 transition-colors">
                  {addingHoliday ? 'Adding…' : 'Add Holiday'}
                </button>
              </div>
            </div>
          )}

          <div className="bg-white border border-tetri-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-tetri-border bg-tetri-bg/50">
                  {['Holiday Name', 'Date', 'Recurring', 'Description', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-tetri-neutral uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-tetri-border">
                {(!country.holidays || country.holidays.length === 0) ? (
                  <tr><td colSpan={5} className="py-10 text-center text-tetri-neutral text-xs">No holidays configured.</td></tr>
                ) : country.holidays.map((h) => (
                  <tr key={h.id} className="hover:bg-tetri-bg/20 transition-colors">
                    {editingHoliday === h.id ? (
                      <>
                        <td className="px-4 py-2"><input value={holidayForm.name} onChange={(e) => setHolidayForm(f => ({ ...f, name: e.target.value }))} className={inputCls} /></td>
                        <td className="px-4 py-2"><input type="date" value={holidayForm.holidayDate} onChange={(e) => setHolidayForm(f => ({ ...f, holidayDate: e.target.value }))} className={inputCls} /></td>
                        <td className="px-4 py-2">
                          <button onClick={() => setHolidayForm(f => ({ ...f, isRecurring: !f.isRecurring }))} className={toggleCls(holidayForm.isRecurring)}>
                            <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${holidayForm.isRecurring ? 'translate-x-4' : 'translate-x-0.5'}`} />
                          </button>
                        </td>
                        <td className="px-4 py-2"><input value={holidayForm.description} onChange={(e) => setHolidayForm(f => ({ ...f, description: e.target.value }))} className={inputCls} /></td>
                        <td className="px-4 py-2">
                          <div className="flex items-center gap-1">
                            <button onClick={() => saveHoliday(h.id)} className="p-1.5 hover:bg-green-50 rounded-lg transition-colors"><Save className="w-3.5 h-3.5 text-green-600" /></button>
                            <button onClick={() => setEditingHoliday(null)} className="p-1.5 hover:bg-tetri-bg rounded-lg transition-colors"><X className="w-3.5 h-3.5 text-tetri-neutral" /></button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-3 font-medium text-tetri-text">{h.name}</td>
                        <td className="px-4 py-3 text-tetri-muted">{fmtDate(h.holidayDate)}</td>
                        <td className="px-4 py-3">{h.isRecurring ? <span className="text-green-600 text-xs font-medium">Annual</span> : <span className="text-tetri-neutral text-xs">Once</span>}</td>
                        <td className="px-4 py-3 text-tetri-muted text-xs">{h.description || '—'}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button onClick={() => startEditHoliday(h)} className="p-1.5 hover:bg-tetri-bg rounded-lg transition-colors"><Edit2 className="w-3.5 h-3.5 text-tetri-neutral" /></button>
                            <button onClick={() => handleDeleteHoliday(h.id)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Workspaces ── */}
      {tab === 'Workspaces' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-tetri-text">
              Workspaces using this profile ({workspaces === null ? '…' : workspaces.length})
            </h3>
          </div>
          <div className="bg-white border border-tetri-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-tetri-border bg-tetri-bg/50">
                  {['Workspace', 'Company', 'Owner', 'Status', 'Joined', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-tetri-neutral uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-tetri-border">
                {workspaces === null ? (
                  <tr><td colSpan={6} className="py-10 text-center text-sm text-tetri-neutral">Loading…</td></tr>
                ) : workspaces.length === 0 ? (
                  <tr><td colSpan={6} className="py-10 text-center text-sm text-tetri-neutral">No workspaces assigned to this country profile.</td></tr>
                ) : workspaces.map((w) => (
                  <tr key={w.id} className="hover:bg-tetri-bg/20 transition-colors">
                    <td className="px-4 py-3 font-medium text-tetri-text">{w.name}</td>
                    <td className="px-4 py-3 text-tetri-muted">{w.company?.companyName || '—'}</td>
                    <td className="px-4 py-3 text-tetri-muted text-xs">{w.owner?.email || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                        w.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-tetri-bg text-tetri-neutral border-tetri-border'
                      }`}>{w.status}</span>
                    </td>
                    <td className="px-4 py-3 text-tetri-muted text-xs">{fmtDate(w.createdAt)}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => navigate(`/organizations/${w.id}`)}
                        className="text-xs text-tetri-primary hover:underline">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
