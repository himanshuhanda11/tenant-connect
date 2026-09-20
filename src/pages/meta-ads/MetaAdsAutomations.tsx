import { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTemplates } from '@/hooks/useTemplates';
import { useTags } from '@/hooks/useTags';
import { useAutomationWorkflows } from '@/hooks/useAutomationWorkflows';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import {
  Zap,
  Plus,
  Play,
  Pause,
  Pencil,
  Trash2,
  MessageSquare,
  Tag,
  Users,
  UserPlus,
  GitBranch,
  Clock,
  TrendingUp,
  CheckCircle2,
  Target,
  Loader2,
  ArrowDown,
  ArrowRight,
  RefreshCw,
  Search,
  Megaphone,
  MousePointerClick,
  Radio,
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { useMetaAdAccounts } from '@/hooks/useMetaAdAccounts';
import { useTeamMembers, useTeams } from '@/hooks/useTeam';

interface DbAutomation {
  id: string;
  workspace_id: string;
  name: string;
  description: string | null;
  trigger_type: string;
  trigger_ad_account_id: string | null;
  trigger_campaign_ids: string[] | null;
  trigger_conditions: Record<string, unknown>;
  actions: Record<string, unknown>[];
  executions_count: number;
  last_executed_at: string | null;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

const TRIGGER_LABELS: Record<string, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  new_lead: { label: 'New Lead from Ad', icon: TrendingUp },
  first_message: { label: 'First Message After Ad', icon: MessageSquare },
  ad_click: { label: 'Ad Click', icon: Zap },
};

const ACTION_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  send_template: MessageSquare,
  add_tag: Tag,
  assign_agent: UserPlus,
  assign_team: Users,
  assign_agents_roundrobin: Users,
  start_workflow: GitBranch,
  wait: Clock,
  start_sla: Clock,
  notify: Zap,
};

