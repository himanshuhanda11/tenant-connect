
-- ============================================================
-- DATABASE BACKUP SYSTEM (super-admin only)
-- ============================================================

-- 1. Private bucket for backup ZIPs
insert into storage.buckets (id, name, public)
values ('database-backups', 'database-backups', false)
on conflict (id) do nothing;

-- Storage policies: only super admin can read/list; service role manages all
drop policy if exists "Super admin can read backups" on storage.objects;
create policy "Super admin can read backups"
  on storage.objects for select
  using (bucket_id = 'database-backups' and public.is_super_admin());

drop policy if exists "Service role manage backups" on storage.objects;
create policy "Service role manage backups"
  on storage.objects for all
  using (bucket_id = 'database-backups' and auth.role() = 'service_role')
  with check (bucket_id = 'database-backups' and auth.role() = 'service_role');

-- 2. Audit/log table for every backup run
create table if not exists public.platform_backup_runs (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'pending',           -- pending | success | failed
  trigger text not null default 'manual',           -- manual | scheduled
  triggered_by uuid,                                -- auth.uid() if manual
  storage_path text,                                -- path inside database-backups
  file_size_bytes bigint,
  table_count int,
  tables_included jsonb,
  error_message text,
  duration_ms int,
  downloaded_by jsonb default '[]'::jsonb,          -- [{user_id, at}]
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists idx_backup_runs_created on public.platform_backup_runs(created_at desc);
create index if not exists idx_backup_runs_status on public.platform_backup_runs(status);

alter table public.platform_backup_runs enable row level security;

drop policy if exists "Super admin read backup runs" on public.platform_backup_runs;
create policy "Super admin read backup runs"
  on public.platform_backup_runs for select
  using (public.is_super_admin());

drop policy if exists "Service role manage backup runs" on public.platform_backup_runs;
create policy "Service role manage backup runs"
  on public.platform_backup_runs for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- 3. Enable required extensions for daily cron
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- 4. Daily backup retention helper (keeps last 30 successful runs)
create or replace function public.cleanup_old_backups()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_old record;
begin
  for v_old in
    select id, storage_path
    from public.platform_backup_runs
    where status = 'success'
      and storage_path is not null
    order by created_at desc
    offset 30
  loop
    -- Delete file from storage
    delete from storage.objects
    where bucket_id = 'database-backups'
      and name = v_old.storage_path;
    -- Delete log row
    delete from public.platform_backup_runs where id = v_old.id;
  end loop;

  -- Also drop failed/pending rows older than 7 days
  delete from public.platform_backup_runs
  where status in ('failed','pending')
    and created_at < now() - interval '7 days';
end;
$$;
