import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, ArrowRight, Shield, Users, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

export default function Index() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary">
              <MessageSquare className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">WhatsApp ISV Platform</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => navigate('/login')}>
              Sign in
            </Button>
            <Button onClick={() => navigate('/signup')}>
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-24 text-center">
        <div className="max-w-3xl mx-auto animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            Enterprise WhatsApp Business Platform
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
            Connect with customers on{' '}
            <span className="text-primary">WhatsApp</span>
          </h1>
          <p className="text-xl text-muted-foreground mt-6 max-w-2xl mx-auto">
            Multi-tenant platform for managing WhatsApp Business conversations at scale.
            Built for teams that need powerful collaboration tools.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            <Button size="lg" className="h-12 px-8 text-base" onClick={() => navigate('/signup')}>
              Start Free Trial
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button variant="outline" size="lg" className="h-12 px-8 text-base" onClick={() => navigate('/login')}>
              Sign in to Dashboard
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-24">
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="p-6 rounded-xl border border-border bg-card shadow-card animate-slide-in">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Multi-Tenant Workspaces</h3>
            <p className="text-muted-foreground">
              Create isolated workspaces for each team or client. Manage multiple businesses from one account.
            </p>
          </div>
          <div className="p-6 rounded-xl border border-border bg-card shadow-card animate-slide-in" style={{ animationDelay: '0.1s' }}>
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Role-Based Access</h3>
            <p className="text-muted-foreground">
              Assign Owner, Admin, or Agent roles. Control who can manage settings and who handles conversations.
            </p>
          </div>
          <div className="p-6 rounded-xl border border-border bg-card shadow-card animate-slide-in" style={{ animationDelay: '0.2s' }}>
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <MessageSquare className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">WhatsApp Business API</h3>
            <p className="text-muted-foreground">
              Full integration with WhatsApp Business API. Send messages, templates, and manage conversations.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground text-sm">
          © 2024 WhatsApp ISV Platform. Built with Lovable.
        </div>
      </footer>
    </div>
  );
}
