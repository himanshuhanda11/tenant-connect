-- Enums for flows
DO $$ BEGIN
  CREATE TYPE flow_status AS ENUM ('draft','active','inactive','archived');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE flow_trigger_type AS ENUM ('keyword','regex','qr','meta_ad','api','manual','fallback');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE flow_version_status AS ENUM ('draft','published','archived');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Flows table
CREATE TABLE IF NOT EXISTS flows (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  phone_number_id   uuid NULL REFERENCES phone_numbers(id) ON DELETE SET NULL,
  name              text NOT NULL,
  description       text NULL,
  emoji             text DEFAULT '🔄',
  status            flow_status NOT NULL DEFAULT 'draft',
  health_score      int NOT NULL DEFAULT 100,
  folder            text NULL,
  is_pro            boolean NOT NULL DEFAULT false,
  created_by        uuid NOT NULL REFERENCES profiles(id),
  updated_by        uuid NULL REFERENCES profiles(id),
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_flows_tenant ON flows(tenant_id);
CREATE INDEX IF NOT EXISTS idx_flows_phone ON flows(tenant_id, phone_number_id);

-- Enable RLS
ALTER TABLE flows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "flows_tenant_select" ON flows FOR SELECT 
  USING (is_tenant_member(tenant_id));

CREATE POLICY "flows_tenant_insert" ON flows FOR INSERT 
  WITH CHECK (is_tenant_member(tenant_id));

CREATE POLICY "flows_tenant_update" ON flows FOR UPDATE 
  USING (is_tenant_member(tenant_id));

CREATE POLICY "flows_tenant_delete" ON flows FOR DELETE 
  USING (is_tenant_admin(tenant_id));

-- Flow Versions
CREATE TABLE IF NOT EXISTS flow_versions (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  flow_id           uuid NOT NULL REFERENCES flows(id) ON DELETE CASCADE,
  version_number    int NOT NULL,
  status            flow_version_status NOT NULL DEFAULT 'draft',
  nodes_json        jsonb NOT NULL DEFAULT '[]'::jsonb,
  edges_json        jsonb NOT NULL DEFAULT '[]'::jsonb,
  triggers_json     jsonb NOT NULL DEFAULT '[]'::jsonb,
  published_at      timestamptz NULL,
  created_by        uuid NOT NULL REFERENCES profiles(id),
  created_at        timestamptz NOT NULL DEFAULT now(),
  UNIQUE(flow_id, version_number)
);

CREATE INDEX IF NOT EXISTS idx_flow_versions_flow ON flow_versions(flow_id, version_number DESC);

ALTER TABLE flow_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "flow_versions_tenant_access" ON flow_versions FOR ALL 
  USING (is_tenant_member(tenant_id));

-- Flow Triggers
CREATE TABLE IF NOT EXISTS flow_triggers (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  flow_id           uuid NOT NULL REFERENCES flows(id) ON DELETE CASCADE,
  phone_number_id   uuid NULL REFERENCES phone_numbers(id) ON DELETE SET NULL,
  trigger_type      flow_trigger_type NOT NULL,
  priority          int NOT NULL DEFAULT 100,
  is_enabled        boolean NOT NULL DEFAULT true,
  config            jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_flow_triggers_lookup
ON flow_triggers(tenant_id, phone_number_id, trigger_type, is_enabled, priority);

ALTER TABLE flow_triggers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "flow_triggers_tenant_access" ON flow_triggers FOR ALL 
  USING (is_tenant_member(tenant_id));

-- Flow Nodes
CREATE TABLE IF NOT EXISTS flow_nodes (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  flow_id           uuid NOT NULL REFERENCES flows(id) ON DELETE CASCADE,
  node_key          text NOT NULL,
  node_type         text NOT NULL,
  chapter           text NULL,
  label             text NULL,
  position_x        float NOT NULL DEFAULT 0,
  position_y        float NOT NULL DEFAULT 0,
  config            jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  UNIQUE(flow_id, node_key)
);

CREATE INDEX IF NOT EXISTS idx_flow_nodes_flow ON flow_nodes(flow_id);

ALTER TABLE flow_nodes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "flow_nodes_tenant_access" ON flow_nodes FOR ALL 
  USING (is_tenant_member(tenant_id));

-- Flow Edges
CREATE TABLE IF NOT EXISTS flow_edges (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  flow_id           uuid NOT NULL REFERENCES flows(id) ON DELETE CASCADE,
  edge_key          text NOT NULL,
  source_node_key   text NOT NULL,
  target_node_key   text NOT NULL,
  source_handle     text NULL,
  target_handle     text NULL,
  label             text NULL,
  config            jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at        timestamptz NOT NULL DEFAULT now(),
  UNIQUE(flow_id, edge_key)
);

CREATE INDEX IF NOT EXISTS idx_flow_edges_flow ON flow_edges(flow_id);

ALTER TABLE flow_edges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "flow_edges_tenant_access" ON flow_edges FOR ALL 
  USING (is_tenant_member(tenant_id));

-- Flow Diagnostics
CREATE TABLE IF NOT EXISTS flow_diagnostics (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  flow_id           uuid NOT NULL REFERENCES flows(id) ON DELETE CASCADE,
  severity          text NOT NULL,
  code              text NOT NULL,
  message           text NOT NULL,
  node_key          text NULL,
  meta              jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_flow_diag_flow ON flow_diagnostics(flow_id, created_at DESC);

ALTER TABLE flow_diagnostics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "flow_diagnostics_tenant_access" ON flow_diagnostics FOR ALL 
  USING (is_tenant_member(tenant_id));

-- Flow Sessions (runtime)
CREATE TABLE IF NOT EXISTS flow_sessions (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  flow_id           uuid NOT NULL REFERENCES flows(id) ON DELETE SET NULL,
  phone_number_id   uuid NULL REFERENCES phone_numbers(id) ON DELETE SET NULL,
  contact_id        uuid NULL REFERENCES contacts(id) ON DELETE SET NULL,
  conversation_id   uuid NULL REFERENCES conversations(id) ON DELETE SET NULL,
  status            text NOT NULL DEFAULT 'active',
  current_node_key  text NULL,
  context           jsonb NOT NULL DEFAULT '{}'::jsonb,
  started_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  ended_at          timestamptz NULL
);

CREATE INDEX IF NOT EXISTS idx_flow_sessions_lookup
ON flow_sessions(tenant_id, phone_number_id, contact_id, started_at DESC);

ALTER TABLE flow_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "flow_sessions_tenant_access" ON flow_sessions FOR ALL 
  USING (is_tenant_member(tenant_id));

-- Flow Events (analytics)
CREATE TABLE IF NOT EXISTS flow_events (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  flow_id           uuid NULL REFERENCES flows(id) ON DELETE SET NULL,
  session_id        uuid NULL REFERENCES flow_sessions(id) ON DELETE SET NULL,
  node_key          text NULL,
  event_type        text NOT NULL,
  meta              jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_flow_events_flow_time ON flow_events(flow_id, created_at DESC);

ALTER TABLE flow_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "flow_events_tenant_access" ON flow_events FOR ALL 
  USING (is_tenant_member(tenant_id));

-- Flow Templates (global library)
CREATE TABLE IF NOT EXISTS flow_templates (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_key      text UNIQUE NOT NULL,
  category          text NOT NULL,
  title             text NOT NULL,
  subtitle          text NULL,
  tags              text[] NOT NULL DEFAULT '{}'::text[],
  goal              text NULL,
  expected_uplift   text NULL,
  is_pro            boolean NOT NULL DEFAULT false,
  preview_json      jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at        timestamptz NOT NULL DEFAULT now()
);

-- Insert default templates
INSERT INTO flow_templates (template_key, category, title, subtitle, tags, goal, expected_uplift, preview_json) VALUES
('welcome-ecommerce', 'E-commerce', 'Welcome & Product Discovery', 'Greet new customers and help them find products', ARRAY['welcome', 'product', 'sales'], 'Sales', '+40% engagement', '{"nodes": [], "edges": [], "triggers": []}'),
('order-status', 'E-commerce', 'Order Status Inquiry', 'Let customers check their order status', ARRAY['order', 'tracking', 'support'], 'Support', '+35% CSAT', '{"nodes": [], "edges": [], "triggers": []}'),
('lead-qualification', 'Real Estate', 'Lead Qualification Bot', 'Qualify property leads automatically', ARRAY['leads', 'property', 'qualification'], 'Sales', '+50% qualified leads', '{"nodes": [], "edges": [], "triggers": []}'),
('appointment-booking', 'Healthcare', 'Appointment Scheduling', 'Let patients book appointments', ARRAY['appointments', 'booking', 'calendar'], 'Operations', '-40% no-shows', '{"nodes": [], "edges": [], "triggers": []}'),
('course-enrollment', 'Education', 'Course Enrollment Bot', 'Help students enroll in courses', ARRAY['courses', 'enrollment', 'education'], 'Growth', '+25% enrollments', '{"nodes": [], "edges": [], "triggers": []}'),
('it-support-triage', 'IT', 'Support Ticket Triage', 'Route support tickets intelligently', ARRAY['support', 'tickets', 'triage'], 'Support', '+60% faster resolution', '{"nodes": [], "edges": [], "triggers": []}'),
('candidate-screening', 'Recruitment', 'Candidate Pre-Screening', 'Screen candidates before interviews', ARRAY['recruitment', 'screening', 'hr'], 'Operations', '+45% hiring efficiency', '{"nodes": [], "edges": [], "triggers": []}'),
('travel-booking', 'Travel', 'Travel Inquiry & Booking', 'Help travelers plan and book trips', ARRAY['travel', 'booking', 'inquiry'], 'Sales', '+30% conversions', '{"nodes": [], "edges": [], "triggers": []}')
ON CONFLICT (template_key) DO NOTHING;

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_flow_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER flows_updated_at BEFORE UPDATE ON flows
FOR EACH ROW EXECUTE FUNCTION update_flow_updated_at();

CREATE TRIGGER flow_nodes_updated_at BEFORE UPDATE ON flow_nodes
FOR EACH ROW EXECUTE FUNCTION update_flow_updated_at();

CREATE TRIGGER flow_sessions_updated_at BEFORE UPDATE ON flow_sessions
FOR EACH ROW EXECUTE FUNCTION update_flow_updated_at();