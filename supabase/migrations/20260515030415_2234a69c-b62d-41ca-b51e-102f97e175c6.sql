-- Default personal greetings to OFF; workspace auto-reply / away message handles inbox chats by default
ALTER TABLE public.agents ALTER COLUMN personal_greetings_enabled SET DEFAULT false;
UPDATE public.agents SET personal_greetings_enabled = false WHERE personal_greetings_enabled = true;