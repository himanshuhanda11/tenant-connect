import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Plus, Zap, Trash2, Loader2, Eye, ShoppingCart,
  Clock, Globe, Star, CreditCard, Truck, MessageSquare,
  Tag, Send, Percent, UserPlus, Bot, Package,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { toast } from 'sonner';

const TRIGGER_EVENTS = [
  { value: 'page_view_duration', label: 'Page view > X seconds', icon: Clock },
  { value: 'cart_value_above', label: 'Cart value above threshold', icon: ShoppingCart },
  { value: 'cart_no_checkout', label: 'Cart page, no checkout', icon: ShoppingCart },
  { value: 'returning_visitor', label: 'Returning visitor', icon: Eye },
  { value: 'repeat_product_view', label: 'Viewed product multiple times', icon: Package },
  { value: 'country_match', label: 'Customer from specific country', icon: Globe },
  { value: 'vip_customer', label: 'VIP customer detected', icon: Star },
  { value: 'order_delayed', label: 'Order delivery delayed', icon: Truck },
  { value: 'order_delivered', label: 'Order delivered', icon: Truck },
  { value: 'payment_failed', label: 'Payment failed', icon: CreditCard },
  { value: 'no_reply', label: 'No reply from customer', icon: MessageSquare },
];

const ACTION_TYPES = [
  { value: 'show_chat_prompt', label: 'Show Chat Prompt', icon: MessageSquare },
  { value: 'send_message', label: 'Send Automated Message', icon: Send },
  { value: 'assign_agent', label: 'Assign Agent', icon: UserPlus },
  { value: 'tag_customer', label: 'Tag Customer', icon: Tag },
  { value: 'whatsapp_cta', label: 'WhatsApp Click-to-Chat', icon: MessageSquare },
  { value: 'send_discount', label: 'Send Discount Code', icon: Percent },
  { value: 'product_recommendation', label: 'Product Recommendation', icon: Package },
  { value: 'ai_response', label: 'AI Auto-Response', icon: Bot },
];

interface AutomationRule {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  trigger_event: string;
  conditions: Record<string, unknown>[];
  actions: Record<string, unknown>[];
  cooldown_minutes: number;
  stats_executions: number;
  stats_conversions: number;
  created_at: string;
}

