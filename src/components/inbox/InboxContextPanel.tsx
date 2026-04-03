import { useState, useCallback } from 'react';
import { ShopifyContextTab } from './shopify/ShopifyContextTab';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MentionTextarea } from './MentionTextarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LeadQualificationPanel } from './LeadQualificationPanel';
import { InboxCRMOverview } from './InboxCRMOverview';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import {
  User, Tag, Zap, FileText, History, Plus, X,
  Phone, Globe, Calendar, Clock, MessageSquare,
  CheckCircle, Hand, Bot, Share2, Copy, ShoppingBag, Target,
  Shield, Star, ArrowRight, Workflow,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { InboxConversation, ConversationEvent, InternalNote, PRIORITY_CONFIG } from '@/types/inbox';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface InboxContextPanelProps {
  conversation: InboxConversation | null;
  events: ConversationEvent[];
  notes: InternalNote[];
  onAddNote: (body: string, mentions: string[]) => void;
  onAddTag: (tagId: string) => void;
  onRemoveTag: (tagId: string) => void;
  availableTags?: Array<{ id: string; name: string; color: string }>;
  isMobile?: boolean;
  onInsertReply?: (text: string) => void;
}

// Section wrapper for consistent spacing and labels
function PanelSection({ title, icon, children, className }: { title: string; icon?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("space-y-2.5", className)}>
      <div className="flex items-center gap-1.5">
        {icon && <span className="text-muted-foreground">{icon}</span>}
        <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{title}</h4>
      </div>
      {children}
    </div>
  );
}

