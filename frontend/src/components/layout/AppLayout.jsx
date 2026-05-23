import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useClerk } from '@clerk/clerk-react';
import {
  LayoutDashboard, Settings, Users, Users2, CreditCard, FileText,
  LogOut, Menu, X, ChevronDown, ChevronRight,
  TrendingUp, Activity, Receipt, ShoppingCart, CheckSquare,
  Wallet, Brain, Target, RefreshCw, FolderOpen,
  Landmark, HardDrive, ShieldCheck,
} from 'lucide-react';

// Group icon color classes per group
const GROUP_ICON_STYLES = {
  Sales:           'bg-blue-50 text-blue-600',
  Finance:         'bg-indigo-50 text-indigo-600',
  Expenses:        'bg-orange-50 text-orange-600',
  Storage:         'bg-teal-50 text-teal-600',
  Administration:  'bg-slate-100 text-slate-600',
};

const NAV_CONFIG = [
  {
    type: 'item',
    to: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    type: 'group',
    label: 'Sales',
    groupIcon: Users2,
    items: [
      { to: '/customers', label: 'Customers', icon: Users2 },
    ],
  },
  {
    type: 'group',
    label: 'Finance',
    groupIcon: Landmark,
    items: [
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
    label: 'Storage',
    groupIcon: HardDrive,
    items: [
      { to: '/files', label: 'Files', icon: FolderOpen },
    ],
  },
  {
    type: 'group',
    label: 'Administration',
    groupIcon: ShieldCheck,
    items: [
      { to: '/members',  label: 'Members',  icon: Users },
      { to: '/billing',  label: 'Billing',  icon: CreditCard },
      { to: '/settings', label: 'Settings', icon: Settings },
    ],
  },
];

function isGroupActive(group, pathname) {
  return group.items.some((item) => pathname.startsWith(item.to));
}

function NavGroup({ group, onNavigate }) {
  const location = useLocation();
  const active = isGroupActive(group, location.pathname);
  const [open, setOpen] = useState(active);
  const GroupIcon = group.groupIcon;
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
          {group.items.map(({ to, label, icon: Icon }) => (
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

export default function AppLayout({ user, workspace }) {
  const { signOut } = useClerk();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleSignOut = () => signOut({ redirectUrl: '/sign-in' });
  const closeSidebar = () => setSidebarOpen(false);

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
        {NAV_CONFIG.map((entry) => {
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
            <NavGroup key={entry.label} group={entry} onNavigate={closeSidebar} />
          );
        })}
      </nav>

      {/* Workspace + User block */}
      <div className="px-3 pb-4 border-t border-tetri-border pt-4 space-y-2">
        <div className="px-3 py-2 rounded-xl bg-tetri-bg">
          <p className="text-xs text-tetri-neutral font-medium truncate">Workspace</p>
          <p className="text-sm font-semibold text-tetri-text truncate mt-0.5">
            {workspace?.name || '—'}
          </p>
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
        </header>
        <main className="flex-1 overflow-y-auto py-6 px-6 md:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
