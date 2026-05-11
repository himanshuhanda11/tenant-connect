# Aireatro Internal Support WhatsApp Widget

A global, Aireatro-owned WhatsApp support widget controlled exclusively from Super Admin (`/control`). Completely separate from customer workspace widgets. Smart display: small floating icon for paid/active users, full helpful card for new/free/incomplete users.

---

## 1. Database (single migration)

**New table: `support_widget_settings`** (singleton row, `id = 'global'`)
- `enabled` (bool, default true)
- `whatsapp_number` (E.164 text)
- `display_name` (e.g. "Aireatro Support")
- `welcome_message`, `cta_text`
- `full_widget_title`, `full_widget_subtitle`, `full_widget_message`
- `icon_only_tooltip`
- `position` ('bottom-right' | 'bottom-left')
- `brand_color` (hex)
- Visibility flags: `show_on_public_site`, `show_inside_dashboard`, `show_inside_onboarding`, `show_inside_billing`, `show_for_paid_users`, `show_for_free_users`, `show_for_incomplete_users`
- `prefilled_message_paid`, `prefilled_message_new` (templates with `{{email}}`, `{{workspace}}`, `{{plan}}`)
- `created_at`, `updated_at`

**RLS:**
- SELECT: public (anon + authenticated) — only the published config is needed client-side
- INSERT/UPDATE/DELETE: only `super_admin` (via existing `has_platform_role` helper)

**New table: `support_widget_events`**
- `id`, `user_id` (nullable), `workspace_id` (nullable), `widget_mode` ('icon_only'|'full_widget'), `event_type` ('view'|'click'), `page_url`, `created_at`
- RLS: anyone authenticated can INSERT their own row; only super_admin can SELECT

Seed one default row.

---

## 2. Frontend — Widget Component

**`src/components/support-widget/SupportWidget.tsx`** (mounted once in `App.tsx` root)
- Fetches `support_widget_settings` once (with localStorage cache for instant paint)
- Calls `getSupportWidgetMode(user, workspace, route)` → `'hidden' | 'icon_only' | 'full_widget'`
- Renders nothing if hidden; small WhatsApp FAB if icon_only; expandable card if full_widget
- Logs `view` once per session and `click` on CTA to `support_widget_events`
- Opens `https://wa.me/<number>?text=<prefilled>` with user context interpolated
- Excludes itself from `/control/*` admin pages and from customer-facing widget builder/preview pages

**`src/lib/supportWidget.ts`** — pure helper:
```ts
getSupportWidgetMode({ user, workspace, plan, onboardingComplete, hasWhatsApp, route, settings })
```
Logic:
- If `!settings.enabled` → hidden
- Route gates: public site → check `show_on_public_site`; `/dashboard*`, `/inbox*` etc → `show_inside_dashboard`; `/onboarding/*` → `show_inside_onboarding`; `/billing` → `show_inside_billing`
- Mode:
  - Paid/active (`plan in ['basic','pro','business']` AND status in `active|trialing`) OR `hasWhatsApp` → `icon_only` (if `show_for_paid_users`)
  - Else (free, no plan, incomplete onboarding, no WA) → `full_widget` (if `show_for_free_users` or `show_for_incomplete_users`)

**Design:** WhatsApp green (`#25D366`) FAB with soft shadow, rounded-full; full widget = floating card with header (logo + display_name + online dot), subtitle, body message, primary CTA "Chat with Support", optional "Book demo" link. Smooth scale/fade open animation. Mobile-responsive.

---

## 3. Super Admin Control Panel

**`src/pages/admin/AdminSupportWidget.tsx`** — added to `/control` sidebar under "Support Widget".
Layout: 2-column premium UI
- **Left (settings form):** tabbed sections — General (enabled, WA number, display name), Content (titles/messages/CTA/prefill templates), Appearance (color, position), Visibility (page toggles + user-segment toggles), Save & Publish button
- **Right (live preview):** sticky panel showing both Icon Only and Full Widget previews side-by-side using current form state; "Test on WhatsApp" button
- Analytics card at top: total views, total clicks, clicks by mode (queries `support_widget_events`)

Wired through existing `useAdminApi`/`useAdminQuery` patterns and gated by `super_admin` role.

**Edge function: `admin-support-widget`** (verify_jwt=false, manual ES256 verify per project memory) — endpoints:
- `GET /` → return settings + 30-day analytics rollup
- `POST /` → upsert settings (super_admin only)

---

## 4. Mounting & integration

- Mount `<SupportWidget />` once in `src/App.tsx` after `Toaster`, outside route switch
- Auto-hide on `/control/*` and on `/widgets/*` (customer widget builder) to avoid confusion
- Use existing `useAuth`, `useTenant`, `useWorkspaceBilling` hooks for context — no new hooks required
- Public/marketing pages: read settings via anon key (RLS allows SELECT)

---

## 5. Tracking & analytics

- `view` event fired once per session per page-load when widget renders
- `click` event fired on CTA tap
- Admin panel shows: total views, total clicks, CTR, breakdown by `widget_mode`

---

## Technical details

- Tables created via `supabase--migration`; default row inserted in same migration
- All colors via design tokens; widget uses hardcoded WhatsApp brand green which is acceptable for brand fidelity
- No customer workspace widget code is touched (`src/components/widgets/*` untouched)
- Edge function uses `esm.sh` imports per project standards; ES256 manual JWT pattern per `mem://technical/auth/es256-edge-function-pattern`
- CTA copy follows brand rule: "Chat with Support" + "Contact Us" (no "Demo/Sales" wording)
