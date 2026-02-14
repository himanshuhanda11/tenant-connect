import React from 'react';
import { Inbox, UserCheck, Clock, Star, Bot, MessageCircle, BellOff, Tag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function InboxSettings() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="general">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-primary" />
                Assignment Rules
              </CardTitle>
              <CardDescription>Configure how conversations are assigned to agents</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Assignment Strategy</Label>
                <RadioGroup defaultValue="round-robin" className="grid gap-3">
                  {[
                    { value: 'round-robin', label: 'Round Robin', desc: 'Distribute evenly across online agents' },
                    { value: 'least-busy', label: 'Least Busy', desc: 'Assign to agent with fewest open conversations' },
                    { value: 'skill-based', label: 'Skill-Based', desc: 'Match by agent skills and tags' },
                    { value: 'manual', label: 'Manual Only', desc: 'All go to unassigned queue' },
                  ].map((opt) => (
                    <div key={opt.value} className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                      <RadioGroupItem value={opt.value} id={opt.value} />
                      <Label htmlFor={opt.value} className="flex-1 cursor-pointer">
                        <span className="font-medium">{opt.label}</span>
                        <p className="text-sm text-muted-foreground">{opt.desc}</p>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-assign on First Reply</Label>
                  <p className="text-sm text-muted-foreground">Assign to agent who sends first reply</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Reassign on Agent Offline</Label>
                  <p className="text-sm text-muted-foreground">Redistribute when agent goes offline</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                SLA & Working Hours
              </CardTitle>
              <CardDescription>Configure response time expectations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>First Response SLA</Label>
                  <Select defaultValue="15">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 minutes</SelectItem>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Resolution SLA</Label>
                  <Select defaultValue="24">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="4">4 hours</SelectItem>
                      <SelectItem value="8">8 hours</SelectItem>
                      <SelectItem value="24">24 hours</SelectItem>
                      <SelectItem value="48">48 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Pause SLA Outside Hours</Label>
                  <p className="text-sm text-muted-foreground">Don't count time outside working hours</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Working Hours Start</Label>
                  <Select defaultValue="09:00"><SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['08:00', '09:00', '10:00'].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Working Hours End</Label>
                  <Select defaultValue="18:00"><SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['17:00', '18:00', '19:00', '20:00'].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Inbox className="w-5 h-5 text-primary" />
                Conversation Closing
              </CardTitle>
              <CardDescription>Rules for automatically closing conversations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-close Inactive</Label>
                  <p className="text-sm text-muted-foreground">Close after period of inactivity</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Inactivity Period</Label>
                  <Select defaultValue="24">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12">12 hours</SelectItem>
                      <SelectItem value="24">24 hours</SelectItem>
                      <SelectItem value="48">48 hours</SelectItem>
                      <SelectItem value="72">72 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Closure Reason</Label>
                  <Select defaultValue="inactivity">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inactivity">Inactivity timeout</SelectItem>
                      <SelectItem value="resolved">Auto-resolved</SelectItem>
                      <SelectItem value="no-response">No customer response</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-primary" />
                Priority Inbox
              </CardTitle>
              <CardDescription>Configure priority conversation handling</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Priority Inbox</Label>
                  <p className="text-sm text-muted-foreground">Show high-priority conversations first</p>
                </div>
                <Switch defaultChecked />
              </div>

              <Separator />

              <div className="space-y-3">
                <Label>VIP Contact Tags</Label>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">VIP</Badge>
                  <Badge variant="outline">Enterprise</Badge>
                  <Badge variant="outline">High-Value</Badge>
                  <Button variant="ghost" size="sm">+ Add Tag</Button>
                </div>
                <p className="text-xs text-muted-foreground">Contacts with these tags are treated as VIP</p>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>VIP Auto-escalate</Label>
                  <p className="text-sm text-muted-foreground">Notify managers for VIP SLA breaches</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-primary" />
                AI Features
              </CardTitle>
              <CardDescription>Configure AI-powered inbox features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Label>AI Reply Suggestions</Label>
                    <Badge variant="outline" className="text-xs">Beta</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Show AI-generated reply suggestions</p>
                </div>
                <Switch />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Sentiment Analysis</Label>
                  <p className="text-sm text-muted-foreground">Detect customer sentiment in messages</p>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-summarize Conversations</Label>
                  <p className="text-sm text-muted-foreground">Generate conversation summaries</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-primary" />
                Internal Notes
              </CardTitle>
              <CardDescription>Configure internal note visibility</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Note Visibility</Label>
                <Select defaultValue="team">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All team members</SelectItem>
                    <SelectItem value="team">Same team only</SelectItem>
                    <SelectItem value="admins">Admins and managers</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>@mentions Notifications</Label>
                  <p className="text-sm text-muted-foreground">Notify when mentioned in notes</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

        </TabsContent>
      </Tabs>
    </div>
  );
}
