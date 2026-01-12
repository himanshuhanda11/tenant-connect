// WhatsApp ISV Types - Updated to match Supabase schema

export type WabaStatus = 'pending' | 'active' | 'suspended' | 'disconnected';
export type PhoneStatus = 'pending' | 'connected' | 'disconnected' | 'banned';
export type QualityRating = 'GREEN' | 'YELLOW' | 'RED' | 'UNKNOWN';
export type ConversationStatus = 'open' | 'closed' | 'expired';
export type MessageDirection = 'inbound' | 'outbound';
export type MessageType = 'text' | 'image' | 'video' | 'audio' | 'document' | 'sticker' | 'location' | 'contact' | 'template' | 'interactive' | 'reaction' | 'unknown';
export type MessageStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed';

export interface WabaAccount {
  id: string;
  tenant_id: string;
  business_id: string;
  waba_id: string;
  encrypted_access_token?: string | null;
  status: WabaStatus;
  name?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PhoneNumber {
  id: string;
  tenant_id: string;
  waba_account_id: string;
  phone_number_id: string;
  display_number: string;
  verified_name?: string | null;
  quality_rating: QualityRating;
  status: PhoneStatus;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  tenant_id: string;
  wa_id: string;
  name?: string | null;
  profile_picture_url?: string | null;
  last_seen?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  tenant_id: string;
  phone_number_id: string;
  contact_id: string;
  status: ConversationStatus;
  last_message_at?: string | null;
  last_inbound_at?: string | null;
  assigned_to?: string | null;
  unread_count: number;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  tenant_id: string;
  conversation_id: string;
  wamid?: string | null;
  direction: MessageDirection;
  type: MessageType;
  text?: string | null;
  media_url?: string | null;
  media_mime_type?: string | null;
  status: MessageStatus;
  error_code?: string | null;
  error_message?: string | null;
  context_message_id?: string | null;
  raw?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
  sent_at?: string | null;
  delivered_at?: string | null;
  read_at?: string | null;
  failed_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ConversationNote {
  id: string;
  tenant_id: string;
  conversation_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export interface WebhookEvent {
  id: string;
  tenant_id?: string | null;
  id_key?: string | null;
  event_type: string;
  payload: Record<string, unknown>;
  processed: boolean;
  processed_at?: string | null;
  error?: string | null;
  created_at: string;
}

// API Request/Response types
export interface SendMessageRequest {
  conversation_id: string;
  type: MessageType;
  text?: string;
  media_url?: string;
  template_name?: string;
  template_params?: Record<string, string>;
}

export interface SendMessageResponse {
  success: boolean;
  message_id?: string;
  wamid?: string;
  error?: string;
}
