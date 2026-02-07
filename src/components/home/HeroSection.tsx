import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Sparkles,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import heroVideo from '@/assets/hero-demo.mp4';
import dashboardPreview from '@/assets/dashboard-preview.png';

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="relative bg-background overflow-hidden py-4 sm:py-6">
      {/* Subtle background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 sm:top-20 right-[5%] sm:right-[10%] w-[200px] sm:w-[350px] lg:w-[450px] h-[200px] sm:h-[350px] lg:h-[450px] bg-gradient-to-br from-accent/60 via-accent/30 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-5 sm:bottom-10 left-[5%] w-[150px] sm:w-[250px] lg:w-[350px] h-[150px] sm:h-[250px] lg:h-[350px] bg-gradient-to-tr from-info/10 via-info/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.01)_1px,transparent_1px)] bg-[size:50px_50px] lg:bg-[size:70px_70px]" />
      </div>

      <div className="container mx-auto px-4 py-2 sm:py-3 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Text Content - Centered */}
          <div className="text-center max-w-4xl mx-auto mb-6 sm:mb-8">
            <Badge className="mb-4 sm:mb-5 bg-accent text-accent-foreground border-primary/20 hover:bg-accent/80 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm">
              <Sparkles className="w-3 sm:w-3.5 h-3 sm:h-3.5 mr-1.5 sm:mr-2" />
              Official WhatsApp Cloud API Partner
            </Badge>
            
            <h1 className="text-3xl xs:text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-4 sm:mb-5 text-foreground">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-500">
                Free WhatsApp API Lifetime
              </span>
              {' '}— No Monthly Fees, Ever.
            </h1>
            
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto">
              Get lifetime free access to WhatsApp Cloud API. Only pay Meta's conversation fees — zero platform charges. AI automation, team inbox & flow diagnostics included.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col xs:flex-row flex-wrap gap-3 sm:gap-4 mb-4 sm:mb-5 justify-center">
              <Button 
                size="lg" 
                className="h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-base bg-gradient-to-r from-primary to-emerald-500 hover:from-primary/90 hover:to-emerald-600 shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30" 
                onClick={() => navigate('/signup')}
              >
                Start Free Trial
                <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5 ml-2" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-base border-border hover:bg-muted" 
                onClick={() => navigate('/contact')}
              >
                Book Demo
              </Button>
            </div>

            {/* Trust Line */}
            <div className="text-xs sm:text-sm text-muted-foreground flex items-center gap-2 justify-center flex-wrap">
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-primary" />
                Free Forever
              </span>
              <span className="text-border">•</span>
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-primary" />
                No Monthly Fees
              </span>
              <span className="hidden xs:inline text-border">•</span>
              <span className="hidden xs:flex items-center gap-1">
                <CheckCircle className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-primary" />
                Official Cloud API
              </span>
            </div>
          </div>

          {/* Dashboard Video */}
          <div className="relative max-w-5xl mx-auto">
            <div className="relative rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl border border-border bg-foreground">
              <video
                src={heroVideo}
                poster={dashboardPreview}
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
