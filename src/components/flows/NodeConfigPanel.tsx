import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import type { FlowNode } from '@/hooks/useFlows';

interface NodeConfigPanelProps {
  node: FlowNode;
  onUpdate: (nodeKey: string, updates: Partial<FlowNode>) => void;
}

export function NodeConfigPanel({ node, onUpdate }: NodeConfigPanelProps) {
  const config = node.config || {};

  const updateConfig = (patch: Record<string, any>) => {
    onUpdate(node.node_key, { config: { ...config, ...patch } });
  };

  return (
    <div className="space-y-4">
      {/* Node Name - always shown */}
      <div className="space-y-2">
        <Label className="text-xs">Node Name</Label>
        <Input
          value={node.label || ''}
          onChange={(e) => onUpdate(node.node_key, { label: e.target.value })}
        />
      </div>

      {/* Text + Buttons */}
      {node.node_type === 'text-buttons' && (
        <TextButtonsConfig config={config} updateConfig={updateConfig} />
      )}

      {/* List Message */}
      {node.node_type === 'list-message' && (
        <ListMessageConfig config={config} updateConfig={updateConfig} />
      )}

      {/* Media */}
      {node.node_type === 'media' && (
        <MediaConfig config={config} updateConfig={updateConfig} />
      )}

      {/* Document */}
      {node.node_type === 'document' && (
        <DocumentConfig config={config} updateConfig={updateConfig} />
      )}

      {/* Template */}
      {node.node_type === 'template' && (
        <TemplateConfig config={config} updateConfig={updateConfig} />
      )}

      {/* Condition */}
      {node.node_type === 'condition' && (
        <ConditionConfig config={config} updateConfig={updateConfig} />
      )}

      {/* Webhook */}
      {node.node_type === 'webhook' && (
        <WebhookConfig config={config} updateConfig={updateConfig} />
      )}

      {/* Delay */}
      {node.node_type === 'delay' && (
        <DelayConfig config={config} updateConfig={updateConfig} />
      )}

      {/* Set Attribute */}
      {node.node_type === 'set-attribute' && (
        <SetAttributeConfig config={config} updateConfig={updateConfig} />
      )}

      {/* Add/Remove Tag */}
      {node.node_type === 'add-tag' && (
        <AddTagConfig config={config} updateConfig={updateConfig} />
      )}

      {/* Assign Agent */}
      {node.node_type === 'assign-agent' && (
        <AssignAgentConfig config={config} updateConfig={updateConfig} />
      )}

      {/* Notify Team */}
      {node.node_type === 'notify-team' && (
        <NotifyTeamConfig config={config} updateConfig={updateConfig} />
      )}

      {/* Switch */}
      {node.node_type === 'switch' && (
        <SwitchConfig config={config} updateConfig={updateConfig} />
      )}

      {/* Timeout */}
      {node.node_type === 'timeout' && (
        <TimeoutConfig config={config} updateConfig={updateConfig} />
      )}

      {/* Create Ticket */}
      {node.node_type === 'create-ticket' && (
        <CreateTicketConfig config={config} updateConfig={updateConfig} />
      )}

      {/* Add Segment */}
      {node.node_type === 'add-segment' && (
        <AddSegmentConfig config={config} updateConfig={updateConfig} />
      )}
    </div>
  );
}

// ──────────────────────────────────────────────
// Sub-components for each node type
// ──────────────────────────────────────────────

interface ConfigProps {
  config: Record<string, any>;
  updateConfig: (patch: Record<string, any>) => void;
}

