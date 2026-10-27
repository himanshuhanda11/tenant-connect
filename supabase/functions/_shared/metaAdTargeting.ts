// Pure helpers for deciding whether a Meta ad automation applies to an
// incoming Click-to-WhatsApp chat. No Deno APIs so it can be unit-tested.

/** Ad IDs (as sent by WhatsApp in referral.source_id) an automation targets. */
export function getTargetAdIds(triggerConditions: unknown): string[] {
  if (!triggerConditions || typeof triggerConditions !== 'object') return [];
  const raw = (triggerConditions as Record<string, unknown>).meta_ad_ids;
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((v): v is string => typeof v === 'string')
    .map((v) => v.trim())
    .filter((v) => v.length > 0);
}

export interface AdTargetingInput {
  /** Internal campaign row IDs selected from the synced Meta campaign list. */
  targetCampaignIds: string[];
  /** Ad IDs selected from ads seen in WhatsApp clicks. */
  targetAdIds: string[];
  /** Internal campaign row IDs that matched this chat's referral. */
  matchedInternalCampaignIds: string[];
  /** referral.source_id of this chat, or null when it did not come from an ad. */
  referralSourceId: string | null;
}

/**
 * An automation with no campaign and no ad selected applies to every chat.
 * Otherwise the chat must come from one of the selected campaigns or ads.
 */
export function automationMatchesAd(input: AdTargetingInput): boolean {
  const { targetCampaignIds, targetAdIds, matchedInternalCampaignIds, referralSourceId } = input;
  if (targetCampaignIds.length === 0 && targetAdIds.length === 0) return true;
  if (!referralSourceId) return false;
  if (targetAdIds.includes(referralSourceId)) return true;
  return targetCampaignIds.some((id) => matchedInternalCampaignIds.includes(id));
}
