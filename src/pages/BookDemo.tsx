import React, { useMemo, useState } from 'react';
import { z } from 'zod';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import {
  CalendarIcon, Clock, User, Mail, Phone, Building2, Users, Globe,
  Sparkles, ArrowRight, CheckCircle2, PlayCircle, Zap, ShieldCheck,
  Bot, BarChart3, MessageCircle, Rocket, Star, Headphones,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import SeoMeta from '@/components/seo/SeoMeta';
import { Helmet } from 'react-helmet-async';
import { cn } from '@/lib/utils';

const schema = z.object({
  fullName: z.string().trim().min(2, 'Please enter your full name').max(80),
  workEmail: z.string().trim().email('Enter a valid work email').max(120),
  phone: z.string().trim().min(6, 'Enter a valid phone number').max(24),
  company: z.string().trim().min(1, 'Company name is required').max(120),
  website: z.string().trim().max(160).optional(),
  teamSize: z.string().min(1, 'Select team size'),
  industry: z.string().min(1, 'Select your industry'),
  useCase: z.string().min(1, 'Select primary use case'),
  preferredDate: z.string().min(1, 'Pick a preferred date'),
  preferredTime: z.string().min(1, 'Pick a time slot'),
  timezone: z.string().min(1),
  notes: z.string().trim().max(800).optional(),
});

type FormData = z.infer<typeof schema>;

// 24-hour coverage in 30-min increments
const TIME_SLOTS: string[] = (() => {
  const out: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (const m of [0, 30]) {
      const period = h < 12 ? 'AM' : 'PM';
      const hour12 = ((h + 11) % 12) + 1;
      out.push(`${String(hour12).padStart(2, '0')}:${m === 0 ? '00' : '30'} ${period}`);
    }
  }
  return out;
})();

// Curated common timezones (browser TZ added dynamically if missing)
const COMMON_TIMEZONES = [
  'Asia/Kolkata', 'Asia/Dubai', 'Asia/Singapore', 'Asia/Hong_Kong', 'Asia/Tokyo',
  'Asia/Karachi', 'Asia/Dhaka', 'Asia/Bangkok', 'Asia/Jakarta', 'Asia/Manila',
  'Australia/Sydney', 'Australia/Melbourne', 'Pacific/Auckland',
  'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Europe/Madrid', 'Europe/Amsterdam',
  'Europe/Istanbul', 'Europe/Moscow', 'Africa/Cairo', 'Africa/Johannesburg', 'Africa/Lagos',
  'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'America/Toronto', 'America/Mexico_City', 'America/Sao_Paulo', 'America/Buenos_Aires',
  'UTC',
];

const TEAM_SIZES = ['Just me', '2–5', '6–20', '21–50', '51–200', '200+'];
const INDUSTRIES = [
  'E-commerce / D2C', 'Education / EdTech', 'Real Estate', 'Healthcare',
  'Travel & Hospitality', 'Financial Services', 'SaaS / Technology', 'Agency', 'Other',
];
const USE_CASES = [
  'Lead capture & qualification', 'Customer support', 'Marketing broadcasts',
  'Abandoned cart recovery', 'Meta Ads → WhatsApp', 'Internal team inbox', 'Other',
];

const WHY_AIREATRO = [
  { icon: Zap, title: 'Setup in < 10 min', desc: 'Connect your number and start sending in minutes — no developers needed.' },
  { icon: Bot, title: 'Built-in AI auto-replies', desc: 'Qualify leads 24/7 in 50+ languages with multi-turn AI that hands off to humans cleanly.' },
  { icon: BarChart3, title: 'True Meta Ads attribution', desc: 'See which CTWA ad, campaign and creative drove every WhatsApp lead and revenue.' },
  { icon: ShieldCheck, title: 'Official Meta Cloud API', desc: 'Green tick ready, fully compliant, with zero per-message platform fees.' },
];

const AGENDA = [
  'Walk through your business use case (5 min)',
  'Live tour of inbox, automation & AI (8 min)',
  'Meta Ads → WhatsApp attribution demo (5 min)',
  'Pricing, onboarding & Q&A (7 min)',
];

const SOCIAL = [
  { stat: '2,000+', label: 'Businesses' },
  { stat: '50M+', label: 'Messages / month' },
  { stat: '4.9/5', label: 'Customer rating' },
  { stat: '< 24h', label: 'Avg. onboarding' },
];

