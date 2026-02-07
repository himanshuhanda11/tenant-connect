import { AlertCircle, ArrowRight, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function PricingMetaNote() {
  return (
    <section className="py-6 md:py-8">
      <div className="container mx-auto px-4">
        <Card className="max-w-3xl mx-auto border-amber-500/30 bg-amber-50/50 dark:bg-amber-500/5 rounded-2xl">
          <CardContent className="p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">WhatsApp Conversation Charges</h3>
                <p className="text-muted-foreground text-sm mb-3">
                  WhatsApp conversation fees are <strong>billed separately by Meta</strong> and are not included in our platform subscription.
                </p>
                <ul className="text-sm text-muted-foreground space-y-1.5 mb-3">
                  <li className="flex items-start gap-2"><ChevronRight className="w-3.5 h-3.5 mt-0.5 text-amber-500 flex-shrink-0" /> <strong>User-initiated:</strong> Lower cost when customers message first</li>
                  <li className="flex items-start gap-2"><ChevronRight className="w-3.5 h-3.5 mt-0.5 text-amber-500 flex-shrink-0" /> <strong>Business-initiated:</strong> Template-based conversations</li>
                  <li className="flex items-start gap-2"><ChevronRight className="w-3.5 h-3.5 mt-0.5 text-amber-500 flex-shrink-0" /> <strong>Free tier:</strong> First 1,000 user-initiated conversations/month are free</li>
                </ul>
                <a
                  href="https://business.whatsapp.com/products/platform-pricing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline inline-flex items-center gap-1 font-medium"
                >
                  View Meta's official pricing <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
