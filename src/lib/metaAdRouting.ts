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

/** An ad counts as live when Meta says it is active, or — without Facebook — when it brought a chat recently. */
export const LIVE_AD_WINDOW_DAYS = 7;

export function isAdLive(opts: { metaStatus?: string | null; lastChatAt?: string | null; now?: number; windowDays?: number }) {
  const { metaStatus, lastChatAt, now = Date.now(), windowDays = LIVE_AD_WINDOW_DAYS } = opts;
  if (metaStatus) return metaStatus.toLowerCase() === 'active';
  if (!lastChatAt) return false;
  const at = Date.parse(lastChatAt);
  return Number.isFinite(at) && now - at <= windowDays * 24 * 60 * 60 * 1000;
}

export interface AgentLeadCount extends RoutedAgent {
  leads: number;
  recentLeads: number;
}

export interface AdLeadBreakdown {
  agents: AgentLeadCount[];
  unassigned: number;
  unassignedRecent: number;
  total: number;
}

export interface AdAgentLeadRow {
  ad_id: string;
  agent_id: string | null;
  leads: number | string;
  recent_leads: number | string;
}

/** Groups "ad → agent → lead count" rows per ad, busiest agent first. */
export function buildAdLeadBreakdown(rows: AdAgentLeadRow[], members: TeamMember[]): Map<string, AdLeadBreakdown> {
  const map = new Map<string, AdLeadBreakdown>();
  for (const row of rows) {
    const entry = map.get(row.ad_id) || { agents: [], unassigned: 0, unassignedRecent: 0, total: 0 };
    const leads = Number(row.leads) || 0;
    const recent = Number(row.recent_leads) || 0;
    entry.total += leads;
    if (!row.agent_id) {
      entry.unassigned += leads;
      entry.unassignedRecent += recent;
    } else {
      const member = findMember(members, row.agent_id);
      entry.agents.push({
        id: row.agent_id,
        name: member ? memberName(member) : 'Former agent',
        avatarUrl: member?.profile?.avatar_url,
        leads,
        recentLeads: recent,
      });
    }
    map.set(row.ad_id, entry);
  }
  map.forEach(e => e.agents.sort((a, b) => b.leads - a.leads || a.name.localeCompare(b.name)));
  return map;
}
