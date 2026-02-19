import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2, X } from 'lucide-react';
import type { FormField, FormFieldType, FormFieldOption } from './types';
import { FIELD_TYPES, HIDDEN_FIELD_SOURCES, FILE_TYPE_OPTIONS } from './field-config';

interface FieldSettingsPanelProps {
  field: FormField;
  allFields: FormField[];
  onUpdate: (updates: Partial<FormField>) => void;
}

export function FieldSettingsPanel({ field, allFields, onUpdate }: FieldSettingsPanelProps) {
  const [optionInput, setOptionInput] = useState('');
  const [scoreInput, setScoreInput] = useState('');
  const [tagInput, setTagInput] = useState('');

  const hasOptions = ['select', 'radio', 'checkbox', 'tag_assignment', 'lead_score'].includes(field.type);

  const addOption = () => {
    if (!optionInput.trim()) return;
    const newOpt: FormFieldOption = {
      label: optionInput.trim(),
      value: optionInput.trim().toLowerCase().replace(/\s+/g, '_'),
      score: field.type === 'lead_score' ? parseInt(scoreInput) || 0 : undefined,
      tag: field.type === 'tag_assignment' ? tagInput.trim() || undefined : undefined,
    };
    onUpdate({ options: [...(field.options || []), newOpt] });
    setOptionInput('');
    setScoreInput('');
    setTagInput('');
  };

  const removeOption = (idx: number) => {
    onUpdate({ options: (field.options || []).filter((_, i) => i !== idx) });
  };

  const updateOption = (idx: number, updates: Partial<FormFieldOption>) => {
    const opts = [...(field.options || [])];
    opts[idx] = { ...opts[idx], ...updates };
    onUpdate({ options: opts });
  };

  return (
    <div className="space-y-3 px-3 pb-3 border-t border-border pt-3">
      {/* Basic settings */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Label</Label>
          <Input value={field.label} onChange={e => onUpdate({ label: e.target.value })} className="h-8 text-sm" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Placeholder</Label>
          <Input value={field.placeholder || ''} onChange={e => onUpdate({ placeholder: e.target.value })} className="h-8 text-sm" placeholder="Optional" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Field Type</Label>
          <Select value={field.type} onValueChange={(val: FormFieldType) => onUpdate({ type: val })}>
            <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              {FIELD_TYPES.map(ft => <SelectItem key={ft.type} value={ft.type}>{ft.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Width</Label>
          <Select value={field.width || 'full'} onValueChange={(val: 'full' | 'half') => onUpdate({ width: val })}>
            <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="full">Full Width</SelectItem>
              <SelectItem value="half">Half Width</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label className="text-xs">Help Text</Label>
        <Input value={field.description || ''} onChange={e => onUpdate({ description: e.target.value })} className="h-8 text-sm" placeholder="Helper text shown below field" />
      </div>

      {/* Required toggle */}
      {field.type !== 'hidden' && field.type !== 'calculated' && (
        <div className="flex items-center justify-between">
          <Label className="text-xs">Required</Label>
          <Switch checked={field.required} onCheckedChange={val => onUpdate({ required: val })} />
        </div>
      )}

      {/* Multi-step assignment */}
      <div className="space-y-1.5">
        <Label className="text-xs">Step</Label>
        <Input type="number" min={1} value={field.step || 1} onChange={e => onUpdate({ step: parseInt(e.target.value) || 1 })} className="h-8 text-sm w-20" />
      </div>

      {/* HIDDEN FIELD config */}
      {field.type === 'hidden' && (
        <div className="space-y-2 p-2.5 rounded-lg bg-muted/50">
          <Label className="text-xs font-semibold">Auto-Store Source</Label>
          <Select value={field.hiddenSource || 'custom'} onValueChange={val => onUpdate({ hiddenSource: val as any })}>
            <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              {HIDDEN_FIELD_SOURCES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
          {field.hiddenSource === 'custom' && (
            <Input value={field.hiddenValue || ''} onChange={e => onUpdate({ hiddenValue: e.target.value })} className="h-8 text-sm" placeholder="Custom value" />
          )}
        </div>
      )}

      {/* FILE UPLOAD config */}
      {field.type === 'file_upload' && (
        <div className="space-y-2 p-2.5 rounded-lg bg-muted/50">
          <Label className="text-xs font-semibold">Allowed File Types</Label>
          <div className="flex flex-wrap gap-1.5">
            {FILE_TYPE_OPTIONS.map(ft => {
              const selected = (field.fileTypes || []).includes(ft.value);
              return (
                <Badge
                  key={ft.value}
                  variant={selected ? 'default' : 'outline'}
                  className="cursor-pointer text-[10px]"
                  onClick={() => {
                    const current = field.fileTypes || [];
                    onUpdate({ fileTypes: selected ? current.filter(t => t !== ft.value) : [...current, ft.value] });
                  }}
                >
                  {ft.label}
                </Badge>
              );
            })}
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Max File Size (MB)</Label>
            <Input type="number" value={field.maxFileSize || 10} onChange={e => onUpdate({ maxFileSize: parseInt(e.target.value) || 10 })} className="h-8 text-sm w-24" />
          </div>
        </div>
      )}

      {/* OTP config */}
      {field.type === 'otp_verification' && (
        <div className="space-y-2 p-2.5 rounded-lg bg-muted/50">
          <Label className="text-xs font-semibold">Verification Type</Label>
          <Select value={field.otpType || 'phone'} onValueChange={val => onUpdate({ otpType: val as 'phone' | 'email' })}>
            <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="phone">Phone (SMS/WhatsApp)</SelectItem>
              <SelectItem value="email">Email</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* TIME SLOT config */}
      {field.type === 'time_slot' && (
        <div className="space-y-2 p-2.5 rounded-lg bg-muted/50">
          <Label className="text-xs font-semibold">Time Slot Configuration</Label>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-[10px]">Start Hour</Label>
              <Input type="number" min={0} max={23} value={field.timeSlotConfig?.startHour ?? 9} onChange={e => onUpdate({ timeSlotConfig: { ...(field.timeSlotConfig || { startHour: 9, endHour: 17, intervalMinutes: 30, daysOfWeek: [1,2,3,4,5] }), startHour: parseInt(e.target.value) || 9 } })} className="h-7 text-xs" />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px]">End Hour</Label>
              <Input type="number" min={0} max={23} value={field.timeSlotConfig?.endHour ?? 17} onChange={e => onUpdate({ timeSlotConfig: { ...(field.timeSlotConfig || { startHour: 9, endHour: 17, intervalMinutes: 30, daysOfWeek: [1,2,3,4,5] }), endHour: parseInt(e.target.value) || 17 } })} className="h-7 text-xs" />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-[10px]">Interval (minutes)</Label>
            <Select value={String(field.timeSlotConfig?.intervalMinutes ?? 30)} onValueChange={val => onUpdate({ timeSlotConfig: { ...(field.timeSlotConfig || { startHour: 9, endHour: 17, intervalMinutes: 30, daysOfWeek: [1,2,3,4,5] }), intervalMinutes: parseInt(val) } })}>
              <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 min</SelectItem>
                <SelectItem value="30">30 min</SelectItem>
                <SelectItem value="45">45 min</SelectItem>
                <SelectItem value="60">60 min</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* CALCULATED FIELD config */}
      {field.type === 'calculated' && (
        <div className="space-y-2 p-2.5 rounded-lg bg-muted/50">
          <Label className="text-xs font-semibold">Calculation Setup</Label>
          <Select value={field.calculationOperator || 'multiply'} onValueChange={val => onUpdate({ calculationOperator: val as any })}>
            <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="multiply">Multiply (A × B)</SelectItem>
              <SelectItem value="add">Add (A + B)</SelectItem>
              <SelectItem value="subtract">Subtract (A - B)</SelectItem>
              <SelectItem value="divide">Divide (A ÷ B)</SelectItem>
              <SelectItem value="custom">Custom Formula</SelectItem>
            </SelectContent>
          </Select>
          <div className="space-y-1.5">
            <Label className="text-[10px]">Source Fields</Label>
            <div className="flex flex-wrap gap-1">
              {allFields.filter(f => f.id !== field.id && ['number', 'select', 'rating'].includes(f.type)).map(f => {
                const selected = (field.calculationFields || []).includes(f.id);
                return (
                  <Badge
                    key={f.id}
                    variant={selected ? 'default' : 'outline'}
                    className="cursor-pointer text-[10px]"
                    onClick={() => {
                      const cur = field.calculationFields || [];
                      onUpdate({ calculationFields: selected ? cur.filter(id => id !== f.id) : [...cur, f.id] });
                    }}
                  >
                    {f.label}
                  </Badge>
                );
              })}
            </div>
          </div>
          {field.calculationOperator === 'custom' && (
            <div className="space-y-1">
              <Label className="text-[10px]">Formula</Label>
              <Input value={field.calculationFormula || ''} onChange={e => onUpdate({ calculationFormula: e.target.value })} className="h-7 text-xs font-mono" placeholder="e.g. {quantity} * {price} * 1.1" />
            </div>
          )}
        </div>
      )}

      {/* OPTIONS for choice/tag/score fields */}
      {hasOptions && (
        <div className="space-y-2">
          <Label className="text-xs font-semibold">
            {field.type === 'lead_score' ? 'Score Rules' : field.type === 'tag_assignment' ? 'Tag Rules' : 'Options'}
          </Label>
          <div className="space-y-1.5">
            {(field.options || []).map((opt, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground w-4">{i + 1}.</span>
                <Input value={opt.label} onChange={e => updateOption(i, { label: e.target.value, value: e.target.value.toLowerCase().replace(/\s+/g, '_') })} className="h-7 text-xs flex-1" />
                {field.type === 'lead_score' && (
                  <Input type="number" value={opt.score ?? 0} onChange={e => updateOption(i, { score: parseInt(e.target.value) || 0 })} className="h-7 text-xs w-16" placeholder="pts" />
                )}
                {field.type === 'tag_assignment' && (
                  <Input value={opt.tag || ''} onChange={e => updateOption(i, { tag: e.target.value })} className="h-7 text-xs w-24" placeholder="Tag" />
                )}
                <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeOption(i)}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
          <div className="flex gap-1.5">
            <Input value={optionInput} onChange={e => setOptionInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addOption())} placeholder="Add option..." className="h-7 text-xs flex-1" />
            {field.type === 'lead_score' && (
              <Input type="number" value={scoreInput} onChange={e => setScoreInput(e.target.value)} placeholder="+pts" className="h-7 text-xs w-16" />
            )}
            {field.type === 'tag_assignment' && (
              <Input value={tagInput} onChange={e => setTagInput(e.target.value)} placeholder="Tag" className="h-7 text-xs w-24" />
            )}
            <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={addOption}><Plus className="w-3 h-3" /></Button>
          </div>
        </div>
      )}

      {/* Lead Score Thresholds (shown on lead_score type) */}
      {field.type === 'lead_score' && (
        <div className="space-y-2 p-2.5 rounded-lg bg-gradient-to-r from-red-50 via-amber-50 to-green-50">
          <Label className="text-xs font-semibold">Auto-Classify Thresholds</Label>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="space-y-1">
              <Badge variant="destructive" className="text-[9px]">🔥 Hot</Badge>
              <p className="text-[10px] text-muted-foreground">≥ 80 pts</p>
            </div>
            <div className="space-y-1">
              <Badge className="text-[9px] bg-amber-500">🌤 Warm</Badge>
              <p className="text-[10px] text-muted-foreground">≥ 50 pts</p>
            </div>
            <div className="space-y-1">
              <Badge variant="secondary" className="text-[9px]">❄️ Cold</Badge>
              <p className="text-[10px] text-muted-foreground">{"< 50 pts"}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tag Assignment preview */}
      {field.type === 'tag_assignment' && (field.options || []).some(o => o.tag) && (
        <div className="p-2.5 rounded-lg bg-primary/5">
          <Label className="text-xs font-semibold mb-1.5 block">Auto-Tag Preview</Label>
          <div className="flex flex-wrap gap-1.5">
            {(field.options || []).filter(o => o.tag).map((o, i) => (
              <div key={i} className="text-[10px]">
                <span className="text-muted-foreground">{o.label} →</span>{' '}
                <Badge variant="outline" className="text-[9px]">{o.tag}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
