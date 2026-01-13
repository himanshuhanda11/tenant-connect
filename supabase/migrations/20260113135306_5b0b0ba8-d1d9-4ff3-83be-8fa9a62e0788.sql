-- Create tag_type enum
DO $$ BEGIN
  CREATE TYPE tag_type AS ENUM ('first_message', 'lifecycle', 'intent', 'priority', 'automation', 'compliance', 'custom');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create tag_apply_to enum
DO $$ BEGIN
  CREATE TYPE tag_apply_to AS ENUM ('contacts', 'conversations', 'both');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create tag_status enum  
DO $$ BEGIN
  CREATE TYPE tag_status AS ENUM ('active', 'archived');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Extend tags table with new columns
ALTER TABLE public.tags
ADD COLUMN IF NOT EXISTS tag_type tag_type DEFAULT 'custom',
ADD COLUMN IF NOT EXISTS emoji TEXT,
ADD COLUMN IF NOT EXISTS tag_group TEXT,
ADD COLUMN IF NOT EXISTS status tag_status DEFAULT 'active',
ADD COLUMN IF NOT EXISTS apply_to tag_apply_to DEFAULT 'both',
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create tag_rules table for auto-tagging
CREATE TABLE IF NOT EXISTS public.tag_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  trigger_type TEXT NOT NULL, -- 'keyword', 'source', 'button_click', 'intervention', 'no_reply', 'scheduled'
  trigger_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  action_type TEXT NOT NULL DEFAULT 'apply_tag', -- 'apply_tag', 'remove_tag', 'assign_agent', 'set_priority'
  action_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  priority INTEGER DEFAULT 0,
  execution_count INTEGER DEFAULT 0,
  last_executed_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tag_history table for tracking who applied tags
CREATE TABLE IF NOT EXISTS public.tag_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- 'applied', 'removed'
  applied_by UUID REFERENCES public.profiles(id),
  applied_by_rule UUID REFERENCES public.tag_rules(id),
  source TEXT DEFAULT 'manual', -- 'manual', 'rule', 'api', 'import'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tag_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tag_history ENABLE ROW LEVEL SECURITY;

-- RLS policies for tag_rules
CREATE POLICY "tag_rules_select_member" ON public.tag_rules
FOR SELECT USING (is_tenant_member(tenant_id));

CREATE POLICY "tag_rules_insert_admin" ON public.tag_rules
FOR INSERT WITH CHECK (is_tenant_admin(tenant_id));

CREATE POLICY "tag_rules_update_admin" ON public.tag_rules
FOR UPDATE USING (is_tenant_admin(tenant_id)) WITH CHECK (is_tenant_admin(tenant_id));

CREATE POLICY "tag_rules_delete_admin" ON public.tag_rules
FOR DELETE USING (is_tenant_admin(tenant_id));

-- RLS policies for tag_history
CREATE POLICY "tag_history_select_member" ON public.tag_history
FOR SELECT USING (is_tenant_member(tenant_id));

CREATE POLICY "tag_history_insert_member" ON public.tag_history
FOR INSERT WITH CHECK (is_tenant_member(tenant_id));

CREATE POLICY "tag_history_delete_admin" ON public.tag_history
FOR DELETE USING (is_tenant_admin(tenant_id));

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tags_tenant_type ON public.tags(tenant_id, tag_type);
CREATE INDEX IF NOT EXISTS idx_tags_tenant_status ON public.tags(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_tag_rules_tenant ON public.tag_rules(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tag_rules_tag ON public.tag_rules(tag_id);
CREATE INDEX IF NOT EXISTS idx_tag_history_tag ON public.tag_history(tag_id);
CREATE INDEX IF NOT EXISTS idx_tag_history_contact ON public.tag_history(contact_id);
CREATE INDEX IF NOT EXISTS idx_tag_history_conversation ON public.tag_history(conversation_id);

-- Create trigger for updated_at on tag_rules
CREATE TRIGGER update_tag_rules_updated_at
BEFORE UPDATE ON public.tag_rules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for updated_at on tags
DROP TRIGGER IF EXISTS update_tags_updated_at ON public.tags;
CREATE TRIGGER update_tags_updated_at
BEFORE UPDATE ON public.tags
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();