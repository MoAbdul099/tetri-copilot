import { useState, useEffect } from 'react';
import { useClerk } from '@clerk/clerk-react';
import {
  Building2,
  Globe,
  Settings,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  LogOut,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import companyService from '../../settings/services/companyService.js';
import workspaceService from '../services/workspaceService.js';
import settingsService from '../../settings/services/settingsService.js';
import localizationService from '../../settings/services/localizationService.js';
import Field from '../../../components/shared/Field.jsx';

const STEPS = [
  { id: 1, label: 'Company Profile', icon: Building2 },
  { id: 2, label: 'Localization', icon: Globe },
  { id: 3, label: 'Preferences', icon: Settings },
];

export default function WorkspaceSetupPage() {
  const { signOut } = useClerk();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Step 1 state
  const [company, setCompany] = useState({
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
  });
  const [companyErrors, setCompanyErrors] = useState({});

  // Step 2 state
  const [countries, setCountries] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [localization, setLocalization] = useState({
    countryProfileId: '',
    defaultCurrencyId: '',
    defaultLanguageId: '',
  });
  const [localizationLoading, setLocalizationLoading] = useState(false);

  // Step 3 state
  const [settings, setSettings] = useState({
    invoicePrefix: 'INV',
    defaultInvoiceDueDays: 14,
    defaultTaxRate: 0,
    reminderLeadDays: 3,
    emailNotificationsEnabled: true,
    dashboardNotificationsEnabled: true,
  });

  // Load localization data when step 2 is reached
  useEffect(() => {
    if (step === 2 && countries.length === 0) {
      setLocalizationLoading(true);
      Promise.all([
        localizationService.getCountries(),
        localizationService.getLanguages(),
        localizationService.getCurrencies(),
      ])
        .then(([c, l, cu]) => {
          setCountries(c);
          setLanguages(l);
          setCurrencies(cu);
        })
        .catch(() => setError('Failed to load localization options'))
        .finally(() => setLocalizationLoading(false));
    }
  }, [step]);

  const handleCountryChange = (countryId) => {
    const selected = countries.find((c) => c.id === countryId);
    setLocalization({
      countryProfileId: countryId,
      defaultCurrencyId: selected?.defaultCurrencyId || '',
      defaultLanguageId: selected?.defaultLanguageId || '',
    });
  };

  const validateStep1 = () => {
    const errs = {};
    if (!company.companyName.trim()) errs.companyName = 'Company name is required';
    setCompanyErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = async () => {
    setError('');

    if (step === 1) {
      if (!validateStep1()) return;
      setSaving(true);
      try {
        const payload = Object.fromEntries(
          Object.entries(company).map(([k, v]) => [k, v.trim() === '' ? null : v.trim()])
        );
        payload.companyName = company.companyName.trim();
        await companyService.updateCompany(payload);
        setStep(2);
      } catch (err) {
        setError(err?.response?.data?.error || 'Failed to save company profile');
      } finally {
        setSaving(false);
      }
      return;
    }

    if (step === 2) {
      setSaving(true);
      try {
        const payload = {};
        if (localization.countryProfileId) payload.countryProfileId = localization.countryProfileId;
        if (localization.defaultCurrencyId) payload.defaultCurrencyId = localization.defaultCurrencyId;
        if (localization.defaultLanguageId) payload.defaultLanguageId = localization.defaultLanguageId;
        if (Object.keys(payload).length > 0) {
          await workspaceService.updateCurrent(payload);
        }
        setStep(3);
      } catch (err) {
        setError(err?.response?.data?.error || 'Failed to save localization settings');
      } finally {
        setSaving(false);
      }
      return;
    }

    if (step === 3) {
      setSaving(true);
      try {
        await settingsService.updateSettings({
          invoicePrefix: settings.invoicePrefix,
          defaultInvoiceDueDays: Number(settings.defaultInvoiceDueDays),
          defaultTaxRate: Number(settings.defaultTaxRate),
          reminderLeadDays: Number(settings.reminderLeadDays),
          emailNotificationsEnabled: settings.emailNotificationsEnabled,
          dashboardNotificationsEnabled: settings.dashboardNotificationsEnabled,
        });
        // Full reload so auth/me is re-fetched and setupComplete = true
        window.location.replace('/dashboard');
      } catch (err) {
        setError(err?.response?.data?.error || 'Failed to save preferences');
        setSaving(false);
      }
    }
  };

  const handleBack = () => {
    setError('');
    setStep((s) => s - 1);
  };

  const setCompanyField = (k) => (e) => setCompany((p) => ({ ...p, [k]: e.target.value }));

  return (
    <div className="min-h-screen bg-tetri-bg flex flex-col items-center justify-start px-4 py-10">
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="text-center mb-8">
          <img
            src="/logo.svg"
            alt="Tetri Copilot"
            className="max-w-[200px] w-full h-auto mx-auto mb-6 object-contain"
            draggable={false}
          />
          <h1 className="text-xl font-bold text-tetri-text">Complete your workspace setup</h1>
          <p className="text-tetri-muted text-sm mt-1">
            Just a few steps to get your workspace ready
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center mb-8">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isActive = step === s.id;
            const isDone = step > s.id;
            return (
              <div key={s.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                      isDone
                        ? 'bg-tetri-blue text-white'
                        : isActive
                        ? 'bg-[#eff4ff] border-2 border-tetri-blue text-tetri-blue'
                        : 'bg-white border-2 border-tetri-border text-tetri-neutral'
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 size={18} />
                    ) : (
                      <Icon size={16} />
                    )}
                  </div>
                  <span
                    className={`mt-1.5 text-xs font-medium ${
                      isActive ? 'text-tetri-blue' : isDone ? 'text-tetri-muted' : 'text-tetri-neutral'
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`w-16 h-0.5 mx-1 mb-5 ${
                      step > s.id ? 'bg-tetri-blue' : 'bg-tetri-border'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Step card */}
        <div className="bg-white rounded-card border border-tetri-border p-6">
          {/* Step 1: Company Profile */}
          {step === 1 && (
            <div>
              <h2 className="text-base font-semibold text-tetri-text mb-5">Company profile</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Field label="Company Name *" id="companyName" error={companyErrors.companyName}>
                    <Input
                      id="companyName"
                      value={company.companyName}
                      onChange={setCompanyField('companyName')}
                      placeholder="e.g. Acme Consulting LLC"
                      className={companyErrors.companyName ? 'border-tetri-error' : ''}
                    />
                  </Field>
                </div>
                <Field label="Legal Name" id="legalName">
                  <Input id="legalName" value={company.legalName} onChange={setCompanyField('legalName')} placeholder="Legal entity name" />
                </Field>
                <Field label="Business Email" id="email">
                  <Input id="email" type="email" value={company.email} onChange={setCompanyField('email')} placeholder="hello@company.com" />
                </Field>
                <Field label="Phone" id="phone">
                  <Input id="phone" value={company.phone} onChange={setCompanyField('phone')} placeholder="+1 000 000 0000" />
                </Field>
                <Field label="Website" id="website">
                  <Input id="website" value={company.website} onChange={setCompanyField('website')} placeholder="https://company.com" />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Address Line 1" id="addressLine1">
                    <Input id="addressLine1" value={company.addressLine1} onChange={setCompanyField('addressLine1')} placeholder="Street address" />
                  </Field>
                </div>
                <Field label="City" id="city">
                  <Input id="city" value={company.city} onChange={setCompanyField('city')} placeholder="City" />
                </Field>
                <Field label="Postal Code" id="postalCode">
                  <Input id="postalCode" value={company.postalCode} onChange={setCompanyField('postalCode')} placeholder="Postal code" />
                </Field>
                <Field label="Tax Number" id="taxNumber">
                  <Input id="taxNumber" value={company.taxNumber} onChange={setCompanyField('taxNumber')} placeholder="VAT / TRN / TIN" />
                </Field>
                <Field label="Registration Number" id="registrationNumber">
                  <Input id="registrationNumber" value={company.registrationNumber} onChange={setCompanyField('registrationNumber')} placeholder="Company registration no." />
                </Field>
              </div>
            </div>
          )}

          {/* Step 2: Localization */}
          {step === 2 && (
            <div>
              <h2 className="text-base font-semibold text-tetri-text mb-1">Localization</h2>
              <p className="text-sm text-tetri-muted mb-5">
                Select your country to auto-fill currency and language defaults.
              </p>
              {localizationLoading ? (
                <div className="flex items-center justify-center py-10 gap-2 text-tetri-muted">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm">Loading options…</span>
                </div>
              ) : (
                <div className="space-y-4">
                  <Field label="Country" id="country">
                    <Select value={localization.countryProfileId} onValueChange={handleCountryChange}>
                      <SelectTrigger id="country">
                        <SelectValue placeholder="Select a country" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.countryName}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Default Currency" id="currency">
                    <Select
                      value={localization.defaultCurrencyId}
                      onValueChange={(v) => setLocalization((p) => ({ ...p, defaultCurrencyId: v }))}
                    >
                      <SelectTrigger id="currency">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.code} — {c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Default Language" id="language">
                    <Select
                      value={localization.defaultLanguageId}
                      onValueChange={(v) => setLocalization((p) => ({ ...p, defaultLanguageId: v }))}
                    >
                      <SelectTrigger id="language">
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
                </div>
              )}
            </div>
          )}

          {/* Step 3: Preferences */}
          {step === 3 && (
            <div>
              <h2 className="text-base font-semibold text-tetri-text mb-1">Workspace preferences</h2>
              <p className="text-sm text-tetri-muted mb-5">
                Set defaults for invoicing and notifications. You can change these later.
              </p>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Invoice Prefix" id="invoicePrefix">
                    <Input
                      id="invoicePrefix"
                      value={settings.invoicePrefix}
                      onChange={(e) =>
                        setSettings((p) => ({ ...p, invoicePrefix: e.target.value.toUpperCase() }))
                      }
                      placeholder="INV"
                      maxLength={20}
                    />
                  </Field>
                  <Field label="Invoice Due Days" id="dueDays">
                    <Input
                      id="dueDays"
                      type="number"
                      min={1}
                      max={365}
                      value={settings.defaultInvoiceDueDays}
                      onChange={(e) =>
                        setSettings((p) => ({ ...p, defaultInvoiceDueDays: e.target.value }))
                      }
                    />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Default Tax Rate (%)" id="taxRate">
                    <Input
                      id="taxRate"
                      type="number"
                      min={0}
                      max={100}
                      step={0.01}
                      value={settings.defaultTaxRate}
                      onChange={(e) =>
                        setSettings((p) => ({ ...p, defaultTaxRate: e.target.value }))
                      }
                    />
                  </Field>
                  <Field label="Reminder Lead Days" id="reminderLeadDays">
                    <Input
                      id="reminderLeadDays"
                      type="number"
                      min={0}
                      max={30}
                      value={settings.reminderLeadDays}
                      onChange={(e) =>
                        setSettings((p) => ({ ...p, reminderLeadDays: e.target.value }))
                      }
                    />
                  </Field>
                </div>

                <div className="border border-tetri-border rounded-xl p-4 space-y-4">
                  <p className="text-sm font-medium text-tetri-text">Notifications</p>
                  {[
                    {
                      key: 'emailNotificationsEnabled',
                      label: 'Email notifications',
                      desc: 'Receive reminders and alerts via email',
                    },
                    {
                      key: 'dashboardNotificationsEnabled',
                      label: 'Dashboard notifications',
                      desc: 'Show alerts inside the app',
                    },
                  ].map(({ key, label, desc }) => (
                    <div key={key} className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-tetri-text">{label}</p>
                        <p className="text-xs text-tetri-muted">{desc}</p>
                      </div>
                      <Switch
                        checked={settings[key]}
                        onCheckedChange={(checked) =>
                          setSettings((p) => ({ ...p, [key]: checked }))
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-tetri-error">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between mt-6 pt-5 border-t border-tetri-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={step === 1 ? undefined : handleBack}
              disabled={step === 1 || saving}
              className={step === 1 ? 'invisible' : ''}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>

            <Button
              type="button"
              onClick={handleNext}
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : step === 3 ? (
                <>
                  Finish setup
                  <CheckCircle2 className="w-4 h-4" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Sign out link */}
        <div className="text-center mt-5">
          <button
            onClick={() => signOut({ redirectUrl: '/sign-in' })}
            className="inline-flex items-center gap-1.5 text-xs text-tetri-neutral hover:text-tetri-muted transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
