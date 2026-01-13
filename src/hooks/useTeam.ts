import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { toast } from 'sonner';
import type { 
  TeamMember, Team, Role, Permission, MemberInvite, 
  WorkingHours, SLASettings, RoutingRule, AuditLog, TeamStats 
} from '@/types/team';

// ============================================
// TEAM MEMBERS HOOK
// ============================================
export function useTeamMembers() {
  const { currentTenant } = useTenant();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = useCallback(async () => {
    if (!currentTenant?.id) return;
    
    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('agents')
        .select(`
          *,
          profile:profiles!agents_user_id_fkey(id, email, full_name, avatar_url)
        `)
        .eq('tenant_id', currentTenant.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      
      // Get open conversations count per agent
      const { data: convCounts } = await supabase
        .from('conversations')
        .select('assigned_to')
        .eq('tenant_id', currentTenant.id)
        .eq('status', 'open')
        .not('assigned_to', 'is', null);

      const countMap = (convCounts || []).reduce((acc, c) => {
        acc[c.assigned_to] = (acc[c.assigned_to] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const enrichedMembers = (data || []).map(m => ({
        ...m,
        status: m.status || 'active',
        presence: m.presence || 'offline',
        languages: m.languages || [],
        skills: m.skills || [],
        timezone: m.timezone || 'UTC',
        max_open_chats: m.max_open_chats || 10,
        open_conversations_count: countMap[m.user_id] || 0,
      })) as TeamMember[];

      setMembers(enrichedMembers);
    } catch (err: any) {
      setError(err.message);
      toast.error('Failed to load team members');
    } finally {
      setLoading(false);
    }
  }, [currentTenant?.id]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const updateMember = async (id: string, updates: Partial<TeamMember>) => {
    try {
      const { error } = await supabase
        .from('agents')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
      toast.success('Member updated');
      fetchMembers();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const disableMember = async (id: string) => {
    await updateMember(id, { is_active: false, status: 'disabled' });
  };

  const enableMember = async (id: string) => {
    await updateMember(id, { is_active: true, status: 'active' });
  };

  return { members, loading, error, refetch: fetchMembers, updateMember, disableMember, enableMember };
}

// ============================================
// TEAMS HOOK
// ============================================
export function useTeams() {
  const { currentTenant } = useTenant();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTeams = useCallback(async () => {
    if (!currentTenant?.id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('teams')
        .select(`
          *,
          team_lead:profiles!teams_team_lead_id_fkey(id, full_name, email, avatar_url)
        `)
        .eq('tenant_id', currentTenant.id)
        .order('name');

      if (error) throw error;

      // Get member counts
      const { data: memberCounts } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('tenant_id', currentTenant.id)
        .eq('is_active', true);

      const countMap = (memberCounts || []).reduce((acc, m) => {
        acc[m.team_id] = (acc[m.team_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const enrichedTeams = (data || []).map(t => ({
        ...t,
        member_count: countMap[t.id] || 0,
      })) as Team[];

      setTeams(enrichedTeams);
    } catch (err: any) {
      toast.error('Failed to load teams');
    } finally {
      setLoading(false);
    }
  }, [currentTenant?.id]);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  const createTeam = async (team: Partial<Team>) => {
    if (!currentTenant?.id) return;
    
    try {
      const { error } = await (supabase
        .from('teams') as any)
        .insert({ ...team, tenant_id: currentTenant.id });
      
      if (error) throw error;
      toast.success('Team created');
      fetchTeams();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const updateTeam = async (id: string, updates: Partial<Team>) => {
    try {
      const { error } = await supabase
        .from('teams')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
      toast.success('Team updated');
      fetchTeams();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const deleteTeam = async (id: string) => {
    try {
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast.success('Team deleted');
      fetchTeams();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return { teams, loading, refetch: fetchTeams, createTeam, updateTeam, deleteTeam };
}

// ============================================
// ROLES HOOK
// ============================================
export function useRoles() {
  const { currentTenant } = useTenant();
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRoles = useCallback(async () => {
    if (!currentTenant?.id) return;
    
    setLoading(true);
    try {
      const [rolesRes, permsRes] = await Promise.all([
        supabase
          .from('roles')
          .select('*')
          .eq('tenant_id', currentTenant.id)
          .order('name'),
        supabase
          .from('permissions')
          .select('*')
          .order('category, sort_order'),
      ]);

      if (rolesRes.error) throw rolesRes.error;
      if (permsRes.error) throw permsRes.error;

      setRoles(rolesRes.data as Role[]);
      setPermissions(permsRes.data as Permission[]);
    } catch (err: any) {
      toast.error('Failed to load roles');
    } finally {
      setLoading(false);
    }
  }, [currentTenant?.id]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const createRole = async (role: Partial<Role>, permissionIds: string[]) => {
    if (!currentTenant?.id) return;
    
    try {
      const { data, error } = await (supabase
        .from('roles') as any)
        .insert({ ...role, tenant_id: currentTenant.id })
        .select()
        .single();
      
      if (error) throw error;

      // Add permissions
      if (permissionIds.length > 0) {
        const { error: permError } = await supabase
          .from('role_permissions')
          .insert(permissionIds.map(pid => ({ role_id: data.id, permission_id: pid })));
        
        if (permError) throw permError;
      }

      toast.success('Role created');
      fetchRoles();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const updateRole = async (id: string, updates: Partial<Role>, permissionIds?: string[]) => {
    try {
      const { error } = await supabase
        .from('roles')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;

      if (permissionIds !== undefined) {
        // Clear existing permissions
        await supabase.from('role_permissions').delete().eq('role_id', id);
        
        // Add new permissions
        if (permissionIds.length > 0) {
          await supabase
            .from('role_permissions')
            .insert(permissionIds.map(pid => ({ role_id: id, permission_id: pid })));
        }
      }

      toast.success('Role updated');
      fetchRoles();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const deleteRole = async (id: string) => {
    try {
      const { error } = await supabase.from('roles').delete().eq('id', id);
      if (error) throw error;
      toast.success('Role deleted');
      fetchRoles();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const getRolePermissions = async (roleId: string): Promise<string[]> => {
    const { data } = await supabase
      .from('role_permissions')
      .select('permission_id')
      .eq('role_id', roleId);
    return (data || []).map(rp => rp.permission_id);
  };

  return { roles, permissions, loading, refetch: fetchRoles, createRole, updateRole, deleteRole, getRolePermissions };
}

// ============================================
// INVITES HOOK
// ============================================
export function useMemberInvites() {
  const { currentTenant } = useTenant();
  const [invites, setInvites] = useState<MemberInvite[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInvites = useCallback(async () => {
    if (!currentTenant?.id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('member_invites')
        .select(`
          *,
          role:roles(id, name, base_role, color),
          inviter:profiles!member_invites_invited_by_fkey(full_name, email)
        `)
        .eq('tenant_id', currentTenant.id)
        .is('accepted_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvites(data as MemberInvite[]);
    } catch (err: any) {
      toast.error('Failed to load invites');
    } finally {
      setLoading(false);
    }
  }, [currentTenant?.id]);

  useEffect(() => {
    fetchInvites();
  }, [fetchInvites]);

  const sendInvite = async (email: string, roleId: string, teamIds: string[] = [], phoneNumberIds: string[] = []) => {
    if (!currentTenant?.id) return;
    
    try {
      const token = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

      const { error } = await supabase
        .from('member_invites')
        .insert({
          tenant_id: currentTenant.id,
          email,
          role_id: roleId,
          team_ids: teamIds,
          phone_number_ids: phoneNumberIds,
          token,
          expires_at: expiresAt,
        });

      if (error) throw error;
      toast.success('Invite sent');
      fetchInvites();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const resendInvite = async (id: string) => {
    try {
      const newToken = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

      const { error } = await supabase
        .from('member_invites')
        .update({ token: newToken, expires_at: expiresAt })
        .eq('id', id);

      if (error) throw error;
      toast.success('Invite resent');
      fetchInvites();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const cancelInvite = async (id: string) => {
    try {
      const { error } = await supabase.from('member_invites').delete().eq('id', id);
      if (error) throw error;
      toast.success('Invite cancelled');
      fetchInvites();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return { invites, loading, refetch: fetchInvites, sendInvite, resendInvite, cancelInvite };
}

// ============================================
// WORKING HOURS & SLA HOOK
// ============================================
export function useWorkingHoursAndSLA() {
  const { currentTenant } = useTenant();
  const [workingHours, setWorkingHours] = useState<WorkingHours[]>([]);
  const [slaSettings, setSLASettings] = useState<SLASettings[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!currentTenant?.id) return;
    
    setLoading(true);
    try {
      const [whRes, slaRes] = await Promise.all([
        supabase
          .from('working_hours')
          .select('*')
          .eq('tenant_id', currentTenant.id)
          .order('day_of_week'),
        supabase
          .from('sla_settings')
          .select(`*, team:teams(id, name, color)`)
          .eq('tenant_id', currentTenant.id)
          .order('name'),
      ]);

      if (whRes.error) throw whRes.error;
      if (slaRes.error) throw slaRes.error;

      setWorkingHours(whRes.data as WorkingHours[]);
      setSLASettings(slaRes.data as SLASettings[]);
    } catch (err: any) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, [currentTenant?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const saveWorkingHours = async (hours: Partial<WorkingHours>[]) => {
    if (!currentTenant?.id) return;
    
    try {
      // Delete existing workspace-level hours
      await supabase
        .from('working_hours')
        .delete()
        .eq('tenant_id', currentTenant.id)
        .is('team_id', null)
        .is('user_id', null);

      // Insert new hours
      const { error } = await (supabase
        .from('working_hours') as any)
        .insert(hours.map(h => ({ ...h, tenant_id: currentTenant.id })));

      if (error) throw error;
      toast.success('Working hours saved');
      fetchData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const saveSLASettings = async (settings: Partial<SLASettings>) => {
    if (!currentTenant?.id) return;
    
    try {
      if (settings.id) {
        const { error } = await supabase
          .from('sla_settings')
          .update(settings)
          .eq('id', settings.id);
        if (error) throw error;
      } else {
        const { error } = await (supabase
          .from('sla_settings') as any)
          .insert({ ...settings, tenant_id: currentTenant.id });
        if (error) throw error;
      }
      
      toast.success('SLA settings saved');
      fetchData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return { workingHours, slaSettings, loading, refetch: fetchData, saveWorkingHours, saveSLASettings };
}

// ============================================
// ROUTING RULES HOOK
// ============================================
export function useRoutingRules() {
  const { currentTenant } = useTenant();
  const [rules, setRules] = useState<RoutingRule[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRules = useCallback(async () => {
    if (!currentTenant?.id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('routing_rules')
        .select(`
          *,
          team:teams(id, name, color),
          user:profiles!routing_rules_assign_to_user_id_fkey(id, full_name, email)
        `)
        .eq('tenant_id', currentTenant.id)
        .order('priority');

      if (error) throw error;
      setRules(data as RoutingRule[]);
    } catch (err: any) {
      toast.error('Failed to load routing rules');
    } finally {
      setLoading(false);
    }
  }, [currentTenant?.id]);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  const createRule = async (rule: Partial<RoutingRule>) => {
    if (!currentTenant?.id) return;
    
    try {
      const { error } = await (supabase
        .from('routing_rules') as any)
        .insert({ ...rule, tenant_id: currentTenant.id });
      
      if (error) throw error;
      toast.success('Routing rule created');
      fetchRules();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const updateRule = async (id: string, updates: Partial<RoutingRule>) => {
    try {
      const { error } = await supabase
        .from('routing_rules')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
      toast.success('Routing rule updated');
      fetchRules();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const deleteRule = async (id: string) => {
    try {
      const { error } = await supabase.from('routing_rules').delete().eq('id', id);
      if (error) throw error;
      toast.success('Routing rule deleted');
      fetchRules();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return { rules, loading, refetch: fetchRules, createRule, updateRule, deleteRule };
}

// ============================================
// AUDIT LOGS HOOK
// ============================================
export function useAuditLogs(filters?: { userId?: string; action?: string; dateFrom?: string; dateTo?: string }) {
  const { currentTenant } = useTenant();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    if (!currentTenant?.id) return;
    
    setLoading(true);
    try {
      let query = supabase
        .from('audit_logs')
        .select(`
          *,
          user:profiles!audit_logs_user_id_fkey(id, full_name, email, avatar_url)
        `)
        .eq('tenant_id', currentTenant.id)
        .order('created_at', { ascending: false })
        .limit(500);

      if (filters?.userId) {
        query = query.eq('user_id', filters.userId);
      }
      if (filters?.action) {
        query = query.eq('action', filters.action);
      }
      if (filters?.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }
      if (filters?.dateTo) {
        query = query.lte('created_at', filters.dateTo);
      }

      const { data, error } = await query;
      if (error) throw error;
      setLogs(data as AuditLog[]);
    } catch (err: any) {
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  }, [currentTenant?.id, filters?.userId, filters?.action, filters?.dateFrom, filters?.dateTo]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const exportLogs = () => {
    const csv = logs.map(l => 
      `"${l.created_at}","${l.user?.email || 'System'}","${l.action}","${l.resource_type || ''}","${JSON.stringify(l.details)}"`
    ).join('\n');
    
    const blob = new Blob([`Timestamp,User,Action,Resource,Details\n${csv}`], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return { logs, loading, refetch: fetchLogs, exportLogs };
}

// ============================================
// TEAM STATS HOOK
// ============================================
export function useTeamStats() {
  const { currentTenant } = useTenant();
  const [stats, setStats] = useState<TeamStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    if (!currentTenant?.id) return;
    
    setLoading(true);
    try {
      const { data: agents } = await supabase
        .from('agents')
        .select('is_active, status, presence')
        .eq('tenant_id', currentTenant.id);

      const { data: convs } = await supabase
        .from('conversations')
        .select('id')
        .eq('tenant_id', currentTenant.id)
        .eq('status', 'open');

      const active = (agents || []).filter(a => a.is_active && a.status === 'active').length;
      const invited = (agents || []).filter(a => a.status === 'invited').length;
      const disabled = (agents || []).filter(a => !a.is_active || a.status === 'disabled').length;
      const online = (agents || []).filter(a => a.presence === 'online').length;

      setStats({
        total_members: agents?.length || 0,
        active_members: active,
        invited_members: invited,
        disabled_members: disabled,
        online_now: online,
        avg_first_response_minutes: 0, // Would need performance table
        sla_breaches_today: 0, // Would need SLA tracking
        open_conversations: convs?.length || 0,
      });
    } catch (err: any) {
      toast.error('Failed to load stats');
    } finally {
      setLoading(false);
    }
  }, [currentTenant?.id]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, refetch: fetchStats };
}
