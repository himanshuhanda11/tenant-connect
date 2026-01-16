import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Keyboard,
  Code,
  QrCode,
  Megaphone,
  FileText,
  X,
  Layers,
  Trash2,
  Search,
  Facebook,
  Sparkles,
  ChevronRight,
  Zap,
  Clock,
  MessageSquare,
  MousePointer,
  Webhook,
  Plus,
  Check,
  AlertCircle,
  Info,
  Settings2,
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

// Mock Meta Ads data
const mockMetaAds = [
  { id: 'ad-001', name: 'Summer Sale Campaign', status: 'active', clicks: 1234, adset: 'Retargeting' },
  { id: 'ad-002', name: 'New Product Launch', status: 'active', clicks: 856, adset: 'Lookalike' },
  { id: 'ad-003', name: 'Holiday Special Promo', status: 'paused', clicks: 2341, adset: 'Interest' },
  { id: 'ad-004', name: 'Brand Awareness Q1', status: 'active', clicks: 567, adset: 'Broad' },
  { id: 'ad-005', name: 'Retargeting - Cart Abandon', status: 'active', clicks: 3210, adset: 'Retargeting' },
  { id: 'ad-006', name: 'Lead Gen - Free Trial', status: 'active', clicks: 1890, adset: 'Lead Gen' },
];

// Mock Templates
const mockTemplates = [
  { id: 'tpl-001', name: 'Welcome Message', category: 'marketing', status: 'approved' },
  { id: 'tpl-002', name: 'Order Confirmation', category: 'utility', status: 'approved' },
  { id: 'tpl-003', name: 'Appointment Reminder', category: 'utility', status: 'approved' },
  { id: 'tpl-004', name: 'Promotional Offer', category: 'marketing', status: 'pending' },
  { id: 'tpl-005', name: 'Support Follow-up', category: 'utility', status: 'approved' },
];

// Mock QR Campaigns
const mockCampaigns = [
  { id: 'qr-001', name: 'Store QR Code', scans: 450, location: 'Mumbai' },
  { id: 'qr-002', name: 'Product Packaging QR', scans: 1200, location: 'All India' },
  { id: 'qr-003', name: 'Event Registration QR', scans: 320, location: 'Delhi' },
];

// Trigger type configuration
const triggerCategories = [
  {
    id: 'message',
    label: 'Message Triggers',
    icon: MessageSquare,
    color: 'from-blue-500 to-blue-600',
    triggers: [
      { type: 'keyword', label: 'Keyword Match', icon: Keyboard, description: 'Trigger on exact keyword' },
      { type: 'regex', label: 'Regex Pattern', icon: Code, description: 'Advanced pattern matching', pro: true },
      { type: 'fallback', label: 'Fallback/No Match', icon: MessageSquare, description: 'When no flow matches' },
    ]
  },
  {
    id: 'campaign',
    label: 'Campaign Triggers',
    icon: Megaphone,
    color: 'from-purple-500 to-purple-600',
    triggers: [
      { type: 'meta_ad', label: 'Meta Ads (CTWA)', icon: Facebook, description: 'Click-to-WhatsApp Ads' },
      { type: 'qr', label: 'QR Campaign', icon: QrCode, description: 'From QR code scans' },
      { type: 'template', label: 'Template Reply', icon: FileText, description: 'User replies to template' },
    ]
  },
  {
    id: 'advanced',
    label: 'Advanced Triggers',
    icon: Zap,
    color: 'from-amber-500 to-amber-600',
    triggers: [
      { type: 'api', label: 'API/Webhook', icon: Webhook, description: 'External API trigger', pro: true },
      { type: 'manual', label: 'Agent Manual', icon: MousePointer, description: 'Triggered by agent' },
      { type: 'scheduled', label: 'Scheduled', icon: Clock, description: 'Time-based trigger', pro: true },
    ]
  }
];

