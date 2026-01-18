import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
} from 'lucide-react';
import { toast } from 'sonner';

interface Automation {
  id: string;
  name: string;
  description: string;
  trigger_type: 'new_lead' | 'first_message' | 'ad_click';
  actions: { type: string; label: string }[];
  executions_count: number;
  is_active: boolean;
  is_template: boolean;
}

const MOCK_AUTOMATIONS: Automation[] = [
  {
    id: '1',
    name: 'Meta Ad Welcome',
    description: 'Send welcome template when a new lead comes from Meta Ads',
    trigger_type: 'new_lead',
    actions: [
      { type: 'send_template', label: 'Send Welcome Template' },
      { type: 'add_tag', label: 'Add "Meta Lead" tag' },
    ],
    executions_count: 234,
    is_active: true,
    is_template: false,
  },
  {
    id: '2',
    name: 'High-Intent Lead Routing',
    description: 'Assign high-value ad leads to senior agents',
    trigger_type: 'first_message',
    actions: [
      { type: 'add_tag', label: 'Add "High Intent" tag' },
      { type: 'assign_team', label: 'Assign to Sales Team' },
    ],
    executions_count: 89,
    is_active: true,
    is_template: false,
  },
  {
    id: '3',
    name: 'Ad Lead Follow-up (24h)',
    description: 'Send follow-up if no response within 24 hours',
    trigger_type: 'new_lead',
    actions: [
      { type: 'wait', label: 'Wait 24 hours' },
      { type: 'send_template', label: 'Send Follow-up Template' },
    ],
    executions_count: 156,
    is_active: false,
    is_template: false,
  },
];

const TEMPLATE_AUTOMATIONS: Automation[] = [
  {
    id: 't1',
    name: 'Quick Response Welcome',
    description: 'Instantly greet ad leads with a personalized message',
    trigger_type: 'new_lead',
    actions: [
      { type: 'send_template', label: 'Send Welcome' },
    ],
    executions_count: 0,
    is_active: false,
    is_template: true,
  },
  {
    id: 't2',
    name: 'Lead Tagging & Assignment',
    description: 'Auto-tag and assign leads based on campaign',
    trigger_type: 'first_message',
    actions: [
      { type: 'add_tag', label: 'Add Tag' },
      { type: 'assign_agent', label: 'Round Robin' },
    ],
    executions_count: 0,
    is_active: false,
    is_template: true,
  },
  {
    id: 't3',
    name: 'SLA Timer Start',
    description: 'Start SLA timer when ad lead messages',
    trigger_type: 'first_message',
    actions: [
      { type: 'start_sla', label: 'Start 5min SLA' },
      { type: 'notify', label: 'Notify Team' },
    ],
    executions_count: 0,
    is_active: false,
    is_template: true,
  },
];

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
  wait: Clock,
  start_sla: Clock,
  notify: Zap,
};

