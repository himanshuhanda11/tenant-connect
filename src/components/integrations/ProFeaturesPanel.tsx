import React, { useState } from 'react';
import {
  Lock,
  Shield,
  Gauge,
  Clock,
  Sparkles,
  AlertTriangle,
  Plus,
  Trash2,
  Info,
  Zap,
  Crown,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

interface ProFeaturesPanelProps {
  integrationKey: string;
  isPro?: boolean;
  config?: ProConfig;
  onSave: (config: ProConfig) => void;
}

export interface ProConfig {
  rateLimiting: {
    enabled: boolean;
    maxPerMinute: number;
    maxPerHour: number;
    maxPerDay: number;
  };
  ipAllowlist: {
    enabled: boolean;
    ips: string[];
  };
  retryPolicy: {
    enabled: boolean;
    maxAttempts: number;
    backoffMultiplier: number;
    initialDelaySeconds: number;
  };
  slaEscalation: {
    enabled: boolean;
    thresholdMinutes: number;
    escalateToAgentId?: string;
    notifyEmail?: string;
  };
  aiSuggestions: {
    enabled: boolean;
  };
}

const DEFAULT_CONFIG: ProConfig = {
  rateLimiting: {
    enabled: false,
    maxPerMinute: 60,
    maxPerHour: 1000,
    maxPerDay: 10000,
  },
  ipAllowlist: {
    enabled: false,
    ips: [],
  },
  retryPolicy: {
    enabled: true,
    maxAttempts: 3,
    backoffMultiplier: 2,
    initialDelaySeconds: 60,
  },
  slaEscalation: {
    enabled: false,
    thresholdMinutes: 30,
  },
  aiSuggestions: {
    enabled: true,
  },
};

export function ProFeaturesPanel({
  integrationKey,
  isPro = false,
  config = DEFAULT_CONFIG,
  onSave,
}: ProFeaturesPanelProps) {
  const [localConfig, setLocalConfig] = useState<ProConfig>(config);
  const [newIp, setNewIp] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  const updateConfig = <K extends keyof ProConfig>(
    key: K,
    value: ProConfig[K]
  ) => {
    setLocalConfig({ ...localConfig, [key]: value });
    setHasChanges(true);
  };

  const handleAddIp = () => {
    if (newIp && !localConfig.ipAllowlist.ips.includes(newIp)) {
      updateConfig('ipAllowlist', {
        ...localConfig.ipAllowlist,
        ips: [...localConfig.ipAllowlist.ips, newIp],
      });
      setNewIp('');
    }
  };

  const handleRemoveIp = (ip: string) => {
    updateConfig('ipAllowlist', {
      ...localConfig.ipAllowlist,
      ips: localConfig.ipAllowlist.ips.filter((i) => i !== ip),
    });
  };

  const handleSave = () => {
    onSave(localConfig);
    setHasChanges(false);
  };

  const ProBadge = () => (
    <Badge 
      variant="outline" 
      className="bg-gradient-to-r from-violet-500/10 to-purple-500/10 text-violet-600 border-violet-500/30"
    >
      <Crown className="w-3 h-3 mr-1" />
      Pro
    </Badge>
  );

  const FeatureCard = ({
    icon: Icon,
    title,
    description,
    enabled,
    onToggle,
    children,
    locked = false,
  }: {
    icon: React.ElementType;
    title: string;
    description: string;
    enabled: boolean;
    onToggle: (enabled: boolean) => void;
    children?: React.ReactNode;
    locked?: boolean;
  }) => (
    <Card className={cn(
      "transition-all",
      !isPro && locked && "opacity-60",
      enabled && isPro && "border-primary/30 bg-primary/5"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-lg",
              enabled && isPro ? "bg-primary/10" : "bg-muted"
            )}>
              <Icon className={cn(
                "w-5 h-5",
                enabled && isPro ? "text-primary" : "text-muted-foreground"
              )} />
            </div>
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                {title}
                {locked && <ProBadge />}
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                {description}
              </CardDescription>
            </div>
          </div>
          <Switch
            checked={enabled && (isPro || !locked)}
            onCheckedChange={onToggle}
            disabled={!isPro && locked}
          />
        </div>
      </CardHeader>
      {children && enabled && (isPro || !locked) && (
        <CardContent className="pt-0">
          {children}
        </CardContent>
      )}
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Upgrade Banner (if not Pro) */}
      {!isPro && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-pink-500/10 border border-violet-500/20">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-violet-500/20">
              <Crown className="w-6 h-6 text-violet-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">Unlock Pro Features</h3>
              <p className="text-sm text-muted-foreground">
                Get rate limiting, IP allowlists, advanced retries, and AI suggestions
              </p>
            </div>
            <Button className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600">
              Upgrade to Pro
            </Button>
          </div>
        </div>
      )}

      {/* Rate Limiting */}
      <FeatureCard
        icon={Gauge}
        title="Rate Limiting"
        description="Control the number of events processed per time period"
        enabled={localConfig.rateLimiting.enabled}
        onToggle={(enabled) => updateConfig('rateLimiting', { ...localConfig.rateLimiting, enabled })}
        locked
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Max per minute</Label>
              <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">
                {localConfig.rateLimiting.maxPerMinute}
              </span>
            </div>
            <Slider
              value={[localConfig.rateLimiting.maxPerMinute]}
              onValueChange={([v]) => updateConfig('rateLimiting', { 
                ...localConfig.rateLimiting, 
                maxPerMinute: v 
              })}
              max={300}
              min={1}
              step={10}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Max per hour</Label>
              <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">
                {localConfig.rateLimiting.maxPerHour}
              </span>
            </div>
            <Slider
              value={[localConfig.rateLimiting.maxPerHour]}
              onValueChange={([v]) => updateConfig('rateLimiting', { 
                ...localConfig.rateLimiting, 
                maxPerHour: v 
              })}
              max={5000}
              min={10}
              step={100}
            />
          </div>
        </div>
      </FeatureCard>

      {/* IP Allowlist */}
      <FeatureCard
        icon={Shield}
        title="IP Allowlist"
        description="Only accept webhooks from trusted IP addresses"
        enabled={localConfig.ipAllowlist.enabled}
        onToggle={(enabled) => updateConfig('ipAllowlist', { ...localConfig.ipAllowlist, enabled })}
        locked
      >
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Enter IP address (e.g., 192.168.1.1)"
              value={newIp}
              onChange={(e) => setNewIp(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleAddIp} size="sm">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          {localConfig.ipAllowlist.ips.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {localConfig.ipAllowlist.ips.map((ip) => (
                <Badge key={ip} variant="secondary" className="font-mono text-xs">
                  {ip}
                  <button
                    onClick={() => handleRemoveIp(ip)}
                    className="ml-1.5 hover:text-red-500"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              No IPs configured. All IPs will be accepted.
            </p>
          )}
        </div>
      </FeatureCard>

      {/* Retry Policy */}
      <FeatureCard
        icon={Clock}
        title="Advanced Retry Policy"
        description="Configure automatic retry behavior for failed events"
        enabled={localConfig.retryPolicy.enabled}
        onToggle={(enabled) => updateConfig('retryPolicy', { ...localConfig.retryPolicy, enabled })}
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs">Max Attempts</Label>
            <Select
              value={String(localConfig.retryPolicy.maxAttempts)}
              onValueChange={(v) => updateConfig('retryPolicy', {
                ...localConfig.retryPolicy,
                maxAttempts: parseInt(v),
              })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 5, 10].map((n) => (
                  <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Initial Delay (seconds)</Label>
            <Select
              value={String(localConfig.retryPolicy.initialDelaySeconds)}
              onValueChange={(v) => updateConfig('retryPolicy', {
                ...localConfig.retryPolicy,
                initialDelaySeconds: parseInt(v),
              })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[30, 60, 120, 300, 600].map((n) => (
                  <SelectItem key={n} value={String(n)}>{n}s</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </FeatureCard>

      {/* SLA Escalation */}
      <FeatureCard
        icon={AlertTriangle}
        title="SLA-based Escalation"
        description="Automatically escalate if events aren't processed in time"
        enabled={localConfig.slaEscalation.enabled}
        onToggle={(enabled) => updateConfig('slaEscalation', { ...localConfig.slaEscalation, enabled })}
        locked
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Threshold (minutes)</Label>
              <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">
                {localConfig.slaEscalation.thresholdMinutes} min
              </span>
            </div>
            <Slider
              value={[localConfig.slaEscalation.thresholdMinutes]}
              onValueChange={([v]) => updateConfig('slaEscalation', { 
                ...localConfig.slaEscalation, 
                thresholdMinutes: v 
              })}
              max={120}
              min={5}
              step={5}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Notification Email</Label>
            <Input
              type="email"
              placeholder="alerts@company.com"
              value={localConfig.slaEscalation.notifyEmail || ''}
              onChange={(e) => updateConfig('slaEscalation', {
                ...localConfig.slaEscalation,
                notifyEmail: e.target.value,
              })}
            />
          </div>
        </div>
      </FeatureCard>

      {/* AI Suggestions */}
      <FeatureCard
        icon={Sparkles}
        title="AI Suggestions"
        description="Get intelligent recommendations for improving your integrations"
        enabled={localConfig.aiSuggestions.enabled}
        onToggle={(enabled) => updateConfig('aiSuggestions', { ...localConfig.aiSuggestions, enabled })}
        locked
      >
        <div className="p-3 rounded-lg bg-violet-500/10 border border-violet-500/20">
          <div className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-violet-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-violet-600">AI Insight</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Based on your event patterns, consider adding a "payment reminder" 
                template trigger 24 hours after checkout abandonment.
              </p>
            </div>
          </div>
        </div>
      </FeatureCard>

      {/* Save Button */}
      {hasChanges && (
        <div className="flex justify-end">
          <Button onClick={handleSave}>
            <Zap className="w-4 h-4 mr-2" />
            Save Pro Settings
          </Button>
        </div>
      )}
    </div>
  );
}