export default function ShopifyAutomations() {
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();
  const { currentTenant } = useTenant();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [newRule, setNewRule] = useState({
    name: '', trigger_event: 'cart_no_checkout', action: 'show_chat_prompt',
    cooldown_minutes: 60, description: '',
  });

  const { data: rules = [], isLoading } = useQuery({
    queryKey: ['shopify-automations', storeId],
    queryFn: async () => {
      if (!storeId || !currentTenant) return [];
      const { data, error } = await (supabase as any)
        .from('shopify_automation_rules')
        .select('*')
        .eq('store_id', storeId)
        .eq('tenant_id', currentTenant.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as AutomationRule[];
    },
    enabled: !!storeId && !!currentTenant,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!currentTenant || !storeId) throw new Error('Missing context');
      const { error } = await (supabase as any)
        .from('shopify_automation_rules')
        .insert({
          tenant_id: currentTenant.id,
          store_id: storeId,
          name: newRule.name,
          description: newRule.description || null,
          trigger_event: newRule.trigger_event,
          actions: [{ type: newRule.action }],
          cooldown_minutes: newRule.cooldown_minutes,
          is_active: true,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopify-automations'] });
      toast.success('Automation created');
      setShowCreate(false);
      setNewRule({ name: '', trigger_event: 'cart_no_checkout', action: 'show_chat_prompt', cooldown_minutes: 60, description: '' });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await (supabase as any)
        .from('shopify_automation_rules')
        .update({ is_active })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shopify-automations'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from('shopify_automation_rules')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopify-automations'] });
      toast.success('Automation deleted');
    },
  });

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(`/app/integrations/shopify/${storeId}`)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Shopify Automations</h1>
              <p className="text-sm text-muted-foreground">Create rules to automate engagement and support</p>
            </div>
          </div>
          <Dialog open={showCreate} onOpenChange={setShowCreate}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" /> New Automation</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Create Automation</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-2">
                <div>
                  <Label>Name</Label>
                  <Input value={newRule.name} onChange={e => setNewRule(p => ({ ...p, name: e.target.value }))} placeholder="e.g. High Intent Cart Prompt" />
                </div>
                <div>
                  <Label>When this happens...</Label>
                  <Select value={newRule.trigger_event} onValueChange={v => setNewRule(p => ({ ...p, trigger_event: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {TRIGGER_EVENTS.map(t => (
                        <SelectItem key={t.value} value={t.value}>
                          <div className="flex items-center gap-2">
                            <t.icon className="h-3.5 w-3.5" />
                            {t.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Then do this...</Label>
                  <Select value={newRule.action} onValueChange={v => setNewRule(p => ({ ...p, action: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ACTION_TYPES.map(a => (
                        <SelectItem key={a.value} value={a.value}>
                          <div className="flex items-center gap-2">
                            <a.icon className="h-3.5 w-3.5" />
                            {a.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Cooldown (minutes)</Label>
                  <Input type="number" value={newRule.cooldown_minutes} onChange={e => setNewRule(p => ({ ...p, cooldown_minutes: parseInt(e.target.value) || 0 }))} />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea value={newRule.description} onChange={e => setNewRule(p => ({ ...p, description: e.target.value }))} rows={2} placeholder="Optional..." />
                </div>
                <Button className="w-full" onClick={() => createMutation.mutate()} disabled={!newRule.name.trim() || createMutation.isPending}>
                  {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Create Automation
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold">{rules.filter(r => r.is_active).length}</p>
              <p className="text-xs text-muted-foreground">Active</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold">{rules.reduce((s, r) => s + r.stats_executions, 0)}</p>
              <p className="text-xs text-muted-foreground">Executions</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-green-600">{rules.reduce((s, r) => s + r.stats_conversions, 0)}</p>
              <p className="text-xs text-muted-foreground">Conversions</p>
            </CardContent>
          </Card>
        </div>

        {/* Rules List */}
        {isLoading ? (
          <Card><CardContent className="p-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></CardContent></Card>
        ) : rules.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Zap className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-30" />
              <h3 className="font-semibold mb-1">No automations yet</h3>
              <p className="text-sm text-muted-foreground mb-4">Build rules to automate customer engagement</p>
              <Button onClick={() => setShowCreate(true)}><Plus className="h-4 w-4 mr-2" /> Create Automation</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {rules.map(rule => {
              const trigger = TRIGGER_EVENTS.find(t => t.value === rule.trigger_event);
              const actions = (rule.actions || []) as Array<{ type: string }>;
              const actionLabel = actions[0] ? ACTION_TYPES.find(a => a.value === actions[0].type)?.label || actions[0].type : '—';
              return (
                <Card key={rule.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Switch checked={rule.is_active} onCheckedChange={v => toggleMutation.mutate({ id: rule.id, is_active: v })} />
                        <div>
                          <h4 className="font-medium">{rule.name}</h4>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <Badge variant="outline" className="text-xs">
                              {trigger?.icon && <trigger.icon className="h-3 w-3 mr-1" />}
                              {trigger?.label || rule.trigger_event}
                            </Badge>
                            <span className="text-xs text-muted-foreground">→</span>
                            <Badge variant="secondary" className="text-xs">{actionLabel}</Badge>
                            <span className="text-xs text-muted-foreground">• {rule.cooldown_minutes}min cooldown</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right text-sm">
                          <p>{rule.stats_executions} runs</p>
                          <p className="text-green-600">{rule.stats_conversions} conversions</p>
                        </div>
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteMutation.mutate(rule.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
