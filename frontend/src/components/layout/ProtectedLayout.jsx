import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import authService from '../../features/auth/services/authService.js';
import { setClerkTokenGetter } from '../../lib/api.js';
import LoadingSpinner from '../ui/LoadingSpinner.jsx';

export default function ProtectedLayout() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const location = useLocation();
  const [state, setState] = useState({ loading: true, workspace: undefined, error: null });

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      setState({ loading: false, workspace: null, error: null });
      return;
    }

    // Register the token getter before making any API call.
    // ProtectedLayout's effect runs before ClerkApiSync's effect (child effects
    // fire before parent effects in React), so clerkTokenGetter may still be null
    // at this point. Setting it here guarantees the Authorization header is
    // attached to the getMe() request below.
    setClerkTokenGetter(getToken);

    authService
      .getMe()
      .then((data) => setState({ loading: false, workspace: data.workspace, error: null }))
      .catch((err) => {
        const msg = err?.response?.data?.error || err.message || 'Failed to load profile';
        setState({ loading: false, workspace: null, error: msg });
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white border border-red-200 rounded-lg p-6 max-w-md w-full text-center">
          <p className="text-red-600 font-medium">Something went wrong</p>
          <p className="text-gray-500 text-sm mt-1">{state.error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const isOnboarding = location.pathname === '/onboarding';

  if (!state.workspace && !isOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  if (state.workspace && isOnboarding) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
