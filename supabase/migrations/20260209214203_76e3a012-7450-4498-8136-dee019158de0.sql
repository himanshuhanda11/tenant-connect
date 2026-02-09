
-- Add meta_access_token column to store the Facebook/Meta access token for ads API calls
ALTER TABLE public.smeksh_meta_ad_accounts 
ADD COLUMN IF NOT EXISTS meta_access_token text;

-- Add a column to store fetched ad accounts/pages data during setup
ALTER TABLE public.smeksh_meta_ad_accounts 
ADD COLUMN IF NOT EXISTS setup_data jsonb;
