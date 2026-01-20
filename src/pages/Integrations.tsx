import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ArrowRight, Zap, Code, CheckCircle2, ExternalLink, ShoppingCart, CreditCard, Workflow, Users, Webhook, BarChart3, Mail, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PageHero from '@/components/layout/PageHero';
import SeoMeta from '@/components/seo/SeoMeta';

interface Integration {
  id: string;
  name: string;
  category: string;
  description: string;
  longDescription: string;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
  features: string[];
  useCases: string[];
  setupTime: string;
  status: 'available' | 'coming-soon';
  docsUrl?: string;
}

const integrations: Integration[] = [
  {
    id: 'shopify',
    name: 'Shopify',
    category: 'E-commerce',
    description: 'Automate order updates, abandoned cart recovery, and customer support on WhatsApp.',
    longDescription: 'Connect your Shopify store to send automated WhatsApp messages for order confirmations, shipping updates, abandoned cart reminders, and more. Increase customer engagement and reduce support tickets with real-time notifications.',
    color: 'bg-green-500',
    icon: ShoppingCart,
    features: [
      'Order confirmation messages',
      'Shipping & delivery updates',
      'Abandoned cart recovery',
      'Customer support integration',
      'Product catalog sync',
      'Review request automation'
    ],
    useCases: [
      'Send instant order confirmations via WhatsApp',
      'Recover abandoned carts with personalized reminders',
      'Notify customers when orders ship and deliver',
      'Handle support queries directly in WhatsApp'
    ],
    setupTime: '5 minutes',
    status: 'available',
    docsUrl: '/help/integrations-guide'
  },
  {
    id: 'woocommerce',
    name: 'WooCommerce',
    category: 'E-commerce',
    description: 'Integrate your WooCommerce store for seamless order notifications and customer engagement.',
    longDescription: 'Connect WooCommerce to AiReatro and automate your customer communication. Send order updates, request reviews, and provide support—all through WhatsApp.',
    color: 'bg-purple-500',
    icon: ShoppingCart,
    features: [
      'Order status notifications',
      'Payment confirmation alerts',
      'Shipping tracking updates',
      'Customer feedback requests',
      'Promotional campaigns',
      'Stock alerts'
    ],
    useCases: [
      'Automate order lifecycle messages',
      'Send back-in-stock alerts to customers',
      'Request product reviews post-delivery',
      'Run flash sale campaigns via WhatsApp'
    ],
    setupTime: '10 minutes',
    status: 'available',
    docsUrl: '/help/integrations-guide'
  },
  {
    id: 'razorpay',
    name: 'Razorpay',
    category: 'Payments',
    description: 'Send payment confirmations, reminders, and invoices automatically via WhatsApp.',
    longDescription: 'Integrate Razorpay with AiReatro to automate payment-related communications. Send instant payment confirmations, failed payment alerts, subscription reminders, and invoice links through WhatsApp.',
    color: 'bg-blue-600',
    icon: CreditCard,
    features: [
      'Payment success notifications',
      'Failed payment alerts',
      'Invoice delivery via WhatsApp',
      'Subscription renewal reminders',
      'Refund confirmation messages',
      'Payment link sharing'
    ],
    useCases: [
      'Instantly confirm successful payments',
      'Alert customers about failed transactions',
      'Send payment links for easy checkout',
      'Remind customers before subscription renewal'
    ],
    setupTime: '5 minutes',
    status: 'available',
    docsUrl: '/help/integrations-guide'
  },
  {
    id: 'payu',
    name: 'PayU',
    category: 'Payments',
    description: 'Automate payment notifications and transaction updates for your customers.',
    longDescription: 'Connect PayU to send real-time payment updates, transaction receipts, and payment reminders through WhatsApp. Improve payment success rates with timely notifications.',
    color: 'bg-emerald-500',
    icon: CreditCard,
    features: [
      'Transaction confirmations',
      'Payment failure alerts',
      'EMI payment reminders',
      'Refund notifications',
      'Invoice attachments',
      'Payment status updates'
    ],
    useCases: [
      'Notify customers about EMI due dates',
      'Send transaction receipts instantly',
      'Alert about payment failures with retry links',
      'Confirm refund processing'
    ],
    setupTime: '5 minutes',
    status: 'coming-soon'
  },
  {
    id: 'zapier',
    name: 'Zapier',
    category: 'Automation',
    description: 'Connect with 5,000+ apps and automate workflows without writing code.',
    longDescription: 'Use Zapier to connect AiReatro with thousands of apps. Create automated workflows (Zaps) that trigger WhatsApp messages based on events in your favorite tools—no coding required.',
    color: 'bg-orange-500',
    icon: Workflow,
    features: [
      'Connect 5,000+ apps',
      'No-code automation builder',
      'Multi-step workflows',
      'Conditional logic support',
      'Real-time triggers',
      'Data transformation'
    ],
    useCases: [
      'Send WhatsApp when a form is submitted',
      'Notify team when a deal closes in CRM',
      'Trigger messages from Google Sheets updates',
      'Create leads from WhatsApp conversations'
    ],
    setupTime: '10 minutes',
    status: 'available',
    docsUrl: '/help/integrations-guide'
  },
  {
    id: 'pabbly',
    name: 'Pabbly Connect',
    category: 'Automation',
    description: 'Affordable automation platform to connect apps and trigger WhatsApp messages.',
    longDescription: 'Pabbly Connect offers a cost-effective way to automate WhatsApp messaging. Create workflows that connect your favorite apps and trigger personalized messages based on events.',
    color: 'bg-indigo-500',
    icon: Workflow,
    features: [
      'One-time pricing option',
      'Unlimited workflows',
      'Multi-app connections',
      'Webhook triggers',
      'Data formatting',
      'Error handling'
    ],
    useCases: [
      'Automate lead notifications to WhatsApp',
      'Sync CRM contacts with WhatsApp',
      'Trigger messages from form submissions',
      'Create automated onboarding sequences'
    ],
    setupTime: '10 minutes',
    status: 'coming-soon'
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    category: 'CRM',
    description: 'Sync contacts, track conversations, and engage customers from your CRM.',
    longDescription: 'Integrate HubSpot CRM with AiReatro to manage WhatsApp conversations alongside your sales pipeline. Sync contacts, log conversations, and trigger automated messages based on deal stages.',
    color: 'bg-orange-600',
    icon: Users,
    features: [
      'Two-way contact sync',
      'Conversation logging',
      'Deal stage triggers',
      'Custom property mapping',
      'Timeline integration',
      'Workflow automation'
    ],
    useCases: [
      'Log WhatsApp conversations in HubSpot',
      'Trigger messages when deals move stages',
      'Sync contact properties automatically',
      'Create HubSpot contacts from WhatsApp'
    ],
    setupTime: '15 minutes',
    status: 'available',
    docsUrl: '/help/integrations-guide'
  },
  {
    id: 'leadsquared',
    name: 'LeadSquared',
    category: 'CRM',
    description: 'Enterprise CRM integration for sales teams with WhatsApp automation.',
    longDescription: 'Connect LeadSquared to automate lead engagement via WhatsApp. Trigger messages based on lead scores, activities, and stages. Perfect for sales teams handling high volumes.',
    color: 'bg-teal-500',
    icon: Users,
    features: [
      'Lead activity triggers',
      'Score-based messaging',
      'Custom field mapping',
      'Activity logging',
      'Sales automation',
      'Team notifications'
    ],
    useCases: [
      'Send messages when leads reach a score threshold',
      'Notify sales reps of hot leads via WhatsApp',
      'Automate follow-up sequences',
      'Log all WhatsApp interactions in CRM'
    ],
    setupTime: '15 minutes',
    status: 'available',
    docsUrl: '/help/integrations-guide'
  },
  {
    id: 'freshdesk',
    name: 'Freshdesk',
    category: 'Support',
    description: 'Convert WhatsApp messages into support tickets and manage from Freshdesk.',
    longDescription: 'Integrate Freshdesk to create support tickets from WhatsApp conversations. Agents can respond directly from Freshdesk while customers receive replies on WhatsApp.',
    color: 'bg-green-600',
    icon: MessageSquare,
    features: [
      'Auto ticket creation',
      'Two-way messaging',
      'Agent assignment',
      'SLA tracking',
      'Canned responses',
      'Customer context'
    ],
    useCases: [
      'Create tickets from WhatsApp queries',
      'Reply to customers from Freshdesk',
      'Track resolution times',
      'Escalate urgent issues'
    ],
    setupTime: '10 minutes',
    status: 'coming-soon'
  },
  {
    id: 'webhooks',
    name: 'Webhooks API',
    category: 'Developer',
    description: 'Build custom integrations with incoming and outgoing webhooks.',
    longDescription: 'Use our Webhooks API to build custom integrations with any system. Receive real-time events and trigger actions programmatically. Full flexibility for developers.',
    color: 'bg-slate-700',
    icon: Webhook,
    features: [
      'Real-time event delivery',
      'Signature verification',
      'Retry with backoff',
      'Event filtering',
      'Payload customization',
      'Debug console'
    ],
    useCases: [
      'Build custom CRM integrations',
      'Connect to proprietary systems',
      'Create event-driven workflows',
      'Sync data with internal tools'
    ],
    setupTime: '30 minutes',
    status: 'available',
    docsUrl: '/help/integrations-guide'
  },
  {
    id: 'google-sheets',
    name: 'Google Sheets',
    category: 'Productivity',
    description: 'Export data and sync contacts automatically with Google Sheets.',
    longDescription: 'Connect Google Sheets to automatically export conversation data, sync contacts, and trigger WhatsApp messages from spreadsheet updates. Perfect for teams using spreadsheets for workflows.',
    color: 'bg-green-500',
    icon: BarChart3,
    features: [
      'Auto data export',
      'Contact sync',
      'Spreadsheet triggers',
      'Scheduled exports',
      'Custom field mapping',
      'Real-time updates'
    ],
    useCases: [
      'Export conversation metrics daily',
      'Trigger messages from spreadsheet rows',
      'Sync contact lists automatically',
      'Build reporting dashboards'
    ],
    setupTime: '5 minutes',
    status: 'available',
    docsUrl: '/help/integrations-guide'
  },
  {
    id: 'mailchimp',
    name: 'Mailchimp',
    category: 'Marketing',
    description: 'Sync audiences and coordinate email + WhatsApp campaigns.',
    longDescription: 'Connect Mailchimp to sync your email audiences with WhatsApp. Coordinate multi-channel campaigns and reach customers on their preferred channel.',
    color: 'bg-yellow-500',
    icon: Mail,
    features: [
      'Audience sync',
      'Tag mapping',
      'Campaign coordination',
      'Subscriber triggers',
      'Engagement tracking',
      'Segment sync'
    ],
    useCases: [
      'Send WhatsApp to email non-openers',
      'Sync newsletter subscribers',
      'Coordinate product launches',
      'Re-engage inactive subscribers'
    ],
    setupTime: '10 minutes',
    status: 'coming-soon'
  },
];

