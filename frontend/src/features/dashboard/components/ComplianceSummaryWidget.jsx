import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck } from 'lucide-react';

export default function ComplianceSummaryWidget({ data }) {
  const { upcoming = 0, dueSoon = 0, overdue = 0, completedThisMonth = 0 } = data || {};

  const items = [
    { label: 'Scheduled',         value: upcoming,           color: 'text-slate-600',   bg: 'bg-slate-50',   dot: 'bg-slate-400' },
    { label: 'Due This Week',     value: dueSoon,            color: 'text-amber-700',   bg: 'bg-amber-50',   dot: 'bg-amber-500' },
    { label: 'Overdue',           value: overdue,            color: 'text-red-600',     bg: 'bg-red-50',     dot: 'bg-red-500' },
    { label: 'Completed (Month)', value: completedThisMonth, color: 'text-emerald-700', bg: 'bg-emerald-50', dot: 'bg-emerald-500' },
  ];

  return (
    <div className="bg-white rounded-card border border-tetri-border p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-tetri-blue" />
          <p className="text-sm font-semibold text-tetri-text">Compliance</p>
        </div>
        <Link to="/compliance" className="text-xs text-tetri-blue hover:underline flex items-center gap-1">
          Open calendar <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {items.map(({ label, value, color, bg, dot }) => (
          <div key={label} className={`${bg} rounded-xl p-3`}>
            <div className="flex items-center gap-1.5 mb-1">
              <div className={`w-1.5 h-1.5 rounded-full ${dot}`} />
              <p className="text-[11px] text-tetri-muted font-medium">{label}</p>
            </div>
            <p className={`text-2xl font-bold ${color} tabular-nums`}>{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
