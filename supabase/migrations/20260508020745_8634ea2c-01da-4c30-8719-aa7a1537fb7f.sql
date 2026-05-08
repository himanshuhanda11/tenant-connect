
-- Storage bucket for permanent account deletion archives (CSV files)
INSERT INTO storage.buckets (id, name, public)
VALUES ('account-archives', 'account-archives', false)
ON CONFLICT (id) DO NOTHING;

-- Only service role can read/write (no public/user policies needed; signed URLs used).
DROP POLICY IF EXISTS "Service role manage account-archives" ON storage.objects;
CREATE POLICY "Service role manage account-archives"
ON storage.objects FOR ALL TO service_role
USING (bucket_id = 'account-archives')
WITH CHECK (bucket_id = 'account-archives');

-- Track reminder emails to avoid duplicate sends
CREATE TABLE IF NOT EXISTS public.signup_reminder_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  email TEXT NOT NULL,
  reminder_type TEXT NOT NULL,            -- 'signup' or 'workspace'
  reminder_stage TEXT NOT NULL,           -- '1h' | '24h' | '3d'
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, reminder_type, reminder_stage)
);

ALTER TABLE public.signup_reminder_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service role full access" ON public.signup_reminder_log;
CREATE POLICY "service role full access"
ON public.signup_reminder_log FOR ALL TO service_role
USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_signup_reminder_log_user
  ON public.signup_reminder_log (user_id, reminder_type);
