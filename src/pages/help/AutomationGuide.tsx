import { Link } from 'react-router-dom';
import { SEO } from '@/components/seo';
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
  Filter,
  Shield,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Settings,
  BarChart3,
  GitBranch,
  Webhook,
  Bell,
  UserPlus,
  Calendar,
  Eye,
  RefreshCw,
  Pause,
  Target,
  Heart,
  Ban,
  TestTube
} from 'lucide-react';
import { GuideCallout } from '@/components/help/GuideCallout';
import { CollapsibleSection } from '@/components/help/CollapsibleSection';
import { WhatsAppMessagePreview } from '@/components/help/WhatsAppMessagePreview';

export default function AutomationGuide() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO title="Automation Guide - AiReatro Help Center" description="Build WhatsApp automation workflows in AiReatro. Set up triggers, conditions, auto-replies, and drip campaigns step by step." keywords={["automation guide", "workflow tutorial", "WhatsApp chatbot setup"]} canonical="/help/automation" noIndex />
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
                20 min read
              </div>
            </div>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                <Zap className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">Automation Workflows</h1>
                <p className="text-lg text-muted-foreground">Complete guide to automating your WhatsApp messaging with smart, safe workflows.</p>
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
                    Automation lets you create <strong>workflows that run automatically</strong> when 
                    certain events happen. Build complex, multi-step journeys without writing code.
                  </p>
                  
                  <p className="text-muted-foreground mb-6">
                    Think of it as having a smart assistant that watches for specific triggers, evaluates conditions, 
                    and takes actions on your behalf – 24/7, with built-in safeguards against spam and loops.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-muted/30">
                      <CardContent className="p-4">
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Play className="h-4 w-4 text-primary" />
                          Triggers
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Events that start the workflow: messages, tags, schedules, inactivity.
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="bg-muted/30">
                      <CardContent className="p-4">
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Filter className="h-4 w-4 text-primary" />
                          Conditions
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Filters to make workflows targeted: tags, attributes, time windows.
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
                          What happens: send messages, add tags, assign agents, webhooks.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </CollapsibleSection>

            {/* All Triggers */}
            <CollapsibleSection title="All Triggers" icon={<Play className="h-5 w-5" />} defaultOpen>
              <Card>
                <CardContent className="p-6">
                  <p className="text-muted-foreground mb-6">
                    Triggers are events that start your workflow. Choose the right trigger for your use case.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                        <UserPlus className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium">New Contact Created</p>
                          <p className="text-sm text-muted-foreground">When a new contact is added to your database</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                        <MessageSquare className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium">First Inbound Message</p>
                          <p className="text-sm text-muted-foreground">When a contact messages you for the very first time</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                        <MessageSquare className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium">Inbound Message</p>
                          <p className="text-sm text-muted-foreground">Any incoming message from a contact</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                        <Filter className="h-5 w-5 text-purple-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium">Keyword Received</p>
                          <p className="text-sm text-muted-foreground">When message contains specific keywords (exact, contains, or regex)</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                        <Tag className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium">Tag Added / Removed</p>
                          <p className="text-sm text-muted-foreground">When a specific tag is applied or removed from contact</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                        <Calendar className="h-5 w-5 text-cyan-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium">Scheduled Time</p>
                          <p className="text-sm text-muted-foreground">Run at a specific time (once or recurring with RRULE)</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                        <Timer className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium">Inactivity (No Reply)</p>
                          <p className="text-sm text-muted-foreground">When no agent reply for X minutes/hours</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                        <Eye className="h-5 w-5 text-teal-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium">Conversation Opened / Closed</p>
                          <p className="text-sm text-muted-foreground">When conversation status changes</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                        <Users className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium">Agent Intervened</p>
                          <p className="text-sm text-muted-foreground">When bot hands over to human agent</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                        <Target className="h-5 w-5 text-pink-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium">Button Clicked</p>
                          <p className="text-sm text-muted-foreground">When customer clicks an interactive message button</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                        <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium">Template Delivered / Read</p>
                          <p className="text-sm text-muted-foreground">When message status updates to delivered or read</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                        <RefreshCw className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium">Contact Updated</p>
                          <p className="text-sm text-muted-foreground">When contact attributes change</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CollapsibleSection>

            {/* All Conditions */}
            <CollapsibleSection title="All Conditions" icon={<Filter className="h-5 w-5" />} defaultOpen>
              <Card>
                <CardContent className="p-6">
                  <p className="text-muted-foreground mb-6">
                    Conditions filter when the workflow should run. Make your automations more targeted.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 p-2 rounded bg-muted/30">
                        <Tag className="h-4 w-4 text-primary" />
                        <span className="text-sm">Contact has tag / does not have tag</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 rounded bg-muted/30">
                        <Users className="h-4 w-4 text-primary" />
                        <span className="text-sm">Contact attribute equals / contains</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 rounded bg-muted/30">
                        <Clock className="h-4 w-4 text-primary" />
                        <span className="text-sm">Time window (business hours, after-hours)</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 rounded bg-muted/30">
                        <Eye className="h-4 w-4 text-primary" />
                        <span className="text-sm">Conversation status (open/pending/closed)</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 p-2 rounded bg-muted/30">
                        <MessageSquare className="h-4 w-4 text-primary" />
                        <span className="text-sm">Last message direction (inbound/outbound)</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 rounded bg-muted/30">
                        <Users className="h-4 w-4 text-primary" />
                        <span className="text-sm">Agent assigned or unassigned</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 rounded bg-muted/30">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        <span className="text-sm">Opt-in status (required for marketing)</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 rounded bg-muted/30">
                        <BarChart3 className="h-4 w-4 text-primary" />
                        <span className="text-sm">MAU status (active/inactive)</span>
                      </div>
                    </div>
                  </div>
                  
                  <h4 className="font-semibold mb-3">Condition Presets</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">VIP Only</Badge>
                    <Badge variant="outline">After Hours Only</Badge>
                    <Badge variant="outline">New Lead Only</Badge>
                    <Badge variant="outline">Business Hours Only</Badge>
                    <Badge variant="outline">Opted-In Only</Badge>
                  </div>
                </CardContent>
              </Card>
            </CollapsibleSection>

            {/* All Actions */}
            <CollapsibleSection title="All Actions" icon={<Zap className="h-5 w-5" />} defaultOpen>
              <Card>
                <CardContent className="p-6">
                  <p className="text-muted-foreground mb-6">
                    Actions are what happens when the workflow runs. Chain multiple actions together.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm text-muted-foreground uppercase">Messaging</h4>
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                        <MessageSquare className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium">Send Template</p>
                          <p className="text-sm text-muted-foreground">Send approved WhatsApp template with variable mapping</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                        <Target className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium">Send Interactive Message</p>
                          <p className="text-sm text-muted-foreground">Send buttons or list messages (if in 24h window)</p>
                        </div>
                      </div>
                      
                      <h4 className="font-semibold text-sm text-muted-foreground uppercase mt-6">Organization</h4>
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                        <Tag className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium">Add / Remove Tag</p>
                          <p className="text-sm text-muted-foreground">Apply or remove tags from contacts</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                        <Users className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium">Assign Agent</p>
                          <p className="text-sm text-muted-foreground">Round robin, least busy, or specific team</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                        <AlertTriangle className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium">Set Priority</p>
                          <p className="text-sm text-muted-foreground">Set conversation priority (low/medium/high)</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm text-muted-foreground uppercase">Workflow</h4>
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                        <Eye className="h-5 w-5 text-purple-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium">Set Conversation Status</p>
                          <p className="text-sm text-muted-foreground">Open, pending, or close conversations</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                        <Bell className="h-5 w-5 text-purple-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium">Create Task / Reminder</p>
                          <p className="text-sm text-muted-foreground">Create follow-up tasks for agents</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                        <MessageSquare className="h-5 w-5 text-purple-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium">Add Internal Note</p>
                          <p className="text-sm text-muted-foreground">Add notes visible only to your team</p>
                        </div>
                      </div>
                      
                      <h4 className="font-semibold text-sm text-muted-foreground uppercase mt-6">Integration</h4>
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                        <Webhook className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium">Call Webhook</p>
                          <p className="text-sm text-muted-foreground">POST JSON to external CRM or API</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                        <RefreshCw className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium">Update Contact Attributes</p>
                          <p className="text-sm text-muted-foreground">Update lead status, stage, source, etc.</p>
                        </div>
                      </div>
                      
                      <h4 className="font-semibold text-sm text-muted-foreground uppercase mt-6">Control</h4>
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                        <Timer className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium">Delay / Wait</p>
                          <p className="text-sm text-muted-foreground">Wait X minutes/hours/days before next action</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                        <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium">Stop Workflow</p>
                          <p className="text-sm text-muted-foreground">End the workflow execution</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CollapsibleSection>

            {/* Starter Automations */}
            <CollapsibleSection title="Starter Automations (One-Click Install)" icon={<Zap className="h-5 w-5" />} defaultOpen>
              <Card>
                <CardContent className="p-6">
                  <p className="text-muted-foreground mb-6">
                    Get started quickly with these pre-built automation recipes. Install with one click!
                  </p>
                  
                  <div className="grid grid-cols-1 gap-4">
                    {/* Welcome Message */}
                    <Card className="bg-green-500/5 border-green-500/20">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center shrink-0">
                            <MessageSquare className="h-5 w-5 text-green-500" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold">Smart Welcome + Tag</h4>
                            <p className="text-sm text-muted-foreground mb-2">
                              Trigger: First inbound message → Send welcome template + Add tag "Welcome Sent"
                            </p>
                            <WhatsAppMessagePreview 
                              message={`👋 Welcome to ACME! We're here to help.\n\nHow can we assist you today?`}
                              buttons={["Browse Products", "Talk to Human"]}
                              status="delivered"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* After Hours */}
                    <Card className="bg-blue-500/5 border-blue-500/20">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0">
                            <Timer className="h-5 w-5 text-blue-500" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold">After-Hours Intelligent Reply</h4>
                            <p className="text-sm text-muted-foreground mb-2">
                              Trigger: Inbound message + Condition: Outside business hours → 
                              Send reply + Tag "After Hours" + Create task for morning
                            </p>
                            <WhatsAppMessagePreview 
                              message={`Hi! 🌙 We're currently outside business hours.\n\nOur team will respond first thing in the morning.\n\nBusiness hours: Mon-Fri, 9AM - 6PM`}
                              status="delivered"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Keyword Router */}
                    <Card className="bg-purple-500/5 border-purple-500/20">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center shrink-0">
                            <Filter className="h-5 w-5 text-purple-500" />
                          </div>
                          <div>
                            <h4 className="font-semibold">Keyword Self-Service Router</h4>
                            <p className="text-sm text-muted-foreground mb-2">
                              Trigger: Keywords "MENU", "HELP", "STATUS", "LOCATION" → 
                              Send relevant template + Tag "Self Served"
                            </p>
                            <div className="flex flex-wrap gap-2">
                              <Badge variant="outline">MENU → Menu template</Badge>
                              <Badge variant="outline">HELP → Support template</Badge>
                              <Badge variant="outline">STATUS → Order status</Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* VIP Escalation */}
                    <Card className="bg-orange-500/5 border-orange-500/20">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center shrink-0">
                            <Heart className="h-5 w-5 text-orange-500" />
                          </div>
                          <div>
                            <h4 className="font-semibold">VIP Escalation</h4>
                            <p className="text-sm text-muted-foreground">
                              Trigger: Tag "VIP" added OR priority=high → 
                              Assign to Sales Manager + Set HIGH priority + Add internal note "VIP lead"
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* SLA Alert */}
                    <Card className="bg-red-500/5 border-red-500/20">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center shrink-0">
                            <AlertTriangle className="h-5 w-5 text-red-500" />
                          </div>
                          <div>
                            <h4 className="font-semibold">SLA No-Reply Rescue</h4>
                            <p className="text-sm text-muted-foreground">
                              Trigger: No agent reply for 30 min + Conversation OPEN → 
                              Tag "SLA Risk" + Notify agent + Optional auto-message
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Follow-up Sequence */}
                    <Card className="bg-cyan-500/5 border-cyan-500/20">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center shrink-0">
                            <GitBranch className="h-5 w-5 text-cyan-500" />
                          </div>
                          <div>
                            <h4 className="font-semibold">Follow-up Drip Sequence</h4>
                            <p className="text-sm text-muted-foreground">
                              Trigger: Lead status = "Qualified" → Send template now → Wait 1 day → 
                              Send follow-up → Wait 2 days → Final follow-up. <strong>Stops if customer replies!</strong>
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Opt-out Protection */}
                    <Card className="bg-pink-500/5 border-pink-500/20">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center shrink-0">
                            <Ban className="h-5 w-5 text-pink-500" />
                          </div>
                          <div>
                            <h4 className="font-semibold">Opt-out Protection</h4>
                            <p className="text-sm text-muted-foreground">
                              Trigger: Tag "Opted-out" added OR opt_out=true → 
                              Block all marketing actions + Remove from marketing queues + Stop workflows
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </CollapsibleSection>

            {/* Safety Guardrails */}
            <CollapsibleSection title="Safety Guardrails" icon={<Shield className="h-5 w-5" />} defaultOpen>
              <Card>
                <CardContent className="p-6">
                  <p className="text-muted-foreground mb-6">
                    Built-in protections to prevent spam, loops, and other common automation mistakes.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                      <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Loop Detection</p>
                        <p className="text-sm text-muted-foreground">
                          Warns if workflow can trigger itself (circular triggers)
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                      <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Rate Limits</p>
                        <p className="text-sm text-muted-foreground">
                          Max X messages per contact per hour/day
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                      <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Cooldowns</p>
                        <p className="text-sm text-muted-foreground">
                          Prevent same workflow from running too frequently
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                      <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Anti-Spam</p>
                        <p className="text-sm text-muted-foreground">
                          Block multiple templates in short time spans
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                      <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Opt-in Enforcement</p>
                        <p className="text-sm text-muted-foreground">
                          Marketing templates require opt-in flag
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                      <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Stop on Reply</p>
                        <p className="text-sm text-muted-foreground">
                          Stop sequences when customer replies
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 rounded-lg bg-primary/10 border border-primary/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Pause className="h-5 w-5 text-primary" />
                      <span className="font-semibold">Global Kill Switch</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      "Pause All Automations" button stops everything instantly if something goes wrong.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </CollapsibleSection>

            {/* Testing Tools */}
            <CollapsibleSection title="Testing Tools" icon={<TestTube className="h-5 w-5" />}>
              <Card>
                <CardContent className="p-6">
                  <GuideCallout type="tip" title="Always Test Before Activating">
                    Use the built-in Test Center to simulate workflows before going live.
                  </GuideCallout>
                  
                  <div className="space-y-4 mt-6">
                    <h4 className="font-semibold">Test Center Features</h4>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span>Choose sample contact and conversation</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span>Simulate trigger events (keyword, tag, time)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span>Step-by-step execution log</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span>See conditions passed/failed</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span>Preview messages before sending</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span>Rollback test changes option</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </CollapsibleSection>

            {/* Analytics */}
            <CollapsibleSection title="Analytics & Logs" icon={<BarChart3 className="h-5 w-5" />}>
              <Card>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Workflow Logs</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• Timeline of all runs</li>
                        <li>• Outcome: success / failed / skipped</li>
                        <li>• Reason for skip (condition failed, cooldown, opt-out)</li>
                        <li>• Message ID references (if sent)</li>
                        <li>• Error details and debugging info</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3">Analytics Dashboard</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• Runs per workflow (today/7 days/30 days)</li>
                        <li>• Messages sent</li>
                        <li>• Success rate</li>
                        <li>• Error count</li>
                        <li>• Response rate</li>
                        <li>• Conversion tracking (if tag "Converted")</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CollapsibleSection>

            {/* Building Steps */}
            <CollapsibleSection title="Building an Automation (Step by Step)" icon={<Settings className="h-5 w-5" />}>
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">1</div>
                        <div className="w-0.5 h-full bg-border mt-2" />
                      </div>
                      <div className="pb-8">
                        <h4 className="font-semibold">Choose a Trigger</h4>
                        <p className="text-muted-foreground mb-3">What event starts the automation?</p>
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
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">2</div>
                        <div className="w-0.5 h-full bg-border mt-2" />
                      </div>
                      <div className="pb-8">
                        <h4 className="font-semibold">Set Conditions (Optional)</h4>
                        <p className="text-muted-foreground">
                          Add filters: "Only if contact has tag VIP" or "Only during business hours"
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">3</div>
                        <div className="w-0.5 h-full bg-border mt-2" />
                      </div>
                      <div className="pb-8">
                        <h4 className="font-semibold">Define Actions</h4>
                        <p className="text-muted-foreground mb-3">Chain multiple actions together</p>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary">Send Template</Badge>
                          <Badge variant="secondary">Add Tag</Badge>
                          <Badge variant="secondary">Assign Agent</Badge>
                          <Badge variant="secondary">Wait 1 day</Badge>
                          <Badge variant="secondary">Send Follow-up</Badge>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">4</div>
                        <div className="w-0.5 h-full bg-border mt-2" />
                      </div>
                      <div className="pb-8">
                        <h4 className="font-semibold">Configure Guardrails</h4>
                        <p className="text-muted-foreground">
                          Set rate limits, cooldowns, and safety options
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">5</div>
                        <div className="w-0.5 h-full bg-border mt-2" />
                      </div>
                      <div className="pb-8">
                        <h4 className="font-semibold">Test Thoroughly</h4>
                        <p className="text-muted-foreground">
                          Use Test Center with a sample contact before activating
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">6</div>
                      </div>
                      <div>
                        <h4 className="font-semibold">Activate!</h4>
                        <p className="text-muted-foreground">
                          Turn it on and monitor the analytics dashboard
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CollapsibleSection>

            {/* Common Mistakes */}
            <CollapsibleSection title="Common Mistakes to Avoid" icon={<XCircle className="h-5 w-5" />}>
              <Card>
                <CardContent className="p-6 space-y-4">
                  <GuideCallout type="error">
                    <strong>Creating loops</strong> – 
                    An automation triggers another automation, which triggers the first one. 
                    The system detects this but always design carefully.
                  </GuideCallout>
                  
                  <GuideCallout type="error">
                    <strong>Not testing first</strong> – 
                    Always test with the Test Center before activating. One broken automation can spam all customers.
                  </GuideCallout>
                  
                  <GuideCallout type="error">
                    <strong>Too many messages</strong> – 
                    Don't create automations that send multiple messages quickly. Use delays appropriately.
                  </GuideCallout>
                  
                  <GuideCallout type="error">
                    <strong>Ignoring time zones</strong> – 
                    Set proper business hours and time conditions. No one wants a message at 3 AM.
                  </GuideCallout>
                  
                  <GuideCallout type="error">
                    <strong>Forgetting opt-out handling</strong> – 
                    Always have an Opt-out Protection automation to stop messaging unsubscribed contacts.
                  </GuideCallout>
                  
                  <GuideCallout type="error">
                    <strong>Not using cooldowns</strong> – 
                    Without cooldowns, the same workflow can run multiple times for the same contact.
                  </GuideCallout>
                </CardContent>
              </Card>
            </CollapsibleSection>

            {/* Tips for Success */}
            <CollapsibleSection title="Tips for Success" icon={<CheckCircle2 className="h-5 w-5" />}>
              <Card>
                <CardContent className="p-6 space-y-4">
                  <GuideCallout type="tip" title="Start Simple">
                    Begin with one starter automation and add complexity gradually.
                  </GuideCallout>
                  
                  <GuideCallout type="tip" title="Use Tags for Tracking">
                    Add tags like "Welcome Sent" to know which contacts completed each flow.
                  </GuideCallout>
                  
                  <GuideCallout type="tip" title="Monitor Analytics">
                    Check workflow runs daily at first. Adjust based on success/failure rates.
                  </GuideCallout>
                  
                  <GuideCallout type="tip" title="Document Your Logic">
                    Use clear workflow names and descriptions. Future you will thank you.
                  </GuideCallout>
                  
                  <GuideCallout type="tip" title="Have a Kill Switch Ready">
                    Know where "Pause All" is. Use it immediately if something goes wrong.
                  </GuideCallout>
                  
                  <GuideCallout type="tip" title="Stop on Customer Reply">
                    Enable this for drip sequences. When a customer replies, they need a human.
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
                      <h3 className="font-medium group-hover:text-primary transition-colors">WhatsApp Templates</h3>
                      <p className="text-sm text-muted-foreground">Create templates to use in automations</p>
                    </CardContent>
                  </Card>
                </Link>
                <Link to="/help/contacts-tags">
                  <Card className="h-full hover:border-primary/50 transition-colors group">
                    <CardContent className="p-4">
                      <h3 className="font-medium group-hover:text-primary transition-colors">Contacts & Tags</h3>
                      <p className="text-sm text-muted-foreground">Use tags as automation triggers</p>
                    </CardContent>
                  </Card>
                </Link>
                <Link to="/help/inbox">
                  <Card className="h-full hover:border-primary/50 transition-colors group">
                    <CardContent className="p-4">
                      <h3 className="font-medium group-hover:text-primary transition-colors">Managing Your Inbox</h3>
                      <p className="text-sm text-muted-foreground">See automation results in action</p>
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
                  Create your first automation workflow and save hours of manual work.
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
