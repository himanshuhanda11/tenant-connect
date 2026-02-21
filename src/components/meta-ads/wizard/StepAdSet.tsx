import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Users, MapPin, Target, Calendar, Crosshair, Globe, LayoutGrid } from 'lucide-react';
import type { MetaCampaignDraft } from '@/types/meta-campaign';
import { CAMPAIGN_TYPE_CONFIG, MANUAL_PLACEMENT_OPTIONS } from '@/types/meta-campaign';
import { TargetingSearchInput } from './TargetingSearchInput';

interface StepAdSetProps {
  draft: MetaCampaignDraft;
  updateDraft: (updates: Partial<MetaCampaignDraft>) => void;
}

const OPTIMIZATION_GOALS: Record<string, { value: string; label: string; description: string }[]> = {
  ctwa: [
    { value: 'CONVERSATIONS', label: 'Conversations', description: 'Maximize WhatsApp conversations' },
    { value: 'LINK_CLICKS', label: 'Link Clicks', description: 'Maximize ad clicks' },
    { value: 'IMPRESSIONS', label: 'Impressions', description: 'Maximize ad reach' },
  ],
  website_traffic: [
    { value: 'LINK_CLICKS', label: 'Link Clicks', description: 'Maximize visits to your website' },
    { value: 'LANDING_PAGE_VIEWS', label: 'Landing Page Views', description: 'Maximize actual page loads' },
    { value: 'IMPRESSIONS', label: 'Impressions', description: 'Show to as many people as possible' },
  ],
  form_leads: [
    { value: 'LEAD_GENERATION', label: 'Leads', description: 'Maximize form submissions' },
    { value: 'QUALITY_LEAD', label: 'Quality Leads', description: 'Focus on higher quality leads' },
    { value: 'LINK_CLICKS', label: 'Link Clicks', description: 'Maximize clicks to form' },
  ],
};

