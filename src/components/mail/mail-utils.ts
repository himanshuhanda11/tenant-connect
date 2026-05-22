// Shared helpers for the Mail module UI.
import { supabase } from "@/integrations/supabase/client";

export type SmartView = "assigned" | "unassigned" | "starred" | "snoozed" | "sent" | "spam" | "resolved" | "all";

export const SMART_VIEWS: { id: SmartView; label: string }[] = [
  { id: "assigned", label: "Assigned to me" },
  { id: "unassigned", label: "Unassigned" },
  { id: "all", label: "All open" },
  { id: "starred", label: "Starred" },
  { id: "snoozed", label: "Snoozed" },
  { id: "sent", label: "Sent" },
  { id: "resolved", label: "Resolved" },
  { id: "spam", label: "Spam" },
];

export interface MailFilters {
  view: SmartView;
  accountId: string | null;
  priority: string | null;
  tag: string | null;
  search: string;
}

export async function fetchConversations(tenantId: string, userId: string | null, f: MailFilters) {
  let q = supabase
    .from("email_conversations")
    .select(
      "id, subject, from_email, from_name, last_message_preview, last_message_at, unread_count, status, priority, assigned_to, tags, snoozed_until, is_starred, is_spam, resolved_at, has_attachments, account_id",
    )
    .eq("tenant_id", tenantId)
    .order("last_message_at", { ascending: false, nullsFirst: false })
    .limit(200);

  switch (f.view) {
    case "assigned":
      if (userId) q = q.eq("assigned_to", userId);
      q = q.eq("status", "open").eq("is_spam", false);
      break;
    case "unassigned":
      q = q.is("assigned_to", null).eq("status", "open").eq("is_spam", false);
      break;
    case "all":
      q = q.eq("status", "open").eq("is_spam", false);
      break;
    case "starred":
      q = q.eq("is_starred", true).eq("is_spam", false);
      break;
    case "snoozed":
      q = q.not("snoozed_until", "is", null);
      break;
    case "resolved":
      q = q.in("status", ["resolved", "closed"]);
      break;
    case "spam":
      q = q.eq("is_spam", true);
      break;
    case "sent":
      // Sent: conversations with at least one outbound message — approximate with message_count > 0 and status not spam
      q = q.eq("is_spam", false);
      break;
  }

  if (f.accountId) q = q.eq("account_id", f.accountId);
  if (f.priority) q = q.eq("priority", f.priority);
  if (f.tag) q = q.contains("tags", [f.tag]);
  if (f.search.trim()) {
    const s = f.search.trim().replace(/[%_]/g, "");
    q = q.or(`subject.ilike.%${s}%,from_email.ilike.%${s}%,last_message_preview.ilike.%${s}%`);
  }

  const { data, error } = await q;
  if (error) throw error;
  return data || [];
}

export function snoozeOptions() {
  const now = new Date();
  const tomorrow9 = new Date(now); tomorrow9.setDate(now.getDate() + 1); tomorrow9.setHours(9, 0, 0, 0);
  const monday9 = new Date(now);
  const dow = now.getDay();
  monday9.setDate(now.getDate() + ((8 - dow) % 7 || 7));
  monday9.setHours(9, 0, 0, 0);
  const inHour = new Date(now.getTime() + 60 * 60_000);
  const in3h = new Date(now.getTime() + 3 * 60 * 60_000);
  return [
    { label: "In 1 hour", value: inHour.toISOString() },
    { label: "In 3 hours", value: in3h.toISOString() },
    { label: "Tomorrow 9am", value: tomorrow9.toISOString() },
    { label: "Next Monday 9am", value: monday9.toISOString() },
  ];
}

export function formatRelative(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const days = Math.floor(h / 24);
  if (days < 7) return `${days}d`;
  return d.toLocaleDateString();
}
