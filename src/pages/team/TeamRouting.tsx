import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Route, Plus, Edit, Trash2, ArrowRight, GripVertical,
  Tag, MessageSquare, User, Users, Zap, Info, Shuffle,
  Activity, Shield, Clock, AlertTriangle, CheckCircle2
} from 'lucide-react';
import { useRoutingRules, useTeams, useTeamMembers } from '@/hooks/useTeam';
import { TeamBreadcrumb } from '@/components/team/TeamBreadcrumb';
import { ROUTING_STRATEGY_LABELS } from '@/types/team';
import type { RoutingRule, RoutingStrategy } from '@/types/team';
import { TeamGuideCard } from '@/components/team/TeamGuideCard';
import { EmptyTeamState } from '@/components/team/EmptyTeamState';

const CONDITION_TYPES = [
  { value: 'all', label: 'All New Conversations', icon: MessageSquare, description: 'Route every new incoming chat' },
  { value: 'new_conversation', label: 'New Conversation', icon: Zap, description: 'First message from a new contact' },
  { value: 'tag', label: 'Has Tag', icon: Tag, description: 'Route based on contact tags' },
  { value: 'keyword', label: 'Keyword Match', icon: MessageSquare, description: 'Match message content' },
  { value: 'source', label: 'Contact Source', icon: User, description: 'Route by lead source' },
  { value: 'language', label: 'Language', icon: MessageSquare, description: 'Match contact language' },
  { value: 'intent', label: 'AI Intent', icon: Zap, description: 'Route by AI-detected intent' },
  { value: 'vip', label: 'VIP Contact', icon: Shield, description: 'Priority for VIP contacts' },
];

const STRATEGY_DETAILS = {
  round_robin: { icon: Shuffle, description: 'Distribute evenly among available agents' },
  least_busy: { icon: Activity, description: 'Assign to agent with fewest open chats' },
  skill_based: { icon: Tag, description: 'Match based on agent skills and languages' },
  vip_routing: { icon: Shield, description: 'Priority routing for VIP customers' },
  manual: { icon: User, description: 'Admin manually assigns conversations' },
  overflow: { icon: Clock, description: 'Backup queue when no agents available' },
};

