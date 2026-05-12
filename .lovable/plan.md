## Premium /contact Page + Support Request Center

Build a complete enquiry & support hub at `/contact` with categorized requests, branded emails to both admin and customer, and an admin management panel.

### 1. Database (single migration)

Create `contact_requests` table:
- `id`, `ticket_id` (e.g. `AIR-2026-XXXXX`), `user_id`, `tenant_id` (workspace), `full_name`, `email`, `phone`, `business_name`, `country`, `category`, `priority`, `subject`, `message`, `status` (default `new`), `assigned_to`, `source_page`, `attachment_url`, `metadata jsonb`, `created_at`, `updated_at`, `closed_at`
- Enum `contact_request_status`: new, open, in_progress, replied, closed, cancelled
- Enum `contact_request_category`: live_chat, demo, technical, billing, whatsapp_api, meta_charges, payment_plans, account, feature_request, other
- Enum `contact_request_priority`: low, medium, high, urgent
- Auxiliary `contact_request_replies` table (reply history; admin → customer)
- Storage bucket `contact-attachments` (private, signed URLs)

**RLS:**
- Anonymous + authenticated users can INSERT (public contact form)
- Authenticated users can SELECT only their own (`user_id = auth.uid()`)
- Platform admins (existing `is_platform_admin()` helper) get full SELECT/UPDATE/DELETE
- Replies: only platform admins manage; customer can SELECT replies for their own requests
- Trigger to auto-generate `ticket_id` and `updated_at`

### 2. Frontend `/contact` page (`src/pages/Contact.tsx`)

- Reuse existing site Header (`SiteHeader`) and `Footer`
- **Hero**: "How can we help you?" + subtitle + 4 trust badges
- **Category grid** (8 cards) with lucide icons, hover/selected states, premium gradient
- **Dynamic form** (zod + react-hook-form): common fields + category-specific extras (demo date/time/timezone/business type/plan; billing plan/invoice ref/issue type; whatsapp phone/WABA ID/issue/screenshot; meta charges country/category/volume)
- Phone defaults to `+971` (matches existing brand rule)
- Attachment upload to `contact-attachments` bucket (≤5MB, image/pdf)
- Honeypot field + client throttle for spam protection
- **Success screen**: ticket ID, category, expected response time, "Chat on WhatsApp" CTA + "Back to Home"
- For `live_chat` category: prominent WhatsApp deeplink prefilled with ticket/email
- For `demo`: route through existing booking flow but also store in `contact_requests` with category=demo

### 3. Email templates (transactional)

Two new React Email templates in `supabase/functions/_shared/transactional-email-templates/`:
- `contact-request-admin.tsx` — fixed `to: 'admin@aireatro.com'`, premium card with ticket ID, category, priority, customer details, message, attachment link, CTA buttons (Open Admin, Reply, WhatsApp)
- `contact-request-customer.tsx` — branded confirmation with ticket summary, expected response time, CTAs (WhatsApp, Help Center, Book Demo)

Both Aireatro-branded (HSL 152 green, white background, mobile responsive). Register in `registry.ts`. Deploy.

Wire from `/contact` via `supabase.functions.invoke('send-transactional-email', ...)` after insert — two calls, one for each template, with `idempotencyKey` derived from `ticket_id`.

### 4. Admin panel

New page `src/pages/admin/AdminContactRequests.tsx`:
- Table with filters (category / status / priority), search (email / phone / ticket / workspace)
- Detail drawer: full request, attachment preview, internal notes, reply composer, status changer (open/in_progress/replied/closed/cancelled), assignment dropdown
- Reply action sends `contact-request-reply` email template (third template) and inserts into `contact_request_replies`, sets status=replied
- Close → sets `status=closed`, `closed_at=now()`
- Add route to `AdminLayout` sidebar under existing admin nav

### 5. Routing

- Add `/contact` lazy route in `src/App.tsx`
- Add `/control/contact-requests` (matching existing control panel pattern) in admin routes

### Technical notes

- Ticket ID format: `AIR-` + 6-char base36 random, ensured unique via DB trigger retry
- Use existing `supabase` client, existing `SiteHeader`, `Footer`, `Toaster`, design tokens from `index.css`
- All categories share one form component with conditional sections; zod schemas per category merged with base schema
- Storage upload before insert; URL stored on the row
- Rate limit: simple per-email/per-IP check via DB function (count last 10 min < 5)

### Out of scope

- Captcha (mention as future hardening; honeypot + rate limit used now)
- Real-time live chat widget (we route to WhatsApp instead, per existing pattern)
