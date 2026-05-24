import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, Pencil, Archive, RotateCcw, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '../../../components/shared/Toast.jsx';
import ConfirmDialog from '../../../components/shared/ConfirmDialog.jsx';
import ContactsTab from '../components/ContactsTab.jsx';
import NotesTab from '../components/NotesTab.jsx';
import AttachmentsPanel from '../../files/components/AttachmentsPanel.jsx';
import { getCustomer, archiveCustomer, restoreCustomer } from '../services/customersService.js';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'contacts', label: 'Contacts' },
  { id: 'address', label: 'Address & Tax' },
  { id: 'financial', label: 'Financial' },
  { id: 'notes', label: 'Notes' },
  { id: 'attachments', label: 'Attachments' },
];

const CUSTOMER_TYPE_LABELS = {
  individual: 'Individual',
  company: 'Company',
  government: 'Government',
  ngo: 'NGO',
  other: 'Other',
};

const PAYMENT_TERMS_LABELS = {
  due_immediately: 'Due Immediately',
  net_7: 'Net 7',
  net_15: 'Net 15',
  net_30: 'Net 30',
  net_45: 'Net 45',
  net_60: 'Net 60',
};

const STATUS_BADGE_STYLES = {
  active: 'bg-emerald-50 text-emerald-700',
  inactive: 'bg-amber-50 text-amber-700',
  suspended: 'bg-red-50 text-red-600',
  archived: 'bg-tetri-bg text-tetri-neutral',
};

function InfoRow({ label, value }) {
  if (value == null || value === '') return null;
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-xs text-tetri-neutral font-medium uppercase tracking-wide">{label}</p>
      <p className="text-sm text-tetri-text">{value}</p>
    </div>
  );
}

function InfoGrid({ children }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">{children}</div>;
}

function SectionCard({ title, children }) {
  return (
    <div className="bg-white rounded-card border border-tetri-border p-5 space-y-4">
      <p className="text-sm font-semibold text-tetri-text">{title}</p>
      {children}
    </div>
  );
}

