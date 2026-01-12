
-- =========================================
-- 1) Helper functions (membership + admin + owner)
-- Overloaded versions that use auth.uid() internally
-- =========================================

CREATE OR REPLACE FUNCTION public.is_tenant_member(_tenant_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.tenant_members tm
    WHERE tm.tenant_id = _tenant_id
      AND tm.user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.is_tenant_admin(_tenant_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.tenant_members tm
    WHERE tm.tenant_id = _tenant_id
      AND tm.user_id = auth.uid()
      AND tm.role IN ('owner', 'admin')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_tenant_owner(_tenant_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.tenant_members tm
    WHERE tm.tenant_id = _tenant_id
      AND tm.user_id = auth.uid()
      AND tm.role = 'owner'
  );
$$;

-- =========================================
-- 3) TENANTS
-- =========================================
DROP POLICY IF EXISTS "Users can view tenants they belong to" ON public.tenants;
DROP POLICY IF EXISTS "Only owner/admin can update tenant" ON public.tenants;
DROP POLICY IF EXISTS "Only owner can delete tenant" ON public.tenants;
DROP POLICY IF EXISTS "Authenticated users can create tenants" ON public.tenants;

CREATE POLICY "tenants_select_if_member"
ON public.tenants FOR SELECT
USING (public.is_tenant_member(id));

CREATE POLICY "tenants_update_admin"
ON public.tenants FOR UPDATE
USING (public.is_tenant_admin(id))
WITH CHECK (public.is_tenant_admin(id));

CREATE POLICY "tenants_insert_disabled"
ON public.tenants FOR INSERT
WITH CHECK (false);

CREATE POLICY "tenants_delete_disabled"
ON public.tenants FOR DELETE
USING (false);

-- =========================================
-- 4) TENANT MEMBERS
-- =========================================
DROP POLICY IF EXISTS "Members can view other members in same tenant" ON public.tenant_members;
DROP POLICY IF EXISTS "Owner/Admin can update members" ON public.tenant_members;
DROP POLICY IF EXISTS "Owner/Admin can remove members" ON public.tenant_members;
DROP POLICY IF EXISTS "Owner/Admin can add members" ON public.tenant_members;

CREATE POLICY "tenant_members_select_if_member"
ON public.tenant_members FOR SELECT
USING (public.is_tenant_member(tenant_id));

CREATE POLICY "tenant_members_insert_admin"
ON public.tenant_members FOR INSERT
WITH CHECK (public.is_tenant_admin(tenant_id));

CREATE POLICY "tenant_members_update_admin"
ON public.tenant_members FOR UPDATE
USING (public.is_tenant_admin(tenant_id))
WITH CHECK (public.is_tenant_admin(tenant_id));

CREATE POLICY "tenant_members_delete_owner"
ON public.tenant_members FOR DELETE
USING (public.is_tenant_owner(tenant_id));

-- =========================================
-- 5) WABA ACCOUNTS
-- =========================================
DROP POLICY IF EXISTS "Users can view WABA accounts in their tenant" ON public.waba_accounts;
DROP POLICY IF EXISTS "Owner/Admin can manage WABA accounts" ON public.waba_accounts;

CREATE POLICY "waba_select_member"
ON public.waba_accounts FOR SELECT
USING (public.is_tenant_member(tenant_id));

CREATE POLICY "waba_insert_admin"
ON public.waba_accounts FOR INSERT
WITH CHECK (public.is_tenant_admin(tenant_id));

CREATE POLICY "waba_update_admin"
ON public.waba_accounts FOR UPDATE
USING (public.is_tenant_admin(tenant_id))
WITH CHECK (public.is_tenant_admin(tenant_id));

CREATE POLICY "waba_delete_owner"
ON public.waba_accounts FOR DELETE
USING (public.is_tenant_owner(tenant_id));

-- =========================================
-- 6) PHONE NUMBERS
-- =========================================
DROP POLICY IF EXISTS "Users can view phone numbers in their tenant" ON public.phone_numbers;
DROP POLICY IF EXISTS "Owner/Admin can manage phone numbers" ON public.phone_numbers;

CREATE POLICY "phone_select_member"
ON public.phone_numbers FOR SELECT
USING (public.is_tenant_member(tenant_id));

CREATE POLICY "phone_insert_admin"
ON public.phone_numbers FOR INSERT
WITH CHECK (public.is_tenant_admin(tenant_id));

