import { useState, useEffect } from 'react';
import {
  Building2,
  Settings,
  Globe,
  Users,
  Save,
  Loader2,
  CheckCircle2,
  XCircle,
  Plus,
  Shield,
  Mail,
  UserX,
  UserCheck,
  X,
  Send,
} from 'lucide-react';
import companyService from '../services/companyService.js';
import settingsService from '../services/settingsService.js';
import localizationService from '../services/localizationService.js';
import membersService from '../services/membersService.js';
import workspaceService from '../../workspace/services/workspaceService.js';
import authService from '../../auth/services/authService.js';

const TABS = [
  { id: 'company', label: 'Company Profile', icon: Building2 },
  { id: 'workspace', label: 'Workspace Settings', icon: Settings },
  { id: 'localization', label: 'Localization', icon: Globe },
  { id: 'members', label: 'Members', icon: Users },
];

const ROLE_LABELS = { owner: 'Owner', user: 'User', viewer: 'Viewer', admin: 'Admin' };
const ROLE_COLORS = {
  owner: 'bg-[#eff4ff] text-tetri-blue',
  user: 'bg-emerald-50 text-emerald-700',
  viewer: 'bg-amber-50 text-amber-700',
  admin: 'bg-purple-50 text-purple-700',
};
const STATUS_COLORS = {
  active: 'bg-emerald-50 text-emerald-700',
  inactive: 'bg-red-50 text-tetri-error',
  invited: 'bg-amber-50 text-amber-700',
};

const InputField = ({ label, id, hint, error, readOnly, ...props }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-tetri-text mb-1.5">
      {label}
    </label>
    <input
      id={id}
      readOnly={readOnly}
      className={`w-full px-3 py-2.5 border rounded-xl text-sm text-tetri-text placeholder:text-tetri-neutral focus:outline-none focus:ring-2 focus:ring-tetri-blue focus:border-transparent transition-shadow ${
        readOnly ? 'bg-tetri-bg cursor-default' : 'bg-white'
      } ${error ? 'border-tetri-error' : 'border-tetri-border'}`}
      {...props}
    />
    {hint && <p className="mt-1 text-xs text-tetri-neutral">{hint}</p>}
    {error && <p className="mt-1 text-xs text-tetri-error">{error}</p>}
  </div>
);

const SelectField = ({ label, id, options, placeholder, disabled, ...props }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-tetri-text mb-1.5">
      {label}
    </label>
    <select
      id={id}
      disabled={disabled}
      className={`w-full px-3 py-2.5 border border-tetri-border rounded-xl text-sm text-tetri-text focus:outline-none focus:ring-2 focus:ring-tetri-blue focus:border-transparent transition-shadow appearance-none ${
        disabled ? 'bg-tetri-bg cursor-default' : 'bg-white'
      }`}
      {...props}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  </div>
);

