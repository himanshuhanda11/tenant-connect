import { Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Breadcrumb from '@/components/layout/Breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Clock, FileText, MessageSquare, Search, Tag, Globe, QrCode, Zap, Shield, ArrowRight } from 'lucide-react';
import { GuideCallout } from '@/components/help/GuideCallout';
import { CollapsibleSection } from '@/components/help/CollapsibleSection';

export default function FormRulesGuide() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <section className="py-8 bg-muted/30 border-b">
        <div className="container mx-auto px-4">
          <Breadcrumb className="mb-4" />
          <div className="max-w-4xl mx-auto">
            <Link to="/help" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4">
              <ArrowLeft className="h-4 w-4" /> Back to Help Center
            </Link>
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="outline">Automation</Badge>
              <Badge variant="secondary">Advanced</Badge>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" /> 6 min read
              </div>
            </div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                <FileText className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">Auto-Form Rules</h1>
                <p className="text-lg text-muted-foreground">Automatically send WhatsApp Forms based on triggers like keywords, ad clicks, or tags.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-8">

            <CollapsibleSection title="What are Auto-Form Rules?" icon={<FileText className="h-5 w-5" />}>
              <Card>
                <CardContent className="p-6 space-y-4">
                  <p className="text-lg">Auto-Form Rules let you <strong>automatically send WhatsApp Forms</strong> to contacts based on specific triggers — like when they send their first message, click an ad, or match a keyword.</p>
                  <p className="text-muted-foreground">This helps you capture leads, collect information, and qualify contacts without manual intervention.</p>
                  <GuideCallout type="info" title="Availability">Auto-Form Rules are available on Basic plan and above.</GuideCallout>
                </CardContent>
              </Card>
            </CollapsibleSection>

            <CollapsibleSection title="Trigger Types" icon={<Zap className="h-5 w-5" />}>
              <Card>
                <CardContent className="p-6 space-y-4">
                  <p>Choose from 8 trigger types to determine when your form is sent:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { icon: MessageSquare, name: 'First Message', desc: 'When a contact sends their first-ever message' },
                      { icon: Search, name: 'Keyword', desc: 'When a message matches specific keywords' },
                      { icon: Globe, name: 'Ad Click (CTWA)', desc: 'When someone clicks a Click-to-WhatsApp ad' },
                      { icon: QrCode, name: 'QR Scan', desc: 'When someone scans your WhatsApp QR code' },
                      { icon: Globe, name: 'Source', desc: 'Based on the contact\'s acquisition source' },
                      { icon: Tag, name: 'Tag Added', desc: 'When a specific tag is added to a contact' },
                      { icon: Clock, name: 'Scheduled', desc: 'At a specific time or recurring schedule' },
                      { icon: Zap, name: 'AI Intent', desc: 'When AI detects a specific customer intent' },
                    ].map(trigger => (
                      <div key={trigger.name} className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
                        <trigger.icon className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <div><p className="font-medium">{trigger.name}</p><p className="text-sm text-muted-foreground">{trigger.desc}</p></div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </CollapsibleSection>

            <CollapsibleSection title="Creating a Rule (5-Step Wizard)" icon={<FileText className="h-5 w-5" />}>
              <Card>
                <CardContent className="p-6 space-y-4">
                  <p>The rule creation wizard guides you through 5 steps:</p>
                  <div className="space-y-3">
                    {[
                      { step: 'WHEN', desc: 'Select the trigger type and configure trigger-specific settings.' },
                      { step: 'IF', desc: 'Add optional conditions (e.g., only if contact has a specific tag or attribute).' },
                      { step: 'THEN', desc: 'Choose which WhatsApp Form to send and configure the message.' },
                      { step: 'SAFETY', desc: 'Set cooldown periods, rate limits, and duplicate prevention rules.' },
                      { step: 'REVIEW', desc: 'Preview the complete rule configuration and activate it.' },
                    ].map((item, i) => (
                      <div key={item.step} className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
                        <span className="text-primary font-bold">{i + 1}.</span>
                        <div><p className="font-medium">{item.step}</p><p className="text-sm text-muted-foreground">{item.desc}</p></div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </CollapsibleSection>

            <CollapsibleSection title="Safety & Guardrails" icon={<Shield className="h-5 w-5" />}>
              <Card>
                <CardContent className="p-6 space-y-4">
                  <p>Protect against spam and ensure a great customer experience:</p>
                  <div className="space-y-3">
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <p className="font-medium">Cooldown Period</p>
                      <p className="text-sm text-muted-foreground">Prevent the same form from being sent to a contact within a specified time window.</p>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <p className="font-medium">Rate Limiting</p>
                      <p className="text-sm text-muted-foreground">Limit how many forms can be sent per contact per day across all rules.</p>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <p className="font-medium">Duplicate Prevention</p>
                      <p className="text-sm text-muted-foreground">Automatically skip if the contact already received the same form recently.</p>
                    </div>
                  </div>
                  <GuideCallout type="tip" title="Best Practice">Set a minimum 24-hour cooldown to avoid overwhelming your contacts.</GuideCallout>
                </CardContent>
              </Card>
            </CollapsibleSection>

            <div className="flex items-center justify-between pt-8 border-t">
              <Link to="/help" className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" /> Back to Help Center
              </Link>
              <Link to="/help/automation">
                <Button variant="outline" className="gap-2">Automation Guide <ArrowRight className="h-4 w-4" /></Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
