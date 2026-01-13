import React from 'react';
import { BarChart3, PieChart, TrendingUp, Download, Calendar, Eye, ArrowRight, CheckCircle2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Breadcrumb from '@/components/layout/Breadcrumb';

export default function AnalyticsFeature() {
  const navigate = useNavigate();
  const features = [
    { icon: BarChart3, title: 'Real-time Dashboards', description: 'Monitor message delivery, read rates, and engagement as it happens.' },
    { icon: PieChart, title: 'Campaign Analytics', description: 'Track campaign performance with detailed metrics and ROI analysis.' },
    { icon: TrendingUp, title: 'Agent Performance', description: 'Measure response times, resolution rates, and team productivity.' },
    { icon: Download, title: 'Export Reports', description: 'Download reports in PDF or CSV format for stakeholder presentations.' },
    { icon: Calendar, title: 'Date Range Filters', description: 'Analyze data over custom date ranges to identify trends.' },
    { icon: Eye, title: 'Custom Metrics', description: 'Create custom dashboards with the metrics that matter to you.' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="relative pt-16 pb-10 md:pt-20 md:pb-14 overflow-hidden bg-gradient-to-b from-background to-muted/30">
        <div className="absolute inset-0"><div className="absolute top-20 left-1/4 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[100px]" /></div>
        <div className="container mx-auto px-4 relative">
          <Breadcrumb className="mb-8" />
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 text-sm font-medium mb-6"><BarChart3 className="w-4 h-4" />Analytics & Reports</div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">Data-Driven <span className="bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 bg-clip-text text-transparent">Decisions</span></h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-8">Get deep insights into your messaging performance with comprehensive analytics dashboards.</p>
            <Button size="lg" className="h-14 px-8 bg-gradient-to-r from-green-500 to-emerald-600 shadow-lg shadow-green-500/20" onClick={() => navigate('/signup')}>Start Free Trial<ArrowRight className="w-5 h-5 ml-2" /></Button>
          </div>
        </div>
      </section>
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((f, i) => (<Card key={i} className="border-border/50 hover:shadow-xl transition-all group"><CardContent className="p-6"><div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-4"><f.icon className="w-6 h-6 text-cyan-500" /></div><h3 className="font-semibold text-xl text-foreground mb-2">{f.title}</h3><p className="text-muted-foreground">{f.description}</p></CardContent></Card>))}
          </div>
        </div>
      </section>
      <section className="py-24 bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-600 relative overflow-hidden">
        <div className="container mx-auto px-4 relative text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Ready to Unlock Insights?</h2>
          <Button size="lg" className="h-14 px-8 bg-white text-cyan-600 hover:bg-white/90" onClick={() => navigate('/signup')}>Start Free Trial<ArrowRight className="w-5 h-5 ml-2" /></Button>
        </div>
      </section>
      <Footer />
    </div>
  );
}
