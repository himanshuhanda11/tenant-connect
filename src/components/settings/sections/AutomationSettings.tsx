import React from 'react';
import { Zap, Play, Pause, AlertTriangle, History, Settings2, Bug, Layers } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export function AutomationSettings() {
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
                <Zap className="w-5 h-5 text-primary" />
                Automation Engine
              </CardTitle>
              <CardDescription>Master controls for the automation system</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-green-500/10">
                    <Play className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Automation Engine</h4>
                    <p className="text-sm text-muted-foreground">Currently running</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 rounded-lg border border-border text-center">
                  <div className="text-2xl font-bold text-primary">12</div>
                  <p className="text-sm text-muted-foreground">Active Workflows</p>
                </div>
                <div className="p-4 rounded-lg border border-border text-center">
                  <div className="text-2xl font-bold text-foreground">1,234</div>
                  <p className="text-sm text-muted-foreground">Runs Today</p>
                </div>
                <div className="p-4 rounded-lg border border-border text-center">
                  <div className="text-2xl font-bold text-green-600">99.2%</div>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                </div>
              </div>

              <Button asChild variant="outline" className="w-full">
                <Link to="/automation">Manage Workflows →</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-primary" />
                Global Limits
              </CardTitle>
              <CardDescription>Set workspace-wide automation limits</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Max Messages per Contact/Day</Label>
                  <Input type="number" defaultValue="10" />
                </div>
                <div className="space-y-2">
                  <Label>Max Runs per Contact/Day</Label>
                  <Input type="number" defaultValue="5" />
                </div>
                <div className="space-y-2">
                  <Label>Global Cooldown (seconds)</Label>
                  <Input type="number" defaultValue="60" />
                </div>
                <div className="space-y-2">
                  <Label>Max Concurrent Runs</Label>
                  <Input type="number" defaultValue="100" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-primary" />
                Conflict Handling
              </CardTitle>
              <CardDescription>How to handle when multiple workflows trigger</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Trigger Priority</Label>
                <Select defaultValue="first">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="first">First Match Wins</SelectItem>
                    <SelectItem value="all">Run All Matching</SelectItem>
                    <SelectItem value="priority">By Priority Score</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Stop on Customer Reply</Label>
                  <p className="text-sm text-muted-foreground">Cancel workflow when customer responds</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Stop on Conversation Close</Label>
                  <p className="text-sm text-muted-foreground">Cancel workflow when conversation is closed</p>
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
                <Bug className="w-5 h-5 text-primary" />
                Dry Run Mode
              </CardTitle>
              <CardDescription>Test workflows without sending real messages</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-lg border border-warning/30 bg-warning/5">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-warning/10">
                    <Bug className="w-5 h-5 text-warning" />
                  </div>
                  <div>
                    <h4 className="font-medium">Dry Run Mode</h4>
                    <p className="text-sm text-muted-foreground">Workflows will log actions without executing</p>
                  </div>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Log All Triggers</Label>
                  <p className="text-sm text-muted-foreground">Record every trigger event for debugging</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-primary" />
                Version Control
              </CardTitle>
              <CardDescription>Manage workflow versions and rollbacks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Versioning</Label>
                  <p className="text-sm text-muted-foreground">Keep history of workflow changes</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="space-y-2">
                <Label>Versions to Keep</Label>
                <Select defaultValue="10">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">Last 5 versions</SelectItem>
                    <SelectItem value="10">Last 10 versions</SelectItem>
                    <SelectItem value="20">Last 20 versions</SelectItem>
                    <SelectItem value="all">All versions</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-rollback on Errors</Label>
                  <p className="text-sm text-muted-foreground">Revert to previous version if error rate spikes</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5 text-primary" />
                Automation Logs
              </CardTitle>
              <CardDescription>View and export automation execution logs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Log Retention</Label>
                  <Select defaultValue="30">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 days</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Log Level</Label>
                  <Select defaultValue="info">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="error">Errors only</SelectItem>
                      <SelectItem value="warn">Warnings & Errors</SelectItem>
                      <SelectItem value="info">Info (Recommended)</SelectItem>
                      <SelectItem value="debug">Debug (Verbose)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button variant="outline" className="w-full">Export Logs</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
