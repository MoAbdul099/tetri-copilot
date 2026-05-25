import { useState, useEffect, useCallback } from 'react';
import dashboardService from '../services/dashboardService';

const useAsync = (fn, deps = []) => {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fn();
      setData(result);
    } catch (e) {
      setError(e?.response?.data?.error || e.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => { load(); }, [load]);

  return { data, loading, error, refresh: load };
};

export const useDashboardSummary  = ()         => useAsync(() => dashboardService.getSummary());
export const useFinancialSnapshot = (period)   => useAsync(() => dashboardService.getFinancial(period), [period]);
export const useReceivables       = ()         => useAsync(() => dashboardService.getReceivables());
export const useExpenseSummary    = ()         => useAsync(() => dashboardService.getExpenses());
export const useComplianceSummary = ()         => useAsync(() => dashboardService.getCompliance());
export const useActivityFeed      = (limit)    => useAsync(() => dashboardService.getActivity(limit), [limit]);
export const useSubscriptionUsage = ()         => useAsync(() => dashboardService.getSubscription());
export const useUpcomingTasks     = ()         => useAsync(() => dashboardService.getTasks());
export const useDashboardPreferences = ()      => useAsync(() => dashboardService.getPreferences());
