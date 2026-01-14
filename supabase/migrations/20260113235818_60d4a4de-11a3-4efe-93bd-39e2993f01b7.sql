-- Phone Numbers Module for SMEKSH
-- A) Enums for phone number management
CREATE TYPE smeksh_number_status AS ENUM (
  'connected', 'pending', 'verification_required', 'disconnected', 'disabled', 'error'
);

CREATE TYPE smeksh_quality_rating AS ENUM ('green', 'yellow', 'red', 'unknown');

CREATE TYPE smeksh_limit_tier AS ENUM ('tier_1k', 'tier_10k', 'tier_100k', 'tier_unlimited', 'unknown');

CREATE TYPE smeksh_webhook_health AS ENUM ('healthy', 'degraded', 'down', 'unknown');

-- B) WABA table (WhatsApp Business Accounts)
CREATE TABLE public.smeksh_wabas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  waba_id TEXT NOT NULL,
  name TEXT,
  business_id TEXT,
  business_name TEXT,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, waba_id)
);

CREATE INDEX smeksh_wabas_tenant_idx ON public.smeksh_wabas(tenant_id);

CREATE TRIGGER trg_smeksh_wabas_touch
BEFORE UPDATE ON public.smeksh_wabas
FOR EACH ROW EXECUTE FUNCTION public.smeksh_touch_updated_at();

-- C) Phone Numbers table
CREATE TABLE public.smeksh_phone_numbers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  waba_uuid UUID REFERENCES public.smeksh_wabas(id) ON DELETE SET NULL,
  waba_id TEXT,
  phone_number_id TEXT NOT NULL,
  display_name TEXT,
  phone_e164 TEXT NOT NULL,
  verified_name TEXT,
  certificate TEXT,
  status smeksh_number_status NOT NULL DEFAULT 'pending',
  quality_rating smeksh_quality_rating NOT NULL DEFAULT 'unknown',
  messaging_limit smeksh_limit_tier NOT NULL DEFAULT 'unknown',
  default_team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  default_assignment_strategy TEXT DEFAULT 'round_robin',
  only_online BOOLEAN NOT NULL DEFAULT false,
  max_open_conversations_per_agent INT,
  enforce_opt_in BOOLEAN NOT NULL DEFAULT true,
  block_marketing_without_optin BOOLEAN NOT NULL DEFAULT true,
  quiet_hours JSONB,
  business_hours JSONB,
  webhook_health smeksh_webhook_health NOT NULL DEFAULT 'unknown',
  last_webhook_at TIMESTAMPTZ,
  last_message_at TIMESTAMPTZ,
  raw JSONB NOT NULL DEFAULT '{}'::jsonb,
  last_error TEXT,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, phone_number_id),
  UNIQUE(tenant_id, phone_e164)
);

CREATE INDEX smeksh_numbers_tenant_status_idx ON public.smeksh_phone_numbers(tenant_id, status);
CREATE INDEX smeksh_numbers_tenant_default_idx ON public.smeksh_phone_numbers(tenant_id, is_default);
CREATE INDEX smeksh_numbers_tenant_webhook_idx ON public.smeksh_phone_numbers(tenant_id, webhook_health, last_webhook_at);

CREATE TRIGGER trg_smeksh_numbers_touch
BEFORE UPDATE ON public.smeksh_phone_numbers
FOR EACH ROW EXECUTE FUNCTION public.smeksh_touch_updated_at();

-- D) Webhook configuration per number
CREATE TABLE public.smeksh_webhook_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  phone_number_id TEXT NOT NULL,
  callback_url TEXT NOT NULL,
  verify_token TEXT,
  secret TEXT,
  subscribed_fields TEXT[] DEFAULT '{}'::text[],
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, phone_number_id)
);

CREATE INDEX smeksh_webhooks_tenant_idx ON public.smeksh_webhook_configs(tenant_id);

CREATE TRIGGER trg_smeksh_webhooks_touch
BEFORE UPDATE ON public.smeksh_webhook_configs
FOR EACH ROW EXECUTE FUNCTION public.smeksh_touch_updated_at();

