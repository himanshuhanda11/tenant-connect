import React from 'react';
import { Settings2, Database, Download, Trash2, AlertTriangle, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTenant } from '@/contexts/TenantContext';

export function AdvancedSettings() {
  const { currentRole } = useTenant();
  const isOwner = currentRole === 'owner';

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-primary" />
            Performance & Optimization
          </CardTitle>
          <CardDescription>
            Fine-tune workspace performance settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Caching</Label>
              <p className="text-sm text-muted-foreground">
                Cache frequently accessed data for faster loading
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Lazy Load Messages</Label>
              <p className="text-sm text-muted-foreground">
                Load message history on demand
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <Label>Data Retention Period</Label>
            <Select defaultValue="365">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="90">90 days</SelectItem>
                <SelectItem value="180">180 days</SelectItem>
                <SelectItem value="365">1 year</SelectItem>
                <SelectItem value="730">2 years</SelectItem>
                <SelectItem value="0">Forever</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              How long to keep message and conversation history
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5 text-primary" />
            Data Management
          </CardTitle>
          <CardDescription>
            Export, import, and manage your workspace data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 rounded-lg border border-border space-y-3">
              <div className="flex items-center gap-2">
                <Download className="w-5 h-5 text-primary" />
                <h4 className="font-medium text-foreground">Export Data</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Download all workspace data including contacts, conversations, and templates
              </p>
              <Button variant="outline" size="sm">
                Request Export
              </Button>
            </div>

            <div className="p-4 rounded-lg border border-border space-y-3">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-primary" />
                <h4 className="font-medium text-foreground">Sync Status</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Last synced: 2 minutes ago
              </p>
              <Button variant="outline" size="sm">
                Force Sync
              </Button>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-backup</Label>
              <p className="text-sm text-muted-foreground">
                Automatically backup data daily
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-primary" />
            Feature Flags
          </CardTitle>
          <CardDescription>
            Enable or disable experimental features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Beta Features</Label>
              <p className="text-sm text-muted-foreground">
                Enable access to beta features before general release
              </p>
            </div>
            <Switch />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>AI Suggestions</Label>
              <p className="text-sm text-muted-foreground">
                Enable AI-powered reply suggestions
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Advanced Analytics</Label>
              <p className="text-sm text-muted-foreground">
                Enable detailed analytics dashboard
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {isOwner && (
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Danger Zone
            </CardTitle>
            <CardDescription>
              Irreversible actions - proceed with caution
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30">
              <div>
                <h4 className="font-medium text-foreground">Clear All Data</h4>
                <p className="text-sm text-muted-foreground">
                  Remove all contacts, conversations, and messages
                </p>
              </div>
              <Button variant="outline" className="text-destructive border-destructive/50 hover:bg-destructive/10">
                Clear Data
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border border-destructive/30 bg-destructive/5">
              <div>
                <h4 className="font-medium text-foreground">Delete Workspace</h4>
                <p className="text-sm text-muted-foreground">
                  Permanently delete this workspace and all data
                </p>
              </div>
              <Button variant="destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
