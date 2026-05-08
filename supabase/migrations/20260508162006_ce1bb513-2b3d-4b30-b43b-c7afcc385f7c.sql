alter table public.platform_backup_runs
  add column if not exists drive_file_id text,
  add column if not exists drive_folder_id text,
  add column if not exists drive_web_link text,
  add column if not exists drive_status text,
  add column if not exists drive_error text;

-- Tighten retention to last 7 successful backups (delete both DB row + storage object).
create or replace function public.cleanup_old_backups()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  r record;
begin
  for r in
    select id, storage_path
    from public.platform_backup_runs
    where status = 'success'
    order by created_at desc
    offset 7
  loop
    if r.storage_path is not null then
      perform 1 from storage.objects
        where bucket_id = 'database-backups' and name = r.storage_path;
      if found then
        delete from storage.objects
          where bucket_id = 'database-backups' and name = r.storage_path;
      end if;
    end if;
    delete from public.platform_backup_runs where id = r.id;
  end loop;
end;
$$;