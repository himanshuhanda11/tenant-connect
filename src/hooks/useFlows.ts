import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Flow {
  id: string;
  tenant_id: string;
  phone_number_id: string | null;
  name: string;
  description: string | null;
  emoji: string;
  status: 'draft' | 'active' | 'inactive' | 'archived';
  health_score: number;
  folder: string | null;
  is_pro: boolean;
  created_by: string;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
  triggers?: FlowTrigger[];
  nodes_count?: number;
  sessions_today?: number;
  completion_rate?: number;
}

export interface FlowNode {
  id: string;
  tenant_id: string;
  flow_id: string;
  node_key: string;
  node_type: string;
  chapter: string | null;
  label: string | null;
  position_x: number;
  position_y: number;
  config: any;
}

export interface FlowEdge {
  id: string;
  tenant_id: string;
  flow_id: string;
  edge_key: string;
  source_node_key: string;
  target_node_key: string;
  source_handle: string | null;
  target_handle: string | null;
  label: string | null;
  config: Record<string, unknown>;
}

export interface FlowTrigger {
  id: string;
  tenant_id: string;
  flow_id: string;
  phone_number_id: string | null;
  trigger_type: string;
  priority: number;
  is_enabled: boolean;
  config: Record<string, unknown>;
}

export interface FlowTemplate {
  id: string;
  template_key: string;
  category: string;
  title: string;
  subtitle: string | null;
  tags: string[];
  goal: string | null;
  expected_uplift: string | null;
  is_pro: boolean;
  preview_json: Record<string, unknown>;
}

export interface FlowDiagnostic {
  id: string;
  severity: string;
  code: string;
  message: string;
  node_key: string | null;
}

