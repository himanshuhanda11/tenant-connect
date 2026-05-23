import { useMemo } from 'react';
import { Contact } from '@/types/contact';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Sparkles,
  Flame,
  UserCheck,
  CheckCircle2,
  XCircle,
  Clock,
  MessageCircle,
} from 'lucide-react';
import { formatDistanceToNowStrict } from 'date-fns';
import { cn } from '@/lib/utils';

type Column = {
  id: string;
  label: string;
  icon: React.ElementType;
  accent: string; // hsl token class for top bar/dot
  match: (c: Contact, summary?: any) => boolean;
};

const COLUMNS: Column[] = [
  {
    id: 'new',
    label: 'New',
    icon: Sparkles,
    accent: 'bg-sky-500',
    match: (c, s) => (s?.lead_state ?? c.lead_status) === 'new' || !s?.lead_state && !c.lead_status,
  },
  {
    id: 'engaged',
    label: 'Engaged',
    icon: MessageCircle,
    accent: 'bg-violet-500',
    match: (_c, s) => s?.lead_state === 'engaged' || s?.lead_state === 'claimed',
  },
  {
    id: 'qualified',
    label: 'Qualified',
    icon: Flame,
    accent: 'bg-amber-500',
    match: (c, s) => s?.lead_state === 'qualified' || c.lead_status === 'qualified' || c.priority_level === 'high',
  },
  {
    id: 'assigned',
    label: 'Assigned',
    icon: UserCheck,
    accent: 'bg-primary',
    match: (_c, s) => !!s?.assigned_to && s?.lead_state !== 'closed',
  },
  {
    id: 'closed',
    label: 'Won',
    icon: CheckCircle2,
    accent: 'bg-emerald-500',
    match: (c, s) => s?.lead_state === 'closed' || c.closed === true,
  },
  {
    id: 'lost',
    label: 'Lost / Opted out',
    icon: XCircle,
    accent: 'bg-rose-500',
    match: (c) => c.opt_out === true || c.lead_status === 'lost',
  },
];

interface Props {
  contacts: Contact[];
  loading: boolean;
  inboxSummaries: Record<string, any>;
  onSelectContact: (c: Contact) => void;
  selectedContactId?: string;
}

export function ContactsKanbanView({
  contacts,
  loading,
  inboxSummaries,
  onSelectContact,
  selectedContactId,
}: Props) {
  const grouped = useMemo(() => {
    const map: Record<string, Contact[]> = {};
    COLUMNS.forEach((c) => (map[c.id] = []));
    const used = new Set<string>();
    // Priority: assign each contact to FIRST matching column to avoid duplicates
    contacts.forEach((c) => {
      const summary = inboxSummaries[c.id];
      for (const col of COLUMNS) {
        if (col.match(c, summary)) {
          map[col.id].push(c);
          used.add(c.id);
          break;
        }
      }
      if (!used.has(c.id)) map['new'].push(c);
    });
    return map;
  }, [contacts, inboxSummaries]);

  return (
    <ScrollArea className="w-full">
      <div className="flex gap-4 pb-4 min-h-[500px]">
        {COLUMNS.map((col) => {
          const items = grouped[col.id] || [];
          return (
            <div
              key={col.id}
              className="flex-shrink-0 w-[280px] flex flex-col rounded-2xl border border-border/60 bg-card/40 backdrop-blur-sm overflow-hidden"
            >
              {/* Column header */}
              <div className="flex items-center justify-between px-3 py-2.5 border-b border-border/40 bg-card/60">
                <div className="flex items-center gap-2">
                  <span className={cn('h-2 w-2 rounded-full', col.accent)} />
                  <col.icon className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-foreground">
                    {col.label}
                  </span>
                </div>
                <Badge
                  variant="secondary"
                  className="h-5 min-w-5 px-1.5 rounded-full text-[10px] font-medium tabular-nums"
                >
                  {items.length}
                </Badge>
              </div>

              {/* Cards */}
              <div className="flex-1 p-2 space-y-2">
                {loading && items.length === 0 ? (
                  <>
                    <Skeleton className="h-20 w-full rounded-xl" />
                    <Skeleton className="h-20 w-full rounded-xl" />
                  </>
                ) : items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="text-[11px] text-muted-foreground/70">No contacts</div>
                  </div>
                ) : (
                  items.map((contact) => {
                    const summary = inboxSummaries[contact.id];
                    const initials = (contact.name || contact.first_name || contact.wa_id || '?')
                      .split(' ')
                      .map((w) => w[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase();
                    const lastAt = summary?.last_message_at || contact.last_seen || contact.updated_at;
                    const isHot =
                      contact.priority_level === 'high' ||
                      (contact.tags || []).some((t: any) => /hot/i.test(t?.tag?.name || ''));

                    return (
                      <button
                        key={contact.id}
                        onClick={() => onSelectContact(contact)}
                        className={cn(
                          'w-full text-left rounded-xl border bg-card p-3 transition-all',
                          'hover:shadow-md hover:-translate-y-0.5 hover:border-primary/40',
                          selectedContactId === contact.id
                            ? 'border-primary/60 ring-1 ring-primary/20 shadow-sm'
                            : 'border-border/50'
                        )}
                      >
                        <div className="flex items-start gap-2.5">
                          <Avatar className="h-9 w-9 ring-2 ring-card shrink-0">
                            <AvatarImage src={contact.profile_picture_url || undefined} />
                            <AvatarFallback className="text-[10px] bg-gradient-to-br from-primary/20 to-primary/5 text-primary font-semibold">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <p className="text-sm font-semibold text-foreground truncate">
                                {contact.name || contact.first_name || contact.wa_id}
                              </p>
                              {isHot && (
                                <Flame className="h-3 w-3 text-amber-500 shrink-0" />
                              )}
                            </div>
                            <p className="text-[11px] text-muted-foreground tabular-nums truncate">
                              {contact.wa_id}
                            </p>
                          </div>
                        </div>

                        {/* Tags */}
                        {(contact.tags || []).length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {(contact.tags || []).slice(0, 2).map((t: any) => (
                              <span
                                key={t.id}
                                className="text-[10px] px-1.5 py-0.5 rounded-md bg-muted/60 text-muted-foreground truncate max-w-[100px]"
                              >
                                {t?.tag?.name}
                              </span>
                            ))}
                            {(contact.tags || []).length > 2 && (
                              <span className="text-[10px] text-muted-foreground/70">
                                +{(contact.tags || []).length - 2}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Footer meta */}
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/30">
                          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>
                              {lastAt
                                ? formatDistanceToNowStrict(new Date(lastAt), { addSuffix: false })
                                : '—'}
                            </span>
                          </div>
                          {summary?.assigned_agent && (
                            <span className="text-[10px] text-muted-foreground truncate max-w-[110px]">
                              {summary.assigned_agent.full_name || summary.assigned_agent.email}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
