import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Bell } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { getReminderAnalytics } from '../services/complianceService.js';

export default function ReminderAnalyticsPage() {
  const navigate = useNavigate();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getReminderAnalytics()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const trends   = data?.trends   || [];
  const byChannel = data?.byChannel || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/compliance/reports')} className="text-tetri-muted hover:text-tetri-text">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-tetri-text">Reminder Analytics</h1>
          <p className="text-sm text-tetri-muted mt-0.5">Reminder delivery, read rates, and channel usage.</p>
        </div>
      </div>

      {loading ? (
        <div className="h-40 flex items-center justify-center text-tetri-muted text-sm">Loading…</div>
      ) : (
        <>
          {/* KPI Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Reminders', value: data?.total || 0 },
              { label: 'Delivered',       value: data?.delivered || 0 },
              { label: 'Delivery Rate',   value: `${data?.deliveryRate ?? 0}%` },
              { label: 'Read Rate',       value: `${data?.readRate ?? 0}%` },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white border border-tetri-border rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
                    <Bell className="w-3.5 h-3.5 text-indigo-600" />
                  </span>
                  <p className="text-xs text-tetri-neutral">{label}</p>
                </div>
                <p className="text-2xl font-bold text-tetri-text">{value}</p>
              </div>
            ))}
          </div>

          {/* Trend */}
          {trends.length > 0 && (
            <div className="bg-white border border-tetri-border rounded-xl p-5">
              <h2 className="text-sm font-semibold text-tetri-text mb-4">Reminder Volume (6 months)</h2>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="sent" name="Sent"  stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="read" name="Read"  stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Channel + Status breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {byChannel.length > 0 && (
              <div className="bg-white border border-tetri-border rounded-xl p-5">
                <h2 className="text-sm font-semibold text-tetri-text mb-4">By Channel</h2>
                <div className="space-y-2">
                  {byChannel.map(row => (
                    <div key={row.channel} className="flex items-center justify-between px-3 py-2 bg-tetri-bg rounded-lg">
                      <span className="text-sm capitalize text-tetri-text">{row.channel}</span>
                      <span className="text-sm font-semibold text-tetri-text">{row._count.id}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(data?.byStatus || []).length > 0 && (
              <div className="bg-white border border-tetri-border rounded-xl p-5">
                <h2 className="text-sm font-semibold text-tetri-text mb-4">By Status</h2>
                <div className="space-y-2">
                  {(data?.byStatus || []).map(row => (
                    <div key={row.status} className="flex items-center justify-between px-3 py-2 bg-tetri-bg rounded-lg">
                      <span className="text-sm capitalize text-tetri-text">{row.status}</span>
                      <span className="text-sm font-semibold text-tetri-text">{row._count.id}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {data?.total === 0 && (
            <div className="bg-white border border-tetri-border rounded-xl p-10 text-center">
              <Bell className="w-8 h-8 text-tetri-neutral mx-auto mb-2" />
              <p className="text-sm text-tetri-muted">No reminder data yet. The reminder engine runs hourly.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
