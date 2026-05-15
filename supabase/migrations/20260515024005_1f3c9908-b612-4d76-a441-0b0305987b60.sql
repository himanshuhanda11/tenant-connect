CREATE TABLE IF NOT EXISTS public.whatsapp_profile_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid,
  workspace_id uuid,
  phone_number_id text,
  waba_account_id uuid,
  action text NOT NULL,
  request_payload jsonb,
  meta_response jsonb,
  status text NOT NULL,
  error_code text,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wa_profile_logs_tenant ON public.whatsapp_profile_logs(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wa_profile_logs_phone ON public.whatsapp_profile_logs(phone_number_id, created_at DESC);

ALTER TABLE public.whatsapp_profile_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "wa_profile_logs_select" ON public.whatsapp_profile_logs;
CREATE POLICY "wa_profile_logs_select"
  ON public.whatsapp_profile_logs FOR SELECT TO authenticated
  USING (tenant_id IS NULL OR is_tenant_member(tenant_id));