import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { setClerkTokenGetter } from './lib/api.js';
import ProtectedLayout from './components/layout/ProtectedLayout.jsx';
import SignInPage from './features/auth/pages/SignInPage.jsx';
import SignUpPage from './features/auth/pages/SignUpPage.jsx';
import OnboardingPage from './features/onboarding/pages/OnboardingPage.jsx';
import WorkspaceSetupPage from './features/workspace/pages/WorkspaceSetupPage.jsx';
import DashboardPage from './features/dashboard/pages/DashboardPage.jsx';
import SettingsPage from './features/settings/pages/SettingsPage.jsx';

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

        {/* Protected routes */}
        <Route element={<ProtectedLayout />}>
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/setup" element={<WorkspaceSetupPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
