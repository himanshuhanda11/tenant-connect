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
  `Hi {{name}}! 👋 This is {{agent_name}} from {{biz}}. Thank you for your enquiry — we're a trusted and registered company. How can we help you today?`,
  `Hello {{name}}! 🌍 This is {{agent_name}} at {{biz}}. We received your enquiry. As a fully registered and trusted agency, we're here to guide you every step of the way. Shall we schedule a quick consultation?`,
  `Dear {{name}}, thank you for showing interest! 🇪🇺 I'm {{agent_name}} from {{biz}} — we have a proven track record. We'd be happy to discuss the best opportunities available for you.`,
  `Hi {{name}}! 🙌 This is {{agent_name}} from {{biz}} — one of the most trusted & registered firms. Let us help you explore the right options. When is a good time to talk?`,
  `Hello {{name}}! ✈️ Thanks for reaching out. I'm {{agent_name}} from {{biz}}, a fully registered agency. We specialize in helping people like you. Let's discuss your needs!`,
  `Hi {{name}}! 🌟 I'm {{agent_name}} at {{biz}} — a certified and genuine company that has helped hundreds of clients. Let's get started on your journey!`,
  `Dear {{name}}, welcome to {{biz}}! 🏢 I'm {{agent_name}}, and I'm delighted you've reached out. Our team will provide genuine guidance and transparent service. How may we assist you?`,
  `Hi {{name}}! 💼 This is {{agent_name}} from {{biz}}, a licensed and reputed firm. We believe in 100% transparency and genuine service. Ready to take the next step?`,
  `Hello {{name}}! 🤝 I'm {{agent_name}} from {{biz}}. Your interest means a lot to us. We're committed to providing authentic and professional services. Let's connect!`,
  `Hi {{name}}! 🚀 Welcome aboard! I'm {{agent_name}} from {{biz}} — here to help you achieve your goals. What questions do you have for us?`,
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
