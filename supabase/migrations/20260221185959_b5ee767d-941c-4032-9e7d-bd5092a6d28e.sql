
-- Create quick_replies table for agent-specific quick reply persistence
CREATE TABLE public.quick_replies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  text TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX idx_quick_replies_tenant_user ON public.quick_replies(tenant_id, user_id);

-- Enable RLS
ALTER TABLE public.quick_replies ENABLE ROW LEVEL SECURITY;

-- Users can only see their own quick replies within their tenant
CREATE POLICY "Users can view own quick replies"
  ON public.quick_replies FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quick replies"
  ON public.quick_replies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quick replies"
  ON public.quick_replies FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own quick replies"
  ON public.quick_replies FOR DELETE
  USING (auth.uid() = user_id);

-- Auto-update updated_at
CREATE TRIGGER update_quick_replies_updated_at
  BEFORE UPDATE ON public.quick_replies
  FOR EACH ROW
  EXECUTE FUNCTION public.smeksh_touch_updated_at();
