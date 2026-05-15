import { useEffect, useState } from 'react';
import { useClerk } from '@clerk/clerk-react';
import { LogOut, Building2, User, ShieldCheck } from 'lucide-react';
import authService from '../../auth/services/authService.js';
import LoadingSpinner from '../../../components/ui/LoadingSpinner.jsx';

const ROLE_LABELS = {
  owner: 'Owner',
  user: 'User',
  viewer: 'Viewer',
  admin: 'Admin',
};

export default function DashboardPage() {
  const { signOut } = useClerk();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authService
      .getMe()
      .then((data) => setProfile(data))
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading dashboard…" />;
  }

  const { user, workspace } = profile || {};

  return (
    <div className="min-h-screen bg-tetri-bg">
      {/* Header */}
      <header className="bg-tetri-surface border-b border-tetri-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <img
            src="/logo.svg"
            alt="Tetri Copilot"
            className="h-7 w-auto"
            draggable={false}
          />
          <button
            onClick={() => signOut({ redirectUrl: '/sign-in' })}
            className="inline-flex items-center gap-1.5 text-sm text-tetri-neutral hover:text-tetri-muted transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-2xl font-bold text-tetri-text mb-1">
          Welcome back{user?.fullName ? `, ${user.fullName.split(' ')[0]}` : ''}!
        </h1>
        <p className="text-tetri-muted text-sm mb-8">
          Your workspace is set up and ready to go.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {/* User card */}
          <div className="bg-tetri-surface rounded-card border border-tetri-border p-5 flex items-start gap-4">
            <div className="w-10 h-10 bg-[#eff4ff] rounded-xl flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-tetri-blue" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-tetri-neutral uppercase tracking-wide font-medium">Account</p>
              <p className="text-sm font-semibold text-tetri-text mt-0.5 truncate">
                {user?.fullName || '—'}
              </p>
              <p className="text-xs text-tetri-muted truncate">{user?.email}</p>
            </div>
          </div>

          {/* Workspace card */}
          <div className="bg-tetri-surface rounded-card border border-tetri-border p-5 flex items-start gap-4">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-tetri-neutral uppercase tracking-wide font-medium">Workspace</p>
              <p className="text-sm font-semibold text-tetri-text mt-0.5 truncate">
                {workspace?.name || '—'}
              </p>
              <p className="text-xs text-tetri-muted">Active</p>
            </div>
          </div>

          {/* Role card */}
          <div className="bg-tetri-surface rounded-card border border-tetri-border p-5 flex items-start gap-4">
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5 text-amber-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-tetri-neutral uppercase tracking-wide font-medium">Role</p>
              <p className="text-sm font-semibold text-tetri-text mt-0.5">
                {ROLE_LABELS[workspace?.role] || workspace?.role || '—'}
              </p>
              <p className="text-xs text-tetri-muted">Workspace permissions</p>
            </div>
          </div>
        </div>

        {/* Coming soon */}
        <div className="bg-tetri-surface rounded-card border border-dashed border-tetri-border p-10 text-center">
          <p className="text-tetri-neutral text-sm font-medium">Dashboard coming in Sprint 3</p>
          <p className="text-tetri-border text-xs mt-1">
            Invoices, expenses, AI assistant, and more on the way.
          </p>
        </div>
      </main>
    </div>
  );
}
