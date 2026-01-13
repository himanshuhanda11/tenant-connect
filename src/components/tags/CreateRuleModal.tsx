import { useState, useEffect } from 'react';
import { TagRule, TriggerConfig, Tag, TRIGGER_TYPE_OPTIONS, ACTION_TYPE_OPTIONS } from '@/types/tag';
import { useTags } from '@/hooks/useTags';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  MessageSquare,
  Globe,
  MousePointerClick,
  UserCheck,
  Clock,
  Calendar,
  ArrowRight,
  Zap,
  TestTube,
  AlertCircle
} from 'lucide-react';

interface CreateRuleModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (rule: Partial<TagRule>) => Promise<any>;
  editRule?: TagRule | null;
  preselectedTagId?: string;
}

const TRIGGER_ICONS: Record<string, React.ReactNode> = {
  keyword: <MessageSquare className="h-4 w-4" />,
  source: <Globe className="h-4 w-4" />,
  button_click: <MousePointerClick className="h-4 w-4" />,
  intervention: <UserCheck className="h-4 w-4" />,
  no_reply: <Clock className="h-4 w-4" />,
  scheduled: <Calendar className="h-4 w-4" />,
};

const SOURCE_OPTIONS = [
  'Facebook Lead Ads',
  'Website Form',
  'QR Code',
  'API',
  'WhatsApp Click-to-Chat',
  'Instagram',
  'Manual Import',
];

