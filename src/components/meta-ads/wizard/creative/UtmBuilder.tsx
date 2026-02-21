import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Link2, ChevronDown, ChevronUp } from 'lucide-react';
import type { MetaCampaignDraft } from '@/types/meta-campaign';

interface UtmBuilderProps {
  draft: MetaCampaignDraft;
  updateDraft: (updates: Partial<MetaCampaignDraft>) => void;
  title?: string;
}

export function UtmBuilder({ draft, updateDraft, title = 'UTM Tracking' }: UtmBuilderProps) {
  const [isExpanded, setIsExpanded] = useState(
    !!(draft.utm_source || draft.utm_medium || draft.utm_campaign)
  );

  const previewUrl = (() => {
    const base = draft.destination_url || 'https://example.com';
    const params = new URLSearchParams();
    if (draft.utm_source) params.set('utm_source', draft.utm_source);
    if (draft.utm_medium) params.set('utm_medium', draft.utm_medium);
    if (draft.utm_campaign) params.set('utm_campaign', draft.utm_campaign);
    if (draft.utm_content) params.set('utm_content', draft.utm_content);
    if (draft.utm_term) params.set('utm_term', draft.utm_term);
    const qs = params.toString();
    return qs ? `${base}${base.includes('?') ? '&' : '?'}${qs}` : base;
  })();

  return (
    <Card className="border-0 shadow-md">
      <CardHeader className="pb-2">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full text-left"
        >
          <CardTitle className="text-base flex items-center gap-2">
            <Link2 className="h-4 w-4 text-primary" />
            {title}
          </CardTitle>
          {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </button>
      </CardHeader>
      {isExpanded && (
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Source</Label>
              <Input
                value={draft.utm_source || ''}
                onChange={e => updateDraft({ utm_source: e.target.value })}
                placeholder="facebook"
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Medium</Label>
              <Input
                value={draft.utm_medium || ''}
                onChange={e => updateDraft({ utm_medium: e.target.value })}
                placeholder="cpc"
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Campaign</Label>
              <Input
                value={draft.utm_campaign || ''}
                onChange={e => updateDraft({ utm_campaign: e.target.value })}
                placeholder={draft.campaign_name?.toLowerCase().replace(/\s+/g, '-') || 'summer-sale'}
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Content</Label>
              <Input
                value={draft.utm_content || ''}
                onChange={e => updateDraft({ utm_content: e.target.value })}
                placeholder="ad-variant-a"
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-1 col-span-2">
              <Label className="text-[10px] text-muted-foreground">Term</Label>
              <Input
                value={draft.utm_term || ''}
                onChange={e => updateDraft({ utm_term: e.target.value })}
                placeholder="keyword"
                className="h-9 text-xs"
              />
            </div>
          </div>
          {(draft.utm_source || draft.utm_medium || draft.utm_campaign) && (
            <div className="p-2 rounded bg-muted/50 border">
              <p className="text-[10px] text-muted-foreground mb-1">Preview URL:</p>
              <p className="text-[10px] font-mono break-all text-foreground">{previewUrl}</p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
