import { useState, useEffect } from 'react';
import { Loader2, ChevronDown, ChevronRight, Tag, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import Field from '../../../components/shared/Field.jsx';
import { listTags } from '../services/customersService.js';

const CUSTOMER_TYPES = [
  { value: 'individual', label: 'Individual' },
  { value: 'company', label: 'Company' },
  { value: 'government', label: 'Government' },
  { value: 'ngo', label: 'NGO' },
  { value: 'other', label: 'Other' },
];

const CUSTOMER_STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'suspended', label: 'Suspended' },
];

const PAYMENT_TERMS = [
  { value: 'due_immediately', label: 'Due Immediately' },
  { value: 'net_7', label: 'Net 7' },
  { value: 'net_15', label: 'Net 15' },
  { value: 'net_30', label: 'Net 30' },
  { value: 'net_45', label: 'Net 45' },
  { value: 'net_60', label: 'Net 60' },
];

const DEFAULT_VALUES = {
  name: '',
  customerType: 'company',
  status: 'active',
  email: '',
  phone: '',
  paymentTerms: '',
  defaultCurrency: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  stateRegion: '',
  postalCode: '',
  country: '',
  taxNumber: '',
  vatNumber: '',
  commercialRegistrationNumber: '',
  businessLicenseNumber: '',
  openingBalance: '',
  creditLimit: '',
  notes: '',
  tagIds: [],
};

function Section({ title, children, collapsible = false }) {
  const [open, setOpen] = useState(true);
  const Icon = open ? ChevronDown : ChevronRight;

  return (
    <div className="border border-tetri-border rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => collapsible && setOpen((v) => !v)}
        className={`w-full flex items-center justify-between px-5 py-4 bg-tetri-bg ${collapsible ? 'cursor-pointer hover:bg-tetri-bg/80' : 'cursor-default'}`}
      >
        <p className="text-sm font-semibold text-tetri-text">{title}</p>
        {collapsible && <Icon className="w-4 h-4 text-tetri-neutral" />}
      </button>
      {open && <div className="px-5 py-5 bg-white space-y-4">{children}</div>}
    </div>
  );
}

function TwoCol({ children }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>;
}

