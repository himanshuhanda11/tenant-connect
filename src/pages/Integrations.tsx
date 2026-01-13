import React from 'react';
import { ArrowRight, Zap, Globe, Code, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function Integrations() {
  const navigate = useNavigate();

  const integrations = [
    { name: 'Shopify', category: 'E-commerce', description: 'Send order updates and abandoned cart reminders', color: 'bg-green-500' },
    { name: 'WooCommerce', category: 'E-commerce', description: 'Automate order notifications and customer support', color: 'bg-purple-500' },
    { name: 'Zapier', category: 'Automation', description: 'Connect with 5,000+ apps without code', color: 'bg-orange-500' },
    { name: 'HubSpot', category: 'CRM', description: 'Sync contacts and track conversations in your CRM', color: 'bg-red-500' },
    { name: 'Salesforce', category: 'CRM', description: 'Enterprise CRM integration for sales teams', color: 'bg-blue-500' },
    { name: 'Slack', category: 'Communication', description: 'Get notifications and reply from Slack', color: 'bg-pink-500' },
    { name: 'Google Sheets', category: 'Productivity', description: 'Export data and sync contacts automatically', color: 'bg-emerald-500' },
    { name: 'Webhooks', category: 'Developer', description: 'Build custom integrations with webhooks', color: 'bg-slate-500' },
  ];

  const apiFeatures = [
    'RESTful API with comprehensive documentation',
    'Webhook support for real-time events',
    'OAuth 2.0 authentication',
    'Rate limiting with generous quotas',
    'Sandbox environment for testing',
    'SDKs for popular languages'
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden bg-gradient-to-b from-background to-muted/30">
        <div className="absolute inset-0">
          <div className="absolute top-20 right-0 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[80px]" />
        </div>
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              Powerful Integrations
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Connect Your{' '}
              <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Favorite Tools
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Integrate smeksh with the tools you already use. Automate workflows and boost productivity.
            </p>
            <Button size="lg" className="h-14 px-8 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg shadow-green-500/20" onClick={() => navigate('/signup')}>
              Start Integrating
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Integrations Grid */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Popular Integrations
            </h2>
            <p className="text-lg text-muted-foreground">
              Connect with your existing tools in minutes
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {integrations.map((integration, index) => (
              <Card key={index} className="border-border/50 hover:shadow-lg hover:border-primary/20 transition-all cursor-pointer group">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-xl ${integration.color} flex items-center justify-center mb-4 text-white font-bold text-lg`}>
                    {integration.name.charAt(0)}
                  </div>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">{integration.name}</CardTitle>
                  <p className="text-xs text-muted-foreground">{integration.category}</p>
                </CardHeader>
                <CardContent>
                  <CardDescription>{integration.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* API Section */}
      <section className="py-24 bg-gradient-to-b from-muted/50 to-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <Code className="w-4 h-4" />
                Developer API
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Build Custom Integrations
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Our comprehensive API lets you build exactly what you need. Send messages, manage templates, and automate workflows programmatically.
              </p>
              <div className="space-y-3 mb-8">
                {apiFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-foreground">{feature}</span>
                  </div>
                ))}
              </div>
              <Button size="lg" onClick={() => navigate('/api-docs')}>
                View API Docs
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
            <div className="relative">
              <Card className="bg-slate-900 border-slate-800 overflow-hidden">
                <CardContent className="p-6">
                  <pre className="text-sm text-slate-300 overflow-x-auto">
                    <code>{`// Send a WhatsApp message
const response = await smeksh.messages.send({
  to: "+1234567890",
  template: "order_confirmation",
  variables: {
    name: "John",
    order_id: "12345"
  }
});

console.log(response.message_id);
// => "wamid.xxx..."`}</code>
                  </pre>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
        
        <div className="container mx-auto px-4 relative text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Need a Custom Integration?
          </h2>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Our team can help you build custom integrations for your specific needs.
          </p>
          <Button size="lg" className="h-14 px-8 bg-white text-purple-600 hover:bg-white/90" onClick={() => navigate('/contact')}>
            Contact Us
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