export function CreateRuleModal({ open, onClose, onSubmit, editRule, preselectedTagId }: CreateRuleModalProps) {
  const { tags } = useTags();
  const [formData, setFormData] = useState<Partial<TagRule>>({
    name: editRule?.name || '',
    description: editRule?.description || '',
    tag_id: editRule?.tag_id || preselectedTagId || '',
    trigger_type: editRule?.trigger_type || 'keyword',
    trigger_config: editRule?.trigger_config || {},
    action_type: editRule?.action_type || 'apply_tag',
    action_config: editRule?.action_config || {},
    is_active: editRule?.is_active ?? true,
    priority: editRule?.priority || 0,
  });
  const [keywords, setKeywords] = useState<string>((editRule?.trigger_config?.keywords || []).join(', '));
  const [testMessage, setTestMessage] = useState('');
  const [testResult, setTestResult] = useState<'pass' | 'fail' | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const selectedTag = tags.find(t => t.id === formData.tag_id);

  const updateTriggerConfig = (updates: Partial<TriggerConfig>) => {
    setFormData({
      ...formData,
      trigger_config: { ...(formData.trigger_config || {}), ...updates },
    });
  };

  const handleTestRule = () => {
    if (!testMessage.trim()) return;
    
    const config = formData.trigger_config as TriggerConfig;
    let passed = false;

    if (formData.trigger_type === 'keyword' && config.keywords?.length) {
      const messageLC = testMessage.toLowerCase();
      passed = config.keywords.some(kw => {
        const kwLC = kw.toLowerCase();
        switch (config.match_type) {
          case 'exact': return messageLC === kwLC;
          case 'starts_with': return messageLC.startsWith(kwLC);
          case 'regex': 
            try { return new RegExp(kw, 'i').test(testMessage); } 
            catch { return false; }
          default: return messageLC.includes(kwLC);
        }
      });
    }

    setTestResult(passed ? 'pass' : 'fail');
  };

  const handleSubmit = async () => {
    if (!formData.name?.trim() || !formData.tag_id) return;

    // Process keywords
    if (formData.trigger_type === 'keyword') {
      const keywordList = keywords.split(',').map(k => k.trim()).filter(Boolean);
      formData.trigger_config = { ...formData.trigger_config, keywords: keywordList };
    }

    setSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            {editRule ? 'Edit Rule' : 'Create Auto-Tag Rule'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Rule Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Tag pricing inquiries"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Tag to Apply *</Label>
              <Select
                value={formData.tag_id}
                onValueChange={(value) => setFormData({ ...formData, tag_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select tag" />
                </SelectTrigger>
                <SelectContent>
                  {tags.filter(t => t.status === 'active').map((tag) => (
                    <SelectItem key={tag.id} value={tag.id}>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className="text-xs"
                          style={{ backgroundColor: tag.color || undefined }}
                        >
                          {tag.emoji} {tag.name}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe what this rule does..."
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
            />
          </div>

          <Separator />

          {/* Trigger Configuration */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">1</div>
              <Label className="text-base font-medium">When this happens...</Label>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {TRIGGER_TYPE_OPTIONS.map((trigger) => (
                <button
                  key={trigger.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, trigger_type: trigger.value as TagRule['trigger_type'], trigger_config: {} })}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    formData.trigger_type === trigger.value
                      ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                      : 'hover:border-primary/50 hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {TRIGGER_ICONS[trigger.value]}
                    <span className="text-sm font-medium">{trigger.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{trigger.description}</p>
                </button>
              ))}
            </div>

            {/* Trigger-specific config */}
            <Card className="bg-muted/30">
              <CardContent className="pt-4 space-y-4">
                {formData.trigger_type === 'keyword' && (
                  <>
                    <div className="space-y-2">
                      <Label>Keywords (comma-separated)</Label>
                      <Textarea
                        placeholder="pricing, cost, how much, price list"
                        value={keywords}
                        onChange={(e) => setKeywords(e.target.value)}
                        rows={2}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Match Type</Label>
                      <Select
                        value={(formData.trigger_config as TriggerConfig)?.match_type || 'contains'}
                        onValueChange={(value) => updateTriggerConfig({ match_type: value as TriggerConfig['match_type'] })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="contains">Contains</SelectItem>
                          <SelectItem value="exact">Exact Match</SelectItem>
                          <SelectItem value="starts_with">Starts With</SelectItem>
                          <SelectItem value="regex">Regex</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {formData.trigger_type === 'source' && (
                  <div className="space-y-2">
                    <Label>Traffic Sources</Label>
                    <div className="flex flex-wrap gap-2">
                      {SOURCE_OPTIONS.map((source) => {
                        const sources = (formData.trigger_config as TriggerConfig)?.sources || [];
                        const isSelected = sources.includes(source);
                        return (
                          <Badge
                            key={source}
                            variant={isSelected ? 'default' : 'outline'}
                            className="cursor-pointer"
                            onClick={() => {
                              const newSources = isSelected
                                ? sources.filter(s => s !== source)
                                : [...sources, source];
                              updateTriggerConfig({ sources: newSources });
                            }}
                          >
                            {source}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                )}

                {formData.trigger_type === 'no_reply' && (
                  <div className="space-y-2">
                    <Label>No reply within (hours)</Label>
                    <Input
                      type="number"
                      min={1}
                      max={168}
                      value={(formData.trigger_config as TriggerConfig)?.no_reply_hours || 24}
                      onChange={(e) => updateTriggerConfig({ no_reply_hours: parseInt(e.target.value) })}
                    />
                  </div>
                )}

                {formData.trigger_type === 'intervention' && (
                  <p className="text-sm text-muted-foreground">
                    This rule will trigger when a human agent takes over from bot.
                  </p>
                )}

                {formData.trigger_type === 'button_click' && (
                  <div className="space-y-2">
                    <Label>Button IDs (comma-separated)</Label>
                    <Input
                      placeholder="btn_pricing, btn_demo"
                      value={(formData.trigger_config as TriggerConfig)?.button_ids?.join(', ') || ''}
                      onChange={(e) => updateTriggerConfig({ button_ids: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* Action Configuration */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-bold">2</div>
              <Label className="text-base font-medium">Then do this...</Label>
            </div>

            <Select
              value={formData.action_type}
              onValueChange={(value: TagRule['action_type']) => setFormData({ ...formData, action_type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACTION_TYPE_OPTIONS.map((action) => (
                  <SelectItem key={action.value} value={action.value}>
                    <div>
                      <div className="font-medium">{action.label}</div>
                      <div className="text-xs text-muted-foreground">{action.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Rule Preview */}
          {selectedTag && (
            <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Rule Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 p-2 bg-background rounded-lg">
                    {TRIGGER_ICONS[formData.trigger_type || 'keyword']}
                    <span className="text-sm">{TRIGGER_TYPE_OPTIONS.find(t => t.value === formData.trigger_type)?.label}</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <div className="flex items-center gap-2 p-2 bg-background rounded-lg">
                    <Badge style={{ backgroundColor: selectedTag.color || undefined }}>
                      {selectedTag.emoji} {selectedTag.name}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Test Rule */}
          {formData.trigger_type === 'keyword' && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TestTube className="h-4 w-4" />
                  Test Your Rule
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter a sample message to test..."
                    value={testMessage}
                    onChange={(e) => { setTestMessage(e.target.value); setTestResult(null); }}
                  />
                  <Button variant="outline" onClick={handleTestRule}>Test</Button>
                </div>
                {testResult && (
                  <div className={`flex items-center gap-2 p-2 rounded-lg ${
                    testResult === 'pass' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                  }`}>
                    {testResult === 'pass' ? (
                      <>✅ Rule would match! Tag will be applied.</>
                    ) : (
                      <><AlertCircle className="h-4 w-4" /> Rule would not match.</>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Active Toggle */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div>
              <Label className="text-sm font-medium">Rule Active</Label>
              <p className="text-xs text-muted-foreground">Enable or disable this rule</p>
            </div>
            <Switch
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!formData.name?.trim() || !formData.tag_id || submitting}>
            {submitting ? 'Saving...' : editRule ? 'Save Changes' : 'Create Rule'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