export default function CustomerForm({ initialValues, onSubmit, loading, isEdit = false }) {
  const [form, setForm] = useState({ ...DEFAULT_VALUES, ...initialValues });
  const [availableTags, setAvailableTags] = useState([]);
  const [tagDropdownOpen, setTagDropdownOpen] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    listTags().then(setAvailableTags).catch(() => {});
  }, []);

  const set = (key) => (e) => {
    const val = e?.target !== undefined ? e.target.value : e;
    setForm((f) => ({ ...f, [key]: val }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: null }));
  };

  const toggleTag = (tagId) => {
    setForm((f) => ({
      ...f,
      tagIds: f.tagIds.includes(tagId)
        ? f.tagIds.filter((id) => id !== tagId)
        : [...f.tagIds, tagId],
    }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Customer name is required';
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const payload = {
      name: form.name.trim(),
      customerType: form.customerType,
      status: form.status,
      email: form.email.trim() || undefined,
      phone: form.phone.trim() || undefined,
      paymentTerms: form.paymentTerms || undefined,
      defaultCurrency: form.defaultCurrency.trim() || undefined,
      addressLine1: form.addressLine1.trim() || undefined,
      addressLine2: form.addressLine2.trim() || undefined,
      city: form.city.trim() || undefined,
      stateRegion: form.stateRegion.trim() || undefined,
      postalCode: form.postalCode.trim() || undefined,
      country: form.country.trim() || undefined,
      taxNumber: form.taxNumber.trim() || undefined,
      vatNumber: form.vatNumber.trim() || undefined,
      commercialRegistrationNumber: form.commercialRegistrationNumber.trim() || undefined,
      businessLicenseNumber: form.businessLicenseNumber.trim() || undefined,
      openingBalance: form.openingBalance !== '' ? Number(form.openingBalance) : undefined,
      creditLimit: form.creditLimit !== '' ? Number(form.creditLimit) : undefined,
      notes: form.notes.trim() || undefined,
      tagIds: form.tagIds.length > 0 ? form.tagIds : undefined,
    };

    onSubmit(payload);
  };

  const selectedTags = availableTags.filter((t) => form.tagIds.includes(t.id));

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Basic Info */}
      <Section title="Basic Information">
        <TwoCol>
          <Field label="Customer Name *" id="name" error={errors.name}>
            <Input id="name" value={form.name} onChange={set('name')} placeholder="Acme Corp" />
          </Field>
          <Field label="Customer Type" id="customerType">
            <Select value={form.customerType} onValueChange={set('customerType')}>
              <SelectTrigger id="customerType"><SelectValue /></SelectTrigger>
              <SelectContent>
                {CUSTOMER_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          {isEdit && (
            <Field label="Status" id="status">
              <Select value={form.status} onValueChange={set('status')}>
                <SelectTrigger id="status"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CUSTOMER_STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}
          <Field label="Email" id="email">
            <Input id="email" type="email" value={form.email} onChange={set('email')} placeholder="contact@example.com" />
          </Field>
          <Field label="Phone" id="phone">
            <Input id="phone" value={form.phone} onChange={set('phone')} placeholder="+1 555 000 0000" />
          </Field>
          <Field label="Payment Terms" id="paymentTerms">
            <Select value={form.paymentTerms || '_none'} onValueChange={(v) => set('paymentTerms')(v === '_none' ? '' : v)}>
              <SelectTrigger id="paymentTerms"><SelectValue placeholder="Select terms" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="_none">None</SelectItem>
                {PAYMENT_TERMS.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Default Currency" id="defaultCurrency">
            <Input id="defaultCurrency" value={form.defaultCurrency} onChange={set('defaultCurrency')} placeholder="USD" maxLength={10} />
          </Field>
        </TwoCol>
      </Section>

      {/* Address */}
      <Section title="Address" collapsible>
        <TwoCol>
          <Field label="Address Line 1" id="addressLine1">
            <Input id="addressLine1" value={form.addressLine1} onChange={set('addressLine1')} placeholder="123 Main St" />
          </Field>
          <Field label="Address Line 2" id="addressLine2">
            <Input id="addressLine2" value={form.addressLine2} onChange={set('addressLine2')} placeholder="Suite 100" />
          </Field>
          <Field label="City" id="city">
            <Input id="city" value={form.city} onChange={set('city')} placeholder="New York" />
          </Field>
          <Field label="State / Region" id="stateRegion">
            <Input id="stateRegion" value={form.stateRegion} onChange={set('stateRegion')} placeholder="NY" />
          </Field>
          <Field label="Postal Code" id="postalCode">
            <Input id="postalCode" value={form.postalCode} onChange={set('postalCode')} placeholder="10001" />
          </Field>
          <Field label="Country" id="country">
            <Input id="country" value={form.country} onChange={set('country')} placeholder="United States" />
          </Field>
        </TwoCol>
      </Section>

      {/* Tax & Legal */}
      <Section title="Tax & Legal" collapsible>
        <TwoCol>
          <Field label="Tax Number" id="taxNumber">
            <Input id="taxNumber" value={form.taxNumber} onChange={set('taxNumber')} placeholder="123-45-6789" />
          </Field>
          <Field label="VAT Number" id="vatNumber">
            <Input id="vatNumber" value={form.vatNumber} onChange={set('vatNumber')} placeholder="GB123456789" />
          </Field>
          <Field label="Commercial Reg. Number" id="commercialRegistrationNumber">
            <Input id="commercialRegistrationNumber" value={form.commercialRegistrationNumber} onChange={set('commercialRegistrationNumber')} />
          </Field>
          <Field label="Business License Number" id="businessLicenseNumber">
            <Input id="businessLicenseNumber" value={form.businessLicenseNumber} onChange={set('businessLicenseNumber')} />
          </Field>
        </TwoCol>
      </Section>

      {/* Financial */}
      <Section title="Financial" collapsible>
        <TwoCol>
          <Field label="Opening Balance" id="openingBalance">
            <Input id="openingBalance" type="number" step="0.01" value={form.openingBalance} onChange={set('openingBalance')} placeholder="0.00" />
          </Field>
          <Field label="Credit Limit" id="creditLimit">
            <Input id="creditLimit" type="number" step="0.01" value={form.creditLimit} onChange={set('creditLimit')} placeholder="0.00" />
          </Field>
        </TwoCol>
      </Section>

      {/* Tags */}
      {availableTags.length > 0 && (
        <Section title="Tags" collapsible>
          <div className="space-y-3">
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {selectedTags.map((tag) => (
                  <span
                    key={tag.id}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[#eff4ff] text-tetri-blue border border-tetri-blue/20"
                  >
                    <Tag className="w-3 h-3" />
                    {tag.name}
                    <button
                      type="button"
                      onClick={() => toggleTag(tag.id)}
                      className="ml-0.5 hover:text-tetri-error"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div className="relative inline-block">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setTagDropdownOpen((v) => !v)}
              >
                <Tag className="w-3.5 h-3.5" />
                {tagDropdownOpen ? 'Close' : 'Select tags'}
              </Button>
              {tagDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setTagDropdownOpen(false)} />
                  <div className="absolute left-0 top-full mt-1 w-52 bg-white border border-tetri-border rounded-xl shadow-lg py-1 z-20 max-h-48 overflow-y-auto">
                    {availableTags.map((tag) => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggleTag(tag.id)}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-tetri-text hover:bg-tetri-bg transition-colors"
                      >
                        <div className={`w-3.5 h-3.5 rounded border flex-shrink-0 flex items-center justify-center ${
                          form.tagIds.includes(tag.id)
                            ? 'bg-tetri-blue border-tetri-blue'
                            : 'border-tetri-border'
                        }`}>
                          {form.tagIds.includes(tag.id) && (
                            <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10" fill="none">
                              <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>
                        {tag.name}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </Section>
      )}

      {/* Notes */}
      <Section title="Internal Notes" collapsible>
        <Field label="Notes" id="notes">
          <textarea
            id="notes"
            value={form.notes}
            onChange={set('notes')}
            placeholder="Internal notes about this customer…"
            rows={4}
            className="w-full rounded-xl border border-tetri-border bg-white px-3 py-2.5 text-sm text-tetri-text placeholder:text-tetri-neutral focus:outline-none focus:ring-2 focus:ring-tetri-blue focus:border-transparent resize-none"
          />
        </Field>
      </Section>

      {/* Submit */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          {isEdit ? 'Save changes' : 'Create customer'}
        </Button>
      </div>
    </form>
  );
}
