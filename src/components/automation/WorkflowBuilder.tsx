import { useState, useCallback } from 'react';
import { 
  Zap, 
  Filter, 
  MessageSquare, 
  Plus, 
  X, 
  ChevronRight,
  Clock,
  Tag,
  UserPlus,
  Search,
  MousePointer,
  Send,
  Eye,
  Target,
  Timer,
  CheckCircle,
  Activity,
  Shield,
  Edit,
  Flag,
  ClipboardList,
  StickyNote,
  Webhook,
  StopCircle,
  ArrowLeftRight,
  User as UserIcon,
  Save,
  PlayCircle,
  AlertTriangle
} from 'lucide-react';
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle 
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Workflow, 
  TriggerType, 
  ConditionType, 
  ActionType,
  TriggerConfig,
  ConditionConfig,
  ActionConfig,
  TRIGGER_DEFINITIONS, 
  CONDITION_DEFINITIONS, 
  ACTION_DEFINITIONS,
  CONDITION_PRESETS,
  WorkflowGuardrails
} from '@/types/automation';

const ICON_MAP: Record<string, React.ElementType> = {
  UserPlus, Search, Tag, TagOff: Tag, Clock, Timer, MessageSquare, CheckCircle,
  UserCheck: UserIcon, MousePointer, Send, Eye, Target, Equal: ArrowLeftRight,
  ArrowLeftRight, User: UserIcon, Activity, Shield, FileText: MessageSquare,
  LayoutList: MessageSquare, TagPlus: Tag, TagMinus: Tag, Flag, ClipboardList,
  StickyNote, Webhook, Edit, StopCircle, MessageCircle: MessageSquare,
};

interface WorkflowBuilderProps {
  workflow: Workflow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (workflow: Partial<Workflow>) => Promise<boolean>;
}

