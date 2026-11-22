import { describe, it, expect } from 'vitest';
import { resolveInboxTimeFilter } from '@/components/inbox/InboxTimeFilter';
import { inboxSortOrder } from '@/types/inbox';

const NOW = new Date('2026-11-22T19:30:00Z'); // 23:30 in Dubai

describe('inbox date filter', () => {
  it('"Today" for a UAE workspace starts at Dubai midnight and stays open so new chats keep appearing', () => {
    const f = resolveInboxTimeFilter({ preset: 'today', field: 'created_at', sort: 'newest_received' }, 'Asia/Dubai', NOW);
    expect(f.dateFrom).toBe('2026-11-21T20:00:00.000Z');
    expect(f.dateTo).toBeUndefined();
    expect(f.dateField).toBe('created_at');
  });

  it('"Yesterday" is a closed range ending at today\'s midnight', () => {
    const f = resolveInboxTimeFilter({ preset: 'yesterday', field: 'last_inbound_at', sort: 'latest_activity' }, 'Asia/Kolkata', NOW);
    expect(f.dateFrom).toBe('2026-11-21T18:30:00.000Z');
    expect(f.dateTo).toBe('2026-11-22T18:30:00.000Z');
    expect(f.dateField).toBe('last_inbound_at');
  });

  it('"Any time" adds no date bounds', () => {
    const f = resolveInboxTimeFilter({ preset: 'all', field: 'created_at', sort: 'latest_activity' }, 'Asia/Dubai', NOW);
    expect(f.dateFrom).toBeUndefined();
    expect(f.dateTo).toBeUndefined();
  });

  it('sort options map to the right order', () => {
    expect(inboxSortOrder('newest_received')).toEqual({ column: 'created_at', ascending: false });
    expect(inboxSortOrder('oldest_received')).toEqual({ column: 'created_at', ascending: true });
    expect(inboxSortOrder('latest_activity')).toEqual({ column: 'last_message_at', ascending: false });
  });
});