export function StepAdSet({ draft, updateDraft }: StepAdSetProps) {
  const config = CAMPAIGN_TYPE_CONFIG[draft.campaign_type];
  const goals = OPTIMIZATION_GOALS[draft.campaign_type] || OPTIMIZATION_GOALS.ctwa;
  const isRestricted = (draft.special_ad_categories || []).some(c => ['CREDIT', 'EMPLOYMENT', 'HOUSING'].includes(c));

  const togglePlacement = (placement: string) => {
    const current = draft.manual_placements || [];
    const next = current.includes(placement)
      ? current.filter(p => p !== placement)
      : [...current, placement];
    updateDraft({ manual_placements: next });
  };

  return (
    <div className="space-y-6">
      {/* Ad Set Name & Optimization */}
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Ad Set Configuration</CardTitle>
          <CardDescription>Define targeting, optimization, and scheduling</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Ad Set Name *</Label>
            <Input
              value={draft.adset_name || ''}
              onChange={e => updateDraft({ adset_name: e.target.value })}
              placeholder="e.g. UAE Women 25-44"
              className="h-10"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs flex items-center gap-1.5">
                <Target className="h-3 w-3 text-muted-foreground" />
                Optimization Goal
              </Label>
              <Select
                value={draft.optimization_goal || config.optimizationGoal}
                onValueChange={v => updateDraft({ optimization_goal: v })}
              >
                <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {goals.map(g => (
                    <SelectItem key={g.value} value={g.value}>
                      <div>
                        <span>{g.label}</span>
                        <span className="text-muted-foreground text-xs ml-2">— {g.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Bid Strategy</Label>
              <Select value={draft.bid_strategy || 'lowest_cost'} onValueChange={v => updateDraft({ bid_strategy: v })}>
                <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="lowest_cost">Lowest Cost</SelectItem>
                  <SelectItem value="cost_cap">Cost Cap</SelectItem>
                  <SelectItem value="bid_cap">Bid Cap</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audience Targeting */}
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            Audience
          </CardTitle>
          <CardDescription>Define who sees your ads</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Age */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Age Range</Label>
              {isRestricted ? (
                <Badge variant="outline" className="text-[10px] border-amber-200 text-amber-700 bg-amber-50">
                  Restricted by Special Ad Category
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs">
                  {draft.age_min || 18} — {draft.age_max || 65}+
                </Badge>
              )}
            </div>
            {!isRestricted && (
              <div className="px-1">
                <Slider
                  value={[draft.age_min || 18, draft.age_max || 65]}
                  min={13}
                  max={65}
                  step={1}
                  onValueChange={([min, max]) => updateDraft({ age_min: min, age_max: max })}
                />
              </div>
            )}
          </div>

          {/* Gender */}
          {!isRestricted && (
            <div className="space-y-1.5">
              <Label className="text-xs">Gender</Label>
              <Select
                value={draft.genders?.[0] || 'all'}
                onValueChange={v => updateDraft({ genders: v === 'all' ? [] : [v] })}
              >
                <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Genders</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Locations - Search from Meta API */}
          <div className="space-y-1.5">
            <Label className="text-xs flex items-center gap-1.5">
              <MapPin className="h-3 w-3 text-muted-foreground" />
              Locations
            </Label>
            {draft.ad_account_id ? (
              <TargetingSearchInput
                searchType="geo"
                adAccountId={draft.ad_account_id}
                selectedItems={(draft.locations as any[]) || []}
                onChange={items => updateDraft({ locations: items })}
                placeholder="Search countries, cities, regions..."
              />
            ) : (
              <p className="text-xs text-muted-foreground p-3 border rounded-lg bg-muted/30">
                Connect an Ad Account in Step 1 to search locations
              </p>
            )}
          </div>

          {/* Languages - Search from Meta API */}
          <div className="space-y-1.5">
            <Label className="text-xs flex items-center gap-1.5">
              <Globe className="h-3 w-3 text-muted-foreground" />
              Languages
            </Label>
            {draft.ad_account_id ? (
              <TargetingSearchInput
                searchType="locale"
                adAccountId={draft.ad_account_id}
                selectedItems={(draft.languages as any[] || []).map(l => typeof l === 'string' ? { key: l, name: l } : l)}
                onChange={items => updateDraft({ languages: items as any })}
                placeholder="Search languages..."
              />
            ) : (
              <p className="text-xs text-muted-foreground p-3 border rounded-lg bg-muted/30">
                Connect an Ad Account in Step 1 to search languages
              </p>
            )}
          </div>

          {/* Interests - Search from Meta API */}
          <div className="space-y-1.5">
            <Label className="text-xs flex items-center gap-1.5">
              <Crosshair className="h-3 w-3 text-muted-foreground" />
              Interests
            </Label>
            {draft.ad_account_id ? (
              <TargetingSearchInput
                searchType="interests"
                adAccountId={draft.ad_account_id}
                selectedItems={(draft.interests as any[]) || []}
                onChange={items => updateDraft({ interests: items })}
                placeholder="Search interests (e.g. Fashion, Travel)..."
              />
            ) : (
              <p className="text-xs text-muted-foreground p-3 border rounded-lg bg-muted/30">
                Connect an Ad Account in Step 1 to search interests
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Placements & Schedule */}
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            Placements & Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-xs">Advantage+ Placements</Label>
              <p className="text-[10px] text-muted-foreground mt-0.5">Let Meta optimize where your ads show</p>
            </div>
            <Switch
              checked={draft.placements === 'automatic'}
              onCheckedChange={v => updateDraft({ placements: v ? 'automatic' : 'manual' })}
            />
          </div>

          {/* Manual Placements */}
          {draft.placements === 'manual' && (
            <div className="space-y-2 p-3 rounded-lg border bg-muted/30">
              <Label className="text-xs flex items-center gap-1.5">
                <LayoutGrid className="h-3 w-3 text-muted-foreground" />
                Manual Placements *
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {MANUAL_PLACEMENT_OPTIONS.map(p => (
                  <label key={p.value} className="flex items-center gap-2 text-xs cursor-pointer">
                    <Checkbox
                      checked={(draft.manual_placements || []).includes(p.value)}
                      onCheckedChange={() => togglePlacement(p.value)}
                    />
                    {p.label}
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Start Date</Label>
              <Input
                type="datetime-local"
                value={draft.schedule_start?.slice(0, 16) || ''}
                onChange={e => updateDraft({ schedule_start: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
                className="h-10"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">End Date (optional)</Label>
              <Input
                type="datetime-local"
                value={draft.schedule_end?.slice(0, 16) || ''}
                onChange={e => updateDraft({ schedule_end: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
                className="h-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
