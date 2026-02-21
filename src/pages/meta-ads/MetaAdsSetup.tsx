import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import {
  Megaphone, CheckCircle2, ArrowRight, Building2, FileText, Phone,
  Shield, Sparkles, Loader2, Info, Check, Facebook, Globe, Zap,
  RefreshCw, AlertCircle, Trash2, Lock, Instagram, BarChart3,
  AlertTriangle, ExternalLink, Monitor, Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';

declare global {
  interface Window { FB: any; }
}

interface MetaAdAccount {
  id: string; name: string; status: number; currency: string; timezone: string;
}
interface MetaPage {
  id: string; name: string; category: string; accessToken: string;
}

// Required scopes for full functionality
const REQUIRED_SCOPES = ['ads_read', 'pages_show_list', 'business_management'];

type ConnectionStatus = 'connected' | 'expired' | 'missing_scopes' | 'disconnected' | 'pending_setup';

function getConnectionStatus(account: any): ConnectionStatus {
  if (!account) return 'disconnected';
  if (account.status === 'pending_setup') return 'pending_setup';
  if (account.token_expires_at && new Date(account.token_expires_at) < new Date()) return 'expired';
  const scopes: string[] = account.scopes_granted || [];
  const missing = REQUIRED_SCOPES.filter(s => !scopes.includes(s));
  if (missing.length > 0 && scopes.length > 0) return 'missing_scopes';
  if (account.status === 'connected') return 'connected';
  return 'disconnected';
}

const STATUS_CONFIG: Record<ConnectionStatus, { label: string; color: string; icon: any; bg: string }> = {
  connected: { label: 'Connected', color: 'text-emerald-700', icon: CheckCircle2, bg: 'bg-emerald-100 dark:bg-emerald-900/40' },
  expired: { label: 'Token Expired', color: 'text-red-700', icon: AlertTriangle, bg: 'bg-red-100 dark:bg-red-900/40' },
  missing_scopes: { label: 'Missing Scopes', color: 'text-amber-700', icon: AlertCircle, bg: 'bg-amber-100 dark:bg-amber-900/40' },
  disconnected: { label: 'Disconnected', color: 'text-muted-foreground', icon: Monitor, bg: 'bg-muted' },
  pending_setup: { label: 'Pending Setup', color: 'text-blue-700', icon: Clock, bg: 'bg-blue-100 dark:bg-blue-900/40' },
};

export default function MetaAdsSetup() {
  const navigate = useNavigate();
  const { currentTenant } = useTenant();
  const queryClient = useQueryClient();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isFbLoading, setIsFbLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [fbConnected, setFbConnected] = useState(false);
  const [longLivedToken, setLongLivedToken] = useState('');
  const [adAccounts, setAdAccounts] = useState<MetaAdAccount[]>([]);
  const [pages, setPages] = useState<MetaPage[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [adAccountsError, setAdAccountsError] = useState<string | null>(null);
  const [showManualToken, setShowManualToken] = useState(false);
  const [manualToken, setManualToken] = useState('');
  const [isManualLoading, setIsManualLoading] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [formData, setFormData] = useState({
    adAccountId: '', adAccountName: '', pageId: '', pageName: '',
    phoneNumberId: '', phoneDisplay: '',
    instagramAccountId: '', instagramUsername: '',
    pixelId: '', pixelName: '',
    businessId: '', businessName: '',
  });

  const phoneNumbersQuery = useQuery({
    queryKey: ['phone-numbers', currentTenant?.id],
    queryFn: async () => {
      if (!currentTenant?.id) return [];
      const { data, error } = await supabase
        .from('phone_numbers')
        .select('id, display_number, phone_number_id, quality_rating')
        .eq('tenant_id', currentTenant.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentTenant?.id,
  });

  const existingAccountQuery = useQuery({
    queryKey: ['meta-ad-accounts', currentTenant?.id],
    queryFn: async () => {
      if (!currentTenant?.id) return [];
      const { data, error } = await supabase
        .from('smeksh_meta_ad_accounts')
        .select('*')
        .eq('workspace_id', currentTenant.id)
        .eq('is_active', true);
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentTenant?.id,
  });

  const settingsQuery = useQuery({
    queryKey: ['meta-ads-settings', currentTenant?.id],
    queryFn: async () => {
      if (!currentTenant?.id) return null;
      const { data, error } = await supabase
        .from('smeksh_meta_ads_settings')
        .select('id, tracking_enabled')
        .eq('workspace_id', currentTenant.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!currentTenant?.id,
  });

  const trackingEnabled = settingsQuery.data?.tracking_enabled ?? false;

  const toggleTrackingMutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      if (!currentTenant?.id) throw new Error('No workspace');
      if (settingsQuery.data?.id) {
        const { error } = await supabase.from('smeksh_meta_ads_settings').update({ tracking_enabled: enabled }).eq('id', settingsQuery.data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('smeksh_meta_ads_settings').insert([{ workspace_id: currentTenant.id, tracking_enabled: enabled }]);
        if (error) throw error;
      }
    },
    onSuccess: (_, enabled) => {
      queryClient.invalidateQueries({ queryKey: ['meta-ads-settings'] });
      toast.success(enabled ? 'CTWA tracking enabled' : 'CTWA tracking disabled');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to update tracking'),
  });

  const phoneNumbers = phoneNumbersQuery.data || [];
  const existingAccounts = existingAccountQuery.data || [];
  const connectedAccount = existingAccounts[0];
  const hasExistingConnection = existingAccounts.length > 0;
  const connectionStatus = getConnectionStatus(connectedAccount);
  const statusConfig = STATUS_CONFIG[connectionStatus];

  useEffect(() => {
    if (hasExistingConnection && !fbConnected) {
      const acc = connectedAccount;
      setFbConnected(true);
      setFormData(prev => ({
        ...prev,
        adAccountId: acc.meta_account_id || '',
        adAccountName: acc.meta_account_name || '',
        pageId: acc.facebook_page_id || '',
        pageName: acc.facebook_page_name || '',
        phoneNumberId: acc.whatsapp_phone_number_id || prev.phoneNumberId || '',
        phoneDisplay: acc.whatsapp_display_number || prev.phoneDisplay || '',
        instagramAccountId: acc.instagram_account_id || '',
        instagramUsername: acc.instagram_username || '',
        pixelId: acc.pixel_id || '',
        pixelName: acc.pixel_name || '',
        businessId: acc.business_id || '',
        businessName: acc.business_name || '',
      }));
    }
  }, [hasExistingConnection, existingAccounts]);

  useEffect(() => {
    if (phoneNumbers.length === 1 && !formData.phoneNumberId) {
      setFormData(prev => ({ ...prev, phoneNumberId: phoneNumbers[0].id, phoneDisplay: phoneNumbers[0].display_number || '' }));
    }
  }, [phoneNumbers, formData.phoneNumberId]);

  const handleDisconnect = async () => {
    if (!currentTenant?.id) return;
    setIsDisconnecting(true);
    try {
      const { error } = await supabase
        .from('smeksh_meta_ad_accounts')
        .update({ is_active: false, status: 'disconnected' as const })
        .eq('workspace_id', currentTenant.id);
      if (error) throw error;
      setFbConnected(false); setAdAccounts([]); setPages([]); setPermissions([]); setLongLivedToken(''); setAdAccountsError(null);
      setFormData({ adAccountId: '', adAccountName: '', pageId: '', pageName: '', phoneNumberId: '', phoneDisplay: '', instagramAccountId: '', instagramUsername: '', pixelId: '', pixelName: '', businessId: '', businessName: '' });
      queryClient.invalidateQueries({ queryKey: ['meta-ad-accounts'] });
      toast.success('Meta Ads disconnected.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to disconnect');
    } finally {
      setIsDisconnecting(false);
    }
  };

  const handleRefreshAssets = async () => {
    if (!connectedAccount?.meta_access_token || !currentTenant?.id) {
      toast.error('No active token. Please reconnect.');
      return;
    }
    setIsRefreshing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/meta-ads-fb-login`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: connectedAccount.meta_access_token, tenantId: currentTenant.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to refresh');
      processMetaResponse(data);
      toast.success('Assets refreshed successfully');
    } catch (err: any) {
      toast.error(err.message || 'Refresh failed');
    } finally {
      setIsRefreshing(false);
    }
  };

  const processMetaResponse = (data: any) => {
    setLongLivedToken(data.longLivedToken || '');
    setAdAccounts(data.adAccounts || []);
    setPages(data.pages || []);
    setPermissions(data.permissions || []);
    setAdAccountsError(data.adAccountsError || null);
    setFbConnected(true);
    if (data.adAccounts?.length === 1) {
      setFormData(prev => ({ ...prev, adAccountId: data.adAccounts[0].id, adAccountName: data.adAccounts[0].name }));
    }
    if (data.pages?.length === 1) {
      setFormData(prev => ({ ...prev, pageId: data.pages[0].id, pageName: data.pages[0].name }));
    }
    toast.success(`Found ${data.adAccounts?.length || 0} ad account(s) and ${data.pages?.length || 0} page(s).`);
  };

  const handleFbLogin = async () => {
    if (!currentTenant?.id) { toast.error('No workspace selected'); return; }
    if (!window.FB) { toast.error('Facebook SDK not loaded. Please refresh.'); return; }
    setIsFbLoading(true);
    try {
      window.FB.login((response: any) => {
        if (response.status !== 'connected' || !response.authResponse?.accessToken) {
          toast.error('Facebook login was cancelled or failed');
          setIsFbLoading(false);
          return;
        }
        (async () => {
          try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('Not authenticated');
            const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/meta-ads-fb-login`, {
              method: 'POST',
              headers: { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({ accessToken: response.authResponse.accessToken, tenantId: currentTenant.id }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to process Facebook login');
            processMetaResponse(data);
          } catch (err: any) {
            toast.error(err.message || 'Failed to process Facebook login');
          } finally {
            setIsFbLoading(false);
          }
        })();
      }, { scope: 'ads_read,pages_show_list,business_management', auth_type: 'reauthorize' });
    } catch (err: any) {
      toast.error(err.message || 'Failed to open Facebook login');
      setIsFbLoading(false);
    }
  };

  const handleManualTokenSubmit = async () => {
    if (!manualToken.trim() || !currentTenant?.id) return;
    setIsManualLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/meta-ads-fb-login`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: manualToken.trim(), tenantId: currentTenant.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to process token');
      processMetaResponse(data);
    } catch (err: any) {
      toast.error(err.message || 'Failed to process token');
    } finally {
      setIsManualLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!currentTenant?.id || !formData.adAccountId) return;
    setIsConnecting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const grantedScopes = permissions.filter((p: any) => p.status === 'granted').map((p: any) => p.permission);
      const { error } = await supabase.from('smeksh_meta_ad_accounts').upsert({
        workspace_id: currentTenant.id,
        meta_account_id: formData.adAccountId,
        meta_account_name: formData.adAccountName || null,
        facebook_page_id: formData.pageId || null,
        facebook_page_name: formData.pageName || null,
        whatsapp_phone_number_id: formData.phoneNumberId || null,
        whatsapp_display_number: formData.phoneDisplay || phoneNumbers.find(p => p.id === formData.phoneNumberId)?.display_number || null,
        instagram_account_id: formData.instagramAccountId || null,
        instagram_username: formData.instagramUsername || null,
        pixel_id: formData.pixelId || null,
        pixel_name: formData.pixelName || null,
        business_id: formData.businessId || null,
        business_name: formData.businessName || null,
        meta_access_token: longLivedToken || null,
        scopes_granted: grantedScopes,
        status: 'connected' as const,
        is_active: true,
        connected_by: user?.id || null,
      }, { onConflict: 'workspace_id,meta_account_id' });

      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['meta-ad-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['meta-ad-campaigns'] });
      toast.success('Meta Ads connected successfully!');
      navigate('/meta-ads');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save connection');
    } finally {
      setIsConnecting(false);
    }
  };

  const canComplete = !!formData.adAccountId;
  const grantedScopes = permissions.filter((p: any) => p.status === 'granted').map((p: any) => p.permission);
  const missingScopes = REQUIRED_SCOPES.filter(s => !grantedScopes.includes(s));

  const getAccountStatusBadge = (status: number) => {
    switch (status) {
      case 1: return <Badge className="bg-emerald-100 text-emerald-700 text-xs">Active</Badge>;
      case 2: return <Badge className="bg-amber-100 text-amber-700 text-xs">Disabled</Badge>;
      case 3: return <Badge className="bg-red-100 text-red-700 text-xs">Unsettled</Badge>;
      default: return <Badge variant="secondary" className="text-xs">Unknown</Badge>;
    }
  };

  // Asset card for connected state
  const AssetCard = ({ icon: Icon, label, value, sublabel, iconColor, connected }: {
    icon: any; label: string; value: string; sublabel?: string; iconColor?: string; connected: boolean;
  }) => (
    <div className={cn(
      "flex items-center gap-3 p-3.5 rounded-xl border transition-all",
      connected ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-950/20" : "border-dashed border-muted-foreground/30 bg-muted/20"
    )}>
      <div className={cn("flex items-center justify-center w-10 h-10 rounded-xl", connected ? "bg-emerald-100 dark:bg-emerald-900/50" : "bg-muted")}>
        <Icon className={cn("h-5 w-5", connected ? iconColor || "text-emerald-600" : "text-muted-foreground")} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-medium text-sm truncate">{value}</p>
        {sublabel && <p className="text-xs text-muted-foreground truncate">{sublabel}</p>}
      </div>
      {connected ? (
        <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
      ) : (
        <Badge variant="outline" className="text-xs text-muted-foreground flex-shrink-0">Not set</Badge>
      )}
    </div>
  );

  return (
    <DashboardLayout>
      <TooltipProvider>
        <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25">
                <Megaphone className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Connect Meta Ads</h1>
                <p className="text-sm text-muted-foreground">
                  Link your ad accounts, pages & WhatsApp for CTWA tracking
                </p>
              </div>
            </div>
            {hasExistingConnection && (
              <Badge className={cn("text-xs gap-1.5 px-3 py-1", statusConfig.bg, statusConfig.color)}>
                <statusConfig.icon className="h-3.5 w-3.5" />
                {statusConfig.label}
              </Badge>
            )}
          </div>

          {/* Connected: Status Bar with Actions */}
          {hasExistingConnection && fbConnected && (
            <Card className={cn(
              "border-0 shadow-lg overflow-hidden",
              connectionStatus === 'connected' && "bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20",
              connectionStatus === 'expired' && "bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20",
              connectionStatus === 'missing_scopes' && "bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20",
            )}>
              <CardContent className="p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={cn("flex items-center justify-center w-11 h-11 rounded-xl", statusConfig.bg)}>
                      <statusConfig.icon className={cn("h-5 w-5", statusConfig.color)} />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">
                        {connectedAccount?.meta_account_name || connectedAccount?.meta_account_id || 'Meta Account'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {connectionStatus === 'expired' && 'Your token has expired. Reconnect to restore sync.'}
                        {connectionStatus === 'missing_scopes' && `Missing: ${missingScopes.join(', ')}`}
                        {connectionStatus === 'connected' && connectedAccount?.last_synced_at &&
                          `Last synced ${new Date(connectedAccount.last_synced_at).toLocaleDateString()}`}
                        {connectionStatus === 'connected' && !connectedAccount?.last_synced_at && 'Connected'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {(connectionStatus === 'expired' || connectionStatus === 'missing_scopes') && (
                      <Button size="sm" onClick={handleFbLogin} disabled={isFbLoading} className="gap-1.5 text-xs h-8">
                        {isFbLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                        Reconnect
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={handleRefreshAssets} disabled={isRefreshing} className="gap-1.5 text-xs h-8">
                      {isRefreshing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                      Refresh Assets
                    </Button>
                    <Button variant="destructive" size="sm" onClick={handleDisconnect} disabled={isDisconnecting} className="gap-1.5 text-xs h-8">
                      {isDisconnecting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                      Disconnect
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* CTWA Tracking Toggle */}
          {hasExistingConnection && fbConnected && (
            <Card className="border-0 shadow-md">
              <CardContent className="py-4 px-4 sm:px-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={cn("flex items-center justify-center w-10 h-10 rounded-xl", trackingEnabled ? "bg-emerald-100 dark:bg-emerald-900/50" : "bg-muted")}>
                      <Zap className={cn("h-5 w-5", trackingEnabled ? "text-emerald-600" : "text-muted-foreground")} />
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">Click-to-WhatsApp Tracking</Label>
                      <p className="text-xs text-muted-foreground">
                        {trackingEnabled ? 'Active — leads from Meta Ads are attributed' : 'Off — no lead attribution'}
                      </p>
                    </div>
                  </div>
                  <Switch checked={trackingEnabled} onCheckedChange={(v) => toggleTrackingMutation.mutate(v)} disabled={toggleTrackingMutation.isPending} />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Connected: Asset Overview Grid */}
          {hasExistingConnection && fbConnected && (
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-2 px-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    Connected Assets
                  </CardTitle>
                  <Badge variant="outline" className="text-xs gap-1">
                    <Lock className="h-3 w-3" /> Read-only
                  </Badge>
                </div>
                <CardDescription className="text-xs">Disconnect to change linked assets</CardDescription>
              </CardHeader>
              <CardContent className="px-4 sm:px-6 space-y-2.5 pb-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <AssetCard
                    icon={Building2} label="Business" iconColor="text-blue-600"
                    value={formData.businessName || 'Not linked'}
                    sublabel={formData.businessId || undefined}
                    connected={!!formData.businessId}
                  />
                  <AssetCard
                    icon={BarChart3} label="Ad Account" iconColor="text-indigo-600"
                    value={formData.adAccountName || formData.adAccountId || 'Not linked'}
                    sublabel={formData.adAccountId || undefined}
                    connected={!!formData.adAccountId}
                  />
                  <AssetCard
                    icon={Globe} label="Facebook Page" iconColor="text-blue-500"
                    value={formData.pageName || 'Not linked'}
                    sublabel={formData.pageId ? `ID: ${formData.pageId}` : undefined}
                    connected={!!formData.pageId}
                  />
                  <AssetCard
                    icon={Instagram} label="Instagram" iconColor="text-pink-500"
                    value={formData.instagramUsername ? `@${formData.instagramUsername}` : 'Not linked'}
                    connected={!!formData.instagramAccountId}
                  />
                  <AssetCard
                    icon={Monitor} label="Meta Pixel" iconColor="text-violet-600"
                    value={formData.pixelName || 'Not linked'}
                    sublabel={formData.pixelId || undefined}
                    connected={!!formData.pixelId}
                  />
                  <AssetCard
                    icon={Phone} label="WhatsApp Number" iconColor="text-emerald-500"
                    value={formData.phoneDisplay || 'Not linked'}
                    connected={!!formData.phoneNumberId}
                  />
                </div>

                {/* Scopes */}
                {(connectedAccount?.scopes_granted as string[] || []).length > 0 && (
                  <div className="pt-2">
                    <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                      <Shield className="h-3 w-3" /> Granted Permissions
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {REQUIRED_SCOPES.map(scope => {
                        const granted = (connectedAccount?.scopes_granted as string[] || []).includes(scope);
                        return (
                          <Badge key={scope} variant={granted ? 'default' : 'secondary'}
                            className={cn("text-xs", granted ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700")}>
                            {granted ? <Check className="h-3 w-3 mr-1" /> : <AlertCircle className="h-3 w-3 mr-1" />}
                            {scope}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* NOT CONNECTED: Facebook Login */}
          {!fbConnected && (
            <Card className="border-2 border-dashed border-blue-300 dark:border-blue-700 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#1877F2] text-white text-sm font-bold">1</div>
                  Login with Facebook
                </CardTitle>
                <CardDescription>
                  Connect your Facebook account to fetch Ad Accounts, Pages, IG, and Pixels
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <Button className="bg-[#1877F2] hover:bg-[#166FE5] text-white gap-2 h-12 px-6 text-base w-full sm:w-auto" disabled={isFbLoading} onClick={handleFbLogin}>
                    {isFbLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Facebook className="h-5 w-5" />}
                    {isFbLoading ? 'Connecting...' : 'Login with Facebook'}
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    Scopes: <strong>ads_read</strong>, <strong>pages_show_list</strong>, <strong>business_management</strong>
                  </span>
                </div>
                <Separator />
                <div>
                  <button className="text-sm text-primary hover:underline flex items-center gap-1" onClick={() => setShowManualToken(!showManualToken)}>
                    <Zap className="h-3.5 w-3.5" />
                    {showManualToken ? 'Hide manual token entry' : 'Or enter access token manually'}
                  </button>
                  {showManualToken && (
                    <div className="mt-3 space-y-3 p-4 rounded-lg bg-muted/50 border">
                      <Label className="text-sm">Long-Lived Access Token</Label>
                      <Input placeholder="Paste your Meta access token..." value={manualToken} onChange={(e) => setManualToken(e.target.value)} className="h-10 font-mono text-xs" />
                      <Button onClick={handleManualTokenSubmit} disabled={isManualLoading || !manualToken.trim()} size="sm" className="gap-2">
                        {isManualLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                        Fetch Accounts
                      </Button>
                      <p className="text-xs text-muted-foreground">
                        Get a token from{' '}
                        <a href="https://developers.facebook.com/tools/explorer/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Graph API Explorer</a>.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Post-Login: Editable Asset Selection */}
          {fbConnected && !hasExistingConnection && (
            <>
              {/* Connection Banner */}
              <Alert className="border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <AlertDescription className="text-emerald-700 dark:text-emerald-300 flex flex-col sm:flex-row sm:items-center gap-2">
                  <span><strong>Connected!</strong> Found {adAccounts.length} ad account(s), {pages.length} page(s).</span>
                  <Button variant="outline" size="sm" className="gap-1 text-xs h-7 w-fit" onClick={() => { setFbConnected(false); setAdAccounts([]); setPages([]); setLongLivedToken(''); }}>
                    <RefreshCw className="h-3 w-3" /> Re-login
                  </Button>
                </AlertDescription>
              </Alert>

              {/* Permissions */}
              {permissions.length > 0 && (
                <Card className="border-0 shadow-sm bg-muted/30">
                  <CardContent className="py-3 px-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Granted Permissions</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {permissions.map((p: any, i: number) => (
                        <Badge key={i} variant={p.status === 'granted' ? 'default' : 'secondary'}
                          className={cn('text-xs', p.status === 'granted' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700')}>
                          {p.status === 'granted' ? <Check className="h-3 w-3 mr-1" /> : <AlertCircle className="h-3 w-3 mr-1" />}
                          {p.permission}
                        </Badge>
                      ))}
                    </div>
                    {missingScopes.length > 0 && (
                      <p className="text-xs text-amber-600 mt-2">⚠️ Missing: {missingScopes.join(', ')} — some features may be limited.</p>
                    )}
                  </CardContent>
                </Card>
              )}

              {adAccountsError && (
                <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/30">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-700 text-sm">
                    <strong>Warning:</strong> {adAccountsError}. You can enter an Ad Account ID manually.
                  </AlertDescription>
                </Alert>
              )}

              {/* Step 1: Ad Account */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary text-primary-foreground text-sm font-bold">1</div>
                    <Building2 className="h-4 w-4 text-primary" /> Select Ad Account *
                    {formData.adAccountId && <Check className="h-4 w-4 text-emerald-600 ml-auto" />}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {adAccounts.length > 0 ? (
                    <div className="space-y-2">
                      {adAccounts.map((acc) => (
                        <div key={acc.id}
                          className={cn('flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all hover:border-primary/50',
                            formData.adAccountId === acc.id ? 'border-primary bg-primary/5' : 'border-transparent bg-muted/40')}
                          onClick={() => setFormData(prev => ({ ...prev, adAccountId: acc.id, adAccountName: acc.name }))}>
                          <div className={cn('flex items-center justify-center w-5 h-5 rounded-full border-2',
                            formData.adAccountId === acc.id ? 'border-primary bg-primary' : 'border-muted-foreground/40')}>
                            {formData.adAccountId === acc.id && <Check className="h-3 w-3 text-primary-foreground" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{acc.name || acc.id}</p>
                            <p className="text-xs text-muted-foreground">{acc.id}</p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {acc.currency && <Badge variant="secondary" className="text-xs">{acc.currency}</Badge>}
                            {getAccountStatusBadge(acc.status)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">No ad accounts found. Enter manually:</p>
                      <Input placeholder="act_123456789" value={formData.adAccountId} onChange={(e) => setFormData(prev => ({ ...prev, adAccountId: e.target.value.trim() }))} />
                      <Input placeholder="Account name (optional)" value={formData.adAccountName} onChange={(e) => setFormData(prev => ({ ...prev, adAccountName: e.target.value }))} />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Step 2: Page */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary text-primary-foreground text-sm font-bold">2</div>
                    <Globe className="h-4 w-4 text-blue-500" /> Facebook Page
                    <span className="text-xs text-muted-foreground font-normal">(optional)</span>
                    {formData.pageId && <Check className="h-4 w-4 text-emerald-600 ml-auto" />}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {pages.length > 0 ? (
                    <div className="space-y-2">
                      {pages.map((page) => (
                        <div key={page.id}
                          className={cn('flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all hover:border-primary/50',
                            formData.pageId === page.id ? 'border-primary bg-primary/5' : 'border-transparent bg-muted/40')}
                          onClick={() => setFormData(prev => ({ ...prev, pageId: page.id, pageName: page.name }))}>
                          <div className={cn('flex items-center justify-center w-5 h-5 rounded-full border-2',
                            formData.pageId === page.id ? 'border-primary bg-primary' : 'border-muted-foreground/40')}>
                            {formData.pageId === page.id && <Check className="h-3 w-3 text-primary-foreground" />}
                          </div>
                          <Globe className="h-4 w-4 text-blue-500 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{page.name}</p>
                            <p className="text-xs text-muted-foreground">ID: {page.id}</p>
                          </div>
                          {page.category && <Badge variant="secondary" className="text-xs">{page.category}</Badge>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">No pages found. Enter manually:</p>
                      <Input placeholder="Page ID" value={formData.pageId} onChange={(e) => setFormData(prev => ({ ...prev, pageId: e.target.value.trim() }))} />
                      <Input placeholder="Page Name (optional)" value={formData.pageName} onChange={(e) => setFormData(prev => ({ ...prev, pageName: e.target.value }))} />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Step 3: Additional Assets (IG, Pixel) */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary text-primary-foreground text-sm font-bold">3</div>
                    <Sparkles className="h-4 w-4 text-primary" /> Additional Assets
                    <span className="text-xs text-muted-foreground font-normal">(optional)</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm flex items-center gap-1.5">
                        <Instagram className="h-3.5 w-3.5 text-pink-500" /> Instagram Account
                      </Label>
                      <Input placeholder="Instagram Account ID" value={formData.instagramAccountId}
                        onChange={(e) => setFormData(prev => ({ ...prev, instagramAccountId: e.target.value.trim() }))} />
                      <Input placeholder="@username" value={formData.instagramUsername}
                        onChange={(e) => setFormData(prev => ({ ...prev, instagramUsername: e.target.value.replace('@', '') }))} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm flex items-center gap-1.5">
                        <Monitor className="h-3.5 w-3.5 text-violet-600" /> Meta Pixel
                      </Label>
                      <Input placeholder="Pixel ID" value={formData.pixelId}
                        onChange={(e) => setFormData(prev => ({ ...prev, pixelId: e.target.value.trim() }))} />
                      <Input placeholder="Pixel Name (optional)" value={formData.pixelName}
                        onChange={(e) => setFormData(prev => ({ ...prev, pixelName: e.target.value }))} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5 text-blue-600" /> Business
                    </Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Input placeholder="Business ID" value={formData.businessId}
                        onChange={(e) => setFormData(prev => ({ ...prev, businessId: e.target.value.trim() }))} />
                      <Input placeholder="Business Name (optional)" value={formData.businessName}
                        onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Step 4: WhatsApp Number */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary text-primary-foreground text-sm font-bold">4</div>
                    <Phone className="h-4 w-4 text-emerald-500" /> WhatsApp Number
                    <span className="text-xs text-muted-foreground font-normal">(optional)</span>
                    {formData.phoneNumberId && <Check className="h-4 w-4 text-emerald-600 ml-auto" />}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {phoneNumbers.length > 0 ? (
                    <div className="space-y-2">
                      {phoneNumbers.map((phone) => (
                        <div key={phone.id}
                          className={cn('flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all hover:border-primary/50',
                            formData.phoneNumberId === phone.id ? 'border-primary bg-primary/5' : 'border-transparent bg-muted/40')}
                          onClick={() => setFormData(prev => ({ ...prev, phoneNumberId: phone.id, phoneDisplay: phone.display_number || '' }))}>
                          <div className={cn('flex items-center justify-center w-5 h-5 rounded-full border-2',
                            formData.phoneNumberId === phone.id ? 'border-primary bg-primary' : 'border-muted-foreground/40')}>
                            {formData.phoneNumberId === phone.id && <Check className="h-3 w-3 text-primary-foreground" />}
                          </div>
                          <Phone className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                          <div className="flex-1 min-w-0"><p className="font-medium text-sm">{phone.display_number || phone.phone_number_id}</p></div>
                          {phone.quality_rating === 'GREEN' && <Badge className="bg-emerald-100 text-emerald-700 text-xs">Active</Badge>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription className="text-sm">No WhatsApp numbers connected. Link one from WABA settings first.</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* Complete */}
              <Card className="border-0 shadow-lg border-t-4 border-t-primary">
                <CardContent className="p-5 space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                    <div><p className="text-xs text-muted-foreground">Ad Account</p><p className="font-medium truncate">{formData.adAccountName || formData.adAccountId || '—'}</p></div>
                    <div><p className="text-xs text-muted-foreground">Page</p><p className="font-medium truncate">{formData.pageName || '—'}</p></div>
                    <div><p className="text-xs text-muted-foreground">WhatsApp</p><p className="font-medium truncate">{formData.phoneDisplay || '—'}</p></div>
                    <div><p className="text-xs text-muted-foreground">Instagram</p><p className="font-medium truncate">{formData.instagramUsername ? `@${formData.instagramUsername}` : '—'}</p></div>
                    <div><p className="text-xs text-muted-foreground">Pixel</p><p className="font-medium truncate">{formData.pixelName || formData.pixelId || '—'}</p></div>
                    <div><p className="text-xs text-muted-foreground">Live Sync</p><Badge variant={longLivedToken ? 'default' : 'secondary'} className="text-xs">{longLivedToken ? 'Enabled' : 'Manual'}</Badge></div>
                  </div>
                  <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/30">
                    <Shield className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-700 dark:text-blue-300 text-xs">
                      <strong>Privacy:</strong> AIREATRO only reads ad performance data. We never create or modify your ads.
                    </AlertDescription>
                  </Alert>
                  <Button onClick={handleComplete} disabled={!canComplete || isConnecting} className="w-full gap-2 h-12 text-base shadow-lg shadow-primary/25" size="lg">
                    {isConnecting ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
                    Enable Click-to-WhatsApp Tracking
                  </Button>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </TooltipProvider>
    </DashboardLayout>
  );
}
