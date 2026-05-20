import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '../../../components/shared/Toast.jsx';
import InvoiceForm from '../components/InvoiceForm.jsx';
import { createInvoice } from '../services/invoicesService.js';

export default function CreateInvoicePage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (payload) => {
    setLoading(true);
    try {
      const inv = await createInvoice(payload);
      toast('Invoice created', 'success');
      navigate(`/invoices/${inv.id}`);
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to create invoice', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/invoices')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-xl font-semibold text-tetri-text">New Invoice</h1>
          <p className="text-sm text-tetri-neutral">Create a new invoice for a customer</p>
        </div>
      </div>

      <InvoiceForm onSubmit={handleSubmit} loading={loading} submitLabel="Create Invoice" />
    </div>
  );
}
