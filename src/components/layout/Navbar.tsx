import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageSquare, Menu, X, ChevronDown, Zap, MousePointer, TrendingUp, Inbox, Megaphone, FileText, Bot, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';

export default function Navbar() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const whatsappProducts = [
    { name: 'WhatsApp Business API', href: '/products#whatsapp-api', icon: Zap, description: 'Official API integration' },
    { name: 'Click to WhatsApp Ads', href: '/products#click-to-whatsapp', icon: MousePointer, description: 'Convert ads to chats' },
    { name: 'WhatsApp Marketing', href: '/products#whatsapp-marketing', icon: TrendingUp, description: 'Broadcast campaigns' },
  ];

  const platformFeatures = [
    { name: 'Unified Inbox', href: '/features/inbox', icon: Inbox },
    { name: 'Contacts & Segments', href: '/features/contacts', icon: Inbox },
    { name: 'Message Templates', href: '/features/templates', icon: FileText },
    { name: 'Campaigns', href: '/features/campaigns', icon: Megaphone },
    { name: 'Automation', href: '/features/automation', icon: Bot },
    { name: 'Integrations', href: '/features/integrations', icon: Zap },
    { name: 'Analytics', href: '/features/analytics', icon: BarChart3 },
    { name: 'Phone Numbers', href: '/features/phone-numbers', icon: Inbox },
    { name: 'Team & Roles', href: '/features/team-roles', icon: Inbox },
    { name: 'Audit Logs', href: '/features/audit-logs', icon: FileText },
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
          <Link to="/" className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/20">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-foreground">aireatro</span>
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
                      <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center mt-0.5">
                        <item.icon className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium text-foreground">{item.name}</div>
                        <div className="text-xs text-muted-foreground">{item.description}</div>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wider">Platform Features</DropdownMenuLabel>
                <div className="grid grid-cols-2 gap-1 p-1 max-h-64 overflow-y-auto">
                  {platformFeatures.map((item) => (
                    <DropdownMenuItem key={item.name} asChild className="cursor-pointer">
                      <Link to={item.href} className="flex items-center gap-2 px-2 py-1.5">
                        <item.icon className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{item.name}</span>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link to="/products" className="flex items-center justify-center gap-2 text-primary font-medium">
                    View All Products
                  </Link>
                </DropdownMenuItem>
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
              <DropdownMenuContent align="start" className="w-48">
                {resourceLinks.map((link) => (
                  <DropdownMenuItem key={link.name} asChild>
                    <Link to={link.href}>{link.name}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" asChild>
              <Link to="/about">About</Link>
            </Button>

            <Button variant="ghost" asChild>
              <Link to="/partners">Partners</Link>
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
          <div className="container mx-auto px-4 py-4 space-y-1">
            <div className="text-xs uppercase tracking-wider text-muted-foreground px-4 py-2 font-semibold">WhatsApp Solutions</div>
            <Link to="/products#whatsapp-api" className="flex items-center gap-3 px-4 py-3 text-foreground hover:bg-muted rounded-lg" onClick={() => setMobileMenuOpen(false)}>
              <Zap className="w-4 h-4 text-green-500" />
              WhatsApp Business API
            </Link>
            <Link to="/products#click-to-whatsapp" className="flex items-center gap-3 px-4 py-3 text-foreground hover:bg-muted rounded-lg" onClick={() => setMobileMenuOpen(false)}>
              <MousePointer className="w-4 h-4 text-blue-500" />
              Click to WhatsApp Ads
            </Link>
            <Link to="/products#whatsapp-marketing" className="flex items-center gap-3 px-4 py-3 text-foreground hover:bg-muted rounded-lg" onClick={() => setMobileMenuOpen(false)}>
              <TrendingUp className="w-4 h-4 text-purple-500" />
              WhatsApp Marketing
            </Link>
            <div className="border-t border-border my-2" />
            <Link to="/products" className="block px-4 py-3 text-foreground hover:bg-muted rounded-lg font-medium" onClick={() => setMobileMenuOpen(false)}>All Products</Link>
            <Link to="/pricing" className="block px-4 py-3 text-foreground hover:bg-muted rounded-lg font-medium" onClick={() => setMobileMenuOpen(false)}>Pricing</Link>
            <Link to="/help" className="block px-4 py-3 text-foreground hover:bg-muted rounded-lg font-medium" onClick={() => setMobileMenuOpen(false)}>Help Center</Link>
            <Link to="/about" className="block px-4 py-3 text-foreground hover:bg-muted rounded-lg font-medium" onClick={() => setMobileMenuOpen(false)}>About</Link>
            <Link to="/contact" className="block px-4 py-3 text-foreground hover:bg-muted rounded-lg font-medium" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
            <div className="pt-4 border-t border-border space-y-3">
              <Button variant="outline" className="w-full h-12" onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}>Sign in</Button>
              <Button className="w-full h-12 bg-gradient-to-r from-green-500 to-emerald-600" onClick={() => { navigate('/signup'); setMobileMenuOpen(false); }}>Get Started Free</Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