function TextButtonsConfig({ config, updateConfig }: ConfigProps) {
  const buttons: string[] = config.buttons || [];

  const setButton = (idx: number, value: string) => {
    const next = [...buttons];
    next[idx] = value;
    updateConfig({ buttons: next });
  };

  const removeButton = (idx: number) => {
    updateConfig({ buttons: buttons.filter((_, i) => i !== idx) });
  };

  const addButton = () => {
    if (buttons.length < 3) {
      updateConfig({ buttons: [...buttons, ''] });
    }
  };

  return (
    <>
      <div className="space-y-2">
        <Label className="text-xs">Message Text</Label>
        <Textarea
          className="min-h-[100px] text-sm"
          placeholder="Enter your message..."
          value={config.message || ''}
          onChange={(e) => updateConfig({ message: e.target.value })}
        />
        <p className="text-[11px] text-muted-foreground">
          Use {'{{first_name}}'} for personalization
        </p>
      </div>
      <div className="space-y-2">
        <Label className="text-xs">Buttons ({buttons.length}/3)</Label>
        {buttons.map((btn, idx) => (
          <div key={idx} className="flex gap-2">
            <Input
              value={btn}
              placeholder={`Button ${idx + 1} label`}
              onChange={(e) => setButton(idx, e.target.value)}
              className="text-sm"
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 shrink-0"
              onClick={() => removeButton(idx)}
            >
              <Trash2 className="w-3.5 h-3.5 text-destructive" />
            </Button>
          </div>
        ))}
        {buttons.length < 3 && (
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-1.5 text-xs"
            onClick={addButton}
          >
            <Plus className="w-3.5 h-3.5" /> Add Button
          </Button>
        )}
        <p className="text-[10px] text-muted-foreground">Max 3 buttons allowed by WhatsApp</p>
      </div>
    </>
  );
}

