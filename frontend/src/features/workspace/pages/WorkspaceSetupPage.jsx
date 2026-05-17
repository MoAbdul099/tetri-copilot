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
import companyService from '../../settings/services/companyService.js';
import workspaceService from '../services/workspaceService.js';
import settingsService from '../../settings/services/settingsService.js';
import localizationService from '../../settings/services/localizationService.js';

const STEPS = [
  { id: 1, label: 'Company Profile', icon: Building2 },
  { id: 2, label: 'Localization', icon: Globe },
  { id: 3, label: 'Preferences', icon: Settings },
];

const InputField = ({ label, id, error, ...props }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-tetri-text mb-1.5">
      {label}
    </label>
    <input
      id={id}
      className={`w-full px-3 py-2.5 border rounded-xl text-sm text-tetri-text placeholder:text-tetri-neutral focus:outline-none focus:ring-2 focus:ring-tetri-blue focus:border-transparent transition-shadow bg-white ${
        error ? 'border-tetri-error' : 'border-tetri-border'
      }`}
      {...props}
    />
    {error && <p className="mt-1 text-xs text-tetri-error">{error}</p>}
  </div>
);

const SelectField = ({ label, id, options, placeholder, error, ...props }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-tetri-text mb-1.5">
      {label}
    </label>
    <select
      id={id}
      className={`w-full px-3 py-2.5 border rounded-xl text-sm text-tetri-text focus:outline-none focus:ring-2 focus:ring-tetri-blue focus:border-transparent transition-shadow bg-white appearance-none ${
        error ? 'border-tetri-error' : 'border-tetri-border'
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
    {error && <p className="mt-1 text-xs text-tetri-error">{error}</p>}
  </div>
);

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

  const handleCountryChange = (e) => {
    const countryId = e.target.value;
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
        // Strip empty strings to null for optional fields
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

  return (
    <div className="min-h-screen bg-tetri-bg flex flex-col items-center justify-start px-4 py-10">
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="text-center mb-8">
          <img
            src="/logo.svg"
            alt="Tetri Copilot"
            className="h-8 w-auto mx-auto mb-6"
            draggable={false}
          />
          <h1 className="text-xl font-bold text-tetri-text">Complete your workspace setup</h1>
          <p className="text-tetri-muted text-sm mt-1">
            Just a few steps to get your workspace ready
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-0 mb-8">
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
                      <CheckCircle2 className="w-4.5 h-4.5" size={18} />
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
                  <InputField
                    label="Company Name *"
                    id="companyName"
                    value={company.companyName}
                    onChange={(e) => setCompany((p) => ({ ...p, companyName: e.target.value }))}
                    placeholder="e.g. Acme Consulting LLC"
                    error={companyErrors.companyName}
                  />
                </div>
                <InputField
                  label="Legal Name"
                  id="legalName"
                  value={company.legalName}
                  onChange={(e) => setCompany((p) => ({ ...p, legalName: e.target.value }))}
                  placeholder="Legal entity name"
                />
                <InputField
                  label="Business Email"
                  id="email"
                  type="email"
                  value={company.email}
                  onChange={(e) => setCompany((p) => ({ ...p, email: e.target.value }))}
                  placeholder="hello@company.com"
                />
                <InputField
                  label="Phone"
                  id="phone"
                  value={company.phone}
                  onChange={(e) => setCompany((p) => ({ ...p, phone: e.target.value }))}
                  placeholder="+1 000 000 0000"
                />
                <InputField
                  label="Website"
                  id="website"
                  value={company.website}
                  onChange={(e) => setCompany((p) => ({ ...p, website: e.target.value }))}
                  placeholder="https://company.com"
                />
                <div className="sm:col-span-2">
                  <InputField
                    label="Address Line 1"
                    id="addressLine1"
                    value={company.addressLine1}
                    onChange={(e) => setCompany((p) => ({ ...p, addressLine1: e.target.value }))}
                    placeholder="Street address"
                  />
                </div>
                <InputField
                  label="City"
                  id="city"
                  value={company.city}
                  onChange={(e) => setCompany((p) => ({ ...p, city: e.target.value }))}
                  placeholder="City"
                />
                <InputField
                  label="Postal Code"
                  id="postalCode"
                  value={company.postalCode}
                  onChange={(e) => setCompany((p) => ({ ...p, postalCode: e.target.value }))}
                  placeholder="Postal code"
                />
                <InputField
                  label="Tax Number"
                  id="taxNumber"
                  value={company.taxNumber}
                  onChange={(e) => setCompany((p) => ({ ...p, taxNumber: e.target.value }))}
                  placeholder="VAT / TRN / TIN"
                />
                <InputField
                  label="Registration Number"
                  id="registrationNumber"
                  value={company.registrationNumber}
                  onChange={(e) => setCompany((p) => ({ ...p, registrationNumber: e.target.value }))}
                  placeholder="Company registration no."
                />
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
                  <SelectField
                    label="Country"
                    id="country"
                    value={localization.countryProfileId}
                    onChange={handleCountryChange}
                    placeholder="Select a country"
                    options={countries.map((c) => ({ value: c.id, label: c.countryName }))}
                  />
                  <SelectField
                    label="Default Currency"
                    id="currency"
                    value={localization.defaultCurrencyId}
                    onChange={(e) =>
                      setLocalization((p) => ({ ...p, defaultCurrencyId: e.target.value }))
                    }
                    placeholder="Select currency"
                    options={currencies.map((c) => ({
                      value: c.id,
                      label: `${c.code} — ${c.name}`,
                    }))}
                  />
                  <SelectField
                    label="Default Language"
                    id="language"
                    value={localization.defaultLanguageId}
                    onChange={(e) =>
                      setLocalization((p) => ({ ...p, defaultLanguageId: e.target.value }))
                    }
                    placeholder="Select language"
                    options={languages.map((l) => ({
                      value: l.id,
                      label: l.nativeName ? `${l.name} (${l.nativeName})` : l.name,
                    }))}
                  />
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
                  <InputField
                    label="Invoice Prefix"
                    id="invoicePrefix"
                    value={settings.invoicePrefix}
                    onChange={(e) =>
                      setSettings((p) => ({ ...p, invoicePrefix: e.target.value.toUpperCase() }))
                    }
                    placeholder="INV"
                    maxLength={20}
                  />
                  <InputField
                    label="Invoice Due Days"
                    id="dueDays"
                    type="number"
                    min={1}
                    max={365}
                    value={settings.defaultInvoiceDueDays}
                    onChange={(e) =>
                      setSettings((p) => ({ ...p, defaultInvoiceDueDays: e.target.value }))
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <InputField
                    label="Default Tax Rate (%)"
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
                  <InputField
                    label="Reminder Lead Days"
                    id="reminderLeadDays"
                    type="number"
                    min={0}
                    max={30}
                    value={settings.reminderLeadDays}
                    onChange={(e) =>
                      setSettings((p) => ({ ...p, reminderLeadDays: e.target.value }))
                    }
                  />
                </div>

                <div className="border border-tetri-border rounded-xl p-4 space-y-3">
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
                    <label key={key} className="flex items-center gap-3 cursor-pointer">
                      <div className="relative">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={settings[key]}
                          onChange={(e) =>
                            setSettings((p) => ({ ...p, [key]: e.target.checked }))
                          }
                        />
                        <div className="w-10 h-5.5 bg-tetri-border rounded-full peer-checked:bg-tetri-blue transition-colors" style={{height:'22px'}} />
                        <div className="absolute top-0.5 left-0.5 w-4.5 h-4.5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4.5" style={{width:'18px',height:'18px',transform: settings[key] ? 'translateX(18px)' : 'translateX(0)'}} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-tetri-text">{label}</p>
                        <p className="text-xs text-tetri-muted">{desc}</p>
                      </div>
                    </label>
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
            <button
              type="button"
              onClick={step === 1 ? undefined : handleBack}
              disabled={step === 1 || saving}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-xl border border-tetri-border text-tetri-muted hover:bg-tetri-bg transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                step === 1 ? 'invisible' : ''
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            <button
              type="button"
              onClick={handleNext}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-tetri-blue text-white text-sm font-semibold rounded-btn hover:bg-tetri-blue-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
            </button>
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
