import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Workflow, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import type { MetaCampaignDraft } from '@/types/meta-campaign';

interface CtwaFlowSelectorProps {
  draft: MetaCampaignDraft;
  updateDraft: (updates: Partial<MetaCampaignDraft>) => void;
}

interface FlowOption {
  id: string;
  name: string;
  status: string;
}

export function CtwaFlowSelector({ draft, updateDraft }: CtwaFlowSelectorProps) {
  const { currentTenant } = useTenant();
  const [flows, setFlows] = useState<FlowOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!currentTenant?.id) return;
    setIsLoading(true);
    supabase
      .from('automation_workflows')
      .select('id, name, status')
      .eq('tenant_id', currentTenant.id)
      .eq('is_deleted', false)
      .order('name')
      .then(({ data }) => {
        setFlows((data || []) as FlowOption[]);
        setIsLoading(false);
      });
  }, [currentTenant?.id]);

  return (
    <Card className="border-0 shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Workflow className="h-4 w-4 text-primary" />
          Post-Click Flow
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Select AIREATRO Flow to run after ad click</Label>
          <Select
            value={draft.flow_id || 'none'}
            onValueChange={v => {
              if (v === 'none') {
                updateDraft({ flow_id: undefined, flow_name: undefined });
              } else {
                const flow = flows.find(f => f.id === v);
                updateDraft({ flow_id: v, flow_name: flow?.name });
              }
            }}
          >
            <SelectTrigger className="h-10"><SelectValue placeholder="No flow — manual handling" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No flow — manual handling</SelectItem>
              {flows.map(f => (
                <SelectItem key={f.id} value={f.id}>
                  <div className="flex items-center gap-2">
                    <span>{f.name}</span>
                    <Badge variant="outline" className="text-[9px] px-1">
                      {f.status}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-[10px] text-muted-foreground">
            The greeting message will map to this flow's trigger. When a user clicks the ad and opens WhatsApp, AIREATRO will automatically start the selected flow.
          </p>
        </div>
        {draft.flow_id && (
          <div className="flex items-center gap-2 p-2 rounded bg-primary/5 border border-primary/10">
            <Workflow className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="text-xs font-medium truncate">{draft.flow_name || draft.flow_id}</span>
            <ExternalLink className="h-3 w-3 text-muted-foreground ml-auto shrink-0" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
