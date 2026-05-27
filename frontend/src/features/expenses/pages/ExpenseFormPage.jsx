import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PageHeader from '../../../components/shared/PageHeader.jsx';
import { useToast } from '../../../components/shared/Toast.jsx';
import AiCategorizationPanel from '../components/AiCategorizationPanel.jsx';
import {
  getExpense, createExpense, updateExpense,
  listCategories, listSuppliers, createSupplier,
  aiCategorize,
} from '../services/expensesService.js';

const EXPENSE_TYPES = [
  { value: 'company',    label: 'Company Expense' },
  { value: 'employee',   label: 'Employee Expense' },
  { value: 'petty_cash', label: 'Petty Cash' },
];

const STATUSES = [
  { value: 'draft',     label: 'Draft' },
  { value: 'submitted', label: 'Submitted' },
];

const today = () => new Date().toISOString().split('T')[0];

const EMPTY = {
  expenseDate:     today(),
  postingDate:     today(),
  expenseType:     'company',
  status:          'draft',
  categoryId:      '',
  supplierId:      '',
  currencyCode:    'USD',
  amount:          '',
  description:     '',
  taxRate:         '',
  taxIncluded:     false,
  referenceNumber: '',
  department:      '',
  costCenter:      '',
  project:         '',
  notes:           '',
};

function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-tetri-text mb-1.5">
        {label}{required && <span className="text-tetri-error ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-white border border-tetri-border rounded-xl p-5">
      <h3 className="text-sm font-semibold text-tetri-text mb-4">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
    </div>
  );
}

