import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  ArrowRight, TrendingUp, Users, Clock, Building2, ShoppingBag, 
  GraduationCap, Landmark, Home, Briefcase, CheckCircle2, XCircle,
  Zap, Brain, BarChart3, Plug, Target, MessageSquare, Sparkles,
  FileText, Shield, Quote, Star, ChevronRight, Globe, Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Breadcrumb from '@/components/layout/Breadcrumb';
import SeoMeta from '@/components/seo/SeoMeta';

// Detailed case studies data
const detailedCaseStudies = [
  {
    id: 'ecommerce-d2c',
    company: 'D2C Fashion Brand',
    industry: 'eCommerce',
    region: 'India',
    useCase: 'Abandoned Cart Recovery',
    volume: '50,000+ messages/month',
    icon: ShoppingBag,
    color: 'from-blue-600 to-cyan-500',
    featured: true,
    challenge: {
      summary: 'The brand was driving heavy traffic from Meta Ads to WhatsApp but faced critical conversion issues.',
      points: [
        '60%+ drop-offs after first response',
        'No visibility into which ad or flow converted',
        'Manual follow-ups by agents',
        'Broken automation flows without detection'
      ],
      quote: 'We were sending messages, but we had no idea what was actually working.'
    },
    solution: {
      summary: 'AiReatro was implemented with a comprehensive automation strategy:',
      features: [
        'AI-generated abandoned cart WhatsApp flows',
        'WhatsApp Forms to capture intent and size preferences',
        'Meta Ads → WhatsApp → Order attribution',
        'Flow diagnostics + drop-off heatmaps',
        'AI insights highlighting delayed responses',
        'Team inbox with SLA-based routing'
      ]
    },
    results: {
      timeframe: 'Within 45 Days',
      metrics: [
        { label: 'Cart Recovery Rate', value: '+38%', icon: TrendingUp, color: 'green' },
        { label: 'Flow Drop-offs', value: '-42%', icon: Activity, color: 'blue' },
        { label: 'WhatsApp Revenue', value: '2.3x', icon: BarChart3, color: 'purple' },
        { label: 'Agent Handling Time', value: '-31%', icon: Clock, color: 'orange' }
      ]
    },
    aiInsight: 'AI detected 52% users dropped at step 3 due to delayed agent response. Auto-routing and quick replies improved flow completion by 19%.',
    testimonial: {
      quote: "AiReatro didn't just automate WhatsApp — it showed us exactly what to fix to grow revenue.",
      author: 'Priya Menon',
      role: 'Head of Growth',
      rating: 5
    }
  },
  {
    id: 'fintech-loans',
    company: 'Digital Lending Platform',
    industry: 'Fintech',
    region: 'India',
    useCase: 'Loan Pre-qualification',
    volume: '100,000+ messages/month',
    icon: Landmark,
    color: 'from-green-600 to-emerald-500',
    featured: true,
    challenge: {
      summary: 'The fintech company struggled with lead quality and application processing.',
      points: [
        'Low lead quality from ads',
        'Manual loan screening',
        'Drop-offs during document submission',
        'No real-time insight into where applications failed'
      ],
      quote: 'Customers would start applications and disappear. We had no idea where the process was breaking.'
    },
    solution: {
      summary: 'AiReatro enabled end-to-end loan application automation:',
      features: [
        'WhatsApp Forms for loan pre-qualification',
        'Conditional logic based on income & credit score',
        'Secure document collection via WhatsApp',
        'AI flow optimization suggestions',
        'CRM sync with retry & event logs',
        'End-to-end funnel attribution'
      ]
    },
    results: {
      timeframe: 'Within 30 Days',
      metrics: [
        { label: 'Qualified Applications', value: '+41%', icon: TrendingUp, color: 'green' },
        { label: 'Application Drop-offs', value: '-36%', icon: Activity, color: 'blue' },
        { label: 'Cost per Qualified Lead', value: '-29%', icon: Target, color: 'purple' },
        { label: 'Processing Speed', value: '2x', icon: Clock, color: 'orange' }
      ]
    },
    aiInsight: 'AI identified that users abandoned the flow when document upload wasn\'t explained clearly. Adding guidance reduced drop-offs by 22%.',
    testimonial: {
      quote: "AiReatro gave us clarity across our entire WhatsApp funnel — not just messages, but decisions.",
      author: 'Vikram Joshi',
      role: 'Chief Product Officer',
      rating: 5
    }
  },
  {
    id: 'edtech-enrollment',
    company: 'Online Learning Academy',
    industry: 'Education',
    region: 'India & Middle East',
    useCase: 'Lead Qualification & Enrollment',
    volume: '75,000+ messages/month',
    icon: GraduationCap,
    color: 'from-purple-600 to-pink-500',
    featured: true,
    challenge: {
      summary: 'The EdTech company faced scaling challenges with inbound leads.',
      points: [
        'Thousands of inbound WhatsApp leads',
        'Poor lead prioritization',
        'High agent workload',
        'No insight into which campaigns converted enrollments'
      ],
      quote: 'Our admissions team was drowning in low-quality leads while real prospects waited.'
    },
    solution: {
      summary: 'AiReatro delivered intelligent lead management:',
      features: [
        'AI-powered WhatsApp Forms for lead scoring',
        'Conditional counselling flows',
        'AI intent detection for hot leads',
        'Agent assignment with SLA tracking',
        'Meta Ads to enrollment attribution',
        'Performance analytics by course & agent'
      ]
    },
    results: {
      timeframe: 'Within 60 Days',
      metrics: [
        { label: 'Enrollment Conversion', value: '+34%', icon: TrendingUp, color: 'green' },
        { label: 'Response Time', value: '-48%', icon: Clock, color: 'blue' },
        { label: 'Agent Productivity', value: '2.1x', icon: Users, color: 'purple' },
        { label: 'Campaign ROI Visibility', value: '100%', icon: Target, color: 'orange' }
      ]
    },
    aiInsight: 'AI showed that leads from Campaign A had higher intent but slower response times. SLA rules increased enrollments by 17%.',
    testimonial: {
      quote: "AiReatro helped us scale counselling without scaling chaos.",
      author: 'Ahmed Hassan',
      role: 'Admissions Director',
      rating: 5
    }
  }
];

