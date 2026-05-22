import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/contexts/TenantContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Mail as MailIcon, Send, Inbox, Plus } from "lucide-react";
import { toast } from "sonner";

interface Conversation {
  id: string;
  subject: string | null;
  from_email: string | null;
  from_name: string | null;
  last_message_preview: string | null;
  last_message_at: string | null;
  unread_count: number;
  status: string;
}

interface Message {
  id: string;
  direction: "inbound" | "outbound";
  from_email: string | null;
  to_emails: string[];
  subject: string | null;
  body_html: string | null;
  body_text: string | null;
  created_at: string;
}

interface Account {
  id: string;
  address: string;
  display_name: string | null;
}

export default function Mail() {
  const { currentTenant } = useTenant() as { currentTenant: { id: string } | null };
  const tenantId = currentTenant?.id;

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);

  // New-inbox dialog state
  const [newAddress, setNewAddress] = useState("");

  // Compose new email
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeTo, setComposeTo] = useState("");
  const [composeSubject, setComposeSubject] = useState("");
  const [composeBody, setComposeBody] = useState("");

  useEffect(() => {
    if (!tenantId) return;
    void load();
    const ch = supabase
      .channel(`email-${tenantId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "email_conversations", filter: `tenant_id=eq.${tenantId}` },
        () => void loadConversations(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "email_messages", filter: `tenant_id=eq.${tenantId}` },
        () => {
          if (selectedId) void loadMessages(selectedId);
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(ch);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantId]);

  useEffect(() => {
    if (selectedId) void loadMessages(selectedId);
  }, [selectedId]);

  async function load() {
    setLoading(true);
    await Promise.all([loadAccounts(), loadConversations()]);
    setLoading(false);
  }

  async function loadAccounts() {
    if (!tenantId) return;
    const { data } = await supabase
      .from("email_accounts")
      .select("id, address, display_name")
      .eq("tenant_id", tenantId)
      .order("created_at");
    setAccounts((data || []) as Account[]);
  }

  async function loadConversations() {
    if (!tenantId) return;
    const { data } = await supabase
      .from("email_conversations")
      .select("id, subject, from_email, from_name, last_message_preview, last_message_at, unread_count, status")
      .eq("tenant_id", tenantId)
      .order("last_message_at", { ascending: false, nullsFirst: false })
      .limit(100);
    setConversations((data || []) as Conversation[]);
    if (!selectedId && data && data.length) setSelectedId(data[0].id);
  }

  async function loadMessages(convId: string) {
    const { data } = await supabase
      .from("email_messages")
      .select("id, direction, from_email, to_emails, subject, body_html, body_text, created_at")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true });
    setMessages((data || []) as Message[]);
    // mark read
    await supabase.from("email_conversations").update({ unread_count: 0 }).eq("id", convId);
  }

  async function createInbox() {
    if (!tenantId || !newAddress.trim()) return;
    const addr = newAddress.trim().toLowerCase();
    const { error } = await supabase.from("email_accounts").insert({
      tenant_id: tenantId,
      address: addr,
      display_name: null,
      is_default: accounts.length === 0,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    setNewAddress("");
    toast.success(`Inbox ${addr} created`);
    void loadAccounts();
  }

  async function sendReply() {
    if (!selectedId || !reply.trim()) return;
    setSending(true);
    const conv = conversations.find((c) => c.id === selectedId);
    const { data, error } = await supabase.functions.invoke("resend-send", {
      body: {
        conversation_id: selectedId,
        to: conv?.from_email ? [conv.from_email] : [],
        subject: conv?.subject ? (conv.subject.startsWith("Re:") ? conv.subject : `Re: ${conv.subject}`) : "Re:",
        html: `<div style="font-family:sans-serif;font-size:14px;line-height:1.5;white-space:pre-wrap;">${reply.replace(/</g, "&lt;")}</div>`,
        text: reply,
      },
    });
    setSending(false);
    if (error || (data as { error?: string })?.error) {
      toast.error((data as { error?: string })?.error || error?.message || "Send failed");
      return;
    }
    setReply("");
    toast.success("Reply sent");
    void loadMessages(selectedId);
  }

  async function sendNew() {
    if (!composeTo.trim() || !composeSubject.trim() || !composeBody.trim()) return;
    const account = accounts[0];
    if (!account) {
      toast.error("Create an inbox first");
      return;
    }
    setSending(true);
    const { data, error } = await supabase.functions.invoke("resend-send", {
      body: {
        account_id: account.id,
        to: composeTo.split(",").map((s) => s.trim()).filter(Boolean),
        subject: composeSubject,
        html: `<div style="font-family:sans-serif;font-size:14px;line-height:1.5;white-space:pre-wrap;">${composeBody.replace(/</g, "&lt;")}</div>`,
        text: composeBody,
      },
    });
    setSending(false);
    if (error || (data as { error?: string })?.error) {
      toast.error((data as { error?: string })?.error || error?.message || "Send failed");
      return;
    }
    toast.success("Email sent");
    setComposeOpen(false);
    setComposeTo("");
    setComposeSubject("");
    setComposeBody("");
    void loadConversations();
  }

  if (!tenantId) {
    return (
      <DashboardLayout>
        <div className="p-8 text-muted-foreground">Select a workspace to use Mail.</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-4rem)] flex-col">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div className="flex items-center gap-3">
            <MailIcon className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-semibold">Team Inbox</h1>
            <Badge variant="outline" className="ml-2">Beta</Badge>
          </div>
          <Button onClick={() => setComposeOpen((v) => !v)} size="sm">
            <Plus className="mr-1 h-4 w-4" /> New email
          </Button>
        </div>

        {accounts.length === 0 && (
          <Card className="m-6 p-6">
            <h2 className="mb-2 text-lg font-semibold">Create your first inbox</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Pick an address on <code>inbox.aireatro.com</code> (e.g. <code>support@inbox.aireatro.com</code>).
              Resend will forward inbound mail to this workspace once the inbound route is active.
            </p>
            <div className="flex gap-2">
              <Input
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                placeholder="support@inbox.aireatro.com"
              />
              <Button onClick={createInbox}>Create</Button>
            </div>
          </Card>
        )}

        {composeOpen && accounts.length > 0 && (
          <Card className="m-6 space-y-3 p-4">
            <Input placeholder="To (comma separated)" value={composeTo} onChange={(e) => setComposeTo(e.target.value)} />
            <Input placeholder="Subject" value={composeSubject} onChange={(e) => setComposeSubject(e.target.value)} />
            <Textarea placeholder="Message…" rows={6} value={composeBody} onChange={(e) => setComposeBody(e.target.value)} />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setComposeOpen(false)}>Cancel</Button>
              <Button onClick={sendNew} disabled={sending}>
                {sending ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Send className="mr-1 h-4 w-4" />}
                Send
              </Button>
            </div>
          </Card>
        )}

        {accounts.length > 0 && (
          <div className="grid flex-1 grid-cols-12 overflow-hidden">
            {/* Conversation list */}
            <div className="col-span-4 overflow-y-auto border-r">
              {loading ? (
                <div className="flex items-center justify-center p-8"><Loader2 className="h-5 w-5 animate-spin" /></div>
              ) : conversations.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  <Inbox className="mx-auto mb-2 h-8 w-8 opacity-40" />
                  No emails yet. Send a test to <code>{accounts[0].address}</code>.
                </div>
              ) : (
                conversations.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedId(c.id)}
                    className={`block w-full border-b px-4 py-3 text-left transition hover:bg-muted/50 ${
                      selectedId === c.id ? "bg-muted/70" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate text-sm font-semibold">{c.from_name || c.from_email || "Unknown"}</span>
                      {c.unread_count > 0 && <Badge className="ml-2 h-5">{c.unread_count}</Badge>}
                    </div>
                    <div className="truncate text-sm">{c.subject || "(no subject)"}</div>
                    <div className="truncate text-xs text-muted-foreground">{c.last_message_preview}</div>
                  </button>
                ))
              )}
            </div>

            {/* Thread */}
            <div className="col-span-8 flex flex-col overflow-hidden">
              {selectedId ? (
                <>
                  <div className="flex-1 space-y-4 overflow-y-auto p-6">
                    {messages.map((m) => (
                      <Card key={m.id} className={`p-4 ${m.direction === "outbound" ? "border-primary/30 bg-primary/5" : ""}`}>
                        <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                          <span>
                            <strong>{m.direction === "inbound" ? "From" : "To"}:</strong>{" "}
                            {m.direction === "inbound" ? m.from_email : m.to_emails.join(", ")}
                          </span>
                          <span>{new Date(m.created_at).toLocaleString()}</span>
                        </div>
                        {m.body_html ? (
                          <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: m.body_html }} />
                        ) : (
                          <pre className="whitespace-pre-wrap text-sm">{m.body_text}</pre>
                        )}
                      </Card>
                    ))}
                  </div>
                  <div className="border-t p-4">
                    <Textarea
                      placeholder="Type your reply…"
                      rows={3}
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                    />
                    <div className="mt-2 flex justify-end">
                      <Button onClick={sendReply} disabled={sending || !reply.trim()}>
                        {sending ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Send className="mr-1 h-4 w-4" />}
                        Send reply
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-1 items-center justify-center text-muted-foreground">Select a conversation</div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
