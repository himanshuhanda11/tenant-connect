import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, TrendingUp, Users, MessageSquare, Clock, Building2, ShoppingBag, Headphones } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function CaseStudies() {
  const navigate = useNavigate();

  const caseStudies = [
    {
      company: 'TechFlow Inc',
      industry: 'E-commerce',
      logo: '🛒',
      title: 'How TechFlow Increased Sales by 40% with WhatsApp',
      summary: 'TechFlow transformed their customer support and marketing by implementing WhatsApp Business API, resulting in dramatic improvements in engagement and sales.',
      stats: [
        { value: '40%', label: 'Sales Increase' },
        { value: '3x', label: 'Response Speed' },
        { value: '95%', label: 'Customer Satisfaction' },
        { value: '60%', label: 'Support Cost Reduction' }
      ],
      quote: 'aireatro helped us connect with customers where they already are. The results exceeded all our expectations.',
      author: 'Sarah Chen',
      role: 'Head of Customer Success',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      company: 'GrowthLabs',
      industry: 'Marketing Agency',
      logo: '📈',
      title: 'GrowthLabs Achieves 95% Open Rates for Client Campaigns',
      summary: 'Marketing agency GrowthLabs leveraged aireatro to deliver exceptional WhatsApp marketing campaigns for their clients, far surpassing email performance.',
      stats: [
        { value: '95%', label: 'Open Rate' },
        { value: '45%', label: 'Click Rate' },
        { value: '8x', label: 'ROI vs Email' },
        { value: '200+', label: 'Campaigns Sent' }
      ],
      quote: 'Our clients are amazed by the engagement rates. WhatsApp has become our primary marketing channel.',
      author: 'Michael Rodriguez',
      role: 'Marketing Director',
      color: 'from-purple-500 to-pink-500'
    },
    {
      company: 'QuickServe',
      industry: 'Food & Beverage',
      logo: '🍔',
      title: 'QuickServe Streamlines Orders with WhatsApp Automation',
      summary: 'Restaurant chain QuickServe automated their order notifications and customer support, reducing wait times and improving customer experience.',
      stats: [
        { value: '70%', label: 'Faster Order Updates' },
        { value: '50%', label: 'Fewer Support Calls' },
        { value: '4.8/5', label: 'Customer Rating' },
        { value: '10min', label: 'Setup Time' }
      ],
      quote: 'Setup was incredibly easy. We were sending automated order updates within 10 minutes of signing up.',
      author: 'Priya Sharma',
      role: 'Operations Manager',
      color: 'from-orange-500 to-red-500'
    },
    {
      company: 'HealthFirst Clinic',
      industry: 'Healthcare',
      logo: '🏥',
      title: 'HealthFirst Reduces No-Shows by 60% with Reminders',
      summary: 'Healthcare provider HealthFirst implemented WhatsApp appointment reminders, dramatically reducing missed appointments and improving patient engagement.',
      stats: [
        { value: '60%', label: 'Fewer No-Shows' },
        { value: '85%', label: 'Reminder Confirmation Rate' },
        { value: '90%', label: 'Patient Satisfaction' },
        { value: '₹2L+', label: 'Monthly Savings' }
      ],
      quote: 'WhatsApp reminders have transformed how we communicate with patients. The reduction in no-shows alone paid for the platform.',
      author: 'Dr. Amit Patel',
      role: 'Medical Director',
      color: 'from-green-500 to-emerald-500'
    }
  ];

  const industries = [
    { icon: ShoppingBag, name: 'E-commerce', count: 12 },
    { icon: Building2, name: 'Enterprise', count: 8 },
    { icon: Headphones, name: 'Customer Support', count: 15 },
    { icon: TrendingUp, name: 'Marketing', count: 10 }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-16 pb-10 md:pt-20 md:pb-14 overflow-hidden bg-gradient-to-b from-background to-muted/30">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-1/3 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-1/3 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[80px]" />
        </div>
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-600 text-sm font-medium mb-6">
              <TrendingUp className="w-4 h-4" />
              Success Stories
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Customer{' '}
              <span className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 bg-clip-text text-transparent">
                Case Studies
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              See how businesses like yours are transforming customer engagement with aireatro.
            </p>
          </div>
        </div>
      </section>

      {/* Industry Filter */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="default" className="rounded-full">All Industries</Button>
            {industries.map((industry, index) => (
              <Button key={index} variant="outline" className="rounded-full gap-2">
                <industry.icon className="w-4 h-4" />
                {industry.name}
                <Badge variant="secondary" className="ml-1">{industry.count}</Badge>
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Case Studies */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto space-y-12">
            {caseStudies.map((study, index) => (
              <Card key={index} className="overflow-hidden border-border/50 hover:shadow-xl transition-shadow">
                <div className="grid lg:grid-cols-2">
                  <div className={`p-8 lg:p-12 bg-gradient-to-br ${study.color} flex flex-col justify-center`}>
                    <div className="text-6xl mb-6">{study.logo}</div>
                    <Badge className="w-fit mb-4 bg-white/20 text-white border-0">
                      {study.industry}
                    </Badge>
                    <h2 className="text-2xl lg:text-3xl font-bold text-white mb-4">
                      {study.title}
                    </h2>
                    <p className="text-white/80">{study.summary}</p>
                  </div>
                  <CardContent className="p-8 lg:p-12">
                    <div className="grid grid-cols-2 gap-6 mb-8">
                      {study.stats.map((stat, i) => (
                        <div key={i}>
                          <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                          <div className="text-sm text-muted-foreground">{stat.label}</div>
                        </div>
                      ))}
                    </div>
                    <blockquote className="border-l-4 border-primary pl-4 mb-6">
                      <p className="text-foreground italic">"{study.quote}"</p>
                    </blockquote>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white font-bold">
                        {study.author.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">{study.author}</div>
                        <div className="text-sm text-muted-foreground">{study.role}, {study.company}</div>
                      </div>
                    </div>
                    <Button variant="outline" className="gap-2">
                      Read Full Story <ArrowRight className="w-4 h-4" />
                    </Button>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-foreground mb-12">Trusted by Thousands of Businesses</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <div className="text-4xl font-bold text-primary mb-2">5,000+</div>
                <div className="text-muted-foreground">Active Businesses</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">10M+</div>
                <div className="text-muted-foreground">Messages Sent</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">150+</div>
                <div className="text-muted-foreground">Countries</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">99.9%</div>
                <div className="text-muted-foreground">Uptime</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
        
        <div className="container mx-auto px-4 relative text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Ready to Write Your Success Story?
          </h2>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Join thousands of businesses transforming customer engagement with aireatro.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="h-14 px-8 bg-white text-purple-600 hover:bg-white/90" onClick={() => navigate('/signup')}>
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-8 border-white/30 text-white hover:bg-white/10" onClick={() => navigate('/contact')}>
              Contact Sales
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
