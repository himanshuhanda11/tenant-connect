import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MessageSquare, 
  ArrowRight, 
  CheckCircle2,
  Play,
  Sparkles,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';
import dashboardDemo from '@/assets/dashboard-demo.mp4';

// Home page sections
import SocialProofBar from '@/components/home/SocialProofBar';
import CoreFeaturesGrid from '@/components/home/CoreFeaturesGrid';
import AdvancedFeaturesSection from '@/components/home/AdvancedFeaturesSection';
import ProductTourSection from '@/components/home/ProductTourSection';
import IndustrySolutions from '@/components/home/IndustrySolutions';
import IntegrationSection from '@/components/home/IntegrationSection';
import PricingPreview from '@/components/home/PricingPreview';
import SecuritySection from '@/components/home/SecuritySection';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import FinalCTASection from '@/components/home/FinalCTASection';

export default function Index() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      navigate('/select-workspace');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-background">
        {/* Subtle Background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-green-500/5 rounded-full blur-[150px]" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px]" />
        </div>
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
        
        <div className="container mx-auto px-4 py-12 sm:py-16 md:py-20 lg:py-24 relative z-10">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-600 text-xs sm:text-sm font-medium mb-6">
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                Official WhatsApp Business API Partner
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
                Sell, Support & Retain Customers on{' '}
                <span className="bg-gradient-to-r from-green-500 via-emerald-500 to-cyan-500 bg-clip-text text-transparent">
                  WhatsApp
                </span>{' '}
                — at Scale
              </h1>
              
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-6">
                Cloud API + Shared Team Inbox + Campaigns + Automations + Analytics — everything you need in one platform.
              </p>

              {/* Trust badges */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-8">
                <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
                  <Shield className="w-3 h-3 mr-1" />
                  Meta Cloud API
                </Badge>
                <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                  Official Partner-ready
                </Badge>
                <Badge variant="secondary" className="bg-purple-500/10 text-purple-600 border-purple-500/20">
                  GDPR-ready
                </Badge>
              </div>

              {/* CTA Row */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 justify-center lg:justify-start">
                <Button 
                  size="lg" 
                  className="h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-base bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-xl shadow-green-500/25 w-full sm:w-auto" 
                  onClick={() => navigate('/signup')}
                >
                  Start Free Trial
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-base w-full sm:w-auto" 
                  onClick={() => navigate('/contact')}
                >
                  <Play className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Watch 90-sec Demo
                </Button>
              </div>

              <p className="text-xs sm:text-sm text-muted-foreground">
                No credit card required • Setup in minutes
              </p>
            </div>

            {/* Right Content - Demo Video */}
            <div className="relative mt-8 lg:mt-0">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-border">
                <video 
                  src={dashboardDemo} 
                  autoPlay 
                  loop 
                  muted 
                  playsInline
                  className="w-full h-auto"
                />
              </div>
              {/* Floating elements */}
              <div className="absolute -bottom-3 -left-3 sm:-bottom-6 sm:-left-6 bg-card backdrop-blur-xl p-2 sm:p-4 rounded-xl shadow-xl border border-border hidden sm:block">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-green-500 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-medium text-foreground">Message Delivered</div>
                    <div className="text-xs text-muted-foreground">Just now</div>
                  </div>
                </div>
              </div>
              <div className="absolute -top-2 -right-2 sm:-top-4 sm:-right-4 bg-card backdrop-blur-xl p-2 sm:p-4 rounded-xl shadow-xl border border-border hidden sm:block">
                <div className="text-lg sm:text-2xl font-bold text-foreground">98.5%</div>
                <div className="text-xs text-muted-foreground">Delivery Rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Bar */}
      <SocialProofBar />

      {/* Core Features Grid - "What you can do" */}
      <CoreFeaturesGrid />

      {/* Advanced Features - Power Features */}
      <AdvancedFeaturesSection />

      {/* Product Tour - Tabbed Section */}
      <ProductTourSection />

      {/* Industry Solutions */}
      <IndustrySolutions />

      {/* Integrations */}
      <IntegrationSection />

      {/* Pricing Preview */}
      <PricingPreview />

      {/* Security */}
      <SecuritySection />

      {/* Testimonials */}
      <TestimonialsSection />

      {/* Final CTA */}
      <FinalCTASection />

      <Footer />
    </div>
  );
}
