import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  GripVertical, Plus, Trash2, Eye, Pencil, Copy, Save,
  Smartphone, Monitor, ChevronDown, ChevronUp, Layers,
  GitBranch, Link2, Settings2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FormField, FormFieldType, FormBuilderState, IFThenRule } from './form-builder/types';
import { DEFAULT_FORM_STATE } from './form-builder/types';
import { FIELD_TYPES, FIELD_ICON_MAP, FORM_PRESETS } from './form-builder/field-config';
import { FieldSettingsPanel } from './form-builder/FieldSettingsPanel';
import { IfThenRuleEngine } from './form-builder/IfThenRuleEngine';
import { FormPreview } from './form-builder/FormPreview';

// Re-export types for backward compatibility
export type { FormField, FormFieldType } from './form-builder/types';

interface FormBuilderProps {
  fields: FormField[];
  onChange: (fields: FormField[]) => void;
  formName: string;
  onFormNameChange: (name: string) => void;
  // Extended props
  ifThenRules?: IFThenRule[];
  onIfThenRulesChange?: (rules: IFThenRule[]) => void;
  webhookUrl?: string;
  onWebhookUrlChange?: (url: string) => void;
  formSettings?: FormBuilderState['settings'];
  onFormSettingsChange?: (settings: FormBuilderState['settings']) => void;
}

