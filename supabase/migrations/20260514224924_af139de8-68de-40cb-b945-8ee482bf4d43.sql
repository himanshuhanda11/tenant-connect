ALTER TABLE public.waba_accounts
  ADD COLUMN IF NOT EXISTS is_on_biz_app boolean,
  ADD COLUMN IF NOT EXISTS platform_type text,
  ADD COLUMN IF NOT EXISTS contacts_sync_request_id text,
  ADD COLUMN IF NOT EXISTS history_sync_request_id text,
  ADD COLUMN IF NOT EXISTS contacts_sync_status text,
  ADD COLUMN IF NOT EXISTS history_sync_status text,
  ADD COLUMN IF NOT EXISTS history_sync_progress integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS history_sharing_enabled boolean,
  ADD COLUMN IF NOT EXISTS last_smb_echo_at timestamptz,
  ADD COLUMN IF NOT EXISTS disconnect_reason text;

ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'cloud_api',
  ADD COLUMN IF NOT EXISTS is_echo boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS original_message_id text,
  ADD COLUMN IF NOT EXISTS revoked_at timestamptz,
  ADD COLUMN IF NOT EXISTS edited_at timestamptz,
  ADD COLUMN IF NOT EXISTS history_status text;

CREATE INDEX IF NOT EXISTS messages_original_message_id_idx ON public.messages (original_message_id) WHERE original_message_id IS NOT NULL;