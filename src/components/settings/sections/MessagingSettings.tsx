import React from 'react';
import { MessageSquare, Clock, Hash, FileText, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function MessagingSettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            Message Defaults
          </CardTitle>
          <CardDescription>
            Configure default messaging behavior for your workspace
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Label>Read Receipts</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-3.5 h-3.5 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Show read status when messages are delivered and read</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <p className="text-sm text-muted-foreground">
                Display delivery and read status for messages
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-mark as Read</Label>
              <p className="text-sm text-muted-foreground">
                Automatically mark messages as read when opened
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Typing Indicators</Label>
              <p className="text-sm text-muted-foreground">
                Show when agents are typing a response
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Session Window
          </CardTitle>
          <CardDescription>
            Configure the 24-hour messaging window behavior
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Window Expiry Warning</Label>
              <Select defaultValue="4">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 hours before</SelectItem>
                  <SelectItem value="4">4 hours before</SelectItem>
                  <SelectItem value="8">8 hours before</SelectItem>
                  <SelectItem value="12">12 hours before</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Alert agents before the session window expires
              </p>
            </div>

            <div className="space-y-2">
              <Label>Default Template on Expiry</Label>
              <Select defaultValue="none">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No auto-send</SelectItem>
                  <SelectItem value="followup">Follow-up template</SelectItem>
                  <SelectItem value="reminder">Reminder template</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Automatically send a template when window expires
              </p>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-close Expired Sessions</Label>
              <p className="text-sm text-muted-foreground">
                Automatically close conversations when the 24h window expires
              </p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hash className="w-5 h-5 text-primary" />
            Message Formatting
          </CardTitle>
          <CardDescription>
            Default formatting options for outgoing messages
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Rich Text Formatting</Label>
              <p className="text-sm text-muted-foreground">
                Enable bold, italic, and strikethrough in messages
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Emoji Suggestions</Label>
              <p className="text-sm text-muted-foreground">
                Show emoji suggestions while typing
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <Label>Message Signature</Label>
            <Input placeholder="e.g., — Sent via Smeksh" />
            <p className="text-xs text-muted-foreground">
              Appended to all outgoing messages (leave empty to disable)
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Media Settings
          </CardTitle>
          <CardDescription>
            Configure media handling preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Max File Size</Label>
              <Select defaultValue="16">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 MB</SelectItem>
                  <SelectItem value="10">10 MB</SelectItem>
                  <SelectItem value="16">16 MB (WhatsApp limit)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Image Compression</Label>
              <Select defaultValue="auto">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No compression</SelectItem>
                  <SelectItem value="auto">Auto (recommended)</SelectItem>
                  <SelectItem value="high">High compression</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-download Media</Label>
              <p className="text-sm text-muted-foreground">
                Automatically download incoming media files
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
