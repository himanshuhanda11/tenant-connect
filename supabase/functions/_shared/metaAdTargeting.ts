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

export interface PrioritizableAutomation {
  created_at?: string | null;
  trigger_campaign_ids?: string[] | null;
  trigger_conditions?: unknown;
}

/**
 * How narrowly a rule targets ads: 0 = picks specific ads, 1 = picks
 * campaigns only, 2 = applies to every ad. Narrower rules run first.
 */
export function routingSpecificity(automation: PrioritizableAutomation): number {
  if (getTargetAdIds(automation.trigger_conditions).length > 0) return 0;
  if ((automation.trigger_campaign_ids || []).length > 0) return 1;
  return 2;
}

/**
 * Order in which rules run for an incoming ad chat. Assignment only applies
 * to unassigned chats, so the first matching rule decides the agent:
 * ad-specific rules beat campaign rules, which beat "every ad" rules; ties
 * go to the oldest rule.
 */
export function sortAutomationsByPriority<T extends PrioritizableAutomation>(automations: T[]): T[] {
  const time = (value?: string | null) => (value ? Date.parse(value) || 0 : 0);
  return [...automations].sort(
    (a, b) => routingSpecificity(a) - routingSpecificity(b) || time(a.created_at) - time(b.created_at),
  );
}

const ASSIGN_ACTION_TYPES = new Set(['assign_agent', 'assign_team', 'assign_agents_roundrobin']);

export function hasAssignAction(actions: unknown): boolean {
  return Array.isArray(actions) && actions.some(
    (action) => !!action && typeof action === 'object' && ASSIGN_ACTION_TYPES.has(String((action as Record<string, unknown>).type)),
  );
}

/** The active rule that decides which agent gets leads from this ad, if any. */
export function findWinningRoutingRule<T extends PrioritizableAutomation & { is_active?: boolean | null; actions?: unknown }>(
  automations: T[],
  match: { referralSourceId: string; matchedInternalCampaignIds?: string[] },
): T | null {
  const candidates = automations.filter((a) => a.is_active !== false && hasAssignAction(a.actions));
  return sortAutomationsByPriority(candidates).find((a) => automationMatchesAd({
    targetCampaignIds: a.trigger_campaign_ids || [],
    targetAdIds: getTargetAdIds(a.trigger_conditions),
    matchedInternalCampaignIds: match.matchedInternalCampaignIds || [],
    referralSourceId: match.referralSourceId,
  })) ?? null;
}
