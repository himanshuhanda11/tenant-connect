import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { Workflow, WorkflowStatus, WorkflowRun, StarterAutomation, WorkflowGuardrails, TriggerType, ActionType } from '@/types/automation';
import { STARTER_AUTOMATIONS } from '@/data/starterAutomations';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type DbTriggerType = Database['public']['Enums']['automation_trigger'];
type DbActionType = Database['public']['Enums']['automation_action'];

const DEFAULT_GUARDRAILS: WorkflowGuardrails = {
  max_messages_per_hour: 10,
  max_messages_per_day: 50,
  cooldown_minutes: 15,
  require_opt_in: false,
  stop_on_reply: false,
  safe_mode: false,
};

// Map extended trigger types to database trigger types
const mapTriggerToDb = (type: TriggerType): DbTriggerType => {
  const mapping: Partial<Record<TriggerType, DbTriggerType>> = {
    keyword_received: 'keyword_received',
    tag_added: 'tag_added',
    new_contact: 'new_contact',
    scheduled_time: 'scheduled',
    inactivity: 'inactivity',
  };
  return mapping[type] || 'keyword_received';
};

// Map extended action types to database action types
const mapActionToDb = (type: ActionType): DbActionType => {
  const mapping: Partial<Record<ActionType, DbActionType>> = {
    send_template: 'send_template',
    add_tag: 'add_tag',
    remove_tag: 'remove_tag',
    assign_agent: 'assign_agent',
    call_webhook: 'webhook',
  };
  return mapping[type] || 'send_template';
};

