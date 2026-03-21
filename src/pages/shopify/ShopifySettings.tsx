import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Settings, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ShopifyPageShell } from '@/components/shopify/ShopifyPageShell';
import { useShopifyStores } from '@/hooks/useShopifyStores';
import { useToast } from '@/hooks/use-toast';

export default function ShopifySettings() {
  const { storeId } = useParams<{ storeId: string }>();
  const { toast } = useToast();
  const { storeSettingsQuery, updateSettings } = useShopifyStores();
  const { data: settings, isLoading } = storeSettingsQuery(storeId);

  const [form, setForm] = useState({
    widget_enabled: true, show_on_home: true, show_on_product: true,
    show_on_collection: false, show_on_cart: true, show_on_checkout: false,
    ai_enabled: false, whatsapp_enabled: false, business_hours_enabled: false,
    default_team: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setForm({
        widget_enabled: settings.widget_enabled, show_on_home: settings.show_on_home,
        show_on_product: settings.show_on_product, show_on_collection: settings.show_on_collection,
        show_on_cart: settings.show_on_cart, show_on_checkout: settings.show_on_checkout,
        ai_enabled: settings.ai_enabled, whatsapp_enabled: settings.whatsapp_enabled,
        business_hours_enabled: settings.business_hours_enabled, default_team: settings.default_team || '',
      });
    }
  }, [settings]);

  const handleSave = async () => {
    if (!storeId) return;
    setSaving(true);
    try {
      await updateSettings({ storeId, settings: form as any });
      toast({ title: 'Settings Saved' });
    } catch (err: any) {
      toast({ title: 'Save Failed', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const toggle = (key: keyof typeof form) => setForm(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <ShopifyPageShell
      title="Store Settings"
      subtitle="Configure widget placement, AI, and messaging options"
      icon={Settings}
      backTo={`/app/integrations/shopify/${storeId}`}
      backLabel="Back to Store"
      isLoading={isLoading}
      maxWidth="sm"
      actions={
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Save
        </Button>
      }
    >
      {/* Widget Placement */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-base">Widget Placement</CardTitle>
          <CardDescription>Control where the chat widget appears on your store</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {([
            ['widget_enabled', 'Widget Enabled'],
            ['show_on_home', 'Home Page'],
            ['show_on_product', 'Product Pages'],
            ['show_on_collection', 'Collection Pages'],
            ['show_on_cart', 'Cart Page'],
            ['show_on_checkout', 'Checkout'],
          ] as const).map(([key, label]) => (
            <div key={key} className="flex items-center justify-between">
              <Label>{label}</Label>
              <Switch checked={form[key] as boolean} onCheckedChange={() => toggle(key)} />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* AI & WhatsApp */}
      <Card className="mb-4">
        <CardHeader><CardTitle className="text-base">AI & Messaging</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {([
            ['ai_enabled', 'AI Auto-reply', 'Enable AI-powered responses for store visitors'],
            ['whatsapp_enabled', 'WhatsApp Integration', 'Allow WhatsApp messaging from store chat'],
            ['business_hours_enabled', 'Business Hours', 'Only show widget during business hours'],
          ] as const).map(([key, label, desc]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <Label>{label}</Label>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
              <Switch checked={form[key] as boolean} onCheckedChange={() => toggle(key)} />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Team Assignment */}
      <Card>
        <CardHeader><CardTitle className="text-base">Default Support Team</CardTitle></CardHeader>
        <CardContent>
          <Input
            placeholder="e.g., support, sales"
            value={form.default_team}
            onChange={(e) => setForm(prev => ({ ...prev, default_team: e.target.value }))}
          />
        </CardContent>
      </Card>
    </ShopifyPageShell>
  );
}
