import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  GripVertical,
  Plus,
  Trash2,
  Settings2,
  Type,
  Mail,
  Phone,
  Hash,
  Calendar,
  MapPin,
  ListChecks,
  ToggleLeft,
  AlignLeft,
  Link,
  Star,
  ChevronDown,
  ChevronUp,
  Eye,
  Pencil,
  Globe,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FormField {
  id: string;
  type: FormFieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  validation?: Record<string, any>;
  width?: 'full' | 'half';
}

export type FormFieldType =
  | 'text'
  | 'email'
  | 'phone'
  | 'number'
  | 'textarea'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'date'
  | 'url'
  | 'location'
  | 'rating';

const FIELD_TYPES: {
  type: FormFieldType;
  label: string;
  icon: React.ElementType;
  category: string;
}[] = [
  { type: 'text', label: 'Text', icon: Type, category: 'Basic' },
  { type: 'email', label: 'Email', icon: Mail, category: 'Basic' },
  { type: 'phone', label: 'Phone', icon: Phone, category: 'Basic' },
  { type: 'number', label: 'Number', icon: Hash, category: 'Basic' },
  { type: 'textarea', label: 'Long Text', icon: AlignLeft, category: 'Basic' },
  { type: 'select', label: 'Dropdown', icon: ListChecks, category: 'Choice' },
  { type: 'radio', label: 'Radio', icon: ToggleLeft, category: 'Choice' },
  { type: 'checkbox', label: 'Checkbox', icon: ToggleLeft, category: 'Choice' },
  { type: 'date', label: 'Date', icon: Calendar, category: 'Advanced' },
  { type: 'url', label: 'URL', icon: Link, category: 'Advanced' },
  { type: 'location', label: 'Location', icon: MapPin, category: 'Advanced' },
  { type: 'rating', label: 'Rating', icon: Star, category: 'Advanced' },
];

const FIELD_ICON_MAP: Record<FormFieldType, React.ElementType> = {
  text: Type,
  email: Mail,
  phone: Phone,
  number: Hash,
  textarea: AlignLeft,
  select: ListChecks,
  radio: ToggleLeft,
  checkbox: ToggleLeft,
  date: Calendar,
  url: Link,
  location: MapPin,
  rating: Star,
};

// Lead capture presets
const PRESETS = [
  {
    name: 'Basic Lead',
    fields: [
      { id: crypto.randomUUID(), type: 'text' as FormFieldType, label: 'Full Name', placeholder: 'Enter your name', required: true, width: 'full' as const },
      { id: crypto.randomUUID(), type: 'phone' as FormFieldType, label: 'Phone Number', placeholder: '+1 (555) 000-0000', required: true, width: 'full' as const },
      { id: crypto.randomUUID(), type: 'email' as FormFieldType, label: 'Email Address', placeholder: 'you@example.com', required: false, width: 'full' as const },
    ],
  },
  {
    name: 'Appointment',
    fields: [
      { id: crypto.randomUUID(), type: 'text' as FormFieldType, label: 'Full Name', placeholder: 'Enter your name', required: true, width: 'full' as const },
      { id: crypto.randomUUID(), type: 'phone' as FormFieldType, label: 'Phone', placeholder: '+1 (555) 000-0000', required: true, width: 'full' as const },
      { id: crypto.randomUUID(), type: 'date' as FormFieldType, label: 'Preferred Date', required: true, width: 'half' as const },
      { id: crypto.randomUUID(), type: 'select' as FormFieldType, label: 'Time Slot', required: true, width: 'half' as const, options: ['Morning', 'Afternoon', 'Evening'] },
      { id: crypto.randomUUID(), type: 'textarea' as FormFieldType, label: 'Notes', placeholder: 'Anything else we should know?', required: false, width: 'full' as const },
    ],
  },
  {
    name: 'Survey',
    fields: [
      { id: crypto.randomUUID(), type: 'text' as FormFieldType, label: 'Name', placeholder: 'Your name', required: true, width: 'full' as const },
      { id: crypto.randomUUID(), type: 'rating' as FormFieldType, label: 'How satisfied are you?', required: true, width: 'full' as const },
      { id: crypto.randomUUID(), type: 'radio' as FormFieldType, label: 'Would you recommend us?', required: true, width: 'full' as const, options: ['Yes', 'No', 'Maybe'] },
      { id: crypto.randomUUID(), type: 'textarea' as FormFieldType, label: 'Additional Feedback', placeholder: 'Tell us more...', required: false, width: 'full' as const },
    ],
  },
];

