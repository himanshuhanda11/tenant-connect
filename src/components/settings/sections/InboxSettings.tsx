import React from 'react';
import { Inbox, SortAsc, Tag, MessageCircle, Clock, UserCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export function InboxSettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SortAsc className="w-5 h-5 text-primary" />
            Inbox Organization
          </CardTitle>
          <CardDescription>
            Configure how conversations are sorted and displayed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label>Default Sort Order</Label>
            <RadioGroup defaultValue="newest" className="grid gap-3">
              <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="newest" id="newest" />
                <Label htmlFor="newest" className="flex-1 cursor-pointer">
                  <span className="font-medium">Newest First</span>
                  <p className="text-sm text-muted-foreground">
                    Show most recent conversations at the top
                  </p>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="oldest" id="oldest" />
                <Label htmlFor="oldest" className="flex-1 cursor-pointer">
                  <span className="font-medium">Oldest Unanswered</span>
                  <p className="text-sm text-muted-foreground">
                    Prioritize conversations waiting longest for a reply
                  </p>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="priority" id="priority" />
                <Label htmlFor="priority" className="flex-1 cursor-pointer">
                  <span className="font-medium">By Priority</span>
                  <p className="text-sm text-muted-foreground">
                    Show high priority conversations first
                  </p>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <Separator />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Preview Length</Label>
              <Select defaultValue="2">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 line</SelectItem>
                  <SelectItem value="2">2 lines</SelectItem>
                  <SelectItem value="3">3 lines</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Conversations per Page</Label>
              <Select defaultValue="25">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-primary" />
            Agent Assignment
          </CardTitle>
          <CardDescription>
            Configure automatic conversation assignment rules
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label>Assignment Strategy</Label>
            <RadioGroup defaultValue="round-robin" className="grid gap-3">
              <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="round-robin" id="round-robin" />
                <Label htmlFor="round-robin" className="flex-1 cursor-pointer">
                  <span className="font-medium">Round Robin</span>
                  <p className="text-sm text-muted-foreground">
                    Distribute conversations evenly across online agents
                  </p>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="least-busy" id="least-busy" />
                <Label htmlFor="least-busy" className="flex-1 cursor-pointer">
                  <span className="font-medium">Least Busy</span>
                  <p className="text-sm text-muted-foreground">
                    Assign to agent with fewest open conversations
                  </p>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="manual" id="manual" />
                <Label htmlFor="manual" className="flex-1 cursor-pointer">
                  <span className="font-medium">Manual Only</span>
                  <p className="text-sm text-muted-foreground">
                    All conversations go to unassigned queue
                  </p>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-assign on First Reply</Label>
              <p className="text-sm text-muted-foreground">
                Assign conversation to agent who sends the first reply
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Reassign on Agent Offline</Label>
              <p className="text-sm text-muted-foreground">
                Reassign open conversations when agent goes offline
              </p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-primary" />
            Quick Actions
          </CardTitle>
          <CardDescription>
            Configure inbox quick action buttons
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show Tag Picker</Label>
              <p className="text-sm text-muted-foreground">
                Quick access to add/remove tags from conversations
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show Priority Selector</Label>
              <p className="text-sm text-muted-foreground">
                Quick change conversation priority level
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show Snooze Option</Label>
              <p className="text-sm text-muted-foreground">
                Allow temporarily hiding conversations
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
            Auto-close Rules
          </CardTitle>
          <CardDescription>
            Configure automatic conversation closure
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-close Inactive Conversations</Label>
              <p className="text-sm text-muted-foreground">
                Close conversations after a period of inactivity
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Inactivity Period</Label>
              <Select defaultValue="24">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12">12 hours</SelectItem>
                  <SelectItem value="24">24 hours</SelectItem>
                  <SelectItem value="48">48 hours</SelectItem>
                  <SelectItem value="72">72 hours</SelectItem>
                  <SelectItem value="168">7 days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Closure Reason</Label>
              <Select defaultValue="inactivity">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
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
    </div>
  );
}
