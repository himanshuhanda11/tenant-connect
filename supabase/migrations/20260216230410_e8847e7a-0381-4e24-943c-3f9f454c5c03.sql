
-- Add is_auto_reply flag to messages for cooldown tracking
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS is_auto_reply BOOLEAN NOT NULL DEFAULT false;

-- Index for efficient cooldown lookups
CREATE INDEX IF NOT EXISTS idx_messages_auto_reply_cooldown 
ON public.messages (conversation_id, direction, is_auto_reply, created_at) 
WHERE direction = 'outbound' AND is_auto_reply = true;
