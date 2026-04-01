import { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
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
  Sparkles,
  Copy,
  ArrowRight,
  CheckCircle2,
  Target,
  Loader2,
  Info,
  Lightbulb,
  ArrowDown,
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

const TEMPLATE_AUTOMATIONS = [
  {
    id: 't1',
    name: 'Quick Response Welcome',
    description: 'Instantly greet ad leads with a personalized welcome message',
    trigger_type: 'new_lead',
    defaultActions: ['send_template'],
  },
  {
    id: 't2',
    name: 'Lead Tagging & Team Assignment',
    description: 'Auto-tag and assign leads based on campaign to a team via round-robin',
    trigger_type: 'first_message',
    defaultActions: ['add_tag', 'assign_team'],
  },
  {
    id: 't3',
    name: 'Multi-Agent Round Robin',
    description: 'Distribute ad leads equally among selected agents in rotation',
    trigger_type: 'new_lead',
    defaultActions: ['assign_agents_roundrobin'],
  },
  {
    id: 't4',
    name: 'Campaign-Specific Workflow',
    description: 'Trigger a specific automation workflow when leads come from a chosen campaign',
    trigger_type: 'ad_click',
    defaultActions: ['add_tag', 'start_workflow'],
  },
];

export default function MetaAdsAutomations() {
  const { currentTenant } = useTenant();
  const { campaigns, connectedAccounts } = useMetaAdAccounts();
  const { members } = useTeamMembers();
  const { teams } = useTeams();
  const { templates } = useTemplates();
  const { tags } = useTags();
  const { workflows } = useAutomationWorkflows();
  
  const [automations, setAutomations] = useState<DbAutomation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [saving, setSaving] = useState(false);

  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<typeof TEMPLATE_AUTOMATIONS[0] | null>(null);

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

  const handleSaveAutomation = async () => {
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
      const { error } = await supabase
        .from('smeksh_meta_ad_automations')
        .insert({
          workspace_id: currentTenant.id,
          name: formName.trim(),
          description: formDescription.trim() || null,
          trigger_type: formTrigger,
          trigger_ad_account_id: adAccountId,
          trigger_campaign_ids: formCampaignIds.length > 0 ? formCampaignIds : null,
          trigger_conditions: {},
          actions: actions as unknown as any,
          is_active: true,
        });
      if (error) throw error;
      toast.success('Automation created successfully');
      setShowCreateDialog(false);
      setTemplateDialogOpen(false);
      setSelectedTemplate(null);
      resetForm();
      await fetchAutomations();
    } catch (err: any) {
      console.error('Create automation error:', err);
      toast.error(err.message || 'Failed to create automation');
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
    }
  };

  const handleDuplicate = async (automation: DbAutomation) => {
    if (!currentTenant?.id) return;
    try {
      const { error } = await supabase
        .from('smeksh_meta_ad_automations')
        .insert({
          workspace_id: currentTenant.id,
          name: `${automation.name} (Copy)`,
          description: automation.description,
          trigger_type: automation.trigger_type,
          trigger_ad_account_id: automation.trigger_ad_account_id,
          trigger_campaign_ids: automation.trigger_campaign_ids,
          trigger_conditions: automation.trigger_conditions as any,
          actions: automation.actions as unknown as any,
          is_active: false,
        });
      if (error) throw error;
      toast.success('Automation duplicated — edit it to target different campaigns/agents');
      await fetchAutomations();
    } catch {
      toast.error('Failed to duplicate');
    }
  };

  const handleOpenTemplateConfig = (template: typeof TEMPLATE_AUTOMATIONS[0]) => {
    resetForm();
    setFormName(template.name);
    setFormDescription(template.description);
    setFormTrigger(template.trigger_type);
    setFormSendTemplate(template.defaultActions.includes('send_template'));
    setFormAddTag(template.defaultActions.includes('add_tag'));
    setFormStartWorkflow(template.defaultActions.includes('start_workflow'));
    if (template.defaultActions.includes('assign_team')) {
      setFormAssignMode('team');
      setFormAssignTeam(teams.length > 0 ? teams[0].id : '');
    } else if (template.defaultActions.includes('assign_agent')) {
      setFormAssignMode('agent');
      setFormAssignAgent(members.length > 0 ? (members[0].user_id || members[0].id) : '');
    } else if (template.defaultActions.includes('assign_agents_roundrobin')) {
      setFormAssignMode('roundrobin');
    }
    setSelectedTemplate(template);
    setTemplateDialogOpen(true);
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

  // ─── Form Fields ───
  const AutomationFormFields = ({ showNameField = true }: { showNameField?: boolean }) => (
    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
      {showNameField && (
        <>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Automation Name *</Label>
            <Input placeholder="e.g., Ad A → Agent 1, 2, 3" value={formName} onChange={e => setFormName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm">Description</Label>
            <Textarea placeholder="What does this automation do?" rows={2} value={formDescription} onChange={e => setFormDescription(e.target.value)} />
          </div>
        </>
      )}

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

      {/* Campaign Selection — Visual Cards */}
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
            {campaigns.map(campaign => {
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
                  <span className="font-medium truncate flex-1">{campaign.campaign_name}</span>
                  <Badge variant="secondary" className="text-[10px] flex-shrink-0">{campaign.status}</Badge>
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
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Select a WhatsApp template…" />
                </SelectTrigger>
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
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Select a tag…" />
                </SelectTrigger>
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
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Select a workflow…" />
                </SelectTrigger>
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

      {/* Assignment Mode — Visual Tabs */}
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
              Select 2+ agents — leads rotate equally: Agent 1 → Agent 2 → Agent 3 → repeat
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
            {formRoundRobinAgents.length >= 2 && (
              <div className="flex items-center gap-1 flex-wrap">
                <span className="text-[11px] text-muted-foreground">Order:</span>
                {formRoundRobinAgents.map((id, i) => {
                  const m = members.find(m => m.user_id === id || m.id === id);
                  return (
                    <span key={id} className="text-[11px]">
                      <Badge variant="outline" className="text-[10px]">{m?.display_name || m?.profile?.full_name || 'Agent'}</Badge>
                      {i < formRoundRobinAgents.length - 1 && <ArrowRight className="h-2.5 w-2.5 inline mx-0.5 text-muted-foreground" />}
                    </span>
                  );
                })}
                <span className="text-[10px] text-muted-foreground ml-1">↻ repeat</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/25">
              <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Ad Automations</h1>
              <p className="text-sm text-muted-foreground">Route ad leads to the right agents automatically</p>
            </div>
          </div>
          <Button onClick={() => { resetForm(); setShowCreateDialog(true); }} className="gap-2 shadow-lg shadow-primary/25 w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            Create Automation
          </Button>
        </div>

        {/* Pro Tip */}
        <Alert className="border-primary/20 bg-primary/5">
          <Lightbulb className="h-4 w-4 text-primary" />
          <AlertDescription className="text-xs">
            <strong>Pro Tip:</strong> Create multiple automations for the same ad campaign with different actions! For example: one automation to send a welcome template + another to assign leads to agents via round-robin. You can also duplicate any automation and change the target campaign.
          </AlertDescription>
        </Alert>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="border-0 shadow-md">
            <CardContent className="p-3 sm:p-4 flex items-center gap-3">
              <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex-shrink-0">
                <Play className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-lg sm:text-xl font-bold">{automations.filter(a => a.is_active).length}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Active</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md">
            <CardContent className="p-3 sm:p-4 flex items-center gap-3">
              <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex-shrink-0">
                <Zap className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-lg sm:text-xl font-bold">{automations.reduce((sum, a) => sum + (a.executions_count || 0), 0)}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Executions</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md">
            <CardContent className="p-3 sm:p-4 flex items-center gap-3">
              <div className="p-1.5 rounded-lg bg-violet-100 dark:bg-violet-900/50 flex-shrink-0">
                <GitBranch className="h-4 w-4 text-violet-600" />
              </div>
              <div>
                <p className="text-lg sm:text-xl font-bold">{campaigns.length}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Campaigns</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Campaign → Agent Mapping Overview */}
        {automations.length > 0 && campaigns.length > 0 && (
          <Card className="border-0 shadow-lg">
            <CardHeader className="px-4 sm:px-6 pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Target className="h-4 w-4 text-primary" />
                Campaign → Agent Mapping
              </CardTitle>
              <CardDescription className="text-xs">Visual overview of how your ad leads are distributed</CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <div className="space-y-2">
                {campaigns.map(campaign => {
                  const matchingAutomations = automations.filter(a =>
                    a.is_active && (!a.trigger_campaign_ids || a.trigger_campaign_ids.length === 0 || a.trigger_campaign_ids.includes(campaign.id))
                  );
                  const assignActions = matchingAutomations.flatMap(a =>
                    (a.actions || []).filter((act: any) => ['assign_agent', 'assign_team', 'assign_agents_roundrobin'].includes(act.type as string))
                  );
                  return (
                    <div key={campaign.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 text-xs">
                      <Badge variant="outline" className="text-[10px] flex-shrink-0 max-w-[40%] truncate">{campaign.campaign_name}</Badge>
                      <ArrowRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                      {assignActions.length > 0 ? (
                        <div className="flex items-center gap-1 flex-wrap flex-1">
                          {assignActions.map((act: any, i: number) => (
                            <Badge key={i} className="text-[10px] bg-primary/10 text-primary border-primary/20">
                              {getActionLabel(act as Record<string, unknown>)}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-[10px]">No agent assigned</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Active Automations */}
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
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : automations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Zap className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No automations yet</p>
                <p className="text-sm mt-1">Create one above or use a ready-made template below</p>
              </div>
            ) : (
              automations.map((automation) => {
                const triggerInfo = TRIGGER_LABELS[automation.trigger_type] || { label: automation.trigger_type, icon: Zap };
                const TriggerIcon = triggerInfo.icon;
                const actions = (automation.actions || []) as Record<string, unknown>[];
                const targetedCampaigns = (automation.trigger_campaign_ids || [])
                  .map(cid => campaigns.find(c => c.id === cid)?.campaign_name)
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
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDuplicate(automation)}>
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Duplicate for another campaign</TooltipContent>
                      </Tooltip>
                      <Switch checked={automation.is_active} onCheckedChange={() => handleToggle(automation.id, automation.is_active)} />
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(automation.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Ready-Made Templates */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4 text-amber-500" />
              Ready-Made Templates
            </CardTitle>
            <CardDescription className="text-xs">Quick-start templates — configure & activate in seconds</CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {TEMPLATE_AUTOMATIONS.map((template) => {
                const triggerInfo = TRIGGER_LABELS[template.trigger_type] || { label: template.trigger_type, icon: Zap };
                const TriggerIcon = triggerInfo.icon;
                return (
                  <div key={template.id} className="p-3 rounded-xl border-2 border-dashed hover:border-primary/50 hover:bg-primary/5 transition-all">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/50 flex-shrink-0">
                        <TriggerIcon className="h-3.5 w-3.5 text-amber-600" />
                      </div>
                      <h4 className="font-semibold text-xs">{template.name}</h4>
                    </div>
                    <p className="text-[11px] text-muted-foreground mb-2 line-clamp-2">{template.description}</p>
                    <div className="flex items-center gap-1 flex-wrap mb-2.5">
                      {template.defaultActions.map((actionType, idx) => {
                        const ActionIcon = ACTION_ICONS[actionType] || Zap;
                        const actionLabel = actionType === 'send_template' ? 'Send Welcome'
                          : actionType === 'add_tag' ? 'Add Tag'
                          : actionType === 'assign_agent' ? 'Assign Agent'
                          : actionType === 'assign_team' ? 'Round Robin (Team)'
                          : actionType === 'assign_agents_roundrobin' ? 'Multi-Agent Robin'
                          : actionType === 'start_workflow' ? 'Start Workflow'
                          : actionType;
                        return (
                          <Badge key={idx} variant="secondary" className="text-[10px]">
                            <ActionIcon className="h-2.5 w-2.5 mr-0.5" />{actionLabel}
                          </Badge>
                        );
                      })}
                    </div>
                    <Button variant="outline" size="sm" className="w-full gap-1.5 h-7 text-xs" onClick={() => handleOpenTemplateConfig(template)}>
                      <Sparkles className="h-3 w-3" />
                      Configure & Activate
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-lg mx-4">
          <DialogHeader>
            <DialogTitle className="text-base">Create Automation</DialogTitle>
            <DialogDescription className="text-xs">Map campaigns to agents and actions</DialogDescription>
          </DialogHeader>
          <AutomationFormFields showNameField={true} />
          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowCreateDialog(false)} className="w-full sm:w-auto">Cancel</Button>
            <Button onClick={handleSaveAutomation} disabled={saving} className="gap-2 w-full sm:w-auto">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              {saving ? 'Creating...' : 'Create Automation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Template Configure Dialog */}
      <Dialog open={templateDialogOpen} onOpenChange={(open) => { setTemplateDialogOpen(open); if (!open) setSelectedTemplate(null); }}>
        <DialogContent className="sm:max-w-lg mx-4">
          <DialogHeader>
            <DialogTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              {selectedTemplate?.name}
            </DialogTitle>
            <DialogDescription className="text-xs">{selectedTemplate?.description}</DialogDescription>
          </DialogHeader>
          <AutomationFormFields showNameField={true} />
          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => { setTemplateDialogOpen(false); setSelectedTemplate(null); }} className="w-full sm:w-auto">Cancel</Button>
            <Button onClick={handleSaveAutomation} disabled={saving} className="gap-2 w-full sm:w-auto">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              {saving ? 'Activating...' : 'Activate Automation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
