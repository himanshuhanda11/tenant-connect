import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield, Lock, Database, Share2, Cookie, Globe, Baby, RefreshCw,
  Mail, FileCheck, Users, MessageSquare, Eye, Search, ArrowUp,
  Printer, Copy, Check, ChevronDown, MessageCircleQuestion,
  Sparkles, BadgeCheck, KeySquare, ServerCog, Menu, X,
} from 'lucide-react';
import { SEO } from '@/components/seo';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
          Welcome to <strong>Aireatro</strong> ("Aireatro", "we", "our", or "us"). This Privacy
          Policy explains how we collect, use, store, process, and protect your information when
          you use our website, software, products, and services available through{' '}
          <a href="https://aireatro.com" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
            https://aireatro.com
          </a>{' '}
          (the "Platform").
        </p>
        <p>
          Aireatro is a WhatsApp Business API and CRM platform that helps businesses automate
          communication, manage customer conversations, generate leads, and improve customer
          engagement using WhatsApp and other integrated services.
        </p>
        <p>By accessing or using our Platform, you agree to the practices described in this Privacy Policy.</p>
      </>
    ),
  },
  {
    id: 'information-we-collect',
    number: '02',
    title: 'Information We Collect',
    icon: Database,
    body: (
      <>
        <p>We may collect the following categories of information:</p>
        <h3>A. Account Information</h3>
        <ul>
          <li>Full name</li>
          <li>Email address</li>
          <li>Password (encrypted)</li>
          <li>Phone number</li>
          <li>Business or company name</li>
          <li>Billing details</li>
        </ul>
        <h3>B. Workspace &amp; Team Information</h3>
        <ul>
          <li>Workspace names</li>
          <li>Team member details</li>
          <li>Roles and permissions</li>
          <li>Connected business accounts</li>
        </ul>
        <h3>C. WhatsApp &amp; Messaging Data</h3>
        <ul>
          <li>WhatsApp phone numbers</li>
          <li>Customer contact numbers</li>
          <li>Message templates</li>
          <li>Message metadata &amp; conversation timestamps</li>
          <li>Automation workflows</li>
          <li>Media files shared through WhatsApp</li>
        </ul>
        <p><strong>Aireatro does not claim ownership of your customer data or conversations.</strong></p>
        <h3>D. Usage &amp; Device Information</h3>
        <ul>
          <li>IP address, browser type, device information, operating system</li>
          <li>Login activity, pages visited, usage analytics and diagnostics</li>
        </ul>
        <h3>E. Cookies &amp; Tracking Technologies</h3>
        <ul>
          <li>Maintain secure sessions</li>
          <li>Improve performance</li>
          <li>Analyze traffic and usage trends</li>
          <li>Personalize user experience</li>
        </ul>
      </>
    ),
  },
  {
    id: 'how-we-use',
    number: '03',
    title: 'How We Use Your Information',
    icon: ServerCog,
    body: (
      <>
        <p>We use your information to:</p>
        <ul>
          <li>Provide and operate the Aireatro Platform</li>
          <li>Enable WhatsApp Business API messaging</li>
          <li>Process customer conversations and automation workflows</li>
          <li>Improve platform performance and security</li>
          <li>Send account notifications and transactional emails</li>
          <li>Provide customer support and technical assistance</li>
          <li>Monitor usage patterns and detect fraud or abuse</li>
          <li>Comply with legal obligations</li>
          <li>Develop new products, features, and integrations</li>
        </ul>
        <p><strong>We do not sell your personal information to third parties.</strong></p>
      </>
    ),
  },
  {
    id: 'meta-whatsapp',
    number: '04',
    title: 'WhatsApp & Meta Integration',
    icon: MessageSquare,
    body: (
      <>
        <p>
          Aireatro integrates with services provided by Meta, including the WhatsApp Business
          Platform. By using Aireatro, you acknowledge and agree that:
        </p>
        <ul>
          <li>Your data may be processed through Meta's infrastructure</li>
          <li>WhatsApp conversations are subject to Meta's policies and terms</li>
          <li>Meta may independently process certain technical and messaging data</li>
        </ul>
        <p>We recommend reviewing:</p>
        <ul>
          <li>
            <a href="https://www.facebook.com/privacy/policy" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
              Meta Privacy Policy
            </a>
          </li>
          <li>
            <a href="https://business.whatsapp.com/products/business-platform" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
              WhatsApp Business Terms
            </a>
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'data-security',
    number: '05',
    title: 'Data Security',
    icon: Shield,
    body: (
      <>
        <p>We implement industry-standard technical and organizational safeguards, including:</p>
        <ul>
          <li>SSL encryption</li>
          <li>Secure database infrastructure</li>
          <li>Access controls and authentication</li>
          <li>Firewall and monitoring systems</li>
          <li>Encrypted password storage</li>
          <li>Role-based permissions</li>
        </ul>
        <p>
          While we strive to protect your data, no method of transmission or storage is completely
          secure. Users are responsible for maintaining the confidentiality of their account
          credentials.
        </p>
      </>
    ),
  },
  {
    id: 'data-retention',
    number: '06',
    title: 'Data Retention',
    icon: FileCheck,
    body: (
      <>
        <p>We retain information only for as long as necessary to:</p>
        <ul>
          <li>Provide our services</li>
          <li>Maintain operational records</li>
          <li>Comply with legal obligations</li>
          <li>Resolve disputes</li>
          <li>Enforce agreements</li>
        </ul>
        <p>
          You may request account deletion at any time by contacting us. Upon deletion request, we
          will remove or anonymize applicable data unless retention is legally required.
        </p>
      </>
    ),
  },
  {
    id: 'your-rights',
    number: '07',
    title: 'Your Rights & Choices',
    icon: Users,
    body: (
      <>
        <p>Depending on your location and applicable laws, you may have rights to:</p>
        <ul>
          <li>Access your personal information</li>
          <li>Correct inaccurate information</li>
          <li>Delete your data</li>
          <li>Restrict or object to processing</li>
          <li>Export your data</li>
          <li>Withdraw consent where applicable</li>
        </ul>
        <p>To exercise your rights, contact us using the details below.</p>
      </>
    ),
  },
  {
    id: 'cookies',
    number: '08',
    title: 'Cookies Policy',
    icon: Cookie,
    body: (
      <>
        <p>
          We use cookies and similar technologies to maintain secure sessions, improve performance,
          analyze traffic, and personalize the experience. You may disable cookies through your
          browser settings; however, some features may not function properly.
        </p>
        <p>
          For more details, see our{' '}
          <Link to="/cookie-policy" className="text-primary hover:underline">Cookie Policy</Link>.
        </p>
      </>
    ),
  },
  {
    id: 'third-party',
    number: '09',
    title: 'Third-Party Services',
    icon: Share2,
    body: (
      <>
        <p>
          Our Platform may contain links or integrations with third-party websites or services.
          Aireatro is not responsible for the privacy practices, content, or policies of
          third-party platforms.
        </p>
        <p>
          Trusted third-party providers help us operate the Platform, including cloud hosting,
          payment processors, email delivery, analytics, and customer support tools. We may also
          disclose information when required by law or to protect Aireatro, users, or others.
        </p>
        <p><strong>We do not rent or sell user databases to advertisers or third parties.</strong></p>
      </>
    ),
  },
  {
    id: 'international',
    number: '10',
    title: 'International Data Transfers',
    icon: Globe,
    body: (
      <>
        <p>
          Your information may be processed and stored in countries other than your own, including
          locations where our service providers maintain infrastructure.
        </p>
        <p>By using Aireatro, you consent to such international transfers where permitted by law.</p>
      </>
    ),
  },
  {
    id: 'children',
    number: '11',
    title: "Children's Privacy",
    icon: Baby,
    body: (
      <>
        <p>
          Aireatro is intended for business and professional use only and is not directed toward
          children under the age of 13 (or the minimum age required in your jurisdiction).
        </p>
        <p>We do not knowingly collect personal information from children.</p>
      </>
    ),
  },
  {
    id: 'changes',
    number: '12',
    title: 'Changes to This Policy',
    icon: RefreshCw,
    body: (
      <>
        <p>
          We may update this Privacy Policy periodically to reflect changes in our services, legal
          requirements, or operational practices. When updates are made, the revised version will
          be posted on this page and the "Last Updated" date will be changed accordingly.
        </p>
        <p>Continued use of the Platform after updates constitutes acceptance of the revised policy.</p>
      </>
    ),
  },
  {
    id: 'contact',
    number: '13',
    title: 'Contact Information',
    icon: Mail,
    body: (
      <>
        <p>If you have any questions, concerns, or requests regarding this Privacy Policy or your data, please contact us:</p>
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
          this Privacy Policy.
        </p>
      </>
    ),
  },
];

