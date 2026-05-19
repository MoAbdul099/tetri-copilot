import { AlertTriangle, ArrowUp, ArrowDown, XCircle, Check, Minus } from 'lucide-react';

const FEATURE_LABELS = {
  invoicing:           'Invoicing',
  expenses:            'Expense Tracking',
  ai_categorization:   'AI Categorization',
  advanced_compliance: 'Advanced Compliance',
};

const CONFIG = {
  upgrade: {
    title: (planName) => `Upgrade to ${planName}`,
    icon: ArrowUp,
    iconClass: 'text-tetri-blue bg-[#eff4ff]',
    confirmClass: 'bg-tetri-blue hover:bg-tetri-blue-hover text-white',
    confirmLabel: 'Confirm Upgrade',
  },
  downgrade: {
    title: (planName) => `Downgrade to ${planName}`,
    icon: ArrowDown,
    iconClass: 'text-amber-600 bg-amber-50',
    confirmClass: 'bg-amber-500 hover:bg-amber-600 text-white',
    confirmLabel: 'Confirm Downgrade',
  },
  cancel: {
    title: () => 'Cancel Subscription',
    icon: XCircle,
    iconClass: 'text-tetri-error bg-red-50',
    confirmClass: 'bg-tetri-error hover:bg-red-700 text-white',
    confirmLabel: 'Cancel Subscription',
  },
};

export default function PlanChangeDialog({ open, type, targetPlan, currentPlan, loading, error, onConfirm, onClose }) {
  if (!open) return null;

  const cfg = CONFIG[type];
  const Icon = cfg.icon;
  const title = cfg.title(targetPlan?.name ?? '');

  const featureChanges = type !== 'cancel' && currentPlan?.features && targetPlan?.features
    ? targetPlan.features.map((f) => {
        const was = currentPlan.features.find((c) => c.key === f.key)?.included ?? false;
        return { ...f, was };
      })
    : [];

  const gained = featureChanges.filter((f) => f.included && !f.was);
  const lost = featureChanges.filter((f) => !f.included && f.was);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-tetri-surface rounded-card border border-tetri-border shadow-xl w-full max-w-md z-10">

        {/* Header */}
        <div className="flex items-center gap-3 p-6 border-b border-tetri-border">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.iconClass}`}>
            <Icon className="w-4.5 h-4.5" size={18} />
          </div>
          <div>
            <h2 className="text-base font-bold text-tetri-text">{title}</h2>
            {type !== 'cancel' && targetPlan && (
              <p className="text-xs text-tetri-muted mt-0.5">
                ${targetPlan.monthlyPriceUsd}/month
              </p>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">

          {type === 'cancel' && (
            <div className="flex gap-3 p-3.5 rounded-xl bg-red-50 border border-tetri-error/20">
              <AlertTriangle className="w-4 h-4 text-tetri-error flex-shrink-0 mt-0.5" />
              <p className="text-sm text-tetri-error leading-relaxed">
                Cancelling will immediately remove access to paid features. This action cannot be undone without re-subscribing.
              </p>
            </div>
          )}

          {type === 'downgrade' && (
            <div className="flex gap-3 p-3.5 rounded-xl bg-amber-50 border border-amber-200">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-700 leading-relaxed">
                Downgrading may reduce your team size limit and remove access to some features.
              </p>
            </div>
          )}

          {/* Feature changes */}
          {gained.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-tetri-muted uppercase tracking-wide mb-2">Features gained</p>
              <ul className="space-y-1.5">
                {gained.map((f) => (
                  <li key={f.key} className="flex items-center gap-2 text-sm text-emerald-700">
                    <Check className="w-3.5 h-3.5 flex-shrink-0" />
                    {FEATURE_LABELS[f.key] ?? f.key}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {lost.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-tetri-muted uppercase tracking-wide mb-2">Features lost</p>
              <ul className="space-y-1.5">
                {lost.map((f) => (
                  <li key={f.key} className="flex items-center gap-2 text-sm text-tetri-error">
                    <Minus className="w-3.5 h-3.5 flex-shrink-0" />
                    {FEATURE_LABELS[f.key] ?? f.key}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {type === 'upgrade' && gained.length === 0 && (
            <p className="text-sm text-tetri-muted">
              You'll be moved to the <span className="font-semibold text-tetri-text">{targetPlan?.name}</span> plan with increased limits.
            </p>
          )}

          {error && (
            <p className="text-sm text-tetri-error bg-red-50 border border-tetri-error/20 rounded-xl px-4 py-3">
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 pb-6">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-btn border border-tetri-border text-sm font-medium text-tetri-text hover:bg-tetri-bg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 rounded-btn text-sm font-semibold transition-colors disabled:opacity-60 ${cfg.confirmClass}`}
          >
            {loading ? 'Processing…' : cfg.confirmLabel}
          </button>
        </div>

      </div>
    </div>
  );
}
