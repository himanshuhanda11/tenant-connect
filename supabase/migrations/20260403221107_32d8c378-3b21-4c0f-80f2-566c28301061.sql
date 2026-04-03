
-- Add timezone column to tenants table
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS timezone text NOT NULL DEFAULT 'UTC';

-- Create a function to auto-detect timezone from phone E.164 country code
CREATE OR REPLACE FUNCTION public.detect_timezone_from_phone(phone text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  cc text;
BEGIN
  IF phone IS NULL OR phone = '' THEN RETURN 'UTC'; END IF;
  
  -- Extract country calling code from E.164
  -- Try longest prefixes first
  cc := substring(phone from '^\+(\d{1,4})');
  
  -- Map country calling codes to IANA timezones
  CASE
    WHEN phone LIKE '+91%' THEN RETURN 'Asia/Kolkata';       -- India
    WHEN phone LIKE '+971%' THEN RETURN 'Asia/Dubai';        -- UAE
    WHEN phone LIKE '+966%' THEN RETURN 'Asia/Riyadh';       -- Saudi Arabia
    WHEN phone LIKE '+968%' THEN RETURN 'Asia/Muscat';       -- Oman
    WHEN phone LIKE '+974%' THEN RETURN 'Asia/Qatar';        -- Qatar
    WHEN phone LIKE '+973%' THEN RETURN 'Asia/Bahrain';      -- Bahrain
    WHEN phone LIKE '+965%' THEN RETURN 'Asia/Kuwait';       -- Kuwait
    WHEN phone LIKE '+962%' THEN RETURN 'Asia/Amman';        -- Jordan
    WHEN phone LIKE '+961%' THEN RETURN 'Asia/Beirut';       -- Lebanon
    WHEN phone LIKE '+20%' THEN RETURN 'Africa/Cairo';       -- Egypt
    WHEN phone LIKE '+44%' THEN RETURN 'Europe/London';      -- UK
    WHEN phone LIKE '+1%' THEN RETURN 'America/New_York';    -- US/Canada
    WHEN phone LIKE '+49%' THEN RETURN 'Europe/Berlin';      -- Germany
    WHEN phone LIKE '+33%' THEN RETURN 'Europe/Paris';       -- France
    WHEN phone LIKE '+81%' THEN RETURN 'Asia/Tokyo';         -- Japan
    WHEN phone LIKE '+86%' THEN RETURN 'Asia/Shanghai';      -- China
    WHEN phone LIKE '+65%' THEN RETURN 'Asia/Singapore';     -- Singapore
    WHEN phone LIKE '+60%' THEN RETURN 'Asia/Kuala_Lumpur';  -- Malaysia
    WHEN phone LIKE '+63%' THEN RETURN 'Asia/Manila';        -- Philippines
    WHEN phone LIKE '+62%' THEN RETURN 'Asia/Jakarta';       -- Indonesia
    WHEN phone LIKE '+66%' THEN RETURN 'Asia/Bangkok';       -- Thailand
    WHEN phone LIKE '+61%' THEN RETURN 'Australia/Sydney';   -- Australia
    WHEN phone LIKE '+64%' THEN RETURN 'Pacific/Auckland';   -- New Zealand
    WHEN phone LIKE '+27%' THEN RETURN 'Africa/Johannesburg';-- South Africa
    WHEN phone LIKE '+234%' THEN RETURN 'Africa/Lagos';      -- Nigeria
    WHEN phone LIKE '+254%' THEN RETURN 'Africa/Nairobi';    -- Kenya
    WHEN phone LIKE '+55%' THEN RETURN 'America/Sao_Paulo';  -- Brazil
    WHEN phone LIKE '+52%' THEN RETURN 'America/Mexico_City';-- Mexico
    WHEN phone LIKE '+92%' THEN RETURN 'Asia/Karachi';       -- Pakistan
    WHEN phone LIKE '+94%' THEN RETURN 'Asia/Colombo';       -- Sri Lanka
    WHEN phone LIKE '+880%' THEN RETURN 'Asia/Dhaka';        -- Bangladesh
    WHEN phone LIKE '+977%' THEN RETURN 'Asia/Kathmandu';    -- Nepal
    WHEN phone LIKE '+7%' THEN RETURN 'Europe/Moscow';       -- Russia
    WHEN phone LIKE '+34%' THEN RETURN 'Europe/Madrid';      -- Spain
    WHEN phone LIKE '+39%' THEN RETURN 'Europe/Rome';        -- Italy
    WHEN phone LIKE '+90%' THEN RETURN 'Europe/Istanbul';    -- Turkey
    ELSE RETURN 'UTC';
  END CASE;
END;
$$;
