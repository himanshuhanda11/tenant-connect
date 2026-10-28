import { supabase } from '@/integrations/supabase/client';

/** WhatsApp recommends a square 640x640 photo; Meta accepts only JPG/PNG up to 5MB. */
const TARGET_SIZE = 640;
export const MAX_SOURCE_BYTES = 15 * 1024 * 1024;

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('This image could not be read. Please use a PNG or JPG file.')); };
    img.src = url;
  });
}

/**
 * Convert any browser-readable image (PNG, JPG, WebP, …) into a square 640x640 JPG.
 * The whole logo is kept (fit inside, white padding) so WhatsApp's round crop
 * doesn't cut off text at the edges.
 */
export async function prepareWhatsAppProfilePhoto(file: File): Promise<File> {
  if (!file.type.startsWith('image/')) throw new Error('Please choose an image file (PNG or JPG).');
  if (file.size > MAX_SOURCE_BYTES) throw new Error('Image must be smaller than 15MB.');
  const img = await loadImage(file);
  if (img.naturalWidth < 192 || img.naturalHeight < 192) {
    throw new Error('Image is too small. WhatsApp needs at least 192 x 192 pixels (640 x 640 recommended).');
  }
  const canvas = document.createElement('canvas');
  canvas.width = TARGET_SIZE;
  canvas.height = TARGET_SIZE;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Your browser could not process this image.');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, TARGET_SIZE, TARGET_SIZE);
  const scale = Math.min(TARGET_SIZE / img.naturalWidth, TARGET_SIZE / img.naturalHeight);
  const w = img.naturalWidth * scale;
  const h = img.naturalHeight * scale;
  ctx.drawImage(img, (TARGET_SIZE - w) / 2, (TARGET_SIZE - h) / 2, w, h);
  const blob: Blob | null = await new Promise((r) => canvas.toBlob(r, 'image/jpeg', 0.92));
  if (!blob) throw new Error('Your browser could not process this image.');
  return new File([blob], 'whatsapp-profile.jpg', { type: 'image/jpeg' });
}

/** Upload a photo to the WhatsApp Business profile of a connected number. */
export async function uploadWhatsAppProfilePhoto(params: {
  file: File;
  phoneNumberId: string;
  wabaUuid: string;
}): Promise<void> {
  const prepared = await prepareWhatsAppProfilePhoto(params.file);
  const formData = new FormData();
  formData.append('file', prepared);
  formData.append('phone_number_id', params.phoneNumberId);
  formData.append('waba_account_id', params.wabaUuid);

  const { data, error } = await supabase.functions.invoke('whatsapp-profile', { body: formData });
  if (error) {
    // Non-2xx responses: read the real reason from the response body.
    let body: any = null;
    try { body = await (error as any).context?.json?.(); } catch { /* ignore */ }
    throw new Error(body?.error || body?.details || error.message || 'Failed to update WhatsApp photo');
  }
  if (!data?.success) throw new Error(data?.error || data?.details || 'Failed to update WhatsApp photo');
}
