import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LeadQualificationPanel } from './LeadQualificationPanel';
import { Separator } from '@/components/ui/separator';
import {
  User,
  Tag,
  Zap,
  FileText,
  Megaphone,
  History,
  Plus,
  X,
  Phone,
  Mail,
  Globe,
  Calendar,
  Clock,
  MessageSquare,
  Send,
  CheckCircle,
  AlertTriangle,
  Bot,
  Hand,
  ExternalLink
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { InboxConversation, ConversationEvent, InternalNote, PRIORITY_CONFIG } from '@/types/inbox';
import { cn } from '@/lib/utils';

interface InboxContextPanelProps {
  conversation: InboxConversation | null;
  events: ConversationEvent[];
  notes: InternalNote[];
  onAddNote: (body: string, mentions: string[]) => void;
  onAddTag: (tagId: string) => void;
  onRemoveTag: (tagId: string) => void;
  availableTags?: Array<{ id: string; name: string; color: string }>;
  isMobile?: boolean;
}

export function InboxContextPanel({
  conversation,
  events,
  notes,
  onAddNote,
  onAddTag,
  onRemoveTag,
  availableTags: passedTags,
  isMobile = false,
}: InboxContextPanelProps) {
  const [activeTab, setActiveTab] = useState('contact');
  const [newNote, setNewNote] = useState('');
  const [tagSearch, setTagSearch] = useState('');

  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    onAddNote(newNote, []);
    setNewNote('');
  };

  if (!conversation) {
    return (
      <div className={cn(
        "border-l bg-card flex items-center justify-center h-full",
        isMobile ? "w-full" : "w-full overflow-hidden"
      )}>
        <div className="text-center text-muted-foreground p-4">
          <User className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Select a conversation to view details</p>
        </div>
      </div>
    );
  }

  // Use passed tags or default
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

  return (
    <div className={cn(
      "border-l bg-card flex flex-col h-full",
      isMobile ? "w-full border-l-0" : "w-full overflow-hidden"
    )}>
      {/* Contact Header */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={conversation.contact?.profile_picture_url || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary text-lg">
              {getInitials(conversation.contact?.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">
              {conversation.contact?.name || 'Unknown'}
            </h3>
            <p className="text-sm text-muted-foreground">
              +{conversation.contact?.wa_id}
            </p>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="mx-4 mt-2 grid grid-cols-6 h-9">
          <TabsTrigger value="contact" className="px-2">
            <User className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger value="lead" className="px-2">
            <Zap className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger value="tags" className="px-2">
            <Tag className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger value="automation" className="px-2">
            <Bot className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger value="notes" className="px-2">
            <FileText className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger value="history" className="px-2">
            <History className="h-4 w-4" />
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1">
          {/* Contact Tab */}
          <TabsContent value="contact" className="m-0 p-4 space-y-4">
            <div className="space-y-3">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Contact Details
              </h4>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>+{conversation.contact?.wa_id}</span>
                </div>
                {conversation.contact?.language && (
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span>{conversation.contact.language.toUpperCase()}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Created {formatDistanceToNow(new Date(conversation.created_at), { addSuffix: true })}</span>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Conversation Stats
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <Card className="bg-muted/50">
                  <CardContent className="p-3">
                    <p className="text-2xl font-bold">12</p>
                    <p className="text-xs text-muted-foreground">Messages</p>
                  </CardContent>
                </Card>
                <Card className="bg-muted/50">
                  <CardContent className="p-3">
                    <p className="text-2xl font-bold">2m</p>
                    <p className="text-xs text-muted-foreground">Avg Response</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Source & Attribution
              </h4>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Source</span>
                  <Badge variant="outline" className="capitalize">
                    {conversation.source?.replace('_', ' ') || 'Direct'}
                  </Badge>
                </div>
                {conversation.source === 'meta_ads' && (
                  <>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Campaign</span>
                      <span className="text-right">Summer Sale 2025</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Ad</span>
                      <span className="text-right">Promo Banner</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Preferences
              </h4>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Opt-in Status</span>
                  <Badge variant={conversation.contact?.opt_out ? "destructive" : "secondary"}>
                    {conversation.contact?.opt_out ? 'Opted Out' : 'Opted In'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Priority</span>
                  <Badge 
                    variant="outline"
                    className={cn(
                      PRIORITY_CONFIG[conversation.priority || 'normal'].bgColor,
                      PRIORITY_CONFIG[conversation.priority || 'normal'].color,
                      "border-0"
                    )}
                  >
                    {PRIORITY_CONFIG[conversation.priority || 'normal'].label}
                  </Badge>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Lead Qualification Tab */}
          <TabsContent value="lead" className="m-0">
            <LeadQualificationPanel
              contactId={conversation.contact_id || null}
              conversationId={conversation.id}
              isMobile={isMobile}
            />
          </TabsContent>

          {/* Tags Tab */}
          <TabsContent value="tags" className="m-0 p-4 space-y-4">
            <div className="space-y-3">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Applied Tags
              </h4>

              <div className="flex flex-wrap gap-2">
                {conversation.tags?.map(tag => (
                  <Badge 
                    key={tag.id}
                    variant="secondary"
                    className="flex items-center gap-1 pr-1"
                    style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
                  >
                    {tag.name}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={() => onRemoveTag(tag.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
                {(!conversation.tags || conversation.tags.length === 0) && (
                  <span className="text-sm text-muted-foreground">No tags applied</span>
                )}
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Add Tags
              </h4>

              <Input
                placeholder="Search tags..."
                value={tagSearch}
                onChange={(e) => setTagSearch(e.target.value)}
                className="h-8"
              />

              <div className="flex flex-wrap gap-2">
                {filteredTags.map(tag => (
                  <Badge 
                    key={tag.id}
                    variant="outline"
                    className="cursor-pointer hover:bg-muted"
                    onClick={() => onAddTag(tag.id)}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Tag History
              </h4>

              <div className="space-y-2 text-sm">
                {events
                  .filter(e => e.event_type === 'tag_added' || e.event_type === 'tag_removed')
                  .slice(0, 5)
                  .map(event => (
                    <div key={event.id} className="flex items-center gap-2 text-muted-foreground">
                      <Tag className="h-3 w-3" />
                      <span>
                        {event.event_type === 'tag_added' ? 'Added' : 'Removed'} "{event.tag_name}"
                      </span>
                      <span className="ml-auto text-xs">
                        {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </TabsContent>

          {/* Automation Tab */}
          <TabsContent value="automation" className="m-0 p-4 space-y-4">
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground">
                No bot configured. Automation rules can be managed in Settings.
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Active Workflows
              </h4>

              <Card className="border-dashed">
                <CardContent className="p-3 text-center text-muted-foreground text-sm">
                  No active workflows
                </CardContent>
              </Card>
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Recent Automations
              </h4>

              <div className="space-y-2 text-sm">
                {events
                  .filter(e => e.event_type === 'automation_ran')
                  .slice(0, 5)
                  .map(event => (
                    <div key={event.id} className="flex items-center gap-2 text-muted-foreground">
                      <Zap className="h-3 w-3" />
                      <span className="truncate">{event.automation_workflow_id || 'Workflow'}</span>
                      <span className="ml-auto text-xs">
                        {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  ))}
                {events.filter(e => e.event_type === 'automation_ran').length === 0 && (
                  <div className="text-muted-foreground">No recent automations</div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes" className="m-0 p-4 space-y-4">
            <div className="space-y-3">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Add Note
              </h4>

              <div className="space-y-2">
                <Textarea
                  placeholder="Write an internal note... Use @mention to notify teammates"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="min-h-[80px] resize-none"
                />
                <Button size="sm" onClick={handleAddNote} disabled={!newNote.trim()}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Note
                </Button>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Notes ({notes.length})
              </h4>

              <div className="space-y-3">
                {notes.map(note => (
                  <Card key={note.id} className="bg-yellow-50 border-yellow-200">
                    <CardContent className="p-3">
                      <div className="flex items-start gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs bg-yellow-200">
                            {getInitials(note.author?.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{note.author?.full_name}</span>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}
                            </span>
                          </div>
                          <p className="text-sm mt-1">{note.body}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {notes.length === 0 && (
                  <div className="text-sm text-muted-foreground text-center py-4">
                    No notes yet
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="m-0 p-4 space-y-4">
            <div className="space-y-3">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Activity Timeline
              </h4>

              <div className="space-y-3">
                {events.map(event => (
                  <div key={event.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        {event.event_type === 'assigned' && <User className="h-4 w-4" />}
                        {event.event_type === 'tag_added' && <Tag className="h-4 w-4" />}
                        {event.event_type === 'tag_removed' && <Tag className="h-4 w-4" />}
                        {event.event_type === 'status_changed' && <CheckCircle className="h-4 w-4" />}
                        {event.event_type === 'intervened' && <Hand className="h-4 w-4" />}
                        {event.event_type === 'automation_ran' && <Zap className="h-4 w-4" />}
                      </div>
                      <div className="w-px h-full bg-border" />
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="text-sm">
                        {event.event_type === 'assigned' && (
                          <>Assigned to <strong>{event.actor?.full_name}</strong></>
                        )}
                        {event.event_type === 'tag_added' && (
                          <>Tag <strong>"{event.tag_name}"</strong> added</>
                        )}
                        {event.event_type === 'tag_removed' && (
                          <>Tag <strong>"{event.tag_name}"</strong> removed</>
                        )}
                        {event.event_type === 'status_changed' && (
                          <>Status changed to <strong>{event.new_value}</strong></>
                        )}
                        {event.event_type === 'intervened' && (
                          <><strong>{event.actor?.full_name}</strong> took over</>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(event.created_at), 'MMM d, h:mm a')}
                        {event.actor?.full_name && ` • ${event.actor.full_name}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
}
