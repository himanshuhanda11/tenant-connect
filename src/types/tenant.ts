export type TenantRole = 'owner' | 'admin' | 'agent';

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface TenantMember {
  id: string;
  tenant_id: string;
  user_id: string;
  role: TenantRole;
  created_at: string;
  updated_at: string;
}

export interface TenantMemberWithProfile extends TenantMember {
  profiles: {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

export type OnboardingStep = 'pending' | 'google_done' | 'org_done' | 'completed';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  onboarding_step: OnboardingStep;
  country: string | null;
  industry: string | null;
  team_size: string | null;
  primary_goal: string | null;
  created_at: string;
  updated_at: string;
}

export interface TenantWithRole extends Tenant {
  role: TenantRole;
}
