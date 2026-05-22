import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/contexts/TenantContext";
import { MailStandaloneLayout as DashboardLayout } from "@/components/layout/MailStandaloneLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Loader2, Mail as MailIcon, Send, Inbox, Plus, Star, StarOff, Clock,
  ShieldAlert, CheckCircle2, UserPlus, Tag as TagIcon, Sparkles, Search,
  Reply, MoreVertical, Trash2, Settings as SettingsIcon, FileText, Zap,
  BarChart3, Paperclip, Archive,
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import {
  fetchConversations, SMART_VIEWS, snoozeOptions, formatRelative,
  type SmartView, type MailFilters,
} from "@/components/mail/mail-utils";

type Conv = Awaited<ReturnType<typeof fetchConversations>>[number];

interface Message {
  id: string;
  direction: "inbound" | "outbound";
  from_email: string | null;
  from_name: string | null;
  to_emails: string[];
  subject: string | null;
  body_html: string | null;
  body_text: string | null;
  created_at: string;
  has_attachments: boolean;
}

interface Account { id: string; address: string; display_name: string | null; }
interface TenantMember { user_id: string; full_name?: string | null; email?: string | null; }

export default function Mail() {
  const { currentTenant, tenants, loading: tenantLoading, setCurrentTenant } = useTenant();
  const tenantId = currentTenant?.id;

  const [userId, setUserId] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [members, setMembers] = useState<TenantMember[]>([]);
  const [conversations, setConversations] = useState<Conv[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<MailFilters>({
    view: "all", accountId: null, priority: null, tag: null, search: "",
  });

  const [composeOpen, setComposeOpen] = useState(false);
  const [newInboxOpen, setNewInboxOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  useEffect(() => {
    if (!tenantId && !tenantLoading && tenants.length > 0) {
      setCurrentTenant(tenants[0]);
    }
  }, [tenantId, tenantLoading, tenants, setCurrentTenant]);

  const reload = useCallback(async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const data = await fetchConversations(tenantId, userId, filters);
      setConversations(data as Conv[]);
      if (!activeId && data.length) setActiveId(data[0].id);
    } catch (e) {
      console.error(e);
    } finally { setLoading(false); }
  }, [tenantId, userId, filters, activeId]);

  // Initial + filter-driven load
  useEffect(() => { void reload(); }, [reload]);

  // Realtime
  useEffect(() => {
    if (!tenantId) return;
    const ch = supabase
      .channel(`mail-${tenantId}`)
      .on("postgres_changes",
        { event: "*", schema: "public", table: "email_conversations", filter: `tenant_id=eq.${tenantId}` },
        () => void reload())
      .on("postgres_changes",
        { event: "*", schema: "public", table: "email_messages", filter: `tenant_id=eq.${tenantId}` },
        () => { if (activeId) void loadMessages(activeId); })
      .subscribe();
    return () => { void supabase.removeChannel(ch); };
  }, [tenantId, activeId, reload]);

  // Load auxiliary data
  useEffect(() => {
    if (!tenantId) return;
    (async () => {
      const [{ data: accs }, { data: mems }] = await Promise.all([
        supabase.from("email_accounts").select("id, address, display_name").eq("tenant_id", tenantId).order("created_at"),
        supabase.from("tenant_members")
          .select("user_id, profiles:profiles!tenant_members_user_id_fkey(full_name, email)")
          .eq("tenant_id", tenantId),
      ]);
      setAccounts((accs || []) as Account[]);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setMembers(((mems || []) as any[]).map((m) => ({
        user_id: m.user_id,
        full_name: m.profiles?.full_name,
        email: m.profiles?.email,
      })));
    })();
  }, [tenantId]);

  const loadMessages = useCallback(async (convId: string) => {
    const { data } = await supabase
      .from("email_messages")
      .select("id, direction, from_email, from_name, to_emails, subject, body_html, body_text, created_at, has_attachments")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true });
    setMessages((data || []) as Message[]);
    await supabase.from("email_conversations").update({ unread_count: 0 }).eq("id", convId);
  }, []);

  useEffect(() => {
    if (activeId) void loadMessages(activeId);
    setSelectedIds(new Set());
  }, [activeId, loadMessages]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "j" || e.key === "k") {
        const idx = conversations.findIndex((c) => c.id === activeId);
        if (idx < 0) return;
        const next = e.key === "j" ? idx + 1 : idx - 1;
        if (conversations[next]) setActiveId(conversations[next].id);
      } else if (e.key === "e" && activeId) {
        void updateConv(activeId, { status: "closed", resolved_at: new Date().toISOString() });
      } else if (e.key === "s" && activeId) {
        const c = conversations.find((c) => c.id === activeId);
        if (c) void updateConv(activeId, { is_starred: !c.is_starred });
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [conversations, activeId]);

  async function updateConv(id: string, patch: Record<string, unknown>) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await supabase.from("email_conversations").update(patch as any).eq("id", id);
    if (error) { toast.error(error.message); return; }
    void reload();
  }

  async function bulk(patch: Record<string, unknown>) {
    if (selectedIds.size === 0) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await supabase.from("email_conversations").update(patch as any).in("id", [...selectedIds]);
    if (error) { toast.error(error.message); return; }
    setSelectedIds(new Set());
    void reload();
  }

  const activeConv = conversations.find((c) => c.id === activeId) || null;
  const allTags = useMemo(() =>
    Array.from(new Set(conversations.flatMap((c) => c.tags || []))).sort(),
    [conversations]);

  if (!tenantId) {
    return (
      <DashboardLayout>
        <div className="flex min-h-screen items-center justify-center bg-background p-8 text-muted-foreground">
          {tenantLoading ? <Loader2 className="h-5 w-5 animate-spin text-primary" /> : "No mail workspace is available for this super admin account."}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-4rem)] flex-col bg-background">
        {/* Top bar */}
        <div className="flex items-center justify-between border-b px-4 py-2.5">
          <div className="flex items-center gap-3">
            <MailIcon className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-semibold">Mail</h1>
            <Badge variant="outline">Beta</Badge>
            <div className="relative ml-4 w-64">
              <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="h-8 pl-8"
                placeholder="Search subject, from, body…"
                value={filters.search}
                onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" asChild>
              <Link to="/mail/templates"><FileText className="mr-1 h-4 w-4" /> Templates</Link>
            </Button>
            <Button size="sm" variant="ghost" asChild>
              <Link to="/mail/automations"><Zap className="mr-1 h-4 w-4" /> Automations</Link>
            </Button>
            <Button size="sm" variant="ghost" asChild>
              <Link to="/mail/analytics"><BarChart3 className="mr-1 h-4 w-4" /> Analytics</Link>
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setNewInboxOpen(true)}>
              <SettingsIcon className="mr-1 h-4 w-4" /> Inboxes
            </Button>
            <Button size="sm" onClick={() => setComposeOpen(true)} disabled={accounts.length === 0}>
              <Plus className="mr-1 h-4 w-4" /> Compose
            </Button>
          </div>
        </div>

        {accounts.length === 0 ? (
          <EmptyInboxState onCreate={() => setNewInboxOpen(true)} />
        ) : (
          <div className="grid flex-1 grid-cols-[220px_360px_1fr_320px] overflow-hidden">
            {/* Sidebar */}
            <aside className="overflow-y-auto border-r bg-muted/30">
              <div className="p-2">
                <div className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Views</div>
                {SMART_VIEWS.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setFilters((f) => ({ ...f, view: v.id as SmartView }))}
                    className={`mb-0.5 flex w-full items-center justify-between rounded-md px-3 py-1.5 text-sm transition hover:bg-muted ${
                      filters.view === v.id ? "bg-primary/10 font-medium text-primary" : ""
                    }`}
                  >
                    <span>{v.label}</span>
                  </button>
                ))}

                <div className="mb-2 mt-4 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Inboxes</div>
                <button
                  onClick={() => setFilters((f) => ({ ...f, accountId: null }))}
                  className={`mb-0.5 flex w-full items-center justify-between rounded-md px-3 py-1.5 text-sm hover:bg-muted ${
                    filters.accountId === null ? "bg-muted font-medium" : ""
                  }`}
                >All inboxes</button>
                {accounts.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => setFilters((f) => ({ ...f, accountId: a.id }))}
                    className={`mb-0.5 flex w-full items-center justify-between rounded-md px-3 py-1.5 text-left text-sm hover:bg-muted ${
                      filters.accountId === a.id ? "bg-muted font-medium" : ""
                    }`}
                  >
                    <span className="truncate">{a.address}</span>
                  </button>
                ))}

                {allTags.length > 0 && (
                  <>
                    <div className="mb-2 mt-4 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Tags</div>
                    <button
                      onClick={() => setFilters((f) => ({ ...f, tag: null }))}
                      className={`mb-0.5 flex w-full items-center justify-between rounded-md px-3 py-1.5 text-sm hover:bg-muted ${
                        filters.tag === null ? "bg-muted font-medium" : ""
                      }`}
                    >All</button>
                    {allTags.slice(0, 20).map((t) => (
                      <button
                        key={t}
                        onClick={() => setFilters((f) => ({ ...f, tag: t }))}
                        className={`mb-0.5 flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-sm hover:bg-muted ${
                          filters.tag === t ? "bg-muted font-medium" : ""
                        }`}
                      >
                        <TagIcon className="h-3 w-3" /> {t}
                      </button>
                    ))}
                  </>
                )}
              </div>
            </aside>

            {/* Conversation list */}
            <section className="flex flex-col overflow-hidden border-r">
              <div className="flex items-center justify-between border-b px-3 py-2">
                <div className="text-xs text-muted-foreground">
                  {selectedIds.size > 0 ? `${selectedIds.size} selected` : `${conversations.length} threads`}
                </div>
                {selectedIds.size > 0 ? (
                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="ghost" onClick={() => bulk({ status: "closed", resolved_at: new Date().toISOString() })} title="Resolve">
                      <CheckCircle2 className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => bulk({ is_spam: true, status: "spam" })} title="Mark spam">
                      <ShieldAlert className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => bulk({ unread_count: 0 })} title="Mark read">
                      <Archive className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Tabs value={filters.priority || "all"} onValueChange={(v) => setFilters((f) => ({ ...f, priority: v === "all" ? null : v }))}>
                    <TabsList className="h-7">
                      <TabsTrigger value="all" className="px-2 text-xs">All</TabsTrigger>
                      <TabsTrigger value="urgent" className="px-2 text-xs">Urgent</TabsTrigger>
                      <TabsTrigger value="high" className="px-2 text-xs">High</TabsTrigger>
                    </TabsList>
                  </Tabs>
                )}
              </div>
              <ScrollArea className="flex-1">
                {loading ? (
                  <div className="flex items-center justify-center p-8"><Loader2 className="h-5 w-5 animate-spin" /></div>
                ) : conversations.length === 0 ? (
                  <div className="p-10 text-center text-sm text-muted-foreground">
                    <Inbox className="mx-auto mb-2 h-8 w-8 opacity-40" />
                    No conversations match this view.
                  </div>
                ) : conversations.map((c) => (
                  <ConvRow
                    key={c.id}
                    conv={c}
                    active={c.id === activeId}
                    selected={selectedIds.has(c.id)}
                    onSelect={(checked) => {
                      setSelectedIds((s) => {
                        const next = new Set(s);
                        if (checked) next.add(c.id); else next.delete(c.id);
                        return next;
                      });
                    }}
                    onClick={() => setActiveId(c.id)}
                  />
                ))}
              </ScrollArea>
            </section>

            {/* Thread view */}
            <section className="flex flex-col overflow-hidden">
              {activeConv ? (
                <ThreadPane
                  conv={activeConv}
                  messages={messages}
                  accounts={accounts}
                  members={members}
                  userId={userId}
                  onChange={() => { void reload(); if (activeId) void loadMessages(activeId); }}
                />
              ) : (
                <div className="flex flex-1 items-center justify-center text-muted-foreground">Select a conversation</div>
              )}
            </section>

            {/* Right context drawer */}
            <aside className="overflow-y-auto border-l bg-muted/20">
              {activeConv ? <ContextDrawer conv={activeConv} /> : null}
            </aside>
          </div>
        )}
      </div>

      <NewInboxDialog
        open={newInboxOpen}
        onOpenChange={setNewInboxOpen}
        accounts={accounts}
        tenantId={tenantId}
        onChanged={async () => {
          const { data } = await supabase.from("email_accounts").select("id, address, display_name").eq("tenant_id", tenantId).order("created_at");
          setAccounts((data || []) as Account[]);
        }}
      />
      <ComposeDialog
        open={composeOpen}
        onOpenChange={setComposeOpen}
        accounts={accounts}
        onSent={() => { setComposeOpen(false); void reload(); }}
      />
    </DashboardLayout>
  );
}

