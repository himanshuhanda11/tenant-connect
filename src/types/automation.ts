// Automation Workflow Types for SMEKSH WhatsApp ISV SaaS
// Aligned with Supabase database schema

export type WorkflowStatus = 'draft' | 'active' | 'paused' | 'archived';

export type NodeType = 'trigger' | 'condition' | 'action' | 'delay' | 'branch' | 'stop';

export type TriggerType = 
  | 'new_contact_created'
  | 'first_inbound_message'
  | 'inbound_message'
  | 'outbound_message'
  | 'keyword_received'
  | 'tag_added'
  | 'tag_removed'
  | 'scheduled_time'
  | 'inactivity_no_reply'
  | 'conversation_opened'
  | 'conversation_closed'
  | 'agent_intervened'
  | 'button_clicked'
  | 'template_delivered'
  | 'template_read'
  | 'contact_updated';

export type ConditionType = 
  | 'contact_has_tag'
  | 'contact_not_has_tag'
  | 'contact_attr_eq'
  | 'contact_attr_contains'
  | 'contact_source_in'
  | 'opt_in_required'
  | 'time_window'
  | 'conversation_status_in'
  | 'assigned_agent_exists'
  | 'last_message_direction'
  | 'mau_status'
  | 'regex_match';

export type ActionType = 
  | 'send_template'
  | 'send_interactive'
  | 'add_tag'
  | 'remove_tag'
  | 'assign_agent'
  | 'set_priority'
  | 'set_status'
  | 'update_contact_attr'
  | 'add_internal_note'
  | 'create_task'
  | 'call_webhook'
  | 'stop_workflow';

export type WorkflowRunStatus = 'running' | 'success' | 'failed' | 'skipped' | 'cancelled';
export type WorkflowStepStatus = 'started' | 'success' | 'failed' | 'skipped';

export type RateLimitScope = 
  | 'workflow_per_contact'
  | 'workflow_per_workspace'
  | 'action_per_contact'
  | 'action_per_workspace'
  | 'global_per_contact';

export type CooldownScope = 'workflow' | 'node' | 'action';

// Legacy type aliases for backward compatibility
export type Workflow = WorkflowWithRelations;
export interface TriggerConfig { type: TriggerType; config: Record<string, any>; }
export interface ConditionConfig { id: string; type: ConditionType; operator: 'and' | 'or'; config: Record<string, any>; }
export interface ActionConfig { id: string; type: ActionType; config: Record<string, any>; order: number; }
export interface WorkflowGuardrails {
  max_messages_per_hour: number;
  max_messages_per_day: number;
  cooldown_minutes: number;
  require_opt_in: boolean;
  stop_on_reply: boolean;
  safe_mode: boolean;
}

