import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Image, Video, LayoutGrid, PenLine, Link as LinkIcon, MessageSquare, Info } from 'lucide-react';
import type { MetaCampaignDraft, MetaCampaignType } from '@/types/meta-campaign';
import { CALL_TO_ACTION_OPTIONS, CAMPAIGN_TYPE_CONFIG } from '@/types/meta-campaign';
import { cn } from '@/lib/utils';

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

          {/* Media */}
          <div className="space-y-1.5">
            <Label className="text-xs">Media URL</Label>
            <Input
              value={draft.media_url || ''}
              onChange={e => updateDraft({ media_url: e.target.value })}
              placeholder="https://example.com/image.jpg"
              className="h-10"
            />
            <p className="text-[10px] text-muted-foreground">
              Paste a public URL to your image or video. Recommended: 1080×1080 for feed, 1080×1920 for stories.
            </p>
          </div>
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

      {/* Type-specific fields */}
      {draft.campaign_type === 'website_traffic' && (
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
                className="h-10"
              />
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
      )}

      {draft.campaign_type === 'ctwa' && (
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              WhatsApp Message
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Welcome Message</Label>
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
      )}

      {draft.campaign_type === 'form_leads' && (
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              📋 Instant Form
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Instant Form ID</Label>
              <Input
                value={draft.instant_form_id || ''}
                onChange={e => updateDraft({ instant_form_id: e.target.value })}
                placeholder="Form ID from Meta Lead Ads"
                className="h-10"
              />
              <p className="text-[10px] text-muted-foreground">
                Create your instant form in Meta Ads Manager first, then paste the Form ID here.
              </p>
            </div>
            <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/30">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-xs text-blue-700 dark:text-blue-300">
                Form Leads campaigns require an Instant Form created via Meta Ads Manager. AIREATRO will sync submitted leads automatically.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
