import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles, UserCheck, LayoutGrid, MessageSquare, ShieldAlert, FileText,
  CreditCard, Gauge, Ban, Lock, Plug, Copyright, Server, Scale, Handshake,
  RefreshCw, Gavel, Mail, Shield, Search, ArrowUp, Printer, Copy, Check,
  ChevronDown, MessageCircleQuestion, BadgeCheck, KeySquare, Eye, Menu,
} from 'lucide-react';
import { SEO } from '@/components/seo';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type Section = {
  id: string;
  number: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  body: React.ReactNode;
};

const LAST_UPDATED = 'May 13, 2026';

const sections: Section[] = [
  {
    id: 'introduction',
    number: '01',
    title: 'Introduction',
    icon: Sparkles,
    body: (
      <>
        <p>
          Welcome to <strong>Aireatro</strong> ("Aireatro", "we", "our", or "us"). These Terms of
          Service ("Terms") govern your access to and use of the Aireatro website, software,
          products, APIs, dashboards, and related services available through{' '}
          <a href="https://aireatro.com" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
            https://aireatro.com
          </a>{' '}
          (collectively, the "Platform").
        </p>
        <p>
          By creating an account, accessing, or using the Platform, you agree to be legally bound by
          these Terms and by our{' '}
          <Link to="/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link>.
          If you do not agree, please do not use the Platform.
        </p>
      </>
    ),
  },
  {
    id: 'eligibility',
    number: '02',
    title: 'Eligibility & Account Registration',
    icon: UserCheck,
    body: (
      <>
        <p>To use Aireatro, you must:</p>
        <ul>
          <li>Be at least 18 years old or of legal age in your jurisdiction</li>
          <li>Use the Platform for legitimate business purposes</li>
          <li>Provide accurate, current, and complete account information</li>
          <li>Keep your credentials secure and confidential</li>
          <li>Be responsible for all activity occurring under your account or workspace</li>
        </ul>
        <p>
          You are responsible for maintaining the security of your login details. Notify us
          immediately at <a href="mailto:support@aireatro.com" className="text-primary hover:underline">support@aireatro.com</a> if you suspect unauthorized access.
        </p>
      </>
    ),
  },
  {
    id: 'platform-services',
    number: '03',
    title: 'Platform Services',
    icon: LayoutGrid,
    body: (
      <>
        <p>Aireatro provides a unified WhatsApp Business API and CRM platform that includes:</p>
        <ul>
          <li>Official WhatsApp Business API integration</li>
          <li>Unified team inbox and conversation management</li>
          <li>Lead capture, qualification, and CRM lifecycle tools</li>
          <li>Marketing campaigns, broadcasts, and message templates</li>
          <li>AI-powered automation, chatbots, and workflows</li>
          <li>Meta Ads attribution and click-to-WhatsApp tools</li>
          <li>Integrations with third-party services (Shopify, Razorpay, Zapier, etc.)</li>
          <li>Analytics, reporting, and audit logs</li>
        </ul>
        <p>
          We may add, modify, or discontinue features at any time. New features may be subject to
          additional terms communicated within the Platform.
        </p>
      </>
    ),
  },
  {
    id: 'meta-compliance',
    number: '04',
    title: 'WhatsApp & Meta Compliance',
    icon: MessageSquare,
    body: (
      <>
        <p>
          Aireatro operates on top of the WhatsApp Business Platform provided by Meta. By using
          the Platform, you agree to comply with:
        </p>
        <ul>
          <li>
            <a href="https://business.whatsapp.com/policy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              WhatsApp Business Messaging Policy
            </a>
          </li>
          <li>
            <a href="https://www.whatsapp.com/legal/business-terms" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              WhatsApp Business Solution Terms
            </a>
          </li>
          <li>
            <a href="https://www.whatsapp.com/legal/commerce-policy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              WhatsApp Commerce Policy
            </a>
          </li>
          <li>
            <a href="https://www.facebook.com/communitystandards/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              Meta Community Standards
            </a>
          </li>
        </ul>
        <p>
          Violation of any Meta or WhatsApp policy may result in template rejections, messaging
          restrictions, quality rating downgrades, or termination of your WhatsApp Business
          Account — actions enforced by Meta and outside Aireatro's control.
        </p>
      </>
    ),
  },
  {
    id: 'user-responsibilities',
    number: '05',
    title: 'User Responsibilities',
    icon: ShieldAlert,
    body: (
      <>
        <p>You agree NOT to use the Platform to:</p>
        <ul>
          <li>Send spam, unsolicited messages, or bulk messages without consent</li>
          <li>Engage in scams, phishing, or fraudulent activities</li>
          <li>Harass, threaten, or abuse recipients</li>
          <li>Distribute malware, viruses, or harmful code</li>
          <li>Promote illegal products or services</li>
          <li>Violate intellectual property or privacy rights of others</li>
          <li>Misrepresent your identity, business, or affiliation</li>
          <li>Reverse-engineer, scrape, or attempt to bypass platform security</li>
        </ul>
        <p>
          You are solely responsible for ensuring that your contacts have provided lawful opt-in
          consent before being messaged.
        </p>
      </>
    ),
  },
  {
    id: 'messaging-content',
    number: '06',
    title: 'Messaging & Content',
    icon: FileText,
    body: (
      <>
        <p>
          You retain full ownership of your messages, templates, contacts, lead data, campaigns,
          and any content you upload to Aireatro. You are solely responsible for:
        </p>
        <ul>
          <li>The accuracy and legality of your content</li>
          <li>Obtaining valid consent from your contacts</li>
          <li>Compliance with applicable data protection laws (GDPR, CCPA, etc.)</li>
          <li>Honoring opt-out and unsubscribe requests promptly</li>
        </ul>
        <p>
          <strong>Aireatro does not own, sell, or monetize your customer data.</strong> We process
          your content solely to deliver the Platform services.
        </p>
      </>
    ),
  },
  {
    id: 'subscription-billing',
    number: '07',
    title: 'Subscription & Billing',
    icon: CreditCard,
    body: (
      <>
        <p>
          Aireatro offers a free tier and paid subscription plans (Basic, Pro, and Business).
          Pricing, billing cycles, and feature entitlements are displayed on our{' '}
          <Link to="/pricing" className="text-primary hover:underline">Pricing page</Link>.
        </p>
        <h3>A. Payments</h3>
        <ul>
          <li>Paid plans are billed in advance on a monthly or annual cycle</li>
          <li>Payments are processed through trusted third-party gateways</li>
          <li>All fees are exclusive of applicable taxes unless stated otherwise</li>
        </ul>
        <h3>B. Meta Conversation Charges</h3>
        <p>
          Meta charges separately for conversations initiated through the WhatsApp Business
          Platform. These charges are billed directly by Meta (or pre-funded via Aireatro message
          credits) and are independent of your Aireatro subscription.
        </p>
        <h3>C. Upgrades, Downgrades & Cancellation</h3>
        <ul>
          <li>You may upgrade, downgrade, or cancel your plan anytime from your dashboard</li>
          <li>Downgrades take effect at the end of the current billing cycle</li>
          <li>Subscription fees paid are non-refundable except where required by law</li>
        </ul>
      </>
    ),
  },
  {
    id: 'fair-usage',
    number: '08',
    title: 'Fair Usage Policy',
    icon: Gauge,
    body: (
      <>
        <p>
          To ensure platform reliability for all customers, you agree to use the Platform within
          reasonable limits. Prohibited activities include:
        </p>
        <ul>
          <li>Excessive API calls or automation that overload our infrastructure</li>
          <li>Using the Platform to operate a competing messaging service</li>
          <li>Creating multiple accounts to bypass plan limits</li>
          <li>Suspicious traffic patterns or bot-driven abuse</li>
        </ul>
        <p>
          We reserve the right to throttle, suspend, or terminate accounts engaging in unfair usage
          to protect the integrity of the Platform.
        </p>
      </>
    ),
  },
  {
    id: 'suspension-termination',
    number: '09',
    title: 'Account Suspension & Termination',
    icon: Ban,
    body: (
      <>
        <p>We may restrict, suspend, or terminate your account if:</p>
        <ul>
          <li>You violate these Terms or any Meta/WhatsApp policy</li>
          <li>You engage in fraudulent, abusive, or illegal activities</li>
          <li>Your account remains unpaid beyond the grace period</li>
          <li>Continued use poses a security or legal risk to Aireatro or others</li>
        </ul>
        <p>
          You may terminate your account at any time from your workspace settings. Upon
          termination, your access to the Platform will end and your data may be deleted in
          accordance with our{' '}
          <Link to="/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link>.
        </p>
      </>
    ),
  },
  {
    id: 'data-privacy',
    number: '10',
    title: 'Data Privacy & Security',
    icon: Lock,
    body: (
      <>
        <p>
          We take data protection seriously. Our security practices include SSL encryption,
          encrypted password storage, role-based access controls, audit logs, firewalls, and
          continuous monitoring.
        </p>
        <p>
          For full details on what we collect and how we handle it, please review our{' '}
          <Link to="/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link>.
          Your use of the Platform is also governed by that document.
        </p>
      </>
    ),
  },
  {
    id: 'third-party',
    number: '11',
    title: 'Third-Party Integrations',
    icon: Plug,
    body: (
      <>
        <p>
          The Platform may integrate with third-party services such as Meta, WhatsApp, Google,
          Shopify, Razorpay, payment gateways, and cloud infrastructure providers.
        </p>
        <ul>
          <li>You are responsible for complying with those third parties' terms</li>
          <li>We are not liable for any third-party service outages or policy changes</li>
          <li>Connecting a third-party account authorizes Aireatro to access required data</li>
        </ul>
      </>
    ),
  },
  {
    id: 'intellectual-property',
    number: '12',
    title: 'Intellectual Property',
    icon: Copyright,
    body: (
      <>
        <p>
          The Aireatro Platform, including its software, source code, design, branding, logos,
          documentation, and content, is owned by Aireatro and protected by copyright, trademark,
          and other intellectual property laws.
        </p>
        <ul>
          <li>You may not copy, modify, redistribute, or create derivative works of the Platform</li>
          <li>You may not use Aireatro branding without written permission</li>
          <li>You retain ownership of all data and content you upload</li>
        </ul>
      </>
    ),
  },
  {
    id: 'service-availability',
    number: '13',
    title: 'Service Availability',
    icon: Server,
    body: (
      <>
        <p>
          We strive to keep Aireatro available 24/7 with high uptime, but we do not guarantee
          uninterrupted access. The Platform may be temporarily unavailable due to:
        </p>
        <ul>
          <li>Scheduled maintenance windows (announced in advance when possible)</li>
          <li>Emergency security patches or infrastructure upgrades</li>
          <li>Outages affecting Meta, WhatsApp, or third-party providers</li>
          <li>Events beyond our reasonable control (force majeure)</li>
        </ul>
      </>
    ),
  },
  {
    id: 'limitation-liability',
    number: '14',
    title: 'Limitation of Liability',
    icon: Scale,
    body: (
      <>
        <p>
          To the fullest extent permitted by law, Aireatro and its affiliates shall not be liable
          for any indirect, incidental, special, consequential, or punitive damages, including loss
          of profits, revenue, data, or business opportunities, arising from your use of or
          inability to use the Platform.
        </p>
        <p>
          Aireatro's total liability for any claim related to the Platform shall not exceed the
          amount you paid for your subscription in the three (3) months preceding the claim.
        </p>
      </>
    ),
  },
  {
    id: 'indemnification',
    number: '15',
    title: 'Indemnification',
    icon: Handshake,
    body: (
      <>
        <p>
          You agree to indemnify and hold harmless Aireatro, its officers, employees, partners, and
          affiliates from any claims, damages, liabilities, or expenses (including legal fees)
          arising out of:
        </p>
        <ul>
          <li>Your use or misuse of the Platform</li>
          <li>Your violation of these Terms or applicable laws</li>
          <li>Your messages, content, or campaigns sent through the Platform</li>
          <li>Your infringement of any third-party rights</li>
        </ul>
      </>
    ),
  },
  {
    id: 'changes',
    number: '16',
    title: 'Changes to Services or Terms',
    icon: RefreshCw,
    body: (
      <>
        <p>
          We may update these Terms or modify the Platform at any time to reflect new features,
          legal requirements, or operational changes. When we make material changes, we will:
        </p>
        <ul>
          <li>Update the "Last Updated" date at the top of this page</li>
          <li>Notify you via email or in-app notification when appropriate</li>
        </ul>
        <p>Continued use of the Platform after changes take effect constitutes acceptance.</p>
      </>
    ),
  },
  {
    id: 'governing-law',
    number: '17',
    title: 'Governing Law',
    icon: Gavel,
    body: (
      <>
        <p>
          These Terms shall be governed by and construed in accordance with applicable laws of the
          jurisdiction where Aireatro is headquartered, without regard to conflict-of-law
          principles.
        </p>
        <p>
          Any disputes arising from these Terms or your use of the Platform shall be resolved
          through good-faith negotiation. If unresolved, disputes shall be submitted to the
          exclusive jurisdiction of the competent courts in our headquarters' jurisdiction.
        </p>
      </>
    ),
  },
  {
    id: 'contact',
    number: '18',
    title: 'Contact Information',
    icon: Mail,
    body: (
      <>
        <p>If you have any questions, concerns, or feedback about these Terms, please contact us:</p>
        <p>
          <strong>Aireatro</strong><br />
          Website:{' '}
          <a href="https://aireatro.com" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
            https://aireatro.com
          </a>
          <br />
          Email:{' '}
          <a href="mailto:support@aireatro.com" className="text-primary hover:underline">
            support@aireatro.com
          </a>
        </p>
        <p className="text-sm text-muted-foreground">
          By accessing or using Aireatro, you confirm that you have read, understood, and agreed to
          these Terms of Service.
        </p>
      </>
    ),
  },
];

