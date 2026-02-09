import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { toast } from 'sonner';

interface AddCampaignDialogProps {
  adAccountId: string;
  onSuccess: () => void;
}

export function AddCampaignDialog({ adAccountId, onSuccess }: AddCampaignDialogProps) {
  const { currentTenant } = useTenant();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    campaignName: '',
    metaCampaignId: '',
    objective: 'MESSAGES',
    status: 'active' as 'active' | 'paused' | 'archived',
    adsetName: '',
    adName: '',
    impressions: '',
    clicks: '',
    spendAmount: '',
    leadsCount: '',
    conversationsStarted: '',
  });

  const handleSave = async () => {
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
          <DialogTitle>Add Campaign Manually</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label>Campaign Name *</Label>
              <Input value={form.campaignName} onChange={e => update('campaignName', e.target.value)} placeholder="e.g. Summer Sale CTWA" />
            </div>
            <div>
              <Label>Meta Campaign ID *</Label>
              <Input value={form.metaCampaignId} onChange={e => update('metaCampaignId', e.target.value)} placeholder="e.g. 23456789" />
            </div>
            <div>
              <Label>Objective</Label>
              <Select value={form.objective} onValueChange={v => update('objective', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="MESSAGES">Messages</SelectItem>
                  <SelectItem value="CONVERSIONS">Conversions</SelectItem>
                  <SelectItem value="TRAFFIC">Traffic</SelectItem>
                  <SelectItem value="LEAD_GENERATION">Lead Generation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => update('status', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Ad Set Name</Label>
              <Input value={form.adsetName} onChange={e => update('adsetName', e.target.value)} placeholder="Optional" />
            </div>
            <div>
              <Label>Ad Name</Label>
              <Input value={form.adName} onChange={e => update('adName', e.target.value)} placeholder="Optional" />
            </div>
          </div>

          <div className="border-t pt-3">
            <p className="text-sm font-medium mb-2 text-muted-foreground">Performance Metrics</p>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Impressions</Label>
                <Input type="number" value={form.impressions} onChange={e => update('impressions', e.target.value)} placeholder="0" />
              </div>
              <div>
                <Label>Clicks</Label>
                <Input type="number" value={form.clicks} onChange={e => update('clicks', e.target.value)} placeholder="0" />
              </div>
              <div>
                <Label>Spend ($)</Label>
                <Input type="number" step="0.01" value={form.spendAmount} onChange={e => update('spendAmount', e.target.value)} placeholder="0.00" />
              </div>
              <div>
                <Label>Leads</Label>
                <Input type="number" value={form.leadsCount} onChange={e => update('leadsCount', e.target.value)} placeholder="0" />
              </div>
              <div>
                <Label>Conversations</Label>
                <Input type="number" value={form.conversationsStarted} onChange={e => update('conversationsStarted', e.target.value)} placeholder="0" />
              </div>
            </div>
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? 'Saving...' : 'Add Campaign'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
