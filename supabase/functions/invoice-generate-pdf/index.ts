import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { invoiceId } = await req.json();
    if (!invoiceId) {
      return new Response(JSON.stringify({ error: 'Missing invoiceId' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: inv, error } = await supabase
      .from('platform_invoices')
      .select('*')
      .eq('id', invoiceId)
      .single();

    if (error || !inv) {
      return new Response(JSON.stringify({ error: 'Invoice not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate a simple HTML invoice and convert to a downloadable format
    const billed = inv.billed_to || {};
    const items = inv.line_items || [];
    const currency = inv.currency || 'INR';

    const formatMoney = (amount: number) => {
      return new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(amount);
    };

    const lineItemsHtml = items.map((it: any) =>
      `<tr>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;">${it.name || it.description || 'Item'}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center;">${it.qty || it.quantity || 1}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;">${formatMoney(it.unit_amount || 0)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;">${formatMoney(it.amount || 0)}</td>
      </tr>`
    ).join('');

    const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Invoice ${inv.invoice_number}</title></head>
<body style="font-family:system-ui,-apple-system,sans-serif;margin:0;padding:40px;color:#1a1a1a;">
  <div style="max-width:700px;margin:0 auto;">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:40px;">
      <div>
        <h1 style="margin:0;font-size:28px;font-weight:700;color:#111;">AiReatro</h1>
        <p style="margin:4px 0 0;color:#666;font-size:13px;">Communications Platform</p>
      </div>
      <div style="text-align:right;">
        <div style="font-size:24px;font-weight:700;color:#111;">INVOICE</div>
        <div style="font-size:13px;color:#666;margin-top:4px;">${inv.invoice_number}</div>
      </div>
    </div>

    <div style="display:flex;justify-content:space-between;margin-bottom:32px;">
      <div>
        <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.5px;color:#999;margin-bottom:6px;">Billed To</div>
        <div style="font-weight:600;">${billed.company || billed.name || 'Customer'}</div>
        ${billed.email ? `<div style="color:#666;font-size:13px;">${billed.email}</div>` : ''}
        ${billed.address ? `<div style="color:#666;font-size:13px;">${billed.address}</div>` : ''}
        ${billed.gstin ? `<div style="color:#666;font-size:13px;">GSTIN: ${billed.gstin}</div>` : ''}
      </div>
      <div style="text-align:right;">
        <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.5px;color:#999;margin-bottom:6px;">Invoice Details</div>
        <div style="font-size:13px;">Date: ${new Date(inv.created_at).toLocaleDateString('en-IN')}</div>
        <div style="font-size:13px;">Status: <strong>${(inv.status || 'paid').toUpperCase()}</strong></div>
        ${inv.period_start ? `<div style="font-size:13px;">Period: ${new Date(inv.period_start).toLocaleDateString('en-IN')} - ${new Date(inv.period_end).toLocaleDateString('en-IN')}</div>` : ''}
      </div>
    </div>

    <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
      <thead>
        <tr style="background:#f8f9fa;">
          <th style="padding:10px 12px;text-align:left;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;color:#666;border-bottom:2px solid #eee;">Description</th>
          <th style="padding:10px 12px;text-align:center;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;color:#666;border-bottom:2px solid #eee;">Qty</th>
          <th style="padding:10px 12px;text-align:right;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;color:#666;border-bottom:2px solid #eee;">Unit Price</th>
          <th style="padding:10px 12px;text-align:right;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;color:#666;border-bottom:2px solid #eee;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${lineItemsHtml}
      </tbody>
    </table>

    <div style="text-align:right;margin-bottom:40px;">
      <div style="font-size:20px;font-weight:700;">${formatMoney(inv.amount)}</div>
      <div style="font-size:12px;color:#666;">Total Amount</div>
    </div>

    <div style="border-top:1px solid #eee;padding-top:16px;text-align:center;color:#999;font-size:11px;">
      <p>AiReatro Communications • Thank you for your business</p>
    </div>
  </div>
</body>
</html>`;

    // Store the HTML invoice
    const path = `${inv.workspace_id}/${inv.invoice_number}.html`;
    const blob = new Blob([html], { type: 'text/html' });

    const { error: upErr } = await supabase.storage
      .from('invoices')
      .upload(path, blob, { upsert: true, contentType: 'text/html' });

    if (upErr) {
      console.error('Upload error:', upErr);
      return new Response(JSON.stringify({ error: 'Failed to upload invoice' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    await supabase.from('platform_invoices')
      .update({ pdf_path: path })
      .eq('id', invoiceId);

    // Get signed URL
    const { data: signedUrl } = await supabase.storage
      .from('invoices')
      .createSignedUrl(path, 3600);

    return new Response(JSON.stringify({
      ok: true,
      pdf_path: path,
      download_url: signedUrl?.signedUrl,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Invoice generation error:', err);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
