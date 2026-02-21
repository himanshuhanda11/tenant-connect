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
    name: 'Lead Tagging & Assignment',
    description: 'Auto-tag and assign leads based on campaign to a team via round-robin',
    trigger_type: 'first_message',
    defaultActions: ['add_tag', 'assign_team'],
  },
  {
    id: 't3',
    name: 'Direct Agent Assignment',
    description: 'Assign all ad leads directly to a specific agent instantly',
    trigger_type: 'new_lead',
    defaultActions: ['assign_agent'],
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

  // Template configure dialog
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<typeof TEMPLATE_AUTOMATIONS[0] | null>(null);

  // Shared form state (used by both Create and Template dialogs)
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formTrigger, setFormTrigger] = useState('new_lead');
  const [formCampaignIds, setFormCampaignIds] = useState<string[]>([]);
  const [formAssignAgent, setFormAssignAgent] = useState('');
  const [formAssignTeam, setFormAssignTeam] = useState('');
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
    setFormAssignAgent('');
    setFormAssignTeam('');
    setFormSendTemplate(true);
    setFormSelectedTemplateId('');
    setFormAddTag(false);
    setFormSelectedTagId('');
    setFormStartWorkflow(false);
    setFormSelectedWorkflowId('');
  };

  const buildActions = () => {
    const actions: Record<string, unknown>[] = [];
    if (formSendTemplate) {
      const tpl = templates.find(t => t.id === formSelectedTemplateId);
      actions.push({ type: 'send_template', label: tpl ? `Send: ${tpl.name}` : 'Send Welcome Template', template_id: formSelectedTemplateId || null, template_name: tpl?.name || null });
    }
    if (formAddTag) {
      const tag = tags.find(t => t.id === formSelectedTagId);
      actions.push({ type: 'add_tag', label: tag ? `Tag: ${tag.name}` : 'Add Meta Lead Tag', tag_id: formSelectedTagId || null, tag_name: tag?.name || null });
    }
    if (formAssignAgent && formAssignAgent !== 'none') actions.push({ type: 'assign_agent', label: 'Assign Agent', agent_id: formAssignAgent });
    if (formAssignTeam && formAssignTeam !== 'none') actions.push({ type: 'assign_team', label: 'Assign Team', team_id: formAssignTeam });
    if (formStartWorkflow) {
      const wf = workflows.find(w => w.id === formSelectedWorkflowId);
      actions.push({ type: 'start_workflow', label: wf ? `Workflow: ${wf.name}` : 'Start Workflow', workflow_id: formSelectedWorkflowId || null, workflow_name: wf?.name || null });
    }
    return actions;
  };

  const handleSaveAutomation = async () => {
    if (!currentTenant?.id || !formName.trim()) {
      toast.error('Please provide a name');
      return;
    }
    // Validate selections
    if (formSendTemplate && !formSelectedTemplateId) {
      toast.error('Please select a template for the "Send Template" action');
      return;
    }
    if (formAddTag && !formSelectedTagId) {
      toast.error('Please select a tag for the "Add Tag" action');
      return;
    }
    if (formStartWorkflow && !formSelectedWorkflowId) {
      toast.error('Please select a workflow for the "Start Workflow" action');
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
    } catch (err: any) {
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
    } catch (err: any) {
      toast.error('Failed to delete');
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
    // Pre-select assign_team or assign_agent based on template defaults
    if (template.defaultActions.includes('assign_team')) {
      setFormAssignTeam(teams.length > 0 ? teams[0].id : '');
    }
    if (template.defaultActions.includes('assign_agent')) {
      setFormAssignAgent(members.length > 0 ? (members[0].user_id || members[0].id) : '');
    }
    setSelectedTemplate(template);
    setTemplateDialogOpen(true);
  };

  const toggleCampaign = (campaignId: string) => {
    setFormCampaignIds(prev =>
      prev.includes(campaignId) ? prev.filter(c => c !== campaignId) : [...prev, campaignId]
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
      return `Assign to ${team?.name || 'Team'}`;
    }
    return (action.label as string) || type;
  };

  // Shared form fields component to avoid duplication
  const AutomationFormFields = ({ showNameField = true }: { showNameField?: boolean }) => (
    <div className="space-y-4">
      {showNameField && (
        <>
          <div className="space-y-2">
            <Label className="text-sm">Automation Name *</Label>
            <Input
              placeholder="e.g., Welcome New Ad Leads"
              value={formName}
              onChange={e => setFormName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Description</Label>
            <Textarea
              placeholder="What does this automation do?"
              rows={2}
              value={formDescription}
              onChange={e => setFormDescription(e.target.value)}
            />
          </div>
        </>
      )}

      <div className="space-y-2">
        <Label className="text-sm">Trigger</Label>
        <Select value={formTrigger} onValueChange={setFormTrigger}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="new_lead">New Lead from Meta Ad</SelectItem>
            <SelectItem value="first_message">First Message After Ad Click</SelectItem>
            <SelectItem value="ad_click">Ad Click (Immediate)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Campaign Targeting */}
      <div className="space-y-2">
        <Label className="text-sm flex items-center gap-2">
          <Target className="h-3.5 w-3.5" />
          Target Specific Campaigns
        </Label>
        <p className="text-xs text-muted-foreground">Leave empty to apply to all campaigns</p>
        {campaigns.length > 0 ? (
          <div className="space-y-2 max-h-36 overflow-y-auto border rounded-lg p-2">
            {campaigns.map(campaign => (
              <div key={campaign.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50">
                <Checkbox
                  id={`camp-${campaign.id}`}
                  checked={formCampaignIds.includes(campaign.id)}
                  onCheckedChange={() => toggleCampaign(campaign.id)}
                />
                <Label htmlFor={`camp-${campaign.id}`} className="cursor-pointer text-xs sm:text-sm flex-1">
                  <span className="font-medium">{campaign.campaign_name}</span>
                  <Badge variant="secondary" className="ml-2 text-[10px]">{campaign.status}</Badge>
                </Label>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground italic p-2 border rounded-lg">
            No campaigns synced yet. Sync your Meta Ads data first.
          </p>
        )}
      </div>

      <Separator />

      {/* Actions */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Actions</Label>

        {/* Send Template Action */}
        <div className="rounded-lg border overflow-hidden">
          <div className="flex items-center space-x-3 p-2.5">
            <Checkbox
              id="action-template"
              checked={formSendTemplate}
              onCheckedChange={(v) => { setFormSendTemplate(!!v); if (!v) setFormSelectedTemplateId(''); }}
            />
            <Label htmlFor="action-template" className="flex items-center gap-2 cursor-pointer text-xs sm:text-sm">
              <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
              Send Template Message
            </Label>
          </div>
          {formSendTemplate && (
            <div className="px-3 pb-3 pt-0">
              <Select value={formSelectedTemplateId} onValueChange={setFormSelectedTemplateId}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Select a WhatsApp template…" />
                </SelectTrigger>
                <SelectContent>
                  {templates.filter(t => t.status === 'APPROVED').length > 0 ? (
                    templates.filter(t => t.status === 'APPROVED').map(t => (
                      <SelectItem key={t.id} value={t.id}>
                        <span className="truncate">{t.name}</span>
                        <Badge variant="secondary" className="ml-2 text-[10px]">{t.category}</Badge>
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="__none" disabled>No approved templates found</SelectItem>
                  )}
                </SelectContent>
              </Select>
              {!formSelectedTemplateId && <p className="text-[11px] text-amber-600 mt-1">⚠ Please select a template</p>}
            </div>
          )}
        </div>

        {/* Add Tag Action */}
        <div className="rounded-lg border overflow-hidden">
          <div className="flex items-center space-x-3 p-2.5">
            <Checkbox
              id="action-tag"
              checked={formAddTag}
              onCheckedChange={(v) => { setFormAddTag(!!v); if (!v) setFormSelectedTagId(''); }}
            />
            <Label htmlFor="action-tag" className="flex items-center gap-2 cursor-pointer text-xs sm:text-sm">
              <Tag className="h-3.5 w-3.5 text-muted-foreground" />
              Add Tag to Lead
            </Label>
          </div>
          {formAddTag && (
            <div className="px-3 pb-3 pt-0">
              <Select value={formSelectedTagId} onValueChange={setFormSelectedTagId}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Select a tag…" />
                </SelectTrigger>
                <SelectContent>
                  {tags.length > 0 ? (
                    tags.map(t => (
                      <SelectItem key={t.id} value={t.id}>
                        <span className="truncate">{t.name}</span>
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="__none" disabled>No tags found – create one in Tags page</SelectItem>
                  )}
                </SelectContent>
              </Select>
              {!formSelectedTagId && <p className="text-[11px] text-amber-600 mt-1">⚠ Please select a tag</p>}
            </div>
          )}
        </div>

        {/* Start Workflow Action */}
        <div className="rounded-lg border overflow-hidden">
          <div className="flex items-center space-x-3 p-2.5">
            <Checkbox
              id="action-workflow"
              checked={formStartWorkflow}
              onCheckedChange={(v) => { setFormStartWorkflow(!!v); if (!v) setFormSelectedWorkflowId(''); }}
            />
            <Label htmlFor="action-workflow" className="flex items-center gap-2 cursor-pointer text-xs sm:text-sm">
              <GitBranch className="h-3.5 w-3.5 text-muted-foreground" />
              Start Automation Workflow
            </Label>
          </div>
          {formStartWorkflow && (
            <div className="px-3 pb-3 pt-0">
              <Select value={formSelectedWorkflowId} onValueChange={setFormSelectedWorkflowId}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Select a workflow…" />
                </SelectTrigger>
                <SelectContent>
                  {workflows.filter(w => w.status === 'active' || w.status === 'draft').length > 0 ? (
                    workflows.filter(w => w.status === 'active' || w.status === 'draft').map(w => (
                      <SelectItem key={w.id} value={w.id}>
                        <span className="truncate">{w.name}</span>
                        <Badge variant="secondary" className="ml-2 text-[10px]">{w.status}</Badge>
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="__none" disabled>No workflows found – create one in Automations</SelectItem>
                  )}
                </SelectContent>
              </Select>
              {!formSelectedWorkflowId && <p className="text-[11px] text-amber-600 mt-1">⚠ Please select a workflow</p>}
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* Direct Assignment */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold flex items-center gap-2">
          <UserPlus className="h-3.5 w-3.5" />
          Assign Leads To
        </Label>

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Assign to a specific Agent</Label>
          <Select value={formAssignAgent} onValueChange={(v) => { setFormAssignAgent(v); if (v && v !== 'none') setFormAssignTeam(''); }}>
            <SelectTrigger>
              <SelectValue placeholder="Select agent (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">— No specific agent —</SelectItem>
              {members.map(m => (
                <SelectItem key={m.id} value={m.user_id || m.id}>
                  {m.display_name || m.profile?.full_name || m.profile?.email || 'Agent'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Or assign to a Team Group (round-robin)</Label>
          <Select value={formAssignTeam} onValueChange={(v) => { setFormAssignTeam(v); if (v && v !== 'none') setFormAssignAgent(''); }}>
            <SelectTrigger>
              <SelectValue placeholder="Select team (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">— No team —</SelectItem>
              {teams.map(t => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center justify-center w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/25">
              <Zap className="h-5 w-5 sm:h-7 sm:w-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Ad Automations</h1>
              <p className="text-sm text-muted-foreground">
                Automate responses and actions for Meta Ad leads
              </p>
            </div>
          </div>
          <Button onClick={() => { resetForm(); setShowCreateDialog(true); }} className="gap-2 shadow-lg shadow-primary/25 w-full sm:w-auto text-sm">
            <Plus className="h-4 w-4" />
            Create Automation
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <Card className="border-0 shadow-md">
            <CardContent className="p-4 sm:p-5 flex items-center gap-3 sm:gap-4">
              <div className="p-1.5 sm:p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex-shrink-0">
                <Play className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold">{automations.filter(a => a.is_active).length}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Active Automations</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md">
            <CardContent className="p-4 sm:p-5 flex items-center gap-3 sm:gap-4">
              <div className="p-1.5 sm:p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex-shrink-0">
                <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold">
                  {automations.reduce((sum, a) => sum + (a.executions_count || 0), 0)}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">Total Executions</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md">
            <CardContent className="p-4 sm:p-5 flex items-center gap-3 sm:gap-4">
              <div className="p-1.5 sm:p-2 rounded-lg bg-violet-100 dark:bg-violet-900/50 flex-shrink-0">
                <GitBranch className="h-4 w-4 sm:h-5 sm:w-5 text-violet-600" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold">{campaigns.length}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Connected Campaigns</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Automations */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <GitBranch className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              Your Automations
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">Automations that run when ad leads arrive</CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 space-y-3 sm:space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : automations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Zap className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No automations yet</p>
                <p className="text-sm mt-1">Create one or configure a ready-made template below</p>
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
                    className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border bg-card hover:bg-muted/30 transition-colors"
                  >
                    <div className={`p-2 sm:p-3 rounded-xl ${automation.is_active ? 'bg-primary/10' : 'bg-muted'} flex-shrink-0`}>
                      <TriggerIcon className={`h-4 w-4 sm:h-5 sm:w-5 ${automation.is_active ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold text-sm sm:text-base">{automation.name}</h4>
                        {automation.is_active ? (
                          <Badge className="bg-emerald-100 text-emerald-700 text-xs">Active</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">Paused</Badge>
                        )}
                      </div>
                      {automation.description && (
                        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 line-clamp-1">{automation.description}</p>
                      )}

                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <TriggerIcon className="h-3 w-3" />
                          <span>{triggerInfo.label}</span>
                        </div>
                        <ArrowRight className="h-3 w-3 text-muted-foreground hidden sm:block" />
                        <div className="flex items-center gap-1 flex-wrap">
                          {actions.slice(0, 3).map((action, idx) => {
                            const ActionIcon = ACTION_ICONS[(action.type as string)] || Zap;
                            return (
                              <Badge key={idx} variant="outline" className="text-[10px] sm:text-xs gap-0.5 sm:gap-1">
                                <ActionIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                <span className="truncate max-w-[100px]">{getActionLabel(action)}</span>
                              </Badge>
                            );
                          })}
                          {actions.length > 3 && (
                            <Badge variant="outline" className="text-[10px] sm:text-xs">+{actions.length - 3}</Badge>
                          )}
                        </div>
                      </div>

                      {targetedCampaigns.length > 0 && (
                        <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                          <Target className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                          {targetedCampaigns.slice(0, 2).map((name, i) => (
                            <Badge key={i} variant="secondary" className="text-[10px]">{name}</Badge>
                          ))}
                          {targetedCampaigns.length > 2 && (
                            <Badge variant="secondary" className="text-[10px]">+{targetedCampaigns.length - 2}</Badge>
                          )}
                        </div>
                      )}

                      <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                        <span>{automation.executions_count || 0} runs</span>
                        {automation.last_executed_at && (
                          <span>Last: {new Date(automation.last_executed_at).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-auto sm:ml-0 flex-shrink-0">
                      <Switch
                        checked={automation.is_active}
                        onCheckedChange={() => handleToggle(automation.id, automation.is_active)}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(automation.id)}
                      >
                        <Trash2 className="h-4 w-4" />
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
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" />
              Ready-Made Templates
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">Choose a template, configure campaigns & assignments, then activate</CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {TEMPLATE_AUTOMATIONS.map((template) => {
                const triggerInfo = TRIGGER_LABELS[template.trigger_type] || { label: template.trigger_type, icon: Zap };
                const TriggerIcon = triggerInfo.icon;

                return (
                  <div
                    key={template.id}
                    className="p-3 sm:p-4 rounded-xl border-2 border-dashed hover:border-primary/50 hover:bg-primary/5 transition-all"
                  >
                    <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                      <div className="p-1.5 sm:p-2 rounded-lg bg-amber-100 dark:bg-amber-900/50 flex-shrink-0">
                        <TriggerIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-600" />
                      </div>
                      <h4 className="font-semibold text-xs sm:text-sm line-clamp-1">{template.name}</h4>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2 sm:mb-3 line-clamp-2">{template.description}</p>
                    <div className="flex items-center gap-1 sm:gap-2 flex-wrap mb-3">
                      {template.defaultActions.map((actionType, idx) => {
                        const ActionIcon = ACTION_ICONS[actionType] || Zap;
                        const actionLabel = actionType === 'send_template' ? 'Send Welcome'
                          : actionType === 'add_tag' ? 'Add Tag'
                          : actionType === 'assign_agent' ? 'Assign Agent'
                          : actionType === 'assign_team' ? 'Round Robin'
                          : actionType === 'start_workflow' ? 'Start Workflow'
                          : actionType;
                        return (
                          <Badge key={idx} variant="secondary" className="text-[10px] sm:text-xs">
                            <ActionIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                            <span className="truncate max-w-[80px] sm:max-w-none">{actionLabel}</span>
                          </Badge>
                        );
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-1.5 sm:gap-2 h-8 text-xs sm:text-sm"
                      onClick={() => handleOpenTemplateConfig(template)}
                    >
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
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto mx-4">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Create Automation</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Set up automated actions for your Meta Ad leads
            </DialogDescription>
          </DialogHeader>
          <AutomationFormFields showNameField={true} />
          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowCreateDialog(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button onClick={handleSaveAutomation} disabled={saving} className="gap-2 w-full sm:w-auto">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              {saving ? 'Creating...' : 'Create Automation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Template Configure Dialog */}
      <Dialog open={templateDialogOpen} onOpenChange={(open) => { setTemplateDialogOpen(open); if (!open) setSelectedTemplate(null); }}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto mx-4">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              Configure: {selectedTemplate?.name}
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              {selectedTemplate?.description}. Choose which campaigns to target and who to assign leads to.
            </DialogDescription>
          </DialogHeader>
          <AutomationFormFields showNameField={true} />
          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => { setTemplateDialogOpen(false); setSelectedTemplate(null); }} className="w-full sm:w-auto">
              Cancel
            </Button>
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