const TeamRouting = () => {
  const { rules, loading, createRule, updateRule, deleteRule } = useRoutingRules();
  const { teams } = useTeams();
  const { members } = useTeamMembers();
  const [showModal, setShowModal] = useState(false);
  const [editingRule, setEditingRule] = useState<RoutingRule | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    priority: 0,
    is_active: true,
    condition_type: 'tag',
    condition_config: {} as Record<string, any>,
    assign_to_team_id: '',
    assign_to_user_id: '',
    strategy: 'round_robin' as RoutingStrategy,
    fallback_strategy: 'least_busy' as RoutingStrategy,
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      priority: rules.length,
      is_active: true,
      condition_type: 'tag',
      condition_config: {},
      assign_to_team_id: '',
      assign_to_user_id: '',
      strategy: 'round_robin',
      fallback_strategy: 'least_busy',
    });
  };

  const handleOpenCreate = () => {
    resetForm();
    setEditingRule(null);
    setShowModal(true);
  };

  const handleOpenEdit = (rule: RoutingRule) => {
    setFormData({
      name: rule.name,
      description: rule.description || '',
      priority: rule.priority,
      is_active: rule.is_active,
      condition_type: rule.condition_type,
      condition_config: rule.condition_config,
      assign_to_team_id: rule.assign_to_team_id || '',
      assign_to_user_id: rule.assign_to_user_id || '',
      strategy: rule.strategy,
      fallback_strategy: rule.fallback_strategy,
    });
    setEditingRule(rule);
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) return;
    
    setSubmitting(true);
    try {
      const data = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        priority: formData.priority,
        is_active: formData.is_active,
        condition_type: formData.condition_type,
        condition_config: formData.condition_config,
        assign_to_team_id: formData.assign_to_team_id || null,
        assign_to_user_id: formData.assign_to_user_id || null,
        strategy: formData.strategy,
        fallback_strategy: formData.fallback_strategy,
      };

      if (editingRule) {
        await updateRule(editingRule.id, data);
      } else {
        await createRule(data);
      }
      setShowModal(false);
      resetForm();
      setEditingRule(null);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this routing rule?')) {
      await deleteRule(id);
    }
  };

  const handleToggleActive = async (rule: RoutingRule) => {
    await updateRule(rule.id, { is_active: !rule.is_active });
  };

  const activeRules = rules.filter(r => r.is_active).length;

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl">
        <TeamBreadcrumb currentPage="Routing & Assignment" />
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Routing & Assignment</h1>
            <p className="text-muted-foreground mt-1">
              Configure how conversations are automatically assigned to agents
            </p>
          </div>
          <Button onClick={handleOpenCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Create Rule
          </Button>
        </div>

        {/* Guide */}
        <TeamGuideCard
          title="Smart Conversation Routing"
          description="Automatically assign incoming conversations to the right team members based on rules you define."
          tips={[
            "Use Round Robin for even distribution across your team",
            "Least Busy assigns to agents with fewer open chats",
            "Add conditions to route VIP customers to senior agents",
            "Set up fallback strategies for when primary rules don't match"
          ]}
          dismissKey="routing-guide"
        />

        <Tabs defaultValue="rules" className="space-y-6">
          <TabsList>
            <TabsTrigger value="rules">Routing Rules</TabsTrigger>
            <TabsTrigger value="strategies">Strategies</TabsTrigger>
            <TabsTrigger value="safeguards">Safeguards</TabsTrigger>
          </TabsList>

          {/* Rules Tab */}
          <TabsContent value="rules" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-4 pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Rules</p>
                      <p className="text-2xl font-bold">{rules.length}</p>
                    </div>
                    <Route className="h-8 w-8 text-muted-foreground/30" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Active Rules</p>
                      <p className="text-2xl font-bold text-green-600">{activeRules}</p>
                    </div>
                    <CheckCircle2 className="h-8 w-8 text-green-500/30" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Teams Available</p>
                      <p className="text-2xl font-bold">{teams.length}</p>
                    </div>
                    <Users className="h-8 w-8 text-muted-foreground/30" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Rules List */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Routing Rules</CardTitle>
                    <CardDescription>
                      Rules are evaluated in priority order (lower number = higher priority)
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-12 text-muted-foreground">Loading...</div>
                ) : rules.length === 0 ? (
                  <EmptyTeamState
                    icon={Route}
                    title="No routing rules yet"
                    description="Create your first routing rule to automatically assign conversations to the right team members."
                    actionLabel="Create Rule"
                    onAction={handleOpenCreate}
                    tips={[
                      'Start with a simple Round Robin rule',
                      'Add conditions for VIP or specific tag routing',
                      'Use fallback strategies for unmatched conversations'
                    ]}
                  />
                ) : (
                  <div className="space-y-3">
                    {rules.sort((a, b) => a.priority - b.priority).map((rule) => {
                      const StrategyIcon = STRATEGY_DETAILS[rule.strategy]?.icon || Route;
                      return (
                        <div 
                          key={rule.id}
                          className={`flex items-center gap-4 p-4 rounded-xl border transition-all hover:border-primary/50 ${
                            !rule.is_active ? 'opacity-50 bg-muted/30' : 'bg-background'
                          }`}
                        >
                          <div className="cursor-move text-muted-foreground hover:text-foreground">
                            <GripVertical className="h-5 w-5" />
                          </div>
                          <Badge 
                            variant="outline" 
                            className="min-w-[44px] justify-center font-mono text-sm"
                          >
                            #{rule.priority}
                          </Badge>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-medium">{rule.name}</p>
                              {!rule.is_active && (
                                <Badge variant="secondary" className="text-xs">Disabled</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1.5 text-sm text-muted-foreground flex-wrap">
                              <Badge variant="outline" className="gap-1 text-xs font-normal">
                                <Tag className="h-3 w-3" />
                                IF {rule.condition_type}
                              </Badge>
                              <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                              <Badge variant="outline" className="gap-1 text-xs font-normal">
                                <StrategyIcon className="h-3 w-3" />
                                {ROUTING_STRATEGY_LABELS[rule.strategy]}
                              </Badge>
                              <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                              <span className="text-foreground font-medium">
                                {rule.team?.name || rule.user?.full_name || 'Any Available'}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div>
                                  <Switch 
                                    checked={rule.is_active} 
                                    onCheckedChange={() => handleToggleActive(rule)}
                                  />
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                {rule.is_active ? 'Disable rule' : 'Enable rule'}
                              </TooltipContent>
                            </Tooltip>
                            <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(rule)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleDelete(rule.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Strategies Tab */}
          <TabsContent value="strategies" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Available Routing Strategies</CardTitle>
                <CardDescription>Choose the right strategy for your team's workflow</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(STRATEGY_DETAILS).map(([key, { icon: Icon, description }]) => (
                    <div key={key} className="p-4 border rounded-xl hover:border-primary/50 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{ROUTING_STRATEGY_LABELS[key as RoutingStrategy]}</p>
                          <p className="text-sm text-muted-foreground mt-1">{description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Pro Tip:</strong> Combine strategies using fallbacks. For example, try Skill-Based first, 
                then fall back to Least Busy if no skilled agent is available.
              </AlertDescription>
            </Alert>
          </TabsContent>

          {/* Safeguards Tab */}
          <TabsContent value="safeguards" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Assignment Safeguards</CardTitle>
                <CardDescription>Global settings to prevent agent overload</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-3 p-4 border rounded-xl">
                    <div className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-primary" />
                      <Label className="font-medium">Max Open Chats</Label>
                    </div>
                    <Input type="number" defaultValue={10} />
                    <p className="text-xs text-muted-foreground">
                      Won't assign more conversations if agent reaches this limit
                    </p>
                  </div>
                  <div className="space-y-3 p-4 border rounded-xl">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" />
                      <Label className="font-medium">Auto-Reassign Timeout</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input type="number" defaultValue={15} className="flex-1" />
                      <span className="text-sm text-muted-foreground">minutes</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Reassign to next agent if assigned agent goes offline
                    </p>
                  </div>
                  <div className="space-y-3 p-4 border rounded-xl">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-primary" />
                      <Label className="font-medium">Overflow Queue</Label>
                    </div>
                    <div className="flex items-center gap-3 pt-1">
                      <Switch defaultChecked id="overflow" />
                      <Label htmlFor="overflow" className="text-sm font-normal">
                        Enable overflow queue
                      </Label>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Keep conversations unassigned when no agent is available
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Priority Settings</CardTitle>
                <CardDescription>Configure how priority contacts are handled</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-xl">
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-amber-600" />
                      <div>
                        <p className="font-medium">VIP Priority Routing</p>
                        <p className="text-sm text-muted-foreground">
                          VIP-tagged contacts skip the queue and get priority assignment
                        </p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-xl">
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium">SLA-Risk Priority Boost</p>
                        <p className="text-sm text-muted-foreground">
                          Conversations nearing SLA breach get higher priority
                        </p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Create/Edit Modal */}
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingRule ? 'Edit Routing Rule' : 'Create Routing Rule'}</DialogTitle>
              <DialogDescription>
                Define conditions and assignment strategy for automatic routing
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Rule Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., VIP to Senior Agents"
                  />
                </div>
                <div className="space-y-2">
                  <Label>
                    Priority
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-3.5 w-3.5 ml-1 inline text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>Lower number = higher priority. Rule with priority 0 runs first.</TooltipContent>
                    </Tooltip>
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe what this rule does..."
                  rows={2}
                />
              </div>

              {/* Condition Section */}
              <div className="p-4 border rounded-xl space-y-4 bg-muted/30">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="font-mono">IF</Badge>
                  <Label className="font-medium">Condition</Label>
                </div>
                <Select 
                  value={formData.condition_type} 
                  onValueChange={(v) => setFormData({ ...formData, condition_type: v, condition_config: {} })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CONDITION_TYPES.map(ct => (
                      <SelectItem key={ct.value} value={ct.value}>
                        <div className="flex items-center gap-2">
                          <ct.icon className="h-4 w-4 text-muted-foreground" />
                          <span>{ct.label}</span>
                          <span className="text-xs text-muted-foreground">— {ct.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {/* Condition-specific inputs */}
                {formData.condition_type === 'tag' && (
                  <Input
                    placeholder="Enter tag name (e.g., VIP, Support, Sales)"
                    value={formData.condition_config.tag_name || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      condition_config: { ...formData.condition_config, tag_name: e.target.value }
                    })}
                  />
                )}
                {formData.condition_type === 'keyword' && (
                  <Input
                    placeholder="Keywords (comma-separated: urgent, help, problem)"
                    value={formData.condition_config.keywords || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      condition_config: { ...formData.condition_config, keywords: e.target.value }
                    })}
                  />
                )}
                {formData.condition_type === 'language' && (
                  <Select 
                    value={formData.condition_config.language || ''} 
                    onValueChange={(v) => setFormData({
                      ...formData,
                      condition_config: { ...formData.condition_config, language: v }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                      <SelectItem value="pt">Portuguese</SelectItem>
                      <SelectItem value="hi">Hindi</SelectItem>
                      <SelectItem value="ar">Arabic</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Assignment Section */}
              <div className="p-4 border rounded-xl space-y-4 bg-muted/30">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="font-mono">THEN</Badge>
                  <Label className="font-medium">Assign Using</Label>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Strategy</Label>
                    <Select 
                      value={formData.strategy} 
                      onValueChange={(v) => setFormData({ 
                        ...formData, 
                        strategy: v as RoutingStrategy 
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(ROUTING_STRATEGY_LABELS).map(([key, label]) => {
                          const Icon = STRATEGY_DETAILS[key as RoutingStrategy]?.icon || Route;
                          return (
                            <SelectItem key={key} value={key}>
                              <div className="flex items-center gap-2">
                                <Icon className="h-4 w-4" />
                                {label}
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Fallback Strategy</Label>
                    <Select 
                      value={formData.fallback_strategy} 
                      onValueChange={(v) => setFormData({ 
                        ...formData, 
                        fallback_strategy: v as RoutingStrategy 
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(ROUTING_STRATEGY_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">
                      Assign to Team {!formData.assign_to_user_id && <span className="text-destructive">*</span>}
                    </Label>
                    <Select 
                      value={formData.assign_to_team_id || '__none__'} 
                      onValueChange={(v) => setFormData({ ...formData, assign_to_team_id: v === '__none__' ? '' : v, assign_to_user_id: '' })}
                    >
                      <SelectTrigger className={!formData.assign_to_team_id && !formData.assign_to_user_id ? 'border-destructive/50' : ''}>
                        <SelectValue placeholder="Select a team" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">— No team selected —</SelectItem>
                        {teams.map(t => (
                          <SelectItem key={t.id} value={t.id}>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }} />
                              {t.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {teams.length === 0 && (
                      <p className="text-xs text-amber-600">
                        No teams created yet. <a href="/team/groups" className="underline">Create a team first</a>.
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">
                      Or Specific Agent {!formData.assign_to_team_id && <span className="text-destructive">*</span>}
                    </Label>
                    <Select 
                      value={formData.assign_to_user_id || '__none__'} 
                      onValueChange={(v) => setFormData({ ...formData, assign_to_user_id: v === '__none__' ? '' : v, assign_to_team_id: '' })}
                    >
                      <SelectTrigger className={!formData.assign_to_team_id && !formData.assign_to_user_id ? 'border-destructive/50' : ''}>
                        <SelectValue placeholder="Select an agent" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">— Use team strategy —</SelectItem>
                        {members.filter(m => m.is_active).map(m => (
                          <SelectItem key={m.id} value={m.user_id}>
                            {m.display_name || m.profile?.full_name || m.profile?.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {!formData.assign_to_team_id && !formData.assign_to_user_id && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    You must select either a team or a specific agent for the rule to work.
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowModal(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={!formData.name.trim() || (!formData.assign_to_team_id && !formData.assign_to_user_id) || submitting}
              >
                {submitting ? 'Saving...' : editingRule ? 'Save Changes' : 'Create Rule'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default TeamRouting;
