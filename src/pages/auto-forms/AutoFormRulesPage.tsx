import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ChevronLeft, Plus, Trash2, GitBranch, Zap, Tag, Send, User,
  Globe, CheckCircle2, AlertCircle, Play, Sparkles, Save,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { toast } from 'sonner';

interface RuleCondition {
  id: string;
  field: string;
  op: string;
  value: string;
  connector: 'AND' | 'OR';
}

interface RuleAction {
  id: string;
  type: string;
  config: Record<string, any>;
}

interface FormRule {
  id: string;
  name: string;
  enabled: boolean;
  trigger: string;
  priority: number;
  conditions: RuleCondition[];
  actions: RuleAction[];
}

const OPERATORS = [
  { value: '==', label: 'equals' },
  { value: '!=', label: 'not equals' },
  { value: '>', label: 'greater than' },
  { value: '<', label: 'less than' },
  { value: '>=', label: 'at least' },
  { value: '<=', label: 'at most' },
  { value: 'contains', label: 'contains' },
  { value: 'in', label: 'is in' },
];

const ACTION_TYPES = [
  { value: 'show_fields', label: 'Show/Hide Fields', icon: Sparkles },
  { value: 'add_tags', label: 'Add Tags', icon: Tag },
  { value: 'update_score', label: 'Update Lead Score', icon: Zap },
  { value: 'assign_agent', label: 'Assign Agent', icon: User },
  { value: 'send_template', label: 'Send WhatsApp Template', icon: Send },
  { value: 'webhook', label: 'Trigger Webhook', icon: Globe },
];

