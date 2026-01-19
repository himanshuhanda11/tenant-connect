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
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  FileText,
  ChevronLeft,
  ChevronRight,
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
  Eye,
  Check,
  AlertCircle,
  Brain,
  Send,
  User,
  Ban,
  RefreshCcw,
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

const STEPS = [
  { id: 1, title: 'Trigger', subtitle: 'WHEN', icon: Zap },
  { id: 2, title: 'Conditions', subtitle: 'IF', icon: Search },
  { id: 3, title: 'Form', subtitle: 'THEN', icon: FileText },
  { id: 4, title: 'Safety', subtitle: 'GUARD', icon: Shield },
  { id: 5, title: 'Review', subtitle: 'SAVE', icon: Check },
];

const triggerIconMap: Record<string, React.ElementType> = {
  first_message: MessageSquare,
  keyword: Search,
  ad_click: Facebook,
  qr_scan: QrCode,
  source: Globe,
  tag_added: Tag,
  scheduled: Clock,
  ai_intent: Brain,
};

const triggerColorMap: Record<string, { bg: string; text: string; border: string }> = {
  first_message: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
  keyword: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' },
  ad_click: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-200' },
  qr_scan: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' },
  source: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200' },
  tag_added: { bg: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-200' },
  scheduled: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200' },
  ai_intent: { bg: 'bg-violet-50', text: 'text-violet-600', border: 'border-violet-200' },
};

// Extended trigger options with AI Intent
const EXTENDED_TRIGGER_OPTIONS = [
  ...FORM_RULE_TRIGGER_OPTIONS,
  { 
    value: 'ai_intent' as FormRuleTriggerType, 
    label: 'AI Intent', 
    description: 'When AI detects specific user intent',
    icon: 'Brain',
    color: 'violet',
    isPro: true,
  },
];

export function CreateFormRuleModal({ open, onOpenChange, editingRule }: CreateFormRuleModalProps) {
  const { createRule, updateRule } = useFormRules();
  const { templates } = useTemplates();
  const [saving, setSaving] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [triggerType, setTriggerType] = useState<FormRuleTriggerType>('first_message');
  const [triggerConfig, setTriggerConfig] = useState<FormRuleTriggerConfig>({});
  const [formId, setFormId] = useState<string>('');
  const [introMessage, setIntroMessage] = useState('');
  const [delaySeconds, setDelaySeconds] = useState(0);
  const [conditions, setConditions] = useState<FormRuleCondition[]>([]);
  
  // Safety controls
  const [sendOncePerUser, setSendOncePerUser] = useState(true);
  const [stopOnAgentReply, setStopOnAgentReply] = useState(true);
  const [stopOnFreeText, setStopOnFreeText] = useState(false);
  const [cooldownMinutes, setCooldownMinutes] = useState(60);
  const [fallbackMessage, setFallbackMessage] = useState('');
  const [requireOptIn, setRequireOptIn] = useState(true);
  const [businessHoursOnly, setBusinessHoursOnly] = useState(false);
  const [isActive, setIsActive] = useState(true);

  // Keyword input state
  const [keywordInput, setKeywordInput] = useState('');

  // Reset form when modal opens/closes or editing rule changes
  useEffect(() => {
    if (open) {
      setCurrentStep(1);
      if (editingRule) {
        setName(editingRule.name);
        setDescription(editingRule.description || '');
        setTriggerType(editingRule.trigger_type);
        setTriggerConfig(editingRule.trigger_config || {});
        setFormId(editingRule.form_id || '');
        setConditions(editingRule.conditions || []);
        setCooldownMinutes(editingRule.cooldown_minutes);
        setRequireOptIn(editingRule.require_opt_in);
        setBusinessHoursOnly(editingRule.business_hours_only);
        setIsActive(editingRule.is_active);
        // Extract safety controls from config if present
        setSendOncePerUser(editingRule.max_sends_per_contact_per_day === 1);
        setStopOnAgentReply((editingRule.trigger_config as any)?.stop_on_agent_reply ?? true);
        setStopOnFreeText((editingRule.trigger_config as any)?.stop_on_free_text ?? false);
        setIntroMessage((editingRule.form_variables as any)?.intro_message || '');
        setDelaySeconds((editingRule.trigger_config as any)?.delay_seconds || 0);
        setFallbackMessage((editingRule.form_variables as any)?.fallback_message || '');
      } else {
        setName('');
        setDescription('');
        setTriggerType('first_message');
        setTriggerConfig({});
        setFormId('');
        setConditions([]);
        setCooldownMinutes(60);
        setRequireOptIn(true);
        setBusinessHoursOnly(false);
        setIsActive(true);
        setSendOncePerUser(true);
        setStopOnAgentReply(true);
        setStopOnFreeText(false);
        setIntroMessage('');
        setDelaySeconds(0);
        setFallbackMessage('');
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
        trigger_config: {
          ...triggerConfig,
          stop_on_agent_reply: stopOnAgentReply,
          stop_on_free_text: stopOnFreeText,
          delay_seconds: delaySeconds,
        },
        form_id: formId,
        form_variables: {
          intro_message: introMessage,
          fallback_message: fallbackMessage,
        },
        conditions,
        cooldown_minutes: cooldownMinutes,
        max_sends_per_contact_per_day: sendOncePerUser ? 1 : 999,
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
  };

  const removeCondition = (id: string) => {
    setConditions(conditions.filter(c => c.id !== id));
  };

  const updateCondition = (id: string, updates: Partial<FormRuleCondition>) => {
    setConditions(conditions.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const selectedTrigger = EXTENDED_TRIGGER_OPTIONS.find(t => t.value === triggerType);
  const TriggerIcon = triggerIconMap[triggerType] || Zap;
  const selectedForm = templates.find(t => t.id === formId);

  const canProceed = () => {
    switch (currentStep) {
      case 1: return !!triggerType;
      case 2: return true; // Conditions are optional
      case 3: return !!formId;
      case 4: return true; // Safety has defaults
      case 5: return !!name.trim() && !!formId;
      default: return false;
    }
  };

  const progress = (currentStep / STEPS.length) * 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] sm:max-h-[85vh] p-0 overflow-hidden w-[95vw] sm:w-full">
        {/* Header */}
        <DialogHeader className="px-3 sm:px-6 pt-3 sm:pt-6 pb-2 sm:pb-3 border-b bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-base sm:text-lg truncate">
                {editingRule ? 'Edit Auto-Form Rule' : 'Create Auto-Form Rule'}
              </DialogTitle>
              <DialogDescription className="text-[10px] sm:text-xs mt-0.5 truncate">
                Automatically send WhatsApp Forms based on user intent
              </DialogDescription>
            </div>
          </div>
          
          {/* Step Indicator */}
          <div className="mt-3 sm:mt-4">
            <div className="flex items-center justify-between mb-2 px-1">
              {STEPS.map((step, idx) => {
                const StepIcon = step.icon;
                const isActive = currentStep === step.id;
                const isComplete = currentStep > step.id;
                return (
                  <button
                    key={step.id}
                    onClick={() => step.id <= currentStep && setCurrentStep(step.id)}
                    disabled={step.id > currentStep}
                    className={cn(
                      "flex flex-col items-center gap-0.5 sm:gap-1 transition-all touch-manipulation",
                      isActive && "scale-105",
                      step.id > currentStep && "opacity-40"
                    )}
                  >
                    <div className={cn(
                      "w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center transition-all",
                      isComplete ? "bg-green-500 text-white" :
                      isActive ? "bg-primary text-primary-foreground shadow-lg" :
                      "bg-muted text-muted-foreground"
                    )}>
                      {isComplete ? <Check className="w-3 h-3 sm:w-4 sm:h-4" /> : <StepIcon className="w-3 h-3 sm:w-4 sm:h-4" />}
                    </div>
                    <span className={cn(
                      "text-[8px] sm:text-[10px] font-semibold uppercase tracking-wide",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )}>
                      {step.subtitle}
                    </span>
                  </button>
                );
              })}
            </div>
            <Progress value={progress} className="h-1" />
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 max-h-[calc(90vh-240px)] sm:max-h-[calc(85vh-280px)]">
          <div className="px-3 sm:px-6 py-4 sm:py-5">
            
            {/* Step 1: Trigger Selection */}
            {currentStep === 1 && (
              <div className="space-y-3 sm:space-y-4">
                <div className="text-center mb-4 sm:mb-6">
                  <h3 className="text-base sm:text-lg font-semibold">Choose a Trigger</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">When should this form be sent?</p>
                </div>
                
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  {EXTENDED_TRIGGER_OPTIONS.map(option => {
                    const Icon = triggerIconMap[option.value];
                    const isSelected = triggerType === option.value;
                    const colors = triggerColorMap[option.value] || triggerColorMap.first_message;
                    const isPro = (option as any).isPro;
                    
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setTriggerType(option.value);
                          setTriggerConfig({});
                        }}
                        className={cn(
                          "relative flex flex-col items-center gap-1.5 sm:gap-2 p-2.5 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all text-center group touch-manipulation",
                          isSelected 
                            ? `${colors.bg} ${colors.border} shadow-md` 
                            : "border-border hover:border-primary/30 hover:bg-muted/50"
                        )}
                      >
                        {isPro && (
                          <Badge className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 text-[8px] sm:text-[9px] px-1 sm:px-1.5 bg-gradient-to-r from-violet-500 to-purple-500 text-white border-0">
                            PRO
                          </Badge>
                        )}
                        <div className={cn(
                          "w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center transition-transform group-hover:scale-110",
                          isSelected ? colors.bg : "bg-muted"
                        )}>
                          <Icon className={cn("w-4 h-4 sm:w-6 sm:h-6", isSelected ? colors.text : "text-muted-foreground")} />
                        </div>
                        <div>
                          <span className={cn(
                            "text-xs sm:text-sm font-semibold block",
                            isSelected ? colors.text : "text-foreground"
                          )}>
                            {option.label}
                          </span>
                          <span className="text-[9px] sm:text-[10px] text-muted-foreground line-clamp-2 hidden xs:block">
                            {option.description}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Trigger-specific config */}
                {triggerType === 'keyword' && (
                  <div className="space-y-3 p-4 rounded-xl bg-purple-50 border border-purple-200 mt-4">
                    <Label className="text-sm font-semibold text-purple-700">Keywords to Match</Label>
                    <div className="flex gap-2">
                      <Input
                        value={keywordInput}
                        onChange={(e) => setKeywordInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                        placeholder="Type keyword and press Enter"
                        className="h-9 bg-white"
                      />
                      <Button type="button" size="sm" onClick={addKeyword} className="bg-purple-600 hover:bg-purple-700">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    {triggerConfig.keywords && triggerConfig.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {triggerConfig.keywords.map(keyword => (
                          <Badge key={keyword} variant="secondary" className="text-sm gap-1.5 bg-white">
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

                {triggerType === 'ai_intent' && (
                  <div className="p-4 rounded-xl bg-violet-50 border border-violet-200 mt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Brain className="w-5 h-5 text-violet-600" />
                      <Label className="text-sm font-semibold text-violet-700">AI Intent Detection</Label>
                    </div>
                    <Select
                      value={(triggerConfig as any).intent || ''}
                      onValueChange={(val) => setTriggerConfig({ ...triggerConfig, intent: val } as any)}
                    >
                      <SelectTrigger className="h-10 bg-white">
                        <SelectValue placeholder="Select intent to detect" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="purchase_intent">Purchase Intent</SelectItem>
                        <SelectItem value="support_request">Support Request</SelectItem>
                        <SelectItem value="pricing_inquiry">Pricing Inquiry</SelectItem>
                        <SelectItem value="product_info">Product Information</SelectItem>
                        <SelectItem value="complaint">Complaint</SelectItem>
                        <SelectItem value="feedback">Feedback</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {triggerType === 'source' && (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 mt-4">
                    <Label className="text-sm font-semibold text-amber-700 mb-3 block">Entry Source</Label>
                    <Select
                      value={triggerConfig.sources?.[0] || ''}
                      onValueChange={(val) => setTriggerConfig({ ...triggerConfig, sources: [val] })}
                    >
                      <SelectTrigger className="h-10 bg-white">
                        <SelectValue placeholder="Select traffic source" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="meta_ads">Meta Ads (Click-to-WhatsApp)</SelectItem>
                        <SelectItem value="qr_code">QR Code</SelectItem>
                        <SelectItem value="website">Website Widget</SelectItem>
                        <SelectItem value="organic">Organic</SelectItem>
                        <SelectItem value="api">API/External</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Conditions */}
            {currentStep === 2 && (
              <div className="space-y-3 sm:space-y-4">
                <div className="text-center mb-4 sm:mb-6">
                  <h3 className="text-base sm:text-lg font-semibold">Add Conditions (Optional)</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">Filter when this rule should apply</p>
                </div>

                <div className="space-y-3">
                  {conditions.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed rounded-xl">
                      <Search className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground mb-3">No conditions added</p>
                      <p className="text-xs text-muted-foreground mb-4">Rule will trigger for all matching events</p>
                      <Button type="button" variant="outline" onClick={addCondition}>
                        <Plus className="w-4 h-4 mr-1.5" />
                        Add Condition
                      </Button>
                    </div>
                  ) : (
                    <>
                      {conditions.map((condition, idx) => (
                        <div key={condition.id} className="flex items-center gap-2 p-3 rounded-xl border bg-card">
                          {idx > 0 && (
                            <Select
                              value={condition.operator}
                              onValueChange={(val: 'and' | 'or') => updateCondition(condition.id, { operator: val })}
                            >
                              <SelectTrigger className="w-20 h-8 text-xs font-semibold">
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
                            <SelectTrigger className="flex-1 h-8">
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
                            className="h-8 w-8 text-destructive"
                            onClick={() => removeCondition(condition.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      <Button type="button" variant="outline" onClick={addCondition} className="w-full">
                        <Plus className="w-4 h-4 mr-1.5" />
                        Add Another Condition
                      </Button>
                    </>
                  )}
                </div>

                {/* Quick Condition Toggles */}
                <Separator className="my-4" />
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Quick Filters</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setBusinessHoursOnly(!businessHoursOnly)}
                      className={cn(
                        "flex items-center gap-2 p-3 rounded-lg border-2 transition-all text-left",
                        businessHoursOnly ? "bg-primary/10 border-primary" : "border-border hover:border-primary/30"
                      )}
                    >
                      <Clock className={cn("w-4 h-4", businessHoursOnly && "text-primary")} />
                      <span className="text-sm">Business hours only</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRequireOptIn(!requireOptIn)}
                      className={cn(
                        "flex items-center gap-2 p-3 rounded-lg border-2 transition-all text-left",
                        requireOptIn ? "bg-primary/10 border-primary" : "border-border hover:border-primary/30"
                      )}
                    >
                      <Shield className={cn("w-4 h-4", requireOptIn && "text-primary")} />
                      <span className="text-sm">Require opt-in</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Form Selection */}
            {currentStep === 3 && (
              <div className="space-y-3 sm:space-y-4">
                <div className="text-center mb-4 sm:mb-6">
                  <h3 className="text-base sm:text-lg font-semibold">Select Form to Send</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">Choose which WhatsApp form to deliver</p>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-semibold">WhatsApp Form Template *</Label>
                  <Select value={formId} onValueChange={setFormId}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select a form template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.length === 0 ? (
                        <SelectItem value="" disabled>No templates available</SelectItem>
                      ) : (
                        templates.map(template => (
                          <SelectItem key={template.id} value={template.id}>
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-muted-foreground" />
                              <span>{template.name}</span>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  
                  {selectedForm && (
                    <div className="p-3 rounded-lg bg-green-50 border border-green-200 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-green-900">{selectedForm.name}</p>
                        <p className="text-xs text-green-700">Ready to send</p>
                      </div>
                      <Button variant="ghost" size="sm" className="text-green-600">
                        <Eye className="w-4 h-4 mr-1" />
                        Preview
                      </Button>
                    </div>
                  )}
                </div>

                <Separator className="my-4" />

                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Optional Intro Message</Label>
                  <Textarea
                    value={introMessage}
                    onChange={(e) => setIntroMessage(e.target.value)}
                    placeholder="Hi! I'd like to help you better. Please fill out this quick form..."
                    className="h-20 resize-none"
                  />
                  <p className="text-xs text-muted-foreground">Sent before the form (optional)</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold">Delay Before Sending</Label>
                    <span className="text-sm font-medium text-primary">{delaySeconds}s</span>
                  </div>
                  <Slider
                    value={[delaySeconds]}
                    onValueChange={([val]) => setDelaySeconds(val)}
                    max={10}
                    min={0}
                    step={1}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">Add a natural delay (0-10 seconds)</p>
                </div>
              </div>
            )}

            {/* Step 4: Safety Controls */}
            {currentStep === 4 && (
              <div className="space-y-3 sm:space-y-4">
                <div className="text-center mb-4 sm:mb-6">
                  <h3 className="text-base sm:text-lg font-semibold">Safety Controls</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">Prevent spam and ensure great UX</p>
                </div>

                <div className="space-y-3">
                  {/* Send Once Per User */}
                  <div className="flex items-center justify-between p-3 sm:p-4 rounded-xl border-2 transition-all hover:border-primary/30 touch-manipulation">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                        <User className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm sm:text-base truncate">Send only once per user</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">Don't repeat to same contact</p>
                      </div>
                    </div>
                    <Switch checked={sendOncePerUser} onCheckedChange={setSendOncePerUser} className="shrink-0" />
                  </div>

                  {/* Stop if Agent Replies */}
                  <div className="flex items-center justify-between p-3 sm:p-4 rounded-xl border-2 transition-all hover:border-primary/30 touch-manipulation">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                        <Send className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm sm:text-base truncate">Stop if agent replies</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">Cancel if human takes over</p>
                      </div>
                    </div>
                    <Switch checked={stopOnAgentReply} onCheckedChange={setStopOnAgentReply} className="shrink-0" />
                  </div>

                  {/* Stop on Free Text */}
                  <div className="flex items-center justify-between p-3 sm:p-4 rounded-xl border-2 transition-all hover:border-primary/30 touch-manipulation">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                        <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm sm:text-base truncate">Stop if user types free text</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">Cancel if user sends a message</p>
                      </div>
                    </div>
                    <Switch checked={stopOnFreeText} onCheckedChange={setStopOnFreeText} className="shrink-0" />
                  </div>

                  {/* Cooldown Period */}
                  <div className="p-3 sm:p-4 rounded-xl border-2">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                        <RefreshCcw className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm sm:text-base">Cooldown period</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">Minimum time between sends</p>
                      </div>
                      <span className="text-xs sm:text-sm font-semibold text-primary shrink-0">{cooldownMinutes} min</span>
                    </div>
                    <Slider
                      value={[cooldownMinutes]}
                      onValueChange={([val]) => setCooldownMinutes(val)}
                      max={1440}
                      min={0}
                      step={30}
                    />
                  </div>

                  {/* Fallback Message */}
                  <div className="p-3 sm:p-4 rounded-xl border-2">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                        <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm sm:text-base">Fallback message</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">Sent if form fails to deliver</p>
                      </div>
                    </div>
                    <Textarea
                      value={fallbackMessage}
                      onChange={(e) => setFallbackMessage(e.target.value)}
                      placeholder="Sorry, I couldn't send the form. Please reply with your question..."
                      className="h-16 resize-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Review */}
            {currentStep === 5 && (
              <div className="space-y-3 sm:space-y-4">
                <div className="text-center mb-4 sm:mb-6">
                  <h3 className="text-base sm:text-lg font-semibold">Review & Save</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">Confirm your auto-form rule settings</p>
                </div>

                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-semibold">Rule Name *</Label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g., Welcome Form for New Leads"
                      className="mt-1.5 h-11"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold">Description</Label>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="What does this rule do?"
                      className="mt-1.5 h-16 resize-none"
                    />
                  </div>
                </div>

                {/* Summary Card */}
                <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 space-y-3">
                  <h4 className="font-semibold text-xs sm:text-sm">Rule Summary</h4>
                  
                  <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-6 h-6 rounded-md flex items-center justify-center", triggerColorMap[triggerType]?.bg || 'bg-muted')}>
                        <TriggerIcon className="w-3.5 h-3.5" />
                      </div>
                      <span><strong>When:</strong> {selectedTrigger?.label}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-green-100 flex items-center justify-center">
                        <FileText className="w-3.5 h-3.5 text-green-600" />
                      </div>
                      <span><strong>Send:</strong> {selectedForm?.name || 'Not selected'}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-blue-100 flex items-center justify-center">
                        <Clock className="w-3.5 h-3.5 text-blue-600" />
                      </div>
                      <span><strong>Delay:</strong> {delaySeconds}s</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-purple-100 flex items-center justify-center">
                        <RefreshCcw className="w-3.5 h-3.5 text-purple-600" />
                      </div>
                      <span><strong>Cooldown:</strong> {cooldownMinutes}m</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {sendOncePerUser && <Badge variant="outline" className="text-xs">Once per user</Badge>}
                    {stopOnAgentReply && <Badge variant="outline" className="text-xs">Stop on agent reply</Badge>}
                    {requireOptIn && <Badge variant="outline" className="text-xs">Opt-in required</Badge>}
                    {businessHoursOnly && <Badge variant="outline" className="text-xs">Business hours</Badge>}
                    {conditions.length > 0 && <Badge variant="outline" className="text-xs">{conditions.length} condition(s)</Badge>}
                  </div>
                </div>

                {/* Activate Toggle */}
                <div className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-primary/5 border-2 border-primary/20 touch-manipulation">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
                    <div className="min-w-0">
                      <p className="font-semibold text-sm sm:text-base">Activate Rule</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">Start sending forms immediately</p>
                    </div>
                  </div>
                  <Switch checked={isActive} onCheckedChange={setIsActive} className="shrink-0" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer with Navigation */}
        <div className="px-3 sm:px-6 py-3 sm:py-4 border-t bg-muted/30 flex items-center justify-between gap-2">
          <div className="shrink-0">
            {currentStep > 1 && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setCurrentStep(prev => prev - 1)}
                disabled={saving}
                className="h-9"
              >
                <ChevronLeft className="w-4 h-4 sm:mr-1" />
                <span className="hidden sm:inline">Back</span>
              </Button>
            )}
          </div>
          
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} disabled={saving} className="h-9 px-2 sm:px-4">
              Cancel
            </Button>
            
            {currentStep < STEPS.length ? (
              <Button 
                size="sm"
                onClick={() => setCurrentStep(prev => prev + 1)}
                disabled={!canProceed()}
                className="h-9"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button 
                size="sm"
                onClick={handleSubmit} 
                disabled={saving || !name.trim() || !formId}
                className="h-9 bg-gradient-to-r from-primary to-primary/80"
              >
                {saving ? 'Saving...' : editingRule ? 'Update' : 'Create'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
