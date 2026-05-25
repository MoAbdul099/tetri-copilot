import { Shield, AlertOctagon, X } from 'lucide-react';

const severityConfig = {
  critical: 'bg-red-50 border-red-200 text-red-700',
  high:     'bg-orange-50 border-orange-200 text-orange-700',
  medium:   'bg-amber-50 border-amber-200 text-amber-700',
  low:      'bg-blue-50 border-blue-200 text-blue-700',
};

const riskTypeLabel = {
  cash_flow:       'Cash Flow',
  collection:      'Collections',
  concentration:   'Customer Concentration',
  revenue_decline: 'Revenue Decline',
  compliance:      'Compliance',
};

export default function RiskAlertsPanel({ alerts = [], onDismiss }) {
  if (!alerts.length) {
    return (
      <div className="bg-white rounded-card border border-tetri-border p-5">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-4 h-4 text-emerald-500" />
          <h3 className="text-sm font-semibold text-tetri-text">Risk Alerts</h3>
        </div>
        <p className="text-xs text-tetri-muted">No active risk alerts. Your business is on track.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-card border border-tetri-border p-5">
      <div className="flex items-center gap-2 mb-4">
        <AlertOctagon className="w-4 h-4 text-red-500" />
        <h3 className="text-sm font-semibold text-tetri-text">Risk Alerts</h3>
        <span className="ml-auto text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full font-medium">
          {alerts.length}
        </span>
      </div>

      <div className="space-y-2">
        {alerts.map((alert) => {
          const cls = severityConfig[alert.severity] || severityConfig.medium;
          return (
            <div key={alert.id} className={`rounded-xl border px-3 py-2.5 ${cls}`}>
              <div className="flex items-start gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-semibold capitalize">
                      {riskTypeLabel[alert.riskType] || alert.riskType}
                    </span>
                    <span className="text-xs opacity-70 capitalize">· {alert.severity}</span>
                  </div>
                  <p className="text-xs opacity-80">{alert.details?.message}</p>
                  {alert.details?.recommendation && (
                    <p className="text-xs opacity-60 mt-0.5 italic">{alert.details.recommendation}</p>
                  )}
                </div>
                {onDismiss && (
                  <button onClick={() => onDismiss(alert.id)} className="opacity-50 hover:opacity-100 flex-shrink-0">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
