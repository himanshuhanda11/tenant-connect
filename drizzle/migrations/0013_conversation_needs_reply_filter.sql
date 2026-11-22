-- "Waiting for reply" = NOT replied, where replied means an agent's last reply is at or after the customer's last message
-- (same definition as isChatReplied in src/lib/inboxReplyState.ts). Exposed to the inbox as a filterable computed field.
CREATE OR REPLACE FUNCTION public.needs_reply(c public.conversations)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT NOT (c.last_agent_reply_at IS NOT NULL AND (c.last_inbound_at IS NULL OR c.last_agent_reply_at >= c.last_inbound_at));
$$;

GRANT EXECUTE ON FUNCTION public.needs_reply(public.conversations) TO authenticated, service_role;

CREATE INDEX IF NOT EXISTS idx_conversations_tenant_assigned_created
  ON public.conversations (tenant_id, assigned_to, created_at DESC);