const Toast = ({ type, message, onClose }) => (
  <div
    className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium ${
      type === 'success'
        ? 'bg-white border-emerald-200 text-emerald-700'
        : 'bg-white border-red-200 text-tetri-error'
    }`}
  >
    {type === 'success' ? (
      <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
    ) : (
      <XCircle className="w-4 h-4 flex-shrink-0" />
    )}
    <span>{message}</span>
    <button onClick={onClose} className="ml-1 opacity-60 hover:opacity-100">
      <X className="w-3.5 h-3.5" />
    </button>
  </div>
);

// ─── Company Profile Tab ─────────────────────────────────────────────────────
function CompanyTab({ isOwner, onToast }) {
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    companyService
      .getCompany()
      .then((c) =>
        setForm(
          c || {
            companyName: '',
            legalName: '',
            email: '',
            phone: '',
            website: '',
            addressLine1: '',
            addressLine2: '',
            city: '',
            postalCode: '',
            taxNumber: '',
            registrationNumber: '',
          }
        )
      )
      .catch(() => onToast('error', 'Failed to load company profile'))
      .finally(() => setLoading(false));
  }, []);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const nullable = (v) => (v?.trim() === '' ? null : v?.trim());

  const handleSave = async () => {
    if (!form.companyName?.trim()) return onToast('error', 'Company name is required');
    setSaving(true);
    try {
      const updated = await companyService.updateCompany({
        companyName: form.companyName.trim(),
        legalName: nullable(form.legalName),
        email: nullable(form.email),
        phone: nullable(form.phone),
        website: nullable(form.website),
        addressLine1: nullable(form.addressLine1),
        addressLine2: nullable(form.addressLine2),
        city: nullable(form.city),
        postalCode: nullable(form.postalCode),
        taxNumber: nullable(form.taxNumber),
        registrationNumber: nullable(form.registrationNumber),
      });
      setForm(updated);
      onToast('success', 'Company profile saved');
    } catch (err) {
      onToast('error', err?.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center gap-2 py-10 text-tetri-muted">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">Loading…</span>
      </div>
    );

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <InputField
            label="Company Name *"
            id="s-companyName"
            value={form?.companyName || ''}
            onChange={set('companyName')}
            readOnly={!isOwner}
            placeholder="Acme Consulting LLC"
          />
        </div>
        <InputField label="Legal Name" id="s-legalName" value={form?.legalName || ''} onChange={set('legalName')} readOnly={!isOwner} placeholder="Legal entity name" />
        <InputField label="Business Email" id="s-email" type="email" value={form?.email || ''} onChange={set('email')} readOnly={!isOwner} placeholder="hello@company.com" />
        <InputField label="Phone" id="s-phone" value={form?.phone || ''} onChange={set('phone')} readOnly={!isOwner} placeholder="+1 000 000 0000" />
        <InputField label="Website" id="s-website" value={form?.website || ''} onChange={set('website')} readOnly={!isOwner} placeholder="https://company.com" />
        <div className="sm:col-span-2">
          <InputField label="Address Line 1" id="s-addr1" value={form?.addressLine1 || ''} onChange={set('addressLine1')} readOnly={!isOwner} placeholder="Street address" />
        </div>
        <InputField label="City" id="s-city" value={form?.city || ''} onChange={set('city')} readOnly={!isOwner} placeholder="City" />
        <InputField label="Postal Code" id="s-postal" value={form?.postalCode || ''} onChange={set('postalCode')} readOnly={!isOwner} placeholder="Postal code" />
        <InputField label="Tax Number" id="s-tax" value={form?.taxNumber || ''} onChange={set('taxNumber')} readOnly={!isOwner} placeholder="VAT / TRN / TIN" />
        <InputField label="Registration Number" id="s-reg" value={form?.registrationNumber || ''} onChange={set('registrationNumber')} readOnly={!isOwner} placeholder="Company reg. no." />
      </div>

      {isOwner && (
        <div className="flex justify-end mt-6 pt-5 border-t border-tetri-border">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-tetri-blue text-white text-sm font-semibold rounded-btn hover:bg-tetri-blue-hover disabled:opacity-50 transition-colors"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save changes
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Workspace Settings Tab ──────────────────────────────────────────────────
function WorkspaceSettingsTab({ isOwner, onToast }) {
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    settingsService
      .getSettings()
      .then((s) =>
        setForm(
          s || {
            invoicePrefix: 'INV',
            defaultInvoiceDueDays: 14,
            defaultTaxRate: 0,
            reminderLeadDays: 3,
            emailNotificationsEnabled: true,
            dashboardNotificationsEnabled: true,
          }
        )
      )
      .catch(() => onToast('error', 'Failed to load settings'))
      .finally(() => setLoading(false));
  }, []);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const toggle = (k) => () => setForm((f) => ({ ...f, [k]: !f[k] }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await settingsService.updateSettings({
        invoicePrefix: form.invoicePrefix,
        defaultInvoiceDueDays: Number(form.defaultInvoiceDueDays),
        defaultTaxRate: Number(form.defaultTaxRate),
        reminderLeadDays: Number(form.reminderLeadDays),
        emailNotificationsEnabled: form.emailNotificationsEnabled,
        dashboardNotificationsEnabled: form.dashboardNotificationsEnabled,
      });
      setForm(updated);
      onToast('success', 'Settings saved');
    } catch (err) {
      onToast('error', err?.response?.data?.error || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center gap-2 py-10 text-tetri-muted">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">Loading…</span>
      </div>
    );

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-tetri-text mb-4">Invoicing</p>
        <div className="grid grid-cols-2 gap-4">
          <InputField label="Invoice Prefix" id="s-prefix" value={form?.invoicePrefix || ''} onChange={set('invoicePrefix')} readOnly={!isOwner} hint="e.g. INV, BILL" maxLength={20} />
          <InputField label="Default Due Days" id="s-due" type="number" min={1} max={365} value={form?.defaultInvoiceDueDays ?? ''} onChange={set('defaultInvoiceDueDays')} readOnly={!isOwner} />
          <InputField label="Default Tax Rate (%)" id="s-taxrate" type="number" min={0} max={100} step={0.01} value={form?.defaultTaxRate ?? ''} onChange={set('defaultTaxRate')} readOnly={!isOwner} />
          <InputField label="Reminder Lead Days" id="s-lead" type="number" min={0} max={30} value={form?.reminderLeadDays ?? ''} onChange={set('reminderLeadDays')} readOnly={!isOwner} />
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold text-tetri-text mb-4">Notifications</p>
        <div className="border border-tetri-border rounded-xl divide-y divide-tetri-border">
          {[
            { key: 'emailNotificationsEnabled', label: 'Email notifications', desc: 'Reminders and alerts via email' },
            { key: 'dashboardNotificationsEnabled', label: 'Dashboard notifications', desc: 'In-app notification alerts' },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between px-4 py-3.5">
              <div>
                <p className="text-sm font-medium text-tetri-text">{label}</p>
                <p className="text-xs text-tetri-muted">{desc}</p>
              </div>
              <button
                onClick={isOwner ? toggle(key) : undefined}
                disabled={!isOwner}
                className={`relative w-10 h-5.5 rounded-full transition-colors flex-shrink-0 ${
                  form?.[key] ? 'bg-tetri-blue' : 'bg-tetri-border'
                } disabled:cursor-default`}
                style={{ height: '22px' }}
              >
                <span
                  className="absolute top-0.5 w-4.5 bg-white rounded-full shadow transition-transform"
                  style={{
                    width: '18px',
                    height: '18px',
                    left: form?.[key] ? '20px' : '2px',
                  }}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {isOwner && (
        <div className="flex justify-end pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-tetri-blue text-white text-sm font-semibold rounded-btn hover:bg-tetri-blue-hover disabled:opacity-50 transition-colors"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save changes
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Localization Tab ────────────────────────────────────────────────────────
function LocalizationTab({ isOwner, onToast }) {
  const [countries, setCountries] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [form, setForm] = useState({ countryProfileId: '', defaultCurrencyId: '', defaultLanguageId: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      localizationService.getCountries(),
      localizationService.getLanguages(),
      localizationService.getCurrencies(),
      workspaceService.getCurrent(),
    ])
      .then(([c, l, cu, ws]) => {
        setCountries(c);
        setLanguages(l);
        setCurrencies(cu);
        setForm({
          countryProfileId: ws?.countryProfileId || '',
          defaultCurrencyId: ws?.defaultCurrencyId || '',
          defaultLanguageId: ws?.defaultLanguageId || '',
        });
      })
      .catch(() => onToast('error', 'Failed to load localization data'))
      .finally(() => setLoading(false));
  }, []);

  const handleCountryChange = (e) => {
    const countryId = e.target.value;
    const selected = countries.find((c) => c.id === countryId);
    setForm({
      countryProfileId: countryId,
      defaultCurrencyId: selected?.defaultCurrencyId || '',
      defaultLanguageId: selected?.defaultLanguageId || '',
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await workspaceService.updateCurrent({
        countryProfileId: form.countryProfileId || null,
        defaultCurrencyId: form.defaultCurrencyId || null,
        defaultLanguageId: form.defaultLanguageId || null,
      });
      onToast('success', 'Localization saved');
    } catch (err) {
      onToast('error', err?.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center gap-2 py-10 text-tetri-muted">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">Loading…</span>
      </div>
    );

  return (
    <div className="space-y-4">
      <SelectField
        label="Country"
        id="l-country"
        value={form.countryProfileId}
        onChange={handleCountryChange}
        disabled={!isOwner}
        placeholder="Select country"
        options={countries.map((c) => ({ value: c.id, label: c.countryName }))}
      />
      <SelectField
        label="Default Currency"
        id="l-currency"
        value={form.defaultCurrencyId}
        onChange={(e) => setForm((f) => ({ ...f, defaultCurrencyId: e.target.value }))}
        disabled={!isOwner}
        placeholder="Select currency"
        options={currencies.map((c) => ({ value: c.id, label: `${c.code} — ${c.name}` }))}
      />
      <SelectField
        label="Default Language"
        id="l-language"
        value={form.defaultLanguageId}
        onChange={(e) => setForm((f) => ({ ...f, defaultLanguageId: e.target.value }))}
        disabled={!isOwner}
        placeholder="Select language"
        options={languages.map((l) => ({ value: l.id, label: l.nativeName ? `${l.name} (${l.nativeName})` : l.name }))}
      />
      {isOwner && (
        <div className="flex justify-end pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-tetri-blue text-white text-sm font-semibold rounded-btn hover:bg-tetri-blue-hover disabled:opacity-50 transition-colors"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save changes
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Members Tab ─────────────────────────────────────────────────────────────
function MembersTab({ isOwner, onToast }) {
  const [data, setData] = useState({ members: [], invitations: [] });
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('user');
  const [inviting, setInviting] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const load = () => {
    setLoading(true);
    membersService
      .getMembers()
      .then(setData)
      .catch(() => onToast('error', 'Failed to load members'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    setInviting(true);
    try {
      await membersService.invite(inviteEmail.trim(), inviteRole);
      onToast('success', `Invitation created for ${inviteEmail.trim()}`);
      setInviteEmail('');
      setShowInvite(false);
      load();
    } catch (err) {
      onToast('error', err?.response?.data?.error || 'Failed to send invitation');
    } finally {
      setInviting(false);
    }
  };

  const handleStatusToggle = async (member) => {
    const newStatus = member.status === 'active' ? 'inactive' : 'active';
    setUpdatingId(member.id);
    try {
      await membersService.updateStatus(member.id, newStatus);
      onToast('success', `Member ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
      load();
    } catch (err) {
      onToast('error', err?.response?.data?.error || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading)
    return (
      <div className="flex items-center gap-2 py-10 text-tetri-muted">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">Loading…</span>
      </div>
    );

  return (
    <div className="space-y-6">
      {/* Members table */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-tetri-text">
            Workspace members ({data.members.length})
          </p>
          {isOwner && (
            <button
              onClick={() => setShowInvite(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-tetri-blue text-white text-sm font-medium rounded-btn hover:bg-tetri-blue-hover transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Invite
            </button>
          )}
        </div>

        <div className="border border-tetri-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-tetri-bg border-b border-tetri-border">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-tetri-neutral uppercase tracking-wide">Member</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-tetri-neutral uppercase tracking-wide">Role</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-tetri-neutral uppercase tracking-wide">Status</th>
                {isOwner && <th className="px-4 py-3" />}
              </tr>
            </thead>
            <tbody className="divide-y divide-tetri-border bg-white">
              {data.members.map((m) => (
                <tr key={m.id} className="hover:bg-tetri-bg/50 transition-colors">
                  <td className="px-4 py-3.5">
                    <p className="font-medium text-tetri-text">{m.user.fullName || '—'}</p>
                    <p className="text-xs text-tetri-muted">{m.user.email}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${ROLE_COLORS[m.role] || 'bg-tetri-bg text-tetri-muted'}`}>
                      <Shield className="w-3 h-3" />
                      {ROLE_LABELS[m.role] || m.role}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[m.status] || 'bg-tetri-bg text-tetri-muted'}`}>
                      {m.status}
                    </span>
                  </td>
                  {isOwner && (
                    <td className="px-4 py-3.5 text-right">
                      {m.role !== 'owner' && (
                        <button
                          onClick={() => handleStatusToggle(m)}
                          disabled={updatingId === m.id}
                          className="flex items-center gap-1.5 ml-auto text-xs text-tetri-neutral hover:text-tetri-text transition-colors disabled:opacity-50"
                        >
                          {updatingId === m.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : m.status === 'active' ? (
                            <UserX className="w-3.5 h-3.5" />
                          ) : (
                            <UserCheck className="w-3.5 h-3.5" />
                          )}
                          {m.status === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pending invitations */}
      {data.invitations.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-tetri-text mb-3">
            Pending invitations ({data.invitations.length})
          </p>
          <div className="border border-tetri-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-tetri-bg border-b border-tetri-border">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-tetri-neutral uppercase tracking-wide">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-tetri-neutral uppercase tracking-wide">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-tetri-neutral uppercase tracking-wide">Expires</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-tetri-border bg-white">
                {data.invitations.map((inv) => (
                  <tr key={inv.id} className="hover:bg-tetri-bg/50">
                    <td className="px-4 py-3.5 flex items-center gap-2 text-tetri-text">
                      <Mail className="w-3.5 h-3.5 text-tetri-neutral flex-shrink-0" />
                      {inv.email}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${ROLE_COLORS[inv.role] || 'bg-tetri-bg text-tetri-muted'}`}>
                        {ROLE_LABELS[inv.role] || inv.role}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-tetri-muted text-xs">
                      {new Date(inv.expiresAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invite modal */}
      {showInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="bg-white rounded-card border border-tetri-border shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-tetri-text">Invite a team member</h3>
              <button
                onClick={() => setShowInvite(false)}
                className="p-1.5 rounded-lg text-tetri-neutral hover:bg-tetri-bg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-tetri-text mb-1.5">
                  Email address
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@company.com"
                  className="w-full px-3 py-2.5 border border-tetri-border rounded-xl text-sm text-tetri-text placeholder:text-tetri-neutral focus:outline-none focus:ring-2 focus:ring-tetri-blue focus:border-transparent bg-white"
                  onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-tetri-text mb-1.5">Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full px-3 py-2.5 border border-tetri-border rounded-xl text-sm text-tetri-text focus:outline-none focus:ring-2 focus:ring-tetri-blue bg-white appearance-none"
                >
                  <option value="user">User — operational access</option>
                  <option value="viewer">Viewer — read-only access</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowInvite(false)}
                className="flex-1 px-4 py-2.5 border border-tetri-border text-sm font-medium text-tetri-muted rounded-btn hover:bg-tetri-bg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleInvite}
                disabled={inviting || !inviteEmail.trim()}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-tetri-blue text-white text-sm font-semibold rounded-btn hover:bg-tetri-blue-hover disabled:opacity-50 transition-colors"
              >
                {inviting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Send invitation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Settings Page ──────────────────────────────────────────────────────
export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('company');
  const [toast, setToast] = useState(null);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    authService.getMe().then((d) => setIsOwner(d?.workspace?.role === 'owner'));
  }, []);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <div className="px-4 sm:px-8 py-8 max-w-3xl mx-auto">
      <div className="mb-7">
        <h1 className="text-xl font-bold text-tetri-text">Settings</h1>
        <p className="text-sm text-tetri-muted mt-0.5">Manage your workspace, company, and team</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-tetri-bg border border-tetri-border rounded-xl p-1 mb-7 overflow-x-auto">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
              activeTab === id
                ? 'bg-white text-tetri-text shadow-sm border border-tetri-border'
                : 'text-tetri-muted hover:text-tetri-text'
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="bg-white rounded-card border border-tetri-border p-6">
        {!isOwner && (
          <div className="mb-5 flex items-center gap-2 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
            <Shield className="w-4 h-4 flex-shrink-0" />
            You have read-only access. Only workspace owners can edit settings.
          </div>
        )}
        {activeTab === 'company' && <CompanyTab isOwner={isOwner} onToast={showToast} />}
        {activeTab === 'workspace' && <WorkspaceSettingsTab isOwner={isOwner} onToast={showToast} />}
        {activeTab === 'localization' && <LocalizationTab isOwner={isOwner} onToast={showToast} />}
        {activeTab === 'members' && <MembersTab isOwner={isOwner} onToast={showToast} />}
      </div>

      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  );
}
