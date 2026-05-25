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
import NotificationCenterPage from './features/notifications/pages/NotificationCenterPage.jsx';
import NotificationPreferencesPage from './features/notifications/pages/NotificationPreferencesPage.jsx';
import WorkspaceNotificationSettingsPage from './features/notifications/pages/WorkspaceNotificationSettingsPage.jsx';
import ReminderProfilesPage from './features/compliance/pages/ReminderProfilesPage.jsx';
import EscalationProfilesPage from './features/compliance/pages/EscalationProfilesPage.jsx';
import EscalationsPage from './features/compliance/pages/EscalationsPage.jsx';
import ReportsHubPage from './features/compliance/pages/ReportsHubPage.jsx';
import RegisterReportPage from './features/compliance/pages/RegisterReportPage.jsx';
import FilingsReportPage from './features/compliance/pages/FilingsReportPage.jsx';
import RenewalsReportPage from './features/compliance/pages/RenewalsReportPage.jsx';
import OverdueReportPage from './features/compliance/pages/OverdueReportPage.jsx';
import EscalationAnalyticsPage from './features/compliance/pages/EscalationAnalyticsPage.jsx';
import ReminderAnalyticsPage from './features/compliance/pages/ReminderAnalyticsPage.jsx';
import EmailTemplatesPage from './features/email/pages/EmailTemplatesPage.jsx';
import EmailTemplateFormPage from './features/email/pages/EmailTemplateFormPage.jsx';
import EmailAnalyticsPage from './features/email/pages/EmailAnalyticsPage.jsx';
import AnnouncementsPage from './features/announcements/pages/AnnouncementsPage.jsx';
import AnnouncementFormPage from './features/announcements/pages/AnnouncementFormPage.jsx';
import ReminderRulesPage from './features/reminder-rules/pages/ReminderRulesPage.jsx';
import EscalationRulesPage from './features/escalation-rules/pages/EscalationRulesPage.jsx';
import ReportsPage from './features/reports/pages/ReportsPage.jsx';
import ReportViewerPage from './features/reports/pages/ReportViewerPage.jsx';
import AnalyticsDashboardPage from './features/analytics/pages/AnalyticsDashboardPage.jsx';
import InsightsCenterPage from './features/analytics/pages/InsightsCenterPage.jsx';

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
          <Route path="/compliance/reminders/profiles" element={<ReminderProfilesPage />} />
          <Route path="/compliance/escalations/profiles" element={<EscalationProfilesPage />} />
          <Route path="/compliance/escalations" element={<EscalationsPage />} />
          <Route path="/compliance/reports" element={<ReportsHubPage />} />
          <Route path="/compliance/reports/register" element={<RegisterReportPage />} />
          <Route path="/compliance/reports/filings" element={<FilingsReportPage />} />
          <Route path="/compliance/reports/renewals" element={<RenewalsReportPage />} />
          <Route path="/compliance/reports/overdue" element={<OverdueReportPage />} />
          <Route path="/compliance/reports/escalations" element={<EscalationAnalyticsPage />} />
          <Route path="/compliance/reports/reminders" element={<ReminderAnalyticsPage />} />
          <Route path="/notifications" element={<NotificationCenterPage />} />
          <Route path="/settings/notifications" element={<NotificationPreferencesPage />} />
          <Route path="/settings/notification-settings" element={<WorkspaceNotificationSettingsPage />} />
          <Route path="/settings/email-templates" element={<EmailTemplatesPage />} />
          <Route path="/settings/email-templates/new" element={<EmailTemplateFormPage />} />
          <Route path="/settings/email-templates/:id/edit" element={<EmailTemplateFormPage />} />
          <Route path="/settings/email-analytics" element={<EmailAnalyticsPage />} />
          <Route path="/announcements" element={<AnnouncementsPage />} />
          <Route path="/announcements/new" element={<AnnouncementFormPage />} />
          <Route path="/announcements/:id/edit" element={<AnnouncementFormPage />} />
          <Route path="/settings/reminder-rules" element={<ReminderRulesPage />} />
          <Route path="/settings/escalation-rules" element={<EscalationRulesPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/reports/:reportCode" element={<ReportViewerPage />} />
          <Route path="/analytics" element={<AnalyticsDashboardPage />} />
          <Route path="/analytics/insights" element={<InsightsCenterPage />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
