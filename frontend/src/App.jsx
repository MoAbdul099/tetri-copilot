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
import OverviewPage from './features/billing/pages/OverviewPage.jsx';
import CustomersPage from './features/customers/pages/CustomersPage.jsx';
import CreateCustomerPage from './features/customers/pages/CreateCustomerPage.jsx';
import EditCustomerPage from './features/customers/pages/EditCustomerPage.jsx';
import CustomerDetailPage from './features/customers/pages/CustomerDetailPage.jsx';
import InvoicesPage from './features/invoices/pages/InvoicesPage.jsx';
import CreateInvoicePage from './features/invoices/pages/CreateInvoicePage.jsx';
import EditInvoicePage from './features/invoices/pages/EditInvoicePage.jsx';
import InvoiceDetailPage from './features/invoices/pages/InvoiceDetailPage.jsx';
import PaymentsPage from './features/payments/pages/PaymentsPage.jsx';
import CreatePaymentPage from './features/payments/pages/CreatePaymentPage.jsx';
import PaymentDetailPage from './features/payments/pages/PaymentDetailPage.jsx';
import EditPaymentPage from './features/payments/pages/EditPaymentPage.jsx';
import ReceivablesPage from './features/receivables/pages/ReceivablesPage.jsx';
import AgingPage from './features/receivables/pages/AgingPage.jsx';
import CustomerReceivablePage from './features/receivables/pages/CustomerReceivablePage.jsx';
import CustomerReceivablesListPage from './features/receivables/pages/CustomerReceivablesListPage.jsx';
import CollectionsPage from './features/receivables/pages/CollectionsPage.jsx';
import StatementsPage from './features/receivables/pages/StatementsPage.jsx';

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
          <Route path="/billing" element={<OverviewPage />} />
          <Route path="/billing/plans" element={<PlansPage />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/customers/new" element={<CreateCustomerPage />} />
          <Route path="/customers/:id" element={<CustomerDetailPage />} />
          <Route path="/customers/:id/edit" element={<EditCustomerPage />} />
          <Route path="/invoices" element={<InvoicesPage />} />
          <Route path="/invoices/new" element={<CreateInvoicePage />} />
          <Route path="/invoices/:id" element={<InvoiceDetailPage />} />
          <Route path="/invoices/:id/edit" element={<EditInvoicePage />} />
          <Route path="/payments" element={<PaymentsPage />} />
          <Route path="/payments/new" element={<CreatePaymentPage />} />
          <Route path="/payments/:id" element={<PaymentDetailPage />} />
          <Route path="/payments/:id/edit" element={<EditPaymentPage />} />
          <Route path="/receivables" element={<ReceivablesPage />} />
          <Route path="/receivables/aging" element={<AgingPage />} />
          <Route path="/receivables/customers" element={<CustomerReceivablesListPage />} />
          <Route path="/receivables/customers/:id" element={<CustomerReceivablePage />} />
          <Route path="/collections" element={<CollectionsPage />} />
          <Route path="/statements" element={<StatementsPage />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
