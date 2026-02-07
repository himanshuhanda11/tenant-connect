/**
 * Internal function-to-function call helper.
 * Used by webhooks to trigger billing-apply-plan with platform secret.
 */
export async function callFunction(
  name: string,
  body: Record<string, unknown>,
  headers: Record<string, string> = {}
) {
  const base = Deno.env.get("SUPABASE_URL")!;
  const url = `${base}/functions/v1/${name}`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...headers,
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  let json: unknown = null;
  try {
    json = JSON.parse(text);
  } catch { /* not JSON */ }
  return { ok: res.ok, status: res.status, text, json };
}