/* -------- Conversation row -------- */
function ConvRow({
  conv, active, selected, onClick, onSelect,
}: { conv: Conv; active: boolean; selected: boolean; onClick: () => void; onSelect: (b: boolean) => void; }) {
  return (
    <div
      onClick={onClick}
      className={`group flex cursor-pointer gap-2 border-b px-3 py-3 transition hover:bg-muted/40 ${active ? "bg-primary/5" : ""}`}
    >
      <input
        type="checkbox"
        checked={selected}
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => onSelect(e.target.checked)}
        className="mt-1 h-3.5 w-3.5"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className={`truncate text-sm ${conv.unread_count > 0 ? "font-semibold" : "font-medium"}`}>
            {conv.from_name || conv.from_email || "Unknown"}
          </span>
          <span className="shrink-0 text-[11px] text-muted-foreground">{formatRelative(conv.last_message_at)}</span>
        </div>
        <div className="truncate text-sm">{conv.subject || "(no subject)"}</div>
        <div className="truncate text-xs text-muted-foreground">{conv.last_message_preview}</div>
        <div className="mt-1 flex flex-wrap items-center gap-1">
          {conv.is_starred && <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />}
          {conv.snoozed_until && <Clock className="h-3 w-3 text-blue-500" />}
          {conv.has_attachments && <Paperclip className="h-3 w-3 text-muted-foreground" />}
          {conv.priority === "urgent" && <Badge variant="destructive" className="h-4 px-1 text-[10px]">Urgent</Badge>}
          {conv.priority === "high" && <Badge className="h-4 bg-orange-500 px-1 text-[10px]">High</Badge>}
          {(conv.tags || []).slice(0, 2).map((t) => (
            <Badge key={t} variant="outline" className="h-4 px-1 text-[10px]">{t}</Badge>
          ))}
          {conv.unread_count > 0 && <Badge className="h-4 px-1 text-[10px]">{conv.unread_count}</Badge>}
        </div>
      </div>
    </div>
  );
}

