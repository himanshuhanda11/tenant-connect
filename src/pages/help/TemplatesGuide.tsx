import { Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Clock, 
  FileText, 
  CheckCircle,
  XCircle,
  AlertTriangle,
  Send,
  ArrowRight
} from 'lucide-react';
import { GuideCallout } from '@/components/help/GuideCallout';
import { CollapsibleSection } from '@/components/help/CollapsibleSection';
import { WhatsAppMessagePreview } from '@/components/help/WhatsAppMessagePreview';

export default function TemplatesGuide() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      {/* Header */}
      <section className="py-8 bg-muted/30 border-b">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Link 
              to="/help"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Help Center
            </Link>
            
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="outline">Marketing</Badge>
              <Badge variant="secondary">Beginner</Badge>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                8 min read
              </div>
            </div>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                <FileText className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">WhatsApp Message Templates</h1>
                <p className="text-lg text-muted-foreground">Learn how to create, submit, and manage templates for outbound messaging.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-8">
            
            {/* What is this? */}
            <CollapsibleSection title="What are Templates?" icon={<FileText className="h-5 w-5" />}>
              <Card>
                <CardContent className="p-6">
                  <p className="text-lg mb-4">
                    Templates are <strong>pre-approved message formats</strong> required by WhatsApp 
                    to send outbound messages to customers.
                  </p>
                  
                  <GuideCallout type="info" title="Why Templates?">
                    WhatsApp requires templates to prevent spam and protect users. 
                    Every promotional, transactional, or notification message must use an approved template.
                  </GuideCallout>

                  <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-muted/30">
                      <CardContent className="p-4 text-center">
                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-2">
                          <span className="text-lg">📦</span>
                        </div>
                        <p className="font-medium">Utility</p>
                        <p className="text-xs text-muted-foreground">Order updates, confirmations</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-muted/30">
                      <CardContent className="p-4 text-center">
                        <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto mb-2">
                          <span className="text-lg">📣</span>
                        </div>
                        <p className="font-medium">Marketing</p>
                        <p className="text-xs text-muted-foreground">Promotions, offers, announcements</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-muted/30">
                      <CardContent className="p-4 text-center">
                        <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-2">
                          <span className="text-lg">🔐</span>
                        </div>
                        <p className="font-medium">Authentication</p>
                        <p className="text-xs text-muted-foreground">OTPs, verification codes</p>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </CollapsibleSection>

            {/* When to Use */}
            <CollapsibleSection title="When Should I Use Templates?" icon={<Clock className="h-5 w-5" />}>
              <Card>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-3 text-primary">Use Templates For:</h4>
                      <ul className="space-y-2">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>Order confirmations and updates</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>Promotional messages and offers</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>Appointment reminders</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>OTP and verification codes</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>Follow-ups after 24 hours</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>Bulk campaign messages</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3 text-muted-foreground">You Don't Need Templates For:</h4>
                      <ul className="space-y-2 text-muted-foreground">
                        <li className="flex items-center gap-2">
                          <span className="w-4 h-4 rounded-full border-2 border-current" />
                          <span>Replies within 24-hour window</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-4 h-4 rounded-full border-2 border-current" />
                          <span>Customer-initiated conversations</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-4 h-4 rounded-full border-2 border-current" />
                          <span>Direct responses to customer questions</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CollapsibleSection>

            {/* How it Works - Step by Step */}
            <CollapsibleSection title="How Template Approval Works" icon={<CheckCircle className="h-5 w-5" />}>
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                          1
                        </div>
                        <div className="w-0.5 h-full bg-border mt-2" />
                      </div>
                      <div className="pb-8">
                        <h4 className="font-semibold">Create a Draft</h4>
                        <p className="text-muted-foreground">
                          Design your template with header, body, footer, and buttons. 
                          Use variables like {"{{1}}"} for personalization.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                          2
                        </div>
                        <div className="w-0.5 h-full bg-border mt-2" />
                      </div>
                      <div className="pb-8">
                        <h4 className="font-semibold">Internal Review (Optional)</h4>
                        <p className="text-muted-foreground">
                          Get approval from your team manager before submitting to Meta.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                          3
                        </div>
                        <div className="w-0.5 h-full bg-border mt-2" />
                      </div>
                      <div className="pb-8">
                        <h4 className="font-semibold">Submit to Meta</h4>
                        <p className="text-muted-foreground">
                          Send the template for WhatsApp review. Make sure all variable examples are filled in.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                          4
                        </div>
                        <div className="w-0.5 h-full bg-border mt-2" />
                      </div>
                      <div className="pb-8">
                        <h4 className="font-semibold">Wait for Review</h4>
                        <p className="text-muted-foreground">
                          Meta reviews within 24-48 hours (usually faster for simple templates).
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white">
                          <CheckCircle className="h-5 w-5" />
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold">Approved!</h4>
                        <p className="text-muted-foreground">
                          Your template is ready to use. If rejected, fix the issues and resubmit.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CollapsibleSection>

            {/* Examples */}
            <CollapsibleSection title="Template Examples" icon={<Send className="h-5 w-5" />}>
              <Card>
                <CardContent className="p-6 space-y-6">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <h4 className="font-semibold text-green-700">Good Example: Order Confirmation</h4>
                    </div>
                    <div className="bg-muted/30 p-4 rounded-lg">
                      <WhatsAppMessagePreview 
                        header="Order Confirmed! 🎉"
                        message={`Hi {{1}},\n\nYour order #{{2}} has been confirmed!\n\nItems: {{3}}\nTotal: {{4}}\n\nTrack your order anytime.`}
                        footer="Reply STOP to unsubscribe"
                        buttons={["Track Order", "Contact Support"]}
                        status="delivered"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      ✓ Clear purpose • ✓ Proper variables • ✓ Professional tone • ✓ Call-to-action buttons
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <XCircle className="h-5 w-5 text-destructive" />
                      <h4 className="font-semibold text-destructive">Bad Example: Spammy Promotion</h4>
                    </div>
                    <div className="bg-destructive/5 p-4 rounded-lg">
                      <WhatsAppMessagePreview 
                        message={`GUARANTEED FREE MONEY!!! 💰💰💰\n\nYou have WON a prize! Click NOW to claim your GUARANTEED reward!!!\n\nLIMITED TIME ONLY!!!`}
                        status="sent"
                      />
                    </div>
                    <p className="text-sm text-destructive mt-2">
                      ✗ Uses banned words • ✗ Misleading claims • ✗ Excessive punctuation • ✗ ALL CAPS
                    </p>
                  </div>
                </CardContent>
              </Card>
            </CollapsibleSection>

            {/* Common Mistakes */}
            <CollapsibleSection title="Common Mistakes (Why Templates Get Rejected)" icon={<AlertTriangle className="h-5 w-5" />}>
              <Card>
                <CardContent className="p-6 space-y-4">
                  <GuideCallout type="error">
                    <strong>Using promotional language in Utility templates</strong> – 
                    If your message promotes a product/service, it must be Marketing category.
                  </GuideCallout>
                  
                  <GuideCallout type="error">
                    <strong>Banned words</strong> – 
                    Avoid: "free money", "guaranteed", "100% success", "instant cash", "winner".
                  </GuideCallout>
                  
                  <GuideCallout type="error">
                    <strong>Misleading job or visa promises</strong> – 
                    WhatsApp strictly prohibits fake job offers or immigration scams.
                  </GuideCallout>
                  
                  <GuideCallout type="error">
                    <strong>Incorrect variable formatting</strong> – 
                    Use {"{{1}}"}, {"{{2}}"} format. Not {"{name}"} or {"[name]"}.
                  </GuideCallout>
                  
                  <GuideCallout type="error">
                    <strong>Missing variable examples</strong> – 
                    Always provide realistic sample values for each variable.
                  </GuideCallout>
                  
                  <GuideCallout type="error">
                    <strong>Button URLs without https://</strong> – 
                    All URLs must start with https://
                  </GuideCallout>
                </CardContent>
              </Card>
            </CollapsibleSection>

            {/* Tips */}
            <CollapsibleSection title="Tips for Approval" icon={<CheckCircle className="h-5 w-5" />}>
              <Card>
                <CardContent className="p-6 space-y-4">
                  <GuideCallout type="tip" title="Keep Language Simple">
                    Write like you're talking to a friend. Avoid jargon and complex sentences.
                  </GuideCallout>
                  
                  <GuideCallout type="tip" title="Add Realistic Examples">
                    Use real-looking sample data: "John" not "Name", "$49.99" not "Price".
                  </GuideCallout>
                  
                  <GuideCallout type="tip" title="Choose the Right Category">
                    Marketing = promotional content. Utility = transactional updates.
                    When in doubt, choose Marketing.
                  </GuideCallout>
                  
                  <GuideCallout type="tip" title="Avoid ALL CAPS">
                    Use normal capitalization. ALL CAPS feels like shouting and triggers rejections.
                  </GuideCallout>
                  
                  <GuideCallout type="tip" title="Include Opt-Out">
                    For marketing templates, add "Reply STOP to unsubscribe" in the footer.
                  </GuideCallout>
                  
                  <GuideCallout type="tip" title="Test Before Submitting">
                    Preview your template and check for typos, broken formatting, and clarity.
                  </GuideCallout>
                </CardContent>
              </Card>
            </CollapsibleSection>

            {/* Related Guides */}
            <div className="pt-8 border-t">
              <h2 className="text-xl font-semibold mb-4">Related Guides</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link to="/help/automation">
                  <Card className="h-full hover:border-primary/50 transition-colors group">
                    <CardContent className="p-4">
                      <h3 className="font-medium group-hover:text-primary transition-colors">
                        Automation Workflows
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Trigger templates automatically
                      </p>
                    </CardContent>
                  </Card>
                </Link>
                <Link to="/help/inbox">
                  <Card className="h-full hover:border-primary/50 transition-colors group">
                    <CardContent className="p-4">
                      <h3 className="font-medium group-hover:text-primary transition-colors">
                        Managing Your Inbox
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Send templates in conversations
                      </p>
                    </CardContent>
                  </Card>
                </Link>
                <Link to="/help/contacts-tags">
                  <Card className="h-full hover:border-primary/50 transition-colors group">
                    <CardContent className="p-4">
                      <h3 className="font-medium group-hover:text-primary transition-colors">
                        Contacts & Tags
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Target templates by audience
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            </div>

            {/* CTA */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-6 text-center">
                <h3 className="text-xl font-semibold mb-2">Ready to create your first template?</h3>
                <p className="text-muted-foreground mb-4">
                  Head to Templates and start designing your message.
                </p>
                <Button asChild>
                  <Link to="/templates" className="gap-2">
                    Create Template
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
