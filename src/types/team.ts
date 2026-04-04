// Team & Roles Module Types

export type AppRole = 'owner' | 'admin' | 'manager' | 'agent' | 'analyst' | 'billing' | 'custom';

export type MemberStatus = 'active' | 'invited' | 'suspended' | 'disabled';

export type PresenceStatus = 'online' | 'offline' | 'away' | 'busy';

export type RoutingStrategy = 'round_robin' | 'least_busy' | 'skill_based' | 'vip_routing' | 'manual' | 'overflow';

export type PermissionCategory = 
  | 'messaging' 
  | 'contacts' 
  | 'templates' 
  | 'campaigns' 
  | 'automation' 
  | 'integrations' 
  | 'billing' 
  | 'security' 
  | 'phone_numbers' 
  | 'team'
  | 'meta_ads';

export type AuditAction = 
  | 'login' | 'logout' | 'invite_sent' | 'invite_accepted'
  | 'role_changed' | 'permission_changed' | 'member_disabled' | 'member_enabled'
  | 'team_created' | 'team_updated' | 'team_deleted'
  | 'routing_changed' | 'sla_changed'
  | 'template_submitted' | 'template_approved' | 'template_rejected'
  | 'automation_activated' | 'automation_paused' | 'automation_deleted'
  | 'tag_added' | 'tag_removed' | 'assignment_changed'
  | 'conversation_closed' | 'conversation_reopened'
  | 'waba_connected' | 'settings_changed'
  | 'conversation_intervened' | 'bot_resumed' | 'conversation.assigned';

export interface Role {
  id: string;
  tenant_id: string;
  name: string;
  description?: string;
  is_system: boolean;
  base_role: AppRole;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface Permission {
  id: string;
  key: string;
  name: string;
  description?: string;
  category: PermissionCategory;
  sort_order: number;
}

export interface RolePermission {
  id: string;
  role_id: string;
  permission_id: string;
  created_at: string;
}

export interface UserRole {
  id: string;
  tenant_id: string;
  user_id: string;
  role_id: string;
  created_at: string;
  role?: Role;
}

export interface TeamMember {
  id: string;
  tenant_id: string;
  user_id: string;
  display_name?: string;
  role?: string;
  is_active: boolean;
  is_online: boolean;
  weight: number;
  status: MemberStatus;
  presence: PresenceStatus;
  languages: string[];
  skills: string[];
  notes?: string;
  timezone: string;
  max_open_chats: number;
  last_active_at?: string;
  created_at: string;
  updated_at: string;
  // Relations
  profile?: {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
  };
  user_role?: UserRole;
  teams?: Team[];
  open_conversations_count?: number;
}

export interface MemberInvite {
  id: string;
  tenant_id: string;
  email: string;
  role_id?: string;
  invited_by?: string;
  team_ids: string[];
  phone_number_ids: string[];
  token: string;
  expires_at: string;
  accepted_at?: string;
  created_at: string;
  role?: Role;
  inviter?: {
    full_name?: string;
    email: string;
  };
}

export interface Team {
  id: string;
  tenant_id: string;
  name: string;
  description?: string;
  color: string;
  team_lead_id?: string;
  default_routing_strategy: RoutingStrategy;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Relations
  team_lead?: {
    id: string;
    full_name?: string;
    email: string;
    avatar_url?: string;
  };
  members?: TeamMember[];
  member_count?: number;
  open_chats_count?: number;
}

export interface TeamMemberJoin {
  id: string;
  tenant_id: string;
  team_id: string;
  agent_id: string;
  is_active: boolean;
  created_at: string;
}

export interface WorkingHours {
  id: string;
  tenant_id: string;
  team_id?: string;
  user_id?: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
  created_at: string;
}

export interface SLASettings {
  id: string;
  tenant_id: string;
  team_id?: string;
  name: string;
  first_response_minutes: number;
  follow_up_minutes: number;
  resolution_hours: number;
  escalate_on_breach: boolean;
  escalate_to_team_lead: boolean;
  after_hours_auto_reply: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  team?: Team;
}

export interface RoutingRule {
  id: string;
  tenant_id: string;
  name: string;
  description?: string;
  priority: number;
  is_active: boolean;
  condition_type: string;
  condition_config: Record<string, any>;
  assign_to_team_id?: string;
  assign_to_user_id?: string;
  strategy: RoutingStrategy;
  fallback_strategy: RoutingStrategy;
  created_at: string;
  updated_at: string;
  team?: Team;
  user?: {
    id: string;
    full_name?: string;
    email: string;
  };
}

export interface AuditLog {
  id: string;
  tenant_id: string;
  user_id?: string;
  action: AuditAction;
  resource_type?: string;
  resource_id?: string;
  details: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  user?: {
    id: string;
    full_name?: string;
    email: string;
    avatar_url?: string;
  };
}

export interface MemberPerformance {
  id: string;
  tenant_id: string;
  user_id: string;
  date: string;
  assigned_chats: number;
  resolved_chats: number;
  avg_response_time_seconds: number;
  avg_resolution_time_seconds: number;
  sla_breaches: number;
  csat_score?: number;
  messages_sent: number;
  created_at: string;
  updated_at: string;
}

export interface TeamStats {
  total_members: number;
  active_members: number;
  invited_members: number;
  disabled_members: number;
  online_now: number;
  avg_first_response_minutes: number;
  sla_breaches_today: number;
  open_conversations: number;
}

// UI Helper types
export const PRESENCE_COLORS: Record<PresenceStatus, string> = {
  online: 'bg-green-500',
  offline: 'bg-gray-400',
  away: 'bg-yellow-500',
  busy: 'bg-red-500',
};

export const STATUS_COLORS: Record<MemberStatus, string> = {
  active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  invited: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  suspended: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  disabled: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300',
};

export const ROLE_COLORS: Record<AppRole, string> = {
  owner: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  admin: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  manager: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  agent: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  analyst: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
  billing: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  custom: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300',
};

export const DAYS_OF_WEEK = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

export const ROUTING_STRATEGY_LABELS: Record<RoutingStrategy, string> = {
  round_robin: 'Round Robin',
  least_busy: 'Least Busy',
  skill_based: 'Skill Based',
  vip_routing: 'VIP Routing',
  manual: 'Manual',
  overflow: 'Overflow',
};
