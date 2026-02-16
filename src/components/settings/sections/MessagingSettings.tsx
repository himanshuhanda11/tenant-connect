import React from 'react';
import { MessageSquare, Clock, Phone, RefreshCw, DollarSign, Globe, Gauge, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';

export function MessagingSettings() {
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
                <Phone className="w-5 h-5 text-primary" />
                Default Sender
              </CardTitle>
              <CardDescription>Configure your default sending phone number</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Default Sender Number</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a phone number" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none" disabled>No numbers connected</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Used when no specific number is selected</p>
                </div>
                <div className="space-y-2">
                  <Label>Default Country Code</Label>
                  <Select defaultValue="+1">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="+1">+1 (USA/Canada)</SelectItem>
                      <SelectItem value="+44">+44 (UK)</SelectItem>
                      <SelectItem value="+91">+91 (India)</SelectItem>
                      <SelectItem value="+971">+971 (UAE)</SelectItem>
                      <SelectItem value="+49">+49 (Germany)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gauge className="w-5 h-5 text-primary" />
                Rate Limiting
              </CardTitle>
              <CardDescription>Control message sending rates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Messages per Minute</Label>
                  <Select defaultValue="80">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 / minute (Conservative)</SelectItem>
                      <SelectItem value="60">60 / minute (Standard)</SelectItem>
                      <SelectItem value="80">80 / minute (High)</SelectItem>
                      <SelectItem value="100">100 / minute (Maximum)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Queue Mode</Label>
                  <Select defaultValue="fifo">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fifo">First In, First Out</SelectItem>
                      <SelectItem value="priority">Priority-based</SelectItem>
                      <SelectItem value="fair">Fair Distribution</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-throttle on Errors</Label>
                  <p className="text-sm text-muted-foreground">Automatically reduce rate when errors occur</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                Opt-in Management
              </CardTitle>
              <CardDescription>Configure opt-in keyword handling</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Opt-in Keywords</Label>
                <Input placeholder="START, SUBSCRIBE, YES" />
                <p className="text-xs text-muted-foreground">Comma-separated keywords that trigger opt-in</p>
              </div>
              <div className="space-y-2">
                <Label>Opt-out Keywords</Label>
                <Input placeholder="STOP, UNSUBSCRIBE, NO" />
                <p className="text-xs text-muted-foreground">Comma-separated keywords that trigger opt-out</p>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-respond to Opt-out</Label>
                  <p className="text-sm text-muted-foreground">Send confirmation when user opts out</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-primary" />
                Retry & Failover
              </CardTitle>
              <CardDescription>Configure message retry and failover behavior</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Max Retry Attempts</Label>
                  <Select defaultValue="3">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 attempt</SelectItem>
                      <SelectItem value="2">2 attempts</SelectItem>
                      <SelectItem value="3">3 attempts</SelectItem>
                      <SelectItem value="5">5 attempts</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Retry Delay</Label>
                  <Select defaultValue="exponential">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Fixed (30s)</SelectItem>
                      <SelectItem value="exponential">Exponential backoff</SelectItem>
                      <SelectItem value="linear">Linear increase</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Failover Phone Number</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Select failover number" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No failover</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Use this number if primary fails</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                Cost Optimization
              </CardTitle>
              <CardDescription>Reduce messaging costs with smart routing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Label>Cost Optimization Mode</Label>
                    <Badge variant="outline" className="text-xs">Beta</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Use cheaper conversation types when possible</p>
                </div>
                <Switch />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Batch Utility Messages</Label>
                  <p className="text-sm text-muted-foreground">Group utility messages to reduce costs</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Delivery Window
              </CardTitle>
              <CardDescription>Schedule when messages can be sent</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Respect Business Hours</Label>
                  <p className="text-sm text-muted-foreground">Only send during configured business hours</p>
                </div>
                <Switch />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Start Time</Label>
                  <Select defaultValue="09:00">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['08:00', '09:00', '10:00'].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>End Time</Label>
                  <Select defaultValue="18:00">
                    <SelectTrigger><SelectValue /></SelectTrigger>
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
                <Globe className="w-5 h-5 text-primary" />
                Template Fallback
              </CardTitle>
              <CardDescription>Configure fallback language for templates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Fallback Language</Label>
                <Select defaultValue="en">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="ar">Arabic</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Used when contact's language template is unavailable</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
