import { useState, useEffect } from 'react';
import { ChevronDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import LineItemsEditor from './LineItemsEditor.jsx';
import { listCustomers } from '../../customers/services/customersService.js';
import { useWorkspace } from '../../../context/WorkspaceContext.jsx';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'AED', 'SAR', 'QAR', 'GEL', 'CAD', 'AUD', 'CHF', 'JPY', 'SGD'];

const today = () => new Date().toISOString().slice(0, 10);
const daysFromNow = (n) => new Date(Date.now() + n * 864e5).toISOString().slice(0, 10);

function buildDefaults(currencyCode = 'USD', taxRate = 0) {
  return {
    customerId: '',
    customerContactId: '',
    issueDate: today(),
    dueDate: daysFromNow(30),
    currencyCode,
    referenceNumber: '',
    poNumber: '',
    customerReference: '',
    notes: '',
    terms: '',
    internalComments: '',
    items: [{ description: '', quantity: 1, unitPrice: 0, discountRate: 0, taxRate }],
  };
}

function Section({ title, children, collapsible = false }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border border-tetri-border rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => collapsible && setOpen((v) => !v)}
        className={`w-full flex items-center justify-between px-5 py-3.5 bg-tetri-bg text-sm font-semibold text-tetri-text ${collapsible ? 'cursor-pointer hover:bg-slate-100' : 'cursor-default'}`}
      >
        {title}
        {collapsible && (
          <ChevronDown className={`w-4 h-4 text-tetri-neutral transition-transform ${open ? 'rotate-180' : ''}`} />
        )}
      </button>
      {open && <div className="px-5 py-4">{children}</div>}
    </div>
  );
}

function FieldRow({ label, children, half = false }) {
  return (
    <div className={half ? 'w-1/2' : 'w-full'}>
      <label className="block text-xs font-medium text-tetri-neutral mb-1.5">{label}</label>
      {children}
    </div>
  );
}

