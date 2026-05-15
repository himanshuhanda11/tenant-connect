-- Existing coexistence WABA was saved with the global system-user token which lacks
-- access to this newly-claimed WABA. Reset it so the user is forced to reconnect once,
-- after which the updated edge function will store the proper OAuth token. We cannot
-- restore the OAuth token here, so just clear it and mark status pending.
UPDATE public.waba_accounts
SET encrypted_access_token = NULL,
    token_source = NULL,
    status = 'pending',
    updated_at = now()
WHERE id = '9ad32b59-9b3f-4469-86e3-22576f4deec0'
  AND token_source = 'system_user';

UPDATE public.phone_numbers
SET status = 'pending', updated_at = now()
WHERE waba_account_id = '9ad32b59-9b3f-4469-86e3-22576f4deec0';