import { describe, it, expect } from 'vitest';
import { automationMatchesAd, getTargetAdIds } from '../../supabase/functions/_shared/metaAdTargeting';

describe('Meta ad automation targeting', () => {
  it('routes a chat from a selected WhatsApp ad', () => {
    expect(automationMatchesAd({
      targetCampaignIds: [], targetAdIds: ['120251676743290345'],
      matchedInternalCampaignIds: [], referralSourceId: '120251676743290345',
    })).toBe(true);
  });

  it('does not route a chat from a different ad', () => {
    expect(automationMatchesAd({
      targetCampaignIds: [], targetAdIds: ['120251676743290345'],
      matchedInternalCampaignIds: [], referralSourceId: '999',
    })).toBe(false);
  });

  it('does not route a non-ad chat when specific ads are selected', () => {
    expect(automationMatchesAd({
      targetCampaignIds: [], targetAdIds: ['111'],
      matchedInternalCampaignIds: [], referralSourceId: null,
    })).toBe(false);
  });

  it('applies to every chat when no ad or campaign is selected', () => {
    expect(automationMatchesAd({
      targetCampaignIds: [], targetAdIds: [],
      matchedInternalCampaignIds: [], referralSourceId: null,
    })).toBe(true);
  });

  it('still matches synced campaigns', () => {
    expect(automationMatchesAd({
      targetCampaignIds: ['c1'], targetAdIds: [],
      matchedInternalCampaignIds: ['c1'], referralSourceId: '555',
    })).toBe(true);
  });

  it('reads only non-empty ad IDs from saved conditions', () => {
    expect(getTargetAdIds({ meta_ad_ids: [' 123 ', '', 5, '456'] })).toEqual(['123', '456']);
    expect(getTargetAdIds(null)).toEqual([]);
  });
});
