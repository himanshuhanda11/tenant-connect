import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Music2, Zap, MessageSquare, ShieldCheck, Sparkles, Loader2, Plug, PlugZap, CheckCircle2, AlertCircle } from 'lucide-react';
import { useTenant } from '@/contexts/TenantContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { SEO } from '@/components/seo';
import { TikTokSyncSettingsForm } from '@/components/integrations/TikTokSyncSettingsForm';
import { TikTokSyncDashboard } from '@/components/integrations/TikTokSyncDashboard';

interface SafeConnection {
  id: string;
  workspace_id: string;
  advertiser_id: string;
  advertiser_name: string | null;
  status: string;
  token_expires_at: string | null;
  last_sync_at: string | null;
  created_at: string;
}

const ERROR_LABELS: Record<string, string> = {
  tiktok_not_configured: 'TikTok app credentials not configured yet. Contact support.',
  invalid_state: 'Security check failed. Please try again.',
  token_exchange_failed: 'Could not exchange authorization code with TikTok.',
  no_advertisers: 'No TikTok Ads advertiser accounts found for this user.',
  save_failed: 'Could not save connection. Please retry.',
  missing_params: 'TikTok did not return a valid response.',
  server_error: 'Unexpected error during connection.',
};

export default function TikTokLeads() {
  const { currentTenant, currentRole } = useTenant();
  const [searchParams, setSearchParams] = useSearchParams();
  const [connections, setConnections] = useState<SafeConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [disconnectingId, setDisconnectingId] = useState<string | null>(null);

  const isAdmin = currentRole === 'owner' || currentRole === 'admin';
  const connected = connections.length > 0;

  const fetchConnections = async () => {
    if (!currentTenant?.id) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('tiktok_connections_safe' as any)
      .select('*')
      .eq('workspace_id', currentTenant.id)
      .order('created_at', { ascending: false });
    if (error) {
      console.error(error);
      toast({ title: 'Failed to load TikTok connections', variant: 'destructive' });
    } else {
      setConnections((data as any) || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchConnections(); /* eslint-disable-next-line */ }, [currentTenant?.id]);

  // Handle callback redirect
  useEffect(() => {
    const connectedFlag = searchParams.get('connected');
    const error = searchParams.get('error');
    if (connectedFlag) {
      toast({ title: 'TikTok connected', description: 'Your TikTok Ads account is now linked.' });
      fetchConnections();
      setSearchParams({}, { replace: true });
    } else if (error) {
      toast({
        title: 'TikTok connection failed',
        description: ERROR_LABELS[error] || error,
        variant: 'destructive',
      });
      setSearchParams({}, { replace: true });
    }
    // eslint-disable-next-line
  }, [searchParams]);

  const handleConnect = async () => {
    if (!currentTenant?.id) return;
    setConnecting(true);
    try {
      const { data, error } = await supabase.functions.invoke('tiktok-oauth-start', {
        body: {
          workspace_id: currentTenant.id,
          return_url: '/app/integrations/tiktok-leads',
        },
      });
      if (error) throw error;
      if (!data?.auth_url) throw new Error('No auth URL returned');
      window.location.href = data.auth_url;
    } catch (e: any) {
      toast({
        title: 'Could not start TikTok connection',
        description: e?.message || 'Please try again.',
        variant: 'destructive',
      });
      setConnecting(false);
    }
  };

  const handleDisconnect = async (id: string) => {
    if (!currentTenant?.id) return;
    setDisconnectingId(id);
    try {
      const { error } = await supabase.functions.invoke('tiktok-disconnect', {
        body: { workspace_id: currentTenant.id, connection_id: id },
      });
      if (error) throw error;
      toast({ title: 'Disconnected' });
      fetchConnections();
    } catch (e: any) {
      toast({ title: 'Disconnect failed', description: e?.message, variant: 'destructive' });
    } finally {
      setDisconnectingId(null);
    }
  };

  const benefits = useMemo(() => ([
    { icon: Zap, title: 'Instant Lead Capture', desc: 'TikTok lead form submissions land in your inbox in seconds.' },
    { icon: MessageSquare, title: 'WhatsApp Auto-Reply', desc: 'Greet every TikTok lead instantly using WhatsApp templates.' },
    { icon: Sparkles, title: 'AI Qualification', desc: 'Score & route leads automatically through Aireatro AI agents.' },
    { icon: ShieldCheck, title: 'Secure OAuth', desc: 'Tokens stored server-side. Each workspace sees only its own data.' },
  ]), []);

  return (
    <DashboardLayout>
      <SEO title="TikTok Leads → WhatsApp | Aireatro" description="Connect TikTok Lead Ads to Aireatro and reply to every lead on WhatsApp instantly." />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-background via-background to-primary/5 p-6 sm:p-10">
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-fuchsia-500/10 blur-3xl pointer-events-none" />
          <div className="relative flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-500 to-cyan-500 shadow-lg shadow-fuchsia-500/30">
              <Music2 className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1">
              <Badge variant="secondary" className="mb-3">New · TikTok Lead Ads</Badge>
              <h1 className="text-2xl sm:text-4xl font-bold tracking-tight leading-tight">
                Connect TikTok Leads to <span className="bg-gradient-to-r from-fuchsia-500 to-cyan-500 bg-clip-text text-transparent">WhatsApp</span>
              </h1>
              <p className="mt-3 text-base sm:text-lg text-muted-foreground max-w-2xl">
                Automatically capture TikTok leads and reply instantly using the WhatsApp Business API. Setup in &lt; 10 min.
              </p>
            </div>
          </div>
        </section>

        {/* Connection status */}
        <Card className="rounded-2xl border-border/60 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Plug className="h-5 w-5 text-primary" />
                  Connection Status
                </CardTitle>
                <CardDescription>Manage your workspace's TikTok Ads access</CardDescription>
              </div>
              {!loading && (
                connected ? (
                  <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 border">
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Connected
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground">
                    <AlertCircle className="h-3.5 w-3.5 mr-1" /> Disconnected
                  </Badge>
                )
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-10 w-40" />
              </div>
            ) : connected ? (
              <>
                <div className="space-y-2">
                  {connections.map((c) => (
                    <div key={c.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-border bg-muted/30">
                      <div className="min-w-0">
                        <div className="font-medium truncate">{c.advertiser_name || 'TikTok Advertiser'}</div>
                        <div className="text-xs text-muted-foreground font-mono truncate">ID: {c.advertiser_id}</div>
                        {c.last_sync_at && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Last sync: {new Date(c.last_sync_at).toLocaleString()}
                          </div>
                        )}
                      </div>
                      {isAdmin && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" disabled={disconnectingId === c.id}>
                              {disconnectingId === c.id ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Disconnect'}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Disconnect TikTok account?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Lead capture from <strong>{c.advertiser_name || c.advertiser_id}</strong> will stop. You can reconnect anytime.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDisconnect(c.id)}>
                                Disconnect
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  ))}
                </div>
                {isAdmin && (
                  <>
                    <Separator />
                    <Button variant="outline" onClick={handleConnect} disabled={connecting}>
                      {connecting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <PlugZap className="h-4 w-4 mr-2" />}
                      Connect another advertiser
                    </Button>
                  </>
                )}
              </>
            ) : (
              <div className="flex flex-col items-start gap-4 py-2">
                <p className="text-sm text-muted-foreground">
                  No TikTok account is linked to this workspace yet.
                </p>
                {isAdmin ? (
                  <Button
                    size="lg"
                    onClick={handleConnect}
                    disabled={connecting}
                    className="bg-gradient-to-r from-fuchsia-500 to-cyan-500 text-white hover:opacity-95 shadow-lg shadow-fuchsia-500/20"
                  >
                    {connecting ? (
                      <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> Redirecting…</>
                    ) : (
                      <><Music2 className="h-5 w-5 mr-2" /> Connect TikTok Account</>
                    )}
                  </Button>
                ) : (
                  <Badge variant="outline">Only workspace admins can connect TikTok</Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Step 2: Lead Sync & Automation */}
        {currentTenant?.id && (
          <TikTokSyncSettingsForm
            workspaceId={currentTenant.id}
            connections={connections.map(c => ({
              id: c.id,
              advertiser_id: c.advertiser_id,
              advertiser_name: c.advertiser_name,
              status: c.status,
            }))}
            isAdmin={isAdmin}
          />
        )}

        {/* Step 3: Sync Dashboard */}
        {connected && currentTenant?.id && (
          <TikTokSyncDashboard workspaceId={currentTenant.id} />
        )}

        {/* Benefits */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Why connect TikTok to Aireatro</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {benefits.map((b) => (
              <Card key={b.title} className="rounded-2xl border-border/60 hover:border-primary/40 transition-colors">
                <CardContent className="p-5 flex gap-4">
                  <div className="h-10 w-10 shrink-0 rounded-xl bg-primary/10 flex items-center justify-center">
                    <b.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{b.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{b.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
