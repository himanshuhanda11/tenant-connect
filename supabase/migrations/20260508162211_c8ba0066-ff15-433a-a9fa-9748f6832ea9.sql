create table if not exists public.platform_internal_settings (
  key text primary key,
  value text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.platform_internal_settings enable row level security;

-- No anon/authenticated policies = nobody but the service role can read this.
drop policy if exists "service_role manages internal settings" on public.platform_internal_settings;
create policy "service_role manages internal settings"
  on public.platform_internal_settings for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- Generate (or reuse) a cron token.
insert into public.platform_internal_settings(key, value)
values ('backup_cron_token', encode(gen_random_bytes(32), 'hex'))
on conflict (key) do nothing;