
-- Create platform_incidents table for SOC-style incident tracking
CREATE TABLE IF NOT EXISTS public.platform_incidents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'investigating', 'resolved')),
  affected_systems TEXT[] DEFAULT '{}',
  root_cause TEXT,
  actions_taken TEXT,
  declared_by UUID REFERENCES auth.users(id),
  resolved_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.platform_incidents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Platform incidents readable by platform users"
  ON public.platform_incidents FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Platform incidents insertable by platform users"
  ON public.platform_incidents FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Platform incidents updatable by platform users"
  ON public.platform_incidents FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- Create platform_incident_events for timeline entries
CREATE TABLE IF NOT EXISTS public.platform_incident_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  incident_id UUID NOT NULL REFERENCES public.platform_incidents(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  description TEXT NOT NULL,
  actor_user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.platform_incident_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Incident events readable by platform users"
  ON public.platform_incident_events FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Incident events insertable by platform users"
  ON public.platform_incident_events FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
