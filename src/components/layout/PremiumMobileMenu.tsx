import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, ChevronDown, ChevronRight, ArrowRight, Sparkles, Zap, Bot, Inbox, Users,
  FileText, Megaphone, BarChart3, Phone, UserCog, ClipboardList, Plug, MousePointer,
  TrendingUp, BookOpen, HelpCircle, Building2, MessageSquare, Globe, Shield,
  Twitter, Linkedin, Instagram, Youtube, Sun, Moon, CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import aireatroLogo from '@/assets/aireatro-logo.png';

interface MenuItem { name: string; href: string; icon: any; description?: string; badge?: string; }
interface Props { open: boolean; onClose: () => void; }

const whatsappProducts: MenuItem[] = [
  { name: 'WhatsApp Business API', href: '/whatsapp-business-api', icon: Zap, description: 'Official Cloud API', badge: 'Popular' },
  { name: 'Click to WhatsApp App', href: '/click-to-whatsapp', icon: MousePointer, description: 'Convert clicks to chats' },
  { name: 'Why WhatsApp Marketing', href: '/why-whatsapp-marketing', icon: TrendingUp, description: 'ROI & conversions' },
  { name: 'WhatsApp Forms', href: '/whatsapp-forms', icon: FileText, description: 'In-chat data collection' },
];
const featuresCore: MenuItem[] = [
  { name: 'Unified Inbox', href: '/features/inbox', icon: Inbox, description: 'All chats in one view' },
  { name: 'Contacts & Segments', href: '/features/contacts', icon: Users, description: 'Manage your audience' },
  { name: 'Templates', href: '/features/templates', icon: FileText, description: 'Pre-approved messages' },
  { name: 'Campaigns', href: '/features/campaigns', icon: Megaphone, description: 'Broadcast at scale' },
];
const featuresAdvanced: MenuItem[] = [
  { name: 'Automation', href: '/features/automation', icon: Bot, description: 'Workflows & AI bots', badge: 'AI' },
  { name: 'Integrations', href: '/features/integrations', icon: Plug, description: 'Connect your stack' },
  { name: 'Analytics', href: '/features/analytics', icon: BarChart3, description: 'Insights & reports' },
  { name: 'Phone Numbers', href: '/features/phone-numbers', icon: Phone, description: 'Multi-number support' },
];
const featuresEnterprise: MenuItem[] = [
  { name: 'Team & Roles', href: '/features/team-roles', icon: UserCog, description: 'Granular access control' },
  { name: 'Audit Logs', href: '/features/audit-logs', icon: ClipboardList, description: 'Activity tracking' },
];

const quickLinks = [
  { name: 'Pricing', href: '/pricing', icon: Sparkles, sub: 'Transparent plans', tint: 'from-amber-500/20 to-orange-500/10', icoColor: 'text-amber-500' },
  { name: 'Why Aireatro', href: '/why-aireatro', icon: TrendingUp, sub: 'See the difference', tint: 'from-teal-500/20 to-emerald-500/10', icoColor: 'text-teal-500' },
  { name: 'Help Center', href: '/help', icon: HelpCircle, sub: 'Guides & support', tint: 'from-blue-500/20 to-indigo-500/10', icoColor: 'text-blue-500' },
  { name: 'Blog', href: '/blog', icon: BookOpen, sub: 'WhatsApp insights', tint: 'from-purple-500/20 to-fuchsia-500/10', icoColor: 'text-purple-500' },
  { name: 'About Us', href: '/about', icon: Building2, sub: 'Our story', tint: 'from-rose-500/20 to-pink-500/10', icoColor: 'text-rose-500' },
  { name: 'Contact', href: '/contact', icon: MessageSquare, sub: 'Talk to our team', tint: 'from-emerald-500/20 to-green-500/10', icoColor: 'text-emerald-500' },
];

