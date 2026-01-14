import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingBag, 
  Database, 
  Webhook, 
  Zap,
  ArrowRight,
  Code2,
  ExternalLink
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const integrations = [
  { name: 'Shopify', category: 'E-commerce', icon: ShoppingBag },
  { name: 'WooCommerce', category: 'E-commerce', icon: ShoppingBag },
  { name: 'HubSpot', category: 'CRM', icon: Database },
  { name: 'Zoho CRM', category: 'CRM', icon: Database },
  { name: 'Google Sheets', category: 'Productivity', icon: Database },
  { name: 'Zapier', category: 'Automation', icon: Zap },
  { name: 'Make', category: 'Automation', icon: Zap },
  { name: 'Meta Lead Ads', category: 'Advertising', icon: ExternalLink },
];

const apiEndpoints = [
  '/webhooks/meta',
  '/messages/send',
  '/templates/submit',
  '/contacts/import',
  '/campaigns/create',
];

export default function IntegrationSection() {
  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-6xl mx-auto">
          {/* Left - Integrations Grid */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Connect Your Tools
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Seamlessly integrate with your existing tech stack
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {integrations.map((integration, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 text-center">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center mx-auto mb-2">
                      <integration.icon className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium text-foreground">{integration.name}</p>
                    <p className="text-xs text-muted-foreground">{integration.category}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Button variant="outline" asChild>
              <Link to="/integrations">
                View All Integrations
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>

          {/* Right - API First */}
          <div className="bg-slate-900 rounded-2xl p-6 md:p-8">
            <div className="flex items-center gap-2 mb-4">
              <Code2 className="w-5 h-5 text-green-400" />
              <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-0">
                API-First
              </Badge>
            </div>
            
            <h3 className="text-2xl font-bold text-white mb-4">
              Build Custom Integrations
            </h3>
            <p className="text-gray-400 mb-6">
              Full REST API access with webhooks, SDKs, and comprehensive documentation.
            </p>

            {/* API Endpoints Preview */}
            <div className="space-y-2 mb-6">
              {apiEndpoints.map((endpoint, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-3 px-3 py-2 bg-white/5 rounded-lg font-mono text-sm"
                >
                  <span className="text-green-400">POST</span>
                  <span className="text-gray-300">{endpoint}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <Button className="bg-white text-slate-900 hover:bg-white/90" asChild>
                <Link to="/documentation">
                  API Docs
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10" asChild>
                <Link to="/features/integrations">
                  <Webhook className="w-4 h-4 mr-2" />
                  Webhooks
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
