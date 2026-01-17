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
      <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
            {editRule ? 'Edit Rule' : 'Create Auto-Tag Rule'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6 py-2 sm:py-4">
          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm">Rule Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Tag pricing inquiries"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Tag to Apply *</Label>
              <Select
                value={formData.tag_id}
                onValueChange={(value) => setFormData({ ...formData, tag_id: value })}
              >
                <SelectTrigger className="h-10">
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
            <Label htmlFor="description" className="text-sm">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe what this rule does..."
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              className="resize-none"
            />
          </div>

          <Separator />

          {/* Trigger Configuration */}
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0">1</div>
              <Label className="text-sm sm:text-base font-medium">When this happens...</Label>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {TRIGGER_TYPE_OPTIONS.map((trigger) => (
                <button
                  key={trigger.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, trigger_type: trigger.value as TagRule['trigger_type'], trigger_config: {} })}
                  className={`p-2 sm:p-3 rounded-lg border text-left transition-all ${
                    formData.trigger_type === trigger.value
                      ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                      : 'hover:border-primary/50 hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                    {TRIGGER_ICONS[trigger.value]}
                    <span className="text-xs sm:text-sm font-medium truncate">{trigger.label}</span>
                  </div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-2">{trigger.description}</p>
                </button>
              ))}
            </div>

            {/* Trigger-specific config */}
            <Card className="bg-muted/30">
              <CardContent className="pt-3 sm:pt-4 space-y-3 sm:space-y-4">
                {formData.trigger_type === 'keyword' && (
                  <>
                    <div className="space-y-2">
                      <Label className="text-sm">Keywords (comma-separated)</Label>
                      <Textarea
                        placeholder="pricing, cost, how much, price list"
                        value={keywords}
                        onChange={(e) => setKeywords(e.target.value)}
                        rows={2}
                        className="resize-none text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">Match Type</Label>
                      <Select
                        value={(formData.trigger_config as TriggerConfig)?.match_type || 'contains'}
                        onValueChange={(value) => updateTriggerConfig({ match_type: value as TriggerConfig['match_type'] })}
                      >
                        <SelectTrigger className="h-10">
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
                    <Label className="text-sm">Traffic Sources</Label>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {SOURCE_OPTIONS.map((source) => {
                        const sources = (formData.trigger_config as TriggerConfig)?.sources || [];
                        const isSelected = sources.includes(source);
                        return (
                          <Badge
                            key={source}
                            variant={isSelected ? 'default' : 'outline'}
                            className="cursor-pointer text-xs sm:text-sm py-1 px-2 sm:px-3"
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
                    <Label className="text-sm">No reply within (hours)</Label>
                    <Input
                      type="number"
                      min={1}
                      max={168}
                      value={(formData.trigger_config as TriggerConfig)?.no_reply_hours || 24}
                      onChange={(e) => updateTriggerConfig({ no_reply_hours: parseInt(e.target.value) })}
                      className="h-10"
                    />
                  </div>
                )}

                {formData.trigger_type === 'intervention' && (
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    This rule will trigger when a human agent takes over from bot.
                  </p>
                )}

                {formData.trigger_type === 'button_click' && (
                  <div className="space-y-2">
                    <Label className="text-sm">Button IDs (comma-separated)</Label>
                    <Input
                      placeholder="btn_pricing, btn_demo"
                      value={(formData.trigger_config as TriggerConfig)?.button_ids?.join(', ') || ''}
                      onChange={(e) => updateTriggerConfig({ button_ids: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                      className="h-10 text-sm"
                    />
                  </div>
                )}

                {formData.trigger_type === 'scheduled' && (
                  <div className="space-y-2">
                    <Label className="text-sm">Schedule (Cron Expression)</Label>
                    <Input
                      placeholder="0 9 * * 1-5"
                      value={(formData.trigger_config as TriggerConfig)?.schedule_cron || ''}
                      onChange={(e) => updateTriggerConfig({ schedule_cron: e.target.value })}
                      className="h-10 text-sm font-mono"
                    />
                    <p className="text-xs text-muted-foreground">
                      e.g., "0 9 * * 1-5" runs at 9 AM on weekdays
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* Action Configuration */}
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-bold shrink-0">2</div>
              <Label className="text-sm sm:text-base font-medium">Then do this...</Label>
            </div>

            <Select
              value={formData.action_type}
              onValueChange={(value: TagRule['action_type']) => setFormData({ ...formData, action_type: value })}
            >
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACTION_TYPE_OPTIONS.map((action) => (
                  <SelectItem key={action.value} value={action.value}>
                    <div>
                      <div className="font-medium text-sm">{action.label}</div>
                      <div className="text-xs text-muted-foreground">{action.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Rule Preview */}
          {selectedTag && (
            <Card className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950/30 dark:to-green-950/30 border-0">
              <CardHeader className="pb-2 px-3 sm:px-6 pt-3 sm:pt-4">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Rule Preview</CardTitle>
              </CardHeader>
              <CardContent className="px-3 sm:px-6 pb-3 sm:pb-4">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-background rounded-lg shadow-sm">
                    {TRIGGER_ICONS[formData.trigger_type || 'keyword']}
                    <span className="text-xs sm:text-sm">{TRIGGER_TYPE_OPTIONS.find(t => t.value === formData.trigger_type)?.label}</span>
                  </div>
                  <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
                  <div className="flex items-center gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-background rounded-lg shadow-sm">
                    <Badge style={{ backgroundColor: selectedTag.color || undefined }} className="text-xs sm:text-sm">
                      {selectedTag.emoji} {selectedTag.name}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Test Rule */}
          {formData.trigger_type === 'keyword' && keywords.trim() && (
            <Card className="border-dashed">
              <CardHeader className="pb-2 px-3 sm:px-6 pt-3 sm:pt-4">
                <CardTitle className="text-xs sm:text-sm font-medium flex items-center gap-2">
                  <TestTube className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Test Your Rule
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 sm:space-y-3 px-3 sm:px-6 pb-3 sm:pb-4">
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    placeholder="Enter a sample message to test..."
                    value={testMessage}
                    onChange={(e) => { setTestMessage(e.target.value); setTestResult(null); }}
                    className="h-10 text-sm flex-1"
                  />
                  <Button variant="outline" onClick={handleTestRule} size="sm" className="h-10 sm:w-auto w-full">
                    Test
                  </Button>
                </div>
                {testResult && (
                  <div className={`flex items-center gap-2 p-2 sm:p-3 rounded-lg text-xs sm:text-sm ${
                    testResult === 'pass' ? 'bg-green-50 text-green-700 dark:bg-green-950/50 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400'
                  }`}>
                    {testResult === 'pass' ? (
                      <>✅ Rule would match! Tag will be applied.</>
                    ) : (
                      <><AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" /> Rule would not match.</>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Active Toggle */}
          <div className="flex items-center justify-between p-3 sm:p-4 bg-muted/50 rounded-lg">
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

        <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0 pt-2">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!formData.name?.trim() || !formData.tag_id || submitting}
            className="w-full sm:w-auto"
          >
            {submitting ? 'Saving...' : editRule ? 'Save Changes' : 'Create Rule'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
