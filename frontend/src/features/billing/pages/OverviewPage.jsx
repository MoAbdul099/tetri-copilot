import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CreditCard,
  Users,
  FileText,
  Receipt,
  Sparkles,
  HardDrive,
  Check,
  Minus,
  ArrowRight,
  ExternalLink,
  AlertTriangle,
} from 'lucide-react';
import PageHeader from '../../../components/shared/PageHeader';
import UsageProgressCard from '../../../components/shared/UsageProgressCard';
import BillingEventList from '../components/BillingEventList';
import { getCurrentSubscription, getFeatureAccess } from '../services/subscriptionService';
import { getUsageSummary } from '../services/usageService';
import { createPortalSession, getBillingEvents } from '../services/billingService';


const SUBSCRIPTION_STATUS_STYLES = {
  active:    'bg-emerald-50 text-emerald-700',
  trialing:  'bg-[#eff4ff] text-tetri-blue',
  past_due:  'bg-amber-50 text-amber-700',
  cancelled: 'bg-red-50 text-tetri-error',
  expired:   'bg-red-50 text-tetri-error',
};

const FEATURE_LABELS = {
  invoicing:            'Invoicing',
  expenses:             'Expense Tracking',
  ai_categorization:    'AI Categorization',
  advanced_compliance:  'Advanced Compliance',
};

const USAGE_CARDS = [
  { key: 'users',               label: 'Team Members',           icon: Users,     unit: '' },
  { key: 'monthly_invoices',    label: 'Invoices this month',    icon: FileText,  unit: '' },
  { key: 'monthly_expenses',    label: 'Expenses this month',    icon: Receipt,   unit: '' },
  { key: 'monthly_ai_requests', label: 'AI requests this month', icon: Sparkles,  unit: '' },
  { key: 'storage_mb',          label: 'Storage used',           icon: HardDrive, unit: 'MB' },
];

