import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Inbox, UserRound, Users2, Route } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import type { WidgetConfig, WidgetRouting } from '@/types/widget';

interface Props {
  config: WidgetConfig;
  onChange: (patch: Partial<WidgetConfig>) => void;
}

export function WidgetRoutingPanel({ config, onChange }: Props) {
  const { currentTenant } = useTenant();
  const tenantId = currentTenant?.id;
  const routing: WidgetRouting = config.routing ?? { mode: 'inbox_unassigned' };

  const [agents, setAgents] = useState<{ id: string; name: string }[]>([]);
  const [teams, setTeams] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    if (!tenantId) return;
    (async () => {
      const { data: a } = await supabase.from('agents' as any)
        .select('id, display_name, user_id').eq('tenant_id', tenantId).eq('is_active', true);
      setAgents(((a as any[]) ?? []).map((x) => ({ id: x.user_id ?? x.id, name: x.display_name || 'Agent' })));
      const { data: t } = await supabase.from('teams' as any)
        .select('id, name').eq('tenant_id', tenantId).eq('is_active', true);
      setTeams((t as any[]) ?? []);
    })();
  }, [tenantId]);

  const update = (patch: Partial<WidgetRouting>) =>
    onChange({ routing: { ...routing, ...patch } as WidgetRouting });

  const modes: { value: WidgetRouting['mode']; label: string; desc: string; icon: any }[] = [
    { value: 'inbox_unassigned', label: 'Common dashboard', desc: 'All agents see new leads in shared Inbox.', icon: Inbox },
    { value: 'specific_agent', label: 'Specific agent', desc: 'Always assign to one chosen agent.', icon: UserRound },
    { value: 'team_round_robin', label: 'Team round-robin', desc: 'Rotate equally across team members.', icon: Users2 },
    { value: 'none', label: 'Don\'t push to Inbox', desc: 'Store as widget lead only (Leads tab).', icon: Route },
  ];

  return (
    <Card className="p-3 space-y-3 bg-card/60">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <Route className="h-4 w-4" /> Lead routing
      </div>
      <p className="text-xs text-muted-foreground">
        Choose how widget leads land in Aireatro. Conversations open in your Inbox tagged <span className="font-mono">website_widget</span>.
      </p>

      <div className="grid grid-cols-2 gap-2">
        {modes.map((m) => {
          const Icon = m.icon;
          const active = routing.mode === m.value;
          return (
            <button
              key={m.value}
              onClick={() => update({ mode: m.value })}
              className={`text-left p-3 rounded-xl border transition-all ${
                active ? 'border-primary bg-primary/10 ring-2 ring-primary/30' : 'border-border/50 hover:border-primary/50 bg-card/50'
              }`}
            >
              <div className="flex items-center gap-2 text-sm font-semibold"><Icon className="h-3.5 w-3.5" />{m.label}</div>
              <div className="text-[11px] text-muted-foreground mt-1">{m.desc}</div>
            </button>
          );
        })}
      </div>

      {routing.mode === 'specific_agent' && (
        <div className="space-y-1">
          <Label className="text-xs">Assign every lead to</Label>
          <Select value={routing.agent_id ?? ''} onValueChange={(v) => update({ agent_id: v })}>
            <SelectTrigger><SelectValue placeholder="Choose an agent" /></SelectTrigger>
            <SelectContent>
              {agents.length === 0 && <SelectItem value="__none" disabled>No active agents</SelectItem>}
              {agents.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      )}

      {routing.mode === 'team_round_robin' && (
        <div className="space-y-1">
          <Label className="text-xs">Rotate across team</Label>
          <Select value={routing.team_id ?? ''} onValueChange={(v) => update({ team_id: v })}>
            <SelectTrigger><SelectValue placeholder="Choose a team" /></SelectTrigger>
            <SelectContent>
              {teams.length === 0 && <SelectItem value="__none" disabled>No active teams</SelectItem>}
              {teams.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      )}
    </Card>
  );
}
