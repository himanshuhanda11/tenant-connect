-- Create enum types for status fields
CREATE TYPE waba_status AS ENUM ('pending', 'active', 'suspended', 'disconnected');
CREATE TYPE phone_status AS ENUM ('pending', 'connected', 'disconnected', 'banned');
CREATE TYPE quality_rating AS ENUM ('GREEN', 'YELLOW', 'RED', 'UNKNOWN');
CREATE TYPE conversation_status AS ENUM ('open', 'closed', 'expired');
CREATE TYPE message_direction AS ENUM ('inbound', 'outbound');
CREATE TYPE message_type AS ENUM ('text', 'image', 'video', 'audio', 'document', 'sticker', 'location', 'contact', 'template', 'interactive', 'reaction', 'unknown');
CREATE TYPE message_status AS ENUM ('pending', 'sent', 'delivered', 'read', 'failed');

-- WABA Accounts table
CREATE TABLE public.waba_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  business_id TEXT NOT NULL,
  waba_id TEXT NOT NULL,
  encrypted_access_token TEXT,
  status waba_status NOT NULL DEFAULT 'pending',
  name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, waba_id)
);

-- Phone Numbers table
CREATE TABLE public.phone_numbers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  waba_account_id UUID NOT NULL REFERENCES public.waba_accounts(id) ON DELETE CASCADE,
  phone_number_id TEXT NOT NULL,
  display_number TEXT NOT NULL,
  verified_name TEXT,
  quality_rating quality_rating NOT NULL DEFAULT 'UNKNOWN',
  status phone_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, phone_number_id)
);

-- Contacts table
CREATE TABLE public.contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  wa_id TEXT NOT NULL,
  name TEXT,
  profile_picture_url TEXT,
  last_seen TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, wa_id)
);

-- Conversations table
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  phone_number_id UUID NOT NULL REFERENCES public.phone_numbers(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  status conversation_status NOT NULL DEFAULT 'open',
  last_message_at TIMESTAMPTZ,
  unread_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(phone_number_id, contact_id)
);

-- Messages table
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  wamid TEXT,
  direction message_direction NOT NULL,
  type message_type NOT NULL DEFAULT 'text',
  text TEXT,
  media_url TEXT,
  media_mime_type TEXT,
  status message_status NOT NULL DEFAULT 'pending',
  error_code TEXT,
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Webhook events table (for raw payload storage)
CREATE TABLE public.webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  processed BOOLEAN NOT NULL DEFAULT false,
  processed_at TIMESTAMPTZ,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_waba_accounts_tenant ON public.waba_accounts(tenant_id);
CREATE INDEX idx_phone_numbers_tenant ON public.phone_numbers(tenant_id);
CREATE INDEX idx_phone_numbers_waba ON public.phone_numbers(waba_account_id);
CREATE INDEX idx_contacts_tenant ON public.contacts(tenant_id);
CREATE INDEX idx_contacts_wa_id ON public.contacts(tenant_id, wa_id);
CREATE INDEX idx_conversations_tenant ON public.conversations(tenant_id);
CREATE INDEX idx_conversations_phone ON public.conversations(phone_number_id);
CREATE INDEX idx_conversations_contact ON public.conversations(contact_id);
CREATE INDEX idx_conversations_last_message ON public.conversations(tenant_id, last_message_at DESC);
CREATE INDEX idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX idx_messages_wamid ON public.messages(wamid) WHERE wamid IS NOT NULL;
CREATE INDEX idx_messages_created ON public.messages(conversation_id, created_at DESC);
CREATE INDEX idx_webhook_events_unprocessed ON public.webhook_events(processed, created_at) WHERE processed = false;

-- Enable RLS on all tables
ALTER TABLE public.waba_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.phone_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for waba_accounts
CREATE POLICY "Users can view WABA accounts in their tenant"
ON public.waba_accounts FOR SELECT TO authenticated
USING (is_tenant_member(auth.uid(), tenant_id));

CREATE POLICY "Owner/Admin can manage WABA accounts"
ON public.waba_accounts FOR ALL TO authenticated
USING (has_tenant_role(auth.uid(), tenant_id, ARRAY['owner'::tenant_role, 'admin'::tenant_role]));

-- RLS Policies for phone_numbers
CREATE POLICY "Users can view phone numbers in their tenant"
ON public.phone_numbers FOR SELECT TO authenticated
USING (is_tenant_member(auth.uid(), tenant_id));

CREATE POLICY "Owner/Admin can manage phone numbers"
ON public.phone_numbers FOR ALL TO authenticated
USING (has_tenant_role(auth.uid(), tenant_id, ARRAY['owner'::tenant_role, 'admin'::tenant_role]));

-- RLS Policies for contacts
CREATE POLICY "Users can view contacts in their tenant"
ON public.contacts FOR SELECT TO authenticated
USING (is_tenant_member(auth.uid(), tenant_id));

CREATE POLICY "Users can manage contacts in their tenant"
ON public.contacts FOR ALL TO authenticated
USING (is_tenant_member(auth.uid(), tenant_id));

-- RLS Policies for conversations
CREATE POLICY "Users can view conversations in their tenant"
ON public.conversations FOR SELECT TO authenticated
USING (is_tenant_member(auth.uid(), tenant_id));

CREATE POLICY "Users can manage conversations in their tenant"
ON public.conversations FOR ALL TO authenticated
USING (is_tenant_member(auth.uid(), tenant_id));

-- RLS Policies for messages
CREATE POLICY "Users can view messages in their tenant"
ON public.messages FOR SELECT TO authenticated
USING (is_tenant_member(auth.uid(), tenant_id));

CREATE POLICY "Users can manage messages in their tenant"
ON public.messages FOR ALL TO authenticated
USING (is_tenant_member(auth.uid(), tenant_id));

-- Webhook events are accessed by service role only (edge functions)
-- No user-facing RLS policies needed

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.waba_accounts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.phone_numbers TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.contacts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.conversations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.messages TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.webhook_events TO authenticated;

-- Update triggers for updated_at
CREATE TRIGGER update_waba_accounts_updated_at BEFORE UPDATE ON public.waba_accounts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_phone_numbers_updated_at BEFORE UPDATE ON public.phone_numbers
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON public.contacts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON public.conversations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON public.messages
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for conversations and messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;