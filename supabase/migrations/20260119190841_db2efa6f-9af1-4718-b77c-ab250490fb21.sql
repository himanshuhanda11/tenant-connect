-- Enable pgcrypto for gen_random_uuid()
create extension if not exists pgcrypto;

-- 1) Enums
do $$ begin
  create type public.wa_template_category as enum ('UTILITY','MARKETING','AUTHENTICATION');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.wa_template_status as enum ('DRAFT','SUBMITTED','UNDER_REVIEW','APPROVED','REJECTED','PAUSED');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.wa_validation_risk as enum ('LOW','MEDIUM','HIGH');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.wa_event_kind as enum ('STATUS_CHANGE','SUBMITTED','APPROVED','REJECTED','ERROR','NOTE');
exception when duplicate_object then null; end $$;

-- 2) Templates (logical template)
create table if not exists public.wa_templates (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  language text not null default 'en',
  category public.wa_template_category not null,
  status public.wa_template_status not null default 'DRAFT',

  is_archived boolean not null default false,
  is_backup boolean not null default false,

  meta_waba_id text,
  meta_template_name text,
  meta_template_id text,
  meta_last_status_at timestamptz,

  created_by uuid references public.profiles(id),
  updated_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_wa_templates_workspace on public.wa_templates(workspace_id);
create index if not exists idx_wa_templates_status on public.wa_templates(status);

-- 3) Template versions (immutable content snapshots)
create table if not exists public.wa_template_versions (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.wa_templates(id) on delete cascade,
  version int not null,

  body text not null,
  header jsonb not null default '{}'::jsonb,
  footer text,
  buttons jsonb not null default '[]'::jsonb,

  variables jsonb not null default '[]'::jsonb,
  example_values jsonb not null default '{}'::jsonb,

  content_hash text not null,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),

  unique(template_id, version)
);

create index if not exists idx_wa_template_versions_template on public.wa_template_versions(template_id);
create index if not exists idx_wa_template_versions_hash on public.wa_template_versions(content_hash);

-- 4) Submissions to Meta
create table if not exists public.wa_template_submissions (
  id uuid primary key default gen_random_uuid(),
  template_version_id uuid not null references public.wa_template_versions(id) on delete cascade,
  workspace_id uuid not null references public.tenants(id) on delete cascade,
  meta_waba_id text not null,
  meta_phone_number_id text,
  meta_request_id text,
  meta_response jsonb,
  meta_status public.wa_template_status not null default 'SUBMITTED',
  meta_rejection_reason text,
  submitted_at timestamptz not null default now(),
  last_polled_at timestamptz,
  next_poll_at timestamptz,
  poll_attempts int not null default 0
);

create index if not exists idx_wa_template_submissions_workspace on public.wa_template_submissions(workspace_id);
create index if not exists idx_wa_template_submissions_nextpoll on public.wa_template_submissions(next_poll_at);

-- 5) Status timeline / events
create table if not exists public.wa_template_events (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.wa_templates(id) on delete cascade,
  kind public.wa_event_kind not null,
  status public.wa_template_status,
  message text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_wa_template_events_template on public.wa_template_events(template_id);

-- 6) AI Validation logs
create table if not exists public.wa_template_validation_logs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.tenants(id) on delete cascade,
  template_version_id uuid references public.wa_template_versions(id) on delete set null,

  selected_category public.wa_template_category,
  predicted_category public.wa_template_category,
  risk public.wa_validation_risk not null,
  score int not null check (score >= 0 and score <= 100),

  issues jsonb not null default '[]'::jsonb,
  suggestions jsonb not null default '{}'::jsonb,
  model_info jsonb not null default '{}'::jsonb,

  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create index if not exists idx_wa_validation_logs_workspace on public.wa_template_validation_logs(workspace_id);
create index if not exists idx_wa_validation_logs_version on public.wa_template_validation_logs(template_version_id);

-- 7) Fallback policy per workspace
create table if not exists public.wa_template_fallback_policies (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null unique references public.tenants(id) on delete cascade,

  use_session_message boolean not null default true,
  backup_template_id uuid references public.wa_templates(id) on delete set null,
  fallback_message text,

  updated_by uuid references public.profiles(id),
  updated_at timestamptz not null default now()
);

create index if not exists idx_wa_fallback_workspace on public.wa_template_fallback_policies(workspace_id);

-- 8) updated_at trigger
create or replace function public.set_wa_updated_at()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists trg_wa_templates_updated_at on public.wa_templates;
create trigger trg_wa_templates_updated_at
before update on public.wa_templates
for each row execute function public.set_wa_updated_at();

drop trigger if exists trg_wa_fallback_updated_at on public.wa_template_fallback_policies;
create trigger trg_wa_fallback_updated_at
before update on public.wa_template_fallback_policies
for each row execute function public.set_wa_updated_at();

-- RLS Policies
alter table public.wa_templates enable row level security;
alter table public.wa_template_versions enable row level security;
alter table public.wa_template_submissions enable row level security;
alter table public.wa_template_events enable row level security;
alter table public.wa_template_validation_logs enable row level security;
alter table public.wa_template_fallback_policies enable row level security;

-- wa_templates policies
create policy "Users can view templates in their workspace" on public.wa_templates
  for select using (is_tenant_member(workspace_id));

create policy "Users can create templates in their workspace" on public.wa_templates
  for insert with check (is_tenant_member(workspace_id));

create policy "Users can update templates in their workspace" on public.wa_templates
  for update using (is_tenant_member(workspace_id));

create policy "Admins can delete templates" on public.wa_templates
  for delete using (is_tenant_admin(workspace_id));

-- wa_template_versions policies
create policy "Users can view versions" on public.wa_template_versions
  for select using (exists (
    select 1 from public.wa_templates t where t.id = template_id and is_tenant_member(t.workspace_id)
  ));

create policy "Users can create versions" on public.wa_template_versions
  for insert with check (exists (
    select 1 from public.wa_templates t where t.id = template_id and is_tenant_member(t.workspace_id)
  ));

-- wa_template_submissions policies
create policy "Users can view submissions" on public.wa_template_submissions
  for select using (is_tenant_member(workspace_id));

create policy "Users can create submissions" on public.wa_template_submissions
  for insert with check (is_tenant_member(workspace_id));

create policy "Users can update submissions" on public.wa_template_submissions
  for update using (is_tenant_member(workspace_id));

-- wa_template_events policies
create policy "Users can view events" on public.wa_template_events
  for select using (exists (
    select 1 from public.wa_templates t where t.id = template_id and is_tenant_member(t.workspace_id)
  ));

create policy "Users can create events" on public.wa_template_events
  for insert with check (exists (
    select 1 from public.wa_templates t where t.id = template_id and is_tenant_member(t.workspace_id)
  ));

-- wa_template_validation_logs policies
create policy "Users can view validation logs" on public.wa_template_validation_logs
  for select using (is_tenant_member(workspace_id));

create policy "Users can create validation logs" on public.wa_template_validation_logs
  for insert with check (is_tenant_member(workspace_id));

-- wa_template_fallback_policies policies
create policy "Users can view fallback policies" on public.wa_template_fallback_policies
  for select using (is_tenant_member(workspace_id));

create policy "Admins can manage fallback policies" on public.wa_template_fallback_policies
  for all using (is_tenant_admin(workspace_id));

-- Enable realtime for template events
alter publication supabase_realtime add table public.wa_template_events;