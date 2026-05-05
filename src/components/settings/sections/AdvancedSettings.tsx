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
    try {
      await navigator.clipboard.writeText(ADMIN_EMAIL);
      setCopied(true);
      toast.success('Email copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Could not copy. Please copy manually.');
    }
  };

  const mailtoHref = `mailto:${ADMIN_EMAIL}?subject=${encodeURIComponent(
    `Request: ${feature || 'Advanced Settings'}`
  )}&body=${encodeURIComponent(
    `Hi Aireatro Admin,\n\nI would like to request the following action for my workspace:\n\nAction: ${feature}\n\nPlease assist.\n\nThanks.`
  )}`;

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
            <Switch defaultChecked />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Lazy Load Messages</Label>
              <p className="text-sm text-muted-foreground">Load message history on demand</p>
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
              <Button variant="outline" size="sm">Request Export</Button>
            </div>

            <div className="p-4 rounded-lg border border-border space-y-3">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-primary" />
                <h4 className="font-medium text-foreground">Sync Status</h4>
              </div>
              <p className="text-sm text-muted-foreground">Last synced: 2 minutes ago</p>
              <Button variant="outline" size="sm">Force Sync</Button>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-backup</Label>
              <p className="text-sm text-muted-foreground">Automatically backup data daily</p>
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
          <CardDescription>Enable or disable experimental features</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Beta Features</Label>
              <p className="text-sm text-muted-foreground">Enable access to beta features before general release</p>
            </div>
            <Switch />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>AI Suggestions</Label>
              <p className="text-sm text-muted-foreground">Enable AI-powered reply suggestions</p>
            </div>
            <Switch defaultChecked />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Advanced Analytics</Label>
              <p className="text-sm text-muted-foreground">Enable detailed analytics dashboard</p>
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
            <CardDescription>Irreversible actions - proceed with caution</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-lg border border-border bg-muted/30">
              <div>
                <h4 className="font-medium text-foreground">Clear All Data</h4>
                <p className="text-sm text-muted-foreground">Remove all contacts, conversations, and messages</p>
              </div>
              <Button
                variant="outline"
                className="text-destructive border-destructive/50 hover:bg-destructive/10 w-full sm:w-auto"
                onClick={() => requestActivation('Clear All Data')}
              >
                Clear Data
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-lg border border-destructive/30 bg-destructive/5">
              <div>
                <h4 className="font-medium text-foreground">Delete Workspace</h4>
                <p className="text-sm text-muted-foreground">Permanently delete this workspace and all data</p>
              </div>
              <Button
                variant="destructive"
                className="w-full sm:w-auto"
                onClick={() => requestActivation('Delete Workspace')}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={contactOpen} onOpenChange={setContactOpen}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-md p-5 sm:p-6 rounded-2xl gap-4">
          <DialogHeader className="space-y-3">
            <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <Mail className="w-7 h-7 text-primary" />
            </div>
            <DialogTitle className="text-center text-lg">Contact Aireatro Admin</DialogTitle>
            <DialogDescription className="text-center text-sm leading-relaxed">
              {feature ? (
                <>
                  To proceed with <span className="font-semibold text-foreground">{feature}</span>, please reach out to our admin team. This action requires manual review for your safety.
                </>
              ) : (
                <>This action requires admin assistance. Please contact our team to proceed.</>
              )}
            </DialogDescription>
          </DialogHeader>

          <button
            type="button"
            onClick={copyEmail}
            className="w-full flex items-center justify-between gap-2 p-3 rounded-lg border border-border bg-muted/40 hover:bg-muted/60 transition-colors active:scale-[0.99]"
          >
            <span className="text-sm font-medium text-foreground truncate text-left">{ADMIN_EMAIL}</span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
              {copied ? (
                <><Check className="w-4 h-4 text-primary" /> Copied</>
              ) : (
                <><Copy className="w-4 h-4" /> Copy</>
              )}
            </span>
          </button>

          <DialogFooter className="flex-col-reverse sm:flex-row gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => setContactOpen(false)}
              className="w-full sm:w-auto"
            >
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
