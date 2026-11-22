/**
 * A chat is "replied" (shown green in the inbox) when an agent has answered
 * the customer's latest message. If the customer writes again, it is waiting again.
 */
export function isChatReplied(c: { last_agent_reply_at?: string | null; last_inbound_at?: string | null }): boolean {
  if (!c.last_agent_reply_at) return false;
  if (!c.last_inbound_at) return true;
  return new Date(c.last_agent_reply_at).getTime() >= new Date(c.last_inbound_at).getTime();
}
