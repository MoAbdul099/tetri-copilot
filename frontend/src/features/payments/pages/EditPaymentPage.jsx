import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '@/components/shared/PageHeader';
import PaymentForm from '../components/PaymentForm';
import { getPayment, updatePayment } from '../services/paymentsService';
import { useToast } from '../../../components/shared/Toast.jsx';

export default function EditPaymentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast, ToastContainer } = useToast();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getPayment(id).then(setPayment).catch(() => showToast('error', 'Failed to load payment'));
  }, [id]);

  const handleSubmit = async (data) => {
    setLoading(true);
    try {
      await updatePayment(id, data);
      showToast('success', 'Payment updated');
      setTimeout(() => navigate(`/payments/${id}`), 500);
    } catch (err) {
      showToast('error', err?.response?.data?.error || 'Failed to update payment');
    } finally {
      setLoading(false);
    }
  };

  if (!payment) return <div className="py-12 text-center text-muted-foreground">Loading...</div>;

  return (
    <div className="max-w-3xl space-y-6">
      {ToastContainer}
      <PageHeader title={`Edit ${payment.paymentNumber}`} />
      <div className="rounded-lg border bg-card p-6">
        <PaymentForm initial={payment} onSubmit={handleSubmit} loading={loading} submitLabel="Save Changes" />
      </div>
    </div>
  );
}
