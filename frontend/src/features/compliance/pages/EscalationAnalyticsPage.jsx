import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Zap } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { getEscalationAnalytics } from '../services/complianceService.js';

export default function EscalationAnalyticsPage() {
  const navigate = useNavigate();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEscalationAnalytics()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const byLevel  = data?.byLevel  || [];
  const byStatus = data?.byStatus || [];
  const trends   = data?.trends   || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/compliance/reports')} className="text-tetri-muted hover:text-tetri-text">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-tetri-text">Escalation Analytics</h1>
          <p className="text-sm text-tetri-muted mt-0.5">Escalation volume, resolution rates, and level breakdown.</p>
        </div>
      </div>

      {loading ? (
        <div className="h-40 flex items-center justify-center text-tetri-muted text-sm">Loading…</div>
      ) : (
        <>
          {/* KPI Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Escalations', value: data?.total || 0, color: 'text-tetri-text' },
              { label: 'Open',              value: data?.open || 0,  color: 'text-amber-600' },
              { label: 'Resolved',          value: data?.resolved || 0, color: 'text-green-600' },
              { label: 'Resolution Rate',   value: data?.total > 0 ? `${Math.round((data.resolved / data.total) * 100)}%` : '—', color: 'text-blue-600' },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-white border border-tetri-border rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
                    <Zap className="w-3.5 h-3.5 text-amber-600" />
                  </span>
                  <p className="text-xs text-tetri-neutral">{label}</p>
                </div>
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* Trend */}
          {trends.length > 0 && (
            <div className="bg-white border border-tetri-border rounded-xl p-5">
              <h2 className="text-sm font-semibold text-tetri-text mb-4">Escalation Volume (6 months)</h2>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
                  <Line type="monotone" dataKey="count" name="Escalations" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* By Level */}
            {byLevel.length > 0 && (
              <div className="bg-white border border-tetri-border rounded-xl p-5">
                <h2 className="text-sm font-semibold text-tetri-text mb-4">By Level</h2>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={byLevel.map(r => ({ level: `Level ${r.level}`, count: r._count.id }))} barSize={24}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="level" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                    <Bar dataKey="count" name="Count" fill="#f59e0b" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* By Status */}
            {byStatus.length > 0 && (
              <div className="bg-white border border-tetri-border rounded-xl p-5">
                <h2 className="text-sm font-semibold text-tetri-text mb-4">By Status</h2>
                <div className="space-y-2">
                  {byStatus.map(row => (
                    <div key={row.status} className="flex items-center justify-between px-3 py-2 bg-tetri-bg rounded-lg">
                      <span className="text-sm capitalize text-tetri-text">{row.status}</span>
                      <span className="text-sm font-semibold text-tetri-text">{row._count.id}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {byLevel.length === 0 && byStatus.length === 0 && (
            <div className="bg-white border border-tetri-border rounded-xl p-10 text-center">
              <Zap className="w-8 h-8 text-tetri-neutral mx-auto mb-2" />
              <p className="text-sm text-tetri-muted">No escalation data yet.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