const sections = [
  { id: 'products', label: 'Products', sub: 'WhatsApp business solutions', icon: Zap, gradient: 'from-emerald-500/30 to-teal-500/10', glow: 'bg-emerald-500/20', items: whatsappProducts, viewAll: '/products' },
  { id: 'features', label: 'Features', sub: 'Everything you need to scale', icon: Bot, gradient: 'from-primary/30 to-emerald-500/10', glow: 'bg-primary/20',
    groups: [
      { title: 'Core', items: featuresCore },
      { title: 'Advanced', items: featuresAdvanced },
      { title: 'Enterprise', items: featuresEnterprise },
    ] },
];

export default function PremiumMobileMenu({ open, onClose }: Props) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(() =>
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  );

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const go = (href: string) => { navigate(href); onClose(); setExpanded(null); };

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.classList.toggle('dark', next === 'dark');
    setTheme(next);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="lg:hidden fixed inset-0 z-[55] bg-background/40 backdrop-blur-xl"
          />

          {/* Drawer */}
          <motion.div
            key="drawer"
            initial={{ y: '100%', opacity: 0.6 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 34, mass: 0.9 }}
            className="lg:hidden fixed inset-x-2 top-2 bottom-2 z-[60] flex flex-col rounded-[28px] overflow-hidden border border-border/60 shadow-2xl shadow-primary/10
                       bg-gradient-to-b from-background/95 via-background/90 to-background/95 backdrop-blur-2xl"
          >
            {/* Decorative glows */}
            <div className="pointer-events-none absolute -top-24 -right-16 w-72 h-72 rounded-full bg-primary/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-16 w-72 h-72 rounded-full bg-emerald-500/15 blur-3xl" />
            <div className="pointer-events-none absolute inset-0 opacity-[0.04] bg-[radial-gradient(circle_at_1px_1px,_currentColor_1px,_transparent_0)] [background-size:18px_18px]" />

            {/* Sticky Header */}
            <div className="relative z-10 flex items-center justify-between px-5 pt-4 pb-3 border-b border-border/40 bg-background/60 backdrop-blur-xl">
              <Link to="/" onClick={onClose} className="flex items-center gap-2.5">
                <div className="relative">
                  <img src={aireatroLogo} alt="AiReatro" className="h-9 w-auto" />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-background animate-pulse" />
                </div>
                <div className="leading-tight">
                  <div className="text-[15px] font-bold tracking-tight text-foreground">AiReatro</div>
                  <div className="text-[10px] font-medium text-muted-foreground flex items-center gap-1">
                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" /> Official WhatsApp API
                  </div>
                </div>
              </Link>
              <button
                onClick={onClose}
                aria-label="Close menu"
                className="w-10 h-10 rounded-full flex items-center justify-center bg-muted/60 hover:bg-muted transition active:scale-95 border border-border/50"
              >
                <X className="w-4.5 h-4.5 text-foreground" />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="relative z-10 flex-1 overflow-y-auto overscroll-contain px-4 pt-4 pb-40 space-y-5">

              {/* Promo pill */}
              <motion.button
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                onClick={() => go('/pricing')}
                className="group relative w-full overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/10 via-emerald-500/10 to-teal-500/10 px-4 py-3 active:scale-[0.99] transition-transform"
              >
                {/* Animated shimmer */}
                <span className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-[1400ms] ease-out bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                <span className="pointer-events-none absolute -top-8 -left-8 w-32 h-32 rounded-full bg-primary/20 blur-2xl animate-pulse" />
                <div className="relative flex items-center gap-2.5">
                  <span className="relative flex items-center justify-center w-7 h-7 rounded-lg bg-primary/20 border border-primary/30">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                  </span>
                  <div className="flex-1 text-left leading-tight">
                    <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary/80">Launch Offer</div>
                    <div className="text-[13.5px] font-semibold text-foreground">1 Month Free Access</div>
                  </div>
                  <span className="hidden xs:inline-flex items-center gap-1 px-2 py-1 rounded-md bg-primary text-primary-foreground text-[10.5px] font-bold">
                    Claim <ArrowRight className="w-3 h-3" />
                  </span>
                  <ArrowRight className="xs:hidden w-4 h-4 text-primary group-hover:translate-x-0.5 transition-transform" />
                </div>
              </motion.button>

              {/* Quick links grid */}
              <div className="grid grid-cols-2 gap-2.5">
                {quickLinks.map((l, i) => (
                  <motion.button
                    key={l.name}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.06 + i * 0.035 }}
                    onClick={() => go(l.href)}
                    className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/60 backdrop-blur-md p-3.5 text-left active:scale-[0.97] transition-transform"
                  >
                    <div className={cn('absolute -top-8 -right-8 w-24 h-24 rounded-full blur-2xl opacity-70 bg-gradient-to-br', l.tint)} />
                    <div className="relative flex flex-col gap-2">
                      <div className="w-9 h-9 rounded-xl bg-background/80 border border-border/50 flex items-center justify-center shadow-sm">
                        <l.icon className={cn('w-4.5 h-4.5', l.icoColor)} />
                      </div>
                      <div>
                        <div className="text-[13px] font-semibold text-foreground leading-tight">{l.name}</div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">{l.sub}</div>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Expandable sections */}
              <div className="space-y-2.5">
                {sections.map((section, sIdx) => {
                  const isOpen = expanded === section.id;
                  return (
                    <motion.div
                      key={section.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.18 + sIdx * 0.05 }}
                      className={cn(
                        'relative overflow-hidden rounded-2xl border transition-all',
                        isOpen ? 'border-primary/30 bg-card/80 shadow-lg shadow-primary/5' : 'border-border/50 bg-card/50'
                      )}
                    >
                      {isOpen && <div className={cn('absolute -top-12 -right-10 w-40 h-40 rounded-full blur-3xl opacity-60 bg-gradient-to-br', section.gradient)} />}
                      <button onClick={() => setExpanded(isOpen ? null : section.id)} className="relative w-full flex items-center gap-3 p-3.5">
                        <div className={cn('relative w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br', section.gradient)}>
                          <section.icon className="w-5 h-5 text-foreground" />
                          <span className={cn('absolute inset-0 rounded-xl blur-md opacity-60', section.glow)} />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="text-[14.5px] font-semibold text-foreground">{section.label}</div>
                          <div className="text-[11.5px] text-muted-foreground">{section.sub}</div>
                        </div>
                        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.25 }}>
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        </motion.div>
                      </button>

                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
                            className="overflow-hidden"
                          >
                            <div className="relative px-3 pb-3 space-y-1">
                              {section.items?.map((item, i) => (
                                <ItemRow key={item.name} item={item} delay={i * 0.035} onClick={() => go(item.href)} />
                              ))}
                              {section.groups?.map((group, gIdx) => (
                                <div key={group.title} className="pt-2">
                                  <div className="flex items-center gap-2 px-2 pb-1.5">
                                    <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground/70">{group.title}</span>
                                    <div className="flex-1 h-px bg-gradient-to-r from-border/60 to-transparent" />
                                  </div>
                                  <div className="space-y-1">
                                    {group.items.map((item, i) => (
                                      <ItemRow key={item.name} item={item} delay={(gIdx * 0.04) + i * 0.025} onClick={() => go(item.href)} />
                                    ))}
                                  </div>
                                </div>
                              ))}
                              {section.viewAll && (
                                <button
                                  onClick={() => go(section.viewAll!)}
                                  className="w-full mt-2 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-primary/10 hover:bg-primary/15 text-primary text-[13px] font-semibold border border-primary/20"
                                >
                                  View All <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>

              {/* Premium CTA card */}
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.32 }}
                className="relative overflow-hidden rounded-3xl p-[1px] bg-gradient-to-br from-primary/60 via-emerald-400/40 to-teal-500/60"
              >
                <div className="relative rounded-[22px] bg-[#06281f] dark:bg-[#04201a] text-white p-5 overflow-hidden">
                  {/* Animated glow */}
                  <motion.div
                    animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.75, 0.5] }}
                    transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute -top-16 -right-10 w-56 h-56 rounded-full bg-emerald-400/30 blur-3xl"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                    className="absolute -bottom-20 -left-10 w-56 h-56 rounded-full bg-primary/40 blur-3xl"
                  />
                  <div className="absolute inset-0 opacity-[0.05] bg-[radial-gradient(circle_at_1px_1px,_white_1px,_transparent_0)] [background-size:14px_14px]" />

                  <div className="relative">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 border border-white/15 backdrop-blur-md mb-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-200">Free Forever Platform</span>
                    </div>
                    <h3 className="text-[19px] font-bold leading-tight">Start Growing with WhatsApp API</h3>
                    <p className="text-[12.5px] text-white/70 mt-1.5 leading-relaxed">
                      Automate replies, manage leads, and scale your business with Aireatro.
                    </p>

                    <button
                      onClick={() => go('/signup')}
                      className="group relative mt-4 w-full overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-400 via-primary to-teal-500 text-[#03150f] font-bold text-[15px] py-3.5 shadow-[0_10px_30px_-10px_rgba(16,185,129,0.7)] active:scale-[0.98] transition-transform"
                    >
                      <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                      <span className="relative flex items-center justify-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        Start Free
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </button>

                    <div className="mt-3 flex items-center justify-between text-[10.5px] text-white/60">
                      <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-400" /> No credit card</span>
                      <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-400" /> Setup in &lt; 10 min</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Sign in */}
              <button
                onClick={() => go('/login')}
                className="w-full py-3 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-md text-[14px] font-semibold text-foreground hover:bg-muted/60 transition active:scale-[0.98]"
              >
                Sign in to your account
              </button>

              {/* Footer */}
              <div className="pt-4 mt-2 border-t border-border/50 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {[Twitter, Linkedin, Instagram, Youtube].map((Ico, i) => (
                      <button key={i} className="w-9 h-9 rounded-xl border border-border/50 bg-card/60 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 transition active:scale-95">
                        <Ico className="w-4 h-4" />
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button onClick={toggleTheme} aria-label="Toggle theme" className="w-9 h-9 rounded-xl border border-border/50 bg-card/60 flex items-center justify-center text-muted-foreground hover:text-foreground transition active:scale-95">
                      {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    </button>
                    <button className="h-9 px-3 rounded-xl border border-border/50 bg-card/60 flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground">
                      <Globe className="w-3.5 h-3.5" /> EN
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-3 text-[11px] text-muted-foreground">
                  <Link to="/privacy-policy" onClick={onClose} className="hover:text-foreground">Privacy</Link>
                  <span className="opacity-30">•</span>
                  <Link to="/terms" onClick={onClose} className="hover:text-foreground">Terms</Link>
                  <span className="opacity-30">•</span>
                  <Link to="/security" onClick={onClose} className="hover:text-foreground flex items-center gap-1"><Shield className="w-3 h-3" /> Security</Link>
                </div>
                <div className="text-center text-[10.5px] text-muted-foreground/70">
                  © {new Date().getFullYear()} Aireatro · v2.4.0
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function ItemRow({ item, delay, onClick }: { item: MenuItem; delay: number; onClick: () => void }) {
  return (
    <motion.button
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      onClick={onClick}
      className="group w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/60 active:bg-muted transition text-left"
    >
      <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-primary/15 to-emerald-500/5 border border-primary/15 flex items-center justify-center shrink-0">
        <item.icon className="w-4 h-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-[13.5px] font-semibold text-foreground truncate">{item.name}</span>
          {item.badge && (
            <span className="text-[9.5px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-primary/15 text-primary border border-primary/20">
              {item.badge}
            </span>
          )}
        </div>
        {item.description && <div className="text-[11.5px] text-muted-foreground truncate">{item.description}</div>}
      </div>
      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
    </motion.button>
  );
}