export default function MetaAdsAutomations() {
  const { currentTenant } = useTenant();
  const { campaigns, connectedAccounts, refetch: refetchMetaAds } = useMetaAdAccounts();
  const { members } = useTeamMembers();
  const { teams } = useTeams();
  const { templates } = useTemplates();
  const { tags } = useTags();
  const { workflows } = useAutomationWorkflows();

  const [automations, setAutomations] = useState<DbAutomation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingAutomation, setEditingAutomation] = useState<DbAutomation | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [campaignSearch, setCampaignSearch] = useState('');
  const [campaignStatus, setCampaignStatus] = useState<'all' | 'active' | 'off'>('all');
  const [syncing, setSyncing] = useState(false);

  // Form state
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formTrigger, setFormTrigger] = useState('new_lead');
  const [formCampaignIds, setFormCampaignIds] = useState<string[]>([]);
  const [formAssignMode, setFormAssignMode] = useState<'none' | 'agent' | 'team' | 'roundrobin'>('none');
  const [formAssignAgent, setFormAssignAgent] = useState('');
  const [formAssignTeam, setFormAssignTeam] = useState('');
  const [formRoundRobinAgents, setFormRoundRobinAgents] = useState<string[]>([]);
  const [formSendTemplate, setFormSendTemplate] = useState(true);
  const [formSelectedTemplateId, setFormSelectedTemplateId] = useState('');
  const [formAddTag, setFormAddTag] = useState(false);
  const [formSelectedTagId, setFormSelectedTagId] = useState('');
  const [formStartWorkflow, setFormStartWorkflow] = useState(false);
  const [formSelectedWorkflowId, setFormSelectedWorkflowId] = useState('');

  const fetchAutomations = useCallback(async () => {
    if (!currentTenant?.id) return;
    try {
      const { data, error } = await supabase
        .from('smeksh_meta_ad_automations')
        .select('*')
        .eq('workspace_id', currentTenant.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setAutomations((data || []) as unknown as DbAutomation[]);
    } catch (err) {
      console.error('Error fetching automations:', err);
    } finally {
      setLoading(false);
    }
  }, [currentTenant?.id]);

  useEffect(() => { fetchAutomations(); }, [fetchAutomations]);

  useEffect(() => {
    const workspaceId = currentTenant?.id;
    if (!workspaceId) return;
    const channel = supabase
      .channel(`meta-automations-live-${workspaceId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'smeksh_meta_ad_automations', filter: `workspace_id=eq.${workspaceId}` }, () => {
        void fetchAutomations();
      })
      .subscribe();
    const interval = window.setInterval(() => void fetchAutomations(), 30_000);
    const onFocus = () => void fetchAutomations();
    window.addEventListener('focus', onFocus);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', onFocus);
      void supabase.removeChannel(channel);
    };
  }, [currentTenant?.id, fetchAutomations]);

  const handleMetaSync = async () => {
    if (!currentTenant?.id) return;
    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('meta-ads-sync', { body: { tenantId: currentTenant.id } });
      if (error) throw error;
      if (data?.error && !data?.success) throw new Error(data.error);
      await refetchMetaAds();
      toast.success(`Updated ${data?.synced || 0} campaigns from Meta`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not refresh Meta Ads');
    } finally {
      setSyncing(false);
    }
  };

  const getCampaignAds = (campaign: typeof campaigns[number]) => {
    const raw = campaign.raw_meta_data as { ads?: Array<{ id?: string; name?: string; status?: string; effective_status?: string; adset_name?: string }> } | null;
    if (raw?.ads?.length) return raw.ads;
    return campaign.ad_name ? [{ id: campaign.meta_ad_id || campaign.id, name: campaign.ad_name, status: campaign.status }] : [];
  };

  const getCampaignDisplayName = (campaign: typeof campaigns[number]) => {
    const ads = getCampaignAds(campaign);
    if (ads.length === 1) return ads[0].name || campaign.campaign_name;
    if (ads.length > 1) return `${ads[0].name || campaign.campaign_name} +${ads.length - 1}`;
    return campaign.campaign_name;
  };

  const normalizedStatus = (status?: string | null) => (status || '').toLowerCase();
  const isActiveCampaign = (campaign: typeof campaigns[number]) => normalizedStatus(campaign.status) === 'active';
  const campaignAdRows = campaigns.flatMap(campaign => {
    const ads = getCampaignAds(campaign);
    if (ads.length === 0) {
      return [{
        id: campaign.id,
        name: campaign.ad_name || campaign.campaign_name,
        status: campaign.status,
        campaign,
      }];
    }
    return ads.map((ad, index) => ({
      id: ad.id || `${campaign.id}-${index}`,
      name: ad.name || campaign.campaign_name,
      status: ad.effective_status || ad.status || campaign.status,
      campaign,
    }));
  });
  const isActiveAd = (status?: string | null) => normalizedStatus(status) === 'active';
  const activeAds = campaignAdRows.filter(ad => isActiveAd(ad.status));
  const inactiveAds = campaignAdRows.filter(ad => !isActiveAd(ad.status));
  const activeAutomations = automations.filter(automation => automation.is_active);
  const latestSync = campaigns.reduce<string | null>((latest, campaign) => {
    if (!campaign.last_synced_at) return latest;
    return !latest || new Date(campaign.last_synced_at) > new Date(latest) ? campaign.last_synced_at : latest;
  }, null);

  useEffect(() => {
    const workspaceId = currentTenant?.id;
    if (!workspaceId || connectedAccounts.length === 0) return;

    const syncInBackground = async () => {
      const { data, error } = await supabase.functions.invoke('meta-ads-sync', { body: { tenantId: workspaceId } });
      if (!error && !data?.error) await refetchMetaAds();
    };

    const lastSyncTime = latestSync ? new Date(latestSync).getTime() : 0;
    if (Date.now() - lastSyncTime > 5 * 60_000) void syncInBackground();
    const interval = window.setInterval(() => void syncInBackground(), 5 * 60_000);
    return () => window.clearInterval(interval);
  }, [connectedAccounts.length, currentTenant?.id, latestSync]);

  const filteredAds = campaignAdRows
    .filter(ad => campaignStatus === 'all' || (campaignStatus === 'active' ? isActiveAd(ad.status) : !isActiveAd(ad.status)))
    .filter(ad => {
      const query = campaignSearch.trim().toLowerCase();
      if (!query) return true;
      return [ad.name, ad.campaign.campaign_name, ad.campaign.adset_name]
        .some(value => value?.toLowerCase().includes(query));
    })
    .sort((a, b) => Number(isActiveAd(b.status)) - Number(isActiveAd(a.status)) || a.name.localeCompare(b.name));

  const resetForm = () => {
    setFormName('');
    setFormDescription('');
    setFormTrigger('new_lead');
    setFormCampaignIds([]);
    setFormAssignMode('none');
    setFormAssignAgent('');
    setFormAssignTeam('');
    setFormRoundRobinAgents([]);
    setFormSendTemplate(true);
    setFormSelectedTemplateId('');
    setFormAddTag(false);
    setFormSelectedTagId('');
    setFormStartWorkflow(false);
    setFormSelectedWorkflowId('');
  };

  const populateFormFromAutomation = (auto: DbAutomation) => {
    setFormName(auto.name);
    setFormDescription(auto.description || '');
    setFormTrigger(auto.trigger_type);
    setFormCampaignIds(auto.trigger_campaign_ids || []);
    const actions = (auto.actions || []) as Record<string, unknown>[];
    
    // Restore action states
    const sendTpl = actions.find(a => a.type === 'send_template');
    setFormSendTemplate(!!sendTpl);
    setFormSelectedTemplateId((sendTpl?.template_id as string) || '');
    
    const addTag = actions.find(a => a.type === 'add_tag');
    setFormAddTag(!!addTag);
    setFormSelectedTagId((addTag?.tag_id as string) || '');
    
    const startWf = actions.find(a => a.type === 'start_workflow');
    setFormStartWorkflow(!!startWf);
    setFormSelectedWorkflowId((startWf?.workflow_id as string) || '');
    
    const assignAgent = actions.find(a => a.type === 'assign_agent');
    const assignTeam = actions.find(a => a.type === 'assign_team');
    const roundRobin = actions.find(a => a.type === 'assign_agents_roundrobin');
    
    if (roundRobin) {
      setFormAssignMode('roundrobin');
      setFormRoundRobinAgents((roundRobin.agent_ids as string[]) || []);
    } else if (assignTeam) {
      setFormAssignMode('team');
      setFormAssignTeam((assignTeam.team_id as string) || '');
    } else if (assignAgent) {
      setFormAssignMode('agent');
      setFormAssignAgent((assignAgent.agent_id as string) || '');
    } else {
      setFormAssignMode('none');
    }
  };

  const openCreate = () => {
    resetForm();
    setEditingAutomation(null);
    setShowDialog(true);
  };

  const openEdit = (auto: DbAutomation) => {
    populateFormFromAutomation(auto);
    setEditingAutomation(auto);
    setShowDialog(true);
  };

  const buildActions = () => {
    const actions: Record<string, unknown>[] = [];
    if (formSendTemplate && formSelectedTemplateId) {
      const tpl = templates.find(t => t.id === formSelectedTemplateId);
      actions.push({ type: 'send_template', label: `Send: ${tpl?.name || 'Template'}`, template_id: formSelectedTemplateId, template_name: tpl?.name || null });
    }
    if (formAddTag && formSelectedTagId) {
      const tag = tags.find(t => t.id === formSelectedTagId);
      actions.push({ type: 'add_tag', label: `Tag: ${tag?.name || 'Tag'}`, tag_id: formSelectedTagId, tag_name: tag?.name || null });
    }
    if (formAssignMode === 'agent' && formAssignAgent && formAssignAgent !== 'none') {
      const member = members.find(m => m.user_id === formAssignAgent || m.id === formAssignAgent);
      actions.push({ type: 'assign_agent', label: `Assign to ${member?.display_name || member?.profile?.full_name || 'Agent'}`, agent_id: formAssignAgent });
    }
    if (formAssignMode === 'team' && formAssignTeam && formAssignTeam !== 'none') {
      const team = teams.find(t => t.id === formAssignTeam);
      actions.push({ type: 'assign_team', label: `Team: ${team?.name || 'Team'}`, team_id: formAssignTeam });
    }
    if (formAssignMode === 'roundrobin' && formRoundRobinAgents.length >= 2) {
      const agentNames = formRoundRobinAgents.map(id => {
        const m = members.find(m => m.user_id === id || m.id === id);
        return m?.display_name || m?.profile?.full_name || 'Agent';
      });
      actions.push({ type: 'assign_agents_roundrobin', label: `Round Robin: ${agentNames.join(', ')}`, agent_ids: formRoundRobinAgents, agent_names: agentNames });
    }
    if (formStartWorkflow && formSelectedWorkflowId) {
      const wf = workflows.find(w => w.id === formSelectedWorkflowId);
      actions.push({ type: 'start_workflow', label: `Workflow: ${wf?.name || 'Workflow'}`, workflow_id: formSelectedWorkflowId, workflow_name: wf?.name || null });
    }
    return actions;
  };

  const handleSave = async () => {
    if (!currentTenant?.id || !formName.trim()) {
      toast.error('Please provide a name');
      return;
    }
    if (formSendTemplate && !formSelectedTemplateId) {
      toast.error('Please select a template');
      return;
    }
    if (formAddTag && !formSelectedTagId) {
      toast.error('Please select a tag');
      return;
    }
    if (formStartWorkflow && !formSelectedWorkflowId) {
      toast.error('Please select a workflow');
      return;
    }
    if (formAssignMode === 'roundrobin' && formRoundRobinAgents.length < 2) {
      toast.error('Select at least 2 agents for round-robin');
      return;
    }
    setSaving(true);
    try {
      const actions = buildActions();
      if (actions.length === 0) {
        toast.error('Please select at least one action');
        setSaving(false);
        return;
      }
      const adAccountId = connectedAccounts[0]?.id || null;
      const payload = {
        workspace_id: currentTenant.id,
        name: formName.trim(),
        description: formDescription.trim() || null,
        trigger_type: formTrigger,
        trigger_ad_account_id: adAccountId,
        trigger_campaign_ids: formCampaignIds.length > 0 ? formCampaignIds : null,
        trigger_conditions: {},
        actions: actions as unknown as any,
      };

      if (editingAutomation) {
        const { error } = await supabase
          .from('smeksh_meta_ad_automations')
          .update(payload)
          .eq('id', editingAutomation.id);
        if (error) throw error;
        toast.success('Automation updated');
      } else {
        const { error } = await supabase
          .from('smeksh_meta_ad_automations')
          .insert({ ...payload, is_active: true });
        if (error) throw error;
        toast.success('Automation created');
      }
      setShowDialog(false);
      setEditingAutomation(null);
      resetForm();
      await fetchAutomations();
    } catch (err: any) {
      console.error('Save automation error:', err);
      toast.error(err.message || 'Failed to save automation');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id: string, currentState: boolean) => {
    try {
      const { error } = await supabase
        .from('smeksh_meta_ad_automations')
        .update({ is_active: !currentState })
        .eq('id', id);
      if (error) throw error;
      setAutomations(prev => prev.map(a => a.id === id ? { ...a, is_active: !currentState } : a));
      toast.success(!currentState ? 'Automation activated' : 'Automation paused');
    } catch {
      toast.error('Failed to update');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('smeksh_meta_ad_automations')
        .delete()
        .eq('id', id);
      if (error) throw error;
      setAutomations(prev => prev.filter(a => a.id !== id));
      toast.success('Automation deleted');
    } catch {
      toast.error('Failed to delete');
    } finally {
      setDeleteTarget(null);
    }
  };

  const toggleCampaign = (campaignId: string) => {
    setFormCampaignIds(prev =>
      prev.includes(campaignId) ? prev.filter(c => c !== campaignId) : [...prev, campaignId]
    );
  };

  const toggleRoundRobinAgent = (agentId: string) => {
    setFormRoundRobinAgents(prev =>
      prev.includes(agentId) ? prev.filter(a => a !== agentId) : [...prev, agentId]
    );
  };

  const getActionLabel = (action: Record<string, unknown>) => {
    const type = action.type as string;
    if (type === 'assign_agent' && action.agent_id) {
      const member = members.find(m => m.user_id === action.agent_id || m.id === action.agent_id);
      return `Assign to ${member?.display_name || member?.profile?.full_name || 'Agent'}`;
    }
    if (type === 'assign_team' && action.team_id) {
      const team = teams.find(t => t.id === action.team_id);
      return `Team: ${team?.name || 'Team'}`;
    }
    if (type === 'assign_agents_roundrobin') {
      const names = (action.agent_names as string[]) || [];
      return `Round Robin: ${names.length} agents`;
    }
    return (action.label as string) || type;
  };

  return (
    <DashboardLayout>
      <div className="p-3 sm:p-6 space-y-4 sm:space-y-5 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary text-primary-foreground shadow-md">
              <Zap className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Ad Automations</h1>
              <p className="text-sm text-muted-foreground">Route ad leads to the right agents automatically</p>
            </div>
          </div>
          <div className="flex w-full gap-2 sm:w-auto">
            <Button variant="outline" onClick={handleMetaSync} disabled={syncing || connectedAccounts.length === 0} className="gap-2 flex-1 sm:flex-none">
              <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
              Refresh Meta
            </Button>
            <Button onClick={openCreate} className="gap-2 flex-1 sm:flex-none">
              <Plus className="h-4 w-4" />
              Create Automation
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4 sm:gap-3">
          {[
            { label: 'Active ads', value: activeAds.length, icon: Radio, tone: 'text-success bg-success/10' },
            { label: 'Paused / off', value: inactiveAds.length, icon: Pause, tone: 'text-warning bg-warning/10' },
            { label: 'Active automations', value: activeAutomations.length, icon: Zap, tone: 'text-primary bg-primary/10' },
            { label: 'Last Meta update', value: latestSync ? new Date(latestSync).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Not synced', icon: Clock, tone: 'text-info bg-info/10' },
          ].map(item => (
            <Card key={item.label} className="border shadow-card">
              <CardContent className="relative min-h-[76px] p-3 sm:flex sm:items-center sm:gap-3 sm:p-4">
                <div className={`absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg sm:static sm:h-9 sm:w-9 sm:shrink-0 ${item.tone}`}><item.icon className="h-4 w-4" /></div>
                <div className="min-w-0 pr-8 sm:pr-0">
                  <p className="text-[11px] leading-4 text-muted-foreground sm:text-xs">{item.label}</p>
                  <p className="mt-1 break-words text-base font-semibold leading-5 sm:text-lg" title={String(item.value)}>{item.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border shadow-card">
          <CardHeader className="p-4 pb-2">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-base"><Megaphone className="h-4 w-4 text-primary" />Live campaigns</CardTitle>
                <p className="mt-1 text-xs text-muted-foreground">Current status from your latest Meta sync. Active ads are shown first.</p>
              </div>
              <div className="flex gap-1 rounded-lg bg-muted p-1">
                {(['all', 'active', 'off'] as const).map(status => (
                  <Button key={status} type="button" variant={campaignStatus === status ? 'secondary' : 'ghost'} size="sm" onClick={() => setCampaignStatus(status)} className="h-7 px-3 text-xs capitalize">
                    {status === 'off' ? 'Paused / off' : status}
                  </Button>
                ))}
              </div>
            </div>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={campaignSearch} onChange={event => setCampaignSearch(event.target.value)} placeholder="Search ad, campaign, or ad set" className="h-9 pl-9" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            {filteredAds.length === 0 ? (
              <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                {campaigns.length === 0 ? 'No campaigns synced yet. Use Refresh Meta to load current ads.' : 'No ads match this view.'}
              </div>
            ) : (
              <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                {filteredAds.slice(0, 12).map(ad => (
                  <div key={`${ad.campaign.id}-${ad.id}`} className="flex min-w-0 items-start gap-3 rounded-lg border bg-card p-3">
                    <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${isActiveAd(ad.status) ? 'bg-success' : 'bg-muted-foreground/40'}`} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="truncate text-sm font-semibold" title={ad.name}>{ad.name}</p>
                        <Badge variant={isActiveAd(ad.status) ? 'default' : 'secondary'} className="shrink-0 text-[10px] capitalize">{normalizedStatus(ad.status).replace(/_/g, ' ') || 'unknown'}</Badge>
                      </div>
                      <p className="truncate text-xs text-muted-foreground" title={ad.campaign.campaign_name}>Campaign: {ad.campaign.campaign_name}</p>
                      <div className="mt-2 flex gap-3 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1"><MousePointerClick className="h-3 w-3" />{Number(ad.campaign.clicks || 0).toLocaleString()} campaign clicks</span>
                        <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3" />{Number(ad.campaign.leads_count || 0).toLocaleString()} leads</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Automations List */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="flex items-center gap-2 text-base">
              <GitBranch className="h-4 w-4 text-primary" />
              Your Automations
              <Badge variant="secondary" className="text-xs">{automations.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 space-y-3">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : automations.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Zap className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No automations yet</p>
                <p className="text-sm mt-1">Create your first automation to route ad leads automatically</p>
              </div>
            ) : (
              automations.map((automation) => {
                const triggerInfo = TRIGGER_LABELS[automation.trigger_type] || { label: automation.trigger_type, icon: Zap };
                const TriggerIcon = triggerInfo.icon;
                const actions = (automation.actions || []) as Record<string, unknown>[];
                  const targetedCampaigns = (automation.trigger_campaign_ids || [])
                   .map(cid => {
                     const campaign = campaigns.find(c => c.id === cid);
                     return campaign ? getCampaignDisplayName(campaign) : null;
                   })
                  .filter(Boolean);

                return (
                  <div
                    key={automation.id}
                    className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 sm:p-4 rounded-xl border bg-card hover:bg-muted/30 transition-colors"
                  >
                    <div className={`p-2 rounded-xl ${automation.is_active ? 'bg-primary/10' : 'bg-muted'} flex-shrink-0`}>
                      <TriggerIcon className={`h-4 w-4 ${automation.is_active ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold text-sm">{automation.name}</h4>
                        <Badge className={`text-[10px] ${automation.is_active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300' : ''}`} variant={automation.is_active ? 'default' : 'secondary'}>
                          {automation.is_active ? 'Active' : 'Paused'}
                        </Badge>
                      </div>
                      {automation.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{automation.description}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                        <Badge variant="outline" className="text-[10px] gap-0.5">
                          <TriggerIcon className="h-2.5 w-2.5" />
                          {triggerInfo.label}
                        </Badge>
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        {actions.slice(0, 3).map((action, idx) => {
                          const ActionIcon = ACTION_ICONS[(action.type as string)] || Zap;
                          return (
                            <Badge key={idx} variant="outline" className="text-[10px] gap-0.5">
                              <ActionIcon className="h-2.5 w-2.5" />
                              <span className="truncate max-w-[100px]">{getActionLabel(action)}</span>
                            </Badge>
                          );
                        })}
                        {actions.length > 3 && <Badge variant="outline" className="text-[10px]">+{actions.length - 3}</Badge>}
                      </div>
                      {targetedCampaigns.length > 0 && (
                        <div className="flex items-center gap-1 mt-1 flex-wrap">
                          <Target className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                          {targetedCampaigns.slice(0, 2).map((name, i) => (
                            <Badge key={i} variant="secondary" className="text-[10px]">{name}</Badge>
                          ))}
                          {targetedCampaigns.length > 2 && <Badge variant="secondary" className="text-[10px]">+{targetedCampaigns.length - 2}</Badge>}
                        </div>
                      )}
                      <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                        <span>{automation.executions_count || 0} runs</span>
                        {automation.last_executed_at && <span>Last: {new Date(automation.last_executed_at).toLocaleDateString()}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 ml-auto sm:ml-0 flex-shrink-0">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(automation)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Switch checked={automation.is_active} onCheckedChange={() => handleToggle(automation.id, automation.is_active)} />
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => setDeleteTarget(automation.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={(open) => { setShowDialog(open); if (!open) { setEditingAutomation(null); resetForm(); } }}>
        <DialogContent className="sm:max-w-lg mx-4">
          <DialogHeader>
            <DialogTitle className="text-base">{editingAutomation ? 'Edit Automation' : 'Create Automation'}</DialogTitle>
            <DialogDescription className="text-xs">Map campaigns to agents and actions</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            {/* Name & Description */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Automation Name *</Label>
              <Input placeholder="e.g., Ad A → Agent 1, 2, 3" value={formName} onChange={e => setFormName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Description</Label>
              <Textarea placeholder="What does this automation do?" rows={2} value={formDescription} onChange={e => setFormDescription(e.target.value)} />
            </div>

            {/* Trigger */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">When this happens</Label>
              <Select value={formTrigger} onValueChange={setFormTrigger}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="new_lead">New Lead from Meta Ad</SelectItem>
                  <SelectItem value="first_message">First Message After Ad Click</SelectItem>
                  <SelectItem value="ad_click">Ad Click (Immediate)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Campaign Selection */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium flex items-center gap-1.5">
                  <Target className="h-3.5 w-3.5 text-primary" />
                  From these campaigns
                </Label>
                {formCampaignIds.length > 0 && (
                  <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2" onClick={() => setFormCampaignIds([])}>
                    Clear all
                  </Button>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground">Select specific campaigns or leave empty for all</p>
              {campaigns.length > 0 ? (
                <div className="grid grid-cols-1 gap-1.5 max-h-40 overflow-y-auto border rounded-lg p-2 bg-muted/20">
                  {[...campaigns].sort((a, b) => Number(isActiveCampaign(b)) - Number(isActiveCampaign(a))).map(campaign => {
                    const isSelected = formCampaignIds.includes(campaign.id);
                    return (
                      <button
                        key={campaign.id}
                        type="button"
                        onClick={() => toggleCampaign(campaign.id)}
                        className={`flex items-center gap-2.5 p-2 rounded-lg text-left transition-all text-xs ${
                          isSelected
                            ? 'bg-primary/10 border border-primary/30 ring-1 ring-primary/20'
                            : 'hover:bg-muted/50 border border-transparent'
                        }`}
                      >
                        <div className={`h-4 w-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                          isSelected ? 'bg-primary border-primary' : 'border-muted-foreground/30'
                        }`}>
                          {isSelected && <CheckCircle2 className="h-3 w-3 text-primary-foreground" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">{getCampaignDisplayName(campaign)}</p>
                          <p className="truncate text-[10px] text-muted-foreground">Campaign: {campaign.campaign_name}{campaign.adset_name ? ` · ${campaign.adset_name}` : ''}</p>
                        </div>
                        <Badge variant={isActiveCampaign(campaign) ? 'default' : 'secondary'} className="text-[10px] flex-shrink-0 capitalize">{campaign.status}</Badge>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic p-3 border rounded-lg bg-muted/20">
                  No campaigns synced yet. Sync your Meta Ads data first.
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 py-1">
              <ArrowDown className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Then do these actions</span>
              <ArrowDown className="h-4 w-4 text-primary" />
            </div>

            {/* Actions */}
            <div className="space-y-2.5">
              {/* Send Template */}
              <div className={`rounded-lg border overflow-hidden transition-colors ${formSendTemplate ? 'border-primary/30 bg-primary/5' : ''}`}>
                <div className="flex items-center space-x-3 p-2.5">
                  <Checkbox id="action-template" checked={formSendTemplate} onCheckedChange={(v) => { setFormSendTemplate(!!v); if (!v) setFormSelectedTemplateId(''); }} />
                  <Label htmlFor="action-template" className="flex items-center gap-2 cursor-pointer text-xs sm:text-sm flex-1">
                    <MessageSquare className="h-3.5 w-3.5 text-blue-500" />
                    Send Template Message
                  </Label>
                </div>
                {formSendTemplate && (
                  <div className="px-3 pb-3">
                    <Select value={formSelectedTemplateId} onValueChange={setFormSelectedTemplateId}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select a WhatsApp template…" /></SelectTrigger>
                      <SelectContent>
                        {templates.filter(t => t.status === 'APPROVED').map(t => (
                          <SelectItem key={t.id} value={t.id}>
                            <span className="truncate">{t.name}</span>
                            <Badge variant="secondary" className="ml-2 text-[10px]">{t.category}</Badge>
                          </SelectItem>
                        ))}
                        {templates.filter(t => t.status === 'APPROVED').length === 0 && (
                          <SelectItem value="__none" disabled>No approved templates</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* Add Tag */}
              <div className={`rounded-lg border overflow-hidden transition-colors ${formAddTag ? 'border-primary/30 bg-primary/5' : ''}`}>
                <div className="flex items-center space-x-3 p-2.5">
                  <Checkbox id="action-tag" checked={formAddTag} onCheckedChange={(v) => { setFormAddTag(!!v); if (!v) setFormSelectedTagId(''); }} />
                  <Label htmlFor="action-tag" className="flex items-center gap-2 cursor-pointer text-xs sm:text-sm flex-1">
                    <Tag className="h-3.5 w-3.5 text-amber-500" />
                    Add Tag to Lead
                  </Label>
                </div>
                {formAddTag && (
                  <div className="px-3 pb-3">
                    <Select value={formSelectedTagId} onValueChange={setFormSelectedTagId}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select a tag…" /></SelectTrigger>
                      <SelectContent>
                        {tags.map(t => (
                          <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                        ))}
                        {tags.length === 0 && <SelectItem value="__none" disabled>No tags found</SelectItem>}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* Start Workflow */}
              <div className={`rounded-lg border overflow-hidden transition-colors ${formStartWorkflow ? 'border-primary/30 bg-primary/5' : ''}`}>
                <div className="flex items-center space-x-3 p-2.5">
                  <Checkbox id="action-workflow" checked={formStartWorkflow} onCheckedChange={(v) => { setFormStartWorkflow(!!v); if (!v) setFormSelectedWorkflowId(''); }} />
                  <Label htmlFor="action-workflow" className="flex items-center gap-2 cursor-pointer text-xs sm:text-sm flex-1">
                    <GitBranch className="h-3.5 w-3.5 text-violet-500" />
                    Start Automation Workflow
                  </Label>
                </div>
                {formStartWorkflow && (
                  <div className="px-3 pb-3">
                    <Select value={formSelectedWorkflowId} onValueChange={setFormSelectedWorkflowId}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select a workflow…" /></SelectTrigger>
                      <SelectContent>
                        {workflows.filter(w => w.status === 'active' || w.status === 'draft').map(w => (
                          <SelectItem key={w.id} value={w.id}>
                            {w.name} <Badge variant="secondary" className="ml-2 text-[10px]">{w.status}</Badge>
                          </SelectItem>
                        ))}
                        {workflows.filter(w => w.status === 'active' || w.status === 'draft').length === 0 && (
                          <SelectItem value="__none" disabled>No workflows found</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Assignment Mode */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-primary" />
                Assign Leads To
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {([
                  { value: 'none', label: 'No one', icon: Pause },
                  { value: 'agent', label: 'One Agent', icon: UserPlus },
                  { value: 'team', label: 'Team Group', icon: Users },
                  { value: 'roundrobin', label: 'Multi-Agent', icon: Users },
                ] as const).map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setFormAssignMode(opt.value)}
                    className={`flex flex-col items-center gap-1 p-2.5 rounded-lg border-2 transition-all text-xs ${
                      formAssignMode === opt.value
                        ? 'border-primary bg-primary/10 text-primary font-semibold'
                        : 'border-transparent bg-muted/40 text-muted-foreground hover:bg-muted/60'
                    }`}
                  >
                    <opt.icon className="h-4 w-4" />
                    {opt.label}
                  </button>
                ))}
              </div>

              {formAssignMode === 'agent' && (
                <Select value={formAssignAgent} onValueChange={setFormAssignAgent}>
                  <SelectTrigger><SelectValue placeholder="Select agent" /></SelectTrigger>
                  <SelectContent>
                    {members.map(m => (
                      <SelectItem key={m.id} value={m.user_id || m.id}>
                        {m.display_name || m.profile?.full_name || m.profile?.email || 'Agent'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {formAssignMode === 'team' && (
                <Select value={formAssignTeam} onValueChange={setFormAssignTeam}>
                  <SelectTrigger><SelectValue placeholder="Select team group" /></SelectTrigger>
                  <SelectContent>
                    {teams.map(t => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                    {teams.length === 0 && <SelectItem value="__none" disabled>Create a team in Settings first</SelectItem>}
                  </SelectContent>
                </Select>
              )}

              {formAssignMode === 'roundrobin' && (
                <div className="space-y-2">
                  <p className="text-[11px] text-muted-foreground">
                    Select 2+ agents — leads rotate equally
                  </p>
                  <div className="grid grid-cols-1 gap-1 max-h-40 overflow-y-auto border rounded-lg p-2 bg-muted/20">
                    {members.map(m => {
                      const agentId = m.user_id || m.id;
                      const isSelected = formRoundRobinAgents.includes(agentId);
                      const name = m.display_name || m.profile?.full_name || m.profile?.email || 'Agent';
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => toggleRoundRobinAgent(agentId)}
                          className={`flex items-center gap-2.5 p-2 rounded-lg text-left transition-all text-xs ${
                            isSelected
                              ? 'bg-primary/10 border border-primary/30'
                              : 'hover:bg-muted/50 border border-transparent'
                          }`}
                        >
                          <div className={`h-4 w-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                            isSelected ? 'bg-primary border-primary' : 'border-muted-foreground/30'
                          }`}>
                            {isSelected && <CheckCircle2 className="h-3 w-3 text-primary-foreground" />}
                          </div>
                          <span className="font-medium flex-1">{name}</span>
                          {isSelected && (
                            <Badge variant="secondary" className="text-[10px]">
                              #{formRoundRobinAgents.indexOf(agentId) + 1}
                            </Badge>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  {formRoundRobinAgents.length > 0 && formRoundRobinAgents.length < 2 && (
                    <p className="text-[11px] text-amber-600">⚠ Select at least 2 agents</p>
                  )}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => { setShowDialog(false); setEditingAutomation(null); resetForm(); }} className="w-full sm:w-auto">Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="gap-2 w-full sm:w-auto">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              {saving ? 'Saving...' : editingAutomation ? 'Update Automation' : 'Create Automation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Automation?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. The automation will be permanently removed.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteTarget && handleDelete(deleteTarget)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