export function WorkflowBuilder({ workflow, open, onOpenChange, onSave }: WorkflowBuilderProps) {
  const [name, setName] = useState(workflow?.name || 'New Workflow');
  const [description, setDescription] = useState(workflow?.description || '');
  const [trigger, setTrigger] = useState<TriggerConfig>(
    workflow?.trigger || { type: 'first_inbound_message', config: {} }
  );
  const [conditions, setConditions] = useState<ConditionConfig[]>(workflow?.conditions || []);
  const [actions, setActions] = useState<ActionConfig[]>(
    workflow?.actions || [{ id: '1', type: 'send_template', config: {}, order: 1 }]
  );
  const [guardrails, setGuardrails] = useState<WorkflowGuardrails>(
    workflow?.guardrails || {
      max_messages_per_hour: 10,
      max_messages_per_day: 50,
      cooldown_minutes: 15,
      require_opt_in: false,
      stop_on_reply: false,
      safe_mode: false,
    }
  );
  const [activePanel, setActivePanel] = useState<'trigger' | 'condition' | 'action' | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async (activate: boolean = false) => {
    setSaving(true);
    const success = await onSave({
      id: workflow?.id,
      name,
      description,
      trigger,
      conditions,
      actions,
      guardrails,
      status: activate ? 'active' : 'draft',
    });
    setSaving(false);
    if (success) {
      onOpenChange(false);
    }
  };

  const addCondition = (type: ConditionType) => {
    setConditions([
      ...conditions,
      { id: `c-${Date.now()}`, type, operator: 'and', config: {} },
    ]);
  };

  const removeCondition = (id: string) => {
    setConditions(conditions.filter(c => c.id !== id));
  };

  const addAction = (type: ActionType) => {
    setActions([
      ...actions,
      { id: `a-${Date.now()}`, type, config: {}, order: actions.length + 1 },
    ]);
  };

  const removeAction = (id: string) => {
    setActions(actions.filter(a => a.id !== id));
  };

  const generateSummary = () => {
    const triggerDef = TRIGGER_DEFINITIONS[trigger.type];
    const conditionsSummary = conditions.length > 0
      ? ` when ${conditions.map(c => CONDITION_DEFINITIONS[c.type]?.label).join(' and ')}`
      : '';
    const actionsSummary = actions.map(a => ACTION_DEFINITIONS[a.type]?.label).join(', then ');
    
    return `${triggerDef?.label}${conditionsSummary}, then ${actionsSummary}`;
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-3xl p-0 flex flex-col">
        <SheetHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle>Workflow Builder</SheetTitle>
              <SheetDescription>Create and configure your automation workflow</SheetDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => handleSave(false)} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </Button>
              <Button onClick={() => handleSave(true)} disabled={saving}>
                <PlayCircle className="h-4 w-4 mr-2" />
                Activate
              </Button>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Available Items */}
          <div className="w-64 border-r bg-muted/30 flex flex-col">
            <Tabs defaultValue="triggers" className="flex-1 flex flex-col">
              <TabsList className="grid grid-cols-3 m-2">
                <TabsTrigger value="triggers" className="text-xs">
                  <Zap className="h-3 w-3 mr-1" />
                  Triggers
                </TabsTrigger>
                <TabsTrigger value="conditions" className="text-xs">
                  <Filter className="h-3 w-3 mr-1" />
                  If
                </TabsTrigger>
                <TabsTrigger value="actions" className="text-xs">
                  <MessageSquare className="h-3 w-3 mr-1" />
                  Then
                </TabsTrigger>
              </TabsList>

              <ScrollArea className="flex-1">
                <TabsContent value="triggers" className="m-0 p-2 space-y-1">
                  {Object.entries(TRIGGER_DEFINITIONS).map(([type, def]) => {
                    const Icon = ICON_MAP[def.icon] || Zap;
                    return (
                      <button
                        key={type}
                        onClick={() => setTrigger({ type: type as TriggerType, config: {} })}
                        className={`w-full text-left p-2 rounded-md text-sm transition-colors
                          ${trigger.type === type 
                            ? 'bg-primary text-primary-foreground' 
                            : 'hover:bg-muted'}`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 shrink-0" />
                          <span className="truncate">{def.label}</span>
                        </div>
                      </button>
                    );
                  })}
                </TabsContent>

                <TabsContent value="conditions" className="m-0 p-2">
                  <div className="mb-3">
                    <p className="text-xs text-muted-foreground mb-2">Presets</p>
                    <div className="space-y-1">
                      {CONDITION_PRESETS.map(preset => (
                        <button
                          key={preset.id}
                          onClick={() => {
                            preset.conditions.forEach(c => {
                              addCondition(c.type);
                            });
                          }}
                          className="w-full text-left p-2 rounded-md text-sm hover:bg-muted flex items-center gap-2"
                        >
                          <Badge variant="outline" className="text-xs">{preset.name}</Badge>
                        </button>
                      ))}
                    </div>
                  </div>
                  <Separator className="my-2" />
                  <div className="space-y-1">
                    {Object.entries(CONDITION_DEFINITIONS).map(([type, def]) => {
                      const Icon = ICON_MAP[def.icon] || Filter;
                      return (
                        <button
                          key={type}
                          onClick={() => addCondition(type as ConditionType)}
                          className="w-full text-left p-2 rounded-md text-sm hover:bg-muted"
                        >
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 shrink-0" />
                            <span className="truncate">{def.label}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </TabsContent>

                <TabsContent value="actions" className="m-0 p-2 space-y-1">
                  {Object.entries(ACTION_DEFINITIONS).map(([type, def]) => {
                    const Icon = ICON_MAP[def.icon] || MessageSquare;
                    return (
                      <button
                        key={type}
                        onClick={() => addAction(type as ActionType)}
                        className="w-full text-left p-2 rounded-md text-sm hover:bg-muted"
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 shrink-0" />
                          <span className="truncate">{def.label}</span>
                        </div>
                      </button>
                    );
                  })}
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </div>

          {/* Center - Flow Builder */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <ScrollArea className="flex-1 p-6">
              {/* Workflow Info */}
              <div className="mb-6 space-y-4">
                <div>
                  <Label htmlFor="workflow-name">Workflow Name</Label>
                  <Input
                    id="workflow-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter workflow name"
                  />
                </div>
                <div>
                  <Label htmlFor="workflow-desc">Description (optional)</Label>
                  <Textarea
                    id="workflow-desc"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What does this workflow do?"
                    rows={2}
                  />
                </div>
              </div>

              {/* Workflow Summary */}
              <Card className="mb-6 bg-muted/50">
                <CardContent className="p-3">
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Summary:</strong> {generateSummary()}
                  </p>
                </CardContent>
              </Card>

              {/* Trigger */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-primary">
                    <Zap className="h-3 w-3 mr-1" />
                    WHEN
                  </Badge>
                </div>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <Zap className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{TRIGGER_DEFINITIONS[trigger.type]?.label}</p>
                        <p className="text-sm text-muted-foreground">
                          {TRIGGER_DEFINITIONS[trigger.type]?.description}
                        </p>
                      </div>
                    </div>

                    {/* Trigger config based on type */}
                    {trigger.type === 'keyword_received' && (
                      <div className="mt-4 space-y-3">
                        <div>
                          <Label>Keywords (comma separated)</Label>
                          <Input
                            value={trigger.config.keywords?.join(', ') || ''}
                            onChange={(e) => setTrigger({
                              ...trigger,
                              config: { ...trigger.config, keywords: e.target.value.split(',').map(k => k.trim()) }
                            })}
                            placeholder="MENU, HELP, STATUS"
                          />
                        </div>
                        <div>
                          <Label>Match Type</Label>
                          <Select
                            value={trigger.config.match_type || 'exact'}
                            onValueChange={(v) => setTrigger({
                              ...trigger,
                              config: { ...trigger.config, match_type: v }
                            })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="exact">Exact Match</SelectItem>
                              <SelectItem value="contains">Contains</SelectItem>
                              <SelectItem value="regex">Regex</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}

                    {trigger.type === 'inactivity' && (
                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <div>
                          <Label>Duration</Label>
                          <Input
                            type="number"
                            value={trigger.config.minutes || 30}
                            onChange={(e) => setTrigger({
                              ...trigger,
                              config: { ...trigger.config, minutes: parseInt(e.target.value) }
                            })}
                          />
                        </div>
                        <div>
                          <Label>Unit</Label>
                          <Select
                            value={trigger.config.unit || 'minutes'}
                            onValueChange={(v) => setTrigger({
                              ...trigger,
                              config: { ...trigger.config, unit: v }
                            })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="minutes">Minutes</SelectItem>
                              <SelectItem value="hours">Hours</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}

                    {trigger.type === 'tag_added' && (
                      <div className="mt-4">
                        <Label>Tag Name</Label>
                        <Input
                          value={trigger.config.tag || ''}
                          onChange={(e) => setTrigger({
                            ...trigger,
                            config: { ...trigger.config, tag: e.target.value }
                          })}
                          placeholder="VIP"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Arrow */}
              <div className="flex justify-center my-2">
                <ChevronRight className="h-5 w-5 text-muted-foreground rotate-90" />
              </div>

              {/* Conditions */}
              {conditions.length > 0 && (
                <>
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary">
                        <Filter className="h-3 w-3 mr-1" />
                        IF
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      {conditions.map((condition, index) => (
                        <Card key={condition.id}>
                          <CardContent className="p-3">
                            <div className="flex items-center gap-3">
                              {index > 0 && (
                                <Badge variant="outline" className="text-xs">AND</Badge>
                              )}
                              <div className="p-1.5 rounded bg-secondary">
                                <Filter className="h-4 w-4" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium">
                                  {CONDITION_DEFINITIONS[condition.type]?.label}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => removeCondition(condition.id)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-center my-2">
                    <ChevronRight className="h-5 w-5 text-muted-foreground rotate-90" />
                  </div>
                </>
              )}

              {/* Actions */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-green-600">
                    <MessageSquare className="h-3 w-3 mr-1" />
                    THEN
                  </Badge>
                </div>
                <div className="space-y-2">
                  {actions.map((action, index) => (
                    <Card key={action.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          {index > 0 && (
                            <Badge variant="outline" className="text-xs">THEN</Badge>
                          )}
                          <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                            <MessageSquare className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{ACTION_DEFINITIONS[action.type]?.label}</p>
                            <p className="text-xs text-muted-foreground">
                              {ACTION_DEFINITIONS[action.type]?.description}
                            </p>
                          </div>
                          {actions.length > 1 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => removeAction(action.id)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          )}
                        </div>

                        {/* Action config */}
                        {action.type === 'send_template' && (
                          <div className="space-y-3 pt-3 border-t">
                            <div>
                              <Label>Template Name</Label>
                              <Input
                                value={action.config.template_name || ''}
                                onChange={(e) => {
                                  const updated = actions.map(a => 
                                    a.id === action.id 
                                      ? { ...a, config: { ...a.config, template_name: e.target.value } }
                                      : a
                                  );
                                  setActions(updated);
                                }}
                                placeholder="Select a template"
                              />
                            </div>
                          </div>
                        )}

                        {action.type === 'add_tag' && (
                          <div className="pt-3 border-t">
                            <Label>Tag Name</Label>
                            <Input
                              value={action.config.tag || ''}
                              onChange={(e) => {
                                const updated = actions.map(a => 
                                  a.id === action.id 
                                    ? { ...a, config: { ...a.config, tag: e.target.value } }
                                    : a
                                );
                                setActions(updated);
                              }}
                              placeholder="Welcome Sent"
                            />
                          </div>
                        )}

                        {action.type === 'delay' && (
                          <div className="pt-3 border-t grid grid-cols-2 gap-3">
                            <div>
                              <Label>Wait Time</Label>
                              <Input
                                type="number"
                                value={action.config.duration || 1}
                                onChange={(e) => {
                                  const updated = actions.map(a => 
                                    a.id === action.id 
                                      ? { ...a, config: { ...a.config, duration: parseInt(e.target.value) } }
                                      : a
                                  );
                                  setActions(updated);
                                }}
                              />
                            </div>
                            <div>
                              <Label>Unit</Label>
                              <Select
                                value={action.config.unit || 'hours'}
                                onValueChange={(v) => {
                                  const updated = actions.map(a => 
                                    a.id === action.id 
                                      ? { ...a, config: { ...a.config, unit: v } }
                                      : a
                                  );
                                  setActions(updated);
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="minutes">Minutes</SelectItem>
                                  <SelectItem value="hours">Hours</SelectItem>
                                  <SelectItem value="days">Days</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="col-span-2 flex items-center gap-2">
                              <Switch
                                checked={action.config.business_hours_only || false}
                                onCheckedChange={(checked) => {
                                  const updated = actions.map(a => 
                                    a.id === action.id 
                                      ? { ...a, config: { ...a.config, business_hours_only: checked } }
                                      : a
                                  );
                                  setActions(updated);
                                }}
                              />
                              <Label className="text-sm">Only during business hours</Label>
                            </div>
                          </div>
                        )}

                        {action.type === 'add_internal_note' && (
                          <div className="pt-3 border-t">
                            <Label>Note</Label>
                            <Textarea
                              value={action.config.note || ''}
                              onChange={(e) => {
                                const updated = actions.map(a => 
                                  a.id === action.id 
                                    ? { ...a, config: { ...a.config, note: e.target.value } }
                                    : a
                                );
                                setActions(updated);
                              }}
                              placeholder="Internal note for team"
                              rows={2}
                            />
                          </div>
                        )}

                        {action.type === 'create_task' && (
                          <div className="pt-3 border-t space-y-3">
                            <div>
                              <Label>Task Title</Label>
                              <Input
                                value={action.config.title || ''}
                                onChange={(e) => {
                                  const updated = actions.map(a => 
                                    a.id === action.id 
                                      ? { ...a, config: { ...a.config, title: e.target.value } }
                                      : a
                                  );
                                  setActions(updated);
                                }}
                                placeholder="Follow up with customer"
                              />
                            </div>
                            <div>
                              <Label>Due</Label>
                              <Select
                                value={action.config.due || 'tomorrow'}
                                onValueChange={(v) => {
                                  const updated = actions.map(a => 
                                    a.id === action.id 
                                      ? { ...a, config: { ...a.config, due: v } }
                                      : a
                                  );
                                  setActions(updated);
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="now">Immediately</SelectItem>
                                  <SelectItem value="1_hour">In 1 hour</SelectItem>
                                  <SelectItem value="tomorrow">Tomorrow</SelectItem>
                                  <SelectItem value="next_business_hour">Next business hour</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        )}

                        {action.type === 'assign_agent' && (
                          <div className="pt-3 border-t space-y-3">
                            <div>
                              <Label>Assignment Strategy</Label>
                              <Select
                                value={action.config.strategy || 'round_robin'}
                                onValueChange={(v) => {
                                  const updated = actions.map(a => 
                                    a.id === action.id 
                                      ? { ...a, config: { ...a.config, strategy: v } }
                                      : a
                                  );
                                  setActions(updated);
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="round_robin">Round Robin</SelectItem>
                                  <SelectItem value="least_busy">Least Busy</SelectItem>
                                  <SelectItem value="specific">Specific Agent/Team</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        )}

                        {action.type === 'set_priority' && (
                          <div className="pt-3 border-t">
                            <Label>Priority Level</Label>
                            <Select
                              value={action.config.priority || 'medium'}
                              onValueChange={(v) => {
                                const updated = actions.map(a => 
                                  a.id === action.id 
                                    ? { ...a, config: { ...a.config, priority: v } }
                                    : a
                                );
                                setActions(updated);
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        {action.type === 'call_webhook' && (
                          <div className="pt-3 border-t space-y-3">
                            <div>
                              <Label>Webhook URL</Label>
                              <Input
                                value={action.config.url || ''}
                                onChange={(e) => {
                                  const updated = actions.map(a => 
                                    a.id === action.id 
                                      ? { ...a, config: { ...a.config, url: e.target.value } }
                                      : a
                                  );
                                  setActions(updated);
                                }}
                                placeholder="https://api.yourcrm.com/webhook"
                              />
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Guardrails */}
              <Separator className="my-6" />
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <h3 className="font-medium">Safety Guardrails</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4 space-y-4">
                      <div>
                        <Label>Max messages per hour</Label>
                        <Input
                          type="number"
                          value={guardrails.max_messages_per_hour}
                          onChange={(e) => setGuardrails({
                            ...guardrails,
                            max_messages_per_hour: parseInt(e.target.value)
                          })}
                        />
                      </div>
                      <div>
                        <Label>Max messages per day</Label>
                        <Input
                          type="number"
                          value={guardrails.max_messages_per_day}
                          onChange={(e) => setGuardrails({
                            ...guardrails,
                            max_messages_per_day: parseInt(e.target.value)
                          })}
                        />
                      </div>
                      <div>
                        <Label>Cooldown (minutes)</Label>
                        <Input
                          type="number"
                          value={guardrails.cooldown_minutes}
                          onChange={(e) => setGuardrails({
                            ...guardrails,
                            cooldown_minutes: parseInt(e.target.value)
                          })}
                        />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>Require opt-in for marketing</Label>
                        <Switch
                          checked={guardrails.require_opt_in}
                          onCheckedChange={(checked) => setGuardrails({
                            ...guardrails,
                            require_opt_in: checked
                          })}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Stop on customer reply</Label>
                        <Switch
                          checked={guardrails.stop_on_reply}
                          onCheckedChange={(checked) => setGuardrails({
                            ...guardrails,
                            stop_on_reply: checked
                          })}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Safe mode (test only)</Label>
                        <Switch
                          checked={guardrails.safe_mode}
                          onCheckedChange={(checked) => setGuardrails({
                            ...guardrails,
                            safe_mode: checked
                          })}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
