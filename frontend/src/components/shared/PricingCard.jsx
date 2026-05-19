import { Check, Minus, Zap } from 'lucide-react';

const formatLimit = (value, unit = '') => {
  if (value === null || value === undefined) return 'Unlimited';
  return `${value.toLocaleString()}${unit ? ' ' + unit : ''}`;
};

const formatStorage = (mb) => {
  if (mb === null || mb === undefined) return 'Unlimited';
  if (mb >= 1024) return `${mb / 1024} GB`;
  return `${mb} MB`;
};

export default function PricingCard({ plan, isCurrentPlan = false, billingCycle = 'monthly', action = null }) {
  const price = billingCycle === 'yearly' && plan.yearlyPriceUsd !== null
    ? plan.yearlyPriceUsd / 12
    : plan.monthlyPriceUsd;

  const isFree = plan.monthlyPriceUsd === 0;
  const isHighlighted = plan.isRecommended;

  const limitRows = [
    { label: 'Users', value: formatLimit(plan.limits?.users) },
    { label: 'Invoices / month', value: formatLimit(plan.limits?.monthly_invoices) },
    { label: 'AI requests / month', value: formatLimit(plan.limits?.monthly_ai_requests) },
    { label: 'Storage', value: formatStorage(plan.limits?.storage_mb) },
  ];

  return (
    <div
      className={`relative flex flex-col rounded-card border bg-tetri-surface transition-shadow ${
        isHighlighted
          ? 'border-tetri-blue shadow-md ring-1 ring-tetri-blue/20'
          : 'border-tetri-border hover:shadow-sm'
      }`}
    >
      {/* Recommended badge */}
      {isHighlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-tetri-blue text-white text-xs font-semibold">
            <Zap className="w-3 h-3" />
            Recommended
          </span>
        </div>
      )}

      <div className="p-6 flex flex-col gap-5 flex-1">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-base font-bold text-tetri-text">{plan.name}</h3>
            {isCurrentPlan && (
              <span className="px-2 py-0.5 rounded-full bg-[#eff4ff] text-tetri-blue text-xs font-semibold">
                Current
              </span>
            )}
          </div>
          {plan.description && (
            <p className="text-sm text-tetri-muted leading-relaxed">{plan.description}</p>
          )}
        </div>

        {/* Price */}
        <div>
          {isFree ? (
            <div className="flex items-end gap-1">
              <span className="text-3xl font-bold text-tetri-text">Free</span>
            </div>
          ) : (
            <div className="flex items-end gap-1">
              <span className="text-3xl font-bold text-tetri-text">
                ${price % 1 === 0 ? price : price.toFixed(2)}
              </span>
              <span className="text-sm text-tetri-muted mb-1">/month</span>
            </div>
          )}
          {!isFree && billingCycle === 'yearly' && plan.yearlyPriceUsd !== null && (
            <p className="text-xs text-tetri-muted mt-0.5">
              Billed ${plan.yearlyPriceUsd}/year — save {Math.round((1 - (plan.yearlyPriceUsd / (plan.monthlyPriceUsd * 12))) * 100)}%
            </p>
          )}
        </div>

        {/* Feature flags */}
        <ul className="space-y-2">
          {plan.features?.map((f) => (
            <li key={f.key} className="flex items-center gap-2.5 text-sm">
              {f.included ? (
                <Check className="w-4 h-4 text-tetri-blue flex-shrink-0" />
              ) : (
                <Minus className="w-4 h-4 text-tetri-border flex-shrink-0" />
              )}
              <span className={f.included ? 'text-tetri-text' : 'text-tetri-neutral'}>
                {f.key === 'invoicing' && 'Invoicing'}
                {f.key === 'expenses' && 'Expense Tracking'}
                {f.key === 'ai_categorization' && 'AI Categorization'}
                {f.key === 'advanced_compliance' && 'Advanced Compliance'}
              </span>
            </li>
          ))}
        </ul>

        {/* Limits */}
        <div className="border-t border-tetri-border pt-4 space-y-2">
          {limitRows.map(({ label, value }) => (
            <div key={label} className="flex justify-between text-sm">
              <span className="text-tetri-muted">{label}</span>
              <span className="font-medium text-tetri-text">{value}</span>
            </div>
          ))}
        </div>

        {/* Action button */}
        {action && (
          <div className="pt-1">
            {action}
          </div>
        )}
      </div>
    </div>
  );
}
