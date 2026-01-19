// Auto-Form Rules Types for Workspace-Level Form Automation

export type FormRuleTriggerType = 
  | 'first_message' 
  | 'keyword' 
  | 'ad_click' 
  | 'qr_scan' 
  | 'source' 
  | 'tag_added' 
  | 'scheduled'
  | 'ai_intent';

export type FormRuleLogStatus = 'triggered' | 'sent' | 'delivered' | 'failed' | 'skipped';

export interface FormRuleTriggerConfig {
  // For keyword trigger
  keywords?: string[];
  match_type?: 'contains' | 'exact' | 'starts_with' | 'regex';
  
  // For ad_click trigger
  ad_account_id?: string;
  campaign_ids?: string[];
  adset_ids?: string[];
  
  // For qr_scan trigger
  qr_campaign_id?: string;
  
  // For source trigger
  sources?: string[];
  
  // For tag_added trigger
  tag_id?: string;
  tag_name?: string;
  
  // For scheduled trigger
  schedule_cron?: string;
  timezone?: string;
}

export interface FormRuleCondition {
  id: string;
  type: 'has_tag' | 'not_has_tag' | 'attribute_eq' | 'attribute_contains' | 'source_in' | 'opted_in';
  config: Record<string, any>;
  operator?: 'and' | 'or';
}

export interface FormRule {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  
  // Form configuration
  form_id: string | null;
  form_template_name: string | null;
  form_language: string;
  form_variables: Record<string, any>;
  
  // Trigger
  trigger_type: FormRuleTriggerType;
  trigger_config: FormRuleTriggerConfig;
  
  // Conditions
  conditions: FormRuleCondition[];
  
  // Guardrails
  cooldown_minutes: number;
  max_sends_per_contact_per_day: number;
  require_opt_in: boolean;
  business_hours_only: boolean;
  
  // Priority and status
  priority: number;
  is_active: boolean;
  
  // Stats
  execution_count: number;
  last_executed_at: string | null;
  
  // Metadata
  created_by: string | null;
  created_at: string;
  updated_at: string;
  
  // Joined data
  form?: {
    id: string;
    name: string;
    category: string;
    status: string;
  };
  creator?: {
    id: string;
    full_name: string | null;
    email: string;
  };
}

export interface FormRuleLog {
  id: string;
  tenant_id: string;
  rule_id: string;
  contact_id: string | null;
  conversation_id: string | null;
  status: FormRuleLogStatus;
  skip_reason: string | null;
  error_message: string | null;
  trigger_data: Record<string, any> | null;
  message_id: string | null;
  created_at: string;
  
  // Joined data
  rule?: FormRule;
  contact?: {
    id: string;
    name: string | null;
    wa_id: string;
  };
}

export const FORM_RULE_TRIGGER_OPTIONS: { 
  value: FormRuleTriggerType; 
  label: string; 
  description: string; 
  icon: string;
  color: string;
}[] = [
  { 
    value: 'first_message', 
    label: 'First Message', 
    description: 'When a new contact sends their first message',
    icon: 'MessageSquare',
    color: 'blue'
  },
  { 
    value: 'keyword', 
    label: 'Keyword Match', 
    description: 'When a message contains specific keywords',
    icon: 'Search',
    color: 'purple'
  },
  { 
    value: 'ad_click', 
    label: 'Meta Ad Click', 
    description: 'When a contact clicks on a Click-to-WhatsApp ad',
    icon: 'Facebook',
    color: 'indigo'
  },
  { 
    value: 'qr_scan', 
    label: 'QR Code Scan', 
    description: 'When a contact scans a QR code campaign',
    icon: 'QrCode',
    color: 'green'
  },
  { 
    value: 'source', 
    label: 'Traffic Source', 
    description: 'Based on where the contact originated',
    icon: 'Globe',
    color: 'amber'
  },
  { 
    value: 'tag_added', 
    label: 'Tag Added', 
    description: 'When a specific tag is applied to a contact',
    icon: 'Tag',
    color: 'pink'
  },
  { 
    value: 'scheduled', 
    label: 'Scheduled', 
    description: 'Send forms at specific times',
    icon: 'Clock',
    color: 'orange'
  },
];

export const FORM_RULE_CONDITION_OPTIONS: {
  value: FormRuleCondition['type'];
  label: string;
  description: string;
}[] = [
  { value: 'has_tag', label: 'Has Tag', description: 'Contact has a specific tag' },
  { value: 'not_has_tag', label: 'Does Not Have Tag', description: 'Contact does not have a specific tag' },
  { value: 'attribute_eq', label: 'Attribute Equals', description: 'Contact attribute equals a value' },
  { value: 'attribute_contains', label: 'Attribute Contains', description: 'Contact attribute contains a value' },
  { value: 'source_in', label: 'Source Is', description: 'Contact source matches one of the specified values' },
  { value: 'opted_in', label: 'Opted In', description: 'Contact has opted in for marketing' },
];
