import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const fmt = (n, currency = false) => {
  if (n == null) return '—';
  if (currency) return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000)    return `${(n / 1000).toFixed(1)}K`;
  return String(n);
};

export default function KpiCard({ title, value, sub, change, changeLabel, currency, icon: Icon, accent = 'blue', loading }) {
  const accentMap = {
    blue:   { bg: 'bg-[#eff4ff]',  icon: 'text-tetri-blue',   border: 'border-tetri-blue/10'  },
    green:  { bg: 'bg-emerald-50', icon: 'text-emerald-600',  border: 'border-emerald-100'    },
    amber:  { bg: 'bg-amber-50',   icon: 'text-amber-600',    border: 'border-amber-100'      },
    red:    { bg: 'bg-red-50',     icon: 'text-red-500',      border: 'border-red-100'        },
    purple: { bg: 'bg-violet-50',  icon: 'text-violet-600',   border: 'border-violet-100'     },
    slate:  { bg: 'bg-slate-50',   icon: 'text-slate-500',    border: 'border-slate-100'      },
  };
  const a = accentMap[accent] || accentMap.blue;

  const Trend = change == null ? Minus : change > 0 ? TrendingUp : TrendingDown;
  const trendColor = change == null ? 'text-tetri-muted' : change > 0 ? 'text-emerald-600' : 'text-red-500';

  if (loading) {
    return (
      <div className="bg-white rounded-card border border-tetri-border p-5 animate-pulse">
        <div className="h-4 bg-slate-100 rounded w-24 mb-4" />
        <div className="h-8 bg-slate-100 rounded w-32 mb-2" />
        <div className="h-3 bg-slate-100 rounded w-20" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-card border border-tetri-border p-5 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <p className="text-xs font-medium text-tetri-muted uppercase tracking-wide">{title}</p>
        {Icon && (
          <div className={`w-8 h-8 ${a.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
            <Icon className={`w-4 h-4 ${a.icon}`} />
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-tetri-text tabular-nums">
        {fmt(value, currency)}
      </p>
      {sub != null && (
        <p className="text-xs text-tetri-muted mt-0.5">{sub}</p>
      )}
      {change != null && (
        <div className={`flex items-center gap-1 mt-3 ${trendColor}`}>
          <Trend className="w-3.5 h-3.5" />
          <span className="text-xs font-medium">
            {change > 0 ? '+' : ''}{change}%
          </span>
          {changeLabel && <span className="text-xs text-tetri-muted ml-1">{changeLabel}</span>}
        </div>
      )}
    </div>
  );
}
