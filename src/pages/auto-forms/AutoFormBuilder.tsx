import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ChevronLeft, Save, Eye, Send, GripVertical, Plus, Trash2,
  Copy, ChevronDown, ChevronUp, Layers, Settings2, Smartphone,
  Monitor, GitBranch, FileText, Clock, Undo2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { toast } from 'sonner';
import { FIELD_TYPES, FIELD_ICON_MAP, FORM_PRESETS } from '@/components/automation/form-builder/field-config';
import { FieldSettingsPanel } from '@/components/automation/form-builder/FieldSettingsPanel';
import { FormPreview } from '@/components/automation/form-builder/FormPreview';
import type { FormField, FormFieldType, FormBuilderState } from '@/components/automation/form-builder/types';
import { DEFAULT_FORM_STATE } from '@/components/automation/form-builder/types';

export default function AutoFormBuilder() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentTenant } = useTenant();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);

  // Form metadata
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formStatus, setFormStatus] = useState('draft');

  // Builder state
  const [fields, setFields] = useState<FormField[]>([]);
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [showFieldLibrary, setShowFieldLibrary] = useState(true);
  const [previewMode, setPreviewMode] = useState(false);
  const [previewStyle, setPreviewStyle] = useState<'standard' | 'whatsapp'>('standard');
  const [settings, setSettings] = useState(DEFAULT_FORM_STATE.settings);
  const [versions, setVersions] = useState<any[]>([]);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);

  // Drag state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Load form data
  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      try {
        // Load form
        const { data: form, error } = await (supabase as any)
          .from('forms')
          .select('*')
          .eq('id', id)
          .single();
        if (error) throw error;
        setFormName(form.name);
        setFormDescription(form.description || '');
        setFormStatus(form.status);

        // Load versions
        const { data: vers } = await (supabase as any)
          .from('form_versions')
          .select('*')
          .eq('form_id', id)
          .order('version', { ascending: false });
        setVersions(vers || []);

        // Load fields from latest version
        const activeVersion = form.active_version_id || vers?.[0]?.id;
        if (activeVersion) {
          setSelectedVersionId(activeVersion);
          const version = vers?.find((v: any) => v.id === activeVersion);
          if (version?.schema_json?.fields) {
            setFields(version.schema_json.fields);
            if (version.schema_json.settings) setSettings(version.schema_json.settings);
          } else {
            // Load from form_fields table
            const { data: fieldData } = await (supabase as any)
              .from('form_fields')
              .select('*')
              .eq('form_version_id', activeVersion)
              .order('order_index', { ascending: true });
            if (fieldData?.length) {
              setFields(fieldData.map((f: any) => ({
                id: f.key || f.id,
                type: mapDbTypeToBuilder(f.type),
                label: f.label,
                placeholder: f.placeholder || '',
                required: f.required,
                width: 'full' as const,
                step: 1,
                description: f.help_text || '',
                ...f.config_json,
              })));
            }
          }
        }
      } catch (err: any) {
        toast.error('Failed to load form');
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const mapDbTypeToBuilder = (type: string): FormFieldType => {
    const map: Record<string, FormFieldType> = {
      long_text: 'textarea',
      dropdown: 'select',
      file: 'file_upload',
      otp: 'otp_verification',
    };
    return (map[type] || type) as FormFieldType;
  };

  // Save draft
  const handleSave = async () => {
    if (!id || !currentTenant?.id) return;
    setSaving(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;

      // Update form name/desc
      await (supabase as any).from('forms').update({
        name: formName, description: formDescription || null, updated_at: new Date().toISOString(),
      }).eq('id', id);

      // Create or update version
      const schemaJson = { fields, settings };
      const nextVersion = (versions[0]?.version || 0) + 1;

      if (versions.length > 0 && !versions[0].published_at) {
        // Update existing draft version
        await (supabase as any).from('form_versions').update({
          schema_json: schemaJson,
        }).eq('id', versions[0].id);
        toast.success('Draft saved');
      } else {
        // Create new version
        const { data: newVer } = await (supabase as any).from('form_versions').insert({
          form_id: id, version: nextVersion, schema_json: schemaJson, created_by: userId,
        }).select().single();
        if (newVer) setVersions(prev => [newVer, ...prev]);
        toast.success('New version saved');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  // Publish
  const handlePublish = async () => {
    if (!id) return;
    setPublishing(true);
    try {
      await handleSave();
      const latestVersion = versions[0];
      if (latestVersion) {
        await (supabase as any).from('form_versions').update({
          published_at: new Date().toISOString(),
        }).eq('id', latestVersion.id);
        await (supabase as any).from('forms').update({
          active_version_id: latestVersion.id, status: 'active',
        }).eq('id', id);
        setFormStatus('active');
        toast.success('Form published!');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to publish');
    } finally {
      setPublishing(false);
    }
  };

  // Field operations
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
    setFields(prev => [...prev, newField]);
    setEditingFieldId(newField.id);
  };

  const updateField = (fid: string, updates: Partial<FormField>) => {
    setFields(prev => prev.map(f => f.id === fid ? { ...f, ...updates } : f));
  };

  const removeField = (fid: string) => {
    setFields(prev => prev.filter(f => f.id !== fid));
    if (editingFieldId === fid) setEditingFieldId(null);
  };

  const cloneField = (field: FormField) => {
    const cloned = { ...field, id: crypto.randomUUID(), label: `${field.label} (copy)` };
    const idx = fields.findIndex(f => f.id === field.id);
    const updated = [...fields];
    updated.splice(idx + 1, 0, cloned);
    setFields(updated);
  };

  const moveField = (from: number, to: number) => {
    const updated = [...fields];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    setFields(updated);
  };

  const applyPreset = (preset: typeof FORM_PRESETS[0]) => {
    setFields(preset.fields.map(f => ({
      ...f,
      id: crypto.randomUUID(),
      required: f.required ?? false,
      width: 'full' as const,
      step: 1,
    })) as FormField[]);
    if (!formName || formName === 'Untitled Form') setFormName(preset.name + ' Form');
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
  const handleDragEnd = () => { setDraggedIndex(null); setDragOverIndex(null); };

  const editingField = fields.find(f => f.id === editingFieldId);

  const builderState: FormBuilderState = {
    fields, formName, steps: settings.multiStep ? Math.max(...fields.map(f => f.step || 1), 1) : 1,
    ifThenRules: [], settings,
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6 space-y-4">
          <Skeleton className="h-10 w-64" />
          <div className="grid grid-cols-12 gap-4">
            <Skeleton className="col-span-3 h-[600px]" />
            <Skeleton className="col-span-6 h-[600px]" />
            <Skeleton className="col-span-3 h-[600px]" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full">
        {/* Top Toolbar */}
        <div className="px-4 py-3 border-b bg-card flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate('/auto-forms')}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1 min-w-0">
            <Input
              value={formName}
              onChange={e => setFormName(e.target.value)}
              className="border-0 bg-transparent text-lg font-semibold h-8 px-1 focus-visible:ring-0"
              placeholder="Form name..."
            />
          </div>
          <div className="flex items-center gap-2">
            {versions.length > 1 && (
              <Select value={selectedVersionId || ''} onValueChange={setSelectedVersionId}>
                <SelectTrigger className="h-8 w-28 text-xs">
                  <SelectValue placeholder="Version" />
                </SelectTrigger>
                <SelectContent>
                  {versions.map((v: any) => (
                    <SelectItem key={v.id} value={v.id}>
                      v{v.version} {v.published_at ? '✓' : '(draft)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Badge variant={formStatus === 'active' ? 'default' : 'secondary'} className="text-[10px]">
              {formStatus}
            </Badge>
            <Button variant="outline" size="sm" onClick={() => setPreviewMode(!previewMode)} className="gap-1">
              <Eye className="w-3.5 h-3.5" /> Preview
            </Button>
            <Button variant="outline" size="sm" onClick={handleSave} disabled={saving} className="gap-1">
              <Save className="w-3.5 h-3.5" /> {saving ? 'Saving...' : 'Save'}
            </Button>
            <Button size="sm" onClick={handlePublish} disabled={publishing} className="gap-1">
              <Send className="w-3.5 h-3.5" /> {publishing ? 'Publishing...' : 'Publish'}
            </Button>
          </div>
        </div>

        {/* 3-Panel Layout */}
        {previewMode ? (
          <div className="flex-1 flex items-start justify-center p-6 bg-muted/30 overflow-auto">
            <div className="max-w-lg w-full space-y-3">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Button variant={previewStyle === 'standard' ? 'default' : 'outline'} size="sm" onClick={() => setPreviewStyle('standard')} className="h-7 text-xs gap-1">
                  <Monitor className="w-3 h-3" /> Standard
                </Button>
                <Button variant={previewStyle === 'whatsapp' ? 'default' : 'outline'} size="sm" onClick={() => setPreviewStyle('whatsapp')} className="h-7 text-xs gap-1">
                  <Smartphone className="w-3 h-3" /> WhatsApp
                </Button>
              </div>
              <FormPreview state={builderState} whatsappStyle={previewStyle === 'whatsapp'} />
            </div>
          </div>
        ) : (
          <div className="flex-1 grid grid-cols-12 min-h-0">
            {/* LEFT: Field Library */}
            <div className="col-span-3 border-r bg-muted/20 overflow-hidden flex flex-col">
              <div className="p-3 border-b">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" /> Field Library
                </h3>
              </div>
              <ScrollArea className="flex-1">
                <div className="p-3 space-y-4">
                  {['Basic', 'Choice', 'Advanced', 'Smart'].map(category => {
                    const catFields = FIELD_TYPES.filter(f => f.category === category);
                    if (!catFields.length) return null;
                    return (
                      <div key={category}>
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                          {category === 'Smart' ? '🧠 Smart' : category}
                        </p>
                        <div className="space-y-1">
                          {catFields.map(ft => {
                            const FIcon = ft.icon;
                            return (
                              <button
                                key={ft.type}
                                onClick={() => addField(ft.type)}
                                className="w-full flex items-center gap-2 p-2 rounded-lg border border-transparent hover:border-primary/30 hover:bg-primary/5 transition-all text-left"
                              >
                                <FIcon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                <div className="min-w-0">
                                  <p className="text-xs font-medium truncate">{ft.label}</p>
                                  <p className="text-[9px] text-muted-foreground truncate">{ft.description}</p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}

                  <Separator />

                  {/* Presets */}
                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">📚 Templates</p>
                    <div className="space-y-1">
                      {FORM_PRESETS.map(preset => (
                        <button
                          key={preset.name}
                          onClick={() => applyPreset(preset)}
                          className="w-full flex items-center gap-2 p-2 rounded-lg border border-dashed border-border hover:border-primary/40 hover:bg-primary/5 transition-all text-left"
                        >
                          <span className="text-base">{preset.icon}</span>
                          <div className="min-w-0">
                            <p className="text-xs font-medium truncate">{preset.name}</p>
                            <p className="text-[9px] text-muted-foreground">{preset.fields.length} fields</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </div>

            {/* CENTER: Form Canvas */}
            <div className="col-span-6 overflow-hidden flex flex-col bg-background">
              <div className="p-3 border-b flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Canvas · {fields.length} field{fields.length !== 1 ? 's' : ''}
                </h3>
                <div className="flex gap-1">
                  <Badge variant="outline" className="text-[9px]">{fields.filter(f => f.required).length} required</Badge>
                  <Badge variant="outline" className="text-[9px]">{fields.filter(f => f.type === 'hidden').length} hidden</Badge>
                </div>
              </div>
              <ScrollArea className="flex-1">
                <div className="p-4 space-y-2">
                  {fields.length === 0 && (
                    <div className="text-center py-16 text-muted-foreground">
                      <Layers className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      <p className="text-sm font-medium mb-1">Empty Canvas</p>
                      <p className="text-xs">Drag fields from the library or select a template</p>
                    </div>
                  )}
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
                          isEditing ? "border-primary shadow-md ring-2 ring-primary/20" : "border-border hover:border-primary/30",
                          isDragOver && "border-primary/50 bg-primary/5",
                          draggedIndex === idx && "opacity-50"
                        )}
                      >
                        <div
                          className="flex items-center gap-2 p-2.5 cursor-pointer"
                          onClick={() => setEditingFieldId(isEditing ? null : field.id)}
                        >
                          <div className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded">
                            <GripVertical className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0", isEditing ? "bg-primary/10" : "bg-muted")}>
                            {Icon && <Icon className={cn("w-3.5 h-3.5", isEditing ? "text-primary" : "text-muted-foreground")} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-medium truncate block">{field.label}</span>
                            <span className="text-[10px] text-muted-foreground capitalize">
                              {field.type.replace(/_/g, ' ')}{field.required ? ' · Required' : ''}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <Button type="button" variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100" onClick={e => { e.stopPropagation(); cloneField(field); }}>
                              <Copy className="w-3.5 h-3.5" />
                            </Button>
                            <Button type="button" variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 text-destructive" onClick={e => { e.stopPropagation(); removeField(field.id); }}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                            {isEditing ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>

            {/* RIGHT: Field Properties */}
            <div className="col-span-3 border-l bg-muted/20 overflow-hidden flex flex-col">
              <div className="p-3 border-b">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Settings2 className="w-3.5 h-3.5" /> Properties
                </h3>
              </div>
              <ScrollArea className="flex-1">
                {editingField ? (
                  <FieldSettingsPanel
                    field={editingField}
                    allFields={fields}
                    onUpdate={updates => updateField(editingField.id, updates)}
                  />
                ) : (
                  <div className="p-4 text-center text-muted-foreground">
                    <Settings2 className="w-10 h-10 mx-auto mb-2 opacity-20" />
                    <p className="text-sm">Select a field to edit properties</p>
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