export default function BookDemo() {
  const { toast } = useToast();
  const browserTz = useMemo(() => {
    try { return Intl.DateTimeFormat().resolvedOptions().timeZone; } catch { return 'UTC'; }
  }, []);
  const [pickedDate, setPickedDate] = useState<Date | undefined>();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [data, setData] = useState<FormData>({
    fullName: '', workEmail: '', phone: '', company: '', website: '',
    teamSize: '', industry: '', useCase: '',
    preferredDate: '', preferredTime: '', timezone: browserTz, notes: '',
  });

  const update = <K extends keyof FormData>(k: K, v: FormData[K]) => {
    setData((d) => ({ ...d, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = schema.safeParse(data);
    if (!r.success) {
      const fe: Partial<Record<keyof FormData, string>> = {};
      r.error.errors.forEach((er) => { fe[er.path[0] as keyof FormData] = er.message; });
      setErrors(fe);
      toast({ title: 'Please complete the form', description: 'A few fields need your attention.', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    await new Promise((res) => setTimeout(res, 1200));
    setSubmitting(false);
    setSubmitted(true);
    toast({ title: 'Demo requested 🎉', description: 'Our team will confirm your slot shortly.' });
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <SeoMeta route="/demo" fallbackTitle="Demo booked — AiReatro" fallbackDescription="Your demo request is in." />
        <Navbar />
        <div className="container mx-auto px-4 py-24">
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="max-w-xl mx-auto text-center"
          >
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">You're on the calendar</h1>
            <p className="text-muted-foreground mb-2">
              Thanks {data.fullName.split(' ')[0]}! We'll confirm <strong>{data.preferredDate}</strong> at <strong>{data.preferredTime}</strong> ({data.timezone}) over email and WhatsApp within a few hours.
            </p>
            <p className="text-sm text-muted-foreground mb-8">Meanwhile, you can explore the product on a free account — no credit card needed.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" onClick={() => window.location.href = '/signup'}>Start Free</Button>
              <Button size="lg" variant="outline" onClick={() => window.location.href = '/'}>Back to Home</Button>
            </div>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SeoMeta
        route="/demo"
        fallbackTitle="Book a Free WhatsApp CRM Demo | AiReatro"
        fallbackDescription="Book a free 25-minute demo of AiReatro — the all-in-one WhatsApp Cloud API platform with AI auto-replies, team inbox, Meta Ads attribution and < 10 min setup. Pick any time, any timezone."
      />
      <Helmet>
        <meta name="keywords" content="book whatsapp crm demo, whatsapp cloud api demo, whatsapp business api demo, schedule whatsapp demo, aireatro demo, whatsapp automation demo, whatsapp chatbot demo, meta ads whatsapp demo, free whatsapp api demo, whatsapp marketing demo" />
        <meta property="og:title" content="Book a Free WhatsApp CRM Demo | AiReatro" />
        <meta property="og:description" content="See how AiReatro automates WhatsApp leads, ads attribution and support — book your personalised 25-minute demo." />
      </Helmet>
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.07] via-background to-background" />
        <div className="absolute -top-40 -right-32 w-[480px] h-[480px] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-[420px] h-[420px] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />

        <div className="container mx-auto px-4 relative pt-16 pb-12 md:pt-24 md:pb-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold tracking-wide uppercase mb-5">
                <PlayCircle className="w-3.5 h-3.5" />
                Live Product Demo
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-[1.05] tracking-tight mb-5">
                Book a 25-min demo with our{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-emerald-500 to-teal-500">
                  WhatsApp experts
                </span>
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-7 max-w-xl">
                See exactly how AiReatro automates your WhatsApp leads, support and Meta Ads — tailored to your business. No slides, just a real product walk-through.
              </p>

              <ul className="space-y-2.5 mb-8">
                {AGENDA.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-foreground/80">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {SOCIAL.map((s) => (
                  <div key={s.label} className="rounded-xl border border-border/60 bg-card/60 backdrop-blur p-3 text-center">
                    <div className="text-lg font-bold text-foreground">{s.stat}</div>
                    <div className="text-[11px] text-muted-foreground uppercase tracking-wide mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Booking form card */}
            <motion.div
              id="book"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            >
              <Card className="border-border/60 shadow-2xl shadow-primary/5">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center shadow-lg shadow-primary/20">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-foreground">Pick a slot that suits you</h2>
                      <p className="text-xs text-muted-foreground">Free · 25 minutes · Zero obligations</p>
                    </div>
                  </div>

                  <form onSubmit={onSubmit} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="flex items-center gap-1.5 text-xs"><User className="w-3.5 h-3.5" /> Full name *</Label>
                        <Input value={data.fullName} onChange={(e) => update('fullName', e.target.value)}
                          placeholder="Jane Doe" className={cn('h-10', errors.fullName && 'border-destructive')} />
                        {errors.fullName && <p className="text-[11px] text-destructive">{errors.fullName}</p>}
                      </div>
                      <div className="space-y-1.5">
                        <Label className="flex items-center gap-1.5 text-xs"><Mail className="w-3.5 h-3.5" /> Work email *</Label>
                        <Input type="email" value={data.workEmail} onChange={(e) => update('workEmail', e.target.value)}
                          placeholder="jane@company.com" className={cn('h-10', errors.workEmail && 'border-destructive')} />
                        {errors.workEmail && <p className="text-[11px] text-destructive">{errors.workEmail}</p>}
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="flex items-center gap-1.5 text-xs"><Phone className="w-3.5 h-3.5" /> WhatsApp number *</Label>
                        <Input value={data.phone} onChange={(e) => update('phone', e.target.value)}
                          placeholder="+91 98xxxxxxxx" className={cn('h-10', errors.phone && 'border-destructive')} />
                        {errors.phone && <p className="text-[11px] text-destructive">{errors.phone}</p>}
                      </div>
                      <div className="space-y-1.5">
                        <Label className="flex items-center gap-1.5 text-xs"><Building2 className="w-3.5 h-3.5" /> Company *</Label>
                        <Input value={data.company} onChange={(e) => update('company', e.target.value)}
                          placeholder="Acme Inc" className={cn('h-10', errors.company && 'border-destructive')} />
                        {errors.company && <p className="text-[11px] text-destructive">{errors.company}</p>}
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="flex items-center gap-1.5 text-xs"><Globe className="w-3.5 h-3.5" /> Website</Label>
                        <Input value={data.website} onChange={(e) => update('website', e.target.value)}
                          placeholder="acme.com" className="h-10" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="flex items-center gap-1.5 text-xs"><Users className="w-3.5 h-3.5" /> Team size *</Label>
                        <Select value={data.teamSize} onValueChange={(v) => update('teamSize', v)}>
                          <SelectTrigger className={cn('h-10', errors.teamSize && 'border-destructive')}>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {TEAM_SIZES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        {errors.teamSize && <p className="text-[11px] text-destructive">{errors.teamSize}</p>}
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Industry *</Label>
                        <Select value={data.industry} onValueChange={(v) => update('industry', v)}>
                          <SelectTrigger className={cn('h-10', errors.industry && 'border-destructive')}>
                            <SelectValue placeholder="Select industry" />
                          </SelectTrigger>
                          <SelectContent>
                            {INDUSTRIES.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        {errors.industry && <p className="text-[11px] text-destructive">{errors.industry}</p>}
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Primary use case *</Label>
                        <Select value={data.useCase} onValueChange={(v) => update('useCase', v)}>
                          <SelectTrigger className={cn('h-10', errors.useCase && 'border-destructive')}>
                            <SelectValue placeholder="What's the goal?" />
                          </SelectTrigger>
                          <SelectContent>
                            {USE_CASES.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        {errors.useCase && <p className="text-[11px] text-destructive">{errors.useCase}</p>}
                      </div>
                    </div>

                    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4 text-primary" />
                        <h3 className="text-sm font-semibold">Pick your slot</h3>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs">Preferred date *</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button type="button" variant="outline"
                                className={cn('h-10 w-full justify-start text-left font-normal',
                                  !pickedDate && 'text-muted-foreground',
                                  errors.preferredDate && 'border-destructive')}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {pickedDate ? format(pickedDate, 'PPP') : <span>Pick a date</span>}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={pickedDate}
                                onSelect={(d) => {
                                  setPickedDate(d);
                                  update('preferredDate', d ? format(d, 'yyyy-MM-dd') : '');
                                }}
                                disabled={(date) => {
                                  const today = new Date(); today.setHours(0, 0, 0, 0);
                                  const max = new Date(); max.setDate(max.getDate() + 60);
                                  return date < today || date > max || date.getDay() === 0;
                                }}
                                initialFocus
                                className={cn('p-3 pointer-events-auto')}
                              />
                            </PopoverContent>
                          </Popover>
                          {errors.preferredDate && <p className="text-[11px] text-destructive">{errors.preferredDate}</p>}
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Time slot *</Label>
                          <Select value={data.preferredTime} onValueChange={(v) => update('preferredTime', v)}>
                            <SelectTrigger className={cn('h-10', errors.preferredTime && 'border-destructive')}>
                              <SelectValue placeholder="Choose time" />
                            </SelectTrigger>
                            <SelectContent>
                              {TIME_SLOTS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          {errors.preferredTime && <p className="text-[11px] text-destructive">{errors.preferredTime}</p>}
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5" /> Timezone
                          <span className="ml-auto text-[10px] font-normal text-muted-foreground">auto-detected</span>
                        </Label>
                        <Select value={data.timezone} onValueChange={(v) => update('timezone', v)}>
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Select timezone" />
                          </SelectTrigger>
                          <SelectContent className="max-h-72">
                            {tzOptions.map((tz) => (
                              <SelectItem key={tz} value={tz}>
                                {tz.replace(/_/g, ' ')} {tz === browserTz ? '(your timezone)' : ''}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs">Anything specific you'd like to see?</Label>
                      <Textarea value={data.notes} onChange={(e) => update('notes', e.target.value)}
                        placeholder="e.g. We run Meta Ads and want to see lead attribution end-to-end."
                        className="min-h-[80px] resize-none" />
                    </div>

                    <Button type="submit" size="lg" disabled={submitting}
                      className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-emerald-500 hover:from-primary/90 hover:to-emerald-600 shadow-xl shadow-primary/20">
                      {submitting ? (
                        <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />Booking your slot…</>
                      ) : (
                        <>Book my demo <ArrowRight className="w-4 h-4 ml-2" /></>
                      )}
                    </Button>
                    <p className="text-[11px] text-muted-foreground text-center">
                      By submitting, you agree to be contacted about your demo. We never share your data.
                    </p>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why AiReatro */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <Badge className="mb-3" variant="secondary">Why teams pick AiReatro</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
              Built different from generic WhatsApp tools
            </h2>
            <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
              See how AiReatro stacks up against legacy chatbots and bloated CRMs — purpose-built for WhatsApp-first growth.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {WHY_AIREATRO.map((w, i) => (
              <motion.div key={w.title}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                <Card className="h-full border-border/60 hover:border-primary/40 hover:shadow-lg transition-all">
                  <CardContent className="p-6">
                    <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <w.icon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-1.5">{w.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{w.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What you'll learn */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <Badge variant="secondary" className="mb-3">What you'll learn</Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-4">
                A 25-minute session, completely tailored to your business
              </h2>
              <p className="text-muted-foreground mb-6">
                Skip the generic pitch. Our specialist will map AiReatro to your exact workflow — from inbound leads to closed deals.
              </p>
              <ul className="space-y-3">
                {[
                  { icon: Rocket, title: 'How to launch in under 10 minutes', desc: 'Connect your Meta number, import contacts, send your first broadcast.' },
                  { icon: Bot, title: 'AI workflows for your industry', desc: 'See pre-built automations for ecommerce, education, real estate and more.' },
                  { icon: BarChart3, title: 'Meta Ads to WhatsApp ROI', desc: 'Track every CTWA click to lead, conversation and revenue.' },
                  { icon: Headphones, title: 'Onboarding & support roadmap', desc: 'Understand SLAs, dedicated CSM options and migration support.' },
                ].map((it) => (
                  <li key={it.title} className="flex gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <it.icon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground text-sm">{it.title}</h4>
                      <p className="text-sm text-muted-foreground">{it.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <Card className="border-border/60 bg-gradient-to-br from-primary/[0.04] to-emerald-500/[0.04]">
              <CardContent className="p-7">
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-foreground text-base leading-relaxed mb-5">
                  "We replaced two tools with AiReatro and increased our WhatsApp lead conversion by 3.2x in the first month. The demo alone was worth it — they showed us exactly how to wire Meta Ads to our sales inbox."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center text-white font-semibold">
                    R
                  </div>
                  <div>
                    <div className="font-semibold text-foreground text-sm">Rohit Sharma</div>
                    <div className="text-xs text-muted-foreground">Head of Growth, ParadiseMigration</div>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-border/60 flex items-center gap-3 text-xs text-muted-foreground">
                  <MessageCircle className="w-4 h-4 text-primary" />
                  Prefer to chat first? <a href="https://wa.me/919319711126" target="_blank" rel="noreferrer" className="text-primary font-medium hover:underline">WhatsApp us</a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
