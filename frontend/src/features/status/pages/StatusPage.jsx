import { useState, useEffect } from 'react';
import api, { API_BASE_URL } from '../../../lib/api';

export default function StatusPage() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [lastChecked, setLastChecked] = useState(null);

  const checkHealth = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await api.get('/api/v1/health');
      setHealth(res.data.data);
      setLastChecked(new Date().toLocaleTimeString());
    } catch {
      setFetchError('Backend unreachable — ensure the API server is running.');
      setHealth(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const overallOk = !fetchError && health?.status === 'ok';
  const degraded = !fetchError && health?.status === 'degraded';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gray-900 mb-4">
            <span className="text-white text-xl font-bold">T</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Tetri Copilot</h1>
          <p className="text-sm text-gray-500 mt-1">System Status</p>
        </div>

        {/* Status card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

          {/* Banner */}
          <div
            className={`flex items-center gap-3 px-5 py-4 border-b ${
              loading
                ? 'bg-gray-50 border-gray-100'
                : fetchError
                ? 'bg-red-50 border-red-100'
                : overallOk
                ? 'bg-green-50 border-green-100'
                : 'bg-yellow-50 border-yellow-100'
            }`}
          >
            <span
              className={`inline-block w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                loading
                  ? 'bg-gray-400 animate-pulse'
                  : fetchError
                  ? 'bg-red-500'
                  : overallOk
                  ? 'bg-green-500'
                  : 'bg-yellow-500'
              }`}
            />
            <span className="text-sm font-semibold text-gray-800">
              {loading
                ? 'Checking status...'
                : fetchError
                ? 'Service Unreachable'
                : overallOk
                ? 'All Systems Operational'
                : 'Service Degraded'}
            </span>
          </div>

          {/* Details */}
          {loading && (
            <div className="divide-y divide-gray-100">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex justify-between items-center px-5 py-3.5">
                  <div className="h-3 bg-gray-100 rounded w-20 animate-pulse" />
                  <div className="h-3 bg-gray-100 rounded w-28 animate-pulse" />
                </div>
              ))}
            </div>
          )}

          {fetchError && (
            <div className="px-5 py-6 text-center">
              <p className="text-sm text-red-600">{fetchError}</p>
              <p className="text-xs text-gray-400 mt-1">
                Check that the backend is running on{' '}
                <code className="bg-gray-100 px-1 rounded">
                  {API_BASE_URL}
                </code>
              </p>
            </div>
          )}

          {!loading && !fetchError && health && (
            <div className="divide-y divide-gray-100">
              <Row
                label="API"
                value="Operational"
                valueClass="text-green-600"
              />
              <Row
                label="Database"
                value={
                  health.services?.database?.status === 'ok'
                    ? `Operational (${health.services.database.latencyMs}ms)`
                    : 'Error'
                }
                valueClass={
                  health.services?.database?.status === 'ok'
                    ? 'text-green-600'
                    : 'text-red-600'
                }
              />
              <Row label="Version" value={`v${health.version}`} />
              <Row label="Environment" value={health.environment} />
              <Row
                label="Timestamp"
                value={new Date(health.timestamp).toLocaleString()}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-gray-400">
            {lastChecked ? `Last checked ${lastChecked}` : ''}
          </span>
          <button
            onClick={checkHealth}
            disabled={loading}
            className="text-xs px-3 py-1.5 rounded-lg bg-gray-900 text-white hover:bg-gray-700 disabled:opacity-40 transition-colors"
          >
            {loading ? 'Checking...' : 'Refresh'}
          </button>
        </div>

      </div>
    </div>
  );
}

function Row({ label, value, valueClass = 'text-gray-700' }) {
  return (
    <div className="flex items-center justify-between px-5 py-3.5">
      <span className="text-sm text-gray-500">{label}</span>
      <span className={`text-sm font-medium ${valueClass}`}>{value}</span>
    </div>
  );
}