function QuickSupplierModal({ onClose, onCreated }) {
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const supplier = await createSupplier({ name: name.trim() });
      onCreated(supplier);
      onClose();
    } catch {
      showToast('error', 'Failed to create supplier');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm space-y-4">
        <h3 className="text-base font-semibold text-tetri-text">Quick Add Supplier</h3>
        <Input
          placeholder="Supplier name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          autoFocus
        />
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={!name.trim() || saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add Supplier'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function ExpenseFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { showToast, ToastContainer } = useToast();

  const [form, setForm] = useState(EMPTY);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [showQuickSupplier, setShowQuickSupplier] = useState(false);

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  useEffect(() => {
    listCategories({ limit: 200 }).then((r) => setCategories(r.items || [])).catch(() => {});
    listSuppliers({ limit: 200 }).then((r) => setSuppliers(r.items || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    getExpense(id)
      .then((exp) => {
        setForm({
          expenseDate:     exp.expenseDate?.split('T')[0] || today(),
          postingDate:     exp.postingDate?.split('T')[0] || today(),
          expenseType:     exp.expenseType || 'company',
          status:          exp.status || 'draft',
          categoryId:      exp.categoryId || '',
          supplierId:      exp.supplierId || '',
          currencyCode:    exp.currencyCode || 'USD',
          amount:          exp.amount ? String(exp.amount) : '',
          description:     exp.description || '',
          taxRate:         exp.taxRate ? String(exp.taxRate) : '',
          taxIncluded:     exp.taxIncluded || false,
          referenceNumber: exp.referenceNumber || '',
          department:      exp.department || '',
          costCenter:      exp.costCenter || '',
          project:         exp.project || '',
          notes:           exp.notes || '',
        });
      })
      .catch(() => showToast('error', 'Failed to load expense'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.expenseDate || !form.expenseType || !form.categoryId || !form.amount || !form.description) {
      showToast('error', 'Please fill in all required fields');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        amount:  parseFloat(form.amount),
        taxRate: form.taxRate ? parseFloat(form.taxRate) : null,
        supplierId: form.supplierId || null,
        postingDate: form.postingDate || form.expenseDate,
      };
      if (isEdit) {
        await updateExpense(id, payload);
        showToast('success', 'Expense updated');
        navigate(`/expenses/${id}`);
      } else {
        const created = await createExpense(payload);
        showToast('success', 'Expense created');
        navigate(`/expenses/${created.id}`);
      }
    } catch (err) {
      showToast('error', err.response?.data?.error || 'Failed to save expense');
    } finally {
      setSaving(false);
    }
  };

  const handleSupplierCreated = (supplier) => {
    setSuppliers((prev) => [...prev, supplier].sort((a, b) => a.name.localeCompare(b.name)));
    set('supplierId', supplier.id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-tetri-neutral" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {ToastContainer}
      {showQuickSupplier && (
        <QuickSupplierModal onClose={() => setShowQuickSupplier(false)} onCreated={handleSupplierCreated} />
      )}

      <PageHeader
        title={isEdit ? 'Edit Expense' : 'New Expense'}
        subtitle={isEdit ? 'Update expense record' : 'Record a new expense'}
      >
        <Button variant="outline" onClick={() => navigate(isEdit ? `/expenses/${id}` : '/expenses')} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
      </PageHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Section title="General Information">
          <Field label="Expense Date" required>
            <Input type="date" value={form.expenseDate} onChange={(e) => set('expenseDate', e.target.value)} required />
          </Field>
          <Field label="Posting Date" required>
            <Input type="date" value={form.postingDate} onChange={(e) => set('postingDate', e.target.value)} required />
          </Field>
          <Field label="Expense Type" required>
            <select
              value={form.expenseType}
              onChange={(e) => set('expenseType', e.target.value)}
              className="w-full text-sm border border-tetri-border rounded-lg px-3 py-2 bg-white text-tetri-text focus:outline-none focus:ring-2 focus:ring-tetri-blue"
            >
              {EXPENSE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </Field>
          <Field label="Status" required>
            <select
              value={form.status}
              onChange={(e) => set('status', e.target.value)}
              className="w-full text-sm border border-tetri-border rounded-lg px-3 py-2 bg-white text-tetri-text focus:outline-none focus:ring-2 focus:ring-tetri-blue"
            >
              {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </Field>
          <Field label="Category" required>
            <select
              value={form.categoryId}
              onChange={(e) => set('categoryId', e.target.value)}
              className="w-full text-sm border border-tetri-border rounded-lg px-3 py-2 bg-white text-tetri-text focus:outline-none focus:ring-2 focus:ring-tetri-blue"
              required
            >
              <option value="">Select category…</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
          <Field label="Supplier">
            <div className="flex gap-2">
              <select
                value={form.supplierId}
                onChange={(e) => set('supplierId', e.target.value)}
                className="flex-1 text-sm border border-tetri-border rounded-lg px-3 py-2 bg-white text-tetri-text focus:outline-none focus:ring-2 focus:ring-tetri-blue"
              >
                <option value="">No supplier</option>
                {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <Button type="button" variant="outline" size="icon" onClick={() => setShowQuickSupplier(true)} title="Quick add supplier">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </Field>
          <Field label="Currency" required>
            <Input value={form.currencyCode} onChange={(e) => set('currencyCode', e.target.value.toUpperCase())} placeholder="USD" maxLength={3} />
          </Field>
          <Field label="Amount" required>
            <Input type="number" step="0.01" min="0" value={form.amount} onChange={(e) => set('amount', e.target.value)} placeholder="0.00" required />
          </Field>
          <div className="md:col-span-2">
            <Field label="Description" required>
              <Input value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Brief description of the expense" required />
            </Field>
          </div>
          <div className="md:col-span-2">
            <AiCategorizationPanel
              description={form.description}
              vendorName={suppliers.find((s) => s.id === form.supplierId)?.name || ''}
              amount={form.amount}
              currency={form.currencyCode}
              notes={form.notes}
              expenseId={id || null}
              onCategorize={aiCategorize}
              onAccept={({ categoryId }) => {
                if (categoryId) set('categoryId', categoryId);
              }}
            />
          </div>
        </Section>

        <Section title="Tax Information">
          <Field label="Tax Rate (%)">
            <Input type="number" step="0.01" min="0" max="100" value={form.taxRate} onChange={(e) => set('taxRate', e.target.value)} placeholder="e.g. 20" />
          </Field>
          <Field label="Tax Included in Amount">
            <div className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                id="taxIncluded"
                checked={form.taxIncluded}
                onChange={(e) => set('taxIncluded', e.target.checked)}
                className="w-4 h-4 text-tetri-blue border-tetri-border rounded focus:ring-tetri-blue"
              />
              <label htmlFor="taxIncluded" className="text-sm text-tetri-text">Tax is included in the amount above</label>
            </div>
          </Field>
        </Section>

        <Section title="Additional Information">
          <Field label="Reference Number">
            <Input value={form.referenceNumber} onChange={(e) => set('referenceNumber', e.target.value)} placeholder="Invoice # or reference" />
          </Field>
          <Field label="Department">
            <Input value={form.department} onChange={(e) => set('department', e.target.value)} placeholder="e.g. Operations" />
          </Field>
          <Field label="Cost Center">
            <Input value={form.costCenter} onChange={(e) => set('costCenter', e.target.value)} placeholder="Cost center code" />
          </Field>
          <Field label="Project">
            <Input value={form.project} onChange={(e) => set('project', e.target.value)} placeholder="Project name or code" />
          </Field>
          <div className="md:col-span-2">
            <Field label="Notes">
              <textarea
                value={form.notes}
                onChange={(e) => set('notes', e.target.value)}
                placeholder="Internal notes…"
                rows={3}
                className="w-full text-sm border border-tetri-border rounded-lg px-3 py-2 bg-white text-tetri-text focus:outline-none focus:ring-2 focus:ring-tetri-blue resize-none"
              />
            </Field>
          </div>
        </Section>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate(isEdit ? `/expenses/${id}` : '/expenses')}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving} className="gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isEdit ? 'Save Changes' : 'Create Expense'}
          </Button>
        </div>
      </form>
    </div>
  );
}
