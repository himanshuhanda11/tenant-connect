import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Settings, Shield, BarChart3, Activity } from 'lucide-react';

interface OverviewTabProps {
  entitlements: any;
  isSuperAdmin: boolean;
  onToggle: (field: string, value: boolean) => void;
  onLimitChange: (field: string, value: string) => void;
  onEntitlementsChange: (updater: (prev: any) => any) => void;
}

const FEATURE_FLAGS = [
  { key: 'enable_ai', label: 'AI Features' },
  { key: 'enable_ads', label: 'Meta Ads' },
  { key: 'enable_integrations', label: 'Integrations' },
  { key: 'enable_autoforms', label: 'Auto Forms' },
];

const LIMITS = [
  { key: 'monthly_conversation_limit', label: 'Conversations/mo', usageKey: 'conversations_used' },
  { key: 'monthly_broadcast_limit', label: 'Broadcasts/mo', usageKey: 'broadcasts_used' },
  { key: 'monthly_template_limit', label: 'Templates/mo', usageKey: 'templates_used' },
  { key: 'monthly_flow_limit', label: 'Flows/mo', usageKey: 'flows_used' },
];

export function OverviewTab({ entitlements, isSuperAdmin, onToggle, onLimitChange, onEntitlementsChange }: OverviewTabProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Status & Plan */}
      <Card className="rounded-2xl shadow-sm border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <Settings className="h-3.5 w-3.5 text-primary" />
            </div>
            Feature Flags
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between py-1">
            <Label className="text-sm">Sending Paused</Label>
            <Badge variant={entitlements?.sending_paused ? 'destructive' : 'secondary'} className="text-[11px]">
              {entitlements?.sending_paused ? 'Paused' : 'Active'}
            </Badge>
          </div>
          {FEATURE_FLAGS.map(f => (
            <div key={f.key} className="flex items-center justify-between py-1">
              <Label className="text-sm">{f.label}</Label>
              <Switch checked={entitlements?.[f.key] ?? true} onCheckedChange={v => onToggle(f.key, v)} />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Usage & Limits */}
      <Card className="rounded-2xl shadow-sm border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-purple-50 flex items-center justify-center">
              <BarChart3 className="h-3.5 w-3.5 text-purple-600" />
            </div>
            Usage & Limits
            {!isSuperAdmin && <span className="text-xs text-muted-foreground font-normal">(read-only)</span>}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {LIMITS.map(l => {
            const limit = entitlements?.[l.key] ?? 0;
            const used = entitlements?.[l.usageKey] ?? 0;
            const pct = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;
            return (
              <div key={l.key} className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <Label className="text-sm">{l.label}</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{used} /</span>
                    <Input
                      type="number"
                      className="w-20 text-right rounded-xl h-7 text-xs"
                      value={entitlements?.[l.key] ?? ''}
                      disabled={!isSuperAdmin}
                      onBlur={e => isSuperAdmin && onLimitChange(l.key, e.target.value)}
                      onChange={e => onEntitlementsChange((prev: any) => ({ ...prev, [l.key]: e.target.value }))}
                    />
                  </div>
                </div>
                <Progress value={pct} className="h-1.5" />
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Recent Activity Summary */}
      <Card className="rounded-2xl shadow-sm border-border/50 md:col-span-2">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-blue-50 flex items-center justify-center">
              <Activity className="h-3.5 w-3.5 text-blue-600" />
            </div>
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Messages (7d)', value: entitlements?.messages_7d ?? '—' },
              { label: 'Active flows', value: entitlements?.active_flows ?? '—' },
              { label: 'Templates approved', value: entitlements?.templates_approved ?? '—' },
              { label: 'Campaigns sent', value: entitlements?.campaigns_sent ?? '—' },
            ].map(s => (
              <div key={s.label} className="text-center p-3 rounded-xl bg-muted/40">
                <p className="text-lg font-bold">{s.value}</p>
                <p className="text-[11px] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
