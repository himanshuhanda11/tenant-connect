import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Building2, FileText, Instagram, Radio, Phone, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useMetaAdAccounts } from '@/hooks/useMetaAdAccounts';
import type { MetaCampaignDraft, MetaCampaignType } from '@/types/meta-campaign';
import { CAMPAIGN_TYPE_CONFIG } from '@/types/meta-campaign';
import { cn } from '@/lib/utils';

interface StepAssetsProps {
  draft: MetaCampaignDraft;
  updateDraft: (updates: Partial<MetaCampaignDraft>) => void;
}

export function StepAssets({ draft, updateDraft }: StepAssetsProps) {
  const { connectedAccounts } = useMetaAdAccounts();
  const config = CAMPAIGN_TYPE_CONFIG[draft.campaign_type];
  const account = connectedAccounts[0];

  const needsWhatsApp = draft.campaign_type === 'ctwa';

  return (
    <div className="space-y-6">
      {/* Campaign Type Selection */}
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Campaign Type</CardTitle>
          <CardDescription>Choose what kind of ad campaign to create</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(Object.entries(CAMPAIGN_TYPE_CONFIG) as [MetaCampaignType, typeof config][]).map(([key, cfg]) => (
              <button
                key={key}
                onClick={() => updateDraft({ campaign_type: key })}
                className={cn(
                  "relative flex flex-col items-start p-4 rounded-xl border-2 transition-all text-left",
                  draft.campaign_type === key
                    ? "border-primary bg-primary/5 ring-2 ring-primary/10"
                    : "border-border hover:border-primary/30 hover:bg-muted/50"
                )}
              >
                <span className="text-2xl mb-2">{cfg.icon}</span>
                <span className="text-sm font-semibold">{cfg.label}</span>
                <span className="text-xs text-muted-foreground mt-1">{cfg.description}</span>
                {draft.campaign_type === key && (
                  <CheckCircle2 className="absolute top-3 right-3 h-4 w-4 text-primary" />
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Asset Selection */}
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Ad Assets</CardTitle>
          <CardDescription>Select the Meta assets for this campaign</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Ad Account */}
          <div className="space-y-1.5">
            <Label className="text-xs flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
              Ad Account *
            </Label>
            {account ? (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">
                    {account.meta_account_name || `Account ${account.meta_account_id}`}
                  </p>
                  <p className="text-xs text-muted-foreground">{account.meta_account_id}</p>
                </div>
                <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">
                  Connected
                </Badge>
              </div>
            ) : (
              <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/30">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-xs text-amber-700">
                  No ad account connected. Go to Meta Ads Setup first.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Page */}
          <div className="space-y-1.5">
            <Label className="text-xs flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-muted-foreground" />
              Facebook Page *
            </Label>
          {account?.facebook_page_id ? (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">
                    {account.facebook_page_name || 'Facebook Page'}
                  </p>
                  <p className="text-xs text-muted-foreground">{account.facebook_page_id}</p>
                </div>
              </div>
            ) : (
              <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/30">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-xs text-amber-700">
                  No page selected. Configure in Meta Ads Setup.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Instagram (optional) */}
          <div className="space-y-1.5">
            <Label className="text-xs flex items-center gap-1.5">
              <Instagram className="h-3.5 w-3.5 text-muted-foreground" />
              Instagram Account
              <Badge variant="outline" className="text-[9px] px-1.5 py-0">Optional</Badge>
            </Label>
            {account?.instagram_account_id ? (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <p className="text-sm font-medium">@{(account as any).instagram_username || account.instagram_account_id}</p>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground pl-1">Not connected — ads will run on Facebook only.</p>
            )}
          </div>

          {/* WhatsApp - required for CTWA */}
          {needsWhatsApp && (
            <div className="space-y-1.5">
              <Label className="text-xs flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                WhatsApp Number *
              </Label>
              {account?.whatsapp_phone_number_id ? (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">
                      {account.whatsapp_display_number || account.whatsapp_phone_number_id}
                    </p>
                  </div>
                </div>
              ) : (
                <Alert className="border-red-200 bg-red-50 dark:bg-red-950/30">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-xs text-red-700">
                    WhatsApp number is required for Click-to-WhatsApp campaigns. Configure in Meta Ads Setup.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
