import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList,
  BreadcrumbPage, BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Instagram, Loader2, PlugZap, RefreshCw, CheckCircle2, AlertCircle, ShieldCheck, MessageSquare, Sparkles, Users } from 'lucide-react';
import { useTenant } from '@/contexts/TenantContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { SEO } from '@/components/seo';
import { formatDistanceToNow } from 'date-fns';

interface IGAccount {
  id: string;
  ig_username: string | null;
  ig_name: string | null;
  profile_picture_url: string | null;
  followers_count: number | null;
  facebook_page_id: string | null;
  facebook_page_name: string | null;
  status: string;
  health_status: string;
  last_error: string | null;
  webhook_subscribed: boolean;
  connected_at: string;
  last_synced_at: string | null;
}

const ERROR_LABELS: Record<string, string> = {
  no_ig_account: 'No Instagram Professional account is linked to your Facebook Pages. Convert your account to Business/Creator and link it to a Page.',
  token_exchange: 'Could not exchange authorization code with Meta.',
  state_expired: 'Session expired. Please try again.',
  invalid_state: 'Security check failed. Please try again.',
  missing_params: 'Meta did not return a valid response.',
  save_failed: 'Could not save connection. Please retry.',
  server_error: 'Unexpected error during connection.',
};

export default function InstagramConnect() {
  const { currentTenant, currentRole } = useTenant();
  const [searchParams, setSearchParams] = useSearchParams();
  const [account, setAccount] = useState<IGAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [checking, setChecking] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  const isAdmin = currentRole === 'owner' || currentRole === 'admin';

  const fetchStatus = useCallback(async () => {
    if (!currentTenant?.id) return;
    setLoading(true);
    const { data, error } = await supabase.functions.invoke('instagram-manage', {
      body: { tenantId: currentTenant.id, action: 'status' },
    });
    if (error) {
      console.error(error);
      toast({ title: 'Failed to load Instagram status', variant: 'destructive' });
    } else {
      setAccount((data as any)?.account || null);
    }
    setLoading(false);
  }, [currentTenant?.id]);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  // Handle callback redirect params
  useEffect(() => {
    const connected = searchParams.get('connected');
    const error = searchParams.get('error');
    if (connected) {
      toast({ title: 'Instagram connected', description: 'Your account is ready to receive messages.' });
      setSearchParams({});
      fetchStatus();
    } else if (error) {
      toast({
        title: 'Connection failed',
        description: ERROR_LABELS[error] || decodeURIComponent(error),
        variant: 'destructive',
      });
      setSearchParams({});
    }
  }, [searchParams, setSearchParams, fetchStatus]);

  const handleConnect = async () => {
    if (!currentTenant?.id) return;
    setConnecting(true);
    try {
      const { data, error } = await supabase.functions.invoke('instagram-oauth-start', {
        body: { tenantId: currentTenant.id, returnUrl: window.location.href },
      });
      if (error || !(data as any)?.authUrl) throw new Error(error?.message || 'Failed to start OAuth');
      window.location.href = (data as any).authUrl;
    } catch (err: any) {
      toast({ title: 'Could not start connection', description: err.message, variant: 'destructive' });
      setConnecting(false);
    }
  };

  const handleHealthCheck = async () => {
    if (!currentTenant?.id) return;
    setChecking(true);
    const { data } = await supabase.functions.invoke('instagram-manage', {
      body: { tenantId: currentTenant.id, action: 'health' },
    });
    setChecking(false);
    const status = (data as any)?.status;
    toast({
      title: 'Health check complete',
      description: status === 'connected' ? 'Connection is healthy.' : `Status: ${status}`,
      variant: status === 'connected' ? 'default' : 'destructive',
    });
    fetchStatus();
  };

  const handleDisconnect = async () => {
    if (!currentTenant?.id || !account) return;
    setDisconnecting(true);
    const { error } = await supabase.functions.invoke('instagram-manage', {
      body: { tenantId: currentTenant.id, action: 'disconnect', accountId: account.id },
    });
    setDisconnecting(false);
    if (error) {
      toast({ title: 'Disconnect failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Instagram disconnected' });
      setAccount(null);
    }
  };

  const statusBadge = () => {
    if (!account) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/30 px-3 py-1.5 text-xs font-medium text-white shadow-sm">
          <span className="h-2 w-2 rounded-full bg-white/70" />
          Not connected
        </span>
      );
    }
    const map: Record<string, { label: string; icon: any; tone: string; dot: string }> = {
      connected: { label: 'Connected', icon: CheckCircle2, tone: 'bg-emerald-500/90 border-emerald-300/50 text-white', dot: 'bg-white' },
      expired: { label: 'Token expired', icon: AlertCircle, tone: 'bg-red-500/90 border-red-300/50 text-white', dot: 'bg-white' },
      permission_issue: { label: 'Permission issue', icon: AlertCircle, tone: 'bg-red-500/90 border-red-300/50 text-white', dot: 'bg-white' },
      webhook_inactive: { label: 'Webhook inactive', icon: AlertCircle, tone: 'bg-amber-500/90 border-amber-300/50 text-white', dot: 'bg-white' },
      disconnected: { label: 'Disconnected', icon: AlertCircle, tone: 'bg-white/15 border-white/30 text-white', dot: 'bg-white/70' },
    };
    const cfg = map[account.status] || map.connected;
    const Icon = cfg.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full backdrop-blur-md border px-3 py-1.5 text-xs font-semibold shadow-sm ${cfg.tone}`}>
        <Icon className="h-3.5 w-3.5" />
        {cfg.label}
      </span>
    );
  };

  return (
    <DashboardLayout>
      <SEO title="Connect Instagram | Aireatro" description="Connect your Instagram Professional account to manage DMs, comments, and lead capture." />

      <div className="container mx-auto px-4 py-6 max-w-5xl space-y-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem><BreadcrumbLink asChild><Link to="/app">Dashboard</Link></BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbLink asChild><Link to="/app/integrations">Integrations</Link></BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbPage>Instagram</BreadcrumbPage></BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Hero */}
        <div className="relative overflow-hidden rounded-2xl p-6 sm:p-8 text-white"
          style={{ background: 'linear-gradient(135deg, #833AB4 0%, #C13584 25%, #E1306C 50%, #FD1D1D 75%, #FCB045 100%)' }}>
          <div className="absolute inset-0 opacity-20" style={{ background: 'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.4), transparent 50%)' }} />
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-white/20 backdrop-blur-md p-3 border border-white/30">
                <Instagram className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">Connect Instagram</h1>
                <p className="text-white/90 mt-1 max-w-xl">
                  Manage Instagram DMs, story replies, comments, and lead capture inside Aireatro — alongside WhatsApp and Meta Ads.
                </p>
              </div>
            </div>
            <div>{statusBadge()}</div>
          </div>
        </div>

        {/* Status / Actions Card */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>One Instagram Professional account per workspace.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-10 w-1/2" />
              </div>
            ) : account ? (
              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border bg-muted/30">
                  <div className="relative">
                    {account.profile_picture_url ? (
                      <img src={account.profile_picture_url} alt={account.ig_username || ''} className="h-16 w-16 rounded-full object-cover ring-2 ring-pink-500/40" />
                    ) : (
                      <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xl font-bold">
                        {(account.ig_username || 'IG').slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5">
                      <Instagram className="h-4 w-4 text-pink-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-lg truncate">@{account.ig_username || '—'}</div>
                    <div className="text-sm text-muted-foreground truncate">{account.ig_name}</div>
                    {account.followers_count !== null && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                        <Users className="h-3 w-3" /> {account.followers_count.toLocaleString()} followers
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="p-3 rounded-lg border bg-card">
                    <div className="text-muted-foreground text-xs mb-1">Facebook Page</div>
                    <div className="font-medium truncate">{account.facebook_page_name || '—'}</div>
                  </div>
                  <div className="p-3 rounded-lg border bg-card">
                    <div className="text-muted-foreground text-xs mb-1">Webhook</div>
                    <div className="font-medium flex items-center gap-1.5">
                      {account.webhook_subscribed ? (
                        <><CheckCircle2 className="h-3.5 w-3.5 text-green-600" /> Subscribed</>
                      ) : (
                        <><AlertCircle className="h-3.5 w-3.5 text-amber-600" /> Inactive</>
                      )}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg border bg-card">
                    <div className="text-muted-foreground text-xs mb-1">Connected</div>
                    <div className="font-medium">{formatDistanceToNow(new Date(account.connected_at), { addSuffix: true })}</div>
                  </div>
                  <div className="p-3 rounded-lg border bg-card">
                    <div className="text-muted-foreground text-xs mb-1">Last sync</div>
                    <div className="font-medium">{account.last_synced_at ? formatDistanceToNow(new Date(account.last_synced_at), { addSuffix: true }) : '—'}</div>
                  </div>
                </div>

                {account.last_error && (
                  <div className="p-3 rounded-lg border border-destructive/30 bg-destructive/5 text-sm text-destructive flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{account.last_error}</span>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  <Button onClick={handleHealthCheck} variant="outline" disabled={checking}>
                    {checking ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <ShieldCheck className="h-4 w-4 mr-2" />}
                    Run health check
                  </Button>
                  {isAdmin && (
                    <Button onClick={handleConnect} variant="outline" disabled={connecting}>
                      {connecting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                      Reconnect
                    </Button>
                  )}
                  {isAdmin && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" disabled={disconnecting}>
                          {disconnecting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                          Disconnect
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Disconnect Instagram?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will stop all incoming Instagram DMs and comments for this workspace. You can reconnect anytime.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDisconnect}>Disconnect</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
            ) : (
              <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-purple-950/30 dark:via-pink-950/20 dark:to-orange-950/20 p-8 sm:p-10">
                <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full opacity-30 blur-3xl"
                  style={{ background: 'radial-gradient(circle, #E1306C, transparent 70%)' }} />
                <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full opacity-30 blur-3xl"
                  style={{ background: 'radial-gradient(circle, #833AB4, transparent 70%)' }} />

                <div className="relative flex flex-col items-center text-center space-y-5">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-3xl blur-xl opacity-60 animate-pulse"
                      style={{ background: 'linear-gradient(135deg, #833AB4, #E1306C, #FCB045)' }} />
                    <div className="relative w-24 h-24 rounded-3xl flex items-center justify-center shadow-2xl ring-4 ring-white/50 dark:ring-white/10"
                      style={{ background: 'linear-gradient(135deg, #833AB4, #E1306C, #FCB045)' }}>
                      <Instagram className="h-12 w-12 text-white" strokeWidth={1.75} />
                    </div>
                  </div>

                  <div className="space-y-2 max-w-md">
                    <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
                      Bring Instagram into your inbox
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Connect your Instagram Professional account linked to a Facebook Page. We'll sync DMs, story replies and comments — securely.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                    <Badge variant="secondary" className="gap-1.5 rounded-full bg-background/80 backdrop-blur border">
                      <ShieldCheck className="h-3 w-3 text-emerald-600" /> Secure OAuth
                    </Badge>
                    <Badge variant="secondary" className="gap-1.5 rounded-full bg-background/80 backdrop-blur border">
                      <Sparkles className="h-3 w-3 text-pink-600" /> AI Auto-Reply
                    </Badge>
                    <Badge variant="secondary" className="gap-1.5 rounded-full bg-background/80 backdrop-blur border">
                      <CheckCircle2 className="h-3 w-3 text-purple-600" /> &lt; 2 min setup
                    </Badge>
                  </div>

                  <Button
                    onClick={handleConnect}
                    disabled={!isAdmin || connecting}
                    size="lg"
                    className="text-white border-0 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-200 px-8 h-12 rounded-xl text-base font-semibold mt-2"
                    style={{ background: 'linear-gradient(135deg, #833AB4 0%, #E1306C 50%, #FD1D1D 100%)' }}
                  >
                    {connecting ? (
                      <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> Connecting…</>
                    ) : (
                      <><PlugZap className="h-5 w-5 mr-2" /> Connect Instagram</>
                    )}
                  </Button>

                  {!isAdmin ? (
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <AlertCircle className="h-3 w-3" /> Only workspace admins can connect Instagram.
                    </p>
                  ) : (
                    <p className="text-[11px] text-muted-foreground">
                      You'll be redirected to Meta to authorize access. You can disconnect anytime.
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: MessageSquare, title: 'Unified Inbox', desc: 'Manage Instagram DMs alongside WhatsApp.' },
            { icon: Sparkles, title: 'AI Auto-Reply', desc: 'Qualify and route IG leads automatically.' },
            { icon: ShieldCheck, title: 'Secure Tokens', desc: 'Long-lived tokens encrypted server-side.' },
          ].map(({ icon: Icon, title, desc }) => (
            <Card key={title}>
              <CardContent className="p-4">
                <Icon className="h-5 w-5 text-pink-600 mb-2" />
                <div className="font-semibold text-sm">{title}</div>
                <div className="text-xs text-muted-foreground mt-1">{desc}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
