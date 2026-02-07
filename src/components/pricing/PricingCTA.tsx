import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function PricingCTA() {
  const navigate = useNavigate();

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3">
          Start free. Scale when you're ready.
        </h2>
        <p className="text-sm text-muted-foreground mb-6 max-w-lg mx-auto">
          Official WhatsApp Business API · Safer sending guardrails · Add-ons for growth.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            size="lg"
            className="h-12 px-8 bg-gradient-to-r from-primary to-emerald-500 text-primary-foreground font-semibold shadow-lg shadow-primary/20 rounded-xl"
            onClick={() => navigate('/signup')}
          >
            Start Free
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-12 px-8 font-semibold rounded-xl"
            onClick={() => navigate('/contact')}
          >
            Talk to Sales
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-4">
          No credit card required for Free plan
        </p>
      </div>
    </section>
  );
}
