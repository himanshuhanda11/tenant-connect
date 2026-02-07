import React from 'react';
import { Phone, Shield, CheckCircle, Globe, Zap, Settings, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Breadcrumb from '@/components/layout/Breadcrumb';
import featurePhoneNumbers from '@/assets/feature-phone-numbers.png';

export default function PhoneNumbersFeature() {
  const navigate = useNavigate();
  const features = [
    { icon: Phone, title: 'Multiple Numbers', description: 'Connect unlimited WhatsApp Business phone numbers to a single account.' },
    { icon: Shield, title: 'WABA Management', description: 'Full control over your WhatsApp Business Account settings and configuration.' },
    { icon: CheckCircle, title: 'Verification Status', description: 'Track verification status and quality ratings for each number.' },
    { icon: Globe, title: 'Global Coverage', description: 'Use phone numbers from any country to reach customers worldwide.' },
    { icon: Zap, title: 'Quick Setup', description: 'Connect new numbers in minutes with our streamlined onboarding.' },
    { icon: Settings, title: 'Number Settings', description: 'Configure business profiles, about sections, and display names.' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="relative pt-16 pb-10 md:pt-20 md:pb-14 overflow-hidden bg-gradient-to-b from-background to-muted/30">
        <div className="absolute inset-0"><div className="absolute top-20 left-1/4 w-[400px] h-[400px] bg-green-500/5 rounded-full blur-[100px]" /></div>
        <div className="container mx-auto px-4 relative">
          <Breadcrumb className="mb-8" />
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-600 text-sm font-medium mb-6"><Phone className="w-4 h-4" />Phone Numbers & WABA</div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">Manage Your <span className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 bg-clip-text text-transparent">WhatsApp Numbers</span></h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-8">Connect and manage multiple WhatsApp Business phone numbers from a single dashboard.</p>
              <Button size="lg" className="h-14 px-8 bg-gradient-to-r from-green-500 to-emerald-600 shadow-lg shadow-green-500/20" onClick={() => navigate('/signup')}>Start Free Trial<ArrowRight className="w-5 h-5 ml-2" /></Button>
            </div>
            <div className="w-full max-w-sm lg:max-w-md shrink-0">
              <img src={featurePhoneNumbers} alt="Phone Number Management" className="w-full h-auto rounded-2xl" loading="lazy" />
            </div>
          </div>
        </div>
      </section>
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((f, i) => (<Card key={i} className="border-border/50 hover:shadow-xl transition-all"><CardContent className="p-6"><div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mb-4"><f.icon className="w-6 h-6 text-green-500" /></div><h3 className="font-semibold text-xl text-foreground mb-2">{f.title}</h3><p className="text-muted-foreground">{f.description}</p></CardContent></Card>))}
          </div>
        </div>
      </section>
      <section className="py-24 bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 relative"><div className="container mx-auto px-4 text-center"><h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Ready to Connect Your Numbers?</h2><Button size="lg" className="h-14 px-8 bg-white text-green-600" onClick={() => navigate('/signup')}>Start Free Trial<ArrowRight className="w-5 h-5 ml-2" /></Button></div></section>
      <Footer />
    </div>
  );
}
