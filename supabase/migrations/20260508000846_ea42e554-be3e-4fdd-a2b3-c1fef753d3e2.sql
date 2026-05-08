
CREATE TABLE IF NOT EXISTS public.admin_user_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  target_user_id uuid NOT NULL,
  author_user_id uuid NOT NULL REFERENCES auth.users(id),
  note text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_admin_user_notes_target ON public.admin_user_notes(target_user_id, created_at DESC);

ALTER TABLE public.admin_user_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Platform admins can view notes" ON public.admin_user_notes;
CREATE POLICY "Platform admins can view notes"
ON public.admin_user_notes FOR SELECT TO authenticated
USING (public.is_support_or_admin());

DROP POLICY IF EXISTS "Platform admins can insert notes" ON public.admin_user_notes;
CREATE POLICY "Platform admins can insert notes"
ON public.admin_user_notes FOR INSERT TO authenticated
WITH CHECK (public.is_support_or_admin() AND author_user_id = auth.uid());

DROP POLICY IF EXISTS "Super admins can delete notes" ON public.admin_user_notes;
CREATE POLICY "Super admins can delete notes"
ON public.admin_user_notes FOR DELETE TO authenticated
USING (public.is_super_admin());
