import { describe, it, expect } from 'vitest';
import { findWinningRoutingRule, sortAutomationsByPriority } from '../../supabase/functions/_shared/metaAdTargeting';

const assign = [{ type: 'assign_agents_roundrobin', agent_ids: ['a', 'b'] }];

describe('Ad lead routing priority', () => {
  it('a rule for a specific ad wins over an older "every ad" rule', () => {
    const everyAd = { id: 'all', created_at: '2026-01-01T00:00:00Z', trigger_conditions: {}, trigger_campaign_ids: null, is_active: true, actions: assign };
    const specific = { id: 'ad', created_at: '2026-06-01T00:00:00Z', trigger_conditions: { meta_ad_ids: ['111'] }, trigger_campaign_ids: null, is_active: true, actions: assign };
    expect(sortAutomationsByPriority([everyAd, specific]).map(r => r.id)).toEqual(['ad', 'all']);
    expect(findWinningRoutingRule([everyAd, specific], { referralSourceId: '111' })?.id).toBe('ad');
    expect(findWinningRoutingRule([everyAd, specific], { referralSourceId: '999' })?.id).toBe('all');
  });

  it('paused rules and rules without agents never decide the agent', () => {
    const paused = { id: 'p', trigger_conditions: { meta_ad_ids: ['111'] }, is_active: false, actions: assign };
    const tagOnly = { id: 't', trigger_conditions: { meta_ad_ids: ['111'] }, is_active: true, actions: [{ type: 'add_tag' }] };
    expect(findWinningRoutingRule([paused, tagOnly], { referralSourceId: '111' })).toBeNull();
  });

  it('among two rules for the same ad, the older one wins', () => {
    const older = { id: 'old', created_at: '2026-01-01T00:00:00Z', trigger_conditions: { meta_ad_ids: ['111'] }, is_active: true, actions: assign };
    const newer = { id: 'new', created_at: '2026-02-01T00:00:00Z', trigger_conditions: { meta_ad_ids: ['111'] }, is_active: true, actions: assign };
    expect(findWinningRoutingRule([newer, older], { referralSourceId: '111' })?.id).toBe('old');
  });
});
