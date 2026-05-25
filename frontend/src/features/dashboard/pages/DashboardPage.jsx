import { useState, useEffect } from 'react';
import {
  DollarSign, TrendingUp, Wallet, ShieldCheck, Bell, CreditCard,
  RefreshCw,
} from 'lucide-react';
import authService from '../../auth/services/authService.js';
import LoadingSpinner from '../../../components/ui/LoadingSpinner.jsx';
import {
  useDashboardSummary,
  useReceivables,
  useSubscriptionUsage,
} from '../hooks/useDashboard.js';

import WelcomeBanner         from '../components/WelcomeBanner.jsx';
import QuickActionsPanel     from '../components/QuickActionsPanel.jsx';
import KpiCard               from '../components/KpiCard.jsx';
import FinancialSnapshotWidget from '../components/FinancialSnapshotWidget.jsx';
import ReceivablesWidget     from '../components/ReceivablesWidget.jsx';
import ExpenseSummaryWidget  from '../components/ExpenseSummaryWidget.jsx';
import ComplianceSummaryWidget from '../components/ComplianceSummaryWidget.jsx';
import ActivityFeedWidget    from '../components/ActivityFeedWidget.jsx';
import SubscriptionUsageWidget from '../components/SubscriptionUsageWidget.jsx';
import UpcomingTasksWidget   from '../components/UpcomingTasksWidget.jsx';

const fmtPct = (n) => (n == null ? null : n);

export default function DashboardPage() {
  const [profile, setProfile]   = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    authService.getMe()
      .then(setProfile)
      .catch(() => setProfile(null))
      .finally(() => setProfileLoading(false));
  }, []);

  const { data: summary, loading: summaryLoading, refresh: refreshSummary } = useDashboardSummary();
  const { data: aging,   loading: agingLoading }   = useReceivables();
  const { data: subData, loading: subLoading }     = useSubscriptionUsage();

  const s = summary || {};
  const ar          = s.ar          || {};
  const revenue     = s.revenue     || {};
  const collections = s.collections || {};
  const expenses    = s.expenses    || {};
  const compliance  = s.compliance  || {};
  const notifs      = s.notifications || {};

  if (profileLoading) return <LoadingSpinner message="Loading dashboard…" />;

  const { user, workspace } = profile || {};

  return (
    <div className="px-4 sm:px-8 py-6 max-w-7xl mx-auto space-y-5">

      {/* Welcome banner */}
      <WelcomeBanner
        user={user}
        workspace={workspace}
        subscription={subData}
      />

      {/* Refresh + timestamp */}
      <div className="flex items-center justify-end">
        <button
          onClick={refreshSummary}
          className="flex items-center gap-1.5 text-xs text-tetri-muted hover:text-tetri-blue transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
          Refresh
        </button>
      </div>

      {/* Quick actions */}
      <QuickActionsPanel />

      {/* KPI cards */}
      <div>
        <p className="text-xs font-semibold text-tetri-muted uppercase tracking-wide mb-3">Key Performance Indicators</p>
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          <KpiCard
            title="Outstanding AR"
            value={ar.outstanding}
            sub={`${ar.openInvoices || 0} open invoices`}
            currency
            accent="blue"
            icon={DollarSign}
            loading={summaryLoading}
          />
          <KpiCard
            title="Overdue"
            value={ar.overdue}
            sub={`${ar.collectionRate || 0}% collection rate`}
            currency
            accent="red"
            icon={DollarSign}
            loading={summaryLoading}
          />
          <KpiCard
            title="Revenue (Month)"
            value={revenue.current}
            change={fmtPct(revenue.growth)}
            changeLabel="vs last month"
            currency
            accent="green"
            icon={TrendingUp}
            loading={summaryLoading}
          />
          <KpiCard
            title="Collections"
            value={collections.current}
            sub={`${collections.count || 0} payments`}
            change={fmtPct(collections.growth)}
            changeLabel="vs last month"
            currency
            accent="green"
            icon={TrendingUp}
            loading={summaryLoading}
          />
          <KpiCard
            title="Expenses (Month)"
            value={expenses.current}
            sub={`${expenses.count || 0} transactions`}
            change={fmtPct(expenses.change)}
            changeLabel="vs last month"
            currency
            accent="amber"
            icon={Wallet}
            loading={summaryLoading}
          />
          <KpiCard
            title="Notifications"
            value={notifs.unread}
            sub={`${notifs.pendingApprovals || 0} pending approvals`}
            accent="purple"
            icon={Bell}
            loading={summaryLoading}
          />
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: Financial + Receivables */}
        <div className="lg:col-span-2 space-y-4">
          <FinancialSnapshotWidget />
          <ReceivablesWidget aging={aging} />
          <ExpenseSummaryWidget data={expenses} />
        </div>

        {/* Right: Compliance + Tasks + Subscription + Activity */}
        <div className="space-y-4">
          <ComplianceSummaryWidget data={compliance} />
          <UpcomingTasksWidget />
          <SubscriptionUsageWidget data={subData} />
        </div>
      </div>

      {/* Activity feed — full width */}
      <ActivityFeedWidget />

    </div>
  );
}
