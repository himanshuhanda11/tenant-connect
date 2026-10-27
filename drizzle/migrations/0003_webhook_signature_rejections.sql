CREATE TABLE public.webhook_signature_rejections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  signature text,
  body text
);
GRANT ALL ON public.webhook_signature_rejections TO service_role;
ALTER TABLE public.webhook_signature_rejections ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.webhook_signature_rejections IS 'Temporary server-only capture of rejected WhatsApp webhooks for signature diagnosis; no client access.';