/* -------- Thread pane (selected conversation) -------- */
function ThreadPane({
  conv, messages, accounts, members, userId, onChange,
}: {
  conv: Conv; messages: Message[]; accounts: Account[];
  members: TenantMember[]; userId: string | null; onChange: () => void;
}) {
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [aiBusy, setAiBusy] = useState<"none" | "suggest" | "summary" | "improve">("none");
  const [aiReplies, setAiReplies] = useState<{ label: string; body: string }[]>([]);
  const [summary, setSummary] = useState<string | null>(null);
  const [showCc, setShowCc] = useState(false);
  const [cc, setCc] = useState("");
  const draftTimer = useRef<number | undefined>(undefined);

  // Load latest summary suggestion + draft
  useEffect(() => {
    setReply(""); setAiReplies([]); setSummary(null);
    (async () => {
      const { data: sugg } = await supabase
        .from("email_ai_suggestions")
        .select("kind, content, created_at")
        .eq("conversation_id", conv.id)
        .eq("kind", "summary")
        .order("created_at", { ascending: false })
        .limit(1);
      if (sugg?.[0]) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setSummary(((sugg[0].content as any)?.summary) ?? null);
      }
      if (userId) {
        const { data: dr } = await supabase
          .from("email_drafts")
          .select("body_text, cc_emails")
          .eq("conversation_id", conv.id)
          .eq("user_id", userId)
          .maybeSingle();
        if (dr) { setReply(dr.body_text || ""); if (dr.cc_emails?.length) { setCc(dr.cc_emails.join(", ")); setShowCc(true); } }
      }
    })();
  }, [conv.id, userId]);

  // Autosave drafts (debounced)
  useEffect(() => {
    if (!userId) return;
    window.clearTimeout(draftTimer.current);
    if (!reply.trim() && !cc.trim()) return;
    draftTimer.current = window.setTimeout(async () => {
      await supabase.from("email_drafts").upsert({
        tenant_id: conv.tenant_id ?? (conv as unknown as { tenant_id: string }).tenant_id,
        conversation_id: conv.id,
        user_id: userId,
        body_text: reply,
        cc_emails: cc.split(",").map((s) => s.trim()).filter(Boolean),
        updated_at: new Date().toISOString(),
      }, { onConflict: "conversation_id,user_id" });
    }, 700) as unknown as number;
  }, [reply, cc, conv.id, userId, conv]);

  // Live presence — viewers heartbeat
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    const ping = async () => {
      if (cancelled) return;
      await supabase.from("email_conversation_viewers").upsert({
        tenant_id: (conv as unknown as { tenant_id: string }).tenant_id,
        conversation_id: conv.id,
        user_id: userId,
        is_typing: false,
        last_seen_at: new Date().toISOString(),
      }, { onConflict: "conversation_id,user_id" });
    };
    void ping();
    const iv = setInterval(ping, 20_000);
    return () => { cancelled = true; clearInterval(iv); };
  }, [conv.id, userId, conv]);

  const account = accounts.find((a) => a.id === conv.account_id) || accounts[0];

  async function send() {
    if (!reply.trim()) return;
    setSending(true);
    const subject = conv.subject ? (conv.subject.startsWith("Re:") ? conv.subject : `Re: ${conv.subject}`) : "Re:";
    const { data, error } = await supabase.functions.invoke("resend-send", {
      body: {
        conversation_id: conv.id,
        account_id: account?.id,
        to: conv.from_email ? [conv.from_email] : [],
        cc: cc.split(",").map((s) => s.trim()).filter(Boolean),
        subject,
        html: `<div style="font-family:sans-serif;font-size:14px;line-height:1.5;white-space:pre-wrap;">${reply.replace(/</g, "&lt;")}</div>`,
        text: reply,
      },
    });
    setSending(false);
    if (error || (data as { error?: string })?.error) {
      toast.error((data as { error?: string })?.error || error?.message || "Send failed");
      return;
    }
    setReply(""); setCc(""); setShowCc(false);
    // delete draft
    if (userId) await supabase.from("email_drafts").delete().eq("conversation_id", conv.id).eq("user_id", userId);
    toast.success("Reply sent");
    onChange();
  }

  async function callAI(action: "suggest" | "summary" | "improve") {
    setAiBusy(action);
    try {
      if (action === "suggest") {
        const { data, error } = await supabase.functions.invoke("email-ai-suggest-reply", {
          body: { conversation_id: conv.id },
        });
        if (error || (data as { error?: string })?.error) throw new Error((data as { error?: string })?.error || error?.message);
        setAiReplies(((data as { replies?: { label: string; body: string }[] }).replies) || []);
      } else if (action === "summary") {
        const { data, error } = await supabase.functions.invoke("email-ai-summarize", {
          body: { conversation_id: conv.id },
        });
        if (error || (data as { error?: string })?.error) throw new Error((data as { error?: string })?.error || error?.message);
        setSummary((data as { summary?: string }).summary || null);
      } else if (action === "improve") {
        if (!reply.trim()) { toast.info("Type a draft first"); return; }
        const { data, error } = await supabase.functions.invoke("email-ai-compose", {
          body: { text: reply, action: "improve" },
        });
        if (error || (data as { error?: string })?.error) throw new Error((data as { error?: string })?.error || error?.message);
        setReply((data as { text?: string }).text || reply);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg === "rate_limited") toast.error("Rate limited, try again shortly");
      else if (msg === "payment_required") toast.error("AI credits exhausted");
      else toast.error(msg);
    } finally { setAiBusy("none"); }
  }

  async function setConv(patch: Record<string, unknown>) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await supabase.from("email_conversations").update(patch as any).eq("id", conv.id);
    if (error) toast.error(error.message); else onChange();
  }

  return (
    <>
      {/* Thread toolbar */}
      <div className="flex items-center justify-between gap-2 border-b px-4 py-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="truncate text-base font-semibold">{conv.subject || "(no subject)"}</h2>
            {conv.priority === "urgent" && <Badge variant="destructive">Urgent</Badge>}
            {conv.is_starred && <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />}
          </div>
          <div className="truncate text-xs text-muted-foreground">{conv.from_name} &lt;{conv.from_email}&gt;</div>
        </div>
        <div className="flex items-center gap-1">
          <Button size="sm" variant="ghost" onClick={() => setConv({ is_starred: !conv.is_starred })}>
            {conv.is_starred ? <StarOff className="h-4 w-4" /> : <Star className="h-4 w-4" />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost"><UserPlus className="mr-1 h-4 w-4" /> Assign</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Assign to</DropdownMenuLabel>
              {userId && (
                <DropdownMenuItem onClick={() => setConv({ assigned_to: userId, assigned_at: new Date().toISOString() })}>
                  Me
                </DropdownMenuItem>
              )}
              {members.map((m) => (
                <DropdownMenuItem key={m.user_id} onClick={() => setConv({ assigned_to: m.user_id, assigned_at: new Date().toISOString() })}>
                  {m.full_name || m.email || m.user_id.slice(0, 8)}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setConv({ assigned_to: null, assigned_at: null })}>Unassign</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost"><Clock className="mr-1 h-4 w-4" /> Snooze</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {snoozeOptions().map((o) => (
                <DropdownMenuItem key={o.value} onClick={() => setConv({ snoozed_until: o.value, status: "pending" })}>
                  {o.label}
                </DropdownMenuItem>
              ))}
              {conv.snoozed_until && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setConv({ snoozed_until: null, status: "open" })}>Unsnooze</DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <Select value={conv.priority} onValueChange={(v) => setConv({ priority: v })}>
            <SelectTrigger className="h-8 w-28 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>

          <Button size="sm" variant="ghost" onClick={() => setConv({ status: "closed", resolved_at: new Date().toISOString(), resolved_by: userId })}>
            <CheckCircle2 className="mr-1 h-4 w-4" /> Resolve
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button size="sm" variant="ghost"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setConv({ is_spam: true, status: "spam" })}>
                <ShieldAlert className="mr-2 h-4 w-4" /> Mark as spam
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setConv({ unread_count: 1 })}>
                <Inbox className="mr-2 h-4 w-4" /> Mark unread
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={async () => {
                  if (!confirm("Delete this conversation?")) return;
                  const { error } = await supabase.from("email_conversations").delete().eq("id", conv.id);
                  if (error) toast.error(error.message); else onChange();
                }}>
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* AI summary card */}
      {summary && (
        <Card className="m-3 border-primary/40 bg-primary/5 p-3">
          <div className="mb-1 flex items-center gap-2 text-xs font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" /> AI summary
          </div>
          <pre className="whitespace-pre-wrap text-xs leading-relaxed">{summary}</pre>
        </Card>
      )}

      {/* Messages */}
      <ScrollArea className="flex-1">
        <div className="space-y-3 p-4">
          {messages.map((m) => (
            <Card key={m.id} className={`p-4 ${m.direction === "outbound" ? "border-primary/30 bg-primary/5" : ""}`}>
              <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  <strong>{m.direction === "inbound" ? "From" : "To"}:</strong>{" "}
                  {m.direction === "inbound" ? `${m.from_name || ""} <${m.from_email}>` : m.to_emails.join(", ")}
                </span>
                <span>{new Date(m.created_at).toLocaleString()}</span>
              </div>
              {m.body_html ? (
                <iframe
                  title={`msg-${m.id}`}
                  sandbox=""
                  className="min-h-[120px] w-full rounded border"
                  srcDoc={`<html><body style="font-family:system-ui;font-size:14px;color:#1a1a1a;padding:8px">${m.body_html}</body></html>`}
                />
              ) : (
                <pre className="whitespace-pre-wrap text-sm">{m.body_text}</pre>
              )}
            </Card>
          ))}
        </div>
      </ScrollArea>

      {/* AI reply suggestions */}
      {aiReplies.length > 0 && (
        <div className="border-t bg-primary/5 p-3">
          <div className="mb-2 flex items-center gap-2 text-xs font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" /> Suggested replies
          </div>
          <div className="grid grid-cols-3 gap-2">
            {aiReplies.map((r, i) => (
              <button
                key={i}
                onClick={() => { setReply(r.body); setAiReplies([]); }}
                className="rounded border bg-background p-2 text-left text-xs hover:border-primary"
              >
                <div className="mb-1 font-semibold">{r.label}</div>
                <div className="line-clamp-4 text-muted-foreground">{r.body}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Composer */}
      <div className="border-t p-3">
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">From:</span>
            <Select value={account?.id} onValueChange={() => { /* no-op for now */ }}>
              <SelectTrigger className="h-7 w-56 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>{accounts.map((a) => <SelectItem key={a.id} value={a.id}>{a.address}</SelectItem>)}</SelectContent>
            </Select>
            <button className="text-xs text-muted-foreground hover:text-foreground" onClick={() => setShowCc((v) => !v)}>
              {showCc ? "Hide" : "Add"} Cc
            </button>
          </div>
          <div className="flex items-center gap-1">
            <Button size="sm" variant="ghost" disabled={aiBusy !== "none"} onClick={() => callAI("suggest")}>
              <Sparkles className="mr-1 h-3.5 w-3.5" />{aiBusy === "suggest" ? <Loader2 className="h-3 w-3 animate-spin" /> : "Suggest"}
            </Button>
            <Button size="sm" variant="ghost" disabled={aiBusy !== "none"} onClick={() => callAI("summary")}>
              {aiBusy === "summary" ? <Loader2 className="h-3 w-3 animate-spin" /> : "Summarize"}
            </Button>
            <Button size="sm" variant="ghost" disabled={aiBusy !== "none" || !reply.trim()} onClick={() => callAI("improve")}>
              {aiBusy === "improve" ? <Loader2 className="h-3 w-3 animate-spin" /> : "Improve"}
            </Button>
          </div>
        </div>
        {showCc && (
          <Input className="mb-2" placeholder="Cc (comma separated)" value={cc} onChange={(e) => setCc(e.target.value)} />
        )}
        <Textarea
          placeholder="Type your reply… (Cmd+Enter to send)"
          rows={4}
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") void send(); }}
        />
        <div className="mt-2 flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            {reply.length > 0 ? "Draft autosaved" : "Tip: j/k navigate · e resolve · s star"}
          </div>
          <Button onClick={send} disabled={sending || !reply.trim()}>
            {sending ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Send className="mr-1 h-4 w-4" />} Reply
          </Button>
        </div>
      </div>
    </>
  );
}

/* -------- Right context drawer -------- */
function ContextDrawer({ conv }: { conv: Conv }) {
  const [notes, setNotes] = useState<{ id: string; body: string; created_at: string; author_id: string }[]>([]);
  const [noteText, setNoteText] = useState("");
  const [viewers, setViewers] = useState<{ user_id: string; last_seen_at: string }[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("email_notes")
        .select("id, body, created_at, author_id")
        .eq("conversation_id", conv.id)
        .order("created_at", { ascending: false });
      setNotes((data as any) || []);

      const cutoff = new Date(Date.now() - 45_000).toISOString();
      const { data: v } = await supabase
        .from("email_conversation_viewers")
        .select("user_id, last_seen_at")
        .eq("conversation_id", conv.id)
        .gt("last_seen_at", cutoff);
      setViewers(v || []);
    })();
  }, [conv.id]);

  async function addNote() {
    if (!noteText.trim()) return;
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const { error } = await supabase.from("email_notes").insert({
      tenant_id: (conv as unknown as { tenant_id: string }).tenant_id,
      conversation_id: conv.id,
      author_id: u.user.id,
      body: noteText,
    });
    if (error) { toast.error(error.message); return; }
    setNoteText("");
    const { data } = await supabase.from("email_notes").select("id, body, created_at, author_id").eq("conversation_id", conv.id).order("created_at", { ascending: false });
    setNotes((data as any) || []);
  }

  return (
    <div className="space-y-4 p-4">
      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Customer</h3>
        <Card className="p-3 text-sm">
          <div className="font-medium">{conv.from_name || "Unknown"}</div>
          <div className="break-all text-xs text-muted-foreground">{conv.from_email}</div>
          <div className="mt-2 flex flex-wrap gap-1">
            {(conv.tags || []).map((t) => <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>)}
          </div>
        </Card>
      </div>

      {viewers.length > 0 && (
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Viewing now</h3>
          <Card className="flex flex-wrap gap-1 p-3 text-xs">
            {viewers.map((v) => (
              <Badge key={v.user_id} variant="secondary" className="text-[10px]">
                <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-green-500" />
                {v.user_id.slice(0, 6)}
              </Badge>
            ))}
          </Card>
        </div>
      )}

      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Internal notes</h3>
        <div className="space-y-2">
          <Textarea
            placeholder="Add a private note…"
            rows={2}
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
          />
          <Button size="sm" className="w-full" onClick={addNote} disabled={!noteText.trim()}>Add note</Button>
          <div className="space-y-2">
            {notes.map((n) => (
              <Card key={n.id} className="border-yellow-500/30 bg-yellow-500/5 p-2 text-xs">
                <div className="mb-1 text-[10px] text-muted-foreground">{new Date(n.created_at).toLocaleString()}</div>
                <div className="whitespace-pre-wrap">{n.body}</div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------- Empty state -------- */
function EmptyInboxState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-1 items-center justify-center p-12">
      <Card className="max-w-md p-8 text-center">
        <Inbox className="mx-auto mb-4 h-12 w-12 text-primary" />
        <h2 className="mb-2 text-lg font-semibold">Create your first inbox</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Pick an address on <code>inbox.aireatro.com</code> (e.g. <code>support@inbox.aireatro.com</code>).
          Inbound mail to it will appear here.
        </p>
        <Button onClick={onCreate}><Plus className="mr-1 h-4 w-4" /> Set up inbox</Button>
      </Card>
    </div>
  );
}

/* -------- New inbox dialog -------- */
function NewInboxDialog({
  open, onOpenChange, accounts, tenantId, onChanged,
}: { open: boolean; onOpenChange: (b: boolean) => void; accounts: Account[]; tenantId: string; onChanged: () => void; }) {
  const [addr, setAddr] = useState("");
  async function create() {
    if (!addr.trim()) return;
    const a = addr.trim().toLowerCase();
    const { error } = await supabase.from("email_accounts").insert({
      tenant_id: tenantId, address: a, display_name: null, is_default: accounts.length === 0,
    });
    if (error) { toast.error(error.message); return; }
    setAddr("");
    toast.success(`Inbox ${a} created`);
    onChanged();
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Inboxes</DialogTitle></DialogHeader>
        <div className="space-y-2">
          {accounts.map((a) => (
            <div key={a.id} className="flex items-center justify-between rounded border px-3 py-2 text-sm">
              <span>{a.address}</span>
              <Button size="sm" variant="ghost" onClick={async () => {
                if (!confirm("Remove this inbox?")) return;
                const { error } = await supabase.from("email_accounts").delete().eq("id", a.id);
                if (error) toast.error(error.message); else onChanged();
              }}><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-2">
          <div className="text-xs text-muted-foreground">Add address (on <code>inbox.aireatro.com</code>)</div>
          <div className="flex gap-2">
            <Input placeholder="support@inbox.aireatro.com" value={addr} onChange={(e) => setAddr(e.target.value)} />
            <Button onClick={create}>Add</Button>
          </div>
        </div>
        <DialogFooter><Button variant="ghost" onClick={() => onOpenChange(false)}>Close</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* -------- Compose new dialog -------- */
function ComposeDialog({
  open, onOpenChange, accounts, onSent,
}: { open: boolean; onOpenChange: (b: boolean) => void; accounts: Account[]; onSent: () => void; }) {
  const [accountId, setAccountId] = useState<string>("");
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  useEffect(() => { if (open && accounts[0]) setAccountId(accounts[0].id); }, [open, accounts]);
  async function send() {
    if (!to.trim() || !subject.trim() || !body.trim()) return;
    setSending(true);
    const { data, error } = await supabase.functions.invoke("resend-send", {
      body: {
        account_id: accountId,
        to: to.split(",").map((s) => s.trim()).filter(Boolean),
        subject,
        html: `<div style="font-family:sans-serif;font-size:14px;line-height:1.5;white-space:pre-wrap;">${body.replace(/</g, "&lt;")}</div>`,
        text: body,
      },
    });
    setSending(false);
    if (error || (data as { error?: string })?.error) {
      toast.error((data as { error?: string })?.error || error?.message || "Send failed"); return;
    }
    setTo(""); setSubject(""); setBody("");
    toast.success("Email sent"); onSent();
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>New email</DialogTitle></DialogHeader>
        <div className="space-y-2">
          <Select value={accountId} onValueChange={setAccountId}>
            <SelectTrigger><SelectValue placeholder="From inbox" /></SelectTrigger>
            <SelectContent>{accounts.map((a) => <SelectItem key={a.id} value={a.id}>{a.address}</SelectItem>)}</SelectContent>
          </Select>
          <Input placeholder="To (comma separated)" value={to} onChange={(e) => setTo(e.target.value)} />
          <Input placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
          <Textarea placeholder="Message…" rows={10} value={body} onChange={(e) => setBody(e.target.value)} />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={send} disabled={sending}>
            {sending ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Send className="mr-1 h-4 w-4" />} Send
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
