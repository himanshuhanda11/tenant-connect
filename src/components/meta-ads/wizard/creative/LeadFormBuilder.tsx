import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ClipboardList, Plus, Trash2, GripVertical, AlertTriangle, ShieldCheck, ExternalLink } from 'lucide-react';
import type { MetaCampaignDraft, LeadFormQuestion } from '@/types/meta-campaign';
import { PREDEFINED_FORM_FIELDS } from '@/types/meta-campaign';
import { cn } from '@/lib/utils';

interface LeadFormBuilderProps {
  draft: MetaCampaignDraft;
  updateDraft: (updates: Partial<MetaCampaignDraft>) => void;
}

export function LeadFormBuilder({ draft, updateDraft }: LeadFormBuilderProps) {
  const questions = draft.lead_form_questions || [];
  const hasContactField = questions.some(q => ['PHONE', 'EMAIL', 'FULL_NAME'].includes(q.field));

  const addPredefinedField = (field: string) => {
    if (questions.some(q => q.field === field)) return;
    const def = PREDEFINED_FORM_FIELDS.find(f => f.field === field);
    if (!def) return;
    const newQ: LeadFormQuestion = {
      id: Date.now().toString(),
      type: 'predefined',
      field: def.field,
      label: def.label,
      required: ['FULL_NAME', 'PHONE', 'EMAIL'].includes(field),
    };
    updateDraft({ lead_form_questions: [...questions, newQ] });
  };

  const addCustomQuestion = () => {
    const newQ: LeadFormQuestion = {
      id: Date.now().toString(),
      type: 'custom',
      field: `CUSTOM_${questions.length + 1}`,
      label: '',
      required: false,
    };
    updateDraft({ lead_form_questions: [...questions, newQ] });
  };

  const updateQuestion = (id: string, updates: Partial<LeadFormQuestion>) => {
    updateDraft({
      lead_form_questions: questions.map(q => q.id === id ? { ...q, ...updates } : q),
    });
  };

  const removeQuestion = (id: string) => {
    updateDraft({ lead_form_questions: questions.filter(q => q.id !== id) });
  };

  const availableFields = PREDEFINED_FORM_FIELDS.filter(
    f => !questions.some(q => q.field === f.field)
  );

  return (
    <>
      {/* Form Type */}
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-primary" />
            Lead Form Builder
          </CardTitle>
          <CardDescription>Build your instant form — questions, privacy, and thank-you screen</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Form Intent */}
          <div className="space-y-1.5">
            <Label className="text-xs">Form Type</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => updateDraft({ lead_form_type: 'more_volume' })}
                className={cn(
                  "p-3 rounded-lg border-2 text-left transition-all",
                  draft.lead_form_type === 'more_volume'
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/30"
                )}
              >
                <p className="text-sm font-medium">More Volume</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Quick form, fewer steps. Maximizes submissions.</p>
              </button>
              <button
                onClick={() => updateDraft({ lead_form_type: 'higher_intent' })}
                className={cn(
                  "p-3 rounded-lg border-2 text-left transition-all",
                  draft.lead_form_type === 'higher_intent'
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/30"
                )}
              >
                <p className="text-sm font-medium">Higher Intent</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Review step before submit. Better lead quality.</p>
              </button>
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Form Questions</Label>
              <Badge variant="outline" className="text-[10px]">{questions.length} fields</Badge>
            </div>
            
            <div className="space-y-2">
              {questions.map((q, idx) => (
                <div key={q.id} className="flex items-center gap-2 p-2.5 rounded-lg border bg-muted/30">
                  <GripVertical className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
                  <span className="text-xs text-muted-foreground w-5 shrink-0">{idx + 1}.</span>
                  {q.type === 'predefined' ? (
                    <div className="flex-1 flex items-center gap-2">
                      <span className="text-xs font-medium">{q.label}</span>
                      <Badge variant="secondary" className="text-[9px]">Predefined</Badge>
                    </div>
                  ) : (
                    <Input
                      value={q.label}
                      onChange={e => updateQuestion(q.id, { label: e.target.value })}
                      placeholder="Custom question text..."
                      className="h-8 text-xs flex-1"
                    />
                  )}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <label className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Switch
                        checked={q.required}
                        onCheckedChange={v => updateQuestion(q.id, { required: v })}
                        className="scale-75"
                      />
                      Req
                    </label>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-destructive"
                      onClick={() => removeQuestion(q.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Field */}
            <div className="flex items-center gap-2">
              {availableFields.length > 0 && (
                <Select onValueChange={v => addPredefinedField(v)}>
                  <SelectTrigger className="h-8 text-xs flex-1">
                    <SelectValue placeholder="+ Add predefined field..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableFields.map(f => (
                      <SelectItem key={f.field} value={f.field}>{f.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <Button variant="outline" size="sm" onClick={addCustomQuestion} className="gap-1 text-xs h-8">
                <Plus className="h-3 w-3" />
                Custom
              </Button>
            </div>

            {!hasContactField && (
              <Alert className="border-red-200 bg-red-50 dark:bg-red-950/30">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-xs text-red-700 dark:text-red-300">
                  Add at least one contact field (Name, Phone, or Email) to collect lead information.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Privacy Policy */}
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Privacy Policy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Privacy Policy URL *</Label>
            <Input
              value={draft.lead_form_privacy_url || ''}
              onChange={e => updateDraft({ lead_form_privacy_url: e.target.value })}
              placeholder="https://example.com/privacy-policy"
              className={cn("h-10", !draft.lead_form_privacy_url && "border-amber-300")}
            />
            <p className="text-[10px] text-muted-foreground">Required by Meta for all lead generation forms.</p>
          </div>
        </CardContent>
      </Card>

      {/* Thank You Screen */}
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            🎉 Thank You Screen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Title</Label>
            <Input
              value={draft.lead_form_thankyou_title || ''}
              onChange={e => updateDraft({ lead_form_thankyou_title: e.target.value })}
              placeholder="Thanks for your interest!"
              className="h-10"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Message</Label>
            <Textarea
              value={draft.lead_form_thankyou_body || ''}
              onChange={e => updateDraft({ lead_form_thankyou_body: e.target.value })}
              placeholder="We'll be in touch soon. In the meantime..."
              rows={2}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">CTA Button Text</Label>
              <Input
                value={draft.lead_form_thankyou_cta || ''}
                onChange={e => updateDraft({ lead_form_thankyou_cta: e.target.value })}
                placeholder="Visit Website"
                className="h-10"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">CTA URL</Label>
              <Input
                value={draft.lead_form_thankyou_url || ''}
                onChange={e => updateDraft({ lead_form_thankyou_url: e.target.value })}
                placeholder="https://example.com"
                className="h-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
