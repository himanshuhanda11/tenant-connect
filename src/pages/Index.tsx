import React, { useEffect, Suspense, lazy, Component, ReactNode, ErrorInfo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';
import { SEO, JsonLd, organizationSchema, websiteSchema, softwareApplicationSchema } from '@/components/seo';

// Error boundary for lazy loaded components
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

  render() {
    if (this.state.hasError) {
      return <div className="py-8 text-center text-muted-foreground">Section failed to load</div>;
    }
    return this.props.children;
  }
}

// Lazy load home page sections
const HeroSection = lazy(() => import('@/components/home/HeroSection'));
const SocialProofBar = lazy(() => import('@/components/home/SocialProofBar'));
const DifferentiatorCards = lazy(() => import('@/components/home/DifferentiatorCards'));
const AIFlowBuilderSection = lazy(() => import('@/components/home/AIFlowBuilderSection'));
const ProductTourSection = lazy(() => import('@/components/home/ProductTourSection'));
const AICapabilitiesSection = lazy(() => import('@/components/home/AICapabilitiesSection'));
const PowerfulUSPsSection = lazy(() => import('@/components/home/PowerfulUSPsSection'));
const MetaAdsAttributionSection = lazy(() => import('@/components/home/MetaAdsAttributionSection'));
const PricingPreview = lazy(() => import('@/components/home/PricingPreview'));
const TestimonialsCarousel = lazy(() => import('@/components/home/TestimonialsCarousel'));
const FinalCTANew = lazy(() => import('@/components/home/FinalCTANew'));

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
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="Free WhatsApp API Lifetime | No Monthly Fees, Official Cloud API"
        description="Get Free WhatsApp API Lifetime access with AiReatro. No setup fees, no monthly platform charges. Only pay Meta's conversation fees. Official WhatsApp Cloud API partner."
        canonical="/"
        keywords={['free whatsapp api lifetime', 'free whatsapp api', 'whatsapp cloud api free', 'whatsapp business api free', 'free whatsapp automation', 'no monthly fee whatsapp api']}
      />
      <JsonLd data={[organizationSchema, websiteSchema, softwareApplicationSchema]} />
      <Navbar />

      {/* Hero Section */}
      <SectionErrorBoundary>
        <Suspense fallback={<SectionSkeleton />}>
          <HeroSection />
        </Suspense>
      </SectionErrorBoundary>

      {/* Social Proof */}
      <SectionErrorBoundary>
        <Suspense fallback={<SectionSkeleton />}>
          <SocialProofBar />
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

      {/* 10 Powerful USPs */}
      <SectionErrorBoundary>
        <Suspense fallback={<SectionSkeleton />}>
          <PowerfulUSPsSection />
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
