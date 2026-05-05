import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import {
  Zap, Filter, MessageSquare, ChevronDown, Clock, Save, PlayCircle, AlertTriangle, X,
  Plus, Trash2, GripVertical, ArrowRight, Tag, User, FileText, Send, Edit, Flag,
  CheckCircle, StickyNote, ClipboardList, Webhook, StopCircle, Timer, Search, Loader2, Check
} from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  WorkflowWithRelations, TriggerType, ConditionType, ActionType, NodeType,
  TRIGGER_DEFINITIONS, CONDITION_DEFINITIONS, ACTION_DEFINITIONS, CONDITION_PRESETS,
  AutomationNode
} from '@/types/automation';

interface WorkflowBuilderProps {
  workflow: WorkflowWithRelations | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (workflow: Partial<WorkflowWithRelations>) => Promise<boolean>;
}

interface WorkflowStep {
  id: string;
  type: NodeType;
  subType: string;
  config: Record<string, any>;
  name?: string;
}

const generateId = () => `step_${Date.now()}_${Math.random().toString(36).substring(7)}`;

export function WorkflowBuilder({ workflow, open, onOpenChange, onSave }: WorkflowBuilderProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [triggerType, setTriggerType] = useState<TriggerType>('first_inbound_message');
  const [triggerConfig, setTriggerConfig] = useState<Record<string, any>>({});
  const [conditions, setConditions] = useState<WorkflowStep[]>([]);
  const [actions, setActions] = useState<WorkflowStep[]>([]);
  const [guardrails, setGuardrails] = useState({
    max_messages_per_hour: 10,
    max_messages_per_contact_per_day: 50,
    cooldown_seconds: 900,
    enforce_opt_in_for_marketing: true,
    stop_on_customer_reply: true,
    stop_on_conversation_closed: true,
  });
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'trigger' | 'conditions' | 'actions' | 'guardrails'>('trigger');

  // Reset form when workflow changes
  useEffect(() => {
    if (open) {
      setName(workflow?.name || 'New Workflow');
      setDescription(workflow?.description || '');
      setTriggerType(workflow?.trigger_type || 'first_inbound_message');
      setTriggerConfig(workflow?.trigger_config || {});
      setGuardrails({
        max_messages_per_hour: workflow?.max_messages_per_hour || 10,
        max_messages_per_contact_per_day: workflow?.max_messages_per_contact_per_day || 50,
        cooldown_seconds: workflow?.cooldown_seconds || 900,
        enforce_opt_in_for_marketing: workflow?.enforce_opt_in_for_marketing ?? true,
        stop_on_customer_reply: workflow?.stop_on_customer_reply ?? true,
        stop_on_conversation_closed: workflow?.stop_on_conversation_closed ?? true,
      });
      
      // Parse nodes into conditions and actions
      const nodes = workflow?.nodes || [];
      const conditionNodes = nodes.filter(n => n.type === 'condition').map(n => ({
        id: n.id,
        type: n.type as NodeType,
        subType: n.config.type || 'contact_has_tag',
        config: n.config,
        name: n.name,
      }));
      const actionNodes = nodes.filter(n => n.type === 'action' || n.type === 'delay').map(n => ({
        id: n.id,
        type: n.type as NodeType,
        subType: n.config.type || 'send_template',
        config: n.config,
        name: n.name,
      }));
      setConditions(conditionNodes);
      setActions(actionNodes);
    }
  }, [workflow, open]);

  // Auto-clear errors as the user fixes the relevant fields
  useEffect(() => {
    setErrors((prev) => {
      const next = { ...prev };
      if (next.name && name.trim()) delete next.name;
      if (next.actions && actions.length > 0) delete next.actions;
      if (next.trigger) {
        if (triggerType === 'keyword_received' && triggerConfig.keywords?.length) delete next.trigger;
        else if ((triggerType === 'tag_added' || triggerType === 'tag_removed') && triggerConfig.tag_name) delete next.trigger;
        else if (!['keyword_received', 'tag_added', 'tag_removed'].includes(triggerType)) delete next.trigger;
      }
      return next;
    });
  }, [name, actions.length, triggerType, triggerConfig]);

  const nameInputRef = useRef<HTMLInputElement>(null);
  const triggerSectionRef = useRef<HTMLDivElement>(null);
  const conditionsSectionRef = useRef<HTMLDivElement>(null);
  const actionsSectionRef = useRef<HTMLDivElement>(null);
  const stickyBarRef = useRef<HTMLDivElement>(null);
  const [savingMode, setSavingMode] = useState<'draft' | 'activate' | null>(null);
  const [errors, setErrors] = useState<{ name?: string; trigger?: string; actions?: string }>({});

  // Scroll element into view, accounting for the mobile sticky action bar height.
  const scrollIntoViewSafe = (el: HTMLElement | null) => {
    if (!el) return;
    const barHeight = stickyBarRef.current?.offsetHeight ?? 0;
    const rect = el.getBoundingClientRect();
    const viewportH = window.innerHeight;
    const safeBottom = viewportH - barHeight - 24;
    if (rect.top < 80 || rect.bottom > safeBottom) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const validate = (activate: boolean) => {
    const errs: { name?: string; trigger?: string; actions?: string } = {};
    if (!name.trim()) errs.name = 'Please enter a workflow name';
    // Trigger-specific required config
    if (triggerType === 'keyword_received' && !(triggerConfig.keywords?.length)) {
      errs.trigger = 'Add at least one keyword for this trigger';
    }
    if ((triggerType === 'tag_added' || triggerType === 'tag_removed') && !triggerConfig.tag_name) {
      errs.trigger = 'Enter a tag name for this trigger';
    }
    if (activate && actions.length === 0) {
      errs.actions = 'Add at least one action before activating';
    }
    return errs;
  };

  const handleSave = async (activate: boolean = false) => {
    const errs = validate(activate);
    setErrors(errs);
    const firstError = errs.name ? 'name' : errs.trigger ? 'trigger' : errs.actions ? 'actions' : null;
    if (firstError) {
      toast.error(errs.name || errs.trigger || errs.actions || 'Please fix the highlighted fields');
      // Scroll first invalid section into view (accounts for sticky bar height)
      requestAnimationFrame(() => {
        if (firstError === 'name') {
          nameInputRef.current?.focus({ preventScroll: true });
          scrollIntoViewSafe(nameInputRef.current);
        } else if (firstError === 'trigger') {
          scrollIntoViewSafe(triggerSectionRef.current);
        } else if (firstError === 'actions') {
          scrollIntoViewSafe(actionsSectionRef.current);
        }
      });
      return;
    }

    setSaving(true);
    setSavingMode(activate ? 'activate' : 'draft');

    // Convert conditions and actions to nodes
    const nodes: Partial<AutomationNode>[] = [
      { type: 'trigger', node_key: 'trigger_1', config: { type: triggerType, ...triggerConfig }, sort_order: 0 },
      ...conditions.map((c, i) => ({
        type: 'condition' as NodeType,
        node_key: `condition_${i + 1}`,
        name: c.name,
        config: { type: c.subType, ...c.config },
        sort_order: i + 1,
      })),
      ...actions.map((a, i) => ({
        type: a.type as NodeType,
        node_key: `action_${i + 1}`,
        name: a.name,
        config: { type: a.subType, ...a.config },
        sort_order: conditions.length + i + 1,
      })),
    ];

    try {
      const success = await onSave({
        id: workflow?.id,
        name,
        description,
        trigger_type: triggerType,
        trigger_config: triggerConfig,
        status: activate ? 'active' : 'draft',
        nodes: nodes as AutomationNode[],
        ...guardrails,
      });
      if (success) {
        toast.success(activate ? 'Workflow activated' : 'Draft saved');
        onOpenChange(false);
      } else {
        toast.error('Failed to save workflow');
      }
    } catch (e: any) {
      toast.error(e?.message || 'Failed to save workflow');
    } finally {
      setSaving(false);
      setSavingMode(null);
    }
  };

  const addCondition = (type: ConditionType) => {
    setConditions([...conditions, { id: generateId(), type: 'condition', subType: type, config: {} }]);
  };

  const addAction = (type: ActionType) => {
    setActions([...actions, { id: generateId(), type: 'action', subType: type, config: {} }]);
  };

  const addDelay = () => {
    setActions([...actions, { 
      id: generateId(), 
      type: 'delay', 
      subType: 'delay', 
      config: { duration: 5, unit: 'minutes' } 
    }]);
  };

  const updateCondition = (id: string, updates: Partial<WorkflowStep>) => {
    setConditions(conditions.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const updateAction = (id: string, updates: Partial<WorkflowStep>) => {
    setActions(actions.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const removeCondition = (id: string) => {
    setConditions(conditions.filter(c => c.id !== id));
  };

  const removeAction = (id: string) => {
    setActions(actions.filter(a => a.id !== id));
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'send_template': return <FileText className="h-4 w-4" />;
      case 'send_interactive': return <Send className="h-4 w-4" />;
      case 'add_tag': return <Tag className="h-4 w-4" />;
      case 'remove_tag': return <Tag className="h-4 w-4" />;
      case 'assign_agent': return <User className="h-4 w-4" />;
      case 'set_priority': return <Flag className="h-4 w-4" />;
      case 'set_status': return <CheckCircle className="h-4 w-4" />;
      case 'update_contact_attr': return <Edit className="h-4 w-4" />;
      case 'add_internal_note': return <StickyNote className="h-4 w-4" />;
      case 'create_task': return <ClipboardList className="h-4 w-4" />;
      case 'call_webhook': return <Webhook className="h-4 w-4" />;
      case 'stop_workflow': return <StopCircle className="h-4 w-4" />;
      case 'delay': return <Timer className="h-4 w-4" />;
      default: return <Zap className="h-4 w-4" />;
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-4xl p-0 flex flex-col max-h-[100dvh] overflow-hidden">
        <SheetHeader className="px-3 xs:px-4 sm:px-6 py-3 xs:py-4 border-b flex-shrink-0">
          <div className="flex flex-col xs:flex-row xs:items-center gap-3 xs:gap-4">
            <div className="flex-1 min-w-0">
              <Input
                ref={nameInputRef}
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={saving}
                className={`text-base xs:text-lg font-semibold border-none p-0 h-auto focus-visible:ring-0 ${errors.name ? 'placeholder:text-destructive/70' : ''}`}
                placeholder="Workflow Name *"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? 'wf-name-error' : undefined}
              />
              {errors.name && (
                <p id="wf-name-error" className="text-[11px] text-destructive mt-0.5">{errors.name}</p>
              )}
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="text-xs xs:text-sm text-muted-foreground border-none p-0 h-auto focus-visible:ring-0 mt-0.5 xs:mt-1"
                placeholder="Add description..."
              />
            </div>
            <div className="hidden xs:flex gap-2 flex-shrink-0">
              <Button variant="outline" size="sm" onClick={() => handleSave(false)} disabled={saving} className="text-xs xs:text-sm h-9 min-w-[110px]">
                {savingMode === 'draft' ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                {savingMode === 'draft' ? 'Saving…' : 'Save Draft'}
              </Button>
              <Button size="sm" onClick={() => handleSave(true)} disabled={saving} className="text-xs xs:text-sm h-9 min-w-[110px]">
                {savingMode === 'activate' ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <PlayCircle className="h-4 w-4 mr-2" />}
                {savingMode === 'activate' ? 'Activating…' : 'Activate'}
              </Button>
            </div>
          </div>

          {/* Mobile step progress / completion indicators */}
          <div className="xs:hidden mt-3 flex items-center gap-2">
            {[
              { key: 'trigger', label: 'Trigger', done: !!triggerType },
              { key: 'conditions', label: 'Conditions', done: conditions.length > 0, optional: true },
              { key: 'actions', label: 'Actions', done: actions.length > 0 },
            ].map((s, i) => (
              <div key={s.key} className="flex-1 flex flex-col items-center gap-1">
                <div className={`w-full h-1.5 rounded-full ${s.done ? 'bg-primary' : 'bg-muted'}`} />
                <div className="flex items-center gap-1 text-[10px] font-medium">
                  <span className={`inline-flex items-center justify-center w-4 h-4 rounded-full ${s.done ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                    {s.done ? <Check className="h-2.5 w-2.5" /> : i + 1}
                  </span>
                  <span className={s.done ? 'text-foreground' : 'text-muted-foreground'}>
                    {s.label}{s.optional ? '' : ' *'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 overflow-auto">
          <fieldset
            disabled={saving}
            className={`p-3 xs:p-4 sm:p-6 space-y-4 xs:space-y-5 sm:space-y-6 pb-32 xs:pb-6 border-0 m-0 min-w-0 transition-opacity ${saving ? 'opacity-70 cursor-wait' : ''}`}
          >
            {/* WHEN - Trigger Section */}
            <Card ref={triggerSectionRef} className={`border-primary/50 ${errors.trigger ? 'ring-2 ring-destructive ring-offset-2 ring-offset-background' : ''}`}>
              <Collapsible defaultOpen>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors p-3 xs:p-4 sm:p-6">
                    <div className="flex items-center gap-2 xs:gap-3">
                      <div className="p-1.5 xs:p-2 rounded-lg bg-primary text-primary-foreground flex-shrink-0">
                        <Zap className="h-4 w-4 xs:h-5 xs:w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-sm xs:text-base flex items-center gap-1.5 xs:gap-2 flex-wrap">
                          WHEN <Badge variant="secondary" className="text-[10px] xs:text-xs truncate max-w-[120px] xs:max-w-none">{TRIGGER_DEFINITIONS[triggerType]?.label}</Badge>
                        </CardTitle>
                        <p className="text-xs xs:text-sm text-muted-foreground line-clamp-1">{TRIGGER_DEFINITIONS[triggerType]?.description}</p>
                      </div>
                      <ChevronDown className="h-4 w-4 xs:h-5 xs:w-5 text-muted-foreground flex-shrink-0" />
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0 px-3 xs:px-4 sm:px-6 pb-3 xs:pb-4 sm:pb-6 space-y-3 xs:space-y-4">
                    <div>
                      <Label className="text-xs xs:text-sm">Select Trigger</Label>
                      <Select value={triggerType} onValueChange={(v) => { setTriggerType(v as TriggerType); setTriggerConfig({}); }}>
                        <SelectTrigger className="h-9 xs:h-10 text-sm"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {Object.entries(TRIGGER_DEFINITIONS).map(([type, def]) => (
                            <SelectItem key={type} value={type}>{def.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Trigger-specific config */}
                    {triggerType === 'keyword_received' && (
                      <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 xs:gap-4 p-3 xs:p-4 bg-muted/50 rounded-lg">
                        <div>
                          <Label className="text-xs xs:text-sm">Keywords (comma separated)</Label>
                          <Input
                            value={triggerConfig.keywords?.join(', ') || ''}
                            onChange={(e) => setTriggerConfig({ ...triggerConfig, keywords: e.target.value.split(',').map(k => k.trim()).filter(Boolean) })}
                            placeholder="MENU, HELP, STATUS"
                            className="h-9 xs:h-10 text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs xs:text-sm">Match Type</Label>
                          <Select value={triggerConfig.match_type || 'exact'} onValueChange={(v) => setTriggerConfig({ ...triggerConfig, match_type: v })}>
                            <SelectTrigger className="h-9 xs:h-10 text-sm"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="exact">Exact Match</SelectItem>
                              <SelectItem value="contains">Contains</SelectItem>
                              <SelectItem value="regex">Regex Pattern</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}

                    {triggerType === 'inactivity_no_reply' && (
                      <div className="p-3 xs:p-4 bg-muted/50 rounded-lg">
                        <Label className="text-xs xs:text-sm">Wait Time (minutes)</Label>
                        <Input
                          type="number"
                          value={triggerConfig.minutes || 30}
                          onChange={(e) => setTriggerConfig({ ...triggerConfig, minutes: parseInt(e.target.value) })}
                          className="w-full xs:w-32 h-9 xs:h-10 text-sm"
                        />
                      </div>
                    )}

                    {(triggerType === 'tag_added' || triggerType === 'tag_removed') && (
                      <div className="p-3 xs:p-4 bg-muted/50 rounded-lg">
                        <Label className="text-xs xs:text-sm">Tag Name</Label>
                        <Input
                          value={triggerConfig.tag_name || ''}
                          onChange={(e) => setTriggerConfig({ ...triggerConfig, tag_name: e.target.value })}
                          placeholder="VIP, Lead, Support"
                          className="h-9 xs:h-10 text-sm"
                        />
                      </div>
                    )}

                    {triggerType === 'scheduled_time' && (
                      <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 xs:gap-4 p-3 xs:p-4 bg-muted/50 rounded-lg">
                        <div>
                          <Label className="text-xs xs:text-sm">Time</Label>
                          <Input
                            type="time"
                            value={triggerConfig.time || '09:00'}
                            onChange={(e) => setTriggerConfig({ ...triggerConfig, time: e.target.value })}
                            className="h-9 xs:h-10 text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs xs:text-sm">Repeat</Label>
                          <Select value={triggerConfig.repeat || 'daily'} onValueChange={(v) => setTriggerConfig({ ...triggerConfig, repeat: v })}>
                            <SelectTrigger className="h-9 xs:h-10 text-sm"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="daily">Daily</SelectItem>
                              <SelectItem value="weekdays">Weekdays Only</SelectItem>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>

            <div className="flex justify-center"><ArrowRight className="h-4 w-4 xs:h-5 xs:w-5 text-muted-foreground rotate-90" /></div>

            {/* IF - Conditions Section */}
            <Card className="border-amber-500/50">
              <Collapsible defaultOpen>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors p-3 xs:p-4 sm:p-6">
                    <div className="flex items-center gap-2 xs:gap-3">
                      <div className="p-1.5 xs:p-2 rounded-lg bg-amber-500 text-white flex-shrink-0">
                        <Filter className="h-4 w-4 xs:h-5 xs:w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-sm xs:text-base flex items-center gap-1.5 xs:gap-2 flex-wrap">
                          IF <Badge variant="secondary" className="text-[10px] xs:text-xs">{conditions.length} condition{conditions.length !== 1 ? 's' : ''}</Badge>
                        </CardTitle>
                        <p className="text-xs xs:text-sm text-muted-foreground line-clamp-1">Optional filters to control when actions run</p>
                      </div>
                      <ChevronDown className="h-4 w-4 xs:h-5 xs:w-5 text-muted-foreground flex-shrink-0" />
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0 px-3 xs:px-4 sm:px-6 pb-3 xs:pb-4 sm:pb-6 space-y-3 xs:space-y-4">
                    {/* Quick Presets */}
                    <div className="flex flex-wrap gap-1.5 xs:gap-2">
                      {CONDITION_PRESETS.map(preset => (
                        <Button
                          key={preset.id}
                          variant="outline"
                          size="sm"
                          className="text-xs h-9 xs:h-8"
                          onClick={() => {
                            preset.conditions.forEach(c => addCondition(c.type));
                          }}
                        >
                          {preset.name}
                        </Button>
                      ))}
                    </div>

                    {/* Conditions List */}
                    {conditions.length > 0 && (
                      <div className="space-y-2 xs:space-y-3">
                        {conditions.map((condition, index) => (
                          <div key={condition.id} className="flex items-start gap-2 xs:gap-3 p-2.5 xs:p-3 sm:p-4 bg-muted/50 rounded-lg">
                            <GripVertical className="h-4 w-4 xs:h-5 xs:w-5 text-muted-foreground mt-2 cursor-move flex-shrink-0 hidden xs:block" />
                            <div className="flex-1 space-y-2 xs:space-y-3 min-w-0">
                              <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 xs:gap-3">
                                {index > 0 && (
                                  <Select value={condition.config.operator || 'and'} onValueChange={(v) => updateCondition(condition.id, { config: { ...condition.config, operator: v } })}>
                                    <SelectTrigger className="w-full xs:w-20 h-10 xs:h-9 text-xs xs:text-sm"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="and">AND</SelectItem>
                                      <SelectItem value="or">OR</SelectItem>
                                    </SelectContent>
                                  </Select>
                                )}
                                <Select value={condition.subType} onValueChange={(v) => updateCondition(condition.id, { subType: v, config: {} })}>
                                  <SelectTrigger className="flex-1 h-10 xs:h-9 text-xs xs:text-sm"><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    {Object.entries(CONDITION_DEFINITIONS).map(([type, def]) => (
                                      <SelectItem key={type} value={type}>{def.label}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              {/* Condition-specific config */}
                              {(condition.subType === 'contact_has_tag' || condition.subType === 'contact_not_has_tag') && (
                                <Input
                                  value={condition.config.tag_name || ''}
                                  onChange={(e) => updateCondition(condition.id, { config: { ...condition.config, tag_name: e.target.value } })}
                                  placeholder="Tag name (e.g., VIP)"
                                  className="h-10 xs:h-9 text-sm"
                                />
                              )}

                              {(condition.subType === 'contact_attr_eq' || condition.subType === 'contact_attr_contains') && (
                                <div className="grid grid-cols-1 xs:grid-cols-2 gap-2">
                                  <Input
                                    value={condition.config.attribute || ''}
                                    onChange={(e) => updateCondition(condition.id, { config: { ...condition.config, attribute: e.target.value } })}
                                    placeholder="Attribute (e.g., country)"
                                    className="h-10 xs:h-9 text-sm"
                                  />
                                  <Input
                                    value={condition.config.value || ''}
                                    onChange={(e) => updateCondition(condition.id, { config: { ...condition.config, value: e.target.value } })}
                                    placeholder="Value"
                                    className="h-10 xs:h-9 text-sm"
                                  />
                                </div>
                              )}

                              {condition.subType === 'time_window' && (
                                <Select value={condition.config.window || 'business_hours'} onValueChange={(v) => updateCondition(condition.id, { config: { ...condition.config, window: v } })}>
                                  <SelectTrigger className="h-10 xs:h-9 text-sm"><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="business_hours">During Business Hours</SelectItem>
                                    <SelectItem value="after_hours">After Hours</SelectItem>
                                    <SelectItem value="weekend">Weekend Only</SelectItem>
                                  </SelectContent>
                                </Select>
                              )}

                              {condition.subType === 'conversation_status_in' && (
                                <Select value={condition.config.status || 'open'} onValueChange={(v) => updateCondition(condition.id, { config: { ...condition.config, status: v } })}>
                                  <SelectTrigger className="h-10 xs:h-9 text-sm"><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="open">Open</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="closed">Closed</SelectItem>
                                  </SelectContent>
                                </Select>
                              )}
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => removeCondition(condition.id)} className="h-9 w-9 xs:h-8 xs:w-8 flex-shrink-0">
                              <Trash2 className="h-3.5 w-3.5 xs:h-4 xs:w-4 text-destructive" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add Condition */}
                    <Select onValueChange={(v) => addCondition(v as ConditionType)}>
                      <SelectTrigger className="border-dashed h-10 xs:h-9 text-xs xs:text-sm">
                        <Plus className="h-3.5 w-3.5 xs:h-4 xs:w-4 mr-1.5 xs:mr-2" />
                        Add Condition
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(CONDITION_DEFINITIONS).map(([type, def]) => (
                          <SelectItem key={type} value={type}>{def.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>

            <div className="flex justify-center"><ArrowRight className="h-4 w-4 xs:h-5 xs:w-5 text-muted-foreground rotate-90" /></div>

            {/* THEN - Actions Section */}
            <Card className="border-green-500/50">
              <Collapsible defaultOpen>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors p-3 xs:p-4 sm:p-6">
                    <div className="flex items-center gap-2 xs:gap-3">
                      <div className="p-1.5 xs:p-2 rounded-lg bg-green-500 text-white flex-shrink-0">
                        <MessageSquare className="h-4 w-4 xs:h-5 xs:w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-sm xs:text-base flex items-center gap-1.5 xs:gap-2 flex-wrap">
                          THEN <Badge variant="secondary" className="text-[10px] xs:text-xs">{actions.length} action{actions.length !== 1 ? 's' : ''}</Badge>
                        </CardTitle>
                        <p className="text-xs xs:text-sm text-muted-foreground line-clamp-1">What should happen when conditions are met</p>
                      </div>
                      <ChevronDown className="h-4 w-4 xs:h-5 xs:w-5 text-muted-foreground flex-shrink-0" />
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0 px-3 xs:px-4 sm:px-6 pb-3 xs:pb-4 sm:pb-6 space-y-3 xs:space-y-4">
                    {/* Actions List */}
                    {actions.length > 0 && (
                      <div className="space-y-2 xs:space-y-3">
                        {actions.map((action, index) => (
                          <div key={action.id} className="flex items-start gap-2 xs:gap-3 p-2.5 xs:p-3 sm:p-4 bg-muted/50 rounded-lg">
                            <div className="flex items-center gap-1.5 xs:gap-2 flex-shrink-0">
                              <GripVertical className="h-4 w-4 xs:h-5 xs:w-5 text-muted-foreground cursor-move hidden xs:block" />
                              <span className="text-xs xs:text-sm text-muted-foreground w-5 xs:w-6">{index + 1}.</span>
                            </div>
                            <div className="p-1.5 xs:p-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 flex-shrink-0">
                              {getActionIcon(action.subType)}
                            </div>
                            <div className="flex-1 space-y-2 xs:space-y-3 min-w-0">
                              <div className="flex items-center gap-2 xs:gap-3">
                                <Select value={action.subType} onValueChange={(v) => updateAction(action.id, { subType: v, type: v === 'delay' ? 'delay' : 'action', config: {} })}>
                                  <SelectTrigger className="flex-1 h-10 xs:h-9 text-xs xs:text-sm"><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="delay">⏱ Wait / Delay</SelectItem>
                                    <Separator className="my-1" />
                                    {Object.entries(ACTION_DEFINITIONS).map(([type, def]) => (
                                      <SelectItem key={type} value={type}>{def.label}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              {/* Action-specific config */}
                              {action.subType === 'delay' && (
                                <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2">
                                  <div className="flex gap-2">
                                    <Input
                                      type="number"
                                      value={action.config.duration || 5}
                                      onChange={(e) => updateAction(action.id, { config: { ...action.config, duration: parseInt(e.target.value) } })}
                                      className="w-20 xs:w-24 h-10 xs:h-9 text-sm"
                                      min={1}
                                    />
                                    <Select value={action.config.unit || 'minutes'} onValueChange={(v) => updateAction(action.id, { config: { ...action.config, unit: v } })}>
                                      <SelectTrigger className="w-24 xs:w-32 h-10 xs:h-9 text-xs xs:text-sm"><SelectValue /></SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="seconds">Seconds</SelectItem>
                                        <SelectItem value="minutes">Minutes</SelectItem>
                                        <SelectItem value="hours">Hours</SelectItem>
                                        <SelectItem value="days">Days</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Switch
                                      id={`bh-${action.id}`}
                                      checked={action.config.business_hours_only}
                                      onCheckedChange={(c) => updateAction(action.id, { config: { ...action.config, business_hours_only: c } })}
                                    />
                                    <Label htmlFor={`bh-${action.id}`} className="text-xs xs:text-sm">Business hours</Label>
                                  </div>
                                </div>
                              )}

                              {action.subType === 'send_template' && (
                                <div className="grid grid-cols-1 xs:grid-cols-2 gap-2">
                                  <Input
                                    value={action.config.template_name || ''}
                                    onChange={(e) => updateAction(action.id, { config: { ...action.config, template_name: e.target.value } })}
                                    placeholder="Template name"
                                    className="h-10 xs:h-9 text-sm"
                                  />
                                  <Select value={action.config.language || 'en'} onValueChange={(v) => updateAction(action.id, { config: { ...action.config, language: v } })}>
                                    <SelectTrigger className="h-10 xs:h-9 text-xs xs:text-sm"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="en">English</SelectItem>
                                      <SelectItem value="es">Spanish</SelectItem>
                                      <SelectItem value="pt">Portuguese</SelectItem>
                                      <SelectItem value="fr">French</SelectItem>
                                      <SelectItem value="de">German</SelectItem>
                                      <SelectItem value="ar">Arabic</SelectItem>
                                      <SelectItem value="hi">Hindi</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              )}

                              {(action.subType === 'add_tag' || action.subType === 'remove_tag') && (
                                <Input
                                  value={action.config.tag_name || ''}
                                  onChange={(e) => updateAction(action.id, { config: { ...action.config, tag_name: e.target.value } })}
                                  placeholder="Tag name"
                                  className="h-10 xs:h-9 text-sm"
                                />
                              )}

                              {action.subType === 'assign_agent' && (
                                <div className="grid grid-cols-1 xs:grid-cols-2 gap-2">
                                  <Select value={action.config.strategy || 'round_robin'} onValueChange={(v) => updateAction(action.id, { config: { ...action.config, strategy: v } })}>
                                    <SelectTrigger className="h-10 xs:h-9 text-xs xs:text-sm"><SelectValue placeholder="Assignment strategy" /></SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="round_robin">Round Robin</SelectItem>
                                      <SelectItem value="least_busy">Least Busy</SelectItem>
                                      <SelectItem value="specific">Specific Agent</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <Input
                                    value={action.config.team_id || ''}
                                    onChange={(e) => updateAction(action.id, { config: { ...action.config, team_id: e.target.value } })}
                                    placeholder="Team ID (optional)"
                                    className="h-10 xs:h-9 text-sm"
                                  />
                                </div>
                              )}

                              {action.subType === 'set_priority' && (
                                <Select value={action.config.priority || 'medium'} onValueChange={(v) => updateAction(action.id, { config: { ...action.config, priority: v } })}>
                                  <SelectTrigger className="h-10 xs:h-9 text-sm"><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="low">Low Priority</SelectItem>
                                    <SelectItem value="medium">Medium Priority</SelectItem>
                                    <SelectItem value="high">High Priority</SelectItem>
                                  </SelectContent>
                                </Select>
                              )}

                              {action.subType === 'set_status' && (
                                <Select value={action.config.status || 'open'} onValueChange={(v) => updateAction(action.id, { config: { ...action.config, status: v } })}>
                                  <SelectTrigger className="h-10 xs:h-9 text-sm"><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="open">Open</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="closed">Closed</SelectItem>
                                  </SelectContent>
                                </Select>
                              )}

                              {action.subType === 'update_contact_attr' && (
                                <div className="grid grid-cols-1 xs:grid-cols-2 gap-2">
                                  <Input
                                    value={action.config.attribute || ''}
                                    onChange={(e) => updateAction(action.id, { config: { ...action.config, attribute: e.target.value } })}
                                    placeholder="Field name"
                                    className="h-10 xs:h-9 text-sm"
                                  />
                                  <Input
                                    value={action.config.value || ''}
                                    onChange={(e) => updateAction(action.id, { config: { ...action.config, value: e.target.value } })}
                                    placeholder="Value"
                                    className="h-10 xs:h-9 text-sm"
                                  />
                                </div>
                              )}

                              {action.subType === 'add_internal_note' && (
                                <Textarea
                                  value={action.config.note || ''}
                                  onChange={(e) => updateAction(action.id, { config: { ...action.config, note: e.target.value } })}
                                  placeholder="Internal note content..."
                                  rows={2}
                                  className="text-sm"
                                />
                              )}

                              {action.subType === 'create_task' && (
                                <div className="grid grid-cols-1 xs:grid-cols-2 gap-2">
                                  <Input
                                    value={action.config.task_title || ''}
                                    onChange={(e) => updateAction(action.id, { config: { ...action.config, task_title: e.target.value } })}
                                    placeholder="Task title"
                                    className="h-10 xs:h-9 text-sm"
                                  />
                                  <Select value={action.config.task_due || 'tomorrow'} onValueChange={(v) => updateAction(action.id, { config: { ...action.config, task_due: v } })}>
                                    <SelectTrigger className="h-10 xs:h-9 text-xs xs:text-sm"><SelectValue placeholder="Due date" /></SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="now">Now</SelectItem>
                                      <SelectItem value="1_hour">In 1 hour</SelectItem>
                                      <SelectItem value="tomorrow">Tomorrow</SelectItem>
                                      <SelectItem value="next_business_hour">Next business hour</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              )}

                              {action.subType === 'call_webhook' && (
                                <div className="space-y-2">
                                  <div className="flex gap-2">
                                    <Select value={action.config.method || 'POST'} onValueChange={(v) => updateAction(action.id, { config: { ...action.config, method: v } })}>
                                      <SelectTrigger className="w-20 xs:w-24 h-10 xs:h-9 text-xs xs:text-sm"><SelectValue /></SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="POST">POST</SelectItem>
                                        <SelectItem value="PUT">PUT</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <Input
                                      value={action.config.url || ''}
                                      onChange={(e) => updateAction(action.id, { config: { ...action.config, url: e.target.value } })}
                                      placeholder="https://api.example.com/webhook"
                                      className="flex-1 h-10 xs:h-9 text-sm"
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => removeAction(action.id)} className="h-9 w-9 xs:h-8 xs:w-8 flex-shrink-0">
                              <Trash2 className="h-3.5 w-3.5 xs:h-4 xs:w-4 text-destructive" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add Action */}
                    <div className="flex gap-2">
                      <Select onValueChange={(v) => v === 'delay' ? addDelay() : addAction(v as ActionType)}>
                        <SelectTrigger className="flex-1 border-dashed h-10 xs:h-9 text-xs xs:text-sm">
                          <Plus className="h-3.5 w-3.5 xs:h-4 xs:w-4 mr-1.5 xs:mr-2" />
                          Add Action
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="delay">⏱ Wait / Delay</SelectItem>
                          <Separator className="my-1" />
                          {Object.entries(ACTION_DEFINITIONS).map(([type, def]) => (
                            <SelectItem key={type} value={type}>{def.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>

            <Separator />

            {/* Safety Guardrails */}
            <Card>
              <Collapsible>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors p-3 xs:p-4 sm:p-6">
                    <div className="flex items-center gap-2 xs:gap-3">
                      <div className="p-1.5 xs:p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 flex-shrink-0">
                        <AlertTriangle className="h-4 w-4 xs:h-5 xs:w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-sm xs:text-base">Safety Guardrails</CardTitle>
                        <p className="text-xs xs:text-sm text-muted-foreground">Rate limits and safety controls</p>
                      </div>
                      <ChevronDown className="h-4 w-4 xs:h-5 xs:w-5 text-muted-foreground flex-shrink-0" />
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0 px-3 xs:px-4 sm:px-6 pb-3 xs:pb-4 sm:pb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 xs:gap-5 sm:gap-6">
                      <div className="space-y-3 xs:space-y-4">
                        <div>
                          <Label className="text-xs xs:text-sm">Max messages per hour</Label>
                          <Input
                            type="number"
                            value={guardrails.max_messages_per_hour}
                            onChange={(e) => setGuardrails({ ...guardrails, max_messages_per_hour: parseInt(e.target.value) })}
                            className="h-10 xs:h-9 sm:h-10 text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs xs:text-sm">Max messages per contact per day</Label>
                          <Input
                            type="number"
                            value={guardrails.max_messages_per_contact_per_day}
                            onChange={(e) => setGuardrails({ ...guardrails, max_messages_per_contact_per_day: parseInt(e.target.value) })}
                            className="h-10 xs:h-9 sm:h-10 text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs xs:text-sm">Cooldown between runs (seconds)</Label>
                          <Input
                            type="number"
                            value={guardrails.cooldown_seconds}
                            onChange={(e) => setGuardrails({ ...guardrails, cooldown_seconds: parseInt(e.target.value) })}
                            className="h-10 xs:h-9 sm:h-10 text-sm"
                          />
                        </div>
                      </div>
                      <div className="space-y-2 xs:space-y-3 sm:space-y-4">
                        <div className="flex items-center justify-between gap-3 p-2 xs:p-2.5 sm:p-3 bg-muted/50 rounded-lg">
                          <div className="min-w-0 flex-1">
                            <Label className="text-xs xs:text-sm">Require Marketing Opt-in</Label>
                            <p className="text-[10px] xs:text-xs text-muted-foreground line-clamp-1">Only send to opted-in contacts</p>
                          </div>
                          <Switch
                            checked={guardrails.enforce_opt_in_for_marketing}
                            onCheckedChange={(c) => setGuardrails({ ...guardrails, enforce_opt_in_for_marketing: c })}
                          />
                        </div>
                        <div className="flex items-center justify-between gap-3 p-2 xs:p-2.5 sm:p-3 bg-muted/50 rounded-lg">
                          <div className="min-w-0 flex-1">
                            <Label className="text-xs xs:text-sm">Stop on Customer Reply</Label>
                            <p className="text-[10px] xs:text-xs text-muted-foreground line-clamp-1">Cancel pending actions when customer responds</p>
                          </div>
                          <Switch
                            checked={guardrails.stop_on_customer_reply}
                            onCheckedChange={(c) => setGuardrails({ ...guardrails, stop_on_customer_reply: c })}
                          />
                        </div>
                        <div className="flex items-center justify-between gap-3 p-2 xs:p-2.5 sm:p-3 bg-muted/50 rounded-lg">
                          <div className="min-w-0 flex-1">
                            <Label className="text-xs xs:text-sm">Stop on Conversation Close</Label>
                            <p className="text-[10px] xs:text-xs text-muted-foreground line-clamp-1">Cancel pending actions when conversation closes</p>
                          </div>
                          <Switch
                            checked={guardrails.stop_on_conversation_closed}
                            onCheckedChange={(c) => setGuardrails({ ...guardrails, stop_on_conversation_closed: c })}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          </fieldset>
        </ScrollArea>

        {/* Sticky mobile action bar */}
        <div ref={stickyBarRef} className="xs:hidden flex-shrink-0 border-t bg-background/95 backdrop-blur px-3 py-2.5 flex items-center gap-2 pb-[calc(0.625rem+env(safe-area-inset-bottom))]">
          <Button variant="outline" size="lg" onClick={() => handleSave(false)} disabled={saving} className="flex-1 h-11">
            {savingMode === 'draft' ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            {savingMode === 'draft' ? 'Saving…' : 'Draft'}
          </Button>
          <Button size="lg" onClick={() => handleSave(true)} disabled={saving} className="flex-1 h-11">
            {savingMode === 'activate' ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <PlayCircle className="h-4 w-4 mr-2" />}
            {savingMode === 'activate' ? 'Activating…' : 'Activate'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
