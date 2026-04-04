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
      // Fetch actual agents
      const { data, error: fetchError } = await supabase
        .from('agents')
        .select(`
          *,
          profile:profiles!agents_user_id_fkey(id, email, full_name, avatar_url)
        `)
        .eq('tenant_id', currentTenant.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      // Fetch user_roles with role details for this tenant
      const { data: userRolesData } = await supabase
        .from('user_roles')
        .select('user_id, role_id, roles(id, name, base_role, color)')
        .eq('tenant_id', currentTenant.id);

      const userRoleMap = (userRolesData || []).reduce((acc, ur) => {
        acc[ur.user_id] = ur;
        return acc;
      }, {} as Record<string, any>);
      
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

      const enrichedMembers = (data || []).map(m => {
        const userRole = userRoleMap[m.user_id];
        return {
          ...m,
          status: m.status || 'active',
          presence: m.presence || 'offline',
          languages: m.languages || [],
          skills: m.skills || [],
          timezone: m.timezone || 'UTC',
          max_open_chats: m.max_open_chats || 10,
          open_conversations_count: countMap[m.user_id] || 0,
          // Attach resolved role info
          _role_id: userRole?.role_id || null,
          _role_name: userRole?.roles?.name || null,
          _role_base: userRole?.roles?.base_role || m.role || 'agent',
          _role_color: userRole?.roles?.color || null,
        };
      }) as TeamMember[];

      // Fetch pending invites and merge as virtual members
      const { data: pendingInvites } = await supabase
        .from('member_invites')
        .select(`
          *,
          role:roles(id, name, base_role, color)
        `)
        .eq('tenant_id', currentTenant.id)
        .is('accepted_at', null)
        .order('created_at', { ascending: false });

      const existingEmails = new Set(enrichedMembers.map(m => m.profile?.email?.toLowerCase()));

      const inviteMembers = (pendingInvites || [])
        .filter(inv => !existingEmails.has(inv.email?.toLowerCase()))
        .map(inv => ({
          id: `invite-${inv.id}`,
          tenant_id: currentTenant.id,
          user_id: '',
          display_name: inv.email.split('@')[0],
          is_active: false,
          is_online: false,
          status: 'invited',
          presence: 'offline',
          role: inv.role?.base_role || inv.role?.name || 'Agent',
          languages: [],
          skills: [],
          timezone: 'UTC',
          max_open_chats: 10,
          weight: 1,
          notes: null,
          created_at: inv.created_at,
          updated_at: inv.created_at,
          last_active_at: null,
          open_conversations_count: 0,
          profile: {
            id: '',
            email: inv.email,
            full_name: inv.email.split('@')[0],
            avatar_url: null,
          },
          _invite_id: inv.id,
        })) as TeamMember[];

      setMembers([...enrichedMembers, ...inviteMembers]);
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

  const updateMember = async (id: string, updates: Partial<TeamMember> & { _new_role_id?: string }) => {
    try {
      const roleId = updates._new_role_id;
      const { _new_role_id, ...agentUpdates } = updates as any;

      const { error } = await supabase
        .from('agents')
        .update(agentUpdates)
        .eq('id', id);
      
      if (error) throw error;

      // If a role_id was provided, update user_roles and tenant_members
      if (roleId && currentTenant?.id) {
        // Find the member to get user_id
        const member = members.find(m => m.id === id);
        if (member?.user_id) {
          // Get role details
          const { data: roleData } = await supabase
            .from('roles')
            .select('base_role')
            .eq('id', roleId)
            .single();

          // Upsert user_roles
          const { data: existing } = await supabase
            .from('user_roles')
            .select('id')
            .eq('tenant_id', currentTenant.id)
            .eq('user_id', member.user_id)
            .maybeSingle();

          if (existing) {
            await supabase.from('user_roles')
              .update({ role_id: roleId })
              .eq('id', existing.id);
          } else {
            await supabase.from('user_roles')
              .insert({ tenant_id: currentTenant.id, user_id: member.user_id, role_id: roleId });
          }

          // Update tenant_members role
          if (roleData?.base_role) {
            await supabase.from('tenant_members')
              .update({
                role:
                  roleData.base_role === 'admin'
                    ? 'admin'
                    : roleData.base_role === 'owner'
                      ? 'owner'
                        : 'agent'
              })
              .eq('tenant_id', currentTenant.id)
              .eq('user_id', member.user_id);
          }
        }
      }

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

  const deleteMember = async (id: string) => {
    try {
      const member = members.find(m => m.id === id);
      if (!member) return;

      // Remove agent record
      const { error } = await supabase
        .from('agents')
        .delete()
        .eq('id', id);
      if (error) throw error;

      // Remove tenant membership
      if (member.user_id) {
        await supabase
          .from('tenant_members')
          .delete()
          .eq('user_id', member.user_id)
          .eq('tenant_id', currentTenant?.id);
      }

      toast.success('Member removed from workspace');
      fetchMembers();
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove member');
    }
  };

  return { members, loading, error, refetch: fetchMembers, updateMember, disableMember, enableMember, deleteMember };
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
        .select('team_id, agent_id')
        .eq('tenant_id', currentTenant.id)
        .eq('is_active', true);

      const countMap: Record<string, number> = {};
      const agentsByTeam: Record<string, string[]> = {};
      (memberCounts || []).forEach((m) => {
        countMap[m.team_id] = (countMap[m.team_id] || 0) + 1;
        if (!agentsByTeam[m.team_id]) agentsByTeam[m.team_id] = [];
        agentsByTeam[m.team_id].push(m.agent_id);
      });

      // Get open chats count per team (via agents assigned)
      const allAgentIds = [...new Set((memberCounts || []).map(m => m.agent_id))];
      let openChatsByAgent: Record<string, number> = {};
      if (allAgentIds.length > 0) {
        // Get agent user_ids from agents table
        const { data: agentRows } = await supabase
          .from('agents')
          .select('id, user_id')
          .in('id', allAgentIds)
          .eq('tenant_id', currentTenant.id);

        const agentUserIds = (agentRows || []).map(a => a.user_id);
        const agentIdToUserId: Record<string, string> = {};
        (agentRows || []).forEach(a => { agentIdToUserId[a.id] = a.user_id; });

        if (agentUserIds.length > 0) {
          const { data: openChats } = await supabase
            .from('conversations')
            .select('assigned_to')
            .eq('tenant_id', currentTenant.id)
            .eq('status', 'open')
            .in('assigned_to', agentUserIds);

          const chatsByUserId: Record<string, number> = {};
          (openChats || []).forEach(c => {
            if (c.assigned_to) chatsByUserId[c.assigned_to] = (chatsByUserId[c.assigned_to] || 0) + 1;
          });

          // Map back to agent_id
          (agentRows || []).forEach(a => {
            openChatsByAgent[a.id] = chatsByUserId[a.user_id] || 0;
          });
        }
      }

      const enrichedTeams = (data || []).map(t => {
        const teamAgentIds = agentsByTeam[t.id] || [];
        const openCount = teamAgentIds.reduce((sum, aid) => sum + (openChatsByAgent[aid] || 0), 0);
        return {
          ...t,
          member_count: countMap[t.id] || 0,
          open_chats_count: openCount,
        };
      }) as Team[];

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

  const createTeam = async (team: Partial<Team>): Promise<boolean> => {
    if (!currentTenant?.id) {
      toast.error('No workspace selected');
      return false;
    }
    
    try {
      const insertPayload = {
        name: team.name!,
        description: team.description || null,
        color: team.color || '#6366f1',
        team_lead_id: team.team_lead_id && team.team_lead_id.length > 0 ? team.team_lead_id : null,
        default_routing_strategy: team.default_routing_strategy || 'round_robin',
        is_active: true,
        tenant_id: currentTenant.id
      };
      console.log('Creating team with payload:', insertPayload);
      const { error } = await supabase
        .from('teams')
        .insert(insertPayload);
      
      if (error) {
        console.error('Create team error:', error);
        throw error;
      }
      toast.success('Team created');
      await fetchTeams();
      return true;
    } catch (err: any) {
      console.error('Create team exception:', err);
      toast.error(err.message || 'Failed to create team');
      return false;
    }
  };

  const updateTeam = async (id: string, updates: Partial<Team>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('teams')
        .update(updates)
        .eq('id', id);
      
      if (error) {
        console.error('Update team error:', error);
        throw error;
      }
      toast.success('Team updated');
      await fetchTeams();
      return true;
    } catch (err: any) {
      console.error('Update team exception:', err);
      toast.error(err.message || 'Failed to update team');
      return false;
    }
  };

  const deleteTeam = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Delete team error:', error);
        throw error;
      }
      toast.success('Team deleted');
      await fetchTeams();
      return true;
    } catch (err: any) {
      console.error('Delete team exception:', err);
      toast.error(err.message || 'Failed to delete team');
      return false;
    }
  };

  const addTeamMember = async (teamId: string, agentId: string): Promise<boolean> => {
    if (!currentTenant?.id) return false;
    try {
      const { error } = await supabase
        .from('team_members')
        .insert({ team_id: teamId, agent_id: agentId, tenant_id: currentTenant.id });
      if (error) throw error;
      toast.success('Member added to team');
      await fetchTeams();
      return true;
    } catch (err: any) {
      toast.error(err.message || 'Failed to add member');
      return false;
    }
  };

  const removeTeamMember = async (teamId: string, agentId: string): Promise<boolean> => {
    if (!currentTenant?.id) return false;
    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('team_id', teamId)
        .eq('agent_id', agentId)
        .eq('tenant_id', currentTenant.id);
      if (error) throw error;
      toast.success('Member removed from team');
      await fetchTeams();
      return true;
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove member');
      return false;
    }
  };

  const getTeamMembers = async (teamId: string) => {
    if (!currentTenant?.id) return [];
    const { data } = await supabase
      .from('team_members')
      .select(`
        *,
        agent:agents!team_members_agent_id_fkey(
          id, display_name, user_id, is_active,
          profile:profiles!agents_user_id_fkey(id, email, full_name, avatar_url)
        )
      `)
      .eq('team_id', teamId)
      .eq('tenant_id', currentTenant.id)
      .eq('is_active', true);
    return data || [];
  };

  return { teams, loading, refetch: fetchTeams, createTeam, updateTeam, deleteTeam, addTeamMember, removeTeamMember, getTeamMembers };
}

