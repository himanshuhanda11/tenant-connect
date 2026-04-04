import React, { useEffect, Component, ReactNode, ErrorInfo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';
import { JsonLd, organizationSchema, websiteSchema, softwareApplicationSchema } from '@/components/seo';
import SeoMeta from '@/components/seo/SeoMeta';
// Import homepage sections eagerly for preview stability
import HeroSection from '@/components/home/HeroSection';
import SocialProofBar from '@/components/home/SocialProofBar';
import WhyAireatroBento from '@/components/home/WhyAireatroBento';
import BusinessGrowthSection from '@/components/home/BusinessGrowthSection';
import HowItWorksSection from '@/components/home/HowItWorksSection';
import DifferentiatorCards from '@/components/home/DifferentiatorCards';
import AIFlowBuilderSection from '@/components/home/AIFlowBuilderSection';
import ProductTourSection from '@/components/home/ProductTourSection';
import AICapabilitiesSection from '@/components/home/AICapabilitiesSection';
import MetaAdsAttributionSection from '@/components/home/MetaAdsAttributionSection';
import PricingPreview from '@/components/home/PricingPreview';
import TestimonialsCarousel from '@/components/home/TestimonialsCarousel';
import FinalCTANew from '@/components/home/FinalCTANew';

// Error boundary with retry for lazy loaded components
interface ErrorBoundaryState {
  hasError: boolean;
}

class SectionErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Section loading error:', error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="py-8 text-center text-muted-foreground">
          <p>Section failed to load</p>
          <button onClick={this.handleRetry} className="mt-2 text-primary underline text-sm">
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function Index() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      navigate('/select-workspace');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SeoMeta route="/" fallbackTitle="Free WhatsApp API Lifetime" fallbackDescription="Get Free WhatsApp API Lifetime access with AiReatro." />
      <JsonLd data={[organizationSchema, websiteSchema, softwareApplicationSchema]} />
      <Navbar />

      {/* Hero Section - loaded eagerly for fast FCP */}
      <HeroSection />

      {/* Social Proof - loaded eagerly */}
      <SocialProofBar />

      {/* Why AiReatro USPs - moved right after social proof */}
      <WhyAireatroBento />

      {/* Business Growth Visual */}
      <SectionErrorBoundary>
        <BusinessGrowthSection />
      </SectionErrorBoundary>

      {/* How It Works Flow */}
      <SectionErrorBoundary>
        <HowItWorksSection />
      </SectionErrorBoundary>

      {/* Differentiator Cards removed */}

      {/* AI Flow Builder - Center Feature */}
      <SectionErrorBoundary>
        <AIFlowBuilderSection />
      </SectionErrorBoundary>

      {/* Product Tour */}
      <SectionErrorBoundary>
        <ProductTourSection />
      </SectionErrorBoundary>

      {/* AI Capabilities */}
      <SectionErrorBoundary>
        <AICapabilitiesSection />
      </SectionErrorBoundary>

      {/* Meta Ads Attribution */}
      <SectionErrorBoundary>
        <MetaAdsAttributionSection />
      </SectionErrorBoundary>

      {/* Pricing Preview */}
      <SectionErrorBoundary>
        <PricingPreview />
      </SectionErrorBoundary>

      {/* Testimonials */}
      <SectionErrorBoundary>
        <TestimonialsCarousel />
      </SectionErrorBoundary>

      {/* Final CTA */}
      <SectionErrorBoundary>
        <FinalCTANew />
      </SectionErrorBoundary>

      <Footer />
    </div>
  );
}
