import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, FileText, ArrowRight, Copy, CheckCircle2, Tag, MessageSquare, Megaphone, Bell, ShoppingBag, Calendar, Headphones } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function TemplateLibrary() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = [
    { name: 'All', icon: FileText, count: 50 },
    { name: 'Marketing', icon: Megaphone, count: 15 },
    { name: 'Notifications', icon: Bell, count: 12 },
    { name: 'E-commerce', icon: ShoppingBag, count: 10 },
    { name: 'Appointments', icon: Calendar, count: 8 },
    { name: 'Support', icon: Headphones, count: 5 }
  ];

  const templates = [
    {
      id: 1,
      name: 'Order Confirmation',
      category: 'E-commerce',
      description: 'Confirm customer orders with details and tracking information',
      body: 'Hi {{1}}! 🎉\n\nThank you for your order #{{2}}!\n\nOrder Total: {{3}}\nEstimated Delivery: {{4}}\n\nTrack your order: {{5}}\n\nNeed help? Reply to this message!',
      variables: ['Customer Name', 'Order ID', 'Total Amount', 'Delivery Date', 'Tracking URL'],
      tags: ['transactional', 'order', 'confirmation'],
      popularity: 98
    },
    {
      id: 2,
      name: 'Appointment Reminder',
      category: 'Appointments',
      description: 'Remind customers of upcoming appointments',
      body: 'Hello {{1}},\n\nThis is a reminder for your appointment:\n\n📅 Date: {{2}}\n⏰ Time: {{3}}\n📍 Location: {{4}}\n\nNeed to reschedule? Reply YES or call us.\n\nSee you soon!',
      variables: ['Customer Name', 'Date', 'Time', 'Location'],
      tags: ['reminder', 'appointment', 'scheduling'],
      popularity: 95
    },
    {
      id: 3,
      name: 'Promotional Offer',
      category: 'Marketing',
      description: 'Share exclusive offers and discounts with customers',
      body: '🎁 EXCLUSIVE OFFER for you, {{1}}!\n\nGet {{2}}% OFF on your next purchase!\n\nUse code: {{3}}\nValid until: {{4}}\n\nShop now: {{5}}\n\nHurry, limited time only!',
      variables: ['Customer Name', 'Discount %', 'Promo Code', 'Expiry Date', 'Shop URL'],
      tags: ['marketing', 'promotion', 'discount'],
      popularity: 92
    },
    {
      id: 4,
      name: 'Shipping Update',
      category: 'E-commerce',
      description: 'Keep customers informed about their shipment status',
      body: 'Hi {{1}},\n\n📦 Your order is on the way!\n\nOrder #{{2}} has been shipped.\n\nCarrier: {{3}}\nTracking: {{4}}\n\nEstimated delivery: {{5}}\n\nTrack live: {{6}}',
      variables: ['Customer Name', 'Order ID', 'Carrier Name', 'Tracking Number', 'Delivery Date', 'Tracking URL'],
      tags: ['shipping', 'tracking', 'update'],
      popularity: 90
    },
    {
      id: 5,
      name: 'Welcome Message',
      category: 'Marketing',
      description: 'Welcome new subscribers or customers',
      body: 'Welcome to {{1}}, {{2}}! 🎉\n\nWe\'re thrilled to have you with us.\n\nHere\'s what you can expect:\n✅ Exclusive offers\n✅ Early access to sales\n✅ Personalized recommendations\n\nReply HELP anytime for assistance!',
      variables: ['Brand Name', 'Customer Name'],
      tags: ['welcome', 'onboarding', 'greeting'],
      popularity: 88
    },
    {
      id: 6,
      name: 'Payment Reminder',
      category: 'Notifications',
      description: 'Remind customers about pending payments',
      body: 'Hi {{1}},\n\n⚠️ Payment Reminder\n\nYour payment of {{2}} for invoice #{{3}} is due on {{4}}.\n\nPay now: {{5}}\n\nQuestions? Reply to this message.\n\nThank you!',
      variables: ['Customer Name', 'Amount', 'Invoice ID', 'Due Date', 'Payment URL'],
      tags: ['payment', 'reminder', 'invoice'],
      popularity: 85
    },
    {
      id: 7,
      name: 'Feedback Request',
      category: 'Support',
      description: 'Request customer feedback after purchase or service',
      body: 'Hi {{1}},\n\nThank you for choosing {{2}}! 🙏\n\nWe\'d love to hear about your experience.\n\nPlease rate us (1-5): {{3}}\n\nYour feedback helps us improve!\n\nReply with your rating.',
      variables: ['Customer Name', 'Brand Name', 'Rating Link'],
      tags: ['feedback', 'review', 'rating'],
      popularity: 82
    },
    {
      id: 8,
      name: 'Abandoned Cart',
      category: 'E-commerce',
      description: 'Recover abandoned carts with personalized reminders',
      body: 'Hi {{1}},\n\n🛒 You left something behind!\n\nYour cart is waiting for you:\n{{2}}\n\nComplete your order: {{3}}\n\nNeed help? We\'re here for you!',
      variables: ['Customer Name', 'Cart Items', 'Checkout URL'],
      tags: ['cart', 'recovery', 'reminder'],
      popularity: 80
    }
  ];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const copyTemplate = (template: typeof templates[0]) => {
    navigator.clipboard.writeText(template.body);
    toast.success(`Template "${template.name}" copied to clipboard!`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950/30 to-slate-950" />
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-blue-500/15 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/3 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px]" />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:50px_50px]" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-6">
              <FileText className="w-4 h-4" />
              Ready-to-Use Templates
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              WhatsApp Message{' '}
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
                Template Library
              </span>
            </h1>
            <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-10">
              Browse our collection of pre-approved message templates for every business need.
            </p>

            {/* Search */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                className="h-14 pl-12 pr-4 text-lg bg-white border-0 shadow-xl rounded-xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category, index) => (
              <Button
                key={index}
                variant={selectedCategory === category.name ? 'default' : 'outline'}
                className="rounded-full gap-2"
                onClick={() => setSelectedCategory(category.name)}
              >
                <category.icon className="w-4 h-4" />
                {category.name}
                <Badge variant="secondary" className="ml-1">{category.count}</Badge>
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Templates Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {filteredTemplates.map((template) => (
              <Card key={template.id} className="border-border/50 hover:shadow-lg transition-shadow group">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <Badge variant="secondary">{template.category}</Badge>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MessageSquare className="w-4 h-4" />
                      {template.popularity}% popular
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{template.name}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{template.description}</p>
                  
                  <div className="bg-muted/50 rounded-lg p-4 mb-4 max-h-32 overflow-y-auto">
                    <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono">
                      {template.body}
                    </pre>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {template.tags.map((tag, i) => (
                      <span key={i} className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 gap-2"
                      onClick={() => copyTemplate(template)}
                    >
                      <Copy className="w-4 h-4" />
                      Copy
                    </Button>
                    <Button size="sm" className="flex-1 gap-2" onClick={() => navigate('/signup')}>
                      Use Template
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No templates found</h3>
              <p className="text-muted-foreground">Try adjusting your search or category filter.</p>
            </div>
          )}
        </div>
      </section>

      {/* Tips Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-foreground mb-8 text-center">Template Best Practices</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-border/50">
                <CardContent className="p-6">
                  <CheckCircle2 className="w-8 h-8 text-green-500 mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">Keep It Concise</h3>
                  <p className="text-muted-foreground text-sm">
                    WhatsApp messages should be short and to the point. Aim for under 1024 characters 
                    to ensure your message is fully displayed.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardContent className="p-6">
                  <CheckCircle2 className="w-8 h-8 text-green-500 mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">Personalize with Variables</h3>
                  <p className="text-muted-foreground text-sm">
                    Use variables like {"{{1}}"} for customer names to make messages feel personal 
                    and increase engagement rates.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardContent className="p-6">
                  <CheckCircle2 className="w-8 h-8 text-green-500 mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">Include Clear CTAs</h3>
                  <p className="text-muted-foreground text-sm">
                    Every template should have a clear call-to-action. Tell customers what you 
                    want them to do next.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardContent className="p-6">
                  <CheckCircle2 className="w-8 h-8 text-green-500 mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">Follow WhatsApp Policies</h3>
                  <p className="text-muted-foreground text-sm">
                    Ensure templates comply with WhatsApp's Business Policy. Avoid promotional 
                    content in transactional templates.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
        
        <div className="container mx-auto px-4 relative text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Ready to Start Messaging?
          </h2>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Create your account and start using these templates in minutes.
          </p>
          <Button size="lg" className="h-14 px-8 bg-white text-blue-600 hover:bg-white/90" onClick={() => navigate('/signup')}>
            Start Free Trial
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
