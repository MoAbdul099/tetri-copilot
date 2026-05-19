import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import PageHeader from '../../../components/shared/PageHeader.jsx';
import { useToast } from '../../../components/shared/Toast.jsx';
import CustomerForm from '../components/CustomerForm.jsx';
import { createCustomer } from '../services/customersService.js';

export default function CreateCustomerPage() {
  const navigate = useNavigate();
  const { showToast, ToastContainer } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (payload) => {
    setLoading(true);
    try {
      const customer = await createCustomer(payload);
      showToast('success', 'Customer created');
      navigate(`/customers/${customer.id}`);
    } catch (err) {
      showToast('error', err?.response?.data?.error || 'Failed to create customer');
      setLoading(false);
    }
  };

  return (
    <div className="px-4 sm:px-8 py-8 max-w-3xl mx-auto">
      <button
        onClick={() => navigate('/customers')}
        className="flex items-center gap-1.5 text-sm text-tetri-muted hover:text-tetri-text transition-colors mb-5"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to customers
      </button>

      <PageHeader title="New Customer" subtitle="Add a new customer to your directory" />

      <CustomerForm onSubmit={handleSubmit} loading={loading} />
      {ToastContainer}
    </div>
  );
}
