# AIReatro Communications Platform — Complete Technical Documentation

**Version:** 1.0  
**Date:** February 2026  
**Published URL:** https://smeksh.lovable.app  
**Stack:** React + Vite + TypeScript + Tailwind CSS + Supabase (Lovable Cloud)

---

## Table of Contents

1. [Platform Overview](#1-platform-overview)
2. [Architecture & Tech Stack](#2-architecture--tech-stack)
3. [Authentication & Onboarding](#3-authentication--onboarding)
4. [Multi-Tenant Workspace System](#4-multi-tenant-workspace-system)
5. [Dashboard Pages (App)](#5-dashboard-pages-app)
6. [Marketing / Public Pages](#6-marketing--public-pages)
7. [Control Center (Super Admin)](#7-control-center-super-admin)
8. [Edge Functions (Backend)](#8-edge-functions-backend)
9. [Custom Hooks (Frontend Logic)](#9-custom-hooks-frontend-logic)
10. [Database Schema Overview](#10-database-schema-overview)
11. [RBAC & Feature Gating](#11-rbac--feature-gating)
12. [Billing & Credits System](#12-billing--credits-system)
13. [Complete Route Map](#13-complete-route-map)

---

## 1. Platform Overview

AIReatro Communications is a **multi-tenant WhatsApp Business SaaS platform** enabling businesses to:

- Connect WhatsApp Business API phone numbers
- Manage customer conversations via a shared team inbox
- Send broadcast campaigns using approved templates
- Automate workflows with a visual flow builder
- Manage contacts, tags, segments, and custom attributes
- Run Meta Ads with Click-to-WhatsApp attribution
- Enforce plan-based feature gating (Free → Basic → Pro → Business)

---

## 2. Architecture & Tech Stack

### Frontend
| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS + shadcn/ui |
| Routing | React Router DOM v6 |
| State Management | TanStack React Query v5 |
| Forms | React Hook Form + Zod validation |
| Charts | Recharts |
| Animations | Framer Motion (via CSS) |

### Backend (Lovable Cloud / Supabase)
| Layer | Technology |
|-------|-----------|
| Database | PostgreSQL (Supabase) |
| Auth | Supabase Auth (email/password) |
| API Layer | Supabase Edge Functions (Deno) |
| File Storage | Supabase Storage |
| Realtime | Supabase Realtime (Postgres Changes) |

### Contexts (Global State)
| File | Purpose |
|------|---------|
| `AuthContext.tsx` | User authentication state, login/logout, session management |
| `TenantContext.tsx` | Current workspace/tenant selection, multi-tenant switching |
| `ThemeContext.tsx` | Dark/light theme management with system preference detection |

---

## 3. Authentication & Onboarding

### Pages & Routes

| Route | Page | Purpose |
|-------|------|---------|
| `/login` | `Login.tsx` | Email/password sign-in |
| `/signup` | `onboarding/SignupPage.tsx` | Multi-step registration |
| `/onboarding/org` | `onboarding/OrganizationPage.tsx` | Organization name setup |
| `/onboarding/password` | `onboarding/PasswordPage.tsx` | Password creation step |
| `/forgot-password` | `ForgotPassword.tsx` | Password reset request |
| `/reset-password` | `ResetPassword.tsx` | Password reset form (from email link) |
| `/auth/callback` | `AuthCallback.tsx` | OAuth/magic link callback handler |
| `/invite/accept` | `InviteAccept.tsx` | Team invitation acceptance |

### Logic Flow
1. User signs up → email verification required (auto-confirm disabled)
2. After verification → redirected to `/onboarding/org` to create organization
3. Organization created → workspace auto-created via `create_tenant_with_owner()` RPC
4. User redirected to `/select-workspace`
5. On workspace selection → `TenantContext` sets `currentTenant` → Dashboard loads

### Key Functions
- **`AuthContext`**: Manages `supabase.auth.onAuthStateChange()`, provides `user`, `signIn()`, `signOut()`, `loading` state
- **`create_tenant_with_owner()`**: Database RPC that atomically creates tenant + owner membership

---

## 4. Multi-Tenant Workspace System

### Pages

| Route | Page | Purpose |
|-------|------|---------|
| `/select-workspace` | `SelectWorkspace.tsx` | Workspace selector (mandatory after login) |
| `/create-workspace` | `CreateWorkspace.tsx` | Redirects to `/select-workspace` modal |

### Logic
- **`TenantContext`**: Stores selected `currentTenant` in state
- **`tenant_members`** table: Maps users to workspaces with roles (owner/admin/manager/agent/analyst)
- **RLS**: All data tables filter by `tenant_id` matching the user's membership
- **Rate Limiting**: `check_workspace_creation_allowed()` limits 3 creates/hour, 2 free workspaces/owner

### Database Tables
- `tenants` — Workspace records (id, name, slug)
- `tenant_members` — User↔Workspace membership with role
- `profiles` — User profile data (name, email, avatar)

---

## 5. Dashboard Pages (App)

### 5.1 Dashboard (`/dashboard`)
**File:** `src/pages/Dashboard.tsx`  
**Hook:** `useDashboardData.ts`  
**Components:** `src/components/dashboard/`

**Features:**
- Overview KPI cards (conversations, messages, contacts, response time)
- Billing & usage panel with progress bars
- Recent conversations list
- Quick action buttons
- AI-powered insights (via `dashboard-ai-insights` edge function)

---

### 5.2 Inbox (`/inbox`, `/inbox/:id`)
**File:** `src/pages/InboxPage.tsx`  
**Hook:** `useInbox.ts`, `useConversations.ts`, `useMessages.ts`  
**Components:** `src/components/inbox/`

**Features:**
- Real-time conversation list with search/filter
- Message thread view (text, media, templates)
- Contact sidebar with CRM details
- Agent assignment & claiming (`claim_conversation()`, `claim_on_reply()`)
- AI-assisted replies (`inbox-ai-assist` edge function)
- Conversation status management (new → open → resolved → closed)
- Media URL resolution (`get-media-url` edge function)
- Typing indicators and read receipts

**Key Database Functions:**
- `claim_conversation()` — Atomic claim with conflict detection
- `open_conversation()` — Track opens + auto-claim
- `intervene_conversation()` — Admin takeover
- `transfer_conversation()` — Reassign to another agent
- `assign_conversation()` — Admin-only direct assignment

---

### 5.3 Contacts (`/contacts`)
**File:** `src/pages/Contacts.tsx`  
**Hook:** `useContacts.ts`, `useContactTags.ts`, `useContactAttributes.ts`  
**Components:** `src/components/contacts/`

**Sub-pages:**
| Route | Page | Purpose |
|-------|------|---------|
| `/contacts` | `Contacts.tsx` | Contact list with search, filters, bulk actions |
| `/contacts/segments` | `ContactSegments.tsx` | Dynamic contact segments with rule builder |
| `/contacts/imports` | `ContactImports.tsx` | CSV import with validation |
| `/contacts/duplicates` | `ContactDuplicates.tsx` | Duplicate detection & merge |
| `/contacts/data-requests` | `ContactDataRequests.tsx` | GDPR data export/deletion requests |

**Database Tables:** `contacts`, `contact_tags`, `contact_attributes`, `contact_inbox_summary`

---

### 5.4 Tags (`/tags`)
**File:** `src/pages/Tags.tsx`  
**Hook:** `useTags.ts`  
**Features:** Create, edit, delete, color-code tags. Used across contacts and conversations.

---

### 5.5 User Attributes (`/user-attributes`)
**File:** `src/pages/UserAttributes.tsx`  
**Hook:** `useContactAttributes.ts`  
**Features:** Define custom contact fields (text, number, date, select). Used in templates and segments.

---

### 5.6 Phone Numbers (`/phone-numbers`)
**Files:** `src/pages/phone-numbers/`  
**Hook:** `usePhoneNumbers.ts`

| Route | Page | Purpose |
|-------|------|---------|
| `/phone-numbers` | `PhoneNumbersList.tsx` | List all connected WhatsApp numbers with status |
| `/phone-numbers/connect` | `ConnectNumber.tsx` | Meta Embedded Signup wizard to connect WABA |
| `/phone-numbers/:id` | `PhoneNumberDetails.tsx` | Number management hub: profile, quality, test messaging |

**Connection Flow (Edge Functions):**
1. `meta-embedded-signup` — Initiates Meta OAuth embedded signup
2. `phone-connect-start` → `phone-connect-complete` — Stores WABA credentials
3. `store-waba-credentials` — Saves access tokens securely
4. `waba-webhook-subscribe` — Subscribes to webhook events
5. `verify-waba-status` — Checks connection health

**WhatsApp Profile Management:**
- `whatsapp-profile` edge function — Sync/update business profile, upload profile picture via Meta Resumable Upload API

---

### 5.7 Templates (`/templates`)
**File:** `src/pages/Templates.tsx`  
**Hook:** `useTemplates.ts`, `useTemplateBuilder.ts`

**Features:**
- Template list with status indicators (APPROVED, PENDING, REJECTED)
- Visual template builder with header/body/footer/buttons
- Variable insertion (`{{1}}`, `{{2}}`, etc.)
- AI-powered validation (`validate-template-ai` edge function)
- Submit to Meta for approval (`submit-template-to-meta` edge function)
- Auto-sync from Meta (`sync-templates` edge function)
- Template fix suggestions (`template-apply-fixes` edge function)

**Edge Functions:**
| Function | Purpose |
|----------|---------|
| `validate-template-ai` | AI checks template for Meta policy compliance |
| `submit-template-to-meta` | Submits template to WhatsApp Business API |
| `template-submit` | Alternative submission endpoint |
| `template-poll` | Polls Meta for template approval status |
| `template-apply-fixes` | AI-suggested fixes for rejected templates |
| `sync-templates` | Full sync of templates from Meta Graph API |

---

### 5.8 Campaigns (`/campaigns`)
**Files:** `src/pages/campaigns/`

| Route | Page | Purpose |
|-------|------|---------|
| `/campaigns` | `CampaignsList.tsx` | List campaigns with status/analytics |
| `/campaigns/create` | `CreateCampaign.tsx` | Multi-step campaign builder |
| `/campaigns/:id` | `CampaignDetails.tsx` | Campaign analytics & job tracking |
| `/campaigns/library` | `CampaignLibrary.tsx` | Reusable campaign templates |

**Logic:**
- Select template → Choose audience (tags/segments/CSV) → Set schedule → Launch
- Jobs queued in `campaign_jobs` table
- `lock_campaign_jobs()` — Worker locks batch for processing
- `complete_campaign_job()` — Updates job status with delivery tracking
- `update_campaign_progress()` — Aggregates job statuses to campaign level
- `pause_campaign()` — Cancels queued jobs and pauses campaign
- Credit deduction via `deduct_message_credit()` RPC

---

### 5.9 Automation (`/automation`)
**File:** `src/pages/AutomationWorkflows.tsx`  
**Hook:** `useAutomationWorkflows.ts`

**Features:**
- Workflow list with status toggles (draft/active/paused)
- Trigger types: message received, keyword match, contact created, scheduled
- Visual workflow builder (planned)

**Sub-pages:**
| Route | Page | Purpose |
|-------|------|---------|
| `/automation` | `AutomationWorkflows.tsx` | Workflow list & management |
| `/automation/form-rules` | `AutoFormRules.tsx` | Auto-form trigger rules |

**Database Tables:** `automation_workflows`, `automation_nodes`, `automation_edges`, `automation_runs`, `automation_steps`, `automation_scheduled_jobs`

**Key Functions:**
- `automation-event` — Processes automation triggers
- `automation-job-runner` — Executes scheduled automation jobs
- `lock_due_automation_jobs()` — Atomic job locking for workers
- `complete_automation_job_v2()` — Retry with exponential backoff
- Rate limiting: `check_automation_rate_limit()`, `increment_automation_rate_limit()`
- Cooldowns: `check_automation_cooldown()`, `set_automation_cooldown()`
- Loop detection: `check_automation_loop()`

---

### 5.10 Flows (`/flows`)
**Files:** `src/pages/flows/`  
**Hook:** `useFlows.ts`

| Route | Page | Purpose |
|-------|------|---------|
| `/flows` | `FlowsHub.tsx` | Visual flow builder hub |
| `/flows/builder` | `FlowBuilder.tsx` | Drag-and-drop flow designer |
| `/flows/builder/:id` | `FlowBuilder.tsx` | Edit existing flow |

---

### 5.11 Team Management (`/team`)
**Files:** `src/pages/team/`  
**Hook:** `useTeam.ts`

| Route | Page | Purpose |
|-------|------|---------|
| `/team` | `TeamOverview.tsx` | Team dashboard with workload overview |
| `/team/members` | `TeamMembers.tsx` | Member list, invite, edit, remove |
| `/team/roles` | `TeamRoles.tsx` | Role definitions & permissions |
| `/team/groups` | `TeamGroups.tsx` | Agent groups/teams for routing |
| `/team/routing` | `TeamRouting.tsx` | Conversation routing rules |
| `/team/sla` | `TeamSLA.tsx` | SLA policy configuration |
| `/team/audit` | `TeamAudit.tsx` | Team activity audit logs |

**Routing Strategies:**
- Round Robin: `pick_profile_round_robin()` / `smeksh_pick_profile_round_robin()`
- Least Busy: `pick_profile_least_busy()` / `smeksh_pick_profile_least_busy()`
- Auto-route: `auto_route_conversation()` / `smeksh_auto_route_conversation()`
- Workload visibility: `get_team_workload()` / `smeksh_get_team_workload()`

**Edge Functions:**
- `create-team-member` — Creates agent record + sends invitation email
- `send-team-email` — Sends team invitation/notification emails

---

### 5.12 Meta Ads (`/meta-ads`)
**Files:** `src/pages/meta-ads/`  
**Hook:** `useMetaAdAccounts.ts`

| Route | Page | Purpose |
|-------|------|---------|
| `/meta-ads` | `MetaAdsOverview.tsx` | Ads dashboard with ROAS metrics |
| `/meta-ads/setup` | `MetaAdsSetup.tsx` | Connect Meta Ad Account |
| `/meta-ads/manager` | `MetaAdsManager.tsx` | Create & manage ad campaigns |
| `/meta-ads/analytics` | `MetaAdsAnalytics.tsx` | Ad performance analytics |
| `/meta-ads/attribution` | `MetaAdsAttribution.tsx` | Click-to-WhatsApp attribution |
| `/meta-ads/automations` | `MetaAdsAutomations.tsx` | Ad-triggered automations |
| `/meta-ads/settings` | `MetaAdsSettings.tsx` | Ad account settings |

**Edge Functions:**
- `meta-ads-connect-start` — Initiates Meta OAuth for Ad accounts
- `meta-ads-connect-callback` — Handles OAuth callback
- `meta-ads-fb-login` — Facebook Login integration

---

### 5.13 Billing (`/billing`)
**File:** `src/pages/Billing.tsx`  
**Hooks:** `useBilling.ts`, `useEntitlements.ts`, `useMessageCredits.ts`

**Tabs:**
| Tab | Components | Purpose |
|-----|-----------|---------|
| Overview | `WorkspacePlanCard`, `MessageCreditsCard`, `MetaBillingNotice`, `BillingOverviewCards`, `UsageOverview`, `BillingFAQ` | Plan status, credits, usage bars |
| Plans | `PlanCard`, `AddOnsSection` | Plan comparison & upgrade |
| Usage | `UsageOverview` | Detailed usage metrics |
| Settings | `BillingSettingsForm` | Business info, tax settings |

**Add-ons:** `/add-ons` → `WorkspaceAddOns.tsx`

---

### 5.14 Integrations (`/app/integrations`)
**Files:** `src/pages/IntegrationsHub.tsx`, `IntegrationDetail.tsx`  
**Hook:** `useIntegrations.ts`

| Route | Purpose |
|-------|---------|
| `/app/integrations` | Integration marketplace/hub |
| `/app/integrations/:key` | Individual integration setup |

**Edge Function:** `integration-webhook` — Handles incoming webhook payloads from integrations

---

### 5.15 Settings (`/settings`)
**File:** `src/pages/Settings.tsx`  
**Components:** `src/components/settings/`

**13 Sections (vertical nav):**
1. **Workspace** — Name, slug, branding
2. **Messaging** — Default reply, business hours
3. **WhatsApp Number** — Connected number status, quality rating
4. **Inbox** — Auto-assign, notification preferences
5. **Automation** — Default cooldowns, rate limits
6. **Integrations** — Connected services
7. **Team** — Default roles, invitation settings
8. **Security** — 2FA, session management
9. **Billing** — Quick link to billing page
10. **Compliance** — Opt-in/opt-out settings
11. **Developer** — API keys, webhook URLs
12. **Notifications** — Email/push notification preferences
13. **Advanced** — Danger zone (delete workspace)

---

### 5.16 Help (`/help`)
**Files:** `src/pages/help/`  
**Hook:** `useGuides.ts`

| Route | Page | Purpose |
|-------|------|---------|
| `/help` | `HelpCenter.tsx` | Help center home with categories |
| `/help/category/:cat` | `HelpCategory.tsx` | Articles by category |
| `/help/inbox` | `InboxGuide.tsx` | Inbox usage guide |
| `/help/templates` | `TemplatesGuide.tsx` | Template creation guide |
| `/help/automation` | `AutomationGuide.tsx` | Automation setup guide |
| `/help/contacts-tags` | `ContactsTagsGuide.tsx` | Contact management guide |
| `/help/meta-ads` | `MetaAdsGuide.tsx` | Meta Ads guide |
| `/help/workspaces` | `WorkspacesGuide.tsx` | Workspace management guide |
| `/help/:slug` | `GuideDetail.tsx` | Individual article |

---

## 6. Marketing / Public Pages

| Route | Page | Purpose |
|-------|------|---------|
| `/` | `Index.tsx` | Landing page / homepage |
| `/features` | `Features.tsx` | Feature overview |
| `/features/inbox` | `InboxFeature.tsx` | Inbox feature page |
| `/features/contacts` | `ContactsFeature.tsx` | Contacts feature page |
| `/features/templates` | `TemplatesFeature.tsx` | Templates feature page |
| `/features/campaigns` | `CampaignsFeature.tsx` | Campaigns feature page |
| `/features/automation` | `AutomationFeature.tsx` | Automation feature page |
| `/features/integrations` | `IntegrationsFeature.tsx` | Integrations feature page |
| `/features/analytics` | `AnalyticsFeature.tsx` | Analytics feature page |
| `/features/phone-numbers` | `PhoneNumbersFeature.tsx` | Phone numbers feature page |
| `/features/team-roles` | `TeamRolesFeature.tsx` | Team & roles feature page |
| `/features/audit-logs` | `AuditLogsFeature.tsx` | Audit logs feature page |
| `/pricing` | `Pricing.tsx` | Pricing plans page |
| `/products` | `Products.tsx` | Products overview |
| `/about` | `About.tsx` | About the company |
| `/contact` | `Contact.tsx` | Contact form |
| `/blog` | `Blog.tsx` | Blog listing |
| `/blog/:slug` | `BlogPost.tsx` | Individual blog post |
| `/careers` | `Careers.tsx` | Careers page |
| `/integrations` | `Integrations.tsx` | Public integrations page |
| `/security` | `Security.tsx` | Security & compliance |
| `/case-studies` | `CaseStudies.tsx` | Customer case studies |
| `/case-studies/:slug` | `CaseStudyDetail.tsx` | Individual case study |
| `/template-library` | `TemplateLibrary.tsx` | Public template gallery |
| `/documentation` | `Documentation.tsx` | API documentation |
| `/partners` | `Partners.tsx` | Partner program |
| `/install` | `Install.tsx` | App installation page |
| `/whatsapp-forms` | `WhatsAppForms.tsx` | WhatsApp Forms product |
| `/whatsapp-business-api` | `WhatsAppBusinessApi.tsx` | WhatsApp API info |
| `/click-to-whatsapp` | `ClickToWhatsApp.tsx` | CTWA ads info |
| `/why-whatsapp-marketing` | `WhyWhatsAppMarketing.tsx` | Marketing guide |
| `/free-whatsapp-api-lifetime` | `FreeWhatsAppApiLifetime.tsx` | SEO landing page |

### Legal Pages

| Route | Page |
|-------|------|
| `/privacy-policy` | `PrivacyPolicy.tsx` |
| `/terms` | `Terms.tsx` |
| `/data-deletion` | `DataDeletion.tsx` |
| `/acceptable-use` | `AcceptableUse.tsx` |
| `/cookie-policy` | `CookiePolicy.tsx` |
| `/refund-policy` | `RefundPolicy.tsx` |
| `/compliance` | `Compliance.tsx` |
| `/app-access-instructions` | `AppAccessInstructions.tsx` |

---

## 7. Control Center (Super Admin)

**Base Route:** `/control`  
**Layout:** `src/pages/admin/AdminLayout.tsx`  
**Access:** Restricted to `platform_admins` table (roles: `super_admin`, `support`)  
**Components:** `src/components/admin/`

### Pages

| Route | Page | Purpose |
|-------|------|---------|
| `/control` | `AdminOverview.tsx` | Platform KPI dashboard — revenue, workspaces, users, phone numbers |
| `/control/workspaces` | `AdminWorkspaces.tsx` | All workspaces: health scores, bulk actions, plan management |
| `/control/workspaces/:id` | `AdminWorkspaceDetail.tsx` | Deep workspace view: members, usage, plan, impersonation |
| `/control/billing` | `AdminBilling.tsx` | Platform revenue overview, payment events, invoice management |
| `/control/phone-numbers` | `AdminPhoneNumbers.tsx` | Global phone number monitoring across all workspaces |
| `/control/audit-logs` | `AdminAuditLogs.tsx` | Platform-wide audit trail |
| `/control/team` | `AdminTeam.tsx` | Platform admin team management, user management |
| `/control/settings` | `AdminSettings.tsx` | Global safety flags, platform configuration |
| `/control/incidents` | `AdminIncidents.tsx` | Incident tracking with SOC-style timelines |
| `/control/guides` | `GuideManager.tsx` | Help center content management |

### Admin Components

| Component | Purpose |
|-----------|---------|
| `AdminSidebar.tsx` | Collapsible sidebar navigation |
| `AdminTopBar.tsx` | Top bar with search and profile |
| `AdminCommandPalette.tsx` | ⌘K command palette for quick navigation |
| `AdminMobileNav.tsx` | Bottom navigation for mobile |
| `AdminKPICard.tsx` | Reusable KPI display card |
| `AdminHealthChips.tsx` | Workspace health indicator chips |
| `AdminStatusBadge.tsx` | Status badge component |
| `AdminWorkspaceCard.tsx` | Workspace card in list view |
| `AdminAttentionPanel.tsx` | Workspaces needing attention |
| `AdminRiskPanel.tsx` | Risk & security alerts panel |
| `AdminAuditTimeline.tsx` | Audit event timeline |
| `AdminSavedViews.tsx` | Saved filter views |
| `ImpersonationBanner.tsx` | Banner shown during workspace impersonation |
| `IncidentAiSummary.tsx` | AI-generated incident summaries |
| `UserManagementActions.tsx` | Password reset, email update for users |
| `HealthBadge.tsx` | Health score badge |

### Admin Features Detail

#### 7.1 Overview Dashboard
- Total workspaces, active users, revenue KPIs
- 30-day revenue trend charts
- Workspaces needing attention
- Risk alerts panel

#### 7.2 Workspace Management
- Search, filter, sort workspaces
- Health scoring (based on activity, setup completion)
- Bulk operations (suspend, change plan)
- **Impersonation mode**: View platform as a specific workspace
- Plan assignment: Change workspace plan directly
- Owner management: Transfer ownership

#### 7.3 Billing Management (Platform Level)
- Revenue overview via `platform_revenue_summary()` and `platform_revenue_daily()` RPCs
- Payment event tracking (`platform_billing_events` table)
- Invoice generation & management (`platform_invoices` table)
- Edge function: `platform-revenue-overview`

#### 7.4 Incident Management
- Create/track incidents with severity levels
- SOC-style event timeline
- AI-generated incident summaries
- Status tracking: investigating → identified → monitoring → resolved

#### 7.5 Global Safety Flags
- **Read-Only Mode**: Prevents all write operations platform-wide
- **Emergency Stop**: Halts all automation and campaign processing
- Enforced via `SECURITY DEFINER` functions

#### 7.6 User Management
- Global user search across all workspaces
- Password reset (via Supabase Admin API)
- Email/phone updates
- Role: `super_admin` has full access; `support` has read-only/restricted

### Admin Database Functions

| Function | Purpose |
|----------|---------|
| `is_platform_admin()` | Check if user is a platform admin |
| `get_platform_role()` | Get admin role (super_admin/support) |
| `is_platform_user(roles[])` | Check if user has any of the specified roles |
| `is_super_admin()` | Shorthand for super_admin check |
| `is_support_or_admin()` | Check super_admin or support |
| `platform_revenue_summary()` | Aggregate revenue for N days |
| `platform_revenue_daily()` | Daily revenue breakdown |
| `compute_workspace_entitlements()` | Recompute plan limits for a workspace |

### Admin Edge Functions

| Function | Purpose |
|----------|---------|
| `admin-api` | Central admin API (plan changes, user actions, workspace management) |
| `billing-apply-plan` | Apply plan changes to workspace entitlements |
| `platform-revenue-overview` | Revenue dashboard data |
| `invoice-generate-pdf` | Generate PDF invoices |
| `invoice-download-url` | Signed URL for invoice download |

---

## 8. Edge Functions (Backend)

### Shared Utilities (`supabase/functions/_shared/`)

| File | Purpose |
|------|---------|
| `supabase.ts` | Supabase client initialization (anon + service role) |
| `guards.ts` | Auth verification, tenant role checks, platform admin guards |
| `http.ts` | `callFunction()` helper for internal function-to-function communication |

### WhatsApp Core

| Function | Purpose |
|----------|---------|
| `whatsapp-webhook` | Receives all WhatsApp webhook events (messages, status updates, template status) |
| `send-message` | Send WhatsApp messages (text, media, interactive) |
| `send-text-message` | Send plain text messages (for testing) |
| `send-template-message` | Send template messages with credit deduction |
| `get-media-url` | Resolve WhatsApp media URLs for display |
| `upload-whatsapp-media` | Upload media to WhatsApp servers |
| `whatsapp-profile` | Manage WhatsApp Business Profile (sync, update, photo upload) |

### Phone Number Connection

| Function | Purpose |
|----------|---------|
| `meta-embedded-signup` | Initiate Meta Embedded Signup flow |
| `phone-connect-start` | Start phone number connection |
| `phone-connect-complete` | Complete phone number connection |
| `store-waba-credentials` | Store WABA access tokens securely |
| `waba-connect-start` | WABA connection initiation |
| `waba-connect-callback` | WABA OAuth callback |
| `waba-webhook-subscribe` | Subscribe to webhook events for a WABA |
| `verify-waba-status` | Check WABA connection health |

### Templates

| Function | Purpose |
|----------|---------|
| `validate-template-ai` | AI-powered template policy check |
| `submit-template-to-meta` | Submit template to Meta for approval |
| `template-submit` | Alternative template submission |
| `template-poll` | Poll Meta for template status |
| `template-apply-fixes` | AI-suggested template fixes |
| `sync-templates` | Full template sync from Meta |

### Automation

| Function | Purpose |
|----------|---------|
| `automation-event` | Process automation trigger events |
| `automation-job-runner` | Execute scheduled automation jobs |

### Billing & Subscriptions

| Function | Purpose |
|----------|---------|
| `billing-apply-plan` | Apply plan to workspace entitlements |
| `billing-create-checkout` | Create payment checkout session |
| `subscription-update` | Handle subscription changes |
| `stripe-webhook` | Stripe payment webhook handler |
| `razorpay-billing-webhook` | Razorpay payment webhook handler |
| `razorpay-connect` | Razorpay connection setup |
| `platform-revenue-overview` | Admin revenue dashboard data |
| `invoice-generate-pdf` | Generate PDF invoices |
| `invoice-download-url` | Signed invoice download URL |

### AI Features

| Function | Purpose |
|----------|---------|
| `dashboard-ai-insights` | AI-generated dashboard insights |
| `inbox-ai-assist` | AI-suggested replies for inbox |

### Meta Ads

| Function | Purpose |
|----------|---------|
| `meta-ads-connect-start` | Initiate Meta Ad account OAuth |
| `meta-ads-connect-callback` | Handle OAuth callback |
| `meta-ads-fb-login` | Facebook Login flow |

### Other

| Function | Purpose |
|----------|---------|
| `create-team-member` | Create team member + send invite email |
| `send-team-email` | Send team notification emails |
| `delete-account` | Account deletion handler |
| `integration-webhook` | Generic integration webhook receiver |
| `og-meta` | Open Graph meta tag generation |

---

## 9. Custom Hooks (Frontend Logic)

| Hook | File | Purpose |
|------|------|---------|
| `useEntitlements` | `useEntitlements.ts` | Fetch workspace plan limits from `workspace_entitlements` + `platform_plans` |
| `usePlanGate` | `usePlanGate.ts` | Feature gating: checks if current plan allows a feature |
| `useBilling` | `useBilling.ts` | Plans, subscription, invoices, usage, team/phone/contacts counts |
| `useMessageCredits` | `useMessageCredits.ts` | Message credit balance, transactions, top-up |
| `useDashboardData` | `useDashboardData.ts` | Dashboard metrics aggregation |
| `useInbox` | `useInbox.ts` | Inbox conversation management |
| `useConversations` | `useConversations.ts` | Conversation CRUD and realtime |
| `useMessages` | `useMessages.ts` | Message loading and sending |
| `useContacts` | `useContacts.ts` | Contact CRUD with search/filter |
| `useContactTags` | `useContactTags.ts` | Contact-tag associations |
| `useContactAttributes` | `useContactAttributes.ts` | Custom contact attributes |
| `useContactInboxSummary` | `useContactInboxSummary.ts` | Contact inbox activity summary |
| `useContactsCrmSearch` | `useContactsCrmSearch.ts` | CRM-style contact search |
| `useTags` | `useTags.ts` | Tag CRUD |
| `usePhoneNumbers` | `usePhoneNumbers.ts` | Phone number management |
| `useTemplates` | `useTemplates.ts` | Template CRUD and sync |
| `useTemplateBuilder` | `useTemplateBuilder.ts` | Template builder state management |
| `useAutomationWorkflows` | `useAutomationWorkflows.ts` | Automation workflow CRUD |
| `useFlows` | `useFlows.ts` | Flow builder state |
| `useFormRules` | `useFormRules.ts` | Auto-form rules management |
| `useTeam` | `useTeam.ts` | Team member management, invitations |
| `useMetaAdAccounts` | `useMetaAdAccounts.ts` | Meta Ad account data |
| `useIntegrations` | `useIntegrations.ts` | Integration configurations |
| `useMediaUrl` | `useMediaUrl.ts` | WhatsApp media URL resolution |
| `useGuides` | `useGuides.ts` | Help center guide data |
| `useAdminApi` | `useAdminApi.ts` | Admin API calls |
| `useGeoLocation` | `useGeoLocation.ts` | User geolocation detection |
| `useSeoPages` | `useSeoPages.ts` | SEO page management |
| `use-mobile` | `use-mobile.tsx` | Mobile viewport detection |
| `use-toast` | `use-toast.ts` | Toast notification management |

---

## 10. Database Schema Overview

### Core Tables

| Table | Purpose |
|-------|---------|
| `tenants` | Workspaces |
| `tenant_members` | User↔Workspace with role |
| `profiles` | User profiles |
| `agents` | Agent configuration (skills, languages, capacity) |

### WhatsApp

| Table | Purpose |
|-------|---------|
| `waba_accounts` | WhatsApp Business Account records |
| `phone_numbers` | Connected phone numbers |
| `conversations` | Chat conversations |
| `messages` | Individual messages |
| `templates` | Message templates |

### Growth

| Table | Purpose |
|-------|---------|
| `contacts` | Contact records |
| `contact_tags` | Contact-tag links |
| `contact_attributes` | Custom contact fields |
| `contact_inbox_summary` | Inbox activity per contact |
| `tags` | Tag definitions |
| `campaigns` | Broadcast campaigns |
| `campaign_jobs` | Individual send jobs |
| `campaign_logs` | Delivery logs |
| `campaign_analytics` | Hourly analytics snapshots |
| `campaign_audiences` | Audience definitions |
| `campaign_templates` | Reusable campaign templates |

### Automation

| Table | Purpose |
|-------|---------|
| `automation_workflows` | Workflow definitions |
| `automation_nodes` | Workflow nodes |
| `automation_edges` | Node connections |
| `automation_runs` | Execution records |
| `automation_steps` | Step-by-step execution logs |
| `automation_scheduled_jobs` | Queued jobs |
| `automation_rules` | Legacy rule-based automations |
| `automation_cooldowns` | Per-contact cooldown tracking |
| `automation_rate_limits` | Rate limit counters |
| `automation_loop_guards` | Infinite loop prevention |
| `automation_deadletters` | Failed job storage |

### Billing & Platform

| Table | Purpose |
|-------|---------|
| `platform_plans` | Plan definitions with limits/features |
| `workspace_entitlements` | Per-workspace plan + limits |
| `subscriptions` | Active subscriptions |
| `usage_counters` | Monthly usage metrics |
| `message_credits` | Pre-paid credit balances |
| `credit_transactions` | Credit transaction history |
| `platform_invoices` | Invoice records |
| `platform_billing_events` | Payment event log |
| `workspace_addons` | Active add-on subscriptions |
| `platform_admins` | Super admin users |
| `platform_risk_events` | Rate limit & risk tracking |

### Team & Security

| Table | Purpose |
|-------|---------|
| `roles` | Role definitions |
| `permissions` | Permission keys |
| `role_permissions` | Role↔Permission mapping |
| `user_roles` | User↔Role assignment |
| `audit_logs` | Activity audit trail |
| `routing_rules` | Conversation routing config |
| `round_robin_state` | Round-robin cursor tracking |

---

## 11. RBAC & Feature Gating

### Role Hierarchy
| Role | Access Level |
|------|-------------|
| **Owner** | Full access + workspace deletion |
| **Admin** | Full access except ownership transfer |
| **Manager** | Team, campaigns, templates, contacts |
| **Agent** | Inbox, contacts, tags, help only |
| **Analyst** | Read-only dashboard and analytics |

### Plan-Based Feature Gating

| Feature | Free | Basic | Pro | Business |
|---------|------|-------|-----|----------|
| Team Members | 1 | 5 | 10 | 25 |
| Automations | ✗ | ✓ | ✓ | ✓ |
| Flows | ✗ | ✓ | ✓ | ✓ |
| AutoForms | ✗ | ✓ | ✓ | ✓ |
| AI Basic | ✗ | ✓ | ✓ | ✓ |
| AI Full | ✗ | ✗ | ✓ | ✓ |
| Integrations | ✗ | ✗ | ✓ | ✓ |
| Ads Manager | ✗ | ✗ | ✓ | ✓ |
| Audit Logs | ✗ | ✗ | ✗ | ✓ |
| Custom Roles | ✗ | ✗ | ✗ | ✓ |

**Implementation:**
- `usePlanGate()` hook checks current plan against feature requirements
- `<ProGate />` component renders blur overlay with upgrade CTA
- `<ProBadge />` inline badge for locked features
- `canUseFeature()` / `getLimit()` utility functions

---

## 12. Billing & Credits System

### Message Credits
- Pre-paid credit system for template messages
- **`message_credits`** table: workspace balance tracking
- **`credit_transactions`** table: debit/credit history
- **`deduct_message_credit()`** RPC: atomic deduction (returns false if insufficient)
- **`add_message_credits()`** RPC: add credits to workspace
- `send-template-message` edge function checks credits before sending (402 if 0)

### Plan Management
- Plans defined in `platform_plans` table
- Entitlements computed via `compute_workspace_entitlements()` RPC
- Limits enforced in UI via `useEntitlements()` → `usePlanGate()`
- Admin can change plans via Control Center → `billing-apply-plan` edge function

### Current Status
- **Manual top-up**: Admin adds credits directly (no payment gateway)
- **No Stripe/Razorpay**: Payment gateway integration pending API keys
- Invoices, Payment Methods, and Add Card sections are removed until gateway is connected

---

## 13. Complete Route Map

### Authentication (Public)
```
/login                          → Login
/signup                         → Multi-step signup
/forgot-password                → Password reset request
/reset-password                 → Password reset form
/auth/callback                  → OAuth callback
/invite/accept                  → Team invite acceptance
/onboarding/org                 → Organization setup
/onboarding/password            → Password setup
```

### App (Authenticated)
```
/select-workspace               → Workspace selector
/create-workspace               → Redirects to select-workspace
/dashboard                      → Main dashboard
/inbox                          → Conversation inbox
/inbox/:id                      → Specific conversation
/contacts                       → Contact list
/contacts/segments              → Contact segments
/contacts/imports               → CSV imports
/contacts/duplicates            → Duplicate detection
/contacts/data-requests         → GDPR requests
/tags                           → Tag management
/user-attributes                → Custom attributes
/phone-numbers                  → Phone number list
/phone-numbers/connect          → Connect new number
/phone-numbers/:id              → Number details
/templates                      → Template management
/campaigns                      → Campaign list
/campaigns/create               → Create campaign
/campaigns/library              → Campaign templates
/campaigns/:id                  → Campaign details
/automation                     → Automation workflows
/automation/form-rules          → Auto-form rules
/flows                          → Flow builder hub
/flows/builder                  → New flow
/flows/builder/:id              → Edit flow
/team                           → Team overview
/team/members                   → Team members
/team/roles                     → Role management
/team/groups                    → Agent groups
/team/routing                   → Routing rules
/team/sla                       → SLA policies
/team/audit                     → Team audit logs
/meta-ads                       → Ads overview
/meta-ads/setup                 → Ad account setup
/meta-ads/manager               → Ad manager
/meta-ads/analytics             → Ad analytics
/meta-ads/attribution           → Attribution tracking
/meta-ads/automations           → Ad automations
/meta-ads/settings              → Ad settings
/billing                        → Billing & subscription
/add-ons                        → Workspace add-ons
/app/integrations               → Integrations hub
/app/integrations/:key          → Integration detail
/settings                       → Workspace settings
```

### Control Center (Super Admin)
```
/control                        → Admin overview
/control/workspaces             → All workspaces
/control/workspaces/:id         → Workspace detail
/control/billing                → Platform billing
/control/phone-numbers          → Global phone numbers
/control/audit-logs             → Platform audit logs
/control/team                   → Admin team
/control/settings               → Platform settings
/control/incidents              → Incident management
/control/guides                 → Help guide manager
```

### Marketing (Public)
```
/                               → Homepage
/features                       → Features overview
/features/inbox                 → Inbox feature
/features/contacts              → Contacts feature
/features/templates             → Templates feature
/features/campaigns             → Campaigns feature
/features/automation            → Automation feature
/features/integrations          → Integrations feature
/features/analytics             → Analytics feature
/features/phone-numbers         → Phone numbers feature
/features/team-roles            → Team & roles feature
/features/audit-logs            → Audit logs feature
/pricing                        → Pricing page
/products                       → Products
/about                          → About us
/contact                        → Contact form
/blog                           → Blog
/blog/:slug                     → Blog post
/careers                        → Careers
/integrations                   → Public integrations
/security                       → Security info
/case-studies                   → Case studies
/case-studies/:slug             → Case study detail
/template-library               → Public templates
/documentation                  → API docs
/partners                       → Partner program
/install                        → App installation
/whatsapp-forms                 → WhatsApp Forms
/whatsapp-business-api          → WhatsApp API info
/click-to-whatsapp              → CTWA info
/why-whatsapp-marketing         → Marketing guide
/free-whatsapp-api-lifetime     → SEO landing page
/developer/seo                  → SEO dashboard
```

### Legal (Public)
```
/privacy-policy                 → Privacy Policy
/terms                          → Terms of Service
/data-deletion                  → Data Deletion
/acceptable-use                 → Acceptable Use
/cookie-policy                  → Cookie Policy
/refund-policy                  → Refund Policy
/compliance                     → Compliance
/app-access-instructions        → App Access
```

---

*End of Documentation*  
*Generated: February 14, 2026*  
*Platform: AIReatro Communications by Smeksh*
