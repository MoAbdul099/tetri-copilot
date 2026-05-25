import { Users, CreditCard } from 'lucide-react';

const ProgressBar = ({ pct, color = 'bg-tetri-blue' }) => (
  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
    <div
      className={`h-full rounded-full transition-all ${color} ${(pct || 0) > 80 ? 'bg-red-500' : (pct || 0) > 60 ? 'bg-amber-500' : color}`}
      style={{ width: `${Math.min(pct || 0, 100)}%` }}
    />
  </div>
);

export default function SubscriptionUsageWidget({ data }) {
  const { plan, status, users } = data || {};

  return (
    <div className="bg-white rounded-card border border-tetri-border p-5">
      <div className="flex items-center gap-2 mb-4">
        <CreditCard className="w-4 h-4 text-tetri-blue" />
        <p className="text-sm font-semibold text-tetri-text">Subscription</p>
        {status === 'active' && (
          <span className="ml-auto text-[11px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-medium">Active</span>
        )}
      </div>

      {plan && (
        <p className="text-xs text-tetri-muted mb-4 font-medium">{plan}</p>
      )}

      <div className="space-y-3">
        <div>
          <div className="flex justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-tetri-muted" />
              <span className="text-xs text-tetri-muted">Team Members</span>
            </div>
            <span className="text-xs font-medium text-tetri-text tabular-nums">
              {users?.used || 0}{users?.limit ? ` / ${users.limit}` : ''}
            </span>
          </div>
          <ProgressBar pct={users?.pct} />
        </div>
      </div>
    </div>
  );
}
