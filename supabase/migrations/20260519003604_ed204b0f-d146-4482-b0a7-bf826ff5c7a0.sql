
-- 1. Add WhatsApp verification fields to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS whatsapp_number text,
  ADD COLUMN IF NOT EXISTS whatsapp_country_code text,
  ADD COLUMN IF NOT EXISTS whatsapp_e164 text,
  ADD COLUMN IF NOT EXISTS whatsapp_verified boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS whatsapp_verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS whatsapp_verification_required boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS otp_code_hash text,
  ADD COLUMN IF NOT EXISTS otp_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS otp_attempt_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS otp_last_sent_at timestamptz;

-- 2. Grandfather existing users — don't force them through OTP
UPDATE public.profiles
SET whatsapp_verification_required = false,
    whatsapp_verified = true,
    whatsapp_verified_at = COALESCE(whatsapp_verified_at, now())
WHERE created_at < now();

-- 3. Prevent client-side tampering with verification fields
CREATE OR REPLACE FUNCTION public.protect_whatsapp_verification_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Allow service role / postgres to do anything
  IF auth.role() IS NULL OR auth.role() = 'service_role' THEN
    RETURN NEW;
  END IF;

  -- Block client from flipping verified flag or changing OTP internals
  IF NEW.whatsapp_verified IS DISTINCT FROM OLD.whatsapp_verified
     OR NEW.whatsapp_verified_at IS DISTINCT FROM OLD.whatsapp_verified_at
     OR NEW.otp_code_hash IS DISTINCT FROM OLD.otp_code_hash
     OR NEW.otp_expires_at IS DISTINCT FROM OLD.otp_expires_at
     OR NEW.otp_attempt_count IS DISTINCT FROM OLD.otp_attempt_count
     OR NEW.otp_last_sent_at IS DISTINCT FROM OLD.otp_last_sent_at
     OR NEW.whatsapp_verification_required IS DISTINCT FROM OLD.whatsapp_verification_required
  THEN
    RAISE EXCEPTION 'WhatsApp verification fields can only be modified via the verification edge functions';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_whatsapp_verification ON public.profiles;
CREATE TRIGGER trg_protect_whatsapp_verification
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.protect_whatsapp_verification_fields();

-- 4. Ensure newly-created profiles (via handle_new_user trigger or signup) default to requiring verification.
-- Already covered by DEFAULT true on the column.