interface FormBuilderProps {
  fields: FormField[];
  onChange: (fields: FormField[]) => void;
  formName: string;
  onFormNameChange: (name: string) => void;
}

export function FormBuilder({ fields, onChange, formName, onFormNameChange }: FormBuilderProps) {
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [showFieldPicker, setShowFieldPicker] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [optionInput, setOptionInput] = useState('');

  const addField = (type: FormFieldType) => {
    const fieldInfo = FIELD_TYPES.find(f => f.type === type);
    const newField: FormField = {
      id: crypto.randomUUID(),
      type,
      label: fieldInfo?.label || 'New Field',
      placeholder: '',
      required: false,
      width: 'full',
      ...((['select', 'radio', 'checkbox'].includes(type)) ? { options: ['Option 1', 'Option 2'] } : {}),
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

  const moveField = (from: number, to: number) => {
    const updated = [...fields];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    onChange(updated);
  };

  const applyPreset = (preset: typeof PRESETS[0]) => {
    onChange(preset.fields.map(f => ({ ...f, id: crypto.randomUUID() })));
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
    if (draggedIndex !== null && draggedIndex !== idx) {
      moveField(draggedIndex, idx);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const editingField = fields.find(f => f.id === editingFieldId);

  const addOption = (fieldId: string) => {
    if (!optionInput.trim()) return;
    const field = fields.find(f => f.id === fieldId);
    if (!field) return;
    updateField(fieldId, { options: [...(field.options || []), optionInput.trim()] });
    setOptionInput('');
  };

  const removeOption = (fieldId: string, optIdx: number) => {
    const field = fields.find(f => f.id === fieldId);
    if (!field?.options) return;
    updateField(fieldId, { options: field.options.filter((_, i) => i !== optIdx) });
  };

  return (
    <div className="space-y-4">
      {/* Form Name */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">Form Name *</Label>
        <Input
          value={formName}
          onChange={(e) => onFormNameChange(e.target.value)}
          placeholder="e.g. Lead Capture Form"
          className="h-10"
        />
      </div>

      {/* Presets */}
      {fields.length === 0 && (
        <div className="space-y-3">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Quick Start Templates</Label>
          <div className="grid grid-cols-3 gap-2">
            {PRESETS.map(preset => (
              <button
                key={preset.name}
                type="button"
                onClick={() => applyPreset(preset)}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 border-dashed border-border hover:border-primary/40 hover:bg-primary/5 transition-all text-center"
              >
                <Globe className="w-5 h-5 text-muted-foreground" />
                <span className="text-xs font-medium">{preset.name}</span>
                <span className="text-[10px] text-muted-foreground">{preset.fields.length} fields</span>
              </button>
            ))}
          </div>
          <Separator />
        </div>
      )}

      {/* Toggle Preview/Edit */}
      {fields.length > 0 && (
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold">
            Fields ({fields.length})
          </Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setPreviewMode(!previewMode)}
            className="text-xs gap-1.5"
          >
            {previewMode ? <Pencil className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            {previewMode ? 'Edit' : 'Preview'}
          </Button>
        </div>
      )}

      {/* Preview Mode */}
      {previewMode && fields.length > 0 && (
        <Card className="border-2 border-primary/20 bg-gradient-to-b from-primary/5 to-transparent">
          <CardContent className="p-4 space-y-4">
            <div className="text-center mb-2">
              <h3 className="font-semibold text-base">{formName || 'Untitled Form'}</h3>
              <p className="text-xs text-muted-foreground">Live Preview</p>
            </div>
            {fields.map(field => {
              const Icon = FIELD_ICON_MAP[field.type];
              return (
                <div key={field.id} className="space-y-1.5">
                  <Label className="text-sm flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                    {field.label}
                    {field.required && <span className="text-destructive">*</span>}
                  </Label>
                  {field.type === 'textarea' ? (
                    <div className="h-16 rounded-md border border-border bg-background px-3 py-2 text-sm text-muted-foreground">
                      {field.placeholder || 'Type here...'}
                    </div>
                  ) : field.type === 'select' ? (
                    <div className="h-10 rounded-md border border-border bg-background px-3 flex items-center text-sm text-muted-foreground">
                      Select {field.label.toLowerCase()}...
                    </div>
                  ) : field.type === 'radio' ? (
                    <div className="space-y-1.5">
                      {(field.options || []).map((opt, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full border-2 border-border" />
                          <span className="text-sm">{opt}</span>
                        </div>
                      ))}
                    </div>
                  ) : field.type === 'checkbox' ? (
                    <div className="space-y-1.5">
                      {(field.options || []).map((opt, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded border-2 border-border" />
                          <span className="text-sm">{opt}</span>
                        </div>
                      ))}
                    </div>
                  ) : field.type === 'rating' ? (
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(n => (
                        <Star key={n} className="w-6 h-6 text-muted-foreground/30" />
                      ))}
                    </div>
                  ) : (
                    <Input
                      disabled
                      placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                      className="h-10"
                    />
                  )}
                </div>
              );
            })}
            <Button disabled className="w-full mt-2">Submit</Button>
          </CardContent>
        </Card>
      )}

      {/* Edit Mode - Field List */}
      {!previewMode && (
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
                  <div className={cn(
                    "w-7 h-7 rounded-lg flex items-center justify-center shrink-0",
                    isEditing ? "bg-primary/10" : "bg-muted"
                  )}>
                    <Icon className={cn("w-3.5 h-3.5", isEditing ? "text-primary" : "text-muted-foreground")} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium truncate block">{field.label}</span>
                    <span className="text-[10px] text-muted-foreground capitalize">{field.type}{field.required ? ' · Required' : ''}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {field.required && (
                      <Badge variant="secondary" className="text-[9px] px-1.5 py-0">Required</Badge>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 opacity-0 group-hover:opacity-100 text-destructive"
                      onClick={(e) => { e.stopPropagation(); removeField(field.id); }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                    {isEditing ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                  </div>
                </div>

                {/* Field Settings (expanded) */}
                {isEditing && (
                  <div className="px-3 pb-3 space-y-3 border-t border-border pt-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Label</Label>
                        <Input
                          value={field.label}
                          onChange={(e) => updateField(field.id, { label: e.target.value })}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Placeholder</Label>
                        <Input
                          value={field.placeholder || ''}
                          onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                          className="h-8 text-sm"
                          placeholder="Optional"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Field Type</Label>
                        <Select value={field.type} onValueChange={(val: FormFieldType) => updateField(field.id, { type: val })}>
                          <SelectTrigger className="h-8 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {FIELD_TYPES.map(ft => (
                              <SelectItem key={ft.type} value={ft.type}>{ft.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Width</Label>
                        <Select value={field.width || 'full'} onValueChange={(val: 'full' | 'half') => updateField(field.id, { width: val })}>
                          <SelectTrigger className="h-8 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="full">Full Width</SelectItem>
                            <SelectItem value="half">Half Width</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Required</Label>
                      <Switch
                        checked={field.required}
                        onCheckedChange={(val) => updateField(field.id, { required: val })}
                      />
                    </div>

                    {/* Options for select/radio/checkbox */}
                    {['select', 'radio', 'checkbox'].includes(field.type) && (
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold">Options</Label>
                        <div className="space-y-1.5">
                          {(field.options || []).map((opt, optIdx) => (
                            <div key={optIdx} className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground w-5">{optIdx + 1}.</span>
                              <Input
                                value={opt}
                                onChange={(e) => {
                                  const newOpts = [...(field.options || [])];
                                  newOpts[optIdx] = e.target.value;
                                  updateField(field.id, { options: newOpts });
                                }}
                                className="h-7 text-xs flex-1"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive"
                                onClick={() => removeOption(field.id, optIdx)}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Input
                            value={optionInput}
                            onChange={(e) => setOptionInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addOption(field.id))}
                            placeholder="Add option..."
                            className="h-7 text-xs flex-1"
                          />
                          <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => addOption(field.id)}>
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Add Field Button */}
          {!showFieldPicker ? (
            <Button
              type="button"
              variant="outline"
              className="w-full border-dashed h-12"
              onClick={() => setShowFieldPicker(true)}
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Add Field
            </Button>
          ) : (
            <Card className="border-2 border-primary/20">
              <CardContent className="p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Select Field Type</Label>
                  <Button type="button" variant="ghost" size="sm" className="h-6 text-xs" onClick={() => setShowFieldPicker(false)}>Cancel</Button>
                </div>
                {['Basic', 'Choice', 'Advanced'].map(category => (
                  <div key={category}>
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{category}</span>
                    <div className="grid grid-cols-3 gap-1.5 mt-1.5">
                      {FIELD_TYPES.filter(f => f.category === category).map(ft => {
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
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
