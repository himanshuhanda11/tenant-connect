import React from 'react';
import { Puzzle, MessageSquare, Webhook, Link2, RefreshCw, Shield, Activity, ToggleLeft, FlaskConical } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function IntegrationsSettings() {
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
                <MessageSquare className="w-5 h-5 text-primary" />
                WhatsApp Cloud API
              </CardTitle>
              <CardDescription>Connection status and configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-lg border border-green-500/30 bg-green-500/5">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                  <div>
                    <h4 className="font-medium">Connected</h4>
                    <p className="text-sm text-muted-foreground">WhatsApp Cloud API v19.0</p>
                  </div>
                </div>
                <Badge className="bg-green-500/10 text-green-600 border-0">Active</Badge>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-3 rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground">WABA ID</p>
                  <p className="font-mono text-sm">1234567890123456</p>
                </div>
                <div className="p-3 rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground">Business ID</p>
                  <p className="font-mono text-sm">9876543210987654</p>
                </div>
              </div>

              <Button variant="outline" className="w-full">Reconnect Account</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Webhook className="w-5 h-5 text-primary" />
                Webhooks
              </CardTitle>
              <CardDescription>Configure inbound and outbound webhooks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Inbound Webhook URL</Label>
                <div className="flex gap-2">
                  <Input value="https://api.aireatro.com/webhooks/xxx" readOnly className="font-mono bg-muted" />
                  <Button variant="outline" size="icon"><RefreshCw className="w-4 h-4" /></Button>
                </div>
                <p className="text-xs text-muted-foreground">Use this URL in Meta Business Manager</p>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Outbound Webhook URL</Label>
                <Input placeholder="https://your-server.com/webhook" />
                <p className="text-xs text-muted-foreground">We'll POST events to this URL</p>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Outbound Webhooks</Label>
                  <p className="text-sm text-muted-foreground">Send events to your server</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link2 className="w-5 h-5 text-primary" />
                CRM Integrations
              </CardTitle>
              <CardDescription>Connect your CRM and other tools</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  { name: 'Salesforce', status: 'available' },
                  { name: 'HubSpot', status: 'available' },
                  { name: 'Zoho CRM', status: 'available' },
                  { name: 'Pipedrive', status: 'coming' },
                ].map((crm) => (
                  <div key={crm.name} className="flex items-center justify-between p-4 rounded-lg border border-border">
                    <span className="font-medium">{crm.name}</span>
                    {crm.status === 'coming' ? (
                      <Badge variant="outline">Coming Soon</Badge>
                    ) : (
                      <Button variant="outline" size="sm">Connect</Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-primary" />
                Webhook Reliability
              </CardTitle>
              <CardDescription>Configure retry and error handling</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Max Retry Attempts</Label>
                  <Select defaultValue="3">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 attempt</SelectItem>
                      <SelectItem value="3">3 attempts</SelectItem>
                      <SelectItem value="5">5 attempts</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Retry Interval</Label>
                  <Select defaultValue="exponential">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Fixed (30s)</SelectItem>
                      <SelectItem value="exponential">Exponential</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Signature Validation</Label>
                  <p className="text-sm text-muted-foreground">Require HMAC signature on webhooks</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="space-y-2">
                <Label>Webhook Secret</Label>
                <Input value="whsec_xxxxxxxxxxxxxxxx" readOnly className="font-mono bg-muted" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ToggleLeft className="w-5 h-5 text-primary" />
                Event Controls
              </CardTitle>
              <CardDescription>Enable/disable specific webhook events</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { event: 'message.received', label: 'Message Received', enabled: true },
                { event: 'message.sent', label: 'Message Sent', enabled: true },
                { event: 'message.status', label: 'Message Status Updates', enabled: true },
                { event: 'conversation.created', label: 'Conversation Created', enabled: false },
                { event: 'contact.updated', label: 'Contact Updated', enabled: false },
              ].map((item) => (
                <div key={item.event} className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div>
                    <code className="text-sm font-medium text-primary">{item.event}</code>
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                  </div>
                  <Switch defaultChecked={item.enabled} />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-primary" />
                Sandbox Mode
              </CardTitle>
              <CardDescription>Test integrations without affecting production</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-lg border border-warning/30 bg-warning/5">
                <div className="flex items-center gap-3">
                  <FlaskConical className="w-5 h-5 text-warning" />
                  <div>
                    <h4 className="font-medium">Sandbox Mode</h4>
                    <p className="text-sm text-muted-foreground">Webhooks sent to sandbox endpoint</p>
                  </div>
                </div>
                <Switch />
              </div>

              <div className="space-y-2">
                <Label>Sandbox Webhook URL</Label>
                <Input placeholder="https://sandbox.your-server.com/webhook" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Rate Limit Monitoring
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 rounded-lg border border-border text-center">
                  <div className="text-2xl font-bold text-foreground">245</div>
                  <p className="text-sm text-muted-foreground">Requests/min</p>
                </div>
                <div className="p-4 rounded-lg border border-border text-center">
                  <div className="text-2xl font-bold text-foreground">1,000</div>
                  <p className="text-sm text-muted-foreground">Limit/min</p>
                </div>
                <div className="p-4 rounded-lg border border-border text-center">
                  <div className="text-2xl font-bold text-green-600">0</div>
                  <p className="text-sm text-muted-foreground">Rate Limited</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
