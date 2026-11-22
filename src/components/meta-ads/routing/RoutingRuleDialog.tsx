import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { CheckCircle2, ChevronDown, Loader2, Search, Settings2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { useTemplates } from '@/hooks/useTemplates';
import { useTags } from '@/hooks/useTags';
import { useAutomationWorkflows } from '@/hooks/useAutomationWorkflows';
import { adSourceLabel, type WhatsAppAdSource } from '@/hooks/useWhatsAppAdSources';
import type { MetaAdAutomation } from '@/hooks/useMetaAdAutomations';
import type { useMetaAdAccounts } from '@/hooks/useMetaAdAccounts';
import type { TeamMember } from '@/types/team';
import { assignableMembers, initials, memberName } from '@/lib/metaAdRouting';
import { getTargetAdIds } from '@/lib/metaAdTargeting';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

type Campaign = ReturnType<typeof useMetaAdAccounts>['campaigns'][number];
type AssignMode = 'roundrobin' | 'agent' | 'team' | 'none';

interface RoutingRuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: MetaAdAutomation | null;
  presetAdIds?: string[];
  adSources: WhatsAppAdSource[];
  campaigns: Campaign[];
  connectedAccountId: string | null;
  members: TeamMember[];
  teams: Array<{ id: string; name: string }>;
  /** Which existing rule currently decides each ad (by ad ID). */
  currentRuleByAdId: Map<string, MetaAdAutomation>;
  onSaved: () => void;
}

function Step({ n, title, hint, children }: { n: number; title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2.5">
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{n}</span>
        <div>
          <h3 className="text-sm font-semibold leading-6">{title}</h3>
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
      </div>
      <div className="pl-0 sm:pl-8">{children}</div>
    </section>
  );
}