// Database models
export interface AutomationWorkflow {
  id: string;
  tenant_id: string;
  name: string;
  description?: string;
  status: WorkflowStatus;
  trigger_type: TriggerType;
  trigger_config: Record<string, any>;
  enforce_opt_in_for_marketing: boolean;
  max_messages_per_contact_per_day?: number;
  cooldown_seconds?: number;
  timezone?: string;
  business_hours_config?: Record<string, any> | null;
  stop_on_customer_reply: boolean;
  stop_on_conversation_closed: boolean;
  max_messages_per_hour?: number;
  max_runs_per_contact_per_day?: number;
  version: number;
  is_deleted: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface BusinessHoursConfig {
  days: number[];  // 0 = Sunday, 1 = Monday, etc.
  start: string;   // "09:00"
  end: string;     // "18:00"
}

export interface AutomationNode {
  id: string;
  workflow_id: string;
  type: NodeType;
  node_key: string;
  name?: string;
  config: Record<string, any>;
  sort_order: number;
  position_x?: number;
  position_y?: number;
  created_at: string;
  updated_at: string;
}

export interface AutomationEdge {
  id: string;
  workflow_id: string;
  from_node_id: string;
  to_node_id: string;
  label?: string;
  condition?: Record<string, any>;
  sort_order: number;
  created_at: string;
}

export interface AutomationRun {
  id: string;
  tenant_id: string;
  workflow_id: string;
  status: WorkflowRunStatus;
  trigger_type: TriggerType;
  trigger_payload?: Record<string, any>;
  contact_id?: string;
  conversation_id?: string;
  message_id?: string;
  idempotency_key?: string;
  started_at: string;
  finished_at?: string;
  error?: string;
  error_details?: Record<string, any>;
  steps_total: number;
  steps_completed: number;
  messages_sent: number;
}

export interface AutomationStep {
  id: string;
  run_id: string;
  node_id: string;
  node_type: NodeType;
  node_name?: string;
  status: WorkflowStepStatus;
  started_at: string;
  finished_at?: string;
  duration_ms?: number;
  input_data?: Record<string, any>;
  output_data?: Record<string, any>;
  error?: string;
  error_details?: Record<string, any>;
}

// UI Types (extend database models for visual builder)
export interface WorkflowWithRelations extends AutomationWorkflow {
  nodes?: AutomationNode[];
  edges?: AutomationEdge[];
  runs?: AutomationRun[];
  stats?: WorkflowStats;
}

export interface WorkflowStats {
  runs_today: number;
  runs_7_days: number;
  success_rate: number;
  error_count: number;
  messages_sent: number;
}

export interface StarterAutomation {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'messaging' | 'routing' | 'follow_up' | 'compliance';
  trigger_type: TriggerType;
  trigger_config: Record<string, any>;
  nodes: Partial<AutomationNode>[];
  guardrails: Partial<Pick<AutomationWorkflow, 
    'enforce_opt_in_for_marketing' | 
    'max_messages_per_contact_per_day' | 
    'cooldown_seconds' | 
    'stop_on_customer_reply'
  >>;
}

// Node configuration types
export interface TriggerNodeConfig {
  type: TriggerType;
  keywords?: string[];
  match_type?: 'exact' | 'contains' | 'regex';
  case_sensitive?: boolean;
  tag_id?: string;
  tag_name?: string;
  minutes?: number;
  rrule?: string;
  requires_assigned_agent?: boolean;
}

export interface ConditionNodeConfig {
  type: ConditionType;
  tag_id?: string;
  tag_name?: string;
  attribute?: string;
  value?: string;
  operator?: 'equals' | 'contains' | 'starts_with' | 'ends_with' | 'regex';
  window?: 'business_hours' | 'after_hours' | 'weekend';
  statuses?: string[];
  direction?: 'inbound' | 'outbound';
}

export interface ActionNodeConfig {
  type: ActionType;
  template_name?: string;
  template_id?: string;
  language?: string;
  variables?: Array<{ key: string; source: string }>;
  tag_id?: string;
  tag_name?: string;
  strategy?: 'round_robin' | 'least_busy' | 'specific';
  team_id?: string;
  agent_id?: string;
  priority?: 'low' | 'medium' | 'high';
  status?: 'open' | 'pending' | 'closed';
  attribute?: string;
  value?: string;
  note?: string;
  task_title?: string;
  task_due?: string;
  webhook_url?: string;
  webhook_method?: 'POST' | 'PUT';
  webhook_headers?: Record<string, string>;
}

export interface DelayNodeConfig {
  duration: number;
  unit: 'seconds' | 'minutes' | 'hours' | 'days';
  business_hours_only?: boolean;
}

export interface BranchNodeConfig {
  branches: Array<{
    id: string;
    label: string;
    conditions: ConditionNodeConfig[];
    operator: 'and' | 'or';
  }>;
  default_branch?: string;
}

// Trigger definitions with metadata
export const TRIGGER_DEFINITIONS: Record<TriggerType, { label: string; description: string; icon: string; category: string }> = {
  new_contact_created: { label: 'New Contact Created', description: 'When a new contact is added', icon: 'UserPlus', category: 'contact' },
  first_inbound_message: { label: 'First Inbound Message', description: 'First message from a contact', icon: 'MessageSquare', category: 'message' },
  inbound_message: { label: 'Inbound Message', description: 'Any incoming message', icon: 'MessageSquareText', category: 'message' },
  outbound_message: { label: 'Outbound Message', description: 'Any outgoing message', icon: 'Send', category: 'message' },
  keyword_received: { label: 'Keyword Received', description: 'Message contains specific keywords', icon: 'Search', category: 'message' },
  tag_added: { label: 'Tag Added', description: 'When a tag is added to contact', icon: 'TagPlus', category: 'contact' },
  tag_removed: { label: 'Tag Removed', description: 'When a tag is removed', icon: 'TagMinus', category: 'contact' },
  scheduled_time: { label: 'Scheduled Time', description: 'Run at specific time', icon: 'Clock', category: 'time' },
  inactivity_no_reply: { label: 'No Reply Timeout', description: 'No response for X time', icon: 'Timer', category: 'time' },
  conversation_opened: { label: 'Conversation Opened', description: 'Conversation marked open', icon: 'MessageCircle', category: 'conversation' },
  conversation_closed: { label: 'Conversation Closed', description: 'Conversation closed', icon: 'CheckCircle', category: 'conversation' },
  agent_intervened: { label: 'Agent Intervened', description: 'Bot hands over to human', icon: 'UserCheck', category: 'routing' },
  button_clicked: { label: 'Button Clicked', description: 'Interactive button clicked', icon: 'MousePointer', category: 'message' },
  template_delivered: { label: 'Template Delivered', description: 'Template message delivered', icon: 'Send', category: 'message' },
  template_read: { label: 'Template Read', description: 'Template message read', icon: 'Eye', category: 'message' },
  contact_updated: { label: 'Contact Updated', description: 'Contact field changed', icon: 'Edit', category: 'contact' },
};

export const CONDITION_DEFINITIONS: Record<ConditionType, { label: string; description: string; icon: string }> = {
  contact_has_tag: { label: 'Has Tag', description: 'Contact has specific tag', icon: 'Tag' },
  contact_not_has_tag: { label: 'Does Not Have Tag', description: 'Contact lacks tag', icon: 'TagOff' },
  contact_attr_eq: { label: 'Attribute Equals', description: 'Field equals value', icon: 'Equal' },
  contact_attr_contains: { label: 'Attribute Contains', description: 'Field contains value', icon: 'Search' },
  contact_source_in: { label: 'Source Is', description: 'Contact source matches', icon: 'Target' },
  opt_in_required: { label: 'Opt-in Status', description: 'Marketing opt-in check', icon: 'Shield' },
  time_window: { label: 'Time Window', description: 'Business hours check', icon: 'Clock' },
  conversation_status_in: { label: 'Conversation Status', description: 'Open/pending/closed', icon: 'MessageSquare' },
  assigned_agent_exists: { label: 'Agent Assigned', description: 'Has assigned agent', icon: 'User' },
  last_message_direction: { label: 'Last Message Direction', description: 'Inbound or outbound', icon: 'ArrowLeftRight' },
  mau_status: { label: 'MAU Status', description: 'Active/inactive this month', icon: 'Activity' },
  regex_match: { label: 'Regex Match', description: 'Pattern matching', icon: 'Code' },
};

export const ACTION_DEFINITIONS: Record<ActionType, { label: string; description: string; icon: string; category: string }> = {
  send_template: { label: 'Send Template', description: 'Send approved template', icon: 'FileText', category: 'messaging' },
  send_interactive: { label: 'Send Interactive', description: 'Send buttons/list', icon: 'LayoutList', category: 'messaging' },
  add_tag: { label: 'Add Tag', description: 'Add tag to contact', icon: 'TagPlus', category: 'tagging' },
  remove_tag: { label: 'Remove Tag', description: 'Remove tag', icon: 'TagMinus', category: 'tagging' },
  assign_agent: { label: 'Assign Agent', description: 'Assign to agent/team', icon: 'UserPlus', category: 'routing' },
  set_priority: { label: 'Set Priority', description: 'Set conversation priority', icon: 'Flag', category: 'routing' },
  set_status: { label: 'Set Status', description: 'Open/pending/close', icon: 'CheckCircle', category: 'routing' },
  update_contact_attr: { label: 'Update Contact', description: 'Update contact field', icon: 'Edit', category: 'contact' },
  add_internal_note: { label: 'Add Note', description: 'Internal team note', icon: 'StickyNote', category: 'task' },
  create_task: { label: 'Create Task', description: 'Create follow-up task', icon: 'ClipboardList', category: 'task' },
  call_webhook: { label: 'Call Webhook', description: 'POST to external URL', icon: 'Webhook', category: 'integration' },
  stop_workflow: { label: 'Stop Workflow', description: 'End execution', icon: 'StopCircle', category: 'flow' },
};

export const CONDITION_PRESETS = [
  { id: 'vip_only', name: 'VIP Only', conditions: [{ type: 'contact_has_tag' as ConditionType, config: { tag_name: 'VIP' } }] },
  { id: 'after_hours', name: 'After Hours Only', conditions: [{ type: 'time_window' as ConditionType, config: { window: 'after_hours' } }] },
  { id: 'new_lead', name: 'New Lead Only', conditions: [{ type: 'contact_attr_eq' as ConditionType, config: { attribute: 'lead_status', value: 'new' } }] },
  { id: 'opted_in', name: 'Opted-In Only', conditions: [{ type: 'opt_in_required' as ConditionType, config: { status: true } }] },
];
