import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow, format, startOfDay, isSameDay } from 'date-fns';
import { Activity, MessageSquare, Phone, Mail, ArrowRightLeft, FileText, CheckCircle2, UserPlus, Plus } from 'lucide-react';
import type { Deal, DealActivity } from '@/types/crm';

const ICONS: Record<string, any> = {
  stage_change: ArrowRightLeft,
  note: FileText,
  call: Phone,
  email: Mail,
  whatsapp: MessageSquare,
  assignment: UserPlus,
  task: CheckCircle2,
  created: Plus,
  status_change: Activity,
};

interface Props {
  deals: Deal[];
  onDealClick: (d: Deal) => void;
}

export function ActivityView({ deals, onDealClick }: Props) {
  const { currentTenant } = useTenant();
  const tenantId = currentTenant?.id;
  const [activities, setActivities] = useState<DealActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tenantId) return;
    setLoading(true);
    supabase
      .from('deal_activities' as any)
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
      .limit(100)
      .then(({ data }) => {
        setActivities(((data as any) || []) as DealActivity[]);
        setLoading(false);
      });
  }, [tenantId]);

  const dealMap = useMemo(() => Object.fromEntries(deals.map(d => [d.id, d])), [deals]);

  const grouped = useMemo(() => {
    const map = new Map<string, DealActivity[]>();
    for (const a of activities) {
      const key = format(startOfDay(new Date(a.created_at)), 'yyyy-MM-dd');
      const arr = map.get(key) || [];
      arr.push(a);
      map.set(key, arr);
    }
    return Array.from(map.entries());
  }, [activities]);

  if (loading) {
    return <div className="space-y-2">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>;
  }

  if (activities.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border/60 p-12 text-center text-sm text-muted-foreground">
        No activity yet. Move deals through stages, add notes, or complete tasks to see them here.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4 md:p-6 space-y-6">
      {grouped.map(([day, items]) => {
        const dayDate = new Date(day);
        const isToday = isSameDay(dayDate, new Date());
        return (
          <div key={day}>
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {isToday ? 'Today' : format(dayDate, 'EEEE, MMM d')}
              </h3>
              <span className="flex-1 h-px bg-border/60" />
              <span className="text-[10px] text-muted-foreground">{items.length}</span>
            </div>
            <ol className="relative border-l border-border/60 ml-1 space-y-2">
              {items.map(a => {
                const Icon = ICONS[a.activity_type] || Activity;
                const deal = dealMap[a.deal_id];
                return (
                  <li key={a.id} className="ml-4 relative group">
                    <span className="absolute -left-[22px] top-2 h-6 w-6 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                      <Icon className="h-3 w-3 text-primary" />
                    </span>
                    <button
                      onClick={() => deal && onDealClick(deal)}
                      disabled={!deal}
                      className="w-full text-left rounded-lg border border-border/60 bg-background hover:bg-muted/40 p-3 transition disabled:opacity-60 disabled:cursor-default"
                    >
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <span className="text-xs font-semibold capitalize">{a.activity_type.replace('_', ' ')}</span>
                        <span className="text-[10px] text-muted-foreground">{formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}</span>
                      </div>
                      {deal && <p className="text-sm font-medium truncate">{deal.title}</p>}
                      {a.content && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{a.content}</p>}
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>
        );
      })}
    </div>
  );
}