CREATE POLICY "phone_update_admin"
ON public.phone_numbers FOR UPDATE
USING (public.is_tenant_admin(tenant_id))
WITH CHECK (public.is_tenant_admin(tenant_id));

CREATE POLICY "phone_delete_owner"
ON public.phone_numbers FOR DELETE
USING (public.is_tenant_owner(tenant_id));

-- =========================================
-- 7) CONTACTS
-- =========================================
DROP POLICY IF EXISTS "Users can view contacts in their tenant" ON public.contacts;
DROP POLICY IF EXISTS "Users can manage contacts in their tenant" ON public.contacts;

CREATE POLICY "contacts_select_member"
ON public.contacts FOR SELECT
USING (public.is_tenant_member(tenant_id));

CREATE POLICY "contacts_insert_member"
ON public.contacts FOR INSERT
WITH CHECK (public.is_tenant_member(tenant_id));

CREATE POLICY "contacts_update_member"
ON public.contacts FOR UPDATE
USING (public.is_tenant_member(tenant_id))
WITH CHECK (public.is_tenant_member(tenant_id));

CREATE POLICY "contacts_delete_admin"
ON public.contacts FOR DELETE
USING (public.is_tenant_admin(tenant_id));

-- =========================================
-- 8) CONVERSATIONS
-- =========================================
DROP POLICY IF EXISTS "Users can view conversations in their tenant" ON public.conversations;
DROP POLICY IF EXISTS "Users can manage conversations in their tenant" ON public.conversations;

CREATE POLICY "conversations_select_member"
ON public.conversations FOR SELECT
USING (public.is_tenant_member(tenant_id));

CREATE POLICY "conversations_insert_member"
ON public.conversations FOR INSERT
WITH CHECK (public.is_tenant_member(tenant_id));

CREATE POLICY "conversations_update_member"
ON public.conversations FOR UPDATE
USING (public.is_tenant_member(tenant_id))
WITH CHECK (public.is_tenant_member(tenant_id));

CREATE POLICY "conversations_delete_admin"
ON public.conversations FOR DELETE
USING (public.is_tenant_admin(tenant_id));

-- =========================================
-- 9) MESSAGES
-- =========================================
DROP POLICY IF EXISTS "Users can view messages in their tenant" ON public.messages;
DROP POLICY IF EXISTS "Users can manage messages in their tenant" ON public.messages;

CREATE POLICY "messages_select_member"
ON public.messages FOR SELECT
USING (public.is_tenant_member(tenant_id));

-- Server-only writes (service role)
CREATE POLICY "messages_insert_disabled"
ON public.messages FOR INSERT
WITH CHECK (false);

CREATE POLICY "messages_update_disabled"
ON public.messages FOR UPDATE
USING (false)
WITH CHECK (false);

CREATE POLICY "messages_delete_admin"
ON public.messages FOR DELETE
USING (public.is_tenant_admin(tenant_id));

-- =========================================
-- 10) WEBHOOK EVENTS
-- =========================================
DROP POLICY IF EXISTS "Service role can manage webhook events" ON public.webhook_events;

CREATE POLICY "webhook_select_admin"
ON public.webhook_events FOR SELECT
USING (public.is_tenant_admin(tenant_id));

CREATE POLICY "webhook_insert_disabled"
ON public.webhook_events FOR INSERT
WITH CHECK (false);

CREATE POLICY "webhook_update_disabled"
ON public.webhook_events FOR UPDATE
USING (false)
WITH CHECK (false);

CREATE POLICY "webhook_delete_disabled"
ON public.webhook_events FOR DELETE
USING (false);

-- =========================================
-- 11) TEMPLATES
-- =========================================
DROP POLICY IF EXISTS "Users can view templates in their tenant" ON public.templates;
DROP POLICY IF EXISTS "Owner/Admin can manage templates" ON public.templates;

CREATE POLICY "templates_select_member"
ON public.templates FOR SELECT
USING (public.is_tenant_member(tenant_id));

CREATE POLICY "templates_insert_admin"
ON public.templates FOR INSERT
WITH CHECK (public.is_tenant_admin(tenant_id));

CREATE POLICY "templates_update_admin"
ON public.templates FOR UPDATE
USING (public.is_tenant_admin(tenant_id))
WITH CHECK (public.is_tenant_admin(tenant_id));

CREATE POLICY "templates_delete_owner"
ON public.templates FOR DELETE
USING (public.is_tenant_owner(tenant_id));

