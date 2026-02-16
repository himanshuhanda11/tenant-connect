import { Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Breadcrumb from '@/components/layout/Breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Clock, Send, Users, BarChart3, Calendar, FileText, Settings, ArrowRight } from 'lucide-react';
import { GuideCallout } from '@/components/help/GuideCallout';
import { CollapsibleSection } from '@/components/help/CollapsibleSection';

export default function CampaignsGuide() {
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
              <Badge variant="outline">Marketing</Badge>
              <Badge variant="secondary">Intermediate</Badge>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" /> 8 min read
              </div>
            </div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                <Send className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">Campaigns & Bulk Messaging</h1>
                <p className="text-lg text-muted-foreground">Send targeted WhatsApp broadcasts, schedule deliveries, and track results.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-8">

            <CollapsibleSection title="What are Campaigns?" icon={<Send className="h-5 w-5" />}>
              <Card>
                <CardContent className="p-6 space-y-4">
                  <p className="text-lg">Campaigns let you send <strong>bulk WhatsApp messages</strong> to a targeted audience using approved templates.</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
                      <Users className="h-5 w-5 text-primary mt-0.5" />
                      <div><p className="font-medium">Targeted Audience</p><p className="text-sm text-muted-foreground">Select by tags, segments, or CSV upload</p></div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
                      <Calendar className="h-5 w-5 text-primary mt-0.5" />
                      <div><p className="font-medium">Schedule Delivery</p><p className="text-sm text-muted-foreground">Send now or schedule for later</p></div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
                      <BarChart3 className="h-5 w-5 text-primary mt-0.5" />
                      <div><p className="font-medium">Track Results</p><p className="text-sm text-muted-foreground">Monitor delivery, read, and reply rates</p></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CollapsibleSection>

            <CollapsibleSection title="Creating a Campaign" icon={<FileText className="h-5 w-5" />}>
              <Card>
                <CardContent className="p-6 space-y-4">
                  <p>Follow these steps to create and send your first campaign:</p>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
                      <span className="text-primary font-bold">1.</span>
                      <div><p className="font-medium">Select a Template</p><p className="text-sm text-muted-foreground">Choose from your approved WhatsApp templates. Only Meta-approved templates can be used.</p></div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
                      <span className="text-primary font-bold">2.</span>
                      <div><p className="font-medium">Define Your Audience</p><p className="text-sm text-muted-foreground">Pick contacts by tags, segments, or upload a CSV file with phone numbers.</p></div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
                      <span className="text-primary font-bold">3.</span>
                      <div><p className="font-medium">Set Variables & Media</p><p className="text-sm text-muted-foreground">Fill in template variables (e.g., customer name) and attach header media if needed.</p></div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
                      <span className="text-primary font-bold">4.</span>
                      <div><p className="font-medium">Schedule or Send</p><p className="text-sm text-muted-foreground">Send immediately or schedule for a specific date/time with timezone support.</p></div>
                    </div>
                  </div>
                  <GuideCallout type="warning" title="Important">You can only use Meta-approved templates. Draft or rejected templates cannot be used in campaigns.</GuideCallout>
                </CardContent>
              </Card>
            </CollapsibleSection>

            <CollapsibleSection title="A/B Testing" icon={<BarChart3 className="h-5 w-5" />}>
              <Card>
                <CardContent className="p-6 space-y-4">
                  <p>Test different templates or messages to optimize engagement:</p>
                  <div className="space-y-3">
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <p className="font-medium">Split Your Audience</p>
                      <p className="text-sm text-muted-foreground">Divide recipients into variant groups (e.g., 50/50 or 70/30).</p>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <p className="font-medium">Compare Metrics</p>
                      <p className="text-sm text-muted-foreground">Track delivery rate, read rate, and reply rate per variant.</p>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <p className="font-medium">Pick a Winner</p>
                      <p className="text-sm text-muted-foreground">Choose the best-performing variant based on your selected metric.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CollapsibleSection>

            <CollapsibleSection title="Delivery Settings & Safety" icon={<Settings className="h-5 w-5" />}>
              <Card>
                <CardContent className="p-6 space-y-4">
                  <p>Configure throttling and safety controls to protect your sender reputation:</p>
                  <div className="space-y-3">
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <p className="font-medium">Throttle Rate</p>
                      <p className="text-sm text-muted-foreground">Control messages per minute/hour to stay within Meta's rate limits.</p>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <p className="font-medium">Frequency Capping</p>
                      <p className="text-sm text-muted-foreground">Prevent sending to the same contact more than once within a set number of days.</p>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <p className="font-medium">Quiet Hours</p>
                      <p className="text-sm text-muted-foreground">Avoid sending during specific hours (e.g., late night). Messages are queued and sent during active hours.</p>
                    </div>
                  </div>
                  <GuideCallout type="tip" title="Best Practice">Start with a lower throttle rate (10-20 msgs/min) and increase gradually as your quality rating stays green.</GuideCallout>
                </CardContent>
              </Card>
            </CollapsibleSection>

            <CollapsibleSection title="Campaign Analytics" icon={<BarChart3 className="h-5 w-5" />}>
              <Card>
                <CardContent className="p-6 space-y-4">
                  <p>Track every campaign's performance in real time:</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {['Sent', 'Delivered', 'Read', 'Replied'].map(metric => (
                      <div key={metric} className="p-3 bg-muted/30 rounded-lg text-center">
                        <p className="text-sm font-medium">{metric}</p>
                        <p className="text-xs text-muted-foreground">Track {metric.toLowerCase()} count & rate</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-muted-foreground">View hourly snapshots, export detailed reports, and compare performance across campaigns.</p>
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
