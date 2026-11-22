import type { DrilldownMetric } from '@/hooks/useAgentPerformanceReport';

/** One set of labels/definitions shared by cards, table headers and drill-downs. */
export const METRIC_INFO: Record<DrilldownMetric, { label: string; help: string }> = {
  new_total: {
    label: 'New chats',
    help: 'Chats that started for the first time in this period. Each chat counts once, however many messages it has. Credited to the first agent it was assigned to.',
  },
  new_by_customer: { label: 'Started by customer', help: 'New chats where the customer sent the first message.' },
  new_by_agent: { label: 'Started by agent', help: 'New chats where your team sent the first message (for example a template).' },
  new_handled: { label: 'New chats handled', help: 'New chats where the agent sent at least one reply in this period.' },
  existing_handled: {
    label: 'Existing chats handled',
    help: 'Older chats (started before this period) where the agent sent at least one reply in this period.',
  },
  total_handled: {
    label: 'Total handled',
    help: 'Different chats the agent replied to in this period (new + existing). A chat counts once even with many replies. Being assigned alone does not count.',
  },
  customer_replies: {
    label: 'Customer replies',
    help: 'Existing chats where the customer wrote again in this period. Credited to whoever owned the chat at the end of the period.',
  },
  agent_replies: { label: 'Replies sent', help: 'Number of messages the agent sent in this period (automatic replies are not counted).' },
  pending: { label: 'Waiting for reply', help: 'Open chats (right now) where the customer wrote last and no one has replied yet.' },
  unassigned: { label: 'Unassigned', help: 'Open chats (right now) that no agent owns yet — the same list as Inbox › Unassigned.' },
  first_response: {
    label: 'First reply time',
    help: 'Average time from the customer’s first message to the first reply by an agent, for new chats in this period.',
  },
};
