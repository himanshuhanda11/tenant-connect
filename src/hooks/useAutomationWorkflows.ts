import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { 
  AutomationWorkflow, 
  AutomationNode, 
  AutomationEdge, 
  AutomationRun,
  WorkflowWithRelations,
  WorkflowStatus,
  StarterAutomation 
} from '@/types/automation';
import { STARTER_AUTOMATIONS } from '@/data/starterAutomations';
import { useToast } from '@/hooks/use-toast';

const DEFAULT_GUARDRAILS = {
  enforce_opt_in_for_marketing: true,
  max_messages_per_contact_per_day: 50,
  cooldown_seconds: 900,
  stop_on_customer_reply: true,
  stop_on_conversation_closed: true,
  max_messages_per_hour: 10,
  max_runs_per_contact_per_day: 5,
};

export function useAutomationWorkflows() {
  const [workflows, setWorkflows] = useState<WorkflowWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentTenant } = useTenant();
  const { toast } = useToast();

  const fetchWorkflows = useCallback(async () => {
    if (!currentTenant?.id) return;

    try {
      setLoading(true);
      
      // Fetch workflows
      const { data: workflowsData, error: workflowsError } = await supabase
        .from('automation_workflows')
        .select('*')
        .eq('tenant_id', currentTenant.id)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });

      if (workflowsError) throw workflowsError;

      // Fetch run stats for each workflow
      const workflowsWithStats: WorkflowWithRelations[] = await Promise.all(
        (workflowsData || []).map(async (workflow) => {
          // Get run counts
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

          const { count: runsToday } = await supabase
            .from('automation_runs')
            .select('*', { count: 'exact', head: true })
            .eq('workflow_id', workflow.id)
            .gte('started_at', today.toISOString());

          const { count: runs7Days } = await supabase
            .from('automation_runs')
            .select('*', { count: 'exact', head: true })
            .eq('workflow_id', workflow.id)
            .gte('started_at', sevenDaysAgo.toISOString());

          const { count: successCount } = await supabase
            .from('automation_runs')
            .select('*', { count: 'exact', head: true })
            .eq('workflow_id', workflow.id)
            .eq('status', 'success')
            .gte('started_at', sevenDaysAgo.toISOString());

          const { count: errorCount } = await supabase
            .from('automation_runs')
            .select('*', { count: 'exact', head: true })
            .eq('workflow_id', workflow.id)
            .eq('status', 'failed')
            .gte('started_at', sevenDaysAgo.toISOString());

          const successRate = runs7Days && runs7Days > 0 
            ? Math.round((successCount || 0) / runs7Days * 100) 
            : 100;

          return {
            ...workflow,
            stats: {
              runs_today: runsToday || 0,
              runs_7_days: runs7Days || 0,
              success_rate: successRate,
              error_count: errorCount || 0,
              messages_sent: 0, // Would need aggregation from runs
            },
          } as WorkflowWithRelations;
        })
      );

      setWorkflows(workflowsWithStats);
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

  const createWorkflow = async (workflow: Partial<AutomationWorkflow>): Promise<WorkflowWithRelations | null> => {
    if (!currentTenant?.id) return null;

    try {
      const { data, error: insertError } = await supabase
        .from('automation_workflows')
        .insert({
          tenant_id: currentTenant.id,
          name: workflow.name || 'New Workflow',
          description: workflow.description || null,
          status: workflow.status || 'draft',
          trigger_type: workflow.trigger_type || 'keyword_received',
          trigger_config: workflow.trigger_config || {},
          enforce_opt_in_for_marketing: workflow.enforce_opt_in_for_marketing ?? DEFAULT_GUARDRAILS.enforce_opt_in_for_marketing,
          max_messages_per_contact_per_day: workflow.max_messages_per_contact_per_day ?? DEFAULT_GUARDRAILS.max_messages_per_contact_per_day,
          cooldown_seconds: workflow.cooldown_seconds ?? DEFAULT_GUARDRAILS.cooldown_seconds,
          stop_on_customer_reply: workflow.stop_on_customer_reply ?? DEFAULT_GUARDRAILS.stop_on_customer_reply,
          stop_on_conversation_closed: workflow.stop_on_conversation_closed ?? DEFAULT_GUARDRAILS.stop_on_conversation_closed,
          max_messages_per_hour: workflow.max_messages_per_hour ?? DEFAULT_GUARDRAILS.max_messages_per_hour,
          max_runs_per_contact_per_day: workflow.max_runs_per_contact_per_day ?? DEFAULT_GUARDRAILS.max_runs_per_contact_per_day,
          timezone: workflow.timezone || 'UTC',
          business_hours_config: workflow.business_hours_config || null,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      toast({
        title: 'Workflow created',
        description: 'Your workflow has been created successfully.',
      });

      await fetchWorkflows();
      return data as WorkflowWithRelations;
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

  const updateWorkflow = async (id: string, updates: Partial<AutomationWorkflow>): Promise<boolean> => {
    try {
      const { error: updateError } = await supabase
        .from('automation_workflows')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
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
      // Soft delete
      const { error: deleteError } = await supabase
        .from('automation_workflows')
        .update({ is_deleted: true, updated_at: new Date().toISOString() })
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

    const newStatus: WorkflowStatus = workflow.status === 'active' ? 'paused' : 'active';
    return updateWorkflow(id, { status: newStatus });
  };

  const duplicateWorkflow = async (id: string): Promise<WorkflowWithRelations | null> => {
    const workflow = workflows.find(w => w.id === id);
    if (!workflow) return null;

    const { id: _, created_at, updated_at, stats, nodes, edges, runs, ...rest } = workflow;
    return createWorkflow({
      ...rest,
      name: `${workflow.name} (Copy)`,
      status: 'draft' as WorkflowStatus,
    });
  };

  const installStarterAutomation = async (starter: StarterAutomation): Promise<WorkflowWithRelations | null> => {
    if (!currentTenant?.id) return null;

    try {
      // Create the workflow
      const workflow = await createWorkflow({
        name: starter.name,
        description: starter.description,
        status: 'draft',
        trigger_type: starter.trigger_type,
        trigger_config: starter.trigger_config,
        ...starter.guardrails,
      });

      if (!workflow) return null;

      // Create nodes
      for (let i = 0; i < starter.nodes.length; i++) {
        const node = starter.nodes[i];
        await supabase.from('automation_nodes').insert({
          workflow_id: workflow.id,
          type: node.type!,
          node_key: node.node_key!,
          config: node.config || {},
          sort_order: i,
          position_x: 200,
          position_y: 100 + (i * 120),
        });
      }

      // Create edges (connect nodes sequentially)
      const { data: createdNodes } = await supabase
        .from('automation_nodes')
        .select('*')
        .eq('workflow_id', workflow.id)
        .order('sort_order');

      if (createdNodes && createdNodes.length > 1) {
        for (let i = 0; i < createdNodes.length - 1; i++) {
          await supabase.from('automation_edges').insert({
            workflow_id: workflow.id,
            from_node_id: createdNodes[i].id,
            to_node_id: createdNodes[i + 1].id,
            sort_order: i,
          });
        }
      }

      await fetchWorkflows();
      return workflow;
    } catch (err) {
      console.error('Error installing starter automation:', err);
      toast({
        title: 'Error',
        description: 'Failed to install starter automation',
        variant: 'destructive',
      });
      return null;
    }
  };

  const pauseAllWorkflows = async (): Promise<boolean> => {
    if (!currentTenant?.id) return false;

    try {
      const { error: updateError } = await supabase
        .from('automation_workflows')
        .update({ status: 'paused', updated_at: new Date().toISOString() })
        .eq('tenant_id', currentTenant.id)
        .eq('status', 'active');

      if (updateError) throw updateError;

      toast({
        title: 'All workflows paused',
        description: 'All active workflows have been paused.',
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

// Hook for workflow nodes and edges
export function useWorkflowBuilder(workflowId?: string) {
  const [nodes, setNodes] = useState<AutomationNode[]>([]);
  const [edges, setEdges] = useState<AutomationEdge[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchNodesAndEdges = useCallback(async () => {
    if (!workflowId) return;

    try {
      setLoading(true);

      const [nodesResult, edgesResult] = await Promise.all([
        supabase
          .from('automation_nodes')
          .select('*')
          .eq('workflow_id', workflowId)
          .order('sort_order'),
        supabase
          .from('automation_edges')
          .select('*')
          .eq('workflow_id', workflowId)
          .order('sort_order'),
      ]);

      if (nodesResult.error) throw nodesResult.error;
      if (edgesResult.error) throw edgesResult.error;

      setNodes((nodesResult.data || []) as unknown as AutomationNode[]);
      setEdges((edgesResult.data || []) as unknown as AutomationEdge[]);
    } catch (err) {
      console.error('Error fetching nodes and edges:', err);
    } finally {
      setLoading(false);
    }
  }, [workflowId]);

  useEffect(() => {
    fetchNodesAndEdges();
  }, [fetchNodesAndEdges]);

  const saveNodesAndEdges = async (
    newNodes: Partial<AutomationNode>[],
    newEdges: Partial<AutomationEdge>[]
  ): Promise<boolean> => {
    if (!workflowId) return false;

    try {
      // Delete existing nodes and edges
      await supabase.from('automation_edges').delete().eq('workflow_id', workflowId);
      await supabase.from('automation_nodes').delete().eq('workflow_id', workflowId);

      // Insert new nodes
      const nodesToInsert = newNodes.map((node, i) => ({
        workflow_id: workflowId,
        type: node.type!,
        node_key: node.node_key || `node_${i + 1}`,
        name: node.name,
        config: node.config || {},
        sort_order: i,
        position_x: node.position_x,
        position_y: node.position_y,
      }));

      const { data: insertedNodes, error: nodesError } = await supabase
        .from('automation_nodes')
        .insert(nodesToInsert)
        .select();

      if (nodesError) throw nodesError;

      // Create node key to ID mapping
      const nodeKeyToId: Record<string, string> = {};
      insertedNodes?.forEach(node => {
        nodeKeyToId[node.node_key] = node.id;
      });

      // Insert edges with resolved IDs
      const edgesToInsert = newEdges.map((edge, i) => ({
        workflow_id: workflowId,
        from_node_id: nodeKeyToId[edge.from_node_id as string] || edge.from_node_id,
        to_node_id: nodeKeyToId[edge.to_node_id as string] || edge.to_node_id,
        label: edge.label,
        condition: edge.condition,
        sort_order: i,
      }));

      if (edgesToInsert.length > 0) {
        const { error: edgesError } = await supabase
          .from('automation_edges')
          .insert(edgesToInsert);

        if (edgesError) throw edgesError;
      }

      await fetchNodesAndEdges();
      toast({
        title: 'Workflow saved',
        description: 'Your workflow has been saved successfully.',
      });
      return true;
    } catch (err) {
      console.error('Error saving nodes and edges:', err);
      toast({
        title: 'Error',
        description: 'Failed to save workflow',
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    nodes,
    edges,
    loading,
    saveNodesAndEdges,
    refetch: fetchNodesAndEdges,
  };
}

// Hook for workflow runs (execution logs)
export function useWorkflowRuns(workflowId?: string) {
  const [runs, setRuns] = useState<AutomationRun[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!workflowId) return;

    const fetchRuns = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('automation_runs')
          .select('*')
          .eq('workflow_id', workflowId)
          .order('started_at', { ascending: false })
          .limit(50);

        if (error) throw error;
        setRuns((data || []) as unknown as AutomationRun[]);
      } catch (err) {
        console.error('Error fetching runs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRuns();
  }, [workflowId]);

  return { runs, loading };
}
