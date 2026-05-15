import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface GreetingTemplate {
  id: string;
  tenant_id: string;
  agent_user_id: string | null;
  message_text: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export const MAX_AGENT_GREETINGS = 10;

export const DEFAULT_TEMPLATES = [
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
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const tenantId = currentTenant?.id;
  const userId = user?.id;

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['greeting-templates', tenantId, userId],
    queryFn: async () => {
      if (!tenantId || !userId) return [] as GreetingTemplate[];
      const { data, error } = await supabase
        .from('whatsapp_greeting_templates')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('agent_user_id', userId)
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return (data || []) as GreetingTemplate[];
    },
    enabled: !!tenantId && !!userId,
  });

  const addTemplate = useMutation({
    mutationFn: async (messageText: string) => {
      if (!tenantId || !userId) throw new Error('Not signed in');
      if (templates.length >= MAX_AGENT_GREETINGS) {
        throw new Error(`You can have at most ${MAX_AGENT_GREETINGS} greeting templates`);
      }
      const { error } = await supabase
        .from('whatsapp_greeting_templates')
        .insert({
          tenant_id: tenantId,
          agent_user_id: userId,
          message_text: messageText,
          sort_order: templates.length,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['greeting-templates', tenantId, userId] });
      toast.success('Greeting template added');
    },
    onError: (err: any) => toast.error(err?.message || 'Failed to add template'),
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
      queryClient.invalidateQueries({ queryKey: ['greeting-templates', tenantId, userId] });
    },
    onError: () => toast.error('Failed to update template'),
  });

  const deleteTemplate = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('whatsapp_greeting_templates').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['greeting-templates', tenantId, userId] });
      toast.success('Template deleted');
    },
    onError: () => toast.error('Failed to delete template'),
  });

  const seedDefaults = useMutation({
    mutationFn: async () => {
      if (!tenantId || !userId) throw new Error('Not signed in');
      const remaining = MAX_AGENT_GREETINGS - templates.length;
      if (remaining <= 0) return;
      const rows = DEFAULT_TEMPLATES.slice(0, remaining).map((msg, i) => ({
        tenant_id: tenantId,
        agent_user_id: userId,
        message_text: msg,
        sort_order: templates.length + i,
        is_active: true,
      }));
      const { error } = await supabase.from('whatsapp_greeting_templates').insert(rows);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['greeting-templates', tenantId, userId] });
      toast.success('Default greetings added');
    },
    onError: (err: any) => toast.error('Failed to seed templates: ' + (err?.message || 'Unknown error')),
  });

  // Get a (random) active greeting template, with variables replaced. Falls back to first DEFAULT.
  const getGreetingMessage = (contactName: string, businessName: string, agentName?: string): string => {
    const agent = agentName || 'our team';
    const replace = (msg: string) =>
      msg.replace(/\{\{name\}\}/g, contactName).replace(/\{\{biz\}\}/g, businessName).replace(/\{\{agent_name\}\}/g, agent);
    const active = templates.filter(t => t.is_active);
    if (active.length === 0) return replace(DEFAULT_TEMPLATES[0]);
    const pick = active[Math.floor(Math.random() * active.length)];
    return replace(pick.message_text);
  };

  const hasActiveGreeting = templates.some(t => t.is_active);

  return {
    templates,
    isLoading,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    seedDefaults,
    getRandomMessage: getGreetingMessage,
    hasActiveGreeting,
    DEFAULT_TEMPLATES,
    MAX_AGENT_GREETINGS,
  };
}