-- =========================================
-- 12) CAMPAIGNS
-- =========================================
DROP POLICY IF EXISTS "Users can view campaigns in their tenant" ON public.campaigns;
DROP POLICY IF EXISTS "Owner/Admin can manage campaigns" ON public.campaigns;

CREATE POLICY "campaigns_select_member"
ON public.campaigns FOR SELECT
USING (public.is_tenant_member(tenant_id));

CREATE POLICY "campaigns_insert_admin"
ON public.campaigns FOR INSERT
WITH CHECK (public.is_tenant_admin(tenant_id));

CREATE POLICY "campaigns_update_admin"
ON public.campaigns FOR UPDATE
USING (public.is_tenant_admin(tenant_id))
WITH CHECK (public.is_tenant_admin(tenant_id));

CREATE POLICY "campaigns_delete_owner"
ON public.campaigns FOR DELETE
USING (public.is_tenant_owner(tenant_id));

-- =========================================
-- 12b) CAMPAIGN LOGS
-- =========================================
DROP POLICY IF EXISTS "Users can view campaign_logs via campaign" ON public.campaign_logs;
DROP POLICY IF EXISTS "System can manage campaign_logs" ON public.campaign_logs;

CREATE POLICY "campaign_logs_select_member"
ON public.campaign_logs FOR SELECT
USING (
  public.is_tenant_member(
    (SELECT c.tenant_id FROM public.campaigns c WHERE c.id = campaign_logs.campaign_id LIMIT 1)
  )
);

CREATE POLICY "campaign_logs_insert_admin"
ON public.campaign_logs FOR INSERT
WITH CHECK (
  public.is_tenant_admin(
    (SELECT c.tenant_id FROM public.campaigns c WHERE c.id = campaign_logs.campaign_id LIMIT 1)
  )
);

CREATE POLICY "campaign_logs_update_disabled"
ON public.campaign_logs FOR UPDATE
USING (false)
WITH CHECK (false);

CREATE POLICY "campaign_logs_delete_disabled"
ON public.campaign_logs FOR DELETE
USING (false);

-- =========================================
-- 13) TAGS
-- =========================================
DROP POLICY IF EXISTS "Users can view tags in their tenant" ON public.tags;
DROP POLICY IF EXISTS "Users can manage tags in their tenant" ON public.tags;

CREATE POLICY "tags_select_member"
ON public.tags FOR SELECT
USING (public.is_tenant_member(tenant_id));

CREATE POLICY "tags_insert_member"
ON public.tags FOR INSERT
WITH CHECK (public.is_tenant_member(tenant_id));

CREATE POLICY "tags_update_member"
ON public.tags FOR UPDATE
USING (public.is_tenant_member(tenant_id))
WITH CHECK (public.is_tenant_member(tenant_id));

CREATE POLICY "tags_delete_admin"
ON public.tags FOR DELETE
USING (public.is_tenant_admin(tenant_id));

-- =========================================
-- 13b) CONTACT TAGS (no tenant_id, use subquery through contacts)
-- =========================================
DROP POLICY IF EXISTS "Users can view contact_tags via contact" ON public.contact_tags;
DROP POLICY IF EXISTS "Users can manage contact_tags via contact" ON public.contact_tags;

CREATE POLICY "contact_tags_select_member"
ON public.contact_tags FOR SELECT
USING (
  public.is_tenant_member(
    (SELECT c.tenant_id FROM public.contacts c WHERE c.id = contact_tags.contact_id LIMIT 1)
  )
);

CREATE POLICY "contact_tags_insert_member"
ON public.contact_tags FOR INSERT
WITH CHECK (
  public.is_tenant_member(
    (SELECT c.tenant_id FROM public.contacts c WHERE c.id = contact_tags.contact_id LIMIT 1)
  )
);

CREATE POLICY "contact_tags_delete_member"
ON public.contact_tags FOR DELETE
USING (
  public.is_tenant_member(
    (SELECT c.tenant_id FROM public.contacts c WHERE c.id = contact_tags.contact_id LIMIT 1)
  )
);

CREATE POLICY "contact_tags_update_disabled"
ON public.contact_tags FOR UPDATE
USING (false)
WITH CHECK (false);

-- =========================================
-- 14) PLANS (public readable)
-- =========================================
DROP POLICY IF EXISTS "Anyone can view active plans" ON public.plans;

