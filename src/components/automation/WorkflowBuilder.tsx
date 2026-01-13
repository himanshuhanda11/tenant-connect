import { useState } from 'react';
import { Zap, Filter, MessageSquare, ChevronRight, Clock, Save, PlayCircle, AlertTriangle, X } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WorkflowWithRelations, TriggerType, ConditionType, ActionType, TRIGGER_DEFINITIONS, CONDITION_DEFINITIONS, ACTION_DEFINITIONS, CONDITION_PRESETS } from '@/types/automation';

interface WorkflowBuilderProps {
  workflow: WorkflowWithRelations | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (workflow: Partial<WorkflowWithRelations>) => Promise<boolean>;
}

export function WorkflowBuilder({ workflow, open, onOpenChange, onSave }: WorkflowBuilderProps) {
  const [name, setName] = useState(workflow?.name || 'New Workflow');
  const [description, setDescription] = useState(workflow?.description || '');
  const [triggerType, setTriggerType] = useState<TriggerType>(workflow?.trigger_type || 'first_inbound_message');
  const [triggerConfig, setTriggerConfig] = useState<Record<string, any>>(workflow?.trigger_config || {});
  const [guardrails, setGuardrails] = useState({
    max_messages_per_hour: workflow?.max_messages_per_hour || 10,
    max_messages_per_contact_per_day: workflow?.max_messages_per_contact_per_day || 50,
    cooldown_seconds: workflow?.cooldown_seconds || 900,
    enforce_opt_in_for_marketing: workflow?.enforce_opt_in_for_marketing ?? true,
    stop_on_customer_reply: workflow?.stop_on_customer_reply ?? true,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async (activate: boolean = false) => {
    setSaving(true);
    const success = await onSave({
      id: workflow?.id,
      name,
      description,
      trigger_type: triggerType,
      trigger_config: triggerConfig,
      status: activate ? 'active' : 'draft',
      ...guardrails,
    });
    setSaving(false);
    if (success) onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-3xl p-0 flex flex-col">
        <SheetHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle>Workflow Builder</SheetTitle>
              <SheetDescription>Create and configure your automation</SheetDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => handleSave(false)} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />Save Draft
              </Button>
              <Button onClick={() => handleSave(true)} disabled={saving}>
                <PlayCircle className="h-4 w-4 mr-2" />Activate
              </Button>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 flex overflow-hidden">
          <div className="w-64 border-r bg-muted/30 flex flex-col">
            <Tabs defaultValue="triggers" className="flex-1 flex flex-col">
              <TabsList className="grid grid-cols-3 m-2">
                <TabsTrigger value="triggers" className="text-xs"><Zap className="h-3 w-3 mr-1" />When</TabsTrigger>
                <TabsTrigger value="conditions" className="text-xs"><Filter className="h-3 w-3 mr-1" />If</TabsTrigger>
                <TabsTrigger value="actions" className="text-xs"><MessageSquare className="h-3 w-3 mr-1" />Then</TabsTrigger>
              </TabsList>

              <ScrollArea className="flex-1">
                <TabsContent value="triggers" className="m-0 p-2 space-y-1">
                  {Object.entries(TRIGGER_DEFINITIONS).map(([type, def]) => (
                    <button
                      key={type}
                      onClick={() => { setTriggerType(type as TriggerType); setTriggerConfig({}); }}
                      className={`w-full text-left p-2 rounded-md text-sm transition-colors ${triggerType === type ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                    >
                      <span className="truncate">{def.label}</span>
                    </button>
                  ))}
                </TabsContent>

                <TabsContent value="conditions" className="m-0 p-2">
                  <div className="mb-3">
                    <p className="text-xs text-muted-foreground mb-2">Presets</p>
                    <div className="space-y-1">
                      {CONDITION_PRESETS.map(preset => (
                        <button key={preset.id} className="w-full text-left p-2 rounded-md text-sm hover:bg-muted">
                          <Badge variant="outline" className="text-xs">{preset.name}</Badge>
                        </button>
                      ))}
                    </div>
                  </div>
                  <Separator className="my-2" />
                  <div className="space-y-1">
                    {Object.entries(CONDITION_DEFINITIONS).map(([type, def]) => (
                      <button key={type} className="w-full text-left p-2 rounded-md text-sm hover:bg-muted truncate">
                        {def.label}
                      </button>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="actions" className="m-0 p-2 space-y-1">
                  {Object.entries(ACTION_DEFINITIONS).map(([type, def]) => (
                    <button key={type} className="w-full text-left p-2 rounded-md text-sm hover:bg-muted truncate">
                      {def.label}
                    </button>
                  ))}
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </div>

          <div className="flex-1 flex flex-col overflow-hidden">
            <ScrollArea className="flex-1 p-6">
              <div className="mb-6 space-y-4">
                <div><Label>Workflow Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
                <div><Label>Description</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} /></div>
              </div>

              <div className="mb-4">
                <Badge className="bg-primary mb-2"><Zap className="h-3 w-3 mr-1" />WHEN</Badge>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary"><Zap className="h-5 w-5" /></div>
                      <div className="flex-1">
                        <p className="font-medium">{TRIGGER_DEFINITIONS[triggerType]?.label}</p>
                        <p className="text-sm text-muted-foreground">{TRIGGER_DEFINITIONS[triggerType]?.description}</p>
                      </div>
                    </div>

                    {triggerType === 'keyword_received' && (
                      <div className="mt-4 space-y-3">
                        <div>
                          <Label>Keywords (comma separated)</Label>
                          <Input
                            value={triggerConfig.keywords?.join(', ') || ''}
                            onChange={(e) => setTriggerConfig({ ...triggerConfig, keywords: e.target.value.split(',').map(k => k.trim()) })}
                            placeholder="MENU, HELP, STATUS"
                          />
                        </div>
                        <div>
                          <Label>Match Type</Label>
                          <Select value={triggerConfig.match_type || 'exact'} onValueChange={(v) => setTriggerConfig({ ...triggerConfig, match_type: v })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="exact">Exact Match</SelectItem>
                              <SelectItem value="contains">Contains</SelectItem>
                              <SelectItem value="regex">Regex</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}

                    {triggerType === 'inactivity_no_reply' && (
                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <div><Label>Minutes</Label><Input type="number" value={triggerConfig.minutes || 30} onChange={(e) => setTriggerConfig({ ...triggerConfig, minutes: parseInt(e.target.value) })} /></div>
                      </div>
                    )}

                    {triggerType === 'tag_added' && (
                      <div className="mt-4"><Label>Tag Name</Label><Input value={triggerConfig.tag_name || ''} onChange={(e) => setTriggerConfig({ ...triggerConfig, tag_name: e.target.value })} placeholder="VIP" /></div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-center my-2"><ChevronRight className="h-5 w-5 text-muted-foreground rotate-90" /></div>

              <Separator className="my-6" />
              <div>
                <div className="flex items-center gap-2 mb-4"><AlertTriangle className="h-4 w-4 text-amber-500" /><h3 className="font-medium">Safety Guardrails</h3></div>
                <div className="grid md:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4 space-y-4">
                      <div><Label>Max messages per hour</Label><Input type="number" value={guardrails.max_messages_per_hour} onChange={(e) => setGuardrails({ ...guardrails, max_messages_per_hour: parseInt(e.target.value) })} /></div>
                      <div><Label>Max messages per day</Label><Input type="number" value={guardrails.max_messages_per_contact_per_day} onChange={(e) => setGuardrails({ ...guardrails, max_messages_per_contact_per_day: parseInt(e.target.value) })} /></div>
                      <div><Label>Cooldown (seconds)</Label><Input type="number" value={guardrails.cooldown_seconds} onChange={(e) => setGuardrails({ ...guardrails, cooldown_seconds: parseInt(e.target.value) })} /></div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 space-y-4">
                      <div className="flex items-center justify-between"><Label>Require opt-in</Label><Switch checked={guardrails.enforce_opt_in_for_marketing} onCheckedChange={(c) => setGuardrails({ ...guardrails, enforce_opt_in_for_marketing: c })} /></div>
                      <div className="flex items-center justify-between"><Label>Stop on reply</Label><Switch checked={guardrails.stop_on_customer_reply} onCheckedChange={(c) => setGuardrails({ ...guardrails, stop_on_customer_reply: c })} /></div>
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