function ListMessageConfig({ config, updateConfig }: ConfigProps) {
  // Support both "items" and legacy "sections" keys
  const items: Array<{ title: string; description: string }> = config.items || config.sections || [];

  const setItem = (idx: number, field: string, value: string) => {
    const next = [...items];
    next[idx] = { ...next[idx], [field]: value };
    updateConfig({ items: next });
  };

  const removeItem = (idx: number) => {
    updateConfig({ items: items.filter((_, i) => i !== idx) });
  };

  const addItem = () => {
    if (items.length < 10) {
      updateConfig({ items: [...items, { title: '', description: '' }] });
    }
  };

  return (
    <>
      <div className="space-y-2">
        <Label className="text-xs">Header</Label>
        <Input
          placeholder="List header..."
          value={config.header || ''}
          onChange={(e) => updateConfig({ header: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label className="text-xs">Body Text</Label>
        <Textarea
          className="min-h-[80px] text-sm"
          placeholder="List body message..."
          value={config.body || ''}
          onChange={(e) => updateConfig({ body: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label className="text-xs">Button Label</Label>
        <Input
          placeholder="View Options"
          value={config.button_label || ''}
          onChange={(e) => updateConfig({ button_label: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label className="text-xs">List Items ({items.length}/10)</Label>
        {items.map((item, idx) => (
          <div key={idx} className="flex gap-2">
            <div className="flex-1 space-y-1">
              <Input
                value={item.title || ''}
                placeholder={`Item ${idx + 1} title`}
                onChange={(e) => setItem(idx, 'title', e.target.value)}
                className="text-sm"
              />
              <Input
                value={item.description || ''}
                placeholder="Description (optional)"
                onChange={(e) => setItem(idx, 'description', e.target.value)}
                className="text-xs"
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 shrink-0"
              onClick={() => removeItem(idx)}
            >
              <Trash2 className="w-3.5 h-3.5 text-destructive" />
            </Button>
          </div>
        ))}
        {items.length < 10 && (
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-1.5 text-xs"
            onClick={addItem}
          >
            <Plus className="w-3.5 h-3.5" /> Add Item
          </Button>
        )}
        <p className="text-[10px] text-muted-foreground">Max 10 items allowed</p>
      </div>
    </>
  );
}

function MediaConfig({ config, updateConfig }: ConfigProps) {
  return (
    <>
      <div className="space-y-2">
        <Label className="text-xs">Media Type</Label>
        <Select
          value={config.media_type || 'image'}
          onValueChange={(val) => updateConfig({ media_type: val })}
        >
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="image">Image</SelectItem>
            <SelectItem value="video">Video</SelectItem>
            <SelectItem value="audio">Audio</SelectItem>
            <SelectItem value="sticker">Sticker</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label className="text-xs">Media URL</Label>
        <Input
          placeholder="https://example.com/image.jpg"
          value={config.media_url || ''}
          onChange={(e) => updateConfig({ media_url: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label className="text-xs">Caption (optional)</Label>
        <Textarea
          className="min-h-[60px] text-sm"
          placeholder="Add a caption..."
          value={config.caption || ''}
          onChange={(e) => updateConfig({ caption: e.target.value })}
        />
      </div>
    </>
  );
}

function DocumentConfig({ config, updateConfig }: ConfigProps) {
  return (
    <>
      <div className="space-y-2">
        <Label className="text-xs">Document URL</Label>
        <Input
          placeholder="https://example.com/doc.pdf"
          value={config.document_url || ''}
          onChange={(e) => updateConfig({ document_url: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label className="text-xs">Filename</Label>
        <Input
          placeholder="brochure.pdf"
          value={config.filename || ''}
          onChange={(e) => updateConfig({ filename: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label className="text-xs">Caption (optional)</Label>
        <Textarea
          className="min-h-[60px] text-sm"
          placeholder="Add a caption..."
          value={config.caption || ''}
          onChange={(e) => updateConfig({ caption: e.target.value })}
        />
      </div>
    </>
  );
}

function TemplateConfig({ config, updateConfig }: ConfigProps) {
  return (
    <>
      <div className="space-y-2">
        <Label className="text-xs">Template Name</Label>
        <Input
          placeholder="hello_world"
          value={config.template_name || ''}
          onChange={(e) => updateConfig({ template_name: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label className="text-xs">Language</Label>
        <Select
          value={config.language || 'en'}
          onValueChange={(val) => updateConfig({ language: val })}
        >
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="es">Spanish</SelectItem>
            <SelectItem value="pt_BR">Portuguese (BR)</SelectItem>
            <SelectItem value="hi">Hindi</SelectItem>
            <SelectItem value="ar">Arabic</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label className="text-xs">Message Preview</Label>
        <Textarea
          className="min-h-[80px] text-sm"
          placeholder="Template message preview..."
          value={config.message || ''}
          onChange={(e) => updateConfig({ message: e.target.value })}
        />
      </div>
    </>
  );
}

function ConditionConfig({ config, updateConfig }: ConfigProps) {
  return (
    <>
      <div className="space-y-2">
        <Label className="text-xs">Condition Field</Label>
        <Select
          value={config.field || 'message'}
          onValueChange={(val) => updateConfig({ field: val })}
        >
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="message">Message Text</SelectItem>
            <SelectItem value="contact_name">Contact Name</SelectItem>
            <SelectItem value="tag">Contact Tag</SelectItem>
            <SelectItem value="attribute">Custom Attribute</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label className="text-xs">Operator</Label>
        <Select
          value={config.operator || 'contains'}
          onValueChange={(val) => updateConfig({ operator: val })}
        >
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="contains">Contains</SelectItem>
            <SelectItem value="equals">Equals</SelectItem>
            <SelectItem value="starts_with">Starts with</SelectItem>
            <SelectItem value="not_contains">Does not contain</SelectItem>
            <SelectItem value="is_empty">Is empty</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label className="text-xs">Value</Label>
        <Input
          placeholder="Match value..."
          value={config.value || ''}
          onChange={(e) => updateConfig({ value: e.target.value })}
        />
      </div>
    </>
  );
}

function WebhookConfig({ config, updateConfig }: ConfigProps) {
  return (
    <>
      <div className="space-y-2">
        <Label className="text-xs">URL</Label>
        <Input
          placeholder="https://api.example.com/webhook"
          value={config.url || ''}
          onChange={(e) => updateConfig({ url: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label className="text-xs">Method</Label>
        <Select
          value={config.method || 'POST'}
          onValueChange={(val) => updateConfig({ method: val })}
        >
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="GET">GET</SelectItem>
            <SelectItem value="POST">POST</SelectItem>
            <SelectItem value="PUT">PUT</SelectItem>
            <SelectItem value="PATCH">PATCH</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label className="text-xs">Headers (JSON)</Label>
        <Textarea
          className="min-h-[60px] text-sm font-mono"
          placeholder='{"Authorization": "Bearer ..."}'
          value={config.headers || ''}
          onChange={(e) => updateConfig({ headers: e.target.value })}
        />
      </div>
    </>
  );
}

function DelayConfig({ config, updateConfig }: ConfigProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-2">
        <Label className="text-xs">Duration</Label>
        <Input
          type="number"
          value={config.duration || 5}
          onChange={(e) => updateConfig({ duration: parseInt(e.target.value) || 0 })}
        />
      </div>
      <div className="space-y-2">
        <Label className="text-xs">Unit</Label>
        <Select
          value={config.unit || 'seconds'}
          onValueChange={(val) => updateConfig({ unit: val })}
        >
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="seconds">Seconds</SelectItem>
            <SelectItem value="minutes">Minutes</SelectItem>
            <SelectItem value="hours">Hours</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

function SetAttributeConfig({ config, updateConfig }: ConfigProps) {
  return (
    <>
      <div className="space-y-2">
        <Label className="text-xs">Attribute Name</Label>
        <Input
          placeholder="e.g., lead_status"
          value={config.attribute || ''}
          onChange={(e) => updateConfig({ attribute: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label className="text-xs">Value</Label>
        <Input
          placeholder="e.g., qualified"
          value={config.value || ''}
          onChange={(e) => updateConfig({ value: e.target.value })}
        />
      </div>
    </>
  );
}

function AddTagConfig({ config, updateConfig }: ConfigProps) {
  return (
    <>
      <div className="space-y-2">
        <Label className="text-xs">Action</Label>
        <Select
          value={config.action || 'add'}
          onValueChange={(val) => updateConfig({ action: val })}
        >
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="add">Add Tag</SelectItem>
            <SelectItem value="remove">Remove Tag</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label className="text-xs">Tag Name</Label>
        <Input
          placeholder="e.g., hot-lead"
          value={config.tag || ''}
          onChange={(e) => updateConfig({ tag: e.target.value })}
        />
      </div>
    </>
  );
}

function AssignAgentConfig({ config, updateConfig }: ConfigProps) {
  return (
    <div className="space-y-2">
      <Label className="text-xs">Assignment Strategy</Label>
      <Select
        value={config.strategy || 'round_robin'}
        onValueChange={(val) => updateConfig({ strategy: val })}
      >
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="round_robin">Round Robin</SelectItem>
          <SelectItem value="least_busy">Least Busy</SelectItem>
          <SelectItem value="specific">Specific Agent</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

function NotifyTeamConfig({ config, updateConfig }: ConfigProps) {
  return (
    <>
      <div className="space-y-2">
        <Label className="text-xs">Notification Message</Label>
        <Textarea
          className="min-h-[80px] text-sm"
          placeholder="Alert: New lead requires attention..."
          value={config.message || ''}
          onChange={(e) => updateConfig({ message: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label className="text-xs">Channel</Label>
        <Select
          value={config.channel || 'inbox'}
          onValueChange={(val) => updateConfig({ channel: val })}
        >
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="inbox">Inbox</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="webhook">Webhook</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );
}

function SwitchConfig({ config, updateConfig }: ConfigProps) {
  return (
    <div className="space-y-2">
      <Label className="text-xs">Variable to Switch On</Label>
      <Input
        placeholder="e.g., {{button_reply}}"
        value={config.variable || ''}
        onChange={(e) => updateConfig({ variable: e.target.value })}
      />
      <p className="text-[10px] text-muted-foreground">Each output branch maps to a possible value</p>
    </div>
  );
}

function TimeoutConfig({ config, updateConfig }: ConfigProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-2">
        <Label className="text-xs">Timeout</Label>
        <Input
          type="number"
          value={config.timeout || 60}
          onChange={(e) => updateConfig({ timeout: parseInt(e.target.value) || 0 })}
        />
      </div>
      <div className="space-y-2">
        <Label className="text-xs">Unit</Label>
        <Select
          value={config.unit || 'minutes'}
          onValueChange={(val) => updateConfig({ unit: val })}
        >
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="seconds">Seconds</SelectItem>
            <SelectItem value="minutes">Minutes</SelectItem>
            <SelectItem value="hours">Hours</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

function CreateTicketConfig({ config, updateConfig }: ConfigProps) {
  return (
    <>
      <div className="space-y-2">
        <Label className="text-xs">Ticket Subject</Label>
        <Input
          placeholder="Support request from {{contact_name}}"
          value={config.subject || ''}
          onChange={(e) => updateConfig({ subject: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label className="text-xs">Priority</Label>
        <Select
          value={config.priority || 'medium'}
          onValueChange={(val) => updateConfig({ priority: val })}
        >
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );
}

function AddSegmentConfig({ config, updateConfig }: ConfigProps) {
  return (
    <div className="space-y-2">
      <Label className="text-xs">Segment Name</Label>
      <Input
        placeholder="e.g., VIP Customers"
        value={config.segment || ''}
        onChange={(e) => updateConfig({ segment: e.target.value })}
      />
    </div>
  );
}
