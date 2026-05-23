
-- ============ ENUMS ============
DO $$ BEGIN
  CREATE TYPE public.deal_priority AS ENUM ('low','normal','high','urgent');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.deal_status AS ENUM ('open','won','lost');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.deal_activity_type AS ENUM (
    'stage_change','note','call','email','whatsapp','assignment','task','created','status_change'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.deal_task_status AS ENUM ('pending','done','cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============ HELPER: is_workspace_member ============
-- Reuse existing pattern. If a similar function already exists we won't overwrite.
CREATE OR REPLACE FUNCTION public.crm_is_workspace_member(_tenant_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.tenant_members tm
    WHERE tm.tenant_id = _tenant_id AND tm.user_id = _user_id
  );
$$;

-- ============ PIPELINES ============
CREATE TABLE IF NOT EXISTS public.pipelines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  is_default boolean NOT NULL DEFAULT false,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_pipelines_tenant ON public.pipelines(tenant_id);

ALTER TABLE public.pipelines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pipelines: members read" ON public.pipelines FOR SELECT
  USING (public.crm_is_workspace_member(tenant_id, auth.uid()));
CREATE POLICY "pipelines: members write" ON public.pipelines FOR INSERT
  WITH CHECK (public.crm_is_workspace_member(tenant_id, auth.uid()));
CREATE POLICY "pipelines: members update" ON public.pipelines FOR UPDATE
  USING (public.crm_is_workspace_member(tenant_id, auth.uid()));
CREATE POLICY "pipelines: members delete" ON public.pipelines FOR DELETE
  USING (public.crm_is_workspace_member(tenant_id, auth.uid()));

-- ============ PIPELINE STAGES ============
CREATE TABLE IF NOT EXISTS public.pipeline_stages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  pipeline_id uuid NOT NULL REFERENCES public.pipelines(id) ON DELETE CASCADE,
  name text NOT NULL,
  color text NOT NULL DEFAULT '#64748b',
  stage_order int NOT NULL DEFAULT 0,
  is_won boolean NOT NULL DEFAULT false,
  is_lost boolean NOT NULL DEFAULT false,
  probability int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_pipeline_stages_pipeline ON public.pipeline_stages(pipeline_id, stage_order);
CREATE INDEX IF NOT EXISTS idx_pipeline_stages_tenant ON public.pipeline_stages(tenant_id);

ALTER TABLE public.pipeline_stages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "stages: members read" ON public.pipeline_stages FOR SELECT
  USING (public.crm_is_workspace_member(tenant_id, auth.uid()));
CREATE POLICY "stages: members write" ON public.pipeline_stages FOR INSERT
  WITH CHECK (public.crm_is_workspace_member(tenant_id, auth.uid()));
CREATE POLICY "stages: members update" ON public.pipeline_stages FOR UPDATE
  USING (public.crm_is_workspace_member(tenant_id, auth.uid()));
CREATE POLICY "stages: members delete" ON public.pipeline_stages FOR DELETE
  USING (public.crm_is_workspace_member(tenant_id, auth.uid()));

-- ============ DEALS ============
CREATE TABLE IF NOT EXISTS public.deals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  pipeline_id uuid NOT NULL REFERENCES public.pipelines(id) ON DELETE CASCADE,
  stage_id uuid NOT NULL REFERENCES public.pipeline_stages(id) ON DELETE RESTRICT,
  contact_id uuid,
  title text NOT NULL,
  company_name text,
  value numeric(14,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  priority public.deal_priority NOT NULL DEFAULT 'normal',
  status public.deal_status NOT NULL DEFAULT 'open',
  lead_source text,
  tags text[] NOT NULL DEFAULT '{}',
  owner_id uuid,
  expected_close_date date,
  last_activity_at timestamptz NOT NULL DEFAULT now(),
  position int NOT NULL DEFAULT 0,
  notes_count int NOT NULL DEFAULT 0,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_deals_tenant ON public.deals(tenant_id);
CREATE INDEX IF NOT EXISTS idx_deals_pipeline_stage ON public.deals(pipeline_id, stage_id, position);
CREATE INDEX IF NOT EXISTS idx_deals_owner ON public.deals(owner_id);
CREATE INDEX IF NOT EXISTS idx_deals_contact ON public.deals(contact_id);

ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "deals: members read" ON public.deals FOR SELECT
  USING (public.crm_is_workspace_member(tenant_id, auth.uid()));
CREATE POLICY "deals: members insert" ON public.deals FOR INSERT
  WITH CHECK (public.crm_is_workspace_member(tenant_id, auth.uid()));
CREATE POLICY "deals: members update" ON public.deals FOR UPDATE
  USING (public.crm_is_workspace_member(tenant_id, auth.uid()));
CREATE POLICY "deals: members delete" ON public.deals FOR DELETE
  USING (public.crm_is_workspace_member(tenant_id, auth.uid()));

-- ============ DEAL ACTIVITIES ============
CREATE TABLE IF NOT EXISTS public.deal_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  deal_id uuid NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  actor_id uuid,
  activity_type public.deal_activity_type NOT NULL,
  content text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_deal_activities_deal ON public.deal_activities(deal_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_deal_activities_tenant ON public.deal_activities(tenant_id);

ALTER TABLE public.deal_activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "activities: members read" ON public.deal_activities FOR SELECT
  USING (public.crm_is_workspace_member(tenant_id, auth.uid()));
CREATE POLICY "activities: members insert" ON public.deal_activities FOR INSERT
  WITH CHECK (public.crm_is_workspace_member(tenant_id, auth.uid()));

-- ============ DEAL NOTES ============
CREATE TABLE IF NOT EXISTS public.deal_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  deal_id uuid NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  author_id uuid,
  content text NOT NULL,
  is_pinned boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_deal_notes_deal ON public.deal_notes(deal_id, created_at DESC);

ALTER TABLE public.deal_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notes: members read" ON public.deal_notes FOR SELECT
  USING (public.crm_is_workspace_member(tenant_id, auth.uid()));
CREATE POLICY "notes: members insert" ON public.deal_notes FOR INSERT
  WITH CHECK (public.crm_is_workspace_member(tenant_id, auth.uid()));
CREATE POLICY "notes: members update" ON public.deal_notes FOR UPDATE
  USING (public.crm_is_workspace_member(tenant_id, auth.uid()));
CREATE POLICY "notes: members delete" ON public.deal_notes FOR DELETE
  USING (public.crm_is_workspace_member(tenant_id, auth.uid()));

-- ============ DEAL TASKS ============
CREATE TABLE IF NOT EXISTS public.deal_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  deal_id uuid REFERENCES public.deals(id) ON DELETE CASCADE,
  contact_id uuid,
  title text NOT NULL,
  description text,
  assignee_id uuid,
  due_at timestamptz,
  status public.deal_task_status NOT NULL DEFAULT 'pending',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_deal_tasks_deal ON public.deal_tasks(deal_id);
CREATE INDEX IF NOT EXISTS idx_deal_tasks_tenant_due ON public.deal_tasks(tenant_id, due_at);

ALTER TABLE public.deal_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tasks: members read" ON public.deal_tasks FOR SELECT
  USING (public.crm_is_workspace_member(tenant_id, auth.uid()));
CREATE POLICY "tasks: members insert" ON public.deal_tasks FOR INSERT
  WITH CHECK (public.crm_is_workspace_member(tenant_id, auth.uid()));
CREATE POLICY "tasks: members update" ON public.deal_tasks FOR UPDATE
  USING (public.crm_is_workspace_member(tenant_id, auth.uid()));
CREATE POLICY "tasks: members delete" ON public.deal_tasks FOR DELETE
  USING (public.crm_is_workspace_member(tenant_id, auth.uid()));

-- ============ SAVED VIEWS ============
CREATE TABLE IF NOT EXISTS public.crm_saved_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  user_id uuid NOT NULL,
  name text NOT NULL,
  view_type text NOT NULL DEFAULT 'kanban',
  filters jsonb NOT NULL DEFAULT '{}'::jsonb,
  sort jsonb NOT NULL DEFAULT '{}'::jsonb,
  group_by text,
  is_default boolean NOT NULL DEFAULT false,
  is_shared boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_crm_saved_views_user ON public.crm_saved_views(tenant_id, user_id);

ALTER TABLE public.crm_saved_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "saved_views: read own or shared" ON public.crm_saved_views FOR SELECT
  USING (public.crm_is_workspace_member(tenant_id, auth.uid()) AND (user_id = auth.uid() OR is_shared = true));
CREATE POLICY "saved_views: insert own" ON public.crm_saved_views FOR INSERT
  WITH CHECK (public.crm_is_workspace_member(tenant_id, auth.uid()) AND user_id = auth.uid());
CREATE POLICY "saved_views: update own" ON public.crm_saved_views FOR UPDATE
  USING (user_id = auth.uid());
CREATE POLICY "saved_views: delete own" ON public.crm_saved_views FOR DELETE
  USING (user_id = auth.uid());

-- ============ TIMESTAMP TRIGGERS ============
CREATE OR REPLACE FUNCTION public.crm_touch_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

DROP TRIGGER IF EXISTS trg_pipelines_touch ON public.pipelines;
CREATE TRIGGER trg_pipelines_touch BEFORE UPDATE ON public.pipelines
  FOR EACH ROW EXECUTE FUNCTION public.crm_touch_updated_at();

DROP TRIGGER IF EXISTS trg_pipeline_stages_touch ON public.pipeline_stages;
CREATE TRIGGER trg_pipeline_stages_touch BEFORE UPDATE ON public.pipeline_stages
  FOR EACH ROW EXECUTE FUNCTION public.crm_touch_updated_at();

DROP TRIGGER IF EXISTS trg_deals_touch ON public.deals;
CREATE TRIGGER trg_deals_touch BEFORE UPDATE ON public.deals
  FOR EACH ROW EXECUTE FUNCTION public.crm_touch_updated_at();

DROP TRIGGER IF EXISTS trg_deal_notes_touch ON public.deal_notes;
CREATE TRIGGER trg_deal_notes_touch BEFORE UPDATE ON public.deal_notes
  FOR EACH ROW EXECUTE FUNCTION public.crm_touch_updated_at();

DROP TRIGGER IF EXISTS trg_deal_tasks_touch ON public.deal_tasks;
CREATE TRIGGER trg_deal_tasks_touch BEFORE UPDATE ON public.deal_tasks
  FOR EACH ROW EXECUTE FUNCTION public.crm_touch_updated_at();

DROP TRIGGER IF EXISTS trg_saved_views_touch ON public.crm_saved_views;
CREATE TRIGGER trg_saved_views_touch BEFORE UPDATE ON public.crm_saved_views
  FOR EACH ROW EXECUTE FUNCTION public.crm_touch_updated_at();

-- ============ STAGE CHANGE ACTIVITY LOG ============
CREATE OR REPLACE FUNCTION public.crm_log_deal_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.deal_activities (tenant_id, deal_id, actor_id, activity_type, content, metadata)
    VALUES (NEW.tenant_id, NEW.id, NEW.created_by, 'created', 'Deal created', jsonb_build_object('stage_id', NEW.stage_id));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.stage_id IS DISTINCT FROM OLD.stage_id THEN
      INSERT INTO public.deal_activities (tenant_id, deal_id, actor_id, activity_type, content, metadata)
      VALUES (NEW.tenant_id, NEW.id, auth.uid(), 'stage_change', 'Stage updated',
              jsonb_build_object('from', OLD.stage_id, 'to', NEW.stage_id));
      NEW.last_activity_at = now();
    END IF;
    IF NEW.status IS DISTINCT FROM OLD.status THEN
      INSERT INTO public.deal_activities (tenant_id, deal_id, actor_id, activity_type, content, metadata)
      VALUES (NEW.tenant_id, NEW.id, auth.uid(), 'status_change', 'Status updated',
              jsonb_build_object('from', OLD.status, 'to', NEW.status));
    END IF;
    IF NEW.owner_id IS DISTINCT FROM OLD.owner_id THEN
      INSERT INTO public.deal_activities (tenant_id, deal_id, actor_id, activity_type, content, metadata)
      VALUES (NEW.tenant_id, NEW.id, auth.uid(), 'assignment', 'Owner changed',
              jsonb_build_object('from', OLD.owner_id, 'to', NEW.owner_id));
    END IF;
    RETURN NEW;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_deals_activity ON public.deals;
CREATE TRIGGER trg_deals_activity
  AFTER INSERT OR UPDATE ON public.deals
  FOR EACH ROW EXECUTE FUNCTION public.crm_log_deal_change();

-- ============ NOTES COUNT TRIGGER ============
CREATE OR REPLACE FUNCTION public.crm_update_notes_count()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.deals SET notes_count = notes_count + 1 WHERE id = NEW.deal_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.deals SET notes_count = GREATEST(0, notes_count - 1) WHERE id = OLD.deal_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END $$;

DROP TRIGGER IF EXISTS trg_deal_notes_count ON public.deal_notes;
CREATE TRIGGER trg_deal_notes_count
  AFTER INSERT OR DELETE ON public.deal_notes
  FOR EACH ROW EXECUTE FUNCTION public.crm_update_notes_count();

-- ============ SEED DEFAULT PIPELINE RPC ============
CREATE OR REPLACE FUNCTION public.crm_ensure_default_pipeline(_tenant_id uuid)
RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_pipeline_id uuid;
BEGIN
  IF NOT public.crm_is_workspace_member(_tenant_id, auth.uid()) THEN
    RAISE EXCEPTION 'access denied';
  END IF;

  SELECT id INTO v_pipeline_id FROM public.pipelines
    WHERE tenant_id = _tenant_id AND is_default = true LIMIT 1;

  IF v_pipeline_id IS NOT NULL THEN RETURN v_pipeline_id; END IF;

  INSERT INTO public.pipelines (tenant_id, name, description, is_default, created_by)
    VALUES (_tenant_id, 'Sales Pipeline', 'Default sales pipeline', true, auth.uid())
    RETURNING id INTO v_pipeline_id;

  INSERT INTO public.pipeline_stages (tenant_id, pipeline_id, name, color, stage_order, is_won, is_lost, probability) VALUES
    (_tenant_id, v_pipeline_id, 'Qualified',           '#3b82f6', 1, false, false, 10),
    (_tenant_id, v_pipeline_id, 'Contact Made',        '#06b6d4', 2, false, false, 25),
    (_tenant_id, v_pipeline_id, 'Demo Scheduled',      '#8b5cf6', 3, false, false, 40),
    (_tenant_id, v_pipeline_id, 'Proposal Made',       '#f59e0b', 4, false, false, 60),
    (_tenant_id, v_pipeline_id, 'Negotiation Started', '#f97316', 5, false, false, 80),
    (_tenant_id, v_pipeline_id, 'Won',                 '#10b981', 6, true,  false, 100),
    (_tenant_id, v_pipeline_id, 'Lost',                '#ef4444', 7, false, true,  0);

  RETURN v_pipeline_id;
END $$;
