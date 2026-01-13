import { Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Clock, 
  Users, 
  Tag,
  ArrowRight,
  UserPlus,
  Filter,
  Search,
  FolderOpen,
  Sparkles
} from 'lucide-react';
import { GuideCallout } from '@/components/help/GuideCallout';
import { CollapsibleSection } from '@/components/help/CollapsibleSection';

export default function ContactsTagsGuide() {
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
                7 min read
              </div>
            </div>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">Contacts & Tags</h1>
                <p className="text-lg text-muted-foreground">Organize your customer database with custom labels for better targeting.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-8">
            
            {/* What is this? - Contacts */}
            <CollapsibleSection title="What are Contacts?" icon={<Users className="h-5 w-5" />}>
              <Card>
                <CardContent className="p-6">
                  <p className="text-lg mb-4">
                    Contacts are your <strong>customer database</strong>. Every person who messages 
                    your WhatsApp number becomes a contact.
                  </p>
                  
                  <p className="text-muted-foreground mb-6">
                    Each contact stores their phone number, name, conversation history, and any 
                    custom information you want to track.
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-muted/30 rounded-lg">
                      <UserPlus className="h-6 w-6 text-primary mx-auto mb-2" />
                      <p className="text-sm font-medium">Auto-Created</p>
                      <p className="text-xs text-muted-foreground">From incoming messages</p>
                    </div>
                    <div className="text-center p-4 bg-muted/30 rounded-lg">
                      <Search className="h-6 w-6 text-primary mx-auto mb-2" />
                      <p className="text-sm font-medium">Searchable</p>
                      <p className="text-xs text-muted-foreground">Find by name or phone</p>
                    </div>
                    <div className="text-center p-4 bg-muted/30 rounded-lg">
                      <Tag className="h-6 w-6 text-primary mx-auto mb-2" />
                      <p className="text-sm font-medium">Taggable</p>
                      <p className="text-xs text-muted-foreground">Organize with labels</p>
                    </div>
                    <div className="text-center p-4 bg-muted/30 rounded-lg">
                      <FolderOpen className="h-6 w-6 text-primary mx-auto mb-2" />
                      <p className="text-sm font-medium">Full History</p>
                      <p className="text-xs text-muted-foreground">All messages saved</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CollapsibleSection>

            {/* What are Tags */}
            <CollapsibleSection title="What are Tags?" icon={<Tag className="h-5 w-5" />}>
              <Card>
                <CardContent className="p-6">
                  <p className="text-lg mb-4">
                    Tags are <strong>custom labels</strong> you apply to contacts and conversations 
                    to organize and segment your audience.
                  </p>
                  
                  <p className="text-muted-foreground mb-6">
                    Think of tags like colored sticky notes – they help you quickly identify 
                    and group contacts based on any criteria you choose.
                  </p>

                  <h4 className="font-semibold mb-3">Common Tag Types:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Badge className="bg-blue-500">Lifecycle</Badge>
                        <span className="text-sm text-muted-foreground">Lead, Customer, VIP, Churned</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className="bg-green-500">Intent</Badge>
                        <span className="text-sm text-muted-foreground">Interested, Needs Demo, Ready to Buy</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className="bg-red-500">Priority</Badge>
                        <span className="text-sm text-muted-foreground">High, Medium, Low, Urgent</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Badge className="bg-purple-500">Source</Badge>
                        <span className="text-sm text-muted-foreground">Website, Campaign, Referral</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className="bg-orange-500">Product</Badge>
                        <span className="text-sm text-muted-foreground">Plan A, Plan B, Enterprise</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">Custom</Badge>
                        <span className="text-sm text-muted-foreground">Any label for your business</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CollapsibleSection>

            {/* When to Use */}
            <CollapsibleSection title="When to Use Contacts & Tags" icon={<Clock className="h-5 w-5" />}>
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold mb-3">Use Contacts To:</h4>
                      <ul className="space-y-2">
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          <span>View complete conversation history with a customer</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          <span>Add notes and context for your team</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          <span>Store custom attributes (company, location, etc.)</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          <span>Track customer timeline and activity</span>
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">Use Tags To:</h4>
                      <ul className="space-y-2">
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          <span>Filter conversations in the inbox</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          <span>Target specific groups in campaigns</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          <span>Trigger automations based on tags</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          <span>Track customer journey stages</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CollapsibleSection>

            {/* How it Works */}
            <CollapsibleSection title="How to Use Tags Effectively" icon={<Sparkles className="h-5 w-5" />}>
              <Card>
                <CardContent className="p-6 space-y-6">
                  <div>
                    <h4 className="font-semibold mb-3">Step 1: Create Your Tag System</h4>
                    <p className="text-muted-foreground mb-3">
                      Before you start tagging, plan out the categories you need:
                    </p>
                    <div className="bg-muted/30 p-4 rounded-lg">
                      <code className="text-sm">
                        📁 Lifecycle: Lead → Prospect → Customer → VIP<br/>
                        📁 Status: Active, Inactive, Blocked<br/>
                        📁 Source: Website, Instagram, Referral<br/>
                        📁 Interest: Product A, Product B, Service
                      </code>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Step 2: Apply Tags Manually or Automatically</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card className="bg-muted/30">
                        <CardContent className="p-4">
                          <h5 className="font-medium mb-2">Manual Tagging</h5>
                          <p className="text-sm text-muted-foreground">
                            Click on a contact → Add tags from the dropdown. 
                            Good for one-off labeling.
                          </p>
                        </CardContent>
                      </Card>
                      <Card className="bg-muted/30">
                        <CardContent className="p-4">
                          <h5 className="font-medium mb-2">Automatic Tagging</h5>
                          <p className="text-sm text-muted-foreground">
                            Use tag rules or automations to apply tags 
                            based on keywords, behavior, or conditions.
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Step 3: Use Tags for Targeting</h4>
                    <p className="text-muted-foreground">
                      Filter your inbox by tags, or select tags when creating campaigns 
                      to send messages to specific groups.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </CollapsibleSection>

            {/* Real Examples */}
            <CollapsibleSection title="Real-World Examples" icon={<Filter className="h-5 w-5" />}>
              <Card>
                <CardContent className="p-6 space-y-6">
                  <div>
                    <h4 className="font-semibold mb-2">Example 1: E-commerce Store</h4>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <Badge className="bg-green-500">Purchased</Badge>
                      <Badge className="bg-blue-500">Abandoned Cart</Badge>
                      <Badge className="bg-purple-500">VIP</Badge>
                      <Badge className="bg-orange-500">First-Time Buyer</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Tag customers based on purchase behavior. Send "Abandoned Cart" 
                      reminders only to those with that tag.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Example 2: Real Estate Agency</h4>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <Badge className="bg-blue-500">Buyer</Badge>
                      <Badge className="bg-green-500">Seller</Badge>
                      <Badge className="bg-red-500">Hot Lead</Badge>
                      <Badge className="bg-purple-500">Pre-Approved</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Segment contacts by their role (buyer vs seller) and 
                      qualification status. Route hot leads to senior agents.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Example 3: Restaurant</h4>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <Badge className="bg-orange-500">Vegetarian</Badge>
                      <Badge className="bg-green-500">Regular</Badge>
                      <Badge className="bg-purple-500">Birthday Month</Badge>
                      <Badge className="bg-blue-500">Delivery</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Track dietary preferences and send personalized offers. 
                      Birthday month customers get special discounts.
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
                    <strong>Too many tags</strong> – 
                    Having 50+ tags makes it impossible to use them consistently. 
                    Keep your tag system simple.
                  </GuideCallout>
                  
                  <GuideCallout type="error">
                    <strong>Inconsistent naming</strong> – 
                    "VIP", "vip", "V.I.P." are three different tags. 
                    Standardize your naming conventions.
                  </GuideCallout>
                  
                  <GuideCallout type="error">
                    <strong>Not training your team</strong> – 
                    If team members tag differently, your data becomes useless. 
                    Document your tagging rules.
                  </GuideCallout>
                  
                  <GuideCallout type="error">
                    <strong>Never cleaning up</strong> – 
                    Old, unused tags create clutter. Review and archive 
                    tags you no longer need.
                  </GuideCallout>
                </CardContent>
              </Card>
            </CollapsibleSection>

            {/* Tips */}
            <CollapsibleSection title="Tips for Success" icon={<Tag className="h-5 w-5" />}>
              <Card>
                <CardContent className="p-6 space-y-4">
                  <GuideCallout type="tip" title="Use Tag Groups">
                    Organize tags into groups: Lifecycle, Status, Source, Product. 
                    This keeps things tidy as you scale.
                  </GuideCallout>
                  
                  <GuideCallout type="tip" title="Use Colors Wisely">
                    Assign colors by category (e.g., green = positive, red = urgent). 
                    Visual cues help your team process faster.
                  </GuideCallout>
                  
                  <GuideCallout type="tip" title="Add Emojis">
                    Emojis make tags easier to spot: "🔥 Hot Lead", "💎 VIP", "📦 Ordered".
                  </GuideCallout>
                  
                  <GuideCallout type="tip" title="Create Tag Rules">
                    Set up automatic tagging based on keywords. When someone types 
                    "pricing", auto-apply "Interested" tag.
                  </GuideCallout>
                  
                  <GuideCallout type="tip" title="Review Regularly">
                    Monthly check: Which tags are used? Which aren't? 
                    Archive unused tags and add new ones as needed.
                  </GuideCallout>
                </CardContent>
              </Card>
            </CollapsibleSection>

            {/* Related Guides */}
            <div className="pt-8 border-t">
              <h2 className="text-xl font-semibold mb-4">Related Guides</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link to="/help/inbox">
                  <Card className="h-full hover:border-primary/50 transition-colors group">
                    <CardContent className="p-4">
                      <h3 className="font-medium group-hover:text-primary transition-colors">
                        Managing Your Inbox
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Filter conversations by tags
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
                        Trigger actions based on tags
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
                        Send templates to tagged contacts
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            </div>

            {/* CTA */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-6 text-center">
                <h3 className="text-xl font-semibold mb-2">Ready to organize your contacts?</h3>
                <p className="text-muted-foreground mb-4">
                  Start creating tags and segmenting your audience.
                </p>
                <div className="flex items-center justify-center gap-4">
                  <Button variant="outline" asChild>
                    <Link to="/contacts" className="gap-2">
                      View Contacts
                    </Link>
                  </Button>
                  <Button asChild>
                    <Link to="/tags" className="gap-2">
                      Manage Tags
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