export function FormBuilder({
  fields, onChange, formName, onFormNameChange,
  ifThenRules = [], onIfThenRulesChange,
  webhookUrl = '', onWebhookUrlChange,
  formSettings, onFormSettingsChange,
}: FormBuilderProps) {
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [showFieldPicker, setShowFieldPicker] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('fields');
  const [previewStyle, setPreviewStyle] = useState<'standard' | 'whatsapp'>('standard');

  const settings = formSettings || DEFAULT_FORM_STATE.settings;

  const addField = (type: FormFieldType) => {
    const fieldInfo = FIELD_TYPES.find(f => f.type === type);
    const needsOptions = ['select', 'radio', 'checkbox', 'tag_assignment', 'lead_score'].includes(type);
    const newField: FormField = {
      id: crypto.randomUUID(),
      type,
      label: fieldInfo?.label || 'New Field',
      placeholder: '',
      required: type !== 'hidden' && type !== 'calculated',
      width: 'full',
      step: 1,
      ...(needsOptions ? { options: [{ label: 'Option 1', value: 'option_1' }, { label: 'Option 2', value: 'option_2' }] } : {}),
      ...(type === 'hidden' ? { hiddenSource: 'campaign' as const } : {}),
      ...(type === 'calculated' ? { calculationOperator: 'multiply' as const, calculationFields: [] } : {}),
      ...(type === 'otp_verification' ? { otpType: 'phone' as const } : {}),
      ...(type === 'file_upload' ? { fileTypes: ['image', 'pdf'], maxFileSize: 10 } : {}),
      ...(type === 'time_slot' ? { timeSlotConfig: { startHour: 9, endHour: 17, intervalMinutes: 30, daysOfWeek: [1,2,3,4,5] } } : {}),
    };
    onChange([...fields, newField]);
    setEditingFieldId(newField.id);
    setShowFieldPicker(false);
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    onChange(fields.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const removeField = (id: string) => {
    onChange(fields.filter(f => f.id !== id));
    if (editingFieldId === id) setEditingFieldId(null);
  };

  const cloneField = (field: FormField) => {
    const cloned = { ...field, id: crypto.randomUUID(), label: `${field.label} (copy)` };
    const idx = fields.findIndex(f => f.id === field.id);
    const updated = [...fields];
    updated.splice(idx + 1, 0, cloned);
    onChange(updated);
  };

  const moveField = (from: number, to: number) => {
    const updated = [...fields];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    onChange(updated);
  };

  const applyPreset = (preset: typeof FORM_PRESETS[0]) => {
    const newFields = preset.fields.map(f => ({
      ...f,
      id: crypto.randomUUID(),
      required: f.required ?? false,
      width: 'full' as const,
      step: 1,
    }));
    onChange(newFields as FormField[]);
    if (!formName) onFormNameChange(preset.name + ' Form');
  };

  // Drag handlers
  const handleDragStart = (idx: number) => (e: React.DragEvent) => {
    setDraggedIndex(idx);
    e.dataTransfer.effectAllowed = 'move';
  };
  const handleDragOver = (idx: number) => (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverIndex(idx);
  };
  const handleDrop = (idx: number) => (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== idx) moveField(draggedIndex, idx);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };
  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const builderState: FormBuilderState = {
    fields,
    formName,
    steps: settings.multiStep ? Math.max(...fields.map(f => f.step || 1), 1) : 1,
    ifThenRules,
    settings,
  };

  return (
    <div className="space-y-4">
      {/* Form Name & Description */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">Form Name *</Label>
        <Input value={formName} onChange={e => onFormNameChange(e.target.value)} placeholder="e.g. Lead Capture Form" className="h-10" />
      </div>

      {/* Tabs: Fields / Rules / Preview / Settings */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 h-9">
          <TabsTrigger value="fields" className="text-xs gap-1"><Layers className="w-3 h-3" /> Fields</TabsTrigger>
          <TabsTrigger value="rules" className="text-xs gap-1"><GitBranch className="w-3 h-3" /> Rules</TabsTrigger>
          <TabsTrigger value="preview" className="text-xs gap-1"><Eye className="w-3 h-3" /> Preview</TabsTrigger>
          <TabsTrigger value="settings" className="text-xs gap-1"><Settings2 className="w-3 h-3" /> Settings</TabsTrigger>
        </TabsList>

        {/* ============ FIELDS TAB ============ */}
        <TabsContent value="fields" className="mt-3 space-y-3">
          {/* Presets */}
          {fields.length === 0 && (
            <div className="space-y-3">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">📚 Templates Library</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {FORM_PRESETS.map(preset => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 border-dashed border-border hover:border-primary/40 hover:bg-primary/5 transition-all text-center"
                  >
                    <span className="text-xl">{preset.icon}</span>
                    <span className="text-xs font-medium">{preset.name}</span>
                    <span className="text-[10px] text-muted-foreground">{preset.description}</span>
                    <span className="text-[9px] text-muted-foreground">{preset.fields.length} fields</span>
                  </button>
                ))}
              </div>
              <Separator />
            </div>
          )}

          {/* Field count */}
          {fields.length > 0 && (
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">Fields ({fields.length})</Label>
              <div className="flex gap-1">
                <Badge variant="outline" className="text-[9px]">{fields.filter(f => f.type === 'hidden').length} hidden</Badge>
                <Badge variant="outline" className="text-[9px]">{fields.filter(f => f.required).length} required</Badge>
              </div>
            </div>
          )}

          {/* Field List */}
          <div className="space-y-2">
            {fields.map((field, idx) => {
              const Icon = FIELD_ICON_MAP[field.type];
              const isEditing = editingFieldId === field.id;
              const isDragOver = dragOverIndex === idx && draggedIndex !== idx;

              return (
                <div
                  key={field.id}
                  draggable
                  onDragStart={handleDragStart(idx)}
                  onDragOver={handleDragOver(idx)}
                  onDrop={handleDrop(idx)}
                  onDragEnd={handleDragEnd}
                  className={cn(
                    "group rounded-xl border-2 transition-all bg-card",
                    isEditing ? "border-primary shadow-md" : "border-border hover:border-primary/30",
                    isDragOver && "border-primary/50 bg-primary/5",
                    draggedIndex === idx && "opacity-50"
                  )}
                >
                  {/* Field Header */}
                  <div
                    className="flex items-center gap-2 p-2.5 cursor-pointer"
                    onClick={() => setEditingFieldId(isEditing ? null : field.id)}
                  >
                    <div className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded touch-manipulation">
                      <GripVertical className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0", isEditing ? "bg-primary/10" : "bg-muted")}>
                      {Icon && <Icon className={cn("w-3.5 h-3.5", isEditing ? "text-primary" : "text-muted-foreground")} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium truncate block">{field.label}</span>
                      <span className="text-[10px] text-muted-foreground capitalize">
                        {field.type.replace(/_/g, ' ')}{field.required ? ' · Required' : ''}
                        {field.step && field.step > 1 ? ` · Step ${field.step}` : ''}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {field.type === 'hidden' && <Badge variant="secondary" className="text-[9px] px-1.5 py-0">Hidden</Badge>}
                      {field.type === 'lead_score' && <Badge className="text-[9px] px-1.5 py-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">Score</Badge>}
                      <Button type="button" variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100" onClick={e => { e.stopPropagation(); cloneField(field); }}>
                        <Copy className="w-3.5 h-3.5" />
                      </Button>
                      <Button type="button" variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 text-destructive" onClick={e => { e.stopPropagation(); removeField(field.id); }}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                      {isEditing ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                    </div>
                  </div>

                  {/* Field Settings (expanded) */}
                  {isEditing && (
                    <FieldSettingsPanel field={field} allFields={fields} onUpdate={updates => updateField(field.id, updates)} />
                  )}
                </div>
              );
            })}

            {/* Add Field Button */}
            {!showFieldPicker ? (
              <Button type="button" variant="outline" className="w-full border-dashed h-12" onClick={() => setShowFieldPicker(true)}>
                <Plus className="w-4 h-4 mr-1.5" /> Add Field
              </Button>
            ) : (
              <Card className="border-2 border-primary/20">
                <CardContent className="p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Select Field Type</Label>
                    <Button type="button" variant="ghost" size="sm" className="h-6 text-xs" onClick={() => setShowFieldPicker(false)}>Cancel</Button>
                  </div>
                  {['Basic', 'Choice', 'Advanced', 'Smart'].map(category => {
                    const categoryFields = FIELD_TYPES.filter(f => f.category === category);
                    if (categoryFields.length === 0) return null;
                    return (
                      <div key={category}>
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                          {category === 'Smart' ? '🧠 Smart Fields' : category}
                        </span>
                        <div className="grid grid-cols-3 gap-1.5 mt-1.5">
                          {categoryFields.map(ft => {
                            const FIcon = ft.icon;
                            return (
                              <button
                                key={ft.type}
                                type="button"
                                onClick={() => addField(ft.type)}
                                className="flex flex-col items-center gap-1 p-2 rounded-lg border border-border hover:border-primary/40 hover:bg-primary/5 transition-all"
                              >
                                <FIcon className="w-4 h-4 text-muted-foreground" />
                                <span className="text-[10px] font-medium">{ft.label}</span>
                                <span className="text-[8px] text-muted-foreground text-center line-clamp-1">{ft.description}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* ============ RULES TAB ============ */}
        <TabsContent value="rules" className="mt-3 space-y-4">
          <IfThenRuleEngine
            rules={ifThenRules}
            fields={fields}
            onChange={onIfThenRulesChange || (() => {})}
          />

          <Separator />

          {/* Webhook */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Link2 className="w-4 h-4 text-primary" />
              <Label className="text-sm font-semibold">Webhook Trigger</Label>
              <Badge variant="secondary" className="text-[9px]">Enterprise</Badge>
            </div>
            <p className="text-xs text-muted-foreground">Send form data to CRM, Zapier, or custom API</p>
            <Input
              value={webhookUrl}
              onChange={e => onWebhookUrlChange?.(e.target.value)}
              placeholder="https://hooks.zapier.com/... or your API endpoint"
              className="h-9 text-sm font-mono"
            />
          </div>
        </TabsContent>

        {/* ============ PREVIEW TAB ============ */}
        <TabsContent value="preview" className="mt-3 space-y-3">
          {fields.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <Eye className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Add fields to see a preview</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-center gap-2">
                <Button
                  type="button" variant={previewStyle === 'standard' ? 'default' : 'outline'} size="sm"
                  onClick={() => setPreviewStyle('standard')} className="h-7 text-xs gap-1"
                >
                  <Monitor className="w-3 h-3" /> Standard
                </Button>
                <Button
                  type="button" variant={previewStyle === 'whatsapp' ? 'default' : 'outline'} size="sm"
                  onClick={() => setPreviewStyle('whatsapp')} className="h-7 text-xs gap-1"
                >
                  <Smartphone className="w-3 h-3" /> WhatsApp
                </Button>
              </div>
              <FormPreview state={builderState} whatsappStyle={previewStyle === 'whatsapp'} />
            </>
          )}
        </TabsContent>

        {/* ============ SETTINGS TAB ============ */}
        <TabsContent value="settings" className="mt-3 space-y-4">
          {/* Multi-Step */}
          <div className="flex items-center justify-between p-3 rounded-xl border">
            <div>
              <p className="text-sm font-medium">Multi-Step Layout</p>
              <p className="text-xs text-muted-foreground">Split form into multiple steps</p>
            </div>
            <Switch
              checked={settings.multiStep}
              onCheckedChange={val => onFormSettingsChange?.({ ...settings, multiStep: val })}
            />
          </div>

          {settings.multiStep && (
            <div className="flex items-center justify-between p-3 rounded-xl border">
              <div>
                <p className="text-sm font-medium">Show Progress Bar</p>
                <p className="text-xs text-muted-foreground">Display step completion progress</p>
              </div>
              <Switch
                checked={settings.showProgressBar}
                onCheckedChange={val => onFormSettingsChange?.({ ...settings, showProgressBar: val })}
              />
            </div>
          )}

          {/* Submit Button Text */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Submit Button Text</Label>
            <Input
              value={settings.submitButtonText}
              onChange={e => onFormSettingsChange?.({ ...settings, submitButtonText: e.target.value })}
              className="h-9 text-sm"
              placeholder="Submit"
            />
          </div>

          {/* Success Message */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Success Message</Label>
            <Textarea
              value={settings.successMessage}
              onChange={e => onFormSettingsChange?.({ ...settings, successMessage: e.target.value })}
              className="h-16 resize-none text-sm"
              placeholder="Thank you for your response!"
            />
          </div>

          {/* Save as Template hint */}
          <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
            <div className="flex items-center gap-2">
              <Save className="w-4 h-4 text-primary" />
              <div>
                <p className="text-sm font-medium">Reusable Field Library</p>
                <p className="text-xs text-muted-foreground">Forms you create are saved and can be reused across rules</p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
