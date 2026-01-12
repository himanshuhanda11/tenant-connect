-- Add columns for better webhook handling and message tracking

-- Add id_key for idempotency to webhook_events
ALTER TABLE public.webhook_events ADD COLUMN IF NOT EXISTS id_key TEXT UNIQUE;

-- Add raw payload storage to messages
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS raw JSONB;

-- Add delivery timestamps to messages
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS sent_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS read_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS failed_at TIMESTAMP WITH TIME ZONE;

-- Add context_message_id for reply tracking
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS context_message_id TEXT;

-- Add notes/internal comments table for conversations
CREATE TABLE IF NOT EXISTS public.conversation_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add assigned_to for conversation assignment
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES public.profiles(id);

-- Create index for id_key lookups
CREATE INDEX IF NOT EXISTS idx_webhook_events_id_key ON public.webhook_events(id_key);

-- Create index for message timestamps
CREATE INDEX IF NOT EXISTS idx_messages_delivered_at ON public.messages(delivered_at);
CREATE INDEX IF NOT EXISTS idx_messages_read_at ON public.messages(read_at);

-- Create index for conversation assignment
CREATE INDEX IF NOT EXISTS idx_conversations_assigned_to ON public.conversations(assigned_to);

-- Enable RLS on conversation_notes
ALTER TABLE public.conversation_notes ENABLE ROW LEVEL SECURITY;

-- RLS policies for conversation_notes
CREATE POLICY "Users can view notes in their tenant"
ON public.conversation_notes FOR SELECT
USING (is_tenant_member(auth.uid(), tenant_id));

CREATE POLICY "Users can manage notes in their tenant"
ON public.conversation_notes FOR ALL
USING (is_tenant_member(auth.uid(), tenant_id));

-- Add trigger for updating message timestamps based on status
CREATE OR REPLACE FUNCTION public.update_message_timestamps()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'sent' AND OLD.status = 'pending' THEN
    NEW.sent_at = now();
  ELSIF NEW.status = 'delivered' AND OLD.status IN ('pending', 'sent') THEN
    NEW.delivered_at = now();
  ELSIF NEW.status = 'read' AND OLD.status IN ('pending', 'sent', 'delivered') THEN
    NEW.read_at = now();
  ELSIF NEW.status = 'failed' THEN
    NEW.failed_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_message_timestamps
BEFORE UPDATE ON public.messages
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION public.update_message_timestamps();

-- Add 24-hour window tracking to conversations
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS last_inbound_at TIMESTAMP WITH TIME ZONE;