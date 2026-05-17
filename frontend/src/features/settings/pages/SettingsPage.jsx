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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Alert } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import companyService from '../services/companyService.js';
import settingsService from '../services/settingsService.js';
import localizationService from '../services/localizationService.js';
import membersService from '../services/membersService.js';
import workspaceService from '../../workspace/services/workspaceService.js';
import authService from '../../auth/services/authService.js';

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

// Shared field wrapper
const Field = ({ label, id, hint, error, children }) => (
  <div className="space-y-1.5">
    <Label htmlFor={id}>{label}</Label>
    {children}
    {hint && <p className="text-xs text-tetri-neutral">{hint}</p>}
    {error && <p className="text-xs text-tetri-error">{error}</p>}
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
          <Field label="Company Name *" id="s-companyName">
            <Input id="s-companyName" value={form?.companyName || ''} onChange={set('companyName')} readOnly={!isOwner} placeholder="Acme Consulting LLC" />
          </Field>
        </div>
        <Field label="Legal Name" id="s-legalName">
          <Input id="s-legalName" value={form?.legalName || ''} onChange={set('legalName')} readOnly={!isOwner} placeholder="Legal entity name" />
        </Field>
        <Field label="Business Email" id="s-email">
          <Input id="s-email" type="email" value={form?.email || ''} onChange={set('email')} readOnly={!isOwner} placeholder="hello@company.com" />
        </Field>
        <Field label="Phone" id="s-phone">
          <Input id="s-phone" value={form?.phone || ''} onChange={set('phone')} readOnly={!isOwner} placeholder="+1 000 000 0000" />
        </Field>
        <Field label="Website" id="s-website">
          <Input id="s-website" value={form?.website || ''} onChange={set('website')} readOnly={!isOwner} placeholder="https://company.com" />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Address Line 1" id="s-addr1">
            <Input id="s-addr1" value={form?.addressLine1 || ''} onChange={set('addressLine1')} readOnly={!isOwner} placeholder="Street address" />
          </Field>
        </div>
        <Field label="City" id="s-city">
          <Input id="s-city" value={form?.city || ''} onChange={set('city')} readOnly={!isOwner} placeholder="City" />
        </Field>
        <Field label="Postal Code" id="s-postal">
          <Input id="s-postal" value={form?.postalCode || ''} onChange={set('postalCode')} readOnly={!isOwner} placeholder="Postal code" />
        </Field>
        <Field label="Tax Number" id="s-tax">
          <Input id="s-tax" value={form?.taxNumber || ''} onChange={set('taxNumber')} readOnly={!isOwner} placeholder="VAT / TRN / TIN" />
        </Field>
        <Field label="Registration Number" id="s-reg">
          <Input id="s-reg" value={form?.registrationNumber || ''} onChange={set('registrationNumber')} readOnly={!isOwner} placeholder="Company reg. no." />
        </Field>
      </div>

      {isOwner && (
        <div className="flex justify-end mt-6 pt-5 border-t border-tetri-border">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save changes
          </Button>
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
          <Field label="Invoice Prefix" id="s-prefix" hint="e.g. INV, BILL">
            <Input id="s-prefix" value={form?.invoicePrefix || ''} onChange={set('invoicePrefix')} readOnly={!isOwner} maxLength={20} />
          </Field>
          <Field label="Default Due Days" id="s-due">
            <Input id="s-due" type="number" min={1} max={365} value={form?.defaultInvoiceDueDays ?? ''} onChange={set('defaultInvoiceDueDays')} readOnly={!isOwner} />
          </Field>
          <Field label="Default Tax Rate (%)" id="s-taxrate">
            <Input id="s-taxrate" type="number" min={0} max={100} step={0.01} value={form?.defaultTaxRate ?? ''} onChange={set('defaultTaxRate')} readOnly={!isOwner} />
          </Field>
          <Field label="Reminder Lead Days" id="s-lead">
            <Input id="s-lead" type="number" min={0} max={30} value={form?.reminderLeadDays ?? ''} onChange={set('reminderLeadDays')} readOnly={!isOwner} />
          </Field>
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold text-tetri-text mb-4">Notifications</p>
        <div className="border border-tetri-border rounded-xl divide-y divide-tetri-border">
          {[
            { key: 'emailNotificationsEnabled', label: 'Email notifications', desc: 'Reminders and alerts via email' },
            { key: 'dashboardNotificationsEnabled', label: 'Dashboard notifications', desc: 'In-app notification alerts' },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between px-4 py-3.5 gap-4">
              <div>
                <p className="text-sm font-medium text-tetri-text">{label}</p>
                <p className="text-xs text-tetri-muted">{desc}</p>
              </div>
              <Switch
                checked={form?.[key] ?? false}
                onCheckedChange={(checked) =>
                  isOwner && setForm((f) => ({ ...f, [key]: checked }))
                }
                disabled={!isOwner}
              />
            </div>
          ))}
        </div>
      </div>

      {isOwner && (
        <div className="flex justify-end pt-2">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save changes
          </Button>
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

  const handleCountryChange = (countryId) => {
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
      <Field label="Country" id="l-country">
        <Select
          value={form.countryProfileId}
          onValueChange={isOwner ? handleCountryChange : undefined}
          disabled={!isOwner}
        >
          <SelectTrigger id="l-country">
            <SelectValue placeholder="Select country" />
          </SelectTrigger>
          <SelectContent>
            {countries.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.countryName}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field label="Default Currency" id="l-currency">
        <Select
          value={form.defaultCurrencyId}
          onValueChange={isOwner ? (v) => setForm((f) => ({ ...f, defaultCurrencyId: v })) : undefined}
          disabled={!isOwner}
        >
          <SelectTrigger id="l-currency">
            <SelectValue placeholder="Select currency" />
          </SelectTrigger>
          <SelectContent>
            {currencies.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.code} — {c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field label="Default Language" id="l-language">
        <Select
          value={form.defaultLanguageId}
          onValueChange={isOwner ? (v) => setForm((f) => ({ ...f, defaultLanguageId: v })) : undefined}
          disabled={!isOwner}
        >
          <SelectTrigger id="l-language">
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            {languages.map((l) => (
              <SelectItem key={l.id} value={l.id}>
                {l.nativeName ? `${l.name} (${l.nativeName})` : l.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      {isOwner && (
        <div className="flex justify-end pt-2">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save changes
          </Button>
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
      setInviteRole('user');
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
            <Button size="sm" onClick={() => setShowInvite(true)}>
              <Plus className="w-3.5 h-3.5" />
              Invite
            </Button>
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

      {/* Invite dialog */}
      <Dialog open={showInvite} onOpenChange={setShowInvite}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite a team member</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Field label="Email address" id="invite-email">
              <Input
                id="invite-email"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@company.com"
                onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
              />
            </Field>
            <Field label="Role" id="invite-role">
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger id="invite-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User — operational access</SelectItem>
                  <SelectItem value="viewer">Viewer — read-only access</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>

          <DialogFooter>
            <Button variant="outline" className="flex-1" onClick={() => setShowInvite(false)}>
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleInvite}
              disabled={inviting || !inviteEmail.trim()}
            >
              {inviting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Send invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Main Settings Page ──────────────────────────────────────────────────────
export default function SettingsPage() {
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

      <Tabs defaultValue="company">
        <TabsList className="w-full mb-7 overflow-x-auto">
          <TabsTrigger value="company" className="flex items-center gap-1.5">
            <Building2 size={15} />
            Company Profile
          </TabsTrigger>
          <TabsTrigger value="workspace" className="flex items-center gap-1.5">
            <Settings size={15} />
            Workspace Settings
          </TabsTrigger>
          <TabsTrigger value="localization" className="flex items-center gap-1.5">
            <Globe size={15} />
            Localization
          </TabsTrigger>
          <TabsTrigger value="members" className="flex items-center gap-1.5">
            <Users size={15} />
            Members
          </TabsTrigger>
        </TabsList>

        <div className="bg-white rounded-card border border-tetri-border p-6">
          {!isOwner && (
            <Alert variant="warning" className="mb-5">
              <Shield className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>You have read-only access. Only workspace owners can edit settings.</span>
            </Alert>
          )}

          <TabsContent value="company">
            <CompanyTab isOwner={isOwner} onToast={showToast} />
          </TabsContent>
          <TabsContent value="workspace">
            <WorkspaceSettingsTab isOwner={isOwner} onToast={showToast} />
          </TabsContent>
          <TabsContent value="localization">
            <LocalizationTab isOwner={isOwner} onToast={showToast} />
          </TabsContent>
          <TabsContent value="members">
            <MembersTab isOwner={isOwner} onToast={showToast} />
          </TabsContent>
        </div>
      </Tabs>

      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  );
}
