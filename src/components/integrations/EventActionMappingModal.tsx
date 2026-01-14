import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowRight,
  Plus,
  Trash2,
  MessageSquare,
  Workflow,
  UserPlus,
  Tag,
  Zap,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  Lock,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface EventActionMappingModalProps {
  isOpen: boolean;
  onClose: () => void;
  integrationName: string;
  integrationKey: string;
  supportedEvents: string[];
  onSave: (mapping: EventMapping) => void;
  existingMapping?: EventMapping;
}

export interface EventMapping {
  id?: string;
  event_type: string;
  action_type: 'send_template' | 'trigger_flow' | 'assign_agent' | 'add_tag';
  action_config: {
    template_id?: string;
    flow_id?: string;
    agent_id?: string;
    tag_id?: string;
    phone_field?: string;
    variable_mappings?: Record<string, string>;
    fallback_flow_id?: string;
  };
  conditions?: Array<{
    field: string;
    operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains';
    value: string | number;
  }>;
  is_active: boolean;
  priority: number;
}

const ACTION_TYPES = [
  { 
    value: 'send_template', 
    label: 'Send WhatsApp Template', 
    icon: MessageSquare,
    description: 'Send a pre-approved message template'
  },
  { 
    value: 'trigger_flow', 
    label: 'Trigger Flow', 
    icon: Workflow,
    description: 'Start an automation flow'
  },
  { 
    value: 'assign_agent', 
    label: 'Assign Agent', 
    icon: UserPlus,
    description: 'Route to a specific agent'
  },
  { 
    value: 'add_tag', 
    label: 'Add Tag', 
    icon: Tag,
    description: 'Apply a tag to the contact'
  },
];

const CONDITION_OPERATORS = [
  { value: 'equals', label: 'equals' },
  { value: 'not_equals', label: 'does not equal' },
  { value: 'greater_than', label: 'greater than' },
  { value: 'less_than', label: 'less than' },
  { value: 'contains', label: 'contains' },
];

// Common payload field suggestions per provider
const FIELD_SUGGESTIONS: Record<string, Record<string, string[]>> = {
  shopify: {
    'orders.create': ['customer.phone', 'customer.first_name', 'id', 'total_price', 'order_status_url'],
    'orders.paid': ['customer.phone', 'customer.first_name', 'id', 'total_price', 'financial_status'],
    'orders.fulfilled': ['customer.phone', 'fulfillments[0].tracking_number', 'fulfillments[0].tracking_url'],
    'checkouts.update': ['phone', 'email', 'abandoned_checkout_url', 'total_price'],
  },
  razorpay: {
    'payment.captured': ['payload.payment.entity.contact', 'payload.payment.entity.amount', 'payload.payment.entity.id'],
    'payment_link.paid': ['payload.payment_link.entity.customer.contact', 'payload.payment_link.entity.amount'],
  },
  leadsquared: {
    'lead.created': ['Phone', 'FirstName', 'LastName', 'EmailAddress', 'ProspectStage'],
    'lead.stage_changed': ['Phone', 'ProspectStage', 'OwnerId'],
  },
};

// Variable suggestions for templates
const VARIABLE_SUGGESTIONS: Record<string, string[]> = {
  shopify: ['first_name', 'order_id', 'order_total', 'tracking_url', 'order_status_url'],
  razorpay: ['customer_name', 'amount', 'payment_id', 'payment_link'],
  leadsquared: ['first_name', 'phone', 'lead_stage', 'owner_name'],
};

