import { useState, useEffect, useCallback, useRef } from 'react';
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

  const createFlow = async (data: { name: string; description?: string; emoji?: string; folder?: string; quickCreateKey?: string }) => {
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
      const startNode = {
        tenant_id: currentTenant.id,
        flow_id: newFlow.id,
        node_key: 'start',
        node_type: 'start',
        label: 'Flow Start',
        position_x: 400,
        position_y: 50,
        config: {},
      };

      // Get quick create sample nodes if applicable
      const sampleNodes = data.quickCreateKey
        ? getQuickCreateNodes(data.quickCreateKey, currentTenant.id, newFlow.id)
        : [];

      await supabase.from('flow_nodes').insert([startNode, ...sampleNodes]);

      // Create edges connecting start → first sample node
      if (sampleNodes.length > 0) {
        const sampleEdges = getTemplateSampleEdges(sampleNodes, currentTenant.id, newFlow.id);
        if (sampleEdges.length > 0) {
          await supabase.from('flow_edges').insert(sampleEdges);
        }
      }

      toast.success('Flow created successfully');
      await fetchFlows();
      return newFlow;
    } catch (err: any) {
      toast.error(err.message);
      return null;
    }
  };

  const createFlowFromTemplate = async (template: FlowTemplate) => {
    if (!currentTenant?.id || !user?.id) {
      toast.error('Please select a workspace');
      return null;
    }

    try {
      const { data: newFlow, error } = await supabase
        .from('flows')
        .insert({
          tenant_id: currentTenant.id,
          name: template.title,
          description: template.subtitle || null,
          emoji: getTemplateEmoji(template.category),
          is_pro: template.is_pro,
          created_by: user.id,
          status: 'draft',
        })
        .select()
        .single();

      if (error) throw error;
      
      // Create default start node + sample nodes from template
      const previewData = template.preview_json as any;
      const templateNodes = previewData?.nodes || [];
      const templateEdges = previewData?.edges || [];
      
      // Always add a start node
      const startNode = {
        tenant_id: currentTenant.id,
        flow_id: newFlow.id,
        node_key: 'start',
        node_type: 'start',
        label: 'Flow Start',
        position_x: 400,
        position_y: 50,
        config: {},
      };
      
      // Create sample nodes based on template category
      const sampleNodes = getTemplateSampleNodes(template, currentTenant.id, newFlow.id);
      
      await supabase.from('flow_nodes').insert([startNode, ...sampleNodes]);
      
      // Create edges connecting the nodes
      const sampleEdges = getTemplateSampleEdges(sampleNodes, currentTenant.id, newFlow.id);
      if (sampleEdges.length > 0) {
        await supabase.from('flow_edges').insert(sampleEdges);
      }

      toast.success('Flow created from template');
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
    createFlowFromTemplate,
    updateFlow,
    deleteFlow,
    duplicateFlow,
    toggleFlowStatus,
    refetch: fetchFlows,
  };
}

// Helper functions for template creation
function getTemplateEmoji(category: string): string {
  const emojiMap: Record<string, string> = {
    'E-commerce': '🛒',
    'Real Estate': '🏠',
    'Healthcare': '🏥',
    'Education': '📚',
    'IT': '💻',
    'Recruitment': '👥',
    'Travel': '✈️',
  };
  return emojiMap[category] || '🔄';
}

function getTemplateSampleNodes(template: FlowTemplate, tenantId: string, flowId: string) {
  const categoryNodes: Record<string, any[]> = {
    'E-commerce': [
      { node_key: 'welcome_msg', node_type: 'text-buttons', label: 'Welcome Message', position_x: 400, position_y: 180, config: { message: 'Hi {{first_name}}! 👋 Welcome to our store. How can I help you today?', buttons: ['Browse Products', 'Track Order', 'Talk to Agent'] } },
      { node_key: 'product_menu', node_type: 'list-message', label: 'Product Menu', position_x: 200, position_y: 320, config: { header: 'Our Products', body: 'Choose a category:', sections: [] } },
      { node_key: 'order_check', node_type: 'webhook', label: 'Check Order Status', position_x: 400, position_y: 320, config: { url: '', method: 'GET' } },
      { node_key: 'handover', node_type: 'assign-agent', label: 'Assign Agent', position_x: 600, position_y: 320, config: { strategy: 'round_robin' } },
    ],
    'Real Estate': [
      { node_key: 'welcome_msg', node_type: 'text-buttons', label: 'Welcome Message', position_x: 400, position_y: 180, config: { message: 'Hi! 🏠 Welcome to our real estate services. Are you looking to buy, sell, or rent?', buttons: ['Buy Property', 'Sell Property', 'Rent'] } },
      { node_key: 'qualify', node_type: 'condition', label: 'Qualify Lead', position_x: 400, position_y: 320, config: { conditions: [] } },
      { node_key: 'set_lead', node_type: 'set-attribute', label: 'Set Lead Status', position_x: 400, position_y: 460, config: { attribute: 'lead_status', value: 'qualified' } },
    ],
    'Healthcare': [
      { node_key: 'welcome_msg', node_type: 'text-buttons', label: 'Welcome Message', position_x: 400, position_y: 180, config: { message: 'Hello! 🏥 Welcome to our clinic. How can we assist you?', buttons: ['Book Appointment', 'Check Results', 'Speak to Staff'] } },
      { node_key: 'schedule', node_type: 'list-message', label: 'Select Time Slot', position_x: 400, position_y: 320, config: { header: 'Available Slots', body: 'Choose your preferred time:', sections: [] } },
    ],
    default: [
      { node_key: 'welcome_msg', node_type: 'text-buttons', label: 'Welcome Message', position_x: 400, position_y: 180, config: { message: 'Hello! 👋 How can I help you today?', buttons: ['Learn More', 'Get Support', 'Contact Us'] } },
      { node_key: 'response', node_type: 'text-buttons', label: 'Follow Up', position_x: 400, position_y: 320, config: { message: 'Thanks for your interest! Let me help you further.' } },
    ],
  };
  
  const nodes = categoryNodes[template.category] || categoryNodes['default'];
  return nodes.map(node => ({
    ...node,
    tenant_id: tenantId,
    flow_id: flowId,
  }));
}

