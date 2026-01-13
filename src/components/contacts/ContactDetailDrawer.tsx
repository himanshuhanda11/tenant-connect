import { useState, useEffect } from 'react';
import { Contact, PRIORITY_OPTIONS, LEAD_STATUS_OPTIONS, MAU_STATUS_OPTIONS } from '@/types/contact';
import { useContactTimeline } from '@/hooks/useContacts';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import {
  User,
  Phone,
  Mail,
  Globe,
  Clock,
  Calendar,
  Tag,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Bot,
  UserCheck,
  MessageSquare,
  TrendingUp,
  Settings,
  History,
  Save,
  X,
  Plus,
  Trash2,
  ExternalLink,
  Ban,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { ContactTimeline } from './ContactTimeline';

interface ContactDetailDrawerProps {
  contact: Contact | null;
  open: boolean;
  onClose: () => void;
  onUpdate: (contactId: string, updates: Partial<Contact>) => void;
  onAddTag: (contactId: string, tagId: string) => void;
  onRemoveTag: (contactId: string, tagId: string) => void;
  onAssignAgent: (contactId: string, agentId: string | null) => void;
}

export function ContactDetailDrawer({
  contact,
  open,
  onClose,
  onUpdate,
  onAddTag,
  onRemoveTag,
  onAssignAgent,
}: ContactDetailDrawerProps) {
  const { currentTenant } = useTenant();
  const [activeTab, setActiveTab] = useState('overview');
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<Partial<Contact>>({});
  const [availableTags, setAvailableTags] = useState<{ id: string; name: string; color: string }[]>([]);
  const [agents, setAgents] = useState<{ id: string; full_name: string | null; email: string }[]>([]);
  const { events, loading: timelineLoading } = useContactTimeline(contact?.id || null);

  useEffect(() => {
    if (contact) {
      setFormData(contact);
    }
  }, [contact]);

  useEffect(() => {
    const fetchOptions = async () => {
      if (!currentTenant?.id) return;

      // Fetch available tags
      const { data: tagsData } = await supabase
        .from('tags')
        .select('id, name, color')
        .eq('tenant_id', currentTenant.id)
        .order('name');
      
      if (tagsData) setAvailableTags(tagsData);

      // Fetch team members for agent assignment
      const { data: membersData } = await supabase
        .from('tenant_members')
        .select('user_id')
        .eq('tenant_id', currentTenant.id);
      
      if (membersData && membersData.length > 0) {
        const userIds = membersData.map(m => m.user_id);
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', userIds);
        
        if (profilesData) setAgents(profilesData);
      }
    };

    fetchOptions();
  }, [currentTenant?.id]);

  const getInitials = (name?: string | null, waId?: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return waId?.slice(-2) || '??';
  };

  const handleSave = () => {
    if (!contact) return;
    const updates: Partial<Contact> = {};
    
    // Only include changed fields
    const editableFields: (keyof Contact)[] = [
      'name', 'first_name', 'country', 'language', 'timezone', 'segment',
      'priority_level', 'lead_status', 'deal_stage', 'notes',
      'opt_in_status', 'opt_out', 'source', 'campaign_source'
    ];
    
    editableFields.forEach(field => {
      if (formData[field] !== contact[field]) {
        (updates as Record<string, unknown>)[field] = formData[field];
      }
    });

    if (Object.keys(updates).length > 0) {
      onUpdate(contact.id, updates);
    }
    setEditMode(false);
  };

  const handleTagAdd = (tagId: string) => {
    if (contact) {
      onAddTag(contact.id, tagId);
    }
  };

  const handleTagRemove = (tagId: string) => {
    if (contact) {
      onRemoveTag(contact.id, tagId);
    }
  };

  const handleAgentChange = (agentId: string) => {
    if (contact) {
      onAssignAgent(contact.id, agentId === 'unassigned' ? null : agentId);
    }
  };

  if (!contact) return null;

  const contactTags = contact.tags?.map(ct => ct.tag) || [];
  const availableToAdd = availableTags.filter(t => !contactTags.find(ct => ct.id === t.id));

  return (
    <Sheet open={open} onOpenChange={() => onClose()}>
      <SheetContent className="w-full sm:max-w-xl p-0 flex flex-col">
        {/* Header */}
        <SheetHeader className="p-6 pb-4 border-b shrink-0">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={contact.profile_picture_url || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-medium">
                {getInitials(contact.name, contact.wa_id)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-xl truncate">
                {contact.name || contact.first_name || 'Unknown Contact'}
              </SheetTitle>
              <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>+{contact.wa_id}</span>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {contact.opt_in_status && (
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    <ShieldCheck className="h-3 w-3 mr-1" />
                    Opted In
                  </Badge>
                )}
                {contact.opt_out && (
                  <Badge variant="secondary" className="bg-red-100 text-red-700">
                    <ShieldAlert className="h-3 w-3 mr-1" />
                    Opted Out
                  </Badge>
                )}
                {contact.blocked_by_user && (
                  <Badge variant="secondary" className="bg-red-100 text-red-700">
                    <Ban className="h-3 w-3 mr-1" />
                    Blocked
                  </Badge>
                )}
                {contact.intervened && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    <UserCheck className="h-3 w-3 mr-1" />
                    Human Intervened
                  </Badge>
                )}
                {contact.bot_handled && !contact.intervened && (
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                    <Bot className="h-3 w-3 mr-1" />
                    Bot Handled
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </SheetHeader>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
          <TabsList className="mx-6 mt-4 shrink-0">
            <TabsTrigger value="overview" className="flex items-center gap-1">
              <User className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="details" className="flex items-center gap-1">
              <Settings className="h-4 w-4" />
              Details
            </TabsTrigger>
            <TabsTrigger value="timeline" className="flex items-center gap-1">
              <History className="h-4 w-4" />
              Timeline
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 px-6 py-4">
            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-0 space-y-6">
              {/* Quick Actions */}
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setActiveTab('details')}>
                  <Settings className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
                <Button variant="outline" className="flex-1">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Open Chat
                </Button>
              </div>

              {/* Status Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-lg border bg-muted/30">
                  <div className="text-xs text-muted-foreground mb-1">Lead Status</div>
                  <Select
                    value={contact.lead_status}
                    onValueChange={(value) => onUpdate(contact.id, { lead_status: value as Contact['lead_status'] })}
                  >
                    <SelectTrigger className="h-auto p-0 border-0 bg-transparent shadow-none">
                      <Badge variant="secondary" className={LEAD_STATUS_OPTIONS.find(s => s.value === contact.lead_status)?.color}>
                        {LEAD_STATUS_OPTIONS.find(s => s.value === contact.lead_status)?.label}
                      </Badge>
                    </SelectTrigger>
                    <SelectContent>
                      {LEAD_STATUS_OPTIONS.map(status => (
                        <SelectItem key={status.value} value={status.value}>
                          <Badge variant="secondary" className={status.color}>
                            {status.label}
                          </Badge>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="p-4 rounded-lg border bg-muted/30">
                  <div className="text-xs text-muted-foreground mb-1">Priority</div>
                  <Select
                    value={contact.priority_level}
                    onValueChange={(value) => onUpdate(contact.id, { priority_level: value as Contact['priority_level'] })}
                  >
                    <SelectTrigger className="h-auto p-0 border-0 bg-transparent shadow-none">
                      <Badge variant="secondary" className={PRIORITY_OPTIONS.find(p => p.value === contact.priority_level)?.color}>
                        {PRIORITY_OPTIONS.find(p => p.value === contact.priority_level)?.label}
                      </Badge>
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITY_OPTIONS.map(priority => (
                        <SelectItem key={priority.value} value={priority.value}>
                          <Badge variant="secondary" className={priority.color}>
                            {priority.label}
                          </Badge>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="p-4 rounded-lg border bg-muted/30">
                  <div className="text-xs text-muted-foreground mb-1">MAU Status</div>
                  <Badge variant="secondary" className={MAU_STATUS_OPTIONS.find(s => s.value === contact.mau_status)?.color}>
                    {MAU_STATUS_OPTIONS.find(s => s.value === contact.mau_status)?.label}
                  </Badge>
                </div>
                <div className="p-4 rounded-lg border bg-muted/30">
                  <div className="text-xs text-muted-foreground mb-1">Last Active</div>
                  <span className="text-sm font-medium">
                    {contact.last_seen 
                      ? formatDistanceToNow(new Date(contact.last_seen), { addSuffix: true })
                      : 'Never'
                    }
                  </span>
                </div>
              </div>

              {/* Agent Assignment */}
              <div className="space-y-2">
                <Label>Assigned Agent</Label>
                <Select
                  value={contact.assigned_agent_id || 'unassigned'}
                  onValueChange={handleAgentChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="No agent assigned" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">No agent assigned</SelectItem>
                    {agents.map(agent => (
                      <SelectItem key={agent.id} value={agent.id}>
                        {agent.full_name || agent.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2">
                  {contactTags.map(tag => (
                    <Badge 
                      key={tag.id}
                      variant="secondary" 
                      style={{ backgroundColor: tag.color || undefined }}
                      className="pr-1"
                    >
                      {tag.name}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 ml-1 hover:bg-transparent"
                        onClick={() => handleTagRemove(tag.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                  {availableToAdd.length > 0 && (
                    <Select onValueChange={handleTagAdd}>
                      <SelectTrigger className="w-auto h-6 text-xs border-dashed">
                        <Plus className="h-3 w-3 mr-1" />
                        Add Tag
                      </SelectTrigger>
                      <SelectContent>
                        {availableToAdd.map(tag => (
                          <SelectItem key={tag.id} value={tag.id}>
                            <Badge 
                              variant="secondary" 
                              style={{ backgroundColor: tag.color || undefined }}
                            >
                              {tag.name}
                            </Badge>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  placeholder="Add internal notes about this contact..."
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  onBlur={() => {
                    if (formData.notes !== contact.notes) {
                      onUpdate(contact.id, { notes: formData.notes });
                    }
                  }}
                  rows={3}
                />
              </div>

              {/* Quick Info */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Contact Information</h4>
                <div className="space-y-2 text-sm">
                  {contact.country && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span>{contact.country}</span>
                    </div>
                  )}
                  {contact.language && (
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      <span>{contact.language.toUpperCase()}</span>
                    </div>
                  )}
                  {contact.timezone && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{contact.timezone}</span>
                    </div>
                  )}
                  {contact.source && (
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      <span>Source: {contact.source}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Created: {format(new Date(contact.created_at), 'PPP')}</span>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Details Tab */}
            <TabsContent value="details" className="mt-0 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Edit Contact Details</h3>
                {editMode ? (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setEditMode(false)}>
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleSave}>
                      <Save className="h-4 w-4 mr-1" />
                      Save
                    </Button>
                  </div>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => setEditMode(true)}>
                    Edit
                  </Button>
                )}
              </div>

              <div className="space-y-4">
                {/* Identity */}
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-3">Identity & Core</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Full Name</Label>
                      <Input
                        value={formData.name || ''}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        disabled={!editMode}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">First Name</Label>
                      <Input
                        value={formData.first_name || ''}
                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                        disabled={!editMode}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Country</Label>
                      <Input
                        value={formData.country || ''}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        disabled={!editMode}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Language</Label>
                      <Input
                        value={formData.language || ''}
                        onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                        disabled={!editMode}
                      />
                    </div>
                    <div className="col-span-2 space-y-1.5">
                      <Label className="text-xs">Timezone</Label>
                      <Input
                        value={formData.timezone || ''}
                        onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                        disabled={!editMode}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Source */}
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-3">Source & First Interaction</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Source</Label>
                      <Input
                        value={formData.source || ''}
                        onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                        disabled={!editMode}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Campaign Source</Label>
                      <Input
                        value={formData.campaign_source || ''}
                        onChange={(e) => setFormData({ ...formData, campaign_source: e.target.value })}
                        disabled={!editMode}
                      />
                    </div>
                    <div className="col-span-2 space-y-1.5">
                      <Label className="text-xs">First Message</Label>
                      <Textarea
                        value={contact.first_message || ''}
                        disabled
                        rows={2}
                        className="text-xs"
                      />
                    </div>
                    {contact.first_message_time && (
                      <div className="col-span-2 text-xs text-muted-foreground">
                        First message received: {format(new Date(contact.first_message_time), 'PPp')}
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Segmentation */}
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-3">Segmentation</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Segment</Label>
                      <Input
                        value={formData.segment || ''}
                        onChange={(e) => setFormData({ ...formData, segment: e.target.value })}
                        disabled={!editMode}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Deal Stage</Label>
                      <Input
                        value={formData.deal_stage || ''}
                        onChange={(e) => setFormData({ ...formData, deal_stage: e.target.value })}
                        disabled={!editMode}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Compliance */}
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-3">Compliance & Consent</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm">Opt-in Status</Label>
                        <p className="text-xs text-muted-foreground">User has opted in for marketing</p>
                      </div>
                      <Switch
                        checked={formData.opt_in_status || false}
                        onCheckedChange={(checked) => {
                          setFormData({ ...formData, opt_in_status: checked });
                          if (editMode) {
                            onUpdate(contact.id, { opt_in_status: checked, opt_in_timestamp: checked ? new Date().toISOString() : null });
                          }
                        }}
                        disabled={!editMode}
                      />
                    </div>
                    {contact.opt_in_timestamp && (
                      <p className="text-xs text-muted-foreground">
                        Opted in on: {format(new Date(contact.opt_in_timestamp), 'PPp')}
                        {contact.opt_in_source && ` via ${contact.opt_in_source}`}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm">Opted Out</Label>
                        <p className="text-xs text-muted-foreground">User has unsubscribed</p>
                      </div>
                      <Switch
                        checked={formData.opt_out || false}
                        onCheckedChange={(checked) => {
                          setFormData({ ...formData, opt_out: checked });
                          if (editMode) {
                            onUpdate(contact.id, { opt_out: checked, opt_out_timestamp: checked ? new Date().toISOString() : null });
                          }
                        }}
                        disabled={!editMode}
                      />
                    </div>
                    {contact.data_deletion_requested && (
                      <Badge variant="destructive" className="mt-2">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Data Deletion Requested
                      </Badge>
                    )}
                  </div>
                </div>

                <Separator />

                {/* AI & Automation */}
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-3">AI & Automation</h4>
                  <div className="space-y-2 text-sm">
                    {contact.ai_intent_detected && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">AI Intent</span>
                        <Badge variant="outline">{contact.ai_intent_detected}</Badge>
                      </div>
                    )}
                    {contact.sentiment_score !== null && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Sentiment Score</span>
                        <Badge variant={contact.sentiment_score > 0.5 ? 'default' : contact.sentiment_score < -0.5 ? 'destructive' : 'secondary'}>
                          {contact.sentiment_score.toFixed(2)}
                        </Badge>
                      </div>
                    )}
                    {contact.automation_flow && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Automation Flow</span>
                        <span>{contact.automation_flow}</span>
                      </div>
                    )}
                    {contact.next_best_action && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Next Best Action</span>
                        <span>{contact.next_best_action}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Timeline Tab */}
            <TabsContent value="timeline" className="mt-0">
              <ContactTimeline events={events} loading={timelineLoading} />
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
