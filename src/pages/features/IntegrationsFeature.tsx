import React from 'react';
import { 
  Plug, 
  Code, 
  Webhook, 
  Zap,
  Database,
  RefreshCw,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Link,
  Server,
  FileJson
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Breadcrumb from '@/components/layout/Breadcrumb';

export default function IntegrationsFeature() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Plug,
      title: 'Native Integrations',
      description: 'Connect with popular tools like Shopify, HubSpot, Zapier, and more out of the box.'
    },
    {
      icon: Code,
      title: 'REST API',
      description: 'Full-featured REST API for custom integrations. Send messages, manage contacts, and more.'
    },
    {
      icon: Webhook,
      title: 'Webhooks',
      description: 'Receive real-time notifications for messages, status updates, and events via webhooks.'
    },
    {
      icon: Database,
      title: 'CRM Sync',
      description: 'Automatically sync contacts and conversations with your CRM. No manual data entry.'
    },
    {
      icon: RefreshCw,
      title: 'Real-time Sync',
      description: 'Data flows in real-time between smeksh and your connected applications.'
    },
    {
      icon: FileJson,
      title: 'Developer SDKs',
      description: 'Official SDKs for Node.js, Python, PHP, and more. Get started in minutes.'
    }
  ];

  const integrations = [
    { name: 'Shopify', category: 'E-commerce', color: 'bg-green-500' },
    { name: 'WooCommerce', category: 'E-commerce', color: 'bg-purple-500' },
    { name: 'Zapier', category: 'Automation', color: 'bg-orange-500' },
    { name: 'HubSpot', category: 'CRM', color: 'bg-red-500' },
    { name: 'Salesforce', category: 'CRM', color: 'bg-blue-500' },
    { name: 'Slack', category: 'Communication', color: 'bg-pink-500' },
    { name: 'Google Sheets', category: 'Productivity', color: 'bg-emerald-500' },
    { name: 'Make', category: 'Automation', color: 'bg-indigo-500' },
  ];

  const steps = [
    {
      step: '01',
      title: 'Choose Integration',
      description: 'Select from our library of pre-built integrations or use our API for custom builds.'
    },
    {
      step: '02',
      title: 'Connect & Configure',
      description: 'Authenticate and configure the integration with your specific requirements.'
    },
    {
      step: '03',
      title: 'Automate & Scale',
      description: 'Data flows automatically between your tools. Focus on what matters most.'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden bg-gradient-to-b from-background to-muted/30">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-1/4 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[80px]" />
        </div>
        
        <div className="container mx-auto px-4 relative">
          <Breadcrumb className="mb-8" />
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 text-sm font-medium mb-6">
              <Plug className="w-4 h-4" />
              Integrations & Webhooks
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Connect Your{' '}
              <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Entire Stack
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-8">
              Integrate smeksh with your favorite tools. Native integrations, powerful API, and real-time webhooks.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="h-14 px-8 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg shadow-green-500/20" onClick={() => navigate('/signup')}>
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button size="lg" variant="outline" className="h-14 px-8" onClick={() => navigate('/api-docs')}>
                View API Docs
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Integrations */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Popular Integrations
            </h2>
            <p className="text-lg text-muted-foreground">
              Connect with the tools you already use
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-12">
            {integrations.map((integration, index) => (
              <Card key={index} className="border-border/50 hover:shadow-lg hover:border-primary/20 transition-all cursor-pointer group">
                <CardContent className="p-6 text-center">
                  <div className={`w-12 h-12 rounded-xl ${integration.color} flex items-center justify-center mx-auto mb-3 text-white font-bold text-lg`}>
                    {integration.name.charAt(0)}
                  </div>
                  <h3 className="font-semibold text-foreground">{integration.name}</h3>
                  <p className="text-xs text-muted-foreground">{integration.category}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button variant="outline" size="lg" onClick={() => navigate('/integrations')}>
              View All Integrations
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Code className="w-4 h-4" />
              Developer Tools
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Built for Developers
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Card key={index} className="border-border/50 hover:shadow-xl hover:border-primary/20 transition-all group">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-4 group-hover:bg-indigo-500/20 transition-colors">
                    <feature.icon className="w-6 h-6 text-indigo-500" />
                  </div>
                  <h3 className="font-semibold text-xl text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Get Integrated in Minutes
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {steps.map((step, index) => (
              <div key={index} className="relative text-center">
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-16 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-border to-transparent" />
                )}
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-2xl font-bold mb-6 shadow-xl">
                  {step.step}
                </div>
                <h3 className="font-semibold text-xl text-foreground mb-3">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
        
        <div className="container mx-auto px-4 relative text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Ready to Connect Your Tools?
          </h2>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Start integrating smeksh with your tech stack today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="h-14 px-8 bg-white text-indigo-600 hover:bg-white/90" onClick={() => navigate('/signup')}>
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-8 border-white/30 text-white hover:bg-white/10" onClick={() => navigate('/api-docs')}>
              View API Docs
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