export default function MetaAdsAutomations() {
  const [automations, setAutomations] = useState(MOCK_AUTOMATIONS);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const handleToggle = (id: string) => {
    setAutomations(prev => prev.map(a => 
      a.id === id ? { ...a, is_active: !a.is_active } : a
    ));
    toast.success('Automation updated');
  };

  const handleDelete = (id: string) => {
    setAutomations(prev => prev.filter(a => a.id !== id));
    toast.success('Automation deleted');
  };

  const handleUseTemplate = (template: Automation) => {
    toast.success(`Template "${template.name}" added to your automations`);
  };

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
          <Button onClick={() => setShowCreateDialog(true)} className="gap-2 shadow-lg shadow-primary/25 w-full sm:w-auto text-sm">
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
                  {automations.reduce((sum, a) => sum + a.executions_count, 0)}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">Total Executions</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md">
            <CardContent className="p-4 sm:p-5 flex items-center gap-3 sm:gap-4">
              <div className="p-1.5 sm:p-2 rounded-lg bg-violet-100 dark:bg-violet-900/50 flex-shrink-0">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-violet-600" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold">2.3 sec</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Avg Response Time</p>
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
            {automations.map((automation) => {
              const TriggerIcon = TRIGGER_LABELS[automation.trigger_type]?.icon || Zap;
              
              return (
                <div
                  key={automation.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border bg-card hover:bg-muted/30 transition-colors touch-manipulation"
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
                    <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 line-clamp-1">{automation.description}</p>
                    
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <TriggerIcon className="h-3 w-3" />
                        <span className="truncate">{TRIGGER_LABELS[automation.trigger_type]?.label}</span>
                      </div>
                      <ArrowRight className="h-3 w-3 text-muted-foreground hidden xs:block" />
                      <div className="flex items-center gap-1 flex-wrap">
                        {automation.actions.slice(0, 2).map((action, idx) => {
                          const ActionIcon = ACTION_ICONS[action.type] || Zap;
                          return (
                            <Badge key={idx} variant="outline" className="text-[10px] sm:text-xs gap-0.5 sm:gap-1">
                              <ActionIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                              <span className="truncate max-w-[80px] sm:max-w-none">{action.label}</span>
                            </Badge>
                          );
                        })}
                        {automation.actions.length > 2 && (
                          <Badge variant="outline" className="text-[10px] sm:text-xs">
                            +{automation.actions.length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-0">
                    <div className="text-left sm:text-right">
                      <p className="text-base sm:text-lg font-bold">{automation.executions_count}</p>
                      <p className="text-xs text-muted-foreground">executions</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={automation.is_active}
                        onCheckedChange={() => handleToggle(automation.id)}
                      />
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(automation.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Templates */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" />
              Ready-Made Templates
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">Start with a pre-built automation</CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {TEMPLATE_AUTOMATIONS.map((template) => {
                const TriggerIcon = TRIGGER_LABELS[template.trigger_type]?.icon || Zap;
                
                return (
                  <div
                    key={template.id}
                    className="p-3 sm:p-4 rounded-xl border-2 border-dashed hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer touch-manipulation"
                    onClick={() => handleUseTemplate(template)}
                  >
                    <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                      <div className="p-1.5 sm:p-2 rounded-lg bg-amber-100 dark:bg-amber-900/50 flex-shrink-0">
                        <TriggerIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-600" />
                      </div>
                      <h4 className="font-semibold text-xs sm:text-sm line-clamp-1">{template.name}</h4>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2 sm:mb-3 line-clamp-2">{template.description}</p>
                    <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                      {template.actions.map((action, idx) => {
                        const ActionIcon = ACTION_ICONS[action.type] || Zap;
                        return (
                          <Badge key={idx} variant="secondary" className="text-[10px] sm:text-xs">
                            <ActionIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                            <span className="truncate max-w-[60px] sm:max-w-none">{action.label}</span>
                          </Badge>
                        );
                      })}
                    </div>
                    <Button variant="outline" size="sm" className="w-full mt-3 sm:mt-4 gap-1.5 sm:gap-2 h-8 text-xs sm:text-sm">
                      <Copy className="h-3 w-3" />
                      Use Template
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
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-sm">Automation Name</Label>
              <Input placeholder="e.g., Welcome New Ad Leads" className="h-10" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Description</Label>
              <Textarea placeholder="What does this automation do?" rows={2} />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Trigger</Label>
              <Select defaultValue="new_lead">
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new_lead">New Lead from Meta Ad</SelectItem>
                  <SelectItem value="first_message">First Message After Ad Click</SelectItem>
                  <SelectItem value="ad_click">Ad Click (Immediate)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Actions</Label>
              <div className="space-y-2">
                {[
                  { id: 'template', label: 'Send Welcome Template', icon: MessageSquare },
                  { id: 'tag', label: 'Add "Meta Lead" Tag', icon: Tag },
                  { id: 'assign', label: 'Assign to Sales Team', icon: Users },
                ].map((action) => (
                  <div key={action.id} className="flex items-center space-x-3 p-2.5 sm:p-3 rounded-lg border touch-manipulation">
                    <Checkbox id={action.id} defaultChecked={action.id === 'template'} />
                    <Label htmlFor={action.id} className="flex items-center gap-2 cursor-pointer text-xs sm:text-sm">
                      <action.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                      {action.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowCreateDialog(false)} className="w-full sm:w-auto">Cancel</Button>
            <Button onClick={() => {
              setShowCreateDialog(false);
              toast.success('Automation created');
            }} className="gap-2 w-full sm:w-auto">
              <CheckCircle2 className="h-4 w-4" />
              Create Automation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