const trustBadges = [
  { icon: Shield, label: 'Secure Platform' },
  { icon: BadgeCheck, label: 'GDPR Friendly' },
  { icon: MessageSquare, label: 'WhatsApp API Compliant' },
  { icon: KeySquare, label: 'Encrypted Infrastructure' },
];

export default function PrivacyPolicy() {
  const { toast } = useToast();
  const [activeId, setActiveId] = useState<string>(sections[0].id);
  const [progress, setProgress] = useState(0);
  const [showTop, setShowTop] = useState(false);
  const [query, setQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [mobileTocOpen, setMobileTocOpen] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Scroll progress + back-to-top
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

  // Active section observer
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
    const url = `${window.location.origin}/privacy-policy#${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast({ title: 'Link copied', description: 'Section URL copied to clipboard.' });
    setTimeout(() => setCopiedId(null), 1800);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-x-clip">
      <SEO
        title="Privacy Policy — Enterprise-grade Trust | AiReatro"
        description="How AiReatro collects, uses, and safeguards your data. GDPR-friendly, encrypted infrastructure, WhatsApp Business API compliant."
        keywords={['privacy policy', 'data protection', 'GDPR', 'WhatsApp API privacy', 'aireatro']}
        canonical="/privacy-policy"
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
            Privacy{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-emerald-500 to-teal-500">
              Policy
            </span>
          </h1>

          <p className="mt-5 max-w-2xl mx-auto text-base sm:text-lg text-muted-foreground leading-relaxed animate-fade-in">
            Trust, security, and transparent data protection — at the heart of every conversation
            you run through Aireatro.
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

          {/* Hero actions */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button variant="outline" size="sm" onClick={() => window.print()} className="rounded-full">
              <Printer className="h-4 w-4 mr-2" /> Print / Save PDF
            </Button>
            <Button asChild size="sm" className="rounded-full shadow-md shadow-primary/20">
              <a href="#introduction">
                Read the policy <ChevronDown className="h-4 w-4 ml-1.5" />
              </a>
            </Button>
          </div>
        </div>
      </header>

      {/* Main content + sticky TOC */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 pb-24">
        <div className="grid lg:grid-cols-[280px_1fr] gap-10">
          {/* Sticky TOC — desktop */}
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
                    placeholder="Search policy…"
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

          {/* Mobile TOC trigger */}
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
                    placeholder="Search policy…"
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
                {/* Decorative corner gradient */}
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
                  Your Data Security Matters to Us
                </h2>
                <p className="mt-3 max-w-2xl mx-auto text-muted-foreground">
                  Aireatro is committed to protecting your business and customer communications
                  with enterprise-grade security.
                </p>
                <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                  <Button asChild size="lg" className="rounded-full shadow-md shadow-primary/20">
                    <Link to="/contact">
                      <Mail className="h-4 w-4 mr-2" /> Contact Support
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="rounded-full">
                    <Link to="/">Visit Homepage</Link>
                  </Button>
                </div>

                <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
                  <Link to="/terms" className="hover:text-primary story-link">Terms of Service</Link>
                  <Link to="/cookie-policy" className="hover:text-primary story-link">Cookie Policy</Link>
                  <Link to="/data-deletion" className="hover:text-primary story-link">Data Deletion</Link>
                  <Link to="/security" className="hover:text-primary story-link">Security</Link>
                </div>
              </div>
            </section>
          </article>
        </div>
      </main>

      {/* Floating action buttons */}
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
