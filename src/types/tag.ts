export type TagType = 'first_message' | 'lifecycle' | 'intent' | 'priority' | 'automation' | 'compliance' | 'custom';
export type TagApplyTo = 'contacts' | 'conversations' | 'both';
export type TagStatus = 'active' | 'archived';

export interface Tag {
  id: string;
  tenant_id: string;
  name: string;
  color: string | null;
  tag_type: TagType;
  emoji: string | null;
  tag_group: string | null;
  status: TagStatus;
  apply_to: TagApplyTo;
  description: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  
  // Computed
  contacts_count?: number;
  conversations_count?: number;
  rules_count?: number;
  creator?: { id: string; full_name: string | null; email: string } | null;
}

export interface TagRule {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  tag_id: string;
  trigger_type: 'keyword' | 'source' | 'button_click' | 'intervention' | 'no_reply' | 'scheduled';
  trigger_config: TriggerConfig;
  action_type: 'apply_tag' | 'remove_tag' | 'assign_agent' | 'set_priority';
  action_config: ActionConfig;
  is_active: boolean;
  priority: number;
  execution_count: number;
  last_executed_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  
  // Joined
  tag?: Tag;
  creator?: { id: string; full_name: string | null; email: string } | null;
}

export interface TriggerConfig {
  keywords?: string[];
  match_type?: 'contains' | 'exact' | 'starts_with' | 'regex';
  sources?: string[];
  button_ids?: string[];
  no_reply_hours?: number;
  schedule_cron?: string;
}

export interface ActionConfig {
  tag_id?: string;
  agent_id?: string;
  priority?: string;
  remove_after_hours?: number;
}

export interface TagHistory {
  id: string;
  tenant_id: string;
  tag_id: string;
  contact_id: string | null;
  conversation_id: string | null;
  action: 'applied' | 'removed';
  applied_by: string | null;
  applied_by_rule: string | null;
  source: 'manual' | 'rule' | 'api' | 'import';
  created_at: string;
  
  tag?: Tag;
  user?: { id: string; full_name: string | null; email: string } | null;
  rule?: TagRule;
}

export const TAG_TYPE_OPTIONS: { value: TagType; label: string; emoji: string; description: string }[] = [
  { value: 'first_message', label: 'First Message', emoji: '💬', description: 'Applied based on first message content' },
  { value: 'lifecycle', label: 'Lifecycle', emoji: '🔄', description: 'Track customer journey stages' },
  { value: 'intent', label: 'Intent', emoji: '🎯', description: 'Identify customer intent' },
  { value: 'priority', label: 'Priority', emoji: '⚡', description: 'Mark urgency levels' },
  { value: 'automation', label: 'Automation', emoji: '🤖', description: 'Used by automation workflows' },
  { value: 'compliance', label: 'Compliance', emoji: '🛡️', description: 'Regulatory and consent tracking' },
  { value: 'custom', label: 'Custom', emoji: '🏷️', description: 'General purpose tags' },
];

export const TAG_COLOR_OPTIONS = [
  '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
  '#f43f5e', '#ef4444', '#f97316', '#f59e0b', '#eab308',
  '#84cc16', '#22c55e', '#10b981', '#14b8a6', '#06b6d4',
  '#0ea5e9', '#3b82f6', '#6366f1', '#64748b', '#78716c',
];

export const TRIGGER_TYPE_OPTIONS = [
  { value: 'keyword', label: 'Keyword Match', description: 'First inbound message contains keywords', icon: 'MessageSquare' },
  { value: 'source', label: 'Traffic Source', description: 'Contact came from specific source', icon: 'Globe' },
  { value: 'button_click', label: 'Button Click', description: 'User clicked interactive message button', icon: 'MousePointerClick' },
  { value: 'intervention', label: 'Agent Intervention', description: 'Bot transferred to human agent', icon: 'UserCheck' },
  { value: 'no_reply', label: 'No Reply (SLA)', description: 'No response within X hours', icon: 'Clock' },
  { value: 'scheduled', label: 'Scheduled', description: 'Run on a schedule', icon: 'Calendar' },
];

export const ACTION_TYPE_OPTIONS = [
  { value: 'apply_tag', label: 'Apply Tag', description: 'Add tag to contact/conversation' },
  { value: 'remove_tag', label: 'Remove Tag', description: 'Remove tag from contact/conversation' },
  { value: 'assign_agent', label: 'Assign Agent', description: 'Assign to specific agent' },
  { value: 'set_priority', label: 'Set Priority', description: 'Change priority level' },
];

export const STARTER_TAGS: Partial<Tag>[] = [
  { name: 'New Lead', tag_type: 'lifecycle', color: '#22c55e', emoji: '🌱' },
  { name: 'Hot Lead', tag_type: 'priority', color: '#ef4444', emoji: '🔥' },
  { name: 'VIP Customer', tag_type: 'priority', color: '#f59e0b', emoji: '⭐' },
  { name: 'Support Request', tag_type: 'intent', color: '#3b82f6', emoji: '🆘' },
  { name: 'Opted In', tag_type: 'compliance', color: '#10b981', emoji: '✅' },
  { name: 'Follow Up Required', tag_type: 'lifecycle', color: '#f97316', emoji: '📞' },
];
