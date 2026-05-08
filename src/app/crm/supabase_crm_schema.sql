-- ============================================================
-- DNex CRM System — Supabase Schema Migration
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────────────────────
-- crm_cases
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS crm_cases (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id       TEXT UNIQUE NOT NULL,
  full_name     TEXT NOT NULL,
  email         TEXT,
  phone         TEXT,
  country       TEXT,
  service_type  TEXT,
  status        TEXT NOT NULL DEFAULT 'New Lead',
  priority      TEXT NOT NULL DEFAULT 'medium',
  source        TEXT DEFAULT 'website',
  assigned_to   UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  notes         TEXT,
  sla_deadline  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-generate case_id: DNX-YYYY-NNNN
CREATE OR REPLACE FUNCTION generate_case_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW.case_id := 'DNX-' || TO_CHAR(NOW(), 'YYYY') || '-' ||
    LPAD((EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT % 10000 || '', 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_case_id ON crm_cases;
CREATE TRIGGER set_case_id
  BEFORE INSERT ON crm_cases
  FOR EACH ROW
  WHEN (NEW.case_id IS NULL OR NEW.case_id = '')
  EXECUTE FUNCTION generate_case_id();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS cases_updated_at ON crm_cases;
CREATE TRIGGER cases_updated_at
  BEFORE UPDATE ON crm_cases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─────────────────────────────────────────────────────────────
-- crm_activities
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS crm_activities (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id       UUID NOT NULL REFERENCES crm_cases(id) ON DELETE CASCADE,
  type          TEXT NOT NULL, -- status_change | note | call | payment | document | message | task
  description   TEXT,
  performed_by  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  performed_by_name TEXT,
  metadata      JSONB,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- crm_tasks
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS crm_tasks (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id       UUID REFERENCES crm_cases(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  description   TEXT,
  assigned_to   UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_to_name TEXT,
  due_date      TIMESTAMPTZ,
  status        TEXT NOT NULL DEFAULT 'pending', -- pending | in_progress | done
  priority      TEXT NOT NULL DEFAULT 'medium',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS tasks_updated_at ON crm_tasks;
CREATE TRIGGER tasks_updated_at
  BEFORE UPDATE ON crm_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─────────────────────────────────────────────────────────────
-- crm_documents
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS crm_documents (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id       UUID NOT NULL REFERENCES crm_cases(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  file_name     TEXT,
  url           TEXT,
  version       INT NOT NULL DEFAULT 1,
  status        TEXT NOT NULL DEFAULT 'pending', -- pending | approved | rejected
  rejection_reason TEXT,
  uploaded_by   UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  uploaded_by_name TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- crm_calls
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS crm_calls (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id           UUID NOT NULL REFERENCES crm_cases(id) ON DELETE CASCADE,
  duration_minutes  INT DEFAULT 0,
  outcome           TEXT DEFAULT 'answered', -- answered | voicemail | no_answer | busy
  notes             TEXT,
  called_by         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  called_by_name    TEXT,
  called_at         TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- crm_payments
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS crm_payments (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id         UUID NOT NULL REFERENCES crm_cases(id) ON DELETE CASCADE,
  amount          NUMERIC(12, 2) NOT NULL,
  currency        TEXT DEFAULT 'INR',
  status          TEXT NOT NULL DEFAULT 'pending', -- pending | paid | failed
  payment_link    TEXT,
  razorpay_id     TEXT,
  description     TEXT,
  paid_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- crm_invoices
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS crm_invoices (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id         UUID NOT NULL REFERENCES crm_cases(id) ON DELETE CASCADE,
  invoice_number  TEXT UNIQUE NOT NULL,
  client_name     TEXT NOT NULL,
  client_email    TEXT,
  items           JSONB NOT NULL DEFAULT '[]',
  subtotal        NUMERIC(12, 2) DEFAULT 0,
  tax             NUMERIC(12, 2) DEFAULT 0,
  total           NUMERIC(12, 2) DEFAULT 0,
  status          TEXT NOT NULL DEFAULT 'draft', -- draft | sent | paid
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- crm_notifications
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS crm_notifications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  case_id     UUID REFERENCES crm_cases(id) ON DELETE CASCADE,
  type        TEXT NOT NULL, -- reminder | payment | document | status | sla
  title       TEXT NOT NULL,
  message     TEXT,
  read        BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- crm_automation_rules
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS crm_automation_rules (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  trigger     TEXT NOT NULL,  -- payment_success | document_upload | no_response | stage_change
  condition   JSONB,          -- { field, operator, value }
  action      TEXT NOT NULL,  -- update_status | send_notification | send_reminder
  action_data JSONB,          -- { status, message, ... }
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- RLS Policies (open for now — tighten per role later)
-- ─────────────────────────────────────────────────────────────
ALTER TABLE crm_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_automation_rules ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users full access (tighten later with roles)
CREATE POLICY "Authenticated full access on crm_cases"
  ON crm_cases FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated full access on crm_activities"
  ON crm_activities FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated full access on crm_tasks"
  ON crm_tasks FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated full access on crm_documents"
  ON crm_documents FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated full access on crm_calls"
  ON crm_calls FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated full access on crm_payments"
  ON crm_payments FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated full access on crm_invoices"
  ON crm_invoices FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated full access on crm_automation_rules"
  ON crm_automation_rules FOR ALL USING (auth.role() = 'authenticated');

-- Notifications: each user sees their own
CREATE POLICY "Own notifications"
  ON crm_notifications FOR ALL USING (user_id = auth.uid());

-- ─────────────────────────────────────────────────────────────
-- Sample Data (optional - remove in production)
-- ─────────────────────────────────────────────────────────────
-- INSERT INTO crm_automation_rules (name, trigger, action, action_data) VALUES
--   ('Payment Success → Document Collection', 'payment_success', 'update_status', '{"status": "Document Collection"}'),
--   ('Document Upload → Verification', 'document_upload', 'update_status', '{"status": "Verification"}'),
--   ('No Contact 24h → Reminder', 'no_response', 'send_notification', '{"message": "Lead not contacted in 24 hours"}');
