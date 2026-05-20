import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/shared/PageHeader';
import PaymentForm from '../components/PaymentForm';
import { recordPayment } from '../services/paymentsService';
import { useToast } from '../../../components/shared/Toast.jsx';

export default function CreatePaymentPage() {
  const navigate = useNavigate();
  const { showToast, ToastContainer } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data) => {
    setLoading(true);
    try {
      const payment = await recordPayment(data);
      showToast('success', 'Payment recorded');
      setTimeout(() => navigate(`/payments/${payment.id}`), 500);
    } catch (err) {
      showToast('error', err?.response?.data?.error || 'Failed to record payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <ToastContainer />
      <PageHeader title="Record Payment" />
      <div className="rounded-lg border bg-card p-6">
        <PaymentForm onSubmit={handleSubmit} loading={loading} submitLabel="Record Payment" />
      </div>
    </div>
  );
}
