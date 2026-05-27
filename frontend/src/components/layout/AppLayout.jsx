import { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useClerk } from '@clerk/clerk-react';
import {
  LayoutDashboard, Settings, Users, Users2, CreditCard, FileText,
  LogOut, Menu, X, ChevronDown, ChevronRight,
  TrendingUp, Activity, Receipt, ShoppingCart, CheckSquare,
  Wallet, Brain, Target, RefreshCw, FolderOpen,
  HardDrive, ShieldCheck, Scale, ClipboardList, Calendar, Tag, BookOpen, Building2, CheckCircle,
  Bell, Siren, BarChart2, BellRing, Mail, LineChart, Megaphone, Sparkles, Clock, Shield, ShieldAlert, MonitorDot, Rocket, Gauge, ClipboardCheck, AlertTriangle, DollarSign, Zap, ToggleRight, MessageSquare, Bot,
} from 'lucide-react';
import NotificationBell from '../../features/notifications/components/NotificationBell.jsx';
import AssistantWidget from '../../features/assistant/components/AssistantWidget.jsx';

// Group icon color classes per group
const GROUP_ICON_STYLES = {
  Revenue:    'bg-blue-50 text-blue-600',
  Expenses:   'bg-orange-50 text-orange-600',
  Compliance: 'bg-emerald-50 text-emerald-600',
  Documents:  'bg-teal-50 text-teal-600',
  Analytics:  'bg-violet-50 text-violet-600',
  Workspace:   'bg-slate-100 text-slate-600',
  Security:    'bg-red-50 text-red-600',
  System:      'bg-sky-50 text-sky-600',
  Settings:    'bg-slate-100 text-slate-600',
  'AI Platform': 'bg-violet-50 text-violet-600',
};

const NAV_CONFIG = [
  {
    type: 'item',
    to: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    type: 'item',
    to: '/assistant',
    label: 'AI Assistant',
    icon: Bot,
  },
  {
    type: 'item',
    to: '/reports',
    label: 'Reports',
    icon: BarChart2,
  },
  {
    type: 'item',
    to: '/activity',
    label: 'Activity',
    icon: Clock,
  },
  {
    type: 'group',
    label: 'Analytics',
    groupIcon: LineChart,
    items: [
      { to: '/analytics',           label: 'Analytics',       icon: LineChart },
      { to: '/analytics/insights',  label: 'Insights Center', icon: Sparkles },
    ],
  },
  {
    type: 'group',
    label: 'Revenue',
    groupIcon: TrendingUp,
    items: [
      { to: '/customers',   label: 'Customers',   icon: Users2 },
      { to: '/invoices',    label: 'Invoices',    icon: FileText },
      { to: '/payments',    label: 'Payments',    icon: CreditCard },
      { to: '/receivables', label: 'Receivables', icon: TrendingUp },
      { to: '/collections', label: 'Collections', icon: Activity },
      { to: '/statements',  label: 'Statements',  icon: Receipt },
    ],
  },
  {
    type: 'group',
    label: 'Expenses',
    groupIcon: ShoppingCart,
    items: [
      { to: '/expenses',           label: 'Expenses',       icon: ShoppingCart },
      { to: '/approvals',          label: 'Approvals',      icon: CheckSquare },
      { to: '/reimbursements',     label: 'Reimbursements', icon: Wallet },
      { to: '/budgets',            label: 'Budgets',        icon: Target },
      { to: '/recurring-expenses', label: 'Recurring',      icon: RefreshCw },
      { to: '/expense-insights',   label: 'Insights',       icon: Brain },
    ],
  },
  {
    type: 'group',
    label: 'Compliance',
    groupIcon: Scale,
    items: [
      { to: '/compliance',             label: 'Overview',    icon: ShieldCheck },
      { to: '/compliance/templates',   label: 'Templates',   icon: ClipboardList },
      { to: '/compliance/occurrences', label: 'Occurrences', icon: CheckSquare },
      { to: '/compliance/calendar',    label: 'Calendar',    icon: Calendar },
      { to: '/compliance/categories',          label: 'Categories',      icon: Tag },
      { to: '/compliance/packs',               label: 'Packs',           icon: BookOpen },
      { to: '/compliance/reminders/profiles',  label: 'Reminders',       icon: Bell },
      { to: '/compliance/escalations/profiles',label: 'Esc. Profiles',   icon: Siren },
      { to: '/compliance/escalations',         label: 'Escalations',     icon: Siren },
      { to: '/compliance/reports',             label: 'Reports',         icon: BarChart2 },
    ],
  },
  {
    type: 'group',
    label: 'Documents',
    groupIcon: HardDrive,
    items: [
      { to: '/files',              label: 'Files',        icon: FolderOpen },
      { to: '/ai-documents',       label: 'AI Documents', icon: Sparkles },
      { to: '/document-templates', label: 'Templates',    icon: FileText },
    ],
  },
  {
    type: 'group',
    label: 'Workspace',
    groupIcon: Users,
    requiredRoles: ['owner', 'admin'],
    items: [
      { to: '/members', label: 'Members', icon: Users },
      { to: '/billing', label: 'Billing', icon: CreditCard, requiredRoles: ['owner'] },
    ],
  },
  {
    type: 'group',
    label: 'Security',
    groupIcon: ShieldAlert,
    requiredRoles: ['owner', 'admin'],
    items: [
      { to: '/audit',              label: 'Audit Log',  icon: Shield },
      { to: '/security',           label: 'Security',   icon: ShieldAlert },
      { to: '/security/posture',   label: 'Posture',    icon: Gauge },
      { to: '/security/compliance',label: 'Compliance', icon: ClipboardCheck },
    ],
  },
  {
    type: 'group',
    label: 'System',
    groupIcon: MonitorDot,
    requiredRoles: ['owner', 'admin'],
    items: [
      { to: '/system',              label: 'Status',      icon: MonitorDot },
      { to: '/system/deployments',  label: 'Deployments', icon: Rocket },
      { to: '/system/reliability',  label: 'Reliability', icon: Activity },
      { to: '/system/incidents',    label: 'Incidents',   icon: AlertTriangle },
    ],
  },
  {
    type: 'group',
    label: 'AI Platform',
    groupIcon: Brain,
    requiredRoles: ['owner', 'admin'],
    items: [
      { to: '/ai',                label: 'AI Settings',   icon: Brain },
      { to: '/ai/usage',          label: 'Usage',          icon: Zap },
      { to: '/ai/costs',          label: 'Costs',          icon: DollarSign },
      { to: '/ai/health',         label: 'Health',         icon: Activity },
      { to: '/ai/prompts',        label: 'Prompts',        icon: Sparkles },
      { to: '/ai/features',       label: 'Features',       icon: ToggleRight },
      { to: '/ai/conversations',  label: 'Conversations',  icon: MessageSquare },
      { to: '/ai/diagnostics',    label: 'Diagnostics',    icon: Gauge },
    ],
  },
  {
    type: 'group',
    label: 'Settings',
    groupIcon: Settings,
    requiredRoles: ['owner', 'admin'],
    items: [
      { to: '/settings',                        label: 'General',          icon: Settings },
      { to: '/settings/notification-settings',  label: 'Notifications',    icon: BellRing },
      { to: '/settings/email-templates',        label: 'Email Templates',  icon: Mail },
      { to: '/settings/email-analytics',        label: 'Email Analytics',  icon: LineChart },
      { to: '/announcements',                   label: 'Announcements',    icon: Megaphone },
      { to: '/settings/reminder-rules',         label: 'Reminder Rules',   icon: Bell },
      { to: '/settings/escalation-rules',       label: 'Escalation Rules', icon: Siren },
    ],
  },
];

