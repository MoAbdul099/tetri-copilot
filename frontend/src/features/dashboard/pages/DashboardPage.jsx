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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <span className="font-bold text-gray-900">Tetri Copilot</span>
          <button
            onClick={() => signOut({ redirectUrl: '/sign-in' })}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Welcome back{user?.fullName ? `, ${user.fullName.split(' ')[0]}` : ''}!
        </h1>
        <p className="text-gray-500 text-sm mb-8">
          Your workspace is set up and ready to go.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {/* User card */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-start gap-4">
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Account</p>
              <p className="text-sm font-semibold text-gray-900 mt-0.5 truncate">
                {user?.fullName || '—'}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>

          {/* Workspace card */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-start gap-4">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Workspace</p>
              <p className="text-sm font-semibold text-gray-900 mt-0.5 truncate">
                {workspace?.name || '—'}
              </p>
              <p className="text-xs text-gray-500">Active</p>
            </div>
          </div>

          {/* Role card */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-start gap-4">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5 text-amber-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Role</p>
              <p className="text-sm font-semibold text-gray-900 mt-0.5">
                {ROLE_LABELS[workspace?.role] || workspace?.role || '—'}
              </p>
              <p className="text-xs text-gray-500">Workspace permissions</p>
            </div>
          </div>
        </div>

        {/* Coming soon */}
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-10 text-center">
          <p className="text-gray-400 text-sm font-medium">Dashboard coming in Sprint 3</p>
          <p className="text-gray-300 text-xs mt-1">
            Invoices, expenses, AI assistant, and more on the way.
          </p>
        </div>
      </main>
    </div>
  );
}
