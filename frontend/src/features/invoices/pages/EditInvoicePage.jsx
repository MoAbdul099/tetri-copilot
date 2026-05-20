import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '../../../components/shared/Toast.jsx';
import InvoiceForm from '../components/InvoiceForm.jsx';
import { getInvoice, updateInvoice } from '../services/invoicesService.js';

export default function EditInvoicePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast, ToastContainer } = useToast();

  const [invoice, setInvoice] = useState(null);
  const [loadingInv, setLoadingInv] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getInvoice(id)
      .then(setInvoice)
      .catch(() => { showToast('error', 'Invoice not found'); navigate('/invoices'); })
      .finally(() => setLoadingInv(false));
  }, [id]);

  const handleSubmit = async (payload) => {
    setSaving(true);
    try {
      await updateInvoice(id, payload);
      showToast('success', 'Invoice updated');
      navigate(`/invoices/${id}`);
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to update invoice');
    } finally {
      setSaving(false);
    }
  };

  if (loadingInv) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-tetri-primary" />
      </div>
    );
  }

  const initialValues = invoice
    ? {
        customerId:        invoice.customerId,
        customerContactId: invoice.customerContactId || '',
        issueDate:         invoice.issueDate?.slice(0, 10) || '',
        dueDate:           invoice.dueDate?.slice(0, 10) || '',
        currencyCode:      invoice.currencyCode || 'USD',
        referenceNumber:   invoice.referenceNumber || '',
        poNumber:          invoice.poNumber || '',
        customerReference: invoice.customerReference || '',
        notes:             invoice.notes || '',
        terms:             invoice.terms || '',
        internalComments:  invoice.internalComments || '',
        items:             invoice.items?.map((item) => ({
          description:  item.description,
          quantity:     item.quantity,
          unitPrice:    item.unitPrice,
          discountRate: item.discountRate,
          taxRate:      item.taxRate,
        })) || [],
      }
    : {};

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {ToastContainer}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/invoices/${id}`)}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-xl font-semibold text-tetri-text">Edit Invoice</h1>
          <p className="text-sm text-tetri-neutral">{invoice?.invoiceNumber}</p>
        </div>
      </div>

      <InvoiceForm initialValues={initialValues} onSubmit={handleSubmit} loading={saving} submitLabel="Save Changes" />
    </div>
  );
}
