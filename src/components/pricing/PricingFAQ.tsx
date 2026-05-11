import { Plus } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    q: 'Is there really a free plan?',
    a: 'Yes. The Free plan is free forever with no card required. Upgrade only when you outgrow the limits.',
  },
  {
    q: 'How does the 30-day free trial work?',
    a: 'All paid plans include a 30-day free trial. No charges until the trial ends. Cancel anytime from Billing.',
  },
  {
    q: 'Do you support the official WhatsApp Business API?',
    a: 'Yes. Aireatro is built on the Meta-verified Cloud API. No risk of bans, no third-party workarounds.',
  },
  {
    q: 'How does billing work?',
    a: 'Pay monthly or yearly via Stripe. Yearly plans save 20%. Prices are auto-detected by your region.',
  },
  {
    q: 'Can I cancel or change my plan?',
    a: 'Anytime. Upgrades apply instantly, downgrades take effect at the next cycle. No lock-in.',
  },
  {
    q: 'How fast is setup?',
    a: 'Most teams are live in under 10 minutes — guided onboarding, instant phone provisioning, prebuilt flows.',
  },
  {
    q: 'How many team members can I add?',
    a: 'Free 1 · Basic 5 · Pro 15 · Business 25 agents. Need more? Add the Extra Agents add-on anytime.',
  },
  {
    q: 'Do you offer refunds?',
    a: 'We offer a generous 30-day trial so you can evaluate risk-free. After that, charges are non-refundable.',
  },
];

export default function PricingFAQ() {
  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-2">
            Questions, answered
          </h2>
          <p className="text-sm text-muted-foreground">
            Everything you need to know before you start.
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-2">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`faq-${i}`}
              className="border border-border/60 rounded-xl px-4 sm:px-5 bg-card/60 backdrop-blur-sm hover:border-primary/30 transition-colors data-[state=open]:border-primary/40 data-[state=open]:shadow-sm"
            >
              <AccordionTrigger className="text-left text-foreground hover:no-underline text-sm sm:text-[15px] py-4 font-semibold gap-3 [&>svg]:hidden group">
                <span className="flex-1">{faq.q}</span>
                <Plus className="w-4 h-4 text-muted-foreground transition-transform duration-300 group-data-[state=open]:rotate-45 flex-shrink-0" />
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-sm pb-4 leading-relaxed">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
