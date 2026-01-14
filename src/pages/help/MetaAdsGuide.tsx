import { Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Clock, 
  Megaphone,
  Link2,
  Target,
  BarChart3,
  Route,
  Workflow,
  Settings,
  CheckCircle,
  AlertTriangle,
  Shield,
  Users,
  Tag,
  Zap,
  MessageSquare,
  ArrowRight,
  Facebook,
  Phone,
  TrendingUp,
  Eye,
  MousePointer,
  UserPlus,
  Bot,
  FileText
} from 'lucide-react';
import { GuideCallout } from '@/components/help/GuideCallout';
import { CollapsibleSection } from '@/components/help/CollapsibleSection';

export default function MetaAdsGuide() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      {/* Header */}
      <section className="py-8 bg-gradient-to-br from-blue-500/10 via-background to-primary/5 border-b">
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
              <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-200">Meta Ads</Badge>
              <Badge variant="secondary">Intermediate</Badge>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                15 min read
              </div>
            </div>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Megaphone className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">Meta Ads (Click-to-WhatsApp)</h1>
                <p className="text-lg text-muted-foreground">Complete guide to connecting Meta Ads, tracking leads, and automating responses.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Summary Cards */}
      <section className="py-8 border-b bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-lg font-semibold mb-4">What You'll Learn</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Card className="border-blue-200/50 bg-blue-50/30">
                <CardContent className="p-4 text-center">
                  <Link2 className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm font-medium">Connect Meta</p>
                </CardContent>
              </Card>
              <Card className="border-green-200/50 bg-green-50/30">
                <CardContent className="p-4 text-center">
                  <Target className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-medium">Track Leads</p>
                </CardContent>
              </Card>
              <Card className="border-purple-200/50 bg-purple-50/30">
                <CardContent className="p-4 text-center">
                  <Workflow className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                  <p className="text-sm font-medium">Automate Responses</p>
                </CardContent>
              </Card>
              <Card className="border-orange-200/50 bg-orange-50/30">
                <CardContent className="p-4 text-center">
                  <BarChart3 className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                  <p className="text-sm font-medium">Analyze ROI</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-8">
            
            {/* What is Meta Ads? */}
            <CollapsibleSection title="What is Meta Ads (Click-to-WhatsApp)?" icon={<Megaphone className="h-5 w-5" />} defaultOpen>
              <Card>
                <CardContent className="p-6">
                  <p className="text-lg mb-4">
                    <strong>Click-to-WhatsApp Ads (CTWA)</strong> are Meta ads that allow users to start a WhatsApp conversation 
                    with your business directly from Facebook or Instagram.
                  </p>
                  <p className="text-muted-foreground mb-6">
                    When someone clicks your ad, they're taken directly to WhatsApp to chat with you. 
                    AIREATRO captures these leads, tracks attribution, and can automatically respond - turning ad clicks into conversations.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
                      <MousePointer className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-blue-900">User Clicks Ad</p>
                        <p className="text-sm text-blue-700">On Facebook or Instagram</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-100">
                      <MessageSquare className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-green-900">Opens WhatsApp</p>
                        <p className="text-sm text-green-700">Direct conversation starts</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg border border-purple-100">
                      <UserPlus className="h-5 w-5 text-purple-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-purple-900">Lead Captured</p>
                        <p className="text-sm text-purple-700">In AIREATRO with attribution</p>
                      </div>
                    </div>
                  </div>

                  <GuideCallout type="info" title="Meta Compliance">
                    AIREATRO is Meta App Review compliant. We only read ad performance data - all ad creation and billing 
                    happens in Meta Ads Manager.
                  </GuideCallout>
                </CardContent>
              </Card>
            </CollapsibleSection>

            {/* Setup Guide */}
            <CollapsibleSection title="Step-by-Step Setup Guide" icon={<Link2 className="h-5 w-5" />} defaultOpen>
              <Card>
                <CardContent className="p-6 space-y-6">
                  <p className="text-muted-foreground mb-4">
                    Follow these steps to connect your Meta Ad Account with AIREATRO. The entire process takes about 5 minutes.
                  </p>

                  {/* Step 1 */}
                  <div className="border-l-4 border-blue-500 pl-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm">1</div>
                      <h4 className="font-semibold text-lg">Connect Facebook Account</h4>
                    </div>
                    <p className="text-muted-foreground mb-3">
                      Go to <strong>Meta Ads → Setup</strong> and click "Continue with Facebook". Log in and grant the following permissions:
                    </p>
                    <ul className="space-y-2 ml-11">
                      <li className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Read Ad Accounts</span>
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Read Pages</span>
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Read WhatsApp Ad Events</span>
                      </li>
                    </ul>
                  </div>

                  {/* Step 2 */}
                  <div className="border-l-4 border-blue-500 pl-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm">2</div>
                      <h4 className="font-semibold text-lg">Select Ad Account</h4>
                    </div>
                    <p className="text-muted-foreground">
                      Choose the Meta Ad Account you want to track. You'll see a dropdown with all ad accounts you have access to. 
                      Select the one running your Click-to-WhatsApp campaigns.
                    </p>
                  </div>

                  {/* Step 3 */}
                  <div className="border-l-4 border-blue-500 pl-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm">3</div>
                      <h4 className="font-semibold text-lg">Choose Facebook Page</h4>
                    </div>
                    <p className="text-muted-foreground">
                      Select the Facebook Page linked to your ads. This page should be the one connected to your WhatsApp Business Account.
                    </p>
                  </div>

                  {/* Step 4 */}
                  <div className="border-l-4 border-blue-500 pl-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm">4</div>
                      <h4 className="font-semibold text-lg">Link WhatsApp Number</h4>
                    </div>
                    <p className="text-muted-foreground">
                      Select the WhatsApp Business number already connected in AIREATRO. This links ad leads to your existing WhatsApp setup.
                    </p>
                  </div>

                  {/* Step 5 */}
                  <div className="border-l-4 border-green-500 pl-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-sm">5</div>
                      <h4 className="font-semibold text-lg">Enable Tracking</h4>
                    </div>
                    <p className="text-muted-foreground">
                      Review the summary and click "Enable Click-to-WhatsApp Tracking". AIREATRO will now automatically 
                      attribute new conversations to your Meta Ads.
                    </p>
                  </div>

                  <GuideCallout type="tip" title="Pro Tip">
                    Create a Click-to-WhatsApp ad in Meta Ads Manager before connecting AIREATRO. 
                    This ensures you have active campaigns ready to track.
                  </GuideCallout>
                </CardContent>
              </Card>
            </CollapsibleSection>

            {/* Understanding the Dashboard */}
            <CollapsibleSection title="Understanding the Dashboard" icon={<Eye className="h-5 w-5" />}>
              <Card>
                <CardContent className="p-6 space-y-6">
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Megaphone className="h-5 w-5 text-primary" />
                      Overview Page
                    </h4>
                    <p className="text-muted-foreground mb-4">
                      The Overview page shows key metrics at a glance:
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-2xl font-bold text-primary">23</p>
                        <p className="text-sm text-muted-foreground">Leads Today</p>
                      </div>
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">342</p>
                        <p className="text-sm text-muted-foreground">Leads This Month</p>
                      </div>
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">$2.45</p>
                        <p className="text-sm text-muted-foreground">Cost Per Lead</p>
                      </div>
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-2xl font-bold text-purple-600">34.5%</p>
                        <p className="text-sm text-muted-foreground">Conversion Rate</p>
                      </div>
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-2xl font-bold text-orange-600">5</p>
                        <p className="text-sm text-muted-foreground">Active Ads</p>
                      </div>
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-2xl font-bold">$838</p>
                        <p className="text-sm text-muted-foreground">Total Spend</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Target className="h-5 w-5 text-primary" />
                      Ads Manager (Read-Only)
                    </h4>
                    <p className="text-muted-foreground">
                      View all your Click-to-WhatsApp ads in a table format. See campaign names, status, spend, leads generated, 
                      and last lead time. Note: Editing ads happens in Meta Ads Manager for compliance.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      Lead Analytics
                    </h4>
                    <p className="text-muted-foreground">
                      Deep dive into performance with charts showing leads by ad, leads over time, conversion funnel, 
                      and first response time after ad click. Export data to CSV for further analysis.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </CollapsibleSection>

            {/* Attribution Rules */}
            <CollapsibleSection title="Attribution Rules Explained" icon={<Route className="h-5 w-5" />}>
              <Card>
                <CardContent className="p-6 space-y-6">
                  <p className="text-muted-foreground">
                    Attribution rules determine how AIREATRO identifies which contacts came from Meta Ads. 
                    This ensures accurate reporting and proper automation triggers.
                  </p>

                  <div className="space-y-4">
                    <h4 className="font-semibold">How Attribution Works</h4>
                    <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="text-xs font-semibold text-primary">1</span>
                        </div>
                        <p className="text-sm">User clicks your Click-to-WhatsApp ad</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="text-xs font-semibold text-primary">2</span>
                        </div>
                        <p className="text-sm">WhatsApp opens with your business number</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="text-xs font-semibold text-primary">3</span>
                        </div>
                        <p className="text-sm">User sends first message (or pre-filled message)</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                        <p className="text-sm"><strong>AIREATRO attributes</strong> the contact to the specific ad, campaign, and ad set</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Attribution Windows</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Choose how long after an ad click a contact can be attributed:
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3 border rounded-lg text-center">
                        <p className="font-semibold">1 Day</p>
                        <p className="text-xs text-muted-foreground">Strictest attribution</p>
                      </div>
                      <div className="p-3 border rounded-lg text-center bg-primary/5 border-primary/30">
                        <p className="font-semibold">7 Days</p>
                        <p className="text-xs text-muted-foreground">Recommended</p>
                      </div>
                      <div className="p-3 border rounded-lg text-center">
                        <p className="font-semibold">28 Days</p>
                        <p className="text-xs text-muted-foreground">Longest window</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Source Priority</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      When a contact has multiple touchpoints, AIREATRO uses this priority:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-blue-500">1. Meta Ads</Badge>
                      <Badge variant="secondary">2. QR Code</Badge>
                      <Badge variant="secondary">3. Website</Badge>
                      <Badge variant="secondary">4. API</Badge>
                      <Badge variant="outline">5. Manual</Badge>
                    </div>
                  </div>

                  <GuideCallout type="info" title="Contact Source Badge">
                    In Contacts and Inbox, you'll see a "Meta Ad" badge on contacts attributed to ads, 
                    with campaign and ad names shown in tooltips.
                  </GuideCallout>
                </CardContent>
              </Card>
            </CollapsibleSection>

            {/* Automations */}
            <CollapsibleSection title="Setting Up Automations" icon={<Workflow className="h-5 w-5" />}>
              <Card>
                <CardContent className="p-6 space-y-6">
                  <p className="text-muted-foreground">
                    Create automations to instantly respond to ad leads, route them to the right team, and start follow-up sequences.
                  </p>

                  <div>
                    <h4 className="font-semibold mb-3">Available Triggers</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="p-3 border rounded-lg flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                          <UserPlus className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">New Lead from Meta Ad</p>
                          <p className="text-xs text-muted-foreground">When a CTWA lead is attributed</p>
                        </div>
                      </div>
                      <div className="p-3 border rounded-lg flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                          <MessageSquare className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">First Message Received</p>
                          <p className="text-xs text-muted-foreground">First WhatsApp message after ad click</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Available Actions</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div className="flex items-center gap-2 p-2 bg-muted/30 rounded">
                        <FileText className="h-4 w-4 text-primary" />
                        <span className="text-sm">Send welcome template</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-muted/30 rounded">
                        <Tag className="h-4 w-4 text-primary" />
                        <span className="text-sm">Add tag (e.g., "Meta Lead")</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-muted/30 rounded">
                        <Users className="h-4 w-4 text-primary" />
                        <span className="text-sm">Assign agent (round robin)</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-muted/30 rounded">
                        <Zap className="h-4 w-4 text-primary" />
                        <span className="text-sm">Start follow-up workflow</span>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4 bg-gradient-to-r from-green-50 to-blue-50">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Bot className="h-5 w-5 text-primary" />
                      Ready-Made Templates
                    </h4>
                    <div className="space-y-3">
                      <div className="bg-white/80 p-3 rounded-lg border">
                        <p className="font-medium">Meta Ad Welcome + Routing</p>
                        <p className="text-sm text-muted-foreground">
                          Auto-tag → Assign round robin → Send welcome template
                        </p>
                      </div>
                      <div className="bg-white/80 p-3 rounded-lg border">
                        <p className="font-medium">High-Intent Lead Fast Lane</p>
                        <p className="text-sm text-muted-foreground">
                          Detect intent keywords → Priority HIGH → Assign to Sales team
                        </p>
                      </div>
                      <div className="bg-white/80 p-3 rounded-lg border">
                        <p className="font-medium">SLA Rescue</p>
                        <p className="text-sm text-muted-foreground">
                          No agent response in 5 min → Notify → Escalate
                        </p>
                      </div>
                    </div>
                  </div>

                  <GuideCallout type="warning" title="WhatsApp Compliance">
                    Marketing messages require opt-in. AIREATRO enforces rate limiting and cooldowns to prevent spam. 
                    Automations stop on customer reply to avoid interrupting conversations.
                  </GuideCallout>
                </CardContent>
              </Card>
            </CollapsibleSection>

            {/* Best Practices */}
            <CollapsibleSection title="Best Practices for Success" icon={<TrendingUp className="h-5 w-5" />}>
              <Card>
                <CardContent className="p-6 space-y-4">
                  <GuideCallout type="tip" title="Respond Fast">
                    Ad leads are hot leads. Set up automations to respond within seconds, 
                    and aim for human follow-up within 5 minutes.
                  </GuideCallout>

                  <GuideCallout type="tip" title="Personalize Welcome Messages">
                    Use the campaign name variable in your welcome template. Example: 
                    "Hi! Thanks for your interest in our Summer Sale!"
                  </GuideCallout>

                  <GuideCallout type="tip" title="Tag by Campaign">
                    Automatically tag leads with campaign names (e.g., "Campaign: Summer Sale 2025") 
                    to segment and analyze performance later.
                  </GuideCallout>

                  <GuideCallout type="tip" title="Track Conversion Value">
                    Mark leads as "Converted" in AIREATRO when they make a purchase. 
                    This feeds back into your analytics for true ROI calculation.
                  </GuideCallout>

                  <GuideCallout type="tip" title="A/B Test Responses">
                    Create different automations for different campaigns to test which 
                    welcome messages and routing strategies convert best.
                  </GuideCallout>
                </CardContent>
              </Card>
            </CollapsibleSection>

            {/* Common Mistakes */}
            <CollapsibleSection title="Common Mistakes to Avoid" icon={<AlertTriangle className="h-5 w-5" />}>
              <Card>
                <CardContent className="p-6 space-y-4">
                  <GuideCallout type="error">
                    <strong>Slow response times</strong> – Ad leads expect instant responses. 
                    Waiting hours or days kills conversion rates.
                  </GuideCallout>

                  <GuideCallout type="error">
                    <strong>No automation setup</strong> – Without automations, leads arrive silently. 
                    At minimum, send an auto-reply and notify your team.
                  </GuideCallout>

                  <GuideCallout type="error">
                    <strong>Wrong attribution window</strong> – Too short and you miss delayed responses; 
                    too long and you attribute unrelated contacts.
                  </GuideCallout>

                  <GuideCallout type="error">
                    <strong>Spammy follow-ups</strong> – Sending too many messages can lead to blocks 
                    and hurt your WhatsApp quality rating.
                  </GuideCallout>

                  <GuideCallout type="error">
                    <strong>Not tracking conversions</strong> – Without marking conversions, you can't 
                    calculate true ROI or optimize ad spend.
                  </GuideCallout>
                </CardContent>
              </Card>
            </CollapsibleSection>

            {/* Security & Compliance */}
            <CollapsibleSection title="Security & Meta Compliance" icon={<Shield className="h-5 w-5" />}>
              <Card>
                <CardContent className="p-6 space-y-6">
                  <p className="text-muted-foreground">
                    AIREATRO is designed to be Meta App Review compliant and secure.
                  </p>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-green-900">Read-Only Ad Access</p>
                        <p className="text-sm text-green-700">AIREATRO only reads ad performance data. Ads are created and managed in Meta Ads Manager.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-green-900">Clear Permission Explanation</p>
                        <p className="text-sm text-green-700">Users see exactly what permissions are requested and why.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-green-900">Opt-In Enforcement</p>
                        <p className="text-sm text-green-700">Marketing messages require user consent. Settings to enforce opt-in are available.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-green-900">Role-Based Access</p>
                        <p className="text-sm text-green-700">Restrict Meta Ads access with meta_ads.view and meta_ads.manage permissions.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-green-900">Audit Logging</p>
                        <p className="text-sm text-green-700">All Meta account connections, tracking changes, and automation creations are logged.</p>
                      </div>
                    </div>
                  </div>

                  <GuideCallout type="info" title="Compliance Notice">
                    AIREATRO does not create or modify ads. All advertising actions remain within Meta Ads Manager. 
                    Data is used solely for attribution and automation.
                  </GuideCallout>
                </CardContent>
              </Card>
            </CollapsibleSection>

            {/* Settings Reference */}
            <CollapsibleSection title="Settings Reference" icon={<Settings className="h-5 w-5" />}>
              <Card>
                <CardContent className="p-6">
                  <p className="text-muted-foreground mb-4">
                    Configure Meta Ads behavior in <strong>Meta Ads → Settings</strong>:
                  </p>

                  <div className="space-y-4">
                    <div className="border-b pb-3">
                      <p className="font-medium">Enable/Disable Tracking</p>
                      <p className="text-sm text-muted-foreground">Turn off attribution without disconnecting your Meta account.</p>
                    </div>
                    <div className="border-b pb-3">
                      <p className="font-medium">Default Tags</p>
                      <p className="text-sm text-muted-foreground">Automatically apply tags to all Meta Ad leads (e.g., "Meta Lead").</p>
                    </div>
                    <div className="border-b pb-3">
                      <p className="font-medium">Default Assignment</p>
                      <p className="text-sm text-muted-foreground">Set a default agent or team for all ad leads.</p>
                    </div>
                    <div className="border-b pb-3">
                      <p className="font-medium">Attribution Window</p>
                      <p className="text-sm text-muted-foreground">Choose 1 day, 7 days, or 28 days for lead attribution.</p>
                    </div>
                    <div className="border-b pb-3">
                      <p className="font-medium">Opt-In Enforcement</p>
                      <p className="text-sm text-muted-foreground">Require marketing consent before sending promotional messages.</p>
                    </div>
                    <div>
                      <p className="font-medium">Auto-Sync</p>
                      <p className="text-sm text-muted-foreground">Enable automatic syncing of ad data from Meta (configurable interval).</p>
                    </div>
                  </div>
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
                        Advanced automation setup
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
                        Organize your ad leads
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
                        Create welcome templates
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            </div>

            {/* CTA */}
            <Card className="bg-gradient-to-r from-blue-500/10 to-primary/10 border-blue-200/50">
              <CardContent className="p-6 text-center">
                <h3 className="text-xl font-semibold mb-2">Ready to connect Meta Ads?</h3>
                <p className="text-muted-foreground mb-4">
                  Start tracking your Click-to-WhatsApp leads and automating responses.
                </p>
                <Button asChild className="bg-blue-600 hover:bg-blue-700">
                  <Link to="/meta-ads/setup" className="gap-2">
                    Go to Meta Ads Setup
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