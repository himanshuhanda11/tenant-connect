import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Target,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  XCircle,
  User,
  ArrowRightLeft,
  Tag,
  Pencil,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';

interface LeadQualificationPanelProps {
  contactId: string | null;
  conversationId: string | null;
  isMobile?: boolean;
}

const STAGE_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  new: { label: 'New', icon: <HelpCircle className="h-3.5 w-3.5" />, color: 'bg-blue-100 text-blue-700 border-blue-200' },
  qualifying: { label: 'Qualifying', icon: <Target className="h-3.5 w-3.5" />, color: 'bg-amber-100 text-amber-700 border-amber-200' },
  qualified: { label: 'Qualified', icon: <CheckCircle2 className="h-3.5 w-3.5" />, color: 'bg-green-100 text-green-700 border-green-200' },
  needs_agent: { label: 'Needs Agent', icon: <AlertCircle className="h-3.5 w-3.5" />, color: 'bg-red-100 text-red-700 border-red-200' },
  unqualified: { label: 'Unqualified', icon: <XCircle className="h-3.5 w-3.5" />, color: 'bg-gray-100 text-gray-600 border-gray-200' },
};

export function LeadQualificationPanel({ contactId, conversationId, isMobile }: LeadQualificationPanelProps) {
  const { currentTenant } = useTenant();
  const [lead, setLead] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!contactId || !currentTenant?.id) { setLoading(false); return; }

    const fetchLead = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('qualified_leads')
        .select('*')
        .eq('workspace_id', currentTenant.id)
      .eq('contact_id', contactId)
      .order('updated_at', { ascending: false })
      .limit(1);
      const lead = data?.[0] || null;
      setLead(data);
      setLoading(false);
    };
    fetchLead();
  }, [contactId, currentTenant?.id]);

  const handleStageUpdate = async (stage: string) => {
    if (!lead?.id) return;
    await supabase.from('qualified_leads').update({ lead_stage: stage as any, updated_at: new Date().toISOString() }).eq('id', lead.id);
    setLead((prev: any) => prev ? { ...prev, lead_stage: stage } : prev);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        <Target className="h-8 w-8 mx-auto mb-2 opacity-30" />
        <p>No lead data yet</p>
        <p className="text-xs mt-1">AI will create a lead when it processes a message</p>
      </div>
    );
  }

  const stageConf = STAGE_CONFIG[lead.lead_stage] || STAGE_CONFIG.new;
  const captured = (typeof lead.captured === 'object' && lead.captured) ? lead.captured as Record<string, any> : {};
  const capturedEntries = Object.entries(captured).filter(([, v]) => v != null && v !== '');
  const missingFields: string[] = Array.isArray(lead.missing_fields) ? lead.missing_fields : [];
  const tags: string[] = [];

  return (
    <ScrollArea className={cn("flex-1", isMobile ? "max-h-[50vh]" : "")}>
      <div className="p-4 space-y-4">
        {/* Lead Stage */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            Lead Stage
          </h4>
          <Badge variant="outline" className={cn("text-sm px-3 py-1 gap-1.5", stageConf.color)}>
            {stageConf.icon}
            {stageConf.label}
          </Badge>
          {lead.confidence != null && (
            <p className="text-xs text-muted-foreground">
              Confidence: <span className="font-medium">{Math.round(lead.confidence * 100)}%</span>
            </p>
          )}
          {lead.intent && lead.intent !== 'unknown' && (
            <p className="text-xs text-muted-foreground">
              Intent: <span className="font-medium capitalize">{lead.intent.replace(/_/g, ' ')}</span>
            </p>
          )}
        </div>

        <Separator />

        {/* Captured Fields */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Captured Data ({capturedEntries.length})
          </h4>
          {capturedEntries.length > 0 ? (
            <div className="space-y-1.5">
              {capturedEntries.map(([key, value]) => (
                <div key={key} className="flex items-center justify-between text-sm bg-muted/50 rounded-md px-2.5 py-1.5">
                  <span className="text-muted-foreground capitalize">{key.replace(/_/g, ' ')}</span>
                  <span className="font-medium truncate ml-2 max-w-[60%] text-right">{String(value)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No data captured yet</p>
          )}
        </div>

        {/* Missing Fields */}
        {missingFields.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Missing Fields ({missingFields.length})
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {missingFields.map((field) => (
                  <Badge key={field} variant="outline" className="text-xs border-dashed border-amber-300 text-amber-700 bg-amber-50/50">
                    {field.replace(/_/g, ' ')}
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Handoff Reason */}
        {lead.handoff_reason && (
          <>
            <Separator />
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Handoff Reason
              </h4>
              <p className="text-sm text-destructive/80 bg-destructive/5 rounded-md p-2 border border-destructive/10">
                {lead.handoff_reason}
              </p>
            </div>
          </>
        )}

        <Separator />

        {/* Quick Actions */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Quick Actions
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs gap-1 justify-start"
              onClick={() => handleStageUpdate('qualified')}
              disabled={lead.lead_stage === 'qualified'}
            >
              <ThumbsUp className="h-3 w-3 text-green-600" />
              Mark Qualified
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs gap-1 justify-start"
              onClick={() => handleStageUpdate('unqualified')}
              disabled={lead.lead_stage === 'unqualified'}
            >
              <ThumbsDown className="h-3 w-3 text-red-600" />
              Mark Unqualified
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs gap-1 justify-start"
              onClick={() => handleStageUpdate('needs_agent')}
            >
              <User className="h-3 w-3" />
              Needs Agent
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs gap-1 justify-start"
            >
              <Tag className="h-3 w-3" />
              Add Tag
            </Button>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}
