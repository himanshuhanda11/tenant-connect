import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { MessageCircle, Sparkles, Code2, Copy, Check, ArrowRight, Zap, BarChart3, Users, Shield, Smartphone, Monitor, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { WidgetPreview } from '@/components/widgets/WidgetPreview';
import { DEFAULT_WIDGET_CONFIG, type WidgetConfig } from '@/types/widget';
import { toast } from '@/hooks/use-toast';

export default function WhatsAppWidgetPublic() {
  const [phone, setPhone] = useState('');
  const [config, setConfig] = useState<WidgetConfig>({
    ...DEFAULT_WIDGET_CONFIG,
    brandName: 'Your Brand',
    greeting: 'Hi 👋\nHow can we help you today?',
    ctaText: 'Chat on WhatsApp',
    prefilledMessage: 'Hello! I came from your website.',
  });
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [copied, setCopied] = useState(false);

  const cleanPhone = phone.replace(/[^\d]/g, '');
  const waLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(config.prefilledMessage || '')}`;

  const snippet = useMemo(() => {
    const cfgJson = JSON.stringify({ phone: cleanPhone, ...config }, null, 2);
    return `<!-- Aireatro WhatsApp Widget -->
<script>
  window.AireatroWidget = ${cfgJson};
</script>
<script async src="https://aireatro.com/widget-lite.js"></script>`;
  }, [cleanPhone, config]);

  const copy = async () => {
    await navigator.clipboard.writeText(snippet);
    setCopied(true);
    toast({ title: 'Snippet copied', description: 'Paste it before </body> on your website.' });
    setTimeout(() => setCopied(false), 1800);
  };

  const update = (patch: Partial<WidgetConfig>) => setConfig((c) => ({ ...c, ...patch }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      <Helmet>
        <title>Free WhatsApp Chat Widget for Website | Aireatro</title>
        <meta name="description" content="Create a beautiful WhatsApp chat button for your website in under 2 minutes. Free generator, no signup required. Capture leads instantly." />
        <link rel="canonical" href="https://aireatro.com/whatsapp-widget" />
      </Helmet>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(152_60%_45%/0.15),transparent_60%)]" />
        <div className="container relative mx-auto px-4 pt-20 pb-12 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-4 py-1.5 text-sm backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>100% Free · No signup required</span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="mt-6 text-4xl md:text-6xl font-bold tracking-tight">
            WhatsApp Chat Widget
            <span className="block bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 bg-clip-text text-transparent">for your website</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mx-auto mt-5 max-w-2xl text-base md:text-lg text-muted-foreground">
            Customize your widget live, copy the snippet, paste it into your site. Setup in less than 2 minutes — no developer needed.
          </motion.p>
        </div>
      </section>

      {/* Builder */}
      <section className="container mx-auto px-4 py-10 md:py-16">
        <div className="grid lg:grid-cols-[1fr,1.1fr] gap-8 items-start">
          {/* Controls */}
          <Card className="p-6 border-border/60 bg-card/60 backdrop-blur">
            <Tabs defaultValue="basics" className="w-full">
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="basics"><Zap className="h-4 w-4 mr-1.5" />Basics</TabsTrigger>
                <TabsTrigger value="style"><Palette className="h-4 w-4 mr-1.5" />Style</TabsTrigger>
                <TabsTrigger value="message"><MessageCircle className="h-4 w-4 mr-1.5" />Message</TabsTrigger>
              </TabsList>

              <TabsContent value="basics" className="space-y-4 mt-5">
                <div>
                  <Label>WhatsApp number (with country code)</Label>
                  <Input placeholder="+91 98765 43210" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1.5" />
                  <p className="text-xs text-muted-foreground mt-1">Digits only — e.g. 919876543210</p>
                </div>
                <div>
                  <Label>Brand name</Label>
                  <Input value={config.brandName ?? ''} onChange={(e) => update({ brandName: e.target.value })} className="mt-1.5" />
                </div>
                <div>
                  <Label>Subtitle / status line</Label>
                  <Input value={config.subtitle ?? ''} onChange={(e) => update({ subtitle: e.target.value })} className="mt-1.5" />
                </div>
                <div>
                  <Label>Position</Label>
                  <div className="grid grid-cols-2 gap-2 mt-1.5">
                    {(['bottom-right','bottom-left'] as const).map((p) => (
                      <button key={p} onClick={() => update({ position: p })} className={`rounded-lg border px-3 py-2 text-sm transition ${config.position===p ? 'border-primary bg-primary/10' : 'border-border hover:bg-muted'}`}>{p === 'bottom-right' ? 'Bottom right' : 'Bottom left'}</button>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="style" className="space-y-4 mt-5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Primary color</Label>
                    <div className="flex items-center gap-2 mt-1.5">
                      <input type="color" value={config.primaryColor} onChange={(e) => update({ primaryColor: e.target.value })} className="h-10 w-12 rounded border border-border" />
                      <Input value={config.primaryColor} onChange={(e) => update({ primaryColor: e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <Label>Accent color</Label>
                    <div className="flex items-center gap-2 mt-1.5">
                      <input type="color" value={config.accentColor} onChange={(e) => update({ accentColor: e.target.value })} className="h-10 w-12 rounded border border-border" />
                      <Input value={config.accentColor} onChange={(e) => update({ accentColor: e.target.value })} />
                    </div>
                  </div>
                </div>
                <div>
                  <Label>Corner radius: {config.radius}px</Label>
                  <input type="range" min={0} max={32} value={config.radius} onChange={(e) => update({ radius: Number(e.target.value) })} className="w-full mt-2" />
                </div>
                <div>
                  <Label>Animation</Label>
                  <div className="grid grid-cols-3 gap-2 mt-1.5">
                    {(['pulse','glow','bounce','float','none'] as const).map((a) => (
                      <button key={a} onClick={() => update({ animation: a })} className={`rounded-lg border px-2 py-2 text-xs capitalize transition ${config.animation===a ? 'border-primary bg-primary/10' : 'border-border hover:bg-muted'}`}>{a}</button>
                    ))}
                  </div>
                </div>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={!!config.darkMode} onChange={(e) => update({ darkMode: e.target.checked })} />
                  Dark mode
                </label>
              </TabsContent>

              <TabsContent value="message" className="space-y-4 mt-5">
                <div>
                  <Label>Greeting</Label>
                  <Textarea rows={3} value={config.greeting ?? ''} onChange={(e) => update({ greeting: e.target.value })} className="mt-1.5" />
                </div>
                <div>
                  <Label>CTA button text</Label>
                  <Input value={config.ctaText ?? ''} onChange={(e) => update({ ctaText: e.target.value })} className="mt-1.5" />
                </div>
                <div>
                  <Label>Pre-filled WhatsApp message</Label>
                  <Textarea rows={3} value={config.prefilledMessage ?? ''} onChange={(e) => update({ prefilledMessage: e.target.value })} className="mt-1.5" />
                </div>
              </TabsContent>
            </Tabs>
          </Card>

          {/* Preview */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Live preview</h3>
              <div className="inline-flex rounded-lg border border-border bg-background p-0.5">
                <button onClick={() => setDevice('desktop')} className={`px-3 py-1.5 text-xs rounded-md inline-flex items-center gap-1.5 ${device==='desktop' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}><Monitor className="h-3.5 w-3.5" />Desktop</button>
                <button onClick={() => setDevice('mobile')} className={`px-3 py-1.5 text-xs rounded-md inline-flex items-center gap-1.5 ${device==='mobile' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}><Smartphone className="h-3.5 w-3.5" />Mobile</button>
              </div>
            </div>
            <WidgetPreview widget={{ name: config.brandName || 'Brand', whatsapp_number: cleanPhone, config }} device={device} />
          </div>
        </div>

        {/* Output */}
        <div className="grid md:grid-cols-2 gap-6 mt-12">
          <Card className="p-5 border-border/60">
            <div className="flex items-center gap-2 mb-3">
              <MessageCircle className="h-4 w-4 text-emerald-500" />
              <h4 className="font-semibold">Direct WhatsApp link</h4>
            </div>
            <div className="rounded-lg bg-muted/60 p-3 text-xs font-mono break-all">{cleanPhone ? waLink : 'Enter your WhatsApp number above…'}</div>
            <Button variant="outline" className="mt-3 w-full" disabled={!cleanPhone} onClick={() => { navigator.clipboard.writeText(waLink); toast({ title: 'Link copied' }); }}>Copy link</Button>
          </Card>
          <Card className="p-5 border-border/60">
            <div className="flex items-center gap-2 mb-3">
              <Code2 className="h-4 w-4 text-emerald-500" />
              <h4 className="font-semibold">Embed snippet</h4>
            </div>
            <div className="rounded-lg bg-muted/60 p-3 text-xs font-mono whitespace-pre-wrap max-h-40 overflow-auto">{snippet}</div>
            <Button className="mt-3 w-full" disabled={!cleanPhone} onClick={copy}>
              {copied ? <><Check className="h-4 w-4 mr-1.5" />Copied</> : <><Copy className="h-4 w-4 mr-1.5" />Copy snippet</>}
            </Button>
          </Card>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border/40 bg-muted/20">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Want analytics, leads & A/B testing?</h2>
            <p className="text-muted-foreground mt-3">Sign up free and unlock the full Aireatro Widget Builder — track every click, capture leads into a CRM, and run experiments.</p>
          </div>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { icon: BarChart3, title: 'Real-time analytics', desc: 'Views, clicks & conversion rate per page.' },
              { icon: Users, title: 'Lead capture & CRM', desc: 'Auto-collect name, phone & email into your inbox.' },
              { icon: Sparkles, title: 'AI greetings & A/B tests', desc: 'Generate copy, split traffic, optimize live.' },
              { icon: Shield, title: 'Geo + UTM rules', desc: 'Show different messages by country or source.' },
            ].map((f) => (
              <Card key={f.title} className="p-5 border-border/60">
                <f.icon className="h-5 w-5 text-emerald-500 mb-3" />
                <h4 className="font-semibold mb-1">{f.title}</h4>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </Card>
            ))}
          </div>
          <div className="text-center mt-10">
            <Button size="lg" asChild>
              <Link to="/signup">Start Free <ArrowRight className="h-4 w-4 ml-1.5" /></Link>
            </Button>
            <p className="text-xs text-muted-foreground mt-3">Setup &lt; 10 min · No credit card required</p>
          </div>
        </div>
      </section>
    </div>
  );
}
