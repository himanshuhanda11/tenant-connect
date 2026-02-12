
-- Fix: Change phone_number_id FK from CASCADE to SET NULL
-- so deleting old phone records doesn't wipe conversations and messages

ALTER TABLE public.conversations
  DROP CONSTRAINT conversations_phone_number_id_fkey;

ALTER TABLE public.conversations
  ADD CONSTRAINT conversations_phone_number_id_fkey
  FOREIGN KEY (phone_number_id) REFERENCES phone_numbers(id)
  ON DELETE SET NULL;

-- Also make phone_number_id nullable if it isn't already
ALTER TABLE public.conversations
  ALTER COLUMN phone_number_id DROP NOT NULL;
