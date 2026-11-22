import { describe, it, expect } from 'vitest';
import {
  rangeForPreset, startOfZonedDay, localInputToUtc, formatInZone, timeZoneLabel,
} from '@/lib/workspaceTime';

// 2026-11-22 19:30 UTC = 23:30 in Dubai, 01:00 on 23 Nov in India
const NOW = new Date('2026-11-22T19:30:00Z');

describe('workspace timezone date ranges', () => {
  it('UAE "Today" starts at midnight Dubai time (20:00 UTC the day before)', () => {
    const r = rangeForPreset('today', 'Asia/Dubai', NOW);
    expect(r.start.toISOString()).toBe('2026-11-21T20:00:00.000Z');
    expect(r.end.toISOString()).toBe(NOW.toISOString());
  });

  it('India "Today" is already 23 Nov at the same moment (starts 18:30 UTC on 22 Nov)', () => {
    const r = rangeForPreset('today', 'Asia/Kolkata', NOW);
    expect(r.start.toISOString()).toBe('2026-11-22T18:30:00.000Z');
  });

  it('"Yesterday" is the full previous calendar day in workspace time', () => {
    const r = rangeForPreset('yesterday', 'Asia/Dubai', NOW);
    expect(r.start.toISOString()).toBe('2026-11-20T20:00:00.000Z');
    expect(r.end.toISOString()).toBe('2026-11-21T20:00:00.000Z');
  });

  it('"Last 24 hours" is rolling, not the calendar day', () => {
    const r = rangeForPreset('last_24h', 'Asia/Kolkata', NOW);
    expect(r.start.toISOString()).toBe('2026-11-21T19:30:00.000Z');
    expect(r.end.toISOString()).toBe(NOW.toISOString());
  });

  it('"Last 7 days" covers today plus the 6 days before it', () => {
    const r = rangeForPreset('last_7d', 'Asia/Dubai', NOW);
    expect(r.start.toISOString()).toBe('2026-11-15T20:00:00.000Z');
  });

  it('custom input is read as workspace time, not device time', () => {
    expect(localInputToUtc('2026-11-22T09:00', 'Asia/Dubai')!.toISOString()).toBe('2026-11-22T05:00:00.000Z');
    expect(localInputToUtc('2026-11-22T09:00', 'Asia/Kolkata')!.toISOString()).toBe('2026-11-22T03:30:00.000Z');
  });

  it('handles daylight saving (London midnight is 23:00 UTC in summer, 00:00 in winter)', () => {
    expect(startOfZonedDay(new Date('2026-07-10T12:00:00Z'), 'Europe/London').toISOString()).toBe('2026-07-09T23:00:00.000Z');
    expect(startOfZonedDay(new Date('2026-12-10T12:00:00Z'), 'Europe/London').toISOString()).toBe('2026-12-10T00:00:00.000Z');
  });

  it('formats times in the workspace zone and labels the offset', () => {
    expect(formatInZone('2026-11-22T19:30:00Z', 'Asia/Dubai', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })).toBe('23:30');
    expect(timeZoneLabel('Asia/Kolkata', NOW)).toBe('Asia/Kolkata (UTC+5:30)');
    expect(timeZoneLabel('Asia/Dubai', NOW)).toBe('Asia/Dubai (UTC+4)');
  });
});

import { suggestTimezoneFromPhone } from '@/lib/workspaceTime';

describe('timezone suggested from the WhatsApp number', () => {
  it('UAE +971 → Asia/Dubai, India +91 → Asia/Kolkata (any formatting)', () => {
    expect(suggestTimezoneFromPhone('+971 58 551 6542')).toBe('Asia/Dubai');
    expect(suggestTimezoneFromPhone('917010305004')).toBe('Asia/Kolkata');
    expect(suggestTimezoneFromPhone('+966 53 397 2016')).toBe('Asia/Riyadh');
  });

  it('ignores Meta +1 555 test numbers and unknown codes', () => {
    expect(suggestTimezoneFromPhone('+1 555-919-4226')).toBeNull();
    expect(suggestTimezoneFromPhone('+57 315 1454652')).toBeNull();
    expect(suggestTimezoneFromPhone('')).toBeNull();
  });
});
