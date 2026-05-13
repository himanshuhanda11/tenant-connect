# Rebuild "Build Your Target Audience"

A complete rewrite of the Campaigns audience builder — premium UI, correct filter logic, fast backend, live preview, mobile-ready.

The current builder runs ~6 sequential Supabase queries per filter change (tags, attributes, agent, lead status, summary, contacts) and intersects results client-side. With workspaces of 10k+ contacts that consistently times out (`57014: canceling statement due to statement timeout`), which is the root cause of "incorrect counts" and "empty audience" bugs you're seeing now.

So the fix has two halves: a new server-side RPC that does all filtering in one indexed query, and a new UI that sits on top of it.

---

## 1. New backend RPC: `campaign_audience_estimate`

Single Postgres function returning `{ total: bigint, sample_ids: uuid[] }`. All filters applied in one query, fully indexed, no client-side intersections.

Parameters (all nullable / empty-tolerant):
- `p_tenant_id uuid` (required)
- `p_assigned_agent uuid` — NULL = no filter; sentinel `'unassigned'` handled by caller passing a special flag
- `p_unassigned_only boolean`
- `p_lead_statuses text[]` — matches `conversations.crm_status`
- `p_contact_sources text[]` — empty/NULL = all
- `p_include_tag_ids uuid[]`, `p_exclude_tag_ids uuid[]`, `p_tag_match_all boolean`
- `p_include_segment_names text[]`, `p_exclude_segment_names text[]`
- `p_flow_id uuid`, `p_meta_campaign_id text`
- `p_date_from timestamptz`, `p_date_to timestamptz` (created_at)
- `p_last_active_from timestamptz`, `p_last_active_to timestamptz`
- `p_attributes jsonb` — `[{key,value}]`
- `p_is_unreplied boolean`, `p_exclude_recent_days int`
- `p_opt_in_only boolean`
- `p_exclude_blocked boolean`
- `p_sample_limit int default 25`

Implementation outline (CTEs combined with `EXISTS` / `NOT EXISTS` so empty arrays short-circuit):
```text
WITH base AS (
  SELECT id FROM contacts
  WHERE tenant_id = p_tenant_id
    AND (NOT p_opt_in_only OR opt_out = false)
    AND (NOT p_exclude_blocked OR blocked_by_user = false)
    AND (p_unassigned_only IS NOT TRUE OR assigned_agent_id IS NULL)
    AND (p_contact_sources IS NULL OR source = ANY(p_contact_sources))
    AND (p_flow_id IS NULL OR automation_flow = p_flow_id::text)
    AND (p_meta_campaign_id IS NULL OR campaign_source = p_meta_campaign_id)
    AND (p_date_from IS NULL OR created_at >= p_date_from)
    AND (p_date_to IS NULL OR created_at < p_date_to)
    AND (p_last_active_from IS NULL OR last_active_date >= p_last_active_from)
    AND (p_last_active_to IS NULL OR last_active_date < p_last_active_to)
    AND (p_include_segment_names IS NULL OR segment = ANY(p_include_segment_names))
    AND (p_exclude_segment_names IS NULL OR segment IS NULL OR NOT (segment = ANY(p_exclude_segment_names)))
)
-- chained AND EXISTS for tags (include + match-all), assigned agent (via contact_inbox_summary OR contacts.assigned_agent_id), lead_statuses (conversations.crm_status), attributes, is_unreplied, exclude_recent_days
-- AND NOT EXISTS for exclude tags
SELECT count(*) AS total, (SELECT array_agg(id) FROM (SELECT id FROM final LIMIT p_sample_limit) s) AS sample_ids
```

Add supporting indexes if missing:
- `contacts(tenant_id, source)`, `contacts(tenant_id, assigned_agent_id)`, `contacts(tenant_id, created_at)`, `contacts(tenant_id, last_active_date)`
- `contact_tags(contact_id, tag_id)` (PK already covers)
- `conversations(tenant_id, contact_id, crm_status)`
- `contact_inbox_summary(tenant_id, assigned_to)`
- `contact_attributes(tenant_id, contact_id, key)`

Function is `STABLE SECURITY DEFINER`, set `search_path = public`, and gated by `tenant_id` membership check using existing `is_tenant_member(tenant_id)` (or equivalent).

## 2. New UI component: `CampaignAudienceBuilder`

Replace the entire existing 1234-line component. New structure:

```text
src/components/campaigns/audience/
  CampaignAudienceBuilder.tsx     ← orchestrator
  AudienceSummaryCard.tsx         ← sticky hero with live count
  ActiveFilterChips.tsx           ← chip bar with per-chip remove + clear all
  sections/
    SegmentsSection.tsx
    TagsSection.tsx
    OwnershipSection.tsx          ← Assigned Agent + Unassigned
    LeadJourneySection.tsx        ← multi-select Inbox lead statuses
    DateActivitySection.tsx       ← presets + custom range, debounced
    ContactSourceSection.tsx      ← All Sources first, no placeholder
    CampaignAutomationSection.tsx ← Flow + Meta Campaign
    AdvancedAttributesSection.tsx
    SafetyExclusionsSection.tsx
  hooks/
    useAudienceEstimate.ts        ← debounced RPC caller, in-flight guard
    useAudienceMeta.ts            ← agents/flows/meta campaigns fetch
```