CREATE POLICY "plans_select_all"
ON public.plans FOR SELECT
USING (true);

CREATE POLICY "plans_insert_disabled"
ON public.plans FOR INSERT
WITH CHECK (false);

CREATE POLICY "plans_update_disabled"
ON public.plans FOR UPDATE
USING (false)
WITH CHECK (false);

CREATE POLICY "plans_delete_disabled"
ON public.plans FOR DELETE
USING (false);

-- =========================================
-- 14b) SUBSCRIPTIONS
-- =========================================
DROP POLICY IF EXISTS "Users can view their tenant subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Owner can manage subscription" ON public.subscriptions;

CREATE POLICY "subscriptions_select_member"
ON public.subscriptions FOR SELECT
USING (public.is_tenant_member(tenant_id));

CREATE POLICY "subscriptions_insert_disabled"
ON public.subscriptions FOR INSERT
WITH CHECK (false);

CREATE POLICY "subscriptions_update_disabled"
ON public.subscriptions FOR UPDATE
USING (false)
WITH CHECK (false);

CREATE POLICY "subscriptions_delete_disabled"
ON public.subscriptions FOR DELETE
USING (false);

-- =========================================
-- 14c) USAGE COUNTERS
-- =========================================
DROP POLICY IF EXISTS "Users can view usage in their tenant" ON public.usage_counters;

CREATE POLICY "usage_select_member"
ON public.usage_counters FOR SELECT
USING (public.is_tenant_member(tenant_id));

CREATE POLICY "usage_insert_disabled"
ON public.usage_counters FOR INSERT
WITH CHECK (false);

CREATE POLICY "usage_update_disabled"
ON public.usage_counters FOR UPDATE
USING (false)
WITH CHECK (false);

CREATE POLICY "usage_delete_disabled"
ON public.usage_counters FOR DELETE
USING (false);

-- =========================================
-- 15) AUTOMATION RULES
-- =========================================
DROP POLICY IF EXISTS "Users can view automation_rules in their tenant" ON public.automation_rules;
DROP POLICY IF EXISTS "Owner/Admin can manage automation_rules" ON public.automation_rules;

CREATE POLICY "automation_rules_select_member"
ON public.automation_rules FOR SELECT
USING (public.is_tenant_member(tenant_id));

CREATE POLICY "automation_rules_insert_admin"
ON public.automation_rules FOR INSERT
WITH CHECK (public.is_tenant_admin(tenant_id));

CREATE POLICY "automation_rules_update_admin"
ON public.automation_rules FOR UPDATE
USING (public.is_tenant_admin(tenant_id))
WITH CHECK (public.is_tenant_admin(tenant_id));

CREATE POLICY "automation_rules_delete_owner"
ON public.automation_rules FOR DELETE
USING (public.is_tenant_owner(tenant_id));

-- =========================================
-- 16) CONVERSATION NOTES
-- =========================================
DROP POLICY IF EXISTS "Users can view notes in their tenant" ON public.conversation_notes;
DROP POLICY IF EXISTS "Users can manage notes in their tenant" ON public.conversation_notes;

CREATE POLICY "conversation_notes_select_member"
ON public.conversation_notes FOR SELECT
USING (public.is_tenant_member(tenant_id));

CREATE POLICY "conversation_notes_insert_member"
ON public.conversation_notes FOR INSERT
WITH CHECK (public.is_tenant_member(tenant_id));

CREATE POLICY "conversation_notes_update_member"
ON public.conversation_notes FOR UPDATE
USING (public.is_tenant_member(tenant_id))
WITH CHECK (public.is_tenant_member(tenant_id));

CREATE POLICY "conversation_notes_delete_member"
ON public.conversation_notes FOR DELETE
USING (public.is_tenant_member(tenant_id));

-- =========================================
-- 17) TENANT FEATURES
-- =========================================
DROP POLICY IF EXISTS "Users can view features in their tenant" ON public.tenant_features;

CREATE POLICY "tenant_features_select_member"
ON public.tenant_features FOR SELECT
USING (public.is_tenant_member(tenant_id));

CREATE POLICY "tenant_features_insert_disabled"
ON public.tenant_features FOR INSERT
WITH CHECK (false);

CREATE POLICY "tenant_features_update_disabled"
ON public.tenant_features FOR UPDATE
USING (false)
WITH CHECK (false);

CREATE POLICY "tenant_features_delete_disabled"
ON public.tenant_features FOR DELETE
USING (false);
