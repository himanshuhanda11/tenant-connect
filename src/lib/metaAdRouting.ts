import type { TeamMember } from '@/types/team';

export type AssignMode = 'turns' | 'one' | 'team' | 'none';

export interface RoutedAgent {
  id: string;
  name: string;
  avatarUrl?: string | null;
}

export interface AssignmentSummary {
  mode: AssignMode;
  agents: RoutedAgent[];
  teamName?: string;
}

export const ASSIGN_MODE_LABEL: Record<AssignMode, string> = {
  turns: 'Take turns',
  one: 'One agent',
  team: 'Team',
  none: 'Not assigned',
};

export function memberName(member: Pick<TeamMember, 'display_name' | 'profile'>) {
  return member.display_name || member.profile?.full_name || member.profile?.email || 'Agent';
}

/** Members who can receive leads (pending invites have no account yet). */
export function assignableMembers(members: TeamMember[]) {
  return members.filter(m => !!m.user_id);
}

function findMember(members: TeamMember[], id: string) {
  return members.find(m => m.user_id === id || m.id === id);
}

/** Who a rule hands its leads to, using current team names where possible. */
export function describeAssignment(
  actions: Record<string, unknown>[] | null | undefined,
  members: TeamMember[],
  teams: Array<{ id: string; name: string }>,
): AssignmentSummary {
  const list = actions || [];
  const turns = list.find(a => a.type === 'assign_agents_roundrobin');
  if (turns) {
    const ids = (turns.agent_ids as string[] | undefined) || [];
    const storedNames = (turns.agent_names as string[] | undefined) || [];
    return {
      mode: 'turns',
      agents: ids.map((id, index) => {
        const member = findMember(members, id);
        return { id, name: member ? memberName(member) : storedNames[index] || 'Removed agent', avatarUrl: member?.profile?.avatar_url };
      }),
    };
  }
  const one = list.find(a => a.type === 'assign_agent');
  if (one?.agent_id) {
    const id = String(one.agent_id);
    const member = findMember(members, id);
    return { mode: 'one', agents: [{ id, name: member ? memberName(member) : 'Removed agent', avatarUrl: member?.profile?.avatar_url }] };
  }
  const team = list.find(a => a.type === 'assign_team');
  if (team?.team_id) {
    return { mode: 'team', agents: [], teamName: teams.find(t => t.id === team.team_id)?.name || 'Team' };
  }
  return { mode: 'none', agents: [] };
}

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}
