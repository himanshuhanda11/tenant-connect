import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronDown, Zap, MousePointer, TrendingUp, Inbox, Megaphone, FileText, Bot, BarChart3, Users, Phone, Shield, ClipboardList, Plug, UserCog } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import aireatroLogo from '@/assets/aireatro-logo.png';

export default function Navbar() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const whatsappProducts = [
    { name: 'WhatsApp Business API', href: '/whatsapp-business-api', icon: Zap, description: 'Official API integration' },
    { name: 'Click to WhatsApp App', href: '/click-to-whatsapp', icon: MousePointer, description: 'Convert ads to chats' },
    { name: 'WhatsApp Marketing', href: '/products#whatsapp-marketing', icon: TrendingUp, description: 'Broadcast campaigns' },
    { name: 'WhatsApp Forms', href: '/whatsapp-forms', icon: FileText, description: 'Native in-chat data collection' },
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

  return (
    <header className="border-b border-border/50 bg-background/95 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <img src={aireatroLogo} alt="AiReatro" className="h-10 w-auto" />
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

            {/* Features Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-1">
                  Features <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[520px] bg-popover border border-border shadow-xl z-50 p-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Core Features */}
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

                  {/* Advanced Features */}
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

                {/* Enterprise Row */}
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

            <Button variant="ghost" asChild>
              <Link to="/about">About</Link>
            </Button>

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
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border bg-background">
          <div className="container mx-auto px-4 py-4 space-y-1 max-h-[80vh] overflow-y-auto">
            <div className="text-xs uppercase tracking-wider text-muted-foreground px-4 py-2 font-semibold">WhatsApp Solutions</div>
            <Link to="/products#whatsapp-api" className="flex items-center gap-3 px-4 py-3 text-foreground hover:bg-muted rounded-lg" onClick={() => setMobileMenuOpen(false)}>
              <Zap className="w-4 h-4 text-primary" />
              WhatsApp Business API
            </Link>
            <Link to="/click-to-whatsapp" className="flex items-center gap-3 px-4 py-3 text-foreground hover:bg-muted rounded-lg" onClick={() => setMobileMenuOpen(false)}>
              <MousePointer className="w-4 h-4 text-primary" />
              Click to WhatsApp App
            </Link>
            <Link to="/products#whatsapp-marketing" className="flex items-center gap-3 px-4 py-3 text-foreground hover:bg-muted rounded-lg" onClick={() => setMobileMenuOpen(false)}>
              <TrendingUp className="w-4 h-4 text-primary" />
              WhatsApp Marketing
            </Link>
            
            <div className="border-t border-border my-3" />
            <div className="text-xs uppercase tracking-wider text-muted-foreground px-4 py-2 font-semibold">Platform Features</div>
            {[...featuresCore, ...featuresAdvanced, ...featuresEnterprise].map((item) => (
              <Link 
                key={item.name} 
                to={item.href} 
                className="flex items-center gap-3 px-4 py-2.5 text-foreground hover:bg-muted rounded-lg" 
                onClick={() => setMobileMenuOpen(false)}
              >
                <item.icon className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{item.name}</span>
              </Link>
            ))}
            
            <div className="border-t border-border my-3" />
            <Link to="/products" className="block px-4 py-3 text-foreground hover:bg-muted rounded-lg font-medium" onClick={() => setMobileMenuOpen(false)}>All Products</Link>
            <Link to="/pricing" className="block px-4 py-3 text-foreground hover:bg-muted rounded-lg font-medium" onClick={() => setMobileMenuOpen(false)}>Pricing</Link>
            <Link to="/help" className="block px-4 py-3 text-foreground hover:bg-muted rounded-lg font-medium" onClick={() => setMobileMenuOpen(false)}>Help Center</Link>
            <Link to="/about" className="block px-4 py-3 text-foreground hover:bg-muted rounded-lg font-medium" onClick={() => setMobileMenuOpen(false)}>About</Link>
            <Link to="/contact" className="block px-4 py-3 text-foreground hover:bg-muted rounded-lg font-medium" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
            <div className="pt-4 border-t border-border space-y-3">
              <Button variant="outline" className="w-full h-12" onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}>Sign in</Button>
              <Button className="w-full h-12 bg-gradient-to-r from-primary to-primary/80" onClick={() => { navigate('/signup'); setMobileMenuOpen(false); }}>Get Started Free</Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
