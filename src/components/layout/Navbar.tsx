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
import PremiumMobileMenu from './PremiumMobileMenu';

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

      {/* Premium Mobile Menu */}
      <PremiumMobileMenu open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </>
  );
}
