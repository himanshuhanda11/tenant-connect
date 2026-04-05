import { Link } from 'react-router-dom';
import { SEO } from '@/components/seo';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Breadcrumb from '@/components/layout/Breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Clock, Phone, Shield, Settings, Webhook, Signal, AlertTriangle, ArrowRight } from 'lucide-react';
import { GuideCallout } from '@/components/help/GuideCallout';
import { CollapsibleSection } from '@/components/help/CollapsibleSection';

export default function PhoneNumbersGuide() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO title="Phone Numbers Guide - AiReatro Help Center" description="Connect and manage WhatsApp Business phone numbers in AiReatro. Verification, quality ratings, and business profile setup." keywords={["phone numbers guide", "WhatsApp number setup", "business phone tutorial"]} canonical="/help/phone-numbers" noIndex />
      <Navbar />

      <section className="py-8 bg-muted/30 border-b">
        <div className="container mx-auto px-4">
          <Breadcrumb className="mb-4" />
          <div className="max-w-4xl mx-auto">
            <Link to="/help" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4">
              <ArrowLeft className="h-4 w-4" /> Back to Help Center
            </Link>
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="outline">Setup</Badge>
              <Badge variant="secondary">Beginner</Badge>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" /> 5 min read
              </div>
            </div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                <Phone className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">Phone Numbers Management</h1>
                <p className="text-lg text-muted-foreground">Connect, configure, and monitor your WhatsApp Business phone numbers.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-8">

            <CollapsibleSection title="Connecting a Phone Number" icon={<Phone className="h-5 w-5" />}>
              <Card>
                <CardContent className="p-6 space-y-4">
                  <p className="text-lg">Use Meta's Embedded Signup to connect your WhatsApp Business Account and phone number.</p>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
                      <span className="text-primary font-bold">1.</span>
                      <div><p className="font-medium">Click "Connect Number"</p><p className="text-sm text-muted-foreground">Navigate to Phone Numbers and click the connect button.</p></div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
                      <span className="text-primary font-bold">2.</span>
                      <div><p className="font-medium">Complete Meta Signup</p><p className="text-sm text-muted-foreground">Log in with your Facebook account and authorize WhatsApp Business access.</p></div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
                      <span className="text-primary font-bold">3.</span>
                      <div><p className="font-medium">Verify Your Number</p><p className="text-sm text-muted-foreground">Complete phone number verification via SMS or voice call.</p></div>
                    </div>
                  </div>
                  <GuideCallout type="warning" title="Important">Each phone number can only be connected to one WhatsApp Business Account at a time.</GuideCallout>
                </CardContent>
              </Card>
            </CollapsibleSection>

            <CollapsibleSection title="Quality Rating" icon={<Signal className="h-5 w-5" />}>
              <Card>
                <CardContent className="p-6 space-y-4">
                  <p>Meta assigns a quality rating based on how recipients react to your messages:</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-emerald-500/10 rounded-lg text-center">
                      <p className="font-bold text-emerald-600 mb-1">🟢 Green</p>
                      <p className="text-sm text-muted-foreground">High quality. No issues. Full messaging limits.</p>
                    </div>
                    <div className="p-4 bg-amber-500/10 rounded-lg text-center">
                      <p className="font-bold text-amber-600 mb-1">🟡 Yellow</p>
                      <p className="text-sm text-muted-foreground">Warning. Some users blocked/reported your messages.</p>
                    </div>
                    <div className="p-4 bg-red-500/10 rounded-lg text-center">
                      <p className="font-bold text-red-600 mb-1">🔴 Red</p>
                      <p className="text-sm text-muted-foreground">Low quality. Messaging limits reduced. Risk of restriction.</p>
                    </div>
                  </div>
                  <GuideCallout type="tip" title="Pro Tip">Send relevant, expected messages and always honor opt-outs to maintain a green rating.</GuideCallout>
                </CardContent>
              </Card>
            </CollapsibleSection>

            <CollapsibleSection title="Messaging Limits" icon={<AlertTriangle className="h-5 w-5" />}>
              <Card>
                <CardContent className="p-6 space-y-4">
                  <p>Meta controls how many unique users you can message per 24 hours:</p>
                  <div className="space-y-3">
                    {[
                      { tier: 'Tier 1', limit: '1,000 unique users/day' },
                      { tier: 'Tier 2', limit: '10,000 unique users/day' },
                      { tier: 'Tier 3', limit: '100,000 unique users/day' },
                      { tier: 'Unlimited', limit: 'No daily cap' },
                    ].map(t => (
                      <div key={t.tier} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <p className="font-medium">{t.tier}</p>
                        <p className="text-sm text-muted-foreground">{t.limit}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">Tiers upgrade automatically when you maintain good quality and increasing volume.</p>
                </CardContent>
              </Card>
            </CollapsibleSection>

            <CollapsibleSection title="Webhook Health" icon={<Webhook className="h-5 w-5" />}>
              <Card>
                <CardContent className="p-6 space-y-4">
                  <p>Webhooks deliver real-time message events (sent, delivered, read) from Meta to your platform.</p>
                  <div className="space-y-3">
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <p className="font-medium">Healthy</p>
                      <p className="text-sm text-muted-foreground">Webhooks are receiving events normally. Last event within the last few minutes.</p>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <p className="font-medium">Degraded</p>
                      <p className="text-sm text-muted-foreground">Some events may be delayed. Check your webhook URL configuration.</p>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <p className="font-medium">Down</p>
                      <p className="text-sm text-muted-foreground">No events received recently. Reconnect or check Meta's webhook settings.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CollapsibleSection>

            <CollapsibleSection title="Number Settings" icon={<Settings className="h-5 w-5" />}>
              <Card>
                <CardContent className="p-6 space-y-4">
                  <p>Configure each phone number's display name, business profile, and default behavior.</p>
                  <div className="space-y-3">
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <p className="font-medium">Display Name</p>
                      <p className="text-sm text-muted-foreground">The name shown to customers when they receive your messages.</p>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <p className="font-medium">Default Number</p>
                      <p className="text-sm text-muted-foreground">Set one number as default for campaigns and automations.</p>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <p className="font-medium">Test Messages</p>
                      <p className="text-sm text-muted-foreground">Send test messages within a 24-hour service window to verify connectivity.</p>
                    </div>
                  </div>
                  <GuideCallout type="info" title="Reconnect">If your access token expires, use the Reconnect button to re-authenticate with Meta.</GuideCallout>
                </CardContent>
              </Card>
            </CollapsibleSection>

            <div className="flex items-center justify-between pt-8 border-t">
              <Link to="/help" className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" /> Back to Help Center
              </Link>
              <Link to="/help/templates">
                <Button variant="outline" className="gap-2">Templates Guide <ArrowRight className="h-4 w-4" /></Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
