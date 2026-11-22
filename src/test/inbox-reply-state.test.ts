import { describe, it, expect } from 'vitest';
import { isChatReplied } from '@/lib/inboxReplyState';

describe('green "replied" chats in the inbox', () => {
  it('a chat no agent has replied to is not green', () => {
    expect(isChatReplied({ last_inbound_at: '2026-11-22T10:00:00Z', last_agent_reply_at: null })).toBe(false);
  });
  it('turns green once an agent replies after the customer', () => {
    expect(isChatReplied({ last_inbound_at: '2026-11-22T10:00:00Z', last_agent_reply_at: '2026-11-22T10:05:00Z' })).toBe(true);
  });
  it('goes back to white when the customer writes again', () => {
    expect(isChatReplied({ last_inbound_at: '2026-11-22T11:00:00Z', last_agent_reply_at: '2026-11-22T10:05:00Z' })).toBe(false);
  });
});
