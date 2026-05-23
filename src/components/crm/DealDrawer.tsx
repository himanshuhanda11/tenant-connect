import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Phone, Mail, MoreHorizontal, Sparkles, Trash2, Pin, X, TrendingUp, Target, AlertCircle, ListTodo, UserCircle2 } from 'lucide-react';
import { useDealActivities, useDealNotes } from '@/hooks/useCrm';
import { useCrmOwners } from '@/hooks/useCrmExtras';
import { DealTasksTab } from './DealTasksTab';
import { PRIORITY_META, type Deal, type PipelineStage } from '@/types/crm';
import { formatDistanceToNow, format } from 'date-fns';
import { cn } from '@/lib/utils';

interface Props {
  deal: Deal | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  stages: PipelineStage[];
  onUpdate: (id: string, patch: Partial<Deal>) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}

export function DealDrawer({ deal, open, onOpenChange, stages, onUpdate, onDelete }: Props) {
  const { activities } = useDealActivities(deal?.id ?? null);
  const { notes, addNote, deleteNote } = useDealNotes(deal?.id ?? null);
  const { owners } = useCrmOwners();
  const [noteInput, setNoteInput] = useState('');

  if (!deal) return null;

  const currentStage = stages.find(s => s.id === deal.stage_id);
  const priority = PRIORITY_META[deal.priority];
  const valueFmt = new Intl.NumberFormat(undefined, {
    style: 'currency', currency: deal.currency || 'USD', maximumFractionDigits: 0,
  }).format(Number(deal.value || 0));

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl p-0 flex flex-col">
        {/* Header */}
        <SheetHeader className="px-5 pt-5 pb-4 border-b border-border/60 bg-gradient-to-br from-card via-card to-primary/5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <SheetTitle className="text-lg font-bold leading-tight pr-6">{deal.title}</SheetTitle>
              {deal.company_name && (
                <p className="text-sm text-muted-foreground mt-1">{deal.company_name}</p>
              )}
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                <span className="text-2xl font-bold tabular-nums">{valueFmt}</span>
                <Badge variant="outline" className={cn('font-medium', priority.color)}>
                  {priority.label}
                </Badge>
                <Select value={deal.stage_id} onValueChange={(v) => onUpdate(deal.id, { stage_id: v })}>
                  <SelectTrigger className="h-7 w-auto gap-1.5 text-xs font-medium border-dashed">
                    <span className="h-2 w-2 rounded-full" style={{ background: currentStage?.color }} />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {stages.map(s => (
                      <SelectItem key={s.id} value={s.id}>
                        <span className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
                          {s.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </SheetHeader>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="mx-5 mt-3 bg-muted/50 grid grid-cols-4 h-9">
            <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
            <TabsTrigger value="activity" className="text-xs">Activity</TabsTrigger>
            <TabsTrigger value="notes" className="text-xs">Notes</TabsTrigger>
            <TabsTrigger value="ai" className="text-xs gap-1">
              <Sparkles className="h-3 w-3" /> AI
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto px-5 py-4">
            <TabsContent value="overview" className="mt-0 space-y-4">
              <InfoSection title="Deal details">
                <InfoRow label="Status" value={<Badge variant="outline" className="capitalize">{deal.status}</Badge>} />
                <InfoRow label="Source" value={deal.lead_source || '—'} />
                <InfoRow label="Expected close" value={deal.expected_close_date ? format(new Date(deal.expected_close_date), 'PP') : '—'} />
                <InfoRow label="Currency" value={deal.currency} />
                <InfoRow label="Created" value={formatDistanceToNow(new Date(deal.created_at), { addSuffix: true })} />
              </InfoSection>

              {deal.tags?.length > 0 && (
                <InfoSection title="Tags">
                  <div className="flex flex-wrap gap-1.5">
                    {deal.tags.map(t => <Badge key={t} variant="secondary">{t}</Badge>)}
                  </div>
                </InfoSection>
              )}

              <InfoSection title="Contact">
                <div className="rounded-xl border border-border/60 p-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{deal.company_name || 'No contact linked'}</p>
                    <p className="text-xs text-muted-foreground">Link contact from Contacts</p>
                  </div>
                </div>
              </InfoSection>
            </TabsContent>

            <TabsContent value="activity" className="mt-0">
              {activities.length === 0 ? (
                <EmptyState text="No activity yet" />
              ) : (
                <ol className="relative border-l border-border/60 ml-1 space-y-3">
                  {activities.map(a => (
                    <li key={a.id} className="ml-4">
                      <div className="absolute -left-1.5 h-3 w-3 rounded-full bg-primary border-2 border-background" />
                      <div className="rounded-lg border border-border/60 bg-card p-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold capitalize">{a.activity_type.replace('_',' ')}</span>
                          <span className="text-[10px] text-muted-foreground">
                            {formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        {a.content && <p className="text-xs text-muted-foreground mt-1">{a.content}</p>}
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </TabsContent>

            <TabsContent value="notes" className="mt-0 space-y-3">
              <div className="space-y-2">
                <Textarea
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  placeholder="Add a note..."
                  className="min-h-[70px] text-sm"
                />
                <Button
                  size="sm"
                  onClick={async () => { await addNote(noteInput); setNoteInput(''); }}
                  disabled={!noteInput.trim()}
                >Add note</Button>
              </div>
              {notes.length === 0 ? <EmptyState text="No notes yet" /> : (
                <div className="space-y-2">
                  {notes.map(n => (
                    <div key={n.id} className="rounded-lg border border-border/60 bg-card p-3 group">
                      <p className="text-sm whitespace-pre-wrap">{n.content}</p>
                      <div className="mt-1.5 flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground">
                          {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                        </span>
                        <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => deleteNote(n.id)}>
                          <Trash2 className="h-3 w-3 text-muted-foreground" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="ai" className="mt-0 space-y-3">
              <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="h-6 w-6 rounded-lg bg-primary/15 text-primary flex items-center justify-center shadow-[0_0_12px_hsl(var(--primary)/0.4)]">
                    <Sparkles className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary">AI Insights</span>
                  <Badge variant="outline" className="ml-auto text-[10px]">Coming soon</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Lead quality, next-best-action and conversion predictions will appear here once AI is connected.
                </p>
              </div>
              <AiCard icon={Target} label="Lead quality" value="—" />
              <AiCard icon={TrendingUp} label="Conversion probability" value="—" />
              <AiCard icon={AlertCircle} label="Risk score" value="—" />
            </TabsContent>
          </div>

          {/* Sticky actions */}
          <div className="border-t border-border/60 bg-card/95 backdrop-blur p-3 flex items-center gap-2">
            <Button variant="outline" size="sm" className="flex-1 gap-1.5">
              <MessageSquare className="h-3.5 w-3.5" /> WhatsApp
            </Button>
            <Button variant="outline" size="sm" className="flex-1 gap-1.5">
              <Phone className="h-3.5 w-3.5" /> Call
            </Button>
            <Button variant="outline" size="sm" className="flex-1 gap-1.5">
              <Mail className="h-3.5 w-3.5" /> Email
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive hover:bg-destructive/10"
              onClick={async () => { if (confirm('Delete this deal?')) { await onDelete(deal.id); onOpenChange(false); } }}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

function InfoSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">{title}</h4>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5 px-3 rounded-lg hover:bg-muted/40 text-sm">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

function AiCard({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-3 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <span className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </span>
        <span className="text-sm font-medium">{label}</span>
      </div>
      <span className="text-sm font-semibold text-muted-foreground">{value}</span>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="text-center py-10 text-sm text-muted-foreground/70">{text}</div>;
}