const trustBadges = [
  { icon: Shield, label: 'Secure Platform' },
  { icon: MessageSquare, label: 'WhatsApp API Ready' },
  { icon: BadgeCheck, label: 'Business Compliant' },
  { icon: KeySquare, label: 'Enterprise Security' },
];

export default function Terms() {
  const { toast } = useToast();
  const [activeId, setActiveId] = useState<string>(sections[0].id);
  const [progress, setProgress] = useState(0);
  const [showTop, setShowTop] = useState(false);
  const [query, setQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [mobileTocOpen, setMobileTocOpen] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0);
      setShowTop(scrollTop > 600);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    observerRef.current?.disconnect();
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: '-30% 0px -55% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] }
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    observerRef.current = observer;
    return () => observer.disconnect();
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return sections;
    const q = query.toLowerCase();
    return sections.filter((s) => s.title.toLowerCase().includes(q));
  }, [query]);

  const handleScrollTo = (id: string) => {
    setMobileTocOpen(false);
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 96;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  const handleCopy = (id: string) => {
    const url = `${window.location.origin}/terms#${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast({ title: 'Link copied', description: 'Section URL copied to clipboard.' });
    setTimeout(() => setCopiedId(null), 1800);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-x-clip">
      <SEO
        title="Terms of Service — Transparent & Secure | AiReatro"
        description="Aireatro's Terms of Service for our WhatsApp Business API and CRM platform. Clear, transparent, and built for enterprise trust."
        keywords={['terms of service', 'terms and conditions', 'WhatsApp API terms', 'aireatro legal']}
        canonical="/terms"
      />
      <Navbar />

      {/* Reading progress bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-transparent z-50 pointer-events-none">
        <div
          className="h-full bg-gradient-to-r from-primary via-emerald-400 to-primary transition-[width] duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Animated background orbs */}
      <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-24 h-[480px] w-[480px] rounded-full bg-primary/15 blur-3xl animate-pulse" />
        <div className="absolute top-[40%] -right-32 h-[520px] w-[520px] rounded-full bg-emerald-500/10 blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
        <div className="absolute bottom-0 left-1/3 h-[420px] w-[420px] rounded-full bg-sky-500/10 blur-3xl animate-pulse" style={{ animationDelay: '3s' }} />
        <div
          className="absolute inset-0 opacity-[0.04] dark:opacity-[0.06]"
          style={{
            backgroundImage:
              'linear-gradient(to right, hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--foreground)) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
            maskImage: 'radial-gradient(ellipse at top, black 30%, transparent 70%)',
          }}
        />
      </div>

      {/* Hero */}
      <header className="relative pt-16 pb-12 md:pt-24 md:pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 backdrop-blur-md px-4 py-1.5 text-xs font-medium text-muted-foreground shadow-sm animate-fade-in">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            Last Updated · {LAST_UPDATED}
          </div>

          <h1 className="mt-6 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground animate-fade-in">
            Terms of{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-emerald-500 to-teal-500">
              Service
            </span>
          </h1>

          <p className="mt-5 max-w-2xl mx-auto text-base sm:text-lg text-muted-foreground leading-relaxed animate-fade-in">
            Clear, transparent, and secure terms for using Aireatro's WhatsApp API and CRM
            platform.
          </p>

          {/* Trust badges */}
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
            {trustBadges.map((b, i) => (
              <div
                key={b.label}
                className="group flex items-center gap-2.5 rounded-2xl border border-border/60 bg-card/70 backdrop-blur-md px-4 py-3 shadow-sm hover:shadow-md hover:border-primary/40 transition-all animate-fade-in"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                  <b.icon className="h-4 w-4" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-foreground text-left">{b.label}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button variant="outline" size="sm" onClick={() => window.print()} className="rounded-full">
              <Printer className="h-4 w-4 mr-2" /> Print / Save PDF
            </Button>
            <Button asChild size="sm" className="rounded-full shadow-md shadow-primary/20">
              <a href="#introduction">
                Read the terms <ChevronDown className="h-4 w-4 ml-1.5" />
              </a>
            </Button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 pb-24">
        <div className="grid lg:grid-cols-[280px_1fr] gap-10">
          {/* Desktop TOC */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <div className="rounded-2xl border border-border/60 bg-card/70 backdrop-blur-md p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Eye className="h-4 w-4 text-primary" />
                  <h2 className="text-sm font-semibold text-foreground">On this page</h2>
                </div>

                <div className="relative mb-3">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search terms…"
                    className="h-8 pl-8 text-xs bg-background/60"
                  />
                </div>

                <nav className="max-h-[60vh] overflow-y-auto -mr-2 pr-2 space-y-0.5">
                  {filtered.map((s) => {
                    const active = activeId === s.id;
                    return (
                      <button
                        key={s.id}
                        onClick={() => handleScrollTo(s.id)}
                        className={cn(
                          'group w-full text-left flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs transition-all',
                          active
                            ? 'bg-primary/10 text-primary font-semibold'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        )}
                      >
                        <span
                          className={cn(
                            'inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[10px] font-mono',
                            active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground group-hover:bg-background'
                          )}
                        >
                          {s.number}
                        </span>
                        <span className="truncate">{s.title}</span>
                      </button>
                    );
                  })}
                  {filtered.length === 0 && (
                    <p className="text-xs text-muted-foreground py-3 text-center">No matches</p>
                  )}
                </nav>

                <div className="mt-4 pt-4 border-t border-border/60">
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1.5">
                    <span>Reading progress</span>
                    <span className="font-mono">{Math.round(progress)}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-emerald-400 transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Mobile TOC */}
          <div className="lg:hidden sticky top-16 z-30 -mx-4 px-4 py-3 bg-background/80 backdrop-blur-md border-y border-border/60">
            <Sheet open={mobileTocOpen} onOpenChange={setMobileTocOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="w-full justify-between rounded-full">
                  <span className="flex items-center gap-2">
                    <Menu className="h-4 w-4" /> {sections.find((s) => s.id === activeId)?.title || 'Table of contents'}
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">{Math.round(progress)}%</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="rounded-t-2xl max-h-[80vh]">
                <SheetHeader className="text-left">
                  <SheetTitle className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-primary" /> On this page
                  </SheetTitle>
                </SheetHeader>
                <div className="relative my-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search terms…"
                    className="pl-9"
                  />
                </div>
                <nav className="space-y-1 overflow-y-auto pb-6">
                  {filtered.map((s) => {
                    const active = activeId === s.id;
                    return (
                      <button
                        key={s.id}
                        onClick={() => handleScrollTo(s.id)}
                        className={cn(
                          'w-full text-left flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition-all',
                          active ? 'bg-primary/10 text-primary font-semibold' : 'text-foreground hover:bg-muted'
                        )}
                      >
                        <span className={cn(
                          'inline-flex h-7 w-7 items-center justify-center rounded-lg text-xs font-mono',
                          active ? 'bg-primary text-primary-foreground' : 'bg-muted'
                        )}>
                          {s.number}
                        </span>
                        {s.title}
                      </button>
                    );
                  })}
                </nav>
              </SheetContent>
            </Sheet>
          </div>

          {/* Sections */}
          <article className="min-w-0 space-y-6">
            {sections.map((s, idx) => (
              <section
                key={s.id}
                id={s.id}
                className="group scroll-mt-24 relative rounded-3xl border border-border/60 bg-card/80 backdrop-blur-md p-6 sm:p-8 lg:p-10 shadow-sm hover:shadow-lg hover:border-primary/30 transition-all animate-fade-in"
              >
                <div
                  aria-hidden
                  className="absolute -top-px -left-px h-24 w-24 rounded-tl-3xl bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                />

                <div className="flex items-start gap-4 sm:gap-5 mb-5">
                  <div className="relative shrink-0">
                    <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-md opacity-60" />
                    <div className="relative flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-emerald-500 text-primary-foreground shadow-lg shadow-primary/20">
                      <s.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono font-semibold text-primary tracking-wider">
                        SECTION {s.number}
                      </span>
                      <button
                        onClick={() => handleCopy(s.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
                        aria-label="Copy link to section"
                      >
                        {copiedId === s.id ? (
                          <><Check className="h-3 w-3" /> Copied</>
                        ) : (
                          <><Copy className="h-3 w-3" /> Copy link</>
                        )}
                      </button>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                      {s.title}
                    </h2>
                  </div>
                </div>

                <div className="prose prose-neutral dark:prose-invert max-w-none prose-p:text-muted-foreground prose-p:leading-relaxed prose-li:text-muted-foreground prose-h3:text-foreground prose-h3:text-base prose-h3:font-semibold prose-h3:mt-6 prose-h3:mb-2 prose-strong:text-foreground prose-ul:my-3 prose-li:my-1">
                  {s.body}
                </div>

                {idx < sections.length - 1 && (
                  <div className="mt-8 -mb-2 flex items-center gap-3 opacity-60">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
                    <Lock className="h-3 w-3 text-muted-foreground" />
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
                  </div>
                )}
              </section>
            ))}

            {/* Footer CTA */}
            <section className="relative mt-12 overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-primary/5 via-card to-emerald-500/5 backdrop-blur-md p-8 sm:p-12 text-center shadow-lg">
              <div aria-hidden className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
              <div aria-hidden className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl" />

              <div className="relative">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-emerald-500 text-primary-foreground shadow-lg shadow-primary/30 mb-5">
                  <Shield className="h-6 w-6" />
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground tracking-tight">
                  Built for Secure Business Communication
                </h2>
                <p className="mt-3 max-w-2xl mx-auto text-muted-foreground">
                  Aireatro helps businesses communicate responsibly and securely using official
                  WhatsApp Business APIs.
                </p>
                <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                  <Button asChild size="lg" className="rounded-full shadow-md shadow-primary/20">
                    <Link to="/contact">
                      <Mail className="h-4 w-4 mr-2" /> Contact Support
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="rounded-full">
                    <Link to="/">Explore Platform</Link>
                  </Button>
                  <Button asChild variant="ghost" size="lg" className="rounded-full">
                    <Link to="/privacy-policy">Privacy Policy</Link>
                  </Button>
                </div>

                <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-2 max-w-2xl mx-auto">
                  {[
                    { icon: Server, label: 'Secure Infrastructure' },
                    { icon: MessageSquare, label: 'Official WhatsApp API' },
                    { icon: BadgeCheck, label: 'GDPR-Friendly' },
                    { icon: Shield, label: 'Business Ready' },
                  ].map((b) => (
                    <div key={b.label} className="flex items-center gap-2 rounded-xl border border-border/50 bg-card/60 px-3 py-2 text-xs text-muted-foreground">
                      <b.icon className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="truncate">{b.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </article>
        </div>
      </main>

      {/* Floating actions */}
      <div className="fixed bottom-5 right-5 z-40 flex flex-col gap-2.5 print:hidden">
        {showTop && (
          <Button
            size="icon"
            variant="outline"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="h-11 w-11 rounded-full shadow-lg backdrop-blur-md bg-card/80 hover:scale-110 transition-transform animate-fade-in"
            aria-label="Back to top"
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
        )}
        <Button
          asChild
          size="icon"
          className="h-12 w-12 rounded-full shadow-xl shadow-primary/30 bg-gradient-to-br from-primary to-emerald-500 hover:scale-110 transition-transform"
          aria-label="Get help"
        >
          <Link to="/help">
            <MessageCircleQuestion className="h-5 w-5" />
          </Link>
        </Button>
      </div>

      <Footer />
    </div>
  );
}
