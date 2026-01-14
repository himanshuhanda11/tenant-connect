// Integration types for the Unified Integrations Module

export type IntegrationCategory = 'api' | 'ecommerce' | 'payments' | 'crm' | 'marketing' | 'automation';

export type AuthType = 'api_key' | 'oauth' | 'webhook';

export type IntegrationStatus = 'pending' | 'connected' | 'error' | 'disconnected';

export type HealthStatus = 'healthy' | 'degraded' | 'error' | 'unknown';

export type EventStatus = 'received' | 'processing' | 'processed' | 'failed';

export type ActionType = 'send_template' | 'trigger_flow' | 'assign_agent' | 'add_tag' | 'set_attribute';

export interface IntegrationCatalog {
  id: string;
  key: string;
  name: string;
  description: string | null;
  category: IntegrationCategory;
  logo_url: string | null;
  auth_type: AuthType;
  setup_time_minutes: number;
  documentation_url: string | null;
  supported_events: string[];
  is_active: boolean;
  is_pro_only: boolean;
  config_schema: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface TenantIntegration {
  id: string;
  tenant_id: string;
  integration_key: string;
  status: IntegrationStatus;
  credentials: Record<string, unknown> | null;
  config: Record<string, unknown>;
  webhook_url: string | null;
  webhook_secret: string | null;
  last_event_at: string | null;
  last_error: string | null;
  error_count: number;
  health_status: HealthStatus;
  connected_by: string | null;
  connected_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  integration?: IntegrationCatalog;
}

export interface IntegrationEvent {
  id: string;
  tenant_id: string;
  tenant_integration_id: string;
  event_type: string;
  event_id: string | null;
  payload: Record<string, unknown>;
  status: EventStatus;
  error_message: string | null;
  processing_started_at: string | null;
  processed_at: string | null;
  retry_count: number;
  next_retry_at: string | null;
  created_at: string;
}

export interface EventActionMapping {
  id: string;
  tenant_id: string;
  tenant_integration_id: string;
  event_type: string;
  action_type: ActionType;
  action_config: {
    template_id?: string;
    flow_id?: string;
    agent_id?: string;
    tag_id?: string;
    attribute_key?: string;
    attribute_value?: string;
    variable_mappings?: Record<string, string>;
    fallback_flow_id?: string;
  };
  conditions: {
    field: string;
    operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains';
    value: string | number;
  }[] | null;
  is_active: boolean;
  priority: number;
  created_at: string;
  updated_at: string;
}

// UI-specific types
export interface IntegrationWithStatus extends IntegrationCatalog {
  tenantIntegration?: TenantIntegration;
  isConnected: boolean;
  lastEventFormatted?: string;
}

export const CATEGORY_LABELS: Record<IntegrationCategory, string> = {
  api: 'API',
  ecommerce: 'E-commerce',
  payments: 'Payments',
  crm: 'CRM',
  marketing: 'Marketing',
  automation: 'Automation',
};

export const CATEGORY_ICONS: Record<IntegrationCategory, string> = {
  api: 'Code',
  ecommerce: 'ShoppingCart',
  payments: 'CreditCard',
  crm: 'Users',
  marketing: 'Megaphone',
  automation: 'Zap',
};
