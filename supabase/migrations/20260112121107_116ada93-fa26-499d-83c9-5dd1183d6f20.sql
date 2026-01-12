-- Add unique index on messages for idempotent upserts by wamid
CREATE UNIQUE INDEX IF NOT EXISTS messages_tenant_wamid_key 
  ON public.messages (tenant_id, wamid) 
  WHERE wamid IS NOT NULL;

-- The conversations unique index already covers phone_number_id + contact_id
-- which is sufficient since phone_number_id is already tenant-scoped

-- Add index for faster webhook event lookups
CREATE INDEX IF NOT EXISTS webhook_events_id_key_idx 
  ON public.webhook_events (id_key) 
  WHERE id_key IS NOT NULL;

-- Allow service role to insert/update webhook events and messages
-- (these tables have restrictive RLS but webhook runs with service role key)