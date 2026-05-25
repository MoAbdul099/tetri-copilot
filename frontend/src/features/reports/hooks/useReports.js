import { useState, useEffect, useCallback } from 'react';
import reportsService from '../services/reportsService.js';

function useAsync(fn, deps = []) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try { setData(await fn()); }
    catch (e) { setError(e.message || 'Error'); }
    finally   { setLoading(false); }
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { run(); }, [run]);
  return { data, loading, error, refresh: run };
}

export function useReportCatalog() {
  return useAsync(() => reportsService.getCatalog());
}

export function useSavedReports() {
  return useAsync(() => reportsService.listSaved());
}

export function useScheduledReports() {
  return useAsync(() => reportsService.listSchedules());
}
