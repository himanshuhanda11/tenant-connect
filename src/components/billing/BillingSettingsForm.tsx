import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useBillingSettings } from '@/hooks/useBilling';
import { toast } from 'sonner';

const countries = [
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'IN', name: 'India' },
];

export function BillingSettingsForm() {
  const { data: settings, isLoading } = useBillingSettings();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success('Billing settings saved');
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Company Details */}
      <Card>
        <CardHeader>
          <CardTitle>Company Details</CardTitle>
          <CardDescription>
            This information will appear on your invoices
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 px-4 sm:px-6">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="business_name" className="text-sm">Business Name</Label>
              <Input 
                id="business_name" 
                defaultValue={settings?.business_name || ''} 
                placeholder="Your company name"
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="billing_email" className="text-sm">Billing Email</Label>
              <Input 
                id="billing_email" 
                type="email"
                defaultValue={settings?.billing_email || ''} 
                placeholder="billing@company.com"
                className="h-10"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address_line1">Address Line 1</Label>
            <Input 
              id="address_line1" 
              defaultValue={settings?.address_line1 || ''} 
              placeholder="Street address"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address_line2">Address Line 2</Label>
            <Input 
              id="address_line2" 
              defaultValue={settings?.address_line2 || ''} 
              placeholder="Apartment, suite, etc."
            />
          </div>
          
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="city" className="text-sm">City</Label>
              <Input 
                id="city" 
                defaultValue={settings?.city || ''} 
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state" className="text-sm">State/Province</Label>
              <Input 
                id="state" 
                defaultValue={settings?.state || ''} 
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postal_code" className="text-sm">Postal Code</Label>
              <Input 
                id="postal_code" 
                defaultValue={settings?.postal_code || ''} 
                className="h-10"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Select defaultValue={settings?.country || 'AE'}>
              <SelectTrigger>
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country.code} value={country.code}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tax Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Tax Settings</CardTitle>
          <CardDescription>
            Configure tax and VAT settings for your invoices
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tax_id">Tax ID / TRN / VAT Number</Label>
            <Input 
              id="tax_id" 
              defaultValue={settings?.tax_id || ''} 
              placeholder="Enter your tax identification number"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable VAT</Label>
              <p className="text-sm text-muted-foreground">
                Add VAT to your invoices
              </p>
            </div>
            <Switch defaultChecked={settings?.vat_enabled} />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="vat_percentage">VAT Percentage</Label>
            <Input 
              id="vat_percentage" 
              type="number"
              defaultValue={settings?.vat_percentage || 5} 
              className="w-32"
            />
          </div>
        </CardContent>
      </Card>

      {/* Invoice Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice Notes</CardTitle>
          <CardDescription>
            Add custom notes to appear on all invoices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea 
            defaultValue={settings?.invoice_notes || ''} 
            placeholder="Thank you for your business!"
            rows={3}
          />
        </CardContent>
      </Card>

      {/* Enforcement Mode */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Enforcement</CardTitle>
          <CardDescription>
            How to handle usage when limits are reached
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select defaultValue={settings?.enforcement_mode || 'soft'}>
            <SelectTrigger className="w-full md:w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="soft">
                <div>
                  <div className="font-medium">Soft Limit</div>
                  <div className="text-xs text-muted-foreground">Allow but show warnings</div>
                </div>
              </SelectItem>
              <SelectItem value="hard">
                <div>
                  <div className="font-medium">Hard Limit</div>
                  <div className="text-xs text-muted-foreground">Block actions at limit</div>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}
