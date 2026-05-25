const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const env = require('./config/env');
const { requestLogger } = require('./middleware/requestLogger');
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');
const healthRoutes    = require('./modules/health/health.routes');
const dashboardRoutes = require('./modules/dashboard/dashboard.routes');
const authRoutes = require('./modules/auth/auth.routes');
const workspacesRoutes = require('./modules/workspaces/workspaces.routes');
const companiesRoutes = require('./modules/companies/companies.routes');
const settingsRoutes = require('./modules/settings/settings.routes');
const localizationRoutes = require('./modules/localization/localization.routes');
const membersRoutes = require('./modules/members/members.routes');
const invitationsRoutes = require('./modules/invitations/invitations.routes');
const plansRoutes = require('./modules/plans/plans.routes');
const subscriptionsRoutes = require('./modules/subscriptions/subscriptions.routes');
const usageRoutes = require('./modules/usage/usage.routes');
const billingRoutes = require('./modules/billing/billing.routes');
const customersRoutes = require('./modules/customers/customers.routes');
const invoicesRoutes = require('./modules/invoices/invoices.routes');
const paymentsRoutes = require('./modules/payments/payments.routes');
const receivablesRoutes = require('./modules/receivables/receivables.routes');
const collectionsRoutes = require('./modules/collections/collections.routes');
const statementsRoutes = require('./modules/statements/statements.routes');
const expenseCategoriesRoutes = require('./modules/expense-categories/expense-categories.routes');
const suppliersRoutes = require('./modules/suppliers/suppliers.routes');
const expensesRoutes = require('./modules/expenses/expenses.routes');
const expenseApprovalsRoutes = require('./modules/expense-approvals/expense-approvals.routes');
const approvalsRoutes = require('./modules/expense-approvals/approvals.routes');
const reimbursementsRoutes       = require('./modules/reimbursements/reimbursements.routes');
const expenseInsightsRoutes      = require('./modules/expense-insights/expense-insights.routes');
const budgetsRoutes              = require('./modules/budgets/budgets.routes');
const recurringExpensesRoutes    = require('./modules/recurring-expenses/recurring-expenses.routes');
const filesRoutes                = require('./modules/files/files.routes');
const complianceRoutes           = require('./modules/compliance/compliance.routes');
const notificationsRoutes        = require('./modules/notifications/notifications.routes');
const emailRoutes                = require('./modules/email/email.routes');
const announcementsRoutes        = require('./modules/announcements/announcements.routes');
const reminderRulesRoutes        = require('./modules/reminder-rules/reminder-rules.routes');
const escalationRulesRoutes      = require('./modules/escalation-rules/escalation-rules.routes');
const notificationEventsRoutes   = require('./modules/notifications/notification-events.routes');
const { startReminderEngine }    = require('./modules/notifications/reminder.engine');
const { startEmailWorker }       = require('./modules/email/email.worker');
const { startAnnouncementEngine } = require('./modules/announcements/announcement.engine');
const { seedEventRegistry }      = require('./modules/notifications/notification.emitter');
const reportsRoutes              = require('./modules/reports/reports.routes');
const { startReportScheduler }   = require('./modules/reports/reports.scheduler');
const analyticsRoutes            = require('./modules/analytics/analytics.routes');
const { startAnalyticsScheduler } = require('./modules/analytics/analytics.scheduler');
const adminRoutes                = require('./modules/admin/index');
const publicRoutes               = require('./modules/public/index');

const app = express();

// BigInt values (e.g. fileSizeBytes) cannot be serialized by JSON.stringify.
// Convert them to numbers so res.json() never crashes on file-size fields.
app.set('json replacer', (_, value) =>
  typeof value === 'bigint' ? Number(value) : value
);

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: 'Too many requests', details: [] },
  })
);

// Raw body for Stripe webhook signature verification — must come before express.json()
app.use('/api/v1/billing/webhook', express.raw({ type: 'application/json' }));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(requestLogger);

// Routes
app.use('/api/v1/health',     healthRoutes);
app.use('/api/v1/dashboard',  dashboardRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/workspaces', workspacesRoutes);
app.use('/api/v1/company', companiesRoutes);
app.use('/api/v1/settings', settingsRoutes);
app.use('/api/v1/countries', localizationRoutes.countries);
app.use('/api/v1/languages', localizationRoutes.languages);
app.use('/api/v1/currencies', localizationRoutes.currencies);
app.use('/api/v1/members', membersRoutes);
app.use('/api/v1/invitations', invitationsRoutes);
app.use('/api/v1/plans', plansRoutes);
app.use('/api/v1/subscription', subscriptionsRoutes);
app.use('/api/v1/usage', usageRoutes);
app.use('/api/v1/billing', billingRoutes);
app.use('/api/v1/customers', customersRoutes);
app.use('/api/v1/invoices', invoicesRoutes);
app.use('/api/v1/payments', paymentsRoutes);
app.use('/api/v1/receivables', receivablesRoutes);
app.use('/api/v1/collections', collectionsRoutes);
app.use('/api/v1/statements', statementsRoutes);
app.use('/api/v1/expense-categories', expenseCategoriesRoutes);
app.use('/api/v1/suppliers', suppliersRoutes);
app.use('/api/v1/expenses', expensesRoutes);
app.use('/api/v1/expenses', expenseApprovalsRoutes);
app.use('/api/v1/approvals', approvalsRoutes);
app.use('/api/v1/reimbursements', reimbursementsRoutes);
app.use('/api/v1/expense-insights', expenseInsightsRoutes);
app.use('/api/v1/budgets', budgetsRoutes);
app.use('/api/v1/recurring-expenses', recurringExpensesRoutes);
app.use('/api/v1/files', filesRoutes);
app.use('/api/v1/compliance', complianceRoutes);
app.use('/api/v1/notifications', notificationsRoutes);
app.use('/api/v1/email-templates', emailRoutes);
app.use('/api/v1/announcements', announcementsRoutes);
app.use('/api/v1/reminder-rules', reminderRulesRoutes);
app.use('/api/v1/escalation-rules', escalationRulesRoutes);
app.use('/api/v1/notification-events', notificationEventsRoutes);
app.use('/api/v1/reports',    reportsRoutes);
app.use('/api/v1/analytics',  analyticsRoutes);

// Slice 10.5 — App boundary namespaces
app.use('/api/public', publicRoutes);
app.use('/api/admin',  adminRoutes);

// Start background engines
startReminderEngine();
startEmailWorker();
startAnnouncementEngine();
startReportScheduler();
startAnalyticsScheduler();

// Seed notification event registry (non-blocking)
seedEventRegistry().catch(() => {});

// 404 and error handlers must be last
app.use(notFound);
app.use(errorHandler);

module.exports = app;