-- E) Webhook delivery logs
CREATE TABLE public.smeksh_webhook_delivery_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  phone_number_id TEXT,
  direction TEXT NOT NULL DEFAULT 'inbound',
  status_code INT,
  success BOOLEAN NOT NULL DEFAULT false,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ,
  latency_ms INT,
  event_type TEXT,
  error TEXT,
  raw JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX smeksh_webhook_logs_tenant_time_idx ON public.smeksh_webhook_delivery_logs(tenant_id, received_at DESC);
CREATE INDEX smeksh_webhook_logs_tenant_number_idx ON public.smeksh_webhook_delivery_logs(tenant_id, phone_number_id, received_at DESC);

-- F) Phone number access control
CREATE TABLE public.smeksh_phone_number_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  phone_number_uuid UUID NOT NULL REFERENCES public.smeksh_phone_numbers(id) ON DELETE CASCADE,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  member_id UUID REFERENCES public.tenant_members(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(phone_number_uuid, team_id, member_id)
);

CREATE INDEX smeksh_num_access_tenant_idx ON public.smeksh_phone_number_access(tenant_id);

-- G) Quality rating history
CREATE TABLE public.smeksh_quality_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  phone_number_uuid UUID NOT NULL REFERENCES public.smeksh_phone_numbers(id) ON DELETE CASCADE,
  quality_rating smeksh_quality_rating NOT NULL,
  messaging_limit smeksh_limit_tier NOT NULL,
  reason TEXT,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX smeksh_quality_history_idx ON public.smeksh_quality_history(phone_number_uuid, recorded_at DESC);

-- H) Helper function to set default number
CREATE OR REPLACE FUNCTION public.set_default_phone_number(p_tenant_id UUID, p_number_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.smeksh_phone_numbers
  SET is_default = false, updated_at = now()
  WHERE tenant_id = p_tenant_id AND is_default = true;

  UPDATE public.smeksh_phone_numbers
  SET is_default = true, updated_at = now()
  WHERE tenant_id = p_tenant_id AND id = p_number_id;
END;
$$;

-- RLS Policies
ALTER TABLE public.smeksh_wabas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smeksh_phone_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smeksh_webhook_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smeksh_webhook_delivery_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smeksh_phone_number_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smeksh_quality_history ENABLE ROW LEVEL SECURITY;

-- WABA policies
CREATE POLICY "Users can view their tenant WABAs"
ON public.smeksh_wabas FOR SELECT
USING (public.is_tenant_member(tenant_id));

CREATE POLICY "Admins can manage WABAs"
ON public.smeksh_wabas FOR ALL
USING (public.is_tenant_admin(tenant_id));

-- Phone numbers policies
CREATE POLICY "Users can view their tenant phone numbers"
ON public.smeksh_phone_numbers FOR SELECT
USING (public.is_tenant_member(tenant_id));

CREATE POLICY "Admins can manage phone numbers"
ON public.smeksh_phone_numbers FOR ALL
USING (public.is_tenant_admin(tenant_id));

-- Webhook configs policies
CREATE POLICY "Users can view their tenant webhook configs"
ON public.smeksh_webhook_configs FOR SELECT
USING (public.is_tenant_member(tenant_id));

CREATE POLICY "Admins can manage webhook configs"
ON public.smeksh_webhook_configs FOR ALL
USING (public.is_tenant_admin(tenant_id));

-- Webhook logs policies
CREATE POLICY "Users can view their tenant webhook logs"
ON public.smeksh_webhook_delivery_logs FOR SELECT
USING (public.is_tenant_member(tenant_id));

CREATE POLICY "System can insert webhook logs"
ON public.smeksh_webhook_delivery_logs FOR INSERT
WITH CHECK (true);

-- Access control policies
CREATE POLICY "Users can view phone number access"
ON public.smeksh_phone_number_access FOR SELECT
USING (public.is_tenant_member(tenant_id));

CREATE POLICY "Admins can manage phone number access"
ON public.smeksh_phone_number_access FOR ALL
USING (public.is_tenant_admin(tenant_id));

-- Quality history policies
CREATE POLICY "Users can view quality history"
ON public.smeksh_quality_history FOR SELECT
USING (public.is_tenant_member(tenant_id));

CREATE POLICY "System can insert quality history"
ON public.smeksh_quality_history FOR INSERT
WITH CHECK (true);

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.smeksh_phone_numbers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.smeksh_webhook_delivery_logs;