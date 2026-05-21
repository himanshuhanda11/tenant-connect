import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import QRCodeStyling from 'qrcode';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  QrCode,
  MessageSquare,
  Palette,
  Sparkles,
  Download,
  Copy,
  ExternalLink,
  Save,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Wand2,
  Upload,
  X,
} from 'lucide-react';
import { usePhoneNumbers } from '@/hooks/usePhoneNumbers';
import { useTenant } from '@/contexts/TenantContext';
import { useQrCampaigns } from '@/hooks/useQrCampaigns';
import { cn } from '@/lib/utils';

const SIZE_PRESETS = {
  small: 256,
  medium: 512,
  large: 1024,
  ultra: 2048,
} as const;

const QUICK_MESSAGES = [
  'Hi, I want pricing details for your services.',
  'Hi, I would like to book a demo.',
  'Hi, I need support for my recent order.',
  'Hi, I have a product enquiry.',
  'Hi, I want to book an appointment.',
];

const POSTER_TEMPLATES = [
  { id: 'minimal', name: 'Minimal', bg: '#ffffff', fg: '#111827', accent: '#10b981' },
  { id: 'premium', name: 'Premium', bg: '#0b1220', fg: '#ffffff', accent: '#22c55e' },
  { id: 'business', name: 'Business', bg: '#f8fafc', fg: '#0f172a', accent: '#0ea5e9' },
  { id: 'restaurant', name: 'Restaurant', bg: '#fff7ed', fg: '#7c2d12', accent: '#ea580c' },
  { id: 'realestate', name: 'Real Estate', bg: '#f5f5f4', fg: '#1c1917', accent: '#854d0e' },
  { id: 'ecommerce', name: 'E-commerce', bg: '#faf5ff', fg: '#3b0764', accent: '#a855f7' },
] as const;

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'qr';
}

