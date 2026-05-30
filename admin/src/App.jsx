import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import RequireAdmin from './components/RequireAdmin';
import AdminLayout from './components/AdminLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import WorkspacesPage from './pages/WorkspacesPage';
import WorkspaceDetailPage from './pages/WorkspaceDetailPage';
import UsersPage from './pages/UsersPage';
import UserDetailPage from './pages/UserDetailPage';
import PlansPage from './pages/PlansPage';
import SubscriptionDetailPage from './pages/SubscriptionDetailPage';
import CountriesPage from './pages/CountriesPage';
import CountryDetailPage from './pages/CountryDetailPage';
import LocalizationPage from './pages/LocalizationPage';
import CompliancePage from './pages/CompliancePage';
import AIUsagePage from './pages/AIUsagePage';
import DocumentTemplatesPage from './pages/DocumentTemplatesPage';
import BillingEventsPage from './pages/BillingEventsPage';
import ActivityLogsPage from './pages/ActivityLogsPage';
import SystemSettingsPage from './pages/SystemSettingsPage';
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
            <Route path="/organizations"           element={<WorkspacesPage />} />
            <Route path="/organizations/:id"       element={<WorkspaceDetailPage />} />
            <Route path="/users"                   element={<UsersPage />} />
            <Route path="/users/:id"               element={<UserDetailPage />} />
            <Route path="/plans"                   element={<PlansPage />} />
            <Route path="/subscriptions/:id"       element={<SubscriptionDetailPage />} />
            <Route path="/countries"               element={<CountriesPage />} />
            <Route path="/countries/:id"           element={<CountryDetailPage />} />
            <Route path="/localization"            element={<LocalizationPage />} />
            <Route path="/compliance-templates"    element={<CompliancePage />} />
            <Route path="/ai-usage"                element={<AIUsagePage />} />
            <Route path="/document-templates"      element={<DocumentTemplatesPage />} />
            <Route path="/billing-events"          element={<BillingEventsPage />} />
            <Route path="/activity-logs"           element={<ActivityLogsPage />} />
            <Route path="/announcements"           element={<StubPage title="Announcements" />} />
            <Route path="/security"                element={<StubPage title="Security" />} />
            <Route path="/settings"                element={<SystemSettingsPage />} />
            <Route path="*"                        element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
