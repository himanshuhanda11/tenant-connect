import React, { useEffect, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';
import { SEO, JsonLd, organizationSchema, websiteSchema, softwareApplicationSchema } from '@/components/seo';

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
      <Suspense fallback={<SectionSkeleton />}>
        <HeroSection />
      </Suspense>

      {/* Social Proof */}
      <Suspense fallback={<SectionSkeleton />}>
        <SocialProofBar />
      </Suspense>

      {/* Differentiator Cards */}
      <Suspense fallback={<SectionSkeleton />}>
        <DifferentiatorCards />
      </Suspense>

      {/* AI Flow Builder - Center Feature */}
      <Suspense fallback={<SectionSkeleton />}>
        <AIFlowBuilderSection />
      </Suspense>

      {/* Product Tour */}
      <Suspense fallback={<SectionSkeleton />}>
        <ProductTourSection />
      </Suspense>

      {/* AI Capabilities */}
      <Suspense fallback={<SectionSkeleton />}>
        <AICapabilitiesSection />
      </Suspense>

      {/* 10 Powerful USPs */}
      <Suspense fallback={<SectionSkeleton />}>
        <PowerfulUSPsSection />
      </Suspense>

      {/* Meta Ads Attribution */}
      <Suspense fallback={<SectionSkeleton />}>
        <MetaAdsAttributionSection />
      </Suspense>

      {/* Pricing Preview */}
      <Suspense fallback={<SectionSkeleton />}>
        <PricingPreview />
      </Suspense>

      {/* Testimonials */}
      <Suspense fallback={<SectionSkeleton />}>
        <TestimonialsCarousel />
      </Suspense>

      {/* Final CTA */}
      <Suspense fallback={<SectionSkeleton />}>
        <FinalCTANew />
      </Suspense>

      <Footer />
    </div>
  );
}
