import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Plus, Trash2, Zap, Bot, Clock, MessageSquare, BarChart3, Workflow, Loader2, Sparkles, Brain } from 'lucide-react';
import { useTenant } from '@/contexts/TenantContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { SEO } from '@/components/seo';
import { formatDistanceToNow } from 'date-fns';

const TRIGGERS = [
  { v: 'new_message', label: 'New message', icon: MessageSquare },
  { v: 'first_message', label: 'First message', icon: Sparkles },
  { v: 'keyword', label: 'Keyword detected', icon: Zap },
  { v: 'no_reply', label: 'No reply', icon: Clock },
  { v: 'returning_customer', label: 'Returning customer', icon: Bot },
  { v: 'outside_business_hours', label: 'Outside business hours', icon: Clock },
  { v: 'story_reply', label: 'Story reply', icon: Sparkles },
];

const ACTION_TYPES = [
  { v: 'send_text', label: 'Send text message' },
  { v: 'send_canned', label: 'Send canned reply' },
  { v: 'ai_intent', label: 'AI intent detection' },
  { v: 'qualify_lead', label: 'Qualify lead (collect fields)' },
  { v: 'assign_agent', label: 'Assign to agent' },
  { v: 'tag', label: 'Add tags' },
  { v: 'set_status', label: 'Set conversation status' },
  { v: 'handoff', label: 'Handoff to human' },
  { v: 'schedule_followup', label: 'Schedule follow-up' },
];

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

