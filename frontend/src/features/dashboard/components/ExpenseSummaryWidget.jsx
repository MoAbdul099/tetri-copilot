import { Link } from 'react-router-dom';
import { ArrowRight, Receipt, TrendingUp, TrendingDown } from 'lucide-react';

const fmtCur = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n || 0);

const PALETTE = ['bg-tetri-blue', 'bg-violet-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500'];

export default function ExpenseSummaryWidget({ data }) {
  const { current = 0, previous = 0, change, topCategories = [] } = data || {};
  const maxCat = Math.max(...topCategories.map((c) => c.amount), 1);

  return (
    <div className="bg-white rounded-card border border-tetri-border p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Receipt className="w-4 h-4 text-amber-500" />
          <p className="text-sm font-semibold text-tetri-text">Expense Summary</p>
        </div>
        <Link to="/expenses" className="text-xs text-tetri-blue hover:underline flex items-center gap-1">
          View all <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="flex gap-4 mb-4">
        <div>
          <p className="text-xs text-tetri-muted">This Month</p>
          <p className="text-lg font-bold text-tetri-text tabular-nums">{fmtCur(current)}</p>
          {change != null && (
            <div className={`flex items-center gap-1 text-xs ${change > 0 ? 'text-red-500' : 'text-emerald-600'}`}>
              {change > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span>{Math.abs(change)}% vs last month</span>
            </div>
          )}
        </div>
        <div>
          <p className="text-xs text-tetri-muted">Last Month</p>
          <p className="text-lg font-bold text-tetri-muted tabular-nums">{fmtCur(previous)}</p>
        </div>
      </div>

      {topCategories.length > 0 && (
        <div>
          <p className="text-xs text-tetri-muted mb-2">Top Categories</p>
          <div className="space-y-2">
            {topCategories.map((cat, i) => (
              <div key={cat.categoryId || i}>
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-tetri-muted truncate max-w-[140px]">{cat.name}</span>
                  <span className="text-xs font-medium text-tetri-text tabular-nums">{fmtCur(cat.amount)}</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${PALETTE[i % PALETTE.length]}`}
                    style={{ width: `${Math.round((cat.amount / maxCat) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
