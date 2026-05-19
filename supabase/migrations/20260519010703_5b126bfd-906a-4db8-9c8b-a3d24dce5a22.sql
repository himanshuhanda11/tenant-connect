-- Trusted devices for WhatsApp OTP "remember this device" (30 days)
CREATE TABLE IF NOT EXISTS public.trusted_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_hash TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_used_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '30 days'),
  UNIQUE (user_id, device_hash)
);

CREATE INDEX IF NOT EXISTS idx_trusted_devices_user ON public.trusted_devices(user_id);
CREATE INDEX IF NOT EXISTS idx_trusted_devices_expires ON public.trusted_devices(expires_at);

ALTER TABLE public.trusted_devices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own trusted devices"
  ON public.trusted_devices FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can revoke their own trusted devices"
  ON public.trusted_devices FOR DELETE
  USING (auth.uid() = user_id);

-- Inserts/updates only happen from service-role edge functions (no user policy on purpose).

-- Helper: is the current user's device trusted and not expired?
CREATE OR REPLACE FUNCTION public.is_device_trusted(_device_hash TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.trusted_devices
    WHERE user_id = auth.uid()
      AND device_hash = _device_hash
      AND expires_at > now()
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_device_trusted(TEXT) TO authenticated;
