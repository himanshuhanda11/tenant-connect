// Phone Numbers Types for SMEKSH

export type NumberStatus = 'connected' | 'pending' | 'verification_required' | 'disconnected' | 'disabled' | 'error';
export type QualityRating = 'green' | 'yellow' | 'red' | 'unknown';
export type LimitTier = 'tier_1k' | 'tier_10k' | 'tier_100k' | 'tier_unlimited' | 'unknown';
export type WebhookHealth = 'healthy' | 'degraded' | 'down' | 'unknown';
export type AssignmentStrategy = 'round_robin' | 'least_busy' | 'manual';

export interface WABA {
  id: string;
  tenant_id: string;
  waba_id: string;
  name?: string;
  business_id?: string;
  business_name?: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface PhoneNumber {
  id: string;
  tenant_id: string;
  waba_uuid?: string;
  waba_id?: string;
  phone_number_id: string;
  display_name?: string;
  phone_e164: string;
  verified_name?: string;
  certificate?: string;
  status: NumberStatus;
  quality_rating: QualityRating;
  messaging_limit: LimitTier;
  default_team_id?: string;
  default_assignment_strategy: AssignmentStrategy;
  only_online: boolean;
  max_open_conversations_per_agent?: number;
  enforce_opt_in: boolean;
  block_marketing_without_optin: boolean;
  quiet_hours?: {
    start: string;
    end: string;
    days: number[];
  };
  business_hours?: {
    start: string;
    end: string;
    days: number[];
    timezone?: string;
  };
  webhook_health: WebhookHealth;
  last_webhook_at?: string;
  last_message_at?: string;
  raw: Record<string, unknown>;
  last_error?: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
  // Joined data
  waba?: WABA;
  default_team?: {
    id: string;
    name: string;
  };
}

export interface WebhookConfig {
  id: string;
  tenant_id: string;
  phone_number_id: string;
  callback_url: string;
  verify_token?: string;
  secret?: string;
  subscribed_fields: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WebhookDeliveryLog {
  id: string;
  tenant_id: string;
  phone_number_id?: string;
  direction: 'inbound' | 'outbound';
  status_code?: number;
  success: boolean;
  received_at: string;
  processed_at?: string;
  latency_ms?: number;
  event_type?: string;
  error?: string;
  raw: Record<string, unknown>;
}

export interface QualityHistory {
  id: string;
  tenant_id: string;
  phone_number_uuid: string;
  quality_rating: QualityRating;
  messaging_limit: LimitTier;
  reason?: string;
  recorded_at: string;
}

export interface PhoneNumberAccess {
  id: string;
  tenant_id: string;
  phone_number_uuid: string;
  team_id?: string;
  member_id?: string;
  created_at: string;
}

// Config constants
export const STATUS_CONFIG: Record<NumberStatus, { label: string; color: string; bgColor: string; icon: string }> = {
  connected: { label: 'Connected', color: 'text-green-600', bgColor: 'bg-green-100', icon: 'check-circle' },
  pending: { label: 'Pending', color: 'text-amber-600', bgColor: 'bg-amber-100', icon: 'clock' },
  verification_required: { label: 'Verification Required', color: 'text-blue-600', bgColor: 'bg-blue-100', icon: 'shield' },
  disconnected: { label: 'Disconnected', color: 'text-gray-600', bgColor: 'bg-gray-100', icon: 'unplug' },
  disabled: { label: 'Disabled', color: 'text-gray-500', bgColor: 'bg-gray-100', icon: 'ban' },
  error: { label: 'Error', color: 'text-red-600', bgColor: 'bg-red-100', icon: 'alert-circle' },
};

export const QUALITY_CONFIG: Record<QualityRating, { label: string; color: string; bgColor: string }> = {
  green: { label: 'High', color: 'text-green-600', bgColor: 'bg-green-100' },
  yellow: { label: 'Medium', color: 'text-amber-600', bgColor: 'bg-amber-100' },
  red: { label: 'Low', color: 'text-red-600', bgColor: 'bg-red-100' },
  unknown: { label: 'Unknown', color: 'text-gray-500', bgColor: 'bg-gray-100' },
};

export const LIMIT_CONFIG: Record<LimitTier, { label: string; value: string }> = {
  tier_1k: { label: '1K/day', value: '1,000' },
  tier_10k: { label: '10K/day', value: '10,000' },
  tier_100k: { label: '100K/day', value: '100,000' },
  tier_unlimited: { label: 'Unlimited', value: 'Unlimited' },
  unknown: { label: 'Unknown', value: '-' },
};

export const WEBHOOK_HEALTH_CONFIG: Record<WebhookHealth, { label: string; color: string; bgColor: string }> = {
  healthy: { label: 'Healthy', color: 'text-green-600', bgColor: 'bg-green-100' },
  degraded: { label: 'Degraded', color: 'text-amber-600', bgColor: 'bg-amber-100' },
  down: { label: 'Down', color: 'text-red-600', bgColor: 'bg-red-100' },
  unknown: { label: 'Unknown', color: 'text-gray-500', bgColor: 'bg-gray-100' },
};

// Mock data for demo
export const MOCK_PHONE_NUMBERS: PhoneNumber[] = [
  {
    id: 'pn1',
    tenant_id: '1',
    waba_uuid: 'w1',
    waba_id: '123456789012345',
    phone_number_id: '987654321098765',
    display_name: 'SMEKSH Support',
    phone_e164: '+971501234567',
    verified_name: 'SMEKSH LLC',
    status: 'connected',
    quality_rating: 'green',
    messaging_limit: 'tier_100k',
    default_assignment_strategy: 'round_robin',
    only_online: false,
    enforce_opt_in: true,
    block_marketing_without_optin: true,
    webhook_health: 'healthy',
    last_webhook_at: new Date(Date.now() - 60000).toISOString(),
    last_message_at: new Date(Date.now() - 300000).toISOString(),
    raw: {},
    is_default: true,
    created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
    updated_at: new Date(Date.now() - 60000).toISOString(),
    waba: {
      id: 'w1',
      tenant_id: '1',
      waba_id: '123456789012345',
      name: 'SMEKSH Business',
      business_name: 'SMEKSH LLC',
      is_default: true,
      created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
      updated_at: new Date(Date.now() - 86400000).toISOString(),
    },
  },
  {
    id: 'pn2',
    tenant_id: '1',
    waba_uuid: 'w1',
    waba_id: '123456789012345',
    phone_number_id: '876543210987654',
    display_name: 'SMEKSH Sales',
    phone_e164: '+971509876543',
    verified_name: 'SMEKSH Sales Team',
    status: 'connected',
    quality_rating: 'yellow',
    messaging_limit: 'tier_10k',
    default_assignment_strategy: 'least_busy',
    only_online: true,
    enforce_opt_in: true,
    block_marketing_without_optin: true,
    webhook_health: 'healthy',
    last_webhook_at: new Date(Date.now() - 120000).toISOString(),
    last_message_at: new Date(Date.now() - 600000).toISOString(),
    raw: {},
    is_default: false,
    created_at: new Date(Date.now() - 86400000 * 15).toISOString(),
    updated_at: new Date(Date.now() - 120000).toISOString(),
  },
  {
    id: 'pn3',
    tenant_id: '1',
    phone_number_id: '765432109876543',
    display_name: 'Marketing Line',
    phone_e164: '+14155551234',
    status: 'pending',
    quality_rating: 'unknown',
    messaging_limit: 'unknown',
    default_assignment_strategy: 'manual',
    only_online: false,
    enforce_opt_in: true,
    block_marketing_without_optin: true,
    webhook_health: 'unknown',
    raw: {},
    is_default: false,
    created_at: new Date(Date.now() - 3600000).toISOString(),
    updated_at: new Date(Date.now() - 3600000).toISOString(),
  },
];

export const MOCK_WABAS: WABA[] = [
  {
    id: 'w1',
    tenant_id: '1',
    waba_id: '123456789012345',
    name: 'SMEKSH Business',
    business_id: '111222333444555',
    business_name: 'SMEKSH LLC',
    is_default: true,
    created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
  },
];