export default function OverviewPage() {
  const [subscription, setSubscription] = useState(null);
  const [usage, setUsage] = useState(null);
  const [features, setFeatures] = useState(null);
  const [billingEvents, setBillingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [portalError, setPortalError] = useState(null);

  useEffect(() => {
    Promise.all([
      getCurrentSubscription(),
      getUsageSummary(),
      getFeatureAccess(),
      getBillingEvents({ limit: 5 }),
    ])
      .then(([sub, usageData, featureData, evResult]) => {
        setSubscription(sub);
        setUsage(usageData);
        setFeatures(featureData);
        setBillingEvents(evResult?.events || []);
      })
      .catch((err) => setError(err.response?.data?.error || 'Failed to load billing overview'))
      .finally(() => setLoading(false));
  }, []);

  const handleManageBilling = async () => {
    setPortalLoading(true);
    setPortalError(null);
    try {
      const { portalUrl } = await createPortalSession();
      window.location.href = portalUrl;
    } catch (err) {
      setPortalError(err.response?.data?.error || 'Failed to open billing portal. Please try again.');
      setPortalLoading(false);
    }
  };

  const plan = subscription?.plan;
  const isPastDue = subscription?.status === 'past_due';
  const hasStripeCustomer = !!subscription?.stripeCustomerId;
  const isFree = plan?.monthlyPriceUsd === 0;

  const statusLabel = subscription?.status
    ? subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1).replace('_', ' ')
    : null;

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <PageHeader title="Billing Overview" subtitle="Your current plan, feature access, and workspace usage.">
        <Link
          to="/billing/plans"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-btn border border-tetri-border text-sm font-medium text-tetri-text hover:bg-tetri-bg transition-colors"
        >
          View plans
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </PageHeader>

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-6">
          <div className="rounded-card border border-tetri-border bg-tetri-surface h-36 animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="rounded-card border border-tetri-border bg-tetri-surface h-28 animate-pulse" />
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="rounded-card border border-tetri-error/20 bg-red-50 p-6 text-center">
          <p className="text-sm text-tetri-error">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-6">

          {/* Past due warning */}
          {isPastDue && (
            <div className="flex gap-3 p-4 rounded-card border border-amber-200 bg-amber-50">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-800">Payment past due</p>
                <p className="text-sm text-amber-700 mt-0.5">
                  Your last payment failed. Update your payment method to keep access to paid features.
                </p>
                {hasStripeCustomer && (
                  <button
                    onClick={handleManageBilling}
                    disabled={portalLoading}
                    className="mt-2 text-sm font-semibold text-amber-800 underline underline-offset-2 hover:text-amber-900 disabled:opacity-60"
                  >
                    {portalLoading ? 'Opening portal…' : 'Update payment method'}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Current plan card */}
          <div className="rounded-card border border-tetri-border bg-tetri-surface p-6">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#eff4ff] flex items-center justify-center flex-shrink-0">
                <CreditCard className="w-5 h-5 text-tetri-blue" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h2 className="text-base font-bold text-tetri-text">
                    {plan?.name ?? '—'} Plan
                  </h2>
                  {subscription?.status && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${SUBSCRIPTION_STATUS_STYLES[subscription.status] ?? 'bg-tetri-bg text-tetri-muted'}`}>
                      {statusLabel}
                    </span>
                  )}
                </div>
                {plan?.description && (
                  <p className="text-sm text-tetri-muted">{plan.description}</p>
                )}

                <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1">
                  <span className="text-sm text-tetri-muted">
                    <span className="font-semibold text-tetri-text">
                      ${plan?.monthlyPriceUsd ?? 0}
                    </span>
                    {' '}/month
                  </span>
                  {plan?.limits?.users !== null && (
                    <span className="text-sm text-tetri-muted">
                      Up to{' '}
                      <span className="font-semibold text-tetri-text">
                        {plan?.limits?.users ?? '—'} users
                      </span>
                    </span>
                  )}
                  {subscription?.currentPeriodEnd && (
                    <span className="text-sm text-tetri-muted">
                      Renews{' '}
                      <span className="font-semibold text-tetri-text">
                        {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                      </span>
                    </span>
                  )}
                </div>

                {/* Portal error */}
                {portalError && (
                  <p className="mt-2 text-xs text-tetri-error">{portalError}</p>
                )}
              </div>

              {/* Billing action buttons */}
              <div className="flex flex-col gap-2 flex-shrink-0">
                {hasStripeCustomer ? (
                  <button
                    onClick={handleManageBilling}
                    disabled={portalLoading}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-btn border border-tetri-border text-sm font-medium text-tetri-text hover:bg-tetri-bg transition-colors disabled:opacity-60"
                  >
                    {portalLoading ? 'Opening…' : (
                      <>
                        Manage Billing
                        <ExternalLink className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                ) : isFree ? (
                  <Link
                    to="/billing/plans"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-btn bg-tetri-blue hover:bg-tetri-blue-hover text-white text-sm font-semibold transition-colors"
                  >
                    Upgrade Plan
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                ) : (
                  <Link
                    to="/billing/plans"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-btn border border-tetri-border text-sm font-medium text-tetri-text hover:bg-tetri-bg transition-colors"
                  >
                    View Plans
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Usage section */}
          <div>
            <h3 className="text-sm font-semibold text-tetri-text mb-3">Usage this month</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {USAGE_CARDS.map(({ key, label, icon, unit }) => {
                const metric = usage?.[key];
                if (!metric) return null;
                return (
                  <UsageProgressCard
                    key={key}
                    icon={icon}
                    label={label}
                    used={metric.used}
                    limit={metric.limit}
                    unlimited={metric.unlimited}
                    percent={metric.percent}
                    status={metric.status}
                    unit={unit}
                  />
                );
              })}
            </div>
          </div>

          {/* Features section */}
          {features?.features && (
            <div>
              <h3 className="text-sm font-semibold text-tetri-text mb-3">Feature access</h3>
              <div className="rounded-card border border-tetri-border bg-tetri-surface divide-y divide-tetri-border">
                {features.features.map((f) => (
                  <div key={f.key} className="flex items-center justify-between px-5 py-3">
                    <span className="text-sm text-tetri-text">
                      {FEATURE_LABELS[f.key] ?? f.key}
                    </span>
                    {f.included ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        <Check className="w-3 h-3" />
                        Included
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-tetri-neutral bg-tetri-bg px-2 py-0.5 rounded-full">
                        <Minus className="w-3 h-3" />
                        Not included
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Billing events section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-tetri-text">Recent billing events</h3>
              <Link
                to="/billing/events"
                className="inline-flex items-center gap-1 text-xs font-medium text-tetri-blue hover:underline"
              >
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <BillingEventList events={billingEvents} />
          </div>

        </div>
      )}
    </div>
  );
}
