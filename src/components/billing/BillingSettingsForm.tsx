import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Building2, Mail, MapPin, FileText, Shield, Save, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const countries = [
  { code: 'IN', name: 'India' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'SG', name: 'Singapore' },
  { code: 'AU', name: 'Australia' },
  { code: 'DE', name: 'Germany' },
];

interface BillingData {
  business_name: string;
  billing_email: string;
  billing_address: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };
  tax_id: string;
  vat_enabled: boolean;
  vat_percentage: number;
  invoice_notes: string;
  enforcement_mode: string;
}

export function BillingSettingsForm() {
  const { currentTenant } = useTenant();
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState<BillingData>({
    business_name: '',
    billing_email: '',
    billing_address: {},
    tax_id: '',
    vat_enabled: false,
    vat_percentage: 0,
    invoice_notes: '',
    enforcement_mode: 'soft',
  });

  const { data: settings, isLoading } = useQuery({
    queryKey: ['billing-settings-db', currentTenant?.id],
    queryFn: async () => {
      if (!currentTenant?.id) return null;
      const { data, error } = await supabase
        .from('tenants')
        .select('name, billing_email, billing_address, tax_id, vat_enabled, vat_percentage, invoice_notes, enforcement_mode')
        .eq('id', currentTenant.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!currentTenant?.id,
  });

  useEffect(() => {
    if (settings) {
      const addr = (settings.billing_address as any) || {};
      setForm({
        business_name: settings.name || '',
        billing_email: settings.billing_email || '',
        billing_address: addr,
        tax_id: settings.tax_id || '',
        vat_enabled: settings.vat_enabled || false,
        vat_percentage: settings.vat_percentage || 0,
        invoice_notes: settings.invoice_notes || '',
        enforcement_mode: settings.enforcement_mode || 'soft',
      });
    }
  }, [settings]);

  const handleSave = async () => {
    if (!currentTenant?.id) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('tenants')
        .update({
          billing_email: form.billing_email || null,
          billing_address: form.billing_address,
          tax_id: form.tax_id || null,
          vat_enabled: form.vat_enabled,
          vat_percentage: form.vat_percentage,
          invoice_notes: form.invoice_notes || null,
          enforcement_mode: form.enforcement_mode,
        })
        .eq('id', currentTenant.id);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['billing-settings-db'] });
      toast.success('Billing settings saved');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const updateAddress = (key: string, value: string) => {
    setForm(f => ({ ...f, billing_address: { ...f.billing_address, [key]: value } }));
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader><Skeleton className="h-5 w-32" /></CardHeader>
          <CardContent className="space-y-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Company Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="h-4 w-4 text-primary" /> Company Details
          </CardTitle>
          <CardDescription className="text-xs">This information appears on your invoices</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="business_name" className="text-xs">Business Name</Label>
              <Input
                id="business_name"
                value={form.business_name}
                onChange={(e) => setForm(f => ({ ...f, business_name: e.target.value }))}
                placeholder="Your company name"
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="billing_email" className="text-xs">Billing Email</Label>
              <Input
                id="billing_email"
                type="email"
                value={form.billing_email}
                onChange={(e) => setForm(f => ({ ...f, billing_email: e.target.value }))}
                placeholder="billing@company.com"
                className="h-9"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Address Line 1</Label>
            <Input
              value={form.billing_address.line1 || ''}
              onChange={(e) => updateAddress('line1', e.target.value)}
              placeholder="Street address"
              className="h-9"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Address Line 2</Label>
            <Input
              value={form.billing_address.line2 || ''}
              onChange={(e) => updateAddress('line2', e.target.value)}
              placeholder="Apartment, suite, etc."
              className="h-9"
            />
          </div>

          <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
            <div className="space-y-1.5">
              <Label className="text-xs">City</Label>
              <Input value={form.billing_address.city || ''} onChange={(e) => updateAddress('city', e.target.value)} className="h-9" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">State</Label>
              <Input value={form.billing_address.state || ''} onChange={(e) => updateAddress('state', e.target.value)} className="h-9" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Postal Code</Label>
              <Input value={form.billing_address.postal_code || ''} onChange={(e) => updateAddress('postal_code', e.target.value)} className="h-9" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Country</Label>
              <Select value={form.billing_address.country || 'IN'} onValueChange={(v) => updateAddress('country', v)}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {countries.map(c => <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tax Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-4 w-4 text-primary" /> Tax Settings
          </CardTitle>
          <CardDescription className="text-xs">Configure tax and GST/VAT for invoices</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Tax ID / GSTIN / VAT Number</Label>
            <Input
              value={form.tax_id}
              onChange={(e) => setForm(f => ({ ...f, tax_id: e.target.value }))}
              placeholder="e.g. 22AAAAA0000A1Z5"
              className="h-9"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
            <div>
              <Label className="text-sm font-medium">Enable GST/VAT</Label>
              <p className="text-[10px] text-muted-foreground mt-0.5">Add tax line item to invoices</p>
            </div>
            <Switch
              checked={form.vat_enabled}
              onCheckedChange={(v) => setForm(f => ({ ...f, vat_enabled: v }))}
            />
          </div>

          {form.vat_enabled && (
            <div className="space-y-1.5">
              <Label className="text-xs">Tax Rate (%)</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={form.vat_percentage}
                onChange={(e) => setForm(f => ({ ...f, vat_percentage: Number(e.target.value) }))}
                className="h-9 w-32"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invoice Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4 text-primary" /> Invoice Notes
          </CardTitle>
          <CardDescription className="text-xs">Custom notes appearing on all invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={form.invoice_notes}
            onChange={(e) => setForm(f => ({ ...f, invoice_notes: e.target.value }))}
            placeholder="Thank you for your business!"
            rows={3}
            className="text-sm"
          />
        </CardContent>
      </Card>

      {/* Enforcement Mode */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-4 w-4 text-primary" /> Usage Enforcement
          </CardTitle>
          <CardDescription className="text-xs">How to handle usage when limits are reached</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={form.enforcement_mode} onValueChange={(v) => setForm(f => ({ ...f, enforcement_mode: v }))}>
            <SelectTrigger className="w-full sm:w-64 h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="soft">
                <div>
                  <div className="font-medium text-sm">Soft Limit</div>
                  <div className="text-[10px] text-muted-foreground">Allow but show warnings</div>
                </div>
              </SelectItem>
              <SelectItem value="hard">
                <div>
                  <div className="font-medium text-sm">Hard Limit</div>
                  <div className="text-[10px] text-muted-foreground">Block actions at limit</div>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving} className="gap-2">
          {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}
