import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  Book, 
  Code, 
  Zap, 
  MessageSquare, 
  Users, 
  Settings, 
  ArrowRight,
  ChevronRight,
  FileText,
  Terminal,
  Webhook,
  Key
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function Documentation() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const sections = [
    {
      icon: Zap,
      title: 'Getting Started',
      description: 'Quick start guides and setup tutorials',
      color: 'bg-green-500',
      articles: [
        { title: 'Platform Overview', time: '3 min' },
        { title: 'Creating Your Account', time: '2 min' },
        { title: 'Connecting WhatsApp', time: '5 min' },
        { title: 'Sending Your First Message', time: '4 min' }
      ]
    },
    {
      icon: Code,
      title: 'API Reference',
      description: 'Complete API documentation and examples',
      color: 'bg-blue-500',
      articles: [
        { title: 'Authentication', time: '5 min' },
        { title: 'Send Message API', time: '8 min' },
        { title: 'Templates API', time: '6 min' },
        { title: 'Webhooks API', time: '10 min' }
      ]
    },
    {
      icon: MessageSquare,
      title: 'Messaging',
      description: 'Learn about messaging features and best practices',
      color: 'bg-purple-500',
      articles: [
        { title: 'Message Types', time: '5 min' },
        { title: 'Template Messages', time: '7 min' },
        { title: '24-Hour Window', time: '4 min' },
        { title: 'Media Messages', time: '6 min' }
      ]
    },
    {
      icon: Users,
      title: 'Team & Permissions',
      description: 'Manage team access and roles',
      color: 'bg-orange-500',
      articles: [
        { title: 'Role-Based Access', time: '5 min' },
        { title: 'Inviting Team Members', time: '3 min' },
        { title: 'Conversation Assignment', time: '4 min' },
        { title: 'Audit Logs', time: '3 min' }
      ]
    },
    {
      icon: Settings,
      title: 'Configuration',
      description: 'Platform settings and customization',
      color: 'bg-slate-500',
      articles: [
        { title: 'Account Settings', time: '4 min' },
        { title: 'Notification Preferences', time: '3 min' },
        { title: 'Billing & Plans', time: '5 min' },
        { title: 'Security Settings', time: '6 min' }
      ]
    },
    {
      icon: Webhook,
      title: 'Integrations',
      description: 'Connect with external tools and services',
      color: 'bg-pink-500',
      articles: [
        { title: 'Webhook Setup', time: '8 min' },
        { title: 'CRM Integration', time: '10 min' },
        { title: 'Zapier Connection', time: '5 min' },
        { title: 'Custom Integrations', time: '12 min' }
      ]
    }
  ];

  const quickLinks = [
    { icon: Terminal, title: 'API Quickstart', description: 'Get started with our API in 5 minutes', href: '#api' },
    { icon: Key, title: 'Authentication', description: 'Learn about API authentication', href: '#auth' },
    { icon: FileText, title: 'Code Examples', description: 'Ready-to-use code snippets', href: '#examples' },
    { icon: Webhook, title: 'Webhooks Guide', description: 'Set up real-time notifications', href: '#webhooks' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-indigo-950/30 to-slate-950" />
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-indigo-500/15 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/3 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px]" />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:50px_50px]" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-6">
              <Book className="w-4 h-4" />
              Documentation
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Developer{' '}
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Documentation
              </span>
            </h1>
            <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-10">
              Everything you need to integrate and build with smeksh.
            </p>

            {/* Search */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search documentation..."
                className="h-14 pl-12 pr-4 text-lg bg-white border-0 shadow-xl rounded-xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {quickLinks.map((link, index) => (
              <Card key={index} className="border-border/50 hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer group">
                <CardContent className="p-6">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <link.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">{link.title}</h3>
                  <p className="text-sm text-muted-foreground">{link.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Documentation Sections */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-foreground mb-8">Browse Documentation</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sections.map((section, index) => (
                <Card key={index} className="border-border/50 hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-xl ${section.color} flex items-center justify-center mb-4`}>
                      <section.icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-lg">{section.title}</CardTitle>
                    <CardDescription>{section.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {section.articles.map((article, i) => (
                        <li key={i}>
                          <a href="#" className="flex items-center justify-between text-sm text-muted-foreground hover:text-foreground transition-colors group">
                            <span>{article.title}</span>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs">{article.time}</Badge>
                              <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Code Example */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">Quick API Example</h2>
              <p className="text-muted-foreground">Send your first message in just a few lines of code</p>
            </div>
            <Card className="border-border/50 overflow-hidden">
              <div className="bg-slate-900 p-4 flex items-center justify-between border-b border-slate-700">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <Badge variant="secondary">JavaScript</Badge>
              </div>
              <pre className="p-6 bg-slate-900 text-sm overflow-x-auto">
                <code className="text-slate-300">{`// Send a WhatsApp message
const response = await fetch('https://api.smeksh.com/v1/messages', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    to: '+1234567890',
    type: 'text',
    text: { body: 'Hello from smeksh!' }
  })
});

const data = await response.json();
console.log('Message sent:', data.messageId);`}</code>
              </pre>
            </Card>
            <div className="text-center mt-8">
              <Button size="lg" className="gap-2" onClick={() => navigate('/signup')}>
                Get Your API Key
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Help Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">Need Help?</h2>
            <p className="text-muted-foreground mb-8">
              Can't find what you're looking for? Our team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button variant="outline" size="lg" onClick={() => navigate('/help')}>
                Visit Help Center
              </Button>
              <Button size="lg" onClick={() => navigate('/contact')}>
                Contact Support
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
