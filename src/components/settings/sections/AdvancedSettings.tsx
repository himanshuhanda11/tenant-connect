import React, { useState } from 'react';
import { Settings2, Database, Download, Trash2, AlertTriangle, RefreshCw, Mail, Copy, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useTenant } from '@/contexts/TenantContext';
import { toast } from 'sonner';

const ADMIN_EMAIL = 'admin@aireatro.com';

export function AdvancedSettings() {
  const { currentRole } = useTenant();
  const isOwner = currentRole === 'owner';
  const [contactOpen, setContactOpen] = useState(false);
  const [feature, setFeature] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const requestActivation = (featureName: string) => {
    setFeature(featureName);
    setContactOpen(true);
  };

  const copyEmail = async () => {
    await navigator.clipboard.writeText(ADMIN_EMAIL);
    setCopied(true);
    toast.success('Email copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const mailtoHref = `mailto:${ADMIN_EMAIL}?subject=${encodeURIComponent(
    `Activate Advanced Feature: ${feature || 'Advanced Settings'}`
  )}&body=${encodeURIComponent(
    `Hi Aireatro Admin,\n\nPlease activate the following advanced feature for my workspace:\n\nFeature: ${feature}\n\nThanks.`
  )}`;

  // Locked toggle: clicking it opens the contact dialog instead of toggling
  const LockedToggle = ({ name, checked = false }: { name: string; checked?: boolean }) => (
    <Switch
      checked={checked}
      onCheckedChange={() => requestActivation(name)}
      onClick={(e) => {
        e.preventDefault();
        requestActivation(name);
      }}
    />
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-primary" />
            Performance & Optimization
          </CardTitle>
          <CardDescription>Fine-tune workspace performance settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Caching</Label>
              <p className="text-sm text-muted-foreground">Cache frequently accessed data for faster loading</p>
            </div>
            <LockedToggle name="Enable Caching" checked />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Lazy Load Messages</Label>
              <p className="text-sm text-muted-foreground">Load message history on demand</p>
            </div>
            <LockedToggle name="Lazy Load Messages" checked />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Data Retention Period</Label>
            <Select defaultValue="365" onValueChange={() => requestActivation('Data Retention Period')}>
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
            <p className="text-xs text-muted-foreground">How long to keep message and conversation history</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5 text-primary" />
            Data Management
          </CardTitle>
          <CardDescription>Export, import, and manage your workspace data</CardDescription>
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
              <Button variant="outline" size="sm" onClick={() => requestActivation('Export Data')}>
                Request Export
              </Button>
            </div>

            <div className="p-4 rounded-lg border border-border space-y-3">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-primary" />
                <h4 className="font-medium text-foreground">Sync Status</h4>
              </div>
              <p className="text-sm text-muted-foreground">Last synced: 2 minutes ago</p>
              <Button variant="outline" size="sm" onClick={() => requestActivation('Force Sync')}>
                Force Sync
              </Button>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-backup</Label>
              <p className="text-sm text-muted-foreground">Automatically backup data daily</p>
            </div>
            <LockedToggle name="Auto-backup" checked />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-primary" />
            Feature Flags
          </CardTitle>
          <CardDescription>Enable or disable experimental features</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Beta Features</Label>
              <p className="text-sm text-muted-foreground">Enable access to beta features before general release</p>
            </div>
            <LockedToggle name="Beta Features" />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>AI Suggestions</Label>
              <p className="text-sm text-muted-foreground">Enable AI-powered reply suggestions</p>
            </div>
            <LockedToggle name="AI Suggestions" checked />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Advanced Analytics</Label>
              <p className="text-sm text-muted-foreground">Enable detailed analytics dashboard</p>
            </div>
            <LockedToggle name="Advanced Analytics" checked />
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
            <CardDescription>Irreversible actions - proceed with caution</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30">
              <div>
                <h4 className="font-medium text-foreground">Clear All Data</h4>
                <p className="text-sm text-muted-foreground">Remove all contacts, conversations, and messages</p>
              </div>
              <Button
                variant="outline"
                className="text-destructive border-destructive/50 hover:bg-destructive/10"
                onClick={() => requestActivation('Clear All Data')}
              >
                Clear Data
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border border-destructive/30 bg-destructive/5">
              <div>
                <h4 className="font-medium text-foreground">Delete Workspace</h4>
                <p className="text-sm text-muted-foreground">Permanently delete this workspace and all data</p>
              </div>
              <Button variant="destructive" onClick={() => requestActivation('Delete Workspace')}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={contactOpen} onOpenChange={setContactOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <Mail className="w-6 h-6 text-primary" />
            </div>
            <DialogTitle className="text-center">Contact Aireatro Admin</DialogTitle>
            <DialogDescription className="text-center">
              {feature ? (
                <>
                  To activate <span className="font-medium text-foreground">{feature}</span>, please contact our admin team.
                </>
              ) : (
                <>This feature requires admin activation. Please contact our team to enable it.</>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-between gap-2 p-3 rounded-lg border border-border bg-muted/40">
            <span className="text-sm font-medium text-foreground truncate">{ADMIN_EMAIL}</span>
            <Button variant="ghost" size="sm" onClick={copyEmail} className="h-8">
              {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setContactOpen(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button asChild className="w-full sm:w-auto">
              <a href={mailtoHref}>
                <Mail className="w-4 h-4 mr-2" />
                Email Admin
              </a>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
