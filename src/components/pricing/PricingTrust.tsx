import { Shield, Lock, Globe, MessageSquare, Users, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const stats = [
  { icon: Globe, label: '2,000+ Businesses' },
  { icon: MessageSquare, label: '50M+ Messages Sent' },
  { icon: Users, label: '10,000+ Users' },
  { icon: Star, label: '4.8/5 Rating' },
];

export default function PricingTrust() {
  return (
    <>
      {/* Social proof strip */}
      <section className="py-6 border-y border-border/40 bg-muted/10">
        <div className="container mx-auto px-4">
          <p className="text-center text-xs text-muted-foreground mb-4 font-medium uppercase tracking-wider">
            Trusted by fast-growing teams across India
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {stats.map((item, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1.5 text-center">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <item.icon className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-semibold text-foreground">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust banner */}
      <section className="py-10 bg-foreground text-background relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(var(--primary)/0.15),transparent_50%)]" />
        <div className="container mx-auto px-4 text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/20 text-primary text-sm font-medium mb-5">
            <Shield className="w-4 h-4" />
            Official Meta Partner
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Built on Official WhatsApp Business API
          </h2>
          <p className="text-base opacity-70 max-w-xl mx-auto mb-6">
            No WhatsApp ban risk. Enterprise-grade reliability with Meta's official infrastructure.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm opacity-60">
            <span className="inline-flex items-center gap-1.5"><Shield className="w-4 h-4" /> SOC2 Compliant</span>
            <span>•</span>
            <span className="inline-flex items-center gap-1.5"><Lock className="w-4 h-4" /> End-to-End Encrypted</span>
            <span>•</span>
            <span className="inline-flex items-center gap-1.5"><Globe className="w-4 h-4" /> GDPR Ready</span>
          </div>
          <div className="mt-5">
            <Badge className="bg-primary/20 text-primary border-0 text-xs">
              🛡 Meta-compliant messaging platform
            </Badge>
          </div>
        </div>
      </section>
    </>
  );
}
