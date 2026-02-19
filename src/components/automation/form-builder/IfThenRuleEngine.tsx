import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2, Zap, ArrowRight, GitBranch } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FormField, IFThenRule, FormRuleAction } from './types';

interface IfThenRuleEngineProps {
  rules: IFThenRule[];
  fields: FormField[];
  onChange: (rules: IFThenRule[]) => void;
}

const ACTION_TYPES = [
  { value: 'assign_team', label: 'Assign to Team', icon: '👥' },
  { value: 'send_template', label: 'Send Template', icon: '📨' },
  { value: 'add_tag', label: 'Add Tag', icon: '🏷' },
  { value: 'trigger_webhook', label: 'Trigger Webhook', icon: '🔗' },
  { value: 'set_attribute', label: 'Set Attribute', icon: '📝' },
  { value: 'notify_agent', label: 'Notify Agent', icon: '🔔' },
];

export function IfThenRuleEngine({ rules, fields, onChange }: IfThenRuleEngineProps) {
  const addRule = () => {
    onChange([
      ...rules,
      {
        id: crypto.randomUUID(),
        name: `Rule ${rules.length + 1}`,
        conditions: [{ fieldId: '', operator: 'equals', value: '', connector: 'AND' }],
        actions: [{ id: crypto.randomUUID(), type: 'add_tag', config: {} }],
      },
    ]);
  };

  const removeRule = (id: string) => {
    onChange(rules.filter(r => r.id !== id));
  };

  const updateRule = (id: string, updates: Partial<IFThenRule>) => {
    onChange(rules.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const addCondition = (ruleId: string) => {
    const rule = rules.find(r => r.id === ruleId);
    if (!rule) return;
    updateRule(ruleId, {
      conditions: [...rule.conditions, { fieldId: '', operator: 'equals', value: '', connector: 'AND' }],
    });
  };

  const removeCondition = (ruleId: string, idx: number) => {
    const rule = rules.find(r => r.id === ruleId);
    if (!rule || rule.conditions.length <= 1) return;
    updateRule(ruleId, { conditions: rule.conditions.filter((_, i) => i !== idx) });
  };

  const updateCondition = (ruleId: string, idx: number, updates: Partial<IFThenRule['conditions'][0]>) => {
    const rule = rules.find(r => r.id === ruleId);
    if (!rule) return;
    const conds = [...rule.conditions];
    conds[idx] = { ...conds[idx], ...updates };
    updateRule(ruleId, { conditions: conds });
  };

  const addAction = (ruleId: string) => {
    const rule = rules.find(r => r.id === ruleId);
    if (!rule) return;
    updateRule(ruleId, {
      actions: [...rule.actions, { id: crypto.randomUUID(), type: 'add_tag', config: {} }],
    });
  };

  const removeAction = (ruleId: string, actionId: string) => {
    const rule = rules.find(r => r.id === ruleId);
    if (!rule || rule.actions.length <= 1) return;
    updateRule(ruleId, { actions: rule.actions.filter(a => a.id !== actionId) });
  };

  const updateAction = (ruleId: string, actionId: string, updates: Partial<FormRuleAction>) => {
    const rule = rules.find(r => r.id === ruleId);
    if (!rule) return;
    updateRule(ruleId, {
      actions: rule.actions.map(a => a.id === actionId ? { ...a, ...updates } : a),
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-primary" />
          <Label className="text-sm font-semibold">IF → THEN Rules</Label>
        </div>
        <Badge variant="secondary" className="text-[10px]">{rules.length} rule(s)</Badge>
      </div>

      {rules.length === 0 && (
        <div className="text-center py-6 border-2 border-dashed rounded-xl">
          <GitBranch className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground mb-1">No rules configured</p>
          <p className="text-xs text-muted-foreground mb-3">Add IF→THEN rules to automate actions based on form responses</p>
          <Button type="button" variant="outline" size="sm" onClick={addRule}>
            <Plus className="w-3.5 h-3.5 mr-1" /> Add Rule
          </Button>
        </div>
      )}

      {rules.map((rule, ruleIdx) => (
        <Card key={rule.id} className="border-2 border-primary/20 overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 bg-primary/5 border-b">
            <div className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-primary" />
              <Input
                value={rule.name || `Rule ${ruleIdx + 1}`}
                onChange={e => updateRule(rule.id, { name: e.target.value })}
                className="h-7 text-xs font-semibold border-0 bg-transparent p-0 w-40"
              />
            </div>
            <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => removeRule(rule.id)}>
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
          <CardContent className="p-3 space-y-3">
            {/* IF section */}
            <div>
              <Label className="text-[10px] font-bold uppercase tracking-widest text-primary">IF</Label>
              <div className="space-y-1.5 mt-1.5">
                {rule.conditions.map((cond, cIdx) => (
                  <div key={cIdx} className="flex items-center gap-1.5 flex-wrap">
                    {cIdx > 0 && (
                      <Select value={cond.connector} onValueChange={val => updateCondition(rule.id, cIdx, { connector: val as 'AND' | 'OR' })}>
                        <SelectTrigger className="h-6 w-14 text-[10px] font-bold"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AND">AND</SelectItem>
                          <SelectItem value="OR">OR</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                    <Select value={cond.fieldId} onValueChange={val => updateCondition(rule.id, cIdx, { fieldId: val })}>
                      <SelectTrigger className="h-7 text-xs flex-1 min-w-[100px]"><SelectValue placeholder="Field" /></SelectTrigger>
                      <SelectContent>
                        {fields.map(f => <SelectItem key={f.id} value={f.id}>{f.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Select value={cond.operator} onValueChange={val => updateCondition(rule.id, cIdx, { operator: val as any })}>
                      <SelectTrigger className="h-7 text-xs w-24"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="equals">=</SelectItem>
                        <SelectItem value="not_equals">≠</SelectItem>
                        <SelectItem value="contains">contains</SelectItem>
                        <SelectItem value="greater_than">{">"}</SelectItem>
                        <SelectItem value="less_than">{"<"}</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input value={cond.value} onChange={e => updateCondition(rule.id, cIdx, { value: e.target.value })} className="h-7 text-xs flex-1 min-w-[80px]" placeholder="Value" />
                    {rule.conditions.length > 1 && (
                      <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-destructive shrink-0" onClick={() => removeCondition(rule.id, cIdx)}>
                        <Trash2 className="w-2.5 h-2.5" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button type="button" variant="ghost" size="sm" className="text-[10px] h-6" onClick={() => addCondition(rule.id)}>
                  <Plus className="w-3 h-3 mr-1" /> Add Condition
                </Button>
              </div>
            </div>

            <div className="flex justify-center">
              <ArrowRight className="w-4 h-4 text-primary" />
            </div>

            {/* THEN section */}
            <div>
              <Label className="text-[10px] font-bold uppercase tracking-widest text-green-600">THEN</Label>
              <div className="space-y-1.5 mt-1.5">
                {rule.actions.map(action => (
                  <div key={action.id} className="flex items-center gap-1.5">
                    <Select value={action.type} onValueChange={val => updateAction(rule.id, action.id, { type: val as any })}>
                      <SelectTrigger className="h-7 text-xs flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ACTION_TYPES.map(at => (
                          <SelectItem key={at.value} value={at.value}>
                            <span className="flex items-center gap-1.5">{at.icon} {at.label}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      value={action.config?.value || ''}
                      onChange={e => updateAction(rule.id, action.id, { config: { ...action.config, value: e.target.value } })}
                      className="h-7 text-xs flex-1"
                      placeholder={
                        action.type === 'assign_team' ? 'Team name' :
                        action.type === 'send_template' ? 'Template name' :
                        action.type === 'add_tag' ? 'Tag name (e.g. Premium)' :
                        action.type === 'trigger_webhook' ? 'Webhook URL' :
                        action.type === 'set_attribute' ? 'key=value' :
                        'Agent name'
                      }
                    />
                    {rule.actions.length > 1 && (
                      <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-destructive shrink-0" onClick={() => removeAction(rule.id, action.id)}>
                        <Trash2 className="w-2.5 h-2.5" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button type="button" variant="ghost" size="sm" className="text-[10px] h-6" onClick={() => addAction(rule.id)}>
                  <Plus className="w-3 h-3 mr-1" /> Add Action
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {rules.length > 0 && (
        <Button type="button" variant="outline" className="w-full border-dashed" onClick={addRule}>
          <Plus className="w-4 h-4 mr-1.5" /> Add Another Rule
        </Button>
      )}
    </div>
  );
}
