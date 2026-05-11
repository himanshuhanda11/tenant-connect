import { ShieldCheck, Lock, Zap, BadgeCheck, Globe, Headphones } from 'lucide-react';

const items = [
  { icon: BadgeCheck, label: 'Official WhatsApp API', sub: 'Meta-verified partner' },
  { icon: ShieldCheck, label: '99.9% Uptime SLA', sub: 'Enterprise reliability' },
  { icon: Lock, label: 'Secure Payments', sub: 'Stripe + PCI compliant' },
  { icon: Zap, label: 'Setup in < 10 min', sub: 'Guided onboarding' },
  { icon: Globe, label: 'GDPR Ready', sub: 'Global compliance' },
  { icon: Headphones, label: 'Human Support', sub: 'No bot runarounds' },
];

export default function PricingTrust() {
  return (
    <section className="py-8 md:py-10">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm p-5 sm:p-6">
          <p className="text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-5">
            Why teams choose Aireatro
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {items.map(({ icon: Icon, label, sub }) => (
              <div
                key={label}
                className="group flex items-center gap-2.5 rounded-xl px-2.5 py-2 hover:bg-muted/40 transition-colors"
              >
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/15 transition-colors">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0 leading-tight">
                  <div className="text-xs font-semibold text-foreground truncate">{label}</div>
                  <div className="text-[10px] text-muted-foreground truncate">{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
