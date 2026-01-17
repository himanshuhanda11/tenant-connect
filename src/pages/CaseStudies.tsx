import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, TrendingUp, Users, Clock, Building2, ShoppingBag, 
  GraduationCap, Landmark, Home, Briefcase, CheckCircle2, XCircle,
  Zap, Brain, BarChart3, Plug, Target, MessageSquare, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { SEO } from '@/components/seo';

export default function CaseStudies() {
  const navigate = useNavigate();
  const [selectedIndustry, setSelectedIndustry] = useState('All');

  const industries = [
    { name: 'All', icon: Building2 },
    { name: 'eCommerce', icon: ShoppingBag },
    { name: 'Education', icon: GraduationCap },
    { name: 'Fintech', icon: Landmark },
    { name: 'Real Estate', icon: Home },
    { name: 'Services', icon: Briefcase }
  ];

  const caseStudies = [
    {
      company: 'ShopEase India',
      industry: 'eCommerce',
      region: 'India',
      useCase: 'Abandoned Cart Recovery',
      volume: '50,000+ messages/month',
      problem: 'Low reply rates on cart abandonment emails (3%), broken checkout flows, no visibility into why customers dropped off.',
      problemQuote: 'We were sending WhatsApp messages but had no idea what was actually converting.',
      solution: ['AI-generated WhatsApp flows for cart recovery', 'WhatsApp Forms for quick checkout', 'Flow diagnostics + drop-off heatmaps', 'Meta Ads → WhatsApp attribution'],
      results: { conversion: '+38%', costPerLead: '-27%', dropOff: '-41%', productivity: '2x' },
      aiInsight: 'AI detected that 54% of users dropped after message #3 due to delayed agent response. Fixing SLA rules increased completion by 19%.',
      quote: "AiReatro didn't just automate WhatsApp for us — it showed us what was broken and how to fix it.",
      author: 'Priya Menon',
      role: 'Head of Growth',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      company: 'LearnFirst Academy',
      industry: 'Education',
      region: 'UAE',
      useCase: 'Lead Qualification',
      volume: '25,000+ messages/month',
      problem: 'Sales team overwhelmed with unqualified inquiries, no way to prioritize hot leads, manual follow-ups taking days.',
      problemQuote: 'Our admissions team was drowning in low-quality leads while real prospects waited.',
      solution: ['AI Form Builder for instant qualification', 'Smart routing to specialized counselors', 'Automated nurture sequences', 'Integration with CRM for lead scoring'],
      results: { conversion: '+45%', costPerLead: '-35%', dropOff: '-52%', productivity: '3x' },
      aiInsight: 'AI identified that leads mentioning "scholarship" in initial message had 3x higher conversion. Auto-routing these to senior counselors improved close rates.',
      quote: 'We went from chasing every inquiry to focusing only on students ready to enroll. Game changer.',
      author: 'Ahmed Hassan',
      role: 'Admissions Director',
      color: 'from-purple-500 to-pink-500'
    },
    {
      company: 'QuickLoan Finance',
      industry: 'Fintech',
      region: 'India',
      useCase: 'Loan Application',
      volume: '100,000+ messages/month',
      problem: 'Complex loan applications taking days, high drop-off at document collection, no visibility into application status.',
      problemQuote: 'Customers would start applications and disappear. We had no idea where the process was breaking.',
      solution: ['WhatsApp Forms with OTP verification', 'Document upload directly in chat', 'Real-time application status updates', 'AI-powered eligibility pre-check'],
      results: { conversion: '+62%', costPerLead: '-40%', dropOff: '-58%', productivity: '4x' },
      aiInsight: 'Flow diagnostics revealed 67% of users abandoned at income document upload. Adding a "upload later" option with reminder flow recovered 40% of these leads.',
      quote: 'Our loan disbursement time dropped from 5 days to under 24 hours. Customers love the transparency.',
      author: 'Vikram Joshi',
      role: 'Chief Product Officer',
      color: 'from-green-500 to-emerald-500'
    },
    {
      company: 'HomeFind Realty',
      industry: 'Real Estate',
      region: 'India',
      useCase: 'Property Inquiry',
      volume: '15,000+ messages/month',
      problem: 'Agents responding too slowly to hot leads, no tracking of which properties interested buyers, lost leads to competitors.',
      problemQuote: 'By the time our agents responded, buyers had already talked to three other brokers.',
      solution: ['Instant property info via WhatsApp catalog', 'AI qualification with budget/location matching', 'Automated site visit scheduling', 'Agent performance tracking'],
      results: { conversion: '+31%', costPerLead: '-22%', dropOff: '-35%', productivity: '2.5x' },
      aiInsight: 'AI detected peak inquiry times (7-9 PM) when agents were offline. Implementing smart routing to available agents increased response rate by 78%.',
      quote: 'We now respond to every serious inquiry within 2 minutes. Our competition can not match that.',
      author: 'Neha Kapoor',
      role: 'Sales Director',
      color: 'from-orange-500 to-red-500'
    }
  ];

  const filteredCaseStudies = selectedIndustry === 'All' 
    ? caseStudies 
    : caseStudies.filter(cs => cs.industry === selectedIndustry);

  const comparisonPoints = [
    { before: 'We had dashboards, but no insights', after: 'AiReatro gave AI explanations' },
    { before: 'Flows worked, but we couldn\'t optimize them', after: 'Flow diagnostics + health scores' },
    { before: 'We didn\'t know which ad converted', after: 'End-to-end attribution' },
    { before: 'Integrations failed silently', after: 'Event logs + retries + alerts' }
  ];

  const capabilities = [
    { icon: MessageSquare, title: 'WhatsApp Forms', desc: 'Lead qualification without external links' },
    { icon: Brain, title: 'AI Flow Generator', desc: 'Build conversion-ready flows in minutes' },
    { icon: BarChart3, title: 'Drop-off Heatmaps', desc: 'Visual optimization at node level' },
    { icon: Target, title: 'Meta Ads Attribution', desc: 'Real ROI visibility' },
    { icon: Plug, title: 'Integration Health', desc: 'Zero data loss monitoring' },
    { icon: Users, title: 'Team Analytics', desc: 'SLA + agent scorecards' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Customer Case Studies | Real Results with AI WhatsApp | AiReatro"
        description="See how businesses achieve 40%+ conversion increases, faster response times, and measurable ROI with AiReatro's AI-powered WhatsApp platform."
        canonical="https://aireatro.com/case-studies"
        keywords={['WhatsApp case studies', 'WhatsApp business results', 'WhatsApp ROI', 'customer success stories']}
      />
      <Navbar />

      {/* Hero */}
      <section className="relative pt-16 pb-12 md:pt-20 md:pb-16 bg-white overflow-hidden">
        <div className="absolute top-10 right-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-primary/3 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <TrendingUp className="w-4 h-4" />
              Customer Success Stories
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              <span className="text-slate-900">Real Businesses. Real Growth.</span>{' '}
              <span className="text-primary">Powered by AI WhatsApp.</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto mb-8">
              See how teams use AiReatro to automate conversations, fix drop-offs, and drive measurable revenue using AI-powered WhatsApp workflows.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="h-12 px-6" onClick={() => navigate('/signup')}>
                Start Free Trial <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-6" onClick={() => navigate('/contact')}>
                Talk to Sales
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-6">
              Trusted by fast-growing teams across eCommerce, Education, Finance, and Services
            </p>
          </div>
        </div>
      </section>

      {/* Results Snapshot */}
      <section className="py-12 bg-slate-50 border-y border-slate-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-1">↑ 42%</div>
              <div className="text-sm text-slate-600">Lead-to-conversion rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-1">↓ 68%</div>
              <div className="text-sm text-slate-600">Response time</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-1">↑ 31%</div>
              <div className="text-sm text-slate-600">Flow completion</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-1">2.5x</div>
              <div className="text-sm text-slate-600">ROI from campaigns</div>
            </div>
          </div>
          <p className="text-center text-sm text-muted-foreground mt-6">
            Results achieved within 30–60 days using AiReatro
          </p>
        </div>
      </section>

      {/* Industry Filter */}
      <section className="py-8 bg-white sticky top-16 z-40 border-b border-slate-100">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-3">
            {industries.map((industry) => (
              <Button
                key={industry.name}
                variant={selectedIndustry === industry.name ? 'default' : 'outline'}
                className="rounded-full gap-2"
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
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto space-y-16">
            {filteredCaseStudies.map((study, index) => (
              <Card key={index} className="overflow-hidden border-0 shadow-xl">
                {/* Header */}
                <div className={`p-6 md:p-8 bg-gradient-to-br ${study.color}`}>
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <Badge className="bg-white/20 text-white border-0">{study.industry}</Badge>
                    <Badge className="bg-white/20 text-white border-0">{study.region}</Badge>
                    <Badge className="bg-white/20 text-white border-0">{study.useCase}</Badge>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">{study.company}</h2>
                  <p className="text-white/80 text-sm">{study.volume}</p>
                </div>

                <CardContent className="p-6 md:p-8 space-y-8">
                  {/* Problem */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                      <XCircle className="w-5 h-5 text-red-500" /> The Problem
                    </h3>
                    <p className="text-slate-600 mb-3">{study.problem}</p>
                    <blockquote className="border-l-4 border-red-200 pl-4 italic text-slate-500">
                      "{study.problemQuote}"
                    </blockquote>
                  </div>

                  {/* Solution */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-primary" /> AiReatro Solution
                    </h3>
                    <ul className="grid md:grid-cols-2 gap-2">
                      {study.solution.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-slate-600">
                          <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Results */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-primary" /> Results
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-green-50 rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-green-600">{study.results.conversion}</div>
                        <div className="text-xs text-green-700">Conversion Rate</div>
                      </div>
                      <div className="bg-blue-50 rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600">{study.results.costPerLead}</div>
                        <div className="text-xs text-blue-700">Cost per Lead</div>
                      </div>
                      <div className="bg-purple-50 rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-purple-600">{study.results.dropOff}</div>
                        <div className="text-xs text-purple-700">Flow Drop-off</div>
                      </div>
                      <div className="bg-orange-50 rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-orange-600">{study.results.productivity}</div>
                        <div className="text-xs text-orange-700">Agent Productivity</div>
                      </div>
                    </div>
                  </div>

                  {/* AI Insight */}
                  <div className="bg-gradient-to-r from-primary/5 to-emerald-50 rounded-xl p-5 border border-primary/10">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Sparkles className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-1">AI Insight</h4>
                        <p className="text-slate-600 text-sm">{study.aiInsight}</p>
                      </div>
                    </div>
                  </div>

                  {/* Quote */}
                  <div className="border-t border-slate-100 pt-6">
                    <blockquote className="text-lg italic text-slate-700 mb-4">
                      "{study.quote}"
                    </blockquote>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center text-white font-bold text-sm">
                        {study.author.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{study.author}</div>
                        <div className="text-sm text-slate-500">{study.role}, {study.company}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why They Switched */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">Why Teams Switched to AiReatro</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {comparisonPoints.map((point, index) => (
                <Card key={index} className="border-0 shadow-md overflow-hidden">
                  <CardContent className="p-0">
                    <div className="p-4 bg-red-50 border-b border-red-100">
                      <div className="flex items-start gap-2">
                        <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                        <p className="text-slate-700">"{point.before}"</p>
                      </div>
                    </div>
                    <div className="p-4 bg-green-50">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                        <p className="text-slate-700 font-medium">{point.after}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Advanced Capabilities */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-900 text-center mb-4">Enterprise-Grade Capabilities</h2>
            <p className="text-center text-muted-foreground mb-12">Features that powered these success stories</p>
            <div className="grid md:grid-cols-3 gap-6">
              {capabilities.map((cap, index) => (
                <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <cap.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-2">{cap.title}</h3>
                    <p className="text-sm text-slate-600">{cap.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-primary via-green-600 to-emerald-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
        
        <div className="container mx-auto px-4 relative text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Want Similar Results for Your Business?
          </h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Start with a demo or explore a live workspace to see AiReatro in action.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="h-12 px-8 bg-white text-primary hover:bg-white/90" onClick={() => navigate('/contact')}>
              Book a Demo
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8 border-white/30 text-white hover:bg-white/10" onClick={() => navigate('/signup')}>
              Start Free Trial
            </Button>
          </div>
          <p className="text-sm text-white/60 mt-8">
            AiReatro helps businesses turn WhatsApp conversations into measurable growth — with AI clarity at every step.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}