### Premium summary card (top, sticky on scroll)
- Big animated number (count-up) with skeleton shimmer while estimating
- Subtext: "Your selected filters currently match N contacts."
- Pills: "X filters active", "Updated Ns ago"
- Mini avatar stack of up to 5 sampled contacts (from `sample_ids`)

### Active filter chips bar
- Below summary, horizontally scrolling on mobile
- One chip per active filter; X removes that filter only
- "Clear all" link on the right

### Filter sections (premium accordion cards)
Each section is a `Card` with icon + title + count badge. First section open by default; rest collapsed. Order:
1. Segments
2. Tags (multi-select with chips inside)
3. Team & Ownership — Agent select: placeholder "Select agent" → real agents → "Unassigned" → "All agents" (last). Selecting "All agents" clears the filter.
4. Lead Journey — multi-select Inbox statuses from `INBOX_LEAD_STATUSES` (toggle chips, no enum mismatch with Inbox)
5. Date & Activity — preset row (Today, Yesterday, Last 7d, Last 30d, This Month, Custom) + popover Calendar with Apply button. Updates only on Apply. Removes blink.
6. Contact Source — chips: **All Sources** (default selected, first) + Facebook Ads, Website Widget, WhatsApp, CSV Import, Broadcast, Manual, API. Mapped to actual `contacts.source` values (`ctwa`, `widget`, `organic`, `import`, `broadcast`, `manual`, `api`).
7. Campaign & Automation — Flow + Meta Campaign selects
8. Advanced Attributes — key/value rows + Country/Language quick fields
9. Safety & Exclusions — exclude tags, opt-in only, exclude blocked, exclude contacted in last N days

### Removed
- CRM Status (legacy enum) — replaced by Lead Journey
- MAU Status
- Priority Level

### Live audience preview
- `useAudienceEstimate` debounces filter changes 400ms, cancels in-flight requests via `AbortController`, caches by filter hash for 30s
- Shows shimmer + dimmed previous count while loading (no flash to 0)
- Estimate triggered only after debounce — no per-keystroke spam

## 3. Filter behavior contract

| Filter | Empty / "All" semantics |
|---|---|
| Agent | placeholder = no filter; "All agents" = no filter; "Unassigned" = `assigned_agent_id IS NULL`; specific = UUID equality (also matches conversation-level assignment via `contact_inbox_summary`) |
| Lead status | empty array = no filter |
| Source | empty / "All Sources" = no filter |
| Date range | either bound NULL = open-ended on that side |
| Tags include | empty = no filter; non-empty + `match_all` = AND, otherwise OR |
| Segments | name-based match (current schema stores segment as text) |

All filters always include `tenant_id = current workspace`. RPC enforces this server-side too.

## 4. Mobile

- Summary card collapses to compact sticky bar under 640px
- Sections become full-width cards, chips scroll horizontally with momentum
- Touch targets ≥ 44px
- Date popover becomes bottom sheet on mobile (`Drawer` from shadcn)

## 5. Performance

- Single RPC per estimate (down from ~6 round-trips)
- Debounce 400ms, AbortController on stale requests
- `useMemo` for filter hash + active filter count
- Skeleton shimmer instead of layout shift
- `react-countup`-style number animation (lightweight inline impl, no new dep)

## Files

### New
- `supabase/migrations/<ts>_campaign_audience_estimate.sql` — RPC + indexes
- `src/components/campaigns/audience/CampaignAudienceBuilder.tsx`
- `src/components/campaigns/audience/AudienceSummaryCard.tsx`
- `src/components/campaigns/audience/ActiveFilterChips.tsx`
- `src/components/campaigns/audience/sections/*.tsx` (9 files)
- `src/components/campaigns/audience/hooks/useAudienceEstimate.ts`
- `src/components/campaigns/audience/hooks/useAudienceMeta.ts`

### Modified
- `src/pages/campaigns/CreateCampaign.tsx` — import path update only; `AudienceFilters` shape kept backward-compatible (legacy fields kept but unused, so existing draft autosave still loads)
- `src/components/campaigns/CampaignAudienceBuilder.tsx` — re-export from new location for any other imports

### Untouched
- Inbox, Contacts page, lead status mapping (already synced via `inboxLeadStatus.ts`)

## Out of scope (call out, do later if you want)
- Saved audiences / smart segments management UI (just rendering existing segments here)
- Mini contact preview list beyond avatar stack — can add in a follow-up
- Server-side suggestions ("add this tag to grow audience by ~X")

---

Approve and I'll build it: migration first (you'll get the standard approval prompt), then the new components in one batch, then wire it into `CreateCampaign.tsx`.
