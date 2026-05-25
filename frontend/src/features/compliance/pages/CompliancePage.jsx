import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck, AlertTriangle, CheckCircle2, Clock, TrendingUp,
  FileText, Zap, RefreshCw, ExternalLink, ChevronRight, BarChart2,
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { getDashboard, getTrends } from '../services/complianceService.js';

const HEALTH_CONFIG = {
  excellent: { label: 'Excellent', color: '#10b981', bg: 'bg-emerald-50', text: 'text-emerald-700', ring: '#10b981' },
  good:      { label: 'Good',      color: '#3b82f6', bg: 'bg-blue-50',    text: 'text-blue-700',    ring: '#3b82f6' },
  warning:   { label: 'Warning',   color: '#f59e0b', bg: 'bg-amber-50',   text: 'text-amber-700',   ring: '#f59e0b' },
  critical:  { label: 'Critical',  color: '#ef4444', bg: 'bg-red-50',     text: 'text-red-700',     ring: '#ef4444' },
};

const STATUS_BADGE = {
  scheduled:  'bg-blue-50 text-blue-700',
  in_progress:'bg-orange-50 text-orange-700',
  overdue:    'bg-red-50 text-red-700',
  completed:  'bg-green-50 text-green-700',
  submitted:  'bg-purple-50 text-purple-700',
  approved:   'bg-emerald-50 text-emerald-700',
};

const PRIORITY_BADGE = {
  critical: 'bg-red-100 text-red-700',
  high:     'bg-orange-100 text-orange-700',
  medium:   'bg-yellow-100 text-yellow-700',
  low:      'bg-slate-100 text-slate-600',
};

function daysUntil(date) {
  const diff = Math.ceil((new Date(date) - new Date()) / 86400000);
  return diff;
}

function daysAgo(date) {
  return Math.abs(Math.floor((new Date(date) - new Date()) / 86400000));
}

function HealthRing({ score, category }) {
  const cfg   = HEALTH_CONFIG[category] || HEALTH_CONFIG.good;
  const r     = 44;
  const circ  = 2 * Math.PI * r;
  const dash  = (score / 100) * circ;

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <svg width="110" height="110" viewBox="0 0 110 110">
        <circle cx="55" cy="55" r={r} fill="none" stroke="#e2e8f0" strokeWidth="10" />
        <circle
          cx="55" cy="55" r={r} fill="none" stroke={cfg.ring} strokeWidth="10"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          transform="rotate(-90 55 55)"
        />
        <text x="55" y="52" textAnchor="middle" fontSize="22" fontWeight="700" fill={cfg.ring}>{score}</text>
        <text x="55" y="66" textAnchor="middle" fontSize="10" fill="#94a3b8">/ 100</text>
      </svg>
      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>{cfg.label}</span>
    </div>
  );
}

