import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { InboxConversationListV2 } from '@/components/inbox/InboxConversationListV2';
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
import { useInboxNotification } from '@/hooks/useInboxNotification';
import { InboxView, InboxFilters, INBOX_VIEW_CONFIG, ConversationStatus } from '@/types/inbox';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';
import { ArrowLeft, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

// Map routes to inbox CRM views
const ROUTE_VIEW_MAP: Record<string, { view: InboxView; crmFilter?: string }> = {
  '/inbox': { view: 'all' },
  '/inbox/mine': { view: 'mine' },
  '/inbox/new-today': { view: 'all', crmFilter: 'new_today' },
  '/inbox/followup-today': { view: 'all', crmFilter: 'followup_today' },
  '/inbox/overdue': { view: 'all', crmFilter: 'overdue' },
  '/inbox/converted': { view: 'all', crmFilter: 'converted' },
  '/inbox/junk': { view: 'all', crmFilter: 'junk' },
};

export default function InboxPage() {
  const { id: conversationId } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  
  const routeConfig = ROUTE_VIEW_MAP[location.pathname] || ROUTE_VIEW_MAP['/inbox'];
  const [view, setView] = useState<InboxView>(routeConfig.view);
  const [filters, setFilters] = useState<InboxFilters>({});
  const [crmFilter, setCrmFilter] = useState<string | undefined>(routeConfig.crmFilter);
  const [selectedId, setSelectedId] = useState<string | null>(conversationId || null);
  const [showContextPanel, setShowContextPanel] = useState(false);

  useEffect(() => {
    const config = ROUTE_VIEW_MAP[location.pathname];
    if (config) {
      setView(config.view);
      setCrmFilter(config.crmFilter);
      if (config.view === 'mine') {
        setFilters({ assignment: 'mine' });
      } else {
        setFilters(INBOX_VIEW_CONFIG[config.view]?.filter || {});
      }
    }
  }, [location.pathname]);

  // Hooks
  const { conversations, loading: loadingConversations, refetch } = useInboxConversations(view, filters);
  const { messages, loading: loadingMessages, addMessage, refetch: refetchMessages } = useInboxMessages(selectedId);
  const { events, addEvent } = useConversationEvents(selectedId);
  const { notes, addNote } = useInternalNotes(selectedId);
  const { typingUsers, setTyping } = useTypingState(selectedId);
  const actions = useInboxActions();
  const { unreadNewCount, clearNotifications } = useInboxNotification();

  const selectedConversation = conversations.find(c => c.id === selectedId) || null;

  const viewerName = (() => {
    if (!selectedConversation) return null;
    const conv = selectedConversation as any;
    if (!conv.locked_by || conv.locked_by === user?.id) return null;
    if (conv.locked_at && (Date.now() - new Date(conv.locked_at).getTime()) > 60000) return null;
    const agent = actions.teamMembers?.find(m => m.id === conv.locked_by);
    return agent?.full_name || 'Another agent';
  })();

  useEffect(() => {
    const handleUpdate = () => { refetch(); refetchMessages(); };
    const handleMessage = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.conversationId === selectedId && detail?.message) addMessage(detail.message);
    };
    window.addEventListener('inbox-update', handleUpdate);
    window.addEventListener('inbox-message', handleMessage);
    return () => {
      window.removeEventListener('inbox-update', handleUpdate);
      window.removeEventListener('inbox-message', handleMessage);
    };
  }, [selectedId, refetch, refetchMessages, addMessage]);

  useEffect(() => {
    if (conversationId && conversationId !== selectedId) setSelectedId(conversationId);
  }, [conversationId]);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    navigate(`/inbox/${id}`, { replace: true });
    actions.markAsRead(id);
    actions.openConversation(id, false);
  };

  const handleBack = () => {
    setSelectedId(null);
    navigate('/inbox', { replace: true });
    setShowContextPanel(false);
  };

  const handleViewChange = (newView: InboxView) => {
    setView(newView);
    setFilters(INBOX_VIEW_CONFIG[newView].filter);
  };

  const handleSetStatus = useCallback((status: ConversationStatus) => {
    if (selectedId) actions.setConversationStatus(selectedId, status);
  }, [selectedId, actions]);

  const handleAssign = useCallback((profileId: string | null) => {
    if (selectedId) actions.assignConversation(selectedId, profileId);
  }, [selectedId, actions]);

  const handleSetIntervene = useCallback((intervene: boolean) => {
    if (selectedId) actions.setInterveneMode(selectedId, intervene);
  }, [selectedId, actions]);

  const handleAddTag = useCallback((tagId: string) => {
    if (selectedId && tagId) actions.addTag(selectedId, tagId);
  }, [selectedId, actions]);

  const handleRemoveTag = useCallback((tagId: string) => {
    if (selectedId) actions.removeTag(selectedId, tagId);
  }, [selectedId, actions]);

  const handleSendMessage = useCallback((msg: { text?: string; template?: string; media?: File }) => {
    if (selectedId) actions.sendMessage(selectedId, msg);
  }, [selectedId, actions]);

  const handleClaim = useCallback(() => {
    if (selectedId) actions.claimConversation(selectedId);
  }, [selectedId, actions]);

  const handleIntervene = useCallback(() => {
    if (selectedId) actions.interveneConversation(selectedId);
  }, [selectedId, actions]);

  const handleTransfer = useCallback((profileId: string, resetClaim: boolean) => {
    if (selectedId) actions.transferConversation(selectedId, profileId, resetClaim);
  }, [selectedId, actions]);

  const toggleContextPanel = () => setShowContextPanel(!showContextPanel);

  // Keyboard shortcuts
  useEffect(() => {
    if (isMobile) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const currentIndex = conversations.findIndex(c => c.id === selectedId);
      switch (e.key) {
        case 'j':
          if (currentIndex < conversations.length - 1) handleSelect(conversations[currentIndex + 1].id);
          break;
        case 'k':
          if (currentIndex > 0) handleSelect(conversations[currentIndex - 1].id);
          break;
        case 'e': handleSetStatus('pending'); break;
        case 'c': handleSetStatus('closed'); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [conversations, selectedId, handleSetStatus, isMobile]);

  // Mobile
  if (isMobile) {
    return (
      <DashboardLayout>
        <TooltipProvider>
          <div className="fixed inset-0 top-12 z-20 flex flex-col bg-background overflow-hidden">
            <AnimatePresence mode="wait">
              {!selectedId ? (
                <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
                  <InboxConversationListV2
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
                    unreadNewCount={unreadNewCount}
                    onClearNotifications={clearNotifications}
                  />
                </motion.div>
              ) : showContextPanel ? (
                <motion.div key="context" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25 }} className="flex flex-col h-full bg-background">
                  <div className="h-14 border-b flex items-center gap-2 px-4 bg-card flex-shrink-0">
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
                </motion.div>
              ) : (
                <motion.div key="chat" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25 }} className="h-full">
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
                    onTransfer={handleTransfer}
                    onTyping={setTyping}
                    loading={loadingMessages}
                    availableTags={actions.availableTags}
                    teamMembers={actions.teamMembers}
                    isMobile={true}
                    onBack={handleBack}
                    onShowInfo={toggleContextPanel}
                    viewerName={viewerName}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </TooltipProvider>
      </DashboardLayout>
    );
  }

  // Desktop 3-Panel
  return (
    <DashboardLayout>
      <TooltipProvider>
        <div className="flex overflow-hidden absolute inset-0">
          {/* Left: Conversation List */}
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className="w-[340px] xl:w-[380px] flex-shrink-0 flex-grow-0 overflow-hidden"
          >
            <InboxConversationListV2
              conversations={conversations}
              selectedId={selectedId}
              onSelect={handleSelect}
              view={view}
              onViewChange={handleViewChange}
              filters={filters}
              onFiltersChange={setFilters}
              loading={loadingConversations}
              currentUserId={user?.id}
              unreadNewCount={unreadNewCount}
              onClearNotifications={clearNotifications}
            />
          </motion.div>

          {/* Center: Chat Thread */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2, delay: 0.05 }}
            className="flex-1 min-w-0 overflow-hidden"
          >
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
              onTransfer={handleTransfer}
              onTyping={setTyping}
              loading={loadingMessages}
              availableTags={actions.availableTags}
              teamMembers={actions.teamMembers}
              viewerName={viewerName}
            />
          </motion.div>

          {/* Right: Context Panel */}
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: 0.1 }}
            className="w-[300px] xl:w-[340px] flex-shrink-0 flex-grow-0"
          >
            <InboxContextPanel
              conversation={selectedConversation}
              events={events}
              notes={notes}
              onAddNote={addNote}
              onAddTag={handleAddTag}
              onRemoveTag={handleRemoveTag}
              availableTags={actions.availableTags}
            />
          </motion.div>
        </div>
      </TooltipProvider>
    </DashboardLayout>
  );
}
