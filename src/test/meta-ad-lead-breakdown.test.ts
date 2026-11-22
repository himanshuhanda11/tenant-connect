import { describe, it, expect } from 'vitest';
import { buildAdLeadBreakdown, isAdLive } from '@/lib/metaAdRouting';
import type { TeamMember } from '@/types/team';

const now = Date.parse('2026-11-22T18:00:00Z');
const daysAgo = (d: number) => new Date(now - d * 24 * 60 * 60 * 1000).toISOString();

describe('Live ads', () => {
  it('without Facebook, an ad with a chat in the last 7 days is live and an older one is not', () => {
    expect(isAdLive({ lastChatAt: daysAgo(6), now })).toBe(true);
    expect(isAdLive({ lastChatAt: daysAgo(8), now })).toBe(false);
  });

  it('when Facebook reports the status, a paused ad is not live even with chats today', () => {
    expect(isAdLive({ metaStatus: 'PAUSED', lastChatAt: daysAgo(0), now })).toBe(false);
    expect(isAdLive({ metaStatus: 'active', lastChatAt: daysAgo(30), now })).toBe(true);
  });
});

describe('Where each ad\'s leads went', () => {
  it('counts leads per agent for each ad, busiest agent first, and keeps unassigned leads apart', () => {
    const members = [
      { id: 'm1', user_id: 'u1', display_name: 'Asha' },
      { id: 'm2', user_id: 'u2', display_name: 'Ben' },
    ] as unknown as TeamMember[];
    const map = buildAdLeadBreakdown([
      { ad_id: 'ad1', agent_id: 'u1', leads: 5, recent_leads: 1 },
      { ad_id: 'ad1', agent_id: 'u2', leads: 12, recent_leads: 3 },
      { ad_id: 'ad1', agent_id: null, leads: 2, recent_leads: 0 },
      { ad_id: 'ad2', agent_id: 'u1', leads: 4, recent_leads: 4 },
    ], members);
    const ad1 = map.get('ad1')!;
    expect(ad1.agents.map(a => [a.name, a.leads, a.recentLeads])).toEqual([['Ben', 12, 3], ['Asha', 5, 1]]);
    expect(ad1.unassigned).toBe(2);
    expect(ad1.total).toBe(19);
    expect(map.get('ad2')!.agents.map(a => a.name)).toEqual(['Asha']);
  });
});