export function RoutingRuleDialog({
  open, onOpenChange, editing, presetAdIds, adSources, campaigns, connectedAccountId, members, teams, currentRuleByAdId, onSaved,
}: RoutingRuleDialogProps) {
  const { currentTenant } = useTenant();
  const { templates } = useTemplates();
  const { tags } = useTags();
  const { workflows } = useAutomationWorkflows();
  const agents = useMemo(() => assignableMembers(members), [members]);

  const [name, setName] = useState('');
  const [trigger, setTrigger] = useState('ad_click');
  const [adIds, setAdIds] = useState<string[]>([]);
  const [campaignIds, setCampaignIds] = useState<string[]>([]);
  const [mode, setMode] = useState<AssignMode>('roundrobin');
  const [agentIds, setAgentIds] = useState<string[]>([]);
  const [teamId, setTeamId] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [tagId, setTagId] = useState('');
  const [workflowId, setWorkflowId] = useState('');
  const [extrasOpen, setExtrasOpen] = useState(false);
  const [adSearch, setAdSearch] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setAdSearch('');
    if (editing) {
      const actions = editing.actions || [];
      const rr = actions.find(a => a.type === 'assign_agents_roundrobin');
      const one = actions.find(a => a.type === 'assign_agent');
      const team = actions.find(a => a.type === 'assign_team');
      setName(editing.name);
      setTrigger(editing.trigger_type);
      setAdIds(getTargetAdIds(editing.trigger_conditions));
      setCampaignIds(editing.trigger_campaign_ids || []);
      setMode(rr ? 'roundrobin' : one ? 'agent' : team ? 'team' : 'none');
      setAgentIds(rr ? ((rr.agent_ids as string[]) || []) : one ? [String(one.agent_id)] : []);
      setTeamId(team ? String(team.team_id || '') : '');
      const tpl = actions.find(a => a.type === 'send_template');
      const tag = actions.find(a => a.type === 'add_tag');
      const wf = actions.find(a => a.type === 'start_workflow');
      setTemplateId(tpl ? String(tpl.template_id || '') : '');
      setTagId(tag ? String(tag.tag_id || '') : '');
      setWorkflowId(wf ? String(wf.workflow_id || '') : '');
      setExtrasOpen(!!(tpl || tag || wf));
    } else {
      setName('');
      setTrigger('ad_click');
      setAdIds(presetAdIds || []);
      setCampaignIds([]);
      setMode(agents.length >= 2 ? 'roundrobin' : 'agent');
      setAgentIds([]);
      setTeamId('');
      setTemplateId('');
      setTagId('');
      setWorkflowId('');
      setExtrasOpen(false);
    }
  }, [open, editing, presetAdIds, agents.length]);

  const approvedTemplates = templates.filter(t => t.status === 'APPROVED');
  const usableWorkflows = workflows.filter(w => w.status === 'active' || w.status === 'draft');
  const visibleAds = adSources.filter(ad => {
    const q = adSearch.trim().toLowerCase();
    return !q || adSourceLabel(ad).toLowerCase().includes(q) || ad.ad_id.includes(q) || (ad.headline || '').toLowerCase().includes(q);
  });
  const knownAdIds = new Set(adSources.map(a => a.ad_id));
  const hiddenSelected = adIds.filter(id => !knownAdIds.has(id)).length;

  const toggle = (list: string[], value: string) => (list.includes(value) ? list.filter(v => v !== value) : [...list, value]);

  const pickAgent = (id: string) => {
    if (mode === 'agent') setAgentIds([id]);
    else setAgentIds(prev => toggle(prev, id));
  };

  const autoName = () => {
    const labels = adIds.map(id => {
      const ad = adSources.find(a => a.ad_id === id);
      return ad ? adSourceLabel(ad) : `Ad …${id.slice(-6)}`;
    });
    if (labels.length === 0 && campaignIds.length === 0) return 'Every ad → agents';
    if (labels.length === 0) return `${campaignIds.length} campaign(s) → agents`;
    return labels.length === 1 ? `${labels[0]} → agents` : `${labels[0]} +${labels.length - 1} → agents`;
  };

  const buildActions = () => {
    const actions: Record<string, unknown>[] = [];
    if (templateId) {
      const tpl = templates.find(t => t.id === templateId);
      actions.push({ type: 'send_template', label: `Send: ${tpl?.name || 'Template'}`, template_id: templateId, template_name: tpl?.name || null });
    }
    if (tagId) {
      const tag = tags.find(t => t.id === tagId);
      actions.push({ type: 'add_tag', label: `Tag: ${tag?.name || 'Tag'}`, tag_id: tagId, tag_name: tag?.name || null });
    }
    if (mode === 'agent' && agentIds[0]) {
      const m = agents.find(a => a.user_id === agentIds[0]);
      actions.push({ type: 'assign_agent', label: `Assign to ${m ? memberName(m) : 'Agent'}`, agent_id: agentIds[0] });
    }
    if (mode === 'team' && teamId) {
      const team = teams.find(t => t.id === teamId);
      actions.push({ type: 'assign_team', label: `Team: ${team?.name || 'Team'}`, team_id: teamId });
    }
    if (mode === 'roundrobin' && agentIds.length >= 2) {
      const names = agentIds.map(id => {
        const m = agents.find(a => a.user_id === id);
        return m ? memberName(m) : 'Agent';
      });
      actions.push({ type: 'assign_agents_roundrobin', label: `Round Robin: ${names.join(', ')}`, agent_ids: agentIds, agent_names: names });
    }
    if (workflowId) {
      const wf = workflows.find(w => w.id === workflowId);
      actions.push({ type: 'start_workflow', label: `Workflow: ${wf?.name || 'Workflow'}`, workflow_id: workflowId, workflow_name: wf?.name || null });
    }
    return actions;
  };

  const handleSave = async () => {
    if (!currentTenant?.id) return;
    if (mode === 'roundrobin' && agentIds.length < 2) return void toast.error('Pick at least 2 agents to take turns');
    if (mode === 'agent' && !agentIds[0]) return void toast.error('Pick the agent who gets these leads');
    if (mode === 'team' && !teamId) return void toast.error('Pick a team');
    const actions = buildActions();
    if (actions.length === 0) return void toast.error('Choose who gets the leads, or add an extra step');

    setSaving(true);
    try {
      const payload = {
        workspace_id: currentTenant.id,
        name: name.trim() || autoName(),
        description: editing?.description ?? null,
        trigger_type: trigger,
        trigger_ad_account_id: editing?.trigger_ad_account_id ?? connectedAccountId,
        trigger_campaign_ids: campaignIds.length > 0 ? campaignIds : null,
        trigger_conditions: { ...(editing?.trigger_conditions || {}), meta_ad_ids: adIds } as never,
        actions: actions as never,
      };
      const { error } = editing
        ? await supabase.from('smeksh_meta_ad_automations').update(payload).eq('id', editing.id)
        : await supabase.from('smeksh_meta_ad_automations').insert({ ...payload, is_active: true });
      if (error) throw error;
      toast.success(editing ? 'Routing updated' : 'Routing saved — new leads will follow it');
      onOpenChange(false);
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save');
    } finally {
      setSaving(false);
    }
  };

  const modeOptions: Array<{ value: AssignMode; label: string; hint: string }> = [
    { value: 'roundrobin', label: 'Take turns', hint: 'Shared equally' },
    { value: 'agent', label: 'One agent', hint: 'All to one person' },
    { value: 'team', label: 'Team', hint: 'A saved team' },
    { value: 'none', label: 'Nobody', hint: 'Extras only' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92vh] flex-col gap-0 p-0 sm:max-w-xl">
        <DialogHeader className="border-b px-5 py-4 text-left">
          <DialogTitle className="text-base">{editing ? 'Edit lead routing' : 'Send ad leads to agents'}</DialogTitle>
          <DialogDescription className="text-xs">Choose the ads, then the agents who should get their WhatsApp leads.</DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
          <Step n={1} title="Which ads?" hint="Pick none to use this for every ad.">
            {adSources.length > 6 && (
              <div className="relative mb-2">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input value={adSearch} onChange={e => setAdSearch(e.target.value)} placeholder="Search ads" className="h-8 pl-8 text-xs" />
              </div>
            )}
            {adSources.length === 0 ? (
              <p className="rounded-lg border border-dashed p-3 text-xs text-muted-foreground">No ads have sent chats yet. They appear here after the first message.</p>
            ) : (
              <div className="max-h-56 space-y-1 overflow-y-auto rounded-xl border bg-muted/30 p-1.5">
                {visibleAds.map(ad => {
                  const selected = adIds.includes(ad.ad_id);
                  const current = currentRuleByAdId.get(ad.ad_id);
                  const takenByOther = current && current.id !== editing?.id;
                  return (
                    <label key={ad.id} className={cn('flex cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 transition-colors', selected ? 'bg-primary/10' : 'hover:bg-background')}>
                      <Checkbox checked={selected} onCheckedChange={() => setAdIds(prev => toggle(prev, ad.ad_id))} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{adSourceLabel(ad)}</p>
                        <p className="truncate text-[11px] text-muted-foreground">
                          Ad …{ad.ad_id.slice(-6)} · {ad.leads_count.toLocaleString()} leads
                          {takenByOther ? ` · now goes to “${current.name}”` : ''}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
            {hiddenSelected > 0 && <p className="mt-1 text-[11px] text-muted-foreground">+{hiddenSelected} older ad(s) also selected</p>}

            {campaigns.length > 0 && (
              <div className="mt-3 space-y-1.5">
                <Label className="text-xs text-muted-foreground">Or whole Facebook campaigns</Label>
                <div className="max-h-40 space-y-1 overflow-y-auto rounded-xl border bg-muted/30 p-1.5">
                  {campaigns.map(c => (
                    <label key={c.id} className={cn('flex cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2', campaignIds.includes(c.id) ? 'bg-primary/10' : 'hover:bg-background')}>
                      <Checkbox checked={campaignIds.includes(c.id)} onCheckedChange={() => setCampaignIds(prev => toggle(prev, c.id))} />
                      <span className="min-w-0 flex-1 truncate text-sm">{c.campaign_name}</span>
                      <Badge variant={c.status === 'active' ? 'default' : 'secondary'} className="shrink-0 text-[10px] capitalize">{c.status === 'active' ? 'Live' : c.status}</Badge>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </Step>

          <Step n={2} title="Who gets the leads?">
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
              {modeOptions.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { setMode(opt.value); if (opt.value === 'agent') setAgentIds(ids => ids.slice(0, 1)); }}
                  className={cn('rounded-xl border-2 px-2 py-2 text-left transition-colors', mode === opt.value ? 'border-primary bg-primary/10' : 'border-border hover:bg-muted/50')}
                >
                  <p className={cn('text-xs font-semibold', mode === opt.value && 'text-primary')}>{opt.label}</p>
                  <p className="text-[10px] text-muted-foreground">{opt.hint}</p>
                </button>
              ))}
            </div>

            {(mode === 'roundrobin' || mode === 'agent') && (
              <div className="mt-3">
                <div className="mb-1.5 flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    {mode === 'roundrobin' ? `${agentIds.length} selected · each new lead goes to the next agent` : 'Pick one agent'}
                  </p>
                  {mode === 'roundrobin' && agents.length > 1 && (
                    <Button type="button" variant="ghost" size="sm" className="h-6 px-2 text-[11px]" onClick={() => setAgentIds(agentIds.length === agents.length ? [] : agents.map(a => a.user_id))}>
                      {agentIds.length === agents.length ? 'Clear' : 'Select all'}
                    </Button>
                  )}
                </div>
                <div className="grid max-h-56 grid-cols-1 gap-1 overflow-y-auto rounded-xl border bg-muted/30 p-1.5 sm:grid-cols-2">
                  {agents.map(agent => {
                    const selected = agentIds.includes(agent.user_id);
                    const agentName = memberName(agent);
                    return (
                      <button
                        key={agent.id}
                        type="button"
                        onClick={() => pickAgent(agent.user_id)}
                        className={cn('flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors', selected ? 'bg-primary/10 ring-1 ring-primary/30' : 'hover:bg-background')}
                      >
                        <Avatar className="h-7 w-7">
                          {agent.profile?.avatar_url ? <AvatarImage src={agent.profile.avatar_url} alt={agentName} /> : null}
                          <AvatarFallback className="bg-primary/10 text-[10px] font-semibold text-primary">{initials(agentName)}</AvatarFallback>
                        </Avatar>
                        <span className="min-w-0 flex-1 truncate text-sm">{agentName}</span>
                        {selected && <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />}
                      </button>
                    );
                  })}
                  {agents.length === 0 && <p className="p-2 text-xs text-muted-foreground">Add agents in Team first.</p>}
                </div>
              </div>
            )}

            {mode === 'team' && (
              <Select value={teamId} onValueChange={setTeamId}>
                <SelectTrigger className="mt-3"><SelectValue placeholder="Pick a team" /></SelectTrigger>
                <SelectContent>
                  {teams.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                  {teams.length === 0 && <SelectItem value="__none" disabled>Create a team in Settings first</SelectItem>}
                </SelectContent>
              </Select>
            )}
          </Step>

          <Step n={3} title="Name (optional)">
            <Input value={name} onChange={e => setName(e.target.value)} placeholder={autoName()} maxLength={120} />
          </Step>

          <Collapsible open={extrasOpen} onOpenChange={setExtrasOpen}>
            <CollapsibleTrigger asChild>
              <button type="button" className="flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-left text-sm hover:bg-muted/50">
                <span className="flex items-center gap-2"><Settings2 className="h-4 w-4 text-muted-foreground" />Extra steps <span className="text-xs text-muted-foreground">(optional)</span></span>
                <ChevronDown className={cn('h-4 w-4 text-muted-foreground transition-transform', extrasOpen && 'rotate-180')} />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 pt-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Run when</Label>
                <Select value={trigger} onValueChange={setTrigger}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ad_click">Someone messages from an ad</SelectItem>
                    <SelectItem value="first_message">Any first message</SelectItem>
                    <SelectItem value="new_lead">Any new lead</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Send a WhatsApp template</Label>
                <Select value={templateId || '__none'} onValueChange={v => setTemplateId(v === '__none' ? '' : v)}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none">Don’t send</SelectItem>
                    {approvedTemplates.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Add a tag</Label>
                <Select value={tagId || '__none'} onValueChange={v => setTagId(v === '__none' ? '' : v)}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none">No tag</SelectItem>
                    {tags.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Start a workflow</Label>
                <Select value={workflowId || '__none'} onValueChange={v => setWorkflowId(v === '__none' ? '' : v)}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none">No workflow</SelectItem>
                    {usableWorkflows.map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        <DialogFooter className="gap-2 border-t px-5 py-3 sm:gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            {editing ? 'Save changes' : 'Save routing'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