// Additional case study cards for the grid
const caseStudyCards = [
  {
    slug: 'homefind-realty',
    company: 'HomeFind Realty',
    industry: 'Real Estate',
    useCase: 'Property Inquiry Automation',
    result: '+31% conversions',
    icon: Home,
    color: 'from-orange-500 to-red-500'
  },
  {
    slug: 'quickserve-restaurants',
    company: 'QuickServe Restaurants',
    industry: 'Services',
    useCase: 'Order & Reservation Flow',
    result: '+45% bookings',
    icon: Briefcase,
    color: 'from-amber-500 to-orange-500'
  },
  {
    slug: 'healthfirst-clinic',
    company: 'HealthFirst Clinic',
    industry: 'Healthcare',
    useCase: 'Appointment Scheduling',
    result: '-52% no-shows',
    icon: Shield,
    color: 'from-teal-500 to-cyan-500'
  },
  {
    slug: 'travelease-agency',
    company: 'TravelEase Agency',
    industry: 'Travel',
    useCase: 'Trip Inquiry & Booking',
    result: '+28% bookings',
    icon: Globe,
    color: 'from-indigo-500 to-purple-500'
  },
  {
    slug: 'insuresafe',
    company: 'InsureSafe',
    industry: 'Insurance',
    useCase: 'Policy Renewal Automation',
    result: '+39% renewals',
    icon: Shield,
    color: 'from-slate-600 to-slate-800'
  },
  {
    slug: 'automart-dealers',
    company: 'AutoMart Dealers',
    industry: 'Automotive',
    useCase: 'Test Drive Scheduling',
    result: '+55% leads',
    icon: Target,
    color: 'from-red-500 to-pink-500'
  }
];

const industries = [
  { name: 'All', icon: Building2 },
  { name: 'eCommerce', icon: ShoppingBag },
  { name: 'Education', icon: GraduationCap },
  { name: 'Fintech', icon: Landmark },
  { name: 'Real Estate', icon: Home },
  { name: 'Services', icon: Briefcase }
];

const comparisonPoints = [
  { before: 'We had dashboards, but no insights', after: 'AiReatro gave AI explanations', icon: Brain },
  { before: 'Flows worked, but we couldn\'t optimize them', after: 'Flow diagnostics + health scores', icon: BarChart3 },
  { before: 'We didn\'t know which ad converted', after: 'End-to-end attribution', icon: Target },
  { before: 'Integrations failed silently', after: 'Event logs + retries + alerts', icon: Plug }
];

