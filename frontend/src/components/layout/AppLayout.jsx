import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useClerk } from '@clerk/clerk-react';
import {
  LayoutDashboard,
  Settings,
  Users,
  CreditCard,
  LogOut,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/members', label: 'Members', icon: Users },
  { to: '/billing', label: 'Billing', icon: CreditCard },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function AppLayout({ user, workspace }) {
  const { signOut } = useClerk();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleSignOut = () => signOut({ redirectUrl: '/sign-in' });

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
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[#eff4ff] text-tetri-blue'
                  : 'text-tetri-muted hover:bg-tetri-bg hover:text-tetri-text'
              }`
            }
          >
            <Icon className="w-4.5 h-4.5 flex-shrink-0" size={18} />
            {label}
          </NavLink>
        ))}
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
      <aside className="hidden md:flex md:w-60 md:flex-col bg-tetri-surface border-r border-tetri-border flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/30"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative flex flex-col w-64 bg-tetri-surface border-r border-tetri-border z-50">
            <div className="absolute top-4 right-3">
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 rounded-lg text-tetri-neutral hover:bg-tetri-bg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <header className="md:hidden bg-tetri-surface border-b border-tetri-border h-14 flex items-center px-4 gap-3 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-lg text-tetri-neutral hover:bg-tetri-bg"
          >
            <Menu className="w-5 h-5" />
          </button>
          <img src="/logo.svg" alt="Tetri Copilot" className="max-w-[140px] w-full h-auto object-contain" draggable={false} />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
