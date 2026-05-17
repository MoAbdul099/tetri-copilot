import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Building2, ShieldCheck, ArrowRight, Settings } from 'lucide-react';
import authService from '../../auth/services/authService.js';
import LoadingSpinner from '../../../components/ui/LoadingSpinner.jsx';
import PageHeader from '../../../components/shared/PageHeader.jsx';

const ROLE_LABELS = {
  owner: 'Owner',
  user: 'User',
  viewer: 'Viewer',
  admin: 'Admin',
};

export default function DashboardPage() {
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
    <div className="px-4 sm:px-8 py-8 max-w-5xl mx-auto">
      <PageHeader
        title={`Welcome back${user?.fullName ? `, ${user.fullName.split(' ')[0]}` : ''}`}
        subtitle="Your workspace is ready. Here's an overview."
      />

      {/* Info cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-card border border-tetri-border p-5 flex items-start gap-4">
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

        <div className="bg-white rounded-card border border-tetri-border p-5 flex items-start gap-4">
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

        <div className="bg-white rounded-card border border-tetri-border p-5 flex items-start gap-4">
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

      {/* Quick actions */}
      {workspace?.role === 'owner' && (
        <div className="mb-8">
          <p className="text-sm font-semibold text-tetri-text mb-3">Quick actions</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              to="/settings"
              className="flex items-center justify-between gap-3 px-5 py-4 bg-white rounded-card border border-tetri-border hover:border-tetri-blue/30 hover:bg-[#fafcff] transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[#eff4ff] rounded-xl flex items-center justify-center flex-shrink-0">
                  <Settings className="w-4.5 h-4.5 text-tetri-blue" size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-tetri-text">Workspace settings</p>
                  <p className="text-xs text-tetri-muted">Company profile, team, localization</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-tetri-neutral group-hover:text-tetri-blue transition-colors" />
            </Link>
          </div>
        </div>
      )}

      {/* Coming soon placeholder */}
      <div className="bg-white rounded-card border border-dashed border-tetri-border p-10 text-center">
        <p className="text-tetri-neutral text-sm font-medium">Dashboard coming in Sprint 3</p>
        <p className="text-tetri-border text-xs mt-1">
          Invoices, expenses, AI assistant, and more on the way.
        </p>
      </div>
    </div>
  );
}
