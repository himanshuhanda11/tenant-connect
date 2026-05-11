import { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Loader2, Save, ExternalLink, MessageCircle, X, Calendar, BarChart3, MousePointerClick, Eye } from 'lucide-react';
import { SupportWidgetSettings, buildWaLink } from '@/lib/supportWidget';
import { cn } from '@/lib/utils';

const DEFAULTS: Partial<SupportWidgetSettings> = {
  position: 'bottom-right',
  brand_color: '#25D366',
};

export default function AdminSupportWidget() {
  const { role, readOnly } = useOutletContext<{ role: string; readOnly: boolean }>();
  const isSuper = role === 'super_admin';
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SupportWidgetSettings | null>(null);
  const [stats, setStats] = useState<{
    views: number; clicks: number; iconViews: number; fullViews: number; iconClicks: number; fullClicks: number;
  }>({ views: 0, clicks: 0, iconViews: 0, fullViews: 0, iconClicks: 0, fullClicks: 0 });

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('support_widget_settings' as any)
      .select('*')
      .eq('id', 'global')
      .maybeSingle();
    if (data) setSettings(data as unknown as SupportWidgetSettings);

    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { data: events } = await supabase
      .from('support_widget_events' as any)
      .select('event_type, widget_mode')
      .gte('created_at', since);
    if (events) {
      const e = events as unknown as Array<{ event_type: string; widget_mode: string }>;
      setStats({
        views: e.filter((x) => x.event_type === 'view').length,
        clicks: e.filter((x) => x.event_type === 'click').length,
        iconViews: e.filter((x) => x.event_type === 'view' && x.widget_mode === 'icon_only').length,
        fullViews: e.filter((x) => x.event_type === 'view' && x.widget_mode === 'full_widget').length,
        iconClicks: e.filter((x) => x.event_type === 'click' && x.widget_mode === 'icon_only').length,
        fullClicks: e.filter((x) => x.event_type === 'click' && x.widget_mode === 'full_widget').length,
      });
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const update = <K extends keyof SupportWidgetSettings>(key: K, value: SupportWidgetSettings[K]) => {
    setSettings((s) => (s ? { ...s, [key]: value } : s));
  };

  const save = async () => {
    if (!settings || !isSuper) return;
    setSaving(true);
    const { error } = await supabase
      .from('support_widget_settings' as any)
      .update({ ...settings, updated_at: new Date().toISOString() })
      .eq('id', 'global');
    setSaving(false);
    if (error) {
      toast({ title: 'Save failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Saved', description: 'Support widget settings updated.' });
      try { localStorage.removeItem('aireatro_support_widget_settings_v1'); } catch {}
    }
  };

  const ctr = useMemo(() => stats.views ? Math.round((stats.clicks / stats.views) * 1000) / 10 : 0, [stats]);

  if (loading || !settings) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  const disabled = readOnly || !isSuper;
  const testHref = buildWaLink(settings.whatsapp_number, settings.prefilled_message_new);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Support Widget Control</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Aireatro internal support WhatsApp widget — separate from customer workspace widgets.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <a href={testHref} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3.5 w-3.5 mr-1.5" /> Test on WhatsApp
            </a>
          </Button>
          <Button size="sm" onClick={save} disabled={disabled || saving}>
            {saving ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Save className="h-3.5 w-3.5 mr-1.5" />}
            Save & Publish
          </Button>
        </div>
      </div>

      {/* Analytics — real data from support_widget_events (last 30 days) */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <StatCard icon={Eye} label="Total views" value={stats.views} />
        <StatCard icon={MousePointerClick} label="Total clicks" value={stats.clicks} />
        <StatCard icon={BarChart3} label="CTR" value={`${ctr}%`} />
        <StatCard icon={Eye} label="Icon views" value={stats.iconViews} />
        <StatCard icon={MousePointerClick} label="Icon clicks" value={stats.iconClicks} />
        <StatCard icon={Eye} label="Full views" value={stats.fullViews} />
        <StatCard icon={MousePointerClick} label="Full clicks" value={stats.fullClicks} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Settings */}
        <Card className="lg:col-span-3 rounded-2xl border-border/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Configuration</CardTitle>
              <div className="flex items-center gap-2">
                <Label htmlFor="enabled" className="text-xs text-muted-foreground">Enabled globally</Label>
                <Switch id="enabled" checked={settings.enabled} onCheckedChange={(v) => update('enabled', v)} disabled={disabled} />
              </div>
            </div>
            <CardDescription className="text-xs">Only super admins can edit this.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="general">
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="appearance">Style</TabsTrigger>
                <TabsTrigger value="visibility">Visibility</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-4 pt-4">
                <Field label="WhatsApp Support Number (E.164)">
                  <Input value={settings.whatsapp_number} onChange={(e) => update('whatsapp_number', e.target.value)} placeholder="+919999999999" disabled={disabled} />
                </Field>
                <Field label="Display Name">
                  <Input value={settings.display_name} onChange={(e) => update('display_name', e.target.value)} disabled={disabled} />
                </Field>
                <Field label="Welcome Message">
                  <Input value={settings.welcome_message} onChange={(e) => update('welcome_message', e.target.value)} disabled={disabled} />
                </Field>
              </TabsContent>

              <TabsContent value="content" className="space-y-4 pt-4">
                <Field label="Full Widget Title">
                  <Input value={settings.full_widget_title} onChange={(e) => update('full_widget_title', e.target.value)} disabled={disabled} />
                </Field>
                <Field label="Full Widget Subtitle">
                  <Textarea rows={2} value={settings.full_widget_subtitle} onChange={(e) => update('full_widget_subtitle', e.target.value)} disabled={disabled} />
                </Field>
                <Field label="Full Widget Body Message">
                  <Textarea rows={2} value={settings.full_widget_message} onChange={(e) => update('full_widget_message', e.target.value)} disabled={disabled} />
                </Field>
                <Field label="CTA Button Text">
                  <Input value={settings.cta_text} onChange={(e) => update('cta_text', e.target.value)} disabled={disabled} />
                </Field>
                <Field label="Icon-only tooltip">
                  <Input value={settings.icon_only_tooltip} onChange={(e) => update('icon_only_tooltip', e.target.value)} disabled={disabled} />
                </Field>
                <Field label="Prefilled message (paid users)" hint="Vars: {{email}} {{workspace}} {{plan}}">
                  <Textarea rows={2} value={settings.prefilled_message_paid} onChange={(e) => update('prefilled_message_paid', e.target.value)} disabled={disabled} />
                </Field>
                <Field label="Prefilled message (new / free users)">
                  <Textarea rows={2} value={settings.prefilled_message_new} onChange={(e) => update('prefilled_message_new', e.target.value)} disabled={disabled} />
                </Field>
              </TabsContent>

              <TabsContent value="appearance" className="space-y-4 pt-4">
                <Field label="Brand color (hex)">
                  <div className="flex gap-2 items-center">
                    <Input value={settings.brand_color} onChange={(e) => update('brand_color', e.target.value)} disabled={disabled} className="max-w-[180px]" />
                    <div className="h-10 w-10 rounded-lg border border-border/60" style={{ backgroundColor: settings.brand_color }} />
                  </div>
                </Field>
                <Field label="Position">
                  <div className="flex gap-2">
                    {(['bottom-right','bottom-left'] as const).map((p) => (
                      <Button key={p} type="button" variant={settings.position === p ? 'default' : 'outline'}
                        size="sm" onClick={() => update('position', p)} disabled={disabled}>
                        {p === 'bottom-right' ? 'Bottom Right' : 'Bottom Left'}
                      </Button>
                    ))}
                  </div>
                </Field>
                <ToggleRow label="Show 'Contact Us' button in full widget" checked={settings.show_book_demo} onChange={(v) => update('show_book_demo', v)} disabled={disabled} />
              </TabsContent>

              <TabsContent value="visibility" className="space-y-2 pt-4">
                <SectionLabel>Pre-chat lead capture</SectionLabel>
                <ToggleRow label="Ask for name & mobile before opening WhatsApp" checked={settings.collect_lead_before_chat} onChange={(v) => update('collect_lead_before_chat', v)} disabled={disabled} />
                <div className="px-1 pt-2 grid grid-cols-1 gap-3">
                  <Field label="Step 1 — Name question">
                    <Input value={settings.step_name_label} onChange={(e) => update('step_name_label', e.target.value)} disabled={disabled} />
                  </Field>
                  <Field label="Name placeholder">
                    <Input value={settings.step_name_placeholder} onChange={(e) => update('step_name_placeholder', e.target.value)} disabled={disabled} />
                  </Field>
                  <Field label="Step 2 — Phone question">
                    <Input value={settings.step_phone_label} onChange={(e) => update('step_phone_label', e.target.value)} disabled={disabled} />
                  </Field>
                  <Field label="Phone placeholder">
                    <Input value={settings.step_phone_placeholder} onChange={(e) => update('step_phone_placeholder', e.target.value)} disabled={disabled} />
                  </Field>
                  <Field label="Connect message (shown right before WhatsApp opens)">
                    <Input value={settings.step_connect_message} onChange={(e) => update('step_connect_message', e.target.value)} disabled={disabled} />
                  </Field>
                </div>
                <SectionLabel>Where it shows</SectionLabel>
                <ToggleRow label="Public marketing site" checked={settings.show_on_public_site} onChange={(v) => update('show_on_public_site', v)} disabled={disabled} />
                <ToggleRow label="Inside Dashboard / app" checked={settings.show_inside_dashboard} onChange={(v) => update('show_inside_dashboard', v)} disabled={disabled} />
                <ToggleRow label="Inside Onboarding" checked={settings.show_inside_onboarding} onChange={(v) => update('show_inside_onboarding', v)} disabled={disabled} />
                <ToggleRow label="Inside Billing page" checked={settings.show_inside_billing} onChange={(v) => update('show_inside_billing', v)} disabled={disabled} />
                <SectionLabel>Who sees it</SectionLabel>
                <ToggleRow label="Paid / active users (compact icon)" checked={settings.show_for_paid_users} onChange={(v) => update('show_for_paid_users', v)} disabled={disabled} />
                <ToggleRow label="Free / anonymous users (full widget)" checked={settings.show_for_free_users} onChange={(v) => update('show_for_free_users', v)} disabled={disabled} />
                <ToggleRow label="Incomplete onboarding users (full widget)" checked={settings.show_for_incomplete_users} onChange={(v) => update('show_for_incomplete_users', v)} disabled={disabled} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Live preview */}
        <Card className="lg:col-span-2 rounded-2xl border-border/50 lg:sticky lg:top-6 self-start">
          <CardHeader>
            <CardTitle className="text-base">Live Preview</CardTitle>
            <CardDescription className="text-xs">Both widget modes shown for reference.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-2">
                <Badge variant="outline" className="rounded-full text-[9px] h-4">Paid users</Badge>
                Compact icon
              </div>
              <div className="rounded-2xl bg-muted/40 border border-border/50 p-6 flex justify-end">
                <div
                  className="h-14 w-14 rounded-full shadow-md flex items-center justify-center text-white"
                  style={{ backgroundColor: settings.brand_color }}
                >
                  <MessageCircle className="h-6 w-6" strokeWidth={2.4} />
                </div>
              </div>
            </div>

            <div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-2">
                <Badge variant="outline" className="rounded-full text-[9px] h-4">New / free</Badge>
                Full widget
              </div>
              <div className="rounded-2xl bg-muted/40 border border-border/50 p-4">
                <div className="rounded-2xl bg-background border border-border/60 shadow-lg overflow-hidden">
                  <div className="px-4 pt-4 pb-3 text-white relative" style={{ backgroundColor: settings.brand_color }}>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center">
                        <MessageCircle className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold flex items-center gap-1.5">
                          {settings.display_name}
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 ring-2 ring-white/30" />
                        </div>
                        <div className="text-[10px] opacity-90">Typically replies in minutes</div>
                      </div>
                    </div>
                  </div>
                  <div className="px-4 py-3 space-y-2">
                    <div className="text-sm font-semibold">{settings.full_widget_title}</div>
                    <div className="text-xs text-muted-foreground leading-relaxed">{settings.full_widget_subtitle}</div>
                    <div className="rounded-lg bg-muted/60 px-2.5 py-2 text-[11px] text-muted-foreground border border-border/50">
                      {settings.full_widget_message}
                    </div>
                  </div>
                  <div className="px-4 pb-4 space-y-2">
                    <div className="w-full h-9 rounded-lg text-xs font-semibold text-white flex items-center justify-center gap-1.5"
                      style={{ backgroundColor: settings.brand_color }}>
                      <MessageCircle className="h-3.5 w-3.5" /> {settings.cta_text}
                    </div>
                    {settings.show_book_demo && (
                      <div className="w-full h-9 rounded-lg text-xs font-medium border border-border/60 text-foreground flex items-center justify-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" /> Contact Us
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium">{label}</Label>
      {children}
      {hint && <p className="text-[10px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

function ToggleRow({ label, checked, onChange, disabled }: { label: string; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-xl px-3 py-2.5 hover:bg-muted/30 transition-colors">
      <span className="text-sm">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} disabled={disabled} />
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-3 mb-1 px-3">{children}</div>;
}

function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: number | string }) {
  return (
    <Card className="rounded-2xl border-border/50">
      <CardContent className="pt-4 pb-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <Icon className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">{label}</div>
            <div className="text-lg font-semibold tracking-tight">{value}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
