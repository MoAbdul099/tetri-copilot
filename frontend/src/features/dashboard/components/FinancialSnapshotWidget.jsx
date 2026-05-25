import { useState } from 'react';
import { BarChart2 } from 'lucide-react';
import { useFinancialSnapshot } from '../hooks/useDashboard';

const fmtCur = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n || 0);

const PERIODS = [
  { value: 'today', label: 'Today' },
  { value: 'week',  label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'year',  label: 'This Year' },
];

const MetricRow = ({ label, value, sub, color }) => (
  <div className="flex items-center justify-between py-3 border-b border-tetri-border last:border-0">
    <div>
      <p className="text-sm font-medium text-tetri-text">{label}</p>
      {sub && <p className="text-xs text-tetri-muted">{sub}</p>}
    </div>
    <p className={`text-sm font-bold tabular-nums ${color || 'text-tetri-text'}`}>{fmtCur(value)}</p>
  </div>
);

export default function FinancialSnapshotWidget() {
  const [period, setPeriod] = useState('month');
  const { data, loading }   = useFinancialSnapshot(period);

  return (
    <div className="bg-white rounded-card border border-tetri-border p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-tetri-blue" />
          <p className="text-sm font-semibold text-tetri-text">Financial Snapshot</p>
        </div>
        <div className="flex gap-1">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-2 py-1 text-xs rounded-md transition-colors font-medium ${
                period === p.value
                  ? 'bg-tetri-blue text-white'
                  : 'text-tetri-muted hover:text-tetri-text hover:bg-slate-50'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-12 bg-slate-100 rounded" />)}
        </div>
      ) : (
        <div>
          <MetricRow label="Revenue"     value={data?.revenue}     sub="Invoice totals for period"    color="text-tetri-text" />
          <MetricRow label="Collections" value={data?.collections} sub="Payments received"            color="text-emerald-600" />
          <MetricRow label="Expenses"    value={data?.expenses}    sub="Total spend"                  color="text-amber-600" />
          <MetricRow
            label="Net Position"
            value={data?.netPosition}
            sub="Collections minus Expenses"
            color={(data?.netPosition || 0) >= 0 ? 'text-emerald-600' : 'text-red-500'}
          />
        </div>
      )}
    </div>
  );
}
