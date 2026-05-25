import { Link } from 'react-router-dom';
import { Star, Clock, ChevronRight } from 'lucide-react';

const categoryColors = {
  'Financial Reports':         'bg-emerald-50 text-emerald-700',
  'Receivables Reports':       'bg-blue-50 text-blue-700',
  'Payments Reports':          'bg-violet-50 text-violet-700',
  'Expenses Reports':          'bg-amber-50 text-amber-700',
  'Customers Reports':         'bg-sky-50 text-sky-700',
  'Compliance Reports':        'bg-red-50 text-red-700',
  'Activity Reports':          'bg-slate-100 text-slate-700',
  'Subscription & Usage Reports': 'bg-purple-50 text-purple-700',
};

export default function ReportCard({ report, isFavorite, onFavorite }) {
  const badge = categoryColors[report.category] || 'bg-slate-100 text-slate-700';

  return (
    <div className="bg-white rounded-card border border-tetri-border p-4 hover:border-tetri-blue/30 hover:shadow-sm transition-all group">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${badge}`}>
              {report.category}
            </span>
          </div>
          <h3 className="text-sm font-semibold text-tetri-text group-hover:text-tetri-blue transition-colors">
            {report.reportName}
          </h3>
          <p className="text-xs text-tetri-muted mt-1 leading-relaxed line-clamp-2">
            {report.description}
          </p>
        </div>

        <button
          onClick={() => onFavorite?.(report.reportCode, !isFavorite)}
          className="flex-shrink-0 p-1 rounded hover:bg-slate-50"
        >
          <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-400 text-amber-400' : 'text-slate-300 hover:text-amber-400'} transition-colors`} />
        </button>
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-tetri-border">
        <div className="flex gap-1.5">
          {report.supportedExports?.map((fmt) => (
            <span key={fmt} className="text-[10px] uppercase font-semibold text-tetri-muted bg-slate-50 px-1.5 py-0.5 rounded">
              {fmt}
            </span>
          ))}
        </div>
        <Link
          to={`/reports/${report.reportCode}`}
          className="flex items-center gap-1 text-xs font-medium text-tetri-blue hover:underline"
        >
          Open <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
