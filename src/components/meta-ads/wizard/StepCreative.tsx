import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Image, Video, LayoutGrid, PenLine, Link as LinkIcon, MessageSquare, Info, AlertTriangle } from 'lucide-react';
import type { MetaCampaignDraft, MetaCampaignType } from '@/types/meta-campaign';
import { CALL_TO_ACTION_OPTIONS, CAMPAIGN_TYPE_CONFIG } from '@/types/meta-campaign';
import { cn } from '@/lib/utils';
import { CtwaFlowSelector } from './creative/CtwaFlowSelector';
import { UtmBuilder } from './creative/UtmBuilder';
import { LeadFormBuilder } from './creative/LeadFormBuilder';
import { MediaUploader } from './MediaUploader';

interface StepCreativeProps {
  draft: MetaCampaignDraft;
  updateDraft: (updates: Partial<MetaCampaignDraft>) => void;
}

const CREATIVE_TYPES = [
  { value: 'single_image', label: 'Single Image', icon: Image },
  { value: 'video', label: 'Video', icon: Video },
  { value: 'carousel', label: 'Carousel', icon: LayoutGrid },
];

export function StepCreative({ draft, updateDraft }: StepCreativeProps) {
  const config = CAMPAIGN_TYPE_CONFIG[draft.campaign_type];
  const ctaOptions = CALL_TO_ACTION_OPTIONS[draft.campaign_type];

  // URL validation for website traffic
  const urlError = draft.campaign_type === 'website_traffic' && draft.destination_url?.trim()
    ? (() => {
        try { new URL(draft.destination_url!); return null; } catch { return 'Invalid URL format'; }
      })()
    : null;

  // Pixel warning for website traffic
  const showPixelWarning = draft.campaign_type === 'website_traffic' && !draft.pixel_id;

  return (
    <div className="space-y-6">
      {/* Ad Name & Format */}
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <PenLine className="h-4 w-4 text-primary" />
            Ad Creative
          </CardTitle>
          <CardDescription>Design your ad content</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Ad Name *</Label>
            <Input
              value={draft.ad_name || ''}
              onChange={e => updateDraft({ ad_name: e.target.value })}
              placeholder="e.g. Image Ad — CTA WhatsApp"
              className="h-10"
            />
          </div>

          {/* Creative Type */}
          <div className="space-y-1.5">
            <Label className="text-xs">Ad Format</Label>
            <div className="grid grid-cols-3 gap-2">
              {CREATIVE_TYPES.map(ct => (
                <button
                  key={ct.value}
                  onClick={() => updateDraft({ creative_type: ct.value })}
                  className={cn(
                    "flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-all",
                    draft.creative_type === ct.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/30"
                  )}
                >
                  <ct.icon className={cn("h-5 w-5", draft.creative_type === ct.value ? "text-primary" : "text-muted-foreground")} />
                  <span className="text-xs font-medium">{ct.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Media Upload */}
          <MediaUploader
            mediaUrl={draft.media_url}
            mediaType={draft.media_type}
            onMediaChange={(url, type) => updateDraft({ media_url: url, media_type: type })}
            onMediaRemove={() => updateDraft({ media_url: undefined, media_type: undefined })}
          />
        </CardContent>
      </Card>

      {/* Copy */}
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Ad Copy</CardTitle>
          <CardDescription>Write compelling ad text</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Primary Text *</Label>
            <Textarea
              value={draft.primary_text || ''}
              onChange={e => updateDraft({ primary_text: e.target.value })}
              placeholder="Main ad body text — what makes your offer compelling?"
              rows={3}
            />
            <p className="text-[10px] text-muted-foreground text-right">
              {(draft.primary_text?.length || 0)} / 125 recommended
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Headline *</Label>
              <Input
                value={draft.headline || ''}
                onChange={e => updateDraft({ headline: e.target.value })}
                placeholder="Bold headline"
                className="h-10"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Description</Label>
              <Input
                value={draft.description || ''}
                onChange={e => updateDraft({ description: e.target.value })}
                placeholder="Optional sub-headline"
                className="h-10"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Call to Action</Label>
            <Select
              value={draft.call_to_action || config.callToAction}
              onValueChange={v => updateDraft({ call_to_action: v })}
            >
              <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
              <SelectContent>
                {ctaOptions.map(cta => (
                  <SelectItem key={cta.value} value={cta.value}>{cta.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* === CTWA-specific === */}
      {draft.campaign_type === 'ctwa' && (
        <>
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                WhatsApp Message
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Greeting / Welcome Message</Label>
                <Textarea
                  value={draft.whatsapp_welcome_message || ''}
                  onChange={e => updateDraft({ whatsapp_welcome_message: e.target.value })}
                  placeholder="Hi! Thanks for reaching out. How can we help?"
                  rows={2}
                />
                <p className="text-[10px] text-muted-foreground">
                  Shown to the user when they open your WhatsApp chat from the ad.
                </p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Pre-filled Message</Label>
                <Input
                  value={draft.whatsapp_message || ''}
                  onChange={e => updateDraft({ whatsapp_message: e.target.value })}
                  placeholder="I'm interested in your summer sale!"
                  className="h-10"
                />
                <p className="text-[10px] text-muted-foreground">
                  Pre-filled in the user's WhatsApp input field.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Flow Selector */}
          <CtwaFlowSelector draft={draft} updateDraft={updateDraft} />

          {/* UTM Tracking */}
          <UtmBuilder draft={draft} updateDraft={updateDraft} title="Click Attribution (UTM)" />
        </>
      )}

      {/* === Website Traffic-specific === */}
      {draft.campaign_type === 'website_traffic' && (
        <>
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <LinkIcon className="h-4 w-4 text-primary" />
                Destination
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Website URL *</Label>
                <Input
                  value={draft.destination_url || ''}
                  onChange={e => updateDraft({ destination_url: e.target.value })}
                  placeholder="https://example.com/landing-page"
                  className={cn("h-10", urlError && "border-destructive")}
                />
                {urlError && (
                  <p className="text-[10px] text-destructive">{urlError}</p>
                )}
                {draft.destination_url && !urlError && (
                  <p className="text-[10px] text-muted-foreground">
                    Domain: <span className="font-medium">{(() => { try { return new URL(draft.destination_url).hostname; } catch { return '—'; } })()}</span>
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Display Link</Label>
                <Input
                  value={draft.display_link || ''}
                  onChange={e => updateDraft({ display_link: e.target.value })}
                  placeholder="example.com"
                  className="h-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Pixel Warning (non-blocking) */}
          {showPixelWarning && (
            <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/30">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-xs text-amber-700 dark:text-amber-300">
                No Meta Pixel selected. Without a pixel, conversion tracking won't work. You can add a pixel in Meta Ads Setup.
              </AlertDescription>
            </Alert>
          )}

          {/* UTM Builder */}
          <UtmBuilder draft={draft} updateDraft={updateDraft} title="UTM Tracking Parameters" />
        </>
      )}

      {/* === Form Leads-specific === */}
      {draft.campaign_type === 'form_leads' && (
        <LeadFormBuilder draft={draft} updateDraft={updateDraft} />
      )}
    </div>
  );
}
