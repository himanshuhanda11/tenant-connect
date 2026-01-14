import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Keyboard,
  Code,
  QrCode,
  Megaphone,
  FileText,
  Plus,
  Trash2,
  X,
  ChevronDown,
  ChevronUp,
  Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FlowStartPanelProps {
  triggers: any[];
  templates?: any[];
  campaigns?: any[];
  metaAds?: any[];
  onAddTrigger: (type: string, config: any) => void;
  onUpdateTrigger: (id: string, updates: any) => void;
  onDeleteTrigger: (id: string) => void;
  onToggleTrigger: (id: string, enabled: boolean) => void;
}

export const FlowStartPanel: React.FC<FlowStartPanelProps> = ({
  triggers,
  templates = [],
  campaigns = [],
  metaAds = [],
  onAddTrigger,
  onUpdateTrigger,
  onDeleteTrigger,
  onToggleTrigger,
}) => {
  const [keywordInput, setKeywordInput] = useState('');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [regexEnabled, setRegexEnabled] = useState(false);
  const [regexPattern, setRegexPattern] = useState('');
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<string>('');
  const [selectedMetaAds, setSelectedMetaAds] = useState<string[]>([]);
  const [expandedSections, setExpandedSections] = useState<string[]>(['keywords']);

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };

  const handleKeywordKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && keywordInput.trim()) {
      e.preventDefault();
      const newKeyword = keywordInput.trim().toLowerCase();
      if (!keywords.includes(newKeyword)) {
        const updatedKeywords = [...keywords, newKeyword];
        setKeywords(updatedKeywords);
        // Create or update keyword trigger
        const existingKeywordTrigger = triggers.find(t => t.trigger_type === 'keyword');
        if (existingKeywordTrigger) {
          onUpdateTrigger(existingKeywordTrigger.id, {
            config: { ...existingKeywordTrigger.config, keywords: updatedKeywords }
          });
        } else {
          onAddTrigger('keyword', { keywords: updatedKeywords });
        }
      }
      setKeywordInput('');
    }
  };

  const removeKeyword = (keyword: string) => {
    const updatedKeywords = keywords.filter(k => k !== keyword);
    setKeywords(updatedKeywords);
    const existingKeywordTrigger = triggers.find(t => t.trigger_type === 'keyword');
    if (existingKeywordTrigger) {
      if (updatedKeywords.length === 0) {
        onDeleteTrigger(existingKeywordTrigger.id);
      } else {
        onUpdateTrigger(existingKeywordTrigger.id, {
          config: { ...existingKeywordTrigger.config, keywords: updatedKeywords }
        });
      }
    }
  };

  const handleRegexChange = (enabled: boolean) => {
    setRegexEnabled(enabled);
    if (enabled && regexPattern) {
      const existingRegexTrigger = triggers.find(t => t.trigger_type === 'regex');
      if (!existingRegexTrigger) {
        onAddTrigger('regex', { pattern: regexPattern, case_sensitive: false });
      }
    }
  };

  const handleRegexPatternChange = (pattern: string) => {
    setRegexPattern(pattern);
    if (regexEnabled) {
      const existingRegexTrigger = triggers.find(t => t.trigger_type === 'regex');
      if (existingRegexTrigger) {
        onUpdateTrigger(existingRegexTrigger.id, {
          config: { ...existingRegexTrigger.config, pattern }
        });
      } else if (pattern) {
        onAddTrigger('regex', { pattern, case_sensitive: false });
      }
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    if (selectedTemplates.length >= 5) return;
    if (!selectedTemplates.includes(templateId)) {
      const updated = [...selectedTemplates, templateId];
      setSelectedTemplates(updated);
      onAddTrigger('template', { template_id: templateId });
    }
  };

  const removeTemplate = (templateId: string) => {
    setSelectedTemplates(prev => prev.filter(t => t !== templateId));
    const trigger = triggers.find(t => t.trigger_type === 'template' && t.config?.template_id === templateId);
    if (trigger) onDeleteTrigger(trigger.id);
  };

  const handleCampaignSelect = (campaignId: string) => {
    setSelectedCampaign(campaignId);
    const existingQRTrigger = triggers.find(t => t.trigger_type === 'qr');
    if (existingQRTrigger) {
      onUpdateTrigger(existingQRTrigger.id, { config: { campaign_id: campaignId } });
    } else {
      onAddTrigger('qr', { campaign_id: campaignId });
    }
  };

  const handleMetaAdSelect = (adId: string) => {
    if (selectedMetaAds.length >= 20) return;
    if (!selectedMetaAds.includes(adId)) {
      const updated = [...selectedMetaAds, adId];
      setSelectedMetaAds(updated);
      onAddTrigger('meta_ad', { ad_id: adId });
    }
  };

  const removeMetaAd = (adId: string) => {
    setSelectedMetaAds(prev => prev.filter(a => a !== adId));
    const trigger = triggers.find(t => t.trigger_type === 'meta_ad' && t.config?.ad_id === adId);
    if (trigger) onDeleteTrigger(trigger.id);
  };

  // Initialize state from existing triggers
  React.useEffect(() => {
    const keywordTrigger = triggers.find(t => t.trigger_type === 'keyword');
    if (keywordTrigger?.config?.keywords) {
      setKeywords(keywordTrigger.config.keywords);
    }
    const regexTrigger = triggers.find(t => t.trigger_type === 'regex');
    if (regexTrigger) {
      setRegexEnabled(true);
      setRegexPattern(regexTrigger.config?.pattern || '');
    }
  }, [triggers]);

  return (
    <div className="w-full max-w-[280px] bg-card rounded-2xl border-2 border-primary shadow-xl">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 bg-primary/10 rounded-t-xl border-b">
        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
          <Layers className="w-4 h-4 text-primary" />
        </div>
        <span className="font-semibold text-primary">Flow Start</span>
        <div className="ml-auto w-3 h-3 rounded-full border-2 border-primary" />
      </div>

      <ScrollArea className="max-h-[500px]">
        <div className="p-4 space-y-4">
          {/* Keywords Section */}
          <div className="space-y-2">
            <button
              onClick={() => toggleSection('keywords')}
              className="w-full flex items-center justify-between text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <Keyboard className="w-3.5 h-3.5" />
                Type, press enter to add keyword
              </span>
              {expandedSections.includes('keywords') ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
            
            {expandedSections.includes('keywords') && (
              <div className="space-y-2">
                <Input
                  placeholder="Enter keywords"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyDown={handleKeywordKeyDown}
                  className="h-9 text-sm"
                />
                {keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {keywords.map((keyword) => (
                      <Badge
                        key={keyword}
                        variant="secondary"
                        className="text-xs px-2 py-0.5 flex items-center gap-1"
                      >
                        {keyword}
                        <button
                          onClick={() => removeKeyword(keyword)}
                          className="ml-0.5 hover:text-destructive"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <Separator />

          {/* Regex Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5" />
                Enter regex to match substring trigger. Enable toggle for case sensitive regex.
              </span>
              <Switch
                checked={regexEnabled}
                onCheckedChange={handleRegexChange}
                className="scale-75"
              />
            </div>
            <Input
              placeholder="Enter Regex"
              value={regexPattern}
              onChange={(e) => handleRegexPatternChange(e.target.value)}
              disabled={!regexEnabled}
              className={cn("h-9 text-sm", !regexEnabled && "opacity-50")}
            />
          </div>

          <Separator />

          {/* Templates Section */}
          <div className="space-y-2">
            <button
              onClick={() => toggleSection('templates')}
              className="w-full flex items-center justify-between text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                Add upto 5 template to begin flow
              </span>
              {expandedSections.includes('templates') ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
            
            {expandedSections.includes('templates') && (
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full h-9 justify-center text-sm text-muted-foreground border-dashed"
                  onClick={() => {/* Open template picker modal */}}
                  disabled={selectedTemplates.length >= 5}
                >
                  Choose Template
                </Button>
                {selectedTemplates.length > 0 && (
                  <div className="space-y-1">
                    {selectedTemplates.map((templateId) => (
                      <div
                        key={templateId}
                        className="flex items-center justify-between p-2 rounded-lg bg-muted/50 text-xs"
                      >
                        <span>Template {templateId.slice(0, 8)}...</span>
                        <button onClick={() => removeTemplate(templateId)}>
                          <Trash2 className="w-3.5 h-3.5 text-destructive" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <Separator />

          {/* QR Campaign Section */}
          <div className="space-y-2">
            <button
              onClick={() => toggleSection('qr')}
              className="w-full flex items-center justify-between text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <QrCode className="w-3.5 h-3.5" />
                Add upto 1 Campaign to begin flow
              </span>
              {expandedSections.includes('qr') ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
            
            {expandedSections.includes('qr') && (
              <Button
                variant="outline"
                className="w-full h-9 justify-center text-sm text-muted-foreground border-dashed"
                onClick={() => {/* Open QR campaign picker */}}
              >
                Choose QR Campaign
              </Button>
            )}
          </div>

          <Separator />

          {/* Meta Ads Section */}
          <div className="space-y-2">
            <button
              onClick={() => toggleSection('meta')}
              className="w-full flex items-center justify-between text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <Megaphone className="w-3.5 h-3.5" />
                Add upto 20 Meta Ads to begin flow
              </span>
              {expandedSections.includes('meta') ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
            
            {expandedSections.includes('meta') && (
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full h-9 justify-center text-sm text-muted-foreground border-dashed"
                  onClick={() => {/* Open Meta Ads picker */}}
                  disabled={selectedMetaAds.length >= 20}
                >
                  Choose Facebook Ad
                </Button>
                {selectedMetaAds.length > 0 && (
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {selectedMetaAds.map((adId) => (
                      <div
                        key={adId}
                        className="flex items-center justify-between p-2 rounded-lg bg-muted/50 text-xs"
                      >
                        <span>Ad {adId.slice(0, 8)}...</span>
                        <button onClick={() => removeMetaAd(adId)}>
                          <Trash2 className="w-3.5 h-3.5 text-destructive" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};
