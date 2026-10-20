// Retired: this legacy endpoint used the platform-wide META_SYSTEM_USER_TOKEN and returned
// another business's ad accounts, pages and token to any workspace admin.
// Workspaces must connect their own Facebook account via meta-ads-connect-start / meta-ads-fb-login.
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve((req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  return new Response(
    JSON.stringify({ error: 'This connection method is retired. Connect your own Facebook account from Meta Ads Setup.' }),
    { status: 410, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
  );
});
