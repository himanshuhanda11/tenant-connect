import React, { useEffect, Component, ReactNode, ErrorInfo, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';
import { JsonLd, organizationSchema, websiteSchema, softwareApplicationSchema } from '@/components/seo';
import SeoMeta from '@/components/seo/SeoMeta';
// Above-the-fold: load eagerly for fast FCP
import HeroSection from '@/components/home/HeroSection';
import SocialProofBar from '@/components/home/SocialProofBar';

// Below-the-fold: lazy-load to shrink initial JS bundle
const WhyAireatroBento = lazy(() => import('@/components/home/WhyAireatroBento'));
const BusinessGrowthSection = lazy(() => import('@/components/home/BusinessGrowthSection'));
const HowItWorksSection = lazy(() => import('@/components/home/HowItWorksSection'));
const AICapabilitiesSection = lazy(() => import('@/components/home/AICapabilitiesSection'));
const MetaAdsAttributionSection = lazy(() => import('@/components/home/MetaAdsAttributionSection'));
const AdToConversionSection = lazy(() => import('@/components/home/AdToConversionSection'));
const WhatsAppShowcaseSection = lazy(() => import('@/components/home/WhatsAppShowcaseSection'));
const PricingPreview = lazy(() => import('@/components/home/PricingPreview'));
const TestimonialsCarousel = lazy(() => import('@/components/home/TestimonialsCarousel'));
const FinalCTANew = lazy(() => import('@/components/home/FinalCTANew'));
const AwardsTrustSection = lazy(() => import('@/components/home/AwardsTrustSection'));

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

const SectionFallback = () => <div className="min-h-[200px]" aria-hidden />;

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

      {/* Hero + social proof load eagerly for fast FCP */}
      <HeroSection />
      <SocialProofBar />

      <Suspense fallback={<SectionFallback />}>
        <SectionErrorBoundary><AwardsTrustSection /></SectionErrorBoundary>
        <WhyAireatroBento />
        <SectionErrorBoundary><BusinessGrowthSection /></SectionErrorBoundary>
        <SectionErrorBoundary><HowItWorksSection /></SectionErrorBoundary>
        <SectionErrorBoundary><AICapabilitiesSection /></SectionErrorBoundary>
        <SectionErrorBoundary><MetaAdsAttributionSection /></SectionErrorBoundary>
        <SectionErrorBoundary><AdToConversionSection /></SectionErrorBoundary>
        <SectionErrorBoundary><WhatsAppShowcaseSection /></SectionErrorBoundary>
        <SectionErrorBoundary><PricingPreview /></SectionErrorBoundary>
        <SectionErrorBoundary><TestimonialsCarousel /></SectionErrorBoundary>
        <SectionErrorBoundary><FinalCTANew /></SectionErrorBoundary>
      </Suspense>

      <Footer />
    </div>
  );
}
