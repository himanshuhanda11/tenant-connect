import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  ExternalLink,
  Facebook,
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

// Mock Meta Ads data (in production, fetch from API)
const mockMetaAds = [
  { id: 'ad-001', name: 'Summer Sale Campaign', status: 'active', clicks: 1234 },
  { id: 'ad-002', name: 'New Product Launch', status: 'active', clicks: 856 },
  { id: 'ad-003', name: 'Holiday Special Promo', status: 'paused', clicks: 2341 },
  { id: 'ad-004', name: 'Brand Awareness Q1', status: 'active', clicks: 567 },
  { id: 'ad-005', name: 'Retargeting - Cart Abandon', status: 'active', clicks: 3210 },
  { id: 'ad-006', name: 'Lead Gen - Free Trial', status: 'active', clicks: 1890 },
];

// Mock Templates
const mockTemplates = [
  { id: 'tpl-001', name: 'Welcome Message', category: 'marketing' },
  { id: 'tpl-002', name: 'Order Confirmation', category: 'utility' },
  { id: 'tpl-003', name: 'Appointment Reminder', category: 'utility' },
  { id: 'tpl-004', name: 'Promotional Offer', category: 'marketing' },
  { id: 'tpl-005', name: 'Support Follow-up', category: 'utility' },
];