export const FlowStartPanel: React.FC<FlowStartPanelProps> = ({
  triggers,
  templates = mockTemplates,
  campaigns = mockCampaigns,
  metaAds = mockMetaAds,
  onAddTrigger,
  onUpdateTrigger,
  onDeleteTrigger,
  onToggleTrigger,
}) => {
  // Keyword state
  const [keywordInput, setKeywordInput] = useState('');
  const [keywords, setKeywords] = useState<string[]>([]);
  
  // Regex state
  const [regexEnabled, setRegexEnabled] = useState(false);
  const [regexPattern, setRegexPattern] = useState('');
  
  // Selection state
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  const [selectedMetaAds, setSelectedMetaAds] = useState<string[]>([]);

  // Modal states
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [campaignModalOpen, setCampaignModalOpen] = useState(false);
  const [metaAdsModalOpen, setMetaAdsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Expanded category state
  const [expandedCategory, setExpandedCategory] = useState<string | null>('message');

  // Initialize state from existing triggers
  useEffect(() => {
    const keywordTrigger = triggers.find(t => t.trigger_type === 'keyword');
    if (keywordTrigger?.config?.keywords) {
      setKeywords(keywordTrigger.config.keywords);
    }
    const regexTrigger = triggers.find(t => t.trigger_type === 'regex');
    if (regexTrigger) {
      setRegexEnabled(true);
      setRegexPattern(regexTrigger.config?.pattern || '');
    }
    const templateTriggers = triggers.filter(t => t.trigger_type === 'template');
    setSelectedTemplates(templateTriggers.map(t => t.config?.template_id).filter(Boolean));
    const qrTrigger = triggers.find(t => t.trigger_type === 'qr');
    if (qrTrigger) setSelectedCampaign(qrTrigger.config?.campaign_id || null);
    const metaAdTriggers = triggers.filter(t => t.trigger_type === 'meta_ad');
    setSelectedMetaAds(metaAdTriggers.map(t => t.config?.ad_id).filter(Boolean));
  }, [triggers]);

  // Count active triggers
  const activeTriggerCount = [
    keywords.length > 0 ? 1 : 0,
    regexEnabled && regexPattern ? 1 : 0,
    selectedTemplates.length,
    selectedCampaign ? 1 : 0,
    selectedMetaAds.length,
  ].reduce((a, b) => a + b, 0);

  // Keyword handlers
  const handleKeywordKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && keywordInput.trim()) {
      e.preventDefault();
      const newKeyword = keywordInput.trim().toLowerCase();
      if (!keywords.includes(newKeyword)) {
        const updatedKeywords = [...keywords, newKeyword];
        setKeywords(updatedKeywords);
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

  // Regex handlers
  const handleRegexChange = (enabled: boolean) => {
    setRegexEnabled(enabled);
    if (enabled && regexPattern) {
      const existingRegexTrigger = triggers.find(t => t.trigger_type === 'regex');
      if (!existingRegexTrigger) {
        onAddTrigger('regex', { pattern: regexPattern, case_sensitive: false });
      }
    } else if (!enabled) {
      const existingRegexTrigger = triggers.find(t => t.trigger_type === 'regex');
      if (existingRegexTrigger) {
        onDeleteTrigger(existingRegexTrigger.id);
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

  // Template handlers
  const handleTemplateToggle = (templateId: string) => {
    if (selectedTemplates.includes(templateId)) {
      removeTemplate(templateId);
    } else if (selectedTemplates.length < 5) {
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

  // Campaign handlers
  const handleCampaignSelect = (campaignId: string) => {
    setSelectedCampaign(campaignId);
    const existingQRTrigger = triggers.find(t => t.trigger_type === 'qr');
    if (existingQRTrigger) {
      onUpdateTrigger(existingQRTrigger.id, { config: { campaign_id: campaignId } });
    } else {
      onAddTrigger('qr', { campaign_id: campaignId });
    }
    setCampaignModalOpen(false);
  };

  const removeCampaign = () => {
    setSelectedCampaign(null);
    const existingQRTrigger = triggers.find(t => t.trigger_type === 'qr');
    if (existingQRTrigger) onDeleteTrigger(existingQRTrigger.id);
  };

  // Meta Ad handlers
  const handleMetaAdToggle = (adId: string) => {
    if (selectedMetaAds.includes(adId)) {
      removeMetaAd(adId);
    } else if (selectedMetaAds.length < 20) {
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

  const filteredMetaAds = metaAds.filter(ad => 
    ad.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="w-[340px] bg-gradient-to-br from-card via-card to-primary/5 rounded-2xl border-2 border-primary/30 shadow-2xl shadow-primary/10 overflow-hidden backdrop-blur-sm" data-no-drag>
        {/* Header - Premium Design */}
        <div className="relative overflow-hidden">
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary to-primary/80" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjIiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjwvZz48L3N2Zz4=')] opacity-50" />
          
          <div className="relative flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Flow Start</h3>
                <p className="text-white/70 text-[10px]">Configure entry triggers</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {activeTriggerCount > 0 && (
                <Badge className="bg-white/20 text-white border-white/30 text-[10px] px-2">
                  {activeTriggerCount} active
                </Badge>
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                    <Settings2 className="w-3.5 h-3.5 text-white" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="left" className="bg-popover">
                  <p>Advanced settings</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
          
          {/* AI Suggestion Banner */}
          <div className="relative mx-3 mb-3">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300 shrink-0" />
              <p className="text-[10px] text-white/90">AI Tip: Add keywords + Meta Ads for 3x more reach</p>
            </div>
          </div>
        </div>

        <ScrollArea className="max-h-[480px]">
          <div className="p-3 space-y-2">
            
            {/* Quick Add Triggers Grid */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              <button
                onClick={() => setExpandedCategory('message')}
                className={cn(
                  "flex flex-col items-center gap-1.5 p-2.5 rounded-xl border-2 transition-all",
                  expandedCategory === 'message' 
                    ? "bg-blue-500/10 border-blue-500/50 shadow-lg shadow-blue-500/10" 
                    : "bg-card border-border/50 hover:border-blue-500/30 hover:bg-blue-500/5"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center",
                  expandedCategory === 'message' ? "bg-blue-500" : "bg-muted"
                )}>
                  <Keyboard className={cn("w-4 h-4", expandedCategory === 'message' ? "text-white" : "text-muted-foreground")} />
                </div>
                <span className={cn("text-[10px] font-medium", expandedCategory === 'message' ? "text-blue-600" : "text-muted-foreground")}>Keywords</span>
                {keywords.length > 0 && (
                  <Badge variant="secondary" className="text-[8px] px-1 py-0 h-4">{keywords.length}</Badge>
                )}
              </button>
              
              <button
                onClick={() => { setExpandedCategory('campaign'); setMetaAdsModalOpen(true); }}
                className={cn(
                  "flex flex-col items-center gap-1.5 p-2.5 rounded-xl border-2 transition-all",
                  selectedMetaAds.length > 0 
                    ? "bg-purple-500/10 border-purple-500/50 shadow-lg shadow-purple-500/10" 
                    : "bg-card border-border/50 hover:border-purple-500/30 hover:bg-purple-500/5"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center",
                  selectedMetaAds.length > 0 ? "bg-purple-500" : "bg-muted"
                )}>
                  <Facebook className={cn("w-4 h-4", selectedMetaAds.length > 0 ? "text-white" : "text-muted-foreground")} />
                </div>
                <span className={cn("text-[10px] font-medium", selectedMetaAds.length > 0 ? "text-purple-600" : "text-muted-foreground")}>Meta Ads</span>
                {selectedMetaAds.length > 0 && (
                  <Badge variant="secondary" className="text-[8px] px-1 py-0 h-4">{selectedMetaAds.length}</Badge>
                )}
              </button>
              
              <button
                onClick={() => { setExpandedCategory('qr'); setCampaignModalOpen(true); }}
                className={cn(
                  "flex flex-col items-center gap-1.5 p-2.5 rounded-xl border-2 transition-all",
                  selectedCampaign 
                    ? "bg-green-500/10 border-green-500/50 shadow-lg shadow-green-500/10" 
                    : "bg-card border-border/50 hover:border-green-500/30 hover:bg-green-500/5"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center",
                  selectedCampaign ? "bg-green-500" : "bg-muted"
                )}>
                  <QrCode className={cn("w-4 h-4", selectedCampaign ? "text-white" : "text-muted-foreground")} />
                </div>
                <span className={cn("text-[10px] font-medium", selectedCampaign ? "text-green-600" : "text-muted-foreground")}>QR Code</span>
                {selectedCampaign && (
                  <Badge variant="secondary" className="text-[8px] px-1 py-0 h-4">1</Badge>
                )}
              </button>
            </div>

            {/* Keywords Section - Expanded */}
            <div className="space-y-2 p-3 rounded-xl bg-muted/30 border border-border/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-blue-500/10 flex items-center justify-center">
                    <Keyboard className="w-3.5 h-3.5 text-blue-500" />
                  </div>
                  <span className="text-xs font-semibold">Keywords</span>
                </div>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-3.5 h-3.5 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent side="left" className="max-w-[200px] bg-popover">
                    <p className="text-xs">Flow triggers when message contains any of these keywords</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              
              <div className="relative">
                <Input
                  placeholder="Type keyword, press Enter..."
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyDown={handleKeywordKeyDown}
                  className="h-9 text-sm pr-8 bg-background border-dashed"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  <Plus className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
              
              {keywords.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {keywords.map((keyword) => (
                    <Badge
                      key={keyword}
                      className="bg-blue-500/10 text-blue-600 border-blue-500/30 hover:bg-blue-500/20 text-[11px] px-2 py-0.5 flex items-center gap-1 cursor-default"
                    >
                      {keyword}
                      <button
                        onClick={() => removeKeyword(keyword)}
                        className="ml-0.5 hover:text-destructive transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Regex Section */}
            <div className="space-y-2 p-3 rounded-xl bg-muted/30 border border-border/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-amber-500/10 flex items-center justify-center">
                    <Code className="w-3.5 h-3.5 text-amber-500" />
                  </div>
                  <span className="text-xs font-semibold">Regex Pattern</span>
                  <Badge variant="outline" className="text-[8px] px-1 py-0 h-4 border-purple-500/50 text-purple-500">Pro</Badge>
                </div>
                <Switch
                  checked={regexEnabled}
                  onCheckedChange={handleRegexChange}
                  className="scale-75"
                />
              </div>
              
              {regexEnabled && (
                <Input
                  placeholder="Enter regex pattern..."
                  value={regexPattern}
                  onChange={(e) => handleRegexPatternChange(e.target.value)}
                  className="h-9 text-sm font-mono bg-background border-dashed"
                />
              )}
            </div>

            {/* Templates Section */}
            <div className="space-y-2 p-3 rounded-xl bg-muted/30 border border-border/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-green-500/10 flex items-center justify-center">
                    <FileText className="w-3.5 h-3.5 text-green-500" />
                  </div>
                  <span className="text-xs font-semibold">Template Reply</span>
                  <span className="text-[10px] text-muted-foreground">({selectedTemplates.length}/5)</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-[10px] px-2"
                  onClick={() => setTemplateModalOpen(true)}
                  disabled={selectedTemplates.length >= 5}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add
                </Button>
              </div>
              
              {selectedTemplates.length > 0 && (
                <div className="space-y-1.5">
                  {selectedTemplates.map((templateId) => {
                    const template = templates.find(t => t.id === templateId);
                    return (
                      <div
                        key={templateId}
                        className="flex items-center justify-between p-2 rounded-lg bg-green-500/5 border border-green-500/20"
                      >
                        <div className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-green-500" />
                          <span className="text-xs font-medium">{template?.name || templateId}</span>
                        </div>
                        <button onClick={() => removeTemplate(templateId)} className="hover:text-destructive transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Meta Ads Display */}
            {selectedMetaAds.length > 0 && (
              <div className="space-y-2 p-3 rounded-xl bg-purple-500/5 border border-purple-500/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-purple-500/10 flex items-center justify-center">
                      <Facebook className="w-3.5 h-3.5 text-purple-500" />
                    </div>
                    <span className="text-xs font-semibold text-purple-600">Meta Ads</span>
                    <span className="text-[10px] text-muted-foreground">({selectedMetaAds.length}/20)</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-[10px] px-2 text-purple-600"
                    onClick={() => setMetaAdsModalOpen(true)}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add More
                  </Button>
                </div>
                
                <div className="space-y-1.5 max-h-24 overflow-y-auto">
                  {selectedMetaAds.slice(0, 3).map((adId) => {
                    const ad = metaAds.find(a => a.id === adId);
                    return (
                      <div
                        key={adId}
                        className="flex items-center justify-between p-2 rounded-lg bg-purple-500/10 border border-purple-500/20"
                      >
                        <div className="flex items-center gap-2">
                          <Facebook className="w-3.5 h-3.5 text-purple-500" />
                          <span className="text-xs font-medium truncate max-w-[180px]">{ad?.name || adId}</span>
                        </div>
                        <button onClick={() => removeMetaAd(adId)} className="hover:text-destructive transition-colors">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                  {selectedMetaAds.length > 3 && (
                    <button 
                      className="w-full text-center text-[10px] text-purple-600 hover:underline py-1"
                      onClick={() => setMetaAdsModalOpen(true)}
                    >
                      +{selectedMetaAds.length - 3} more ads
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* QR Campaign Display */}
            {selectedCampaign && (
              <div className="space-y-2 p-3 rounded-xl bg-green-500/5 border border-green-500/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-green-500/10 flex items-center justify-center">
                      <QrCode className="w-3.5 h-3.5 text-green-500" />
                    </div>
                    <span className="text-xs font-semibold text-green-600">QR Campaign</span>
                  </div>
                  <button onClick={removeCampaign} className="hover:text-destructive transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-green-500/10 border border-green-500/20">
                  <QrCode className="w-3.5 h-3.5 text-green-500" />
                  <span className="text-xs font-medium">{campaigns.find(c => c.id === selectedCampaign)?.name}</span>
                </div>
              </div>
            )}

          </div>
        </ScrollArea>
        
        {/* Footer Stats */}
        <div className="px-4 py-2.5 bg-muted/50 border-t border-border/50">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span>{activeTriggerCount} trigger{activeTriggerCount !== 1 ? 's' : ''} configured</span>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>Ready</span>
            </div>
          </div>
        </div>
      </div>

      {/* Template Picker Modal */}
      <Dialog open={templateModalOpen} onOpenChange={setTemplateModalOpen}>
        <DialogContent className="sm:max-w-md bg-card">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-green-500" />
              Choose Templates
            </DialogTitle>
            <DialogDescription>
              Select up to 5 templates to trigger this flow ({selectedTemplates.length}/5)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search templates..." className="pl-10" />
            </div>
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {templates.map((template) => (
                  <label
                    key={template.id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                      selectedTemplates.includes(template.id) 
                        ? "border-green-500 bg-green-500/5" 
                        : "border-border hover:border-green-500/50"
                    )}
                  >
                    <Checkbox
                      checked={selectedTemplates.includes(template.id)}
                      onCheckedChange={() => handleTemplateToggle(template.id)}
                      disabled={!selectedTemplates.includes(template.id) && selectedTemplates.length >= 5}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{template.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{template.category}</p>
                    </div>
                    <Badge variant={template.status === 'approved' ? 'default' : 'secondary'} className="text-[10px]">
                      {template.status}
                    </Badge>
                  </label>
                ))}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      {/* QR Campaign Modal */}
      <Dialog open={campaignModalOpen} onOpenChange={setCampaignModalOpen}>
        <DialogContent className="sm:max-w-md bg-card">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-green-500" />
              Choose QR Campaign
            </DialogTitle>
            <DialogDescription>
              Select 1 QR campaign to trigger this flow
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[300px]">
            <div className="space-y-2">
              {campaigns.map((campaign) => (
                <button
                  key={campaign.id}
                  onClick={() => handleCampaignSelect(campaign.id)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all",
                    selectedCampaign === campaign.id 
                      ? "border-green-500 bg-green-500/5" 
                      : "border-border hover:border-green-500/50"
                  )}
                >
                  <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <QrCode className="w-5 h-5 text-green-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{campaign.name}</p>
                    <p className="text-xs text-muted-foreground">{campaign.scans} scans • {campaign.location}</p>
                  </div>
                  {selectedCampaign === campaign.id && (
                    <Check className="w-5 h-5 text-green-500" />
                  )}
                </button>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Meta Ads Modal */}
      <Dialog open={metaAdsModalOpen} onOpenChange={setMetaAdsModalOpen}>
        <DialogContent className="sm:max-w-lg bg-card">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Facebook className="w-5 h-5 text-purple-500" />
              Choose Meta Ads
            </DialogTitle>
            <DialogDescription>
              Select up to 20 Click-to-WhatsApp ads ({selectedMetaAds.length}/20)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search ads..." 
                className="pl-10" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <ScrollArea className="h-[350px]">
              <div className="space-y-2">
                {filteredMetaAds.map((ad) => (
                  <label
                    key={ad.id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                      selectedMetaAds.includes(ad.id) 
                        ? "border-purple-500 bg-purple-500/5" 
                        : "border-border hover:border-purple-500/50"
                    )}
                  >
                    <Checkbox
                      checked={selectedMetaAds.includes(ad.id)}
                      onCheckedChange={() => handleMetaAdToggle(ad.id)}
                      disabled={!selectedMetaAds.includes(ad.id) && selectedMetaAds.length >= 20}
                    />
                    <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                      <Facebook className="w-5 h-5 text-purple-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{ad.name}</p>
                      <p className="text-xs text-muted-foreground">{ad.adset} • {ad.clicks.toLocaleString()} clicks</p>
                    </div>
                    <Badge 
                      variant={ad.status === 'active' ? 'default' : 'secondary'}
                      className={cn(
                        "text-[10px] shrink-0",
                        ad.status === 'active' && "bg-green-500"
                      )}
                    >
                      {ad.status}
                    </Badge>
                  </label>
                ))}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
