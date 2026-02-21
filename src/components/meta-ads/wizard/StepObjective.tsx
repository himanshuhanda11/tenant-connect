import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { DollarSign, Info, Tag, AlertTriangle, Zap } from 'lucide-react';
import type { MetaCampaignDraft } from '@/types/meta-campaign';
import { CAMPAIGN_TYPE_CONFIG, SPECIAL_AD_CATEGORY_WARNINGS } from '@/types/meta-campaign';

interface StepObjectiveProps {
  draft: MetaCampaignDraft;
  updateDraft: (updates: Partial<MetaCampaignDraft>) => void;
}

const SPECIAL_AD_CATEGORIES = [
  { value: 'NONE', label: 'None' },
  { value: 'CREDIT', label: 'Credit' },
  { value: 'EMPLOYMENT', label: 'Employment' },
  { value: 'HOUSING', label: 'Housing' },
  { value: 'SOCIAL_ISSUES_ELECTIONS_POLITICS', label: 'Social Issues / Elections / Politics' },
];

export function StepObjective({ draft, updateDraft }: StepObjectiveProps) {
  const config = CAMPAIGN_TYPE_CONFIG[draft.campaign_type];
  const selectedCategory = draft.special_ad_categories?.[0] || 'NONE';
  const categoryWarning = SPECIAL_AD_CATEGORY_WARNINGS[selectedCategory];

  return (
    <div className="space-y-6">
      {/* Campaign Name */}
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Campaign Details</CardTitle>
          <CardDescription>Name your campaign and set the objective</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Campaign Name *</Label>
            <Input
              value={draft.campaign_name || ''}
              onChange={e => updateDraft({ campaign_name: e.target.value })}
              placeholder="e.g. Summer Sale 2026 — WhatsApp"
              className="h-10"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Objective</Label>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border">
                <span className="text-lg">{config.icon}</span>
                <div>
                  <p className="text-sm font-medium">{config.objective}</p>
                  <p className="text-[10px] text-muted-foreground">{config.label}</p>
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Buying Type</Label>
              <Select value={draft.buying_type || 'AUCTION'} onValueChange={v => updateDraft({ buying_type: v })}>
                <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="AUCTION">Auction</SelectItem>
                  <SelectItem value="RESERVED">Reserved (Reach & Frequency)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Special Ad Categories */}
          <div className="space-y-1.5">
            <Label className="text-xs flex items-center gap-1.5">
              <Tag className="h-3 w-3 text-muted-foreground" />
              Special Ad Categories
            </Label>
            <Select
              value={selectedCategory}
              onValueChange={v => updateDraft({ special_ad_categories: v === 'NONE' ? [] : [v] })}
            >
              <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
              <SelectContent>
                {SPECIAL_AD_CATEGORIES.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {categoryWarning && (
              <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/30 mt-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-xs text-amber-700 dark:text-amber-300">
                  {categoryWarning}
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* CBO Toggle */}
          <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              <div>
                <Label className="text-xs font-medium">Advantage Campaign Budget (CBO)</Label>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Let Meta automatically distribute budget across ad sets for best results
                </p>
              </div>
            </div>
            <Switch
              checked={draft.cbo_enabled ?? true}
              onCheckedChange={v => updateDraft({ cbo_enabled: v })}
            />
          </div>
          {!draft.cbo_enabled && (
            <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/30">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-xs text-blue-700 dark:text-blue-300">
                With ABO (Ad Set Budget Optimization), you'll control budget at the ad set level instead of campaign level.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Budget */}
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-primary" />
            Budget
          </CardTitle>
          <CardDescription>Set your campaign spending limits</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={draft.budget_type || 'daily'} onValueChange={v => updateDraft({ budget_type: v })}>
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="daily">Daily Budget</TabsTrigger>
              <TabsTrigger value="lifetime">Lifetime Budget</TabsTrigger>
            </TabsList>
            <TabsContent value="daily" className="mt-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Daily Budget (USD) *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    min={1}
                    step={0.01}
                    value={draft.daily_budget || ''}
                    onChange={e => updateDraft({ daily_budget: parseFloat(e.target.value) || undefined })}
                    placeholder="20.00"
                    className="h-10 pl-9"
                  />
                </div>
                <p className="text-[10px] text-muted-foreground">Meta recommends at least $5/day for optimal delivery</p>
              </div>
            </TabsContent>
            <TabsContent value="lifetime" className="mt-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Lifetime Budget (USD) *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    min={1}
                    step={0.01}
                    value={draft.lifetime_budget || ''}
                    onChange={e => updateDraft({ lifetime_budget: parseFloat(e.target.value) || undefined })}
                    placeholder="500.00"
                    className="h-10 pl-9"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/30">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-xs text-blue-700 dark:text-blue-300">
              All billing is handled by Meta. Budget set here will be submitted to Meta Ads Manager when published.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
