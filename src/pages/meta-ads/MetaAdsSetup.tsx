import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
import { useFeatureGate } from '@/hooks/useFeatureGate';
import { loadFacebookSdk } from '@/lib/loadFacebookSdk';

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
// leads_retrieval is required by Meta to subscribe to leadgen webhooks and retrieve Lead Ads leads
// pages_manage_ads is required to access Lead Ads forms; pages_show_list is a dependency
const REQUIRED_SCOPES = ['ads_read', 'pages_show_list', 'pages_manage_ads', 'leads_retrieval', 'business_management', 'pages_read_engagement'];

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
  const [searchParams] = useSearchParams();
  const { currentTenant } = useTenant();
  const queryClient = useQueryClient();
  const autoReauthorizeStarted = useRef(false);
  const [leadAdsReauthRequested, setLeadAdsReauthRequested] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [wizardStep, setWizardStep] = useState(0); // 0=login, 1=adAccount, 2=page, 3=extras, 4=whatsapp, 5=review
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
  const [businesses, setBusinesses] = useState<{ id: string; name: string }[]>([]);
  const [instagramAccounts, setInstagramAccounts] = useState<{ id: string; username: string; name: string; profilePictureUrl: string; linkedPageName: string }[]>([]);
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
    // Store Instagram accounts for selector and auto-populate first
    if (data.instagramAccounts?.length > 0) {
      setInstagramAccounts(data.instagramAccounts);
      const ig = data.instagramAccounts[0];
      setFormData(prev => ({
        ...prev,
        instagramAccountId: prev.instagramAccountId || ig.id,
        instagramUsername: prev.instagramUsername || ig.username,
      }));
    }
    // Store businesses for selector and auto-match by workspace name
    if (data.businesses?.length > 0) {
      setBusinesses(data.businesses);
      const workspaceName = currentTenant?.name?.toLowerCase() || '';
      // Try to match business by workspace name
      const matched = data.businesses.find((b: any) => 
        b.name.toLowerCase().includes(workspaceName) || workspaceName.includes(b.name.toLowerCase())
      );
      const biz = matched || data.businesses[0];
      setFormData(prev => ({
        ...prev,
        businessId: prev.businessId || biz.id,
        businessName: prev.businessName || biz.name,
      }));
    }
    toast.success(`Found ${data.adAccounts?.length || 0} ad account(s), ${data.pages?.length || 0} page(s), ${data.instagramAccounts?.length || 0} IG account(s).`);
    setWizardStep((s) => (s < 1 ? 1 : s));
  };

  const persistReauthorization = async (data: any) => {
    if (!currentTenant?.id || !connectedAccount?.id) return;

    const grantedScopes = (data.permissions || [])
      .filter((p: any) => p.status === 'granted')
      .map((p: any) => p.permission);

    const { error } = await supabase
      .from('smeksh_meta_ad_accounts')
      .update({
        meta_access_token: data.longLivedToken || connectedAccount.meta_access_token || null,
        scopes_granted: grantedScopes,
        status: 'connected' as const,
        is_active: true,
      })
      .eq('id', connectedAccount.id)
      .eq('workspace_id', currentTenant.id);

    if (error) throw error;
    queryClient.invalidateQueries({ queryKey: ['meta-ad-accounts'] });
    queryClient.invalidateQueries({ queryKey: ['meta-ad-accounts-leadforms'] });
    toast.success('Meta permissions refreshed successfully');
  };

  const metaAdsGate = useFeatureGate('meta_ads');

  // Preload SDK as soon as the setup page mounts so click is instant
  useEffect(() => { loadFacebookSdk().catch(() => {}); }, []);

  const handleFbLogin = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (!currentTenant?.id) { toast.error('No workspace selected'); return; }
    // Synchronous gate check (must not await before FB.login or popup is blocked)
    if (metaAdsGate.loading) { toast.info('Checking permissions, please try again in a moment.'); return; }
    if (!metaAdsGate.allowed) { metaAdsGate.guard(); return; }
    if (!window.FB || typeof window.FB.login !== 'function') {
      toast.error('Facebook SDK is still loading. Please try again.');
      loadFacebookSdk().catch(() => {});
      return;
    }
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
            if (hasExistingConnection) await persistReauthorization(data);
          } catch (err: any) {
            toast.error(err.message || 'Failed to process Facebook login');
          } finally {
            setIsFbLoading(false);
          }
        })();
      }, { scope: REQUIRED_SCOPES.join(','), auth_type: 'reauthorize' });
    } catch (err: any) {
      toast.error(err.message || 'Failed to open Facebook login');
      setIsFbLoading(false);
    }
  };

  useEffect(() => {
    if (autoReauthorizeStarted.current) return;
    if (searchParams.get('reauthorize') !== 'lead_forms') return;
    if (!currentTenant?.id) return;

    autoReauthorizeStarted.current = true;
    setLeadAdsReauthRequested(true);
    toast.info('Click Reconnect Facebook to approve Meta Lead Ads permissions');
  }, [searchParams, currentTenant?.id]);

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
  const grantedScopes = permissions.length > 0
    ? permissions.filter((p: any) => p.status === 'granted').map((p: any) => p.permission)
    : ((connectedAccount?.scopes_granted as string[] | null) || []);
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

          {leadAdsReauthRequested && (
            <Alert className="border-primary/30 bg-primary/5">
              <Shield className="h-4 w-4" />
              <AlertDescription className="flex flex-col sm:flex-row sm:items-center gap-3">
                <span className="flex-1 text-sm">
                  Approve the Meta Lead Ads permissions in Facebook to restore lead form syncing.
                </span>
                <Button type="button" size="sm" onClick={handleFbLogin} disabled={isFbLoading} className="w-fit shrink-0 gap-1.5">
                  {isFbLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Facebook className="h-3.5 w-3.5" />}
                  Reconnect Facebook
                </Button>
              </AlertDescription>
            </Alert>
          )}

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
                    <Button type="button" size="sm" className="bg-[#1877F2] hover:bg-[#166FE5] text-white gap-1.5 text-xs h-8" onClick={handleFbLogin} disabled={isFbLoading}>
                      {isFbLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Facebook className="h-3.5 w-3.5" />}
                      {connectionStatus === 'expired' || connectionStatus === 'missing_scopes' ? 'Reconnect Facebook' : 'Re-login Facebook'}
                    </Button>
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
                      {(connectedAccount?.scopes_granted as string[] || []).map((scope: string) => (
                        <Badge key={scope} variant="default"
                          className="text-xs bg-emerald-100 text-emerald-700">
                          <Check className="h-3 w-3 mr-1" />
                          {scope}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Onboarding Wizard — only shown when not yet connected */}
          {!hasExistingConnection && (() => {
            const WIZARD_STEPS = [
              { id: 0, label: 'Login', icon: Facebook },
              { id: 1, label: 'Ad Account', icon: BarChart3 },
              { id: 2, label: 'Facebook Page', icon: Globe },
              { id: 3, label: 'Extras', icon: Sparkles },
              { id: 4, label: 'WhatsApp', icon: Phone },
              { id: 5, label: 'Review', icon: CheckCircle2 },
            ];
            const stepValid: Record<number, boolean> = {
              0: fbConnected,
              1: !!formData.adAccountId,
              2: !!formData.pageId,
              3: true,
              4: true,
              5: !!formData.adAccountId,
            };
            const goNext = () => setWizardStep((s) => Math.min(5, s + 1));
            const goBack = () => setWizardStep((s) => Math.max(0, s - 1));

            return (
              <Card className="border-0 shadow-lg overflow-hidden">
                {/* Stepper */}
                <CardHeader className="pb-4 bg-gradient-to-br from-blue-50/60 via-card to-card dark:from-blue-950/20">
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                    {WIZARD_STEPS.map((step, i) => {
                      const isDone = stepValid[step.id] && step.id < wizardStep;
                      const isCurrent = step.id === wizardStep;
                      const Icon = step.icon;
                      return (
                        <div key={step.id} className="flex items-center shrink-0">
                          <button
                            type="button"
                            disabled={step.id > wizardStep && !stepValid[step.id - 1]}
                            onClick={() => (step.id <= wizardStep || stepValid[step.id - 1]) && setWizardStep(step.id)}
                            className={cn(
                              "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all",
                              isCurrent && "bg-primary text-primary-foreground shadow-sm",
                              isDone && "text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30",
                              !isCurrent && !isDone && "text-muted-foreground/60",
                            )}
                          >
                            <div className={cn(
                              "flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold shrink-0",
                              isCurrent && "bg-primary-foreground/20 text-primary-foreground",
                              isDone && "bg-emerald-500 text-white",
                              !isCurrent && !isDone && "bg-muted",
                            )}>
                              {isDone ? <Check className="h-3 w-3" /> : step.id + 1}
                            </div>
                            <span className="hidden sm:inline">{step.label}</span>
                          </button>
                          {i < WIZARD_STEPS.length - 1 && (
                            <div className={cn("w-4 h-px mx-0.5", isDone ? "bg-emerald-300" : "bg-border")} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardHeader>

                <CardContent className="p-5 sm:p-7 min-h-[340px]">
                  {/* Step 0: Login */}
                  {wizardStep === 0 && (
                    <div className="text-center max-w-md mx-auto py-6 space-y-5">
                      <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-2xl bg-[#1877F2] shadow-lg shadow-blue-500/30">
                        <Facebook className="h-8 w-8 text-white" />
                      </div>
                      <div className="space-y-1.5">
                        <h2 className="text-xl font-bold tracking-tight">Login with Facebook</h2>
                        <p className="text-sm text-muted-foreground">
                          We'll auto-discover your Ad Accounts, Pages, Instagram & Business — nothing is created or modified.
                        </p>
                      </div>
                      <div className="flex flex-wrap justify-center gap-1.5">
                        {['ads_read', 'pages_show_list', 'leads_retrieval', 'pages_manage_ads'].map((s) => (
                          <Badge key={s} variant="outline" className="text-[10px] gap-1">
                            <Shield className="h-2.5 w-2.5" /> {s}
                          </Badge>
                        ))}
                      </div>
                      <Button type="button" size="lg" className="bg-[#1877F2] hover:bg-[#166FE5] text-white gap-2 h-12 px-8 w-full sm:w-auto" onClick={handleFbLogin} disabled={isFbLoading}>
                        {isFbLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Facebook className="h-5 w-5" />}
                        {isFbLoading ? 'Connecting…' : fbConnected ? 'Re-login Facebook' : 'Continue with Facebook'}
                      </Button>
                      {fbConnected && (
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Connected — found {adAccounts.length} ad account(s), {pages.length} page(s)
                        </p>
                      )}
                      <button type="button" onClick={() => setShowManualToken(!showManualToken)} className="text-xs text-muted-foreground hover:text-primary underline-offset-2 hover:underline">
                        {showManualToken ? 'Hide' : 'Or paste an access token manually'}
                      </button>
                      {showManualToken && (
                        <div className="text-left space-y-2 p-3 rounded-lg bg-muted/40 border">
                          <Label className="text-xs">Long-Lived Access Token</Label>
                          <Input placeholder="Paste your Meta access token…" value={manualToken} onChange={(e) => setManualToken(e.target.value)} className="h-9 font-mono text-xs" />
                          <Button onClick={handleManualTokenSubmit} disabled={isManualLoading || !manualToken.trim()} size="sm" className="gap-1.5 w-full">
                            {isManualLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ArrowRight className="h-3.5 w-3.5" />}
                            Fetch Accounts
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step 1: Ad Account */}
                  {wizardStep === 1 && (
                    <div className="space-y-4">
                      <div>
                        <h2 className="text-lg font-bold flex items-center gap-2">
                          <BarChart3 className="h-5 w-5 text-indigo-600" /> Select your Ad Account
                        </h2>
                        <p className="text-sm text-muted-foreground mt-0.5">Pick the ad account that runs your Click-to-WhatsApp campaigns.</p>
                      </div>
                      {adAccountsError && (
                        <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/30">
                          <AlertCircle className="h-4 w-4 text-amber-600" />
                          <AlertDescription className="text-amber-700 text-xs">{adAccountsError}</AlertDescription>
                        </Alert>
                      )}
                      {adAccounts.length > 0 ? (
                        <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                          {adAccounts.map((acc) => (
                            <div key={acc.id}
                              className={cn('flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all hover:border-primary/50',
                                formData.adAccountId === acc.id ? 'border-primary bg-primary/5' : 'border-transparent bg-muted/40')}
                              onClick={() => setFormData(prev => ({ ...prev, adAccountId: acc.id, adAccountName: acc.name }))}>
                              <div className={cn('flex items-center justify-center w-5 h-5 rounded-full border-2 shrink-0',
                                formData.adAccountId === acc.id ? 'border-primary bg-primary' : 'border-muted-foreground/40')}>
                                {formData.adAccountId === acc.id && <Check className="h-3 w-3 text-primary-foreground" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{acc.name || acc.id}</p>
                                <p className="text-xs text-muted-foreground">{acc.id}</p>
                              </div>
                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                {acc.currency && <Badge variant="secondary" className="text-[10px]">{acc.currency}</Badge>}
                                {getAccountStatusBadge(acc.status)}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">No ad accounts found. Enter manually:</p>
                          <Input placeholder="act_123456789" value={formData.adAccountId} onChange={(e) => setFormData(prev => ({ ...prev, adAccountId: e.target.value.trim() }))} />
                          <Input placeholder="Account name (optional)" value={formData.adAccountName} onChange={(e) => setFormData(prev => ({ ...prev, adAccountName: e.target.value }))} />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step 2: Page (single — drives lead form scope) */}
                  {wizardStep === 2 && (
                    <div className="space-y-4">
                      <div>
                        <h2 className="text-lg font-bold flex items-center gap-2">
                          <Globe className="h-5 w-5 text-blue-500" /> Choose one Facebook Page
                        </h2>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          Lead forms & captured leads will be scoped to <strong>only this Page</strong>. You can change later by reconnecting.
                        </p>
                      </div>
                      {pages.length > 0 ? (
                        <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                          {pages.map((page) => (
                            <div key={page.id}
                              className={cn('flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all hover:border-primary/50',
                                formData.pageId === page.id ? 'border-primary bg-primary/5' : 'border-transparent bg-muted/40')}
                              onClick={() => setFormData(prev => ({ ...prev, pageId: page.id, pageName: page.name }))}>
                              <div className={cn('flex items-center justify-center w-5 h-5 rounded-full border-2 shrink-0',
                                formData.pageId === page.id ? 'border-primary bg-primary' : 'border-muted-foreground/40')}>
                                {formData.pageId === page.id && <Check className="h-3 w-3 text-primary-foreground" />}
                              </div>
                              <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/40 flex items-center justify-center shrink-0">
                                <Globe className="h-4 w-4 text-blue-500" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{page.name}</p>
                                <p className="text-xs text-muted-foreground truncate">ID: {page.id}</p>
                              </div>
                              {page.category && <Badge variant="secondary" className="text-[10px]">{page.category}</Badge>}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Input placeholder="Page ID" value={formData.pageId} onChange={(e) => setFormData(prev => ({ ...prev, pageId: e.target.value.trim() }))} />
                          <Input placeholder="Page Name (optional)" value={formData.pageName} onChange={(e) => setFormData(prev => ({ ...prev, pageName: e.target.value }))} />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step 3: Extras */}
                  {wizardStep === 3 && (
                    <div className="space-y-5">
                      <div>
                        <h2 className="text-lg font-bold flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-primary" /> Optional assets
                        </h2>
                        <p className="text-sm text-muted-foreground mt-0.5">Skip if not needed — you can connect these anytime later.</p>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-sm flex items-center gap-1.5">
                            <Instagram className="h-3.5 w-3.5 text-pink-500" /> Instagram Account
                          </Label>
                          {instagramAccounts.length > 0 ? (
                            <div className="space-y-2">
                              {instagramAccounts.map((ig) => (
                                <div key={ig.id}
                                  className={cn('flex items-center gap-3 p-2.5 rounded-lg border-2 cursor-pointer transition-all',
                                    formData.instagramAccountId === ig.id ? 'border-primary bg-primary/5' : 'border-transparent bg-muted/40 hover:border-primary/40')}
                                  onClick={() => setFormData(prev => ({ ...prev, instagramAccountId: ig.id, instagramUsername: ig.username }))}>
                                  <Instagram className="h-4 w-4 text-pink-500 shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">@{ig.username || ig.name}</p>
                                    <p className="text-[11px] text-muted-foreground truncate">{ig.linkedPageName || ig.id}</p>
                                  </div>
                                  {formData.instagramAccountId === ig.id && <Check className="h-4 w-4 text-primary shrink-0" />}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground p-2.5 rounded-lg bg-muted/40 border border-dashed">No Instagram Business accounts found linked to your Pages.</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm flex items-center gap-1.5">
                            <Building2 className="h-3.5 w-3.5 text-blue-600" /> Business
                          </Label>
                          {businesses.length > 0 ? (
                            <Select value={formData.businessId} onValueChange={(v) => {
                              const b = businesses.find(x => x.id === v);
                              setFormData(prev => ({ ...prev, businessId: v, businessName: b?.name || '' }));
                            }}>
                              <SelectTrigger><SelectValue placeholder="Select business" /></SelectTrigger>
                              <SelectContent>
                                {businesses.map((biz) => (
                                  <SelectItem key={biz.id} value={biz.id}>{biz.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Input placeholder="Business ID (optional)" value={formData.businessId}
                              onChange={(e) => setFormData(prev => ({ ...prev, businessId: e.target.value.trim() }))} />
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label className="text-sm flex items-center gap-1.5">
                              <Monitor className="h-3.5 w-3.5 text-violet-600" /> Pixel ID
                            </Label>
                            <Input placeholder="123456789" value={formData.pixelId}
                              onChange={(e) => setFormData(prev => ({ ...prev, pixelId: e.target.value.trim() }))} />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm">Pixel Name</Label>
                            <Input placeholder="Optional" value={formData.pixelName}
                              onChange={(e) => setFormData(prev => ({ ...prev, pixelName: e.target.value }))} />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 4: WhatsApp Number */}
                  {wizardStep === 4 && (
                    <div className="space-y-4">
                      <div>
                        <h2 className="text-lg font-bold flex items-center gap-2">
                          <Phone className="h-5 w-5 text-emerald-500" /> WhatsApp Number
                        </h2>
                        <p className="text-sm text-muted-foreground mt-0.5">Where Click-to-WhatsApp leads land. Optional but recommended.</p>
                      </div>
                      {phoneNumbers.length > 0 ? (
                        <div className="space-y-2">
                          {phoneNumbers.map((phone) => (
                            <div key={phone.id}
                              className={cn('flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all hover:border-primary/50',
                                formData.phoneNumberId === phone.id ? 'border-primary bg-primary/5' : 'border-transparent bg-muted/40')}
                              onClick={() => setFormData(prev => ({ ...prev, phoneNumberId: phone.id, phoneDisplay: phone.display_number || '' }))}>
                              <div className={cn('flex items-center justify-center w-5 h-5 rounded-full border-2 shrink-0',
                                formData.phoneNumberId === phone.id ? 'border-primary bg-primary' : 'border-muted-foreground/40')}>
                                {formData.phoneNumberId === phone.id && <Check className="h-3 w-3 text-primary-foreground" />}
                              </div>
                              <Phone className="h-4 w-4 text-emerald-500 shrink-0" />
                              <div className="flex-1 min-w-0"><p className="font-medium text-sm">{phone.display_number || phone.phone_number_id}</p></div>
                              {phone.quality_rating === 'GREEN' && <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">Active</Badge>}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <Alert>
                          <Info className="h-4 w-4" />
                          <AlertDescription className="text-sm">No WhatsApp numbers connected yet. You can skip and link one later.</AlertDescription>
                        </Alert>
                      )}
                    </div>
                  )}

                  {/* Step 5: Review */}
                  {wizardStep === 5 && (
                    <div className="space-y-5">
                      <div>
                        <h2 className="text-lg font-bold flex items-center gap-2">
                          <CheckCircle2 className="h-5 w-5 text-emerald-500" /> Review & connect
                        </h2>
                        <p className="text-sm text-muted-foreground mt-0.5">Confirm the assets below — you can edit anytime.</p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <AssetCard icon={BarChart3} label="Ad Account" iconColor="text-indigo-600"
                          value={formData.adAccountName || formData.adAccountId || 'Not set'}
                          sublabel={formData.adAccountId || undefined} connected={!!formData.adAccountId} />
                        <AssetCard icon={Globe} label="Facebook Page" iconColor="text-blue-500"
                          value={formData.pageName || 'Not set'}
                          sublabel={formData.pageId || undefined} connected={!!formData.pageId} />
                        <AssetCard icon={Instagram} label="Instagram" iconColor="text-pink-500"
                          value={formData.instagramUsername ? `@${formData.instagramUsername}` : 'Skipped'}
                          connected={!!formData.instagramAccountId} />
                        <AssetCard icon={Building2} label="Business" iconColor="text-blue-600"
                          value={formData.businessName || 'Skipped'}
                          sublabel={formData.businessId || undefined} connected={!!formData.businessId} />
                        <AssetCard icon={Monitor} label="Meta Pixel" iconColor="text-violet-600"
                          value={formData.pixelName || formData.pixelId || 'Skipped'}
                          connected={!!formData.pixelId} />
                        <AssetCard icon={Phone} label="WhatsApp" iconColor="text-emerald-500"
                          value={formData.phoneDisplay || 'Skipped'}
                          connected={!!formData.phoneNumberId} />
                      </div>
                      <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/30">
                        <Shield className="h-4 w-4 text-blue-600" />
                        <AlertDescription className="text-blue-700 dark:text-blue-300 text-xs">
                          <strong>Privacy:</strong> AIREATRO only reads ad performance data. We never create or modify your ads.
                        </AlertDescription>
                      </Alert>
                    </div>
                  )}
                </CardContent>

                {/* Footer nav */}
                <div className="flex items-center justify-between gap-3 px-5 sm:px-7 py-4 border-t bg-muted/20">
                  <Button type="button" variant="ghost" onClick={goBack} disabled={wizardStep === 0} className="gap-1.5">
                    Back
                  </Button>
                  <p className="text-xs text-muted-foreground hidden sm:block">
                    Step {wizardStep + 1} of {WIZARD_STEPS.length}
                  </p>
                  {wizardStep < 5 ? (
                    <Button type="button" onClick={goNext} disabled={!stepValid[wizardStep]} className="gap-1.5">
                      Continue <ArrowRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button type="button" onClick={handleComplete} disabled={!canComplete || isConnecting} className="gap-2 shadow-lg shadow-primary/25">
                      {isConnecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                      Finish & Connect
                    </Button>
                  )}
                </div>
              </Card>
            );
          })()}
        </div>
      </TooltipProvider>
    </DashboardLayout>
  );
}
