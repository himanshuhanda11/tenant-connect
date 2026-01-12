import { formatDistanceToNow } from 'date-fns';
import { Search, MessageSquare, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { ConversationWithDetails } from '@/hooks/useConversations';

interface ConversationListProps {
  conversations: ConversationWithDetails[];
  selectedId: string | null;
  onSelect: (conversation: ConversationWithDetails) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  loading?: boolean;
}

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
  searchQuery,
  onSearchChange,
  loading,
}: ConversationListProps) {
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

  const getMessagePreview = (conv: ConversationWithDetails) => {
    const msg = conv.last_message;
    if (!msg) return 'No messages yet';

    if (msg.type !== 'text') {
      const typeLabels: Record<string, string> = {
        image: '📷 Photo',
        video: '🎥 Video',
        audio: '🎵 Audio',
        document: '📄 Document',
        sticker: '🎨 Sticker',
        location: '📍 Location',
        contact: '👤 Contact',
        template: '📋 Template',
      };
      return typeLabels[msg.type] || '📎 Attachment';
    }

    return msg.text?.slice(0, 50) + (msg.text && msg.text.length > 50 ? '...' : '') || '';
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-3 border-b">
          <Skeleton className="h-9 w-full" />
        </div>
        <div className="flex-1 p-2 space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-3 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Conversation list */}
      <ScrollArea className="flex-1">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
            <MessageSquare className="h-10 w-10 mb-2" />
            <p className="text-sm">No conversations found</p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => onSelect(conv)}
                className={cn(
                  'w-full p-3 rounded-lg text-left transition-colors',
                  'hover:bg-accent',
                  selectedId === conv.id && 'bg-accent'
                )}
              >
                <div className="flex gap-3">
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarImage src={conv.contact?.profile_picture_url || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
                      {getInitials(conv.contact?.name, conv.contact?.wa_id)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm truncate">
                        {conv.contact?.name || conv.contact?.wa_id || 'Unknown'}
                      </span>
                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        {conv.last_message_at
                          ? formatDistanceToNow(new Date(conv.last_message_at), {
                              addSuffix: true,
                            })
                          : ''}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-0.5">
                      <p className="text-xs text-muted-foreground truncate">
                        {conv.last_message?.direction === 'outbound' && (
                          <span className="mr-1">You:</span>
                        )}
                        {getMessagePreview(conv)}
                      </p>

                      <div className="flex items-center gap-1 flex-shrink-0">
                        {conv.unread_count > 0 && (
                          <Badge
                            variant="default"
                            className="h-5 min-w-[20px] px-1.5 text-xs"
                          >
                            {conv.unread_count}
                          </Badge>
                        )}
                        {conv.status === 'closed' && (
                          <Badge variant="secondary" className="h-5 text-xs">
                            Closed
                          </Badge>
                        )}
                      </div>
                    </div>

                    {conv.assigned_to && (
                      <div className="flex items-center gap-1 mt-1">
                        <User className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Assigned</span>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
