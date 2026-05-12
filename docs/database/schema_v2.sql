-- =========================================================
-- Tetri Copilot Database Schema
-- AI-First Lightweight SME Operating Assistant
-- Version: 2.0 MVP
-- Database: PostgreSQL on Ubuntu VPS
-- Backend: Express.js REST API on Ubuntu VPS
-- Frontend: React + Vite deployed to Cloudflare Pages
-- ORM: Prisma ORM / Prisma Client
-- =========================================================


-- =========================================================
-- 0. REQUIRED POSTGRESQL EXTENSIONS
-- =========================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =========================================================
-- 1. ENUM TYPES
-- =========================================================

CREATE TYPE user_status AS ENUM (
  'active',
  'inactive',
  'invited',
  'suspended'
);

CREATE TYPE system_role AS ENUM (
  'admin',      -- Global platform admin
  'owner',      -- Subscriber/business owner
  'user',       -- Operational workspace user
  'viewer'      -- Read-only user
);

CREATE TYPE subscription_plan_code AS ENUM (
  'free',
  'starter',
  'professional',
  'business'
);

CREATE TYPE subscription_status AS ENUM (
  'trialing',
  'active',
  'past_due',
  'cancelled',
  'expired'
);

CREATE TYPE invoice_status AS ENUM (
  'draft',
  'sent',
  'paid',
  'overdue',
  'cancelled'
);

CREATE TYPE expense_status AS ENUM (
  'draft',
  'submitted',
  'approved',
  'rejected'
);

CREATE TYPE reminder_type AS ENUM (
  'tax',
  'invoice_due',
  'payment',
  'compliance',
  'custom'
);

CREATE TYPE reminder_status AS ENUM (
  'pending',
  'sent',
  'completed',
  'cancelled',
  'overdue'
);

CREATE TYPE notification_channel AS ENUM (
  'dashboard',
  'email'
);

CREATE TYPE notification_status AS ENUM (
  'pending',
  'sent',
  'failed',
  'read'
);

CREATE TYPE document_type AS ENUM (
  'quotation',
  'nda',
  'freelance_agreement',
  'offer_letter',
  'operational_letter',
  'other'
);

CREATE TYPE document_status AS ENUM (
  'draft',
  'generated',
  'approved',
  'archived'
);

CREATE TYPE ai_request_type AS ENUM (
  'chat',
  'document_generation',
  'expense_categorization',
  'compliance_guidance',
  'invoice_guidance'
);

CREATE TYPE ai_request_status AS ENUM (
  'success',
  'failed',
  'blocked_limit',
  'blocked_permission'
);

CREATE TYPE billing_event_type AS ENUM (
  'checkout_created',
  'subscription_created',
  'subscription_updated',
  'subscription_cancelled',
  'payment_succeeded',
  'payment_failed'
);

-- =========================================================
-- 2. COUNTRY, LANGUAGE & LOCALIZATION
-- =========================================================

CREATE TABLE languages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(10) NOT NULL UNIQUE, -- en, ka, ru, ar
  name VARCHAR(100) NOT NULL,
  native_name VARCHAR(100),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE currencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(3) NOT NULL UNIQUE, -- GEL, USD, AED, SAR, QAR
  name VARCHAR(100) NOT NULL,
  symbol VARCHAR(10),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE country_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code VARCHAR(5) NOT NULL UNIQUE, -- GE, AE, SA, QA
  country_name VARCHAR(150) NOT NULL,
  default_currency_id UUID REFERENCES currencies(id),
  default_language_id UUID REFERENCES languages(id),
  date_format VARCHAR(50) DEFAULT 'YYYY-MM-DD',
  timezone VARCHAR(100),
  tax_label VARCHAR(50), -- VAT, GST, Tax, etc.
  tax_number_label VARCHAR(100),
  default_tax_rate NUMERIC(10,4) DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE country_profile_languages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_profile_id UUID NOT NULL REFERENCES country_profiles(id) ON DELETE CASCADE,
  language_id UUID NOT NULL REFERENCES languages(id),
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE(country_profile_id, language_id)
);

