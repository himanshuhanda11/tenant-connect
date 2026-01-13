import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { InboxConversationList } from '@/components/inbox/InboxConversationList';
import { InboxChatThread } from '@/components/inbox/InboxChatThread';
import { InboxContextPanel } from '@/components/inbox/InboxContextPanel';
import { 
  useInboxConversations, 
  useInboxMessages, 
  useConversationEvents,
  useInternalNotes,
  useTypingState,
  useInboxActions 
} from '@/hooks/useInbox';
import { InboxView, InboxFilters, INBOX_VIEW_CONFIG } from '@/types/inbox';
import { TooltipProvider } from '@/components/ui/tooltip';

export default function InboxPage() {
  const { id: conversationId } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  
  const [view, setView] = useState<InboxView>('all');
  const [filters, setFilters] = useState<InboxFilters>({});
  const [selectedId, setSelectedId] = useState<string | null>(conversationId || null);

  // Hooks
  const { conversations, loading: loadingConversations } = useInboxConversations(view, filters);
  const { messages, loading: loadingMessages } = useInboxMessages(selectedId);
  const { events } = useConversationEvents(selectedId);
  const { notes, addNote } = useInternalNotes(selectedId);
  const { typingUsers } = useTypingState(selectedId);
  const actions = useInboxActions();

  // Get selected conversation
  const selectedConversation = conversations.find(c => c.id === selectedId) || null;

  // Handle URL changes
  useEffect(() => {
    if (conversationId && conversationId !== selectedId) {
      setSelectedId(conversationId);
    }
  }, [conversationId]);

  // Handle selection
  const handleSelect = (id: string) => {
    setSelectedId(id);
    navigate(`/inbox/${id}`, { replace: true });
    // Mark as read
    actions.markAsRead(id);
  };

  // Handle view change
  const handleViewChange = (newView: InboxView) => {
    setView(newView);
    setFilters(INBOX_VIEW_CONFIG[newView].filter);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const currentIndex = conversations.findIndex(c => c.id === selectedId);

      switch (e.key) {
        case 'j': // Next conversation
          if (currentIndex < conversations.length - 1) {
            handleSelect(conversations[currentIndex + 1].id);
          }
          break;
        case 'k': // Previous conversation
          if (currentIndex > 0) {
            handleSelect(conversations[currentIndex - 1].id);
          }
          break;
        case 'e': // Set pending
          if (selectedId) {
            actions.setConversationStatus(selectedId, 'pending');
          }
          break;
        case 'c': // Close
          if (selectedId) {
            actions.setConversationStatus(selectedId, 'closed');
          }
          break;
        case 't': // Open tag picker
          // Implemented in chat thread
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [conversations, selectedId]);

  return (
    <DashboardLayout>
      <TooltipProvider>
        <div className="h-[calc(100vh-4rem)] flex -m-6">
          {/* Left: Conversation List */}
          <div className="w-80 flex-shrink-0">
            <InboxConversationList
              conversations={conversations}
              selectedId={selectedId}
              onSelect={handleSelect}
              view={view}
              onViewChange={handleViewChange}
              filters={filters}
              onFiltersChange={setFilters}
              loading={loadingConversations}
            />
          </div>

          {/* Center: Chat Thread */}
          <InboxChatThread
            conversation={selectedConversation}
            messages={messages}
            events={events}
            typingUsers={typingUsers}
            onSendMessage={(msg) => selectedId && actions.sendMessage(selectedId, msg)}
            onAssign={(profileId) => selectedId && actions.assignConversation(selectedId, profileId)}
            onSetStatus={(status) => selectedId && actions.setConversationStatus(selectedId, status)}
            onSetIntervene={(intervene) => selectedId && actions.setInterveneMode(selectedId, intervene)}
            onAddTag={(tagId) => selectedId && actions.addTag(selectedId, tagId)}
            loading={loadingMessages}
          />

          {/* Right: Context Panel */}
          <InboxContextPanel
            conversation={selectedConversation}
            events={events}
            notes={notes}
            onAddNote={addNote}
            onAddTag={(tagId) => selectedId && actions.addTag(selectedId, tagId)}
            onRemoveTag={(tagId) => selectedId && actions.removeTag(selectedId, tagId)}
          />
        </div>
      </TooltipProvider>
    </DashboardLayout>
  );
}