// Compact info row
function InfoRow({ icon, label, value, highlight, copyable }: { icon: React.ReactNode; label: string; value: string; highlight?: boolean; copyable?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1 group">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <div className="flex items-center gap-1">
        <span className={cn(
          "text-xs text-right max-w-[55%] truncate",
          highlight ? "text-destructive font-medium" : "text-foreground/80"
        )}>
          {value}
        </span>
        {copyable && (
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => { navigator.clipboard.writeText(value); toast.success('Copied!'); }}
          >
            <Copy className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
}

// Stat card
function StatCard({ value, label, icon }: { value: string | number; label: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-muted/40 border border-border/50">
      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-base font-bold leading-none">{value}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">{label}</p>
      </div>
    </div>
  );
}

export function InboxContextPanel({
  conversation, events, notes, onAddNote, onAddTag, onRemoveTag,
  availableTags: passedTags, isMobile = false, onInsertReply,
}: InboxContextPanelProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [newNote, setNewNote] = useState('');
  const [mentionIds, setMentionIds] = useState<string[]>([]);
  const [tagSearch, setTagSearch] = useState('');

  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleMentionsChange = useCallback((ids: string[]) => setMentionIds(ids), []);

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    onAddNote(newNote, mentionIds);
    setNewNote('');
    setMentionIds([]);
  };

  const handleShare = () => {
    const contactName = conversation?.contact?.name || 'Unknown';
    const phone = conversation?.contact?.wa_id || '';
    const status = conversation?.crm_status || 'new';
    const shareText = `Lead: ${contactName}\nPhone: +${phone}\nStatus: ${status.replace(/_/g, ' ')}\nLink: ${window.location.href}`;

    if (navigator.share) {
      navigator.share({ title: `Lead: ${contactName}`, text: shareText }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareText);
      toast.success('Lead details copied to clipboard');
    }
  };

  if (!conversation) {
    return (
      <div className={cn(
        "border-l bg-card flex items-center justify-center h-full",
        isMobile ? "w-full" : "w-full overflow-hidden"
      )}>
        <div className="text-center text-muted-foreground p-6">
          <div className="h-14 w-14 rounded-2xl bg-muted/60 flex items-center justify-center mx-auto mb-3">
            <User className="h-7 w-7 opacity-30" />
          </div>
          <p className="text-sm font-medium">No conversation selected</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Select a chat to view details</p>
        </div>
      </div>
    );
  }

  const availableTags = passedTags || [
    { id: 't1', name: 'VIP', color: '#FFD700' },
    { id: 't2', name: 'Pricing', color: '#3B82F6' },
    { id: 't3', name: 'Support', color: '#10B981' },
    { id: 't4', name: 'Urgent', color: '#EF4444' },
    { id: 't5', name: 'Follow-up', color: '#8B5CF6' },
  ];

  const filteredTags = availableTags.filter(t =>
    t.name.toLowerCase().includes(tagSearch.toLowerCase()) &&
    !conversation.tags?.some(ct => ct.id === t.id)
  );

  const TAB_ITEMS = [
    { value: 'overview', icon: Target, label: 'CRM' },
    { value: 'contact', icon: User, label: 'Contact' },
    { value: 'shopify', icon: ShoppingBag, label: 'Shopify' },
    { value: 'lead', icon: Zap, label: 'Lead' },
    { value: 'tags', icon: Tag, label: 'Tags' },
    { value: 'automation', icon: Workflow, label: 'Automation' },
    { value: 'notes', icon: FileText, label: 'Notes' },
    { value: 'history', icon: History, label: 'History' },
  ];

  return (
    <TooltipProvider delayDuration={300}>
      <div className={cn(
        "border-l bg-card flex flex-col h-full",
        isMobile ? "w-full border-l-0" : "w-full overflow-hidden"
      )}>
        {/* Contact Header — Premium compact */}
        <div className="p-3 border-b bg-gradient-to-b from-muted/30 to-transparent">
          <div className="flex items-center gap-3">
            <Avatar className="h-11 w-11 ring-2 ring-primary/10">
              <AvatarImage src={conversation.contact?.profile_picture_url || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {getInitials(conversation.contact?.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm truncate">
                {conversation.contact?.name || 'Unknown'}
              </h3>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Phone className="h-3 w-3" />
                +{conversation.contact?.wa_id}
              </p>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={handleShare}>
                  <Share2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Share lead details</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Tabs — with tooltips for icon-only */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <TabsList className="mx-2 mt-2 grid grid-cols-8 h-9 shrink-0 bg-muted/50">
            {TAB_ITEMS.map(tab => (
              <Tooltip key={tab.value}>
                <TooltipTrigger asChild>
                  <TabsTrigger
                    value={tab.value}
                    className="px-1 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-150"
                  >
                    <tab.icon className="h-3.5 w-3.5" />
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">{tab.label}</TooltipContent>
              </Tooltip>
            ))}
          </TabsList>

          <ScrollArea className="flex-1 min-h-0">
            {/* ===== CRM OVERVIEW ===== */}
            <TabsContent value="overview" className="m-0">
              <InboxCRMOverview conversation={conversation} />
            </TabsContent>

            {/* ===== SHOPIFY ===== */}
            <TabsContent value="shopify" className="m-0">
              <ShopifyContextTab conversationId={conversation.id} onInsertReply={onInsertReply} />
            </TabsContent>

            {/* ===== CONTACT DETAILS ===== */}
            <TabsContent value="contact" className="m-0 p-4 space-y-4">
              <PanelSection title="Contact Info" icon={<User className="h-3 w-3" />}>
                <div className="space-y-0.5">
                  <InfoRow icon={<Phone className="h-3.5 w-3.5" />} label="Phone" value={`+${conversation.contact?.wa_id || '—'}`} copyable />
                  {conversation.contact?.language && (
                    <InfoRow icon={<Globe className="h-3.5 w-3.5" />} label="Language" value={conversation.contact.language.toUpperCase()} />
                  )}
                  <InfoRow icon={<Calendar className="h-3.5 w-3.5" />} label="First Seen" value={formatDistanceToNow(new Date(conversation.created_at), { addSuffix: true })} />
                  {conversation.contact?.opt_out !== undefined && (
                    <div className="flex items-center justify-between py-1">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Shield className="h-3.5 w-3.5" />
                        <span className="text-xs">Marketing</span>
                      </div>
                      <Badge variant={conversation.contact.opt_out ? "destructive" : "secondary"} className="text-[10px] h-5">
                        {conversation.contact.opt_out ? 'Opted Out' : 'Opted In'}
                      </Badge>
                    </div>
                  )}
                </div>
              </PanelSection>

              <Separator />

              <PanelSection title="Conversation Stats" icon={<MessageSquare className="h-3 w-3" />}>
                <div className="grid grid-cols-2 gap-2">
                  <StatCard
                    value={conversation.unread_count || 0}
                    label="Unread"
                    icon={<MessageSquare className="h-4 w-4" />}
                  />
                  <StatCard
                    value={conversation.priority ? PRIORITY_CONFIG[conversation.priority].label : 'Normal'}
                    label="Priority"
                    icon={<Star className="h-4 w-4" />}
                  />
                </div>
              </PanelSection>

              <Separator />

              <PanelSection title="Source & Attribution" icon={<Globe className="h-3 w-3" />}>
                <div className="space-y-0.5">
                  <InfoRow
                    icon={<ArrowRight className="h-3.5 w-3.5" />}
                    label="Source"
                    value={(conversation.contact?.source || conversation.source)?.replace(/_/g, ' ') || 'Direct'}
                  />
                  {conversation.contact?.campaign_source && (
                    <InfoRow icon={<Zap className="h-3.5 w-3.5" />} label="Campaign" value={conversation.contact.campaign_source} />
                  )}
                </div>
              </PanelSection>
            </TabsContent>

            {/* ===== LEAD QUALIFICATION ===== */}
            <TabsContent value="lead" className="m-0">
              <LeadQualificationPanel
                contactId={conversation.contact_id || null}
                conversationId={conversation.id}
                isMobile={isMobile}
              />
            </TabsContent>

            {/* ===== TAGS ===== */}
            <TabsContent value="tags" className="m-0 p-4 space-y-4">
              <PanelSection title="Applied Tags" icon={<Tag className="h-3 w-3" />}>
                <div className="flex flex-wrap gap-1.5">
                  {conversation.tags?.map(tag => (
                    <Badge
                      key={tag.id}
                      variant="secondary"
                      className="flex items-center gap-1 pr-1 text-xs h-6"
                      style={{ backgroundColor: `${tag.color}15`, color: tag.color, borderColor: `${tag.color}30` }}
                    >
                      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: tag.color }} />
                      {tag.name}
                      <button
                        className="ml-0.5 hover:bg-black/10 rounded-full p-0.5 transition-colors"
                        onClick={() => onRemoveTag(tag.id)}
                      >
                        <X className="h-2.5 w-2.5" />
                      </button>
                    </Badge>
                  ))}
                  {(!conversation.tags || conversation.tags.length === 0) && (
                    <span className="text-xs text-muted-foreground italic">No tags applied</span>
                  )}
                </div>
              </PanelSection>

              <Separator />

              <PanelSection title="Add Tags">
                <Input
                  placeholder="Search tags..."
                  value={tagSearch}
                  onChange={(e) => setTagSearch(e.target.value)}
                  className="h-8 text-xs"
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {filteredTags.map(tag => (
                    <Badge
                      key={tag.id}
                      variant="outline"
                      className="cursor-pointer hover:bg-primary/5 transition-colors text-xs h-6"
                      onClick={() => onAddTag(tag.id)}
                    >
                      <Plus className="h-3 w-3 mr-0.5" />
                      {tag.name}
                    </Badge>
                  ))}
                  {filteredTags.length === 0 && (
                    <span className="text-xs text-muted-foreground italic">No matching tags</span>
                  )}
                </div>
              </PanelSection>

              <Separator />

              <PanelSection title="Tag History">
                <div className="space-y-1.5">
                  {events
                    .filter(e => e.event_type === 'tag_added' || e.event_type === 'tag_removed')
                    .slice(0, 5)
                    .map(event => (
                      <div key={event.id} className="flex items-center gap-2 text-xs text-muted-foreground py-0.5">
                        <div className={cn(
                          "h-5 w-5 rounded-full flex items-center justify-center shrink-0",
                          event.event_type === 'tag_added' ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                        )}>
                          {event.event_type === 'tag_added' ? <Plus className="h-2.5 w-2.5" /> : <X className="h-2.5 w-2.5" />}
                        </div>
                        <span className="truncate flex-1">
                          {event.event_type === 'tag_added' ? 'Added' : 'Removed'} <strong>"{event.tag_name}"</strong>
                        </span>
                        <span className="text-[10px] shrink-0">
                          {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    ))}
                  {events.filter(e => e.event_type === 'tag_added' || e.event_type === 'tag_removed').length === 0 && (
                    <span className="text-xs text-muted-foreground italic">No tag changes</span>
                  )}
                </div>
              </PanelSection>
            </TabsContent>

            {/* ===== AUTOMATION ===== */}
            <TabsContent value="automation" className="m-0 p-4 space-y-4">
              <PanelSection title="Active Workflows" icon={<Workflow className="h-3 w-3" />}>
                <div className="rounded-lg border border-dashed border-border/60 p-4 text-center">
                  <Workflow className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
                  <p className="text-xs text-muted-foreground">No active workflows</p>
                  <p className="text-[10px] text-muted-foreground/60 mt-0.5">Workflows trigger automatically</p>
                </div>
              </PanelSection>

              <Separator />

              <PanelSection title="Recent Automations" icon={<Zap className="h-3 w-3" />}>
                <div className="space-y-1.5">
                  {events
                    .filter(e => e.event_type === 'automation_ran')
                    .slice(0, 5)
                    .map(event => (
                      <div key={event.id} className="flex items-center gap-2 text-xs py-1 px-2 rounded-md bg-muted/30">
                        <div className="h-5 w-5 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center shrink-0">
                          <Zap className="h-2.5 w-2.5" />
                        </div>
                        <span className="truncate flex-1 text-foreground/80">
                          {(event.details as any)?.workflow_name || 'Workflow executed'}
                        </span>
                        <span className="text-[10px] text-muted-foreground shrink-0">
                          {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    ))}
                  {events.filter(e => e.event_type === 'automation_ran').length === 0 && (
                    <span className="text-xs text-muted-foreground italic">No recent automations</span>
                  )}
                </div>
              </PanelSection>
            </TabsContent>

            {/* ===== NOTES ===== */}
            <TabsContent value="notes" className="m-0 p-4 space-y-4">
              <PanelSection title="Add Note" icon={<FileText className="h-3 w-3" />}>
                <MentionTextarea
                  placeholder="Write a note... Type @ to mention"
                  value={newNote}
                  onChange={setNewNote}
                  onMentionsChange={handleMentionsChange}
                  className="min-h-[70px] resize-none text-sm"
                />
                <Button size="sm" onClick={handleAddNote} disabled={!newNote.trim()} className="h-7 text-xs">
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Add Note
                </Button>
              </PanelSection>

              <Separator />

              <PanelSection title={`Notes (${notes.length})`}>
                <div className="space-y-2">
                  {notes.map(note => (
                    <div key={note.id} className="rounded-lg bg-amber-50/80 border border-amber-200/60 p-2.5">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Avatar className="h-5 w-5">
                          <AvatarFallback className="text-[9px] bg-amber-200/80 font-medium">
                            {getInitials(note.author?.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-medium">{note.author?.full_name || 'Unknown'}</span>
                        <span className="text-[10px] text-muted-foreground ml-auto">
                          {formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-xs text-foreground/80 leading-relaxed">{note.body}</p>
                    </div>
                  ))}
                  {notes.length === 0 && (
                    <div className="text-center py-6">
                      <FileText className="h-8 w-8 mx-auto text-muted-foreground/20 mb-2" />
                      <p className="text-xs text-muted-foreground">No notes yet</p>
                    </div>
                  )}
                </div>
              </PanelSection>
            </TabsContent>

            {/* ===== HISTORY TIMELINE ===== */}
            <TabsContent value="history" className="m-0 p-4">
              <PanelSection title="Activity Timeline" icon={<History className="h-3 w-3" />}>
                <div className="space-y-0">
                  {events.map((event, idx) => {
                    const isLast = idx === events.length - 1;
                    const eventIcon = getEventIcon(event.event_type);
                    const eventColor = getEventColor(event.event_type);
                    return (
                      <div key={event.id} className="flex gap-2.5">
                        <div className="flex flex-col items-center">
                          <div className={cn(
                            "w-7 h-7 rounded-full flex items-center justify-center shrink-0",
                            eventColor
                          )}>
                            {eventIcon}
                          </div>
                          {!isLast && <div className="w-px flex-1 bg-border/60 my-0.5" />}
                        </div>
                        <div className={cn("flex-1 min-w-0", !isLast && "pb-3")}>
                          <p className="text-xs leading-relaxed">
                            {renderEventText(event)}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {format(new Date(event.created_at), 'MMM d, h:mm a')}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  {events.length === 0 && (
                    <div className="text-center py-6">
                      <History className="h-8 w-8 mx-auto text-muted-foreground/20 mb-2" />
                      <p className="text-xs text-muted-foreground">No activity yet</p>
                    </div>
                  )}
                </div>
              </PanelSection>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </div>
    </TooltipProvider>
  );
}

function getEventIcon(type: string) {
  const cls = "h-3 w-3";
  switch (type) {
    case 'assigned': case 'unassigned': return <User className={cls} />;
    case 'tag_added': case 'tag_removed': return <Tag className={cls} />;
    case 'status_changed': return <CheckCircle className={cls} />;
    case 'intervened': return <Hand className={cls} />;
    case 'automation_ran': return <Zap className={cls} />;
    case 'note_added': return <FileText className={cls} />;
    default: return <Clock className={cls} />;
  }
}

function getEventColor(type: string) {
  switch (type) {
    case 'assigned': return 'bg-blue-100 text-blue-600';
    case 'unassigned': return 'bg-slate-100 text-slate-500';
    case 'tag_added': return 'bg-green-100 text-green-600';
    case 'tag_removed': return 'bg-red-100 text-red-500';
    case 'status_changed': return 'bg-amber-100 text-amber-600';
    case 'intervened': return 'bg-orange-100 text-orange-600';
    case 'automation_ran': return 'bg-violet-100 text-violet-600';
    default: return 'bg-muted text-muted-foreground';
  }
}

function renderEventText(event: ConversationEvent) {
  switch (event.event_type) {
    case 'assigned':
      if ((event.details as any)?.action === 'transferred') {
        return <><strong>{event.actor?.full_name}</strong> transferred from <strong>{event.from_agent?.full_name || 'Unassigned'}</strong> → <strong>{event.to_agent?.full_name || 'Unknown'}</strong></>;
      }
      if ((event.details as any)?.action === 'claimed_on_reply' || (event.details as any)?.action === 'claimed') {
        return <><strong>{event.to_agent?.full_name || event.actor?.full_name}</strong> {(event.details as any)?.action === 'claimed_on_reply' ? 'claimed on reply' : 'claimed this conversation'}</>;
      }
      if (event.from_agent?.full_name) {
        return <><strong>{event.actor?.full_name}</strong> reassigned from <strong>{event.from_agent.full_name}</strong> → <strong>{event.to_agent?.full_name}</strong></>;
      }
      return <>Assigned to <strong>{event.to_agent?.full_name || event.actor?.full_name}</strong></>;
    case 'tag_added': return <>Tag <strong>"{event.tag_name}"</strong> added</>;
    case 'tag_removed': return <>Tag <strong>"{event.tag_name}"</strong> removed</>;
    case 'status_changed': return <>Status → <strong>{event.new_value?.replace(/_/g, ' ')}</strong></>;
    case 'intervened': return <><strong>{event.actor?.full_name}</strong> took over from <strong>{event.from_agent?.full_name || 'previous agent'}</strong></>;
    case 'automation_ran': return <>Automation <strong>{(event.details as any)?.workflow_name || 'workflow'}</strong> executed</>;
    default: return <>{event.event_type.replace(/_/g, ' ')}</>;
  }
}
