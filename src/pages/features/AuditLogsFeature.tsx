import React from 'react';
import { SEO } from '@/components/seo';
import { FileText, Shield, Eye, Clock, Download, Lock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Breadcrumb from '@/components/layout/Breadcrumb';
import featureAuditLogs from '@/assets/feature-audit-logs.png';

export default function AuditLogsFeature() {
  const navigate = useNavigate();
  const features = [
    { icon: FileText, title: 'Complete Audit Trail', description: 'Track every action taken in your account with detailed logs.' },
    { icon: Eye, title: 'Activity Monitoring', description: 'See who did what, when, and from where in real-time.' },
    { icon: Clock, title: 'Time-based Filtering', description: 'Filter logs by date range, user, or action type.' },
    { icon: Download, title: 'Log Export', description: 'Export audit logs for compliance reporting and analysis.' },
    { icon: Shield, title: 'Security Alerts', description: 'Get notified of suspicious activities and login attempts.' },
    { icon: Lock, title: 'Data Protection', description: 'GDPR, SOC 2, and enterprise-grade security compliance.' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Audit Logs & Activity Tracking - AiReatro" description="Complete audit trail for your WhatsApp workspace. Track all user actions, data changes, and security events for compliance and accountability." keywords={["audit logs", "activity tracking", "compliance logs", "security audit"]} canonical="/features/audit-logs" />
      <Navbar />
      <section className="relative pt-16 pb-10 md:pt-20 md:pb-14 overflow-hidden bg-gradient-to-b from-background to-muted/30">
        <div className="absolute inset-0"><div className="absolute top-20 left-1/4 w-[400px] h-[400px] bg-slate-500/5 rounded-full blur-[100px]" /></div>
        <div className="container mx-auto px-4 relative">
          <Breadcrumb className="mb-8" />
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-500/10 border border-slate-500/20 text-slate-600 text-sm font-medium mb-6"><Shield className="w-4 h-4" />Audit Logs & Security</div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">Enterprise-Grade <span className="bg-gradient-to-r from-slate-600 via-gray-600 to-zinc-600 bg-clip-text text-transparent">Security</span></h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-8">Complete visibility into every action in your account. Meet compliance requirements with comprehensive audit logs.</p>
              <Button size="lg" className="h-14 px-8 bg-gradient-to-r from-green-500 to-emerald-600 shadow-lg shadow-green-500/20" onClick={() => navigate('/signup')}>Start Free Trial<ArrowRight className="w-5 h-5 ml-2" /></Button>
            </div>
            <div className="w-full max-w-sm lg:max-w-md shrink-0">
              <img src={featureAuditLogs} alt="Audit Logs & Security Compliance" className="w-full h-auto rounded-2xl" loading="lazy" />
            </div>
          </div>
        </div>
      </section>
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((f, i) => (<Card key={i} className="border-border/50 hover:shadow-xl transition-all"><CardContent className="p-6"><div className="w-12 h-12 rounded-xl bg-slate-500/10 flex items-center justify-center mb-4"><f.icon className="w-6 h-6 text-slate-500" /></div><h3 className="font-semibold text-xl text-foreground mb-2">{f.title}</h3><p className="text-muted-foreground">{f.description}</p></CardContent></Card>))}
          </div>
        </div>
      </section>
      <section className="py-24 bg-gradient-to-br from-slate-700 via-gray-700 to-zinc-700 relative"><div className="container mx-auto px-4 text-center"><h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Ready for Enterprise Security?</h2><Button size="lg" className="h-14 px-8 bg-white text-slate-700" onClick={() => navigate('/signup')}>Start Free Trial<ArrowRight className="w-5 h-5 ml-2" /></Button></div></section>
      <Footer />
    </div>
  );
}
