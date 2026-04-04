import React, { useEffect, Suspense, Component, ReactNode, ErrorInfo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';
import { JsonLd, organizationSchema, websiteSchema, softwareApplicationSchema } from '@/components/seo';
import SeoMeta from '@/components/seo/SeoMeta';
import { lazyWithRetry } from '@/lib/lazyWithRetry';

// Import critical above-the-fold sections eagerly
import HeroSection from '@/components/home/HeroSection';
import SocialProofBar from '@/components/home/SocialProofBar';

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

// Lazy load below-the-fold sections with retry
const BusinessGrowthSection = lazyWithRetry(() => import('@/components/home/BusinessGrowthSection'));
const HowItWorksSection = lazyWithRetry(() => import('@/components/home/HowItWorksSection'));
const DifferentiatorCards = lazyWithRetry(() => import('@/components/home/DifferentiatorCards'));
const AIFlowBuilderSection = lazyWithRetry(() => import('@/components/home/AIFlowBuilderSection'));
const ProductTourSection = lazyWithRetry(() => import('@/components/home/ProductTourSection'));
const AICapabilitiesSection = lazyWithRetry(() => import('@/components/home/AICapabilitiesSection'));
const WhyAireatroBento = lazyWithRetry(() => import('@/components/home/WhyAireatroBento'));
const MetaAdsAttributionSection = lazyWithRetry(() => import('@/components/home/MetaAdsAttributionSection'));
const PricingPreview = lazyWithRetry(() => import('@/components/home/PricingPreview'));
const TestimonialsCarousel = lazyWithRetry(() => import('@/components/home/TestimonialsCarousel'));
const FinalCTANew = lazyWithRetry(() => import('@/components/home/FinalCTANew'));

// Section loading skeleton
function SectionSkeleton() {
  return (
    <div className="py-6 md:py-8">
      <div className="container mx-auto px-4">
        <Skeleton className="h-8 w-48 mx-auto mb-4" />
        <Skeleton className="h-4 w-72 mx-auto mb-6" />
        <div className="grid md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
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

      {/* Social Proof */}
      <SectionErrorBoundary>
        <Suspense fallback={<SectionSkeleton />}>
          <SocialProofBar />
        </Suspense>
      </SectionErrorBoundary>

      {/* Business Growth Visual */}
      <SectionErrorBoundary>
        <Suspense fallback={<SectionSkeleton />}>
          <BusinessGrowthSection />
        </Suspense>
      </SectionErrorBoundary>

      {/* How It Works Flow */}
      <SectionErrorBoundary>
        <Suspense fallback={<SectionSkeleton />}>
          <HowItWorksSection />
        </Suspense>
      </SectionErrorBoundary>

      {/* Differentiator Cards */}
      <SectionErrorBoundary>
        <Suspense fallback={<SectionSkeleton />}>
          <DifferentiatorCards />
        </Suspense>
      </SectionErrorBoundary>

      {/* AI Flow Builder - Center Feature */}
      <SectionErrorBoundary>
        <Suspense fallback={<SectionSkeleton />}>
          <AIFlowBuilderSection />
        </Suspense>
      </SectionErrorBoundary>

      {/* Product Tour */}
      <SectionErrorBoundary>
        <Suspense fallback={<SectionSkeleton />}>
          <ProductTourSection />
        </Suspense>
      </SectionErrorBoundary>

      {/* AI Capabilities */}
      <SectionErrorBoundary>
        <Suspense fallback={<SectionSkeleton />}>
          <AICapabilitiesSection />
        </Suspense>
      </SectionErrorBoundary>

      {/* Why AiReatro USPs */}
      <SectionErrorBoundary>
        <Suspense fallback={<SectionSkeleton />}>
          <WhyAireatroBento />
        </Suspense>
      </SectionErrorBoundary>

      {/* Meta Ads Attribution */}
      <SectionErrorBoundary>
        <Suspense fallback={<SectionSkeleton />}>
          <MetaAdsAttributionSection />
        </Suspense>
      </SectionErrorBoundary>

      {/* Pricing Preview */}
      <SectionErrorBoundary>
        <Suspense fallback={<SectionSkeleton />}>
          <PricingPreview />
        </Suspense>
      </SectionErrorBoundary>

      {/* Testimonials */}
      <SectionErrorBoundary>
        <Suspense fallback={<SectionSkeleton />}>
          <TestimonialsCarousel />
        </Suspense>
      </SectionErrorBoundary>

      {/* Final CTA */}
      <SectionErrorBoundary>
        <Suspense fallback={<SectionSkeleton />}>
          <FinalCTANew />
        </Suspense>
      </SectionErrorBoundary>

      <Footer />
    </div>
  );
}
