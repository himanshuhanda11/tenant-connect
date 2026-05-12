import React, { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { z } from 'zod';
import {
  MessageCircle, PlayCircle, LifeBuoy, CreditCard, Phone as PhoneIcon, DollarSign,
  Wallet, UserCog, Lightbulb, MailQuestion, CheckCircle2, Sparkles, ShieldCheck,
  Headphones, Zap, Send, Upload, Building2, Globe, User, Mail, Hash, AlertTriangle,
  ArrowRight, Copy, Loader2, X,
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import SeoMeta from '@/components/seo/SeoMeta';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

type CategoryKey =
  | 'live_chat' | 'demo' | 'technical' | 'billing' | 'whatsapp_api'
  | 'meta_charges' | 'payment_plans' | 'account' | 'feature_request' | 'other';

const CATEGORIES: {
  key: CategoryKey; label: string; short: string; icon: any;
  responseTime: string; defaultPriority: 'low' | 'medium' | 'high' | 'urgent';
}[] = [
  { key: 'live_chat',     label: 'Live Chat',          short: 'Talk to our team on WhatsApp now',  icon: MessageCircle, responseTime: 'Within minutes',  defaultPriority: 'high' },
  { key: 'demo',          label: 'Book Demo',          short: 'Personalised 25-min product tour',   icon: PlayCircle,    responseTime: 'Same business day', defaultPriority: 'medium' },
  { key: 'technical',     label: 'Technical Support',  short: 'Bugs, errors, integration issues',   icon: LifeBuoy,      responseTime: 'Within 4 hours',  defaultPriority: 'high' },
  { key: 'billing',       label: 'Billing Issue',      short: 'Invoices, refunds, payment failures',icon: CreditCard,    responseTime: 'Within 12 hours', defaultPriority: 'high' },
  { key: 'whatsapp_api',  label: 'WhatsApp API Setup', short: 'WABA, number connection, OBO',       icon: PhoneIcon,     responseTime: 'Within 4 hours',  defaultPriority: 'high' },
  { key: 'meta_charges',  label: 'Meta Charges',       short: 'Conversation pricing & categories',  icon: DollarSign,    responseTime: 'Within 24 hours', defaultPriority: 'medium' },
  { key: 'payment_plans', label: 'Payment Plans',      short: 'Pricing, upgrades & enterprise',     icon: Wallet,        responseTime: 'Within 24 hours', defaultPriority: 'medium' },
  { key: 'account',       label: 'Account / Workspace',short: 'Workspace access, members, roles',   icon: UserCog,       responseTime: 'Within 12 hours', defaultPriority: 'high' },
  { key: 'feature_request', label: 'Feature Request',  short: 'Tell us what to build next',         icon: Lightbulb,     responseTime: 'Within 3 days',   defaultPriority: 'low' },
  { key: 'other',         label: 'Other Enquiry',      short: 'Anything else — we are listening',   icon: MailQuestion,  responseTime: 'Within 24 hours', defaultPriority: 'medium' },
];

const baseSchema = z.object({
  fullName: z.string().trim().min(2, 'Enter your full name').max(80),
  email: z.string().trim().email('Enter a valid email').max(120),
  phone: z.string().trim().min(6, 'Enter a valid phone number').max(24),
  businessName: z.string().trim().max(120).optional().or(z.literal('')),
  country: z.string().trim().max(60).optional().or(z.literal('')),
  workspaceLabel: z.string().trim().max(120).optional().or(z.literal('')),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  subject: z.string().trim().max(160).optional().or(z.literal('')),
  message: z.string().trim().min(10, 'Tell us a bit more (10+ characters)').max(4000),
  // honeypot
  website: z.string().max(0).optional(),
  // category-specific
  preferredDate: z.string().optional().or(z.literal('')),
  preferredTime: z.string().optional().or(z.literal('')),
  timezone: z.string().optional().or(z.literal('')),
  businessType: z.string().optional().or(z.literal('')),
  planInterest: z.string().optional().or(z.literal('')),
  planName: z.string().optional().or(z.literal('')),
  invoiceRef: z.string().optional().or(z.literal('')),
  billingIssueType: z.string().optional().or(z.literal('')),
  whatsappPhone: z.string().optional().or(z.literal('')),
  wabaId: z.string().optional().or(z.literal('')),
  whatsappIssue: z.string().optional().or(z.literal('')),
  metaCountry: z.string().optional().or(z.literal('')),
  metaMessageCategory: z.string().optional().or(z.literal('')),
  metaVolume: z.string().optional().or(z.literal('')),
});

type FormState = z.infer<typeof baseSchema>;

const TIME_SLOTS = ['09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00'];
const PRIORITIES: { value: FormState['priority']; label: string; color: string }[] = [
  { value: 'low',     label: 'Low',     color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
  { value: 'medium',  label: 'Medium',  color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  { value: 'high',    label: 'High',    color: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  { value: 'urgent',  label: 'Urgent',  color: 'bg-red-500/10 text-red-600 border-red-500/30' },
];

const TRUST_BADGES = [
  { icon: Zap, label: 'Fast response' },
  { icon: ShieldCheck, label: 'WhatsApp API experts' },
  { icon: CreditCard, label: 'Billing support' },
  { icon: Headphones, label: 'Technical setup help' },
];

function categoryFromQuery(): CategoryKey | null {
  if (typeof window === 'undefined') return null;
  const c = new URLSearchParams(window.location.search).get('category');
  if (c && CATEGORIES.some(x => x.key === c)) return c as CategoryKey;
  if (new URLSearchParams(window.location.search).get('intent') === 'demo') return 'demo';
  return null;
}

export default function Contact() {
  const { toast } = useToast();
  const { user } = useAuth();
  const browserTz = useMemo(() => {
    try { return Intl.DateTimeFormat().resolvedOptions().timeZone; } catch { return 'UTC'; }
  }, []);

  const initialCategory = useMemo(categoryFromQuery, []);
  const [category, setCategory] = useState<CategoryKey | null>(initialCategory);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<null | { ticketId: string; category: CategoryKey; expectedResponse: string }>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [attachment, setAttachment] = useState<File | null>(null);
  const [data, setData] = useState<FormState>({
    fullName: '', email: user?.email ?? '', phone: '+971 ', businessName: '', country: '',
    workspaceLabel: '', priority: 'medium', subject: '', message: '', website: '',
    preferredDate: '', preferredTime: '', timezone: browserTz, businessType: '', planInterest: '',
    planName: '', invoiceRef: '', billingIssueType: '',
    whatsappPhone: '', wabaId: '', whatsappIssue: '',
    metaCountry: '', metaMessageCategory: '', metaVolume: '',
  });

  const update = <K extends keyof FormState>(k: K, v: FormState[K]) => {
    setData((d) => ({ ...d, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const selectCategory = (key: CategoryKey) => {
    setCategory(key);
    const cat = CATEGORIES.find(c => c.key === key)!;
    setData((d) => ({ ...d, priority: cat.defaultPriority }));
    setTimeout(() => {
      document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  const uploadAttachmentIfAny = async (folder: string): Promise<string | null> => {
    if (!attachment) return null;
    if (attachment.size > 5 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Attachments must be 5 MB or less.', variant: 'destructive' });
      throw new Error('attachment_too_large');
    }
    const okType = /^(image\/|application\/pdf$)/.test(attachment.type);
    if (!okType) {
      toast({ title: 'Unsupported file', description: 'Only images or PDF files are allowed.', variant: 'destructive' });
      throw new Error('attachment_bad_type');
    }
    const ext = attachment.name.split('.').pop()?.toLowerCase() || 'bin';
    const path = `${folder}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('contact-attachments').upload(path, attachment, {
      cacheControl: '3600', contentType: attachment.type, upsert: false,
    });
    if (error) {
      console.warn('attachment upload failed', error);
      return null;
    }
    const { data: pub } = supabase.storage.from('contact-attachments').getPublicUrl(path);
    return pub.publicUrl;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category) {
      toast({
        title: 'Choose an enquiry type first',
        description: 'Pick the topic that best matches what you need so we can route it to the right team.',
        className: 'border-amber-200 bg-gradient-to-br from-amber-50 to-white text-amber-950 shadow-xl shadow-amber-500/10 dark:border-amber-500/30 dark:from-amber-950/60 dark:to-slate-950 dark:text-amber-50',
      });
      // Smooth scroll to category grid
      document.getElementById('contact-categories')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    if (data.website) return; // honeypot

    const r = baseSchema.safeParse(data);
    if (!r.success) {
      const fe: Partial<Record<keyof FormState, string>> = {};
      r.error.errors.forEach((er) => { fe[er.path[0] as keyof FormState] = er.message; });
      setErrors(fe);

      const FIELD_LABELS: Record<string, string> = {
        fullName: 'Full name',
        email: 'Email address',
        phone: 'Phone number',
        message: 'Your message',
        businessName: 'Business name',
        country: 'Country',
        subject: 'Subject',
      };
      const missing = Array.from(new Set(r.error.errors.map(er => String(er.path[0])))).map(k => FIELD_LABELS[k] || k);
      const count = missing.length;

      toast({
        title: count === 1 ? '1 field needs your attention' : `${count} fields need your attention`,
        description: (
          <div className="mt-1 space-y-1.5">
            <p className="text-[12.5px] opacity-80">Please review and complete the highlighted fields below:</p>
            <ul className="flex flex-wrap gap-1.5 pt-1">
              {missing.map((m) => (
                <li
                  key={m}
                  className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50/80 px-2 py-0.5 text-[11px] font-medium text-rose-700 dark:border-rose-500/30 dark:bg-rose-950/40 dark:text-rose-200"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                  {m}
                </li>
              ))}
            </ul>
          </div>
        ) as any,
        className: 'group border-rose-200/80 bg-gradient-to-br from-white via-rose-50/60 to-white text-rose-950 shadow-2xl shadow-rose-500/15 backdrop-blur-xl dark:border-rose-500/30 dark:from-slate-950 dark:via-rose-950/30 dark:to-slate-950 dark:text-rose-50',
      });

      // Scroll to first field showing an error
      setTimeout(() => {
        const firstError = document.querySelector<HTMLElement>('[data-field-error="true"]');
        firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstError?.querySelector<HTMLElement>('input,textarea,select,button')?.focus();
      }, 80);
      return;
    }

    const cat = CATEGORIES.find(c => c.key === category)!;
    setSubmitting(true);
    try {
      // First insert without attachment to get ticket_id
      const metadata: Record<string, any> = {};
      if (category === 'demo') Object.assign(metadata, {
        preferred_date: data.preferredDate, preferred_time: data.preferredTime, timezone: data.timezone,
        business_type: data.businessType, plan_interest: data.planInterest,
      });
      if (category === 'billing') Object.assign(metadata, {
        plan_name: data.planName, invoice_ref: data.invoiceRef, billing_issue_type: data.billingIssueType,
      });
      if (category === 'whatsapp_api') Object.assign(metadata, {
        whatsapp_phone: data.whatsappPhone, waba_id: data.wabaId, whatsapp_issue: data.whatsappIssue,
      });
      if (category === 'meta_charges') Object.assign(metadata, {
        meta_country: data.metaCountry, meta_message_category: data.metaMessageCategory, meta_volume: data.metaVolume,
      });

      // Upload attachment FIRST (using a random folder) so we can store the URL on the row
      let attachmentUrl: string | null = null;
      try {
        attachmentUrl = await uploadAttachmentIfAny(`pending/${crypto.randomUUID()}`);
      } catch {
        setSubmitting(false);
        return;
      }

      const { data: rpcRows, error: rpcError } = await supabase.rpc('submit_contact_request', {
        p_full_name: data.fullName,
        p_email: data.email,
        p_phone: data.phone,
        p_business_name: data.businessName || null,
        p_country: data.country || null,
        p_category: category,
        p_priority: data.priority,
        p_subject: data.subject || cat.label,
        p_message: data.message,
        p_source_page: typeof window !== 'undefined' ? window.location.pathname : '/contact',
        p_metadata: metadata,
        p_attachment_url: attachmentUrl,
      });
      if (rpcError) throw rpcError;
      const inserted = Array.isArray(rpcRows) ? rpcRows[0] : rpcRows;
      if (!inserted?.ticket_id) throw new Error('Failed to submit');

      // Build metadata lines for admin email
      const metadataLines: string[] = [];
      Object.entries(metadata).forEach(([k, v]) => {
        if (v) metadataLines.push(`${k.replace(/_/g, ' ')}: ${v}`);
      });

      const sharedPayload = {
        ticketId: inserted.ticket_id,
        category,
        categoryLabel: cat.label,
        priority: data.priority,
        subject: data.subject || cat.label,
        message: data.message,
        submittedAt: new Date().toUTCString(),
        expectedResponse: cat.responseTime,
      };

      // Customer confirmation
      supabase.functions.invoke('send-transactional-email', {
        body: {
          templateName: 'contact-request-customer',
          recipientEmail: data.email,
          idempotencyKey: `contact-customer-${inserted.ticket_id}`,
          templateData: { recipientName: data.fullName.split(' ')[0], ...sharedPayload },
        },
      }).catch((e) => console.warn('customer email failed', e));

      // Admin notification (template has fixed `to: admin@aireatro.com`)
      supabase.functions.invoke('send-transactional-email', {
        body: {
          templateName: 'contact-request-admin',
          recipientEmail: 'admin@aireatro.com',
          idempotencyKey: `contact-admin-${inserted.ticket_id}`,
          templateData: {
            ...sharedPayload,
            fullName: data.fullName,
            email: data.email,
            phone: data.phone,
            businessName: data.businessName,
            country: data.country,
            workspaceLabel: data.workspaceLabel,
            attachmentUrl,
            sourcePage: typeof window !== 'undefined' ? window.location.pathname : '/contact',
            metadataLines,
          },
        },
      }).catch((e) => console.warn('admin email failed', e));

      setSubmitted({ ticketId: inserted.ticket_id, category, expectedResponse: cat.responseTime });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('contact submit failed', err);
      toast({ title: 'Could not submit', description: err?.message || 'Please try again.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  // -------- success view --------
  if (submitted) {
    const cat = CATEGORIES.find(c => c.key === submitted.category)!;
    const waPrefill = encodeURIComponent(
      `Hi Aireatro Support, I just submitted ticket ${submitted.ticketId} for "${cat.label}". My email: ${data.email}`
    );
    return (
      <div className="min-h-screen bg-background">
        <SeoMeta route="/contact" fallbackTitle="Request received — Aireatro Support" fallbackDescription="Your support request has been received." />
        <Navbar />
        <div className="container mx-auto px-4 py-16 sm:py-24">
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl mx-auto text-center">
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6 ring-4 ring-emerald-500/10">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">Your request has been submitted</h1>
            <p className="text-muted-foreground mb-6">
              Thanks {data.fullName.split(' ')[0]}! Our team has received your request and will be in touch shortly.
            </p>

            <Card className="text-left border-border/60 shadow-lg shadow-primary/5 mb-6">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Ticket ID</div>
                  <div className="flex items-center gap-2">
                    <code className="font-mono text-sm font-bold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-md">{submitted.ticketId}</code>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => { navigator.clipboard?.writeText(submitted.ticketId); toast({ title: 'Copied', description: 'Ticket ID copied to clipboard.' }); }}>
                      <Copy className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Category</span>
                  <span className="font-semibold text-foreground">{cat.label}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Expected response</span>
                  <span className="font-semibold text-foreground">{submitted.expectedResponse}</span>
                </div>
                <p className="text-xs text-muted-foreground pt-2 border-t border-border/50">
                  We've sent a confirmation email to <strong>{data.email}</strong>. Please keep this ticket ID for reference.
                </p>
              </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg" className="gap-2">
                <a href={`https://wa.me/919319711126?text=${waPrefill}`} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="w-4 h-4" /> Chat on WhatsApp
                </a>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="/">Back to Home</a>
              </Button>
            </div>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  // -------- main view --------
  const selectedCat = category ? CATEGORIES.find(c => c.key === category)! : null;

  return (
    <div className="min-h-screen bg-background">
      <SeoMeta
        route="/contact"
        fallbackTitle="Contact Aireatro — Support, Billing & WhatsApp API Help"
        fallbackDescription="Reach the Aireatro team for live chat, demos, technical support, billing, WhatsApp API setup and more. Premium support center with fast response times."
      />
      <Helmet>
        <link rel="canonical" href="https://aireatro.com/contact" />
        <meta name="keywords" content="aireatro contact, whatsapp api support, billing support, technical support, book demo, meta charges help" />
      </Helmet>
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.06] via-background to-background pointer-events-none" />
        <div className="absolute -top-40 -right-32 w-[480px] h-[480px] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-[420px] h-[420px] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />
        <div className="container mx-auto px-4 relative pt-12 pb-10 sm:pt-20 sm:pb-14 text-center">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[11px] sm:text-xs font-semibold tracking-wide uppercase mb-5">
              <Headphones className="w-3.5 h-3.5" /> Aireatro Support Center
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground leading-[1.1] tracking-tight mb-4">
              How can we{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-emerald-500 to-teal-500">help you?</span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-7">
              Choose your enquiry type and our Aireatro team will guide you quickly.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
              {TRUST_BADGES.map(({ icon: Icon, label }) => (
                <div key={label} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border/60 text-xs sm:text-sm text-foreground/80 shadow-sm">
                  <Icon className="w-3.5 h-3.5 text-primary" />
                  {label}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Category cards */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-end justify-between gap-3 mb-6 flex-wrap">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">Pick an enquiry type</h2>
                <p className="text-sm text-muted-foreground">We route your request to the right specialist.</p>
              </div>
              {category ? (
                <Button variant="ghost" size="sm" onClick={() => setCategory(null)} className="gap-1">
                  <X className="w-3.5 h-3.5" /> Reset selection
                </Button>
              ) : null}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {CATEGORIES.map(({ key, label, short, icon: Icon }) => {
                const isSelected = category === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => selectCategory(key)}
                    className={cn(
                      'group relative text-left rounded-2xl border p-4 sm:p-5 transition-all',
                      'bg-card hover:shadow-lg hover:-translate-y-0.5',
                      isSelected
                        ? 'border-primary ring-2 ring-primary/30 shadow-lg shadow-primary/10'
                        : 'border-border/60 hover:border-primary/40'
                    )}
                  >
                    {isSelected && (
                      <span className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </span>
                    )}
                    <div className={cn(
                      'w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center mb-3 transition-colors',
                      isSelected
                        ? 'bg-gradient-to-br from-primary to-emerald-500 text-white shadow-md shadow-primary/30'
                        : 'bg-primary/10 text-primary group-hover:bg-primary/15'
                    )}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="font-semibold text-foreground text-sm sm:text-[15px] mb-1">{label}</div>
                    <div className="text-xs text-muted-foreground leading-snug">{short}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Form */}
      {selectedCat ? (
        <section id="contact-form" className="pb-16 sm:pb-24">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-[1fr_360px] gap-6 lg:gap-8 max-w-6xl mx-auto">
              {/* Form card */}
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="border-border/60 shadow-xl shadow-primary/5 overflow-hidden">
                  <div className="h-1.5 w-full bg-gradient-to-r from-primary via-emerald-500 to-teal-500" />
                  <CardContent className="p-5 sm:p-7">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center shadow-md shadow-primary/30">
                        <selectedCat.icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-foreground">{selectedCat.label}</h3>
                        <p className="text-xs text-muted-foreground">{selectedCat.short} · Reply {selectedCat.responseTime.toLowerCase()}</p>
                      </div>
                    </div>

                    {category === 'live_chat' && (
                      <div className="mb-5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 flex items-start gap-3">
                        <MessageCircle className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                        <div className="flex-1 text-sm">
                          <p className="font-semibold text-foreground mb-1">Need an instant reply?</p>
                          <p className="text-muted-foreground text-xs mb-2">Chat with us on WhatsApp now — fastest way to reach our support team.</p>
                          <Button asChild size="sm" className="gap-1.5 bg-emerald-600 hover:bg-emerald-700">
                            <a href={`https://wa.me/919319711126?text=${encodeURIComponent(`Hi Aireatro Support, I need help with ${selectedCat.label}.`)}`} target="_blank" rel="noopener noreferrer">
                              Open WhatsApp <ArrowRight className="w-3.5 h-3.5" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    )}

                    <form onSubmit={onSubmit} className="space-y-4">
                      {/* Honeypot */}
                      <input type="text" tabIndex={-1} autoComplete="off" value={data.website} onChange={(e) => update('website', e.target.value)}
                        className="hidden" aria-hidden="true" />

                      <div className="grid sm:grid-cols-2 gap-3">
                        <Field label="Full name" required icon={User} error={errors.fullName}>
                          <Input value={data.fullName} onChange={(e) => update('fullName', e.target.value)} placeholder="Jane Doe" className="h-10" />
                        </Field>
                        <Field label="Email" required icon={Mail} error={errors.email}>
                          <Input type="email" value={data.email} onChange={(e) => update('email', e.target.value)} placeholder="you@company.com" className="h-10" />
                        </Field>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-3">
                        <Field label="Phone (with country code)" required icon={PhoneIcon} error={errors.phone}>
                          <Input type="tel" value={data.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+971 50 123 4567" className="h-10" />
                        </Field>
                        <Field label="Business name" icon={Building2}>
                          <Input value={data.businessName ?? ''} onChange={(e) => update('businessName', e.target.value)} placeholder="Acme LLC" className="h-10" />
                        </Field>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-3">
                        <Field label="Country" icon={Globe}>
                          <Input value={data.country ?? ''} onChange={(e) => update('country', e.target.value)} placeholder="United Arab Emirates" className="h-10" />
                        </Field>
                        <Field label="Workspace ID / name (if logged in)" icon={Hash}>
                          <Input value={data.workspaceLabel ?? ''} onChange={(e) => update('workspaceLabel', e.target.value)} placeholder="Optional" className="h-10" />
                        </Field>
                      </div>

                      {/* Category-specific blocks */}
                      {category === 'demo' && (
                        <CatBlock title="Demo preferences">
                          <div className="grid sm:grid-cols-3 gap-3">
                            <Field label="Preferred date">
                              <Input type="date" value={data.preferredDate ?? ''} onChange={(e) => update('preferredDate', e.target.value)} className="h-10" />
                            </Field>
                            <Field label="Preferred time">
                              <Select value={data.preferredTime} onValueChange={(v) => update('preferredTime', v)}>
                                <SelectTrigger className="h-10"><SelectValue placeholder="Pick a slot" /></SelectTrigger>
                                <SelectContent>{TIME_SLOTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                              </Select>
                            </Field>
                            <Field label="Timezone">
                              <Input value={data.timezone ?? ''} onChange={(e) => update('timezone', e.target.value)} className="h-10" />
                            </Field>
                          </div>
                          <div className="grid sm:grid-cols-2 gap-3 mt-3">
                            <Field label="Business type">
                              <Input value={data.businessType ?? ''} onChange={(e) => update('businessType', e.target.value)} placeholder="E.g. eCommerce" className="h-10" />
                            </Field>
                            <Field label="Plan you're interested in">
                              <Select value={data.planInterest} onValueChange={(v) => update('planInterest', v)}>
                                <SelectTrigger className="h-10"><SelectValue placeholder="Select plan" /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="free">Free</SelectItem>
                                  <SelectItem value="basic">Basic</SelectItem>
                                  <SelectItem value="pro">Pro</SelectItem>
                                  <SelectItem value="business">Business</SelectItem>
                                  <SelectItem value="not_sure">Not sure yet</SelectItem>
                                </SelectContent>
                              </Select>
                            </Field>
                          </div>
                        </CatBlock>
                      )}

                      {category === 'billing' && (
                        <CatBlock title="Billing details">
                          <div className="grid sm:grid-cols-3 gap-3">
                            <Field label="Plan name">
                              <Input value={data.planName ?? ''} onChange={(e) => update('planName', e.target.value)} placeholder="Pro Yearly" className="h-10" />
                            </Field>
                            <Field label="Invoice / payment ref">
                              <Input value={data.invoiceRef ?? ''} onChange={(e) => update('invoiceRef', e.target.value)} placeholder="INV-1234" className="h-10" />
                            </Field>
                            <Field label="Issue type">
                              <Select value={data.billingIssueType} onValueChange={(v) => update('billingIssueType', v)}>
                                <SelectTrigger className="h-10"><SelectValue placeholder="Select issue" /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="refund">Refund request</SelectItem>
                                  <SelectItem value="payment_failed">Payment failed</SelectItem>
                                  <SelectItem value="invoice">Need an invoice</SelectItem>
                                  <SelectItem value="upgrade">Plan upgrade / downgrade</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                            </Field>
                          </div>
                        </CatBlock>
                      )}

                      {category === 'whatsapp_api' && (
                        <CatBlock title="WhatsApp API details">
                          <div className="grid sm:grid-cols-3 gap-3">
                            <Field label="WhatsApp phone">
                              <Input value={data.whatsappPhone ?? ''} onChange={(e) => update('whatsappPhone', e.target.value)} placeholder="+971 ..." className="h-10" />
                            </Field>
                            <Field label="WABA ID (if any)">
                              <Input value={data.wabaId ?? ''} onChange={(e) => update('wabaId', e.target.value)} className="h-10" />
                            </Field>
                            <Field label="Connection issue">
                              <Select value={data.whatsappIssue} onValueChange={(v) => update('whatsappIssue', v)}>
                                <SelectTrigger className="h-10"><SelectValue placeholder="Pick issue" /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="cant_connect">Can't connect number</SelectItem>
                                  <SelectItem value="otp_failure">OTP not received</SelectItem>
                                  <SelectItem value="2fa_locked">Locked / 2FA</SelectItem>
                                  <SelectItem value="migration">Migrate from another BSP</SelectItem>
                                  <SelectItem value="green_tick">Green tick / verification</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                            </Field>
                          </div>
                        </CatBlock>
                      )}

                      {category === 'meta_charges' && (
                        <CatBlock title="Meta charges details">
                          <div className="grid sm:grid-cols-3 gap-3">
                            <Field label="Country">
                              <Input value={data.metaCountry ?? ''} onChange={(e) => update('metaCountry', e.target.value)} placeholder="UAE" className="h-10" />
                            </Field>
                            <Field label="Message category">
                              <Select value={data.metaMessageCategory} onValueChange={(v) => update('metaMessageCategory', v)}>
                                <SelectTrigger className="h-10"><SelectValue placeholder="Select" /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="marketing">Marketing</SelectItem>
                                  <SelectItem value="utility">Utility</SelectItem>
                                  <SelectItem value="authentication">Authentication</SelectItem>
                                  <SelectItem value="service">Service</SelectItem>
                                </SelectContent>
                              </Select>
                            </Field>
                            <Field label="Expected monthly volume">
                              <Input value={data.metaVolume ?? ''} onChange={(e) => update('metaVolume', e.target.value)} placeholder="E.g. 50,000" className="h-10" />
                            </Field>
                          </div>
                        </CatBlock>
                      )}

                      <Field label="Subject" icon={Sparkles}>
                        <Input value={data.subject ?? ''} onChange={(e) => update('subject', e.target.value)} placeholder={`E.g. ${selectedCat.label} — short summary`} className="h-10" />
                      </Field>

                      <div className="grid sm:grid-cols-[1fr_180px] gap-3">
                        <Field label="Tell us what's happening" required error={errors.message}>
                          <Textarea
                            value={data.message}
                            onChange={(e) => update('message', e.target.value)}
                            placeholder="Describe your issue, question or what you'd like to achieve…"
                            rows={6}
                            className="resize-none"
                          />
                        </Field>
                        <Field label="Priority" icon={AlertTriangle}>
                          <Select value={data.priority} onValueChange={(v: any) => update('priority', v)}>
                            <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {PRIORITIES.map(p => (
                                <SelectItem key={p.value} value={p.value}>
                                  <span className="flex items-center gap-2">
                                    <span className={cn('inline-block w-2 h-2 rounded-full', {
                                      'bg-emerald-500': p.value === 'low',
                                      'bg-yellow-500': p.value === 'medium',
                                      'bg-orange-500': p.value === 'high',
                                      'bg-red-500': p.value === 'urgent',
                                    })} />
                                    {p.label}
                                  </span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </Field>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs flex items-center gap-1.5"><Upload className="w-3.5 h-3.5" /> Attachment (optional, ≤ 5 MB · image or PDF)</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="file"
                            accept="image/*,application/pdf"
                            onChange={(e) => setAttachment(e.target.files?.[0] ?? null)}
                            className="h-10 file:mr-3 file:rounded-md file:border-0 file:bg-primary/10 file:text-primary file:px-3 file:py-1.5 file:text-xs"
                          />
                          {attachment ? (
                            <Button type="button" variant="ghost" size="sm" onClick={() => setAttachment(null)} className="shrink-0">
                              <X className="w-4 h-4" />
                            </Button>
                          ) : null}
                        </div>
                      </div>

                      <Button type="submit" size="lg" disabled={submitting} className="w-full gap-2 mt-2">
                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        {submitting ? 'Submitting…' : 'Submit request'}
                      </Button>
                      <p className="text-[11px] text-muted-foreground text-center">
                        By submitting, you agree to be contacted by Aireatro about your enquiry. We never share your data.
                      </p>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Side info */}
              <aside className="space-y-4 lg:sticky lg:top-24 self-start">
                <Card className="border-border/60">
                  <CardContent className="p-5">
                    <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">What happens next</div>
                    <ol className="space-y-3 text-sm">
                      <Step n={1} title="We log your request" desc="You'll get a unique ticket ID & email confirmation." />
                      <Step n={2} title="Specialist review" desc={`A ${selectedCat.label.toLowerCase()} expert reviews within ${selectedCat.responseTime.toLowerCase()}.`} />
                      <Step n={3} title="We reply" desc="Over email & WhatsApp until your issue is resolved." />
                    </ol>
                  </CardContent>
                </Card>

                <Card className="border-border/60 bg-gradient-to-br from-primary/5 via-card to-emerald-500/5">
                  <CardContent className="p-5">
                    <Badge variant="secondary" className="mb-2 bg-emerald-500/10 text-emerald-600 border-emerald-500/30">Quick channels</Badge>
                    <div className="space-y-2 text-sm">
                      <a href="https://wa.me/919319711126" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-foreground hover:text-primary">
                        <MessageCircle className="w-4 h-4 text-emerald-600" /> WhatsApp · +91 93197 11126
                      </a>
                      <a href="mailto:support@aireatro.com" className="flex items-center gap-2 text-foreground hover:text-primary">
                        <Mail className="w-4 h-4 text-primary" /> support@aireatro.com
                      </a>
                      <a href="/help" className="flex items-center gap-2 text-foreground hover:text-primary">
                        <LifeBuoy className="w-4 h-4 text-primary" /> Help Center
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </aside>
            </div>
          </div>
        </section>
      ) : (
        <section className="pb-20 text-center">
          <p className="text-sm text-muted-foreground">Pick a category above to start your request.</p>
        </section>
      )}

      <Footer />
    </div>
  );
}

// ----- helpers -----

function Field({
  label, required, icon: Icon, error, children,
}: { label: string; required?: boolean; icon?: any; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5" data-field-error={error ? 'true' : undefined}>
      <Label className={cn(
        "text-xs flex items-center gap-1.5 transition-colors",
        error && "text-rose-600 dark:text-rose-400"
      )}>
        {Icon ? <Icon className={cn("w-3.5 h-3.5 transition-colors", error ? "text-rose-500" : "text-muted-foreground")} /> : null}
        {label} {required ? <span className="text-destructive">*</span> : null}
      </Label>
      <div className={cn(
        error && "[&_input]:border-rose-300 [&_textarea]:border-rose-300 [&_button[role=combobox]]:border-rose-300 [&_input]:ring-rose-200 [&_textarea]:ring-rose-200 dark:[&_input]:border-rose-500/50 dark:[&_textarea]:border-rose-500/50 dark:[&_button[role=combobox]]:border-rose-500/50"
      )}>
        {children}
      </div>
      {error ? (
        <p className="flex items-center gap-1 text-[11px] font-medium text-rose-600 dark:text-rose-400">
          <AlertTriangle className="w-3 h-3" /> {error}
        </p>
      ) : null}
    </div>
  );
}

function CatBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
      <div className="flex items-center gap-1.5 mb-3">
        <Sparkles className="w-3.5 h-3.5 text-primary" />
        <span className="text-xs font-semibold text-foreground">{title}</span>
      </div>
      {children}
    </div>
  );
}

function Step({ n, title, desc }: { n: number; title: string; desc: string }) {
  return (
    <li className="flex items-start gap-3">
      <span className="w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">{n}</span>
      <div>
        <div className="font-semibold text-foreground text-sm">{title}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
    </li>
  );
}
