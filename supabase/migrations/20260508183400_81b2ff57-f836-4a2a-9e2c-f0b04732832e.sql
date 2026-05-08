ALTER TABLE public.platform_backup_runs
  ADD COLUMN IF NOT EXISTS progress_percent integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS current_step text,
  ADD COLUMN IF NOT EXISTS tables_done integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tables_total integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS started_at timestamp with time zone;