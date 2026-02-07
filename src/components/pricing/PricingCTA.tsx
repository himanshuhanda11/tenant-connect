import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function PricingCTA() {
  const navigate = useNavigate();

  return (
    <section className="py-12 md:py-16 bg-gradient-to-br from-primary via-emerald-500 to-primary relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.1),transparent_50%)]" />
      <div className="container mx-auto px-4 relative text-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3">
          Start free. Scale when you're ready.
        </h2>
        <p className="text-base text-white/80 mb-6 max-w-lg mx-auto">
          No credit card required for Free plan. Upgrade anytime.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            size="lg"
            className="h-12 px-8 bg-white text-primary hover:bg-white/90 font-semibold shadow-xl rounded-xl"
            onClick={() => navigate('/signup')}
          >
            Start Free
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-12 px-8 border-2 border-white/60 text-white hover:bg-white/10 hover:text-white font-semibold rounded-xl"
            onClick={() => navigate('/contact')}
          >
            Talk to Sales
          </Button>
        </div>
        <p className="text-xs text-white/60 mt-4">
          Transparent pricing · Cancel or downgrade anytime
        </p>
      </div>
    </section>
  );
}
