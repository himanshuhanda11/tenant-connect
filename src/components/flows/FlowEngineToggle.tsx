import React, { useEffect, useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Loader2, Zap, Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { toast } from 'sonner';

export const FlowEngineToggle: React.FC = () => {
  const { currentTenant } = useTenant();
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!currentTenant?.id) return;
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('tenants')
        .select('flow_engine_enabled')
        .eq('id', currentTenant.id)
        .maybeSingle();
      if (!cancelled && !error) setEnabled(!!data?.flow_engine_enabled);
    })();
    return () => { cancelled = true; };
  }, [currentTenant?.id]);

  const toggle = async (next: boolean) => {
    if (!currentTenant?.id) return;
    setSaving(true);
    const prev = enabled;
    setEnabled(next);
    const { error } = await supabase
      .from('tenants')
      .update({ flow_engine_enabled: next })
      .eq('id', currentTenant.id);
    setSaving(false);
    if (error) {
      setEnabled(prev);
      toast.error(error.message || 'Failed to update');
      return;
    }
    toast.success(next ? 'Flow engine enabled' : 'Flow engine disabled');
  };

  if (enabled === null) return null;

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full border bg-card/60 backdrop-blur">
        <div className={`w-7 h-7 rounded-full flex items-center justify-center ${enabled ? 'bg-emerald-500/15 text-emerald-600' : 'bg-muted text-muted-foreground'}`}>
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-xs font-medium">Flow Engine</span>
          <span className="text-[10px] text-muted-foreground">
            {enabled ? 'Live — runs published flows' : 'Off — flows saved but not executed'}
          </span>
        </div>
        <Badge
          variant="outline"
          className={`text-[10px] ${enabled ? 'border-emerald-500/40 text-emerald-600' : 'border-muted-foreground/30 text-muted-foreground'}`}
        >
          {enabled ? 'ON' : 'OFF'}
        </Badge>
        <Switch checked={enabled} disabled={saving} onCheckedChange={toggle} aria-label="Toggle flow engine" />
        <Tooltip>
          <TooltipTrigger asChild>
            <button className="text-muted-foreground hover:text-foreground" aria-label="What is the Flow Engine?">
              <Info className="w-3.5 h-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs text-xs">
            When ON, incoming WhatsApp messages that match your published flow triggers will run the new flow engine
            (welcome, questions, conditions, delays, assignment). Existing form-rules, auto-replies, and AI bot
            continue to work unchanged.
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
};
