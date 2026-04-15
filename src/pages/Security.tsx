import React from 'react';
import { 
  Shield, 
  Lock, 
  Eye, 
  Server, 
  FileCheck,
  Users,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import SeoMeta from '@/components/seo/SeoMeta';
import Breadcrumb from '@/components/layout/Breadcrumb';

export default function Security() {
  const navigate = useNavigate();

  const securityFeatures = [
    {
      icon: Lock,
      title: 'End-to-End Encryption',
      description: 'All messages are encrypted in transit and at rest using industry-standard AES-256 encryption.'
    },
    {
      icon: Server,
      title: 'SOC 2 Type II Compliant',
      description: 'Our infrastructure and processes are audited annually by independent third parties.'
    },
    {
      icon: Eye,
      title: 'GDPR Compliant',
      description: 'We follow strict data protection guidelines and give you full control over your data.'
    },
    {
      icon: FileCheck,
      title: 'Regular Audits',
      description: 'We conduct regular security audits and penetration testing to identify vulnerabilities.'
    },
    {
      icon: Users,
      title: 'Role-Based Access',
      description: 'Granular permissions ensure team members only access what they need.'
    },
    {
      icon: Shield,
      title: '99.9% Uptime SLA',
      description: 'Enterprise-grade infrastructure with multiple redundancy layers.'
    }
  ];

  const compliance = [
    'GDPR (General Data Protection Regulation)',
    'SOC 2 Type II',
    'ISO 27001',
    'CCPA (California Consumer Privacy Act)',
    'HIPAA (for healthcare customers)',
    'Meta WhatsApp Business Policies'
  ];

  return (
    <div className="min-h-screen bg-background">
      <SeoMeta route="/security" fallbackTitle="Security — Enterprise-Grade Data Protection" fallbackDescription="AiReatro's security practices: end-to-end encryption, GDPR compliance, SOC 2 readiness, role-based access, and audit logging for WhatsApp API data." />
      <Navbar />

      {/* Hero - Classic Design */}
      <section className="relative pt-16 pb-12 md:pt-20 md:pb-16 bg-white overflow-hidden">
        <div className="absolute top-10 right-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-primary/3 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative">
          <Breadcrumb className="mb-6" />
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <Shield className="w-4 h-4" />
              Enterprise-Grade Security
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              <span className="text-slate-900">Your Data is</span>{' '}
              <span className="text-primary">Safe With Us</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">
              We take security seriously. Our platform is built with security-first principles and regularly audited.
            </p>
          </div>
        </div>
      </section>

      {/* Security Features */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Security Features
            </h2>
            <p className="text-lg text-muted-foreground">
              Comprehensive security measures to protect your data
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {securityFeatures.map((feature, index) => (
              <Card key={index} className="border-border/50 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center mb-4">
                    <feature.icon className="w-7 h-7 text-green-500" />
                  </div>
                  <h3 className="font-semibold text-xl text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance */}
      <section className="py-24 bg-gradient-to-b from-muted/50 to-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Compliance & Certifications
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                We maintain strict compliance with global security standards and regulations to ensure your data is protected.
              </p>
              <div className="space-y-4">
                {compliance.map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
                    <span className="text-foreground text-lg">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                {['SOC 2', 'GDPR', 'ISO 27001', 'HIPAA'].map((cert, index) => (
                  <div key={index} className="aspect-square rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/10 border border-green-500/20 flex items-center justify-center">
                    <div className="text-center">
                      <Shield className="w-10 h-10 text-green-500 mx-auto mb-2" />
                      <span className="text-foreground font-semibold">{cert}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Data Protection */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                How We Protect Your Data
              </h2>
              <p className="text-lg text-muted-foreground">
                A multi-layered approach to data security
              </p>
            </div>

            <div className="space-y-8">
              {[
                {
                  title: 'Infrastructure Security',
                  description: 'Our infrastructure runs on AWS with multi-region redundancy, automated backups, and 24/7 monitoring. All data centers are SOC 2 certified.'
                },
                {
                  title: 'Data Encryption',
                  description: 'All data is encrypted at rest using AES-256 and in transit using TLS 1.3. Encryption keys are managed using AWS KMS with automatic rotation.'
                },
                {
                  title: 'Access Controls',
                  description: 'We implement strict access controls with multi-factor authentication, role-based permissions, and comprehensive audit logging.'
                },
                {
                  title: 'Incident Response',
                  description: 'Our dedicated security team monitors for threats 24/7 and has established incident response procedures to quickly address any security concerns.'
                }
              ].map((item, index) => (
                <Card key={index} className="border-border/50">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-xl text-foreground mb-2">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-green-600 via-emerald-600 to-cyan-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
        
        <div className="container mx-auto px-4 relative text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Questions About Security?
          </h2>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Our security team is happy to answer any questions about our security practices.
          </p>
          <Button size="lg" className="h-14 px-8 bg-white text-green-600 hover:bg-white/90" onClick={() => navigate('/contact')}>
            Contact Security Team
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
