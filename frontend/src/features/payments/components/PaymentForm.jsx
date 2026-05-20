import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { listCustomers } from '../../customers/services/customersService';

const METHODS = [
  { value: 'cash',            label: 'Cash' },
  { value: 'bank_transfer',   label: 'Bank Transfer' },
  { value: 'credit_card',     label: 'Credit Card' },
  { value: 'debit_card',      label: 'Debit Card' },
  { value: 'cheque',          label: 'Cheque' },
  { value: 'mobile_wallet',   label: 'Mobile Wallet' },
  { value: 'pos',             label: 'POS' },
  { value: 'online_transfer', label: 'Online Transfer' },
  { value: 'other',           label: 'Other' },
];

const CURRENCIES = ['USD', 'EUR', 'GBP', 'AED', 'SAR', 'CAD', 'AUD'];

const today = () => new Date().toISOString().slice(0, 10);

export default function PaymentForm({ initial = {}, onSubmit, loading, submitLabel = 'Save' }) {
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({
    customerId:      initial.customerId     || '',
    paymentDate:     initial.paymentDate    ? initial.paymentDate.slice(0, 10) : today(),
    amount:          initial.amount         || '',
    currencyCode:    initial.currencyCode   || 'USD',
    paymentMethod:   initial.paymentMethod  || 'bank_transfer',
    referenceNumber: initial.referenceNumber || '',
    bankReference:   initial.bankReference  || '',
    chequeNumber:    initial.chequeNumber   || '',
    depositDate:     initial.depositDate    ? initial.depositDate.slice(0, 10) : '',
    valueDate:       initial.valueDate      ? initial.valueDate.slice(0, 10)   : '',
    isAdvance:       initial.isAdvance      || false,
    notes:           initial.notes          || '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    listCustomers({ status: 'active', limit: 200 })
      .then((r) => setCustomers(r.items || r))
      .catch(() => {});
  }, []);

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const validate = () => {
    const e = {};
    if (!form.customerId)    e.customerId    = 'Customer is required';
    if (!form.paymentDate)   e.paymentDate   = 'Payment date is required';
    if (!form.amount || Number(form.amount) <= 0) e.amount = 'Amount must be positive';
    if (!form.paymentMethod) e.paymentMethod = 'Payment method is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({ ...form, amount: Number(form.amount) });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Customer */}
        <div className="md:col-span-2">
          <Label>Customer *</Label>
          <Select value={form.customerId} onValueChange={(v) => set('customerId', v)}>
            <SelectTrigger className={errors.customerId ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select customer" />
            </SelectTrigger>
            <SelectContent>
              {customers.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          {errors.customerId && <p className="text-red-500 text-xs mt-1">{errors.customerId}</p>}
        </div>

        {/* Payment Date */}
        <div>
          <Label>Payment Date *</Label>
          <Input type="date" value={form.paymentDate} onChange={(e) => set('paymentDate', e.target.value)} className={errors.paymentDate ? 'border-red-500' : ''} />
          {errors.paymentDate && <p className="text-red-500 text-xs mt-1">{errors.paymentDate}</p>}
        </div>

        {/* Amount */}
        <div>
          <Label>Amount *</Label>
          <div className="flex gap-2">
            <Select value={form.currencyCode} onValueChange={(v) => set('currencyCode', v)}>
              <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
              <SelectContent>{CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
            <Input type="number" step="0.01" min="0" placeholder="0.00" value={form.amount} onChange={(e) => set('amount', e.target.value)} className={`flex-1 ${errors.amount ? 'border-red-500' : ''}`} />
          </div>
          {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
        </div>

        {/* Payment Method */}
        <div>
          <Label>Payment Method *</Label>
          <Select value={form.paymentMethod} onValueChange={(v) => set('paymentMethod', v)}>
            <SelectTrigger className={errors.paymentMethod ? 'border-red-500' : ''}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>{METHODS.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent>
          </Select>
          {errors.paymentMethod && <p className="text-red-500 text-xs mt-1">{errors.paymentMethod}</p>}
        </div>

        {/* Reference */}
        <div>
          <Label>Reference Number</Label>
          <Input value={form.referenceNumber} onChange={(e) => set('referenceNumber', e.target.value)} placeholder="REF-001" />
        </div>

        {/* Bank Reference */}
        <div>
          <Label>Bank Reference</Label>
          <Input value={form.bankReference} onChange={(e) => set('bankReference', e.target.value)} placeholder="Bank transaction ID" />
        </div>

        {/* Cheque Number */}
        {form.paymentMethod === 'cheque' && (
          <div>
            <Label>Cheque Number</Label>
            <Input value={form.chequeNumber} onChange={(e) => set('chequeNumber', e.target.value)} placeholder="CHQ-001" />
          </div>
        )}

        {/* Deposit Date */}
        <div>
          <Label>Deposit Date</Label>
          <Input type="date" value={form.depositDate} onChange={(e) => set('depositDate', e.target.value)} />
        </div>

        {/* Value Date */}
        <div>
          <Label>Value Date</Label>
          <Input type="date" value={form.valueDate} onChange={(e) => set('valueDate', e.target.value)} />
        </div>

        {/* Advance toggle */}
        <div className="flex items-center gap-3 md:col-span-2">
          <input type="checkbox" id="isAdvance" checked={form.isAdvance} onChange={(e) => set('isAdvance', e.target.checked)} className="h-4 w-4 rounded border-gray-300" />
          <Label htmlFor="isAdvance" className="cursor-pointer">This is an advance / deposit payment</Label>
        </div>

        {/* Notes */}
        <div className="md:col-span-2">
          <Label>Notes</Label>
          <Textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Internal notes..." rows={3} />
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
