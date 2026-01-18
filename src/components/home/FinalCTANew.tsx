import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  CheckCircle,
  Sparkles,
  Zap,
  Shield,
  HeadphonesIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OptimizedImage } from '@/components/ui/optimized-media';
import whatsappFriends from '@/assets/whatsapp-friends-upload.jpg';

const benefits = [
  { icon: Zap, text: 'Free API Lifetime' },
  { icon: Shield, text: 'No Monthly Fees' },
  { icon: HeadphonesIcon, text: 'Official Cloud API' },
];

export default function FinalCTANew() {
  const navigate = useNavigate();

  return (
    <section className="py-10 sm:py-12 md:py-16 lg:py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-48 sm:w-72 lg:w-96 h-48 sm:h-72 lg:h-96 bg-green-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-40 sm:w-60 lg:w-80 h-40 sm:h-60 lg:h-80 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] sm:bg-[size:60px_60px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center max-w-6xl mx-auto">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 text-xs sm:text-sm font-medium mb-6 sm:mb-8">
              <Sparkles className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
              Start Growing Today
            </div>
            
            <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight">
              Get{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
                Free WhatsApp API Lifetime
              </span>
              {' '}Access Today
            </h2>
            
            <p className="text-sm sm:text-base lg:text-xl text-slate-400 mb-6 sm:mb-8 lg:mb-10 max-w-2xl mx-auto lg:mx-0">
              No monthly platform fees. No hidden charges. Just pay Meta's conversation fees. Join 2,000+ teams using AiReatro.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col xs:flex-row gap-3 sm:gap-4 justify-center lg:justify-start mb-6 sm:mb-8 lg:mb-10">
              <Button 
                size="lg" 
                className="h-12 sm:h-14 lg:h-16 px-6 sm:px-8 lg:px-10 text-sm sm:text-base lg:text-lg bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-xl shadow-green-500/30 transition-all hover:shadow-2xl hover:shadow-green-500/40" 
                onClick={() => navigate('/signup')}
              >
                Start Free Trial
                <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5 ml-2" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="h-12 sm:h-14 lg:h-16 px-6 sm:px-8 lg:px-10 text-sm sm:text-base lg:text-lg border-slate-600 text-white hover:bg-slate-800 hover:text-white" 
                onClick={() => navigate('/contact')}
              >
                Book a Demo
              </Button>
            </div>

            {/* Benefits */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-4 sm:gap-6 lg:gap-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-1.5 sm:gap-2 text-slate-400 text-xs sm:text-sm">
                  <benefit.icon className="w-4 sm:w-5 h-4 sm:h-5 text-green-400" />
                  <span>{benefit.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Image */}
          <div className="mt-6 lg:mt-0">
            <OptimizedImage
              src={whatsappFriends}
              alt="People chatting on WhatsApp"
              className="w-full max-w-xl mx-auto lg:max-w-none h-auto rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
