import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const faqs = [
  {
    question: 'What does SMEKSH charge?',
    answer: 'SMEKSH charges a monthly or annual subscription fee for access to the platform. This includes team seats, phone number connections, automation workflows, and support. Pricing varies by plan tier.'
  },
  {
    question: 'Are WhatsApp message charges included?',
    answer: 'No. WhatsApp conversation fees are billed separately by Meta. Meta charges based on conversation category (marketing, utility, service, authentication) and the destination country. You can view Meta\'s pricing at developers.facebook.com/docs/whatsapp/pricing.'
  },
  {
    question: 'What is a team seat?',
    answer: 'A team seat is a user account that can access your workspace. Each plan includes a certain number of seats. Additional seats can be purchased as add-ons.'
  },
  {
    question: 'What happens if my payment fails?',
    answer: 'If a payment fails, we\'ll notify you immediately and retry the payment. You\'ll have a 7-day grace period to update your payment method. After that, your subscription may be paused until payment is resolved.'
  },
  {
    question: 'How do refunds work?',
    answer: 'We offer a 14-day money-back guarantee for new subscriptions. After that, we don\'t offer refunds for partial months, but you can cancel anytime and retain access until the end of your billing period.'
  },
  {
    question: 'Can I change my plan at any time?',
    answer: 'Yes! You can upgrade your plan immediately and get pro-rated billing. Downgrades take effect at the start of your next billing cycle to ensure uninterrupted access.'
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit and debit cards (Visa, Mastercard, American Express) through our secure payment processor, Stripe. Bank transfers are available for Enterprise plans.'
  },
];

export function BillingFAQ() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Billing FAQ</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, idx) => (
            <AccordionItem key={idx} value={`item-${idx}`}>
              <AccordionTrigger className="text-left">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
