import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { setClerkTokenGetter } from './lib/api.js';
import ProtectedLayout from './components/layout/ProtectedLayout.jsx';
import SignInPage from './features/auth/pages/SignInPage.jsx';
import SignUpPage from './features/auth/pages/SignUpPage.jsx';
import AcceptInvitationPage from './features/auth/pages/AcceptInvitationPage.jsx';
import OnboardingPage from './features/onboarding/pages/OnboardingPage.jsx';
import WorkspaceSetupPage from './features/workspace/pages/WorkspaceSetupPage.jsx';
import DashboardPage from './features/dashboard/pages/DashboardPage.jsx';
import SettingsPage from './features/settings/pages/SettingsPage.jsx';
import MembersPage from './features/members/pages/MembersPage.jsx';
import PlansPage from './features/billing/pages/PlansPage.jsx';

function ClerkApiSync() {
  const { getToken } = useAuth();
  useEffect(() => {
    setClerkTokenGetter(getToken);
  }, [getToken]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ClerkApiSync />
      <Routes>
        {/* Public auth routes */}
        <Route path="/sign-in/*" element={<SignInPage />} />
        <Route path="/sign-up/*" element={<SignUpPage />} />
        <Route path="/invite" element={<AcceptInvitationPage />} />

        {/* Protected routes */}
        <Route element={<ProtectedLayout />}>
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/setup" element={<WorkspaceSetupPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/members" element={<MembersPage />} />
          <Route path="/billing/plans" element={<PlansPage />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
