import { TrendingUp } from 'lucide-react';

const fmtCurrency = (v, currency = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(v || 0);

export default function ForecastWidget({ title, forecast, currency = 'USD', color = 'blue' }) {
  if (!forecast) return null;

  const colorMap = {
    blue:   'bg-blue-50 border-blue-200 text-blue-700',
    green:  'bg-emerald-50 border-emerald-200 text-emerald-700',
    red:    'bg-red-50 border-red-200 text-red-700',
    amber:  'bg-amber-50 border-amber-200 text-amber-700',
  };
  const chipClass = colorMap[color] || colorMap.blue;

  return (
    <div className="bg-white rounded-card border border-tetri-border p-5">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-4 h-4 text-tetri-blue" />
        <h3 className="text-sm font-semibold text-tetri-text">{title}</h3>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: '30-day', value: forecast.d30 },
          { label: '60-day', value: forecast.d60 },
          { label: '90-day', value: forecast.d90 },
        ].map(({ label, value }) => (
          <div key={label} className={`rounded-xl border px-3 py-2.5 text-center ${chipClass}`}>
            <p className="text-xs font-medium mb-1 opacity-70">{label}</p>
            <p className="text-sm font-bold">{fmtCurrency(value, currency)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