// ============================================
// ROLES HOOK
// ============================================
export function useRoles() {
  const { currentTenant } = useTenant();
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [permissionsLoading, setPermissionsLoading] = useState(false);

  const fetchRoles = useCallback(async (silent = false) => {
    if (!currentTenant?.id) return;
    
    if (!silent) setLoading(true);
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
      if (!silent) setLoading(false);
    }
  }, [currentTenant?.id]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const createRole = async (role: Partial<Role>, permissionIds: string[]): Promise<boolean> => {
    if (!currentTenant?.id) {
      toast.error('No workspace selected');
      return false;
    }
    
    try {
      const { data, error } = await supabase
        .from('roles')
        .insert({
          name: role.name,
          description: role.description || null,
          base_role: role.base_role || 'agent',
          color: role.color || '#6366f1',
          is_system: false,
          tenant_id: currentTenant.id
        })
        .select()
        .single();
      
      if (error) {
        console.error('Create role error:', error);
        throw error;
      }

      // Add permissions
      if (permissionIds.length > 0) {
        const { error: permError } = await supabase
          .from('role_permissions')
          .insert(permissionIds.map(pid => ({ role_id: data.id, permission_id: pid })));
        
        if (permError) {
          console.error('Add permissions error:', permError);
          throw permError;
        }
      }

      toast.success('Role created');
      await fetchRoles();
      return true;
    } catch (err: any) {
      console.error('Create role exception:', err);
      toast.error(err.message || 'Failed to create role');
      return false;
    }
  };

  const updateRole = async (id: string, updates: Partial<Role>, permissionIds?: string[]): Promise<boolean> => {
    try {
      // Only update role fields if there are actual updates
      const hasUpdates = Object.keys(updates).length > 0;
      if (hasUpdates) {
        const { error } = await supabase
          .from('roles')
          .update(updates)
          .eq('id', id);
        
        if (error) {
          console.error('Update role error:', error);
          throw error;
        }
      }

      if (permissionIds !== undefined) {
        // Clear existing permissions
        const { error: delError } = await supabase.from('role_permissions').delete().eq('role_id', id);
        if (delError) {
          console.error('Delete permissions error:', delError);
          throw delError;
        }
        
        // Add new permissions
        if (permissionIds.length > 0) {
          const { error: insertError } = await supabase
            .from('role_permissions')
            .insert(permissionIds.map(pid => ({ role_id: id, permission_id: pid })));
          if (insertError) {
            console.error('Insert permissions error:', insertError);
            throw insertError;
          }
        }
      }

      toast.success('Role updated');
      await fetchRoles(true);
      return true;
    } catch (err: any) {
      console.error('Update role exception:', err);
      toast.error(err.message || 'Failed to update role');
      return false;
    }
  };

  const deleteRole = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from('roles').delete().eq('id', id);
      if (error) {
        console.error('Delete role error:', error);
        throw error;
      }
      toast.success('Role deleted');
      await fetchRoles();
      return true;
    } catch (err: any) {
      console.error('Delete role exception:', err);
      toast.error(err.message || 'Failed to delete role');
      return false;
    }
  };

  const getRolePermissions = async (roleId: string): Promise<string[]> => {
    try {
      const { data, error } = await supabase
        .from('role_permissions')
        .select('permission_id')
        .eq('role_id', roleId);

      if (error) {
        console.error('Get role permissions error:', error);
        throw error;
      }

      return (data || []).map(rp => rp.permission_id);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load role permissions');
      return [];
    }
  };

  return { roles, permissions, loading, permissionsLoading, refetch: fetchRoles, createRole, updateRole, deleteRole, getRolePermissions };
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

  const sendInvite = async (email: string, roleId: string, teamIds: string[] = [], phoneNumberIds: string[] = [], inviteeName?: string): Promise<boolean> => {
    if (!currentTenant?.id) {
      toast.error('No workspace selected');
      return false;
    }
    
    try {
      const token = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days
      const { data: { user } } = await supabase.auth.getUser();

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
          invited_by: user?.id || null,
        });

      if (error) {
        console.error('Send invite error:', error);
        throw error;
      }

      // Send invitation email via Resend
      try {
        await supabase.functions.invoke('send-team-email', {
          body: {
            type: 'invite',
            to: email,
            inviteeName: inviteeName || email.split('@')[0],
            workspaceName: currentTenant.name || 'Aireatro',
            token,
            appUrl: 'https://aireatro.com',
          },
        });
      } catch (emailErr) {
        console.warn('Invite email failed (invite still created):', emailErr);
      }

      toast.success('Invite sent');
      await fetchInvites();
      return true;
    } catch (err: any) {
      console.error('Send invite exception:', err);
      toast.error(err.message || 'Failed to send invite');
      return false;
    }
  };

  const resendInvite = async (id: string): Promise<boolean> => {
    try {
      const newToken = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

      const { error } = await supabase
        .from('member_invites')
        .update({ token: newToken, expires_at: expiresAt })
        .eq('id', id);

      if (error) {
        console.error('Resend invite error:', error);
        throw error;
      }

      // Get invite details and resend email
      try {
        const { data: invite } = await supabase.from('member_invites').select('email').eq('id', id).maybeSingle();
        if (invite?.email) {
          await supabase.functions.invoke('send-team-email', {
            body: {
              type: 'invite',
              to: invite.email,
              workspaceName: currentTenant?.name || 'Aireatro',
              token: newToken,
              appUrl: 'https://aireatro.com',
            },
          });
        }
      } catch (emailErr) {
        console.warn('Resend email failed:', emailErr);
      }

      toast.success('Invite resent');
      await fetchInvites();
      return true;
    } catch (err: any) {
      console.error('Resend invite exception:', err);
      toast.error(err.message || 'Failed to resend invite');
      return false;
    }
  };

  const cancelInvite = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from('member_invites').delete().eq('id', id);
      if (error) {
        console.error('Cancel invite error:', error);
        throw error;
      }
      toast.success('Invite cancelled');
      await fetchInvites();
      return true;
    } catch (err: any) {
      console.error('Cancel invite exception:', err);
      toast.error(err.message || 'Failed to cancel invite');
      return false;
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

  const saveWorkingHours = async (hours: Partial<WorkingHours>[]): Promise<boolean> => {
    if (!currentTenant?.id) {
      toast.error('No workspace selected');
      return false;
    }
    
    try {
      // Delete existing workspace-level hours
      await supabase
        .from('working_hours')
        .delete()
        .eq('tenant_id', currentTenant.id)
        .is('team_id', null)
        .is('user_id', null);

      // Insert new hours
      const { error } = await supabase
        .from('working_hours')
        .insert(hours.map(h => ({
          day_of_week: h.day_of_week,
          start_time: h.start_time,
          end_time: h.end_time,
          is_active: h.is_active ?? true,
          tenant_id: currentTenant.id
        })));

      if (error) {
        console.error('Save working hours error:', error);
        throw error;
      }
      toast.success('Working hours saved');
      await fetchData();
      return true;
    } catch (err: any) {
      console.error('Save working hours exception:', err);
      toast.error(err.message || 'Failed to save working hours');
      return false;
    }
  };

  const saveSLASettings = async (settings: Partial<SLASettings>): Promise<boolean> => {
    if (!currentTenant?.id) {
      toast.error('No workspace selected');
      return false;
    }
    
    try {
      if (settings.id) {
        const { error } = await supabase
          .from('sla_settings')
          .update(settings)
          .eq('id', settings.id);
        if (error) {
          console.error('Update SLA settings error:', error);
          throw error;
        }
      } else {
        const { error } = await supabase
          .from('sla_settings')
          .insert({
            name: settings.name,
            first_response_minutes: settings.first_response_minutes ?? 15,
            follow_up_minutes: settings.follow_up_minutes ?? 60,
            resolution_hours: settings.resolution_hours ?? 24,
            escalate_on_breach: settings.escalate_on_breach ?? false,
            escalate_to_team_lead: settings.escalate_to_team_lead ?? false,
            after_hours_auto_reply: settings.after_hours_auto_reply ?? false,
            is_active: settings.is_active ?? true,
            team_id: settings.team_id || null,
            tenant_id: currentTenant.id
          });
        if (error) {
          console.error('Create SLA settings error:', error);
          throw error;
        }
      }
      
      toast.success('SLA settings saved');
      await fetchData();
      return true;
    } catch (err: any) {
      console.error('Save SLA settings exception:', err);
      toast.error(err.message || 'Failed to save SLA settings');
      return false;
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

  const createRule = async (rule: Partial<RoutingRule>): Promise<boolean> => {
    if (!currentTenant?.id) {
      toast.error('No workspace selected');
      return false;
    }
    
    try {
      const { data, error } = await supabase
        .from('routing_rules')
        .insert({ 
          name: rule.name,
          description: rule.description,
          priority: rule.priority ?? 0,
          is_active: rule.is_active ?? true,
          condition_type: rule.condition_type,
          condition_config: rule.condition_config ?? {},
          assign_to_team_id: rule.assign_to_team_id,
          assign_to_user_id: rule.assign_to_user_id,
          strategy: rule.strategy ?? 'round_robin',
          fallback_strategy: rule.fallback_strategy ?? 'least_busy',
          tenant_id: currentTenant.id 
        })
        .select()
        .single();
      
      if (error) {
        console.error('Create rule error:', error);
        throw error;
      }
      toast.success('Routing rule created');
      await fetchRules();
      return true;
    } catch (err: any) {
      console.error('Create rule exception:', err);
      toast.error(err.message || 'Failed to create routing rule');
      return false;
    }
  };

  const updateRule = async (id: string, updates: Partial<RoutingRule>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('routing_rules')
        .update(updates)
        .eq('id', id);
      
      if (error) {
        console.error('Update rule error:', error);
        throw error;
      }
      toast.success('Routing rule updated');
      await fetchRules();
      return true;
    } catch (err: any) {
      console.error('Update rule exception:', err);
      toast.error(err.message || 'Failed to update routing rule');
      return false;
    }
  };

  const deleteRule = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from('routing_rules').delete().eq('id', id);
      if (error) {
        console.error('Delete rule error:', error);
        throw error;
      }
      toast.success('Routing rule deleted');
      await fetchRules();
      return true;
    } catch (err: any) {
      console.error('Delete rule exception:', err);
      toast.error(err.message || 'Failed to delete routing rule');
      return false;
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
      // Fetch from audit_logs table
      let auditQuery = supabase
        .from('audit_logs')
        .select(`
          *,
          user:profiles!audit_logs_user_id_fkey(id, full_name, email, avatar_url)
        `)
        .eq('tenant_id', currentTenant.id)
        .order('created_at', { ascending: false })
        .limit(500);

      if (filters?.userId) {
        auditQuery = auditQuery.eq('user_id', filters.userId);
      }
      if (filters?.action) {
        auditQuery = auditQuery.eq('action', filters.action);
      }
      if (filters?.dateFrom) {
        auditQuery = auditQuery.gte('created_at', filters.dateFrom);
      }
      if (filters?.dateTo) {
        auditQuery = auditQuery.lte('created_at', filters.dateTo);
      }

      // Also fetch conversation events for richer activity log
      let eventsQuery = supabase
        .from('smeksh_conversation_events')
        .select('id, tenant_id, conversation_id, event_type, actor_profile_id, details, created_at')
        .eq('tenant_id', currentTenant.id)
        .order('created_at', { ascending: false })
        .limit(300);

      if (filters?.userId) {
        eventsQuery = eventsQuery.eq('actor_profile_id', filters.userId);
      }
      if (filters?.dateFrom) {
        eventsQuery = eventsQuery.gte('created_at', filters.dateFrom);
      }
      if (filters?.dateTo) {
        eventsQuery = eventsQuery.lte('created_at', filters.dateTo);
      }

      const [auditRes, eventsRes] = await Promise.all([auditQuery, eventsQuery]);

      if (auditRes.error) throw auditRes.error;

      const auditData = (auditRes.data || []) as AuditLog[];

      // Map conversation events to audit log format
      const eventActionMap: Record<string, string> = {
        assigned: 'assignment_changed',
        intervened: 'conversation_intervened',
        bot_resumed: 'bot_resumed',
        closed: 'conversation_closed',
        reopened: 'conversation_reopened',
        tagged: 'tag_added',
        untagged: 'tag_removed',
      };

      // Get unique actor IDs for profile lookup
      const actorIds = [...new Set((eventsRes.data || []).map(e => e.actor_profile_id).filter(Boolean))];
      let profileMap: Record<string, any> = {};
      if (actorIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, email, avatar_url')
          .in('id', actorIds);
        profileMap = (profiles || []).reduce((acc, p) => { acc[p.id] = p; return acc; }, {} as Record<string, any>);
      }

      const mappedEvents: AuditLog[] = (eventsRes.data || [])
        .filter(e => {
          const mapped = eventActionMap[e.event_type];
          if (!mapped) return false;
          if (filters?.action && mapped !== filters.action) return false;
          return true;
        })
        .map(e => ({
          id: e.id,
          tenant_id: e.tenant_id,
          user_id: e.actor_profile_id,
          action: eventActionMap[e.event_type] || e.event_type,
          resource_type: 'conversation',
          resource_id: e.conversation_id,
          details: e.details || {},
          ip_address: null,
          user_agent: null,
          created_at: e.created_at,
          user: e.actor_profile_id ? profileMap[e.actor_profile_id] || null : null,
        }));

      // Merge and sort by date descending
      const combined = [...auditData, ...mappedEvents]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 500);

      setLogs(combined);
    } catch (err: any) {
      console.error('Audit logs error:', err);
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
