// Inbox Types for SMEKSH Live Chat

export type MessageDirection = 'inbound' | 'outbound';
export type MessageType = 'text' | 'image' | 'video' | 'audio' | 'document' | 'sticker' | 'location' | 'contact' | 'interactive' | 'template' | 'system';
export type WAStatus = 'sent' | 'delivered' | 'read' | 'failed';
export type ConversationEventType = 
  | 'conversation_created' | 'status_changed' | 'assigned' | 'unassigned'
  | 'tag_added' | 'tag_removed' | 'note_added' | 'automation_ran'
  | 'campaign_sent' | 'ctwa_attributed' | 'snoozed' | 'unsnoozed'
  | 'priority_changed' | 'intervened' | 'bot_resumed';
export type NoteVisibility = 'internal' | 'private';
export type TypingStatus = 'typing' | 'stopped';
export type ConversationStatus = 'open' | 'pending' | 'closed';
export type Priority = 'low' | 'normal' | 'high' | 'urgent';

export interface InboxMessage {
  id: string;
  tenant_id: string;
  conversation_id: string;
  contact_id?: string;
  direction: MessageDirection;
  message_type: MessageType;
  wa_message_id?: string;
  wa_context_id?: string;
  sent_by_profile_id?: string;
  body_text?: string;
  payload: Record<string, unknown>;
  media_bucket?: string;
  media_path?: string;
  media_url?: string;
  media_mime_type?: string;
  media_size_bytes?: number;
  media_filename?: string;
  template_name?: string;
  template_language?: string;
  template_category?: string;
  template_variables?: Record<string, unknown>;
  latest_status?: WAStatus;
  latest_status_at?: string;
  is_failed: boolean;
  error_code?: string;
  error_message?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  sender?: {
    id: string;
    full_name?: string;
    avatar_url?: string;
  };
}

export interface InboxConversation {
  id: string;
  tenant_id: string;
  contact_id: string;
  phone_number_id: string;
  status: ConversationStatus;
  assigned_to?: string;
  unread_count: number;
  last_message_at?: string;
  last_message_preview?: string;
  last_message_id?: string;
  last_inbound_at?: string;
  priority?: Priority;
  is_intervened: boolean;
  intervened_by?: string;
  intervened_at?: string;
  source?: string;
  first_response_at?: string;
  sla_first_response_due?: string;
  sla_breached: boolean;
  created_at: string;
  updated_at: string;
  // Joined data
  contact?: {
    id: string;
    name?: string;
    first_name?: string;
    wa_id: string;
    profile_picture_url?: string;
    opt_out?: boolean;
    language?: string;
  };
  assigned_agent?: {
    id: string;
    full_name?: string;
    avatar_url?: string;
  };
  tags?: Array<{
    id: string;
    name: string;
    color?: string;
  }>;
  active_snooze?: {
    id: string;
    snooze_until: string;
    reason?: string;
  };
  phone_number_status?: string;
}

export interface ConversationEvent {
  id: string;
  tenant_id: string;
  conversation_id: string;
  contact_id?: string;
  event_type: ConversationEventType;
  actor_profile_id?: string;
  actor_type: string;
  message_id?: string;
  from_assigned_to?: string;
  to_assigned_to?: string;
  team_id?: string;
  tag_id?: string;
  tag_name?: string;
  tag_reason?: string;
  automation_workflow_id?: string;
  campaign_id?: string;
  ctwa_lead_id?: string;
  old_value?: string;
  new_value?: string;
  details: Record<string, unknown>;
  created_at: string;
  // Joined data
  actor?: {
    id: string;
    full_name?: string;
    avatar_url?: string;
  };
}

export interface InternalNote {
  id: string;
  tenant_id: string;
  conversation_id: string;
  contact_id?: string;
  author_profile_id?: string;
  visibility: NoteVisibility;
  body: string;
  mentions_profile_ids: string[];
  attachments: unknown[];
  created_at: string;
  updated_at: string;
  // Joined data
  author?: {
    id: string;
    full_name?: string;
    avatar_url?: string;
  };
}

