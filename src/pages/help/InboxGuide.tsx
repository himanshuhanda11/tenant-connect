import { Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Clock, 
  Inbox, 
  MessageSquare, 
  Users, 
  Tag,
  Search,
  Filter,
  Send,
  ArrowRight
} from 'lucide-react';
import { GuideCallout } from '@/components/help/GuideCallout';
import { CollapsibleSection } from '@/components/help/CollapsibleSection';
import { WhatsAppMessagePreview } from '@/components/help/WhatsAppMessagePreview';

export default function InboxGuide() {
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
              <Badge variant="outline">Messaging</Badge>
              <Badge variant="secondary">Beginner</Badge>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                6 min read
              </div>
            </div>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                <Inbox className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">Managing Your Inbox</h1>
                <p className="text-lg text-muted-foreground">Master the central inbox to handle all customer conversations efficiently.</p>
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
            <CollapsibleSection title="What is the Inbox?" icon={<Inbox className="h-5 w-5" />}>
              <Card>
                <CardContent className="p-6">
                  <p className="text-lg mb-4">
                    The Inbox is your <strong>central hub</strong> for managing all WhatsApp conversations. 
                    Think of it as your email inbox, but for WhatsApp messages.
                  </p>
                  <p className="text-muted-foreground mb-4">
                    It displays messages from all connected phone numbers in one place, allowing your team 
                    to respond quickly and efficiently to customers.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
                      <MessageSquare className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">All Conversations</p>
                        <p className="text-sm text-muted-foreground">See every chat in one place</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
                      <Users className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Team Collaboration</p>
                        <p className="text-sm text-muted-foreground">Assign chats to teammates</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
                      <Tag className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Organization</p>
                        <p className="text-sm text-muted-foreground">Tag and filter conversations</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CollapsibleSection>

            {/* When to Use */}
            <CollapsibleSection title="When Should I Use the Inbox?" icon={<Clock className="h-5 w-5" />}>
              <Card>
                <CardContent className="p-6">
                  <p className="mb-4">Use the Inbox whenever you need to:</p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-xs font-semibold text-primary">1</span>
                      </div>
                      <div>
                        <p className="font-medium">Respond to customer inquiries</p>
                        <p className="text-sm text-muted-foreground">Answer questions, provide support, solve problems</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-xs font-semibold text-primary">2</span>
                      </div>
                      <div>
                        <p className="font-medium">Follow up on leads</p>
                        <p className="text-sm text-muted-foreground">Continue conversations with potential customers</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-xs font-semibold text-primary">3</span>
                      </div>
                      <div>
                        <p className="font-medium">Send templates and quick replies</p>
                        <p className="text-sm text-muted-foreground">Use pre-approved messages for common situations</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-xs font-semibold text-primary">4</span>
                      </div>
                      <div>
                        <p className="font-medium">Assign conversations to team members</p>
                        <p className="text-sm text-muted-foreground">Route chats to the right person</p>
                      </div>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </CollapsibleSection>

            {/* How it Works */}
            <CollapsibleSection title="How the Inbox Works" icon={<MessageSquare className="h-5 w-5" />}>
              <Card>
                <CardContent className="p-6 space-y-6">
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Search className="h-4 w-4 text-primary" />
                      Conversation List
                    </h4>
                    <p className="text-muted-foreground">
                      The left panel shows all active chats sorted by recent activity. 
                      Unread messages appear at the top with a badge showing the count.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-primary" />
                      Message Thread
                    </h4>
                    <p className="text-muted-foreground mb-4">
                      Click on any conversation to see the full message history. 
                      You can scroll up to see older messages.
                    </p>
                    <div className="bg-muted/30 p-4 rounded-lg space-y-3">
                      <WhatsAppMessagePreview 
                        message="Hi! I'm interested in your product. Can you tell me more?"
                        sender="customer"
                        time="10:28 AM"
                      />
                      <WhatsAppMessagePreview 
                        message="Hello! 👋 Thanks for reaching out. I'd be happy to help! What would you like to know?"
                        sender="business"
                        time="10:30 AM"
                        status="read"
                      />
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      Contact Panel
                    </h4>
                    <p className="text-muted-foreground">
                      The right panel shows customer details, tags, notes, and timeline. 
                      Use this to get context before responding.
                    </p>
                  </div>

                  <GuideCallout type="warning" title="24-Hour Messaging Window">
                    After a customer messages you, you have 24 hours to reply freely. 
                    After that, you can only send approved templates.
                  </GuideCallout>
                </CardContent>
              </Card>
            </CollapsibleSection>

            {/* Real Examples */}
            <CollapsibleSection title="Real-World Examples" icon={<Send className="h-5 w-5" />}>
              <Card>
                <CardContent className="p-6 space-y-6">
                  <div>
                    <h4 className="font-semibold mb-3">Customer Support Conversation</h4>
                    <div className="bg-muted/30 p-4 rounded-lg space-y-3">
                      <WhatsAppMessagePreview 
                        message="My order #12345 hasn't arrived yet. It's been 5 days!"
                        sender="customer"
                        time="2:15 PM"
                      />
                      <WhatsAppMessagePreview 
                        message="I'm sorry to hear that! Let me check on your order right away. Give me just a moment. 🔍"
                        sender="business"
                        time="2:17 PM"
                        status="delivered"
                      />
                      <WhatsAppMessagePreview 
                        message="I found it! Your order is with the courier and will be delivered tomorrow by 6 PM. I've also added a 10% discount to your next order for the inconvenience. 🎁"
                        sender="business"
                        time="2:20 PM"
                        status="read"
                      />
                    </div>
                  </div>

                  <GuideCallout type="tip" title="Pro Tip">
                    Use emojis sparingly to add warmth to your messages. They make conversations feel more personal! 😊
                  </GuideCallout>
                </CardContent>
              </Card>
            </CollapsibleSection>

            {/* Common Mistakes */}
            <CollapsibleSection title="Common Mistakes to Avoid" icon={<Filter className="h-5 w-5" />}>
              <Card>
                <CardContent className="p-6 space-y-4">
                  <GuideCallout type="error">
                    <strong>Slow response times</strong> – Customers expect quick replies on WhatsApp. 
                    Aim to respond within 5 minutes during business hours.
                  </GuideCallout>
                  
                  <GuideCallout type="error">
                    <strong>Ignoring the 24-hour window</strong> – If you wait too long, you won't be 
                    able to message the customer without a template.
                  </GuideCallout>
                  
                  <GuideCallout type="error">
                    <strong>Not using tags</strong> – Without proper organization, important 
                    conversations get lost in the shuffle.
                  </GuideCallout>
                  
                  <GuideCallout type="error">
                    <strong>Forgetting to add notes</strong> – When handing off to a teammate, 
                    they need context to continue the conversation smoothly.
                  </GuideCallout>
                </CardContent>
              </Card>
            </CollapsibleSection>

            {/* Tips */}
            <CollapsibleSection title="Tips for Success" icon={<Tag className="h-5 w-5" />}>
              <Card>
                <CardContent className="p-6 space-y-4">
                  <GuideCallout type="tip" title="Use Keyboard Shortcuts">
                    Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Enter</kbd> to send, 
                    <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs ml-1">Shift+Enter</kbd> for new line.
                  </GuideCallout>
                  
                  <GuideCallout type="tip" title="Set Up Quick Replies">
                    Create templates for common questions like pricing, hours, and FAQs to save time.
                  </GuideCallout>
                  
                  <GuideCallout type="tip" title="Tag Consistently">
                    Create a tagging system your whole team follows. Example: "VIP", "Hot Lead", "Support".
                  </GuideCallout>
                  
                  <GuideCallout type="tip" title="Use Filters">
                    Filter by assigned agent, tags, or status to focus on what matters most.
                  </GuideCallout>
                </CardContent>
              </Card>
            </CollapsibleSection>

            {/* Related Guides */}
            <div className="pt-8 border-t">
              <h2 className="text-xl font-semibold mb-4">Related Guides</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link to="/help/contacts-tags">
                  <Card className="h-full hover:border-primary/50 transition-colors group">
                    <CardContent className="p-4">
                      <h3 className="font-medium group-hover:text-primary transition-colors">
                        Contacts & Tags
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Organize your customer database
                      </p>
                    </CardContent>
                  </Card>
                </Link>
                <Link to="/help/templates">
                  <Card className="h-full hover:border-primary/50 transition-colors group">
                    <CardContent className="p-4">
                      <h3 className="font-medium group-hover:text-primary transition-colors">
                        WhatsApp Templates
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Create approved message templates
                      </p>
                    </CardContent>
                  </Card>
                </Link>
                <Link to="/help/automation">
                  <Card className="h-full hover:border-primary/50 transition-colors group">
                    <CardContent className="p-4">
                      <h3 className="font-medium group-hover:text-primary transition-colors">
                        Automation Workflows
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Automate repetitive tasks
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            </div>

            {/* CTA */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-6 text-center">
                <h3 className="text-xl font-semibold mb-2">Ready to get started?</h3>
                <p className="text-muted-foreground mb-4">
                  Open your inbox and start managing conversations like a pro.
                </p>
                <Button asChild>
                  <Link to="/inbox" className="gap-2">
                    Go to Inbox
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
