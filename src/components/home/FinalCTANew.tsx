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

const benefits = [
  { icon: Zap, text: 'Setup in 5 minutes' },
  { icon: Shield, text: 'No credit card required' },
  { icon: HeadphonesIcon, text: 'Free migration support' },
];

export default function FinalCTANew() {
  const navigate = useNavigate();

  return (
    <section className="py-20 md:py-28 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            Start Growing Today
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Ready to Turn WhatsApp Into Your{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
              #1 Revenue Channel
            </span>
            ?
          </h2>
          
          <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
            Join 2,000+ teams using AiReatro to automate conversations, close more deals, and delight customers.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
            <Button 
              size="lg" 
              className="h-16 px-10 text-lg bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-xl shadow-green-500/30 transition-all hover:shadow-2xl hover:shadow-green-500/40" 
              onClick={() => navigate('/signup')}
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="h-16 px-10 text-lg border-slate-600 text-white hover:bg-slate-800 hover:text-white" 
              onClick={() => navigate('/contact')}
            >
              Book a Demo
            </Button>
          </div>

          {/* Benefits */}
          <div className="flex flex-wrap justify-center gap-6 md:gap-10">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-2 text-slate-400">
                <benefit.icon className="w-5 h-5 text-green-400" />
                <span>{benefit.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
