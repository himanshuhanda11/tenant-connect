-- Add messaging_limit column to phone_numbers table
-- Use text type to avoid enum complexity
ALTER TABLE public.phone_numbers 
ADD COLUMN IF NOT EXISTS messaging_limit text DEFAULT 'TIER_1K';

-- Add webhook_health column for tracking webhook status
ALTER TABLE public.phone_numbers 
ADD COLUMN IF NOT EXISTS webhook_health text DEFAULT 'unknown';

-- Add last_webhook_at for tracking webhook activity  
ALTER TABLE public.phone_numbers 
ADD COLUMN IF NOT EXISTS last_webhook_at timestamp with time zone;

-- Add is_default column
ALTER TABLE public.phone_numbers 
ADD COLUMN IF NOT EXISTS is_default boolean DEFAULT false;

-- Update existing records to have proper default values
UPDATE public.phone_numbers 
SET messaging_limit = 'TIER_1K' 
WHERE messaging_limit IS NULL;

UPDATE public.phone_numbers 
SET webhook_health = 'unknown' 
WHERE webhook_health IS NULL;