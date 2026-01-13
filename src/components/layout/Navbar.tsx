import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageSquare, Menu, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Navbar() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const productLinks = [
    { name: 'Inbox', href: '/products#inbox' },
    { name: 'Campaigns', href: '/products#campaigns' },
    { name: 'Templates', href: '/products#templates' },
    { name: 'Automation', href: '/products#automation' },
    { name: 'Analytics', href: '/products#analytics' },
  ];

  const resourceLinks = [
    { name: 'Help Center', href: '/help' },
    { name: 'Blog', href: '/blog' },
    { name: 'Guides', href: '/guides' },
    { name: 'API Documentation', href: '/api-docs' },
    { name: 'Webinars', href: '/webinars' },
  ];

  return (
    <header className="border-b border-border/50 bg-background/95 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/20">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-foreground">smeksh</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-1">
                  Products <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                {productLinks.map((link) => (
                  <DropdownMenuItem key={link.name} asChild>
                    <Link to={link.href}>{link.name}</Link>
                  </DropdownMenuItem>
                ))}
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
          <div className="container mx-auto px-4 py-4 space-y-2">
            <Link to="/products" className="block px-4 py-3 text-foreground hover:bg-muted rounded-lg font-medium" onClick={() => setMobileMenuOpen(false)}>Products</Link>
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