// Mock QR Campaigns
const mockCampaigns = [
  { id: 'qr-001', name: 'Store QR Code', scans: 450 },
  { id: 'qr-002', name: 'Product Packaging QR', scans: 1200 },
  { id: 'qr-003', name: 'Event Registration QR', scans: 320 },
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
    // Initialize selected templates
    const templateTriggers = triggers.filter(t => t.trigger_type === 'template');
    setSelectedTemplates(templateTriggers.map(t => t.config?.template_id).filter(Boolean));
    // Initialize QR campaign
    const qrTrigger = triggers.find(t => t.trigger_type === 'qr');
    if (qrTrigger) setSelectedCampaign(qrTrigger.config?.campaign_id || null);
    // Initialize Meta Ads
    const metaAdTriggers = triggers.filter(t => t.trigger_type === 'meta_ad');
    setSelectedMetaAds(metaAdTriggers.map(t => t.config?.ad_id).filter(Boolean));
  }, [triggers]);

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
      <div className="w-full max-w-[300px] bg-card rounded-2xl border-2 border-primary shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-3 bg-primary/10 border-b border-primary/20">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <Layers className="w-4 h-4 text-primary" />
          </div>
          <span className="font-semibold text-primary">Flow Start</span>
          <div className="ml-auto w-3 h-3 rounded-full border-2 border-primary" />
        </div>

        <ScrollArea className="max-h-[520px]">
          <div className="p-4 space-y-4">
            
            {/* Keywords Section */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Keyboard className="w-3.5 h-3.5" />
                <span>Type, press enter to add keyword</span>
              </div>
              <Input
                placeholder="Enter keywords"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={handleKeywordKeyDown}
                className="h-9 text-sm border-dashed"
              />
              {keywords.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
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

            <Separator />

            {/* Regex Section */}
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-1.5 text-xs text-muted-foreground flex-1">
                  <Code className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  <span>Enter regex to match substring trigger. Enable toggle for case sensitive regex.</span>
                </div>
                <Switch
                  checked={regexEnabled}
                  onCheckedChange={handleRegexChange}
                  className="scale-90"
                />
              </div>
              <Input
                placeholder="Enter Regex"
                value={regexPattern}
                onChange={(e) => handleRegexPatternChange(e.target.value)}
                disabled={!regexEnabled}
                className={cn("h-9 text-sm border-dashed", !regexEnabled && "opacity-50 cursor-not-allowed")}
              />
            </div>

            <Separator />

            {/* Templates Section */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <FileText className="w-3.5 h-3.5" />
                <span>Add upto 5 template to begin flow</span>
              </div>
              <Button
                variant="outline"
                className="w-full h-9 justify-center text-sm text-muted-foreground border-dashed hover:border-primary hover:text-primary"
                onClick={() => setTemplateModalOpen(true)}
                disabled={selectedTemplates.length >= 5}
              >
                Choose Template
              </Button>
              {selectedTemplates.length > 0 && (
                <div className="space-y-1.5 mt-2">
                  {selectedTemplates.map((templateId) => {
                    const template = templates.find(t => t.id === templateId);
                    return (
                      <div
                        key={templateId}
                        className="flex items-center justify-between p-2 rounded-lg bg-primary/5 border border-primary/20 text-xs"
                      >
                        <span className="font-medium">{template?.name || templateId}</span>
                        <button onClick={() => removeTemplate(templateId)} className="hover:text-destructive">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <Separator />

            {/* QR Campaign Section */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <QrCode className="w-3.5 h-3.5" />
                <span>Add upto 1 Campaign to begin flow</span>
              </div>
              {selectedCampaign ? (
                <div className="flex items-center justify-between p-2 rounded-lg bg-primary/5 border border-primary/20 text-xs">
                  <span className="font-medium">
                    {campaigns.find(c => c.id === selectedCampaign)?.name || selectedCampaign}
                  </span>
                  <button onClick={removeCampaign} className="hover:text-destructive">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="w-full h-9 justify-center text-sm text-muted-foreground border-dashed hover:border-primary hover:text-primary"
                  onClick={() => setCampaignModalOpen(true)}
                >
                  Choose QR Campaign
                </Button>
              )}
            </div>

            <Separator />

            {/* Meta Ads Section */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Megaphone className="w-3.5 h-3.5" />
                <span>Add upto 20 Meta Ads to begin flow</span>
              </div>
              <Button
                variant="outline"
                className="w-full h-9 justify-center text-sm text-muted-foreground border-dashed hover:border-primary hover:text-primary"
                onClick={() => setMetaAdsModalOpen(true)}
                disabled={selectedMetaAds.length >= 20}
              >
                <Facebook className="w-4 h-4 mr-2 text-blue-600" />
                Choose Facebook Ad
              </Button>
              {selectedMetaAds.length > 0 && (
                <div className="space-y-1.5 mt-2 max-h-32 overflow-y-auto">
                  {selectedMetaAds.map((adId) => {
                    const ad = metaAds.find(a => a.id === adId);
                    return (
                      <div
                        key={adId}
                        className="flex items-center justify-between p-2 rounded-lg bg-blue-500/5 border border-blue-500/20 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <Facebook className="w-3.5 h-3.5 text-blue-600" />
                          <span className="font-medium">{ad?.name || adId}</span>
                        </div>
                        <button onClick={() => removeMetaAd(adId)} className="hover:text-destructive">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </ScrollArea>
      </div>

      {/* Template Picker Modal */}
      <Dialog open={templateModalOpen} onOpenChange={setTemplateModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Choose Template</DialogTitle>
            <DialogDescription>
              Select up to 5 templates to trigger this flow ({selectedTemplates.length}/5 selected)
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
                        ? "border-primary bg-primary/5" 
                        : "border-border hover:border-primary/50"
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
                  </label>
                ))}
              </div>
            </ScrollArea>
            <Button onClick={() => setTemplateModalOpen(false)} className="w-full">
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* QR Campaign Picker Modal */}
      <Dialog open={campaignModalOpen} onOpenChange={setCampaignModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Choose QR Campaign</DialogTitle>
            <DialogDescription>Select a QR campaign to trigger this flow</DialogDescription>
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
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <QrCode className="w-5 h-5 text-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{campaign.name}</p>
                    <p className="text-xs text-muted-foreground">{campaign.scans} scans</p>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Meta Ads Picker Modal */}
      <Dialog open={metaAdsModalOpen} onOpenChange={setMetaAdsModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Facebook className="w-5 h-5 text-blue-600" />
              Choose Facebook Ads
            </DialogTitle>
            <DialogDescription>
              Select up to 20 Meta Ads to trigger this flow ({selectedMetaAds.length}/20 selected)
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
                        ? "border-blue-500 bg-blue-500/5"
                        : "border-border hover:border-blue-500/50"
                    )}
                  >
                    <Checkbox
                      checked={selectedMetaAds.includes(ad.id)}
                      onCheckedChange={() => handleMetaAdToggle(ad.id)}
                      disabled={!selectedMetaAds.includes(ad.id) && selectedMetaAds.length >= 20}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{ad.name}</p>
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-[10px] px-1.5",
                            ad.status === 'active' 
                              ? "bg-green-500/10 text-green-600 border-green-500/20" 
                              : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                          )}
                        >
                          {ad.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{ad.clicks.toLocaleString()} clicks</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                  </label>
                ))}
                {filteredMetaAds.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Megaphone className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No ads found</p>
                  </div>
                )}
              </div>
            </ScrollArea>
            <Button onClick={() => setMetaAdsModalOpen(false)} className="w-full">
              Done ({selectedMetaAds.length} selected)
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
