import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const fmtCurrency = (v, currency = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(v || 0);

export default function MetricCard({ label, value, growth, subtitle, currency = 'USD', isCurrency = true }) {
  const up      = growth > 0;
  const neutral = growth === 0 || growth == null;
  const TrendIcon = neutral ? Minus : up ? TrendingUp : TrendingDown;
  const trendColor = neutral ? 'text-tetri-muted' : up ? 'text-emerald-600' : 'text-red-500';

  return (
    <div className="bg-white rounded-card border border-tetri-border p-4">
      <p className="text-xs text-tetri-muted mb-1">{label}</p>
      <p className="text-xl font-bold text-tetri-text">
        {isCurrency ? fmtCurrency(value, currency) : (value ?? '—')}
      </p>
      {(growth != null || subtitle) && (
        <div className="flex items-center gap-1 mt-1">
          {growth != null && (
            <>
              <TrendIcon className={`w-3.5 h-3.5 ${trendColor}`} />
              <span className={`text-xs font-medium ${trendColor}`}>{up ? '+' : ''}{growth}%</span>
            </>
          )}
          {subtitle && <span className="text-xs text-tetri-muted ml-1">{subtitle}</span>}
        </div>
      )}
    </div>
  );
}
