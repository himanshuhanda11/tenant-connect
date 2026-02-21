-- Add IG account, Pixel, and scope tracking columns to smeksh_meta_ad_accounts
ALTER TABLE public.smeksh_meta_ad_accounts
  ADD COLUMN IF NOT EXISTS instagram_account_id text,
  ADD COLUMN IF NOT EXISTS instagram_username text,
  ADD COLUMN IF NOT EXISTS pixel_id text,
  ADD COLUMN IF NOT EXISTS pixel_name text,
  ADD COLUMN IF NOT EXISTS scopes_granted text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS business_id text,
  ADD COLUMN IF NOT EXISTS business_name text;
