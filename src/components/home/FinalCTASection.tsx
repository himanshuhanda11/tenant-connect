import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Calendar, Headphones, Rocket, Sparkles, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import whatsappCouplePink from '@/assets/whatsapp-couple-pink.jpg';

export default function FinalCTASection() {
  const navigate = useNavigate();

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-950/20 dark:via-emerald-950/20 dark:to-teal-950/20 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-green-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px]" />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-6xl mx-auto">
          {/* Left - Content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-600 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Get Started Today
            </div>
            
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Ready to Launch Your{' '}
              <span className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 bg-clip-text text-transparent">
                WhatsApp Growth Engine
              </span>
              ?
            </h2>
            
            <p className="text-lg text-muted-foreground mb-8 max-w-lg mx-auto lg:mx-0">
              Join thousands of businesses using aireatro to connect with customers, automate conversations, and drive growth on WhatsApp.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-center lg:justify-start">
              <Button 
                size="lg" 
                className="h-14 px-8 text-base bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-xl shadow-green-500/25"
                onClick={() => navigate('/signup')}
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="h-14 px-8 text-base"
                onClick={() => navigate('/contact')}
              >
                <Calendar className="w-5 h-5 mr-2" />
                Book a Demo
              </Button>
            </div>

            {/* Trust items */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2 justify-center lg:justify-start">
                <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                  <Rocket className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-muted-foreground">Setup in minutes</span>
              </div>
              <div className="flex items-center gap-2 justify-center lg:justify-start">
                <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-muted-foreground">Migration support</span>
              </div>
              <div className="flex items-center gap-2 justify-center lg:justify-start">
                <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <Headphones className="w-4 h-4 text-purple-600" />
                </div>
                <span className="text-muted-foreground">Dedicated onboarding</span>
              </div>
            </div>
          </div>

          {/* Right - Image */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src={whatsappCouplePink} 
                alt="WhatsApp Business Success" 
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
            
            {/* Floating stats */}
            <div className="absolute -top-4 -left-4 md:-top-6 md:-left-6 bg-card backdrop-blur-xl p-4 rounded-xl shadow-xl border border-border hidden sm:block">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-xl font-bold text-foreground">10M+</div>
                  <div className="text-xs text-muted-foreground">Messages Sent</div>
                </div>
              </div>
            </div>
            
            <div className="absolute -bottom-4 -right-4 md:-bottom-6 md:-right-6 bg-card backdrop-blur-xl p-4 rounded-xl shadow-xl border border-border hidden sm:block">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-xl font-bold text-foreground">5,000+</div>
                  <div className="text-xs text-muted-foreground">Happy Businesses</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
