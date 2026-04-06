import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronDown, ChevronRight, Zap, MousePointer, TrendingUp, Inbox, Megaphone, FileText, Bot, BarChart3, Users, Phone, Shield, ClipboardList, Plug, UserCog, ArrowRight, Sparkles, BookOpen, HelpCircle, Building2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import aireatroLogo from '@/assets/aireatro-logo.png';

export default function Navbar() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  const whatsappProducts = [
    { name: 'WhatsApp Business API', href: '/whatsapp-business-api', icon: Zap, description: 'Official API integration' },
    { name: 'Click to WhatsApp App', href: '/click-to-whatsapp', icon: MousePointer, description: 'Convert clicks to chats' },
    { name: 'Why WhatsApp Marketing', href: '/why-whatsapp-marketing', icon: TrendingUp, description: 'ROI & conversions' },
    { name: 'WhatsApp Forms', href: '/whatsapp-forms', icon: FileText, description: 'In-chat data collection' },
  ];

  const featuresCore = [
    { name: 'Unified Inbox', href: '/features/inbox', icon: Inbox, description: 'All conversations in one place' },
    { name: 'Contacts & Segments', href: '/features/contacts', icon: Users, description: 'Manage your audience' },
    { name: 'Message Templates', href: '/features/templates', icon: FileText, description: 'Pre-approved messages' },
    { name: 'Campaigns', href: '/features/campaigns', icon: Megaphone, description: 'Broadcast marketing' },
  ];

  const featuresAdvanced = [
    { name: 'Automation', href: '/features/automation', icon: Bot, description: 'Workflows & chatbots' },
    { name: 'Integrations', href: '/features/integrations', icon: Plug, description: 'Connect your tools' },
    { name: 'Analytics', href: '/features/analytics', icon: BarChart3, description: 'Insights & reports' },
    { name: 'Phone Numbers', href: '/features/phone-numbers', icon: Phone, description: 'Multi-number support' },
  ];

  const featuresEnterprise = [
    { name: 'Team & Roles', href: '/features/team-roles', icon: UserCog, description: 'Access control' },
    { name: 'Audit Logs', href: '/features/audit-logs', icon: ClipboardList, description: 'Activity tracking' },
  ];

  const resourceLinks = [
    { name: 'Help Center', href: '/help' },
    { name: 'Blog', href: '/blog' },
    { name: 'Documentation', href: '/documentation' },
    { name: 'Case Studies', href: '/case-studies' },
    { name: 'Template Library', href: '/template-library' },
  ];

  const toggleSection = (section: string) => {
    setExpandedSection(prev => prev === section ? null : section);
  };

  const handleMobileNav = (href: string) => {
    navigate(href);
    setMobileMenuOpen(false);
    setExpandedSection(null);
  };

  const mobileMenuSections = [
    {
      id: 'products',
      label: 'Products',
      icon: Zap,
      iconColor: 'text-emerald-500',
      iconBg: 'bg-emerald-500/10',
      items: whatsappProducts,
    },
    {
      id: 'features',
      label: 'Features',
      icon: Bot,
      iconColor: 'text-primary',
      iconBg: 'bg-primary/10',
      groups: [
        { title: 'Core', items: featuresCore },
        { title: 'Advanced', items: featuresAdvanced },
        { title: 'Enterprise', items: featuresEnterprise },
      ],
    },
  ];

  const quickLinks = [
    { name: 'Pricing', href: '/pricing', icon: Sparkles, iconColor: 'text-amber-500' },
    { name: 'Help Center', href: '/help', icon: HelpCircle, iconColor: 'text-blue-500' },
    { name: 'Blog', href: '/blog', icon: BookOpen, iconColor: 'text-purple-500' },
    { name: 'About Us', href: '/about', icon: Building2, iconColor: 'text-rose-500' },
    { name: 'Why Aireatro', href: '/why-aireatro', icon: TrendingUp, iconColor: 'text-teal-500' },
    { name: 'Contact', href: '/contact', icon: MessageSquare, iconColor: 'text-orange-500' },
  ];

  return (
    <>
      <header className="border-b border-border/50 bg-background/95 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <img src={aireatroLogo} alt="AiReatro" className="h-12 w-auto" />
            </Link>

            <nav className="hidden lg:flex items-center gap-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-1">
                    Products <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-72 bg-popover border border-border shadow-xl z-50">
                  <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wider">WhatsApp Solutions</DropdownMenuLabel>
                  {whatsappProducts.map((item) => (
                    <DropdownMenuItem key={item.name} asChild className="cursor-pointer">
                      <Link to={item.href} className="flex items-start gap-3 p-2">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mt-0.5">
                          <item.icon className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium text-foreground">{item.name}</div>
                          <div className="text-xs text-muted-foreground">{item.description}</div>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link to="/products" className="flex items-center justify-center gap-2 text-primary font-medium">
                      View All Products
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-1">
                    Features <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[520px] bg-popover border border-border shadow-xl z-50 p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wider px-0 mb-2">Core Features</DropdownMenuLabel>
                      <div className="space-y-1">
                        {featuresCore.map((item) => (
                          <DropdownMenuItem key={item.name} asChild className="cursor-pointer p-0">
                            <Link to={item.href} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted">
                              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                <item.icon className="w-4 h-4 text-primary" />
                              </div>
                              <div className="min-w-0">
                                <div className="font-medium text-foreground text-sm">{item.name}</div>
                                <div className="text-xs text-muted-foreground truncate">{item.description}</div>
                              </div>
                            </Link>
                          </DropdownMenuItem>
                        ))}
                      </div>
                    </div>
                    <div>
                      <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wider px-0 mb-2">Advanced</DropdownMenuLabel>
                      <div className="space-y-1">
                        {featuresAdvanced.map((item) => (
                          <DropdownMenuItem key={item.name} asChild className="cursor-pointer p-0">
                            <Link to={item.href} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted">
                              <div className="w-9 h-9 rounded-lg bg-accent/50 flex items-center justify-center shrink-0">
                                <item.icon className="w-4 h-4 text-accent-foreground" />
                              </div>
                              <div className="min-w-0">
                                <div className="font-medium text-foreground text-sm">{item.name}</div>
                                <div className="text-xs text-muted-foreground truncate">{item.description}</div>
                              </div>
                            </Link>
                          </DropdownMenuItem>
                        ))}
                      </div>
                    </div>
                  </div>
                  <DropdownMenuSeparator className="my-3" />
                  <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wider px-0 mb-2">Enterprise</DropdownMenuLabel>
                  <div className="grid grid-cols-2 gap-2">
                    {featuresEnterprise.map((item) => (
                      <DropdownMenuItem key={item.name} asChild className="cursor-pointer p-0">
                        <Link to={item.href} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted">
                          <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                            <item.icon className="w-4 h-4 text-secondary-foreground" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-foreground text-sm">{item.name}</div>
                            <div className="text-xs text-muted-foreground">{item.description}</div>
                          </div>
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button variant="ghost" asChild>
                <Link to="/pricing">Pricing</Link>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-1">
                    Resources <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48 bg-popover border border-border shadow-xl z-50">
                  {resourceLinks.map((link) => (
                    <DropdownMenuItem key={link.name} asChild className="cursor-pointer">
                      <Link to={link.href}>{link.name}</Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-1">
                    About <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48 bg-popover border border-border shadow-xl z-50">
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link to="/about">About Us</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link to="/why-aireatro">Why Aireatro</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button variant="ghost" asChild>
                <Link to="/contact">Contact</Link>
              </Button>
            </nav>
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <Button variant="ghost" onClick={() => navigate('/login')}>
              Sign in
            </Button>
            <Button onClick={() => navigate('/signup')} className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg shadow-green-500/20">
              Get Started
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            className="lg:hidden relative z-[70] w-10 h-10 flex items-center justify-center rounded-xl border border-border/60 bg-background/80 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <AnimatePresence mode="wait">
              {mobileMenuOpen ? (
                <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                  <X className="w-5 h-5 text-foreground" />
                </motion.div>
              ) : (
                <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                  <Menu className="w-5 h-5 text-foreground" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      </header>

      {/* Mobile Menu - rendered OUTSIDE header to avoid clipping */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden fixed inset-0 top-[64px] z-[60] bg-background backdrop-blur-xl overflow-y-auto overscroll-contain"
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 10, opacity: 0 }}
              transition={{ duration: 0.25, delay: 0.05 }}
              className="pb-32"
            >
              <div className="container mx-auto px-5 pt-6 pb-8 space-y-2">

                {/* Expandable sections - Products & Features */}
                {mobileMenuSections.map((section, sIdx) => (
                  <motion.div
                    key={section.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.06 * sIdx }}
                  >
                    <button
                      onClick={() => toggleSection(section.id)}
                      className={cn(
                        "w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl transition-all duration-200",
                        expandedSection === section.id
                          ? "bg-muted/80 shadow-sm"
                          : "hover:bg-muted/50"
                      )}
                    >
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", section.iconBg)}>
                        <section.icon className={cn("w-5 h-5", section.iconColor)} />
                      </div>
                      <span className="flex-1 text-left font-semibold text-foreground text-[15px]">{section.label}</span>
                      <ChevronDown className={cn(
                        "w-4.5 h-4.5 text-muted-foreground transition-transform duration-200",
                        expandedSection === section.id && "rotate-180"
                      )} />
                    </button>

                    <AnimatePresence>
                      {expandedSection === section.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="pt-1 pb-2 pl-4 pr-2">
                            {section.items && section.items.map((item, i) => (
                              <motion.button
                                key={item.name}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.03 * i }}
                                onClick={() => handleMobileNav(item.href)}
                                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-muted/60 transition-colors group"
                              >
                                <div className="w-9 h-9 rounded-lg bg-primary/8 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
                                  <item.icon className="w-4 h-4 text-primary" />
                                </div>
                                <div className="flex-1 text-left min-w-0">
                                  <div className="text-sm font-medium text-foreground">{item.name}</div>
                                  <div className="text-xs text-muted-foreground truncate">{item.description}</div>
                                </div>
                                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                              </motion.button>
                            ))}

                            {section.groups && section.groups.map((group, gIdx) => (
                              <div key={group.title}>
                                <div className="flex items-center gap-2 px-3 pt-3 pb-1.5">
                                  <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">{group.title}</span>
                                  <div className="flex-1 h-px bg-border/50" />
                                </div>
                                {group.items.map((item, i) => (
                                  <motion.button
                                    key={item.name}
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.03 * (i + gIdx * 4) }}
                                    onClick={() => handleMobileNav(item.href)}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/60 transition-colors group"
                                  >
                                    <div className="w-8 h-8 rounded-lg bg-muted/80 flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                                      <item.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                    </div>
                                    <div className="flex-1 text-left">
                                      <span className="text-sm font-medium text-foreground">{item.name}</span>
                                    </div>
                                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                                  </motion.button>
                                ))}
                              </div>
                            ))}

                            {section.id === 'products' && (
                              <button
                                onClick={() => handleMobileNav('/products')}
                                className="w-full flex items-center justify-center gap-2 mt-2 px-3 py-2.5 text-primary text-sm font-semibold rounded-xl bg-primary/5 hover:bg-primary/10 transition-colors"
                              >
                                View All Products
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}

                {/* Divider */}
                <div className="px-4 py-2">
                  <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                </div>

                {/* Quick Links Grid */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="grid grid-cols-2 gap-2 px-1"
                >
                  {quickLinks.map((link, i) => (
                    <motion.button
                      key={link.name}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.15 + 0.03 * i }}
                      onClick={() => handleMobileNav(link.href)}
                      className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl border border-border/40 bg-card/50 hover:bg-muted/60 hover:border-border transition-all group"
                    >
                      <link.icon className={cn("w-4 h-4 shrink-0", link.iconColor)} />
                      <span className="text-sm font-medium text-foreground truncate">{link.name}</span>
                    </motion.button>
                  ))}
                </motion.div>

                {/* CTA Section */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="pt-4 space-y-3"
                >
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-emerald-500/5 to-teal-500/10 border border-primary/15 p-5">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl" />
                    <div className="relative">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <span className="text-xs font-semibold uppercase tracking-wider text-primary">Free Forever</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">Get WhatsApp API access with zero platform fees. Start in under 10 minutes.</p>
                      <Button
                        className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-700 shadow-lg shadow-primary/20 rounded-xl"
                        onClick={() => handleMobileNav('/signup')}
                      >
                        Get Started Free
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full h-11 rounded-xl border-border/60 text-foreground font-medium"
                    onClick={() => handleMobileNav('/login')}
                  >
                    Sign in to your account
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
