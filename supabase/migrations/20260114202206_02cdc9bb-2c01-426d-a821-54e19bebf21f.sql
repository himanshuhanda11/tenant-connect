-- Add onboarding_step to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS onboarding_step text DEFAULT 'pending' 
CHECK (onboarding_step IN ('pending', 'google_done', 'org_done', 'completed'));

-- Add country and industry to profiles for reference
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS country text,
ADD COLUMN IF NOT EXISTS industry text,
ADD COLUMN IF NOT EXISTS team_size text,
ADD COLUMN IF NOT EXISTS primary_goal text;

-- Update existing profiles to mark them as completed (they already went through old flow)
UPDATE public.profiles SET onboarding_step = 'completed' WHERE onboarding_step = 'pending' OR onboarding_step IS NULL;