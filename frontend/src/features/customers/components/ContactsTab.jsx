import { useState, useEffect } from 'react';
import { Plus, Loader2, Star, UserX, UserCheck, Pencil, Trash2, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import Field from '../../../components/shared/Field.jsx';
import { useToast } from '../../../components/shared/Toast.jsx';
import ConfirmDialog from '../../../components/shared/ConfirmDialog.jsx';
import {
  listContacts, createContact, updateContact,
  setPrimaryContact, deactivateContact, reactivateContact, deleteContact,
} from '../services/customersService.js';

const ROLE_LABELS = {
  primary_contact: 'Primary Contact',
  billing_contact: 'Billing Contact',
  finance_contact: 'Finance Contact',
  procurement_contact: 'Procurement Contact',
  operations_contact: 'Operations Contact',
  legal_contact: 'Legal Contact',
  technical_contact: 'Technical Contact',
  other: 'Other',
};

const EMPTY_FORM = { firstName: '', lastName: '', contactRole: 'primary_contact', jobTitle: '', email: '', phone: '', mobile: '' };

function ContactForm({ initial = EMPTY_FORM, onSave, onCancel, loading }) {
  const [form, setForm] = useState(initial);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="bg-tetri-bg rounded-xl p-4 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="First Name *" id="contact-firstName">
          <Input id="contact-firstName" value={form.firstName} onChange={set('firstName')} placeholder="John" />
        </Field>
        <Field label="Last Name *" id="contact-lastName">
          <Input id="contact-lastName" value={form.lastName} onChange={set('lastName')} placeholder="Smith" />
        </Field>
        <Field label="Role" id="contact-role">
          <Select value={form.contactRole || '_none'} onValueChange={(v) => setForm((f) => ({ ...f, contactRole: v === '_none' ? null : v }))}>
            <SelectTrigger id="contact-role"><SelectValue placeholder="Select role" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="_none">No role</SelectItem>
              {Object.entries(ROLE_LABELS).map(([v, l]) => (
                <SelectItem key={v} value={v}>{l}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Job Title" id="contact-jobTitle">
          <Input id="contact-jobTitle" value={form.jobTitle} onChange={set('jobTitle')} placeholder="Finance Manager" />
        </Field>
        <Field label="Email" id="contact-email">
          <Input id="contact-email" type="email" value={form.email} onChange={set('email')} placeholder="john@example.com" />
        </Field>
        <Field label="Phone" id="contact-phone">
          <Input id="contact-phone" value={form.phone} onChange={set('phone')} placeholder="+1 555 000 0000" />
        </Field>
        <Field label="Mobile" id="contact-mobile">
          <Input id="contact-mobile" value={form.mobile} onChange={set('mobile')} placeholder="+1 555 000 0001" />
        </Field>
      </div>
      <div className="flex items-center gap-2 justify-end">
        <Button variant="ghost" size="sm" onClick={onCancel} disabled={loading}>
          <X className="w-3.5 h-3.5" />
          Cancel
        </Button>
        <Button size="sm" onClick={() => onSave(form)} disabled={loading || !form.firstName.trim() || !form.lastName.trim()}>
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
          Save
        </Button>
      </div>
    </div>
  );
}

export default function ContactsTab({ customerId }) {
  const { showToast, ToastContainer } = useToast();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const load = async () => {
    try {
      const data = await listContacts(customerId);
      setContacts(data || []);
    } catch {
      showToast('error', 'Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [customerId]);

  const handleAdd = async (form) => {
    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.contactRole) delete payload.contactRole;
      if (!payload.jobTitle) delete payload.jobTitle;
      if (!payload.mobile) delete payload.mobile;
      await createContact(customerId, payload);
      showToast('success', 'Contact added');
      setShowAddForm(false);
      load();
    } catch (err) {
      showToast('error', err?.response?.data?.error || 'Failed to add contact');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (contactId, form) => {
    setSaving(true);
    try {
      await updateContact(customerId, contactId, form);
      showToast('success', 'Contact updated');
      setEditingId(null);
      load();
    } catch (err) {
      showToast('error', err?.response?.data?.error || 'Failed to update contact');
    } finally {
      setSaving(false);
    }
  };

  const handleSetPrimary = async (contactId) => {
    try {
      await setPrimaryContact(customerId, contactId);
      showToast('success', 'Primary contact updated');
      load();
    } catch (err) {
      showToast('error', err?.response?.data?.error || 'Failed to set primary');
    }
  };

  const handleToggleActive = async (contact) => {
    try {
      if (contact.isActive) {
        await deactivateContact(customerId, contact.id);
        showToast('success', 'Contact deactivated');
      } else {
        await reactivateContact(customerId, contact.id);
        showToast('success', 'Contact reactivated');
      }
      load();
    } catch (err) {
      showToast('error', err?.response?.data?.error || 'Failed to update contact');
    }
  };

  const handleDelete = (contact) => {
    const fullName = `${contact.firstName} ${contact.lastName}`.trim();
    setConfirm({
      title: 'Delete contact?',
      description: `"${fullName}" will be permanently deleted.`,
      confirmLabel: 'Delete',
      variant: 'destructive',
      onConfirm: async () => {
        setConfirmLoading(true);
        try {
          await deleteContact(customerId, contact.id);
          showToast('success', 'Contact deleted');
          load();
        } catch (err) {
          showToast('error', err?.response?.data?.error || 'Failed to delete');
        } finally {
          setConfirmLoading(false);
          setConfirm(null);
        }
      },
    });
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-8 text-tetri-muted">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">Loading contacts…</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-tetri-text">Contacts ({contacts.length})</p>
        {!showAddForm && (
          <Button size="sm" variant="outline" onClick={() => setShowAddForm(true)}>
            <Plus className="w-3.5 h-3.5" />
            Add contact
          </Button>
        )}
      </div>

      {showAddForm && (
        <ContactForm
          onSave={handleAdd}
          onCancel={() => setShowAddForm(false)}
          loading={saving}
        />
      )}

      {contacts.length === 0 && !showAddForm ? (
        <div className="text-center py-10 border border-dashed border-tetri-border rounded-xl">
          <p className="text-sm text-tetri-muted">No contacts yet</p>
          <Button size="sm" variant="outline" className="mt-3" onClick={() => setShowAddForm(true)}>
            <Plus className="w-3.5 h-3.5" />
            Add first contact
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {contacts.map((c) => {
            const fullName = `${c.firstName} ${c.lastName}`.trim();
            return editingId === c.id ? (
              <ContactForm
                key={c.id}
                initial={{
                  firstName: c.firstName || '',
                  lastName: c.lastName || '',
                  contactRole: c.contactRole || '',
                  jobTitle: c.jobTitle || '',
                  email: c.email || '',
                  phone: c.phone || '',
                  mobile: c.mobile || '',
                }}
                onSave={(form) => handleUpdate(c.id, form)}
                onCancel={() => setEditingId(null)}
                loading={saving}
              />
            ) : (
              <div
                key={c.id}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl border ${
                  c.isActive ? 'bg-white border-tetri-border' : 'bg-tetri-bg border-tetri-border opacity-60'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-tetri-text">{fullName}</p>
                    {c.isPrimary && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-semibold bg-[#eff4ff] text-tetri-blue">
                        <Star className="w-2.5 h-2.5 fill-current" />
                        Primary
                      </span>
                    )}
                    {!c.isActive && (
                      <span className="text-xs text-tetri-neutral">(inactive)</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    {c.contactRole && (
                      <p className="text-xs text-tetri-neutral">{ROLE_LABELS[c.contactRole] || c.contactRole}</p>
                    )}
                    {c.jobTitle && <p className="text-xs text-tetri-muted">{c.jobTitle}</p>}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                    {c.email && <p className="text-xs text-tetri-muted">{c.email}</p>}
                    {c.phone && <p className="text-xs text-tetri-muted">{c.phone}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {!c.isPrimary && c.isActive && (
                    <button
                      onClick={() => handleSetPrimary(c.id)}
                      title="Set as primary"
                      className="p-1.5 rounded-lg text-tetri-neutral hover:bg-tetri-bg hover:text-tetri-blue transition-colors"
                    >
                      <Star className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => setEditingId(c.id)}
                    className="p-1.5 rounded-lg text-tetri-neutral hover:bg-tetri-bg hover:text-tetri-text transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleToggleActive(c)}
                    title={c.isActive ? 'Deactivate' : 'Reactivate'}
                    className="p-1.5 rounded-lg text-tetri-neutral hover:bg-tetri-bg transition-colors"
                  >
                    {c.isActive
                      ? <UserX className="w-3.5 h-3.5 hover:text-amber-600" />
                      : <UserCheck className="w-3.5 h-3.5 hover:text-emerald-600" />}
                  </button>
                  <button
                    onClick={() => handleDelete(c)}
                    className="p-1.5 rounded-lg text-tetri-neutral hover:bg-red-50 hover:text-tetri-error transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {confirm && (
        <ConfirmDialog
          open={!!confirm}
          onOpenChange={(v) => !v && setConfirm(null)}
          title={confirm.title}
          description={confirm.description}
          confirmLabel={confirm.confirmLabel}
          variant={confirm.variant}
          loading={confirmLoading}
          onConfirm={confirm.onConfirm}
        />
      )}
      {ToastContainer}
    </div>
  );
}
