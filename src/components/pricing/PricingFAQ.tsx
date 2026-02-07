import { HelpCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  { question: 'How does workspace-based pricing work?', answer: 'Each workspace gets its own WhatsApp phone number and subscription plan. You can create multiple workspaces for different brands or departments, each with their own plan.' },
  { question: 'Can I upgrade or downgrade my plan?', answer: 'Yes, you can change plans at any time. Upgrades are applied immediately, and downgrades take effect at the next billing cycle.' },
  { question: 'What are WhatsApp conversation charges?', answer: 'WhatsApp conversation fees are billed separately by Meta based on the type and volume of conversations. The first 1,000 user-initiated conversations per month are free.' },
  { question: 'Do I need a separate phone number for each workspace?', answer: 'Yes, each workspace is linked to one WhatsApp Business API phone number. This ensures clean separation of contacts, templates, and analytics.' },
  { question: 'What happens when I hit my plan limits?', answer: "You'll receive alerts as you approach limits. You can add more capacity with add-ons or upgrade to a higher plan." },
  { question: 'Is the Free plan really free forever?', answer: 'Yes! The Free plan has no time limit. Use it for as long as you need. Scale when you are ready.' },
];

export default function PricingFAQ() {
  return (
    <section className="py-10 md:py-14">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <Badge className="bg-primary/10 text-primary border-primary/20 mb-3">
            <HelpCircle className="w-3.5 h-3.5 mr-1.5" />
            FAQ
          </Badge>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-2.5">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border border-border rounded-xl px-5 bg-card hover:border-primary/20 transition-colors">
                <AccordionTrigger className="text-left text-foreground hover:no-underline text-sm sm:text-base py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
