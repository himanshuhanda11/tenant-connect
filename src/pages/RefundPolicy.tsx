import { Link } from 'react-router-dom';
import { CreditCard, CheckCircle2, Clock, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Breadcrumb from '@/components/layout/Breadcrumb';

export default function RefundPolicy() {
  const eligibleRefunds = [
    'Technical issues on our end that prevented service use',
    'Accidental duplicate payments',
    'Charges after account cancellation (within 48 hours of cancellation)',
    'Service downtime exceeding our SLA guarantees',
    'First-time subscription within 14-day money-back guarantee period'
  ];

  const nonEligibleRefunds = [
    'Change of mind after the 14-day money-back period',
    'Unused portion of subscription after cancellation',
    'WhatsApp conversation charges (billed by Meta separately)',
    'Violation of Terms of Service resulting in account termination',
    'Partial months of service',
    'Third-party integration fees'
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-green-950/10 to-background" />
        <div className="absolute inset-0">
          <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-green-500/5 rounded-full blur-[100px]" />
        </div>
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto">
            <Breadcrumb className="mb-6" />
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-500 text-sm font-medium mb-6">
              <CreditCard className="w-4 h-4" />
              Refund Policy
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Refund Policy
            </h1>
            <p className="text-lg text-muted-foreground">
              <strong>Last Updated:</strong> January 13, 2026
            </p>
          </div>
        </div>
      </section>

      {/* Money Back Guarantee */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <Card className="border-green-500/20 bg-green-500/5">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-4">14-Day Money-Back Guarantee</h2>
                <p className="text-muted-foreground max-w-xl mx-auto">
                  We offer a 14-day money-back guarantee on all first-time subscriptions. If you're not satisfied 
                  with our service within the first 14 days, we'll refund your payment in full—no questions asked.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Eligible Refunds */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-foreground mb-6">Eligible for Refund</h2>
            <Card className="border-border/50">
              <CardContent className="p-6">
                <ul className="space-y-3">
                  {eligibleRefunds.map((item, index) => (
                    <li key={index} className="flex items-start gap-3 text-foreground">
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Non-Eligible Refunds */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-foreground mb-6">Not Eligible for Refund</h2>
            <Card className="border-border/50">
              <CardContent className="p-6">
                <ul className="space-y-3">
                  {nonEligibleRefunds.map((item, index) => (
                    <li key={index} className="flex items-start gap-3 text-muted-foreground">
                      <span className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* WhatsApp Charges Note */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <Card className="border-blue-500/20 bg-blue-500/5">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <HelpCircle className="w-6 h-6 text-blue-500 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Important: WhatsApp Conversation Charges</h3>
                    <p className="text-muted-foreground">
                      WhatsApp conversation fees are charged directly by Meta and are separate from our platform 
                      subscription. These charges are non-refundable and must be disputed directly with Meta if needed. 
                      For more information, visit{' '}
                      <a href="https://business.whatsapp.com/pricing" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        WhatsApp Business Pricing
                      </a>.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How to Request */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-foreground mb-6">How to Request a Refund</h2>
            <div className="space-y-4">
              <Card className="border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="font-bold text-primary">1</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Contact Support</h3>
                      <p className="text-muted-foreground">
                        Email our billing team at <a href="mailto:billing@aireatro.com" className="text-primary hover:underline">billing@aireatro.com</a> or 
                        use the in-app support chat.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="font-bold text-primary">2</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Provide Details</h3>
                      <p className="text-muted-foreground">
                        Include your account email, transaction ID, and reason for the refund request.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="font-bold text-primary">3</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Receive Confirmation</h3>
                      <p className="text-muted-foreground">
                        We'll review your request within 3-5 business days and notify you of the decision.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Processing Time */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <Card className="border-border/50">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Clock className="w-6 h-6 text-primary flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Refund Processing Time</h3>
                    <p className="text-muted-foreground">
                      Approved refunds are processed within 5-10 business days. The time it takes for the refund 
                      to appear in your account depends on your payment method and financial institution. Credit 
                      card refunds typically take 5-7 business days to reflect on your statement.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Cancellation */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold text-foreground">Subscription Cancellation</h2>
            <p className="text-muted-foreground">
              You can cancel your subscription at any time from your account settings. When you cancel:
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Your subscription will remain active until the end of your current billing period</li>
              <li>• You will not be charged for the next billing cycle</li>
              <li>• Your data will be retained for 30 days after the subscription ends</li>
              <li>• You can reactivate your subscription at any time during this period</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">Need Help?</h2>
            <p className="text-muted-foreground mb-6">
              If you have questions about billing or refunds, our support team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild>
                <a href="mailto:billing@aireatro.com">Contact Billing</a>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/help">Visit Help Center</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="border-t border-border">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto text-center text-sm text-muted-foreground">
            <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>
            {' · '}
            <Link to="/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link>
            {' · '}
            <Link to="/" className="text-primary hover:underline">Home</Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
