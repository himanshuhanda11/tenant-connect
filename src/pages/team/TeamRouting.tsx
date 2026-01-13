import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { 
  Route, Plus, Edit, Trash2, ArrowRight, GripVertical,
  Tag, MessageSquare, User, Users, Zap
} from 'lucide-react';
import { useRoutingRules, useTeams, useTeamMembers } from '@/hooks/useTeam';
import { ROUTING_STRATEGY_LABELS } from '@/types/team';
import type { RoutingRule, RoutingStrategy } from '@/types/team';

const CONDITION_TYPES = [
  { value: 'tag', label: 'Has Tag', icon: Tag },
  { value: 'keyword', label: 'Keyword Match', icon: MessageSquare },
  { value: 'source', label: 'Contact Source', icon: User },
  { value: 'language', label: 'Language', icon: MessageSquare },
  { value: 'intent', label: 'AI Intent', icon: Zap },
  { value: 'vip', label: 'VIP Contact', icon: User },
];

const TeamRouting = () => {
  const { rules, loading, createRule, updateRule, deleteRule } = useRoutingRules();
  const { teams } = useTeams();
  const { members } = useTeamMembers();
  const [showModal, setShowModal] = useState(false);
  const [editingRule, setEditingRule] = useState<RoutingRule | null>(null);
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

  const handleSubmit = () => {
    const data = {
      ...formData,
      assign_to_team_id: formData.assign_to_team_id || null,
      assign_to_user_id: formData.assign_to_user_id || null,
    };

    if (editingRule) {
      updateRule(editingRule.id, data);
    } else {
      createRule(data);
    }
    setShowModal(false);
    resetForm();
    setEditingRule(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this routing rule?')) {
      deleteRule(id);
    }
  };

  const handleToggleActive = (rule: RoutingRule) => {
    updateRule(rule.id, { is_active: !rule.is_active });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Routing & Assignment</h1>
            <p className="text-muted-foreground">
              Configure how conversations are automatically assigned
            </p>
          </div>
          <Button onClick={handleOpenCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Create Rule
          </Button>
        </div>

        {/* Routing Strategies Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Routing Strategies</CardTitle>
            <CardDescription>Available assignment methods</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Object.entries(ROUTING_STRATEGY_LABELS).map(([key, label]) => (
                <div key={key} className="p-3 border rounded-lg text-center">
                  <p className="font-medium text-sm">{label}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {key === 'round_robin' && 'Evenly distribute'}
                    {key === 'least_busy' && 'Fewest open chats'}
                    {key === 'skill_based' && 'Match skills/language'}
                    {key === 'vip_routing' && 'Priority customers'}
                    {key === 'manual' && 'Admin assigns'}
                    {key === 'overflow' && 'Backup queue'}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Assignment Safeguards */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Assignment Safeguards</CardTitle>
            <CardDescription>Global settings to prevent overload</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label>Max Open Chats per Agent</Label>
                <Input type="number" defaultValue={10} className="w-full" />
                <p className="text-xs text-muted-foreground">
                  Won't assign more if agent reaches this limit
                </p>
              </div>
              <div className="space-y-2">
                <Label>Auto-Reassign if Offline (minutes)</Label>
                <Input type="number" defaultValue={15} className="w-full" />
                <p className="text-xs text-muted-foreground">
                  Reassign to next agent if offline for this long
                </p>
              </div>
              <div className="space-y-2">
                <Label>Enable Overflow Queue</Label>
                <div className="flex items-center gap-2 pt-2">
                  <Switch defaultChecked />
                  <span className="text-sm text-muted-foreground">
                    Keep unassigned if no agent available
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rules List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Routing Rules</CardTitle>
            <CardDescription>
              Rules are evaluated in priority order (lower number = higher priority)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : rules.length === 0 ? (
              <div className="text-center py-12">
                <Route className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <h3 className="text-lg font-medium mb-2">No routing rules</h3>
                <p className="text-muted-foreground mb-4">
                  Create rules to automatically route conversations
                </p>
                <Button onClick={handleOpenCreate}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create your first rule
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {rules.sort((a, b) => a.priority - b.priority).map((rule, index) => (
                  <div 
                    key={rule.id}
                    className={`flex items-center gap-4 p-4 border rounded-lg ${
                      !rule.is_active ? 'opacity-50' : ''
                    }`}
                  >
                    <div className="cursor-move text-muted-foreground">
                      <GripVertical className="h-5 w-5" />
                    </div>
                    <Badge variant="outline" className="min-w-[40px] justify-center">
                      {rule.priority}
                    </Badge>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{rule.name}</p>
                        {!rule.is_active && (
                          <Badge variant="secondary">Disabled</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                        <span>IF {rule.condition_type}</span>
                        <ArrowRight className="h-4 w-4" />
                        <span>
                          THEN {ROUTING_STRATEGY_LABELS[rule.strategy]} to{' '}
                          {rule.team?.name || rule.user?.full_name || 'Default'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch 
                        checked={rule.is_active} 
                        onCheckedChange={() => handleToggleActive(rule)}
                      />
                      <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(rule)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDelete(rule.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create/Edit Modal */}
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>{editingRule ? 'Edit Routing Rule' : 'Create Routing Rule'}</DialogTitle>
              <DialogDescription>
                Define conditions and assignment strategy
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Rule Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., VIP to Managers"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Input
                    type="number"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="What does this rule do?"
                />
              </div>

              {/* Condition */}
              <div className="p-4 border rounded-lg space-y-3">
                <Label className="text-sm font-medium">IF Condition</Label>
                <Select 
                  value={formData.condition_type} 
                  onValueChange={(v) => setFormData({ ...formData, condition_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CONDITION_TYPES.map(ct => (
                      <SelectItem key={ct.value} value={ct.value}>
                        <div className="flex items-center gap-2">
                          <ct.icon className="h-4 w-4" />
                          {ct.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.condition_type === 'tag' && (
                  <Input
                    placeholder="Tag name (e.g., VIP)"
                    value={formData.condition_config.tag_name || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      condition_config: { ...formData.condition_config, tag_name: e.target.value }
                    })}
                  />
                )}
                {formData.condition_type === 'keyword' && (
                  <Input
                    placeholder="Keywords (comma-separated)"
                    value={formData.condition_config.keywords || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      condition_config: { ...formData.condition_config, keywords: e.target.value }
                    })}
                  />
                )}
              </div>

              {/* Assignment */}
              <div className="p-4 border rounded-lg space-y-3">
                <Label className="text-sm font-medium">THEN Assign</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Strategy</Label>
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
                        {Object.entries(ROUTING_STRATEGY_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Fallback</Label>
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
                    <Label className="text-xs">Assign to Team</Label>
                    <Select 
                      value={formData.assign_to_team_id} 
                      onValueChange={(v) => setFormData({ ...formData, assign_to_team_id: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Any team" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any team</SelectItem>
                        {teams.map(t => (
                          <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Or Specific Agent</Label>
                    <Select 
                      value={formData.assign_to_user_id} 
                      onValueChange={(v) => setFormData({ ...formData, assign_to_user_id: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Use strategy" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Use strategy</SelectItem>
                        {members.map(m => (
                          <SelectItem key={m.id} value={m.user_id}>
                            {m.display_name || m.profile?.full_name || m.profile?.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={!formData.name}>
                {editingRule ? 'Save Changes' : 'Create Rule'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default TeamRouting;
