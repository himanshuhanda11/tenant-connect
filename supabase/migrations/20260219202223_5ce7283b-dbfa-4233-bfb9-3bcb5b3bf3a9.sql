-- Add edit support columns to form_sessions
ALTER TABLE public.form_sessions 
  ADD COLUMN IF NOT EXISTS awaiting_edit boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS editing_field_index integer DEFAULT NULL;