// WhatsApp ISV Types

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
  encrypted_access_token?: string;
  status: WabaStatus;
  name?: string;
  created_at: string;
  updated_at: string;
}

export interface PhoneNumber {
  id: string;
  tenant_id: string;
  waba_account_id: string;
  phone_number_id: string;
  display_number: string;
  verified_name?: string;
  quality_rating: QualityRating;
  status: PhoneStatus;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  tenant_id: string;
  wa_id: string;
  name?: string;
  profile_picture_url?: string;
  last_seen?: string;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  tenant_id: string;
  phone_number_id: string;
  contact_id: string;
  status: ConversationStatus;
  last_message_at?: string;
  unread_count: number;
  created_at: string;
  updated_at: string;
  // Joined fields
  contact?: Contact;
  phone_number?: PhoneNumber;
  last_message?: Message;
}

export interface Message {
  id: string;
  tenant_id: string;
  conversation_id: string;
  wamid?: string;
  direction: MessageDirection;
  type: MessageType;
  text?: string;
  media_url?: string;
  media_mime_type?: string;
  status: MessageStatus;
  error_code?: string;
  error_message?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface WebhookEvent {
  id: string;
  tenant_id?: string;
  event_type: string;
  payload: Record<string, unknown>;
  processed: boolean;
  processed_at?: string;
  error?: string;
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
