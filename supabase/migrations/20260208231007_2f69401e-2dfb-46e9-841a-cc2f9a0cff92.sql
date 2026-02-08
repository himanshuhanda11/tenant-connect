-- Fix the trigger to use correct column name 'text' instead of 'body_text'
CREATE OR REPLACE FUNCTION public.update_conversation_on_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.conversations
  SET 
    last_message_at = NEW.created_at,
    last_message_preview = LEFT(NEW.text, 100),
    last_message_id = NEW.id,
    updated_at = now()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Backfill last_message_preview for existing conversations
UPDATE public.conversations c
SET last_message_preview = sub.preview
FROM (
  SELECT DISTINCT ON (conversation_id) 
    conversation_id, 
    LEFT(text, 100) as preview
  FROM public.messages
  ORDER BY conversation_id, created_at DESC
) sub
WHERE c.id = sub.conversation_id AND c.last_message_preview IS NULL;