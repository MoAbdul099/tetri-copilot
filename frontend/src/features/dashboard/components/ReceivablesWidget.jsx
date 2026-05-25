import { Link } from 'react-router-dom';
import { ArrowRight, AlertCircle } from 'lucide-react';
import { useReceivables } from '../hooks/useDashboard';

const fmtCur = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n || 0);

const BUCKETS = [
  { key: 'current',   label: 'Current',    color: 'bg-emerald-500' },
  { key: 'days1_30',  label: '1–30 Days',  color: 'bg-amber-400' },
  { key: 'days31_60', label: '31–60 Days', color: 'bg-orange-500' },
  { key: 'days61_90', label: '61–90 Days', color: 'bg-red-500' },
  { key: 'days90plus',label: '90+ Days',   color: 'bg-red-700' },
];

export default function ReceivablesWidget({ aging }) {
  const total = BUCKETS.reduce((s, b) => s + (aging?.[b.key] || 0), 0);

  return (
    <div className="bg-white rounded-card border border-tetri-border p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-500" />
          <p className="text-sm font-semibold text-tetri-text">Receivables Aging</p>
        </div>
        <Link to="/receivables" className="text-xs text-tetri-blue hover:underline flex items-center gap-1">
          View all <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Stacked bar */}
      {total > 0 && (
        <div className="flex h-2 rounded-full overflow-hidden mb-4 gap-0.5">
          {BUCKETS.map((b) => {
            const pct = total > 0 ? (aging?.[b.key] || 0) / total * 100 : 0;
            return pct > 0 ? (
              <div key={b.key} className={`${b.color} rounded-sm`} style={{ width: `${pct}%` }} title={`${b.label}: ${fmtCur(aging?.[b.key])}`} />
            ) : null;
          })}
        </div>
      )}

      <div className="space-y-2">
        {BUCKETS.map((b) => {
          const amt = aging?.[b.key] || 0;
          const pct = total > 0 ? Math.round(amt / total * 100) : 0;
          return (
            <div key={b.key} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${b.color}`} />
                <span className="text-xs text-tetri-muted">{b.label}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-tetri-muted">{pct}%</span>
                <span className="text-xs font-medium text-tetri-text tabular-nums w-20 text-right">{fmtCur(amt)}</span>
              </div>
            </div>
          );
        })}
        <div className="flex items-center justify-between pt-2 border-t border-tetri-border mt-2">
          <span className="text-xs font-semibold text-tetri-text">Total Outstanding</span>
          <span className="text-xs font-bold text-tetri-text tabular-nums">{fmtCur(total)}</span>
        </div>
      </div>
    </div>
  );
}