export default function InstagramAutomation() {
  const { currentTenant } = useTenant();
  const tenantId = currentTenant?.id;

  return (
    <DashboardLayout>
      <SEO title="Instagram Automation" description="Automate Instagram DMs, lead capture, and routing." />
      <div className="px-4 pt-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem><BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbLink href="/dashboard/integrations">Integrations</BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbLink href="/dashboard/integrations/instagram">Instagram</BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbPage>Automation</BreadcrumbPage></BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="p-4 space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#FCB045] grid place-items-center shadow-lg">
            <Workflow className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Instagram Automation</h1>
            <p className="text-sm text-muted-foreground">Auto-reply, qualify leads, route conversations.</p>
          </div>
        </div>

        <Tabs defaultValue="rules">
          <TabsList className="grid grid-cols-5 w-full md:w-auto">
            <TabsTrigger value="rules"><Zap className="h-3.5 w-3.5 mr-1" />Rules</TabsTrigger>
            <TabsTrigger value="canned"><MessageSquare className="h-3.5 w-3.5 mr-1" />Canned</TabsTrigger>
            <TabsTrigger value="hours"><Clock className="h-3.5 w-3.5 mr-1" />Hours</TabsTrigger>
            <TabsTrigger value="logs"><Brain className="h-3.5 w-3.5 mr-1" />Logs</TabsTrigger>
            <TabsTrigger value="analytics"><BarChart3 className="h-3.5 w-3.5 mr-1" />Analytics</TabsTrigger>
          </TabsList>
          <TabsContent value="rules"><RulesTab tenantId={tenantId} /></TabsContent>
          <TabsContent value="canned"><CannedTab tenantId={tenantId} /></TabsContent>
          <TabsContent value="hours"><HoursTab tenantId={tenantId} /></TabsContent>
          <TabsContent value="logs"><LogsTab tenantId={tenantId} /></TabsContent>
          <TabsContent value="analytics"><AnalyticsTab tenantId={tenantId} /></TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

// ============= Rules =============
function RulesTab({ tenantId }: { tenantId?: string }) {
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);

  const load = useCallback(async () => {
    if (!tenantId) return;
    setLoading(true);
    const { data } = await supabase.from('instagram_automation_rules')
      .select('*').eq('tenant_id', tenantId).order('priority');
    setRules(data || []); setLoading(false);
  }, [tenantId]);

  useEffect(() => { load(); }, [load]);

  const toggle = async (r: any) => {
    await supabase.from('instagram_automation_rules').update({ is_active: !r.is_active }).eq('id', r.id);
    load();
  };
  const remove = async (r: any) => {
    await supabase.from('instagram_automation_rules').delete().eq('id', r.id);
    load();
  };

  return (
    <Card className="mt-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Automation rules</CardTitle>
        <Button onClick={() => { setEditing(null); setOpen(true); }} className="bg-gradient-to-r from-[#833AB4] to-[#FD1D1D] text-white border-0">
          <Plus className="h-4 w-4 mr-1" />New rule
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> :
         rules.length === 0 ? <p className="text-sm text-muted-foreground">No rules yet. Create your first automation.</p> :
         <div className="space-y-2">
           {rules.map((r) => (
             <div key={r.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/40">
               <div className="min-w-0 flex-1">
                 <div className="flex items-center gap-2">
                   <span className="font-medium truncate">{r.name}</span>
                   <Badge variant="outline" className="text-[10px]">{TRIGGERS.find(t => t.v === r.trigger_type)?.label || r.trigger_type}</Badge>
                   <Badge variant="secondary" className="text-[10px]">{(r.actions || []).length} actions</Badge>
                 </div>
                 <p className="text-xs text-muted-foreground truncate">{r.description || `Run: ${r.run_count || 0}`}</p>
               </div>
               <div className="flex items-center gap-2">
                 <Switch checked={r.is_active} onCheckedChange={() => toggle(r)} />
                 <Button variant="ghost" size="sm" onClick={() => { setEditing(r); setOpen(true); }}>Edit</Button>
                 <Button variant="ghost" size="icon" onClick={() => remove(r)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
               </div>
             </div>
           ))}
         </div>}
      </CardContent>
      <RuleEditor open={open} onClose={() => setOpen(false)} onSaved={load} tenantId={tenantId} initial={editing} />
    </Card>
  );
}

function RuleEditor({ open, onClose, onSaved, tenantId, initial }: any) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [trigger, setTrigger] = useState('new_message');
  const [keywords, setKeywords] = useState('');
  const [actions, setActions] = useState<any[]>([]);
  const [priority, setPriority] = useState(100);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setName(initial?.name || '');
      setDescription(initial?.description || '');
      setTrigger(initial?.trigger_type || 'new_message');
      setKeywords((initial?.trigger_config?.keywords || []).join(', '));
      setActions(initial?.actions || [{ type: 'send_text', text: '' }]);
      setPriority(initial?.priority ?? 100);
    }
  }, [open, initial]);

  const save = async () => {
    if (!name.trim() || !tenantId) return;
    setSaving(true);
    const trigger_config: any = {};
    if (trigger === 'keyword') {
      trigger_config.keywords = keywords.split(',').map(k => k.trim()).filter(Boolean);
      trigger_config.match = 'any';
    }
    const payload = {
      tenant_id: tenantId, name, description, trigger_type: trigger,
      trigger_config, actions, priority, is_active: initial?.is_active ?? true,
    };
    const { error } = initial?.id
      ? await supabase.from('instagram_automation_rules').update(payload).eq('id', initial.id)
      : await supabase.from('instagram_automation_rules').insert(payload);
    setSaving(false);
    if (error) { toast({ title: 'Save failed', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Rule saved' });
    onSaved(); onClose();
  };

  const updateAction = (i: number, patch: any) => setActions(a => a.map((x, idx) => idx === i ? { ...x, ...patch } : x));
  const removeAction = (i: number) => setActions(a => a.filter((_, idx) => idx !== i));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initial ? 'Edit rule' : 'New automation rule'}</DialogTitle>
          <DialogDescription>Trigger and chain of actions to run automatically.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Pricing keyword auto-reply" /></div>
          <div><Label>Description</Label><Input value={description} onChange={(e) => setDescription(e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Trigger</Label>
              <Select value={trigger} onValueChange={setTrigger}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TRIGGERS.map(t => <SelectItem key={t.v} value={t.v}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Priority (lower = first)</Label><Input type="number" value={priority} onChange={(e) => setPriority(Number(e.target.value))} /></div>
          </div>
          {trigger === 'keyword' && (
            <div>
              <Label>Keywords (comma separated)</Label>
              <Input value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="price, pricing, cost" />
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Actions</Label>
              <Button variant="outline" size="sm" onClick={() => setActions(a => [...a, { type: 'send_text', text: '' }])}>
                <Plus className="h-3 w-3 mr-1" />Add action
              </Button>
            </div>
            {actions.map((a, i) => (
              <div key={i} className="border rounded-lg p-3 space-y-2 bg-muted/30">
                <div className="flex items-center gap-2">
                  <Select value={a.type} onValueChange={(v) => updateAction(i, { type: v })}>
                    <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ACTION_TYPES.map(t => <SelectItem key={t.v} value={t.v}>{t.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Button variant="ghost" size="icon" onClick={() => removeAction(i)}><Trash2 className="h-4 w-4" /></Button>
                </div>
                {a.type === 'send_text' && (
                  <Textarea value={a.text || ''} onChange={(e) => updateAction(i, { text: e.target.value })} placeholder="Reply text…" rows={2} />
                )}
                {a.type === 'send_canned' && (
                  <Input value={a.shortcut || ''} onChange={(e) => updateAction(i, { shortcut: e.target.value })} placeholder="Shortcut (e.g. /pricing)" />
                )}
                {a.type === 'tag' && (
                  <Input value={(a.tags || []).join(', ')} onChange={(e) => updateAction(i, { tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} placeholder="vip, hot-lead" />
                )}
                {a.type === 'set_status' && (
                  <Select value={a.status || 'open'} onValueChange={(v) => updateAction(i, { status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                      <SelectItem value="spam">Spam</SelectItem>
                    </SelectContent>
                  </Select>
                )}
                {a.type === 'qualify_lead' && (
                  <Input value={(a.fields || ['name','phone','email']).join(',')} onChange={(e) => updateAction(i, { fields: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} placeholder="name,phone,email,business_type" />
                )}
                {a.type === 'schedule_followup' && (
                  <div className="grid grid-cols-2 gap-2">
                    <Input type="number" value={a.minutes ?? 5} onChange={(e) => updateAction(i, { minutes: Number(e.target.value) })} placeholder="Minutes" />
                    <Input value={a.text || ''} onChange={(e) => updateAction(i, { text: e.target.value })} placeholder="Follow-up text" />
                  </div>
                )}
                {a.type === 'ai_intent' && (
                  <p className="text-xs text-muted-foreground">Detects sales / support / complaint / high_intent and stores on the lead.</p>
                )}
                {a.type === 'handoff' && (
                  <p className="text-xs text-muted-foreground">Marks the conversation as <b>pending</b> for an agent.</p>
                )}
              </div>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={saving} className="bg-gradient-to-r from-[#833AB4] to-[#FD1D1D] text-white border-0">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save rule'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============= Canned Replies =============
function CannedTab({ tenantId }: { tenantId?: string }) {
  const [items, setItems] = useState<any[]>([]);
  const [shortcut, setShortcut] = useState('');
  const [body, setBody] = useState('');
  const load = useCallback(async () => {
    if (!tenantId) return;
    const { data } = await supabase.from('instagram_canned_replies').select('*').eq('tenant_id', tenantId).order('shortcut');
    setItems(data || []);
  }, [tenantId]);
  useEffect(() => { load(); }, [load]);

  const add = async () => {
    if (!shortcut.trim() || !body.trim() || !tenantId) return;
    const { error } = await supabase.from('instagram_canned_replies').insert({ tenant_id: tenantId, shortcut: shortcut.trim(), body });
    if (error) { toast({ title: 'Failed', description: error.message, variant: 'destructive' }); return; }
    setShortcut(''); setBody(''); load();
  };
  const remove = async (id: string) => { await supabase.from('instagram_canned_replies').delete().eq('id', id); load(); };

  return (
    <Card className="mt-4">
      <CardHeader><CardTitle>Canned replies</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr_auto] gap-2">
          <Input value={shortcut} onChange={(e) => setShortcut(e.target.value)} placeholder="/pricing" />
          <Input value={body} onChange={(e) => setBody(e.target.value)} placeholder="Reply text" />
          <Button onClick={add}><Plus className="h-4 w-4 mr-1" />Add</Button>
        </div>
        <div className="space-y-1">
          {items.map((c) => (
            <div key={c.id} className="flex items-center justify-between p-2 border rounded">
              <div className="min-w-0">
                <Badge variant="outline" className="mr-2">{c.shortcut}</Badge>
                <span className="text-sm">{c.body}</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => remove(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div>
          ))}
          {items.length === 0 && <p className="text-sm text-muted-foreground">No canned replies yet.</p>}
        </div>
      </CardContent>
    </Card>
  );
}

// ============= Business Hours =============
function HoursTab({ tenantId }: { tenantId?: string }) {
  const [bh, setBh] = useState<any>({ enabled: false, timezone: 'UTC', weekly: {}, away_message: '' });
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (!tenantId) return;
    supabase.from('instagram_business_hours').select('*').eq('tenant_id', tenantId).maybeSingle()
      .then(({ data }) => { if (data) setBh(data); });
  }, [tenantId]);
  const setDay = (d: string, patch: any) =>
    setBh((b: any) => ({ ...b, weekly: { ...b.weekly, [d]: { ...(b.weekly?.[d] || { open: '09:00', close: '18:00', enabled: false }), ...patch } } }));

  const save = async () => {
    if (!tenantId) return;
    setSaving(true);
    const { error } = await supabase.from('instagram_business_hours').upsert({ ...bh, tenant_id: tenantId });
    setSaving(false);
    if (error) toast({ title: 'Save failed', description: error.message, variant: 'destructive' });
    else toast({ title: 'Saved' });
  };

  return (
    <Card className="mt-4">
      <CardHeader><CardTitle>Business hours</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-3"><Switch checked={!!bh.enabled} onCheckedChange={(v) => setBh({ ...bh, enabled: v })} /><Label>Enable business hours</Label></div>
        <div><Label>Timezone (IANA)</Label><Input value={bh.timezone || 'UTC'} onChange={(e) => setBh({ ...bh, timezone: e.target.value })} /></div>
        <div className="space-y-1">
          {DAYS.map(d => {
            const cfg = bh.weekly?.[d] || { open: '09:00', close: '18:00', enabled: false };
            return (
              <div key={d} className="grid grid-cols-[60px_60px_1fr_1fr] gap-2 items-center">
                <span className="uppercase text-sm font-medium">{d}</span>
                <Switch checked={!!cfg.enabled} onCheckedChange={(v) => setDay(d, { enabled: v })} />
                <Input type="time" value={cfg.open} onChange={(e) => setDay(d, { open: e.target.value })} />
                <Input type="time" value={cfg.close} onChange={(e) => setDay(d, { close: e.target.value })} />
              </div>
            );
          })}
        </div>
        <div><Label>Away message</Label><Textarea value={bh.away_message || ''} onChange={(e) => setBh({ ...bh, away_message: e.target.value })} placeholder="Thanks for messaging! We'll respond during business hours." /></div>
        <Button onClick={save} disabled={saving} className="bg-gradient-to-r from-[#833AB4] to-[#FD1D1D] text-white border-0">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
        </Button>
      </CardContent>
    </Card>
  );
}

// ============= Logs =============
function LogsTab({ tenantId }: { tenantId?: string }) {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    if (!tenantId) return;
    setLoading(true);
    const { data } = await supabase.from('instagram_automation_logs').select('*').eq('tenant_id', tenantId).order('created_at', { ascending: false }).limit(100);
    setLogs(data || []); setLoading(false);
  }, [tenantId]);
  useEffect(() => { load(); }, [load]);

  return (
    <Card className="mt-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Execution logs</CardTitle>
        <Button variant="outline" size="sm" onClick={load}>Refresh</Button>
      </CardHeader>
      <CardContent>
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> :
         logs.length === 0 ? <p className="text-sm text-muted-foreground">No logs yet.</p> :
         <div className="space-y-1 text-sm">
           {logs.map(l => (
             <div key={l.id} className="grid grid-cols-[100px_120px_1fr_80px] gap-2 p-2 border-b">
               <Badge variant={l.status === 'failed' ? 'destructive' : l.status === 'executed' ? 'default' : 'secondary'}>{l.status}</Badge>
               <span className="text-muted-foreground text-xs">{l.trigger_type}</span>
               <span className="text-xs truncate">{JSON.stringify(l.detail)}</span>
               <span className="text-xs text-muted-foreground text-right">{formatDistanceToNow(new Date(l.created_at), { addSuffix: true })}</span>
             </div>
           ))}
         </div>}
      </CardContent>
    </Card>
  );
}

// ============= Analytics =============
function AnalyticsTab({ tenantId }: { tenantId?: string }) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!tenantId) return;
    (async () => {
      setLoading(true);
      const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const [{ count: msgs }, { count: convs }, { count: leads }, { data: rules }] = await Promise.all([
        supabase.from('instagram_messages').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId).gte('created_at', since),
        supabase.from('instagram_conversations').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId).gte('created_at', since),
        supabase.from('instagram_lead_qualifications').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId).eq('status', 'complete'),
        supabase.from('instagram_automation_rules').select('name, run_count').eq('tenant_id', tenantId).order('run_count', { ascending: false }).limit(5),
      ]);
      setStats({ msgs, convs, leads, rules });
      setLoading(false);
    })();
  }, [tenantId]);

  if (loading) return <Loader2 className="h-5 w-5 animate-spin mt-4" />;
  if (!stats) return null;
  const conversion = stats.convs ? ((stats.leads / stats.convs) * 100).toFixed(1) : '0';

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
      <KPI label="Messages (30d)" value={stats.msgs || 0} />
      <KPI label="Conversations (30d)" value={stats.convs || 0} />
      <KPI label="Qualified leads" value={stats.leads || 0} />
      <KPI label="Conversion %" value={`${conversion}%`} />
      <Card className="md:col-span-4">
        <CardHeader><CardTitle>Top rules</CardTitle></CardHeader>
        <CardContent>
          {(stats.rules || []).length === 0 ? <p className="text-sm text-muted-foreground">No rule runs yet.</p> :
           <div className="space-y-1">
             {stats.rules.map((r: any) => (
               <div key={r.name} className="flex items-center justify-between p-2 border-b">
                 <span className="text-sm">{r.name}</span>
                 <Badge variant="outline">{r.run_count} runs</Badge>
               </div>
             ))}
           </div>}
        </CardContent>
      </Card>
    </div>
  );
}

function KPI({ label, value }: { label: string; value: any }) {
  return (
    <Card className="overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-[#833AB4]/5 via-transparent to-[#FCB045]/5" />
      <CardContent className="p-4 relative">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-2xl font-bold mt-1">{value}</div>
      </CardContent>
    </Card>
  );
}
