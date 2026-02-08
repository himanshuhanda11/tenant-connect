-- Create or replace the trigger function to update conversation preview on new message
CREATE OR REPLACE FUNCTION public.update_conversation_on_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.conversations
  SET 
    last_message_preview = LEFT(COALESCE(NEW.text, 'Media'), 100),
    last_message_at = NEW.created_at,
    last_message_id = NEW.id,
    updated_at = now()
  WHERE id = NEW.conversation_id;
  
  -- Also update unread_count for inbound messages
  IF NEW.direction = 'inbound' THEN
    UPDATE public.conversations
    SET unread_count = unread_count + 1
    WHERE id = NEW.conversation_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Drop if exists then create trigger
DROP TRIGGER IF EXISTS trigger_update_conversation_on_message ON public.messages;
CREATE TRIGGER trigger_update_conversation_on_message
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_conversation_on_message();

-- Backfill: update all conversations with their actual latest message
UPDATE public.conversations c
SET 
  last_message_preview = sub.text,
  last_message_at = sub.created_at,
  last_message_id = sub.id
FROM (
  SELECT DISTINCT ON (conversation_id) 
    conversation_id, id, LEFT(COALESCE(text, 'Media'), 100) as text, created_at
  FROM public.messages
  ORDER BY conversation_id, created_at DESC
) sub
WHERE c.id = sub.conversation_id;