import React, { useEffect, Suspense, lazy } from 'react';
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
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';
import { OptimizedVideo } from '@/components/ui/optimized-media';
import dashboardDemo from '@/assets/dashboard-demo.mp4';

// Lazy load home page sections for better initial load
const SocialProofBar = lazy(() => import('@/components/home/SocialProofBar'));
const CoreFeaturesGrid = lazy(() => import('@/components/home/CoreFeaturesGrid'));
const AdvancedFeaturesSection = lazy(() => import('@/components/home/AdvancedFeaturesSection'));
const ProductTourSection = lazy(() => import('@/components/home/ProductTourSection'));
const IndustrySolutions = lazy(() => import('@/components/home/IndustrySolutions'));
const IntegrationSection = lazy(() => import('@/components/home/IntegrationSection'));
const PricingPreview = lazy(() => import('@/components/home/PricingPreview'));
const SecuritySection = lazy(() => import('@/components/home/SecuritySection'));
const TestimonialsSection = lazy(() => import('@/components/home/TestimonialsSection'));
const FinalCTASection = lazy(() => import('@/components/home/FinalCTASection'));

// Section loading skeleton
function SectionSkeleton() {
  return (
    <div className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <Skeleton className="h-8 w-48 mx-auto mb-4" />
        <Skeleton className="h-4 w-72 mx-auto mb-8" />
        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
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
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section - Mobile Optimized */}
      <section className="relative overflow-hidden bg-background">
        {/* Subtle Background - Reduced on mobile */}
        <div className="absolute inset-0 hidden sm:block">
          <div className="absolute top-0 left-1/4 w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-green-500/5 rounded-full blur-[100px] md:blur-[150px]" />
          <div className="absolute bottom-0 right-1/4 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-emerald-500/5 rounded-full blur-[80px] md:blur-[120px]" />
        </div>
        {/* Grid Pattern - Hidden on mobile for performance */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:60px_60px] hidden sm:block" />
        
        <div className="container mx-auto px-4 py-8 sm:py-12 md:py-16 lg:py-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Content - Mobile First */}
            <div className="text-center lg:text-left order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-600 text-xs sm:text-sm font-medium mb-4 sm:mb-6">
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Official</span> WhatsApp Business API Partner
              </div>
              
              <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-4 sm:mb-6">
                Sell, Support & Retain on{' '}
                <span className="bg-gradient-to-r from-green-500 via-emerald-500 to-cyan-500 bg-clip-text text-transparent">
                  WhatsApp
                </span>{' '}
                <span className="hidden sm:inline">— at Scale</span>
              </h1>
              
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-4 sm:mb-6 px-2 sm:px-0">
                Cloud API + Team Inbox + Campaigns + Automations — everything you need in one platform.
              </p>

              {/* Trust badges - Scrollable on mobile */}
              <div className="flex flex-nowrap sm:flex-wrap items-center justify-start lg:justify-start gap-2 sm:gap-3 mb-6 sm:mb-8 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:overflow-visible sm:justify-center">
                <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20 whitespace-nowrap flex-shrink-0">
                  <Shield className="w-3 h-3 mr-1" />
                  Meta Cloud API
                </Badge>
                <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 border-blue-500/20 whitespace-nowrap flex-shrink-0">
                  Official Partner
                </Badge>
                <Badge variant="secondary" className="bg-purple-500/10 text-purple-600 border-purple-500/20 whitespace-nowrap flex-shrink-0">
                  GDPR-ready
                </Badge>
              </div>

              {/* CTA Row - Stack on mobile */}
              <div className="flex flex-col sm:flex-row gap-3 mb-4 sm:mb-6 justify-center lg:justify-start">
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
                  Watch Demo
                </Button>
              </div>

              <p className="text-xs sm:text-sm text-muted-foreground">
                No credit card required • Setup in minutes
              </p>
            </div>

            {/* Right Content - Demo Video with lazy loading */}
            <div className="relative order-1 lg:order-2">
              <div className="relative rounded-xl sm:rounded-2xl overflow-hidden shadow-xl sm:shadow-2xl border border-border">
                <OptimizedVideo 
                  src={dashboardDemo}
                  className="w-full h-auto"
                />
              </div>
              {/* Floating elements - Hidden on small mobile */}
              <div className="absolute -bottom-2 -left-2 sm:-bottom-4 sm:-left-4 md:-bottom-6 md:-left-6 bg-card backdrop-blur-xl p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl shadow-lg sm:shadow-xl border border-border hidden xs:block">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full bg-green-500 flex items-center justify-center">
                    <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-medium text-foreground">Delivered</div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground">Just now</div>
                  </div>
                </div>
              </div>
              <div className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 md:-top-4 md:-right-4 bg-card backdrop-blur-xl p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl shadow-lg sm:shadow-xl border border-border hidden xs:block">
                <div className="text-base sm:text-lg md:text-2xl font-bold text-foreground">98.5%</div>
                <div className="text-[10px] sm:text-xs text-muted-foreground">Delivery Rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lazy loaded sections with suspense */}
      <Suspense fallback={<SectionSkeleton />}>
        <SocialProofBar />
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <CoreFeaturesGrid />
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <AdvancedFeaturesSection />
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <ProductTourSection />
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <IndustrySolutions />
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <IntegrationSection />
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <PricingPreview />
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <SecuritySection />
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <TestimonialsSection />
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <FinalCTASection />
      </Suspense>

      <Footer />
    </div>
  );
}
