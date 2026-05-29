import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Building2, Users, CreditCard, Globe,
  Languages, ShieldCheck, BrainCircuit, FileText, Receipt,
  Activity, Settings, Megaphone, Lock, ChevronRight,
} from 'lucide-react';
import { cn } from '../lib/cn';

const NAV = [
  { label: 'Dashboard',             icon: LayoutDashboard, to: '/' },
  { label: 'Organizations',         icon: Building2,        to: '/organizations' },
  { label: 'Users',                 icon: Users,            to: '/users' },
  { label: 'Plans & Subscriptions', icon: CreditCard,       to: '/plans' },
  { label: 'Country Profiles',      icon: Globe,            to: '/countries' },
  { label: 'Languages & Currencies',icon: Languages,        to: '/localization' },
  { label: 'Compliance Templates',  icon: ShieldCheck,      to: '/compliance-templates' },
  { label: 'AI Usage',              icon: BrainCircuit,     to: '/ai-usage' },
  { label: 'Document Templates',    icon: FileText,         to: '/document-templates' },
  { label: 'Billing Events',        icon: Receipt,          to: '/billing-events' },
  { label: 'Activity Logs',         icon: Activity,         to: '/activity-logs' },
  { label: 'Announcements',         icon: Megaphone,        to: '/announcements' },
  { label: 'Security',              icon: Lock,             to: '/security' },
  { label: 'System Settings',       icon: Settings,         to: '/settings' },
];

export default function AdminSidebar({ onNavigate }) {
  return (
    <aside className="flex flex-col h-full bg-white border-r border-tetri-border">
      {/* Logo / brand */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-tetri-border">
        <div className="w-8 h-8 rounded-lg bg-tetri-primary flex items-center justify-center text-white flex-shrink-0">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-tetri-text truncate">Tetri Admin</p>
          <p className="text-xs text-tetri-neutral truncate">Platform Administration</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
        {NAV.map(({ label, icon: Icon, to }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                isActive
                  ? 'bg-tetri-primary/10 text-tetri-primary font-semibold'
                  : 'text-tetri-neutral hover:bg-tetri-bg hover:text-tetri-text'
              )
            }
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1 truncate">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Version */}
      <div className="px-5 py-3 border-t border-tetri-border">
        <p className="text-xs text-tetri-muted">Slice 19.1 · Admin Portal</p>
      </div>
    </aside>
  );
}