const capabilities = [
  { icon: MessageSquare, title: 'WhatsApp Forms', desc: 'Lead qualification without external links' },
  { icon: Brain, title: 'AI Flow Generator', desc: 'Build conversion-ready flows in minutes' },
  { icon: BarChart3, title: 'Drop-off Heatmaps', desc: 'Visual optimization at node level' },
  { icon: Target, title: 'Meta Ads Attribution', desc: 'Real ROI visibility' },
  { icon: Plug, title: 'Integration Health', desc: 'Zero data loss monitoring' },
  { icon: Users, title: 'Team Analytics', desc: 'SLA + agent scorecards' }
];

const beforeAfterComparison = [
  { before: 'Manual follow-ups', after: 'AI-driven automation' },
  { before: 'Broken flows', after: 'Optimized flows' },
  { before: 'No attribution', after: 'Clear conversion paths' },
  { before: 'Slow response', after: 'Faster replies' },
  { before: 'Guesswork decisions', after: 'Confident decisions' }
];

// JSON-LD Schema
const caseStudySchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "AiReatro Customer Case Studies",
  "description": "Real customer success stories showing how AiReatro helps businesses grow with AI-powered WhatsApp automation",
  "itemListElement": detailedCaseStudies.map((study, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "item": {
      "@type": "CaseStudy",
      "name": `${study.company} - ${study.useCase}`,
      "about": {
        "@type": "SoftwareApplication",
        "name": "AiReatro Communications"
      },
      "description": study.challenge.summary
    }
  }))
};

const reviewSchema = {
  "@context": "https://schema.org",
  "@type": "Review",
  "itemReviewed": {
    "@type": "SoftwareApplication",
    "name": "AiReatro Communications"
  },
  "reviewRating": {
    "@type": "Rating",
    "ratingValue": "5",
    "bestRating": "5"
  },
  "author": {
    "@type": "Organization",
    "name": "Customer"
  }
};