function getQuickCreateNodes(quickCreateKey: string, tenantId: string, flowId: string) {
  const quickCreateMap: Record<string, any[]> = {
    'Lead Qualification': [
      { node_key: 'welcome_msg', node_type: 'text-buttons', label: 'Welcome Message', position_x: 400, position_y: 180, config: { message: 'Hi there! 🎯 Thanks for reaching out. I\'d love to learn more about your needs. What are you looking for?', buttons: ['Product Info', 'Get a Quote', 'Talk to Sales'] } },
      { node_key: 'ask_budget', node_type: 'text-buttons', label: 'Ask Budget', position_x: 400, position_y: 320, config: { message: 'Great! What\'s your approximate budget range?', buttons: ['< $1,000', '$1,000 - $5,000', '$5,000+'] } },
      { node_key: 'ask_timeline', node_type: 'text-buttons', label: 'Ask Timeline', position_x: 400, position_y: 460, config: { message: 'When are you looking to get started?', buttons: ['Immediately', 'This Month', 'Just Exploring'] } },
      { node_key: 'set_lead', node_type: 'set-attribute', label: 'Mark as Qualified', position_x: 400, position_y: 600, config: { attribute: 'lead_status', value: 'qualified' } },
      { node_key: 'assign', node_type: 'assign-agent', label: 'Assign to Sales', position_x: 400, position_y: 740, config: { strategy: 'round_robin' } },
    ],
    'Appointment Booking': [
      { node_key: 'welcome_msg', node_type: 'text-buttons', label: 'Welcome Message', position_x: 400, position_y: 180, config: { message: 'Hi! 📅 I can help you book an appointment. What type of appointment are you looking for?', buttons: ['Consultation', 'Follow-up', 'Demo Call'] } },
      { node_key: 'select_time', node_type: 'list-message', label: 'Select Time Slot', position_x: 400, position_y: 320, config: { header: 'Available Slots', body: 'Choose a time that works for you:', sections: [] } },
      { node_key: 'confirm', node_type: 'text-buttons', label: 'Confirm Booking', position_x: 400, position_y: 460, config: { message: '✅ Your appointment has been booked! You\'ll receive a confirmation shortly.', buttons: ['Reschedule', 'Cancel', 'Done'] } },
    ],
    'Support Triage': [
      { node_key: 'welcome_msg', node_type: 'text-buttons', label: 'Welcome Message', position_x: 400, position_y: 180, config: { message: 'Hi! 🎧 Welcome to support. How can I help you today?', buttons: ['Technical Issue', 'Billing Question', 'Feature Request'] } },
      { node_key: 'priority', node_type: 'condition', label: 'Check Priority', position_x: 400, position_y: 320, config: { conditions: [] } },
      { node_key: 'create_ticket', node_type: 'create-ticket', label: 'Create Ticket', position_x: 400, position_y: 460, config: {} },
      { node_key: 'assign', node_type: 'assign-agent', label: 'Assign Agent', position_x: 400, position_y: 600, config: { strategy: 'least_busy' } },
    ],
    'Abandoned Cart': [
      { node_key: 'reminder', node_type: 'text-buttons', label: 'Cart Reminder', position_x: 400, position_y: 180, config: { message: 'Hey {{first_name}}! 🛒 You left some items in your cart. Want to complete your order?', buttons: ['Complete Order', 'Need Help', 'Not Now'] } },
      { node_key: 'offer', node_type: 'text-buttons', label: 'Special Offer', position_x: 400, position_y: 320, config: { message: '🎉 Here\'s a 10% discount code just for you: SAVE10. Complete your order now!', buttons: ['Shop Now', 'Browse More'] } },
      { node_key: 'tag_interested', node_type: 'add-tag', label: 'Tag as Interested', position_x: 400, position_y: 460, config: { tag: 'cart_recovery' } },
    ],
    'Feedback NPS': [
      { node_key: 'ask_rating', node_type: 'text-buttons', label: 'Ask Rating', position_x: 400, position_y: 180, config: { message: 'Hi {{first_name}}! ⭐ How would you rate your recent experience with us?', buttons: ['😍 Amazing', '😊 Good', '😐 Okay', '😞 Poor'] } },
      { node_key: 'ask_feedback', node_type: 'text-buttons', label: 'Ask Feedback', position_x: 400, position_y: 320, config: { message: 'Thanks! Would you like to share any additional feedback?', buttons: ['Yes, I have feedback', 'No, that\'s all'] } },
      { node_key: 'thank_you', node_type: 'text-buttons', label: 'Thank You', position_x: 400, position_y: 460, config: { message: 'Thank you for your feedback! 🙏 We really appreciate it.' } },
      { node_key: 'set_nps', node_type: 'set-attribute', label: 'Set NPS Score', position_x: 400, position_y: 600, config: { attribute: 'nps_score', value: '' } },
    ],
  };

  const nodes = quickCreateMap[quickCreateKey] || quickCreateMap['Lead Qualification'] || [];
  return nodes.map(node => ({
    ...node,
    tenant_id: tenantId,
    flow_id: flowId,
  }));
}

