import { useState } from 'react';
import { Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { sendInvoice } from '../services/invoicesService.js';

export default function SendInvoiceDialog({ invoice, onClose, onSent, onToast }) {
  const [form, setForm] = useState({
    to: invoice.customer?.email || '',
    cc: '',
    bcc: '',
    subject: `Invoice ${invoice.invoiceNumber}`,
    message: `Dear ${invoice.customer?.name || 'Customer'},\n\nPlease find attached invoice ${invoice.invoiceNumber}.\n\nThank you for your business.`,
  });
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSend = async () => {
    if (!form.to.trim()) return;
    setLoading(true);
    try {
      const result = await sendInvoice(invoice.id, {
        to:      form.to.trim(),
        cc:      form.cc.trim() || null,
        bcc:     form.bcc.trim() || null,
        subject: form.subject.trim() || null,
        message: form.message.trim() || null,
      });
      if (result.skipped) {
        onToast?.('warning', 'Email delivery skipped — SMTP not configured');
      } else {
        onToast?.('success', `Invoice sent to ${result.to}`);
      }
      onSent?.(result);
      onClose();
    } catch (err) {
      onToast?.('error', err.response?.data?.message || 'Failed to send invoice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        <div className="px-6 py-4 border-b border-tetri-border flex items-center justify-between">
          <h2 className="text-base font-semibold text-tetri-text">Send Invoice</h2>
          <button
            onClick={onClose}
            className="text-tetri-neutral hover:text-tetri-text transition-colors text-xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <Field label="To *" value={form.to} onChange={(v) => set('to', v)} placeholder="recipient@example.com" />
          <Field label="CC" value={form.cc} onChange={(v) => set('cc', v)} placeholder="cc@example.com" />
          <Field label="BCC" value={form.bcc} onChange={(v) => set('bcc', v)} placeholder="bcc@example.com" />
          <Field label="Subject" value={form.subject} onChange={(v) => set('subject', v)} />
          <div>
            <label className="block text-xs font-medium text-tetri-neutral mb-1.5">Message</label>
            <textarea
              rows={5}
              value={form.message}
              onChange={(e) => set('message', e.target.value)}
              className="w-full border border-tetri-border rounded-xl px-3 py-2 text-sm text-tetri-text focus:outline-none focus:ring-2 focus:ring-tetri-primary/20 focus:border-tetri-primary resize-none"
            />
          </div>
          <p className="text-xs text-tetri-neutral">The PDF of this invoice will be attached automatically.</p>
        </div>

        <div className="px-6 py-4 border-t border-tetri-border flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button onClick={handleSend} disabled={loading || !form.to.trim()} className="gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Send Invoice
          </Button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder = '' }) {
  return (
    <div>
      <label className="block text-xs font-medium text-tetri-neutral mb-1.5">{label}</label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}