export default function CompliancePage() {
  const navigate = useNavigate();
  const [dash, setDash]       = useState(null);
  const [trends, setTrends]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [upcomingDays, setUpcomingDays] = useState(30);
  const [lastRefresh, setLastRefresh]   = useState(new Date());

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [d, t] = await Promise.all([getDashboard(), getTrends(6)]);
      setDash(d);
      setTrends(t);
      setLastRefresh(new Date());
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // Auto-refresh every 15 minutes
  useEffect(() => {
    const id = setInterval(load, 15 * 60 * 1000);
    return () => clearInterval(id);
  }, [load]);

  const kpis = dash?.kpis || {};
  const upcoming = (dash?.upcoming || []).filter(o => daysUntil(o.dueDate) <= upcomingDays);
  const overdue  = dash?.overdue || [];
  const activity = dash?.recentActivity || [];

  const KPI_CARDS = [
    { label: 'Active Templates',    value: kpis.totalTemplates || 0, icon: ShieldCheck, color: 'text-blue-600',    bg: 'bg-blue-50' },
    { label: 'Open Obligations',    value: kpis.openCount || 0,      icon: Clock,        color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Due This Week',       value: kpis.dueWeek || 0,        icon: TrendingUp,   color: 'text-orange-600', bg: 'bg-orange-50', onClick: () => setUpcomingDays(7) },
    { label: 'Due This Month',      value: kpis.dueMonth || 0,       icon: FileText,     color: 'text-purple-600', bg: 'bg-purple-50', onClick: () => setUpcomingDays(30) },
    { label: 'Overdue',             value: kpis.overdueCount || 0,   icon: AlertTriangle,color: 'text-red-600',    bg: 'bg-red-50',    highlight: kpis.overdueCount > 0, onClick: () => navigate('/compliance/reports/overdue') },
    { label: 'Completed This Month',value: kpis.completedMonth || 0, icon: CheckCircle2, color: 'text-green-600',  bg: 'bg-green-50' },
    { label: 'Active Escalations',  value: kpis.escalatedCount || 0, icon: Zap,          color: 'text-amber-600',  bg: 'bg-amber-50',  highlight: kpis.escalatedCount > 0, onClick: () => navigate('/compliance/escalations') },
    { label: 'Health Score',        custom: true },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-tetri-text">Compliance Dashboard</h1>
          <p className="text-sm text-tetri-muted mt-0.5">Workspace compliance health and obligations overview.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-tetri-muted border border-tetri-border rounded-lg hover:bg-tetri-bg transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
          <button
            onClick={() => navigate('/compliance/reports')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-tetri-blue rounded-lg hover:bg-tetri-blue-hover transition-colors"
          >
            <BarChart2 className="w-3.5 h-3.5" />
            Reports
          </button>
        </div>
      </div>

      {loading && !dash ? (
        <div className="h-40 flex items-center justify-center text-tetri-muted text-sm">Loading dashboard…</div>
      ) : (
        <>
          {/* KPI Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {KPI_CARDS.map((card, i) => card.custom ? (
              <div key="health" className="bg-white border border-tetri-border rounded-xl p-4 flex flex-col items-center justify-center">
                <HealthRing score={kpis.healthScore ?? 100} category={kpis.healthCategory ?? 'excellent'} />
                <p className="text-xs text-tetri-neutral mt-1">Compliance Health</p>
              </div>
            ) : (
              <div
                key={card.label}
                onClick={card.onClick}
                className={`bg-white border rounded-xl p-4 ${card.onClick ? 'cursor-pointer hover:shadow-sm hover:border-tetri-blue/40 transition-all' : ''} ${card.highlight ? 'border-red-200' : 'border-tetri-border'}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center ${card.bg}`}>
                    <card.icon className={`w-3.5 h-3.5 ${card.color}`} />
                  </span>
                  <p className="text-xs text-tetri-neutral">{card.label}</p>
                </div>
                <p className={`text-2xl font-bold ${card.highlight ? 'text-red-600' : 'text-tetri-text'}`}>{card.value}</p>
              </div>
            ))}
          </div>

          {/* Trend Chart */}
          {trends.length > 0 && (
            <div className="bg-white border border-tetri-border rounded-xl p-5">
              <h2 className="text-sm font-semibold text-tetri-text mb-4">Compliance Trend (6 months)</h2>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={trends} barSize={14}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="completed" name="Completed" fill="#10b981" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="overdue"   name="Overdue"   fill="#ef4444" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="submitted" name="Submitted" fill="#6366f1" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upcoming */}
            <div className="bg-white border border-tetri-border rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-tetri-border">
                <h2 className="text-sm font-semibold text-tetri-text">Upcoming Obligations</h2>
                <div className="flex items-center gap-2">
                  <select
                    value={upcomingDays}
                    onChange={(e) => setUpcomingDays(Number(e.target.value))}
                    className="text-xs border border-tetri-border rounded-lg px-2 py-1 text-tetri-muted focus:outline-none focus:border-tetri-blue bg-transparent"
                  >
                    <option value={7}>7 days</option>
                    <option value={30}>30 days</option>
                    <option value={60}>60 days</option>
                    <option value={90}>90 days</option>
                  </select>
                  <button onClick={() => navigate('/compliance/occurrences')} className="text-xs text-tetri-blue hover:underline flex items-center gap-0.5">
                    View all <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
              {upcoming.length === 0 ? (
                <p className="text-xs text-tetri-neutral text-center py-8">No upcoming obligations in this period.</p>
              ) : (
                <div className="divide-y divide-tetri-border/50">
                  {upcoming.slice(0, 8).map((occ) => {
                    const days = daysUntil(occ.dueDate);
                    return (
                      <div key={occ.id} onClick={() => navigate(`/compliance/occurrences/${occ.id}`)} className="flex items-center gap-3 px-5 py-3 hover:bg-tetri-bg cursor-pointer transition-colors">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-tetri-text truncate">{occ.name}</p>
                          <p className="text-xs text-tetri-muted mt-0.5">{occ.owner?.fullName || '—'} · {occ.jurisdiction?.name || occ.category?.name || '—'}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className={`text-xs font-semibold ${days <= 3 ? 'text-red-600' : days <= 7 ? 'text-orange-600' : 'text-tetri-muted'}`}>
                            {days === 0 ? 'Today' : `${days}d`}
                          </p>
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full capitalize ${PRIORITY_BADGE[occ.priority] || PRIORITY_BADGE.medium}`}>{occ.priority}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Overdue */}
            <div className="bg-white border border-red-200 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-red-200 bg-red-50/50">
                <h2 className="text-sm font-semibold text-red-700 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" /> Overdue ({overdue.length})
                </h2>
                <button onClick={() => navigate('/compliance/reports/overdue')} className="text-xs text-red-600 hover:underline flex items-center gap-0.5">
                  Full report <ExternalLink className="w-3 h-3" />
                </button>
              </div>
              {overdue.length === 0 ? (
                <p className="text-xs text-tetri-neutral text-center py-8">No overdue obligations.</p>
              ) : (
                <div className="divide-y divide-red-100">
                  {overdue.slice(0, 8).map((occ) => (
                    <div key={occ.id} onClick={() => navigate(`/compliance/occurrences/${occ.id}`)} className="flex items-center gap-3 px-5 py-3 hover:bg-red-50/30 cursor-pointer transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-tetri-text truncate">{occ.name}</p>
                        <p className="text-xs text-tetri-muted mt-0.5">{occ.owner?.fullName || '—'} · {occ.authority?.name || occ.category?.name || '—'}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs font-semibold text-red-600">{daysAgo(occ.dueDate)}d overdue</p>
                        {occ.escalationInstances?.length > 0 && (
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">Escalated</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white border border-tetri-border rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-tetri-border">
              <h2 className="text-sm font-semibold text-tetri-text">Recent Activity</h2>
            </div>
            {activity.length === 0 ? (
              <p className="text-xs text-tetri-neutral text-center py-8">No recent activity.</p>
            ) : (
              <div className="divide-y divide-tetri-border/50">
                {activity.slice(0, 8).map((log) => (
                  <div key={log.id} onClick={() => navigate(`/compliance/occurrences/${log.occurrenceId}`)} className="flex items-center gap-3 px-5 py-3 hover:bg-tetri-bg cursor-pointer transition-colors">
                    <div className="w-1.5 h-1.5 rounded-full bg-tetri-blue flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-tetri-text truncate">
                        <span className="font-medium">{log.actor?.fullName || 'System'}</span>
                        {' '}<span className="text-tetri-muted">{log.action.replace(/_/g, ' ')}</span>
                        {' '}<span className="font-medium truncate">{log.occurrence?.name}</span>
                      </p>
                    </div>
                    <p className="text-xs text-tetri-neutral flex-shrink-0">
                      {new Date(log.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick nav to reports */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Compliance Register', to: '/compliance/reports/register', icon: FileText },
              { label: 'Filing History',       to: '/compliance/reports/filings',  icon: CheckCircle2 },
              { label: 'Overdue Report',       to: '/compliance/reports/overdue',  icon: AlertTriangle },
              { label: 'Escalation Analytics',to: '/compliance/reports/escalations', icon: Zap },
            ].map(({ label, to, icon: Icon }) => (
              <button key={to} onClick={() => navigate(to)}
                className="bg-white border border-tetri-border rounded-xl p-4 text-left hover:border-tetri-blue hover:shadow-sm transition-all group"
              >
                <Icon className="w-4 h-4 text-tetri-blue mb-2" />
                <p className="text-sm font-semibold text-tetri-text group-hover:text-tetri-blue">{label}</p>
              </button>
            ))}
          </div>

          <p className="text-xs text-tetri-neutral">Last refreshed: {lastRefresh.toLocaleTimeString()}</p>
        </>
      )}
    </div>
  );
}
