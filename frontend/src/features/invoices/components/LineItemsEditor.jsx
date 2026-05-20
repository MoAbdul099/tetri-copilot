import { useState } from 'react';
import { Plus, Trash2, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { suggestDescription } from '../services/invoicesService.js';

const EMPTY_ITEM = {
  description: '',
  quantity: 1,
  unitPrice: 0,
  discountRate: 0,
  taxRate: 0,
};

const calcLine = (item) => {
  const qty      = Number(item.quantity) || 0;
  const price    = Number(item.unitPrice) || 0;
  const disc     = Number(item.discountRate) || 0;
  const tax      = Number(item.taxRate) || 0;
  const sub      = qty * price;
  const discAmt  = sub * (disc / 100);
  const taxable  = sub - discAmt;
  const taxAmt   = taxable * (tax / 100);
  return taxable + taxAmt;
};

const fmt = (n) =>
  Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function ItemRow({ item, idx, currency, onChange, onRemove, canRemove }) {
  const [suggesting, setSuggesting] = useState(false);

  const set = (field, val) => onChange(idx, { ...item, [field]: val });

  const handleSuggest = async () => {
    if (!item.description.trim()) return;
    setSuggesting(true);
    try {
      const suggestion = await suggestDescription(item.description);
      set('description', suggestion);
    } catch {
      // silent
    } finally {
      setSuggesting(false);
    }
  };

  const lineTotal = calcLine(item);

  return (
    <div className="grid grid-cols-[1fr_80px_100px_70px_70px_100px_36px] gap-2 items-start py-2 border-b border-tetri-border last:border-0">
      {/* Description */}
      <div className="relative">
        <Input
          value={item.description}
          onChange={(e) => set('description', e.target.value)}
          placeholder="Item description"
          className="pr-8"
        />
        <button
          type="button"
          title="AI: improve description"
          onClick={handleSuggest}
          disabled={suggesting || !item.description.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-tetri-neutral hover:text-tetri-primary disabled:opacity-30 transition-colors"
        >
          {suggesting
            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
            : <Sparkles className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Quantity */}
      <Input
        type="number"
        min="0.01"
        step="0.01"
        value={item.quantity}
        onChange={(e) => set('quantity', e.target.value)}
        className="text-right"
      />

      {/* Unit Price */}
      <div className="relative">
        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-tetri-neutral">{currency}</span>
        <Input
          type="number"
          min="0"
          step="0.01"
          value={item.unitPrice}
          onChange={(e) => set('unitPrice', e.target.value)}
          className="text-right pl-8"
        />
      </div>

      {/* Discount % */}
      <div className="relative">
        <Input
          type="number"
          min="0"
          max="100"
          step="0.1"
          value={item.discountRate}
          onChange={(e) => set('discountRate', e.target.value)}
          className="text-right pr-6"
        />
        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-tetri-neutral">%</span>
      </div>

      {/* Tax % */}
      <div className="relative">
        <Input
          type="number"
          min="0"
          max="100"
          step="0.1"
          value={item.taxRate}
          onChange={(e) => set('taxRate', e.target.value)}
          className="text-right pr-6"
        />
        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-tetri-neutral">%</span>
      </div>

      {/* Line total */}
      <div className="flex items-center justify-end h-10 text-sm font-semibold text-tetri-text tabular-nums">
        {currency} {fmt(lineTotal)}
      </div>

      {/* Remove */}
      <button
        type="button"
        onClick={() => onRemove(idx)}
        disabled={!canRemove}
        className="flex items-center justify-center h-10 w-9 rounded-lg text-tetri-neutral hover:text-tetri-error hover:bg-red-50 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function LineItemsEditor({ items, currency = '', onChange }) {
  const addItem = () => onChange([...items, { ...EMPTY_ITEM }]);

  const updateItem = (idx, updated) => {
    const next = [...items];
    next[idx] = updated;
    onChange(next);
  };

  const removeItem = (idx) => {
    onChange(items.filter((_, i) => i !== idx));
  };

  const totals = items.reduce(
    (acc, item) => {
      const qty   = Number(item.quantity) || 0;
      const price = Number(item.unitPrice) || 0;
      const disc  = Number(item.discountRate) || 0;
      const tax   = Number(item.taxRate) || 0;
      const sub   = qty * price;
      const dAmt  = sub * (disc / 100);
      const taxable = sub - dAmt;
      const tAmt  = taxable * (tax / 100);
      acc.subtotal += sub;
      acc.discount += dAmt;
      acc.tax      += tAmt;
      acc.total    += taxable + tAmt;
      return acc;
    },
    { subtotal: 0, discount: 0, tax: 0, total: 0 }
  );

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="grid grid-cols-[1fr_80px_100px_70px_70px_100px_36px] gap-2 px-0">
        {['Description', 'Qty', 'Unit Price', 'Disc%', 'Tax%', 'Total', ''].map((h, i) => (
          <div key={i} className={`text-xs font-semibold text-tetri-neutral uppercase tracking-wide ${i >= 1 ? 'text-right' : ''}`}>
            {h}
          </div>
        ))}
      </div>

      {/* Rows */}
      <div>
        {items.map((item, idx) => (
          <ItemRow
            key={idx}
            item={item}
            idx={idx}
            currency={currency}
            onChange={updateItem}
            onRemove={removeItem}
            canRemove={items.length > 1}
          />
        ))}
      </div>

      {/* Add row */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addItem}
        className="gap-1.5 text-tetri-neutral hover:text-tetri-primary"
      >
        <Plus className="w-4 h-4" />
        Add Line Item
      </Button>

      {/* Totals */}
      <div className="border-t border-tetri-border pt-4 space-y-1.5">
        <div className="flex justify-end">
          <div className="w-64 space-y-1.5">
            <div className="flex justify-between text-sm text-tetri-neutral">
              <span>Subtotal</span>
              <span className="tabular-nums">{currency} {fmt(totals.subtotal)}</span>
            </div>
            {totals.discount > 0 && (
              <div className="flex justify-between text-sm text-tetri-neutral">
                <span>Discount</span>
                <span className="tabular-nums text-tetri-error">-{currency} {fmt(totals.discount)}</span>
              </div>
            )}
            {totals.tax > 0 && (
              <div className="flex justify-between text-sm text-tetri-neutral">
                <span>Tax</span>
                <span className="tabular-nums">{currency} {fmt(totals.tax)}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-tetri-border font-semibold text-tetri-text">
              <span>Total</span>
              <span className="tabular-nums text-tetri-primary">{currency} {fmt(totals.total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
