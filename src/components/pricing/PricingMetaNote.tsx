import { AlertCircle, ArrowRight, ChevronRight, MessageSquare, Shield, Megaphone, Key } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const charges = [
  { category: 'Marketing', price: '₹1.09', icon: Megaphone, color: 'text-violet-600', bg: 'bg-violet-500/10' },
  { category: 'Utility', price: '₹0.145', icon: Shield, color: 'text-blue-600', bg: 'bg-blue-500/10' },
  { category: 'Authentication', price: '₹0.145', icon: Key, color: 'text-amber-600', bg: 'bg-amber-500/10' },
  { category: 'Service', price: 'Free', icon: MessageSquare, color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
];

export default function PricingMetaNote() {
  return (
    <section className="py-6 md:py-8">
      <div className="container mx-auto px-4">
        <Card className="max-w-4xl mx-auto border-amber-500/30 bg-amber-50/50 dark:bg-amber-500/5 rounded-2xl">
          <CardContent className="p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-amber-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-2">Per Template Message Charges</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  WhatsApp template message fees are <strong>charged by Meta</strong> based on conversation category. These are in addition to your platform subscription.
                </p>

                {/* Charges Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-4">
                  {charges.map((c) => (
                    <div key={c.category} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-background/80 border border-border/50">
                      <div className={`w-8 h-8 rounded-lg ${c.bg} flex items-center justify-center flex-shrink-0`}>
                        <c.icon className={`w-4 h-4 ${c.color}`} />
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground leading-tight">{c.category}</p>
                        <p className="text-sm font-bold text-foreground">
                          {c.price}
                          {c.category !== 'Service' && <span className="text-[10px] font-normal text-muted-foreground">/msg</span>}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-amber-200/50 dark:border-amber-500/20">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800">
                      ✓ Unlimited Free Service Conversations
                    </Badge>
                    <Badge variant="outline" className="text-[10px]">
                      First 1,000 conversations/mo free
                    </Badge>
                  </div>
                  <a
                    href="https://business.whatsapp.com/products/platform-pricing"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline inline-flex items-center gap-1 font-medium"
                  >
                    Meta's official pricing <ArrowRight className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
