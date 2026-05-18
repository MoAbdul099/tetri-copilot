import { useState, useEffect } from 'react';
import { CreditCard } from 'lucide-react';
import PageHeader from '../../../components/shared/PageHeader';
import PricingCard from '../../../components/shared/PricingCard';
import { getPlans } from '../services/plansService';
import { getCurrentSubscription } from '../services/subscriptionService';

export default function PlansPage() {
  const [plans, setPlans] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [plansData, subData] = await Promise.all([
          getPlans(),
          getCurrentSubscription(),
        ]);
        setPlans(plansData);
        setSubscription(subData);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load plans');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <PageHeader
        icon={CreditCard}
        title="Plans"
        description="Choose the plan that best fits your team's needs."
      />

      {/* Billing cycle toggle */}
      <div className="flex items-center justify-center mt-6 mb-8">
        <div className="inline-flex items-center bg-tetri-bg border border-tetri-border rounded-xl p-1 gap-1">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              billingCycle === 'monthly'
                ? 'bg-tetri-surface text-tetri-text shadow-sm border border-tetri-border'
                : 'text-tetri-muted hover:text-tetri-text'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              billingCycle === 'yearly'
                ? 'bg-tetri-surface text-tetri-text shadow-sm border border-tetri-border'
                : 'text-tetri-muted hover:text-tetri-text'
            }`}
          >
            Yearly
            <span className="ml-1.5 text-xs text-tetri-blue font-semibold">Save ~17%</span>
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-card border border-tetri-border bg-tetri-surface h-[480px] animate-pulse" />
          ))}
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="rounded-card border border-tetri-error/20 bg-red-50 p-6 text-center">
          <p className="text-sm text-tetri-error">{error}</p>
        </div>
      )}

      {/* Plans grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-start">
          {plans.map((plan) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              isCurrentPlan={subscription?.plan?.code === plan.code}
              billingCycle={billingCycle}
            />
          ))}
        </div>
      )}

      {/* Current plan info */}
      {!loading && !error && subscription && (
        <div className="mt-8 rounded-card border border-tetri-border bg-tetri-surface p-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1">
              <p className="text-sm font-semibold text-tetri-text">
                Current plan: <span className="text-tetri-blue">{subscription.plan.name}</span>
              </p>
              <p className="text-sm text-tetri-muted mt-0.5">
                Status:{' '}
                <span className={`font-medium ${
                  subscription.status === 'active' ? 'text-green-600' :
                  subscription.status === 'trialing' ? 'text-tetri-blue' :
                  'text-tetri-error'
                }`}>
                  {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                </span>
              </p>
            </div>
            {subscription.currentPeriodEnd && (
              <p className="text-xs text-tetri-neutral">
                Renews {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      )}

      <p className="mt-6 text-xs text-tetri-neutral text-center">
        Upgrade and billing flows coming soon. Prices shown in USD.
      </p>
    </div>
  );
}
