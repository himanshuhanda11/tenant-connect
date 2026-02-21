import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, AlertCircle, Info, DollarSign, Users, Target, PenLine, Megaphone } from 'lucide-react';
import type { MetaCampaignDraft } from '@/types/meta-campaign';
import { CAMPAIGN_TYPE_CONFIG, CALL_TO_ACTION_OPTIONS } from '@/types/meta-campaign';
import { cn } from '@/lib/utils';

interface StepReviewProps {
  draft: MetaCampaignDraft;
  validateStep: (step: number) => { valid: boolean; errors: string[] };
}

function ReviewRow({ label, value, icon }: { label: string; value?: string | number | null; icon?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between py-2">
      <span className="text-xs text-muted-foreground flex items-center gap-1.5">
        {icon}
        {label}
      </span>
      <span className="text-sm font-medium text-right max-w-[60%] truncate">
        {value || <span className="text-muted-foreground/50 italic">Not set</span>}
      </span>
    </div>
  );
}

export function StepReview({ draft, validateStep }: StepReviewProps) {
  const config = CAMPAIGN_TYPE_CONFIG[draft.campaign_type];
  const allErrors: string[] = [];
  for (let i = 1; i <= 4; i++) {
    const { errors } = validateStep(i);
    allErrors.push(...errors);
  }
  const isReady = allErrors.length === 0;

  const ctaLabel = CALL_TO_ACTION_OPTIONS[draft.campaign_type]
    ?.find(c => c.value === draft.call_to_action)?.label || draft.call_to_action;

  return (
    <div className="space-y-6">
      {/* Status */}
      {isReady ? (
        <Alert className="border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <AlertDescription className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">
            Campaign is ready to publish! Review the details below before submitting.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="border-red-200 bg-red-50 dark:bg-red-950/30">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-sm text-red-700 dark:text-red-300">
            <p className="font-medium mb-1">Please fix these issues before publishing:</p>
            <ul className="list-disc list-inside space-y-0.5 text-xs">
              {allErrors.map((e, i) => <li key={i}>{e}</li>)}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Campaign Overview */}
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex items-center justify-center w-10 h-10 rounded-xl text-xl",
              "bg-primary/10"
            )}>
              {config.icon}
            </div>
            <div>
              <CardTitle className="text-base">{draft.campaign_name || 'Untitled Campaign'}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-0.5">
                <Badge variant="outline" className="text-[10px]">{config.label}</Badge>
                <span className="text-xs">{config.objective}</span>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Budget & Objective */}
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-1">
            <CardTitle className="text-sm flex items-center gap-1.5">
              <DollarSign className="h-3.5 w-3.5 text-primary" />
              Budget & Objective
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y">
            <ReviewRow label="Buying Type" value={draft.buying_type} />
            <ReviewRow label="Budget Type" value={draft.budget_type === 'daily' ? 'Daily' : 'Lifetime'} />
            <ReviewRow
              label="Budget"
              value={draft.budget_type === 'daily'
                ? draft.daily_budget ? `$${draft.daily_budget}/day` : undefined
                : draft.lifetime_budget ? `$${draft.lifetime_budget}` : undefined
              }
            />
            <ReviewRow label="Optimization" value={draft.optimization_goal} />
            <ReviewRow label="Bid Strategy" value={draft.bid_strategy?.replace('_', ' ')} />
          </CardContent>
        </Card>

        {/* Audience */}
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-1">
            <CardTitle className="text-sm flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-primary" />
              Audience
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y">
            <ReviewRow label="Ad Set" value={draft.adset_name} />
            <ReviewRow label="Age" value={`${draft.age_min || 18} — ${draft.age_max || 65}+`} />
            <ReviewRow label="Gender" value={draft.genders?.length ? draft.genders[0] : 'All'} />
            <ReviewRow
              label="Locations"
              value={(draft.locations as { name: string }[] || []).map(l => l.name).join(', ') || 'All'}
            />
            <ReviewRow label="Placements" value={draft.placements === 'automatic' ? 'Advantage+' : 'Manual'} />
          </CardContent>
        </Card>

        {/* Creative */}
        <Card className="border-0 shadow-md md:col-span-2">
          <CardHeader className="pb-1">
            <CardTitle className="text-sm flex items-center gap-1.5">
              <PenLine className="h-3.5 w-3.5 text-primary" />
              Creative
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y">
            <ReviewRow label="Ad Name" value={draft.ad_name} />
            <ReviewRow label="Format" value={draft.creative_type?.replace('_', ' ')} />
            <ReviewRow label="Headline" value={draft.headline} />
            <ReviewRow label="Primary Text" value={draft.primary_text} />
            <ReviewRow label="CTA" value={ctaLabel} />
            {draft.campaign_type === 'website_traffic' && (
              <ReviewRow label="Destination URL" value={draft.destination_url} />
            )}
            {draft.campaign_type === 'ctwa' && (
              <ReviewRow label="WhatsApp Welcome" value={draft.whatsapp_welcome_message} />
            )}
            {draft.campaign_type === 'form_leads' && (
              <ReviewRow label="Instant Form ID" value={draft.instant_form_id} />
            )}
          </CardContent>
        </Card>
      </div>

      <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/30">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-xs text-blue-700 dark:text-blue-300">
          Publishing will submit this campaign to Meta Ads Manager via the API. All billing is handled by Meta. You can pause or edit it later from the Ads Manager.
        </AlertDescription>
      </Alert>
    </div>
  );
}
