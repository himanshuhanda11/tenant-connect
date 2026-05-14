ALTER TABLE public.waba_accounts
  ADD COLUMN IF NOT EXISTS onboarding_type text NOT NULL DEFAULT 'normal_api';