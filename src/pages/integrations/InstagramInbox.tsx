import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList,
  BreadcrumbPage, BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Send, Search, Instagram, Loader2, MessageCircle, CheckCircle2, Clock, Ban, Bell, BellOff, Tag, StickyNote } from 'lucide-react';
import { useTenant } from '@/contexts/TenantContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { SEO } from '@/components/seo';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

type Conv = any;
type Msg = any;

const STATUS_TABS: { key: string; label: string; icon: any }[] = [
  { key: 'open', label: 'Open', icon: MessageCircle },
  { key: 'pending', label: 'Pending', icon: Clock },
  { key: 'closed', label: 'Closed', icon: CheckCircle2 },
  { key: 'spam', label: 'Spam', icon: Ban },
];

export default function InstagramInbox() {
  const { currentTenant } = useTenant();
  const [conversations, setConversations] = useState<Conv[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [status, setStatus] = useState<string>('open');
  const [search, setSearch] = useState('');
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notifyOn, setNotifyOn] = useState(true);
  const scrollEnd = useRef<HTMLDivElement>(null);

  const playPing = useCallback(() => {
    if (!notifyOn) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.type = 'sine'; o.frequency.value = 880;
      g.gain.setValueAtTime(0.0001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.15, ctx.currentTime + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25);
      o.start(); o.stop(ctx.currentTime + 0.3);
    } catch {}
  }, [notifyOn]);

  const browserNotify = useCallback((title: string, body: string) => {
    if (!notifyOn) return;
    if (typeof Notification === 'undefined') return;
    if (Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/favicon.png' });
    }
  }, [notifyOn]);

  useEffect(() => {
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  const fetchConvs = useCallback(async () => {
    if (!currentTenant?.id) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('instagram_conversations')
      .select('*, contact:instagram_contacts(*)')
      .eq('tenant_id', currentTenant.id)
      .eq('status', status)
      .order('last_message_at', { ascending: false, nullsFirst: false })
      .limit(200);
    if (!error) setConversations(data || []);
    setLoading(false);
  }, [currentTenant?.id, status]);

  useEffect(() => { fetchConvs(); }, [fetchConvs]);

  // Realtime subscription
  useEffect(() => {
    if (!currentTenant?.id) return;
    const ch = supabase
      .channel(`ig-inbox-${currentTenant.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'instagram_conversations', filter: `tenant_id=eq.${currentTenant.id}` },
        () => { fetchConvs(); })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'instagram_messages', filter: `tenant_id=eq.${currentTenant.id}` },
        (payload) => {
          const m: any = payload.new;
          if (m.conversation_id === activeId) {
            setMessages((prev) => prev.find(x => x.id === m.id) ? prev : [...prev, m]);
          }
          if (m.direction === 'inbound') {
            playPing();
            browserNotify('New Instagram message', m.text || '[media]');
          }
        })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [currentTenant?.id, activeId, fetchConvs, playPing, browserNotify]);

  const loadMessages = useCallback(async (convId: string) => {
    const { data } = await supabase
      .from('instagram_messages')
      .select('*')
      .eq('conversation_id', convId)
      .order('sent_at', { ascending: true })
      .limit(500);
    setMessages(data || []);
    // mark unread = 0
    await supabase.from('instagram_conversations').update({ unread_count: 0 }).eq('id', convId);
  }, []);

  useEffect(() => {
    if (activeId) loadMessages(activeId);
    else setMessages([]);
  }, [activeId, loadMessages]);

  useEffect(() => {
    scrollEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((c) =>
      (c.contact?.username || '').toLowerCase().includes(q) ||
      (c.contact?.name || '').toLowerCase().includes(q) ||
      (c.last_message_text || '').toLowerCase().includes(q)
    );
  }, [conversations, search]);

  const active = useMemo(() => conversations.find(c => c.id === activeId), [conversations, activeId]);

  const sendReply = async () => {
    if (!reply.trim() || !activeId) return;
    setSending(true);
    const { data, error } = await supabase.functions.invoke('instagram-send-message', {
      body: { conversationId: activeId, text: reply.trim() },
    });
    setSending(false);
    if (error || (data as any)?.error) {
      toast({ title: 'Send failed', description: (data as any)?.error || error?.message, variant: 'destructive' });
      return;
    }
    setReply('');
  };

  const updateStatus = async (newStatus: string) => {
    if (!activeId) return;
    await supabase.from('instagram_conversations').update({ status: newStatus }).eq('id', activeId);
    toast({ title: `Marked ${newStatus}` });
    fetchConvs();
  };

  const saveNotes = async (notes: string) => {
    if (!activeId) return;
    await supabase.from('instagram_conversations').update({ notes }).eq('id', activeId);
  };

  return (
    <DashboardLayout>
      <SEO title="Instagram Inbox" description="Real-time Instagram DM inbox for your team." />
      <div className="px-4 pt-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem><BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbLink href="/dashboard/integrations">Integrations</BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbPage>Instagram Inbox</BreadcrumbPage></BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[340px_1fr_320px] gap-3 p-3 h-[calc(100vh-7rem)]">
        {/* Conversations sidebar */}
        <Card className="flex flex-col overflow-hidden">
          <div className="p-3 border-b space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#FCB045] grid place-items-center">
                  <Instagram className="h-4 w-4 text-white" />
                </div>
                <div className="font-semibold">IG Inbox</div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setNotifyOn((v) => !v)} title="Toggle alerts">
                {notifyOn ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4 text-muted-foreground" />}
              </Button>
            </div>
            <div className="relative">
              <Search className="h-4 w-4 absolute left-2 top-2.5 text-muted-foreground" />
              <Input className="pl-8" placeholder="Search conversations" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Tabs value={status} onValueChange={setStatus}>
              <TabsList className="grid grid-cols-4 w-full h-8">
                {STATUS_TABS.map((t) => (
                  <TabsTrigger key={t.key} value={t.key} className="text-xs">{t.label}</TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
          <ScrollArea className="flex-1">
            {loading ? (
              <div className="p-8 grid place-items-center text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">No conversations</div>
            ) : (
              <ul className="divide-y">
                {filtered.map((c) => (
                  <li
                    key={c.id}
                    onClick={() => setActiveId(c.id)}
                    className={cn(
                      "p-3 cursor-pointer hover:bg-muted/50 flex gap-3 items-start",
                      activeId === c.id && "bg-muted"
                    )}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={c.contact?.profile_pic_url || undefined} />
                      <AvatarFallback>{(c.contact?.username || c.contact?.name || '?').slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-medium truncate text-sm">
                          {c.contact?.username ? `@${c.contact.username}` : c.contact?.name || 'Unknown'}
                        </div>
                        {c.last_message_at && (
                          <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                            {formatDistanceToNow(new Date(c.last_message_at), { addSuffix: false })}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">{c.last_message_text || '—'}</div>
                      {c.unread_count > 0 && (
                        <Badge className="mt-1 h-4 px-1.5 text-[10px] bg-gradient-to-r from-[#833AB4] to-[#FD1D1D] text-white border-0">
                          {c.unread_count}
                        </Badge>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </ScrollArea>
        </Card>

        {/* Chat thread */}
        <Card className="flex flex-col overflow-hidden">
          {!active ? (
            <div className="flex-1 grid place-items-center text-muted-foreground text-sm">
              Select a conversation
            </div>
          ) : (
            <>
              <div className="p-3 border-b flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={active.contact?.profile_pic_url || undefined} />
                    <AvatarFallback>{(active.contact?.username || '?').slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="font-semibold truncate">
                      {active.contact?.username ? `@${active.contact.username}` : active.contact?.name}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {active.contact?.follower_count ? `${active.contact.follower_count.toLocaleString()} followers` : 'Instagram contact'}
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                  {STATUS_TABS.filter(s => s.key !== active.status).map(s => (
                    <Button key={s.key} variant="outline" size="sm" onClick={() => updateStatus(s.key)}>
                      <s.icon className="h-3 w-3 mr-1" />{s.label}
                    </Button>
                  ))}
                </div>
              </div>
              <ScrollArea className="flex-1 p-4 bg-muted/20">
                <div className="space-y-2 max-w-3xl mx-auto">
                  {messages.map((m) => (
                    <div key={m.id} className={cn("flex", m.direction === 'outbound' ? 'justify-end' : 'justify-start')}>
                      <div
                        className={cn(
                          "max-w-[75%] px-3 py-2 rounded-2xl text-sm shadow-sm",
                          m.direction === 'outbound'
                            ? "bg-gradient-to-br from-[#833AB4] to-[#FD1D1D] text-white rounded-br-sm"
                            : "bg-card border rounded-bl-sm"
                        )}
                      >
                        {m.message_type === 'reaction' ? (
                          <span className="text-2xl">{m.reaction}</span>
                        ) : m.media_url ? (
                          <a href={m.media_url} target="_blank" rel="noreferrer" className="underline">
                            [{m.media_type || 'media'}]
                          </a>
                        ) : (
                          <span className="whitespace-pre-wrap break-words">{m.text}</span>
                        )}
                        <div className={cn("text-[10px] mt-1 opacity-70", m.direction === 'outbound' ? 'text-white' : 'text-muted-foreground')}>
                          {new Date(m.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={scrollEnd} />
                </div>
              </ScrollArea>
              <div className="p-3 border-t flex gap-2 items-end">
                <Textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply(); } }}
                  placeholder="Reply on Instagram…"
                  rows={1}
                  className="min-h-[40px] resize-none"
                />
                <Button onClick={sendReply} disabled={sending || !reply.trim()} className="bg-gradient-to-r from-[#833AB4] to-[#FD1D1D] text-white border-0">
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </>
          )}
        </Card>

        {/* Right sidebar — context, tags, notes */}
        <Card className="hidden md:flex flex-col overflow-hidden">
          {!active ? (
            <div className="flex-1 grid place-items-center text-muted-foreground text-xs">No selection</div>
          ) : (
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-4">
                <div className="text-center">
                  <Avatar className="h-16 w-16 mx-auto">
                    <AvatarImage src={active.contact?.profile_pic_url || undefined} />
                    <AvatarFallback>{(active.contact?.username || '?').slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="mt-2 font-semibold">
                    {active.contact?.username ? `@${active.contact.username}` : active.contact?.name}
                  </div>
                  {active.contact?.is_verified && <Badge className="mt-1" variant="secondary">Verified</Badge>}
                </div>
                <Separator />
                <div>
                  <div className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                    <Tag className="h-3 w-3" /> Tags
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {(active.tags || []).length === 0 && <span className="text-xs text-muted-foreground">No tags</span>}
                    {(active.tags || []).map((t: string) => (
                      <Badge key={t} variant="outline">{t}</Badge>
                    ))}
                  </div>
                </div>
                <Separator />
                <div>
                  <div className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                    <StickyNote className="h-3 w-3" /> Notes
                  </div>
                  <Textarea
                    defaultValue={active.notes || ''}
                    onBlur={(e) => saveNotes(e.target.value)}
                    placeholder="Internal notes (saved on blur)"
                    rows={5}
                  />
                </div>
                <Separator />
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>Status: <Badge variant="secondary">{active.status}</Badge></div>
                  {active.last_inbound_at && <div>Last reply in: {formatDistanceToNow(new Date(active.last_inbound_at), { addSuffix: true })}</div>}
                  {active.last_outbound_at && <div>Last reply out: {formatDistanceToNow(new Date(active.last_outbound_at), { addSuffix: true })}</div>}
                </div>
              </div>
            </ScrollArea>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
