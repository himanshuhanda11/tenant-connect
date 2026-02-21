import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Plus, RefreshCw, Loader2, Info, Megaphone, BarChart3, PenLine, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface AddCampaignDialogProps {
  adAccountId: string;
  onSuccess: () => void;
}

interface FetchedCampaign {
  id: string;
  name: string;
  objective: string;
  status: string;
  start_time?: string;
  stop_time?: string;
  selected?: boolean;
}

export function AddCampaignDialog({ adAccountId, onSuccess }: AddCampaignDialogProps) {
  const { currentTenant } = useTenant();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('sync');

  // Sync tab state
  const [isSyncing, setIsSyncing] = useState(false);
  const [fetchedCampaigns, setFetchedCampaigns] = useState<FetchedCampaign[]>([]);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Manual tab state
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    campaignName: '', metaCampaignId: '', objective: 'MESSAGES',
    status: 'active' as 'active' | 'paused' | 'archived',
    adsetName: '', adName: '',
    impressions: '', clicks: '', spendAmount: '',
    leadsCount: '', conversationsStarted: '',
  });

  const handleFetchFromMeta = async () => {
    if (!currentTenant?.id) return;
    setIsSyncing(true);
    setSyncError(null);
    setFetchedCampaigns([]);

    try {
      const { data, error } = await supabase.functions.invoke('meta-ads-sync', {
        body: { tenantId: currentTenant.id },
      });

      if (error) throw new Error('Sync function error');
      if (data?.error && !data?.synced) throw new Error(data.error);

      toast.success(`Synced ${data?.synced || 0} campaigns from Meta`);
      onSuccess();
      setOpen(false);
    } catch (err: any) {
      setSyncError(err.message || 'Failed to fetch campaigns from Meta');
      toast.error(err.message || 'Failed to sync');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleManualSave = async () => {
    if (!currentTenant?.id || !form.campaignName || !form.metaCampaignId) {
      toast.error('Campaign name and Meta Campaign ID are required');
      return;
    }

    setSaving(true);
    const { error } = await supabase.from('smeksh_meta_ad_campaigns').insert({
      workspace_id: currentTenant.id,
      ad_account_id: adAccountId,
      meta_campaign_id: form.metaCampaignId,
      campaign_name: form.campaignName,
      campaign_objective: form.objective,
      status: form.status,
      adset_name: form.adsetName || null,
      ad_name: form.adName || null,
      impressions: parseInt(form.impressions) || 0,
      clicks: parseInt(form.clicks) || 0,
      spend_amount: parseFloat(form.spendAmount) || 0,
      leads_count: parseInt(form.leadsCount) || 0,
      conversations_started: parseInt(form.conversationsStarted) || 0,
    });

    setSaving(false);
    if (error) {
      toast.error('Failed to add campaign: ' + error.message);
    } else {
      toast.success('Campaign added successfully');
      setForm({
        campaignName: '', metaCampaignId: '', objective: 'MESSAGES', status: 'active',
        adsetName: '', adName: '', impressions: '', clicks: '', spendAmount: '',
        leadsCount: '', conversationsStarted: '',
      });
      setOpen(false);
      onSuccess();
    }
  };

  const update = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          Add Campaign
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-primary" />
            Add Campaigns
          </DialogTitle>
          <DialogDescription>Sync from Meta API or add manually</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="sync" className="gap-1.5 text-xs sm:text-sm">
              <RefreshCw className="h-3.5 w-3.5" />
              Sync from Meta
            </TabsTrigger>
            <TabsTrigger value="manual" className="gap-1.5 text-xs sm:text-sm">
              <PenLine className="h-3.5 w-3.5" />
              Manual Entry
            </TabsTrigger>
          </TabsList>

          {/* Sync Tab */}
          <TabsContent value="sync" className="mt-4 space-y-4">
            <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/30">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-xs text-blue-700 dark:text-blue-300">
                This will fetch all campaigns from your connected Meta Ad Account and sync their performance data (impressions, clicks, spend, leads).
              </AlertDescription>
            </Alert>

            <Button
              onClick={handleFetchFromMeta}
              disabled={isSyncing}
              className="w-full gap-2 h-11"
            >
              {isSyncing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              {isSyncing ? 'Syncing campaigns...' : 'Sync All Campaigns from Meta'}
            </Button>

            {syncError && (
              <Alert className="border-red-200 bg-red-50 dark:bg-red-950/30">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-xs text-red-700 dark:text-red-300">
                  {syncError}
                </AlertDescription>
              </Alert>
            )}

            <p className="text-xs text-muted-foreground text-center">
              Campaigns are upserted — existing data will be updated, new campaigns will be added.
            </p>
          </TabsContent>

          {/* Manual Tab */}
          <TabsContent value="manual" className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label className="text-xs">Campaign Name *</Label>
                <Input value={form.campaignName} onChange={e => update('campaignName', e.target.value)} placeholder="e.g. Summer Sale CTWA" className="h-9 mt-1" />
              </div>
              <div>
                <Label className="text-xs">Meta Campaign ID *</Label>
                <Input value={form.metaCampaignId} onChange={e => update('metaCampaignId', e.target.value)} placeholder="e.g. 23456789" className="h-9 mt-1" />
              </div>
              <div>
                <Label className="text-xs">Objective</Label>
                <Select value={form.objective} onValueChange={v => update('objective', v)}>
                  <SelectTrigger className="h-9 mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MESSAGES">Messages</SelectItem>
                    <SelectItem value="CONVERSIONS">Conversions</SelectItem>
                    <SelectItem value="TRAFFIC">Traffic</SelectItem>
                    <SelectItem value="LEAD_GENERATION">Lead Generation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Status</Label>
                <Select value={form.status} onValueChange={v => update('status', v)}>
                  <SelectTrigger className="h-9 mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Ad Set Name</Label>
                <Input value={form.adsetName} onChange={e => update('adsetName', e.target.value)} placeholder="Optional" className="h-9 mt-1" />
              </div>
              <div>
                <Label className="text-xs">Ad Name</Label>
                <Input value={form.adName} onChange={e => update('adName', e.target.value)} placeholder="Optional" className="h-9 mt-1" />
              </div>
            </div>

            <Separator />

            <div>
              <p className="text-xs font-medium mb-2 text-muted-foreground flex items-center gap-1">
                <BarChart3 className="h-3 w-3" /> Performance Metrics
              </p>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs">Impressions</Label>
                  <Input type="number" value={form.impressions} onChange={e => update('impressions', e.target.value)} placeholder="0" className="h-9 mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Clicks</Label>
                  <Input type="number" value={form.clicks} onChange={e => update('clicks', e.target.value)} placeholder="0" className="h-9 mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Spend ($)</Label>
                  <Input type="number" step="0.01" value={form.spendAmount} onChange={e => update('spendAmount', e.target.value)} placeholder="0.00" className="h-9 mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Leads</Label>
                  <Input type="number" value={form.leadsCount} onChange={e => update('leadsCount', e.target.value)} placeholder="0" className="h-9 mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Conversations</Label>
                  <Input type="number" value={form.conversationsStarted} onChange={e => update('conversationsStarted', e.target.value)} placeholder="0" className="h-9 mt-1" />
                </div>
              </div>
            </div>

            <Button onClick={handleManualSave} disabled={saving} className="w-full gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              {saving ? 'Saving...' : 'Add Campaign'}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
