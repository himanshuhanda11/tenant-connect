import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useShopifyStores } from '@/hooks/useShopifyStores';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import type { StoreSettings as StoreSettingsType } from '@/types/shopify';

export default function ShopifySettings() {
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { storeSettingsQuery, updateSettings } = useShopifyStores();
  const { data: settings, isLoading } = storeSettingsQuery(storeId);

  const [form, setForm] = useState({
    widget_enabled: true,
    show_on_home: true,
    show_on_product: true,
    show_on_collection: false,
    show_on_cart: true,
    show_on_checkout: false,
    ai_enabled: false,
    whatsapp_enabled: false,
    business_hours_enabled: false,
    default_team: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setForm({
        widget_enabled: settings.widget_enabled,
        show_on_home: settings.show_on_home,
        show_on_product: settings.show_on_product,
        show_on_collection: settings.show_on_collection,
        show_on_cart: settings.show_on_cart,
        show_on_checkout: settings.show_on_checkout,
        ai_enabled: settings.ai_enabled,
        whatsapp_enabled: settings.whatsapp_enabled,
        business_hours_enabled: settings.business_hours_enabled,
        default_team: settings.default_team || '',
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

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-6 max-w-3xl space-y-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6 max-w-3xl">
        <Button variant="ghost" size="sm" onClick={() => navigate(`/app/integrations/shopify/${storeId}`)} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Store
        </Button>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Settings className="w-6 h-6 text-primary" />
            Store Settings
          </h1>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save
          </Button>
        </div>

        {/* Widget Placement */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-base">Widget Placement</CardTitle>
            <CardDescription>Control where the chat widget appears on your store</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Widget Enabled</Label>
              <Switch checked={form.widget_enabled} onCheckedChange={() => toggle('widget_enabled')} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Home Page</Label>
              <Switch checked={form.show_on_home} onCheckedChange={() => toggle('show_on_home')} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Product Pages</Label>
              <Switch checked={form.show_on_product} onCheckedChange={() => toggle('show_on_product')} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Collection Pages</Label>
              <Switch checked={form.show_on_collection} onCheckedChange={() => toggle('show_on_collection')} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Cart Page</Label>
              <Switch checked={form.show_on_cart} onCheckedChange={() => toggle('show_on_cart')} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Checkout</Label>
              <Switch checked={form.show_on_checkout} onCheckedChange={() => toggle('show_on_checkout')} />
            </div>
          </CardContent>
        </Card>

        {/* AI & WhatsApp */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-base">AI & Messaging</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>AI Auto-reply</Label>
                <p className="text-xs text-muted-foreground">Enable AI-powered responses for store visitors</p>
              </div>
              <Switch checked={form.ai_enabled} onCheckedChange={() => toggle('ai_enabled')} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>WhatsApp Integration</Label>
                <p className="text-xs text-muted-foreground">Allow WhatsApp messaging from store chat</p>
              </div>
              <Switch checked={form.whatsapp_enabled} onCheckedChange={() => toggle('whatsapp_enabled')} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Business Hours</Label>
                <p className="text-xs text-muted-foreground">Only show widget during business hours</p>
              </div>
              <Switch checked={form.business_hours_enabled} onCheckedChange={() => toggle('business_hours_enabled')} />
            </div>
          </CardContent>
        </Card>

        {/* Team Assignment */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Default Support Team</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="e.g., support, sales"
              value={form.default_team}
              onChange={(e) => setForm(prev => ({ ...prev, default_team: e.target.value }))}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