export interface ConversationSnooze {
  id: string;
  tenant_id: string;
  conversation_id: string;
  contact_id?: string;
  snoozed_by_profile_id?: string;
  snooze_until: string;
  reason?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface TypingState {
  tenant_id: string;
  conversation_id: string;
  profile_id: string;
  status: TypingStatus;
  updated_at: string;
  expires_at: string;
  // Joined data
  profile?: {
    id: string;
    full_name?: string;
  };
}

export interface InboxFilters {
  status?: ConversationStatus | 'all';
  assignment?: 'all' | 'mine' | 'unassigned' | 'team';
  priority?: Priority | 'all';
  hasUnread?: boolean;
  slaRisk?: boolean;
  tags?: string[];
  source?: string;
  search?: string;
}

export type InboxView = 'all' | 'mine' | 'unassigned' | 'sla_risk' | 'vip' | 'closed' | 'snoozed';

export const INBOX_VIEW_CONFIG: Record<InboxView, { label: string; icon: string; filter: Partial<InboxFilters> }> = {
  all: { label: 'All', icon: 'inbox', filter: { status: 'all' } },
  mine: { label: 'Mine', icon: 'user', filter: { assignment: 'mine' } },
  unassigned: { label: 'Unassigned', icon: 'user-x', filter: { assignment: 'unassigned' } },
  sla_risk: { label: 'SLA Risk', icon: 'alert-triangle', filter: { slaRisk: true } },
  vip: { label: 'VIP', icon: 'star', filter: { priority: 'urgent' } },
  closed: { label: 'Closed', icon: 'check-circle', filter: { status: 'closed' } },
  snoozed: { label: 'Snoozed', icon: 'clock', filter: {} },
};

export const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; bgColor: string }> = {
  low: { label: 'Low', color: 'text-muted-foreground', bgColor: 'bg-muted' },
  normal: { label: 'Normal', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  high: { label: 'High', color: 'text-amber-600', bgColor: 'bg-amber-100' },
  urgent: { label: 'Urgent', color: 'text-red-600', bgColor: 'bg-red-100' },
};

export const STATUS_CONFIG: Record<ConversationStatus, { label: string; color: string; bgColor: string }> = {
  open: { label: 'Open', color: 'text-green-600', bgColor: 'bg-green-100' },
  pending: { label: 'Pending', color: 'text-amber-600', bgColor: 'bg-amber-100' },
  closed: { label: 'Closed', color: 'text-muted-foreground', bgColor: 'bg-muted' },
};

// Mock data for demo
export const MOCK_CONVERSATIONS: InboxConversation[] = [
  {
    id: '1',
    tenant_id: '1',
    contact_id: 'c1',
    phone_number_id: 'p1',
    status: 'open',
    assigned_to: 'u1',
    unread_count: 3,
    last_message_at: new Date(Date.now() - 2 * 60000).toISOString(),
    last_message_preview: 'Hi, I wanted to ask about the pricing for your premium plan...',
    priority: 'high',
    is_intervened: false,
    source: 'meta_ads',
    sla_breached: false,
    created_at: new Date(Date.now() - 3600000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 60000).toISOString(),
    contact: {
      id: 'c1',
      name: 'Sarah Johnson',
      first_name: 'Sarah',
      wa_id: '971501234567',
      profile_picture_url: null,
      opt_out: false,
      language: 'en',
    },
    assigned_agent: {
      id: 'u1',
      full_name: 'Ahmed Hassan',
      avatar_url: null,
    },
    tags: [
      { id: 't1', name: 'VIP', color: '#FFD700' },
      { id: 't2', name: 'Pricing', color: '#3B82F6' },
    ],
  },
  {
    id: '2',
    tenant_id: '1',
    contact_id: 'c2',
    phone_number_id: 'p1',
    status: 'open',
    unread_count: 1,
    last_message_at: new Date(Date.now() - 15 * 60000).toISOString(),
    last_message_preview: 'When will my order be delivered?',
    priority: 'normal',
    is_intervened: false,
    source: 'website',
    sla_breached: false,
    created_at: new Date(Date.now() - 7200000).toISOString(),
    updated_at: new Date(Date.now() - 15 * 60000).toISOString(),
    contact: {
      id: 'c2',
      name: 'Mohammed Ali',
      first_name: 'Mohammed',
      wa_id: '971509876543',
      opt_out: false,
    },
    tags: [
      { id: 't3', name: 'Support', color: '#10B981' },
    ],
  },
  {
    id: '3',
    tenant_id: '1',
    contact_id: 'c3',
    phone_number_id: 'p1',
    status: 'pending',
    assigned_to: 'u1',
    unread_count: 0,
    last_message_at: new Date(Date.now() - 30 * 60000).toISOString(),
    last_message_preview: 'I\'ll check and get back to you',
    priority: 'normal',
    is_intervened: true,
    intervened_by: 'u1',
    intervened_at: new Date(Date.now() - 25 * 60000).toISOString(),
    source: 'direct',
    sla_breached: false,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 30 * 60000).toISOString(),
    contact: {
      id: 'c3',
      name: 'Fatima Rahman',
      first_name: 'Fatima',
      wa_id: '971505551234',
      opt_out: false,
    },
    assigned_agent: {
      id: 'u1',
      full_name: 'Ahmed Hassan',
    },
  },
  {
    id: '4',
    tenant_id: '1',
    contact_id: 'c4',
    phone_number_id: 'p1',
    status: 'open',
    unread_count: 5,
    last_message_at: new Date(Date.now() - 5 * 60000).toISOString(),
    last_message_preview: 'This is urgent! I need help immediately',
    priority: 'urgent',
    is_intervened: false,
    source: 'qr',
    sla_first_response_due: new Date(Date.now() + 60000).toISOString(),
    sla_breached: false,
    created_at: new Date(Date.now() - 600000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 60000).toISOString(),
    contact: {
      id: 'c4',
      name: 'John Smith',
      first_name: 'John',
      wa_id: '14155551234',
      opt_out: false,
    },
    tags: [
      { id: 't4', name: 'Urgent', color: '#EF4444' },
    ],
  },
];

