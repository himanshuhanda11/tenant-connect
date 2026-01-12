import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  User,
  Phone,
  Clock,
  Tag,
  MessageSquare,
  UserPlus,
  X,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import type { Contact, Conversation, ConversationNote } from '@/types/whatsapp';

interface ContactPanelProps {
  contact: Contact | null;
  conversation: Conversation | null;
  onClose: () => void;
}

export function ContactPanel({
  contact,
  conversation,
  onClose,
}: ContactPanelProps) {
  const [notes, setNotes] = useState<ConversationNote[]>([]);
  const [newNote, setNewNote] = useState('');
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [savingNote, setSavingNote] = useState(false);

  useEffect(() => {
    if (conversation?.id) {
      fetchNotes();
    }
  }, [conversation?.id]);

  const fetchNotes = async () => {
    if (!conversation?.id) return;

    setLoadingNotes(true);
    try {
      const { data, error } = await supabase
        .from('conversation_notes')
        .select('*')
        .eq('conversation_id', conversation.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotes((data || []) as ConversationNote[]);
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoadingNotes(false);
    }
  };

  const addNote = async () => {
    if (!newNote.trim() || !conversation?.id) return;

    setSavingNote(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user?.id) return;

      const { error } = await supabase.from('conversation_notes').insert({
        tenant_id: conversation.tenant_id,
        conversation_id: conversation.id,
        user_id: user.user.id,
        content: newNote.trim(),
      });

      if (error) throw error;

      setNewNote('');
      fetchNotes();
    } catch (error) {
      console.error('Error adding note:', error);
    } finally {
      setSavingNote(false);
    }
  };

  const getInitials = (name?: string | null, waId?: string) => {
    if (name) {
      return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return waId?.slice(-2) || '??';
  };

  if (!contact) {
    return null;
  }

  return (
    <div className="flex flex-col h-full border-l bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold">Contact Details</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Contact info */}
          <div className="flex flex-col items-center text-center">
            <Avatar className="h-20 w-20 mb-3">
              <AvatarImage src={contact.profile_picture_url || undefined} />
              <AvatarFallback className="text-xl bg-primary/10 text-primary">
                {getInitials(contact.name, contact.wa_id)}
              </AvatarFallback>
            </Avatar>
            <h4 className="font-semibold text-lg">
              {contact.name || 'Unknown'}
            </h4>
            <p className="text-sm text-muted-foreground">{contact.wa_id}</p>
          </div>

          <Separator />

          {/* Contact details */}
          <div className="space-y-3">
            <h5 className="font-medium text-sm">Details</h5>

            <div className="flex items-center gap-3 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{contact.wa_id}</span>
            </div>

            {contact.last_seen && (
              <div className="flex items-center gap-3 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>
                  Last seen:{' '}
                  {format(new Date(contact.last_seen), 'MMM d, yyyy HH:mm')}
                </span>
              </div>
            )}

            <div className="flex items-center gap-3 text-sm">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <span>
                Created:{' '}
                {format(new Date(contact.created_at), 'MMM d, yyyy')}
              </span>
            </div>
          </div>

          <Separator />

          {/* Tags placeholder */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h5 className="font-medium text-sm">Tags</h5>
              <Button variant="ghost" size="sm" className="h-7 px-2">
                <Tag className="h-3 w-3 mr-1" />
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-1">
              <Badge variant="secondary">New Lead</Badge>
            </div>
          </div>

          <Separator />

          {/* Notes */}
          <div className="space-y-3">
            <h5 className="font-medium text-sm">Internal Notes</h5>

            <div className="space-y-2">
              <Textarea
                placeholder="Add a note..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                rows={2}
              />
              <Button
                size="sm"
                onClick={addNote}
                disabled={!newNote.trim() || savingNote}
              >
                {savingNote ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                ) : null}
                Add Note
              </Button>
            </div>

            {loadingNotes ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : notes.length > 0 ? (
              <div className="space-y-2 mt-3">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className="p-2 bg-muted rounded-lg text-sm"
                  >
                    <p className="text-muted-foreground text-xs mb-1">
                      {format(new Date(note.created_at), 'MMM d, HH:mm')}
                    </p>
                    <p>{note.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No notes yet</p>
            )}
          </div>

          <Separator />

          {/* Assignment */}
          <div className="space-y-3">
            <h5 className="font-medium text-sm">Assignment</h5>
            <Button variant="outline" size="sm" className="w-full">
              <UserPlus className="h-4 w-4 mr-2" />
              Assign to agent
            </Button>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
