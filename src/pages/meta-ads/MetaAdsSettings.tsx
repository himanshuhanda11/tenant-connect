import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Settings,
  Save,
  Shield,
  Tag,
  Users,
  Clock,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Trash2,
  ExternalLink,
  Info,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMetaAdAccounts } from '@/hooks/useMetaAdAccounts';
import { useTeams } from '@/hooks/useTeam';

export default function MetaAdsSettings() {
  const { currentTenant } = useTenant();
  const queryClient = useQueryClient();
  const { connectedAccounts, isConnected } = useMetaAdAccounts();
  const { teams } = useTeams();

  const [trackingEnabled, setTrackingEnabled] = useState(true);
  const [defaultTags, setDefaultTags] = useState<string[]>(['Meta Lead']);
  const [defaultTeamId, setDefaultTeamId] = useState('');
  const [attributionWindow, setAttributionWindow] = useState('7_days');
  const [enforceOptIn, setEnforceOptIn] = useState(true);
  const [marketingConsentRequired, setMarketingConsentRequired] = useState(true);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);
  const [syncInterval, setSyncInterval] = useState(60);
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch settings from DB
  const { data: settingsRow, isLoading } = useQuery({
    queryKey: ['meta-ads-settings', currentTenant?.id],
    queryFn: async () => {
      if (!currentTenant?.id) return null;
      const { data, error } = await supabase
        .from('smeksh_meta_ads_settings')
        .select('*')
        .eq('workspace_id', currentTenant.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!currentTenant?.id,
  });

  // Populate form from DB
  useEffect(() => {
    if (settingsRow) {
      setTrackingEnabled(settingsRow.tracking_enabled ?? true);
      setDefaultTags((settingsRow.default_tags as string[]) || ['Meta Lead']);
      setDefaultTeamId(settingsRow.default_assigned_team_id || '');
      setAttributionWindow(settingsRow.default_attribution_window || '7_days');
      setEnforceOptIn(settingsRow.enforce_opt_in ?? true);
      setMarketingConsentRequired(settingsRow.marketing_consent_required ?? true);
      setAutoSyncEnabled(settingsRow.auto_sync_enabled ?? true);
      setSyncInterval(settingsRow.sync_interval_minutes ?? 60);
      setHasChanges(false);
    }
  }, [settingsRow]);

  const markChanged = () => setHasChanges(true);

  // Save mutation (upsert)
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!currentTenant?.id) throw new Error('No workspace');
      const typedWindow = attributionWindow as '1_day' | '7_days' | '28_days';
      const payload = {
        workspace_id: currentTenant.id,
        tracking_enabled: trackingEnabled,
        default_tags: defaultTags,
        default_assigned_team_id: defaultTeamId || null,
        default_attribution_window: typedWindow,
        enforce_opt_in: enforceOptIn,
        marketing_consent_required: marketingConsentRequired,
        auto_sync_enabled: autoSyncEnabled,
        sync_interval_minutes: syncInterval,
      };
      if (settingsRow?.id) {
        const { error } = await supabase
          .from('smeksh_meta_ads_settings')
          .update(payload)
          .eq('id', settingsRow.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('smeksh_meta_ads_settings')
          .insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meta-ads-settings'] });
      setHasChanges(false);
      toast.success('Settings saved successfully');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to save settings'),
  });

  const connectedAccount = connectedAccounts[0];

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center justify-center w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-slate-500 to-slate-600 shadow-lg shadow-slate-500/25">
              <Settings className="h-5 w-5 sm:h-7 sm:w-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Ads Settings</h1>
              <p className="text-sm text-muted-foreground">
                Configure tracking, defaults, and compliance options
              </p>
            </div>
          </div>
          <Button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending || !hasChanges}
            className="gap-2 shadow-lg shadow-primary/25 w-full sm:w-auto text-sm"
          >
            {saveMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Changes
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Compliance Notice */}
            <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/30">
              <Shield className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-xs sm:text-sm text-blue-700 dark:text-blue-300">
                <strong>Compliance Notice:</strong> AIREATRO does not create or modify ads. All advertising actions remain within Meta Ads Manager.
                We only read performance data and track leads for attribution.
              </AlertDescription>
            </Alert>

            {/* Tracking Settings */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="px-4 sm:px-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <RefreshCw className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  Tracking & Sync
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">Control how Meta Ads data is synced</CardDescription>
              </CardHeader>
              <CardContent className="px-4 sm:px-6 space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                  <div className="flex-1">
                    <Label className="text-sm sm:text-base">Enable Meta Ads Tracking</Label>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Track leads and attribute contacts from Meta Ads
                    </p>
                  </div>
                  <Switch
                    checked={trackingEnabled}
                    onCheckedChange={(checked) => { setTrackingEnabled(checked); markChanged(); }}
                  />
                </div>

                <Separator />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                  <div className="flex-1">
                    <Label className="text-sm sm:text-base">Auto-Sync Enabled</Label>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Automatically sync campaign data from Meta
                    </p>
                  </div>
                  <Switch
                    checked={autoSyncEnabled}
                    onCheckedChange={(checked) => { setAutoSyncEnabled(checked); markChanged(); }}
                  />
                </div>

                {autoSyncEnabled && (
                  <div className="space-y-2 pl-4 sm:pl-6 border-l-2">
                    <Label className="text-sm">Sync Interval</Label>
                    <Select
                      value={syncInterval.toString()}
                      onValueChange={(value) => { setSyncInterval(parseInt(value)); markChanged(); }}
                    >
                      <SelectTrigger className="w-full sm:w-48 h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">Every 15 minutes</SelectItem>
                        <SelectItem value="30">Every 30 minutes</SelectItem>
                        <SelectItem value="60">Every hour</SelectItem>
                        <SelectItem value="360">Every 6 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Default Lead Handling */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="px-4 sm:px-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Tag className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  Default Lead Handling
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">Set defaults for new ad leads</CardDescription>
              </CardHeader>
              <CardContent className="px-4 sm:px-6 space-y-4 sm:space-y-6">
                <div className="space-y-2">
                  <Label className="text-sm">Default Tags for Ad Leads</Label>
                  <div className="flex flex-wrap gap-2 p-2.5 sm:p-3 border rounded-lg bg-muted/30">
                    {defaultTags.map((tag, idx) => (
                      <Badge key={idx} variant="secondary" className="gap-1 pr-1 text-xs sm:text-sm">
                        {tag}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 hover:bg-transparent"
                          onClick={() => {
                            setDefaultTags(defaultTags.filter((_, i) => i !== idx));
                            markChanged();
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                    <Input
                      placeholder="Add tag..."
                      className="w-24 sm:w-32 h-7 text-xs sm:text-sm"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.currentTarget.value) {
                          setDefaultTags([...defaultTags, e.currentTarget.value]);
                          e.currentTarget.value = '';
                          markChanged();
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Default Team Assignment</Label>
                    <Select
                      value={defaultTeamId || 'none'}
                      onValueChange={(value) => { setDefaultTeamId(value === 'none' ? '' : value); markChanged(); }}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select team" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">— No default team —</SelectItem>
                        {teams.map(t => (
                          <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Default Attribution Window</Label>
                    <Select
                      value={attributionWindow}
                      onValueChange={(value) => { setAttributionWindow(value); markChanged(); }}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1_day">1 Day</SelectItem>
                        <SelectItem value="7_days">7 Days</SelectItem>
                        <SelectItem value="28_days">28 Days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Compliance Settings */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="px-4 sm:px-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  Compliance & Consent
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">Ensure GDPR and marketing compliance</CardDescription>
              </CardHeader>
              <CardContent className="px-4 sm:px-6 space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                  <div className="flex-1">
                    <Label className="text-sm sm:text-base">Enforce Opt-In</Label>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Require opt-in before sending marketing messages to ad leads
                    </p>
                  </div>
                  <Switch
                    checked={enforceOptIn}
                    onCheckedChange={(checked) => { setEnforceOptIn(checked); markChanged(); }}
                  />
                </div>

                <Separator />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                  <div className="flex-1">
                    <Label className="text-sm sm:text-base">Marketing Consent Required</Label>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Collect explicit consent before adding to marketing campaigns
                    </p>
                  </div>
                  <Switch
                    checked={marketingConsentRequired}
                    onCheckedChange={(checked) => { setMarketingConsentRequired(checked); markChanged(); }}
                  />
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-xs sm:text-sm">
                    These settings help ensure compliance with GDPR, CCPA, and WhatsApp policies.
                    Ad leads will be marked for consent collection automatically.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Connected Account */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="px-4 sm:px-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  Connected Account
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">Your linked Meta Ads account</CardDescription>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                {connectedAccount ? (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-xl bg-muted/50 border gap-3 sm:gap-4">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex-shrink-0">
                        <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm sm:text-base">
                          {connectedAccount.facebook_page_name || 'Meta Business Account'}
                        </p>
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">
                          Ad Account: {connectedAccount.meta_account_id || 'N/A'}
                        </p>
                        {connectedAccount.facebook_page_name && (
                          <p className="text-xs text-muted-foreground">Page: {connectedAccount.facebook_page_name}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-auto sm:ml-0">
                      <Badge className="bg-emerald-100 text-emerald-700 text-xs">Connected</Badge>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-6 rounded-xl bg-muted/30 border border-dashed gap-3">
                    <AlertCircle className="h-8 w-8 text-muted-foreground" />
                    <p className="text-sm font-medium">No Meta Account Connected</p>
                    <p className="text-xs text-muted-foreground text-center">
                      Go to the Setup page to connect your Meta Ads account first.
                    </p>
                    <Button variant="outline" size="sm" asChild>
                      <a href="/meta-ads/setup">Go to Setup</a>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}