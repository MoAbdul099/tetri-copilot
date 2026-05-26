import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import authService from '../../features/auth/services/authService.js';
import { setClerkTokenGetter } from '../../lib/api.js';
import { getActiveWorkspaceId, setActiveWorkspaceId } from '../../lib/workspace.js';
import LoadingSpinner from '../ui/LoadingSpinner.jsx';
import AppLayout from './AppLayout.jsx';
import WorkspacePickerPage from '../../features/workspaces/pages/WorkspacePickerPage.jsx';

const APP_LAYOUT_PATHS = ['/dashboard', '/settings', '/members', '/billing', '/customers', '/invoices', '/payments', '/receivables', '/collections', '/statements', '/expenses', '/approvals', '/reimbursements', '/expense-insights', '/budgets', '/recurring-expenses', '/files', '/compliance', '/notifications', '/announcements', '/reports', '/analytics', '/activity', '/audit', '/security', '/system', '/ai'];

export default function ProtectedLayout() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const location = useLocation();
  const [state, setState] = useState({ loading: true, profile: undefined, error: null });
  // activeWorkspace is the resolved workspace for this session
  const [activeWorkspace, setActiveWorkspace] = useState(null);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) { setState({ loading: false, profile: null, error: null }); return; }

    setClerkTokenGetter(getToken);

    authService
      .getMe()
      .then((data) => {
        setState({ loading: false, profile: data, error: null });

        const workspaces = data.workspaces || (data.workspace ? [data.workspace] : []);

        if (workspaces.length === 0) return; // → onboarding

        // Auto-resolve active workspace from localStorage or first membership
        const storedId = getActiveWorkspaceId();
        const match    = workspaces.find((w) => w.id === storedId);
        const resolved = match || workspaces[0];

        // If only one workspace, always pin it
        if (workspaces.length === 1) {
          setActiveWorkspaceId(resolved.id);
          setActiveWorkspace(resolved);
        } else if (match) {
          // Stored ID is valid — use it
          setActiveWorkspace(resolved);
        }
        // else: multiple workspaces, no valid stored ID → show picker (activeWorkspace stays null)
      })
      .catch((err) => {
        const msg = err?.response?.data?.error || err.message || 'Failed to load profile';
        setState({ loading: false, profile: null, error: msg });
      });
  }, [isLoaded, isSignedIn, getToken]);

  if (!isLoaded || state.loading) return <LoadingSpinner message="Loading your workspace…" />;

  if (!isSignedIn) return <Navigate to="/sign-in" state={{ from: location }} replace />;

  if (state.error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-tetri-bg px-4">
        <div className="bg-tetri-surface border border-tetri-error/20 rounded-card p-6 max-w-md w-full text-center">
          <p className="text-tetri-error font-semibold">Something went wrong</p>
          <p className="text-tetri-muted text-sm mt-1">{state.error}</p>
          <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-tetri-blue text-white text-sm font-medium rounded-btn hover:bg-tetri-blue-hover transition-colors">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { user } = state.profile || {};
  const workspaces = state.profile?.workspaces || (state.profile?.workspace ? [state.profile.workspace] : []);

  const isOnboarding = location.pathname === '/onboarding';
  const isSetup      = location.pathname === '/setup';

  // No workspace memberships → onboarding
  if (workspaces.length === 0 && !isOnboarding) return <Navigate to="/onboarding" replace />;
  if (workspaces.length > 0 && isOnboarding) {
    const ws = activeWorkspace || workspaces[0];
    return <Navigate to={ws.setupComplete ? '/dashboard' : '/setup'} replace />;
  }

  // Multiple workspaces, none selected yet → show picker
  if (workspaces.length > 1 && !activeWorkspace) {
    return (
      <WorkspacePickerPage
        workspaces={workspaces}
        onSelect={(ws) => {
          setActiveWorkspace(ws);
          // If setup incomplete redirect there, otherwise dashboard
          if (!ws.setupComplete) window.location.href = '/setup';
          else window.location.href = '/dashboard';
        }}
      />
    );
  }

  const workspace = activeWorkspace || workspaces[0] || null;

  // Setup not complete → setup wizard
  if (workspace && !workspace.setupComplete && !isSetup) return <Navigate to="/setup" replace />;

  const useAppLayout = APP_LAYOUT_PATHS.some((p) => location.pathname.startsWith(p));
  if (useAppLayout) {
    return (
      <AppLayout
        user={user}
        workspace={workspace}
        allWorkspaces={workspaces}
        onSwitchWorkspace={(ws) => {
          setActiveWorkspaceId(ws.id);
          setActiveWorkspace(ws);
          window.location.href = '/dashboard';
        }}
      />
    );
  }

  return <Outlet />;
}
