import { Link } from 'react-router-dom';
import { ArrowLeft, Cookie, Settings, BarChart3, Shield, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function CookiePolicy() {
  const cookieTypes = [
    {
      icon: Shield,
      title: 'Essential Cookies',
      description: 'Required for the website to function properly. These cookies enable core functionality such as security, network management, and account access.',
      required: true,
      examples: ['Session cookies', 'Authentication cookies', 'Security tokens', 'Load balancing cookies']
    },
    {
      icon: Settings,
      title: 'Functional Cookies',
      description: 'Allow us to remember choices you make and provide enhanced, personalized features.',
      required: false,
      examples: ['Language preferences', 'Theme settings', 'Timezone settings', 'Recently viewed items']
    },
    {
      icon: BarChart3,
      title: 'Analytics Cookies',
      description: 'Help us understand how visitors interact with our website by collecting and reporting information anonymously.',
      required: false,
      examples: ['Page views', 'User journey tracking', 'Feature usage analytics', 'Error reporting']
    },
    {
      icon: Users,
      title: 'Marketing Cookies',
      description: 'Used to track visitors across websites to display relevant advertisements.',
      required: false,
      examples: ['Retargeting cookies', 'Ad performance tracking', 'Social media cookies', 'Conversion tracking']
    }
  ];

  const thirdParties = [
    { name: 'Google Analytics', purpose: 'Website analytics and performance monitoring', link: 'https://policies.google.com/privacy' },
    { name: 'Meta (Facebook)', purpose: 'WhatsApp Business API integration and OAuth', link: 'https://www.facebook.com/privacy/explanation' },
    { name: 'Stripe', purpose: 'Payment processing', link: 'https://stripe.com/privacy' },
    { name: 'Intercom', purpose: 'Customer support chat', link: 'https://www.intercom.com/legal/privacy' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-orange-950/10 to-background" />
        <div className="absolute inset-0">
          <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-orange-500/5 rounded-full blur-[100px]" />
        </div>
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto">
            <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-sm font-medium mb-6">
              <Cookie className="w-4 h-4" />
              Cookie Policy
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Cookie Policy
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
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold text-foreground">What Are Cookies?</h2>
            <p className="text-muted-foreground leading-relaxed">
              Cookies are small text files that are stored on your device when you visit a website. They are widely used 
              to make websites work more efficiently and provide information to website owners. We use cookies and similar 
              technologies to enhance your experience, analyze usage, and deliver personalized content.
            </p>
          </div>
        </div>
      </section>

      {/* Cookie Types */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-foreground mb-8">Types of Cookies We Use</h2>
            <div className="space-y-6">
              {cookieTypes.map((cookie, index) => (
                <Card key={index} className="border-border/50">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <cookie.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-foreground">{cookie.title}</h3>
                          {cookie.required && (
                            <span className="px-2 py-0.5 bg-green-500/10 text-green-600 text-xs font-medium rounded-full">
                              Required
                            </span>
                          )}
                        </div>
                        <p className="text-muted-foreground mb-4">{cookie.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {cookie.examples.map((example, i) => (
                            <span key={i} className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded">
                              {example}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Third Party Cookies */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-foreground mb-8">Third-Party Cookies</h2>
            <p className="text-muted-foreground mb-6">
              We may use third-party services that set their own cookies. These third parties have their own privacy policies:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Provider</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Purpose</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Privacy Policy</th>
                  </tr>
                </thead>
                <tbody>
                  {thirdParties.map((party, index) => (
                    <tr key={index} className="border-b border-border/50">
                      <td className="py-3 px-4 text-foreground">{party.name}</td>
                      <td className="py-3 px-4 text-muted-foreground">{party.purpose}</td>
                      <td className="py-3 px-4">
                        <a href={party.link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                          View Policy
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Managing Cookies */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold text-foreground">Managing Your Cookie Preferences</h2>
            <p className="text-muted-foreground">
              You can control and manage cookies in various ways:
            </p>
            <div className="space-y-4">
              <Card className="border-border/50">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-foreground mb-2">Browser Settings</h3>
                  <p className="text-muted-foreground">
                    Most browsers allow you to refuse or delete cookies. The method varies between browsers, so check your 
                    browser's help section for instructions. Note that blocking cookies may impact website functionality.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-foreground mb-2">Cookie Consent Banner</h3>
                  <p className="text-muted-foreground">
                    When you first visit our website, you can choose which cookie categories to accept or reject through 
                    our consent banner. You can change your preferences at any time through your account settings.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-foreground mb-2">Opt-Out Links</h3>
                  <p className="text-muted-foreground">
                    For certain third-party cookies, you can opt out directly through their platforms. For example, 
                    you can opt out of Google Analytics using the{' '}
                    <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      Google Analytics Opt-out Browser Add-on
                    </a>.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Updates */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold text-foreground">Changes to This Policy</h2>
            <p className="text-muted-foreground">
              We may update this Cookie Policy from time to time to reflect changes in our practices or for legal, 
              operational, or regulatory reasons. We will notify you of any material changes by posting the updated 
              policy on this page with a new "Last Updated" date.
            </p>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">Questions About Cookies?</h2>
            <p className="text-muted-foreground mb-6">
              If you have any questions about our use of cookies, please contact our privacy team.
            </p>
            <Button asChild>
              <a href="mailto:privacy@aireatro.com">Contact Privacy Team</a>
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