export const MOCK_MESSAGES: InboxMessage[] = [
  {
    id: 'm1',
    tenant_id: '1',
    conversation_id: '1',
    contact_id: 'c1',
    direction: 'inbound',
    message_type: 'text',
    body_text: 'Hi, I wanted to ask about the pricing for your premium plan. Can you help?',
    payload: {},
    is_failed: false,
    created_at: new Date(Date.now() - 5 * 60000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 60000).toISOString(),
  },
  {
    id: 'm2',
    tenant_id: '1',
    conversation_id: '1',
    direction: 'outbound',
    message_type: 'text',
    body_text: 'Hello Sarah! Of course, I\'d be happy to help you with pricing information.',
    payload: {},
    sent_by_profile_id: 'u1',
    latest_status: 'read',
    latest_status_at: new Date(Date.now() - 4 * 60000).toISOString(),
    is_failed: false,
    created_at: new Date(Date.now() - 4 * 60000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 60000).toISOString(),
    sender: {
      id: 'u1',
      full_name: 'Ahmed Hassan',
    },
  },
  {
    id: 'm3',
    tenant_id: '1',
    conversation_id: '1',
    contact_id: 'c1',
    direction: 'inbound',
    message_type: 'text',
    body_text: 'Great! What are the features included in the premium plan?',
    payload: {},
    is_failed: false,
    created_at: new Date(Date.now() - 3 * 60000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 60000).toISOString(),
  },
  {
    id: 'm4',
    tenant_id: '1',
    conversation_id: '1',
    contact_id: 'c1',
    direction: 'inbound',
    message_type: 'text',
    body_text: 'Also, do you offer any discounts for annual subscriptions?',
    payload: {},
    is_failed: false,
    created_at: new Date(Date.now() - 2 * 60000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 60000).toISOString(),
  },
];