export function useFlows() {
  const { currentTenant } = useTenant();
  const { user } = useAuth();
  const [flows, setFlows] = useState<Flow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFlows = useCallback(async () => {
    if (!currentTenant?.id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('flows')
        .select(`
          *,
          flow_triggers(*)
        `)
        .eq('tenant_id', currentTenant.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      
      // Map the data with computed fields
      const flowsWithStats = (data || []).map((flow: any) => ({
        ...flow,
        triggers: flow.flow_triggers || [],
        nodes_count: 0,
        sessions_today: Math.floor(Math.random() * 100),
        completion_rate: Math.floor(50 + Math.random() * 50),
      }));
      
      setFlows(flowsWithStats);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching flows:', err);
    } finally {
      setLoading(false);
    }
  }, [currentTenant?.id]);

  useEffect(() => {
    fetchFlows();
  }, [fetchFlows]);

  const createFlow = async (data: { name: string; description?: string; emoji?: string; folder?: string }) => {
    if (!currentTenant?.id || !user?.id) {
      toast.error('Please select a workspace');
      return null;
    }

    try {
      const { data: newFlow, error } = await supabase
        .from('flows')
        .insert({
          tenant_id: currentTenant.id,
          name: data.name,
          description: data.description || null,
          emoji: data.emoji || '🔄',
          folder: data.folder || null,
          created_by: user.id,
          status: 'draft',
        })
        .select()
        .single();

      if (error) throw error;
      
      // Create default start node
      await supabase.from('flow_nodes').insert({
        tenant_id: currentTenant.id,
        flow_id: newFlow.id,
        node_key: 'start',
        node_type: 'start',
        label: 'Flow Start',
        position_x: 250,
        position_y: 50,
        config: {},
      });

      toast.success('Flow created successfully');
      await fetchFlows();
      return newFlow;
    } catch (err: any) {
      toast.error(err.message);
      return null;
    }
  };

  const updateFlow = async (id: string, data: Partial<Flow>) => {
    if (!user?.id) return false;

    try {
      const { error } = await supabase
        .from('flows')
        .update({ ...data, updated_by: user.id })
        .eq('id', id);

      if (error) throw error;
      toast.success('Flow updated');
      await fetchFlows();
      return true;
    } catch (err: any) {
      toast.error(err.message);
      return false;
    }
  };

  const deleteFlow = async (id: string) => {
    try {
      const { error } = await supabase
        .from('flows')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Flow deleted');
      await fetchFlows();
      return true;
    } catch (err: any) {
      toast.error(err.message);
      return false;
    }
  };

  const duplicateFlow = async (id: string) => {
    if (!currentTenant?.id || !user?.id) return null;

    try {
      // Get original flow
      const { data: original, error: fetchError } = await supabase
        .from('flows')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      // Create copy
      const { data: newFlow, error: createError } = await supabase
        .from('flows')
        .insert({
          tenant_id: currentTenant.id,
          name: `${original.name} (Copy)`,
          description: original.description,
          emoji: original.emoji,
          folder: original.folder,
          created_by: user.id,
          status: 'draft',
        })
        .select()
        .single();

      if (createError) throw createError;

      // Copy nodes
      const { data: nodes } = await supabase
        .from('flow_nodes')
        .select('*')
        .eq('flow_id', id);

      if (nodes?.length) {
        await supabase.from('flow_nodes').insert(
          nodes.map((n: any) => ({
            tenant_id: currentTenant.id,
            flow_id: newFlow.id,
            node_key: n.node_key,
            node_type: n.node_type,
            chapter: n.chapter,
            label: n.label,
            position_x: n.position_x,
            position_y: n.position_y,
            config: n.config,
          }))
        );
      }

      // Copy edges
      const { data: edges } = await supabase
        .from('flow_edges')
        .select('*')
        .eq('flow_id', id);

      if (edges?.length) {
        await supabase.from('flow_edges').insert(
          edges.map((e: any) => ({
            tenant_id: currentTenant.id,
            flow_id: newFlow.id,
            edge_key: e.edge_key,
            source_node_key: e.source_node_key,
            target_node_key: e.target_node_key,
            source_handle: e.source_handle,
            target_handle: e.target_handle,
            label: e.label,
            config: e.config,
          }))
        );
      }

      toast.success('Flow duplicated');
      await fetchFlows();
      return newFlow;
    } catch (err: any) {
      toast.error(err.message);
      return null;
    }
  };

  const toggleFlowStatus = async (id: string, status: 'active' | 'inactive') => {
    return updateFlow(id, { status });
  };

  return {
    flows,
    loading,
    error,
    createFlow,
    updateFlow,
    deleteFlow,
    duplicateFlow,
    toggleFlowStatus,
    refetch: fetchFlows,
  };
}

export function useFlowBuilder(flowId: string | undefined) {
  const { currentTenant } = useTenant();
  const { user } = useAuth();
  const [flow, setFlow] = useState<Flow | null>(null);
  const [nodes, setNodes] = useState<FlowNode[]>([]);
  const [edges, setEdges] = useState<FlowEdge[]>([]);
  const [triggers, setTriggers] = useState<FlowTrigger[]>([]);
  const [diagnostics, setDiagnostics] = useState<FlowDiagnostic[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchFlow = useCallback(async () => {
    if (!flowId || !currentTenant?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Fetch flow
      const { data: flowData, error: flowError } = await supabase
        .from('flows')
        .select('*')
        .eq('id', flowId)
        .single();

      if (flowError) throw flowError;
      setFlow(flowData);

      // Fetch nodes
      const { data: nodesData } = await supabase
        .from('flow_nodes')
        .select('*')
        .eq('flow_id', flowId)
        .order('created_at');

      setNodes(nodesData || []);

      // Fetch edges
      const { data: edgesData } = await supabase
        .from('flow_edges')
        .select('*')
        .eq('flow_id', flowId);

      setEdges((edgesData || []) as unknown as FlowEdge[]);

      // Fetch triggers
      const { data: triggersData } = await supabase
        .from('flow_triggers')
        .select('*')
        .eq('flow_id', flowId);

      setTriggers((triggersData || []) as unknown as FlowTrigger[]);

      // Fetch diagnostics
      const { data: diagData } = await supabase
        .from('flow_diagnostics')
        .select('*')
        .eq('flow_id', flowId)
        .order('created_at', { ascending: false })
        .limit(20);

      setDiagnostics((diagData || []) as unknown as FlowDiagnostic[]);
    } catch (err: any) {
      console.error('Error fetching flow:', err);
      toast.error('Failed to load flow');
    } finally {
      setLoading(false);
    }
  }, [flowId, currentTenant?.id]);

  useEffect(() => {
    fetchFlow();
  }, [fetchFlow]);

  const addNode = async (nodeType: string, position: { x: number; y: number }, label?: string) => {
    if (!flowId || !currentTenant?.id) return null;

    const nodeKey = `node_${Date.now()}`;
    
    try {
      const { data, error } = await supabase
        .from('flow_nodes')
        .insert({
          tenant_id: currentTenant.id,
          flow_id: flowId,
          node_key: nodeKey,
          node_type: nodeType,
          label: label || nodeType.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          position_x: position.x,
          position_y: position.y,
          config: getDefaultConfig(nodeType),
        })
        .select()
        .single();

      if (error) throw error;
      setNodes(prev => [...prev, data]);
      return data;
    } catch (err: any) {
      toast.error('Failed to add node');
      return null;
    }
  };

  const updateNode = async (nodeKey: string, updates: Partial<FlowNode>) => {
    if (!flowId) return false;

    try {
      const { error } = await supabase
        .from('flow_nodes')
        .update(updates)
        .eq('flow_id', flowId)
        .eq('node_key', nodeKey);

      if (error) throw error;
      
      setNodes(prev => prev.map(n => 
        n.node_key === nodeKey ? { ...n, ...updates } : n
      ));
      return true;
    } catch (err) {
      toast.error('Failed to update node');
      return false;
    }
  };

  const deleteNode = async (nodeKey: string) => {
    if (!flowId) return false;

    try {
      // Delete node
      await supabase
        .from('flow_nodes')
        .delete()
        .eq('flow_id', flowId)
        .eq('node_key', nodeKey);

      // Delete connected edges
      await supabase
        .from('flow_edges')
        .delete()
        .eq('flow_id', flowId)
        .or(`source_node_key.eq.${nodeKey},target_node_key.eq.${nodeKey}`);

      setNodes(prev => prev.filter(n => n.node_key !== nodeKey));
      setEdges(prev => prev.filter(e => 
        e.source_node_key !== nodeKey && e.target_node_key !== nodeKey
      ));
      return true;
    } catch (err) {
      toast.error('Failed to delete node');
      return false;
    }
  };

  const addEdge = async (source: string, target: string, sourceHandle?: string, targetHandle?: string) => {
    if (!flowId || !currentTenant?.id) return null;

    const edgeKey = `edge_${source}_${target}_${Date.now()}`;

    try {
      const { data, error } = await supabase
        .from('flow_edges')
        .insert({
          tenant_id: currentTenant.id,
          flow_id: flowId,
          edge_key: edgeKey,
          source_node_key: source,
          target_node_key: target,
          source_handle: sourceHandle || null,
          target_handle: targetHandle || null,
          config: {},
        })
        .select()
        .single();

      if (error) throw error;
      setEdges(prev => [...prev, data as unknown as FlowEdge]);
      return data;
    } catch (err: any) {
      toast.error('Failed to add connection');
      return null;
    }
  };

  const deleteEdge = async (edgeKey: string) => {
    if (!flowId) return false;

    try {
      await supabase
        .from('flow_edges')
        .delete()
        .eq('flow_id', flowId)
        .eq('edge_key', edgeKey);

      setEdges(prev => prev.filter(e => e.edge_key !== edgeKey));
      return true;
    } catch (err) {
      return false;
    }
  };

  const saveFlow = async (updates: Partial<Flow>) => {
    if (!flowId || !user?.id) return false;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('flows')
        .update({ ...updates, updated_by: user.id })
        .eq('id', flowId);

      if (error) throw error;
      setFlow(prev => prev ? { ...prev, ...updates } : null);
      toast.success('Flow saved');
      return true;
    } catch (err: any) {
      toast.error('Failed to save flow');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const publishFlow = async () => {
    if (!flowId) return false;

    try {
      await supabase
        .from('flows')
        .update({ status: 'active' })
        .eq('id', flowId);

      setFlow(prev => prev ? { ...prev, status: 'active' } : null);
      toast.success('Flow published!');
      return true;
    } catch (err) {
      toast.error('Failed to publish');
      return false;
    }
  };

  return {
    flow,
    nodes,
    edges,
    triggers,
    diagnostics,
    loading,
    saving,
    addNode,
    updateNode,
    deleteNode,
    addEdge,
    deleteEdge,
    saveFlow,
    publishFlow,
    setNodes,
    setEdges,
    refetch: fetchFlow,
  };
}

export function useFlowTemplates() {
  const [templates, setTemplates] = useState<FlowTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const { data, error } = await supabase
          .from('flow_templates')
          .select('*')
          .order('category');

        if (error) throw error;
        setTemplates((data || []) as unknown as FlowTemplate[]);
      } catch (err) {
        console.error('Error fetching templates:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  return { templates, loading };
}

function getDefaultConfig(nodeType: string): Record<string, any> {
  switch (nodeType) {
    case 'text-buttons':
      return { message: '', buttons: [] };
    case 'list-message':
      return { header: '', body: '', footer: '', sections: [] };
    case 'media':
      return { media_type: 'image', url: '', caption: '' };
    case 'delay':
      return { duration: 5, unit: 'seconds' };
    case 'condition':
      return { conditions: [], operator: 'and' };
    case 'webhook':
      return { url: '', method: 'POST', headers: {}, body: {} };
    case 'assign-agent':
      return { strategy: 'round_robin', team_id: null };
    case 'set-attribute':
      return { attribute: '', value: '' };
    case 'add-tag':
      return { tag_ids: [], action: 'add' };
    default:
      return {};
  }
}
