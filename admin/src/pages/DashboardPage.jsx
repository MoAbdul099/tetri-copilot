import {
  Building2, Users, CreditCard, ShieldCheck,
  BrainCircuit, FileText, Activity, TrendingUp,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SUMMARY_CARDS = [
  { label: 'Organizations',    icon: Building2,   color: 'bg-blue-50 text-blue-600',   value: '—' },
  { label: 'Total Users',      icon: Users,       color: 'bg-purple-50 text-purple-600', value: '—' },
  { label: 'Active Plans',     icon: CreditCard,  color: 'bg-green-50 text-green-600',  value: '—' },
  { label: 'Compliance Packs', icon: ShieldCheck, color: 'bg-amber-50 text-amber-600',  value: '—' },
  { label: 'AI Requests Today',icon: BrainCircuit,color: 'bg-pink-50 text-pink-600',    value: '—' },
  { label: 'Documents Gen.',   icon: FileText,    color: 'bg-cyan-50 text-cyan-600',    value: '—' },
  { label: 'Activity (24h)',   icon: Activity,    color: 'bg-red-50 text-red-600',      value: '—' },
  { label: 'Revenue (MTD)',    icon: TrendingUp,  color: 'bg-emerald-50 text-emerald-600', value: '—' },
];

const QUICK_LINKS = [
  { label: 'Manage Organizations', to: '/organizations', icon: Building2 },
  { label: 'Manage Users',         to: '/users',         icon: Users },
  { label: 'Plans & Subscriptions',to: '/plans',         icon: CreditCard },
  { label: 'Compliance Templates', to: '/compliance-templates', icon: ShieldCheck },
  { label: 'AI Usage',             to: '/ai-usage',      icon: BrainCircuit },
  { label: 'Activity Logs',        to: '/activity-logs', icon: Activity },
];

export default function DashboardPage() {
  const { admin } = useAuth();

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Welcome */}
      <div className="bg-white border border-tetri-border rounded-2xl p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-tetri-text">
              Welcome back, {admin?.firstName}
            </h1>
            <p className="text-sm text-tetri-neutral mt-1">
              Tetri Copilot Platform Administration · {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-tetri-primary/10 text-tetri-primary px-2.5 py-1 rounded-full capitalize">
            {admin?.role}
          </span>
        </div>
      </div>

      {/* Summary cards */}
      <div>
        <h2 className="text-sm font-semibold text-tetri-neutral uppercase tracking-wide mb-3">Platform Overview</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {SUMMARY_CARDS.map(({ label, icon: Icon, color, value }) => (
            <div key={label} className="bg-white border border-tetri-border rounded-xl p-4">
              <div className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center mb-3`}>
                <Icon className="w-4.5 h-4.5" />
              </div>
              <p className="text-xl font-bold text-tetri-text">{value}</p>
              <p className="text-xs text-tetri-neutral mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick links */}
      <div>
        <h2 className="text-sm font-semibold text-tetri-neutral uppercase tracking-wide mb-3">Quick Navigation</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {QUICK_LINKS.map(({ label, to, icon: Icon }) => (
            <a
              key={to}
              href={to}
              className="bg-white border border-tetri-border rounded-xl p-4 flex items-center gap-3 hover:border-tetri-primary/40 hover:bg-tetri-bg transition-colors group"
            >
              <div className="w-8 h-8 rounded-lg bg-tetri-bg flex items-center justify-center group-hover:bg-tetri-primary/10 transition-colors">
                <Icon className="w-4 h-4 text-tetri-neutral group-hover:text-tetri-primary transition-colors" />
              </div>
              <span className="text-sm font-medium text-tetri-text">{label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
