import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function AcceptableUse() {
  const permitted = [
    'Sending messages to customers who have explicitly opted-in to receive communications',
    'Responding to customer inquiries within the 24-hour messaging window',
    'Sending transactional notifications (order confirmations, shipping updates, etc.)',
    'Marketing campaigns to customers who have given prior consent',
    'Automated responses for customer support and FAQs',
    'Appointment reminders and booking confirmations',
    'Account-related notifications and security alerts'
  ];

  const prohibited = [
    'Sending unsolicited messages (spam) to users who have not opted-in',
    'Purchasing or using third-party contact lists without verified consent',
    'Sending messages that violate WhatsApp Commerce Policy or Meta guidelines',
    'Sharing illegal, harmful, or inappropriate content',
    'Impersonating other businesses, organizations, or individuals',
    'Sending deceptive or misleading information',
    'Harassment, threats, or abusive communications',
    'Promoting illegal products or services',
    'Attempting to circumvent platform security measures',
    'Using the platform for phishing or fraud'
  ];

  const whatsappPolicies = [
    {
      title: 'Opt-In Requirement',
      description: 'All message recipients must have explicitly opted-in to receive messages from your business. You must maintain records of consent.'
    },
    {
      title: 'Message Templates',
      description: 'Marketing and promotional messages must use pre-approved templates that comply with WhatsApp policies.'
    },
    {
      title: '24-Hour Window',
      description: 'Free-form messages can only be sent within 24 hours of the customer\'s last message. Outside this window, only approved templates may be used.'
    },
    {
      title: 'Opt-Out Mechanism',
      description: 'Recipients must have a clear and easy way to opt-out of receiving future messages.'
    },
    {
      title: 'Content Guidelines',
      description: 'All content must comply with WhatsApp Commerce Policy, including restrictions on certain product categories.'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-blue-950/10 to-background" />
        <div className="absolute inset-0">
          <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px]" />
        </div>
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto">
            <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-sm font-medium mb-6">
              <Shield className="w-4 h-4" />
              Acceptable Use Policy
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Acceptable Use Policy
            </h1>
            <p className="text-lg text-muted-foreground">
              <strong>Last Updated:</strong> January 13, 2026
            </p>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto prose prose-neutral dark:prose-invert">
            <p className="text-lg text-muted-foreground leading-relaxed">
              This Acceptable Use Policy ("AUP") outlines the rules and guidelines for using the aireatro WhatsApp Business 
              Platform. By using our services, you agree to comply with this policy as well as WhatsApp's Business Policy 
              and Meta's Platform Terms.
            </p>
            <p className="text-muted-foreground mt-4">
              We take compliance seriously. Violations of this policy may result in account suspension or termination, 
              and may be reported to Meta/WhatsApp as required.
            </p>
          </div>
        </div>
      </section>

      {/* Permitted Uses */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-500" />
              Permitted Uses
            </h2>
            <Card className="border-green-500/20 bg-green-500/5">
              <CardContent className="p-6">
                <ul className="space-y-3">
                  {permitted.map((item, index) => (
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

      {/* Prohibited Uses */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
              <XCircle className="w-6 h-6 text-red-500" />
              Prohibited Uses
            </h2>
            <Card className="border-red-500/20 bg-red-500/5">
              <CardContent className="p-6">
                <ul className="space-y-3">
                  {prohibited.map((item, index) => (
                    <li key={index} className="flex items-start gap-3 text-foreground">
                      <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* WhatsApp Compliance */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-foreground mb-6">WhatsApp Business Policy Compliance</h2>
            <p className="text-muted-foreground mb-8">
              All users must comply with WhatsApp's official Business Policy and Commerce Policy. Key requirements include:
            </p>
            <div className="space-y-4">
              {whatsappPolicies.map((policy, index) => (
                <Card key={index} className="border-border/50">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-foreground mb-2">{policy.title}</h3>
                    <p className="text-muted-foreground">{policy.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Enforcement */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-foreground mb-6">Policy Enforcement</h2>
            <Card className="border-orange-500/20 bg-orange-500/5">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <AlertTriangle className="w-6 h-6 text-orange-500 flex-shrink-0" />
                  <div className="space-y-4">
                    <p className="text-foreground">
                      We actively monitor platform usage for policy violations. When a violation is detected:
                    </p>
                    <ul className="space-y-2 text-muted-foreground">
                      <li><strong>First violation:</strong> Warning and request for immediate correction</li>
                      <li><strong>Second violation:</strong> Temporary account suspension (up to 7 days)</li>
                      <li><strong>Third violation:</strong> Permanent account termination</li>
                      <li><strong>Severe violations:</strong> Immediate termination without warning</li>
                    </ul>
                    <p className="text-muted-foreground text-sm">
                      We reserve the right to report serious violations to Meta/WhatsApp and relevant authorities as required by law.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Reporting */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">Report a Violation</h2>
            <p className="text-muted-foreground mb-6">
              If you believe a user is violating this policy, please report it to our trust and safety team.
            </p>
            <Button asChild>
              <a href="mailto:abuse@aireatro.com">Report Abuse</a>
            </Button>
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
