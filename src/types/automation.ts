// Automation Workflow Types for SMEKSH WhatsApp ISV SaaS

export type WorkflowStatus = 'active' | 'paused' | 'draft';

export type TriggerType = 
  | 'new_contact'
  | 'first_inbound_message'
  | 'keyword_received'
  | 'tag_added'
  | 'tag_removed'
  | 'scheduled_time'
  | 'inactivity'
  | 'conversation_opened'
  | 'conversation_closed'
  | 'agent_intervention'
  | 'button_clicked'
  | 'template_delivered'
  | 'template_read'
  | 'lead_source_captured';

export type ConditionType = 
  | 'has_tag'
  | 'not_has_tag'
  | 'attribute_equals'
  | 'attribute_contains'
  | 'time_window'
  | 'conversation_status'
  | 'last_message_direction'
  | 'agent_assigned'
  | 'mau_status'
  | 'opt_in_status';

export type ActionType = 
  | 'send_template'
  | 'send_interactive'
  | 'add_tag'
  | 'remove_tag'
  | 'assign_agent'
  | 'set_priority'
  | 'set_conversation_status'
  | 'create_task'
  | 'add_internal_note'
  | 'call_webhook'
  | 'update_contact_attribute'
  | 'delay'
  | 'stop_workflow';

export interface TriggerConfig {
  type: TriggerType;
  config: Record<string, any>;
}

export interface ConditionConfig {
  id: string;
  type: ConditionType;
  operator: 'and' | 'or';
  config: Record<string, any>;
}

export interface ActionConfig {
  id: string;
  type: ActionType;
  config: Record<string, any>;
  order: number;
}