function getTemplateSampleEdges(nodes: any[], tenantId: string, flowId: string) {
  if (nodes.length < 1) return [];
  
  // Connect start to first node
  const edges = [{
    tenant_id: tenantId,
    flow_id: flowId,
    edge_key: `edge_start_${nodes[0].node_key}`,
    source_node_key: 'start',
    target_node_key: nodes[0].node_key,
    config: {},
  }];
  
  return edges;
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

  // Debounce timer for position updates
  const positionUpdateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingPositionUpdates = useRef<Map<string, { x: number; y: number }>>(new Map());
  
  const updateNode = useCallback((nodeKey: string, updates: Partial<FlowNode>) => {
    if (!flowId) return false;

    // Update local state immediately for smooth dragging
    setNodes(prev => prev.map(n => 
      n.node_key === nodeKey ? { ...n, ...updates } : n
    ));
    
    // If this is a position update, debounce the database save
    if ('position_x' in updates || 'position_y' in updates) {
      pendingPositionUpdates.current.set(nodeKey, {
        x: updates.position_x ?? 0,
        y: updates.position_y ?? 0,
      });
      
      if (positionUpdateTimerRef.current) {
        clearTimeout(positionUpdateTimerRef.current);
      }
      
      positionUpdateTimerRef.current = setTimeout(async () => {
        // Batch save all pending position updates
        const pendingUpdates = Array.from(pendingPositionUpdates.current.entries());
        pendingPositionUpdates.current.clear();
        
        for (const [key, pos] of pendingUpdates) {
          await supabase
            .from('flow_nodes')
            .update({ position_x: pos.x, position_y: pos.y })
            .eq('flow_id', flowId)
            .eq('node_key', key);
        }
      }, 500);
      
      return true;
    }
    
    // For non-position updates, save immediately
    (async () => {
      try {
        const { error } = await supabase
          .from('flow_nodes')
          .update(updates)
          .eq('flow_id', flowId)
          .eq('node_key', nodeKey);

        if (error) throw error;
      } catch (err) {
        toast.error('Failed to update node');
      }
    })();
    
    return true;
  }, [flowId]);

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

  // Trigger management
  const addTrigger = async (triggerType: string, config: Record<string, any> = {}) => {
    if (!flowId || !currentTenant?.id) return null;

    // Map trigger type string to enum value
    const validTriggerTypes = ['keyword', 'regex', 'qr', 'meta_ad', 'api', 'manual', 'fallback'] as const;
    type TriggerType = typeof validTriggerTypes[number];
    const typedTriggerType = (validTriggerTypes.includes(triggerType as TriggerType) ? triggerType : 'keyword') as TriggerType;

    try {
      const { data, error } = await supabase
        .from('flow_triggers')
        .insert({
          tenant_id: currentTenant.id,
          flow_id: flowId,
          trigger_type: typedTriggerType,
          priority: triggers.length + 1,
          is_enabled: true,
          config: config as any,
        })
        .select()
        .single();

      if (error) throw error;
      setTriggers(prev => [...prev, data as unknown as FlowTrigger]);
      toast.success('Trigger added');
      return data;
    } catch (err: any) {
      toast.error('Failed to add trigger');
      return null;
    }
  };

  const updateTrigger = async (triggerId: string, updates: { config?: Record<string, any>; is_enabled?: boolean; priority?: number }) => {
    if (!flowId) return false;

    try {
      const { error } = await supabase
        .from('flow_triggers')
        .update(updates as any)
        .eq('id', triggerId)
        .eq('flow_id', flowId);

      if (error) throw error;
      setTriggers(prev => prev.map(t => t.id === triggerId ? { ...t, ...updates } as FlowTrigger : t));
      return true;
    } catch (err) {
      toast.error('Failed to update trigger');
      return false;
    }
  };

  const deleteTrigger = async (triggerId: string) => {
    if (!flowId) return false;

    try {
      const { error } = await supabase
        .from('flow_triggers')
        .delete()
        .eq('id', triggerId)
        .eq('flow_id', flowId);

      if (error) throw error;
      setTriggers(prev => prev.filter(t => t.id !== triggerId));
      toast.success('Trigger removed');
      return true;
    } catch (err) {
      toast.error('Failed to delete trigger');
      return false;
    }
  };

  const toggleTrigger = async (triggerId: string, enabled: boolean) => {
    return updateTrigger(triggerId, { is_enabled: enabled });
  };

  const loadPrebuiltFlow = async (prebuilt: import('@/data/prebuiltFlows').PrebuiltFlow) => {
    if (!flowId || !currentTenant?.id) return false;

    try {
      const newNodes = prebuilt.nodes.map(n => ({
        tenant_id: currentTenant.id,
        flow_id: flowId,
        node_key: `${n.node_key}_${Date.now()}`,
        node_type: n.node_type,
        label: n.label,
        position_x: n.position_x,
        position_y: n.position_y,
        config: n.config,
      }));

      const { data: insertedNodes, error: nodesErr } = await supabase
        .from('flow_nodes')
        .insert(newNodes)
        .select();

      if (nodesErr) throw nodesErr;

      // Create edges: start → first node, then chain sequentially
      const edgesToInsert: any[] = [];
      const startNode = nodes.find(n => n.node_type === 'start');
      
      if (startNode && insertedNodes && insertedNodes.length > 0) {
        edgesToInsert.push({
          tenant_id: currentTenant.id,
          flow_id: flowId,
          edge_key: `edge_start_${insertedNodes[0].node_key}`,
          source_node_key: startNode.node_key,
          target_node_key: insertedNodes[0].node_key,
          config: {},
        });
      }

      if (insertedNodes) {
        for (let i = 0; i < insertedNodes.length - 1; i++) {
          edgesToInsert.push({
            tenant_id: currentTenant.id,
            flow_id: flowId,
            edge_key: `edge_${insertedNodes[i].node_key}_${insertedNodes[i + 1].node_key}`,
            source_node_key: insertedNodes[i].node_key,
            target_node_key: insertedNodes[i + 1].node_key,
            config: {},
          });
        }
      }

      if (edgesToInsert.length > 0) {
        const { error: edgesErr } = await supabase
          .from('flow_edges')
          .insert(edgesToInsert);
        if (edgesErr) throw edgesErr;
      }

      toast.success(`"${prebuilt.name}" loaded into canvas`);
      await fetchFlow();
      return true;
    } catch (err: any) {
      toast.error('Failed to load prebuilt flow');
      console.error(err);
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
    addTrigger,
    updateTrigger,
    deleteTrigger,
    toggleTrigger,
    loadPrebuiltFlow,
    setNodes,
    setEdges,
    setTriggers,
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
      return { header: '', body: '', button_label: '', items: [] };
    case 'media':
      return { media_type: 'image', media_url: '', caption: '' };
    case 'document':
      return { document_url: '', filename: '', caption: '' };
    case 'template':
      return { template_name: '', language: 'en', message: '' };
    case 'delay':
      return { duration: 5, unit: 'seconds' };
    case 'condition':
      return { field: 'message', operator: 'contains', value: '' };
    case 'switch':
      return { variable: '' };
    case 'timeout':
      return { timeout: 60, unit: 'minutes' };
    case 'webhook':
      return { url: '', method: 'POST', headers: '' };
    case 'assign-agent':
      return { strategy: 'round_robin' };
    case 'set-attribute':
      return { attribute: '', value: '' };
    case 'add-tag':
      return { action: 'add', tag: '' };
    case 'notify-team':
      return { message: '', channel: 'inbox' };
    case 'create-ticket':
      return { subject: '', priority: 'medium' };
    case 'add-segment':
      return { segment: '' };
    case 'random-split':
      return { splits: [50, 50] };
    case 'business-hours':
      return { timezone: 'UTC', schedule: {} };
    default:
      return {};
  }
}
