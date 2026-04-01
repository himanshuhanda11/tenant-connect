import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { toast } from 'sonner';

export interface GreetingTemplate {
  id: string;
  tenant_id: string;
  message_text: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

const DEFAULT_TEMPLATES = [
  `Hi {{name}}! 👋 This is {{agent_name}} from {{biz}}. Thank you for reaching out — we'd love to assist you. How can we help you today?`,
  `Hello {{name}}! 🌟 I'm {{agent_name}} from {{biz}}. We received your enquiry and would be happy to guide you. Shall we schedule a quick call to discuss?`,
  `Dear {{name}}, thank you for your interest! I'm {{agent_name}} from {{biz}}. We'd be glad to assist you — please let us know how we can help.`,
  `Hi {{name}}! 🙌 This is {{agent_name}} at {{biz}}. Great to hear from you! Let us know your requirements and we'll guide you right away.`,
  `Hello {{name}}! ✈️ I'm {{agent_name}} from {{biz}}. Thanks for connecting with us — we're here to provide you the best service. When is a good time to talk?`,
  `Hi {{name}}! 💼 This is {{agent_name}} from {{biz}}. We appreciate your enquiry and look forward to assisting you. How may we help?`,
  `Dear {{name}}, welcome to {{biz}}! 🏢 I'm {{agent_name}} — our team is ready to assist you with genuine and professional service. What can we do for you?`,
  `Hi {{name}}! 🤝 I'm {{agent_name}} from {{biz}}. Your enquiry is important to us — let's connect and discuss how we can support you.`,
  `Hello {{name}}! 🚀 This is {{agent_name}} at {{biz}}. We're excited to help you get started. Feel free to share your requirements!`,
  `Hi {{name}}! 😊 Thanks for reaching out to {{biz}}. I'm {{agent_name}} and I'll personally assist you. Let me know how I can help!`,
];

export function useGreetingTemplates() {
  const { currentTenant } = useTenant();
  const queryClient = useQueryClient();
  const tenantId = currentTenant?.id;

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['greeting-templates', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const { data, error } = await supabase
        .from('whatsapp_greeting_templates')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return (data || []) as GreetingTemplate[];
    },
    enabled: !!tenantId,
  });

  const addTemplate = useMutation({
    mutationFn: async (messageText: string) => {
      if (!tenantId) throw new Error('No workspace selected');
      const { error } = await supabase
        .from('whatsapp_greeting_templates')
        .insert({ tenant_id: tenantId, message_text: messageText, sort_order: templates.length });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['greeting-templates', tenantId] });
      toast.success('Greeting template added');
    },
    onError: () => toast.error('Failed to add template'),
  });

  const updateTemplate = useMutation({
    mutationFn: async ({ id, message_text, is_active }: { id: string; message_text?: string; is_active?: boolean }) => {
      const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (message_text !== undefined) updates.message_text = message_text;
      if (is_active !== undefined) updates.is_active = is_active;
      const { error } = await supabase.from('whatsapp_greeting_templates').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['greeting-templates', tenantId] });
      toast.success('Template updated');
    },
    onError: () => toast.error('Failed to update template'),
  });

  const deleteTemplate = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('whatsapp_greeting_templates').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['greeting-templates', tenantId] });
      toast.success('Template deleted');
    },
    onError: () => toast.error('Failed to delete template'),
  });

  const seedDefaults = useMutation({
    mutationFn: async () => {
      if (!tenantId) throw new Error('No workspace');
      const rows = DEFAULT_TEMPLATES.map((msg, i) => ({
        tenant_id: tenantId,
        message_text: msg,
        sort_order: i,
        is_active: true,
      }));
      const { error } = await supabase.from('whatsapp_greeting_templates').insert(rows);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['greeting-templates', tenantId] });
      toast.success('Default templates added');
    },
    onError: (err: any) => {
      console.error('Seed templates error:', err);
      toast.error('Failed to seed templates: ' + (err?.message || 'Unknown error'));
    },
  });

  // Get a random active template with variables replaced
  const getRandomMessage = (contactName: string, businessName: string, agentName?: string): string => {
    const agent = agentName || 'our team';
    const activeTemplates = templates.filter(t => t.is_active);
    const replace = (msg: string) =>
      msg.replace(/\{\{name\}\}/g, contactName).replace(/\{\{biz\}\}/g, businessName).replace(/\{\{agent_name\}\}/g, agent);
    if (activeTemplates.length === 0) {
      const fallback = DEFAULT_TEMPLATES[Math.floor(Math.random() * DEFAULT_TEMPLATES.length)];
      return replace(fallback);
    }
    const picked = activeTemplates[Math.floor(Math.random() * activeTemplates.length)];
    return replace(picked.message_text);
  };

  return {
    templates,
    isLoading,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    seedDefaults,
    getRandomMessage,
    DEFAULT_TEMPLATES,
  };
}
