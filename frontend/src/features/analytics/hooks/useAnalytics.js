import { useState, useEffect, useCallback } from 'react';
import analyticsService from '../services/analyticsService.js';

function useAsync(fn, deps = []) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  const run = useCallback(async () => {
    setLoading(true);
    setError('');
    try   { setData(await fn()); }
    catch (e) { setError(e.message || 'Error'); }
    finally { setLoading(false); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => { run(); }, [run]);
  return { data, loading, error, refresh: run };
}

export function useAnalyticsDashboard() {
  return useAsync(() => analyticsService.getAnalytics(), []);
}

export function useHealthScore() {
  return useAsync(() => analyticsService.getHealthScore(), []);
}

export function useInsights(params = {}) {
  const key = JSON.stringify(params);
  return useAsync(() => analyticsService.listInsights(params), [key]);
}

export function useRiskAlerts() {
  return useAsync(() => analyticsService.listRiskAlerts(), []);
}
