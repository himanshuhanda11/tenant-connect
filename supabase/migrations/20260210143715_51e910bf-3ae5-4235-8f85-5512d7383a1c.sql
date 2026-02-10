-- Add storage path columns to messages table so we can generate fresh signed URLs on demand
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS media_bucket text;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS media_path text;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS media_filename text;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS media_size_bytes bigint;