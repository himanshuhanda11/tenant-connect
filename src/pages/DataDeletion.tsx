import { Link } from 'react-router-dom';
import { SEO } from '@/components/seo';
import { Trash2, Mail, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Breadcrumb from '@/components/layout/Breadcrumb';

export default function DataDeletion() {
  const steps = [
    {
      step: '01',
      title: 'Log Into Your Account',
      description: 'Sign in to your AiReatro account using your registered email address and password.',
      icon: CheckCircle2
    },
    {
      step: '02',
      title: 'Navigate to Settings',
      description: 'Go to Settings > Account > Privacy & Data section in your dashboard.',
      icon: CheckCircle2
    },
    {
      step: '03',
      title: 'Request Data Deletion',
      description: 'Click on "Delete My Account & Data" button. You will be asked to confirm your decision.',
      icon: CheckCircle2
    },
    {
      step: '04',
      title: 'Confirm Your Identity',
      description: 'We will send a verification email to confirm your identity before processing the request.',
      icon: CheckCircle2
    },
    {
      step: '05',
      title: 'Deletion Complete',
      description: 'Your data will be permanently deleted within 30 days. You will receive confirmation via email.',
      icon: CheckCircle2
    }
  ];

  const dataTypes = [
    {
      title: 'Account Information',
      items: ['Email address', 'Name and profile details', 'Password (hashed)', 'Account preferences']
    },
    {
      title: 'Business Data',
      items: ['WhatsApp Business Account connections', 'Message templates', 'Contact lists', 'Campaign history']
    },
    {
      title: 'Communication Data',
      items: ['Message history', 'Conversation logs', 'Media files shared', 'Automation rules']
    },
    {
      title: 'Usage Data',
      items: ['Analytics and reports', 'Activity logs', 'Billing history', 'API usage records']
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Data Deletion Request - AiReatro" description="Request deletion of your personal data from AiReatro. Learn about our data retention policies and how to exercise your right to erasure." keywords={["data deletion", "right to erasure", "GDPR request", "delete account"]} canonical="/data-deletion" />
      <Navbar />

      {/* Hero */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-red-950/10 to-background" />
        <div className="absolute inset-0">
          <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-red-500/5 rounded-full blur-[100px]" />
        </div>
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto">
            <Breadcrumb className="mb-6" />
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium mb-6">
              <Trash2 className="w-4 h-4" />
              Data Deletion
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Data Deletion Instructions
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
              At AiReatro, we respect your right to control your personal data. In accordance with GDPR, CCPA, and other 
              data protection regulations, you have the right to request the deletion of your personal data from our systems. 
              This page provides step-by-step instructions on how to request data deletion.
            </p>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-foreground mb-8">How to Request Data Deletion</h2>
            <div className="space-y-6">
              {steps.map((step, index) => (
                <Card key={index} className="border-border/50">
                  <CardContent className="flex items-start gap-4 p-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-primary">{step.step}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
                      <p className="text-muted-foreground">{step.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Alternative Method */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <Card className="border-border/50">
              <CardContent className="p-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">Alternative: Email Request</h3>
                    <p className="text-muted-foreground mb-4">
                      If you cannot access your account or prefer to submit a request via email, you can send a 
                      data deletion request to our privacy team:
                    </p>
                    <p className="text-foreground font-medium mb-4">
                      Email: <a href="mailto:privacy@aireatro.com" className="text-primary hover:underline">privacy@aireatro.com</a>
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Please include your registered email address and any relevant account information to help us 
                      verify your identity and process your request.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* What Gets Deleted */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-foreground mb-8">What Data Will Be Deleted</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {dataTypes.map((type, index) => (
                <Card key={index} className="border-border/50">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-foreground mb-4">{type.title}</h3>
                    <ul className="space-y-2">
                      {type.items.map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-muted-foreground">
                          <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <Card className="border-border/50">
              <CardContent className="p-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">Processing Timeline</h3>
                    <ul className="space-y-3 text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
                        <span><strong>Within 48 hours:</strong> You will receive confirmation that we have received your request.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
                        <span><strong>Within 30 days:</strong> Your data will be permanently deleted from our active systems.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
                        <span><strong>Within 90 days:</strong> Your data will be removed from all backup systems.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Important Notes */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <Card className="border-orange-500/50 bg-orange-500/5">
              <CardContent className="p-8">
                <div className="flex items-start gap-4">
                  <AlertCircle className="w-6 h-6 text-orange-500 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-4">Important Notes</h3>
                    <ul className="space-y-3 text-muted-foreground">
                      <li>• Data deletion is <strong>permanent and irreversible</strong>. Once completed, your data cannot be recovered.</li>
                      <li>• If you have an active subscription, it will be cancelled without refund upon data deletion.</li>
                      <li>• Some data may be retained for legal compliance purposes (e.g., billing records for tax purposes).</li>
                      <li>• Data shared with third-party integrations (WhatsApp/Meta) is subject to their respective data policies.</li>
                      <li>• Team members you invited will lose access to the workspace, but their individual accounts will remain intact.</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">Questions?</h2>
            <p className="text-muted-foreground mb-6">
              If you have any questions about data deletion or your privacy rights, please contact our privacy team.
            </p>
            <Button asChild>
              <Link to="/contact">Contact Support</Link>
            </Button>
          </div>
        </div>
      </section>

      <div className="border-t border-border">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto text-center text-sm text-muted-foreground">
            <Link to="/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link>
            {' · '}
            <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>
            {' · '}
            <Link to="/" className="text-primary hover:underline">Home</Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