export default function InvoiceForm({ initialValues, onSubmit, submitLabel = 'Save Invoice', loading }) {
  const { workspace } = useWorkspace();
  const defaultCurrency = workspace?.defaultCurrency?.code || workspace?.countryProfile?.defaultCurrency?.code || 'USD';
  // Priority: workspace setting override (if >0) → country profile default → 0
  // Use || not ?? so that a zero companySettings value falls through to the country profile rate
  const defaultTaxRate = Number(
    workspace?.companySettings?.defaultTaxRate ||
    workspace?.countryProfile?.defaultTaxRate ||
    0
  );

  const [values, setValues] = useState(() => ({
    ...buildDefaults(defaultCurrency, defaultTaxRate),
    ...initialValues,
  }));
  const [customers, setCustomers] = useState([]);
  const [errors, setErrors] = useState({});

  // Re-apply defaults when workspace loads (only on create — don't overwrite existing initialValues)
  useEffect(() => {
    if (!workspace || initialValues?.currencyCode) return;
    setValues((prev) => ({
      ...prev,
      currencyCode: defaultCurrency,
      items: prev.items.map((item, i) =>
        i === 0 && item.taxRate === 0 && !item.description ? { ...item, taxRate: defaultTaxRate } : item
      ),
    }));
  }, [workspace]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    listCustomers({ limit: 200, status: 'active' }).then((r) => setCustomers(r?.items || []));
  }, []);

  const set = (k, v) => setValues((prev) => ({ ...prev, [k]: v }));

  const validate = () => {
    const errs = {};
    if (!values.customerId)    errs.customerId = 'Customer is required';
    if (!values.issueDate)     errs.issueDate  = 'Issue date is required';
    if (!values.items?.length) errs.items = 'At least one item is required';
    values.items?.forEach((item, i) => {
      if (!item.description?.trim()) errs[`item_${i}_desc`] = 'Required';
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const payload = {
      ...values,
      items: values.items.map((item, idx) => ({
        description:  item.description,
        quantity:     Number(item.quantity),
        unitPrice:    Number(item.unitPrice),
        discountRate: Number(item.discountRate || 0),
        taxRate:      Number(item.taxRate || 0),
        itemOrder:    idx + 1,
      })),
      customerContactId: values.customerContactId || null,
      dueDate:           values.dueDate || null,
      referenceNumber:   values.referenceNumber || null,
      poNumber:          values.poNumber || null,
      customerReference: values.customerReference || null,
      notes:             values.notes || null,
      terms:             values.terms || null,
      internalComments:  values.internalComments || null,
    };
    onSubmit(payload);
  };

  const err = (k) => errors[k] ? <p className="text-xs text-tetri-error mt-1">{errors[k]}</p> : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Customer + dates */}
      <Section title="Invoice Details">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-xs font-medium text-tetri-neutral mb-1.5">Customer *</label>
            <Select value={values.customerId} onValueChange={(v) => set('customerId', v)}>
              <SelectTrigger className={errors.customerId ? 'border-tetri-error' : ''}>
                <SelectValue placeholder="Select customer…" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {err('customerId')}
          </div>

          <FieldRow label="Issue Date *">
            <Input
              type="date"
              value={values.issueDate}
              onChange={(e) => set('issueDate', e.target.value)}
              className={errors.issueDate ? 'border-tetri-error' : ''}
            />
            {err('issueDate')}
          </FieldRow>

          <FieldRow label="Due Date">
            <Input type="date" value={values.dueDate || ''} onChange={(e) => set('dueDate', e.target.value)} />
          </FieldRow>

          <FieldRow label="Currency">
            <Select value={values.currencyCode} onValueChange={(v) => set('currencyCode', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </FieldRow>

          <FieldRow label="Reference Number">
            <Input
              value={values.referenceNumber || ''}
              onChange={(e) => set('referenceNumber', e.target.value)}
              placeholder="e.g. REF-001"
            />
          </FieldRow>

          <FieldRow label="PO Number">
            <Input
              value={values.poNumber || ''}
              onChange={(e) => set('poNumber', e.target.value)}
              placeholder="Purchase order number"
            />
          </FieldRow>

          <FieldRow label="Customer Reference">
            <Input
              value={values.customerReference || ''}
              onChange={(e) => set('customerReference', e.target.value)}
              placeholder="Customer's reference"
            />
          </FieldRow>
        </div>
      </Section>

      {/* Line items */}
      <Section title="Line Items">
        <LineItemsEditor
          items={values.items}
          currency={values.currencyCode}
          onChange={(items) => set('items', items)}
        />
        {err('items')}
      </Section>

      {/* Notes & terms */}
      <Section title="Notes & Terms" collapsible>
        <div className="space-y-4">
          <FieldRow label="Notes (visible on invoice)">
            <textarea
              rows={3}
              value={values.notes || ''}
              onChange={(e) => set('notes', e.target.value)}
              className="w-full border border-tetri-border rounded-xl px-3 py-2 text-sm text-tetri-text focus:outline-none focus:ring-2 focus:ring-tetri-primary/20 focus:border-tetri-primary resize-none"
              placeholder="Thank you for your business…"
            />
          </FieldRow>
          <FieldRow label="Terms & Conditions">
            <textarea
              rows={3}
              value={values.terms || ''}
              onChange={(e) => set('terms', e.target.value)}
              className="w-full border border-tetri-border rounded-xl px-3 py-2 text-sm text-tetri-text focus:outline-none focus:ring-2 focus:ring-tetri-primary/20 focus:border-tetri-primary resize-none"
              placeholder="Payment due within 30 days…"
            />
          </FieldRow>
          <FieldRow label="Internal Comments (not on PDF)">
            <textarea
              rows={2}
              value={values.internalComments || ''}
              onChange={(e) => set('internalComments', e.target.value)}
              className="w-full border border-tetri-border rounded-xl px-3 py-2 text-sm text-tetri-text focus:outline-none focus:ring-2 focus:ring-tetri-primary/20 focus:border-tetri-primary resize-none"
            />
          </FieldRow>
        </div>
      </Section>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" disabled={loading} className="gap-2 min-w-32">
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
