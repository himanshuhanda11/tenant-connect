ALTER TABLE public.agents 
ADD COLUMN IF NOT EXISTS personal_greeting text,
ADD COLUMN IF NOT EXISTS away_message text,
ADD COLUMN IF NOT EXISTS away_enabled boolean NOT NULL DEFAULT false;