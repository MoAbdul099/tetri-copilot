import { useState } from 'react';
import { Check, Minus, Zap, ChevronDown, ChevronUp } from 'lucide-react';

const formatLimit = (value, unit = '') => {
  if (value === null || value === undefined) return 'Unlimited';
  return `${value.toLocaleString()}${unit ? ' ' + unit : ''}`;
};

const formatStorage = (mb) => {
  if (mb === null || mb === undefined) return 'Unlimited';
  if (mb >= 1024) return `${mb / 1024} GB`;
  return `${mb} MB`;
};

const SHOW_CAP = 8;

export default function PricingCard({ plan, isCurrentPlan = false, billingCycle = 'monthly', action = null }) {
  const [expanded, setExpanded] = useState(false);

  const price = billingCycle === 'yearly' && plan.yearlyPriceUsd != null
    ? plan.yearlyPriceUsd / 12
    : plan.monthlyPriceUsd;

  const isFree = Number(plan.monthlyPriceUsd) === 0;
  const isHighlighted = plan.isRecommended;

  const limitRows = [
    { label: 'Users', value: formatLimit(plan.maxUsers) },
    { label: 'Invoices / month', value: formatLimit(plan.maxMonthlyInvoices) },
    { label: 'AI requests / month', value: formatLimit(plan.maxMonthlyAiRequests) },
    { label: 'Storage', value: formatStorage(plan.maxStorageMb) },
  ];

  const features = Array.isArray(plan.features) ? plan.features : [];
  const included = features.filter((f) => f.included);
  const visible = expanded ? included : included.slice(0, SHOW_CAP);
  const overflow = included.length - SHOW_CAP;

  return (
    <div
      className={`relative flex flex-col rounded-card border bg-tetri-surface transition-shadow ${
        isHighlighted
          ? 'border-tetri-blue shadow-md ring-1 ring-tetri-blue/20'
          : 'border-tetri-border hover:shadow-sm'
      }`}
    >
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
                ${Number(price) % 1 === 0 ? Number(price) : Number(price).toFixed(2)}
              </span>
              <span className="text-sm text-tetri-muted mb-1">/month</span>
            </div>
          )}
          {!isFree && billingCycle === 'yearly' && plan.yearlyPriceUsd != null && (
            <p className="text-xs text-tetri-muted mt-0.5">
              Billed ${plan.yearlyPriceUsd}/year — save{' '}
              {Math.round((1 - Number(plan.yearlyPriceUsd) / (Number(plan.monthlyPriceUsd) * 12)) * 100)}%
            </p>
          )}
          {!isFree && plan.trialDays > 0 && (
            <p className="text-xs text-tetri-blue font-medium mt-1">{plan.trialDays}-day free trial</p>
          )}
        </div>

        {/* Included features */}
        {included.length > 0 && (
          <ul className="space-y-2">
            {visible.map((f, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm">
                <Check className="w-4 h-4 text-tetri-blue flex-shrink-0 mt-0.5" />
                <span className="text-tetri-text">{f.label}</span>
              </li>
            ))}
            {!expanded && overflow > 0 && (
              <li>
                <button
                  onClick={() => setExpanded(true)}
                  className="flex items-center gap-1 text-xs text-tetri-blue font-medium hover:underline mt-1"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                  +{overflow} more included
                </button>
              </li>
            )}
            {expanded && overflow > 0 && (
              <li>
                <button
                  onClick={() => setExpanded(false)}
                  className="flex items-center gap-1 text-xs text-tetri-muted font-medium hover:text-tetri-text mt-1"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                  Show less
                </button>
              </li>
            )}
          </ul>
        )}

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
