import { useState, useEffect } from 'react';
import {
  Building2,
  Settings,
  Globe,
  Users,
  Save,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Alert } from '@/components/ui/alert';
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
import workspaceService from '../../workspace/services/workspaceService.js';
import authService from '../../auth/services/authService.js';
import Field from '../../../components/shared/Field.jsx';
import PageHeader from '../../../components/shared/PageHeader.jsx';
import { useToast } from '../../../components/shared/Toast.jsx';

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
function MembersTab() {
  return (
    <div className="py-2">
      <div className="flex items-start gap-4 p-4 bg-tetri-bg rounded-xl border border-tetri-border">
        <div className="w-9 h-9 bg-[#eff4ff] rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
          <Users className="w-4.5 h-4.5 text-tetri-blue" size={18} />
        </div>
        <div>
          <p className="text-sm font-semibold text-tetri-text">Manage team members</p>
          <p className="text-xs text-tetri-muted mt-0.5">
            Invite members, assign roles, manage access, and handle invitations from the Members page.
          </p>
          <a
            href="/members"
            className="inline-flex items-center gap-1.5 mt-3 text-xs font-semibold text-tetri-blue hover:text-tetri-blue-hover transition-colors"
          >
            Go to Members
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── Main Settings Page ──────────────────────────────────────────────────────
export default function SettingsPage() {
  const { showToast, ToastContainer } = useToast();
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    authService.getMe().then((d) => setIsOwner(d?.workspace?.role === 'owner'));
  }, []);

  return (
    <div className="px-4 sm:px-8 py-8 max-w-3xl mx-auto">
      <PageHeader title="Settings" subtitle="Manage your workspace, company, and team" />

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
            <MembersTab />
          </TabsContent>
        </div>
      </Tabs>

      {ToastContainer}
    </div>
  );
}