export default function AutoFormRulesPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentTenant } = useTenant();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formName, setFormName] = useState('');
  const [rules, setRules] = useState<FormRule[]>([]);
  const [formFields, setFormFields] = useState<{ key: string; label: string }[]>([]);
  const [testMode, setTestMode] = useState(false);
  const [testAnswers, setTestAnswers] = useState<Record<string, string>>({});
  const [testResults, setTestResults] = useState<{ ruleId: string; matched: boolean; actions: string[] }[]>([]);

  // Load data
  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      try {
        // Load form
        const { data: form } = await (supabase as any).from('forms').select('*').eq('id', id).single();
        setFormName(form?.name || '');

        // Load fields from active version
        if (form?.active_version_id) {
          const { data: version } = await (supabase as any).from('form_versions').select('schema_json').eq('id', form.active_version_id).single();
          if (version?.schema_json?.fields) {
            setFormFields(version.schema_json.fields.map((f: any) => ({ key: f.id, label: f.label })));
          }
        } else {
          // Try latest version
          const { data: vers } = await (supabase as any).from('form_versions').select('schema_json').eq('form_id', id).order('version', { ascending: false }).limit(1);
          if (vers?.[0]?.schema_json?.fields) {
            setFormFields(vers[0].schema_json.fields.map((f: any) => ({ key: f.id, label: f.label })));
          }
        }

        // Load rules
        const { data: ruleData } = await (supabase as any)
          .from('form_rules')
          .select('*')
          .eq('form_id', id)
          .order('priority', { ascending: true });

        if (ruleData?.length) {
          setRules(ruleData.map((r: any) => ({
            id: r.id,
            name: r.name,
            enabled: r.is_active ?? r.enabled ?? true,
            trigger: r.trigger || 'on_submit',
            priority: r.priority || 100,
            conditions: (r.conditions_json?.all || []).map((c: any, i: number) => ({
              id: crypto.randomUUID(),
              field: c.field,
              op: c.op,
              value: typeof c.value === 'object' ? JSON.stringify(c.value) : String(c.value),
              connector: 'AND' as const,
            })),
            actions: (r.actions_json?.actions || []).map((a: any) => ({
              id: crypto.randomUUID(),
              type: a.type,
              config: a,
            })),
          })));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const addRule = () => {
    setRules(prev => [...prev, {
      id: crypto.randomUUID(),
      name: `Rule ${prev.length + 1}`,
      enabled: true,
      trigger: 'on_submit',
      priority: (prev.length + 1) * 100,
      conditions: [],
      actions: [],
    }]);
  };

  const updateRule = (ruleId: string, updates: Partial<FormRule>) => {
    setRules(prev => prev.map(r => r.id === ruleId ? { ...r, ...updates } : r));
  };

  const removeRule = (ruleId: string) => {
    setRules(prev => prev.filter(r => r.id !== ruleId));
  };

  const addCondition = (ruleId: string) => {
    setRules(prev => prev.map(r => r.id === ruleId ? {
      ...r,
      conditions: [...r.conditions, { id: crypto.randomUUID(), field: '', op: '==', value: '', connector: 'AND' }],
    } : r));
  };

  const updateCondition = (ruleId: string, condId: string, updates: Partial<RuleCondition>) => {
    setRules(prev => prev.map(r => r.id === ruleId ? {
      ...r,
      conditions: r.conditions.map(c => c.id === condId ? { ...c, ...updates } : c),
    } : r));
  };

  const removeCondition = (ruleId: string, condId: string) => {
    setRules(prev => prev.map(r => r.id === ruleId ? {
      ...r,
      conditions: r.conditions.filter(c => c.id !== condId),
    } : r));
  };

  const addAction = (ruleId: string) => {
    setRules(prev => prev.map(r => r.id === ruleId ? {
      ...r,
      actions: [...r.actions, { id: crypto.randomUUID(), type: 'add_tags', config: {} }],
    } : r));
  };

  const updateAction = (ruleId: string, actId: string, updates: Partial<RuleAction>) => {
    setRules(prev => prev.map(r => r.id === ruleId ? {
      ...r,
      actions: r.actions.map(a => a.id === actId ? { ...a, ...updates } : a),
    } : r));
  };

  const removeAction = (ruleId: string, actId: string) => {
    setRules(prev => prev.map(r => r.id === ruleId ? {
      ...r,
      actions: r.actions.filter(a => a.id !== actId),
    } : r));
  };

  // Save all rules
  const handleSave = async () => {
    if (!id || !currentTenant?.id) return;
    setSaving(true);
    try {
      // Delete existing rules for this form
      await (supabase as any).from('form_rules').delete().eq('form_id', id);

      // Insert all rules
      const rows = rules.map(r => ({
        tenant_id: currentTenant.id,
        form_id: id,
        form_version_id: null,
        name: r.name,
        enabled: r.enabled,
        is_active: r.enabled,
        trigger: r.trigger,
        trigger_type: 'first_message',
        priority: r.priority,
        conditions_json: { all: r.conditions.map(c => ({ field: c.field, op: c.op, value: c.value })) },
        actions_json: { actions: r.actions.map(a => ({ type: a.type, ...a.config })) },
      }));

      if (rows.length > 0) {
        const { error } = await (supabase as any).from('form_rules').insert(rows);
        if (error) throw error;
      }

      toast.success('Rules saved');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save rules');
    } finally {
      setSaving(false);
    }
  };

  // Test rules
  const runTest = () => {
    const results = rules.filter(r => r.enabled).map(rule => {
      const matched = rule.conditions.length === 0 || rule.conditions.every(cond => {
        const answer = testAnswers[cond.field] || '';
        switch (cond.op) {
          case '==': return answer === cond.value;
          case '!=': return answer !== cond.value;
          case '>': return Number(answer) > Number(cond.value);
          case '<': return Number(answer) < Number(cond.value);
          case '>=': return Number(answer) >= Number(cond.value);
          case '<=': return Number(answer) <= Number(cond.value);
          case 'contains': return answer.toLowerCase().includes(cond.value.toLowerCase());
          default: return false;
        }
      });
      return {
        ruleId: rule.id,
        matched,
        actions: matched ? rule.actions.map(a => {
          const at = ACTION_TYPES.find(t => t.value === a.type);
          return at?.label || a.type;
        }) : [],
      };
    });
    setTestResults(results);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6 space-y-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-[500px] w-full" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="px-4 py-3 border-b bg-card flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/auto-forms/${id}/builder`)}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2 flex-1">
            <GitBranch className="w-5 h-5 text-primary" />
            <h1 className="text-lg font-semibold">{formName} — Rules</h1>
          </div>
          <Button variant="outline" size="sm" onClick={() => setTestMode(!testMode)} className="gap-1">
            <Play className="w-3.5 h-3.5" /> {testMode ? 'Hide Test' : 'Test Rules'}
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving} className="gap-1">
            <Save className="w-3.5 h-3.5" /> {saving ? 'Saving...' : 'Save Rules'}
          </Button>
        </div>

        <div className="flex-1 flex min-h-0">
          {/* Rules List */}
          <ScrollArea className={cn("flex-1", testMode && "max-w-[60%]")}>
            <div className="p-4 space-y-4">
              {rules.length === 0 && (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <GitBranch className="w-12 h-12 text-muted-foreground/20 mb-3" />
                    <h3 className="text-lg font-semibold mb-1">No Rules Yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Add IF/THEN rules to automate actions based on form answers.
                    </p>
                    <Button onClick={addRule}>
                      <Plus className="h-4 w-4 mr-1.5" /> Add First Rule
                    </Button>
                  </CardContent>
                </Card>
              )}

              {rules.map((rule, ruleIdx) => (
                <Card key={rule.id} className="border-2">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1">
                        <Input
                          value={rule.name}
                          onChange={e => updateRule(rule.id, { name: e.target.value })}
                          className="border-0 bg-transparent font-semibold h-8 px-1 focus-visible:ring-0 text-base"
                          placeholder="Rule name..."
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch checked={rule.enabled} onCheckedChange={val => updateRule(rule.id, { enabled: val })} />
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeRule(rule.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-1">
                      <Select value={rule.trigger} onValueChange={val => updateRule(rule.id, { trigger: val })}>
                        <SelectTrigger className="h-7 w-32 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="on_submit">On Submit</SelectItem>
                          <SelectItem value="on_change">On Change</SelectItem>
                          <SelectItem value="on_view">On View</SelectItem>
                        </SelectContent>
                      </Select>
                      <Badge variant="outline" className="text-[9px]">Priority: {rule.priority}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Conditions */}
                    <div>
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
                        IF (Conditions)
                      </Label>
                      <div className="space-y-2">
                        {rule.conditions.map((cond, condIdx) => (
                          <div key={cond.id} className="flex items-center gap-2 flex-wrap">
                            {condIdx > 0 && (
                              <Select value={cond.connector} onValueChange={val => updateCondition(rule.id, cond.id, { connector: val as 'AND' | 'OR' })}>
                                <SelectTrigger className="h-7 w-16 text-[10px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="AND">AND</SelectItem>
                                  <SelectItem value="OR">OR</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                            <Select value={cond.field} onValueChange={val => updateCondition(rule.id, cond.id, { field: val })}>
                              <SelectTrigger className="h-7 flex-1 min-w-[120px] text-xs">
                                <SelectValue placeholder="Field..." />
                              </SelectTrigger>
                              <SelectContent>
                                {formFields.map(f => (
                                  <SelectItem key={f.key} value={f.key}>{f.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Select value={cond.op} onValueChange={val => updateCondition(rule.id, cond.id, { op: val })}>
                              <SelectTrigger className="h-7 w-28 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {OPERATORS.map(op => (
                                  <SelectItem key={op.value} value={op.value}>{op.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Input
                              value={cond.value}
                              onChange={e => updateCondition(rule.id, cond.id, { value: e.target.value })}
                              placeholder="Value..."
                              className="h-7 flex-1 min-w-[100px] text-xs"
                            />
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeCondition(rule.id, cond.id)}>
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                        <Button variant="outline" size="sm" onClick={() => addCondition(rule.id)} className="h-7 text-xs gap-1">
                          <Plus className="w-3 h-3" /> Add Condition
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    {/* Actions */}
                    <div>
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
                        THEN (Actions)
                      </Label>
                      <div className="space-y-2">
                        {rule.actions.map(action => {
                          const actionType = ACTION_TYPES.find(a => a.value === action.type);
                          const ActionIcon = actionType?.icon || Zap;
                          return (
                            <div key={action.id} className="flex items-start gap-2 p-2.5 rounded-lg border bg-muted/30">
                              <ActionIcon className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                              <div className="flex-1 space-y-2">
                                <Select value={action.type} onValueChange={val => updateAction(rule.id, action.id, { type: val })}>
                                  <SelectTrigger className="h-7 text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {ACTION_TYPES.map(at => (
                                      <SelectItem key={at.value} value={at.value}>{at.label}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                {/* Action-specific config */}
                                {action.type === 'add_tags' && (
                                  <Input
                                    value={action.config.tags?.join(', ') || ''}
                                    onChange={e => updateAction(rule.id, action.id, { config: { ...action.config, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) } })}
                                    placeholder="tag1, tag2, tag3"
                                    className="h-7 text-xs"
                                  />
                                )}
                                {action.type === 'update_score' && (
                                  <Input
                                    type="number"
                                    value={action.config.points || ''}
                                    onChange={e => updateAction(rule.id, action.id, { config: { ...action.config, points: Number(e.target.value) } })}
                                    placeholder="+10"
                                    className="h-7 text-xs w-24"
                                  />
                                )}
                                {action.type === 'send_template' && (
                                  <Input
                                    value={action.config.template_id || ''}
                                    onChange={e => updateAction(rule.id, action.id, { config: { ...action.config, template_id: e.target.value } })}
                                    placeholder="Template ID..."
                                    className="h-7 text-xs"
                                  />
                                )}
                                {action.type === 'webhook' && (
                                  <Input
                                    value={action.config.url || ''}
                                    onChange={e => updateAction(rule.id, action.id, { config: { ...action.config, url: e.target.value } })}
                                    placeholder="https://..."
                                    className="h-7 text-xs font-mono"
                                  />
                                )}
                                {action.type === 'assign_agent' && (
                                  <Select value={action.config.strategy || ''} onValueChange={val => updateAction(rule.id, action.id, { config: { ...action.config, strategy: val } })}>
                                    <SelectTrigger className="h-7 text-xs">
                                      <SelectValue placeholder="Strategy..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="round_robin">Round Robin</SelectItem>
                                      <SelectItem value="least_busy">Least Busy</SelectItem>
                                      <SelectItem value="specific">Specific Agent</SelectItem>
                                    </SelectContent>
                                  </Select>
                                )}
                                {action.type === 'show_fields' && (
                                  <Input
                                    value={action.config.fields?.join(', ') || ''}
                                    onChange={e => updateAction(rule.id, action.id, { config: { ...action.config, fields: e.target.value.split(',').map(t => t.trim()).filter(Boolean) } })}
                                    placeholder="field_key_1, field_key_2"
                                    className="h-7 text-xs"
                                  />
                                )}
                              </div>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive shrink-0" onClick={() => removeAction(rule.id, action.id)}>
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          );
                        })}
                        <Button variant="outline" size="sm" onClick={() => addAction(rule.id)} className="h-7 text-xs gap-1">
                          <Plus className="w-3 h-3" /> Add Action
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Button variant="outline" onClick={addRule} className="w-full border-dashed h-12 gap-1.5">
                <Plus className="w-4 h-4" /> Add Rule
              </Button>
            </div>
          </ScrollArea>

          {/* Test Panel */}
          {testMode && (
            <div className="w-[40%] border-l bg-muted/20 flex flex-col">
              <div className="p-3 border-b">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Play className="w-3.5 h-3.5" /> Test Rules
                </h3>
              </div>
              <ScrollArea className="flex-1">
                <div className="p-4 space-y-4">
                  <div className="space-y-3">
                    <Label className="text-xs font-semibold">Sample Answers</Label>
                    {formFields.map(f => (
                      <div key={f.key} className="space-y-1">
                        <Label className="text-[10px] text-muted-foreground">{f.label}</Label>
                        <Input
                          value={testAnswers[f.key] || ''}
                          onChange={e => setTestAnswers(prev => ({ ...prev, [f.key]: e.target.value }))}
                          placeholder={`Answer for ${f.label}...`}
                          className="h-8 text-xs"
                        />
                      </div>
                    ))}
                    {formFields.length === 0 && (
                      <p className="text-xs text-muted-foreground">Publish the form first to load field definitions.</p>
                    )}
                  </div>

                  <Button onClick={runTest} className="w-full gap-1">
                    <Play className="w-4 h-4" /> Run Simulation
                  </Button>

                  {testResults.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold">Results</Label>
                      {testResults.map(res => {
                        const rule = rules.find(r => r.id === res.ruleId);
                        return (
                          <Card key={res.ruleId} className={cn("border", res.matched ? "border-emerald-300 bg-emerald-50 dark:bg-emerald-950/20" : "border-muted")}>
                            <CardContent className="p-3">
                              <div className="flex items-center gap-2 mb-1">
                                {res.matched ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                ) : (
                                  <AlertCircle className="w-4 h-4 text-muted-foreground" />
                                )}
                                <span className="text-sm font-medium">{rule?.name}</span>
                                <Badge variant={res.matched ? 'default' : 'secondary'} className="text-[9px] ml-auto">
                                  {res.matched ? 'MATCHED' : 'No match'}
                                </Badge>
                              </div>
                              {res.matched && res.actions.length > 0 && (
                                <div className="mt-1.5 flex flex-wrap gap-1">
                                  {res.actions.map((a, i) => (
                                    <Badge key={i} variant="outline" className="text-[9px]">{a}</Badge>
                                  ))}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