export interface WorkflowNode {
  id: string;
  type: 'trigger' | 'condition' | 'action' | 'delay';
  data: TriggerConfig | ConditionConfig | ActionConfig;
  position: { x: number; y: number };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface Workflow {
  id: string;
  tenant_id: string;
  name: string;
  description?: string;
  status: WorkflowStatus;
  trigger: TriggerConfig;
  conditions: ConditionConfig[];
  actions: ActionConfig[];
  nodes?: WorkflowNode[];
  edges?: WorkflowEdge[];
  guardrails: WorkflowGuardrails;
  stats: WorkflowStats;
  created_at: string;
  updated_at: string;
  last_run_at?: string;
  created_by?: string;
}

export interface WorkflowGuardrails {
  max_messages_per_hour: number;
  max_messages_per_day: number;
  cooldown_minutes: number;
  require_opt_in: boolean;
  stop_on_reply: boolean;
  safe_mode: boolean;
}

export interface WorkflowStats {
  runs_today: number;
  runs_7_days: number;
  success_rate: number;
  error_count: number;
  messages_sent: number;
}

export interface WorkflowRun {
  id: string;
  workflow_id: string;
  contact_id: string;
  started_at: string;
  completed_at?: string;
  status: 'running' | 'completed' | 'failed' | 'skipped';
  skip_reason?: string;
  steps: WorkflowRunStep[];
}

export interface WorkflowRunStep {
  id: string;
  run_id: string;
  step_type: 'trigger' | 'condition' | 'action';
  step_name: string;
  started_at: string;
  completed_at?: string;
  status: 'pending' | 'running' | 'passed' | 'failed' | 'skipped';
  result?: Record<string, any>;
  error?: string;
}

export interface StarterAutomation {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'messaging' | 'routing' | 'follow_up' | 'compliance';
  trigger: TriggerConfig;
  conditions: ConditionConfig[];
  actions: ActionConfig[];
  guardrails: Partial<WorkflowGuardrails>;
}

// Trigger definitions with metadata
export const TRIGGER_DEFINITIONS: Record<TriggerType, { label: string; description: string; icon: string; category: string }> = {
  new_contact: { label: 'New Contact Created', description: 'When a new contact is added to the system', icon: 'UserPlus', category: 'contact' },
  first_inbound_message: { label: 'First Inbound Message', description: 'When a contact sends their first message', icon: 'MessageSquare', category: 'message' },
  keyword_received: { label: 'Keyword Received', description: 'When a message contains specific keywords', icon: 'Search', category: 'message' },
  tag_added: { label: 'Tag Added', description: 'When a specific tag is added to a contact', icon: 'Tag', category: 'contact' },
  tag_removed: { label: 'Tag Removed', description: 'When a specific tag is removed from a contact', icon: 'TagOff', category: 'contact' },
  scheduled_time: { label: 'Scheduled Time', description: 'Run at a specific time or recurring schedule', icon: 'Clock', category: 'time' },
  inactivity: { label: 'Inactivity Detected', description: 'No reply for a specified time period', icon: 'Timer', category: 'time' },
  conversation_opened: { label: 'Conversation Opened', description: 'When a conversation is marked as open', icon: 'MessageCircle', category: 'conversation' },
  conversation_closed: { label: 'Conversation Closed', description: 'When a conversation is closed', icon: 'CheckCircle', category: 'conversation' },
  agent_intervention: { label: 'Agent Intervention', description: 'When bot hands over to human agent', icon: 'UserCheck', category: 'routing' },
  button_clicked: { label: 'Button Clicked', description: 'When user clicks an interactive button', icon: 'MousePointer', category: 'message' },
  template_delivered: { label: 'Template Delivered', description: 'When a template message is delivered', icon: 'Send', category: 'message' },
  template_read: { label: 'Template Read', description: 'When a template message is read', icon: 'Eye', category: 'message' },
  lead_source_captured: { label: 'Lead Source Captured', description: 'When lead comes from Facebook, website, QR', icon: 'Target', category: 'contact' },
};

export const CONDITION_DEFINITIONS: Record<ConditionType, { label: string; description: string; icon: string }> = {
  has_tag: { label: 'Has Tag', description: 'Contact has a specific tag', icon: 'Tag' },
  not_has_tag: { label: 'Does Not Have Tag', description: 'Contact does not have a specific tag', icon: 'TagOff' },
  attribute_equals: { label: 'Attribute Equals', description: 'Contact attribute matches value', icon: 'Equal' },
  attribute_contains: { label: 'Attribute Contains', description: 'Contact attribute contains value', icon: 'Search' },
  time_window: { label: 'Time Window', description: 'Check business hours, after-hours, weekend', icon: 'Clock' },
  conversation_status: { label: 'Conversation Status', description: 'Open, pending, or closed', icon: 'MessageSquare' },
  last_message_direction: { label: 'Last Message Direction', description: 'Inbound or outbound', icon: 'ArrowLeftRight' },
  agent_assigned: { label: 'Agent Assigned', description: 'Has an agent assigned or not', icon: 'User' },
  mau_status: { label: 'MAU Status', description: 'Active or inactive this month', icon: 'Activity' },
  opt_in_status: { label: 'Opt-in Status', description: 'Has opted in for marketing', icon: 'Shield' },
};

export const ACTION_DEFINITIONS: Record<ActionType, { label: string; description: string; icon: string; category: string }> = {
  send_template: { label: 'Send Template', description: 'Send an approved WhatsApp template', icon: 'FileText', category: 'messaging' },
  send_interactive: { label: 'Send Interactive', description: 'Send buttons or list message', icon: 'LayoutList', category: 'messaging' },
  add_tag: { label: 'Add Tag', description: 'Add a tag to the contact', icon: 'TagPlus', category: 'tagging' },
  remove_tag: { label: 'Remove Tag', description: 'Remove a tag from the contact', icon: 'TagMinus', category: 'tagging' },
  assign_agent: { label: 'Assign Agent', description: 'Assign to agent or team', icon: 'UserPlus', category: 'routing' },
  set_priority: { label: 'Set Priority', description: 'Set conversation priority level', icon: 'Flag', category: 'routing' },
  set_conversation_status: { label: 'Set Status', description: 'Open, pending, or close conversation', icon: 'CheckCircle', category: 'routing' },
  create_task: { label: 'Create Task', description: 'Create follow-up task for agent', icon: 'ClipboardList', category: 'task' },
  add_internal_note: { label: 'Add Internal Note', description: 'Add note visible to team only', icon: 'StickyNote', category: 'task' },
  call_webhook: { label: 'Call Webhook', description: 'POST data to external URL', icon: 'Webhook', category: 'integration' },
  update_contact_attribute: { label: 'Update Contact', description: 'Update contact field values', icon: 'Edit', category: 'contact' },
  delay: { label: 'Add Delay', description: 'Wait before next action', icon: 'Timer', category: 'flow' },
  stop_workflow: { label: 'Stop Workflow', description: 'End workflow execution', icon: 'StopCircle', category: 'flow' },
};

export const CONDITION_PRESETS = [
  { id: 'vip_only', name: 'VIP Only', conditions: [{ type: 'has_tag' as ConditionType, config: { tag: 'VIP' } }] },
  { id: 'after_hours', name: 'After Hours Only', conditions: [{ type: 'time_window' as ConditionType, config: { window: 'after_hours' } }] },
  { id: 'new_lead', name: 'New Lead Only', conditions: [{ type: 'attribute_equals' as ConditionType, config: { field: 'lead_status', value: 'new' } }] },
  { id: 'opted_in', name: 'Opted-In Only', conditions: [{ type: 'opt_in_status' as ConditionType, config: { status: true } }] },
];
