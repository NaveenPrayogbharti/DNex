-- ============================================================
-- DNex CRM Workflow Migration v2
-- Run in Supabase SQL Editor AFTER the base schema
-- ============================================================

-- 1. Add workflow columns to crm_cases
ALTER TABLE crm_cases
  ADD COLUMN IF NOT EXISTS requirement_data    JSONB,
  ADD COLUMN IF NOT EXISTS not_interested_reason TEXT,
  ADD COLUMN IF NOT EXISTS selected_service    TEXT,
  ADD COLUMN IF NOT EXISTS processing_notes    TEXT,
  ADD COLUMN IF NOT EXISTS inquiry_id          UUID;

-- 2. crm_quotations table
CREATE TABLE IF NOT EXISTS crm_quotations (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id           UUID NOT NULL REFERENCES crm_cases(id) ON DELETE CASCADE,
  quotation_number  TEXT UNIQUE NOT NULL,
  client_name       TEXT NOT NULL,
  client_email      TEXT,
  client_phone      TEXT,
  service_name      TEXT,
  items             JSONB NOT NULL DEFAULT '[]',
  subtotal          NUMERIC(12,2) DEFAULT 0,
  tax_rate          NUMERIC(5,2)  DEFAULT 0,
  tax               NUMERIC(12,2) DEFAULT 0,
  discount          NUMERIC(12,2) DEFAULT 0,
  total             NUMERIC(12,2) DEFAULT 0,
  validity_days     INT DEFAULT 30,
  notes             TEXT,
  terms             TEXT,
  status            TEXT NOT NULL DEFAULT 'draft', -- draft | sent | accepted | rejected
  sent_via          TEXT[],
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS quotations_updated_at ON crm_quotations;
CREATE TRIGGER quotations_updated_at
  BEFORE UPDATE ON crm_quotations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE crm_quotations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated full access on crm_quotations"
  ON crm_quotations FOR ALL USING (auth.role() = 'authenticated');

-- 3. Add 'quotation' to activity type comment
COMMENT ON COLUMN crm_activities.type IS
  'status_change | note | call | payment | quotation | document | message | task | system';

-- 4. Automation rule: case_created → auto open
INSERT INTO crm_automation_rules (name, trigger, condition, action, action_data, is_active)
VALUES
  ('New Inquiry → Open Case', 'case_created', null, 'update_status', '{"status":"New Lead"}', true),
  ('Payment Paid → Document Collection', 'payment_success', null, 'update_status', '{"status":"Document Collection"}', true)
ON CONFLICT DO NOTHING;