export function useAutomationWorkflows() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentTenant } = useTenant();
  const { toast } = useToast();

  const fetchWorkflows = useCallback(async () => {
    if (!currentTenant?.id) return;

    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('automation_rules')
        .select('*')
        .eq('tenant_id', currentTenant.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      // Transform database records to Workflow type
      const transformedWorkflows: Workflow[] = (data || []).map((rule) => ({
        id: rule.id,
        tenant_id: rule.tenant_id,
        name: rule.name,
        description: rule.description || undefined,
        status: rule.is_active ? 'active' : 'paused' as WorkflowStatus,
        trigger: { type: rule.trigger_type as TriggerType, config: rule.trigger_config as Record<string, any> },
        conditions: [],
        actions: [{ id: '1', type: rule.action_type as ActionType, config: rule.action_config as Record<string, any>, order: 1 }],
        guardrails: DEFAULT_GUARDRAILS,
        stats: {
          runs_today: 0,
          runs_7_days: rule.execution_count || 0,
          success_rate: 95,
          error_count: 0,
          messages_sent: 0,
        },
        created_at: rule.created_at,
        updated_at: rule.updated_at,
        last_run_at: rule.last_executed_at || undefined,
      }));

      setWorkflows(transformedWorkflows);
      setError(null);
    } catch (err) {
      console.error('Error fetching workflows:', err);
      setError('Failed to load workflows');
    } finally {
      setLoading(false);
    }
  }, [currentTenant?.id]);

  useEffect(() => {
    fetchWorkflows();
  }, [fetchWorkflows]);

  const createWorkflow = async (workflow: Partial<Workflow>): Promise<Workflow | null> => {
    if (!currentTenant?.id) return null;

    try {
      const triggerType = mapTriggerToDb(workflow.trigger?.type || 'keyword_received');
      const actionType = mapActionToDb(workflow.actions?.[0]?.type || 'send_template');

      const { data, error: insertError } = await supabase
        .from('automation_rules')
        .insert({
          tenant_id: currentTenant.id,
          name: workflow.name || 'New Workflow',
          description: workflow.description || null,
          trigger_type: triggerType,
          trigger_config: workflow.trigger?.config || {},
          action_type: actionType,
          action_config: workflow.actions?.[0]?.config || {},
          is_active: workflow.status === 'active',
        })
        .select()
        .single();

      if (insertError) throw insertError;

      toast({
        title: 'Workflow created',
        description: 'Your workflow has been created successfully.',
      });

      await fetchWorkflows();
      
      // Return transformed workflow
      return {
        id: data.id,
        tenant_id: data.tenant_id,
        name: data.name,
        description: data.description || undefined,
        status: data.is_active ? 'active' : 'paused',
        trigger: { type: data.trigger_type as TriggerType, config: data.trigger_config as Record<string, any> },
        conditions: [],
        actions: [{ id: '1', type: data.action_type as ActionType, config: data.action_config as Record<string, any>, order: 1 }],
        guardrails: DEFAULT_GUARDRAILS,
        stats: { runs_today: 0, runs_7_days: 0, success_rate: 0, error_count: 0, messages_sent: 0 },
        created_at: data.created_at,
        updated_at: data.updated_at,
      };
    } catch (err) {
      console.error('Error creating workflow:', err);
      toast({
        title: 'Error',
        description: 'Failed to create workflow',
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateWorkflow = async (id: string, updates: Partial<Workflow>): Promise<boolean> => {
    try {
      const updateData: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };

      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.trigger?.type) updateData.trigger_type = mapTriggerToDb(updates.trigger.type);
      if (updates.trigger?.config) updateData.trigger_config = updates.trigger.config;
      if (updates.actions?.[0]?.type) updateData.action_type = mapActionToDb(updates.actions[0].type);
      if (updates.actions?.[0]?.config) updateData.action_config = updates.actions[0].config;
      if (updates.status !== undefined) updateData.is_active = updates.status === 'active';

      const { error: updateError } = await supabase
        .from('automation_rules')
        .update(updateData)
        .eq('id', id);

      if (updateError) throw updateError;

      toast({
        title: 'Workflow updated',
        description: 'Your changes have been saved.',
      });

      await fetchWorkflows();
      return true;
    } catch (err) {
      console.error('Error updating workflow:', err);
      toast({
        title: 'Error',
        description: 'Failed to update workflow',
        variant: 'destructive',
      });
      return false;
    }
  };

  const deleteWorkflow = async (id: string): Promise<boolean> => {
    try {
      const { error: deleteError } = await supabase
        .from('automation_rules')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      toast({
        title: 'Workflow deleted',
        description: 'The workflow has been removed.',
      });

      await fetchWorkflows();
      return true;
    } catch (err) {
      console.error('Error deleting workflow:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete workflow',
        variant: 'destructive',
      });
      return false;
    }
  };

  const toggleWorkflowStatus = async (id: string): Promise<boolean> => {
    const workflow = workflows.find(w => w.id === id);
    if (!workflow) return false;

    const newStatus = workflow.status === 'active' ? 'paused' : 'active';
    return updateWorkflow(id, { status: newStatus });
  };

  const duplicateWorkflow = async (id: string): Promise<Workflow | null> => {
    const workflow = workflows.find(w => w.id === id);
    if (!workflow) return null;

    return createWorkflow({
      ...workflow,
      name: `${workflow.name} (Copy)`,
      status: 'draft',
    });
  };

  const installStarterAutomation = async (starter: StarterAutomation): Promise<Workflow | null> => {
    return createWorkflow({
      name: starter.name,
      description: starter.description,
      status: 'draft',
      trigger: starter.trigger,
      conditions: starter.conditions,
      actions: starter.actions,
      guardrails: { ...DEFAULT_GUARDRAILS, ...starter.guardrails },
    });
  };

  const pauseAllWorkflows = async (): Promise<boolean> => {
    if (!currentTenant?.id) return false;

    try {
      const { error: updateError } = await supabase
        .from('automation_rules')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('tenant_id', currentTenant.id);

      if (updateError) throw updateError;

      toast({
        title: 'All workflows paused',
        description: 'All automation workflows have been paused.',
      });

      await fetchWorkflows();
      return true;
    } catch (err) {
      console.error('Error pausing workflows:', err);
      toast({
        title: 'Error',
        description: 'Failed to pause workflows',
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    workflows,
    loading,
    error,
    starterAutomations: STARTER_AUTOMATIONS,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    toggleWorkflowStatus,
    duplicateWorkflow,
    installStarterAutomation,
    pauseAllWorkflows,
    refetch: fetchWorkflows,
  };
}

export function useWorkflowRuns(workflowId?: string) {
  const [runs, setRuns] = useState<WorkflowRun[]>([]);
  const [loading, setLoading] = useState(false);

  // Mock data for now - would connect to actual logs table
  useEffect(() => {
    if (!workflowId) return;
    
    setLoading(true);
    // Simulate loading runs
    setTimeout(() => {
      setRuns([]);
      setLoading(false);
    }, 500);
  }, [workflowId]);

  return { runs, loading };
}
