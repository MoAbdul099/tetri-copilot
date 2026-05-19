import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import PageHeader from '../../../components/shared/PageHeader.jsx';
import { useToast } from '../../../components/shared/Toast.jsx';
import CustomerForm from '../components/CustomerForm.jsx';
import { getCustomer, updateCustomer } from '../services/customersService.js';

export default function EditCustomerPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast, ToastContainer } = useToast();
  const [customer, setCustomer] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getCustomer(id)
      .then(setCustomer)
      .catch(() => showToast('error', 'Failed to load customer'))
      .finally(() => setLoadingData(false));
  }, [id]);

  const handleSubmit = async (payload) => {
    setSaving(true);
    try {
      await updateCustomer(id, payload);
      showToast('success', 'Customer updated');
      navigate(`/customers/${id}`);
    } catch (err) {
      showToast('error', err?.response?.data?.error || 'Failed to update customer');
      setSaving(false);
    }
  };

  if (loadingData) {
    return (
      <div className="px-4 sm:px-8 py-8 max-w-3xl mx-auto">
        <div className="flex items-center gap-2 py-16 justify-center text-tetri-muted">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Loading customer…</span>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="px-4 sm:px-8 py-8 max-w-3xl mx-auto">
        <p className="text-tetri-error text-sm">Customer not found.</p>
      </div>
    );
  }

  const initialValues = {
    name: customer.name || '',
    customerType: customer.customerType || 'company',
    status: customer.status || 'active',
    email: customer.email || '',
    phone: customer.phone || '',
    paymentTerms: customer.paymentTerms || '',
    defaultCurrency: customer.defaultCurrency || '',
    addressLine1: customer.addressLine1 || '',
    addressLine2: customer.addressLine2 || '',
    city: customer.city || '',
    stateRegion: customer.stateRegion || '',
    postalCode: customer.postalCode || '',
    country: customer.country || '',
    taxNumber: customer.taxNumber || '',
    vatNumber: customer.vatNumber || '',
    commercialRegistrationNumber: customer.commercialRegistrationNumber || '',
    businessLicenseNumber: customer.businessLicenseNumber || '',
    openingBalance: customer.openingBalance != null ? String(customer.openingBalance) : '',
    creditLimit: customer.creditLimit != null ? String(customer.creditLimit) : '',
    notes: customer.notes || '',
    tagIds: customer.tags?.map((t) => t.id) || [],
  };

  return (
    <div className="px-4 sm:px-8 py-8 max-w-3xl mx-auto">
      <button
        onClick={() => navigate(`/customers/${id}`)}
        className="flex items-center gap-1.5 text-sm text-tetri-muted hover:text-tetri-text transition-colors mb-5"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to customer
      </button>

      <PageHeader title={`Edit: ${customer.name}`} subtitle="Update customer information" />

      <CustomerForm
        initialValues={initialValues}
        onSubmit={handleSubmit}
        loading={saving}
        isEdit
      />
      {ToastContainer}
    </div>
  );
}
