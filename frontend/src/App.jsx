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
import ExpensesPage from './features/expenses/pages/ExpensesPage.jsx';
import ExpenseFormPage from './features/expenses/pages/ExpenseFormPage.jsx';
import ExpenseDetailPage from './features/expenses/pages/ExpenseDetailPage.jsx';
import ExpenseCategoriesPage from './features/expenses/pages/ExpenseCategoriesPage.jsx';
import SuppliersPage from './features/expenses/pages/SuppliersPage.jsx';
import ApprovalsPage from './features/approvals/pages/ApprovalsPage.jsx';
import ApprovalDetailPage from './features/approvals/pages/ApprovalDetailPage.jsx';
import WorkflowConfigPage from './features/approvals/pages/WorkflowConfigPage.jsx';
import ReimbursementsPage from './features/reimbursements/pages/ReimbursementsPage.jsx';
import ReimbursementDetailPage from './features/reimbursements/pages/ReimbursementDetailPage.jsx';
import ExpenseInsightsDashboardPage from './features/expense-insights/pages/ExpenseInsightsDashboardPage.jsx';
import BudgetsPage from './features/budgets/pages/BudgetsPage.jsx';
import RecurringExpensesPage from './features/recurring-expenses/pages/RecurringExpensesPage.jsx';
import FilesRepositoryPage from './features/files/pages/FilesRepositoryPage.jsx';
import CompliancePage from './features/compliance/pages/CompliancePage.jsx';
import TemplatesPage from './features/compliance/pages/TemplatesPage.jsx';
import TemplateFormPage from './features/compliance/pages/TemplateFormPage.jsx';
import TemplateDetailPage from './features/compliance/pages/TemplateDetailPage.jsx';
import OccurrencesPage from './features/compliance/pages/OccurrencesPage.jsx';
import OccurrenceDetailPage from './features/compliance/pages/OccurrenceDetailPage.jsx';
import CalendarPage from './features/compliance/pages/CalendarPage.jsx';
import CategoriesPage from './features/compliance/pages/CategoriesPage.jsx';
import PacksPage from './features/compliance/pages/PacksPage.jsx';

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
          <Route path="/expenses" element={<ExpensesPage />} />
          <Route path="/expenses/new" element={<ExpenseFormPage />} />
          <Route path="/expenses/categories" element={<ExpenseCategoriesPage />} />
          <Route path="/expenses/suppliers" element={<SuppliersPage />} />
          <Route path="/expenses/:id" element={<ExpenseDetailPage />} />
          <Route path="/expenses/:id/edit" element={<ExpenseFormPage />} />
          <Route path="/approvals" element={<ApprovalsPage />} />
          <Route path="/approvals/config" element={<WorkflowConfigPage />} />
          <Route path="/approvals/:id" element={<ApprovalDetailPage />} />
          <Route path="/reimbursements" element={<ReimbursementsPage />} />
          <Route path="/reimbursements/:id" element={<ReimbursementDetailPage />} />
          <Route path="/expense-insights" element={<ExpenseInsightsDashboardPage />} />
          <Route path="/budgets" element={<BudgetsPage />} />
          <Route path="/recurring-expenses" element={<RecurringExpensesPage />} />
          <Route path="/files" element={<FilesRepositoryPage />} />
          <Route path="/compliance" element={<CompliancePage />} />
          <Route path="/compliance/templates" element={<TemplatesPage />} />
          <Route path="/compliance/templates/new" element={<TemplateFormPage />} />
          <Route path="/compliance/templates/:id" element={<TemplateDetailPage />} />
          <Route path="/compliance/templates/:id/edit" element={<TemplateFormPage />} />
          <Route path="/compliance/occurrences" element={<OccurrencesPage />} />
          <Route path="/compliance/occurrences/:id" element={<OccurrenceDetailPage />} />
          <Route path="/compliance/calendar" element={<CalendarPage />} />
          <Route path="/compliance/categories" element={<CategoriesPage />} />
          <Route path="/compliance/packs" element={<PacksPage />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
