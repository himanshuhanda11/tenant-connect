import { useState } from 'react';
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
} from 'lucide-react';
import { toast } from 'sonner';

export default function MetaAdsSettings() {
  const [settings, setSettings] = useState({
    trackingEnabled: true,
    defaultTags: ['Meta Lead'],
    defaultTeam: 'sales',
    defaultAgent: '',
    attributionWindow: '7_days',
    enforceOptIn: true,
    marketingConsentRequired: true,
    autoSyncEnabled: true,
    syncInterval: 60,
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    toast.success('Settings saved successfully');
  };

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
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Meta Ads Settings</h1>
              <p className="text-sm text-muted-foreground">
                Configure tracking, defaults, and compliance options
              </p>
            </div>
          </div>
          <Button onClick={handleSave} disabled={isSaving} className="gap-2 shadow-lg shadow-primary/25 w-full sm:w-auto text-sm">
            {isSaving ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Changes
          </Button>
        </div>

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
                checked={settings.trackingEnabled}
                onCheckedChange={(checked) => setSettings({ ...settings, trackingEnabled: checked })}
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
                checked={settings.autoSyncEnabled}
                onCheckedChange={(checked) => setSettings({ ...settings, autoSyncEnabled: checked })}
              />
            </div>

            {settings.autoSyncEnabled && (
              <div className="space-y-2 pl-4 sm:pl-6 border-l-2">
                <Label className="text-sm">Sync Interval</Label>
                <Select
                  value={settings.syncInterval.toString()}
                  onValueChange={(value) => setSettings({ ...settings, syncInterval: parseInt(value) })}
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
                {settings.defaultTags.map((tag, idx) => (
                  <Badge key={idx} variant="secondary" className="gap-1 pr-1 text-xs sm:text-sm">
                    {tag}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 hover:bg-transparent"
                      onClick={() => setSettings({
                        ...settings,
                        defaultTags: settings.defaultTags.filter((_, i) => i !== idx)
                      })}
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
                      setSettings({
                        ...settings,
                        defaultTags: [...settings.defaultTags, e.currentTarget.value]
                      });
                      e.currentTarget.value = '';
                    }
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">Default Team Assignment</Label>
                <Select
                  value={settings.defaultTeam}
                  onValueChange={(value) => setSettings({ ...settings, defaultTeam: value })}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select team" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sales">Sales Team</SelectItem>
                    <SelectItem value="support">Support Team</SelectItem>
                    <SelectItem value="vip">VIP Team</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Default Attribution Window</Label>
                <Select
                  value={settings.attributionWindow}
                  onValueChange={(value) => setSettings({ ...settings, attributionWindow: value })}
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
                checked={settings.enforceOptIn}
                onCheckedChange={(checked) => setSettings({ ...settings, enforceOptIn: checked })}
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
                checked={settings.marketingConsentRequired}
                onCheckedChange={(checked) => setSettings({ ...settings, marketingConsentRequired: checked })}
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-xl bg-muted/50 border gap-3 sm:gap-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-100 dark:bg-blue-900/50 flex-shrink-0">
                  <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm sm:text-base">AIREATRO Business</p>
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">Ad Account: act_123456789</p>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-auto sm:ml-0">
                <Badge className="bg-emerald-100 text-emerald-700 text-xs">Connected</Badge>
                <Button variant="outline" size="sm" asChild className="text-xs sm:text-sm h-8">
                  <a href="https://business.facebook.com/settings" target="_blank" rel="noopener noreferrer" className="gap-1.5 sm:gap-2">
                    Manage
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              </div>
            </div>

            <Button variant="destructive" className="mt-4 gap-2 w-full sm:w-auto text-sm">
              <Trash2 className="h-4 w-4" />
              Disconnect Meta Account
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
