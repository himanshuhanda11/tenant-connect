// Stable per-browser device identifier used by the WhatsApp OTP trusted-device
// system. A random UUID is generated on first use and persisted in localStorage.
// We hash it before sending to the server so the raw value never leaves the device.

const STORAGE_KEY = 'aireatro.device_id';

export function getOrCreateDeviceId(): string {
  try {
    let id = localStorage.getItem(STORAGE_KEY);
    if (!id) {
      id = (crypto as any)?.randomUUID?.() ?? `dev-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(STORAGE_KEY, id);
    }
    return id;
  } catch {
    return `ephemeral-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}

export async function getDeviceHash(): Promise<string> {
  const id = getOrCreateDeviceId();
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(id));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