const canAccess = (requiredRoles, role) =>
  !requiredRoles || requiredRoles.includes(role);

function isGroupActive(group, pathname) {
  return group.items.some((item) => pathname.startsWith(item.to));
}

function NavGroup({ group, onNavigate, role }) {
  const location = useLocation();
  const visibleItems = group.items.filter((item) => canAccess(item.requiredRoles, role));
  const active = visibleItems.some((item) => location.pathname.startsWith(item.to));
  const [open, setOpen] = useState(active);
  const GroupIcon = group.groupIcon;

  // Auto-open group when navigating to one of its routes
  useEffect(() => { if (active) setOpen(true); }, [active]);
  const iconStyle = GROUP_ICON_STYLES[group.label] || 'bg-blue-50 text-blue-600';

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-tetri-bg transition-colors group"
      >
        <span className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${iconStyle}`}>
          <GroupIcon size={13} />
        </span>
        <span className="flex-1 text-left text-xs font-semibold uppercase tracking-wider text-tetri-neutral group-hover:text-tetri-text transition-colors">
          {group.label}
        </span>
        {open
          ? <ChevronDown className="w-3 h-3 text-tetri-neutral" />
          : <ChevronRight className="w-3 h-3 text-tetri-neutral" />
        }
      </button>
      {open && (
        <div className="mt-0.5 mb-1 space-y-0.5">
          {visibleItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onNavigate}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm font-medium ml-2 transition-colors ${
                  isActive
                    ? 'bg-[#eff4ff] text-tetri-blue'
                    : 'text-tetri-muted hover:bg-tetri-bg hover:text-tetri-text'
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" size={15} />
              {label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AppLayout({ user, workspace, allWorkspaces = [], onSwitchWorkspace }) {
  const { signOut } = useClerk();
  const [sidebarOpen,      setSidebarOpen]      = useState(false);
  const [userMenuOpen,     setUserMenuOpen]      = useState(false);
  const [wsSwitcherOpen,   setWsSwitcherOpen]    = useState(false);
  const hasMultipleWs = allWorkspaces.length > 1;

  const handleSignOut = () => signOut({ redirectUrl: '/sign-in' });
  const closeSidebar = () => setSidebarOpen(false);
  const role = workspace?.role || 'user';

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 pt-6 pb-5 border-b border-tetri-border">
        <img
          src="/logo.svg"
          alt="Tetri Copilot"
          className="max-w-[160px] w-full h-auto object-contain"
          draggable={false}
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_CONFIG.filter((entry) => canAccess(entry.requiredRoles, role)).map((entry) => {
          if (entry.type === 'item') {
            const Icon = entry.icon;
            return (
              <NavLink
                key={entry.to}
                to={entry.to}
                onClick={closeSidebar}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#eff4ff] text-tetri-blue'
                      : 'text-tetri-muted hover:bg-tetri-bg hover:text-tetri-text'
                  }`
                }
              >
                <Icon size={18} className="flex-shrink-0" />
                {entry.label}
              </NavLink>
            );
          }
          return (
            <NavGroup key={entry.label} group={entry} onNavigate={closeSidebar} role={role} />
          );
        })}
      </nav>

      {/* Workspace + User block */}
      <div className="px-3 pb-4 border-t border-tetri-border pt-4 space-y-2">
        <div className="flex items-center justify-between px-1 pb-1">
          <NotificationBell />
        </div>
        <div className="relative">
          <button
            onClick={() => hasMultipleWs && setWsSwitcherOpen((v) => !v)}
            className={`w-full px-3 py-2 rounded-xl bg-tetri-bg text-left transition-colors ${hasMultipleWs ? 'hover:bg-slate-100 cursor-pointer' : 'cursor-default'}`}
          >
            <p className="text-xs text-tetri-neutral font-medium truncate">Workspace</p>
            <div className="flex items-center justify-between mt-0.5">
              <p className="text-sm font-semibold text-tetri-text truncate">{workspace?.name || '—'}</p>
              {hasMultipleWs && <ChevronDown className="w-3.5 h-3.5 text-tetri-muted flex-shrink-0 ml-1" />}
            </div>
          </button>

          {wsSwitcherOpen && hasMultipleWs && (
            <div className="absolute bottom-full left-0 right-0 mb-1 bg-tetri-surface border border-tetri-border rounded-xl shadow-lg py-1 z-50 max-h-60 overflow-y-auto">
              {allWorkspaces.map((ws) => (
                <button
                  key={ws.id}
                  onClick={() => { setWsSwitcherOpen(false); if (onSwitchWorkspace) onSwitchWorkspace(ws); }}
                  className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors hover:bg-tetri-bg ${ws.id === workspace?.id ? 'text-tetri-blue font-semibold' : 'text-tetri-muted hover:text-tetri-text'}`}
                >
                  <Building2 className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{ws.name}</span>
                  {ws.id === workspace?.id && <CheckCircle className="w-3.5 h-3.5 ml-auto flex-shrink-0" />}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setUserMenuOpen((v) => !v)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-tetri-muted hover:bg-tetri-bg hover:text-tetri-text transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-[#eff4ff] flex items-center justify-center flex-shrink-0">
              <span className="text-tetri-blue text-xs font-bold">
                {(user?.fullName || user?.email || '?')[0].toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-xs font-semibold text-tetri-text truncate">
                {user?.fullName || user?.email}
              </p>
              <p className="text-xs text-tetri-neutral truncate">{user?.email}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 flex-shrink-0" />
          </button>

          {userMenuOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-1 bg-tetri-surface border border-tetri-border rounded-xl shadow-lg py-1 z-50">
              <button
                onClick={() => { setUserMenuOpen(false); window.location.href = '/settings/notifications'; }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-tetri-muted hover:bg-tetri-bg hover:text-tetri-text transition-colors"
              >
                <BellRing className="w-4 h-4" />
                Notification Preferences
              </button>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-tetri-muted hover:bg-tetri-bg hover:text-tetri-error transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-tetri-bg overflow-hidden">
      <AssistantWidget />
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-56 md:flex-col bg-tetri-surface border-r border-tetri-border flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="fixed inset-0 bg-black/30" onClick={closeSidebar} />
          <aside className="relative flex flex-col w-64 bg-tetri-surface border-r border-tetri-border z-50">
            <div className="absolute top-4 right-3">
              <button onClick={closeSidebar} className="p-1.5 rounded-lg text-tetri-neutral hover:bg-tetri-bg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="md:hidden bg-tetri-surface border-b border-tetri-border h-14 flex items-center px-4 gap-3 flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="p-1.5 rounded-lg text-tetri-neutral hover:bg-tetri-bg">
            <Menu className="w-5 h-5" />
          </button>
          <img src="/logo.svg" alt="Tetri Copilot" className="max-w-[140px] w-full h-auto object-contain" draggable={false} />
          <div className="ml-auto"><NotificationBell /></div>
        </header>
        <main className="flex-1 overflow-y-auto py-6 px-6 md:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
