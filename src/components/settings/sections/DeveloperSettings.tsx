import React, { useState } from 'react';
import { Code, Key, Copy, Eye, EyeOff, RefreshCw, Webhook, Terminal, FileJson } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useTenant } from '@/contexts/TenantContext';

export function DeveloperSettings() {
  const { currentTenant } = useTenant();
  const [showApiKey, setShowApiKey] = useState(false);
  const mockApiKey = 'sk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx';

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5 text-primary" />
            API Keys
          </CardTitle>
          <CardDescription>
            Manage API keys for external integrations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 rounded-lg border border-border bg-muted/30 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-foreground">Production API Key</h4>
                <p className="text-sm text-muted-foreground">
                  Use this key for production integrations
                </p>
              </div>
              <Badge className="bg-primary/10 text-primary border-0">Live</Badge>
            </div>
            
            <div className="flex items-center gap-2">
              <Input
                value={showApiKey ? mockApiKey : '••••••••••••••••••••••••••••••••'}
                readOnly
                className="font-mono bg-background"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => copyToClipboard(mockApiKey, 'API Key')}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Regenerate
              </Button>
              <Button variant="ghost" size="sm" className="text-destructive">
                Revoke
              </Button>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Workspace ID</Label>
            <div className="flex items-center gap-2">
              <Input
                value={currentTenant?.id || 'ws_xxxxxxxx'}
                readOnly
                className="font-mono bg-muted"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => copyToClipboard(currentTenant?.id || '', 'Workspace ID')}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Webhook className="w-5 h-5 text-primary" />
            Webhooks
          </CardTitle>
          <CardDescription>
            Configure webhook endpoints for real-time events
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Webhooks</Label>
              <p className="text-sm text-muted-foreground">
                Send event notifications to your server
              </p>
            </div>
            <Switch />
          </div>

          <div className="space-y-2">
            <Label>Webhook URL</Label>
            <Input placeholder="https://your-server.com/webhooks" />
            <p className="text-xs text-muted-foreground">
              We'll send POST requests to this URL for subscribed events
            </p>
          </div>

          <div className="space-y-2">
            <Label>Webhook Secret</Label>
            <div className="flex items-center gap-2">
              <Input
                value="whsec_xxxxxxxxxxxxxxxxxxxxxxxx"
                readOnly
                className="font-mono bg-muted"
              />
              <Button variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Rotate
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Use this secret to verify webhook signatures
            </p>
          </div>

          <Separator />

          <div className="space-y-3">
            <Label>Event Subscriptions</Label>
            <div className="grid gap-2">
              {[
                { id: 'message.received', label: 'Message Received', desc: 'When a new message is received' },
                { id: 'message.sent', label: 'Message Sent', desc: 'When a message is sent' },
                { id: 'conversation.created', label: 'Conversation Created', desc: 'When a new conversation starts' },
                { id: 'conversation.closed', label: 'Conversation Closed', desc: 'When a conversation is closed' },
                { id: 'contact.created', label: 'Contact Created', desc: 'When a new contact is added' },
              ].map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div>
                    <code className="text-sm font-medium text-primary">{event.id}</code>
                    <p className="text-xs text-muted-foreground">{event.desc}</p>
                  </div>
                  <Switch />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-primary" />
            API Settings
          </CardTitle>
          <CardDescription>
            Configure API behavior and limits
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>API Access</Label>
              <p className="text-sm text-muted-foreground">
                Enable API access for this workspace
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          
          <Separator />
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 rounded-lg border border-border bg-muted/30">
              <div className="text-2xl font-bold text-foreground">10,000</div>
              <p className="text-sm text-muted-foreground">API calls this month</p>
            </div>
            <div className="p-4 rounded-lg border border-border bg-muted/30">
              <div className="text-2xl font-bold text-foreground">100/min</div>
              <p className="text-sm text-muted-foreground">Rate limit</p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>IP Restrictions</Label>
              <p className="text-sm text-muted-foreground">
                Restrict API access to specific IPs
              </p>
            </div>
            <Button variant="outline" size="sm">
              Configure
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileJson className="w-5 h-5 text-primary" />
            API Documentation
          </CardTitle>
          <CardDescription>
            Resources for integrating with our API
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <a 
              href="#" 
              className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
            >
              <h4 className="font-medium text-foreground">API Reference</h4>
              <p className="text-sm text-muted-foreground">
                Complete API documentation
              </p>
            </a>
            <a 
              href="#" 
              className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
            >
              <h4 className="font-medium text-foreground">SDK Libraries</h4>
              <p className="text-sm text-muted-foreground">
                Official SDKs for popular languages
              </p>
            </a>
            <a 
              href="#" 
              className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
            >
              <h4 className="font-medium text-foreground">Webhook Events</h4>
              <p className="text-sm text-muted-foreground">
                Event payload reference
              </p>
            </a>
            <a 
              href="#" 
              className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
            >
              <h4 className="font-medium text-foreground">Postman Collection</h4>
              <p className="text-sm text-muted-foreground">
                Import our API into Postman
              </p>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
