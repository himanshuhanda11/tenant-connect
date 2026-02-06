import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAdminApi } from '@/hooks/useAdminApi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { Loader2, Shield, Zap, Globe, Bot, FileText, AlertTriangle, RefreshCw } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface PlatformSetting {
  key: string;
  value: any;
  updated_at: string;
  updated_by: string | null;
}

interface FlagConfig {
  key: string;
  label: string;
  description: string;
  icon: React.ElementType;
  dangerous?: boolean;
  superOnly?: boolean;
}

const platformFlags: FlagConfig[] = [
  {
    key: 'support_read_only',
    label: 'Support Read-Only Mode',
    description: 'Prevents support team from making any mutations during incidents.',
    icon: Shield,
    dangerous: true,
    superOnly: true,
  },
  {
    key: 'emergency_stop',
    label: 'Emergency Stop — Pause All Sending',
    description: 'Globally halts all WhatsApp message sending across all workspaces.',
    icon: AlertTriangle,
    dangerous: true,
    superOnly: true,
  },
  {
    key: 'ai_features_global',
    label: 'AI Features (Global)',
    description: 'Enable or disable AI-powered features platform-wide.',
    icon: Bot,
    superOnly: true,
  },
];

const defaultWorkspaceFlags: FlagConfig[] = [
  { key: 'default_enable_ai', label: 'Enable AI', description: 'New workspaces get AI features enabled by default.', icon: Bot },
  { key: 'default_enable_ads', label: 'Enable Ads', description: 'New workspaces get Meta Ads integration enabled.', icon: Globe },
  { key: 'default_enable_integrations', label: 'Enable Integrations', description: 'New workspaces can use third-party integrations.', icon: Zap },
  { key: 'default_enable_autoforms', label: 'Enable AutoForms', description: 'New workspaces can use WhatsApp form builder.', icon: FileText },
];

export default function AdminSettings() {
  const { role, readOnly } = useOutletContext<{ role: string; readOnly: boolean }>();
  const { get, post, loading } = useAdminApi();
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [loadingState, setLoadingState] = useState(true);
  const [confirmFlag, setConfirmFlag] = useState<FlagConfig | null>(null);
  const [pendingValue, setPendingValue] = useState(false);

  const isSuperAdmin = role === 'super_admin';

  const loadSettings = async () => {
    setLoadingState(true);
    try {
      const data = await get('settings');
      const map: Record<string, any> = {};
      (data.settings || []).forEach((s: PlatformSetting) => {
        map[s.key] = s.value;
      });
      setSettings(map);
    } catch {
      toast({ title: 'Failed to load settings', variant: 'destructive' });
    } finally {
      setLoadingState(false);
    }
  };

  useEffect(() => { loadSettings(); }, []);

  const toggleFlag = async (key: string, value: boolean) => {
    try {
      await post('settings', { key, value });
      setSettings(prev => ({ ...prev, [key]: value }));
      toast({ title: 'Setting updated', description: `${key} is now ${value ? 'enabled' : 'disabled'}.` });
    } catch (e: any) {
      toast({ title: 'Failed to update', description: e.message, variant: 'destructive' });
    }
  };

  const handleToggle = (flag: FlagConfig, newValue: boolean) => {
    if (flag.dangerous) {
      setConfirmFlag(flag);
      setPendingValue(newValue);
    } else {
      toggleFlag(flag.key, newValue);
    }
  };

  const confirmToggle = () => {
    if (confirmFlag) {
      toggleFlag(confirmFlag.key, pendingValue);
      setConfirmFlag(null);
    }
  };

  if (loadingState) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  const renderFlag = (flag: FlagConfig) => {
    const Icon = flag.icon;
    const isEnabled = settings[flag.key] === true;
    const disabled = readOnly || (flag.superOnly && !isSuperAdmin);

    return (
      <div
        key={flag.key}
        className="flex items-start gap-4 p-4 rounded-xl hover:bg-muted/30 transition-colors"
      >
        <div className={`h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
          flag.dangerous ? 'bg-destructive/10' : 'bg-primary/10'
        }`}>
          <Icon className={`h-4 w-4 ${flag.dangerous ? 'text-destructive' : 'text-primary'}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{flag.label}</span>
            {flag.dangerous && (
              <Badge variant="outline" className="text-[9px] h-4 px-1.5 bg-destructive/5 text-destructive border-destructive/20">
                Dangerous
              </Badge>
            )}
            {flag.superOnly && (
              <Badge variant="outline" className="text-[9px] h-4 px-1.5">
                super_admin
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{flag.description}</p>
        </div>
        <Switch
          checked={isEnabled}
          onCheckedChange={(val) => handleToggle(flag, val)}
          disabled={disabled}
        />
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Platform Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage global feature flags and platform-wide configuration.
          </p>
        </div>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={loadSettings}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Platform-wide flags */}
      <Card className="rounded-2xl shadow-sm border-border/50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <Shield className="h-3.5 w-3.5 text-primary" />
            </div>
            Platform-wide Flags
          </CardTitle>
          <CardDescription className="text-xs">
            These flags affect the entire platform immediately.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-1 pt-0">
          {platformFlags.map(renderFlag)}
        </CardContent>
      </Card>

      {/* Default workspace flags */}
      <Card className="rounded-2xl shadow-sm border-border/50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-blue-50 flex items-center justify-center">
              <Zap className="h-3.5 w-3.5 text-blue-600" />
            </div>
            Default Workspace Flags
          </CardTitle>
          <CardDescription className="text-xs">
            Default feature flags applied to newly created workspaces.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-1 pt-0">
          {defaultWorkspaceFlags.map(renderFlag)}
        </CardContent>
      </Card>

      {/* Confirm Dialog */}
      <AlertDialog open={!!confirmFlag} onOpenChange={() => setConfirmFlag(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Confirm: {confirmFlag?.label}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingValue
                ? `Enabling "${confirmFlag?.label}" will take effect immediately. This may impact platform operations.`
                : `Disabling "${confirmFlag?.label}" will take effect immediately.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmToggle}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {pendingValue ? 'Enable' : 'Disable'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
