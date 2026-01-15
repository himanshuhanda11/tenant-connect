import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Check,
  AlertCircle,
  Clock,
  ArrowRight,
  Plug,
  ExternalLink
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const integrations = [
  { 
    name: 'Shopify', 
    logo: 'https://logo.clearbit.com/shopify.com',
    status: 'connected',
    lastEvent: '2 min ago',
    category: 'E-commerce'
  },
  { 
    name: 'HubSpot', 
    logo: 'https://logo.clearbit.com/hubspot.com',
    status: 'connected',
    lastEvent: '5 min ago',
    category: 'CRM'
  },
  { 
    name: 'Razorpay', 
    logo: 'https://logo.clearbit.com/razorpay.com',
    status: 'connected',
    lastEvent: '1 hr ago',
    category: 'Payments'
  },
  { 
    name: 'WooCommerce', 
    logo: 'https://logo.clearbit.com/woocommerce.com',
    status: 'pending',
    lastEvent: 'Setup required',
    category: 'E-commerce'
  },
  { 
    name: 'Zoho CRM', 
    logo: 'https://logo.clearbit.com/zoho.com',
    status: 'connected',
    lastEvent: '15 min ago',
    category: 'CRM'
  },
  { 
    name: 'Google Sheets', 
    logo: 'https://logo.clearbit.com/google.com',
    status: 'connected',
    lastEvent: '30 min ago',
    category: 'Productivity'
  },
  { 
    name: 'Zapier', 
    logo: 'https://logo.clearbit.com/zapier.com',
    status: 'error',
    lastEvent: 'Auth expired',
    category: 'Automation'
  },
  { 
    name: 'Meta Lead Ads', 
    logo: 'https://logo.clearbit.com/meta.com',
    status: 'connected',
    lastEvent: '1 min ago',
    category: 'Advertising'
  },
];

const statusConfig = {
  connected: {
    icon: Check,
    color: 'text-green-600',
    bg: 'bg-green-100',
    label: 'Connected'
  },
  pending: {
    icon: Clock,
    color: 'text-amber-600',
    bg: 'bg-amber-100',
    label: 'Pending'
  },
  error: {
    icon: AlertCircle,
    color: 'text-red-600',
    bg: 'bg-red-100',
    label: 'Error'
  }
};

export default function IntegrationsGridSection() {
  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-28 bg-slate-50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10 md:mb-14">
          <Badge className="mb-3 sm:mb-4 bg-slate-200 text-slate-700 border-0 text-xs sm:text-sm">
            <Plug className="w-3 sm:w-3.5 h-3 sm:h-3.5 mr-1 sm:mr-1.5" />
            Integrations
          </Badge>
          <h2 className="text-2xl xs:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-3 sm:mb-4">
            Connect Your{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-700 to-slate-500">
              Tech Stack
            </span>
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-slate-600 px-4">
            Real-time sync with status monitoring and error alerts
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 max-w-6xl mx-auto mb-8 sm:mb-10">
          {integrations.map((integration, index) => {
            const status = statusConfig[integration.status as keyof typeof statusConfig];
            const StatusIcon = status.icon;
            
            return (
              <Card 
                key={index}
                className={`border hover:shadow-lg transition-all cursor-pointer ${
                  integration.status === 'error' ? 'border-red-200' : 'border-slate-200'
                }`}
              >
                <CardContent className="p-3 sm:p-5">
                  <div className="flex items-start gap-2 sm:gap-3 mb-2 sm:mb-3">
                    <img 
                      src={integration.logo} 
                      alt={integration.name}
                      className="w-8 sm:w-10 h-8 sm:h-10 rounded-lg object-contain bg-white p-0.5 sm:p-1 border border-slate-100"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://via.placeholder.com/40?text=' + integration.name[0];
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 truncate text-xs sm:text-sm">{integration.name}</h3>
                      <p className="text-[10px] sm:text-xs text-slate-500 hidden xs:block">{integration.category}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 sm:gap-1.5">
                      <div className={`w-4 sm:w-5 h-4 sm:h-5 rounded-full ${status.bg} flex items-center justify-center`}>
                        <StatusIcon className={`w-2.5 sm:w-3 h-2.5 sm:h-3 ${status.color}`} />
                      </div>
                      <span className={`text-[10px] sm:text-xs font-medium ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                    <span className="text-[10px] sm:text-xs text-slate-400 hidden sm:block">{integration.lastEvent}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center flex flex-col xs:flex-row gap-3 sm:gap-4 justify-center">
          <Button size="lg" variant="outline" asChild className="h-11 sm:h-12 px-5 sm:px-6 text-sm">
            <Link to="/integrations">
              View All 50+ Integrations
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
          <Button size="lg" variant="ghost" asChild className="h-11 sm:h-12 px-5 sm:px-6 text-sm">
            <Link to="/documentation">
              <ExternalLink className="w-4 h-4 mr-2" />
              API Docs
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