function OverviewTab({ customer }) {
  const formatMoney = (val, currency) => {
    if (val == null) return null;
    return `${currency || ''}${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`.trim();
  };

  const primaryContact = customer.contacts?.find((c) => c.isPrimary && c.isActive);

  return (
    <div className="space-y-5">
      <SectionCard title="Basic Information">
        <InfoGrid>
          <InfoRow label="Customer Name" value={customer.name} />
          <InfoRow label="Customer Code" value={customer.customerCode} />
          <InfoRow label="Type" value={CUSTOMER_TYPE_LABELS[customer.customerType]} />
          <InfoRow label="Email" value={customer.email} />
          <InfoRow label="Phone" value={customer.phone} />
          <InfoRow label="Payment Terms" value={PAYMENT_TERMS_LABELS[customer.paymentTerms] || customer.paymentTerms} />
          <InfoRow label="Default Currency" value={customer.defaultCurrency} />
        </InfoGrid>
      </SectionCard>

      {primaryContact && (
        <SectionCard title="Primary Contact">
          <InfoGrid>
            <InfoRow label="Name" value={`${primaryContact.firstName} ${primaryContact.lastName}`.trim()} />
            <InfoRow label="Job Title" value={primaryContact.jobTitle} />
            <InfoRow label="Email" value={primaryContact.email} />
            <InfoRow label="Phone" value={primaryContact.phone} />
            <InfoRow label="Mobile" value={primaryContact.mobile} />
          </InfoGrid>
        </SectionCard>
      )}

      {customer.tags?.length > 0 && (
        <SectionCard title="Tags">
          <div className="flex flex-wrap gap-2">
            {customer.tags.map((tag) => (
              <span
                key={tag.id}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[#eff4ff] text-tetri-blue border border-tetri-blue/20"
              >
                <Tag className="w-3 h-3" />
                {tag.name}
              </span>
            ))}
          </div>
        </SectionCard>
      )}

      {customer.notes && (
        <SectionCard title="Internal Notes">
          <p className="text-sm text-tetri-text whitespace-pre-wrap">{customer.notes}</p>
        </SectionCard>
      )}
    </div>
  );
}

function AddressTab({ customer }) {
  const hasAddress = customer.addressLine1 || customer.city || customer.country;
  const hasTax = customer.taxNumber || customer.vatNumber || customer.commercialRegistrationNumber || customer.businessLicenseNumber;

  return (
    <div className="space-y-5">
      {hasAddress ? (
        <SectionCard title="Address">
          <InfoGrid>
            <InfoRow label="Address Line 1" value={customer.addressLine1} />
            <InfoRow label="Address Line 2" value={customer.addressLine2} />
            <InfoRow label="City" value={customer.city} />
            <InfoRow label="State / Region" value={customer.stateRegion} />
            <InfoRow label="Postal Code" value={customer.postalCode} />
            <InfoRow label="Country" value={customer.country} />
          </InfoGrid>
        </SectionCard>
      ) : (
        <div className="text-center py-8 border border-dashed border-tetri-border rounded-xl">
          <p className="text-sm text-tetri-muted">No address on file</p>
        </div>
      )}

      {hasTax ? (
        <SectionCard title="Tax & Legal">
          <InfoGrid>
            <InfoRow label="Tax Number" value={customer.taxNumber} />
            <InfoRow label="VAT Number" value={customer.vatNumber} />
            <InfoRow label="Commercial Reg. Number" value={customer.commercialRegistrationNumber} />
            <InfoRow label="Business License Number" value={customer.businessLicenseNumber} />
          </InfoGrid>
        </SectionCard>
      ) : (
        <div className="text-center py-8 border border-dashed border-tetri-border rounded-xl">
          <p className="text-sm text-tetri-muted">No tax information on file</p>
        </div>
      )}
    </div>
  );
}

function FinancialTab({ customer }) {
  const fmt = (val) => {
    if (val == null) return '—';
    return Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="space-y-5">
      <SectionCard title="Financial Settings">
        <InfoGrid>
          <InfoRow label="Default Currency" value={customer.defaultCurrency} />
          <InfoRow label="Payment Terms" value={PAYMENT_TERMS_LABELS[customer.paymentTerms] || customer.paymentTerms} />
          <div className="flex flex-col gap-0.5">
            <p className="text-xs text-tetri-neutral font-medium uppercase tracking-wide">Opening Balance</p>
            <p className="text-sm text-tetri-text">{fmt(customer.openingBalance)}</p>
          </div>
          <div className="flex flex-col gap-0.5">
            <p className="text-xs text-tetri-neutral font-medium uppercase tracking-wide">Credit Limit</p>
            <p className="text-sm text-tetri-text">{customer.creditLimit != null ? fmt(customer.creditLimit) : 'No limit'}</p>
          </div>
        </InfoGrid>
      </SectionCard>
    </div>
  );
}

export default function CustomerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast, ToastContainer } = useToast();

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [confirm, setConfirm] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const load = async () => {
    try {
      const data = await getCustomer(id);
      setCustomer(data);
    } catch {
      showToast('error', 'Failed to load customer');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const handleArchive = () => {
    setConfirm({
      title: 'Archive customer?',
      description: `"${customer.name}" will be archived.`,
      confirmLabel: 'Archive',
      variant: 'destructive',
      onConfirm: async () => {
        setConfirmLoading(true);
        try {
          await archiveCustomer(id);
          showToast('success', 'Customer archived');
          load();
        } catch (err) {
          showToast('error', err?.response?.data?.error || 'Failed to archive');
        } finally {
          setConfirmLoading(false);
          setConfirm(null);
        }
      },
    });
  };

  const handleRestore = async () => {
    try {
      await restoreCustomer(id);
      showToast('success', 'Customer restored');
      load();
    } catch (err) {
      showToast('error', err?.response?.data?.error || 'Failed to restore');
    }
  };

  if (loading) {
    return (
      <div className="px-4 sm:px-8 py-8 max-w-5xl mx-auto">
        <div className="flex items-center justify-center gap-2 py-16 text-tetri-muted">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Loading customer…</span>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="px-4 sm:px-8 py-8 max-w-5xl mx-auto">
        <p className="text-sm text-tetri-error">Customer not found.</p>
      </div>
    );
  }

  const isArchived = customer.status === 'archived';

  return (
    <div className="px-4 sm:px-8 py-8 max-w-5xl mx-auto">
      {/* Back */}
      <button
        onClick={() => navigate('/customers')}
        className="flex items-center gap-1.5 text-sm text-tetri-muted hover:text-tetri-text transition-colors mb-5"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to customers
      </button>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-bold text-tetri-text truncate">{customer.name}</h1>
            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${STATUS_BADGE_STYLES[customer.status] || 'bg-tetri-bg text-tetri-neutral'}`}>
              {customer.status}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            {customer.customerCode && (
              <p className="text-xs text-tetri-neutral font-mono">{customer.customerCode}</p>
            )}
            <p className="text-sm text-tetri-muted">
              {CUSTOMER_TYPE_LABELS[customer.customerType] || customer.customerType}
            </p>
            {customer.country && (
              <p className="text-sm text-tetri-muted">{customer.country}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {isArchived ? (
            <Button size="sm" variant="outline" onClick={handleRestore}>
              <RotateCcw className="w-3.5 h-3.5" />
              Restore
            </Button>
          ) : (
            <>
              <Button size="sm" variant="outline" onClick={() => navigate(`/customers/${id}/edit`)}>
                <Pencil className="w-3.5 h-3.5" />
                Edit
              </Button>
              <Button size="sm" variant="outline" onClick={handleArchive} className="text-tetri-error hover:bg-red-50 hover:border-red-200">
                <Archive className="w-3.5 h-3.5" />
                Archive
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-tetri-border mb-6">
        <div className="flex gap-0 overflow-x-auto scrollbar-none">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
                activeTab === tab.id
                  ? 'border-tetri-blue text-tetri-blue'
                  : 'border-transparent text-tetri-muted hover:text-tetri-text'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'overview' && <OverviewTab customer={customer} />}
        {activeTab === 'contacts' && <ContactsTab customerId={id} />}
        {activeTab === 'address' && <AddressTab customer={customer} />}
        {activeTab === 'financial' && <FinancialTab customer={customer} />}
        {activeTab === 'notes' && <NotesTab customerId={id} />}
        {activeTab === 'attachments' && <AttachmentsPanel entityType="customer" entityId={id} />}
      </div>

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
