import React from 'react';
import { Users, UserPlus, Shield, Clock, Activity, Key, Layers, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Link } from 'react-router-dom';

const permissions = [
  { id: 'inbox.view', label: 'View Inbox', category: 'Inbox' },
  { id: 'inbox.reply', label: 'Reply to Messages', category: 'Inbox' },
  { id: 'inbox.assign', label: 'Assign Conversations', category: 'Inbox' },
  { id: 'contacts.view', label: 'View Contacts', category: 'Contacts' },
  { id: 'contacts.edit', label: 'Edit Contacts', category: 'Contacts' },
  { id: 'campaigns.view', label: 'View Campaigns', category: 'Campaigns' },
  { id: 'campaigns.create', label: 'Create Campaigns', category: 'Campaigns' },
  { id: 'settings.view', label: 'View Settings', category: 'Settings' },
  { id: 'settings.edit', label: 'Edit Settings', category: 'Settings' },
];

export function TeamPermissionsSettings() {
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
                <UserPlus className="w-5 h-5 text-primary" />
                Invite Members
              </CardTitle>
              <CardDescription>Add new team members to your workspace</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input placeholder="colleague@company.com" type="email" />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select defaultValue="agent">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="agent">Agent</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button>Send Invitation</Button>

              <Separator className="my-4" />

              <Button asChild variant="outline" className="w-full">
                <Link to="/team">Manage All Members →</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Role Configuration
              </CardTitle>
              <CardDescription>Define roles and their permissions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { role: 'Admin', desc: 'Full access to all features', count: 2 },
                { role: 'Manager', desc: 'Manage team and view reports', count: 3 },
                { role: 'Agent', desc: 'Handle conversations and contacts', count: 12 },
                { role: 'Viewer', desc: 'Read-only access', count: 1 },
              ].map((r) => (
                <div key={r.role} className="flex items-center justify-between p-4 rounded-lg border border-border">
                  <div>
                    <h4 className="font-medium">{r.role}</h4>
                    <p className="text-sm text-muted-foreground">{r.desc}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{r.count} members</Badge>
                    <Button variant="ghost" size="sm">Edit</Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Member Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Allow Self-removal</Label>
                  <p className="text-sm text-muted-foreground">Members can leave the workspace</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Require Approval for Joining</Label>
                  <p className="text-sm text-muted-foreground">Admins must approve new members</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5 text-primary" />
                Custom Roles
              </CardTitle>
              <CardDescription>Create roles with specific permissions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Custom Roles</Label>
                  <p className="text-sm text-muted-foreground">Create roles beyond default presets</p>
                </div>
                <Switch />
              </div>

              <Separator />

              <div className="space-y-4">
                <Label>Permission Matrix</Label>
                <div className="border rounded-lg overflow-x-auto">
                  <div className="min-w-[480px]">
                    <div className="grid grid-cols-5 gap-0 bg-muted/50 p-3 text-sm font-medium border-b">
                      <div>Permission</div>
                      <div className="text-center">Admin</div>
                      <div className="text-center">Manager</div>
                      <div className="text-center">Agent</div>
                      <div className="text-center">Viewer</div>
                    </div>
                    {permissions.slice(0, 5).map((p) => (
                      <div key={p.id} className="grid grid-cols-5 gap-0 p-3 text-sm border-b last:border-0">
                        <div className="text-muted-foreground">{p.label}</div>
                        <div className="flex justify-center"><Checkbox defaultChecked /></div>
                        <div className="flex justify-center"><Checkbox defaultChecked /></div>
                        <div className="flex justify-center"><Checkbox defaultChecked={p.id.includes('view')} /></div>
                        <div className="flex justify-center"><Checkbox defaultChecked={p.id.includes('view')} disabled /></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Temporary Access
              </CardTitle>
              <CardDescription>Grant time-limited access to members</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Temporary Access</Label>
                  <p className="text-sm text-muted-foreground">Allow setting expiration dates on invites</p>
                </div>
                <Switch />
              </div>

              <div className="space-y-2">
                <Label>Default Expiry</Label>
                <Select defaultValue="30">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                    <SelectItem value="never">Never</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Shift-Based Permissions
              </CardTitle>
              <CardDescription>Control access based on working hours</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Shift-Based Access</Label>
                  <p className="text-sm text-muted-foreground">Restrict access outside assigned shifts</p>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Allow Overtime Access</Label>
                  <p className="text-sm text-muted-foreground">Allow access with manager approval</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Activity Logs
              </CardTitle>
              <CardDescription>Track member actions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Activity Logging</Label>
                  <p className="text-sm text-muted-foreground">Record all member actions</p>
                </div>
                <Switch defaultChecked />
              </div>

              <Button asChild variant="outline" className="w-full">
                <Link to="/team/audit">View Activity Logs →</Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
