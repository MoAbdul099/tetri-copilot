import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import RequireAdmin from './components/RequireAdmin';
import AdminLayout from './components/AdminLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import StubPage from './pages/StubPage';

function Protected() {
  return (
    <RequireAdmin>
      <AdminLayout />
    </RequireAdmin>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<Protected />}>
            <Route path="/"                       element={<DashboardPage />} />
            <Route path="/organizations"           element={<StubPage title="Organizations" />} />
            <Route path="/users"                   element={<StubPage title="Users" />} />
            <Route path="/plans"                   element={<StubPage title="Plans & Subscriptions" />} />
            <Route path="/countries"               element={<StubPage title="Country Profiles" />} />
            <Route path="/localization"            element={<StubPage title="Languages & Currencies" />} />
            <Route path="/compliance-templates"    element={<StubPage title="Compliance Templates" />} />
            <Route path="/ai-usage"                element={<StubPage title="AI Usage" />} />
            <Route path="/document-templates"      element={<StubPage title="Document Templates" />} />
            <Route path="/billing-events"          element={<StubPage title="Billing Events" />} />
            <Route path="/activity-logs"           element={<StubPage title="Activity Logs" />} />
            <Route path="/announcements"           element={<StubPage title="Announcements" />} />
            <Route path="/security"                element={<StubPage title="Security" />} />
            <Route path="/settings"                element={<StubPage title="System Settings" />} />
            <Route path="*"                        element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