const categories = [
  { id: 'all', name: 'All', count: integrations.length },
  { id: 'e-commerce', name: 'E-commerce', count: integrations.filter(i => i.category === 'E-commerce').length },
  { id: 'payments', name: 'Payments', count: integrations.filter(i => i.category === 'Payments').length },
  { id: 'automation', name: 'Automation', count: integrations.filter(i => i.category === 'Automation').length },
  { id: 'crm', name: 'CRM', count: integrations.filter(i => i.category === 'CRM').length },
  { id: 'developer', name: 'Developer', count: integrations.filter(i => i.category === 'Developer').length },
];

function IntegrationCard({ integration, onSelect }: { integration: Integration; onSelect: (id: string) => void }) {
  const Icon = integration.icon;
  
  return (
    <Card 
      id={integration.id}
      className="border-border/50 hover:shadow-lg hover:border-primary/20 transition-all cursor-pointer group"
      onClick={() => onSelect(integration.id)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className={`w-12 h-12 rounded-xl ${integration.color} flex items-center justify-center text-white`}>
            <Icon className="w-6 h-6" />
          </div>
          <Badge variant={integration.status === 'available' ? 'default' : 'secondary'}>
            {integration.status === 'available' ? 'Available' : 'Coming Soon'}
          </Badge>
        </div>
        <CardTitle className="text-lg group-hover:text-primary transition-colors mt-3">{integration.name}</CardTitle>
        <p className="text-xs text-muted-foreground">{integration.category} • {integration.setupTime} setup</p>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-sm">{integration.description}</CardDescription>
      </CardContent>
    </Card>
  );
}

function IntegrationDetail({ integration, onBack }: { integration: Integration; onBack: () => void }) {
  const navigate = useNavigate();
  const Icon = integration.icon;
  
  return (
    <div className="max-w-4xl mx-auto">
      <Button variant="ghost" onClick={onBack} className="mb-6">
        ← Back to all integrations
      </Button>
      
      <div className="flex items-start gap-6 mb-8">
        <div className={`w-20 h-20 rounded-2xl ${integration.color} flex items-center justify-center text-white shrink-0`}>
          <Icon className="w-10 h-10" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-foreground">{integration.name}</h1>
            <Badge variant={integration.status === 'available' ? 'default' : 'secondary'}>
              {integration.status === 'available' ? 'Available' : 'Coming Soon'}
            </Badge>
          </div>
          <p className="text-muted-foreground">{integration.category} • {integration.setupTime} setup</p>
        </div>
        <div className="flex gap-3">
          {integration.docsUrl && (
            <Button variant="outline" onClick={() => navigate(integration.docsUrl!)}>
              View Docs
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          )}
          <Button 
            disabled={integration.status === 'coming-soon'}
            onClick={() => navigate('/app/integrations')}
          >
            {integration.status === 'available' ? 'Connect Now' : 'Coming Soon'}
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="use-cases">Use Cases</TabsTrigger>
          <TabsTrigger value="setup">Setup Guide</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">About this Integration</h3>
              <p className="text-muted-foreground leading-relaxed mb-6">{integration.longDescription}</p>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="text-2xl font-bold text-primary mb-1">{integration.features.length}</div>
                  <div className="text-sm text-muted-foreground">Features</div>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="text-2xl font-bold text-primary mb-1">{integration.setupTime}</div>
                  <div className="text-sm text-muted-foreground">Setup Time</div>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="text-2xl font-bold text-primary mb-1">{integration.useCases.length}</div>
                  <div className="text-sm text-muted-foreground">Use Cases</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="features">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Key Features</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {integration.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="use-cases">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Common Use Cases</h3>
              <div className="space-y-4">
                {integration.useCases.map((useCase, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 rounded-lg border border-border/50">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-sm font-medium text-primary">{index + 1}</span>
                    </div>
                    <p className="text-foreground">{useCase}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="setup">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Setup Guide</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white shrink-0">1</div>
                  <div>
                    <h4 className="font-medium mb-1">Connect your account</h4>
                    <p className="text-sm text-muted-foreground">Go to Integrations Hub and click "Connect" on {integration.name}.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white shrink-0">2</div>
                  <div>
                    <h4 className="font-medium mb-1">Authorize access</h4>
                    <p className="text-sm text-muted-foreground">Grant permissions to sync data between {integration.name} and AiReatro.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white shrink-0">3</div>
                  <div>
                    <h4 className="font-medium mb-1">Configure event mappings</h4>
                    <p className="text-sm text-muted-foreground">Set up which events trigger WhatsApp messages using our visual mapping builder.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white shrink-0">4</div>
                  <div>
                    <h4 className="font-medium mb-1">Test and go live</h4>
                    <p className="text-sm text-muted-foreground">Use the Event Debugger to test your setup, then activate the integration.</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-border">
                <Button onClick={() => navigate('/app/integrations')}>
                  Go to Integrations Hub
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function Integrations() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);

  // Handle hash navigation
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const integration = integrations.find(i => i.id === id);
      if (integration) {
        setSelectedIntegration(id);
      }
    }
  }, [location.hash]);

  const filteredIntegrations = selectedCategory === 'all' 
    ? integrations 
    : integrations.filter(i => i.category.toLowerCase().replace(' ', '-') === selectedCategory);

  const selectedIntegrationData = integrations.find(i => i.id === selectedIntegration);

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
      <SeoMeta route="/integrations" fallbackTitle="Integrations" fallbackDescription="Integrate AiReatro with Shopify, Razorpay, Zapier, and more" />
      <Navbar />

      <PageHero
        badge={{ icon: Zap, text: "Powerful Integrations" }}
        title="Connect Your"
        titleHighlight="Favorite Tools"
        subtitle="Integrate AiReatro with the tools you already use. Automate workflows and boost productivity."
      />

      {selectedIntegrationData ? (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <IntegrationDetail 
              integration={selectedIntegrationData} 
              onBack={() => {
                setSelectedIntegration(null);
                window.history.pushState({}, '', '/integrations');
              }} 
            />
          </div>
        </section>
      ) : (
        <>
          {/* Category Tabs */}
          <section className="py-8 border-b border-border">
            <div className="container mx-auto px-4">
              <div className="flex flex-wrap gap-2 justify-center">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    {category.name}
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {category.count}
                    </Badge>
                  </Button>
                ))}
              </div>
            </div>
          </section>

          {/* Integrations Grid */}
          <section className="py-16">
            <div className="container mx-auto px-4">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
                {filteredIntegrations.map((integration) => (
                  <IntegrationCard 
                    key={integration.id} 
                    integration={integration}
                    onSelect={(id) => {
                      setSelectedIntegration(id);
                      window.history.pushState({}, '', `/integrations#${id}`);
                    }}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* API Section */}
          <section className="py-16 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
                <div>
                  <Badge className="mb-4">Developer API</Badge>
                  <h2 className="text-3xl font-bold text-foreground mb-4">
                    Build Custom Integrations
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Our comprehensive API lets you build exactly what you need. Send messages, manage templates, and automate workflows programmatically.
                  </p>
                  <div className="space-y-3 mb-8">
                    {apiFeatures.map((feature, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                        <span className="text-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Button size="lg" onClick={() => navigate('/documentation')}>
                    View API Docs
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
                <div>
                  <Card className="bg-slate-900 border-slate-800 overflow-hidden">
                    <CardContent className="p-6">
                      <pre className="text-sm text-slate-300 overflow-x-auto">
                        <code>{`// Send a WhatsApp message
const response = await AiReatro.messages.send({
  to: "+919876543210",
  template: "order_confirmation",
  variables: {
    name: "John",
    order_id: "ORD-12345"
  }
});

console.log(response.message_id);
// => "wamid.HBgLMTIzNDU2Nzg5..."`}</code>
                      </pre>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="py-16 bg-primary/5 border-t border-border">
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                Need a Custom Integration?
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto mb-8">
                Our team can help you build custom integrations for your specific needs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" onClick={() => navigate('/contact')}>
                  Contact Us
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate('/app/integrations')}>
                  Go to Integrations Hub
                </Button>
              </div>
            </div>
          </section>
        </>
      )}

      <Footer />
    </div>
  );
}
