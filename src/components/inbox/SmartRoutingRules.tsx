import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Settings2, 
  Zap, 
  Users, 
  Star, 
  Clock, 
  Crown,
  Plus,
  Trash2,
  GripVertical,
} from 'lucide-react';

interface RoutingRule {
  id: string;
  name: string;
  condition: {
    type: 'tag' | 'source' | 'priority' | 'keyword';
    value: string;
  };
  action: {
    type: 'assign_agent' | 'assign_team' | 'set_priority';
    value: string;
  };
  enabled: boolean;
}

interface SmartRoutingRulesProps {
  isPro?: boolean;
}

const SAMPLE_RULES: RoutingRule[] = [
  {
    id: '1',
    name: 'VIP Customers',
    condition: { type: 'tag', value: 'VIP' },
    action: { type: 'assign_agent', value: 'Senior Agent' },
    enabled: true,
  },
  {
    id: '2',
    name: 'Meta Ads Leads',
    condition: { type: 'source', value: 'meta_ads' },
    action: { type: 'assign_team', value: 'Sales Team' },
    enabled: true,
  },
  {
    id: '3',
    name: 'Urgent Complaints',
    condition: { type: 'priority', value: 'urgent' },
    action: { type: 'assign_agent', value: 'Manager' },
    enabled: false,
  },
];

export function SmartRoutingRules({ isPro = true }: SmartRoutingRulesProps) {
  const [rules, setRules] = useState<RoutingRule[]>(SAMPLE_RULES);
  const [isOpen, setIsOpen] = useState(false);
  const [routingMode, setRoutingMode] = useState<'round_robin' | 'least_busy' | 'manual'>('round_robin');

  const toggleRule = useCallback((id: string) => {
    setRules(prev => 
      prev.map(rule => 
        rule.id === id ? { ...rule, enabled: !rule.enabled } : rule
      )
    );
  }, []);

  const deleteRule = useCallback((id: string) => {
    setRules(prev => prev.filter(rule => rule.id !== id));
  }, []);

  const getConditionLabel = (condition: RoutingRule['condition']) => {
    switch (condition.type) {
      case 'tag':
        return `Tag: ${condition.value}`;
      case 'source':
        return `Source: ${condition.value.replace('_', ' ')}`;
      case 'priority':
        return `Priority: ${condition.value}`;
      case 'keyword':
        return `Contains: "${condition.value}"`;
    }
  };

  const getActionLabel = (action: RoutingRule['action']) => {
    switch (action.type) {
      case 'assign_agent':
        return `→ ${action.value}`;
      case 'assign_team':
        return `→ ${action.value}`;
      case 'set_priority':
        return `Set ${action.value} priority`;
    }
  };

  if (!isPro) {
    return (
      <Card className="border-dashed">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Smart Routing
            <Badge variant="secondary" className="text-xs">
              <Crown className="w-3 h-3 mr-1" />
              Pro
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            Automatically route conversations based on VIP status, skills, and load.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Card className="cursor-pointer hover:border-primary/50 transition-colors">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                Smart Routing
              </div>
              <Badge variant="outline" className="text-xs">
                {rules.filter(r => r.enabled).length} active
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="capitalize">{routingMode.replace('_', ' ')}</span>
              <span>•</span>
              <span>{rules.length} rules</span>
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings2 className="w-5 h-5" />
            Smart Routing Configuration
          </DialogTitle>
          <DialogDescription>
            Configure how conversations are automatically assigned to agents
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Routing Mode */}
          <div className="space-y-2">
            <Label>Default Routing Mode</Label>
            <Select value={routingMode} onValueChange={(v) => setRoutingMode(v as typeof routingMode)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="round_robin">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Round Robin
                  </div>
                </SelectItem>
                <SelectItem value="least_busy">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Least Busy
                  </div>
                </SelectItem>
                <SelectItem value="manual">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    Manual Only
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Rules */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Routing Rules</Label>
              <Button variant="outline" size="sm" className="h-7">
                <Plus className="w-3 h-3 mr-1" />
                Add Rule
              </Button>
            </div>

            <div className="space-y-2">
              {rules.map((rule) => (
                <div 
                  key={rule.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${
                    rule.enabled ? 'bg-background' : 'bg-muted/50 opacity-60'
                  }`}
                >
                  <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                  
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{rule.name}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <span>{getConditionLabel(rule.condition)}</span>
                      <span className="text-primary">{getActionLabel(rule.action)}</span>
                    </div>
                  </div>

                  <Switch 
                    checked={rule.enabled} 
                    onCheckedChange={() => toggleRule(rule.id)}
                  />

                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => deleteRule(rule.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}

              {rules.length === 0 && (
                <div className="text-center py-6 text-muted-foreground text-sm">
                  No routing rules configured
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
