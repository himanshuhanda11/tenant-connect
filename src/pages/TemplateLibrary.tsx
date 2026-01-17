import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, FileText, ArrowRight, Copy, CheckCircle2, Tag, MessageSquare, 
  Megaphone, Bell, ShoppingBag, Calendar, Headphones, Star, Sparkles,
  CreditCard, Truck, Gift, UserPlus, RefreshCw, Shield, Clock, Heart,
  AlertCircle, Package, MapPin, Ticket, Users, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { SEO } from '@/components/seo';

export default function TemplateLibrary() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = [
    { name: 'All', icon: FileText, count: 25 },
    { name: 'Marketing', icon: Megaphone, count: 6 },
    { name: 'E-commerce', icon: ShoppingBag, count: 5 },
    { name: 'Notifications', icon: Bell, count: 5 },
    { name: 'Appointments', icon: Calendar, count: 4 },
    { name: 'Support', icon: Headphones, count: 3 },
    { name: 'Payments', icon: CreditCard, count: 2 }
  ];

  const templates = [
    {
      id: 1,
      name: 'Order Confirmation',
      category: 'E-commerce',
      icon: Package,
      description: 'Confirm orders with details, amount, and tracking information',
      body: 'Hi {{1}}! 🎉\n\nThank you for your order #{{2}}!\n\nOrder Total: ₹{{3}}\nEstimated Delivery: {{4}}\n\nTrack your order: {{5}}\n\nNeed help? Reply to this message!',
      variables: ['Customer Name', 'Order ID', 'Total Amount', 'Delivery Date', 'Tracking URL'],
      tags: ['transactional', 'order', 'confirmation'],
      status: 'approved',
      downloads: 12500
    },
    {
      id: 2,
      name: 'Appointment Reminder',
      category: 'Appointments',
      icon: Calendar,
      description: 'Remind customers of upcoming appointments with details',
      body: 'Hello {{1}},\n\nThis is a reminder for your appointment:\n\n📅 Date: {{2}}\n⏰ Time: {{3}}\n📍 Location: {{4}}\n\nNeed to reschedule? Reply YES or call us.\n\nSee you soon!',
      variables: ['Customer Name', 'Date', 'Time', 'Location'],
      tags: ['reminder', 'appointment', 'scheduling'],
      status: 'approved',
      downloads: 9800
    },
    {
      id: 3,
      name: 'Flash Sale Alert',
      category: 'Marketing',
      icon: Zap,
      description: 'Create urgency with limited-time promotional offers',
      body: '⚡ FLASH SALE, {{1}}!\n\nGet {{2}}% OFF for the next {{3}} hours only!\n\nUse code: {{4}}\n\n🛒 Shop now: {{5}}\n\nHurry, limited stock!',
      variables: ['Customer Name', 'Discount %', 'Hours', 'Promo Code', 'Shop URL'],
      tags: ['marketing', 'sale', 'urgent'],
      status: 'approved',
      downloads: 8700
    },
    {
      id: 4,
      name: 'Shipping Update',
      category: 'E-commerce',
      icon: Truck,
      description: 'Keep customers informed about their shipment status',
      body: 'Hi {{1}},\n\n📦 Your order is on the way!\n\nOrder #{{2}} has been shipped.\n\nCarrier: {{3}}\nTracking: {{4}}\n\nEstimated delivery: {{5}}\n\nTrack live: {{6}}',
      variables: ['Customer Name', 'Order ID', 'Carrier Name', 'Tracking Number', 'Delivery Date', 'Tracking URL'],
      tags: ['shipping', 'tracking', 'update'],
      status: 'approved',
      downloads: 11200
    },
    {
      id: 5,
      name: 'Welcome Message',
      category: 'Marketing',
      icon: UserPlus,
      description: 'Welcome new subscribers with a warm greeting',
      body: 'Welcome to {{1}}, {{2}}! 🎉\n\nWe\'re thrilled to have you with us.\n\nHere\'s what you can expect:\n✅ Exclusive offers\n✅ Early access to sales\n✅ Personalized recommendations\n\nReply HELP anytime for assistance!',
      variables: ['Brand Name', 'Customer Name'],
      tags: ['welcome', 'onboarding', 'greeting'],
      status: 'approved',
      downloads: 15600
    },
    {
      id: 6,
      name: 'Payment Reminder',
      category: 'Payments',
      icon: CreditCard,
      description: 'Remind customers about pending payments professionally',
      body: 'Hi {{1}},\n\n⚠️ Payment Reminder\n\nYour payment of ₹{{2}} for invoice #{{3}} is due on {{4}}.\n\nPay now: {{5}}\n\nQuestions? Reply to this message.\n\nThank you!',
      variables: ['Customer Name', 'Amount', 'Invoice ID', 'Due Date', 'Payment URL'],
      tags: ['payment', 'reminder', 'invoice'],
      status: 'approved',
      downloads: 7400
    },
    {
      id: 7,
      name: 'Feedback Request',
      category: 'Support',
      icon: Star,
      description: 'Request customer feedback after purchase or service',
      body: 'Hi {{1}},\n\nThank you for choosing {{2}}! 🙏\n\nWe\'d love to hear about your experience.\n\n⭐ Rate us: {{3}}\n\nYour feedback helps us improve!\n\nTake 30 seconds to share your thoughts.',
      variables: ['Customer Name', 'Brand Name', 'Feedback Link'],
      tags: ['feedback', 'review', 'rating'],
      status: 'approved',
      downloads: 8900
    },
    {
      id: 8,
      name: 'Abandoned Cart Recovery',
      category: 'E-commerce',
      icon: ShoppingBag,
      description: 'Recover abandoned carts with personalized reminders',
      body: 'Hi {{1}},\n\n🛒 You left something behind!\n\nYour cart is waiting:\n{{2}}\n\nTotal: ₹{{3}}\n\n✨ Complete your order: {{4}}\n\nNeed help? We\'re here for you!',
      variables: ['Customer Name', 'Cart Items', 'Total', 'Checkout URL'],
      tags: ['cart', 'recovery', 'reminder'],
      status: 'approved',
      downloads: 10300
    },
    {
      id: 9,
      name: 'OTP Verification',
      category: 'Notifications',
      icon: Shield,
      description: 'Secure authentication with one-time passwords',
      body: '🔐 Your verification code is: {{1}}\n\nValid for {{2}} minutes.\n\nDo not share this code with anyone.\n\nDidn\'t request this? Ignore this message.',
      variables: ['OTP Code', 'Validity Minutes'],
      tags: ['security', 'otp', 'verification'],
      status: 'approved',
      downloads: 22100
    },
    {
      id: 10,
      name: 'Appointment Confirmation',
      category: 'Appointments',
      icon: CheckCircle2,
      description: 'Confirm newly booked appointments instantly',
      body: '✅ Appointment Confirmed!\n\nHi {{1}},\n\nYour appointment is booked:\n\n📅 {{2}} at {{3}}\n👨‍⚕️ With: {{4}}\n📍 {{5}}\n\nAdd to calendar: {{6}}\n\nSee you there!',
      variables: ['Customer Name', 'Date', 'Time', 'Provider Name', 'Location', 'Calendar Link'],
      tags: ['confirmation', 'appointment', 'booking'],
      status: 'approved',
      downloads: 8100
    },
    {
      id: 11,
      name: 'Birthday Offer',
      category: 'Marketing',
      icon: Gift,
      description: 'Celebrate customers with special birthday discounts',
      body: '🎂 Happy Birthday, {{1}}!\n\nCelebrate with a special gift from us:\n\n🎁 {{2}}% OFF your next purchase!\n\nUse code: {{3}}\nValid until: {{4}}\n\nTreat yourself: {{5}}\n\nHave an amazing day!',
      variables: ['Customer Name', 'Discount %', 'Birthday Code', 'Expiry Date', 'Shop URL'],
      tags: ['birthday', 'offer', 'personalized'],
      status: 'approved',
      downloads: 6500
    },
    {
      id: 12,
      name: 'Subscription Renewal',
      category: 'Payments',
      icon: RefreshCw,
      description: 'Notify customers about upcoming subscription renewals',
      body: 'Hi {{1}},\n\n🔄 Subscription Renewal Notice\n\nYour {{2}} subscription renews on {{3}}.\n\nAmount: ₹{{4}}/month\n\nManage subscription: {{5}}\n\nQuestions? Reply here.',
      variables: ['Customer Name', 'Plan Name', 'Renewal Date', 'Amount', 'Manage URL'],
      tags: ['subscription', 'renewal', 'billing'],
      status: 'approved',
      downloads: 5200
    },
    {
      id: 13,
      name: 'Delivery Completed',
      category: 'E-commerce',
      icon: Package,
      description: 'Confirm successful order delivery to customers',
      body: '📬 Delivered!\n\nHi {{1}},\n\nGreat news! Your order #{{2}} has been delivered.\n\nDelivered to: {{3}}\nTime: {{4}}\n\nEnjoy your purchase! 🎉\n\nRate your experience: {{5}}',
      variables: ['Customer Name', 'Order ID', 'Address', 'Delivery Time', 'Feedback URL'],
      tags: ['delivery', 'completed', 'confirmation'],
      status: 'approved',
      downloads: 9400
    },
    {
      id: 14,
      name: 'Service Ticket Update',
      category: 'Support',
      icon: Headphones,
      description: 'Update customers on their support ticket status',
      body: 'Hi {{1}},\n\n🎫 Ticket Update #{{2}}\n\nStatus: {{3}}\n\nUpdate: {{4}}\n\nView details: {{5}}\n\nNeed more help? Reply to continue the conversation.',
      variables: ['Customer Name', 'Ticket ID', 'Status', 'Update Message', 'Ticket URL'],
      tags: ['support', 'ticket', 'update'],
      status: 'approved',
      downloads: 4800
    },
    {
      id: 15,
      name: 'Event Reminder',
      category: 'Notifications',
      icon: Ticket,
      description: 'Remind attendees about upcoming events',
      body: '🎪 Event Reminder!\n\nHi {{1}},\n\n{{2}} is {{3}}!\n\n📅 {{4}} at {{5}}\n📍 {{6}}\n\n🎟️ Your ticket: {{7}}\n\nSee you there!',
      variables: ['Attendee Name', 'Event Name', 'Time Until (e.g., tomorrow)', 'Date', 'Time', 'Venue', 'Ticket Link'],
      tags: ['event', 'reminder', 'ticket'],
      status: 'approved',
      downloads: 7200
    },
    {
      id: 16,
      name: 'Back in Stock Alert',
      category: 'Marketing',
      icon: Bell,
      description: 'Notify customers when wished items are available',
      body: '🔔 Back in Stock!\n\nHi {{1}},\n\nGreat news! {{2}} is back in stock!\n\n💰 Price: ₹{{3}}\n\nGrab yours before it\'s gone: {{4}}\n\nLimited quantities available!',
      variables: ['Customer Name', 'Product Name', 'Price', 'Product URL'],
      tags: ['restock', 'alert', 'wishlist'],
      status: 'approved',
      downloads: 6100
    },
    {
      id: 17,
      name: 'Referral Invite',
      category: 'Marketing',
      icon: Users,
      description: 'Encourage customers to refer friends',
      body: 'Hi {{1}},\n\n💝 Share the love!\n\nInvite friends to {{2}} and you BOTH get ₹{{3}} off!\n\nYour referral code: {{4}}\n\nShare now: {{5}}\n\nThe more you share, the more you earn!',
      variables: ['Customer Name', 'Brand Name', 'Reward Amount', 'Referral Code', 'Share Link'],
      tags: ['referral', 'reward', 'invite'],
      status: 'approved',
      downloads: 5800
    },
    {
      id: 18,
      name: 'Password Reset',
      category: 'Notifications',
      icon: Shield,
      description: 'Secure password reset link delivery',
      body: '🔑 Password Reset Request\n\nHi {{1}},\n\nWe received a request to reset your password.\n\nReset now: {{2}}\n\nThis link expires in {{3}} minutes.\n\nDidn\'t request this? Ignore this message.',
      variables: ['Customer Name', 'Reset URL', 'Expiry Minutes'],
      tags: ['security', 'password', 'reset'],
      status: 'approved',
      downloads: 14200
    },
    {
      id: 19,
      name: 'Appointment Cancellation',
      category: 'Appointments',
      icon: AlertCircle,
      description: 'Confirm appointment cancellations professionally',
      body: 'Hi {{1}},\n\n❌ Appointment Cancelled\n\nYour appointment on {{2}} at {{3}} has been cancelled.\n\nReschedule: {{4}}\n\nWe hope to see you soon!',
      variables: ['Customer Name', 'Date', 'Time', 'Booking URL'],
      tags: ['cancellation', 'appointment', 'reschedule'],
      status: 'approved',
      downloads: 4300
    },
    {
      id: 20,
      name: 'Loyalty Points Update',
      category: 'Marketing',
      icon: Heart,
      description: 'Update customers on their loyalty rewards balance',
      body: '⭐ Points Update!\n\nHi {{1}},\n\nYou\'ve earned {{2}} points!\n\nTotal balance: {{3}} points\n\n🎁 Redeem rewards: {{4}}\n\nKeep shopping to earn more!',
      variables: ['Customer Name', 'New Points', 'Total Points', 'Rewards URL'],
      tags: ['loyalty', 'points', 'rewards'],
      status: 'approved',
      downloads: 5400
    },
    {
      id: 21,
      name: 'Store Location',
      category: 'Support',
      icon: MapPin,
      description: 'Share store location and directions',
      body: '📍 Find Us!\n\nHi {{1}},\n\nOur nearest store:\n\n{{2}}\n{{3}}\n\n🕐 Hours: {{4}}\n📞 Call: {{5}}\n\n🗺️ Get directions: {{6}}',
      variables: ['Customer Name', 'Store Name', 'Address', 'Hours', 'Phone', 'Maps URL'],
      tags: ['location', 'directions', 'store'],
      status: 'approved',
      downloads: 3900
    },
    {
      id: 22,
      name: 'Waitlist Confirmation',
      category: 'Notifications',
      icon: Clock,
      description: 'Confirm customers have joined a waitlist',
      body: '⏳ You\'re on the list!\n\nHi {{1}},\n\nYou\'ve joined the waitlist for {{2}}.\n\nPosition: #{{3}}\n\nWe\'ll notify you when it\'s your turn.\n\nTrack status: {{4}}',
      variables: ['Customer Name', 'Product/Service', 'Position', 'Status URL'],
      tags: ['waitlist', 'queue', 'confirmation'],
      status: 'approved',
      downloads: 4100
    },
    {
      id: 23,
      name: 'Order Refund Processed',
      category: 'E-commerce',
      icon: RefreshCw,
      description: 'Confirm refund processing to customers',
      body: '💰 Refund Processed!\n\nHi {{1}},\n\nYour refund for order #{{2}} has been processed.\n\nAmount: ₹{{3}}\nMethod: {{4}}\n\nExpect it within {{5}} business days.\n\nQuestions? Reply here.',
      variables: ['Customer Name', 'Order ID', 'Refund Amount', 'Payment Method', 'Days'],
      tags: ['refund', 'order', 'processed'],
      status: 'approved',
      downloads: 6800
    },
    {
      id: 24,
      name: 'Appointment Rescheduled',
      category: 'Appointments',
      icon: Calendar,
      description: 'Confirm rescheduled appointment details',
      body: '🔄 Appointment Rescheduled\n\nHi {{1}},\n\nYour appointment has been moved to:\n\n📅 New Date: {{2}}\n⏰ New Time: {{3}}\n📍 Location: {{4}}\n\nNeed to change again? Reply YES.',
      variables: ['Customer Name', 'New Date', 'New Time', 'Location'],
      tags: ['reschedule', 'appointment', 'update'],
      status: 'approved',
      downloads: 5100
    },
    {
      id: 25,
      name: 'Limited Time Bundle',
      category: 'Marketing',
      icon: Sparkles,
      description: 'Promote exclusive bundle offers',
      body: '✨ Exclusive Bundle!\n\nHi {{1}},\n\n{{2}} - Only ₹{{3}}!\n\nYou save: ₹{{4}} ({{5}}% off)\n\n⏰ Offer ends: {{6}}\n\n🛒 Grab yours: {{7}}\n\nLimited quantities!',
      variables: ['Customer Name', 'Bundle Name', 'Bundle Price', 'Savings', 'Discount %', 'Expiry', 'Shop URL'],
      tags: ['bundle', 'offer', 'limited'],
      status: 'approved',
      downloads: 7600
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
      <SEO
        title="WhatsApp Message Template Library | Pre-Approved Templates | AiReatro"
        description="Browse 25+ pre-approved WhatsApp message templates for marketing, e-commerce, appointments, support, and more. Copy & use instantly."
        canonical="https://aireatro.com/template-library"
        keywords={["WhatsApp templates", "message templates", "pre-approved templates", "WhatsApp Business templates", "marketing templates"]}
      />
      <Navbar />

      {/* Hero - White Background */}
      <section className="relative pt-16 pb-12 md:pt-20 md:pb-16 bg-white overflow-hidden">
        <div className="absolute top-10 right-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-primary/3 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-green-100/50 to-emerald-100/30 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <CheckCircle2 className="w-4 h-4" />
              Pre-Approved & Ready to Use
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              <span className="text-slate-900">WhatsApp Message</span>{' '}
              <span className="text-primary">Template Library</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10">
              25+ professionally crafted templates for every business scenario. Copy, customize, and start messaging instantly.
            </p>

            {/* Search */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search templates by name, category, or tag..."
                className="h-14 pl-12 pr-4 text-lg bg-white border-2 border-slate-200 shadow-lg rounded-xl focus:border-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 mt-10">
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-900">25+</div>
                <div className="text-sm text-slate-600">Templates</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">100%</div>
                <div className="text-sm text-slate-600">Pre-Approved</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-900">7</div>
                <div className="text-sm text-slate-600">Categories</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories - Sticky */}
      <section className="py-6 bg-white sticky top-16 z-40 border-b border-slate-100 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category, index) => (
              <Button
                key={index}
                variant={selectedCategory === category.name ? 'default' : 'outline'}
                className={`rounded-full gap-2 ${selectedCategory === category.name ? 'shadow-lg' : ''}`}
                onClick={() => setSelectedCategory(category.name)}
              >
                <category.icon className="w-4 h-4" />
                {category.name}
                <Badge 
                  variant={selectedCategory === category.name ? 'secondary' : 'outline'} 
                  className="ml-1"
                >
                  {category.count}
                </Badge>
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Templates Grid */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {filteredTemplates.map((template) => (
              <Card key={template.id} className="border-0 shadow-md hover:shadow-xl transition-all duration-300 group bg-white overflow-hidden">
                <CardContent className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <template.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          {template.name}
                        </h3>
                        <Badge variant="secondary" className="mt-1 text-xs">
                          {template.category}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground bg-slate-100 px-2 py-1 rounded-full">
                      <CheckCircle2 className="w-3 h-3 text-green-500" />
                      Approved
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-muted-foreground text-sm mb-4">{template.description}</p>
                  
                  {/* Template Preview */}
                  <div className="bg-slate-50 rounded-xl p-4 mb-4 max-h-36 overflow-y-auto border border-slate-100">
                    <pre className="text-xs text-slate-700 whitespace-pre-wrap font-mono leading-relaxed">
                      {template.body}
                    </pre>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {template.tags.map((tag, i) => (
                      <span key={i} className="px-2.5 py-1 bg-primary/5 text-primary text-xs rounded-full border border-primary/10">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Downloads */}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
                    <MessageSquare className="w-3.5 h-3.5" />
                    {template.downloads.toLocaleString()} uses
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 gap-2 h-10"
                      onClick={() => copyTemplate(template)}
                    >
                      <Copy className="w-4 h-4" />
                      Copy
                    </Button>
                    <Button 
                      size="sm" 
                      className="flex-1 gap-2 h-10 bg-primary hover:bg-primary/90" 
                      onClick={() => navigate('/signup')}
                    >
                      Use Template
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-16">
              <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No templates found</h3>
              <p className="text-muted-foreground mb-4">Try adjusting your search or category filter.</p>
              <Button variant="outline" onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}>
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Best Practices */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">Template Best Practices</h2>
              <p className="text-muted-foreground">Follow these tips to maximize your template approval rate and engagement</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Keep It Concise</h3>
                  <p className="text-muted-foreground text-sm">
                    Under 1024 characters ensures full display on all devices.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Personalize</h3>
                  <p className="text-muted-foreground text-sm">
                    Use {"{{1}}"} variables for names to increase engagement.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Clear CTAs</h3>
                  <p className="text-muted-foreground text-sm">
                    Every template should have a clear call-to-action.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-6 h-6 text-orange-600" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Stay Compliant</h3>
                  <p className="text-muted-foreground text-sm">
                    Follow WhatsApp's policies for faster approval.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-primary via-green-600 to-emerald-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
        
        <div className="container mx-auto px-4 relative text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Ready to Start Messaging?
          </h2>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Create your account and start using these templates in minutes. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="h-14 px-8 bg-white text-primary hover:bg-white/90 shadow-lg" 
              onClick={() => navigate('/signup')}
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="h-14 px-8 border-white/30 text-white hover:bg-white/10" 
              onClick={() => navigate('/contact')}
            >
              Talk to Sales
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}