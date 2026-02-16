import { Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Breadcrumb from '@/components/layout/Breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Clock, Users, Shield, Route, UserPlus, Settings, ScrollText, ArrowRight } from 'lucide-react';
import { GuideCallout } from '@/components/help/GuideCallout';
import { CollapsibleSection } from '@/components/help/CollapsibleSection';

export default function TeamGuide() {
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
              <Badge variant="outline">Team</Badge>
              <Badge variant="secondary">Intermediate</Badge>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" /> 7 min read
              </div>
            </div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">Team Management</h1>
                <p className="text-lg text-muted-foreground">Invite members, assign roles, and set up routing & SLA policies.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-8">

            <CollapsibleSection title="Inviting Team Members" icon={<UserPlus className="h-5 w-5" />}>
              <Card>
                <CardContent className="p-6 space-y-4">
                  <p className="text-lg">Add teammates so they can manage conversations and respond to customers.</p>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
                      <span className="text-primary font-bold">1.</span>
                      <div><p className="font-medium">Navigate to Team → Members</p><p className="text-sm text-muted-foreground">Click the "Invite" button in the top right.</p></div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
                      <span className="text-primary font-bold">2.</span>
                      <div><p className="font-medium">Enter Email & Select Role</p><p className="text-sm text-muted-foreground">Choose between Admin (full access) or Agent (inbox-only access).</p></div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
                      <span className="text-primary font-bold">3.</span>
                      <div><p className="font-medium">Send Invitation</p><p className="text-sm text-muted-foreground">The invited user will receive an email to join your workspace.</p></div>
                    </div>
                  </div>
                  <GuideCallout type="tip" title="Pro Tip">Agents can only see conversations assigned to them. Admins can see all conversations.</GuideCallout>
                </CardContent>
              </Card>
            </CollapsibleSection>

            <CollapsibleSection title="Roles & Permissions" icon={<Shield className="h-5 w-5" />}>
              <Card>
                <CardContent className="p-6 space-y-4">
                  <p>Define what each team member can access and manage:</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-muted/30 rounded-lg text-center">
                      <p className="font-bold text-amber-500 mb-1">Owner</p>
                      <p className="text-sm text-muted-foreground">Full access including billing, workspace settings, and member management.</p>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-lg text-center">
                      <p className="font-bold text-blue-500 mb-1">Admin</p>
                      <p className="text-sm text-muted-foreground">Manage templates, campaigns, automations, and team members.</p>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-lg text-center">
                      <p className="font-bold text-emerald-500 mb-1">Agent</p>
                      <p className="text-sm text-muted-foreground">Access inbox, respond to assigned conversations, and manage contacts.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CollapsibleSection>

            <CollapsibleSection title="Conversation Routing" icon={<Route className="h-5 w-5" />}>
              <Card>
                <CardContent className="p-6 space-y-4">
                  <p className="text-lg">Automatically distribute incoming conversations to the right agents.</p>
                  <div className="space-y-3">
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <p className="font-medium">Round-Robin</p>
                      <p className="text-sm text-muted-foreground">Evenly distribute new conversations among available agents.</p>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <p className="font-medium">Skill-Based</p>
                      <p className="text-sm text-muted-foreground">Route based on agent skills, languages, or expertise areas.</p>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <p className="font-medium">Manual Assignment</p>
                      <p className="text-sm text-muted-foreground">Admins manually assign conversations to specific agents.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CollapsibleSection>

            <CollapsibleSection title="Business Hours & SLA" icon={<Clock className="h-5 w-5" />}>
              <Card>
                <CardContent className="p-6 space-y-4">
                  <p>Configure working hours and response time targets for your team.</p>
                  <div className="space-y-3">
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <p className="font-medium">Business Hours</p>
                      <p className="text-sm text-muted-foreground">Set operating hours per day. Outside these hours, auto-replies can be triggered.</p>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <p className="font-medium">SLA Targets</p>
                      <p className="text-sm text-muted-foreground">Define first-response and resolution time targets. Track breaches in the dashboard.</p>
                    </div>
                  </div>
                  <GuideCallout type="info" title="Note">SLA tracking only counts time during business hours.</GuideCallout>
                </CardContent>
              </Card>
            </CollapsibleSection>

            <CollapsibleSection title="Audit Logs" icon={<ScrollText className="h-5 w-5" />}>
              <Card>
                <CardContent className="p-6 space-y-4">
                  <p>Track every action taken by team members for security and compliance.</p>
                  <p className="text-muted-foreground">Audit logs record who did what and when — including logins, template changes, campaign sends, and settings modifications.</p>
                  <GuideCallout type="tip" title="Compliance">Audit logs are retained for 90 days and can be exported as CSV for compliance audits.</GuideCallout>
                </CardContent>
              </Card>
            </CollapsibleSection>

            <div className="flex items-center justify-between pt-8 border-t">
              <Link to="/help" className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" /> Back to Help Center
              </Link>
              <Link to="/help/workspaces">
                <Button variant="outline" className="gap-2">Workspaces Guide <ArrowRight className="h-4 w-4" /></Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
