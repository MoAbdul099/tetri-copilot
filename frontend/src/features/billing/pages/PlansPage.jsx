import { useState, useEffect, useCallback } from 'react';
import PageHeader from '../../../components/shared/PageHeader';
import PricingCard from '../../../components/shared/PricingCard';
import PlanChangeDialog from '../../../components/shared/PlanChangeDialog';
import { getPlans } from '../services/plansService';
import { getCurrentSubscription, upgradePlan, downgradePlan, cancelSubscription } from '../services/subscriptionService';
import { createCheckoutSession } from '../services/billingService';

export default function PlansPage() {
  const [plans, setPlans] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dialog state
  const [dialog, setDialog] = useState({ open: false, type: null, targetPlan: null });
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);

  // Checkout state
  const [checkoutLoading, setCheckoutLoading] = useState(null); // planCode or null
  const [checkoutError, setCheckoutError] = useState(null);

  const load = useCallback(async () => {
    try {
      const [plansData, subData] = await Promise.all([getPlans(), getCurrentSubscription()]);
      setPlans(plansData);
      setSubscription(subData);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load plans');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const currentPlanOrder = subscription?.plan?.displayOrder ?? -1;

  const openDialog = (type, targetPlan = null) => {
    setActionError(null);
    setDialog({ open: true, type, targetPlan });
  };

  const closeDialog = () => {
    if (actionLoading) return;
    setDialog({ open: false, type: null, targetPlan: null });
    setActionError(null);
  };

  const handleConfirm = async () => {
    setActionLoading(true);
    setActionError(null);
    try {
      let updated;
      if (dialog.type === 'upgrade') {
        updated = await upgradePlan(dialog.targetPlan.code);
      } else if (dialog.type === 'downgrade') {
        updated = await downgradePlan(dialog.targetPlan.code);
      } else if (dialog.type === 'cancel') {
        updated = await cancelSubscription();
      }
      setSubscription(updated);
      closeDialog();
    } catch (err) {
      setActionError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckout = async (plan) => {
    setCheckoutLoading(plan.code);
    setCheckoutError(null);
    try {
      const { checkoutUrl } = await createCheckoutSession({
        planCode: plan.code,
        billingInterval: billingCycle,
      });
      window.location.href = checkoutUrl;
    } catch (err) {
      setCheckoutError(err.response?.data?.error || 'Failed to start checkout. Please try again.');
      setCheckoutLoading(null);
    }
  };

  const renderAction = (plan) => {
    const isCurrentPlan = subscription?.plan?.code === plan.code;
    const isCancelled = subscription?.status === 'cancelled';
    const isUpgrade = plan.displayOrder > currentPlanOrder;
    const isDowngrade = plan.displayOrder < currentPlanOrder;

    if (isCurrentPlan) {
      return (
        <div className="space-y-2">
          <button
            disabled
            className="w-full py-2 rounded-btn border border-tetri-border text-sm font-medium text-tetri-muted bg-tetri-bg cursor-not-allowed"
          >
            Current Plan
          </button>
          {!isCancelled && (
            <button
              onClick={() => openDialog('cancel')}
              className="w-full py-2 rounded-btn border border-tetri-error/30 text-sm font-medium text-tetri-error hover:bg-red-50 transition-colors"
            >
              Cancel Plan
            </button>
          )}
          {isCancelled && (
            <p className="text-center text-xs text-tetri-error font-medium">Subscription cancelled</p>
          )}
        </div>
      );
    }

    if (isUpgrade) {
      const isCheckingOut = checkoutLoading === plan.code;
      return (
        <div className="space-y-2">
          <button
            onClick={() => handleCheckout(plan)}
            disabled={isCheckingOut}
            className="w-full py-2 rounded-btn bg-tetri-blue hover:bg-tetri-blue-hover text-white text-sm font-semibold transition-colors disabled:opacity-60"
          >
            {isCheckingOut ? 'Redirecting…' : 'Subscribe'}
          </button>
          <button
            onClick={() => openDialog('upgrade', plan)}
            className="w-full py-1.5 rounded-btn text-xs font-medium text-tetri-muted hover:text-tetri-text transition-colors"
          >
            Switch plan manually
          </button>
        </div>
      );
    }

    if (isDowngrade) {
      return (
        <button
          onClick={() => openDialog('downgrade', plan)}
          className="w-full py-2 rounded-btn border border-tetri-border text-sm font-medium text-tetri-text hover:bg-tetri-bg transition-colors"
        >
          Downgrade
        </button>
      );
    }

    return null;
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <PageHeader
        title="Plans"
        subtitle="Choose the plan that best fits your team's needs."
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

      {/* Checkout error */}
      {checkoutError && (
        <div className="mb-4 rounded-card border border-tetri-error/20 bg-red-50 px-5 py-3">
          <p className="text-sm text-tetri-error">{checkoutError}</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-card border border-tetri-border bg-tetri-surface h-[520px] animate-pulse" />
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
              action={subscription ? renderAction(plan) : null}
            />
          ))}
        </div>
      )}

      {/* Current plan footer */}
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
        Prices shown in USD. Payment billing coming soon.
      </p>

      {/* Plan change dialog */}
      <PlanChangeDialog
        open={dialog.open}
        type={dialog.type}
        targetPlan={dialog.targetPlan}
        currentPlan={subscription?.plan}
        loading={actionLoading}
        error={actionError}
        onConfirm={handleConfirm}
        onClose={closeDialog}
      />
    </div>
  );
}
