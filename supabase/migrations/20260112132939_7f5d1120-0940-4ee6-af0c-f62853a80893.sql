-- Add DELETE policy for profiles to support GDPR right to erasure
-- Note: Full account deletion should use the delete-account Edge Function,
-- but this policy provides a safety net for profile-only deletion if needed

CREATE POLICY "Users can delete their own profile"
ON public.profiles FOR DELETE
TO authenticated
USING (id = auth.uid());

-- Create a secure view for waba_accounts that excludes the access token
-- This prevents client-side access to sensitive credentials
CREATE OR REPLACE VIEW public.waba_accounts_public AS
SELECT 
  id,
  tenant_id,
  business_id,
  waba_id,
  name,
  status,
  created_at,
  updated_at
FROM public.waba_accounts;

-- Grant access to the view for authenticated users
GRANT SELECT ON public.waba_accounts_public TO authenticated;

-- Revoke direct SELECT on the encrypted_access_token column from authenticated users
-- Note: Service role still has full access for Edge Functions
REVOKE SELECT (encrypted_access_token) ON public.waba_accounts FROM authenticated;