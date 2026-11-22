
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS first_message_at timestamptz;
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS last_agent_reply_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_conversations_tenant_last_inbound ON public.conversations (tenant_id, last_inbound_at DESC);

CREATE OR REPLACE FUNCTION public.update_conversation_on_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_agent_reply boolean := NEW.direction = 'outbound' AND COALESCE(NEW.is_auto_reply, false) = false;
BEGIN
  UPDATE public.conversations
  SET
    last_message_preview = LEFT(COALESCE(NEW.text, 'Media'), 100),
    last_message_at = NEW.created_at,
    last_message_id = NEW.id,
    first_message_at = CASE
      WHEN NEW.direction IN ('inbound', 'outbound') AND (first_message_at IS NULL OR NEW.created_at < first_message_at)
      THEN NEW.created_at ELSE first_message_at END,
    last_agent_reply_at = CASE
      WHEN v_agent_reply AND (last_agent_reply_at IS NULL OR NEW.created_at > last_agent_reply_at)
      THEN NEW.created_at ELSE last_agent_reply_at END,
    unread_count = CASE WHEN NEW.direction = 'inbound' THEN unread_count + 1 ELSE unread_count END,
    updated_at = now()
  WHERE id = NEW.conversation_id;

  RETURN NEW;
END;
$function$;

-- Backfill from message history
UPDATE public.conversations c
SET first_message_at = x.first_at,
    last_agent_reply_at = x.last_reply
FROM (
  SELECT m.conversation_id,
    min(m.created_at) FILTER (WHERE m.direction IN ('inbound', 'outbound')) AS first_at,
    max(m.created_at) FILTER (WHERE m.direction = 'outbound' AND COALESCE(m.is_auto_reply, false) = false) AS last_reply
  FROM public.messages m
  GROUP BY m.conversation_id
) x
WHERE x.conversation_id = c.id
  AND (c.first_message_at IS DISTINCT FROM x.first_at OR c.last_agent_reply_at IS DISTINCT FROM x.last_reply);