-- =========================================================
-- 3. SYSTEM USERS, TENANTS & WORKSPACES
-- =========================================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id VARCHAR(255) UNIQUE, -- Clerk external user ID
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255),
  phone VARCHAR(50),
  preferred_language_id UUID REFERENCES languages(id),
  status user_status NOT NULL DEFAULT 'active',
  is_platform_admin BOOLEAN NOT NULL DEFAULT FALSE,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  owner_user_id UUID NOT NULL REFERENCES users(id),
  country_profile_id UUID REFERENCES country_profiles(id),
  default_currency_id UUID REFERENCES currencies(id),
  default_language_id UUID REFERENCES languages(id),
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE workspace_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role system_role NOT NULL DEFAULT 'user',
  status user_status NOT NULL DEFAULT 'active',
  invited_by_user_id UUID REFERENCES users(id),
  joined_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(workspace_id, user_id)
);

CREATE TABLE invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  role system_role NOT NULL DEFAULT 'user',
  invitation_token VARCHAR(255) NOT NULL UNIQUE,
  invited_by_user_id UUID REFERENCES users(id),
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================================
-- 4. COMPANY PROFILE & SETTINGS
-- =========================================================

CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL UNIQUE REFERENCES workspaces(id) ON DELETE CASCADE,
  company_name VARCHAR(255) NOT NULL,
  legal_name VARCHAR(255),
  logo_file_id UUID,
  email VARCHAR(255),
  phone VARCHAR(50),
  website VARCHAR(255),
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  city VARCHAR(150),
  postal_code VARCHAR(50),
  tax_number VARCHAR(100),
  registration_number VARCHAR(100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE company_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL UNIQUE REFERENCES workspaces(id) ON DELETE CASCADE,
  invoice_prefix VARCHAR(20) DEFAULT 'INV',
  next_invoice_number INTEGER NOT NULL DEFAULT 1,
  default_invoice_due_days INTEGER NOT NULL DEFAULT 14,
  default_tax_rate NUMERIC(10,4) DEFAULT 0,
  reminder_lead_days INTEGER NOT NULL DEFAULT 3,
  email_notifications_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  dashboard_notifications_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================================
-- 5. SUBSCRIPTIONS, PLANS & LIMITS
-- =========================================================

CREATE TABLE plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code subscription_plan_code NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  monthly_price_usd NUMERIC(10,2) NOT NULL DEFAULT 0,
  included_users INTEGER NOT NULL,
  max_users INTEGER, -- NULL means unlimited/flexible
  max_monthly_invoices INTEGER,
  max_monthly_ai_requests INTEGER,
  max_storage_mb INTEGER,
  has_expenses BOOLEAN NOT NULL DEFAULT FALSE,
  has_ai_categorization BOOLEAN NOT NULL DEFAULT FALSE,
  has_advanced_compliance BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL UNIQUE REFERENCES workspaces(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES plans(id),
  status subscription_status NOT NULL DEFAULT 'active',
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE billing_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  event_type billing_event_type NOT NULL,
  provider VARCHAR(50) NOT NULL DEFAULT 'stripe',
  provider_event_id VARCHAR(255),
  payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================================
-- 6. FILES / ATTACHMENTS
-- =========================================================

CREATE TABLE files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  uploaded_by_user_id UUID REFERENCES users(id),
  storage_provider VARCHAR(50) NOT NULL DEFAULT 'cloudflare_r2',
  bucket_name VARCHAR(255),
  object_key TEXT NOT NULL,
  original_filename VARCHAR(255),
  mime_type VARCHAR(100),
  file_size_bytes BIGINT,
  public_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE companies
ADD CONSTRAINT fk_companies_logo_file
FOREIGN KEY (logo_file_id) REFERENCES files(id) ON DELETE SET NULL;

-- =========================================================
-- 7. CUSTOMERS
-- =========================================================

CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  city VARCHAR(150),
  country VARCHAR(150),
  tax_number VARCHAR(100),
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by_user_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================================
-- 8. INVOICING
-- =========================================================

CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  invoice_number VARCHAR(100) NOT NULL,
  status invoice_status NOT NULL DEFAULT 'draft',
  issue_date DATE NOT NULL,
  due_date DATE,
  currency_id UUID REFERENCES currencies(id),
  subtotal NUMERIC(14,2) NOT NULL DEFAULT 0,
  tax_total NUMERIC(14,2) NOT NULL DEFAULT 0,
  discount_total NUMERIC(14,2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  paid_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  notes TEXT,
  terms TEXT,
  language_id UUID REFERENCES languages(id),
  sent_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_by_user_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(workspace_id, invoice_number)
);

CREATE TABLE invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  item_order INTEGER NOT NULL DEFAULT 1,
  description TEXT NOT NULL,
  quantity NUMERIC(14,4) NOT NULL DEFAULT 1,
  unit_price NUMERIC(14,2) NOT NULL DEFAULT 0,
  tax_rate NUMERIC(10,4) NOT NULL DEFAULT 0,
  discount_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  line_total NUMERIC(14,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE invoice_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  paid_amount NUMERIC(14,2) NOT NULL,
  payment_date DATE NOT NULL,
  payment_method VARCHAR(100),
  notes TEXT,
  created_by_user_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE recurring_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  frequency VARCHAR(50) NOT NULL, -- weekly, monthly, quarterly
  next_run_date DATE NOT NULL,
  last_run_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  template_data JSONB NOT NULL,
  created_by_user_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================================
-- 9. EXPENSE MANAGEMENT
-- =========================================================

CREATE TABLE expense_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  is_system_default BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(workspace_id, name)
);

CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  category_id UUID REFERENCES expense_categories(id) ON DELETE SET NULL,
  vendor_name VARCHAR(255),
  description TEXT,
  expense_date DATE NOT NULL,
  currency_id UUID REFERENCES currencies(id),
  amount NUMERIC(14,2) NOT NULL,
  tax_amount NUMERIC(14,2) DEFAULT 0,
  status expense_status NOT NULL DEFAULT 'submitted',
  receipt_file_id UUID REFERENCES files(id) ON DELETE SET NULL,
  ai_suggested_category_id UUID REFERENCES expense_categories(id) ON DELETE SET NULL,
  ai_confidence_score NUMERIC(5,2),
  created_by_user_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================================
-- 10. COMPLIANCE CALENDAR & REMINDERS
-- =========================================================

CREATE TABLE compliance_calendar_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_profile_id UUID NOT NULL REFERENCES country_profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  reminder_type reminder_type NOT NULL DEFAULT 'compliance',
  recurrence_rule TEXT, -- RRULE-compatible text if needed
  default_due_month INTEGER,
  default_due_day INTEGER,
  lead_days INTEGER NOT NULL DEFAULT 7,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  country_profile_id UUID REFERENCES country_profiles(id),
  compliance_calendar_item_id UUID REFERENCES compliance_calendar_items(id) ON DELETE SET NULL,
  related_invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  reminder_type reminder_type NOT NULL DEFAULT 'custom',
  due_date DATE NOT NULL,
  remind_at TIMESTAMPTZ,
  status reminder_status NOT NULL DEFAULT 'pending',
  created_by_user_id UUID REFERENCES users(id),
  assigned_to_user_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE reminder_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reminder_id UUID NOT NULL REFERENCES reminders(id) ON DELETE CASCADE,
  channel notification_channel NOT NULL,
  status notification_status NOT NULL DEFAULT 'pending',
  sent_to VARCHAR(255),
  provider_message_id VARCHAR(255),
  error_message TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================================
-- 11. NOTIFICATIONS
-- =========================================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  channel notification_channel NOT NULL DEFAULT 'dashboard',
  status notification_status NOT NULL DEFAULT 'pending',
  related_entity_type VARCHAR(100),
  related_entity_id UUID,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================================
-- 12. AI ASSISTANT & AI USAGE
-- =========================================================

CREATE TABLE ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255),
  language_id UUID REFERENCES languages(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ai_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL, -- user, assistant, system
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ai_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  request_type ai_request_type NOT NULL,
  status ai_request_status NOT NULL DEFAULT 'success',
  provider VARCHAR(50) NOT NULL DEFAULT 'openai',
  model VARCHAR(100),
  input_tokens INTEGER DEFAULT 0,
  output_tokens INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  estimated_cost_usd NUMERIC(12,6) DEFAULT 0,
  request_summary TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================================
-- 13. AI DOCUMENT GENERATION
-- =========================================================

CREATE TABLE document_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  country_profile_id UUID REFERENCES country_profiles(id) ON DELETE SET NULL,
  document_type document_type NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  template_content TEXT,
  language_id UUID REFERENCES languages(id),
  is_system_default BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE generated_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  template_id UUID REFERENCES document_templates(id) ON DELETE SET NULL,
  document_type document_type NOT NULL,
  status document_status NOT NULL DEFAULT 'draft',
  title VARCHAR(255) NOT NULL,
  content TEXT,
  language_id UUID REFERENCES languages(id),
  pdf_file_id UUID REFERENCES files(id) ON DELETE SET NULL,
  generated_by_user_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================================
-- 14. ADMIN, AUDIT & ACTIVITY TRACKING
-- =========================================================

CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(150) NOT NULL,
  entity_type VARCHAR(100),
  entity_id UUID,
  description TEXT,
  metadata JSONB,
  ip_address VARCHAR(100),
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  admin_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(150) NOT NULL,
  entity_type VARCHAR(100),
  entity_id UUID,
  old_value JSONB,
  new_value JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================================
-- 15. INDEXES
-- =========================================================

CREATE INDEX idx_users_clerk_user_id ON users(clerk_user_id);
CREATE INDEX idx_users_email ON users(email);

CREATE INDEX idx_workspace_members_workspace_id ON workspace_members(workspace_id);
CREATE INDEX idx_workspace_members_user_id ON workspace_members(user_id);
CREATE INDEX idx_workspace_members_role ON workspace_members(role);

CREATE INDEX idx_subscriptions_workspace_id ON subscriptions(workspace_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);

CREATE INDEX idx_customers_workspace_id ON customers(workspace_id);
CREATE INDEX idx_invoices_workspace_id ON invoices(workspace_id);
CREATE INDEX idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);

CREATE INDEX idx_expenses_workspace_id ON expenses(workspace_id);
CREATE INDEX idx_expenses_category_id ON expenses(category_id);
CREATE INDEX idx_expenses_expense_date ON expenses(expense_date);

CREATE INDEX idx_reminders_workspace_id ON reminders(workspace_id);
CREATE INDEX idx_reminders_due_date ON reminders(due_date);
CREATE INDEX idx_reminders_status ON reminders(status);
CREATE INDEX idx_reminders_type ON reminders(reminder_type);

CREATE INDEX idx_notifications_workspace_id ON notifications(workspace_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_status ON notifications(status);

CREATE INDEX idx_ai_usage_workspace_id ON ai_usage_logs(workspace_id);
CREATE INDEX idx_ai_usage_user_id ON ai_usage_logs(user_id);
CREATE INDEX idx_ai_usage_created_at ON ai_usage_logs(created_at);

CREATE INDEX idx_activity_logs_workspace_id ON activity_logs(workspace_id);
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);

-- =========================================================
-- 16. INITIAL SEED DATA
-- =========================================================

INSERT INTO languages (code, name, native_name) VALUES
('en', 'English', 'English'),
('ka', 'Georgian', 'ქართული'),
('ru', 'Russian', 'Русский')
ON CONFLICT (code) DO NOTHING;

INSERT INTO currencies (code, name, symbol) VALUES
('GEL', 'Georgian Lari', '₾'),
('USD', 'US Dollar', '$'),
('AED', 'UAE Dirham', 'د.إ'),
('SAR', 'Saudi Riyal', '﷼'),
('QAR', 'Qatari Riyal', 'ر.ق')
ON CONFLICT (code) DO NOTHING;



-- Initial country profiles for V2 architecture
INSERT INTO country_profiles (
  country_code,
  country_name,
  default_currency_id,
  default_language_id,
  date_format,
  timezone,
  tax_label,
  tax_number_label,
  default_tax_rate,
  is_active
) VALUES
('GE', 'Georgia',
  (SELECT id FROM currencies WHERE code = 'GEL'),
  (SELECT id FROM languages WHERE code = 'en'),
  'YYYY-MM-DD', 'Asia/Tbilisi', 'VAT', 'Tax Number', 0, TRUE),
('AE', 'United Arab Emirates',
  (SELECT id FROM currencies WHERE code = 'AED'),
  (SELECT id FROM languages WHERE code = 'en'),
  'DD/MM/YYYY', 'Asia/Dubai', 'VAT', 'TRN', 0.05, TRUE),
('SA', 'Saudi Arabia',
  (SELECT id FROM currencies WHERE code = 'SAR'),
  (SELECT id FROM languages WHERE code = 'en'),
  'DD/MM/YYYY', 'Asia/Riyadh', 'VAT', 'Tax Identification Number', 0.15, TRUE),
('QA', 'Qatar',
  (SELECT id FROM currencies WHERE code = 'QAR'),
  (SELECT id FROM languages WHERE code = 'en'),
  'DD/MM/YYYY', 'Asia/Qatar', 'Tax', 'Tax Number', 0, TRUE)
ON CONFLICT (country_code) DO NOTHING;

-- Initial country-language mapping
INSERT INTO country_profile_languages (country_profile_id, language_id, is_default)
SELECT cp.id, l.id, CASE WHEN l.code = 'en' THEN TRUE ELSE FALSE END
FROM country_profiles cp
JOIN languages l ON l.code IN ('en', 'ka', 'ru')
WHERE cp.country_code = 'GE'
ON CONFLICT (country_profile_id, language_id) DO NOTHING;

INSERT INTO country_profile_languages (country_profile_id, language_id, is_default)
SELECT cp.id, l.id, CASE WHEN l.code = 'en' THEN TRUE ELSE FALSE END
FROM country_profiles cp
JOIN languages l ON l.code IN ('en')
WHERE cp.country_code IN ('AE', 'SA', 'QA')
ON CONFLICT (country_profile_id, language_id) DO NOTHING;

INSERT INTO plans (
  code,
  name,
  monthly_price_usd,
  included_users,
  max_users,
  max_monthly_invoices,
  max_monthly_ai_requests,
  max_storage_mb,
  has_expenses,
  has_ai_categorization,
  has_advanced_compliance
) VALUES
('free', 'Free', 0, 1, 1, 5, 20, 100, FALSE, FALSE, FALSE),
('starter', 'Starter', 4, 1, 1, NULL, 100, 500, FALSE, FALSE, FALSE),
('professional', 'Professional', 8, 5, 5, NULL, 500, 2000, TRUE, TRUE, TRUE),
('business', 'Business', 12, 5, NULL, NULL, 1500, 5000, TRUE, TRUE, TRUE)
ON CONFLICT (code) DO NOTHING;

-- =========================================================
-- 17. NOTES FOR IMPLEMENTATION - V2
-- =========================================================

-- 1. Use workspace_id on all tenant-owned data tables.
-- 2. Enforce tenant isolation at Express API service/middleware level using workspace_id filters.
-- 3. Clerk remains source of truth for authentication identity.
-- 4. Local users table stores application profile and internal references.
-- 5. Stripe remains source of truth for payment/subscription status.
-- 6. Local subscriptions table stores synced subscription state for feature gating.
-- 7. AI usage must be checked before every AI request.
-- 8. Activity logs should be created for important user actions.
-- 9. Audit logs should be created for admin/system-sensitive changes.
-- 10. Country profiles should be configurable by Admin without code changes where possible.
-- 11. PostgreSQL is hosted on Ubuntu VPS; protect access using firewall rules, strong DB passwords, and backups.
-- 12. Backend API is Express.js deployed on Ubuntu VPS behind Nginx/PM2.
-- 13. Frontend is React + Vite deployed on Cloudflare Pages.
-- 14. Prisma migrations should be managed from backend/prisma and deployed using prisma migrate deploy.
