
# WhatsApp Website Chat Widget Builder

A new Growth Tools module that lets workspaces design, deploy, and analyze a premium WhatsApp chat widget for their own websites. Built to feel like Intercom + Linear + Stripe — significantly more advanced than AiSensy.

## Scope (Phase 1 — Shippable MVP+)

Because this is a very large request, I'll ship it in two passes. **Phase 1** delivers the full builder UI, live preview, embed code, lead capture, analytics dashboard, and the public widget script. **Phase 2** (next message after you approve Phase 1) adds A/B testing, templates marketplace, geo greetings, AI greeting generator, and custom CSS editor.

## Phase 1 — What gets built now

### 1. Navigation & Routing
- New sidebar group **Growth Tools** → **WhatsApp Widget**
- Routes:
  - `/widgets` — list of widgets in workspace
  - `/widgets/new` — create
  - `/widgets/:id` — builder (config + live preview)
  - `/widgets/:id/install` — install instructions + embed code
  - `/widgets/:id/leads` — captured leads
  - `/widgets/:id/analytics` — analytics dashboard

### 2. Builder UI (premium, not AiSensy-style)
Two-pane layout, glassmorphism, dark+emerald luxury theme, framer-motion animations.

**Left pane — tabbed config:**
1. **Type** — Floating Bubble · Full Popup · Agent Bubble · Multi-Agent · Minimal Icon · Sticky Bottom Bar · Mobile-only CTA
2. **Branding** — primary color, gradient toggle, header/bg/text colors, logo upload, agent image upload
3. **Message** — greeting, subtitle, typing effect toggle, online/offline status, CTA button text, prefilled WhatsApp message
4. **Position & Visibility** — corner, margins, desktop/mobile/both
5. **Triggers** — delay seconds, exit intent, scroll %, page URL include/exclude
6. **Business Hours** — timezone-aware schedule, offline message
7. **Agents** — multi-agent list with avatar/name/role/department, rotation strategy (random/priority/round-robin)
8. **Lead Form** — toggle pre-chat form (name/phone/email + required flags)
9. **Animation** — bounce / pulse / floating / slide-in / glow
10. **Advanced** — dark mode toggle, hide "Powered by Aireatro" (gated by plan)

**Right pane — live preview:**
- Simulated browser frame with mock website background
- Desktop / Mobile toggle with device chrome
- Real-time re-render on every config change
- Animated entry, hover states, opened/closed states

### 3. Public Widget Runtime
- `public/widget.js` — self-contained vanilla JS loader (no React) for fast embed, < 15KB gzipped target, lazy-loads styles, no CLS, respects triggers
- Edge function `widget-config` — returns published config JSON by widget ID (cached, public)
- Edge function `widget-event` — receives view/click/lead events from the script
- Edge function `widget-lead` — accepts pre-chat form submissions, creates contact + conversation in CRM, returns WhatsApp deep link

### 4. Embed / Install Page
- One-line `<script>` snippet with copy button
- Tabs: HTML · WordPress · Shopify · React
- QR code preview of widget URL
- Live "test on your site" button

### 5. Analytics Dashboard
- KPIs: views, clicks, CTR, leads, conversion rate
- Recharts: time series, top pages, device split
- Date range selector

### 6. Lead Capture
- Form submissions stored and surfaced under `/widgets/:id/leads`
- Auto-create contact in existing CRM, attribute source = `website_widget`
- Optional auto-assignment to selected agent/team

## Technical details

### Database (new tables, all RLS by tenant_id)
- `widgets` — id, tenant_id, name, status (draft/published/paused), config JSONB, public_key, created_by, created_at, updated_at
- `widget_agents` — id, widget_id, name, role, avatar_url, phone_e164, department, priority, active
- `widget_events` — id, widget_id, tenant_id, event_type (view/open/click/lead), page_url, device, country, session_id, created_at
- `widget_leads` — id, widget_id, tenant_id, name, phone, email, message, page_url, created_at, contact_id (fk)

RLS: workspace members can manage widgets in their tenant. Public read of `widgets.config` only via edge function (filtered to published + by public_key).

### Edge functions (verify_jwt = false, manual ES256 where needed)
- `widget-config` — public GET by `?id=public_key`
- `widget-event` — public POST, rate-limited per session
- `widget-lead` — public POST, validates with Zod, creates contact + lead

### Frontend
- Pages under `src/pages/widgets/`
- Builder components under `src/components/widgets/`
- Widget runtime under `public/widget.js` (hand-written, framework-free)
- Use existing Tailwind tokens, framer-motion (already in project), recharts

### Plan gating
- Free: 1 widget, Aireatro branding shown
- Basic+: multiple widgets, branding removable on Pro+
- Use existing `usePlanGate` / `workspace_entitlements`

## Out of scope for Phase 1 (Phase 2)
- AI greeting generator (Lovable AI)
- Templates marketplace (Real Estate / Ecom / etc.)
- A/B testing engine
- Geo-based dynamic greetings (needs IP geo)
- Custom CSS editor with live sandbox
- Dynamic UTM-based welcome messages

## Diagram

```text
┌─────────────────────────────────────────────────────────┐
│  /widgets/:id  (Builder Page)                           │
│ ┌────────────────────┬──────────────────────────────┐   │
│ │  Config Tabs       │   Live Preview               │   │
│ │  Type/Brand/Msg…   │   [Desktop | Mobile]         │   │
│ │                    │   simulated site + widget    │   │
│ └────────────────────┴──────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
            │ saves config JSON
            ▼
   widgets table  ──►  widget-config edge fn  ──►  public/widget.js
                                                        │
                       widget-event ◄──── analytics ────┤
                       widget-lead  ◄──── form submit ──┘
```

Approve this and I'll build Phase 1 end-to-end (DB migration → edge functions → builder UI → preview → install page → analytics → public widget.js). Phase 2 ships right after.