export default function QrGeneratorCreate() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { currentTenant } = useTenant();
  const { phoneNumbers, loading: phoneLoading } = usePhoneNumbers();
  const { list, create, update } = useQrCampaigns();
  const editing = id ? list.data?.find((c) => c.id === id) : undefined;

  const connectedNumber = phoneNumbers.find((p: any) => p.status === 'connected') || phoneNumbers[0];
  const numberE164 = (connectedNumber as any)?.phone_e164 || (connectedNumber as any)?.display_number || '';
  const verifiedName = (connectedNumber as any)?.verified_name || (connectedNumber as any)?.display_name;

  const [campaignName, setCampaignName] = useState('');
  const [message, setMessage] = useState('Hi, I am interested in your services.');
  const [cta, setCta] = useState('Scan to Chat on WhatsApp');
  const [size, setSize] = useState<keyof typeof SIZE_PRESETS>('large');
  const [fg, setFg] = useState('#111827');
  const [bg, setBg] = useState('#ffffff');
  const [template, setTemplate] = useState<typeof POSTER_TEMPLATES[number]['id']>('premium');
  const [saving, setSaving] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [logoDataUrl, setLogoDataUrl] = useState<string>('');
  const posterRef = useRef<HTMLDivElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Hydrate edit mode
  useEffect(() => {
    if (!editing) return;
    setCampaignName(editing.campaign_name);
    setMessage(editing.prefilled_message);
    setCta(editing.cta_text || 'Scan to Chat on WhatsApp');
    const cfg = (editing.qr_design_config || {}) as any;
    if (cfg.fg) setFg(cfg.fg);
    if (cfg.bg) setBg(cfg.bg);
    if (cfg.size) setSize(cfg.size);
    if (cfg.template) setTemplate(cfg.template);
    if (cfg.logoUrl) setLogoDataUrl(cfg.logoUrl);
  }, [editing]);

  // Apply template
  useEffect(() => {
    const t = POSTER_TEMPLATES.find((x) => x.id === template);
    if (t) {
      setBg(t.bg);
      setFg(t.fg);
    }
  }, [template]);

  const slug = useMemo(() => {
    if (editing?.slug) return editing.slug;
    return `${slugify(campaignName || 'qr')}-${Math.random().toString(36).slice(2, 6)}`;
  }, [campaignName, editing]);

  const publicUrl = useMemo(() => {
    const base = import.meta.env.VITE_SUPABASE_URL;
    return `${base}/functions/v1/qr-redirect/${slug}`;
  }, [slug]);

  const waUrl = useMemo(() => {
    const phone = numberE164.replace(/[^0-9]/g, '');
    return `https://wa.me/${phone}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
  }, [numberE164, message]);

  // Render QR
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const url = await QRCodeStyling.toDataURL(publicUrl, {
          width: SIZE_PRESETS[size],
          margin: 2,
          color: { dark: fg, light: bg },
          errorCorrectionLevel: 'H',
        });
        if (!cancelled) setQrDataUrl(url);
      } catch (e) {
        console.error(e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [publicUrl, size, fg, bg]);

  const downloadDataUrl = (data: string, filename: string) => {
    const a = document.createElement('a');
    a.href = data;
    a.download = filename;
    a.click();
  };

  const handleDownloadPng = () => {
    if (!qrDataUrl) return;
    downloadDataUrl(qrDataUrl, `${slugify(campaignName || 'qr')}.png`);
  };

  const handleDownloadSvg = async () => {
    const svg = await QRCodeStyling.toString(publicUrl, {
      type: 'svg',
      margin: 2,
      color: { dark: fg, light: bg },
      errorCorrectionLevel: 'H',
    });
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    downloadDataUrl(url, `${slugify(campaignName || 'qr')}.svg`);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPoster = async () => {
    const node = posterRef.current;
    if (!node || !qrDataUrl) return;
    const html2canvas = (await import('html2canvas')).default;
    try {
      const canvas = await html2canvas(node, { backgroundColor: bg, scale: 2 });
      downloadDataUrl(canvas.toDataURL('image/png'), `${slugify(campaignName || 'qr')}-poster.png`);
    } catch (e) {
      // Fallback if html2canvas missing: just download the QR
      handleDownloadPng();
    }
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(publicUrl);
    toast.success('Trackable link copied');
  };

  const handleSave = async () => {
    if (!campaignName.trim()) {
      toast.error('Enter a campaign name');
      return;
    }
    if (!numberE164) {
      toast.error('Connect a WhatsApp number first');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        campaign_name: campaignName.trim(),
        slug,
        whatsapp_number: numberE164,
        prefilled_message: message,
        cta_text: cta,
        qr_link: publicUrl,
        qr_design_config: { fg, bg, size, template },
        qr_image_url: qrDataUrl,
        status: 'active',
      };
      if (editing) {
        await update.mutateAsync({ id: editing.id, ...payload } as any);
        toast.success('QR campaign updated');
      } else {
        await create.mutateAsync(payload as any);
        toast.success('QR campaign saved');
      }
      navigate('/tools/qr-generator');
    } catch (e: any) {
      toast.error(e.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const isConnected = !!numberE164;

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <Link to="/tools/qr-generator" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to QR codes
            </Link>
            <h1 className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl">
              WhatsApp QR Code Generator
            </h1>
            <p className="text-sm text-muted-foreground">
              Generate trackable WhatsApp QR codes to capture leads instantly.
            </p>
          </div>
        </div>

        {/* Connected number card */}
        <Card className={cn(
          'relative overflow-hidden border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-background to-teal-500/5 p-5 backdrop-blur',
          !isConnected && 'border-amber-500/30 from-amber-500/10 to-orange-500/5'
        )}>
          {isConnected ? (
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-500">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Connected WhatsApp Number</p>
                <p className="text-lg font-semibold">{numberE164}</p>
                {verifiedName && <p className="text-xs text-muted-foreground">{verifiedName}</p>}
              </div>
              <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30">Active</Badge>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="font-semibold">Connect your WhatsApp API number</p>
              <p className="text-sm text-muted-foreground">
                Connect your WhatsApp API number to generate QR codes and capture leads directly inside Aireatro CRM.
              </p>
              <Button onClick={() => navigate('/phone-numbers/connect')} className="bg-gradient-to-r from-emerald-500 to-teal-500">
                Connect WhatsApp
              </Button>
            </div>
          )}
        </Card>

        <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
          {/* Left: steps */}
          <div className="space-y-6">
            {/* Campaign name */}
            <Card className="p-5">
              <div className="mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-500" />
                <Label className="text-base font-semibold">Campaign Name</Label>
              </div>
              <Input
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                placeholder="e.g. Store Counter QR, Instagram Bio, Product Packaging"
                className="h-11"
                maxLength={120}
              />
            </Card>

            {/* Step 1: Message */}
            <Card className="p-5">
              <div className="mb-3 flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-emerald-500" />
                <Label className="text-base font-semibold">Step 1 — Pre-filled message</Label>
              </div>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value.slice(0, 1000))}
                placeholder="Hi, I am interested in your services."
                className="min-h-[100px] resize-y"
              />
              <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>Emoji supported</span>
                <span>{message.length}/1000</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {QUICK_MESSAGES.map((q) => (
                  <button
                    key={q}
                    onClick={() => setMessage(q)}
                    className="rounded-full border border-border bg-card px-3 py-1.5 text-xs hover:border-emerald-500/40 hover:bg-emerald-500/10 transition"
                  >
                    {q.replace(/^Hi, /, '').replace(/\.$/, '').slice(0, 28)}
                  </button>
                ))}
              </div>

              {/* WhatsApp-style preview */}
              <div className="mt-4 rounded-xl bg-[#0b141a] p-3">
                <div className="ml-auto max-w-[80%] rounded-2xl rounded-tr-sm bg-[hsl(152_60%_35%)] px-3 py-2 text-sm text-white shadow">
                  {message || '—'}
                </div>
              </div>
            </Card>

            {/* Step 2: Customize */}
            <Card className="p-5">
              <div className="mb-3 flex items-center gap-2">
                <Palette className="h-4 w-4 text-emerald-500" />
                <Label className="text-base font-semibold">Step 2 — Customize QR</Label>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">Size</Label>
                  <Tabs value={size} onValueChange={(v) => setSize(v as any)}>
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="small">Small</TabsTrigger>
                      <TabsTrigger value="medium">Medium</TabsTrigger>
                      <TabsTrigger value="large">Large</TabsTrigger>
                      <TabsTrigger value="ultra">Ultra HD</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">QR color</Label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={fg} onChange={(e) => setFg(e.target.value)} className="h-10 w-14 cursor-pointer rounded-md border border-border bg-transparent" />
                      <Input value={fg} onChange={(e) => setFg(e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <Label className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">Background</Label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} className="h-10 w-14 cursor-pointer rounded-md border border-border bg-transparent" />
                      <Input value={bg} onChange={(e) => setBg(e.target.value)} />
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">CTA text under QR</Label>
                  <Input value={cta} onChange={(e) => setCta(e.target.value.slice(0, 60))} placeholder="Scan to Chat on WhatsApp" />
                </div>

                <div>
                  <Label className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">Poster template</Label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {POSTER_TEMPLATES.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setTemplate(t.id)}
                        className={cn(
                          'group relative overflow-hidden rounded-xl border p-3 text-left transition',
                          template === t.id ? 'border-emerald-500 ring-2 ring-emerald-500/30' : 'border-border hover:border-emerald-500/40'
                        )}
                        style={{ background: t.bg, color: t.fg }}
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded bg-white/10" style={{ borderColor: t.accent }}>
                          <QrCode className="h-4 w-4" />
                        </div>
                        <p className="mt-2 text-xs font-semibold">{t.name}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right: Live preview */}
          <div className="space-y-4 lg:sticky lg:top-4 lg:self-start">
            <Card className="overflow-hidden border-emerald-500/20 bg-gradient-to-br from-card to-emerald-500/5 p-0 shadow-lg">
              <div className="p-4 border-b border-border/50">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Live preview</p>
              </div>
              <div className="p-6">
                <div
                  ref={posterRef}
                  className="mx-auto flex max-w-sm flex-col items-center gap-3 rounded-2xl p-6 shadow-xl"
                  style={{ background: bg, color: fg }}
                >
                  <p className="text-xs font-semibold uppercase tracking-widest opacity-70">
                    {currentTenant?.name || 'Your Business'}
                  </p>
                  {qrDataUrl ? (
                    <img src={qrDataUrl} alt="QR code" className="aspect-square w-56 rounded-xl" />
                  ) : (
                    <div className="flex aspect-square w-56 items-center justify-center rounded-xl border-2 border-dashed border-current/20">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  )}
                  <p className="text-sm font-bold">{cta}</p>
                  {numberE164 && <p className="text-xs opacity-70">{numberE164}</p>}
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-2 gap-2">
              <Button onClick={handleDownloadPng} variant="outline" className="h-10"><Download className="mr-1 h-3.5 w-3.5" /> PNG</Button>
              <Button onClick={handleDownloadSvg} variant="outline" className="h-10"><Download className="mr-1 h-3.5 w-3.5" /> SVG</Button>
              <Button onClick={handleDownloadPoster} variant="outline" className="h-10 col-span-2"><Wand2 className="mr-1 h-3.5 w-3.5" /> Download poster</Button>
              <Button onClick={handleCopyLink} variant="outline" className="h-10"><Copy className="mr-1 h-3.5 w-3.5" /> Copy link</Button>
              <Button onClick={() => window.open(publicUrl, '_blank')} variant="outline" className="h-10"><ExternalLink className="mr-1 h-3.5 w-3.5" /> Test</Button>
            </div>

            <Button
              onClick={handleSave}
              disabled={saving || !isConnected}
              className="w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20 hover:opacity-95"
            >
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {editing ? 'Update QR campaign' : 'Save QR campaign'}
            </Button>

            <div className="rounded-xl border border-border/50 bg-card/50 p-3 text-xs text-muted-foreground">
              <p className="mb-1 font-semibold text-foreground">Trackable link</p>
              <code className="break-all text-[10px]">{publicUrl}</code>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
