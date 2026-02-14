import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
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
import { InboxView, InboxFilters, INBOX_VIEW_CONFIG, ConversationStatus } from '@/types/inbox';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';
import { ArrowLeft, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function InboxPage() {
  const { id: conversationId } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  
  const [view, setView] = useState<InboxView>('all');
  const [filters, setFilters] = useState<InboxFilters>({});
  const [selectedId, setSelectedId] = useState<string | null>(conversationId || null);
  
  const [showContextPanel, setShowContextPanel] = useState(false);

  // Hooks
  const { conversations, loading: loadingConversations, refetch } = useInboxConversations(view, filters);
  const { messages, loading: loadingMessages, addMessage } = useInboxMessages(selectedId);
  const { events, addEvent } = useConversationEvents(selectedId);
  const { notes, addNote } = useInternalNotes(selectedId);
  const { typingUsers } = useTypingState(selectedId);
  const actions = useInboxActions();

  // Get selected conversation - refresh when conversations update
  const selectedConversation = conversations.find(c => c.id === selectedId) || null;

  // Listen for inbox updates
  useEffect(() => {
    const handleUpdate = () => {
      refetch();
    };

    const handleMessage = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.conversationId === selectedId && detail?.message) {
        addMessage(detail.message);
      }
    };

    window.addEventListener('inbox-update', handleUpdate);
    window.addEventListener('inbox-message', handleMessage);
    
    return () => {
      window.removeEventListener('inbox-update', handleUpdate);
      window.removeEventListener('inbox-message', handleMessage);
    };
  }, [selectedId, refetch, addMessage]);

  // Handle URL changes
  useEffect(() => {
    if (conversationId && conversationId !== selectedId) {
      setSelectedId(conversationId);
    }
  }, [conversationId]);

  // Handle selection
  // Handle selection — call open_conversation RPC
  const handleSelect = (id: string) => {
    setSelectedId(id);
    navigate(`/inbox/${id}`, { replace: true });
    actions.markAsRead(id);
    actions.openConversation(id, true); // auto-claim on open
  };

  // Handle back navigation on mobile
  const handleBack = () => {
    setSelectedId(null);
    navigate('/inbox', { replace: true });
    setShowContextPanel(false);
  };

  // Handle view change
  const handleViewChange = (newView: InboxView) => {
    setView(newView);
    setFilters(INBOX_VIEW_CONFIG[newView].filter);
  };

  // Action handlers with proper types
  const handleSetStatus = useCallback((status: ConversationStatus) => {
    if (selectedId) {
      actions.setConversationStatus(selectedId, status);
    }
  }, [selectedId, actions]);

  const handleAssign = useCallback((profileId: string | null) => {
    if (selectedId) {
      actions.assignConversation(selectedId, profileId);
    }
  }, [selectedId, actions]);

  const handleSetIntervene = useCallback((intervene: boolean) => {
    if (selectedId) {
      actions.setInterveneMode(selectedId, intervene);
    }
  }, [selectedId, actions]);

  const handleAddTag = useCallback((tagId: string) => {
    if (selectedId && tagId) {
      actions.addTag(selectedId, tagId);
    }
  }, [selectedId, actions]);

  const handleRemoveTag = useCallback((tagId: string) => {
    if (selectedId) {
      actions.removeTag(selectedId, tagId);
    }
  }, [selectedId, actions]);

  const handleSendMessage = useCallback((msg: { text?: string; template?: string; media?: File }) => {
    if (selectedId) {
      actions.sendMessage(selectedId, msg);
    }
  }, [selectedId, actions]);

  const handleClaim = useCallback(() => {
    if (selectedId) {
      actions.claimConversation(selectedId);
    }
  }, [selectedId, actions]);

  const handleIntervene = useCallback(() => {
    if (selectedId) {
      actions.interveneConversation(selectedId);
    }
  }, [selectedId, actions]);

  // Toggle context panel on mobile
  const toggleContextPanel = () => {
    setShowContextPanel(!showContextPanel);
  };

  // Keyboard shortcuts (desktop only)
  useEffect(() => {
    if (isMobile) return;

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
          handleSetStatus('pending');
          break;
        case 'c': // Close
          handleSetStatus('closed');
          break;
        case 't': // Open tag picker
          // Implemented in chat thread
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [conversations, selectedId, handleSetStatus, isMobile]);

  // Mobile: Show only conversation list or chat thread
  if (isMobile) {
    return (
      <DashboardLayout>
        <TooltipProvider>
          <div className="h-[calc(100vh-4rem)] flex flex-col -mx-4 -my-4 sm:-m-6">
            {/* Mobile: Show list when no conversation selected */}
            {!selectedId ? (
              <InboxConversationList
                conversations={conversations}
                selectedId={selectedId}
                onSelect={handleSelect}
                view={view}
                onViewChange={handleViewChange}
                filters={filters}
                onFiltersChange={setFilters}
                loading={loadingConversations}
                isMobile={true}
                currentUserId={user?.id}
              />
            ) : showContextPanel ? (
              /* Mobile: Show context panel */
              <div className="flex flex-col h-full bg-background">
                <div className="h-14 border-b flex items-center gap-2 px-4 bg-card">
                  <Button variant="ghost" size="icon" onClick={toggleContextPanel}>
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <span className="font-semibold">Contact Details</span>
                </div>
                <div className="flex-1 overflow-hidden">
                  <InboxContextPanel
                    conversation={selectedConversation}
                    events={events}
                    notes={notes}
                    onAddNote={addNote}
                    onAddTag={handleAddTag}
                    onRemoveTag={handleRemoveTag}
                    availableTags={actions.availableTags}
                    isMobile={true}
                  />
                </div>
              </div>
            ) : (
              /* Mobile: Show chat thread with back button */
              <InboxChatThread
                conversation={selectedConversation}
                messages={messages}
                events={events}
                typingUsers={typingUsers}
                onSendMessage={handleSendMessage}
                onAssign={handleAssign}
                onSetStatus={handleSetStatus}
                onSetIntervene={handleSetIntervene}
                onAddTag={handleAddTag}
                onClaim={handleClaim}
                onIntervene={handleIntervene}
                loading={loadingMessages}
                availableTags={actions.availableTags}
                teamMembers={actions.teamMembers}
                isMobile={true}
                onBack={handleBack}
                onShowInfo={toggleContextPanel}
              />
            )}
          </div>
        </TooltipProvider>
      </DashboardLayout>
    );
  }

  // Desktop view
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
              currentUserId={user?.id}
            />
          </div>

          {/* Center: Chat Thread */}
          <InboxChatThread
            conversation={selectedConversation}
            messages={messages}
            events={events}
            typingUsers={typingUsers}
            onSendMessage={handleSendMessage}
            onAssign={handleAssign}
            onSetStatus={handleSetStatus}
            onSetIntervene={handleSetIntervene}
            onAddTag={handleAddTag}
            onClaim={handleClaim}
            onIntervene={handleIntervene}
            loading={loadingMessages}
            availableTags={actions.availableTags}
            teamMembers={actions.teamMembers}
          />

          {/* Right: Context Panel */}
          <InboxContextPanel
            conversation={selectedConversation}
            events={events}
            notes={notes}
            onAddNote={addNote}
            onAddTag={handleAddTag}
            onRemoveTag={handleRemoveTag}
            availableTags={actions.availableTags}
          />
        </div>
      </TooltipProvider>
    </DashboardLayout>
  );
}