export default function CaseStudies() {
  const navigate = useNavigate();
  const [selectedIndustry, setSelectedIndustry] = useState('All');

  const filteredCaseStudies = selectedIndustry === 'All' 
    ? detailedCaseStudies 
    : detailedCaseStudies.filter(cs => cs.industry === selectedIndustry);

  const filteredCards = selectedIndustry === 'All'
    ? caseStudyCards
    : caseStudyCards.filter(cs => cs.industry === selectedIndustry);

  return (
    <div className="min-h-screen bg-background">
      <SeoMeta route="/case-studies" fallbackTitle="Customer Case Studies" fallbackDescription="Real customer success stories with AI WhatsApp automation" />
      
      {/* JSON-LD Schema */}
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(caseStudySchema)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(reviewSchema)}
        </script>
      </Helmet>

      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 md:pt-28 md:pb-20 bg-white overflow-hidden">
        <div className="absolute top-20 right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-primary/3 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-primary/5 to-emerald-500/5 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative">
          <Breadcrumb className="mb-6" />
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8">
              <TrendingUp className="w-4 h-4" />
              Customer Success Stories
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              <span className="text-slate-900">Real Businesses. Real Growth.</span>{' '}
              <br className="hidden md:block" />
              <span className="bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent">Powered by AI WhatsApp.</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto mb-10">
              See how teams use AiReatro to automate conversations, fix drop-offs, and drive measurable revenue using AI-powered WhatsApp workflows.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="h-14 px-8 text-lg" onClick={() => navigate('/signup')}>
                View Case Studies <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-slate-300" onClick={() => navigate('/contact')}>
                Contact Us
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-8">
              Trusted by fast-growing teams across eCommerce, Education, Finance, and Services
            </p>
          </div>
        </div>
      </section>

      {/* Results Snapshot */}
      <section className="py-12 md:py-16 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        
        <div className="container mx-auto px-4 relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">↑ 42%</div>
              <div className="text-sm md:text-base text-slate-400">Lead-to-conversion rate</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">↓ 68%</div>
              <div className="text-sm md:text-base text-slate-400">Response time</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">↑ 31%</div>
              <div className="text-sm md:text-base text-slate-400">Flow completion</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">2.5x</div>
              <div className="text-sm md:text-base text-slate-400">ROI from campaigns</div>
            </div>
          </div>
          <p className="text-center text-sm text-slate-500 mt-8">
            Results achieved within 30–60 days using AiReatro
          </p>
        </div>
      </section>

      {/* Industry Filter */}
      <section className="py-6 bg-white sticky top-16 z-40 border-b border-slate-100 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-3">
            {industries.map((industry) => (
              <Button
                key={industry.name}
                variant={selectedIndustry === industry.name ? 'default' : 'outline'}
                className={`rounded-full gap-2 transition-all ${selectedIndustry === industry.name ? 'shadow-lg' : 'hover:border-primary/50'}`}
                onClick={() => setSelectedIndustry(industry.name)}
              >
                <industry.icon className="w-4 h-4" />
                {industry.name}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Case Studies */}
      <section className="py-16 md:py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">Featured Stories</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Deep-Dive Case Studies</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Detailed breakdowns of how businesses transformed their WhatsApp operations with AI-powered automation
            </p>
          </div>

          <div className="max-w-6xl mx-auto space-y-16">
            {filteredCaseStudies.map((study, index) => (
              <Card key={study.id} className="overflow-hidden border-0 shadow-2xl bg-white">
                {/* Header */}
                <div className={`p-8 md:p-10 bg-gradient-to-br ${study.color} relative overflow-hidden`}>
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
                  
                  <div className="relative">
                    <div className="flex flex-wrap items-center gap-3 mb-6">
                      <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm px-4 py-1">
                        <study.icon className="w-4 h-4 mr-2" />
                        {study.industry}
                      </Badge>
                      <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm px-4 py-1">
                        <Globe className="w-4 h-4 mr-2" />
                        {study.region}
                      </Badge>
                      <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm px-4 py-1">
                        {study.useCase}
                      </Badge>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">{study.company}</h2>
                    <p className="text-white/80 text-lg">{study.volume}</p>
                  </div>
                </div>

                <CardContent className="p-8 md:p-10 space-y-10">
                  {/* Challenge */}
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                        <XCircle className="w-5 h-5 text-red-500" />
                      </div>
                      The Challenge
                    </h3>
                    <p className="text-slate-600 mb-4 text-lg">{study.challenge.summary}</p>
                    <ul className="grid md:grid-cols-2 gap-3 mb-6">
                      {study.challenge.points.map((point, i) => (
                        <li key={i} className="flex items-start gap-3 text-slate-600">
                          <div className="w-2 h-2 rounded-full bg-red-400 mt-2 shrink-0" />
                          {point}
                        </li>
                      ))}
                    </ul>
                    <blockquote className="border-l-4 border-red-300 pl-6 py-2 italic text-slate-500 text-lg bg-red-50/50 rounded-r-lg">
                      <Quote className="w-5 h-5 text-red-300 mb-2" />
                      {study.challenge.quote}
                    </blockquote>
                  </div>

                  {/* Solution */}
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Zap className="w-5 h-5 text-primary" />
                      </div>
                      The AiReatro Solution
                    </h3>
                    <p className="text-slate-600 mb-4 text-lg">{study.solution.summary}</p>
                    <div className="grid md:grid-cols-2 gap-3">
                      {study.solution.features.map((feature, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg">
                          <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                          <span className="text-slate-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Results */}
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                        <BarChart3 className="w-5 h-5 text-green-600" />
                      </div>
                      Results
                    </h3>
                    <p className="text-sm text-primary font-medium mb-4">{study.results.timeframe}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {study.results.metrics.map((metric, i) => {
                        const colorClasses = {
                          green: 'bg-green-50 border-green-100 text-green-700',
                          blue: 'bg-blue-50 border-blue-100 text-blue-700',
                          purple: 'bg-purple-50 border-purple-100 text-purple-700',
                          orange: 'bg-orange-50 border-orange-100 text-orange-700'
                        };
                        return (
                          <div key={i} className={`rounded-xl p-5 text-center border ${colorClasses[metric.color as keyof typeof colorClasses]}`}>
                            <metric.icon className="w-6 h-6 mx-auto mb-2 opacity-60" />
                            <div className="text-3xl font-bold mb-1">{metric.value}</div>
                            <div className="text-xs font-medium opacity-80">{metric.label}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* AI Insight */}
                  <div className="bg-gradient-to-r from-primary/10 via-emerald-50 to-primary/5 rounded-2xl p-6 border border-primary/20">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center shrink-0 shadow-lg">
                        <Sparkles className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 mb-2 text-lg">🧠 AI Insight Highlight</h4>
                        <p className="text-slate-700">{study.aiInsight}</p>
                        <p className="text-xs text-primary font-medium mt-2">This is your killer differentiator.</p>
                      </div>
                    </div>
                  </div>

                  {/* Testimonial */}
                  <div className="border-t border-slate-100 pt-8">
                    <div className="flex gap-1 mb-4">
                      {[...Array(study.testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                    <blockquote className="text-xl md:text-2xl text-slate-800 mb-6 leading-relaxed">
                      &ldquo;{study.testimonial.quote}&rdquo;
                    </blockquote>
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        {study.testimonial.author.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-lg">{study.testimonial.author}</div>
                        <div className="text-slate-500">{study.testimonial.role}, {study.company}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Case Study Grid */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">More Success Stories</h2>
            <p className="text-lg text-slate-600">Browse by industry</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {filteredCards.map((card, index) => (
              <Card 
                key={index} 
                className="group border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer hover:-translate-y-1"
                onClick={() => navigate(`/case-studies/${card.slug}`)}
              >
                <div className={`h-2 bg-gradient-to-r ${card.color}`} />
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="secondary" className="gap-1">
                      <card.icon className="w-3 h-3" />
                      {card.industry}
                    </Badge>
                    <span className="text-lg font-bold text-primary">{card.result}</span>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                    <Building2 className="w-6 h-6 text-slate-400 group-hover:text-primary transition-colors" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg mb-2">{card.company}</h3>
                  <p className="text-slate-600 text-sm mb-4">{card.useCase}</p>
                  <div className="flex items-center text-primary font-medium text-sm group-hover:underline">
                    View Full Story <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why They Switched */}
      <section className="py-16 md:py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Why Teams Switched to AiReatro</h2>
              <p className="text-lg text-slate-600">Clarity vs. clutter. AI insights vs. dashboards.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {comparisonPoints.map((point, index) => (
                <Card key={index} className="border-0 shadow-lg overflow-hidden group hover:shadow-xl transition-all">
                  <CardContent className="p-0">
                    <div className="p-5 bg-red-50 border-b border-red-100">
                      <div className="flex items-start gap-3">
                        <XCircle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-slate-700 font-medium">&ldquo;{point.before}&rdquo;</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-5 bg-green-50">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0 mt-0.5" />
                        <div className="flex items-center gap-3">
                          <point.icon className="w-5 h-5 text-primary" />
                          <p className="text-slate-800 font-semibold">{point.after}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Before vs After */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Before vs After AiReatro</h2>
              <p className="text-lg text-slate-600">The transformation at a glance</p>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-red-50 rounded-2xl p-8 border border-red-100">
                <h3 className="text-xl font-bold text-red-700 mb-6 flex items-center gap-2">
                  <XCircle className="w-6 h-6" /> Before AiReatro
                </h3>
                <ul className="space-y-4">
                  {beforeAfterComparison.map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-red-800">
                      <div className="w-2 h-2 rounded-full bg-red-400" />
                      {item.before}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-green-50 rounded-2xl p-8 border border-green-100">
                <h3 className="text-xl font-bold text-green-700 mb-6 flex items-center gap-2">
                  <CheckCircle2 className="w-6 h-6" /> After AiReatro
                </h3>
                <ul className="space-y-4">
                  {beforeAfterComparison.map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-green-800">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      {item.after}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise Capabilities */}
      <section className="py-16 md:py-20 bg-slate-900 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-white/10 text-white border-white/20">ISV-Level Proof</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Advanced Features Showcased in Cases</h2>
              <p className="text-lg text-slate-400">Features that powered these success stories</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {capabilities.map((cap, index) => (
                <Card key={index} className="border-0 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all group">
                  <CardContent className="p-6">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <cap.icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="font-bold text-white text-lg mb-2">{cap.title}</h3>
                    <p className="text-sm text-slate-400">{cap.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <p className="text-center text-sm text-slate-500 mt-8">
              This positions AiReatro as an intelligence platform, not just a messaging tool.
            </p>
          </div>
        </div>
      </section>

      {/* Case Study CTA */}
      <section className="py-12 bg-white border-b border-slate-100">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <FileText className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">Don&apos;t see your industry yet?</h3>
            <p className="text-slate-600 mb-6">
              Explore a case study built with real-world data and workflows.
            </p>
            <Button variant="outline" size="lg" onClick={() => navigate('/contact')}>
              View Case Study <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-primary via-green-600 to-emerald-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-black/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Want Similar Results for Your Business?
          </h2>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Start free or explore a live workspace to see AiReatro in action.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="h-14 px-10 text-lg bg-white text-primary hover:bg-white/90 shadow-xl" onClick={() => navigate('/contact')}>
              Start Free
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-10 text-lg border-white/30 text-white hover:bg-white/10" onClick={() => navigate('/signup')}>
              Start Free Trial
            </Button>
          </div>
          <p className="text-sm text-white/60 mt-10 max-w-xl mx-auto">
            AiReatro helps businesses turn WhatsApp conversations into measurable growth — with AI clarity at every step.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
