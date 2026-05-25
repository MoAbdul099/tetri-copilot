import { Lightbulb, AlertTriangle, Info, XCircle, X } from 'lucide-react';

const severityConfig = {
  critical: { icon: XCircle,       bg: 'bg-red-50 border-red-200',     text: 'text-red-700',    badge: 'bg-red-100 text-red-700' },
  warning:  { icon: AlertTriangle, bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700',  badge: 'bg-amber-100 text-amber-700' },
  info:     { icon: Info,           bg: 'bg-blue-50 border-blue-200',   text: 'text-blue-700',   badge: 'bg-blue-100 text-blue-700' },
};

export default function InsightCard({ insight, onDismiss }) {
  const cfg = severityConfig[insight.severity] || severityConfig.info;
  const Icon = cfg.icon;

  return (
    <div className={`rounded-xl border p-4 ${cfg.bg}`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${cfg.text}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className={`text-sm font-semibold ${cfg.text}`}>{insight.title}</h4>
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium capitalize ${cfg.badge}`}>
              {insight.severity}
            </span>
          </div>
          <p className="text-xs text-tetri-muted">{insight.description}</p>
          {insight.recommendation && (
            <p className="text-xs text-tetri-muted mt-1 italic">
              <Lightbulb className="w-3 h-3 inline mr-1" />
              {insight.recommendation}
            </p>
          )}
        </div>
        {onDismiss && (
          <button
            onClick={() => onDismiss(insight.id)}
            className="text-tetri-muted hover:text-tetri-text flex-shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
