import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Zap, Plus, Trash2 } from 'lucide-react';
import api from '../../../lib/api';

const fmtCcy = (v, ccy = '') => `${ccy} ${Number(v || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`.trim();

export default function AllocationEditor({ payment, onAllocate, onAutoAllocate, loading }) {
  const [invoices, setInvoices] = useState([]);
  const [rows, setRows] = useState([{ invoiceId: '', allocatedAmount: '' }]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);

  const customerId = payment?.customerId;
  const available  = Number(payment?.unallocatedAmount || 0);
  const ccy        = payment?.currencyCode || '';

  useEffect(() => {
    if (!customerId) return;
    setLoadingInvoices(true);

    api.get('/api/v1/invoices', {
      params: { customerId, status: 'issued,sent,partially_paid,overdue', limit: 100 },
    }).then((r) => {
      setInvoices(r.data?.data?.items || []);
    }).catch(() => {}).finally(() => setLoadingInvoices(false));
  }, [customerId]);

  const outstanding = (inv) => Number(inv.totalAmount) - Number(inv.paidAmount);

  const addRow = () => setRows((r) => [...r, { invoiceId: '', allocatedAmount: '' }]);
  const removeRow = (i) => setRows((r) => r.filter((_, idx) => idx !== i));
  const setRow = (i, field, val) => setRows((r) => r.map((row, idx) => idx === i ? { ...row, [field]: val } : row));

  const setMax = (i) => {
    const inv = invoices.find((inv) => inv.id === rows[i].invoiceId);
    if (!inv) return;
    const used = rows.reduce((s, r, idx) => idx !== i ? s + Number(r.allocatedAmount || 0) : s, 0);
    const rem  = Math.min(outstanding(inv), available - used);
    setRow(i, 'allocatedAmount', rem > 0 ? rem.toFixed(2) : '');
  };

  const totalAllocating = rows.reduce((s, r) => s + Number(r.allocatedAmount || 0), 0);

  const handleSubmit = () => {
    const valid = rows.filter((r) => r.invoiceId && Number(r.allocatedAmount) > 0);
    if (!valid.length) return;
    onAllocate({ allocations: valid.map((r) => ({ invoiceId: r.invoiceId, allocatedAmount: Number(r.allocatedAmount) })) });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Available: <span className="font-semibold text-foreground">{fmtCcy(available, ccy)}</span>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={onAutoAllocate} disabled={loading || available <= 0}>
          <Zap className="h-3.5 w-3.5 mr-1" /> Auto-Allocate
        </Button>
      </div>

      {rows.map((row, i) => {
        const selInv = invoices.find((inv) => inv.id === row.invoiceId);
        return (
          <div key={i} className="flex gap-2 items-start">
            <div className="flex-1">
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                value={row.invoiceId}
                onChange={(e) => setRow(i, 'invoiceId', e.target.value)}
              >
                <option value="">Select invoice...</option>
                {invoices.map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    {inv.invoiceNumber} — {fmtCcy(outstanding(inv), ccy)} outstanding
                  </option>
                ))}
              </select>
              {selInv && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  Total: {fmtCcy(selInv.totalAmount, ccy)} · Outstanding: {fmtCcy(outstanding(selInv), ccy)}
                </p>
              )}
            </div>
            <div className="flex gap-1 items-center">
              <Input
                type="number" step="0.01" min="0" placeholder="0.00"
                value={row.allocatedAmount}
                onChange={(e) => setRow(i, 'allocatedAmount', e.target.value)}
                className="w-32"
              />
              <Button type="button" variant="ghost" size="sm" onClick={() => setMax(i)} className="text-xs px-2">Max</Button>
            </div>
            <Button type="button" variant="ghost" size="icon" onClick={() => removeRow(i)} disabled={rows.length === 1}>
              <Trash2 className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        );
      })}

      {totalAllocating > available + 0.001 && (
        <p className="text-red-500 text-sm">Total allocating ({fmtCcy(totalAllocating, ccy)}) exceeds available balance.</p>
      )}

      <div className="flex items-center justify-between pt-2">
        <Button type="button" variant="ghost" size="sm" onClick={addRow}>
          <Plus className="h-4 w-4 mr-1" /> Add Invoice
        </Button>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">Allocating: <strong>{fmtCcy(totalAllocating, ccy)}</strong></span>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={loading || totalAllocating <= 0 || totalAllocating > available + 0.001}
          >
            {loading ? 'Allocating...' : 'Apply Allocation'}
          </Button>
        </div>
      </div>
    </div>
  );
}
