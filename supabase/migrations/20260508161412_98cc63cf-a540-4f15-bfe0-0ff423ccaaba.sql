-- RPC used by admin-backup edge function to auto-discover all public tables.
create or replace function public.backup_list_public_tables()
returns table(table_name text)
language sql
stable
security definer
set search_path = public, pg_catalog
as $$
  select t.tablename::text
  from pg_catalog.pg_tables t
  where t.schemaname = 'public'
  order by t.tablename;
$$;

revoke all on function public.backup_list_public_tables() from public, anon, authenticated;
grant execute on function public.backup_list_public_tables() to service_role;