export function EventActionMappingModal({
  isOpen,
  onClose,
  integrationName,
  integrationKey,
  supportedEvents,
  onSave,
  existingMapping,
}: EventActionMappingModalProps) {
  const [mapping, setMapping] = useState<EventMapping>(existingMapping || {
    event_type: supportedEvents[0] || '',
    action_type: 'send_template',
    action_config: {
      phone_field: 'phone',
      variable_mappings: {},
    },
    conditions: [],
    is_active: true,
    priority: 0,
  });
  
  const [showConditions, setShowConditions] = useState(false);
  const [variableMappings, setVariableMappings] = useState<Array<{ templateVar: string; payloadPath: string }>>(
    Object.entries(mapping.action_config.variable_mappings || {}).map(([templateVar, payloadPath]) => ({
      templateVar,
      payloadPath,
    }))
  );

  const selectedAction = ACTION_TYPES.find(a => a.value === mapping.action_type);
  const fieldSuggestions = FIELD_SUGGESTIONS[integrationKey]?.[mapping.event_type.replace(`${integrationKey}.`, '')] || [];
  const varSuggestions = VARIABLE_SUGGESTIONS[integrationKey] || [];

  const handleAddVariableMapping = () => {
    setVariableMappings([...variableMappings, { templateVar: '', payloadPath: '' }]);
  };

  const handleRemoveVariableMapping = (index: number) => {
    setVariableMappings(variableMappings.filter((_, i) => i !== index));
  };

  const handleVariableMappingChange = (index: number, field: 'templateVar' | 'payloadPath', value: string) => {
    const updated = [...variableMappings];
    updated[index][field] = value;
    setVariableMappings(updated);
  };

  const handleAddCondition = () => {
    setMapping({
      ...mapping,
      conditions: [...(mapping.conditions || []), { field: '', operator: 'equals', value: '' }],
    });
  };

  const handleRemoveCondition = (index: number) => {
    setMapping({
      ...mapping,
      conditions: mapping.conditions?.filter((_, i) => i !== index),
    });
  };

  const handleSave = () => {
    const finalMapping: EventMapping = {
      ...mapping,
      action_config: {
        ...mapping.action_config,
        variable_mappings: variableMappings.reduce((acc, { templateVar, payloadPath }) => {
          if (templateVar && payloadPath) {
            acc[templateVar] = payloadPath;
          }
          return acc;
        }, {} as Record<string, string>),
      },
    };
    onSave(finalMapping);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Event → Action Mapping
          </DialogTitle>
          <DialogDescription>
            Configure what happens when {integrationName} sends an event
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Event Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">When this event occurs</Label>
            <Select 
              value={mapping.event_type} 
              onValueChange={(v) => setMapping({ ...mapping, event_type: v })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select an event" />
              </SelectTrigger>
              <SelectContent>
                {supportedEvents.map(event => (
                  <SelectItem key={event} value={event}>
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{event}</code>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-center">
            <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-full">
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">then</span>
            </div>
          </div>

          {/* Action Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Perform this action</Label>
            <div className="grid grid-cols-2 gap-3">
              {ACTION_TYPES.map(action => {
                const Icon = action.icon;
                const isSelected = mapping.action_type === action.value;
                return (
                  <button
                    key={action.value}
                    onClick={() => setMapping({ ...mapping, action_type: action.value as any })}
                    className={cn(
                      "flex items-start gap-3 p-4 rounded-lg border text-left transition-all",
                      isSelected 
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20" 
                        : "border-border hover:border-primary/30 hover:bg-muted/50"
                    )}
                  >
                    <Icon className={cn("w-5 h-5 mt-0.5", isSelected && "text-primary")} />
                    <div>
                      <p className={cn("font-medium text-sm", isSelected && "text-primary")}>
                        {action.label}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {action.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* Action Configuration */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Action Configuration</Label>
            
            {/* Phone Field */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Phone number field in payload</Label>
              <Input
                value={mapping.action_config.phone_field || ''}
                onChange={(e) => setMapping({
                  ...mapping,
                  action_config: { ...mapping.action_config, phone_field: e.target.value }
                })}
                placeholder="e.g., customer.phone"
              />
              {fieldSuggestions.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {fieldSuggestions.filter(f => f.includes('phone')).map(field => (
                    <Badge
                      key={field}
                      variant="outline"
                      className="cursor-pointer hover:bg-primary/10"
                      onClick={() => setMapping({
                        ...mapping,
                        action_config: { ...mapping.action_config, phone_field: field }
                      })}
                    >
                      {field}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Template/Flow Selection */}
            {mapping.action_type === 'send_template' && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Template ID</Label>
                <Input
                  value={mapping.action_config.template_id || ''}
                  onChange={(e) => setMapping({
                    ...mapping,
                    action_config: { ...mapping.action_config, template_id: e.target.value }
                  })}
                  placeholder="Select or enter template ID"
                />
              </div>
            )}

            {mapping.action_type === 'trigger_flow' && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Flow ID</Label>
                <Input
                  value={mapping.action_config.flow_id || ''}
                  onChange={(e) => setMapping({
                    ...mapping,
                    action_config: { ...mapping.action_config, flow_id: e.target.value }
                  })}
                  placeholder="Select or enter flow ID"
                />
              </div>
            )}

            {mapping.action_type === 'add_tag' && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Tag ID</Label>
                <Input
                  value={mapping.action_config.tag_id || ''}
                  onChange={(e) => setMapping({
                    ...mapping,
                    action_config: { ...mapping.action_config, tag_id: e.target.value }
                  })}
                  placeholder="Select or enter tag ID"
                />
              </div>
            )}

            {mapping.action_type === 'assign_agent' && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Agent ID</Label>
                <Input
                  value={mapping.action_config.agent_id || ''}
                  onChange={(e) => setMapping({
                    ...mapping,
                    action_config: { ...mapping.action_config, agent_id: e.target.value }
                  })}
                  placeholder="Select or enter agent ID"
                />
              </div>
            )}
          </div>

          {/* Variable Mappings */}
          {(mapping.action_type === 'send_template' || mapping.action_type === 'trigger_flow') && (
            <>
              <Separator />
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Variable Mapping</Label>
                  <Button variant="outline" size="sm" onClick={handleAddVariableMapping}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add Variable
                  </Button>
                </div>
                
                <p className="text-xs text-muted-foreground">
                  Map payload fields to template variables (e.g., customer.first_name → first_name)
                </p>

                {variableMappings.length === 0 ? (
                  <div className="text-center py-6 bg-muted/30 rounded-lg border border-dashed">
                    <p className="text-sm text-muted-foreground">No variable mappings yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {variableMappings.map((vm, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          placeholder="Payload path"
                          value={vm.payloadPath}
                          onChange={(e) => handleVariableMappingChange(index, 'payloadPath', e.target.value)}
                          className="flex-1"
                        />
                        <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <Input
                          placeholder="{{variable}}"
                          value={vm.templateVar}
                          onChange={(e) => handleVariableMappingChange(index, 'templateVar', e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveVariableMapping(index)}
                        >
                          <Trash2 className="w-4 h-4 text-muted-foreground" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Suggestions */}
                {(fieldSuggestions.length > 0 || varSuggestions.length > 0) && (
                  <div className="grid grid-cols-2 gap-4 p-3 bg-muted/30 rounded-lg">
                    <div>
                      <p className="text-xs font-medium mb-2">Available Fields</p>
                      <div className="flex flex-wrap gap-1">
                        {fieldSuggestions.slice(0, 6).map(field => (
                          <Badge key={field} variant="outline" className="text-xs">
                            {field}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium mb-2">Common Variables</p>
                      <div className="flex flex-wrap gap-1">
                        {varSuggestions.map(v => (
                          <Badge key={v} variant="secondary" className="text-xs">
                            {`{{${v}}}`}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Conditions (Pro) */}
          <Separator />
          <div className="space-y-4">
            <button
              onClick={() => setShowConditions(!showConditions)}
              className="flex items-center justify-between w-full"
            >
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium cursor-pointer">Conditions</Label>
                <Badge variant="outline" className="text-xs bg-violet-500/10 text-violet-600 border-violet-500/30">
                  <Lock className="w-3 h-3 mr-1" />
                  Pro
                </Badge>
              </div>
              {showConditions ? (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              )}
            </button>

            {showConditions && (
              <div className="space-y-3 p-4 bg-muted/30 rounded-lg border border-dashed">
                <p className="text-xs text-muted-foreground">
                  Only trigger this action if conditions are met
                </p>

                {mapping.conditions?.map((condition, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      placeholder="Field (e.g., total_price)"
                      value={condition.field}
                      onChange={(e) => {
                        const updated = [...(mapping.conditions || [])];
                        updated[index].field = e.target.value;
                        setMapping({ ...mapping, conditions: updated });
                      }}
                      className="flex-1"
                    />
                    <Select
                      value={condition.operator}
                      onValueChange={(v) => {
                        const updated = [...(mapping.conditions || [])];
                        updated[index].operator = v as any;
                        setMapping({ ...mapping, conditions: updated });
                      }}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CONDITION_OPERATORS.map(op => (
                          <SelectItem key={op.value} value={op.value}>{op.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Value"
                      value={String(condition.value)}
                      onChange={(e) => {
                        const updated = [...(mapping.conditions || [])];
                        updated[index].value = e.target.value;
                        setMapping({ ...mapping, conditions: updated });
                      }}
                      className="w-24"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveCondition(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}

                <Button variant="outline" size="sm" onClick={handleAddCondition}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add Condition
                </Button>
              </div>
            )}
          </div>

          {/* Active Toggle */}
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Enable Mapping</Label>
              <p className="text-xs text-muted-foreground">Turn this mapping on or off</p>
            </div>
            <Switch
              checked={mapping.is_active}
              onCheckedChange={(checked) => setMapping({ ...mapping, is_active: checked })}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Mapping</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
