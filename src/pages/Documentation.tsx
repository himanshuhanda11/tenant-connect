import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import SeoMeta from '@/components/seo/SeoMeta';
import { 
  Search, 
  Book, 
  Code, 
  Zap, 
  ArrowRight,
  ExternalLink,
  Terminal,
  FileText,
  Webhook,
  Key,
  Menu,
  X,
  FileCode,
  History,
  AlertTriangle,
  Gauge,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Breadcrumb from '@/components/layout/Breadcrumb';
import { DocsSidebar } from '@/components/docs/DocsSidebar';
import { CodeBlock } from '@/components/docs/CodeBlock';
import { ApiStatusBadge, ApiStatusCard } from '@/components/docs/ApiStatusBadge';
import { SDKCards } from '@/components/docs/SDKCards';
import { Changelog } from '@/components/docs/Changelog';
import { RateLimitsTable } from '@/components/docs/RateLimitsTable';
import { ErrorCodesTable } from '@/components/docs/ErrorCodesTable';

// Multi-language code examples
const sendMessageExamples = [
  {
    language: 'javascript',
    label: 'JavaScript',
    code: `// Install: npm install @aireatro/sdk
import { AiReatro } from '@aireatro/sdk';

const client = new AiReatro({ apiKey: 'YOUR_API_KEY' });

// Send a text message
const response = await client.messages.send({
  to: '+1234567890',
  type: 'text',
  text: { body: 'Hello from AiReatro!' }
});

console.log('Message ID:', response.messageId);`
  },
  {
    language: 'python',
    label: 'Python',
    code: `# Install: pip install aireatro
from aireatro import AiReatro

client = AiReatro(api_key="YOUR_API_KEY")

# Send a text message
response = client.messages.send(
    to="+1234567890",
    type="text",
    text={"body": "Hello from AiReatro!"}
)

print(f"Message ID: {response.message_id}")`
  },
  {
    language: 'php',
    label: 'PHP',
    code: `<?php
// Install: composer require aireatro/sdk
require 'vendor/autoload.php';

use AiReatro\\Client;

$client = new Client(['api_key' => 'YOUR_API_KEY']);

// Send a text message
$response = $client->messages->send([
    'to' => '+1234567890',
    'type' => 'text',
    'text' => ['body' => 'Hello from AiReatro!']
]);

echo "Message ID: " . $response->messageId;`
  },
  {
    language: 'curl',
    label: 'cURL',
    code: `curl -X POST https://api.aireatro.com/v1/messages \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "to": "+1234567890",
    "type": "text",
    "text": { "body": "Hello from AiReatro!" }
  }'`
  }
];

const templateMessageExamples = [
  {
    language: 'javascript',
    label: 'JavaScript',
    code: `// Send a template message
const response = await client.messages.sendTemplate({
  to: '+1234567890',
  template: {
    name: 'order_confirmation',
    language: { code: 'en' },
    components: [
      {
        type: 'body',
        parameters: [
          { type: 'text', text: 'John' },
          { type: 'text', text: 'ORD-12345' }
        ]
      }
    ]
  }
});`
  },
  {
    language: 'python',
    label: 'Python',
    code: `# Send a template message
response = client.messages.send_template(
    to="+1234567890",
    template={
        "name": "order_confirmation",
        "language": {"code": "en"},
        "components": [
            {
                "type": "body",
                "parameters": [
                    {"type": "text", "text": "John"},
                    {"type": "text", "text": "ORD-12345"}
                ]
            }
        ]
    }
)`
  }
];

const webhookExample = [
  {
    language: 'javascript',
    label: 'Node.js',
    code: `// Express.js webhook handler
import express from 'express';
import { verifyWebhookSignature } from '@aireatro/sdk';

const app = express();

app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const signature = req.headers['x-aireatro-signature'];
  
  // Verify webhook authenticity
  if (!verifyWebhookSignature(req.body, signature, WEBHOOK_SECRET)) {
    return res.status(401).send('Invalid signature');
  }
  
  const event = JSON.parse(req.body);
  
  switch (event.type) {
    case 'message.received':
      console.log('New message:', event.data);
      break;
    case 'message.delivered':
      console.log('Message delivered:', event.data.messageId);
      break;
    case 'message.read':
      console.log('Message read:', event.data.messageId);
      break;
  }
  
  res.status(200).send('OK');
});`
  }
];

export default function Documentation() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState('quickstart');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('getting-started');

  const quickLinks = [
    { icon: Terminal, title: 'Quickstart', description: 'Send your first message in 5 minutes', id: 'getting-started' },
    { icon: Key, title: 'Authentication', description: 'API keys and security', id: 'api-reference' },
    { icon: FileCode, title: 'SDKs', description: 'Official libraries & tools', id: 'sdks' },
    { icon: Webhook, title: 'Webhooks', description: 'Real-time event notifications', id: 'webhooks' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <SeoMeta route="/documentation" fallbackTitle="API Documentation" fallbackDescription="Developer docs & SDKs" />

      <Navbar />

      {/* Hero */}
      <section className="relative pt-16 pb-10 md:pt-20 md:pb-14 overflow-hidden bg-gradient-to-b from-background to-muted/30">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-1/3 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-1/3 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[80px]" />
        </div>
        
        <div className="container mx-auto px-4 relative">
          <Breadcrumb className="mb-6" />
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 text-sm font-medium">
                <Book className="w-4 h-4" />
                Developer Docs
              </div>
              <ApiStatusBadge />
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Build with{' '}
              <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                AiReatro API
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Everything you need to integrate WhatsApp messaging into your applications.
              SDKs, webhooks, and comprehensive guides.
            </p>

            {/* Search */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search documentation..."
                className="h-14 pl-12 pr-4 text-lg bg-card border shadow-lg rounded-xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-8 border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {quickLinks.map((link) => (
              <button 
                key={link.id}
                onClick={() => setActiveTab(link.id)}
                className="text-left p-4 rounded-xl border border-border/50 bg-card hover:shadow-lg hover:border-primary/30 transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                  <link.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">{link.title}</h3>
                <p className="text-sm text-muted-foreground">{link.description}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Documentation Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex gap-8">
              {/* Sidebar - Desktop */}
              <aside className="hidden lg:block w-64 flex-shrink-0">
                <div className="sticky top-24">
                  <DocsSidebar 
                    activeSection={activeSection}
                    onSectionChange={setActiveSection}
                  />
                </div>
              </aside>

              {/* Mobile Menu */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild className="lg:hidden fixed bottom-6 right-6 z-50">
                  <Button size="lg" className="rounded-full shadow-lg">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 p-0">
                  <div className="p-4 border-b border-border">
                    <h2 className="font-semibold">Documentation</h2>
                  </div>
                  <div className="p-4">
                    <DocsSidebar 
                      activeSection={activeSection}
                      onSectionChange={(id) => {
                        setActiveSection(id);
                        setMobileMenuOpen(false);
                      }}
                    />
                  </div>
                </SheetContent>
              </Sheet>

              {/* Main Content */}
              <main className="flex-1 min-w-0">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="w-full justify-start border-b border-border rounded-none bg-transparent h-auto p-0 mb-8 overflow-x-auto flex-nowrap">
                    <TabsTrigger value="getting-started" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3">
                      <Zap className="w-4 h-4 mr-2" />
                      Getting Started
                    </TabsTrigger>
                    <TabsTrigger value="api-reference" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3">
                      <Code className="w-4 h-4 mr-2" />
                      API Reference
                    </TabsTrigger>
                    <TabsTrigger value="sdks" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3">
                      <FileCode className="w-4 h-4 mr-2" />
                      SDKs
                    </TabsTrigger>
                    <TabsTrigger value="webhooks" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3">
                      <Webhook className="w-4 h-4 mr-2" />
                      Webhooks
                    </TabsTrigger>
                    <TabsTrigger value="errors" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Errors
                    </TabsTrigger>
                    <TabsTrigger value="changelog" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3">
                      <History className="w-4 h-4 mr-2" />
                      Changelog
                    </TabsTrigger>
                  </TabsList>

                  {/* Getting Started Tab */}
                  <TabsContent value="getting-started" className="space-y-8 mt-0">
                    <div>
                      <h2 className="text-3xl font-bold text-foreground mb-4">Getting Started</h2>
                      <p className="text-lg text-muted-foreground mb-8">
                        Learn how to integrate AiReatro into your application and send your first WhatsApp message in minutes.
                      </p>
                    </div>

                    {/* Step 1 */}
                    <Card className="border-border/50">
                      <CardHeader>
                        <div className="flex items-center gap-3 mb-2">
                          <Badge className="bg-primary text-primary-foreground">Step 1</Badge>
                          <CardTitle>Get Your API Key</CardTitle>
                        </div>
                        <CardDescription>
                          Create an account and generate your API key from the dashboard.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button onClick={() => navigate('/signup')} className="gap-2">
                          Create Free Account
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Step 2 */}
                    <Card className="border-border/50">
                      <CardHeader>
                        <div className="flex items-center gap-3 mb-2">
                          <Badge className="bg-primary text-primary-foreground">Step 2</Badge>
                          <CardTitle>Install the SDK</CardTitle>
                        </div>
                        <CardDescription>
                          Choose your preferred language and install our official SDK.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                          {[
                            { lang: 'JavaScript', cmd: 'npm install @aireatro/sdk' },
                            { lang: 'Python', cmd: 'pip install aireatro' },
                            { lang: 'PHP', cmd: 'composer require aireatro/sdk' },
                            { lang: 'Go', cmd: 'go get github.com/aireatro/go-sdk' }
                          ].map((sdk) => (
                            <div 
                              key={sdk.lang}
                              className="p-3 rounded-lg bg-slate-950 cursor-pointer hover:bg-slate-900 transition-colors group"
                              onClick={() => navigator.clipboard.writeText(sdk.cmd)}
                            >
                              <p className="text-xs text-slate-400 mb-1">{sdk.lang}</p>
                              <code className="text-xs text-slate-300 font-mono">{sdk.cmd}</code>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Step 3 */}
                    <Card className="border-border/50">
                      <CardHeader>
                        <div className="flex items-center gap-3 mb-2">
                          <Badge className="bg-primary text-primary-foreground">Step 3</Badge>
                          <CardTitle>Send Your First Message</CardTitle>
                        </div>
                        <CardDescription>
                          Copy this code to send a WhatsApp message instantly.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <CodeBlock 
                          examples={sendMessageExamples}
                          title="send-message.js"
                        />
                      </CardContent>
                    </Card>

                    {/* Template Messages */}
                    <div className="pt-8">
                      <h3 className="text-2xl font-bold text-foreground mb-4">Template Messages</h3>
                      <p className="text-muted-foreground mb-6">
                        Use pre-approved templates to message users outside the 24-hour window.
                      </p>
                      <CodeBlock 
                        examples={templateMessageExamples}
                        title="template-message.js"
                      />
                    </div>
                  </TabsContent>

                  {/* API Reference Tab */}
                  <TabsContent value="api-reference" className="space-y-8 mt-0">
                    <div>
                      <h2 className="text-3xl font-bold text-foreground mb-4">API Reference</h2>
                      <p className="text-lg text-muted-foreground mb-8">
                        Complete API documentation with endpoints, parameters, and response formats.
                      </p>
                    </div>

                    {/* Base URL */}
                    <Card className="border-border/50">
                      <CardHeader>
                        <CardTitle>Base URL</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <code className="block p-4 rounded-lg bg-slate-950 text-slate-300 font-mono text-sm">
                          https://api.aireatro.com/v1
                        </code>
                      </CardContent>
                    </Card>

                    {/* Authentication */}
                    <Card className="border-border/50">
                      <CardHeader>
                        <CardTitle>Authentication</CardTitle>
                        <CardDescription>
                          All API requests require an API key in the Authorization header.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <CodeBlock 
                          examples={[{
                            language: 'headers',
                            label: 'Headers',
                            code: `Authorization: Bearer YOUR_API_KEY
Content-Type: application/json`
                          }]}
                        />
                      </CardContent>
                    </Card>

                    {/* Rate Limits */}
                    <div className="pt-4">
                      <h3 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                        <Gauge className="w-6 h-6" />
                        Rate Limits
                      </h3>
                      <RateLimitsTable />
                    </div>

                    {/* API Status */}
                    <div className="pt-4">
                      <ApiStatusCard />
                    </div>

                    {/* OpenAPI Spec */}
                    <Card className="border-border/50 bg-gradient-to-r from-primary/5 to-purple-500/5">
                      <CardContent className="flex items-center justify-between p-6">
                        <div>
                          <h4 className="font-semibold text-foreground mb-1">OpenAPI Specification</h4>
                          <p className="text-sm text-muted-foreground">Download our OpenAPI 3.0 spec for tools like Postman, Insomnia, or code generators.</p>
                        </div>
                        <Button variant="outline" className="gap-2">
                          <ExternalLink className="w-4 h-4" />
                          Download OpenAPI
                        </Button>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* SDKs Tab */}
                  <TabsContent value="sdks" className="space-y-8 mt-0">
                    <div>
                      <h2 className="text-3xl font-bold text-foreground mb-4">Official SDKs & Libraries</h2>
                      <p className="text-lg text-muted-foreground mb-8">
                        Use our official SDKs for the best developer experience. All SDKs are open-source and actively maintained.
                      </p>
                    </div>

                    <SDKCards />

                    {/* Community SDKs */}
                    <div className="pt-8">
                      <h3 className="text-xl font-semibold text-foreground mb-4">Community Libraries</h3>
                      <p className="text-muted-foreground mb-4">
                        These libraries are maintained by our community. While not officially supported, they're great alternatives.
                      </p>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[
                          { name: 'Ruby', gem: 'aireatro-ruby', maintainer: 'Community' },
                          { name: 'Rust', gem: 'aireatro-rs', maintainer: 'Community' },
                          { name: 'Java', gem: 'aireatro-java', maintainer: 'Community' }
                        ].map((lib) => (
                          <div key={lib.name} className="p-4 rounded-lg border border-border/50 bg-muted/30">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">{lib.name}</span>
                              <Badge variant="outline" className="text-xs">Community</Badge>
                            </div>
                            <code className="text-xs text-muted-foreground">{lib.gem}</code>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  {/* Webhooks Tab */}
                  <TabsContent value="webhooks" className="space-y-8 mt-0">
                    <div>
                      <h2 className="text-3xl font-bold text-foreground mb-4">Webhooks</h2>
                      <p className="text-lg text-muted-foreground mb-8">
                        Receive real-time notifications when events occur in your account.
                      </p>
                    </div>

                    {/* Webhook Events */}
                    <Card className="border-border/50">
                      <CardHeader>
                        <CardTitle>Available Events</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid sm:grid-cols-2 gap-3">
                          {[
                            { event: 'message.received', desc: 'New message from customer' },
                            { event: 'message.sent', desc: 'Message sent successfully' },
                            { event: 'message.delivered', desc: 'Message delivered to device' },
                            { event: 'message.read', desc: 'Message read by recipient' },
                            { event: 'message.failed', desc: 'Message delivery failed' },
                            { event: 'conversation.started', desc: 'New conversation opened' },
                            { event: 'conversation.closed', desc: 'Conversation marked closed' },
                            { event: 'template.approved', desc: 'Template approved by Meta' }
                          ].map((evt) => (
                            <div key={evt.event} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                              <div>
                                <code className="text-sm font-mono text-foreground">{evt.event}</code>
                                <p className="text-xs text-muted-foreground">{evt.desc}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Webhook Handler */}
                    <div>
                      <h3 className="text-xl font-semibold text-foreground mb-4">Example Webhook Handler</h3>
                      <CodeBlock 
                        examples={webhookExample}
                        title="webhook-handler.js"
                      />
                    </div>

                    {/* Security */}
                    <Card className="border-border/50 border-amber-500/30 bg-amber-500/5">
                      <CardContent className="flex items-start gap-4 p-6">
                        <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-foreground mb-1">Security Best Practices</h4>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            <li>• Always verify webhook signatures before processing</li>
                            <li>• Use HTTPS endpoints only</li>
                            <li>• Respond with 200 within 5 seconds</li>
                            <li>• Implement idempotency for duplicate events</li>
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Errors Tab */}
                  <TabsContent value="errors" className="space-y-8 mt-0">
                    <div>
                      <h2 className="text-3xl font-bold text-foreground mb-4">Error Handling</h2>
                      <p className="text-lg text-muted-foreground mb-8">
                        Comprehensive guide to API errors, codes, and troubleshooting steps.
                      </p>
                    </div>

                    <ErrorCodesTable />
                  </TabsContent>

                  {/* Changelog Tab */}
                  <TabsContent value="changelog" className="space-y-8 mt-0">
                    <div>
                      <h2 className="text-3xl font-bold text-foreground mb-4">Changelog</h2>
                      <p className="text-lg text-muted-foreground mb-8">
                        Stay up to date with the latest API changes, new features, and improvements.
                      </p>
                    </div>

                    <Changelog />
                  </TabsContent>
                </Tabs>
              </main>

              {/* Right Sidebar - Quick Links */}
              <aside className="hidden xl:block w-56 flex-shrink-0">
                <div className="sticky top-24 space-y-6">
                  <ApiStatusCard />
                  
                  <Card className="border-border/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Need Help?</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button variant="outline" size="sm" className="w-full justify-start text-xs" onClick={() => navigate('/help')}>
                        <Book className="w-3.5 h-3.5 mr-2" />
                        Help Center
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start text-xs" onClick={() => navigate('/contact')}>
                        <FileText className="w-3.5 h-3.5 mr-2" />
                        Contact Support
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
