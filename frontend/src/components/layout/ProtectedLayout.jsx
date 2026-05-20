import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import authService from '../../features/auth/services/authService.js';
import { setClerkTokenGetter } from '../../lib/api.js';
import LoadingSpinner from '../ui/LoadingSpinner.jsx';
import AppLayout from './AppLayout.jsx';

const APP_LAYOUT_PATHS = ['/dashboard', '/settings', '/members', '/billing', '/customers', '/invoices'];

export default function ProtectedLayout() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const location = useLocation();
  const [state, setState] = useState({ loading: true, profile: undefined, error: null });

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      setState({ loading: false, profile: null, error: null });
      return;
    }

    setClerkTokenGetter(getToken);

    authService
      .getMe()
      .then((data) => setState({ loading: false, profile: data, error: null }))
      .catch((err) => {
        const msg = err?.response?.data?.error || err.message || 'Failed to load profile';
        setState({ loading: false, profile: null, error: msg });
      });
  }, [isLoaded, isSignedIn, getToken]);

  if (!isLoaded || state.loading) {
    return <LoadingSpinner message="Loading your workspace…" />;
  }

  if (!isSignedIn) {
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  if (state.error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-tetri-bg px-4">
        <div className="bg-tetri-surface border border-tetri-error/20 rounded-card p-6 max-w-md w-full text-center">
          <p className="text-tetri-error font-semibold">Something went wrong</p>
          <p className="text-tetri-muted text-sm mt-1">{state.error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-tetri-blue text-white text-sm font-medium rounded-btn hover:bg-tetri-blue-hover transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { user, workspace } = state.profile || {};
  const isOnboarding = location.pathname === '/onboarding';
  const isSetup = location.pathname === '/setup';

  // No workspace → onboarding
  if (!workspace && !isOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }
  if (workspace && isOnboarding) {
    return <Navigate to={workspace.setupComplete ? '/dashboard' : '/setup'} replace />;
  }

  // Has workspace but setup not complete → setup wizard
  if (workspace && !workspace.setupComplete && !isSetup) {
    return <Navigate to="/setup" replace />;
  }

  // Use AppLayout for main app pages (dashboard, settings)
  const useAppLayout = APP_LAYOUT_PATHS.some((p) => location.pathname.startsWith(p));
  if (useAppLayout) {
    return <AppLayout user={user} workspace={workspace} />;
  }

  return <Outlet />;
}
