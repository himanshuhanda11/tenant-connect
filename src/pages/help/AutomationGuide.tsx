import { Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Clock, 
  Zap, 
  Play,
  ArrowRight,
  MessageSquare,
  Tag,
  Users,
  Timer,
  Filter
} from 'lucide-react';
import { GuideCallout } from '@/components/help/GuideCallout';
import { CollapsibleSection } from '@/components/help/CollapsibleSection';
import { WhatsAppMessagePreview } from '@/components/help/WhatsAppMessagePreview';

export default function AutomationGuide() {
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
              <Badge variant="secondary">Advanced</Badge>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                12 min read
              </div>
            </div>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                <Zap className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">Automation Workflows</h1>
                <p className="text-lg text-muted-foreground">Automate repetitive tasks and create smart messaging workflows.</p>
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
            <CollapsibleSection title="What is Automation?" icon={<Zap className="h-5 w-5" />}>
              <Card>
                <CardContent className="p-6">
                  <p className="text-lg mb-4">
                    Automation lets you create <strong>rules that run automatically</strong> when 
                    certain events happen. No manual work needed!
                  </p>
                  
                  <p className="text-muted-foreground mb-6">
                    Think of it as having a helper that watches for specific triggers and 
                    takes action on your behalf – 24/7, without breaks.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="bg-muted/30">
                      <CardContent className="p-4">
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Play className="h-4 w-4 text-primary" />
                          Triggers
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Events that start the automation: new contact, keyword received, 
                          tag added, scheduled time.
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="bg-muted/30">
                      <CardContent className="p-4">
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Zap className="h-4 w-4 text-primary" />
                          Actions
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          What happens when triggered: send template, add tag, 
                          assign agent, call webhook.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </CollapsibleSection>

            {/* When to Use */}
            <CollapsibleSection title="Automation Use Cases" icon={<Clock className="h-5 w-5" />}>
              <Card>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                          <MessageSquare className="h-5 w-5 text-green-500" />
                        </div>
                        <div>
                          <p className="font-medium">Welcome Messages</p>
                          <p className="text-sm text-muted-foreground">
                            Greet new contacts instantly when they first message you
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                          <Timer className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                          <p className="font-medium">After-Hours Replies</p>
                          <p className="text-sm text-muted-foreground">
                            Auto-reply when your team is offline
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                          <Filter className="h-5 w-5 text-purple-500" />
                        </div>
                        <div>
                          <p className="font-medium">Keyword Responses</p>
                          <p className="text-sm text-muted-foreground">
                            Reply based on what customers type (e.g., "MENU", "HELP")
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0">
                          <Users className="h-5 w-5 text-orange-500" />
                        </div>
                        <div>
                          <p className="font-medium">Lead Routing</p>
                          <p className="text-sm text-muted-foreground">
                            Assign conversations to the right team member
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-pink-500/10 flex items-center justify-center shrink-0">
                          <Tag className="h-5 w-5 text-pink-500" />
                        </div>
                        <div>
                          <p className="font-medium">Auto-Tagging</p>
                          <p className="text-sm text-muted-foreground">
                            Apply tags based on customer behavior
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center shrink-0">
                          <Zap className="h-5 w-5 text-cyan-500" />
                        </div>
                        <div>
                          <p className="font-medium">Follow-Up Sequences</p>
                          <p className="text-sm text-muted-foreground">
                            Send timed messages after initial contact
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CollapsibleSection>

            {/* How it Works - Step by Step */}
            <CollapsibleSection title="Building an Automation" icon={<Play className="h-5 w-5" />}>
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
                        <h4 className="font-semibold">Choose a Trigger</h4>
                        <p className="text-muted-foreground mb-3">
                          What starts the automation?
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline">New Contact</Badge>
                          <Badge variant="outline">Keyword Received</Badge>
                          <Badge variant="outline">Tag Added</Badge>
                          <Badge variant="outline">Scheduled Time</Badge>
                          <Badge variant="outline">Inactivity</Badge>
                        </div>
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
                        <h4 className="font-semibold">Set Conditions (Optional)</h4>
                        <p className="text-muted-foreground">
                          Add filters to make the automation more targeted. 
                          Example: "Only if contact has tag 'VIP'".
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
                        <h4 className="font-semibold">Define Actions</h4>
                        <p className="text-muted-foreground mb-3">
                          What should happen when triggered?
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary">Send Template</Badge>
                          <Badge variant="secondary">Add Tag</Badge>
                          <Badge variant="secondary">Remove Tag</Badge>
                          <Badge variant="secondary">Assign Agent</Badge>
                          <Badge variant="secondary">Webhook</Badge>
                        </div>
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
                        <h4 className="font-semibold">Test Thoroughly</h4>
                        <p className="text-muted-foreground">
                          Before activating, test with a sample contact to make sure it works as expected.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">
                          5
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold">Activate!</h4>
                        <p className="text-muted-foreground">
                          Turn on your automation and let it work for you.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CollapsibleSection>

            {/* Real Examples */}
            <CollapsibleSection title="Real-World Examples" icon={<MessageSquare className="h-5 w-5" />}>
              <Card>
                <CardContent className="p-6 space-y-8">
                  {/* Example 1 */}
                  <div>
                    <h4 className="font-semibold mb-3">Example 1: Welcome New Contacts</h4>
                    <div className="bg-muted/30 p-4 rounded-lg mb-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                        <Badge variant="outline" className="text-xs">Trigger</Badge>
                        <span>New Contact Created</span>
                        <ArrowRight className="h-3 w-3" />
                        <Badge variant="secondary" className="text-xs">Action</Badge>
                        <span>Send Welcome Template</span>
                      </div>
                      <WhatsAppMessagePreview 
                        header="Welcome to ACME Store! 🎉"
                        message={`Hi there!\n\nThanks for reaching out. I'm here to help you find the perfect product.\n\nWhat are you looking for today?`}
                        buttons={["Browse Products", "Talk to Human"]}
                        status="delivered"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Every new contact gets an instant welcome message, even outside business hours.
                    </p>
                  </div>

                  {/* Example 2 */}
                  <div>
                    <h4 className="font-semibold mb-3">Example 2: Keyword Response - "MENU"</h4>
                    <div className="bg-muted/30 p-4 rounded-lg mb-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                        <Badge variant="outline" className="text-xs">Trigger</Badge>
                        <span>Keyword "MENU" received</span>
                        <ArrowRight className="h-3 w-3" />
                        <Badge variant="secondary" className="text-xs">Action</Badge>
                        <span>Send Menu Template</span>
                      </div>
                      <div className="space-y-2">
                        <WhatsAppMessagePreview 
                          message="MENU"
                          sender="customer"
                          time="3:15 PM"
                        />
                        <WhatsAppMessagePreview 
                          header="📋 Our Menu"
                          message={`Here's what we have today:\n\n🍕 Pizza - $12\n🍔 Burger - $8\n🥗 Salad - $6\n🍟 Fries - $4\n\nReply with the item name to order!`}
                          status="read"
                        />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Customers can type a keyword to get instant information.
                    </p>
                  </div>

                  {/* Example 3 */}
                  <div>
                    <h4 className="font-semibold mb-3">Example 3: VIP Lead Routing</h4>
                    <div className="bg-muted/30 p-4 rounded-lg mb-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                        <Badge variant="outline" className="text-xs">Trigger</Badge>
                        <span>Tag "VIP" Added</span>
                        <ArrowRight className="h-3 w-3" />
                        <Badge variant="secondary" className="text-xs">Action</Badge>
                        <span>Assign to Sales Manager</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      When a contact is tagged as VIP, they're automatically routed to your best agent.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </CollapsibleSection>

            {/* Common Mistakes */}
            <CollapsibleSection title="Common Mistakes to Avoid" icon={<Filter className="h-5 w-5" />}>
              <Card>
                <CardContent className="p-6 space-y-4">
                  <GuideCallout type="error">
                    <strong>Creating loops</strong> – 
                    An automation triggers another automation, which triggers the first one again. 
                    Always check for circular triggers.
                  </GuideCallout>
                  
                  <GuideCallout type="error">
                    <strong>Not testing first</strong> – 
                    Always test automations with a sample contact before going live. 
                    A broken automation can spam customers.
                  </GuideCallout>
                  
                  <GuideCallout type="error">
                    <strong>Too many messages</strong> – 
                    Don't create automations that send multiple messages in quick succession. 
                    It feels spammy.
                  </GuideCallout>
                  
                  <GuideCallout type="error">
                    <strong>Forgetting time conditions</strong> – 
                    A "Welcome" automation at 3 AM might not be appropriate. 
                    Consider adding time-based conditions.
                  </GuideCallout>
                </CardContent>
              </Card>
            </CollapsibleSection>

            {/* Tips */}
            <CollapsibleSection title="Tips for Success" icon={<Tag className="h-5 w-5" />}>
              <Card>
                <CardContent className="p-6 space-y-4">
                  <GuideCallout type="tip" title="Start Simple">
                    Begin with one automation (like a welcome message) and add complexity gradually.
                  </GuideCallout>
                  
                  <GuideCallout type="tip" title="Document Your Logic">
                    Write down what each automation does and why. Your future self will thank you.
                  </GuideCallout>
                  
                  <GuideCallout type="tip" title="Monitor Performance">
                    Check how often your automations run and their results. Adjust as needed.
                  </GuideCallout>
                  
                  <GuideCallout type="tip" title="Have a Manual Override">
                    Make it easy to pause automations quickly if something goes wrong.
                  </GuideCallout>
                  
                  <GuideCallout type="tip" title="Use Tags for Tracking">
                    Add a tag like "Welcome Sent" so you know which contacts have been through the flow.
                  </GuideCallout>
                </CardContent>
              </Card>
            </CollapsibleSection>

            {/* Related Guides */}
            <div className="pt-8 border-t">
              <h2 className="text-xl font-semibold mb-4">Related Guides</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link to="/help/templates">
                  <Card className="h-full hover:border-primary/50 transition-colors group">
                    <CardContent className="p-4">
                      <h3 className="font-medium group-hover:text-primary transition-colors">
                        WhatsApp Templates
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Create templates for automations
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
                        Use tags as automation triggers
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
                        See automation results in action
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            </div>

            {/* CTA */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-6 text-center">
                <h3 className="text-xl font-semibold mb-2">Ready to automate?</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first automation and save hours of manual work.
                </p>
                <Button asChild>
                  <Link to="/automation" className="gap-2">
                    Create Automation
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
