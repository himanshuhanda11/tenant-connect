import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  FileText,
  ChevronDown,
  Plus,
  Trash2,
  Shield,
  Clock,
  Zap,
  MessageSquare,
  Search,
  Facebook,
  QrCode,
  Globe,
  Tag,
  Sparkles,
  X,
} from 'lucide-react';
import { useFormRules } from '@/hooks/useFormRules';
import { useTemplates } from '@/hooks/useTemplates';
import { 
  FORM_RULE_TRIGGER_OPTIONS, 
  FORM_RULE_CONDITION_OPTIONS,
  type FormRule,
  type FormRuleTriggerType,
  type FormRuleCondition,
  type FormRuleTriggerConfig,
} from '@/types/formRule';
import { cn } from '@/lib/utils';

interface CreateFormRuleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingRule?: FormRule | null;
}

const triggerIconMap: Record<string, React.ElementType> = {
  first_message: MessageSquare,
  keyword: Search,
  ad_click: Facebook,
  qr_scan: QrCode,
  source: Globe,
  tag_added: Tag,
  scheduled: Clock,
};

export function CreateFormRuleModal({ open, onOpenChange, editingRule }: CreateFormRuleModalProps) {
  const { createRule, updateRule } = useFormRules();
  const { templates } = useTemplates();
  const [saving, setSaving] = useState(false);
  const [guardrailsOpen, setGuardrailsOpen] = useState(false);
  const [conditionsOpen, setConditionsOpen] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [triggerType, setTriggerType] = useState<FormRuleTriggerType>('first_message');
  const [triggerConfig, setTriggerConfig] = useState<FormRuleTriggerConfig>({});
  const [formId, setFormId] = useState<string>('');
  const [conditions, setConditions] = useState<FormRuleCondition[]>([]);
  const [cooldownMinutes, setCooldownMinutes] = useState(60);
  const [maxSendsPerDay, setMaxSendsPerDay] = useState(1);
  const [requireOptIn, setRequireOptIn] = useState(true);
  const [businessHoursOnly, setBusinessHoursOnly] = useState(false);
  const [isActive, setIsActive] = useState(true);

  // Keyword input state
  const [keywordInput, setKeywordInput] = useState('');

  // Reset form when modal opens/closes or editing rule changes
  useEffect(() => {
    if (open) {
      if (editingRule) {
        setName(editingRule.name);
        setDescription(editingRule.description || '');
        setTriggerType(editingRule.trigger_type);
        setTriggerConfig(editingRule.trigger_config || {});
        setFormId(editingRule.form_id || '');
        setConditions(editingRule.conditions || []);
        setCooldownMinutes(editingRule.cooldown_minutes);
        setMaxSendsPerDay(editingRule.max_sends_per_contact_per_day);
        setRequireOptIn(editingRule.require_opt_in);
        setBusinessHoursOnly(editingRule.business_hours_only);
        setIsActive(editingRule.is_active);
      } else {
        setName('');
        setDescription('');
        setTriggerType('first_message');
        setTriggerConfig({});
        setFormId('');
        setConditions([]);
        setCooldownMinutes(60);
        setMaxSendsPerDay(1);
        setRequireOptIn(true);
        setBusinessHoursOnly(false);
        setIsActive(true);
      }
      setKeywordInput('');
    }
  }, [open, editingRule]);

  const handleSubmit = async () => {
    if (!name.trim() || !formId) return;

    setSaving(true);
    try {
      const ruleData = {
        name: name.trim(),
        description: description.trim() || null,
        trigger_type: triggerType,
        trigger_config: triggerConfig,
        form_id: formId,
        conditions,
        cooldown_minutes: cooldownMinutes,
        max_sends_per_contact_per_day: maxSendsPerDay,
        require_opt_in: requireOptIn,
        business_hours_only: businessHoursOnly,
        is_active: isActive,
      };

      if (editingRule) {
        await updateRule(editingRule.id, ruleData);
      } else {
        await createRule(ruleData);
      }
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  const addKeyword = () => {
    if (keywordInput.trim()) {
      const currentKeywords = triggerConfig.keywords || [];
      if (!currentKeywords.includes(keywordInput.trim().toLowerCase())) {
        setTriggerConfig({
          ...triggerConfig,
          keywords: [...currentKeywords, keywordInput.trim().toLowerCase()],
        });
      }
      setKeywordInput('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setTriggerConfig({
      ...triggerConfig,
      keywords: (triggerConfig.keywords || []).filter(k => k !== keyword),
    });
  };

  const addCondition = () => {
    setConditions([
      ...conditions,
      { id: crypto.randomUUID(), type: 'has_tag', config: {}, operator: 'and' },
    ]);
    setConditionsOpen(true);
  };

  const removeCondition = (id: string) => {
    setConditions(conditions.filter(c => c.id !== id));
  };

  const updateCondition = (id: string, updates: Partial<FormRuleCondition>) => {
    setConditions(conditions.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const selectedTrigger = FORM_RULE_TRIGGER_OPTIONS.find(t => t.value === triggerType);
  const TriggerIcon = triggerIconMap[triggerType] || Zap;

  // Filter to only show form/survey templates
  const formTemplates = templates.filter(t => 
    t.name.toLowerCase().includes('form') || t.name.toLowerCase().includes('survey') || templates.length > 0
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 border-b bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-lg">
                {editingRule ? 'Edit Form Rule' : 'Create Auto-Form Rule'}
              </DialogTitle>
              <DialogDescription className="text-xs mt-0.5">
                Automatically send forms based on triggers
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-180px)]">
          <div className="px-4 sm:px-6 py-4 space-y-5">
            {/* Basic Info */}
            <div className="space-y-3">
              <div>
                <Label htmlFor="name" className="text-sm font-medium">Rule Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Welcome Form for New Leads"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What does this rule do?"
                  className="mt-1.5 h-16 resize-none"
                />
              </div>
            </div>

            <Separator />

            {/* Trigger Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                Trigger
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {FORM_RULE_TRIGGER_OPTIONS.slice(0, 6).map(option => {
                  const Icon = triggerIconMap[option.value];
                  const isSelected = triggerType === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setTriggerType(option.value);
                        setTriggerConfig({});
                      }}
                      className={cn(
                        "flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-center",
                        isSelected 
                          ? "bg-primary/10 border-primary shadow-sm" 
                          : "border-border hover:border-primary/30 hover:bg-muted/50"
                      )}
                    >
                      <Icon className={cn("w-5 h-5", isSelected ? "text-primary" : "text-muted-foreground")} />
                      <span className={cn("text-[10px] sm:text-xs font-medium", isSelected ? "text-primary" : "text-muted-foreground")}>
                        {option.label}
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground">{selectedTrigger?.description}</p>

              {/* Trigger-specific config */}
              {triggerType === 'keyword' && (
                <div className="space-y-2 p-3 rounded-lg bg-muted/50 border">
                  <Label className="text-xs font-medium">Keywords</Label>
                  <div className="flex gap-2">
                    <Input
                      value={keywordInput}
                      onChange={(e) => setKeywordInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                      placeholder="Type keyword and press Enter"
                      className="h-8 text-sm"
                    />
                    <Button type="button" size="sm" variant="secondary" onClick={addKeyword}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  {triggerConfig.keywords && triggerConfig.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {triggerConfig.keywords.map(keyword => (
                        <Badge key={keyword} variant="secondary" className="text-xs gap-1">
                          {keyword}
                          <button onClick={() => removeKeyword(keyword)} className="hover:text-destructive">
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {triggerType === 'source' && (
                <div className="space-y-2 p-3 rounded-lg bg-muted/50 border">
                  <Label className="text-xs font-medium">Traffic Sources</Label>
                  <Select
                    value={triggerConfig.sources?.[0] || ''}
                    onValueChange={(val) => setTriggerConfig({ ...triggerConfig, sources: [val] })}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="meta_ads">Meta Ads</SelectItem>
                      <SelectItem value="qr_code">QR Code</SelectItem>
                      <SelectItem value="organic">Organic</SelectItem>
                      <SelectItem value="website">Website Widget</SelectItem>
                      <SelectItem value="api">API</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <Separator />

            {/* Form Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                Form/Template to Send *
              </Label>
              <Select value={formId} onValueChange={setFormId}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select a form template" />
                </SelectTrigger>
                <SelectContent>
                  {formTemplates.length === 0 ? (
                    <SelectItem value="" disabled>No form templates available</SelectItem>
                  ) : (
                    formTemplates.map(template => (
                      <SelectItem key={template.id} value={template.id}>
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <span>{template.name}</span>
                          <Badge variant="outline" className="text-[10px] ml-1">{template.status}</Badge>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {templates.length === 0 && (
                <p className="text-xs text-amber-600 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Create a form template first in Templates section
                </p>
              )}
            </div>

            {/* Conditions (Collapsible) */}
            <Collapsible open={conditionsOpen} onOpenChange={setConditionsOpen}>
              <CollapsibleTrigger asChild>
                <button className="flex items-center justify-between w-full p-3 rounded-lg bg-muted/50 border hover:bg-muted transition-colors">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Conditions</span>
                    {conditions.length > 0 && (
                      <Badge variant="secondary" className="text-[10px]">{conditions.length}</Badge>
                    )}
                  </div>
                  <ChevronDown className={cn("w-4 h-4 transition-transform", conditionsOpen && "rotate-180")} />
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-3 space-y-2">
                {conditions.map((condition, idx) => (
                  <div key={condition.id} className="flex items-center gap-2 p-2 rounded-lg border bg-card">
                    {idx > 0 && (
                      <Select
                        value={condition.operator}
                        onValueChange={(val: 'and' | 'or') => updateCondition(condition.id, { operator: val })}
                      >
                        <SelectTrigger className="w-16 h-7 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="and">AND</SelectItem>
                          <SelectItem value="or">OR</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                    <Select
                      value={condition.type}
                      onValueChange={(val: FormRuleCondition['type']) => updateCondition(condition.id, { type: val })}
                    >
                      <SelectTrigger className="flex-1 h-7 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FORM_RULE_CONDITION_OPTIONS.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={() => removeCondition(condition.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={addCondition} className="w-full">
                  <Plus className="w-4 h-4 mr-1.5" />
                  Add Condition
                </Button>
              </CollapsibleContent>
            </Collapsible>

            {/* Guardrails (Collapsible) */}
            <Collapsible open={guardrailsOpen} onOpenChange={setGuardrailsOpen}>
              <CollapsibleTrigger asChild>
                <button className="flex items-center justify-between w-full p-3 rounded-lg bg-muted/50 border hover:bg-muted transition-colors">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Safety Guardrails</span>
                  </div>
                  <ChevronDown className={cn("w-4 h-4 transition-transform", guardrailsOpen && "rotate-180")} />
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-3 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Cooldown (minutes)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={cooldownMinutes}
                      onChange={(e) => setCooldownMinutes(Number(e.target.value))}
                      className="h-8 mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Max Sends/Day</Label>
                    <Input
                      type="number"
                      min={1}
                      value={maxSendsPerDay}
                      onChange={(e) => setMaxSendsPerDay(Number(e.target.value))}
                      className="h-8 mt-1"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg border">
                  <div>
                    <p className="text-sm font-medium">Require Opt-in</p>
                    <p className="text-xs text-muted-foreground">Only send to opted-in contacts</p>
                  </div>
                  <Switch checked={requireOptIn} onCheckedChange={setRequireOptIn} />
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg border">
                  <div>
                    <p className="text-sm font-medium">Business Hours Only</p>
                    <p className="text-xs text-muted-foreground">Respect business hours schedule</p>
                  </div>
                  <Switch checked={businessHoursOnly} onCheckedChange={setBusinessHoursOnly} />
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Active Toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20">
              <div>
                <p className="text-sm font-medium">Activate Rule</p>
                <p className="text-xs text-muted-foreground">Start sending forms immediately</p>
              </div>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
            </div>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-4 border-t bg-muted/30 flex items-center justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving || !name.trim() || !formId}>
            {saving ? 'Saving...' : editingRule ? 'Update Rule' : 'Create Rule'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
