## Mail Module — Phase 2 & Phase 3

Phase 1 (DB + Resend in/out + auth hook + basic /mail UI) is already shipped. The Phase 2/3 scope wasn't defined in writing yet — here is what I'll build under each, in this exact order.

---

### Phase 2 — Premium Inbox UX + Collaboration

Frontend-heavy. No breaking changes to existing DB/edge functions. One small additive migration for collaboration features.

**Additive migration**
- `email_conversation_viewers` (collision detection: who's viewing a thread right now, last_seen_at)
- `email_templates` (name, subject, body_html, body_text, variables, created_by) — stub table, used in Phase 3 too
- `email_signatures` (per user: html, is_default)
- Add columns to `email_conversations`: `tags text[]`, `snoozed_until timestamptz`, `is_spam bool`, `resolved_at timestamptz`, `resolved_by uuid`
- Add `email_drafts` (conversation_id, user_id, body_html, updated_at) — per-user autosave

**UI rebuild of `/mail`**
- 3-pane Gmail/Front-style layout: left sidebar (Inboxes + Smart views) · conversation list · thread view + right context drawer
- Smart views: Assigned to me, Unassigned, Mentions, Starred, Snoozed, Sent, Spam, Resolved, All
- Filters: status, priority, assignee, inbox, tag, has-attachment, date range, unread
- Search bar (subject / from / body via Postgres tsvector — add GIN index on `email_messages` body_text)
- Bulk actions on list: assign, mark read/unread, snooze, label, resolve, spam, delete
- Thread view: collapsible quoted history, full HTML rendering in sandboxed iframe, inline images, attachment chips with download
- Reply composer: rich text (Tiptap), attachments, cc/bcc, send-as inbox, insert template, signature toggle, keyboard shortcuts (Cmd+Enter)
- Right drawer (Customer 360): CRM contact info, past conversations, WhatsApp threads, lead status, internal notes feed, activity timeline
- Collision indicator: live "Sarah is viewing" / "Sarah is typing" via Supabase Realtime channel per conversation
- Snooze (until tomorrow, Monday, custom datetime) with cron unsnooze job
- Keyboard shortcuts panel (`?`): j/k navigate, e archive, # delete, r reply, a assign, l label, s star
- Mobile-responsive collapse to single-pane

**Edge functions added in Phase 2**
- `email-snooze-worker` (cron every 5 min) — unsnoozes due conversations
- `resend-inbound` already handles inbound; extend it to mark spam via Resend `email.complained`

---

### Phase 3 — AI + Automations + Templates + Analytics

**Additive migration**
- `email_automations` (tenant_id, name, trigger jsonb, conditions jsonb, actions jsonb, is_active, run_count)
- `email_automation_runs` (audit log)
- `email_ai_suggestions` (conversation_id, kind: reply/summary/sentiment/category, content, model, created_at)
- `email_sla_policies` (first_response_minutes, resolution_minutes, business_hours)
- `email_sla_breaches` (conversation_id, type, breached_at)
- `email_analytics_daily` (materialized: tenant_id, date, inbox_id, volume_in, volume_out, avg_first_response_s, avg_resolution_s, by_agent jsonb)

**AI features (Lovable AI Gateway, default `google/gemini-3-flash-preview`)**
- `email-ai-suggest-reply` — generates 3 reply drafts based on thread + customer context
- `email-ai-summarize` — TL;DR of long threads at top of thread view
- `email-ai-classify` — auto-suggests tags + priority + sentiment on inbound; written to `email_ai_suggestions`
- `email-ai-translate` — translate inbound to user's language, draft replies in customer's language
- Composer: "✨ Improve / Shorten / Friendlier / Professional / Translate" actions

**Templates**
- Full templates UI (list, create/edit, variables `{{contact.name}}`, `{{agent.name}}`, `{{ticket.id}}`)
- Insert via `/` slash menu in composer, with live variable preview
- Shared per-tenant vs personal

**Automations engine**
- `email-automation-runner` edge function fired from `resend-inbound` after a message lands
- Trigger types: new conversation, new message, status changed, tag added, no response > N hours
- Conditions: from-domain, subject contains, has attachment, AI sentiment, language
- Actions: assign (specific / round-robin via existing function), set status / priority / tag, send canned reply, send template, forward, notify user
- UI: list view, drag-drop rule builder (similar to Form Rules pattern already in the codebase)

**Analytics (`/mail/analytics`)**
- KPI cards: total volume, response rate, avg first response, avg resolution, SLA compliance, AI-handled
- Charts: volume over time, by inbox, by agent (resolved/handled/avg response), busiest hours heatmap, top tags
- Agent leaderboard
- SLA breach feed
- Range picker (7/30/90 days), workspace-timezone aware (per project memory)
- Daily rollup cron `email-analytics-rollup`

---

### Order of delivery (one migration per phase, then code in parallel)

1. Phase 2 migration → approve → ship Phase 2 UI + edge functions → I'll pause for you to click around
2. Phase 3 migration → approve → ship Phase 3 AI + automations + templates + analytics → done

Reply **go** and I'll start with the Phase 2 migration.