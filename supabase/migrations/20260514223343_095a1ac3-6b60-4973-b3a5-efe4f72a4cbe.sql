ALTER TABLE public.waba_accounts
  ADD COLUMN IF NOT EXISTS coexistence_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS coexistence_status text,
  ADD COLUMN IF NOT EXISTS coexistence_eligibility text,
  ADD COLUMN IF NOT EXISTS coexistence_error text,
  ADD COLUMN IF NOT EXISTS coexistence_checked_at timestamptz;